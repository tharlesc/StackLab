import type { RDO, RDODisplayStatus, RDOSectionKey, StatusVariant, LaborEntry } from '@/types';
import { hoursSince } from './date';
import { matchesQuery } from './text';

/** SLA de análise do Master (horas) — após isso o RDO é exibido como "Atrasado". */
export const REVIEW_SLA_HOURS = 24;

export const RDO_STATUS_META: Record<RDODisplayStatus, { label: string; variant: StatusVariant }> = {
  rascunho: { label: 'Rascunho', variant: 'info' },
  submetido: { label: 'Submetido', variant: 'warning' },
  devolvido: { label: 'Devolvido', variant: 'error' },
  aprovado: { label: 'Aprovado', variant: 'success' },
  atrasado: { label: 'Atrasado', variant: 'error' },
};

export const RDO_SECTION_LABELS: Record<RDOSectionKey, string> = {
  identificacao: 'Identificação e Clima',
  maoDeObra: 'Mão de Obra',
  equipamentos: 'Equipamentos',
  atividades: 'Atividades',
  materiais: 'Materiais',
  ocorrencias: 'Ocorrências e DDS',
  fotos: 'Registro Fotográfico',
};

/** Submetido há mais de 24h sem análise. */
export const isOverdue = (rdo: Pick<RDO, 'status' | 'submittedAt'>, now: Date = new Date()): boolean =>
  rdo.status === 'submetido' && !!rdo.submittedAt && hoursSince(rdo.submittedAt, now) > REVIEW_SLA_HOURS;

/** Status para exibição (deriva "atrasado"). */
export const getDisplayStatus = (rdo: Pick<RDO, 'status' | 'submittedAt'>, now?: Date): RDODisplayStatus =>
  isOverdue(rdo, now) ? 'atrasado' : rdo.status;

/** Ordena a Inbox: atrasados primeiro, depois submetidos mais antigos. */
export const sortByReviewPriority = <T extends Pick<RDO, 'status' | 'submittedAt'>>(rdos: T[], now?: Date): T[] =>
  [...rdos].sort((a, b) => {
    const overdueDiff = Number(isOverdue(b, now)) - Number(isOverdue(a, now));
    if (overdueDiff !== 0) return overdueDiff;
    return (a.submittedAt ?? '').localeCompare(b.submittedAt ?? '');
  });

/** "27/09/2026 Nº184 - Validado" */
export const formatRdoLabel = (status: string, date?: string, number?: number | null): string =>
  date && number != null ? `${date} Nº${number} - ${status}` : status;

/** Homem-hora total da equipe. */
export const calcManHours = (labor: LaborEntry[]): number =>
  labor.reduce((acc, l) => acc + l.quantity * l.hours, 0);

export const calcHeadcount = (labor: LaborEntry[]): number => labor.reduce((acc, l) => acc + l.quantity, 0);

/** Busca global em todos os campos relevantes do RDO. */
export const rdoMatchesQuery = (rdo: RDO, query: string): boolean =>
  matchesQuery(
    query,
    rdo.number,
    rdo.workName,
    rdo.authorName,
    rdo.date,
    ...rdo.activities.map((a) => `${a.description} ${a.location}`),
    ...rdo.occurrences.map((o) => o.description),
    ...rdo.materials.map((m) => `${m.name} ${m.supplier}`),
  );

/** O Operacional só edita rascunhos próprios ou RDOs devolvidos. */
export const canCommonEdit = (rdo: Pick<RDO, 'status' | 'locked'>): boolean =>
  !rdo.locked && (rdo.status === 'rascunho' || rdo.status === 'devolvido');
