import { useMemo } from 'react';

export function useRankedResults(items = [], query = '') {
  return useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const normalizedQuery = String(query || '').toLowerCase().trim();

    if (!normalizedQuery) {
      return [...items];
    }

    return [...items].sort((a, b) => {
      const aText = `${a?.name || ''} ${a?.title || ''} ${a?.category || ''}`.toLowerCase();
      const bText = `${b?.name || ''} ${b?.title || ''} ${b?.category || ''}`.toLowerCase();

      const aMatch = aText.includes(normalizedQuery) ? 1 : 0;
      const bMatch = bText.includes(normalizedQuery) ? 1 : 0;

      return bMatch - aMatch;
    });
  }, [items, query]);
}

export default useRankedResults;
