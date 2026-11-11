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

function mapSupabaseActivityStatusToClient(status?: string): ActivityEntry['status'] {
  const norm = (status || '').toLowerCase();
  if (norm === 'concluido' || norm.includes('conclu')) return 'Concluído';
  if (norm === 'paralisado' || norm.includes('paralis')) return 'Paralisado';
  if (norm === 'iniciado' || norm.includes('iniciad')) return 'Iniciado';
  return 'Em andamento';
}

function mapClientActivityStatusToSupabase(
  status?: string,
): 'iniciado' | 'em_andamento' | 'concluido' | 'paralisado' {
  const norm = (status || '').toLowerCase();
  if (norm.includes('conclu')) return 'concluido';
  if (norm.includes('paralis')) return 'paralisado';
  if (norm.includes('iniciad')) return 'iniciado';
  return 'em_andamento';
}

function normalizeTimeForDb(timeStr?: string): string | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed;
  return null;
}

function normalizeDateForDb(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const brMatch = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return dateStr;
}

/**
 * Busca RDOs reais do Supabase com todos os relacionamentos
 */
export async function fetchRdosFromSupabase(): Promise<RDO[]> {
  if (!isSupabaseConfigured) return [];

  const [{ data, error }, { data: profilesData }] = await Promise.all([
    supabase
      .from('rdos')
      .select(`
        *,
        obras (id, nome, cliente, endereco, descricao),
        rdo_clima (*),
        rdo_efetivo (*),
        rdo_maquinas (*),
        rdo_atividades (*),
        rdo_insumos (*),
        rdo_fatos (*),
        rdo_fotos (*)
      `)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, nome, email'),
  ]);

  if (error) {
    console.error('Erro ao buscar RDOs no Supabase:', error);
    return [];
  }

  const profileMap = new Map<string, string>();
  (profilesData || []).forEach((p: any) => {
    if (p?.id) {
      profileMap.set(p.id, p.nome || p.email || 'Operador');
    }
  });

  return (data || []).map((row: any): RDO => {
    const authorName = profileMap.get(row.operador_id) || 'Operador';
    const approverName = row.aprovado_por
      ? profileMap.get(row.aprovado_por) || 'Engenheiro Master'
      : 'Engenheiro Master';

    const weather: WeatherEntry[] = (row.rdo_clima || []).map((c: any) => {
      const stopH = c.horas_paralisadas ?? c.horas_paralisacao;
      return {
        shift: c.turno || 'manha',
        condition: c.condicao || 'Ensolarado',
        practical: c.praticavel ?? true,
        stoppageHours: stopH !== undefined && stopH !== null ? Number(stopH) : undefined,
        impact: c.impacto || undefined,
      };
    });

    const labor: LaborEntry[] = (row.rdo_efetivo || []).map((e: any) => ({
      role: e.funcao || 'Operador',
      quantity: Number(e.quantidade) || 1,
      hours: Number(e.horas) || 8,
      isContractor: Boolean(e.terceirizado),
      name: e.nome || undefined,
      horaInicio: e.hora_inicio ? String(e.hora_inicio).slice(0, 5) : undefined,
      horaFim: e.hora_fim ? String(e.hora_fim).slice(0, 5) : undefined,
    }));

    const equipment: EquipmentEntry[] = (row.rdo_maquinas || []).map((m: any) => ({
      name: m.equipamento || m.nome || 'Equipamento',
      brand: m.marca || undefined,
      code: m.codigo || undefined,
      quantity: Number(m.quantidade) || 1,
      activeHours: Number(m.horas_ativas ?? m.horas_operacao ?? 8),
      idleHours: Number(m.horas_ociosas ?? m.horas_parada ?? 0),
      idleJustification: m.justificativa_ociosidade || m.motivo_parada || undefined,
      isRented: Boolean(m.locado ?? m.locada),
      horaInicio: m.hora_inicio ? String(m.hora_inicio).slice(0, 5) : undefined,
      horaFim: m.hora_fim ? String(m.hora_fim).slice(0, 5) : undefined,
      observations: m.observacoes || undefined,
    }));

    const activities: ActivityEntry[] = (row.rdo_atividades || []).map((a: any) => ({
      description: a.descricao || 'Atividade',
      location: a.local || a.localizacao || 'Canteiro',
      unit: a.unidade || 'un',
      quantity: Number(a.quantidade) || 1,
      progress: a.progresso !== undefined && a.progresso !== null ? Number(a.progresso) : undefined,
      status: mapSupabaseActivityStatusToClient(a.status),
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
      horaInicio: f.hora_inicio ? String(f.hora_inicio).slice(0, 5) : undefined,
      horaFim: f.hora_fim ? String(f.hora_fim).slice(0, 5) : undefined,
    }));

    const photos: PhotoEntry[] = (row.rdo_fotos || []).map((p: any) => {
      const rawPath = p.url || p.storage_path || '';
      const resolvedUrl =
        rawPath && /^https?:\/\//i.test(rawPath)
          ? rawPath
          : rawPath
            ? supabase.storage.from('rdo-fotos').getPublicUrl(rawPath).data?.publicUrl || rawPath
            : undefined;
      const photoAuthor = (p.autor_id && profileMap.get(p.autor_id)) || authorName;
      const capturedTime = p.tirada_em || p.capturada_em || row.created_at;

      return {
        id: p.id,
        caption: p.legenda || '',
        uri: resolvedUrl,
        watermarkedUri: resolvedUrl,
        takenAt: capturedTime,
        author: photoAuthor,
        metadata:
          p.latitude !== undefined && p.latitude !== null
            ? {
                latitude: Number(p.latitude),
                longitude: Number(p.longitude),
                accuracy: Number(p.precisao_m ?? p.precisao ?? 0),
                address: p.endereco || undefined,
                capturedAt: capturedTime,
                authorId: p.autor_id || row.operador_id,
                authorName: photoAuthor,
                workId: row.obra_id,
                workName: row.obras?.nome || '',
                rdoNumber: Number(row.numero) || 1,
                hash: p.hash || '',
              }
            : undefined,
      };
    });

    const status = mapSupabaseStatusToClient(row.status);
    const isApproved = status === 'aprovado';
    const signature = isApproved
      ? {
          signedById: row.aprovado_por || 'master',
          signedByName: approverName,
          signedAt: row.aprovado_em || row.updated_at || new Date().toISOString(),
          ip: '177.12.40.8',
          deviceId: 'mobile-app',
          hash: row.assinatura_hash || `SL-${(row.id || '00000000').slice(0, 8).toUpperCase()}`,
        }
      : undefined;

    return {
      id: row.id,
      number: Number(row.numero) || 1,
      version: Number(row.versao) || 1,
      workId: row.obra_id,
      workName: row.obras?.nome || 'Obra Cadastrada',
      date: row.data || new Date().toISOString().split('T')[0],
      authorId: row.operador_id,
      authorName,
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
      signature,
      locked: isApproved,
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
  signature?: any,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  const updatePayload: Record<string, any> = {
    status: newStatus,
  };

  if (newStatus === 'rejeitado' && reason) {
    updatePayload.motivo_rejeicao = reason;
  }

  if (newStatus === 'aprovado') {
    if (signature?.signedAt) {
      updatePayload.aprovado_em = signature.signedAt;
    }
    if (signature?.signedById) {
      updatePayload.aprovado_por = signature.signedById;
    }
    if (signature?.hash) {
      updatePayload.assinatura_hash = signature.hash;
    }
  }

  const { error } = await supabase.from('rdos').update(updatePayload).eq('id', rdoId);

  if (error) {
    if (error.message?.includes('assinatura_hash')) {
      delete updatePayload.assinatura_hash;
      const { error: retryError } = await supabase.from('rdos').update(updatePayload).eq('id', rdoId);
      if (retryError) {
        console.error('Erro ao atualizar RDO no Supabase:', retryError);
        return { success: false, error: retryError.message };
      }
      return { success: true };
    }

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
      data: normalizeDateForDb(rdo.date),
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
        nome: l.name || null,
        quantidade: l.quantity,
        horas: l.hours,
        terceirizado: l.isContractor ?? false,
        hora_inicio: normalizeTimeForDb(l.horaInicio),
        hora_fim: normalizeTimeForDb(l.horaFim),
        ordem: idx,
      }));
      await supabase.from('rdo_efetivo').insert(laborRows);
    }

    if (rdo.equipment && rdo.equipment.length > 0) {
      const equipRows = rdo.equipment.map((e, idx) => ({
        rdo_id: targetRdoId,
        equipamento: e.name,
        marca: e.brand || null,
        codigo: e.code || null,
        quantidade: e.quantity ?? 1,
        locado: e.isRented ?? false,
        horas_ativas: e.activeHours ?? 0,
        horas_ociosas: e.idleHours ?? 0,
        justificativa_ociosidade: e.idleHours > 0 ? e.idleJustification || 'Ociosidade operacional' : null,
        hora_inicio: normalizeTimeForDb(e.horaInicio),
        hora_fim: normalizeTimeForDb(e.horaFim),
        observacoes: e.observations || null,
        ordem: idx,
      }));
      await supabase.from('rdo_maquinas').insert(equipRows);
    }

    if (rdo.activities && rdo.activities.length > 0) {
      const actRows = rdo.activities.map((a, idx) => ({
        rdo_id: targetRdoId,
        descricao: a.description,
        local: a.location || null,
        unidade: a.unit || null,
        quantidade: a.quantity,
        progresso: a.progress ?? 0,
        status: mapClientActivityStatusToSupabase(a.status),
        ordem: idx,
      }));
      await supabase.from('rdo_atividades').insert(actRows);
    }

    if (rdo.occurrences && rdo.occurrences.length > 0) {
      const occRows = rdo.occurrences.map((o, idx) => ({
        rdo_id: targetRdoId,
        tipo: o.type || 'outro',
        descricao: o.description,
        hora_inicio: normalizeTimeForDb(o.horaInicio),
        hora_fim: normalizeTimeForDb(o.horaFim),
        ordem: idx,
      }));
      await supabase.from('rdo_fatos').insert(occRows);
    }

    if (rdo.photos && rdo.photos.length > 0) {
      const photoRows = rdo.photos.map((p, idx) => ({
        rdo_id: targetRdoId,
        storage_path: `${targetRdoId}/${p.id || `foto-${idx + 1}`}.jpg`,
        legenda: p.caption || null,
        tirada_em: p.takenAt || new Date().toISOString(),
        latitude: p.metadata?.latitude ?? null,
        longitude: p.metadata?.longitude ?? null,
        precisao_m: p.metadata?.accuracy ?? null,
        endereco: p.metadata?.address ?? null,
        hash: p.metadata?.hash ?? null,
        ordem: idx,
      }));
      await supabase.from('rdo_fotos').insert(photoRows);
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



