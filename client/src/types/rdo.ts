/**
 * Ciclo de vida do RDO (máquina de estados):
 *
 *   rascunho ──submeter──▶ submetido ──aprovar──▶ aprovado ──retificar──▶ (nova versão em submetido)
 *       ▲                      │
 *       └──────corrigir────── devolvido ◀──devolver──┘
 *
 * "Atrasado" NÃO é um status persistido: é derivado (submetido há mais de 24h sem análise).
 */
export type RDOStatus = 'rascunho' | 'submetido' | 'devolvido' | 'aprovado';

/** Status exibido na interface (inclui o derivado "atrasado"). */
export type RDODisplayStatus = RDOStatus | 'atrasado';

export type RDOSectionKey =
  | 'identificacao'
  | 'maoDeObra'
  | 'equipamentos'
  | 'atividades'
  | 'materiais'
  | 'ocorrencias'
  | 'fotos';

export type Shift = 'manha' | 'tarde' | 'noite';

export interface WeatherEntry {
  shift: Shift;
  condition: string;
  /** Obrigatório quando condition = "Chuva". */
  stoppageHours?: number;
  impact?: string;
}

export interface LaborEntry {
  role: string;
  quantity: number;
  hours: number;
}

export interface EquipmentEntry {
  name: string;
  activeHours: number;
  idleHours: number;
  /** Obrigatório quando idleHours > 0. */
  idleJustification?: string;
}

export interface ActivityEntry {
  description: string;
  location: string;
  unit: string;
  quantity: number;
}

export interface MaterialEntry {
  name: string;
  supplier: string;
  invoice: string;
}

export interface OccurrenceEntry {
  type: 'dds' | 'acidente' | 'pendencia' | 'outro';
  description: string;
}

export interface PhotoEntry {
  id: string;
  caption: string;
  uri?: string;
  takenAt: string;
  author: string;
}

export interface RDOComment {
  id: string;
  section: RDOSectionKey;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export type AuditAction =
  | 'criado'
  | 'submetido'
  | 'devolvido'
  | 'editado'
  | 'comentado'
  | 'aprovado'
  | 'retificado';

/** Registro inalterável de auditoria (append-only). */
export interface AuditLogEntry {
  id: string;
  rdoId: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  timestamp: string;
  justification?: string;
  section?: RDOSectionKey;
  field?: string;
  previousValue?: string;
  newValue?: string;
}

/** Metadados capturados na assinatura do Master (validade jurídica). */
export interface SignatureMeta {
  signedById: string;
  signedByName: string;
  signedAt: string;
  ip: string;
  deviceId: string;
  hash: string;
}

export interface RDO {
  id: string;
  number: number;
  /** Versão do documento — incrementa a cada retificação. */
  version: number;
  /** id da versão anterior congelada (quando for retificação). */
  previousVersionId?: string;
  workId: string;
  workName: string;
  date: string;
  authorId: string;
  authorName: string;
  status: RDOStatus;
  submittedAt?: string;
  returnReason?: string;
  weather: WeatherEntry[];
  labor: LaborEntry[];
  equipment: EquipmentEntry[];
  activities: ActivityEntry[];
  materials: MaterialEntry[];
  occurrences: OccurrenceEntry[];
  photos: PhotoEntry[];
  comments: RDOComment[];
  signature?: SignatureMeta;
  /** Quando true, o documento está congelado (aprovado ou versão retificada). */
  locked: boolean;
}
