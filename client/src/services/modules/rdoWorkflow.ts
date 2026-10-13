import type { AuditLogEntry, AuditAction, RDO, RDOComment, RDOSectionKey, SignatureMeta, User } from '@/types';

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

/** Operacional → submete rascunho ou RDO devolvido. Após isso fica somente leitura para ele. */
export const submitRdo = (rdo: RDO, actor: User): TransitionResult => {
  assert(rdo.status === 'rascunho' || rdo.status === 'devolvido', 'Apenas rascunhos ou devolvidos podem ser submetidos.');
  const next: RDO = { ...rdo, status: 'submetido', submittedAt: new Date().toISOString(), returnReason: undefined };
  return { rdo: next, log: createLog(rdo, actor, 'submetido') };
};

/** Master → devolve com justificativa, liberando edição para o campo. */
export const returnRdo = (rdo: RDO, actor: User, reason: string): TransitionResult => {
  assert(rdo.status === 'submetido', 'Só é possível devolver RDOs submetidos.');
  requireText(reason, 'Justificativa de devolução');
  const next: RDO = { ...rdo, status: 'devolvido', returnReason: reason.trim() };
  return { rdo: next, log: createLog(rdo, actor, 'devolvido', { justification: reason.trim() }) };
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
    apply: (rdo: RDO) => RDO;
  },
): TransitionResult => {
  assert(!rdo.locked && rdo.status === 'submetido', 'Edição auditável disponível apenas para RDOs em análise.');
  requireText(params.justification, 'Justificativa da alteração');
  assert(params.newValue.trim() !== params.previousValue.trim(), 'O novo valor é igual ao anterior.');
  const next = params.apply(rdo);
  return {
    rdo: next,
    log: createLog(rdo, actor, 'editado', {
      section: params.section,
      field: params.field,
      previousValue: params.previousValue,
      newValue: params.newValue,
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
 * (versão N+1) que volta para análise, preservando o histórico jurídico.
 */
export const rectifyRdo = (
  rdo: RDO,
  actor: User,
  reason: string,
): { original: RDO; newVersion: RDO; log: AuditLogEntry } => {
  assert(rdo.status === 'aprovado' && rdo.locked, 'Apenas RDOs aprovados podem ser retificados.');
  requireText(reason, 'Justificativa da retificação');
  const newVersion: RDO = {
    ...rdo,
    id: `${rdo.id.split('-v')[0]}-v${rdo.version + 1}`,
    version: rdo.version + 1,
    previousVersionId: rdo.id,
    status: 'submetido',
    submittedAt: new Date().toISOString(),
    locked: false,
    signature: undefined,
    comments: [],
  };
  return {
    original: rdo,
    newVersion,
    log: createLog(rdo, actor, 'retificado', { justification: reason.trim(), newValue: `Versão ${newVersion.version}` }),
  };
};
