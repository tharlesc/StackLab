/**
 * Funções auxiliares para paginação na aplicação.
 */

export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 1;
  const size = Math.max(1, pageSize);
  return Math.max(1, Math.ceil(totalItems / size));
}

export function paginateItems<T>(items: readonly T[], page: number, pageSize: number): T[] {
  if (!items || items.length === 0) return [];
  const size = Math.max(1, pageSize);
  const totalPages = getTotalPages(items.length, size);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * size;
  return items.slice(startIndex, startIndex + size);
}

export type PageIndicator = number | 'ellipsis';

export function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible = 5,
): PageIndicator[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Se estiver próximo do início
  if (currentPage <= 3) {
    return [1, 2, 3, 'ellipsis', totalPages];
  }

  // Se estiver próximo do final
  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }

  // No meio
  return [1, 'ellipsis', currentPage, 'ellipsis', totalPages];
}

export function getItemRangeLabel(
  currentPage: number,
  pageSize: number,
  totalItems: number,
  itemName = 'obras',
): string {
  if (totalItems <= 0) {
    return `Nenhuma ${getSingular(itemName)}`;
  }

  const singular = getSingular(itemName);
  const plural = getPlural(itemName);

  if (totalItems === 1) {
    return `Mostrando 1 de 1 ${singular}`;
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  if (start >= end) {
    return `Mostrando ${end} de ${totalItems} ${plural}`;
  }

  return `Mostrando ${start}–${end} de ${totalItems} ${plural}`;
}

function getSingular(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower === 'obras' || lower === 'obra') return 'obra';
  if (lower === 'rdos' || lower === 'rdo') return 'RDO';
  if (lower === 'itens' || lower === 'item') return 'item';
  return name.endsWith('s') ? name.slice(0, -1) : name;
}

function getPlural(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower === 'obras' || lower === 'obra') return 'obras';
  if (lower === 'rdos' || lower === 'rdo') return 'RDOs';
  if (lower === 'itens' || lower === 'item') return 'itens';
  return name.endsWith('s') ? name : `${name}s`;
}
