/**
 * Domain Contracts and Entities for StackLab RDO E2E Testing Suite
 * Strictly based on ORIGINAL_REQUEST.md, PROJECT.md, and TEST_INFRA.md.
 */

import crypto from 'node:crypto';

export const RDO_STATUS = {
  RASCUNHO: 'rascunho',
  SUBMETIDO: 'submetido',
  DEVOLVIDO: 'devolvido',
  APROVADO: 'aprovado',
};

export const SHIFTS = ['manha', 'tarde', 'noite'];

export const WEATHER_CONDITIONS = ['Ensolarado', 'Nublado', 'Chuvoso', 'Instável'];

export const OCCURRENCE_TYPES = ['dds', 'acidente', 'paralisacao', 'interferencia', 'pendencia', 'outro'];

export const AUDIT_ACTIONS = [
  'criado',
  'submetido',
  'devolvido',
  'editado',
  'comentado',
  'aprovado',
  'retificado',
];

export const RDO_SECTIONS = [
  'identificacao',
  'maoDeObra',
  'equipamentos',
  'atividades',
  'materiais',
  'ocorrencias',
  'fotos',
];

export const REVIEW_SLA_HOURS = 24;
export const MASTER_PIN = '1234';

let idSeq = 0;
export const generateId = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(idSeq++).toString(36)}`;

export const calcManHours = (labor) => {
  if (!Array.isArray(labor)) return 0;
  return labor.reduce((acc, entry) => {
    const qty = Number(entry?.quantity) || 0;
    const hrs = Number(entry?.hours) || 0;
    return acc + qty * hrs;
  }, 0);
};

export const calcHeadcount = (labor) => {
  if (!Array.isArray(labor)) return 0;
  return labor.reduce((acc, entry) => acc + (Number(entry?.quantity) || 0), 0);
};

export const isOverdue = (rdo, now = new Date()) => {
  if (rdo.status !== RDO_STATUS.SUBMETIDO || !rdo.submittedAt) return false;
  const submittedTime = new Date(rdo.submittedAt).getTime();
  const currentTime = now.getTime();
  const diffHours = (currentTime - submittedTime) / (1000 * 60 * 60);
  return diffHours > REVIEW_SLA_HOURS;
};

export const getDisplayStatus = (rdo, now = new Date()) => {
  if (isOverdue(rdo, now)) return 'atrasado';
  return rdo.status;
};

export const canCommonEdit = (rdo) => {
  return !rdo.locked && (rdo.status === RDO_STATUS.RASCUNHO || rdo.status === RDO_STATUS.DEVOLVIDO);
};

export const computeIntegrityHash = (payload) => {
  const jsonStr = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(jsonStr).digest('hex').toUpperCase();
  return `SL-${hash.slice(0, 8)}`;
};

/* --- Entity Factories --- */

export const createMockUser = (overrides = {}) => ({
  id: generateId('usr'),
  name: 'Eng. Tharles Silva',
  email: 'tharles@stacklab.com',
  role: 'Engenheiro Residente',
  crea: 'CREA-MA 987654/D',
  profile: 'common', // 'common' | 'master'
  assignedWorkIds: ['work-001'],
  active: true,
  ...overrides,
});

export const createMockWork = (overrides = {}) => ({
  id: 'work-001',
  code: 'OB-101',
  name: 'Residencial Alphaville',
  subtitle: 'Torre B — Alvenaria e Estrutura',
  client: 'Alphaville Urbanismo S.A.',
  address: 'Av. dos Holandeses, 1000 - São Luís, MA',
  active: true,
  ...overrides,
});

export const createWeatherEntry = (overrides = {}) => ({
  shift: 'manha',
  condition: 'Ensolarado',
  stoppageHours: 0,
  impact: '',
  ...overrides,
});

export const createLaborEntry = (overrides = {}) => ({
  role: 'Pedreiro',
  type: 'proprio', // 'proprio' | 'terceirizado'
  quantity: 4,
  hours: 8,
  ...overrides,
});

export const createEquipmentEntry = (overrides = {}) => ({
  name: 'Betoneira 400L',
  type: 'proprio', // 'proprio' | 'locado'
  quantity: 1,
  activeHours: 8,
  idleHours: 0,
  idleJustification: '',
  ...overrides,
});

export const createActivityEntry = (overrides = {}) => ({
  description: 'Alvenaria de vedação no 4º pavimento',
  location: 'Torre B - Pavimento 4',
  unit: 'm²',
  quantity: 45,
  progress: 25, // 0-100%
  ...overrides,
});

export const createMaterialEntry = (overrides = {}) => ({
  name: 'Cimento CP-II F 32',
  supplier: 'Votorantim Cimentos S.A.',
  invoice: 'NF-e 004812',
  quantity: 100,
  unit: 'sacos',
  ...overrides,
});

export const createOccurrenceEntry = (overrides = {}) => ({
  type: 'dds',
  description: 'DDS matinal sobre EPIs para trabalho em altura (NR-35)',
  participants: 12,
  instructor: 'Téc. João Lima',
  ...overrides,
});

export const createPhotoMetadata = (overrides = {}) => {
  const meta = {
    latitude: -2.5307,
    longitude: -44.3068,
    accuracy: 4.2,
    address: 'Av. dos Holandeses, 1000 - São Luís, MA',
    capturedAt: new Date().toISOString(),
    formattedBrasiliaTime: '29/10/2026 14:30:00',
    authorId: 'usr-001',
    authorName: 'Eng. Tharles Silva',
    workId: 'work-001',
    workName: 'Residencial Alphaville',
    workCode: 'OB-101',
    rdoNumber: 1,
    ...overrides,
  };
  const str = `${meta.workId}|${meta.authorId}|${meta.capturedAt}|${meta.latitude}|${meta.longitude}|${meta.rdoNumber || 0}`;
  const sha = crypto.createHash('sha256').update(str).digest('hex').toUpperCase();
  meta.hash = overrides.hash || `SL-${sha.slice(0, 8)}`;
  return meta;
};

export const createPhotoEntry = (overrides = {}) => {
  const photoId = generateId('photo');
  const { metadata: metaOverrides, ...restOverrides } = overrides;
  const metadata = createPhotoMetadata(metaOverrides || {});
  return {
    id: photoId,
    caption: 'Concretagem da viga V-102 no 4º pavimento',
    uri: `file:///storage/emulated/0/DCIM/Camera/${photoId}.jpg`,
    watermarkedUri: `file:///storage/emulated/0/StackLab/watermarked_${photoId}.jpg`,
    watermarkText: `[Marca d'Água]: ${metadata.formattedBrasiliaTime} • Autor: ${metadata.authorName} • Obra: ${metadata.workName}`,
    takenAt: metadata.capturedAt,
    author: metadata.authorName,
    authorId: metadata.authorId,
    metadata,
    ...restOverrides,
  };
};

