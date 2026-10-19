import {
  isOverdue,
  getDisplayStatus,
  sortByReviewPriority,
  RDO_STATUS_META,
  formatRdoLabel,
  calcManHours,
  calcHeadcount,
  canCommonEdit,
  rdoMatchesQuery,
} from '@/utils/rdo';
import { isoHoursAgo } from '@/utils/date';
import type { RDO } from '@/types';

const fixedNow = new Date('2026-10-17T12:00:00.000Z');

const createMockRdo = (overrides: Partial<RDO> = {}): RDO => ({
  id: 'rdo-1',
  number: 185,
  version: 1,
  workId: 'work-1',
  workName: 'Sede StackLab',
  date: '17/10/2026',
  status: 'submetido',
  authorId: 'user-common-1',
  authorName: 'Davi Hudson',
  submittedAt: isoHoursAgo(5, fixedNow),
  weather: [{ shift: 'manha', condition: 'Sol' }],
  labor: [{ role: 'Pedreiro', quantity: 4, hours: 8 }],
  equipment: [],
  activities: [{ description: 'Concretagem de laje', quantity: 120, unit: 'm²', location: 'Bloco A' }],
  materials: [{ name: 'Cimento CP-II', supplier: 'Votorantim', invoice: 'NF-100' }],
  occurrences: [{ type: 'dds', description: 'Trabalho em altura' }],
  photos: [],
  comments: [],
  locked: false,
  ...overrides,
});

describe('utils/rdo', () => {
  describe('isOverdue & getDisplayStatus', () => {
    it('identifies RDO submitted over 24h ago as overdue', () => {
      const overdueRdo = createMockRdo({
        status: 'submetido',
        submittedAt: isoHoursAgo(26, fixedNow),
      });
      expect(isOverdue(overdueRdo, fixedNow)).toBe(true);
      expect(getDisplayStatus(overdueRdo, fixedNow)).toBe('atrasado');
    });

    it('keeps RDO submitted within 24h as submetido', () => {
      const recentRdo = createMockRdo({
        status: 'submetido',
        submittedAt: isoHoursAgo(12, fixedNow),
      });
      expect(isOverdue(recentRdo, fixedNow)).toBe(false);
      expect(getDisplayStatus(recentRdo, fixedNow)).toBe('submetido');
    });

    it('never marks non-submitted RDOs as overdue even with old submittedAt', () => {
      const approvedRdo = createMockRdo({
        status: 'aprovado',
        submittedAt: isoHoursAgo(72, fixedNow),
      });
      expect(isOverdue(approvedRdo, fixedNow)).toBe(false);
      expect(getDisplayStatus(approvedRdo, fixedNow)).toBe('aprovado');
    });
  });

  describe('sortByReviewPriority', () => {
    it('orders overdue RDOs first, then oldest submittedAt first', () => {
      const recent = createMockRdo({ id: 'recent', submittedAt: isoHoursAgo(2, fixedNow) });
      const olderWithinSla = createMockRdo({ id: 'older', submittedAt: isoHoursAgo(18, fixedNow) });
      const overdueRecent = createMockRdo({ id: 'overdue-30h', submittedAt: isoHoursAgo(30, fixedNow) });
      const overdueOldest = createMockRdo({ id: 'overdue-48h', submittedAt: isoHoursAgo(48, fixedNow) });

      const sorted = sortByReviewPriority(
        [recent, overdueRecent, olderWithinSla, overdueOldest],
        fixedNow,
      );

      expect(sorted.map((r) => r.id)).toEqual([
        'overdue-48h',
        'overdue-30h',
        'older',
        'recent',
      ]);
    });
  });

  describe('RDO_STATUS_META & formatRdoLabel', () => {
    it('provides canonical glossary labels and variants for all display statuses', () => {
      expect(RDO_STATUS_META.rascunho).toEqual({ label: 'Rascunho', variant: 'info' });
      expect(RDO_STATUS_META.submetido).toEqual({ label: 'Submetido', variant: 'warning' });
      expect(RDO_STATUS_META.devolvido).toEqual({ label: 'Devolvido', variant: 'error' });
      expect(RDO_STATUS_META.aprovado).toEqual({ label: 'Aprovado', variant: 'success' });
      expect(RDO_STATUS_META.atrasado).toEqual({ label: 'Atrasado', variant: 'error' });
    });

    it('formats RDO label with date, number, and status', () => {
      expect(formatRdoLabel('Aprovado', '27/09/2026', 184)).toBe('27/09/2026 Nº184 - Aprovado');
      expect(formatRdoLabel('Sem registros')).toBe('Sem registros');
    });
  });

  describe('calcManHours, calcHeadcount, canCommonEdit & rdoMatchesQuery', () => {
    it('calculates total man-hours and headcount accurately', () => {
      const labor = [
        { role: 'Pedreiro', quantity: 4, hours: 8 },
        { role: 'Servente', quantity: 2, hours: 9 },
      ];
      expect(calcManHours(labor)).toBe(50);
      expect(calcHeadcount(labor)).toBe(6);
    });

    it('allows common profile to edit only unlocked rascunho or devolvido RDOs', () => {
      expect(canCommonEdit({ status: 'rascunho', locked: false })).toBe(true);
      expect(canCommonEdit({ status: 'devolvido', locked: false })).toBe(true);
      expect(canCommonEdit({ status: 'submetido', locked: false })).toBe(false);
      expect(canCommonEdit({ status: 'aprovado', locked: true })).toBe(false);
      expect(canCommonEdit({ status: 'rascunho', locked: true })).toBe(false);
    });

    it('matches RDO fields and canonical status glossary in global search', () => {
      const rdo = createMockRdo({ status: 'aprovado' });
      expect(rdoMatchesQuery(rdo, 'Concretagem')).toBe(true);
      expect(rdoMatchesQuery(rdo, 'Aprovado')).toBe(true);
      expect(rdoMatchesQuery(rdo, 'Inexistente')).toBe(false);
    });
  });
});
