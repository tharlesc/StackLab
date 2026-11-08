import { supabase, isSupabaseConfigured } from '../supabase';
import type {
  ActiveWork,
  Work,
  User,
  RDO,
  RDOStatus,
  WeatherEntry,
  LaborEntry,
  EquipmentEntry,
  ActivityEntry,
  MaterialEntry,
  OccurrenceEntry,
  PhotoEntry,
} from '@/types';

/**
 * Converte status do Supabase para o padrão do Client
 */
function mapSupabaseStatusToClient(status: string): RDOStatus {
  switch (status) {
    case 'pendente_aprovacao':
      return 'submetido';
    case 'rejeitado':
      return 'devolvido';
    case 'aprovado':
      return 'aprovado';
    case 'rascunho':
    default:
      return 'rascunho';
  }
}

/**
 * Busca todas as obras ativas do Supabase acessíveis pelo usuário logado
 */
export async function fetchObrasFromSupabase(): Promise<ActiveWork[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('obras')
    .select('*')
    .eq('ativa', true)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar obras no Supabase:', error);
    return [];
  }

  return (data || []).map((o) => ({
    id: o.id,
    name: o.nome,
    subtitle: o.descricao || o.endereco || 'Obra Cadastrada',
    statusType: '100% Em Dia',
    lastRdo: 'RDO Recente',
    weather: 'Ensolarado',
    team: 'Equipe em Campo',
    rdoStatus: 'Em Dia',
    actionText: 'Novo RDO',
  }));
}

/**
 * Busca RDOs reais do Supabase com todos os relacionamentos
 */
