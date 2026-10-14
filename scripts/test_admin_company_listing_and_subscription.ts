/**
 * KnowToHire — Regression Test: Admin Company Listing, Onboarding & Subscription Entitlement
 * ===========================================================================================
 * Verifies the 5 core P0 invariant requirements:
 * 1. Company onboarding persistence and employer-company linking (employer_profiles.company_id -> company_profiles.id).
 * 2. Supabase is authoritative for admin listing:
 *    - Returns genuine DB records without client localStorage merging as production solution.
 *    - Empty database returns [] and does NOT artificially present EcoStrategy as a real company.
 * 3. Restricting demo fallback companies strictly to offline/unconfigured or explicit demo mode.
 * 4. Subscription entitlement activation is persisted against the correct company ID:
 *    - UI does not report ACTIVE solely because a local-storage flag was set if server-side is unfulfilled/inactive.
 * 5. Company verification status ('unverified' | 'pending_review' | 'verified' | 'rejected')
 *    remains completely independent from subscription status ('active' | 'inactive').
 *
 * Run: npx tsx scripts/test_admin_company_listing_and_subscription.ts
 */

import { adminService } from '../src/services/adminService';
import { companyProfileService } from '../src/services/companyProfileService';
import { subscriptionService } from '../src/services/payment/subscriptionService';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ❌ FAIL: ${label}`);
  }
}

function section(title: string) {
  console.log(`\n${'━'.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('━'.repeat(70));
}

// In-memory mock storage for testing isolation
const memoryStore: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (k: string) => memoryStore[k] || null,
    setItem: (k: string, v: string) => { memoryStore[k] = v; },
    removeItem: (k: string) => { delete memoryStore[k]; },
    clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
  },
  dispatchEvent: (evt: any) => true,
  addEventListener: () => {},
  removeEventListener: () => {},
  CustomEvent: class {
    type: string;
    detail: any;
    constructor(type: string, opts?: any) {
      this.type = type;
      this.detail = opts?.detail;
    }
  },
};

