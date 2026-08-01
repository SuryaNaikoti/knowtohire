import type { SearchResult } from '../types';

export class RankingEngine {
  rank(query: string, items: SearchResult[]): SearchResult[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return items;

    return items
      .map((item) => ({
        ...item,
        score: this.computeDeterministicScore(cleanQuery, item),
      }))
      .sort((a, b) => b.score - a.score);
  }

  private computeDeterministicScore(query: string, item: SearchResult): number {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();

    // 1. Exact Title Match (+100)
    if (titleLower === query) score += 100;
    // 2. Title Starts With (+60)
    else if (titleLower.startsWith(query)) score += 60;
    // 3. Title Keyword Match (+40)
    else if (titleLower.includes(query)) score += 40;

    // 4. Description Keyword Match (+15)
    if (descLower.includes(query)) score += 15;

    // 5. Highlights Boost (+10)
    if (item.highlights && item.highlights.some((h) => h.toLowerCase().includes(query))) {
      score += 10;
    }

    return score;
  }
}

export const rankingEngine = new RankingEngine();
