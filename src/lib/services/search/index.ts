import { searchService } from './SearchService';
import { JobsSearchProvider, BlogSearchProvider } from './providers/Providers';

// Register core domain providers
searchService.registerProvider(new JobsSearchProvider());
searchService.registerProvider(new BlogSearchProvider());

export * from './types';
export * from './SearchService';
export * from './providers/Providers';
export * from './services/RecentSearchesService';
export * from './services/SavedSearchesService';
export * from './controllers/DiscoveryController';
export * from './ranking/RankingEngine';
export * from './ranking/AIReranker';
