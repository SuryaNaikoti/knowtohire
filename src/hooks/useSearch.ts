import { useState, useEffect, useCallback } from 'react';
import { discoveryController } from '../lib/services/search';
import type { SearchResult, SearchEntityType, SortOption } from '../lib/services/search/types';

export function useSearch(initialQuery = '', debounceMs = 250) {
  const [query, setQuery] = useState(initialQuery);
  const [targetTypes, setTargetTypes] = useState<SearchEntityType[]>([]);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const executeSearch = useCallback(async (
    searchQuery: string,
    types: SearchEntityType[],
    sortOption: SortOption
  ) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await discoveryController.discover({
        query: searchQuery,
        categories: types,
        sort: sortOption,
      });
      setResults(res);
    } catch (err) {
      console.error('useSearch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query, targetTypes, sort);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, targetTypes, sort, debounceMs, executeSearch]);

  return {
    query,
    setQuery,
    targetTypes,
    setTargetTypes,
    sort,
    setSort,
    results,
    loading,
  };
}
