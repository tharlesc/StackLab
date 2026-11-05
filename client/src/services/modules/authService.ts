import { supabase, isSupabaseConfigured } from '../supabase';
import type { User } from '@/types';

/**
 * Mapeia o registro da tabela public.profiles + obra_operadores para a interface User do app.
 */
export async function fetchUserProfile(userId: string, emailFallback?: string): Promise<User> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado');
  }

  // 1. Busca perfil na tabela profiles
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileErr && profileErr.code !== 'PGRST116') {
    console.error('Erro ao buscar perfil do usuário no Supabase:', profileErr);
  }

  // 2. Busca atribuições de obras do operador
  const { data: assignments, error: assignErr } = await supabase
    .from('obra_operadores')
    .select('obra_id')
    .eq('operador_id', userId);

  if (assignErr) {
    console.warn('Aviso: Não foi possível obter obras vinculadas do operador:', assignErr);
  }

  const isMaster = profile?.role === 'master';
  const assignedWorkIds = assignments ? assignments.map((a: { obra_id: string }) => a.obra_id) : [];

  return {
    id: userId,
    name: profile?.nome || emailFallback?.split('@')[0] || 'Usuário',
    email: profile?.email || emailFallback || '',
    role: profile?.cargo || (isMaster ? 'Engenheiro / Gestor' : 'Operador de Campo'),
    crea: profile?.crea ?? undefined,
    profile: isMaster ? 'master' : 'common',
    assignedWorkIds,
    active: profile?.ativo ?? true,
  };
}

/**
 * Realiza login com E-mail e Senha no Supabase Auth.
 */
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { user: null, error: 'Configuração do Supabase ausente no arquivo client/.env' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error || !data.user) {
    return {
      user: null,
      error: error?.message || 'Falha ao autenticar. Verifique o e-mail e a senha informados.',
    };
  }

  try {
    const user = await fetchUserProfile(data.user.id, data.user.email);
    return { user, error: null };
  } catch (err: any) {
    return {
      user: null,
      error: err?.message || 'Falha ao carregar os dados de perfil do usuário.',
    };
  }
}

/**
 * Encerra a sessão ativa no Supabase.
 */
export async function logout(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

/**
 * Restaura o usuário atual caso exista sessão ativa no storage local.
 */
export async function getPersistedSessionUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      return await fetchUserProfile(data.session.user.id, data.session.user.email);
    }
  } catch (err) {
    console.warn('Falha ao restaurar sessão persistida do Supabase:', err);
  }

  return null;
}

