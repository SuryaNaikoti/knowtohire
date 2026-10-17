/**
 * Test: Verify that jobService.getPublishedJobs and getPublishedJobById NEVER return mock jobs,
 * and fail gracefully with zero results or proper error objects when DB returns empty/error.
 */
import { jobService } from '../src/services/jobService.js';
import { MOCK_JOBS } from '../src/data/mockData.js';

async function testPublishedJobsNoMock() {
  console.log('Testing jobService.getPublishedJobs()...');

  const res = await jobService.getPublishedJobs({ pageSize: 50, sort_by: 'latest' });
  if (res.error) {
    console.error('getPublishedJobs returned error:', res.error);
    process.exit(1);
  }

  const jobs = res.data?.data || [];
  console.log(`Fetched ${jobs.length} published jobs from real database.`);

  const mockIds = new Set(MOCK_JOBS.map(m => m.id));
  const mockTitles = new Set(MOCK_JOBS.map(m => m.title.toLowerCase()));
  const mockCompanies = new Set([
    'tata cleantech capital',
    'reliance new energy & tech',
    'veritas esg advisory india',
    'enterprise cloud solutions india',
    'ecostrategy india',
  ]);

  for (const job of jobs) {
    if (mockIds.has(job.id)) {
      throw new Error(`VIOLATION: Found mock job ID '${job.id}' in getPublishedJobs results!`);
    }
    const comp = (job.company?.name || '').toLowerCase();
    if (mockCompanies.has(comp)) {
      throw new Error(`VIOLATION: Found fictional company '${comp}' in getPublishedJobs results!`);
    }
  }

  console.log('✅ No mock jobs found in getPublishedJobs results.');

  // Test getPublishedJobById on a known mock job ID
  console.log('Testing getPublishedJobById on mock ID "job-esg-head"...');
  const mockLookup = await jobService.getPublishedJobById('job-esg-head');
  if (mockLookup.data) {
    throw new Error('VIOLATION: getPublishedJobById returned mock job data!');
  }
  console.log('✅ Mock job ID correctly returned null / 404 (not found).');

  // Test getPublishedJobById on real DB job
  if (jobs.length > 0) {
    const realId = jobs[0].id;
    console.log(`Testing getPublishedJobById on real DB job ID: ${realId}...`);
    const realLookup = await jobService.getPublishedJobById(realId);
    if (!realLookup.data || realLookup.data.id !== realId) {
      throw new Error(`Failed to lookup real job by ID: ${realId}`);
    }
    console.log(`✅ Real job fetched successfully: "${realLookup.data.title}" at "${realLookup.data.company?.name}"`);
  }

  console.log('\nAll mock job isolation tests PASSED successfully.');
}

testPublishedJobsNoMock().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
