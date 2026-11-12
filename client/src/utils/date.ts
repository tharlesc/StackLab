/** Utilitários puros de data/hora (pt-BR). Sem dependências externas. */

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO ou DD/MM/AAAA → "dd/mm/aaaa" */
export const formatDate = (iso?: string | Date | null): string => {
  if (!iso) return '—';
  if (typeof iso === 'string') {
    const trimmed = iso.trim();
    const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const [, d, m, y] = brMatch;
      return `${pad(Number(d))}/${pad(Number(m))}/${y}`;
    }
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}/${m}/${y}`;
    }
  }
  const d = parseFlexibleDate(iso);
  if (!d) return '—';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** ISO ou DD/MM/AAAA → "dd/mm/aaaa às hh:mm" */
export const formatDateTime = (iso?: string | Date | null): string => {
  if (!iso) return '—';
  const d = parseFlexibleDate(iso);
  if (!d) return '—';
  return `${formatDate(d)} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Horas decorridas desde a data informada. */
export const hoursSince = (iso?: string | null, now: Date = new Date()): number => {
  if (!iso) return 0;
  const d = parseFlexibleDate(iso);
  if (!d) return 0;
  return (now.getTime() - d.getTime()) / 36e5;
};

/** "há 5 min", "há 3 h", "há 2 dias" */
export const formatRelative = (iso: string, now: Date = new Date()): string => {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 6e4);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} dia${days > 1 ? 's' : ''}`;
};

/** ISO de N horas atrás (útil para mocks e testes). */
export const isoHoursAgo = (hours: number, now: Date = new Date()): string =>
  new Date(now.getTime() - hours * 36e5).toISOString();

/**
 * Converte strings em formato brasileiro (DD/MM/YYYY), ISO (YYYY-MM-DD ou completo) ou Date em um objeto Date seguro.
 */
export const parseFlexibleDate = (input?: string | Date | null): Date | null => {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  const str = String(input).trim();
  if (!str) return null;

  // Formato brasileiro: DD/MM/YYYY ou DD/MM/YYYY HH:mm...
  const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    const timeMatch = str.match(/(\d{1,2}):(\d{2})/);
    const hour = timeMatch ? Number(timeMatch[1]) : 12;
    const min = timeMatch ? Number(timeMatch[2]) : 0;
    return new Date(Number(y), Number(m) - 1, Number(d), hour, min, 0);
  }

  // Formato ISO simples: YYYY-MM-DD
  const isoDateOnlyMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDateOnlyMatch) {
    const [, y, m, d] = isoDateOnlyMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
  }

  // Formato ISO completo ou padrão Date
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Verifica se uma data recai dentro do período especificado pelo filtro do dashboard:
 * 'Hoje', '7 Dias', '15 Dias', '1 Mês' (insensível a maiúsculas/minúsculas).
 */
export const isWithinTimeFilter = (
  dateInput: string | Date | null | undefined,
  filter: string,
  referenceDate: Date = new Date(),
): boolean => {
  const d = parseFlexibleDate(dateInput);
  if (!d) return false;

  const normalized = filter.trim().toLowerCase();

  // Início e fim do dia atual de referência
  const startOfToday = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0,
    0,
    0,
    0,
  );
  const endOfToday = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    23,
    59,
    59,
    999,
  );

  if (normalized === 'hoje') {
    return d >= startOfToday && d <= endOfToday;
  }

  if (normalized.includes('7')) {
    const start = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate() - 7,
      0,
      0,
      0,
      0,
    );
    return d >= start && d <= endOfToday;
  }

  if (normalized.includes('15')) {
    const start = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate() - 15,
      0,
      0,
      0,
      0,
    );
    return d >= start && d <= endOfToday;
  }

  if (normalized.includes('mês') || normalized.includes('mes') || normalized.includes('30')) {
    const start = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate() - 30,
      0,
      0,
      0,
      0,
    );
    return d >= start && d <= endOfToday;
  }

  return true;
};

/**
 * Avalia se um RDO (via submittedAt ou date) atende ao filtro de período selecionado.
 */
export const isRdoInTimeFilter = (
  rdo: { date?: string; submittedAt?: string },
  filter: string,
  referenceDate?: Date,
): boolean => {
  return isWithinTimeFilter(rdo.submittedAt || rdo.date, filter, referenceDate);
};
