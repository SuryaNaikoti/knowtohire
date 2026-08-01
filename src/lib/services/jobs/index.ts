import { jobRegistry } from './JobRegistry';
import { jobSchedulerService } from './JobSchedulerService';
import { SavedSearchAlertWorker } from './workers/SavedSearchAlertWorker';
import { DigestEmailWorker } from './workers/DigestEmailWorker';
import { AnalyticsAggregationWorker } from './workers/AnalyticsAggregationWorker';

// Register Core Background Job Workers
jobRegistry.register(new SavedSearchAlertWorker());
jobRegistry.register(new DigestEmailWorker());
jobRegistry.register(new AnalyticsAggregationWorker());

// Start Scheduler
jobSchedulerService.startAll();

export * from './types';
export * from './JobRegistry';
export * from './JobDispatcher';
export * from './JobSchedulerService';
