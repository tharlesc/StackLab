import type {
  AuditLogEntry,
  AuditAction,
  RDO,
  RDOComment,
  RDOSectionKey,
  RDOStatus,
  SignatureMeta,
  User,
  UserProfile,
} from '@/types';

/**
 * ⚙️ Máquina de estados do RDO — funções PURAS (sem React, sem I/O).
 * Podem ser reutilizadas no backend e testadas isoladamente.
 * Toda transição retorna o RDO atualizado + o registro de auditoria gerado.
 */

export class WorkflowError extends Error {}

export interface TransitionResult {
  rdo: RDO;
  log: AuditLogEntry;
}

export type RDOWorkflowAction =
  | 'edit'
  | 'submit'
  | 'approve'
  | 'return'
  | 'auditedEdit'
  | 'comment'
  | 'rectify';

let seq = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

const createLog = (
  rdo: RDO,
  actor: User,
  action: AuditAction,
  extra: Partial<AuditLogEntry> = {},
): AuditLogEntry => ({
  id: uid('log'),
  rdoId: rdo.id,
  action,
  actorId: actor.id,
  actorName: actor.name,
  timestamp: new Date().toISOString(),
  ...extra,
});

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new WorkflowError(message);
};

const requireText = (value: string | undefined, field: string) =>
  assert(!!value && value.trim().length >= 5, `${field} é obrigatória (mínimo 5 caracteres).`);

/**
 * Retorna as ações permitidas para um RDO conforme o seu status atual e o perfil do usuário.
 */
export const getAvailableActions = (
  rdoOrStatus: Pick<RDO, 'status' | 'locked'> | RDOStatus,
  userOrProfile: Pick<User, 'profile'> | UserProfile,
): RDOWorkflowAction[] => {
  const status: RDOStatus = typeof rdoOrStatus === 'string' ? rdoOrStatus : rdoOrStatus.status;
  const locked: boolean = typeof rdoOrStatus === 'string' ? status === 'aprovado' : rdoOrStatus.locked;
  const profile: UserProfile =
    typeof userOrProfile === 'string' ? userOrProfile : userOrProfile.profile;

  if (profile === 'common') {
    if (!locked && (status === 'rascunho' || status === 'devolvido')) {
      return ['edit', 'submit'];
    }
    return [];
  }

  // Perfil Master / Gestor
  if (status === 'rascunho' || status === 'devolvido') {
    return locked ? [] : ['edit', 'submit'];
  }
  if (status === 'submetido' && !locked) {
    return ['approve', 'return', 'auditedEdit', 'comment'];
  }
  if (status === 'aprovado' && locked) {
    return ['rectify'];
  }
  return [];
};

/** Operacional → submete rascunho ou RDO devolvido. Após isso fica somente leitura para ele. */
export const submitRdo = (rdo: RDO, actor: User): TransitionResult => {
  assert(
    !rdo.locked && (rdo.status === 'rascunho' || rdo.status === 'devolvido'),
    'Apenas rascunhos ou devolvidos podem ser submetidos.',
  );
  const next: RDO = {
    ...rdo,
    status: 'submetido',
    submittedAt: new Date().toISOString(),
    returnReason: undefined,
  };
  return { rdo: next, log: createLog(rdo, actor, 'submetido') };
};

/** Master → devolve com justificativa, liberando edição para o campo. */
export const returnRdo = (rdo: RDO, actor: User, reason: string): TransitionResult => {
  assert(rdo.status === 'submetido' && !rdo.locked, 'Só é possível devolver RDOs submetidos.');
  requireText(reason, 'Justificativa de devolução');
  const next: RDO = { ...rdo, status: 'devolvido', returnReason: reason.trim() };
  return { rdo: next, log: createLog(rdo, actor, 'devolvido', { justification: reason.trim() }) };
};

/** Atualiza o campo correspondente na seção do RDO durante uma edição auditável. */
export const applySectionFieldEdit = (
  rdo: RDO,
  section: RDOSectionKey,
  newValue: string,
): RDO => {
  const trimmed = newValue.trim();
  switch (section) {
    case 'atividades':
      return {
        ...rdo,
        activities:
          rdo.activities.length > 0
            ? rdo.activities.map((a, idx) => (idx === 0 ? { ...a, description: trimmed } : a))
            : [{ description: trimmed, quantity: 1, unit: 'un', location: 'Canteiro' }],
      };
    case 'identificacao':
      return {
        ...rdo,
        weather:
          rdo.weather.length > 0
            ? rdo.weather.map((w, idx) => (idx === 0 ? { ...w, condition: trimmed } : w))
            : [{ shift: 'manha', condition: trimmed }],
      };
    case 'maoDeObra':
      return {
        ...rdo,
        labor:
          rdo.labor.length > 0
            ? rdo.labor.map((l, idx) => (idx === 0 ? { ...l, role: trimmed } : l))
            : [{ role: trimmed, quantity: 1, hours: 8 }],
      };
    case 'equipamentos':
      return {
        ...rdo,
        equipment:
          rdo.equipment.length > 0
            ? rdo.equipment.map((e, idx) => (idx === 0 ? { ...e, name: trimmed } : e))
            : [{ name: trimmed, activeHours: 8, idleHours: 0 }],
      };
    case 'materiais':
      return {
        ...rdo,
        materials:
          rdo.materials.length > 0
            ? rdo.materials.map((m, idx) => (idx === 0 ? { ...m, name: trimmed } : m))
            : [{ name: trimmed, supplier: '-', invoice: '-' }],
      };
    case 'ocorrencias':
      return {
        ...rdo,
        occurrences:
          rdo.occurrences.length > 0
            ? rdo.occurrences.map((o, idx) => (idx === 0 ? { ...o, description: trimmed } : o))
            : [{ type: 'outro', description: trimmed }],
      };
    case 'fotos':
      return {
        ...rdo,
        photos:
          rdo.photos.length > 0
            ? rdo.photos.map((p, idx) => (idx === 0 ? { ...p, caption: trimmed } : p))
            : rdo.photos,
      };
  }
};

