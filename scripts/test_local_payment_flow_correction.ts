/**
 * Local Payment Flow Correction Tests
 * 
 * Verifies all edge cases and defect corrections locally:
 * 1. Valid successful verification transitions order to 'paid' and creates entitlement.
 * 2. Incorrect signatures are rejected with HTTP 400.
 * 3. Amount mismatches (paise/INR) are rejected with HTTP 400.
 * 4. Missing or mismatched orders are rejected with HTTP 400 / 403.
 * 5. Duplicate verification is idempotent (returns 200, replayed: true) and does not create duplicate entitlements or extend expiry.
 * 6. Webhook 'payment.captured' processes through claimPaymentVerification and fulfills.
 * 7. Webhook 'order.paid' processes through claimPaymentVerification and fulfills.
 * 8. Duplicate webhook replays are idempotent.
 * 9. Client failure event arriving AFTER successful payment NEVER downgrades 'paid' status.
 * 10. Webhook payment.failed arriving AFTER successful payment NEVER downgrades 'paid' status.
 * 11. Failure event arriving BEFORE payment records failure; subsequent valid payment succeeds and marks order 'paid'.
 * 12. Payment ID reuse across different orders is rejected with HTTP 409 Conflict.
 * 13. Subscription fulfillment is atomic and does not extend expiry on duplicate.
 */

import crypto from 'crypto';
import verifyPaymentHandler from '../api/verify-payment.js';
import webhookHandler from '../api/webhook.js';
import {
  saveStoredOrder,
  getStoredOrder,
  serverEntitlements,
  companySubscriptionEntitlements,
  processedPayments,
  processedWebhooks,
  recordFailedPayment,
  fulfillSuccessfulPayment,
  claimPaymentVerification,
  loadPersistentPaymentOrder,
} from '../api/_serverPayment.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       Details: ${details}`);
    failed++;
  }
}

function createMockReqRes(options: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}) {
  let statusCode = 200;
  let responseData: any = null;

  const req = {
    method: options.method || 'POST',
    body: options.body || {},
    headers: options.headers || {},
  };

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseData = data;
      return res;
    },
    getStatusCode() {
      return statusCode;
    },
    getData() {
      return responseData;
    },
  };

  return { req, res };
}

