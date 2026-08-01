import type { SavedSearch, SearchFilters } from '../types';

const STORAGE_KEY = 'kth_saved_searches';

export class SavedSearchesService {
  getSavedSearches(userId: string): SavedSearch[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveSearch(
    userId: string,
    name: string,
    filters: SearchFilters,
    frequency: 'instant' | 'daily' | 'weekly' = 'daily'
  ): SavedSearch {
    const existing = this.getSavedSearches(userId);
    const newSavedSearch: SavedSearch = {
      id: crypto.randomUUID(),
      userId,
      name,
      filters,
      frequency,
      notificationsEnabled: true,
      createdAt: new Date().toISOString(),
    };

    existing.unshift(newSavedSearch);
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to persist saved search:', err);
    }
    return newSavedSearch;
  }

  deleteSavedSearch(userId: string, id: string): void {
    const existing = this.getSavedSearches(userId);
    const filtered = existing.filter((s) => s.id !== id);
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to delete saved search:', err);
    }
  }
}

export const savedSearchesService = new SavedSearchesService();
