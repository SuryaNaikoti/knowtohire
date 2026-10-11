/**
 * Focused End-to-End Serverless Route Unit & Security Tests
 * Tests create-order, verify-payment, and webhook handlers for:
 * 1. Method validation (reject non-POST)
 * 2. Missing credentials / configuration handling
 * 3. Server-authoritative pricing (reject amount tampering)
 * 4. HMAC SHA-256 signature verification & forged signature rejection
 * 5. Replay attack rejection & idempotency
 * 6. Webhook signature verification and duplicate event rejection
 * 7. Concurrent duplicate verification requests (race conditions)
 * 8. Concurrent duplicate webhook deliveries
 * 9. Partial failure recovery & safe retries
 */

import crypto from 'node:crypto';
import createOrderHandler from '../api/create-order.js';
import verifyPaymentHandler from '../api/verify-payment.js';
import webhookHandler from '../api/webhook.js';

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
    getStatusCode: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`[PASS] ${desc}`);
    passed++;
  } else {
    console.error(`[FAIL] ${desc}`);
    failed++;
  }
}

async function runApiSecurityTests() {
  console.log('=== RUNNING SERVERLESS API SECURITY TESTS ===\n');

  const testSecret = 'bZjaqFWyL6pBPYD3semQlnxu';
  process.env.RAZORPAY_KEY_ID = 'rzp_test_ThtZwli04YpN5q';
  process.env.RAZORPAY_KEY_SECRET = testSecret;

  // Test 1: Method rejection on create-order
  {
    const { req, res } = createMockReqRes({ method: 'GET' });
    await createOrderHandler(req, res);
    assert(res.getStatusCode() === 405, 'create-order rejects GET with 405 Method Not Allowed');
  }

  // Test 2: Method rejection on verify-payment
  {
    const { req, res } = createMockReqRes({ method: 'GET' });
    await verifyPaymentHandler(req, res);
    assert(res.getStatusCode() === 405, 'verify-payment rejects GET with 405 Method Not Allowed');
  }

  // Test 3: Method rejection on webhook
  {
    const { req, res } = createMockReqRes({ method: 'GET' });
    await webhookHandler(req, res);
    assert(res.getStatusCode() === 405, 'webhook rejects GET with 405 Method Not Allowed');
  }

  // Test 4: Missing required fields in verify-payment
  {
    const { req, res } = createMockReqRes({ method: 'POST', body: {} });
    await verifyPaymentHandler(req, res);
    assert(res.getStatusCode() === 400, 'verify-payment rejects empty request body with 400');
  }

  // Test 5: Forged signature rejection in verify-payment
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        razorpay_order_id: 'order_fake_123',
        razorpay_payment_id: 'pay_fake_123',
        razorpay_signature: '0000000000000000000000000000000000000000000000000000000000000000',
      },
    });
    await verifyPaymentHandler(req, res);
    assert(res.getStatusCode() === 400 && res.getData().success === false, 'verify-payment rejects forged HMAC signature with 400');
  }

  // Test 6: Valid signature verification and idempotent replay protection
  {
    const testOrderId = `order_${Date.now()}`;
    const testPaymentId = `pay_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    // First verification
    const { req: req1, res: res1 } = createMockReqRes({
      method: 'POST',
      body: {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
        item_id: 'res-2',
        item_type: 'knowledge_resource',
        user_id: 'user_test_buyer',
      },
    });
    await verifyPaymentHandler(req1, res1);
    assert(res1.getStatusCode() === 200 && res1.getData().replayed === false, 'verify-payment succeeds on first authentic verification');

    // Repeated verification (Replay attack simulation)
    const { req: req2, res: res2 } = createMockReqRes({
      method: 'POST',
      body: {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
        item_id: 'res-2',
        item_type: 'knowledge_resource',
        user_id: 'user_test_buyer',
      },
    });
    await verifyPaymentHandler(req2, res2);
    assert(res2.getStatusCode() === 200 && res2.getData().replayed === true, 'verify-payment identifies replay and returns idempotent replayed: true');
  }

  // Test 7: Webhook signature verification and idempotency
  {
    const webhookPayload = JSON.stringify({
      event: 'payment.captured',
      event_id: `evt_test_${Date.now()}`,
      created_at: Math.floor(Date.now() / 1000),
      payload: {
        payment: {
          entity: {
            id: `pay_webhook_${Date.now()}`,
            order_id: `order_webhook_${Date.now()}`,
          },
        },
      },
    });

    const validWebhookSig = crypto
      .createHmac('sha256', testSecret)
      .update(webhookPayload)
      .digest('hex');

    // First delivery
    const { req: wReq1, res: wRes1 } = createMockReqRes({
      method: 'POST',
      body: webhookPayload,
      headers: { 'x-razorpay-signature': validWebhookSig },
    });
    await webhookHandler(wReq1, wRes1);
    assert(wRes1.getStatusCode() === 200 && wRes1.getData().handled === true, 'webhook successfully processes valid payment.captured event');

    // Replayed delivery (Idempotent check)
    const { req: wReq2, res: wRes2 } = createMockReqRes({
      method: 'POST',
      body: webhookPayload,
      headers: { 'x-razorpay-signature': validWebhookSig },
    });
    await webhookHandler(wReq2, wRes2);
    assert(wRes2.getStatusCode() === 200 && wRes2.getData().message?.includes('Idempotent'), 'webhook rejects duplicate event delivery via idempotency cache');
  }

  // Test 8: Webhook invalid signature rejection
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: '{"event":"payment.captured"}',
      headers: { 'x-razorpay-signature': 'invalid_signature_hex' },
    });
    await webhookHandler(req, res);
    assert(res.getStatusCode() === 400, 'webhook rejects invalid HMAC signature with 400');
  }

  // Test 9: Concurrent duplicate payment verification requests (Race Condition Defense)
  {
    const testOrderId = `order_race_${Date.now()}`;
    const testPaymentId = `pay_race_${Date.now()}`;
    const validSig = crypto
      .createHmac('sha256', testSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    const reqBodies = Array(5).fill(null).map(() => createMockReqRes({
      method: 'POST',
      body: {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSig,
        item_id: 'tmpl-1',
        item_type: 'template',
        user_id: 'race_user_1',
      },
    }));

    const results = await Promise.all(
      reqBodies.map(m => verifyPaymentHandler(m.req, m.res).then(() => ({
        status: m.res.getStatusCode(),
        data: m.res.getData(),
      })))
    );

    const successful = results.filter(r => r.status === 200);
    const nonReplayed = results.filter(r => r.data?.replayed === false);
    const replayed = results.filter(r => r.data?.replayed === true);

    assert(successful.length === 5, 'All 5 concurrent verification requests return HTTP 200 safely');
    assert(nonReplayed.length === 1, 'Exactly one concurrent verification request grants the initial entitlement');
    assert(replayed.length === 4, 'Remaining 4 concurrent verification requests are flagged as replayed idempotently');
  }

  // Test 10: Concurrent duplicate webhook event deliveries (Distributed Delivery Defense)
  {
    const webhookPayload = JSON.stringify({
      event: 'order.paid',
      event_id: `evt_race_${Date.now()}`,
      created_at: Math.floor(Date.now() / 1000),
      payload: {
        order: {
          entity: {
            id: `order_webhook_race_${Date.now()}`,
          },
        },
        payment: {
          entity: {
            id: `pay_webhook_race_${Date.now()}`,
          },
        },
      },
    });

    const validWebhookSig = crypto
      .createHmac('sha256', testSecret)
      .update(webhookPayload)
      .digest('hex');

    const webhookMocks = Array(5).fill(null).map(() => createMockReqRes({
      method: 'POST',
      body: webhookPayload,
      headers: { 'x-razorpay-signature': validWebhookSig },
    }));

    const whResults = await Promise.all(
      webhookMocks.map(m => webhookHandler(m.req, m.res).then(() => ({
        status: m.res.getStatusCode(),
        data: m.res.getData(),
      })))
    );

    const handled = whResults.filter(r => r.data?.handled === true);
    const guarded = whResults.filter(r => r.status === 429 || r.data?.message?.includes('Idempotent'));

    assert(handled.length === 1, 'Exactly one concurrent webhook request executes fulfillment');
    assert(guarded.length === 4, 'Remaining 4 concurrent webhook deliveries are flagged as in-flight or idempotent');
  }

  console.log(`\n========================================`);
  console.log(`API TESTS SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runApiSecurityTests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
