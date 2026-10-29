import {
  getTotalPages,
  paginateItems,
  getVisiblePages,
  getItemRangeLabel,
} from '@/utils/pagination';

describe('utils/pagination', () => {
  describe('getTotalPages', () => {
    it('calculates total pages correctly', () => {
      expect(getTotalPages(0, 3)).toBe(1);
      expect(getTotalPages(1, 3)).toBe(1);
      expect(getTotalPages(3, 3)).toBe(1);
      expect(getTotalPages(4, 3)).toBe(2);
      expect(getTotalPages(6, 3)).toBe(2);
      expect(getTotalPages(7, 3)).toBe(3);
    });

    it('handles negative or invalid values gracefully', () => {
      expect(getTotalPages(-5, 3)).toBe(1);
      expect(getTotalPages(10, 0)).toBe(10);
      expect(getTotalPages(10, -1)).toBe(10);
    });
  });

  describe('paginateItems', () => {
    const items = ['obra1', 'obra2', 'obra3', 'obra4', 'obra5', 'obra6', 'obra7'];

    it('returns 3 items for page 1', () => {
      const page1 = paginateItems(items, 1, 3);
      expect(page1).toEqual(['obra1', 'obra2', 'obra3']);
    });

    it('returns 3 items for page 2', () => {
      const page2 = paginateItems(items, 2, 3);
      expect(page2).toEqual(['obra4', 'obra5', 'obra6']);
    });

    it('returns 1 item for page 3', () => {
      const page3 = paginateItems(items, 3, 3);
      expect(page3).toEqual(['obra7']);
    });

    it('clamps out of bounds page numbers safely', () => {
      const clampedLow = paginateItems(items, 0, 3);
      expect(clampedLow).toEqual(['obra1', 'obra2', 'obra3']);

      const clampedHigh = paginateItems(items, 99, 3);
      expect(clampedHigh).toEqual(['obra7']);
    });

    it('handles empty arrays without crashing', () => {
      expect(paginateItems([], 1, 3)).toEqual([]);
    });
  });

  describe('getVisiblePages', () => {
    it('returns [1] when totalPages <= 1', () => {
      expect(getVisiblePages(1, 1)).toEqual([1]);
    });

    it('returns all pages when totalPages <= 5', () => {
      expect(getVisiblePages(1, 3)).toEqual([1, 2, 3]);
      expect(getVisiblePages(2, 4)).toEqual([1, 2, 3, 4]);
      expect(getVisiblePages(3, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles ellipsis when totalPages > 5', () => {
      expect(getVisiblePages(1, 7)).toEqual([1, 2, 3, 'ellipsis', 7]);
      expect(getVisiblePages(4, 7)).toEqual([1, 'ellipsis', 4, 'ellipsis', 7]);
      expect(getVisiblePages(7, 7)).toEqual([1, 'ellipsis', 5, 6, 7]);
    });
  });

  describe('getItemRangeLabel', () => {
    it('formats range labels in Portuguese accurately', () => {
      expect(getItemRangeLabel(1, 3, 7, 'obras')).toBe('Mostrando 1–3 de 7 obras');
      expect(getItemRangeLabel(2, 3, 7, 'obras')).toBe('Mostrando 4–6 de 7 obras');
      expect(getItemRangeLabel(3, 3, 7, 'obras')).toBe('Mostrando 7 de 7 obras');
      expect(getItemRangeLabel(1, 3, 1, 'obras')).toBe('Mostrando 1 de 1 obra');
      expect(getItemRangeLabel(1, 3, 0, 'obras')).toBe('Nenhuma obra');
    });
  });
});
