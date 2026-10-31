/**
 * Pure RDO Workflow and State Machine Engine for StackLab E2E Testing Suite
 * Strictly adheres to project specification and rdoWorkflow.ts interface contracts.
 */

import {
  RDO_STATUS,
  generateId,
  computeIntegrityHash,
  MASTER_PIN,
} from './contracts.mjs';
import { assertPreSubmissionValid } from './validation.mjs';

export class WorkflowError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WorkflowError';
  }
}

const createAuditLog = (rdo, actor, action, extra = {}) => ({
  id: generateId('log'),
  rdoId: rdo.id,
  action,
  actorId: actor.id,
  actorName: actor.name,
  timestamp: new Date().toISOString(),
  ...extra,
});

export const canCommonEdit = (rdo) =>
  !rdo.locked && (rdo.status === RDO_STATUS.RASCUNHO || rdo.status === RDO_STATUS.DEVOLVIDO);

export const getAvailableActions = (rdo, user) => {
  const isMaster = user.profile === 'master';
  if (!isMaster) {
    if (!rdo.locked && (rdo.status === RDO_STATUS.RASCUNHO || rdo.status === RDO_STATUS.DEVOLVIDO)) {
      return ['edit', 'submit'];
    }
    return [];
  }

  // Master profile
  if (rdo.status === RDO_STATUS.RASCUNHO || rdo.status === RDO_STATUS.DEVOLVIDO) {
    return rdo.locked ? [] : ['edit', 'submit'];
  }
  if (rdo.status === RDO_STATUS.SUBMETIDO && !rdo.locked) {
    return ['approve', 'return', 'auditedEdit', 'comment'];
  }
  if (rdo.status === RDO_STATUS.APROVADO && rdo.locked) {
    return ['rectify'];
  }
  return [];
};

export const submitRdo = (rdo, actor) => {
  if (rdo.locked) {
    throw new WorkflowError('RDO bloqueado para submissão.');
  }
  if (rdo.status !== RDO_STATUS.RASCUNHO && rdo.status !== RDO_STATUS.DEVOLVIDO) {
    throw new WorkflowError('Apenas rascunhos ou RDOs devolvidos podem ser submetidos.');
  }

  // Validate pre-submission integrity
  assertPreSubmissionValid(rdo);

  const next = {
    ...rdo,
    status: RDO_STATUS.SUBMETIDO,
    submittedAt: new Date().toISOString(),
    returnReason: undefined,
  };

  const log = createAuditLog(rdo, actor, 'submetido');
  return { rdo: next, log };
};

export const returnRdo = (rdo, actor, reason) => {
  if (rdo.locked) {
    throw new WorkflowError('RDO bloqueado não pode ser devolvido.');
  }
  if (rdo.status !== RDO_STATUS.SUBMETIDO) {
    throw new WorkflowError('Só é possível devolver RDOs submetidos.');
  }
  if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
    throw new WorkflowError('Justificativa de devolução é obrigatória (mínimo 10 caracteres).');
  }

  const trimmedReason = reason.trim();
  const next = {
    ...rdo,
    status: RDO_STATUS.DEVOLVIDO,
    returnReason: trimmedReason,
  };

  const log = createAuditLog(rdo, actor, 'devolvido', {
    justification: trimmedReason,
  });

  return { rdo: next, log };
};

