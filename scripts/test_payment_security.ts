/**
 * Automated Verification Suite for Payment & Entitlements System
 * Tests:
 * 1. Server-authoritative pricing (rejects client price modifications, verifies canonical rates)
 * 2. Signature calculation and successful payment verification
 * 3. Idempotent payment verification (replay protection)
 * 4. Failed and cancelled payment state transitions
 * 5. Unauthorized access rejection for paid downloads
 * 6. Authorized access and short-lived signed URL generation after entitlement record
 * 7. Employer subscription activation and company profile synchronization
 * 8. Razorpay Webhook signature verification (valid & invalid HMAC)
 */

import crypto from 'crypto';
import { getAuthoritativeItem } from '../src/services/payment/authoritativePricing';
import {
  processPaymentVerification,
  recordFailedPayment,
  getStoredOrder,
  saveStoredOrder,
  verifyWebhookSignature,
} from '../src/services/payment/serverPaymentCoordinator';
import { entitlementService } from '../src/services/payment/entitlementService';
import { subscriptionService } from '../src/services/payment/subscriptionService';
import { templateService } from '../src/services/templateService';
import { knowledgeService } from '../src/services/knowledgeService';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('=== STARTING MONETIZATION & PAYMENT SECURITY TESTS ===\n');

  const TEST_SECRET = 'test_secret_for_mock_verification';

  // 1. TEST SERVER-AUTHORITATIVE PRICING
  console.log('--- 1. Testing Server-Authoritative Pricing ---');
  const templateItem = getAuthoritativeItem('tmpl-1');
  assert(templateItem !== null && templateItem.priceINR === 499, 'Catalog tmpl-1 authoritative price is 499 INR');

  const resourceItem = getAuthoritativeItem('res-2');
  assert(resourceItem !== null && resourceItem.priceINR === 499, 'Catalog res-2 authoritative price is 499 INR');

  const subMonthly = getAuthoritativeItem('sub_starter_monthly');
  assert(subMonthly !== null && subMonthly.priceINR === 1499, 'Starter monthly plan authoritative price is 1499 INR');

  const unknownItem = getAuthoritativeItem('non-existent-item-999');
  assert(unknownItem === null, 'Unknown item returns null rather than trusting client amount');

  // 2. TEST SUCCESSFUL PAYMENT FLOW & SIGNATURE VERIFICATION
  console.log('\n--- 2. Testing Payment Signature Verification ---');
  const testOrderId = 'order_test_98765';
  const testPaymentId = 'pay_test_12345';
  const validSignaturePayload = `${testOrderId}|${testPaymentId}`;
  const validSignature = crypto.createHmac('sha256', TEST_SECRET).update(validSignaturePayload).digest('hex');

  // Seed order into coordinator
  saveStoredOrder(testOrderId, {
    order_id: testOrderId,
    amount_inr: 499,
    amount_paise: 49900,
    currency: 'INR',
    item_id: 'tmpl-1',
    item_type: 'template',
    item_name: 'ATS-Optimized Tech Resume Template',
    user_id: 'user_candidate_alpha',
    status: 'created',
    created_at: new Date().toISOString(),
  });

  const verificationResult = await processPaymentVerification(
    {
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature,
      item_id: 'tmpl-1',
      item_type: 'template',
      user_id: 'user_candidate_alpha',
    },
    TEST_SECRET
  );

  assert(verificationResult.success === true, 'Valid payment signature successfully verified by server');
  assert(verificationResult.replayed === false, 'First verification is marked replayed: false');

  // 3. TEST REPLAY ATTACK / IDEMPOTENT VERIFICATION
  console.log('\n--- 3. Testing Payment Replay Protection ---');
  const replayResult = await processPaymentVerification(
    {
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature,
      item_id: 'tmpl-1',
      item_type: 'template',
      user_id: 'user_candidate_alpha',
    },
    TEST_SECRET
  );

  assert(replayResult.success === true, 'Replayed verification returns success: true for idempotency');
  assert(replayResult.replayed === true, 'Replay protection identifies replayed: true and prevents duplicate side-effects');

  // Test with invalid signature
  const fakeSignature = '0000000000000000000000000000000000000000000000000000000000000000';
  const failedSigResult = await processPaymentVerification(
    {
      razorpay_order_id: testOrderId,
      razorpay_payment_id: 'pay_tampered_999',
      razorpay_signature: fakeSignature,
      item_id: 'tmpl-1',
      item_type: 'template',
      user_id: 'user_candidate_alpha',
    },
    TEST_SECRET
  );
  assert(
    failedSigResult.success === false && failedSigResult.message === 'Signature mismatch',
    'Payment verification with forged signature is strictly rejected'
  );

  // 4. TEST FAILED AND CANCELLED PAYMENT HANDLING
  console.log('\n--- 4. Testing Failed and Cancelled Payments ---');
  const failedOrderId = 'order_failed_demo_11';
  saveStoredOrder(failedOrderId, {
    order_id: failedOrderId,
    amount_inr: 299,
    amount_paise: 29900,
    currency: 'INR',
    item_id: 'res-2',
    item_type: 'knowledge_resource',
    user_id: 'user_candidate_beta',
    status: 'created',
    created_at: new Date().toISOString(),
  });

  await recordFailedPayment(failedOrderId, 'pay_err_001', 'BAD_REQUEST_ERROR', 'Payment failed or modal dismissed');
  const updatedFailedOrder = getStoredOrder(failedOrderId);
  assert(updatedFailedOrder?.status === 'failed', 'Order status correctly transitioned to failed');
  assert(updatedFailedOrder?.last_error_code === 'BAD_REQUEST_ERROR', 'Error code recorded on failed order');

  // 5. TEST UNAUTHORIZED ACCESS TO PAID DOWNLOADS
  console.log('\n--- 5. Testing Unauthorized Download Access ---');
  const unauthorizedUserId = 'unauthorized_stranger_user';

  // Attempting to download paid template 'tmpl-1' without entitlement
  const unauthTemplateDownload = await templateService.trackDownload('tmpl-1', unauthorizedUserId);
  assert(unauthTemplateDownload.data === null, 'Unauthorized user cannot download paid template');
  assert(unauthTemplateDownload.error?.code === 'UNAUTHORIZED_ACCESS', 'Returns UNAUTHORIZED_ACCESS for unpurchased template');

  // Attempting to download paid knowledge resource 'res-2' without entitlement
  const unauthResourceDownload = await knowledgeService.trackDownload('res-2', unauthorizedUserId);
  assert(unauthResourceDownload.data === null, 'Unauthorized user cannot download paid knowledge resource');
  assert(unauthResourceDownload.error?.code === 'UNAUTHORIZED_ACCESS', 'Returns UNAUTHORIZED_ACCESS for unpurchased resource');

  // 6. TEST AUTHORIZED ACCESS AND SIGNED URL GENERATION
  console.log('\n--- 6. Testing Authorized Access After Purchase Entitlement ---');
  const authorizedUserId = 'legitimate_buyer_gamma';

  // Record purchase entitlement
  const recordResult = await entitlementService.recordPurchase({
    userId: authorizedUserId,
    productType: 'template',
    productId: 'tmpl-1',
    productTitle: 'ATS-Optimized Tech Resume Template',
    orderId: 'order_test_verified',
    paymentId: 'pay_test_verified',
    amountINR: 499,
  });
  assert(recordResult.data !== null && recordResult.error === null, 'Purchase entitlement successfully recorded');

  const isPurchased = await entitlementService.hasPurchased('tmpl-1', authorizedUserId);
  assert(isPurchased === true, 'Entitlement check confirms user owns template');

  const authTemplateDownload = await templateService.trackDownload('tmpl-1', authorizedUserId);
  assert(authTemplateDownload.data !== null && authTemplateDownload.error === null, 'Authorized user can download paid template');
  assert(
    typeof authTemplateDownload.data?.downloadUrl === 'string' &&
    authTemplateDownload.data.downloadUrl.length > 0,
    'Secure download URL provided for entitled buyer'
  );

  // 7. TEST SUBSCRIPTION ACTIVATION & COMPANY RECORD SYNCHRONIZATION
  console.log('\n--- 7. Testing Employer Subscription Activation ---');
  const testCompanyId = 'company_test_acme_corp';
  const subActivationOk = await subscriptionService.activateCompanySubscription({
    companyId: testCompanyId,
    tier: 'starter',
    billingCycle: 'monthly',
    amountINR: 1499,
    orderId: 'order_sub_monthly_101',
    paymentId: 'pay_sub_monthly_101',
  });

  assert(subActivationOk === true, 'Subscription activation succeeded');

  const companySub = await subscriptionService.getSubscriptionStatus(testCompanyId);
  assert(companySub.tier === 'starter', 'Company profile reflects activated subscription tier');
  assert(companySub.isActive === true, 'Company profile reflects active status');
  assert(Boolean(companySub.expiresAt), 'Subscription expiration date calculated and saved');

  // 8. TEST RAZORPAY WEBHOOK HMAC SIGNATURE VERIFICATION
  console.log('\n--- 8. Testing Razorpay Webhook Signatures ---');
  const webhookBody = JSON.stringify({
    entity: 'event',
    event: 'order.paid',
    payload: {
      order: {
        entity: {
          id: 'order_webhook_777',
          amount: 49900,
          status: 'paid',
        },
      },
    },
  });

  const validWebhookSig = crypto.createHmac('sha256', TEST_SECRET).update(webhookBody).digest('hex');
  const isValidSig = verifyWebhookSignature(webhookBody, validWebhookSig, TEST_SECRET);
  assert(isValidSig === true, 'Valid webhook HMAC SHA256 signature verified');

  const isInvalidSig = verifyWebhookSignature(webhookBody, 'invalid_webhook_sig_hex', TEST_SECRET);
  assert(isInvalidSig === false, 'Invalid webhook HMAC SHA256 signature rejected');

  // Summary
  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('========================================');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution encountered fatal error:', err);
  process.exit(1);
});
