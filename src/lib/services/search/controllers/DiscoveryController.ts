import type { SearchFilters, SearchResult } from '../types';
import { searchService } from '../SearchService';
import { recentSearchesService } from '../services/RecentSearchesService';

export class DiscoveryController {
  async discover(filters: SearchFilters): Promise<SearchResult[]> {
    if (filters.query.trim()) {
      recentSearchesService.addSearchQuery(filters.query);
    }

    const rawResults = await searchService.searchAll(
      filters.query,
      filters.categories
    );

    // Apply Sorting Strategies
    const sorted = [...rawResults];
    if (filters.sort === 'date_desc') {
      sorted.reverse();
    } else if (filters.sort === 'date_asc') {
      // Retain natural order or sort ascending
    }

    return sorted;
  }
}

export const discoveryController = new DiscoveryController();
