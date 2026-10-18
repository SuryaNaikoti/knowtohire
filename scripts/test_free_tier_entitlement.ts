import { subscriptionEntitlementService, PLAN_LIMITS } from '../src/services/subscriptionEntitlementService';

async function runTest() {
  console.log('Testing Free Tier Subscription Entitlements:');
  console.log('PLAN_LIMITS.free:', PLAN_LIMITS.free);

  if (PLAN_LIMITS.free.maxActiveJobs !== 2) {
    throw new Error(`Expected maxActiveJobs to be 2, got ${PLAN_LIMITS.free.maxActiveJobs}`);
  }

  const postJobCheck = await subscriptionEntitlementService.hasFeature('post_job');
  console.log('Feature post_job:', postJobCheck);
  if (!postJobCheck.allowed) {
    throw new Error('Expected post_job to be allowed on free tier');
  }

  const atsCheck = await subscriptionEntitlementService.hasFeature('ats_pipeline');
  console.log('Feature ats_pipeline:', atsCheck);
  if (atsCheck.allowed) {
    throw new Error('Expected ats_pipeline to be blocked on free tier');
  }

  const analyticsCheck = await subscriptionEntitlementService.hasFeature('analytics');
  console.log('Feature analytics:', analyticsCheck);
  if (analyticsCheck.allowed) {
    throw new Error('Expected analytics to be blocked on free tier');
  }

  const canPost = await subscriptionEntitlementService.canPostJob();
  console.log('canPostJob result:', canPost);
  if (!canPost.canPost) {
    throw new Error('Expected canPost to be true for new free tier employer');
  }
  if (canPost.maxAllowed !== 2) {
    throw new Error(`Expected maxAllowed to be 2, got ${canPost.maxAllowed}`);
  }

  console.log('\nAll Free Tier Entitlement verification tests passed successfully!');
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
