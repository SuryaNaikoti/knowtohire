import type {
  SearchResult,
  SearchProvider,
  SearchEntityType,
  SearchAnalyticsEvent,
} from './types';
import { rankingEngine } from './ranking/RankingEngine';
import { aiReranker } from './ranking/AIReranker';

export class SearchService {
  private providers: Map<SearchEntityType, SearchProvider> = new Map();
  private analyticsLogs: SearchAnalyticsEvent[] = [];

  registerProvider(provider: SearchProvider): void {
    this.providers.set(provider.type, provider);
  }

  async searchAll(
    query: string,
    targetTypes?: SearchEntityType[],
    enableAIReranking = true
  ): Promise<SearchResult[]> {
    const startTime = Date.now();
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) return [];

    const activeProviders = Array.from(this.providers.values()).filter((p) =>
      !targetTypes || targetTypes.length === 0 ? true : targetTypes.includes(p.type)
    );

    const providerPromises = activeProviders.map((p) =>
      p.search(cleanQuery).catch((err) => {
        console.error(`[SearchService] Provider ${p.type} failed:`, err);
        return [] as SearchResult[];
      })
    );

    const resultsArray = await Promise.all(providerPromises);
    const combined = resultsArray.flat();

    // Stage 1: Deterministic Baseline Ranking Engine
    let ranked = rankingEngine.rank(cleanQuery, combined);

    // Stage 2: Optional AI Reranking Pipeline
    if (enableAIReranking) {
      ranked = await aiReranker.rerank(cleanQuery, ranked);
    }

    // Analytics Tracking
    this.analyticsLogs.push({
      query: cleanQuery,
      totalResults: ranked.length,
      latencyMs: Date.now() - startTime,
    });

    return ranked;
  }

  getAnalyticsLogs(): SearchAnalyticsEvent[] {
    return [...this.analyticsLogs];
  }
}

export const searchService = new SearchService();
