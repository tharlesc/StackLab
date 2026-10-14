/** Utilitários puros de data/hora (pt-BR). Sem dependências externas. */

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO → "dd/mm/aaaa" */
export const formatDate = (iso: string | Date): string => {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** ISO → "dd/mm/aaaa às hh:mm" */
export const formatDateTime = (iso: string | Date): string => {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return `${formatDate(d)} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Horas decorridas desde a data informada. */
export const hoursSince = (iso: string, now: Date = new Date()): number =>
  (now.getTime() - new Date(iso).getTime()) / 36e5;

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