export async function fetchRdosFromSupabase(): Promise<RDO[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('rdos')
    .select(`
      *,
      obras (id, nome),
      rdo_clima (*),
      rdo_efetivo (*),
      rdo_maquinas (*),
      rdo_atividades (*),
      rdo_insumos (*),
      rdo_fatos (*),
      rdo_fotos (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar RDOs no Supabase:', error);
    return [];
  }

  return (data || []).map((row: any): RDO => {
    const weather: WeatherEntry[] = (row.rdo_clima || []).map((c: any) => ({
      shift: c.turno || 'manha',
      condition: c.condicao || 'Limpo',
      practical: c.praticavel ?? true,
      stoppageHours: c.horas_paralisacao ? Number(c.horas_paralisacao) : undefined,
      impact: c.impacto || undefined,
    }));

    const labor: LaborEntry[] = (row.rdo_efetivo || []).map((e: any) => ({
      role: e.funcao || 'Operador',
      quantity: Number(e.quantidade) || 1,
      hours: Number(e.horas) || 8,
      isContractor: Boolean(e.terceirizado),
      name: e.nome || undefined,
    }));

    const equipment: EquipmentEntry[] = (row.rdo_maquinas || []).map((m: any) => ({
      name: m.nome || 'Equipamento',
      quantity: Number(m.quantidade) || 1,
      activeHours: Number(m.horas_operacao) || 8,
      idleHours: Number(m.horas_parada) || 0,
      idleJustification: m.motivo_parada || undefined,
      isRented: Boolean(m.locada),
    }));

    const activities: ActivityEntry[] = (row.rdo_atividades || []).map((a: any) => ({
      description: a.descricao || 'Atividade',
      location: a.localizacao || 'Canteiro',
      unit: a.unidade || 'un',
      quantity: Number(a.quantidade) || 1,
      progress: a.progresso ? Number(a.progresso) : undefined,
      status: a.status || 'Em andamento',
    }));

    const materials: MaterialEntry[] = (row.rdo_insumos || []).map((i: any) => ({
      name: i.material || 'Material',
      supplier: i.fornecedor || 'Fornecedor',
      invoice: i.nota_fiscal || '',
      quantity: i.quantidade ? Number(i.quantidade) : undefined,
      unit: i.unidade || undefined,
    }));

    const occurrences: OccurrenceEntry[] = (row.rdo_fatos || []).map((f: any) => ({
      type: f.tipo || 'outro',
      description: f.descricao || '',
    }));

    const photos: PhotoEntry[] = (row.rdo_fotos || []).map((p: any) => ({
      id: p.id,
      caption: p.legenda || '',
      uri: p.url,
      watermarkedUri: p.url,
      takenAt: p.capturada_em || row.created_at,
      author: 'Operador',
      metadata: p.latitude
        ? {
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
            accuracy: Number(p.precisao) || 0,
            capturedAt: p.capturada_em || row.created_at,
            authorId: row.operador_id,
            authorName: 'Operador',
            workId: row.obra_id,
            workName: row.obras?.nome || '',
            rdoNumber: Number(row.numero) || 1,
            hash: '',
          }
        : undefined,
    }));

    const status = mapSupabaseStatusToClient(row.status);

    return {
      id: row.id,
      number: Number(row.numero) || 1,
      version: Number(row.versao) || 1,
      workId: row.obra_id,
      workName: row.obras?.nome || 'Obra Cadastrada',
      date: row.data || new Date().toISOString().split('T')[0],
      authorId: row.operador_id,
      authorName: 'Operador',
      status,
      submittedAt: row.enviado_em || undefined,
      returnReason: row.motivo_rejeicao || undefined,
      weather,
      labor,
      equipment,
      activities,
      materials,
      occurrences,
      photos,
      comments: [],
      locked: status === 'aprovado',
    };
  });
}

/**
 * Atualiza o status do RDO no Supabase (Aprovar / Rejeitar)
 */
export async function updateRdoStatusInSupabase(
  rdoId: string,
  newStatus: 'aprovado' | 'rejeitado',
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  const updatePayload: Record<string, any> = {
    status: newStatus,
  };

  if (newStatus === 'rejeitado' && reason) {
    updatePayload.motivo_rejeicao = reason;
  }

  const { error } = await supabase.from('rdos').update(updatePayload).eq('id', rdoId);

  if (error) {
    console.error('Erro ao atualizar RDO no Supabase:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Busca todas as obras (ativas e inativas) para o painel de administração (Master)
 */
export async function fetchAdminWorksFromSupabase(): Promise<Work[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('obras')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar obras de administração no Supabase:', error);
    return [];
  }

  return (data || []).map((o) => ({
    id: o.id,
    name: o.nome,
    subtitle: o.descricao || '',
    client: o.cliente || '',
    address: o.endereco || '',
    active: o.ativa ?? true,
  }));
}

/**
 * Busca todos os usuários/perfis e suas atribuições de obras para o painel Master
 */
export async function fetchAdminUsersFromSupabase(): Promise<User[]> {
  if (!isSupabaseConfigured) return [];

  const [{ data: profiles, error: pError }, { data: assignments, error: aError }] =
    await Promise.all([
      supabase.from('profiles').select('*').order('nome', { ascending: true }),
      supabase.from('obra_operadores').select('*'),
    ]);

  if (pError) {
    console.error('Erro ao buscar perfis no Supabase:', pError);
    return [];
  }

  if (aError) {
    console.warn('Aviso: Falha ao carregar atribuições de obras no Supabase:', aError);
  }

  const assignmentMap = new Map<string, string[]>();
  (assignments || []).forEach((a: { operador_id: string; obra_id: string }) => {
    const list = assignmentMap.get(a.operador_id) || [];
    list.push(a.obra_id);
    assignmentMap.set(a.operador_id, list);
  });

  return (profiles || []).map((p): User => {
    const isMaster = p.role === 'master';
    const isClient = p.role === 'client' || (p.cargo && p.cargo.toLowerCase().includes('cliente'));

    // Verifica status online no banco de dados: coluna booleana `is_online` com fallback de sincronização recente
    const lastSyncIso = p.last_sync_at || p.updated_at || p.created_at || new Date().toISOString();
    const diffMin = (Date.now() - new Date(lastSyncIso).getTime()) / (1000 * 60);
    const isOnline =
      p.is_online !== undefined && p.is_online !== null
        ? Boolean(p.is_online)
        : diffMin <= 15;

    return {
      id: p.id,
      name: p.nome || p.email || 'Usuário',
      email: p.email || '',
      role: p.cargo || (isMaster ? 'Engenheiro Master' : isClient ? 'Cliente / Fiscal' : 'Operador de Campo'),
      crea: p.crea ?? undefined,
      profile: isMaster ? 'master' : isClient ? 'client' : 'common',
      assignedWorkIds: assignmentMap.get(p.id) || [],
      active: p.ativo ?? true,
      isOnline,
      lastSyncAt: lastSyncIso,
    };
  });
}

/**
 * Cria uma nova obra no Supabase
 */
export async function createWorkInSupabase(
  data: Omit<Work, 'id' | 'active'>,
): Promise<Work | null> {
  if (!isSupabaseConfigured) return null;

  const { data: created, error } = await supabase
    .from('obras')
    .insert({
      nome: data.name,
      descricao: data.subtitle,
      cliente: data.client,
      endereco: data.address,
      ativa: true,
    })
    .select()
    .single();

  if (error || !created) {
    console.error('Erro ao cadastrar obra no Supabase:', error);
    return null;
  }

  return {
    id: created.id,
    name: created.nome,
    subtitle: created.descricao || '',
    client: created.cliente || '',
    address: created.endereco || '',
    active: created.ativa,
  };
}

/**
 * Atualiza os dados de uma obra no Supabase
 */
export async function updateWorkInSupabase(
  workId: string,
  data: Partial<Omit<Work, 'id'>>,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const payload: Record<string, any> = {};
  if (data.name !== undefined) payload.nome = data.name;
  if (data.subtitle !== undefined) payload.descricao = data.subtitle;
  if (data.client !== undefined) payload.cliente = data.client;
  if (data.address !== undefined) payload.endereco = data.address;
  if (data.active !== undefined) payload.ativa = data.active;

  const { error } = await supabase.from('obras').update(payload).eq('id', workId);

  if (error) {
    console.error('Erro ao atualizar obra no Supabase:', error);
    return false;
  }

  return true;
}

/**
 * Ativa ou inativa uma obra no Supabase
 */
export async function toggleWorkActiveInSupabase(
  workId: string,
  newActive: boolean,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('obras')
    .update({ ativa: newActive })
    .eq('id', workId);

  if (error) {
    console.error('Erro ao alternar status da obra no Supabase:', error);
    return false;
  }

  return true;
}

/**
 * Ativa ou inativa um perfil de usuário no Supabase
 */
export async function toggleUserActiveInSupabase(
  userId: string,
  newActive: boolean,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('profiles')
    .update({ ativo: newActive })
    .eq('id', userId);

  if (error) {
    console.error('Erro ao alternar status do usuário no Supabase:', error);
    return false;
  }

  return true;
}

/**
 * Alterna a vinculação de um operador a uma obra no Supabase
 */
export async function toggleAssignmentInSupabase(
  userId: string,
  workId: string,
  assign: boolean,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  if (assign) {
    const { error } = await supabase.from('obra_operadores').insert({
      operador_id: userId,
      obra_id: workId,
    });
    if (error) {
      console.error('Erro ao atribuir obra no Supabase:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('obra_operadores')
      .delete()
      .eq('operador_id', userId)
      .eq('obra_id', workId);
    if (error) {
      console.error('Erro ao remover atribuição no Supabase:', error);
      return false;
    }
  }

  return true;
}

/**
 * Persiste um RDO submetido e suas tabelas filhas no Supabase
 */
export async function saveRdoToSupabase(rdo: RDO): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  try {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const rdoPayload: Record<string, any> = {
      obra_id: rdo.workId,
      data: rdo.date,
      status: rdo.status === 'submetido' ? 'pendente_aprovacao' : rdo.status === 'aprovado' ? 'aprovado' : 'rascunho',
      enviado_em: rdo.submittedAt || new Date().toISOString(),
    };

    if (isUuid(rdo.id)) {
      rdoPayload.id = rdo.id;
    }
    if (isUuid(rdo.authorId)) {
      rdoPayload.operador_id = rdo.authorId;
    }

    const { data: insertedRdo, error: rdoErr } = await supabase
      .from('rdos')
      .upsert(rdoPayload, { onConflict: 'id' })
      .select()
      .single();

    if (rdoErr) {
      console.warn('Aviso: Falha ao persistir cabeçalho do RDO no Supabase:', rdoErr);
      return { success: false, error: rdoErr.message };
    }

    const targetRdoId = insertedRdo?.id || rdo.id;

    if (rdo.weather && rdo.weather.length > 0) {
      const climaRows = rdo.weather.map((w) => ({
        rdo_id: targetRdoId,
        turno: w.shift,
        condicao: w.condition,
        praticavel: w.practical ?? true,
        horas_paralisadas: w.stoppageHours,
        impacto: w.impact,
      }));
      await supabase.from('rdo_clima').upsert(climaRows, { onConflict: 'rdo_id,turno' });
    }

    if (rdo.labor && rdo.labor.length > 0) {
      const laborRows = rdo.labor.map((l, idx) => ({
        rdo_id: targetRdoId,
        funcao: l.role,
        nome: l.name,
        quantidade: l.quantity,
        horas: l.hours,
        terceirizado: l.isContractor ?? false,
        ordem: idx,
      }));
      await supabase.from('rdo_efetivo').insert(laborRows);
    }

    if (rdo.activities && rdo.activities.length > 0) {
      const actRows = rdo.activities.map((a, idx) => ({
        rdo_id: targetRdoId,
        descricao: a.description,
        localizacao: a.location,
        unidade: a.unit,
        quantidade: a.quantity,
        progresso: a.progress,
        ordem: idx,
      }));
      await supabase.from('rdo_atividades').insert(actRows);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro ao salvar RDO no Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Registra um novo usuário no Supabase Auth e tabela profiles
 */
export async function createUserInSupabase(
  data: {
    name: string;
    email: string;
    role: string;
    profile: string;
    crea?: string;
    assignedWorkIds?: string[];
  },
  tempPassword?: string,
): Promise<User | null> {
  if (!isSupabaseConfigured) return null;

  const password = tempPassword || Math.floor(100000 + Math.random() * 900000).toString();
  const cleanEmail = data.email.trim().toLowerCase();

  // 1. Tenta criar via RPC seguro no Postgres (bypassa limites de SMTP/e-mail e confirma na hora)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_client_user', {
      p_email: cleanEmail,
      p_password: password,
      p_name: data.name,
      p_role: data.profile || 'client',
      p_cargo: data.role || 'Cliente / Fiscal',
      p_obra_id: data.assignedWorkIds?.[0] || null,
    });

    if (!rpcError && rpcData) {
      return {
        id: rpcData.id,
        name: rpcData.name || data.name,
        email: rpcData.email || cleanEmail,
        role: rpcData.role || data.role,
        crea: data.crea,
        profile: (rpcData.profile as any) || (data.profile as any) || 'client',
        assignedWorkIds: data.assignedWorkIds || [],
        active: true,
        isOnline: false,
        lastSyncAt: new Date().toISOString(),
        tempPassword: password,
        isFirstAccess: true,
      };
    }

    if (rpcError && rpcError.code !== 'PGRST202') {
      console.warn('Aviso ao executar RPC create_client_user:', rpcError.message);
    }
  } catch (rpcErr) {
    console.warn('RPC create_client_user não disponível, tentando fallback padrão:', rpcErr);
  }

  // 2. Fallback via supabase.auth.signUp tradicional
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: data.name,
          nome: data.name,
          cargo: data.role,
          role: data.profile,
          crea: data.crea || null,
        },
      },
    });

    if (authError) {
      let errorMsg = authError.message;
      if (errorMsg.toLowerCase().includes('rate limit')) {
        errorMsg =
          'Limite de envio de e-mails do Supabase atingido. Execute o script da migration "20261108000002_create_client_user_rpc.sql" no SQL Editor do Supabase para criar usuários sem restrição de e-mail.';
      }
      throw new Error(errorMsg);
    }

    if (!authData?.user?.id) {
      throw new Error('Falha ao registrar usuário no Supabase Auth: ID não retornado.');
    }

    const userId = authData.user.id;

    // Atualiza/Insere perfil na tabela profiles
    const { error: profileErr } = await supabase.from('profiles').upsert(
      {
        id: userId,
        nome: data.name,
        email: cleanEmail,
        cargo: data.role,
        role: data.profile === 'master' ? 'master' : 'operador',
        crea: data.crea || null,
        ativo: true,
        is_first_access: true,
        temp_password: password,
      },
      { onConflict: 'id' },
    );

    if (profileErr) {
      console.warn('Aviso ao atualizar profiles no Supabase:', profileErr.message);
    }

    // Atribui obras se houver
    if (data.assignedWorkIds && data.assignedWorkIds.length > 0) {
      const inserts = data.assignedWorkIds.map((obraId) => ({
        operador_id: userId,
        obra_id: obraId,
      }));
      await supabase.from('obra_operadores').insert(inserts);
    }

    return {
      id: userId,
      name: data.name,
      email: cleanEmail,
      role: data.role,
      crea: data.crea,
      profile: (data.profile as any) || 'common',
      assignedWorkIds: data.assignedWorkIds || [],
      active: true,
      isOnline: false,
      lastSyncAt: new Date().toISOString(),
      tempPassword: password,
      isFirstAccess: true,
    };
  } catch (err: any) {
    console.error('Erro ao cadastrar usuário no Supabase:', err);
    throw err;
  }
}

/**
 * Reseta a senha de um usuário no Supabase para uma nova senha temporária de 6 dígitos.
 */
export async function resetUserPasswordInSupabase(
  userId: string,
  newPassword: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  // 1. Tenta atualizar senha diretamente via RPC no Supabase Auth
  try {
    const { data, error } = await supabase.rpc('reset_client_password', {
      p_user_id: userId,
      p_new_password: newPassword,
    });
    if (!error && data) {
      return true;
    }
  } catch (rpcErr) {
    console.warn('RPC reset_client_password não disponível:', rpcErr);
  }

  // 2. Fallback: atualiza dados do perfil
  try {
    await supabase
      .from('profiles')
      .update({
        temp_password: newPassword,
        is_first_access: true,
      })
      .eq('id', userId);

    return true;
  } catch (err) {
    console.warn('Aviso ao resetar senha no Supabase:', err);
    return false;
  }
}