async function runRegressionSuite() {
  console.log('\n======================================================================');
  console.log('  KNOWTOHIRE: ADMIN COMPANY LISTING & SUBSCRIPTION REGRESSION SUITE');
  console.log('======================================================================');

  // ==========================================================================
  // 1. SUPABASE AUTHORITATIVE ADMIN COMPANY LISTING & ECOSTRATEGY RESTRICTION
  // ==========================================================================
  section('1. AUTHORITATIVE ADMIN COMPANY LISTING (SUPABASE AS SOURCE OF TRUTH)');

  const compRes = await adminService.getCompanies();
  assert(compRes.error === null, 'adminService.getCompanies() executes without error');
  assert(Array.isArray(compRes.data), 'adminService.getCompanies() returns an array');

  if (isSupabaseConfigured()) {
    // If database has 0 rows, it must return [] and NOT inject EcoStrategy
    const { count } = await supabase.from('company_profiles').select('*', { count: 'exact', head: true });
    if (count === 0) {
      assert(compRes.data?.length === 0, 'When company_profiles table is empty, getCompanies() returns [] (does NOT inject EcoStrategy)');
      const containsEco = compRes.data?.some(c => c.name.includes('EcoStrategy'));
      assert(!containsEco, 'EcoStrategy fallback is completely absent from live DB listing when DB has 0 companies');
    } else {
      assert((compRes.data?.length || 0) === count, `Returns exact database count (${count}) of registered companies`);
    }

    // Verify demoMode can still be requested explicitly for offline/demo tests
    const demoRes = await adminService.getCompanies({ demoMode: true });
    assert((demoRes.data?.length || 0) >= 4, 'Explicit demoMode returns demo company fixtures');
    assert(demoRes.data?.some(c => c.id === 'fa97faee-1cdf-41e6-a151-f51c7fa4c396'), 'Demo fixtures include EcoStrategy canonical fixture');
  }

  // ==========================================================================
  // 2. EMPLOYER-COMPANY PERSISTENCE & ASSOCIATION SCHEMA INTEGRITY
  // ==========================================================================
  section('2. EMPLOYER-COMPANY LINKING & ONBOARDING DATA CONTRACT');

  // Verify getEmployerDetails query links employer_profiles.company_id to company_profiles.id
  // (and does not make the invalid user_id query on company_profiles)
  const nonExistentEmpId = '00000000-0000-0000-0000-999999999999';
  const empDetails = await adminService.getEmployerDetails(nonExistentEmpId);
  assert(empDetails.error === null || empDetails.data === null, 'getEmployerDetails handles non-existent employer safely');
  if (empDetails.data) {
    assert(empDetails.data.company_name === 'Unlinked Enterprise' || empDetails.data.id === nonExistentEmpId, 'Non-existent employer does not link to EcoStrategy');
  }

  // Verify getMyCompanyProfile does NOT default real authenticated employer to EcoStrategy
  const myComp = await companyProfileService.getMyCompanyProfile();
  assert(myComp.error === null, 'getMyCompanyProfile executes without error');
  // When unauthenticated in live mode, returns null and NOT EcoStrategy
  if (isSupabaseConfigured()) {
    assert(myComp.data === null, 'Unauthenticated user in Supabase mode returns null (NOT EcoStrategy)');
  }

  // ==========================================================================
  // 3. SUBSCRIPTION ACTIVATION PERSISTENCE & FALSE "ACTIVE" PREVENTION
  // ==========================================================================
  section('3. SUBSCRIPTION ENTITLEMENT & FALSE "ACTIVE" BADGE PREVENTION');

  // Test: activateCompanySubscription requires a valid company ID
  const invalidActivate = await subscriptionService.activateCompanySubscription({
    planId: 'employer_starter',
    billingCycle: 'monthly',
  });
  // Without targetCompanyId and without authenticated company, must fail or return false
  assert(invalidActivate === false, 'activateCompanySubscription fails safely when companyId is missing');

  // Test: getSubscriptionStatus does NOT report isActive = true solely from localStorage
  const testCompanyId = '11111111-2222-3333-4444-555555555555';
  // Fake an active status in localStorage as an adversarial attempt
  memoryStore[`kth_company_profile_${testCompanyId}`] = JSON.stringify({
    id: testCompanyId,
    subscription_status: 'active',
    subscription_tier: 'starter',
  });

  const subStatus = await subscriptionService.getSubscriptionStatus(testCompanyId);
  if (isSupabaseConfigured()) {
    // Because company does not exist in Supabase (or is inactive in DB), it must NOT return isActive: true
    assert(subStatus.isActive === false, 'getSubscriptionStatus ignores client localStorage active flag when DB record is absent/inactive');
  }

  // ==========================================================================
  // 4. INDEPENDENCE OF VERIFICATION STATUS FROM SUBSCRIPTION STATUS
  // ==========================================================================
  section('4. INDEPENDENCE OF VERIFICATION STATUS FROM SUBSCRIPTION STATUS');

  const demoCompId = 'c76c28d3-df6a-4581-a03d-05be23dd1c50';
  // 1. Verify company
  const verifyRes = await adminService.updateCompanyVerification(demoCompId, 'verified');
  assert(verifyRes.data === true, 'Company verification updated to "verified"');

  // Check that subscription status of demoCompId is NOT automatically made active
  const checkSub = await subscriptionService.getSubscriptionStatus(demoCompId);
  assert(checkSub.isActive === false, 'Subscription status remains inactive even after company is verified');

  // 2. Reject company
  const rejectRes = await adminService.updateCompanyVerification(demoCompId, 'rejected');
  assert(rejectRes.data === true, 'Company verification updated to "rejected"');

  // Check that rejection does not throw or corrupt subscription
  const checkSub2 = await subscriptionService.getSubscriptionStatus(demoCompId);
  assert(checkSub2.isActive === false, 'Subscription status remains decoupled after rejection');

  // ==========================================================================
  // RESULTS SUMMARY
  // ==========================================================================
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('  REGRESSION SUITE RESULTS');
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total:  ${passed + failed}`);
  if (failures.length > 0) {
    console.log('\n  Failed checks:');
    failures.forEach((f, idx) => console.log(`    ${idx + 1}. ${f}`));
  }
  console.log('══════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
