import {
  formatDate,
  formatDateTime,
  hoursSince,
  formatRelative,
  isoHoursAgo,
  parseFlexibleDate,
  isWithinTimeFilter,
  isRdoInTimeFilter,
} from '@/utils/date';

describe('utils/date', () => {
  const fixedNow = new Date(2026, 9, 17, 14, 30, 0); // 17/10/2026 14:30 local

  it('formats Date and ISO strings to dd/mm/yyyy and dd/mm/yyyy às hh:mm', () => {
    expect(formatDate(fixedNow)).toBe('17/10/2026');
    expect(formatDateTime(fixedNow)).toBe('17/10/2026 às 14:30');
  });

  it('calculates hoursSince and isoHoursAgo consistently', () => {
    const sixHoursAgo = isoHoursAgo(6, fixedNow);
    expect(hoursSince(sixHoursAgo, fixedNow)).toBeCloseTo(6, 5);
  });

  it('formats relative time in Portuguese across thresholds', () => {
    expect(formatRelative(fixedNow.toISOString(), fixedNow)).toBe('agora');

    const tenMinutesAgo = new Date(fixedNow.getTime() - 10 * 60_000).toISOString();
    expect(formatRelative(tenMinutesAgo, fixedNow)).toBe('há 10 min');

    const fiveHoursAgo = isoHoursAgo(5, fixedNow);
    expect(formatRelative(fiveHoursAgo, fixedNow)).toBe('há 5 h');

    const oneDayAgo = isoHoursAgo(25, fixedNow);
    expect(formatRelative(oneDayAgo, fixedNow)).toBe('há 1 dia');

    const threeDaysAgo = isoHoursAgo(75, fixedNow);
    expect(formatRelative(threeDaysAgo, fixedNow)).toBe('há 3 dias');
  });

  describe('parseFlexibleDate & isWithinTimeFilter', () => {
    // 31/10/2026 às 14:00
    const refNow = new Date(2026, 9, 31, 14, 0, 0);

    it('parses brazilian, ISO and Date formats correctly', () => {
      const d1 = parseFlexibleDate('31/10/2026');
      expect(d1?.getFullYear()).toBe(2026);
      expect(d1?.getMonth()).toBe(9);
      expect(d1?.getDate()).toBe(31);

      const d2 = parseFlexibleDate('2026-10-31');
      expect(d2?.getFullYear()).toBe(2026);
      expect(d2?.getMonth()).toBe(9);
      expect(d2?.getDate()).toBe(31);

      const d3 = parseFlexibleDate(refNow);
      expect(d3?.getTime()).toBe(refNow.getTime());

      expect(parseFlexibleDate('')).toBeNull();
      expect(parseFlexibleDate(null)).toBeNull();
    });

    it('filters "Hoje" correctly for current calendar day', () => {
      expect(isWithinTimeFilter('31/10/2026', 'Hoje', refNow)).toBe(true);
      expect(isWithinTimeFilter('2026-10-31T10:00:00.000Z', 'Hoje', refNow)).toBe(true);
      // Ontem não está em "Hoje"
      expect(isWithinTimeFilter('30/10/2026', 'Hoje', refNow)).toBe(false);
    });

    it('filters "7 Dias" correctly', () => {
      expect(isWithinTimeFilter('31/10/2026', '7 Dias', refNow)).toBe(true);
      expect(isWithinTimeFilter('25/10/2026', '7 Dias', refNow)).toBe(true);
      // 10 dias atrás está fora de 7 dias
      expect(isWithinTimeFilter('20/10/2026', '7 Dias', refNow)).toBe(false);
    });

    it('filters "15 Dias" correctly', () => {
      expect(isWithinTimeFilter('20/10/2026', '15 Dias', refNow)).toBe(true);
      // 20 dias atrás está fora de 15 dias
      expect(isWithinTimeFilter('10/10/2026', '15 Dias', refNow)).toBe(false);
    });

    it('filters "1 Mês" correctly (últimos 30 dias)', () => {
      expect(isWithinTimeFilter('10/10/2026', '1 Mês', refNow)).toBe(true);
      expect(isWithinTimeFilter('02/10/2026', '1 Mês', refNow)).toBe(true);
      // 40 dias atrás está fora de 1 mês
      expect(isWithinTimeFilter('15/09/2026', '1 Mês', refNow)).toBe(false);
    });

    it('evaluates isRdoInTimeFilter using submittedAt fallback to date', () => {
      const rdoToday = { date: '31/10/2026', submittedAt: '2026-10-31T12:00:00.000Z' };
      const rdoOld = { date: '01/09/2026' };

      expect(isRdoInTimeFilter(rdoToday, 'Hoje', refNow)).toBe(true);
      expect(isRdoInTimeFilter(rdoOld, 'Hoje', refNow)).toBe(false);
      expect(isRdoInTimeFilter(rdoOld, '1 Mês', refNow)).toBe(false);
    });
  });
});
