/** "1 item" / "2 itens" — pluralização simples pt-BR. */
export const pluralize = (count: number, singular: string, plural?: string): string =>
  `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;

/** Normaliza texto para busca (minúsculas, sem acentos). */
export const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/** Verifica se algum dos campos contém o termo (ignora acento/caixa). */
export const matchesQuery = (query: string, ...fields: (string | number | undefined)[]): boolean => {
  const q = normalize(query);
  if (!q) return true;
  return fields.some((f) => f !== undefined && normalize(String(f)).includes(q));
};

/** Iniciais para avatar: "Davi Hudson" → "DH" */
export const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
