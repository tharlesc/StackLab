import {
  formatDate,
  formatDateTime,
  hoursSince,
  formatRelative,
  isoHoursAgo,
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
});
