/**
 * Pre-submission and Business Invariants Validation Engine for StackLab RDO
 * Strictly based on ORIGINAL_REQUEST.md, PROJECT.md, and survey specification.
 */

import {
  SHIFTS,
  OCCURRENCE_TYPES,
  calcHeadcount,
} from './contracts.mjs';

export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export const validateIdentification = (rdo) => {
  const errors = [];
  if (!rdo.workId || typeof rdo.workId !== 'string' || rdo.workId.trim() === '') {
    errors.push('Identificação da obra é obrigatória.');
  }
  if (!rdo.date || typeof rdo.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(rdo.date)) {
    errors.push('Data do RDO inválida. Formato esperado: AAAA-MM-DD.');
  }
  if (!rdo.authorId || typeof rdo.authorId !== 'string' || rdo.authorId.trim() === '') {
    errors.push('Identificação do autor do RDO é obrigatória.');
  }
  return errors;
};

export const validateWeather = (weather = []) => {
  const errors = [];
  if (!Array.isArray(weather) || weather.length === 0) {
    errors.push('Informe ao menos 1 turno nas condições climáticas.');
    return errors;
  }

  const registeredShifts = new Set();
  weather.forEach((entry, index) => {
    if (!SHIFTS.includes(entry.shift)) {
      errors.push(`Turno inválido no registro ${index + 1}: "${entry.shift}". Esperado: manha, tarde ou noite.`);
    }
    if (registeredShifts.has(entry.shift)) {
      errors.push(`Turno duplicado no registro ${index + 1}: "${entry.shift}". Cada turno pode ser registrado apenas uma vez.`);
    }
    registeredShifts.add(entry.shift);

    if (!entry.condition || typeof entry.condition !== 'string' || entry.condition.trim() === '') {
      errors.push(`Condição climática do turno "${entry.shift}" é obrigatória.`);
    }

    const stoppage = Number(entry.stoppageHours) || 0;
    if (stoppage < 0 || stoppage > 24) {
      errors.push(`Horas paradas no turno "${entry.shift}" devem estar entre 0 e 24h.`);
    }

    const isRain = /chuva|chuvoso/i.test(entry.condition || '');
    if (isRain && stoppage > 0) {
      if (!entry.impact || entry.impact.trim().length < 3) {
        errors.push(`Impacto da paralisação por chuva no turno "${entry.shift}" é obrigatório (mínimo 3 caracteres).`);
      }
    }
  });

  return errors;
};

export const validateLabor = (labor = []) => {
  const errors = [];
  if (!Array.isArray(labor) || labor.length === 0) {
    errors.push('Informe ao menos 1 colaborador no efetivo.');
    return errors;
  }

  const headcount = calcHeadcount(labor);
  if (headcount <= 0) {
    errors.push('Informe ao menos 1 colaborador no efetivo.');
  }

  labor.forEach((entry, index) => {
    if (!entry.role || typeof entry.role !== 'string' || entry.role.trim() === '') {
      errors.push(`Função/cargo do efetivo no item ${index + 1} é obrigatória.`);
    }
    const qty = Number(entry.quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      errors.push(`Quantidade do cargo "${entry.role || index + 1}" deve ser um número inteiro >= 1.`);
    }
    const hrs = Number(entry.hours);
    if (isNaN(hrs) || hrs < 0 || hrs > 24) {
      errors.push(`Jornada diária do cargo "${entry.role || index + 1}" deve estar entre 0 e 24 horas.`);
    }
  });

  return errors;
};

export const validateEquipment = (equipment = []) => {
  const errors = [];
  if (!Array.isArray(equipment)) return errors;

  equipment.forEach((entry, index) => {
    if (!entry.name || typeof entry.name !== 'string' || entry.name.trim() === '') {
      errors.push(`Nome do equipamento no item ${index + 1} é obrigatório.`);
    }
    const active = Number(entry.activeHours) || 0;
    const idle = Number(entry.idleHours) || 0;

    if (active < 0) {
      errors.push(`Horas ativas do equipamento "${entry.name || index + 1}" não podem ser negativas.`);
    }
    if (idle < 0) {
      errors.push(`Horas ociosas do equipamento "${entry.name || index + 1}" não podem ser negativas.`);
    }
    if (active + idle > 24) {
      errors.push(`Soma de horas ativas (${active}h) e ociosas (${idle}h) do equipamento "${entry.name || index + 1}" excede 24h em um único dia.`);
    }
    if (idle > 0) {
      if (!entry.idleJustification || entry.idleJustification.trim().length < 5) {
        errors.push(`Justificativa de ociosidade do equipamento "${entry.name || index + 1}" é obrigatória quando horas ociosas > 0 (mínimo 5 caracteres).`);
      }
    }
  });

  return errors;
};

