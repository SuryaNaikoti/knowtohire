import type { SearchResult } from '../types';

export class AIReranker {
  async rerank(
    query: string,
    results: SearchResult[],
    userContext?: { role?: string; preferredDomain?: string }
  ): Promise<SearchResult[]> {
    if (results.length === 0 || !query.trim()) return results;

    // Simulate AI Semantic Reranking with User Context Personalization
    return results.map((item) => {
      let aiBoost = 0;
      if (userContext?.preferredDomain && item.description.toLowerCase().includes(userContext.preferredDomain.toLowerCase())) {
        aiBoost += 15;
      }
      return {
        ...item,
        score: item.score + aiBoost,
      };
    }).sort((a, b) => b.score - a.score);
  }
}

export const aiReranker = new AIReranker();