/** Master → edição técnica auditável (exige justificativa e registra valor anterior/novo). */
export const auditedEdit = (
  rdo: RDO,
  actor: User,
  params: {
    section: RDOSectionKey;
    field: string;
    previousValue: string;
    newValue: string;
    justification: string;
    apply?: (rdo: RDO) => RDO;
  },
): TransitionResult => {
  assert(!rdo.locked && rdo.status === 'submetido', 'Edição auditável disponível apenas para RDOs em análise.');
  requireText(params.justification, 'Justificativa da alteração');
  assert(params.newValue.trim() !== params.previousValue.trim(), 'O novo valor é igual ao anterior.');
  const next = params.apply
    ? params.apply(rdo)
    : applySectionFieldEdit(rdo, params.section, params.newValue);
  return {
    rdo: next,
    log: createLog(rdo, actor, 'editado', {
      section: params.section,
      field: params.field,
      previousValue: params.previousValue,
      newValue: params.newValue.trim(),
      justification: params.justification.trim(),
    }),
  };
};

export const addComment = (rdo: RDO, actor: User, section: RDOSectionKey, text: string): TransitionResult => {
  assert(text.trim().length > 0, 'O comentário não pode ser vazio.');
  const comment: RDOComment = {
    id: uid('cmt'),
    section,
    authorId: actor.id,
    authorName: actor.name,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  return {
    rdo: { ...rdo, comments: [...rdo.comments, comment] },
    log: createLog(rdo, actor, 'comentado', { section, newValue: comment.text }),
  };
};

/**
 * Hash de integridade (MOCK). Em produção o hash SHA-256 deve ser gerado no backend
 * sobre o PDF final e impresso no documento junto ao QR Code.
 */
export const computeIntegrityHash = (payload: unknown): string => {
  const str = JSON.stringify(payload);
  let h1 = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h1 ^= str.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return `SL-${(h1 >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
};

/** Master → "Validar e Assinar". Documento torna-se imutável. */
export const approveRdo = (
  rdo: RDO,
  actor: User,
  device: { ip: string; deviceId: string },
): TransitionResult => {
  assert(rdo.status === 'submetido' && !rdo.locked, 'Apenas RDOs submetidos podem ser aprovados.');
  const signedAt = new Date().toISOString();
  const signature: SignatureMeta = {
    signedById: actor.id,
    signedByName: actor.name,
    signedAt,
    ip: device.ip,
    deviceId: device.deviceId,
    hash: computeIntegrityHash({ ...rdo, signedAt, signer: actor.id }),
  };
  const next: RDO = { ...rdo, status: 'aprovado', locked: true, signature };
  return { rdo: next, log: createLog(rdo, actor, 'aprovado', { newValue: signature.hash }) };
};

/**
 * Master → Retificação oficial. Congela a versão original e gera nova cópia de trabalho
 * (versão N+1) que volta para análise sem duplicar o RDO na listagem ativa.
 */
export const rectifyRdo = (
  rdo: RDO,
  actor: User,
  reason: string,
  existingRdos: RDO[] = [],
): { original: RDO; newVersion: RDO; rdos: RDO[]; log: AuditLogEntry } => {
  assert(rdo.status === 'aprovado' && rdo.locked, 'Apenas RDOs aprovados podem ser retificados.');
  requireText(reason, 'Justificativa da retificação');
  const baseId = rdo.id.split('-v')[0];
  const nextId = `${baseId}-v${rdo.version + 1}`;
  assert(
    !existingRdos.some((item) => item.id === nextId || item.previousVersionId === rdo.id),
    'Este RDO já possui uma retificação emitida.',
  );
  const newVersion: RDO = {
    ...rdo,
    id: nextId,
    version: rdo.version + 1,
    previousVersionId: rdo.id,
    status: 'submetido',
    submittedAt: new Date().toISOString(),
    locked: false,
    signature: undefined,
    comments: [],
  };
  const updatedRdos =
    existingRdos.length > 0
      ? existingRdos.map((item) => (item.id === rdo.id ? newVersion : item))
      : [newVersion];

  return {
    original: rdo,
    newVersion,
    rdos: updatedRdos,
    log: createLog(rdo, actor, 'retificado', {
      justification: reason.trim(),
      newValue: `Versão ${newVersion.version}`,
    }),
  };
};