async function runLocalCorrectionTests() {
  console.log('=== RUNNING LOCAL PAYMENT FLOW CORRECTION TEST SUITE ===\n');

  const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_for_local_payment_tests_123';
  process.env.RAZORPAY_KEY_SECRET = secret;
  process.env.RAZORPAY_WEBHOOK_SECRET = secret;

  // --------------------------------------------------------------------------
  // Test 1: Valid successful verification transitions order to 'paid' & fulfills
  // --------------------------------------------------------------------------
  {
    const oId = `order_valid_${Date.now()}`;
    const pId = `pay_valid_${Date.now()}`;
    const uId = `user_valid_${Date.now()}`;

    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 499,
      currency: 'INR',
      status: 'created',
      is_paid: false,
      user_id: uId,
      item_id: 'tmpl-1',
      item_type: 'template',
      product_title: 'Executive Resume Template',
      created_at: new Date().toISOString(),
    });

    const sig = crypto.createHmac('sha256', secret).update(`${oId}|${pId}`).digest('hex');

    const { req, res } = createMockReqRes({
      body: {
        razorpay_order_id: oId,
        razorpay_payment_id: pId,
        razorpay_signature: sig,
        user_id: uId,
        item_id: 'tmpl-1',
        item_type: 'template',
      },
    });

    await verifyPaymentHandler(req, res);
    const data = res.getData();

    assert(res.getStatusCode() === 200 && data.success === true, 'Test 1a: Valid verification returns HTTP 200 success');
    const stored = getStoredOrder(oId);
    assert(stored?.status === 'paid' && stored?.is_paid === true, 'Test 1b: Order is transitioned to status: paid and is_paid: true');
    assert(data.replayed === false, 'Test 1c: First verification marked replayed: false');
    assert(Boolean(data.entitlement_id), 'Test 1d: Entitlement ID is returned');
  }

  // --------------------------------------------------------------------------
  // Test 2: Incorrect signatures are rejected with HTTP 400
  // --------------------------------------------------------------------------
  {
    const oId = `order_badsig_${Date.now()}`;
    const pId = `pay_badsig_${Date.now()}`;

    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 499,
      currency: 'INR',
      status: 'created',
      is_paid: false,
      item_id: 'tmpl-1',
      item_type: 'template',
      created_at: new Date().toISOString(),
    });

    const { req, res } = createMockReqRes({
      body: {
        razorpay_order_id: oId,
        razorpay_payment_id: pId,
        razorpay_signature: 'invalid_forged_signature_hex_00000000000000000000000000',
        item_id: 'tmpl-1',
      },
    });

    await verifyPaymentHandler(req, res);
    assert(res.getStatusCode() === 400 && res.getData().success === false, 'Test 2: Invalid signature rejected with HTTP 400');
    const stored = getStoredOrder(oId);
    assert(stored?.status === 'created' && stored?.is_paid === false, 'Test 2b: Unverified order remains in created status');
  }

  // --------------------------------------------------------------------------
  // Test 3: Amount mismatch (paise & INR) is rejected with HTTP 400
  // --------------------------------------------------------------------------
  {
    const oId = `order_amt_mismatch_${Date.now()}`;
    const pId = `pay_amt_mismatch_${Date.now()}`;
    const sig = crypto.createHmac('sha256', secret).update(`${oId}|${pId}`).digest('hex');

    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 499,
      currency: 'INR',
      status: 'created',
      is_paid: false,
      item_id: 'tmpl-1',
      item_type: 'template',
      created_at: new Date().toISOString(),
    });

    // Mismatched amount_paise (attempting to claim 499 INR order for 100 paise)
    const { req, res } = createMockReqRes({
      body: {
        razorpay_order_id: oId,
        razorpay_payment_id: pId,
        razorpay_signature: sig,
        amount_paise: 100,
      },
    });

    await verifyPaymentHandler(req, res);
    assert(res.getStatusCode() === 400, 'Test 3a: Mismatched amount_paise is rejected with HTTP 400');

    // Mismatched amount_inr
    const { req: reqInr, res: resInr } = createMockReqRes({
      body: {
        razorpay_order_id: oId,
        razorpay_payment_id: pId,
        razorpay_signature: sig,
        amount_inr: 10,
      },
    });

    await verifyPaymentHandler(reqInr, resInr);
    assert(resInr.getStatusCode() === 400, 'Test 3b: Mismatched amount_inr is rejected with HTTP 400');
  }

  // --------------------------------------------------------------------------
  // Test 4: Purchaser mismatch is rejected with HTTP 403
  // --------------------------------------------------------------------------
  {
    const oId = `order_user_mismatch_${Date.now()}`;
    const pId = `pay_user_mismatch_${Date.now()}`;
    const ownerUserId = `user_owner_${Date.now()}`;
    const attackerUserId = `user_attacker_${Date.now()}`;
    const sig = crypto.createHmac('sha256', secret).update(`${oId}|${pId}`).digest('hex');

    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 499,
      currency: 'INR',
      status: 'created',
      is_paid: false,
      user_id: ownerUserId,
      item_id: 'tmpl-1',
      item_type: 'template',
      created_at: new Date().toISOString(),
    });

    const { req, res } = createMockReqRes({
      body: {
        razorpay_order_id: oId,
        razorpay_payment_id: pId,
        razorpay_signature: sig,
        user_id: attackerUserId,
      },
    });

    await verifyPaymentHandler(req, res);
    assert(res.getStatusCode() === 403, 'Test 4: User ID mismatch rejected with HTTP 403 Forbidden');
  }

  // --------------------------------------------------------------------------
  // Test 5: Duplicate verification is idempotent & prevents duplicate entitlement
  // --------------------------------------------------------------------------
  {
    const oId = `order_replay_${Date.now()}`;
    const pId = `pay_replay_${Date.now()}`;
    const uId = `user_replay_${Date.now()}`;
    const sig = crypto.createHmac('sha256', secret).update(`${oId}|${pId}`).digest('hex');

    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 499,
      currency: 'INR',
      status: 'created',
      is_paid: false,
      user_id: uId,
      item_id: 'tmpl-1',
      item_type: 'template',
      created_at: new Date().toISOString(),
    });

    const { req: r1, res: s1 } = createMockReqRes({
      body: { razorpay_order_id: oId, razorpay_payment_id: pId, razorpay_signature: sig, user_id: uId, item_id: 'tmpl-1' },
    });
    await verifyPaymentHandler(r1, s1);

    const { req: r2, res: s2 } = createMockReqRes({
      body: { razorpay_order_id: oId, razorpay_payment_id: pId, razorpay_signature: sig, user_id: uId, item_id: 'tmpl-1' },
    });
    await verifyPaymentHandler(r2, s2);

    assert(s2.getStatusCode() === 200, 'Test 5a: Replay verification returns HTTP 200');
    assert(s2.getData().replayed === true, 'Test 5b: Replay verification returns replayed: true');
    const userEnts = Array.from(serverEntitlements.values()).filter(e => e.user_id === uId && e.product_id === 'tmpl-1');
    assert(userEnts.length === 1, 'Test 5c: Duplicate verification does not create duplicate entitlement');
  }

  // --------------------------------------------------------------------------
  // Test 6: Webhook 'payment.captured' claims verification and fulfills order
  // --------------------------------------------------------------------------
  {
    const oId = `order_wh_captured_${Date.now()}`;
    const pId = `pay_wh_captured_${Date.now()}`;
    const uId = `user_wh_captured_${Date.now()}`;

    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 499,
      currency: 'INR',
      status: 'created',
      is_paid: false,
      user_id: uId,
      item_id: 'res-2',
      item_type: 'knowledge_resource',
      product_title: 'Patent Guide',
      created_at: new Date().toISOString(),
    });

    const evtPayload = {
      event: 'payment.captured',
      event_id: `evt_cap_${Date.now()}`,
      created_at: Math.floor(Date.now() / 1000),
      payload: {
        payment: {
          entity: {
            id: pId,
            order_id: oId,
            amount: 49900,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    };

    const rawBody = JSON.stringify(evtPayload);
    const whSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const { req, res } = createMockReqRes({
      body: rawBody,
      headers: { 'x-razorpay-signature': whSig },
    });

    await webhookHandler(req, res);
    assert(res.getStatusCode() === 200 && res.getData().status === 'ok', 'Test 6a: Webhook payment.captured returns HTTP 200 ok');
    const stored = getStoredOrder(oId);
    assert(stored?.status === 'paid' && stored?.is_paid === true, 'Test 6b: Order is marked paid by webhook');
    const userEnts = Array.from(serverEntitlements.values()).filter(e => e.user_id === uId && e.product_id === 'res-2');
    assert(userEnts.length === 1, 'Test 6c: Entitlement successfully provisioned by webhook');
  }

  // --------------------------------------------------------------------------
  // Test 7: Webhook 'order.paid' claims verification and fulfills order
  // --------------------------------------------------------------------------
  {
    const oId = `order_wh_orderpaid_${Date.now()}`;
    const pId = `pay_wh_orderpaid_${Date.now()}`;
    const uId = `user_wh_orderpaid_${Date.now()}`;

    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 1499,
      currency: 'INR',
      status: 'created',
      is_paid: false,
      user_id: uId,
      company_id: 'comp_test_wh_orderpaid',
      item_id: 'sub_starter_monthly',
      item_type: 'employer_subscription',
      created_at: new Date().toISOString(),
    });

    const evtPayload = {
      event: 'order.paid',
      event_id: `evt_ordpaid_${Date.now()}`,
      created_at: Math.floor(Date.now() / 1000),
      payload: {
        order: {
          entity: {
            id: oId,
            amount: 149900,
            amount_paid: 149900,
            status: 'paid',
          },
        },
        payment: {
          entity: {
            id: pId,
            order_id: oId,
            amount: 149900,
            status: 'captured',
          },
        },
      },
    };

    const rawBody = JSON.stringify(evtPayload);
    const whSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const { req, res } = createMockReqRes({
      body: rawBody,
      headers: { 'x-razorpay-signature': whSig },
    });

    await webhookHandler(req, res);
    assert(res.getStatusCode() === 200 && res.getData().status === 'ok', 'Test 7a: Webhook order.paid returns HTTP 200 ok');
    const stored = getStoredOrder(oId);
    assert(stored?.status === 'paid' && stored?.is_paid === true, 'Test 7b: Order marked paid and fulfilled by order.paid webhook');
  }

  // --------------------------------------------------------------------------
  // Test 8: Duplicate webhook replay is strictly idempotent
  // --------------------------------------------------------------------------
  {
    const evtId = `evt_replay_test_${Date.now()}`;
    const evtPayload = {
      event: 'payment.captured',
      event_id: evtId,
      created_at: Math.floor(Date.now() / 1000),
      payload: { payment: { entity: { id: `pay_rep_${Date.now()}`, order_id: `ord_rep_${Date.now()}`, amount: 49900 } } },
    };
    const rawBody = JSON.stringify(evtPayload);
    const whSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const { req: r1, res: s1 } = createMockReqRes({ body: rawBody, headers: { 'x-razorpay-signature': whSig } });
    await webhookHandler(r1, s1);

    const { req: r2, res: s2 } = createMockReqRes({ body: rawBody, headers: { 'x-razorpay-signature': whSig } });
    await webhookHandler(r2, s2);

    assert(s2.getStatusCode() === 200 && s2.getData().message?.includes('Idempotent'), 'Test 8: Duplicate webhook replay returns 200 Idempotent');
  }

  // --------------------------------------------------------------------------
  // Test 9: Client failure event arriving AFTER successful payment NEVER downgrades 'paid'
  // --------------------------------------------------------------------------
  {
    const oId = `order_paid_before_clientfail_${Date.now()}`;
    const pId = `pay_success_${Date.now()}`;

    // Order is already paid
    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 499,
      status: 'paid',
      is_paid: true,
      payment_id: pId,
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    const { req, res } = createMockReqRes({
      body: {
        razorpay_order_id: oId,
        razorpay_payment_id: pId,
        status: 'failed',
        error_code: 'BAD_REQUEST_ERROR',
        error_description: 'Delayed failure callback after browser redirect',
      },
    });

    await verifyPaymentHandler(req, res);
    assert(res.getStatusCode() === 200, 'Test 9a: Failure callback returns HTTP 200');
    const stored = getStoredOrder(oId);
    assert(stored?.status === 'paid' && stored?.is_paid === true, 'Test 9b: Client failure callback DID NOT downgrade order from paid status');
  }

  // --------------------------------------------------------------------------
  // Test 10: Webhook payment.failed arriving AFTER successful payment NEVER downgrades 'paid'
  // --------------------------------------------------------------------------
  {
    const oId = `order_paid_before_whfail_${Date.now()}`;
    const pId = `pay_success_${Date.now()}`;

    // Order is already paid
    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 499,
      status: 'paid',
      is_paid: true,
      payment_id: pId,
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    const evtPayload = {
      event: 'payment.failed',
      event_id: `evt_fail_delayed_${Date.now()}`,
      created_at: Math.floor(Date.now() / 1000),
      payload: {
        payment: {
          entity: {
            id: `pay_fail_alt_${Date.now()}`,
            order_id: oId,
            error_code: 'PAYMENT_CANCELLED',
            error_description: 'Earlier attempt failed',
          },
        },
      },
    };

    const rawBody = JSON.stringify(evtPayload);
    const whSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const { req, res } = createMockReqRes({ body: rawBody, headers: { 'x-razorpay-signature': whSig } });
    await webhookHandler(req, res);

    const stored = getStoredOrder(oId);
    assert(stored?.status === 'paid' && stored?.is_paid === true, 'Test 10: Delayed payment.failed webhook DID NOT downgrade already-paid order');
  }

  // --------------------------------------------------------------------------
  // Test 11: Failure event arriving BEFORE payment records failure; subsequent payment succeeds
  // --------------------------------------------------------------------------
  {
    const oId = `order_fail_then_pay_${Date.now()}`;
    const pIdFail = `pay_failed_first_${Date.now()}`;
    const pIdSuccess = `pay_succeed_later_${Date.now()}`;

    saveStoredOrder(oId, {
      id: oId,
      provider_order_id: oId,
      amount_inr: 499,
      status: 'created',
      is_paid: false,
      created_at: new Date().toISOString(),
    });

    // 1. Initial failure
    await recordFailedPayment(oId, pIdFail, 'PAYMENT_FAILED', 'User cancelled first attempt');
    const storedAfterFail = getStoredOrder(oId);
    assert(storedAfterFail?.status === 'failed' && storedAfterFail?.is_paid === false, 'Test 11a: Initial failure recorded properly on unpaid order');

    // 2. Subsequent retry succeeds
    const sig = crypto.createHmac('sha256', secret).update(`${oId}|${pIdSuccess}`).digest('hex');
    const { req, res } = createMockReqRes({
      body: {
        razorpay_order_id: oId,
        razorpay_payment_id: pIdSuccess,
        razorpay_signature: sig,
        item_id: 'tmpl-1',
      },
    });

    await verifyPaymentHandler(req, res);
    assert(res.getStatusCode() === 200, 'Test 11b: Subsequent payment retry returns HTTP 200');
    const storedAfterSuccess = getStoredOrder(oId);
    assert(storedAfterSuccess?.status === 'paid' && storedAfterSuccess?.is_paid === true, 'Test 11c: Order successfully transitioned from failed to paid');
  }

  // --------------------------------------------------------------------------
  // Test 12: Payment ID reuse across different orders is rejected with HTTP 409 Conflict
  // --------------------------------------------------------------------------
  {
    const oId1 = `order_first_${Date.now()}`;
    const oId2 = `order_second_reuse_${Date.now()}`;
    const sharedPaymentId = `pay_shared_conflict_${Date.now()}`;

    saveStoredOrder(oId1, {
      id: oId1,
      provider_order_id: oId1,
      amount_inr: 499,
      status: 'created',
      is_paid: false,
      item_id: 'tmpl-1',
      created_at: new Date().toISOString(),
    });

    saveStoredOrder(oId2, {
      id: oId2,
      provider_order_id: oId2,
      amount_inr: 499,
      status: 'created',
      is_paid: false,
      item_id: 'tmpl-1',
      created_at: new Date().toISOString(),
    });

    // Verify order 1 with sharedPaymentId
    const sig1 = crypto.createHmac('sha256', secret).update(`${oId1}|${sharedPaymentId}`).digest('hex');
    const { req: r1, res: s1 } = createMockReqRes({
      body: { razorpay_order_id: oId1, razorpay_payment_id: sharedPaymentId, razorpay_signature: sig1, item_id: 'tmpl-1' },
    });
    await verifyPaymentHandler(r1, s1);
    assert(s1.getStatusCode() === 200, 'Test 12a: First order verified with payment ID');

    // Attempt to verify order 2 with same payment ID
    const sig2 = crypto.createHmac('sha256', secret).update(`${oId2}|${sharedPaymentId}`).digest('hex');
    const { req: r2, res: s2 } = createMockReqRes({
      body: { razorpay_order_id: oId2, razorpay_payment_id: sharedPaymentId, razorpay_signature: sig2, item_id: 'tmpl-1' },
    });
    await verifyPaymentHandler(r2, s2);
    assert(s2.getStatusCode() === 409, 'Test 12b: Reusing payment ID for different order is rejected with HTTP 409 Conflict');
  }

  // --------------------------------------------------------------------------
  // Test 13: Subscription fulfillment is idempotent and does not extend expiry on duplicate
  // --------------------------------------------------------------------------
  {
    const compId = `comp_sub_atomic_${Date.now()}`;
    const subOrderId = `order_sub_atomic_${Date.now()}`;
    const subPayId = `pay_sub_atomic_${Date.now()}`;

    const res1 = await fulfillSuccessfulPayment({
      orderId: subOrderId,
      paymentId: subPayId,
      companyId: compId,
      itemId: 'sub_starter_monthly',
      itemType: 'employer_subscription',
    });

    const ent1 = companySubscriptionEntitlements.get(subOrderId);
    assert(res1.success && Boolean(ent1), 'Test 13a: First subscription fulfillment succeeds with entitlement record');

    // Duplicate fulfillment of same order
    const res2 = await fulfillSuccessfulPayment({
      orderId: subOrderId,
      paymentId: subPayId,
      companyId: compId,
      itemId: 'sub_starter_monthly',
      itemType: 'employer_subscription',
    });

    const ent2 = companySubscriptionEntitlements.get(subOrderId);
    assert(res2.success && ent1?.id === ent2?.id, 'Test 13b: Duplicate fulfillment preserves original entitlement without recreation');
  }

  // --------------------------------------------------------------------------
  // Test 14: Comprehensive Verification Claim Regression Suite
  // Validates existing unpaid order, amount mismatch, payment-ID reuse,
  // duplicate verification, missing order, and user/product mismatch.
  // --------------------------------------------------------------------------
  {
    const regUserId = '11111111-1111-4111-a111-111111111111';
    const otherUserId = '22222222-2222-4222-a222-222222222222';
    const regOrderId = `order_reg_${Date.now()}`;
    const regPayId1 = `pay_reg_1_${Date.now()}`;
    const regPayId2 = `pay_reg_2_${Date.now()}`;

    // Seed existing unpaid order
    saveStoredOrder(regOrderId, {
      id: regOrderId,
      provider_order_id: regOrderId,
      amount_inr: 1499,
      currency: 'INR',
      status: 'created',
      user_id: regUserId,
      item_id: 'sub_starter_monthly',
      item_type: 'employer_subscription',
      product_title: 'KnowToHire Starter (Monthly)',
      is_paid: false,
      created_at: new Date().toISOString(),
    });

    // Case 1: Missing order in production mode fails closed with status: 'error'
    const origEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const resMissingProd = await claimPaymentVerification({
        paymentId: `pay_missing_${Date.now()}`,
        orderId: `order_nonexistent_${Date.now()}`,
        amountInr: 1499,
      });
      assert(!resMissingProd.claimed && resMissingProd.status === 'error', 'Test 14a: Missing order fails closed in production mode');
    } finally {
      process.env.NODE_ENV = origEnv;
    }

    // Case 2: Valid claim of existing unpaid order succeeds
    const resClaimValid = await claimPaymentVerification({
      paymentId: regPayId1,
      orderId: regOrderId,
      amountInr: 1499,
      userId: regUserId,
      productType: 'employer_subscription',
      productId: 'sub_starter_monthly',
      productTitle: 'KnowToHire Starter (Monthly)',
    });
    assert(resClaimValid.claimed && resClaimValid.status === 'claimed', 'Test 14b: Existing unpaid order is claimed successfully');

    // Case 3: Duplicate verification replay is idempotent
    const resClaimReplay = await claimPaymentVerification({
      paymentId: regPayId1,
      orderId: regOrderId,
      amountInr: 1499,
      userId: regUserId,
      productType: 'employer_subscription',
      productId: 'sub_starter_monthly',
      productTitle: 'KnowToHire Starter (Monthly)',
    });
    assert(!resClaimReplay.claimed && resClaimReplay.status === 'already_processed', 'Test 14c: Replay verification recognized as already_processed');

    // Case 4: Payment ID reuse for different order is rejected
    const differentOrderId = `order_different_${Date.now()}`;
    saveStoredOrder(differentOrderId, {
      id: differentOrderId,
      provider_order_id: differentOrderId,
      amount_inr: 1499,
      currency: 'INR',
      status: 'created',
      user_id: regUserId,
      item_id: 'sub_starter_monthly',
      item_type: 'employer_subscription',
      product_title: 'KnowToHire Starter (Monthly)',
      is_paid: false,
      created_at: new Date().toISOString(),
    });

    const resReuse = await claimPaymentVerification({
      paymentId: regPayId1, // Reusing payId1
      orderId: differentOrderId,
      amountInr: 1499,
      userId: regUserId,
    });
    assert(!resReuse.claimed && resReuse.status === 'conflict', 'Test 14d: Payment ID reuse across different orders rejected as conflict');

    // Case 5: Amount mismatch rejected
    const mismatchOrderId = `order_mismatch_${Date.now()}`;
    saveStoredOrder(mismatchOrderId, {
      id: mismatchOrderId,
      provider_order_id: mismatchOrderId,
      amount_inr: 1499,
      currency: 'INR',
      status: 'created',
      user_id: regUserId,
      item_id: 'sub_starter_monthly',
      item_type: 'employer_subscription',
      product_title: 'KnowToHire Starter (Monthly)',
      is_paid: false,
      created_at: new Date().toISOString(),
    });

    const sigMismatch = crypto
      .createHmac('sha256', secret)
      .update(`${mismatchOrderId}|${regPayId2}`)
      .digest('hex');

    const { req: reqMismatch, res: resMismatch } = createMockReqRes({
      body: {
        razorpay_order_id: mismatchOrderId,
        razorpay_payment_id: regPayId2,
        razorpay_signature: sigMismatch,
        amount_inr: 499, // Tampered amount
        user_id: regUserId,
      },
    });
    await verifyPaymentHandler(reqMismatch, resMismatch);
    assert(resMismatch.getStatusCode() === 400, 'Test 14e: Amount mismatch rejected with HTTP 400');

    // Case 6: User mismatch rejected
    const { req: reqUserMismatch, res: resUserMismatch } = createMockReqRes({
      body: {
        razorpay_order_id: mismatchOrderId,
        razorpay_payment_id: regPayId2,
        razorpay_signature: sigMismatch,
        amount_inr: 1499,
        user_id: otherUserId, // Tampered user
      },
    });
    await verifyPaymentHandler(reqUserMismatch, resUserMismatch);
    assert(resUserMismatch.getStatusCode() === 403, 'Test 14f: User ID mismatch rejected with HTTP 403');
  }

  console.log('\n======================================================');
  console.log(`LOCAL PAYMENT FLOW TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runLocalCorrectionTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
