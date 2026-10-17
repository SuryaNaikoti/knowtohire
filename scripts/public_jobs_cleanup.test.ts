import { test, describe } from 'node:test';
import assert from 'node:assert';
import { jobService } from '../src/services/jobService.ts';

describe('Public Job Listings Clean Launch State Verification Tests', () => {
  test('public job queries must return zero job listings in clean launch state', async () => {
    const res = await jobService.getPublishedJobs({ pageSize: 50 });
    assert.strictEqual(res.error, null, 'Expected error to be null');
    assert.ok(res.data, 'Expected res.data to exist');

    const jobs = res.data?.data || [];
    assert.strictEqual(jobs.length, 0, `Expected 0 published jobs in clean launch state, but found ${jobs.length}`);
  });

  test('deleted job IDs must return proper NOT_FOUND state without fallback', async () => {
    const deletedJobIds = [
      'ef8b9628-9167-498a-bb5a-f467f78fa9ab',
      '84215ee4-886e-4f56-9b01-f2d5c69bb5e6',
      '59536f27-cf1f-4b74-94d3-96d83b418cfd',
      '88a75359-c0fd-46a8-839e-ee0e16e6fc5e',
      'job-1',
      'job-2',
    ];

    for (const jobId of deletedJobIds) {
      const singleRes = await jobService.getPublishedJobById(jobId);
      assert.strictEqual(singleRes.data, null, `Job ${jobId} should not return any data`);
      assert.ok(singleRes.error, `Job ${jobId} should return an error object`);
      assert.strictEqual(singleRes.error?.code, 'NOT_FOUND', `Job ${jobId} should return NOT_FOUND`);
    }
  });

  test('employer job lookup for deleted job must return NOT_FOUND', async () => {
    const singleRes = await jobService.getEmployerJobById('88a75359-c0fd-46a8-839e-ee0e16e6fc5e');
    assert.strictEqual(singleRes.data, null, 'Deleted job should not return employer data');
    assert.strictEqual(singleRes.error?.code, 'NOT_FOUND');
  });
});