export const auditedEdit = (rdo, actor, { section, field, previousValue, newValue, justification }) => {
  if (rdo.locked || rdo.status !== RDO_STATUS.SUBMETIDO) {
    throw new WorkflowError('Edição auditável disponível apenas para RDOs em análise (submetidos).');
  }
  if (!justification || typeof justification !== 'string' || justification.trim().length < 5) {
    throw new WorkflowError('Justificativa da alteração é obrigatória (mínimo 5 caracteres).');
  }
  if (newValue === undefined || String(newValue).trim() === String(previousValue).trim()) {
    throw new WorkflowError('O novo valor é igual ao anterior.');
  }

  const trimmedNew = String(newValue).trim();
  const updatedRdo = JSON.parse(JSON.stringify(rdo));

  // Apply update to appropriate section
  switch (section) {
    case 'identificacao':
      if (field === 'condition' && updatedRdo.weather && updatedRdo.weather[0]) {
        updatedRdo.weather[0].condition = trimmedNew;
      }
      break;
    case 'maoDeObra':
      if (updatedRdo.labor && updatedRdo.labor[0]) {
        if (field === 'role') updatedRdo.labor[0].role = trimmedNew;
        if (field === 'quantity') updatedRdo.labor[0].quantity = Number(trimmedNew);
        if (field === 'hours') updatedRdo.labor[0].hours = Number(trimmedNew);
      }
      break;
    case 'equipamentos':
      if (updatedRdo.equipment && updatedRdo.equipment[0]) {
        if (field === 'name') updatedRdo.equipment[0].name = trimmedNew;
        if (field === 'activeHours') updatedRdo.equipment[0].activeHours = Number(trimmedNew);
        if (field === 'idleHours') updatedRdo.equipment[0].idleHours = Number(trimmedNew);
      }
      break;
    case 'atividades':
      if (updatedRdo.activities && updatedRdo.activities[0]) {
        if (field === 'description') updatedRdo.activities[0].description = trimmedNew;
        if (field === 'progress') updatedRdo.activities[0].progress = Number(trimmedNew);
      }
      break;
    case 'materiais':
      if (updatedRdo.materials && updatedRdo.materials[0]) {
        if (field === 'name') updatedRdo.materials[0].name = trimmedNew;
        if (field === 'invoice') updatedRdo.materials[0].invoice = trimmedNew;
      }
      break;
    case 'ocorrencias':
      if (updatedRdo.occurrences && updatedRdo.occurrences[0]) {
        updatedRdo.occurrences[0].description = trimmedNew;
      }
      break;
    case 'fotos':
      if (updatedRdo.photos && updatedRdo.photos[0]) {
        updatedRdo.photos[0].caption = trimmedNew;
      }
      break;
    default:
      break;
  }

  const log = createAuditLog(rdo, actor, 'editado', {
    section,
    field,
    previousValue: String(previousValue),
    newValue: trimmedNew,
    justification: justification.trim(),
  });

  return { rdo: updatedRdo, log };
};

export const addComment = (rdo, actor, section, text) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new WorkflowError('O comentário não pode ser vazio.');
  }

  const comment = {
    id: generateId('cmt'),
    section,
    authorId: actor.id,
    authorName: actor.name,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const next = {
    ...rdo,
    comments: [...(rdo.comments || []), comment],
  };

  const log = createAuditLog(rdo, actor, 'comentado', {
    section,
    newValue: comment.text,
  });

  return { rdo: next, log, comment };
};

export const approveRdo = (rdo, actor, { pin, ip = '127.0.0.1', deviceId = 'device-001' } = {}) => {
  if (rdo.locked || rdo.status !== RDO_STATUS.SUBMETIDO) {
    throw new WorkflowError('Apenas RDOs submetidos e não bloqueados podem ser aprovados.');
  }
  if (pin !== MASTER_PIN) {
    throw new WorkflowError('PIN de homologação incorreto.');
  }

  const signedAt = new Date().toISOString();
  const signature = {
    signedById: actor.id,
    signedByName: actor.name,
    signedAt,
    ip,
    deviceId,
    hash: computeIntegrityHash({
      rdoId: rdo.id,
      number: rdo.number,
      version: rdo.version,
      signedAt,
      signedById: actor.id,
    }),
  };

  const next = {
    ...rdo,
    status: RDO_STATUS.APROVADO,
    locked: true,
    signature,
  };

  const log = createAuditLog(rdo, actor, 'aprovado', {
    newValue: signature.hash,
  });

  return { rdo: next, log, signature };
};

export const rectifyRdo = (rdo, actor, reason, existingRdos = []) => {
  if (!rdo.locked || rdo.status !== RDO_STATUS.APROVADO) {
    throw new WorkflowError('Apenas RDOs aprovados podem ser retificados.');
  }
  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    throw new WorkflowError('Justificativa da retificação é obrigatória (mínimo 5 caracteres).');
  }

  const baseId = rdo.id.split('-v')[0];
  const nextVersion = rdo.version + 1;
  const nextId = `${baseId}-v${nextVersion}`;

  // Ensure no duplicate rectification
  const hasExisting = existingRdos.some(
    (item) => item.id === nextId || item.previousVersionId === rdo.id
  );
  if (hasExisting) {
    throw new WorkflowError('Este RDO já possui uma retificação emitida.');
  }

  const newVersion = {
    ...rdo,
    id: nextId,
    version: nextVersion,
    previousVersionId: rdo.id,
    status: RDO_STATUS.SUBMETIDO,
    submittedAt: new Date().toISOString(),
    locked: false,
    signature: undefined,
    comments: [],
  };

  const updatedList = existingRdos.length > 0
    ? existingRdos.map((item) => (item.id === rdo.id ? newVersion : item))
    : [newVersion];

  const log = createAuditLog(rdo, actor, 'retificado', {
    justification: reason.trim(),
    newValue: `Versão ${nextVersion}`,
  });

  return {
    original: rdo,
    newVersion,
    rdos: updatedList,
    log,
  };
};
