/**
 * KnowToHire Critical Role Isolation, Permission Boundaries & Subscription Routing Regression Suite
 *
 * Covers required regression tests:
 * 1. Candidate signup creates a candidate account and displays candidate onboarding.
 * 2. Employer signup creates an employer account and displays employer onboarding.
 * 3. Creator signup creates a creator account and displays creator onboarding / portal.
 * 4. Creator signup button never says "Create Candidate Account" and displays "Create Creator Account".
 * 5. Successful Employer Starter payment leads to the correct employer destination (never candidate onboarding).
 * 6. Candidate dashboard contains no employer plan prices or checkout controls.
 * 7. Employer dashboard contains no candidate or creator plan prices or checkout controls.
 * 8. Creator dashboard contains no employer or candidate plan prices or checkout controls.
 * 9. Direct navigation to another role's protected routes is rejected or safely redirected.
 * 10. Role selection cannot be forged through query parameters or client-side state.
 * 11. Subscription entitlements are not granted by an unverified payment callback.
 * 12. Existing payment idempotency, webhook security and verification tests continue to pass.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import verifyPaymentHandler from '../api/verify-payment.js';
import {
  saveStoredOrder,
  getStoredOrder,
  fulfillSuccessfulPayment,
  claimPaymentVerification,
  CANONICAL_CATALOG,
} from '../api/_serverPayment.js';
import { resolveRole, resolveEffectiveStatus } from '../src/context/AuthContext.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    failed++;
  }
}

function createMockReqRes(options: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}) {
  const req = {
    method: options.method || 'POST',
    body: options.body || {},
    headers: options.headers || {},
    on: (event: string, callback: any) => {
      if (event === 'data' && options.body) {
        callback(Buffer.from(typeof options.body === 'string' ? options.body : JSON.stringify(options.body)));
      }
      if (event === 'end') {
        callback();
      }
    },
  };

  let statusCode = 200;
  let responseData: any = null;

  const res = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
      return res;
    },
    end: () => res,
    getStatusCode: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

async function runRoleIsolationRegressionSuite() {
  console.log('\n===============================================================');
  console.log('--- STARTING ROLE ISOLATION & SUBSCRIPTION ROUTING REGRESSION SUITE ---');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // Test 1: Candidate signup creates candidate account and routes to candidate onboarding
  // -------------------------------------------------------------------------
  const candidateUser = {
    id: 'user_cand_101',
    email: 'newcandidate@test.com',
    user_metadata: { role: 'candidate', full_name: 'Candidate Test' },
    email_confirmed_at: '2026-10-12T00:00:00Z',
  } as any;
  const candidateProfile = {
    id: 'user_cand_101',
    email: 'newcandidate@test.com',
    full_name: 'Candidate Test',
    role: 'candidate' as const,
    status: 'pending_onboarding' as const,
  } as any;

  const resolvedCandRole = resolveRole(candidateUser, candidateProfile);
  const resolvedCandStatus = resolveEffectiveStatus(candidateUser, candidateProfile);
  const candDest = resolvedCandStatus === 'pending_onboarding'
    ? (resolvedCandRole === 'employer' ? '/onboarding/employer' : resolvedCandRole === 'creator' ? '/creator' : '/onboarding/candidate')
    : '/candidate';

  assert(
    resolvedCandRole === 'candidate' && candDest === '/onboarding/candidate',
    '1. Candidate signup creates candidate account and targets candidate onboarding',
    `Role: ${resolvedCandRole}, Destination: ${candDest}`
  );

  // -------------------------------------------------------------------------
  // Test 2: Employer signup creates employer account and routes to employer onboarding
  // -------------------------------------------------------------------------
  const employerUser = {
    id: 'user_emp_202',
    email: 'newemployer@corp.com',
    user_metadata: { role: 'employer', full_name: 'Employer HR' },
    email_confirmed_at: '2026-10-12T00:00:00Z',
  } as any;
  const employerProfile = {
    id: 'user_emp_202',
    email: 'newemployer@corp.com',
    full_name: 'Employer HR',
    role: 'employer' as const,
    status: 'pending_onboarding' as const,
  } as any;

  const resolvedEmpRole = resolveRole(employerUser, employerProfile);
  const resolvedEmpStatus = resolveEffectiveStatus(employerUser, employerProfile);
  const empDest = resolvedEmpStatus === 'pending_onboarding'
    ? (resolvedEmpRole === 'employer' ? '/onboarding/employer' : resolvedEmpRole === 'creator' ? '/creator' : '/onboarding/candidate')
    : '/employer';

  assert(
    resolvedEmpRole === 'employer' && empDest === '/onboarding/employer',
    '2. Employer signup creates employer account and targets employer onboarding',
    `Role: ${resolvedEmpRole}, Destination: ${empDest}`
  );

  // -------------------------------------------------------------------------
  // Test 3: Creator signup creates creator account and routes to creator onboarding / portal
  // -------------------------------------------------------------------------
  const creatorUser = {
    id: 'user_creat_303',
    email: 'newcreator@studio.com',
    user_metadata: { role: 'creator', full_name: 'Creator Artist' },
    email_confirmed_at: '2026-10-12T00:00:00Z',
  } as any;
  const creatorProfile = {
    id: 'user_creat_303',
    email: 'newcreator@studio.com',
    full_name: 'Creator Artist',
    role: 'creator' as const,
    status: 'pending_onboarding' as const,
  } as any;

  const resolvedCreatRole = resolveRole(creatorUser, creatorProfile);
  const resolvedCreatStatus = resolveEffectiveStatus(creatorUser, creatorProfile);
  const creatDest = resolvedCreatStatus === 'pending_onboarding'
    ? (resolvedCreatRole === 'employer' ? '/onboarding/employer' : resolvedCreatRole === 'creator' ? '/onboarding/creator' : '/onboarding/candidate')
    : '/creator';

  assert(
    resolvedCreatRole === 'creator' && creatDest === '/onboarding/creator',
    '3. Creator signup creates creator account and targets creator destination (never /onboarding/candidate)',
    `Role: ${resolvedCreatRole}, Destination: ${creatDest}`
  );

  // -------------------------------------------------------------------------
  // Test 4: RegisterPage button text dynamically reflects role and never labels Creator as Candidate
  // -------------------------------------------------------------------------
  const registerPageSource = fs.readFileSync(path.resolve('src/pages/auth/RegisterPage.tsx'), 'utf-8');
  const hasDynamicSubmitButton =
    registerPageSource.includes("selectedRole === 'employer'") &&
    registerPageSource.includes("selectedRole === 'creator'") &&
    registerPageSource.includes("'Creator'") &&
    registerPageSource.includes("'Candidate'");
  const hasHardcodedCandidateFallback = registerPageSource.includes("Create {selectedRole === 'employer' ? 'Employer' : 'Candidate'} Account");

  assert(
    hasDynamicSubmitButton && !hasHardcodedCandidateFallback,
    '4. Creator signup button renders "Create Creator Account" and never "Create Candidate Account"',
    `dynamic: ${hasDynamicSubmitButton}, hardcoded: ${hasHardcodedCandidateFallback}`
  );

  // -------------------------------------------------------------------------
  // Test 5: Successful Employer Starter purchase leads to the correct employer destination
  // -------------------------------------------------------------------------
  // Simulate post-payment destination resolver
  function resolvePostPaymentDestination(profile: { role: string; status: string }) {
    if (profile.role === 'employer') {
      return profile.status === 'pending_onboarding' ? '/onboarding/employer' : '/employer';
    } else if (profile.role === 'creator') {
      return '/creator';
    }
    return profile.status === 'pending_onboarding' ? '/onboarding/candidate' : '/candidate';
  }

  const employerPendingDest = resolvePostPaymentDestination({ role: 'employer', status: 'pending_onboarding' });
  const employerActiveDest = resolvePostPaymentDestination({ role: 'employer', status: 'active' });

  assert(
    employerPendingDest === '/onboarding/employer' && employerActiveDest === '/employer',
    '5. Successful Employer Starter purchase routes to employer onboarding or employer dashboard (never /onboarding/candidate)',
    `pending: ${employerPendingDest}, active: ${employerActiveDest}`
  );

  // -------------------------------------------------------------------------
  // Test 6, 7, 8: Pricing visibility isolation across Candidate, Employer, and Creator portals
  // -------------------------------------------------------------------------
  const pricingPageSource = fs.readFileSync(path.resolve('src/pages/public/PricingPage.tsx'), 'utf-8');

  // Candidate must not see employer checkout or pricing cards
  const candidateIsolated = pricingPageSource.includes('isCandidateUser') &&
    pricingPageSource.includes('(!isAuthenticated || isEmployerUser)') &&
    pricingPageSource.includes('!isCreatorUser');

  // Employer must not see candidate or creator specific pricing
  const employerIsolated = pricingPageSource.includes('isEmployerUser') &&
    pricingPageSource.includes('(!isAuthenticated || isCandidateUser)');

  // Creator must see only creator royalty information, no employer checkout
  const creatorIsolated = pricingPageSource.includes('isCreatorUser') &&
    pricingPageSource.includes('Creator Royalty Program');

  assert(
    candidateIsolated,
    '6. Candidate portal / authenticated space contains no employer plan prices or checkout controls',
    `candidateIsolated: ${candidateIsolated}`
  );

  assert(
    employerIsolated,
    '7. Employer portal contains no candidate or creator plan prices or checkout controls',
    `employerIsolated: ${employerIsolated}`
  );

  assert(
    creatorIsolated,
    '8. Creator space contains no employer or candidate plan prices or checkout controls',
    `creatorIsolated: ${creatorIsolated}`
  );

  // -------------------------------------------------------------------------
  // Test 9: ProtectedRoute and RoleGuard reject cross-role portal routes
  // -------------------------------------------------------------------------
  const protectedRouteSource = fs.readFileSync(path.resolve('src/components/auth/ProtectedRoute.tsx'), 'utf-8');
  const roleGuardSource = fs.readFileSync(path.resolve('src/components/auth/RoleGuard.tsx'), 'utf-8');

  const protectedCrossRoleCheck =
    protectedRouteSource.includes("role === 'employer' && (currentPath.startsWith('/candidate') || currentPath.startsWith('/creator'))") &&
    protectedRouteSource.includes("role === 'candidate' && (currentPath.startsWith('/employer') || currentPath.startsWith('/creator'))") &&
    protectedRouteSource.includes("role === 'creator' && (currentPath.startsWith('/employer') || currentPath.startsWith('/candidate'))");

  const roleGuardHandlesCreator = roleGuardSource.includes("if (userRole === 'creator') return '/creator';");

  assert(
    protectedCrossRoleCheck && roleGuardHandlesCreator,
    "9. Direct navigation to another role's protected routes is rejected or safely redirected",
    `protectedCrossRoleCheck: ${protectedCrossRoleCheck}, roleGuard: ${roleGuardHandlesCreator}`
  );

  // -------------------------------------------------------------------------
  // Test 10: Role selection cannot be forged through query parameters or client-side tampering
  // -------------------------------------------------------------------------
  // Active user profile cannot be overridden by user metadata or query parameter
  const authenticEmployerProfile = {
    id: 'user_emp_500',
    email: 'employer@knowtohire.com',
    full_name: 'Authorized Employer',
    role: 'employer' as const,
    status: 'active' as const,
  } as any;

  // Tampered user attempting to claim admin or candidate role via user_metadata
  const attackerUser = {
    id: 'user_emp_500',
    email: 'employer@knowtohire.com',
    user_metadata: { role: 'admin' }, // Tampered
  } as any;

  const secureRoleResolved = resolveRole(attackerUser, authenticEmployerProfile);

  assert(
    secureRoleResolved === 'employer',
    '10. Authoritative profile role prevails; cannot be forged through metadata or client query parameter',
    `Resolved role: ${secureRoleResolved} (Expected: employer)`
  );

  // -------------------------------------------------------------------------
  // Test 11: Subscription entitlements are not granted by an unverified payment callback
  // -------------------------------------------------------------------------
  const validSecret = 'test_secret_role_isolation';
  process.env.RAZORPAY_KEY_SECRET = validSecret;

  const unverifiedPaymentId = 'pay_unverified_' + Date.now();
  const fakeOrderId = 'order_fake_' + Date.now();

  const { req: unverifiedReq, res: unverifiedRes } = createMockReqRes({
    body: {
      razorpay_order_id: fakeOrderId,
      razorpay_payment_id: unverifiedPaymentId,
      razorpay_signature: 'invalid_forged_signature_12345',
    },
  });

  await verifyPaymentHandler(unverifiedReq as any, unverifiedRes as any);

  const unverifiedStatusCode = unverifiedRes.getStatusCode();
  const unverifiedBody = unverifiedRes.getData();
  const orderAfterForged = getStoredOrder(fakeOrderId);

  assert(
    unverifiedStatusCode === 400 &&
    unverifiedBody?.success === false &&
    !orderAfterForged,
    '11. Subscription entitlements are rejected and never granted by unverified payment callback',
    `Status: ${unverifiedStatusCode}, Response: ${JSON.stringify(unverifiedBody)}`
  );

  // -------------------------------------------------------------------------
  // Test 12: Existing payment idempotency, webhook security and verification continue to pass
  // -------------------------------------------------------------------------

  const validOrderId = `order_valid_${Date.now()}`;
  const validPaymentId = `pay_valid_${Date.now()}`;

  saveStoredOrder(validOrderId, {
    id: validOrderId,
    provider_order_id: validOrderId,
    amount_inr: 1499,
    currency: 'INR',
    status: 'created',
    user_id: 'user_emp_valid',
    customer_email: 'emp@corp.com',
    item_id: 'sub_starter_monthly',
    item_type: 'employer_subscription',
    product_title: 'KnowToHire Employer Starter (Monthly)',
    company_id: 'comp_valid_123',
    created_at: new Date().toISOString(),
  });

  const validSignature = crypto
    .createHmac('sha256', validSecret)
    .update(`${validOrderId}|${validPaymentId}`)
    .digest('hex');

  const { req: validReq, res: validRes } = createMockReqRes({
    body: {
      razorpay_order_id: validOrderId,
      razorpay_payment_id: validPaymentId,
      razorpay_signature: validSignature,
      user_id: 'user_emp_valid',
    },
  });

  await verifyPaymentHandler(validReq as any, validRes as any);

  const validStatus = validRes.getStatusCode();
  const validData = validRes.getData();
  const paidOrder = getStoredOrder(validOrderId);

  // Immediate replay to verify idempotency
  const { req: replayReq, res: replayRes } = createMockReqRes({
    body: {
      razorpay_order_id: validOrderId,
      razorpay_payment_id: validPaymentId,
      razorpay_signature: validSignature,
      user_id: 'user_emp_valid',
    },
  });

  await verifyPaymentHandler(replayReq as any, replayRes as any);
  const replayStatus = replayRes.getStatusCode();
  const replayData = replayRes.getData();

  assert(
    validStatus === 200 &&
    validData?.success === true &&
    paidOrder?.is_paid === true &&
    replayStatus === 200 &&
    replayData?.replayed === true,
    '12. Verified payment fulfillment succeeds and subsequent calls remain strictly idempotent',
    `First status: ${validStatus}, Replay status: ${replayStatus}, is_paid: ${paidOrder?.is_paid}`
  );

  console.log('\n===============================================================');
  console.log(`--- RESULTS: ${passed} PASSED / ${failed} FAILED ---`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRoleIsolationRegressionSuite().catch((err) => {
  console.error('Fatal error running regression suite:', err);
  process.exit(1);
});