export const createValidRDO = (overrides = {}) => {
  const rdoId = generateId('rdo');
  return {
    id: rdoId,
    number: 1,
    version: 1,
    previousVersionId: undefined,
    workId: 'work-001',
    workName: 'Residencial Alphaville',
    workCode: 'OB-101',
    date: new Date().toISOString().slice(0, 10),
    authorId: 'usr-001',
    authorName: 'Eng. Tharles Silva',
    status: RDO_STATUS.RASCUNHO,
    submittedAt: undefined,
    returnReason: undefined,
    weather: [
      createWeatherEntry({ shift: 'manha', condition: 'Ensolarado', stoppageHours: 0 }),
      createWeatherEntry({ shift: 'tarde', condition: 'Nublado', stoppageHours: 0 }),
    ],
    labor: [
      createLaborEntry({ role: 'Pedreiro', quantity: 4, hours: 8, type: 'proprio' }),
      createLaborEntry({ role: 'Servente', quantity: 6, hours: 8, type: 'proprio' }),
      createLaborEntry({ role: 'Eletricista', quantity: 2, hours: 8, type: 'terceirizado' }),
    ],
    equipment: [
      createEquipmentEntry({ name: 'Betoneira 400L', activeHours: 7, idleHours: 1, idleJustification: 'Aguardando entrega de agregados' }),
      createEquipmentEntry({ name: 'Grua de Torre', activeHours: 8, idleHours: 0 }),
    ],
    activities: [
      createActivityEntry({ description: 'Concretagem de pilares P12 a P16', location: '4º Pavimento', quantity: 18, unit: 'm³', progress: 50 }),
      createActivityEntry({ description: 'Instalação de tubulação de esgoto', location: '3º Pavimento', quantity: 30, unit: 'm', progress: 75 }),
    ],
    materials: [
      createMaterialEntry({ name: 'Concreto Usinado FCK 30 MPa', supplier: 'Supermix Concreto', invoice: 'NF-e 88912', quantity: 18, unit: 'm³' }),
    ],
    occurrences: [
      createOccurrenceEntry({ type: 'dds', description: 'DDS matinal sobre segurança no uso de ferramentas elétricas' }),
    ],
    photos: [
      createPhotoEntry({ caption: 'Concretagem de pilar P14 com vibração mecânica' }),
    ],
    comments: [],
    signature: undefined,
    locked: false,
    ...overrides,
  };
};
