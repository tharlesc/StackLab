import { supabase, isSupabaseConfigured } from '../supabase';
import type { User } from '@/types';

/**
 * Utilitário de timeout para garantir que nenhuma chamada ao Supabase trave a UI em loading infinito.
 */
function withTimeout<T>(
  promise: PromiseLike<T> | Promise<T>,
  ms = 10000,
  fallbackMessage = 'Tempo limite esgotado ao comunicar com o servidor do Supabase.',
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(fallbackMessage)), ms),
    ),
  ]);
}

/**
 * Mapeia o registro da tabela public.profiles + obra_operadores para a interface User do app.
 */
export async function fetchUserProfile(
  userId: string,
  emailFallback?: string,
  userMetadata?: Record<string, any>,
): Promise<User> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado');
  }

  // 1. Busca perfil na tabela profiles (com timeout)
  let profile: any = null;
  try {
    const { data, error: profileErr } = await withTimeout(
      supabase.from('profiles').select('*').eq('id', userId).single(),
      6000,
      'Timeout ao carregar dados do perfil em profiles.',
    );
    if (!profileErr && data) {
      profile = data;
    } else if (profileErr && profileErr.code !== 'PGRST116') {
      console.warn('Aviso ao consultar tabela profiles:', profileErr.message);
    }
  } catch (err) {
    console.warn('Aviso: Falha ou timeout na consulta de profiles:', err);
  }

  // 2. Busca atribuições de obras do operador (com timeout)
  let assignedWorkIds: string[] = [];
  try {
    const { data: assignments, error: assignErr } = await withTimeout(
      supabase.from('obra_operadores').select('obra_id').eq('operador_id', userId),
      6000,
      'Timeout ao carregar atribuições de obras.',
    );
    if (!assignErr && assignments) {
      assignedWorkIds = assignments.map((a: { obra_id: string }) => a.obra_id);
    }
  } catch (err) {
    console.warn('Aviso: Falha ou timeout na consulta de obra_operadores:', err);
  }

  const roleValue = profile?.role || userMetadata?.role || userMetadata?.profile;
  const isMaster = roleValue === 'master';
  const isClient = roleValue === 'client' || (profile?.cargo && profile.cargo.toLowerCase().includes('cliente'));

  const userName =
    profile?.nome ||
    userMetadata?.name ||
    userMetadata?.nome ||
    emailFallback?.split('@')[0] ||
    'Usuário';

  const userCargo =
    profile?.cargo ||
    userMetadata?.cargo ||
    (isMaster ? 'Engenheiro Master' : isClient ? 'Cliente / Fiscal' : 'Operador de Campo');

  const isFirstAccess = Boolean(
    profile?.is_first_access ?? (profile?.temp_password ? true : false),
  );

  return {
    id: userId,
    name: userName,
    email: profile?.email || emailFallback || '',
    role: userCargo,
    crea: profile?.crea ?? userMetadata?.crea ?? undefined,
    profile: isMaster ? 'master' : isClient ? 'client' : 'common',
    assignedWorkIds,
    active: profile?.ativo ?? true,
    isOnline: true,
    lastSyncAt: new Date().toISOString(),
    isFirstAccess,
    tempPassword: profile?.temp_password || undefined,
  };
}

/**
 * Realiza login com E-mail e Senha no Supabase Auth com proteção estrita contra congelamentos.
 */
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { user: null, error: 'Configuração do Supabase ausente no arquivo client/.env' };
  }

  let cleanEmail = email.trim().toLowerCase();
  // Se o usuário digitou sem TLD (ex: carlos.mendes@a1b2), normaliza para .com
  if (cleanEmail.includes('@') && !cleanEmail.split('@')[1].includes('.')) {
    cleanEmail = `${cleanEmail}.com`;
  }

  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      }),
      10000,
      'Tempo limite esgotado ao conectar ao Supabase. Verifique sua conexão com a internet.',
    );

    if (error || !data.user) {
      const rawMsg = (error?.message || '').toLowerCase();
      let friendlyError = 'Falha ao autenticar. Verifique o e-mail e a senha informados.';

      if (rawMsg.includes('invalid login credentials') || rawMsg.includes('invalid credentials')) {
        friendlyError = 'E-mail ou senha incorretos no Supabase. Verifique suas credenciais.';
      } else if (rawMsg.includes('email not confirmed')) {
        friendlyError =
          'E-mail cadastrado, mas ainda não confirmado no Supabase. Confirme no Supabase ou desative a exigência de confirmação no painel de Auth.';
      } else if (rawMsg.includes('too many requests') || rawMsg.includes('rate limit')) {
        friendlyError = 'Muitas tentativas de login recentes. Aguarde alguns instantes antes de tentar novamente.';
      } else if (error?.message) {
        friendlyError = error.message;
      }

      return {
        user: null,
        error: friendlyError,
      };
    }

    try {
      // Registra presença online e timestamp no perfil
      try {
        await supabase
          .from('profiles')
          .update({ is_online: true, last_sync_at: new Date().toISOString() })
          .eq('id', data.user.id);
      } catch {
        // Ignora caso a coluna ainda não exista no banco
      }

      const user = await withTimeout(
        fetchUserProfile(data.user.id, data.user.email, data.user.user_metadata),
        8000,
        'Autenticação realizada, mas o carregamento do perfil atingiu o tempo limite.',
      );
      return { user, error: null };
    } catch (profileErr: any) {
      return {
        user: null,
        error: profileErr?.message || 'Falha ao carregar os dados de perfil do usuário.',
      };
    }
  } catch (err: any) {
    return {
      user: null,
      error: err?.message || 'Erro inesperado ao conectar ao servidor do Supabase.',
    };
  }
}

/**
 * Encerra a sessão ativa no Supabase.
 */
export async function logout(): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        await supabase
          .from('profiles')
          .update({ is_online: false, last_sync_at: new Date().toISOString() })
          .eq('id', data.session.user.id);
      }
      await withTimeout(supabase.auth.signOut(), 4000);
    } catch (err) {
      console.warn('Aviso: Timeout ou erro ao efetuar signOut:', err);
    }
  }
}

/**
 * Restaura o usuário atual caso exista sessão ativa no storage local.
 */
export async function getPersistedSessionUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data } = await withTimeout(
      supabase.auth.getSession(),
      4000,
      'Timeout ao recuperar sessão persistida',
    );
    if (data?.session?.user) {
      return await withTimeout(
        fetchUserProfile(data.session.user.id, data.session.user.email, data.session.user.user_metadata),
        5000,
      );
    }
  } catch (err) {
    console.warn('Falha ao restaurar sessão persistida do Supabase:', err);
  }

  return null;
}
