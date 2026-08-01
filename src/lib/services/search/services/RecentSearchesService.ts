const LOCAL_STORAGE_KEY = 'kth_recent_searches';

export class RecentSearchesService {
  getRecentSearches(): string[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addSearchQuery(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) return;

    let existing = this.getRecentSearches();
    existing = existing.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    existing.unshift(trimmed);

    // Keep max 10
    if (existing.length > 10) {
      existing = existing.slice(0, 10);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to save recent search query:', err);
    }
  }

  clearRecentSearches(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

export const recentSearchesService = new RecentSearchesService();