export const validateActivities = (activities = []) => {
  const errors = [];
  if (!Array.isArray(activities) || activities.length === 0) {
    errors.push('Informe ao menos uma atividade executada.');
    return errors;
  }

  activities.forEach((entry, index) => {
    if (!entry.description || typeof entry.description !== 'string' || entry.description.trim().length < 3) {
      errors.push(`Descrição da atividade ${index + 1} é obrigatória (mínimo 3 caracteres).`);
    }
    if (!entry.location || typeof entry.location !== 'string' || entry.location.trim() === '') {
      errors.push(`Local/frente de serviço da atividade ${index + 1} é obrigatório.`);
    }
    if (entry.progress !== undefined) {
      const prog = Number(entry.progress);
      if (isNaN(prog) || prog < 0 || prog > 100) {
        errors.push(`Avanço físico da atividade ${index + 1} deve estar entre 0% e 100%.`);
      }
    }
    if (entry.quantity !== undefined && entry.quantity !== null) {
      const qty = Number(entry.quantity);
      if (isNaN(qty) || qty < 0) {
        errors.push(`Quantidade da atividade ${index + 1} não pode ser negativa.`);
      }
    }
  });

  return errors;
};

export const validateMaterials = (materials = []) => {
  const errors = [];
  if (!Array.isArray(materials)) return errors;

  materials.forEach((entry, index) => {
    if (!entry.name || entry.name.trim() === '') {
      errors.push(`Nome do insumo/material ${index + 1} é obrigatório.`);
    }
    if (!entry.supplier || entry.supplier.trim() === '') {
      errors.push(`Fornecedor do material "${entry.name || index + 1}" é obrigatório.`);
    }
    if (!entry.invoice || entry.invoice.trim() === '') {
      errors.push(`Número da NF-e do material "${entry.name || index + 1}" é obrigatório.`);
    }
  });

  return errors;
};

export const validateOccurrences = (occurrences = []) => {
  const errors = [];
  if (!Array.isArray(occurrences)) return errors;

  occurrences.forEach((entry, index) => {
    if (!OCCURRENCE_TYPES.includes(entry.type)) {
      errors.push(`Tipo de ocorrência inválido no item ${index + 1}: "${entry.type}".`);
    }
    if (!entry.description || typeof entry.description !== 'string' || entry.description.trim().length < 5) {
      errors.push(`Descrição da ocorrência ${index + 1} deve ter no mínimo 5 caracteres.`);
    }
  });

  return errors;
};

export const validatePhotos = (photos = []) => {
  const errors = [];
  if (!Array.isArray(photos)) return errors;

  photos.forEach((entry, index) => {
    if (!entry.caption || typeof entry.caption !== 'string' || entry.caption.trim() === '') {
      errors.push(`Legenda da foto ${index + 1} é obrigatória.`);
    }
    if (!entry.takenAt || isNaN(Date.parse(entry.takenAt))) {
      errors.push(`Data/hora da captura da foto ${index + 1} é inválida.`);
    }
    if (entry.metadata) {
      const lat = Number(entry.metadata.latitude);
      const lng = Number(entry.metadata.longitude);
      const acc = Number(entry.metadata.accuracy);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push(`Latitude da foto ${index + 1} inválida (-90 a +90): ${lat}`);
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push(`Longitude da foto ${index + 1} inválida (-180 a +180): ${lng}`);
      }
      if (isNaN(acc) || acc <= 0) {
        errors.push(`Precisão GPS da foto ${index + 1} deve ser positiva: ${acc}`);
      }
    }
  });

  return errors;
};

export const validatePreSubmission = (rdo) => {
  const errors = [
    ...validateIdentification(rdo),
    ...validateWeather(rdo.weather),
    ...validateLabor(rdo.labor),
    ...validateEquipment(rdo.equipment),
    ...validateActivities(rdo.activities),
    ...validateMaterials(rdo.materials),
    ...validateOccurrences(rdo.occurrences),
    ...validatePhotos(rdo.photos),
  ];

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const assertPreSubmissionValid = (rdo) => {
  const result = validatePreSubmission(rdo);
  if (!result.valid) {
    throw new ValidationError(
      `Falha na validação pré-submissão do RDO: ${result.errors.join('; ')}`,
      result.errors,
    );
  }
};
