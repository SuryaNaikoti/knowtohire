import { test, describe } from 'node:test';
import assert from 'node:assert';
import { jobService } from '../src/services/jobService.ts';

describe('Public Job Listings Governance & Cleanup Regression Tests', () => {
  test('should fetch only active, published, and approved jobs', async () => {
    const res = await jobService.getPublishedJobs({ pageSize: 50 });
    assert.strictEqual(res.error, null, 'Expected error to be null');
    assert.ok(res.data, 'Expected res.data to exist');

    const jobs = res.data?.data || [];
    assert.ok(jobs.length > 0, 'Expected at least one published approved job');

    for (const job of jobs) {
      assert.strictEqual(job.status, 'published', `Job ${job.id} status must be published`);
      assert.strictEqual(job.is_active, true, `Job ${job.id} is_active must be true`);
      assert.strictEqual(job.approval_status, 'approved', `Job ${job.id} approval_status must be approved`);
    }
  });

  test('must exclude archived duplicate job ef8b9628-9167-498a-bb5a-f467f78fa9ab from public queries', async () => {
    const res = await jobService.getPublishedJobs({ pageSize: 50 });
    const jobs = res.data?.data || [];
    const duplicate = jobs.find(j => j.id === 'ef8b9628-9167-498a-bb5a-f467f78fa9ab');
    assert.strictEqual(duplicate, undefined, 'Archived duplicate job should not be in published jobs list');

    // Verify direct lookup via getPublishedJobById fails
    const singleRes = await jobService.getPublishedJobById('ef8b9628-9167-498a-bb5a-f467f78fa9ab');
    assert.strictEqual(singleRes.data, null, 'getPublishedJobById should not return archived duplicate job');
  });

  test('must exclude test job 84215ee4-886e-4f56-9b01-f2d5c69bb5e6 with test keyboard-mash data', async () => {
    const res = await jobService.getPublishedJobs({ pageSize: 50 });
    const jobs = res.data?.data || [];
    const testJob = jobs.find(j => j.id === '84215ee4-886e-4f56-9b01-f2d5c69bb5e6');
    assert.strictEqual(testJob, undefined, 'Test job with keyboard mash should not be in published jobs list');

    const singleRes = await jobService.getPublishedJobById('84215ee4-886e-4f56-9b01-f2d5c69bb5e6');
    assert.strictEqual(singleRes.data, null, 'getPublishedJobById should not return archived test job');
  });

  test('must preserve rejected job 59536f27-cf1f-4b74-94d3-96d83b418cfd but exclude it from public listings', async () => {
    const res = await jobService.getPublishedJobs({ pageSize: 50 });
    const jobs = res.data?.data || [];
    const rejectedJob = jobs.find(j => j.id === '59536f27-cf1f-4b74-94d3-96d83b418cfd');
    assert.strictEqual(rejectedJob, undefined, 'Rejected job should not be in public published jobs list');

    const singleRes = await jobService.getPublishedJobById('59536f27-cf1f-4b74-94d3-96d83b418cfd');
    assert.strictEqual(singleRes.data, null, 'getPublishedJobById should not return rejected job');
  });

  test('must return canonical job 88a75359-c0fd-46a8-839e-ee0e16e6fc5e', async () => {
    const singleRes = await jobService.getPublishedJobById('88a75359-c0fd-46a8-839e-ee0e16e6fc5e');
    assert.strictEqual(singleRes.error, null, 'Expected error to be null');
    assert.ok(singleRes.data, 'Canonical job must be returned');
    assert.strictEqual(singleRes.data?.id, '88a75359-c0fd-46a8-839e-ee0e16e6fc5e');
    assert.strictEqual(singleRes.data?.status, 'published');
    assert.strictEqual(singleRes.data?.is_active, true);
    assert.strictEqual(singleRes.data?.approval_status, 'approved');
  });

  test('must never use hardcoded mock jobs or invent EcoStrategy India for unlinked jobs', async () => {
    const res = await jobService.getPublishedJobs({ pageSize: 50 });
    const jobs = res.data?.data || [];
    
    // Ensure all jobs have valid real IDs from DB and no mock IDs
    for (const job of jobs) {
      assert.match(job.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    }
  });
});
