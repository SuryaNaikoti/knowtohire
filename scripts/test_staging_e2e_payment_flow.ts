/**
 * Comprehensive Staging End-to-End Razorpay Test Mode Payment Suite
 *
 * Targets staging Supabase project: rjjmbuvsbxxlrxweslnv (knowtohire-staging)
 * Razorpay Test Keys: rzp_test_...
 *
 * Scenarios tested:
 * 1. Setup isolated synthetic employer, profile, and company on staging Supabase
 * 2. Preflight verification of endpoints and configurations
 * 3. Create Subscription Order (createOrderHandler) -> persists to staging payment_orders
 * 4. Synthetic checkout & Signature generation (Test secret HMAC)
 * 5. Verify payment (verifyPaymentHandler) -> calls claim_payment_verification + fulfill_company_subscription
 *    Confirm company_profiles subscription status becomes 'active' and company_subscription_entitlements has 1 row
 * 6. Process incoming webhook (payment.captured) -> confirms idempotent replay returns 200 without duplicate entitlement
 * 7. Replay verifyPaymentHandler -> returns 200 with replayed: true, no duplicate extension
 * 8. Replay webhookHandler -> returns 200, no duplicate extension
 * 9. Failed payment notification (status: 'failed') -> records failure, subscription remains inactive
 * 10. Invalid HMAC signature -> rejected with 400
 * 11. Payment ID reuse / mismatch -> rejected safely (409 Conflict)
 * 12. Cleanup synthetic test records completely from staging
 */

import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// Retrieve staging keys securely from Supabase CLI in structured JSON format
const keysOutput = execSync('npx supabase projects api-keys --project-ref rjjmbuvsbxxlrxweslnv -o json', { encoding: 'utf-8' });
const parsedOutput = JSON.parse(keysOutput);
const keysList: any[] = Array.isArray(parsedOutput)
  ? parsedOutput
  : Array.isArray(parsedOutput?.keys)
  ? parsedOutput.keys
  : [];

const serviceKey = keysList.find((k: any) => k.id === 'service_role' || k.name === 'service_role')?.api_key;
const anonKey = keysList.find((k: any) => k.id === 'anon' || k.name === 'anon')?.api_key;

if (!serviceKey || !anonKey) {
  throw new Error('Failed to resolve staging service_role or anon key from Supabase CLI JSON output.');
}

const STAGING_URL = 'https://rjjmbuvsbxxlrxweslnv.supabase.co';

// Overwrite process.env strictly to point to staging
process.env.VITE_SUPABASE_URL = STAGING_URL;
process.env.SUPABASE_URL = STAGING_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = serviceKey;
process.env.VITE_SUPABASE_ANON_KEY = anonKey;

// Razorpay test credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_ThtZwli04YpN5q';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'bZjaqFWyL6pBPYD3semQlnxu';
process.env.RAZORPAY_KEY_ID = RAZORPAY_KEY_ID;
process.env.RAZORPAY_KEY_SECRET = RAZORPAY_KEY_SECRET;
process.env.RAZORPAY_WEBHOOK_SECRET = RAZORPAY_KEY_SECRET; // Test fallback or shared secret

const supabaseAdmin = createClient(STAGING_URL, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Import handlers after setting process.env
const createOrderModule = await import('../api/create-order.js');
const verifyPaymentModule = await import('../api/verify-payment.js');
const webhookModule = await import('../api/webhook.js');
const serverPaymentModule = await import('../api/_serverPayment.js');

const createOrderHandler = createOrderModule.default;
const verifyPaymentHandler = verifyPaymentModule.default;
const webhookHandler = webhookModule.default;

let passed = 0;
let failed = 0;
const results: { test: string; status: 'PASS' | 'FAIL'; details?: string }[] = [];

function record(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
    results.push({ test: name, status: 'PASS' });
  } else {
    console.error(`[FAIL] ${name} -> ${details || 'Assertion failed'}`);
    failed++;
    results.push({ test: name, status: 'FAIL', details });
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
    getStatusCode: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

async function runStagingE2EValidation() {
  console.log('================================================================');
  console.log('STARTING KNOWTOHIRE RAZORPAY TEST MODE E2E VALIDATION ON STAGING');
  console.log(`Target: ${STAGING_URL} (Project: rjjmbuvsbxxlrxweslnv)`);
  console.log(`Razorpay Key Prefix: ${RAZORPAY_KEY_ID.substring(0, 8)}...`);
  console.log('================================================================\n');

  // Verify non-production safety
  record(
    'Preflight: Razorpay credentials are Test Mode keys',
    RAZORPAY_KEY_ID.startsWith('rzp_test_'),
    `Key does not start with rzp_test_: ${RAZORPAY_KEY_ID.substring(0, 8)}`
  );

  record(
    'Preflight: Staging target is rjjmbuvsbxxlrxweslnv (NOT production roqbodprqmnwxdjsskgb)',
    !STAGING_URL.includes('roqbodprqmnwxdjsskgb') && STAGING_URL.includes('rjjmbuvsbxxlrxweslnv'),
    `Target URL incorrect: ${STAGING_URL}`
  );

  // Tracking sets for synthetic records created during tests
  const trackedCompanyIds = new Set<string>();
  const trackedUserIds = new Set<string>();
  const trackedOrderIds = new Set<string>();
  const trackedEventIds = new Set<string>();

  // Setup synthetic employer & company on staging DB
  const testUserId = crypto.randomUUID();
  const testCompanyId = crypto.randomUUID();
  const testEmail = `synthetic-employer-${Date.now()}@knowtohire.staging`;

  trackedUserIds.add(testUserId);
  trackedCompanyIds.add(testCompanyId);

  let createdRazorpayOrderId = '';
  let syntheticPaymentId = `pay_test_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  let webhookEventId = `evt_test_${Date.now()}`;
  trackedEventIds.add(webhookEventId);

  try {
    console.log('\n--- Setting up synthetic employer test records on Staging ---');
    // 1. Insert into auth.users (triggers on_auth_user_created)
    const { error: userErr } = await supabaseAdmin.auth.admin.createUser({
      id: testUserId,
      email: testEmail,
      email_confirm: true,
      user_metadata: { full_name: 'Synthetic Staging Employer' },
    });
    if (userErr) throw userErr;

    // 2. Ensure profile has employer role
    const { error: profErr } = await supabaseAdmin.from('profiles').upsert({
      id: testUserId,
      email: testEmail,
      full_name: 'Synthetic Staging Employer',
      role: 'employer',
      status: 'active',
    });
    if (profErr) throw profErr;

    // 3. Insert into company_profiles
    const { error: compErr } = await supabaseAdmin.from('company_profiles').insert({
      id: testCompanyId,
      name: 'Synthetic Staging Corp',
      verification_status: 'verified',
      subscription_status: 'inactive',
    });
    if (compErr) throw compErr;

    // 4. Insert into employer_profiles
    const { error: empErr } = await supabaseAdmin.from('employer_profiles').insert({
      profile_id: testUserId,
      company_id: testCompanyId,
      is_company_admin: true,
    });
    if (empErr) throw empErr;

    record('Setup: Synthetic employer, company, and profile created on staging DB', true);
    // -------------------------------------------------------------
    // Scenario 1: Create Subscription Order via createOrderHandler
    // -------------------------------------------------------------
    console.log('\n--- Scenario 1: Create Subscription Order ---');
    {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          itemId: 'sub_starter_monthly',
          itemType: 'employer_subscription',
          userId: testUserId,
          companyId: testCompanyId,
          userEmail: testEmail,
          userName: 'Synthetic Staging Employer',
        },
      });

      await createOrderHandler(req, res);
      const data = res.getData();

      record(
        'Create Order: Returns HTTP 200 with Razorpay order',
        res.getStatusCode() === 200 && Boolean(data.order_id),
        `Status: ${res.getStatusCode()}, Response: ${JSON.stringify(data)}`
      );

      record(
        'Create Order: Authoritative server price applied (₹1499 for sub_starter_monthly)',
        data.amount === 149900 && data.amount_inr === 1499,
        `Amount: ${data.amount}`
      );

      createdRazorpayOrderId = data.order_id;
      if (createdRazorpayOrderId) {
        trackedOrderIds.add(createdRazorpayOrderId);
      }

      // Verify persistence in staging Supabase payment_orders
      const { data: dbOrder, error: dbOrderErr } = await supabaseAdmin
        .from('payment_orders')
        .select('*')
        .eq('provider_order_id', createdRazorpayOrderId)
        .single();

      record(
        'Create Order: Persisted reliably in staging payment_orders table',
        !dbOrderErr && dbOrder?.provider_order_id === createdRazorpayOrderId && dbOrder?.is_paid === false,
        `DB Error: ${dbOrderErr?.message}`
      );
    }

    // -------------------------------------------------------------
    // Scenario 2: Verify Payment with Invalid Signature (Must Fail Closed)
    // -------------------------------------------------------------
    console.log('\n--- Scenario 2: Invalid Payment Signature Rejection ---');
    {
      const badSignature = 'invalid_hmac_hex_digest_0000000000000000000000000000000000000000';
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          razorpay_order_id: createdRazorpayOrderId,
          razorpay_payment_id: syntheticPaymentId,
          razorpay_signature: badSignature,
          user_id: testUserId,
          company_id: testCompanyId,
        },
      });

      await verifyPaymentHandler(req, res);
      const data = res.getData();

      record(
        'Invalid Signature: Rejected with HTTP 400',
        res.getStatusCode() === 400 && data.success === false,
        `Status: ${res.getStatusCode()}, Response: ${JSON.stringify(data)}`
      );

      // Confirm company profile remains inactive
      const { data: comp } = await supabaseAdmin
        .from('company_profiles')
        .select('subscription_status')
        .eq('id', testCompanyId)
        .single();

      record(
        'Invalid Signature: Subscription remains inactive in staging database',
        comp?.subscription_status === 'inactive',
        `Status: ${comp?.subscription_status}`
      );
    }

    // -------------------------------------------------------------
    // Scenario 3: Verify Payment with Valid Signature
    // -------------------------------------------------------------
    console.log('\n--- Scenario 3: Valid Payment Verification & Atomic Fulfillment ---');
    let firstExpiresAt: string | null = null;
    {
      const validSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${createdRazorpayOrderId}|${syntheticPaymentId}`)
        .digest('hex');

      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          razorpay_order_id: createdRazorpayOrderId,
          razorpay_payment_id: syntheticPaymentId,
          razorpay_signature: validSignature,
          user_id: testUserId,
          company_id: testCompanyId,
        },
      });

      await verifyPaymentHandler(req, res);
      const data = res.getData();

      record(
        'Valid Payment Verification: Returns HTTP 200 with success: true',
        res.getStatusCode() === 200 && data.success === true && data.replayed === false,
        `Status: ${res.getStatusCode()}, Response: ${JSON.stringify(data)}`
      );

      // Verify database outcomes
      const { data: comp } = await supabaseAdmin
        .from('company_profiles')
        .select('*')
        .eq('id', testCompanyId)
        .single();

      firstExpiresAt = comp?.subscription_expires_at;

      record(
        'Database Verification: company_profiles.subscription_status is "active"',
        comp?.subscription_status === 'active' && comp?.subscription_tier === 'starter',
        `Status: ${comp?.subscription_status}, Tier: ${comp?.subscription_tier}`
      );

      const { data: entitlements, error: entErr } = await supabaseAdmin
        .from('company_subscription_entitlements')
        .select('*')
        .eq('company_id', testCompanyId);

      record(
        'Database Verification: Exactly 1 entitlement row created in company_subscription_entitlements',
        !entErr && entitlements?.length === 1 && entitlements[0].provider_payment_id === syntheticPaymentId,
        `Entitlements length: ${entitlements?.length}, Error: ${entErr?.message}`
      );

      const { data: paidOrder } = await supabaseAdmin
        .from('payment_orders')
        .select('*')
        .eq('provider_order_id', createdRazorpayOrderId)
        .single();

      record(
        'Database Verification: payment_orders is updated to is_paid = true and status = "paid"',
        paidOrder?.is_paid === true && paidOrder?.status === 'paid' && paidOrder?.provider_payment_id === syntheticPaymentId,
        `Status: ${paidOrder?.status}, Paid: ${paidOrder?.is_paid}`
      );
    }

    // -------------------------------------------------------------
    // Scenario 4: Replay Verification (Same Order & Payment ID)
    // -------------------------------------------------------------
    console.log('\n--- Scenario 4: Replay Payment Verification Idempotency ---');
    {
      const validSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${createdRazorpayOrderId}|${syntheticPaymentId}`)
        .digest('hex');

      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          razorpay_order_id: createdRazorpayOrderId,
          razorpay_payment_id: syntheticPaymentId,
          razorpay_signature: validSignature,
          user_id: testUserId,
          company_id: testCompanyId,
        },
      });

      await verifyPaymentHandler(req, res);
      const data = res.getData();

      record(
        'Verification Replay: Returns HTTP 200 and replayed: true',
        res.getStatusCode() === 200 && data.replayed === true,
        `Status: ${res.getStatusCode()}, Replayed: ${data.replayed}`
      );

      // Verify no duplicate entitlement created
      const { data: entitlements } = await supabaseAdmin
        .from('company_subscription_entitlements')
        .select('*')
        .eq('company_id', testCompanyId);

      record(
        'Verification Replay: No duplicate entitlement created (still exactly 1)',
        entitlements?.length === 1,
        `Entitlements length: ${entitlements?.length}`
      );

      // Verify expiry was NOT extended
      const { data: comp } = await supabaseAdmin
        .from('company_profiles')
        .select('subscription_expires_at')
        .eq('id', testCompanyId)
        .single();

      record(
        'Verification Replay: subscription_expires_at is NOT extended',
        comp?.subscription_expires_at === firstExpiresAt,
        `Original: ${firstExpiresAt}, Current: ${comp?.subscription_expires_at}`
      );
    }

    // -------------------------------------------------------------
    // Scenario 5: Webhook Processing (payment.captured) & Idempotency
    // -------------------------------------------------------------
    console.log('\n--- Scenario 5: Webhook Event Processing (payment.captured) ---');
    webhookEventId = `evt_test_${Date.now()}`;
    const webhookPayload = {
      entity: 'event',
      account_id: 'acc_test_knowtohire',
      event: 'payment.captured',
      event_id: webhookEventId,
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: syntheticPaymentId,
            order_id: createdRazorpayOrderId,
            amount: 149900,
            currency: 'INR',
            status: 'captured',
            email: testEmail,
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    const webhookBody = JSON.stringify(webhookPayload);
    const webhookSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(webhookBody)
      .digest('hex');

    {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: webhookBody,
        headers: {
          'x-razorpay-signature': webhookSignature,
          'content-type': 'application/json',
        },
      });

      await webhookHandler(req, res);
      const data = res.getData();

      record(
        'Webhook: Successfully processes payment.captured with HTTP 200',
        res.getStatusCode() === 200 && data.status === 'ok',
        `Status: ${res.getStatusCode()}, Response: ${JSON.stringify(data)}`
      );

      // Verify webhook event recorded in staging payment_webhook_events by event_id
      const { data: webhookEvents } = await supabaseAdmin
        .from('payment_webhook_events')
        .select('*')
        .eq('event_id', webhookEventId);

      record(
        'Webhook: Persisted in staging payment_webhook_events with processed_status = "processed"',
        webhookEvents?.length! >= 1 && webhookEvents![0].processed_status === 'processed',
        `Events count: ${webhookEvents?.length}, Status: ${webhookEvents?.[0]?.processed_status}`
      );

      // Verify entitlements count remains 1
      const { data: entitlements } = await supabaseAdmin
        .from('company_subscription_entitlements')
        .select('*')
        .eq('company_id', testCompanyId);

      record(
        'Webhook: Reconciled without duplicate entitlement (count still 1)',
        entitlements?.length === 1,
        `Entitlements length: ${entitlements?.length}`
      );
    }

    // -------------------------------------------------------------
    // Scenario 6: Replay Same Webhook Event (Idempotent 200)
    // -------------------------------------------------------------
    console.log('\n--- Scenario 6: Replay Same Webhook Event ---');
    {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: webhookBody,
        headers: {
          'x-razorpay-signature': webhookSignature,
          'content-type': 'application/json',
        },
      });

      await webhookHandler(req, res);
      const data = res.getData();

      record(
        'Webhook Replay: Returns HTTP 200 with idempotent message',
        res.getStatusCode() === 200 && data.message?.includes('Idempotent'),
        `Status: ${res.getStatusCode()}, Response: ${JSON.stringify(data)}`
      );

      // Verify still exactly 1 entitlement and expiry unchanged
      const { data: entitlements } = await supabaseAdmin
        .from('company_subscription_entitlements')
        .select('*')
        .eq('company_id', testCompanyId);

      const { data: comp } = await supabaseAdmin
        .from('company_profiles')
        .select('subscription_expires_at')
        .eq('id', testCompanyId)
        .single();

      record(
        'Webhook Replay: Zero duplicate entitlement and zero expiry extension',
        entitlements?.length === 1 && comp?.subscription_expires_at === firstExpiresAt,
        `Entitlements: ${entitlements?.length}, Expiry matched: ${comp?.subscription_expires_at === firstExpiresAt}`
      );
    }

    // -------------------------------------------------------------
    // Scenario 7: Failed / Abandoned Payment Notification
    // -------------------------------------------------------------
    console.log('\n--- Scenario 7: Failed Payment Handling ---');
    {
      // Create another synthetic company to test failure isolation
      const failCompanyId = crypto.randomUUID();
      const failUserId = crypto.randomUUID();
      const failOrderId = `order_fail_${Date.now()}`;
      const failPaymentId = `pay_fail_${Date.now()}`;

      trackedCompanyIds.add(failCompanyId);
      trackedUserIds.add(failUserId);
      trackedOrderIds.add(failOrderId);

      // Create auth user so profiles.id foreign key constraint succeeds
      const failEmail = `fail-test-${Date.now()}@knowtohire.staging`;
      const { error: failAuthErr } = await supabaseAdmin.auth.admin.createUser({
        id: failUserId,
        email: failEmail,
        email_confirm: true,
        user_metadata: { full_name: 'Fail Test Employer' },
      });
      if (failAuthErr) throw failAuthErr;

      const { error: pErr } = await supabaseAdmin.from('profiles').upsert({
        id: failUserId,
        email: failEmail,
        full_name: 'Fail Test Employer',
        role: 'employer',
        status: 'active',
      });
      if (pErr) throw pErr;

      const { error: cErr } = await supabaseAdmin.from('company_profiles').insert({
        id: failCompanyId,
        name: 'Fail Test Corp',
        verification_status: 'verified',
        subscription_status: 'inactive',
      });
      if (cErr) throw cErr;

      const { error: epErr } = await supabaseAdmin.from('employer_profiles').insert({
        profile_id: failUserId,
        company_id: failCompanyId,
        is_company_admin: true,
      });
      if (epErr) throw epErr;

      // Insert unpaid order in payment_orders
      const { error: poErr } = await supabaseAdmin.from('payment_orders').insert({
        order_number: `ORD-FAIL-${Date.now()}`,
        user_id: failUserId,
        company_id: failCompanyId,
        product_type: 'employer_subscription',
        product_id: 'sub_starter_monthly',
        product_title: 'KnowToHire Starter (Monthly)',
        amount_inr: 1499,
        currency: 'INR',
        status: 'created',
        provider: 'razorpay',
        provider_order_id: failOrderId,
        is_paid: false,
      });
      if (poErr) throw poErr;

      // Send status: 'failed' to verifyPaymentHandler
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          razorpay_order_id: failOrderId,
          razorpay_payment_id: failPaymentId,
          status: 'failed',
          error_code: 'BAD_REQUEST_ERROR',
          error_description: 'Payment was dropped by user / cancelled by bank',
        },
      });

      await verifyPaymentHandler(req, res);
      const data = res.getData();

      record(
        'Failed Payment: verifyPaymentHandler records failure with HTTP 200',
        res.getStatusCode() === 200 && data.success === true && data.message === 'Failed payment recorded',
        `Status: ${res.getStatusCode()}, Response: ${JSON.stringify(data)}`
      );

      // Verify staging DB state for failed order
      const { data: dbFailOrder } = await supabaseAdmin
        .from('payment_orders')
        .select('*')
        .eq('provider_order_id', failOrderId)
        .single();

      record(
        'Failed Payment: payment_orders updated to status = "failed" and is_paid = false',
        dbFailOrder?.status === 'failed' && dbFailOrder?.is_paid === false,
        `Status: ${dbFailOrder?.status}, Paid: ${dbFailOrder?.is_paid}`
      );

      const { data: failComp } = await supabaseAdmin
        .from('company_profiles')
        .select('subscription_status')
        .eq('id', failCompanyId)
        .single();

      record(
        'Failed Payment: Company subscription remains "inactive" in staging database',
        failComp?.subscription_status === 'inactive',
        `Status: ${failComp?.subscription_status}`
      );
    }

    // -------------------------------------------------------------
    // Scenario 8: Payment ID Reuse Across Different Orders (Must Reject)
    // -------------------------------------------------------------
    console.log('\n--- Scenario 8: Payment ID Reuse Rejection ---');
    {
      const anotherOrderId = `order_reuse_${Date.now()}`;
      const validSigForReuse = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${anotherOrderId}|${syntheticPaymentId}`)
        .digest('hex');

      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          razorpay_order_id: anotherOrderId,
          razorpay_payment_id: syntheticPaymentId, // REUSING existing payment ID from earlier test!
          razorpay_signature: validSigForReuse,
          user_id: testUserId,
          company_id: testCompanyId,
        },
      });

      await verifyPaymentHandler(req, res);
      const data = res.getData();

      record(
        'Payment ID Reuse: Rejected with HTTP 409 Conflict',
        res.getStatusCode() === 409 && data.success === false,
        `Status: ${res.getStatusCode()}, Response: ${JSON.stringify(data)}`
      );
    }
  } finally {
    // -------------------------------------------------------------
    // Cleanup Synthetic Staging Test Records
    // -------------------------------------------------------------
    console.log('\n--- Cleaning up synthetic test records from Staging ---');
    const cleanupErrors: string[] = [];

    const companyIds = Array.from(trackedCompanyIds);
    const userIds = Array.from(trackedUserIds);
    const orderIds = Array.from(trackedOrderIds);
    const eventIds = Array.from(trackedEventIds);

    // 1. Delete subscription entitlements referencing tracked companies
    if (companyIds.length > 0) {
      const { error: entErr } = await supabaseAdmin
        .from('company_subscription_entitlements')
        .delete()
        .in('company_id', companyIds);
      if (entErr) {
        cleanupErrors.push(`Failed deleting company_subscription_entitlements: ${entErr.message}`);
      }
    }

    // 2. Clear any subscription_order_id foreign key references on company_profiles
    if (companyIds.length > 0) {
      const { error: compClearErr } = await supabaseAdmin
        .from('company_profiles')
        .update({ subscription_order_id: null })
        .in('id', companyIds);
      if (compClearErr) {
        cleanupErrors.push(`Failed clearing subscription_order_id on company_profiles: ${compClearErr.message}`);
      }
    }

    // 3. Delete payment orders for tracked orders and companies
    if (orderIds.length > 0) {
      const { error: ordErr } = await supabaseAdmin
        .from('payment_orders')
        .delete()
        .in('provider_order_id', orderIds);
      if (ordErr) {
        cleanupErrors.push(`Failed deleting payment_orders by provider_order_id: ${ordErr.message}`);
      }
    }
    if (companyIds.length > 0) {
      const { error: ordCompErr } = await supabaseAdmin
        .from('payment_orders')
        .delete()
        .in('company_id', companyIds);
      if (ordCompErr) {
        cleanupErrors.push(`Failed deleting payment_orders by company_id: ${ordCompErr.message}`);
      }
    }

    // 4. Delete webhook events created by test
    if (eventIds.length > 0) {
      const { error: evtErr } = await supabaseAdmin
        .from('payment_webhook_events')
        .delete()
        .in('event_id', eventIds);
      if (evtErr) {
        cleanupErrors.push(`Failed deleting payment_webhook_events: ${evtErr.message}`);
      }
    }

    // 5. Delete employer_profiles referencing tracked companies or users (satisfying ON DELETE RESTRICT on company_profiles)
    if (companyIds.length > 0) {
      const { error: empCompErr } = await supabaseAdmin
        .from('employer_profiles')
        .delete()
        .in('company_id', companyIds);
      if (empCompErr) {
        cleanupErrors.push(`Failed deleting employer_profiles by company_id: ${empCompErr.message}`);
      }
    }
    if (userIds.length > 0) {
      const { error: empUserErr } = await supabaseAdmin
        .from('employer_profiles')
        .delete()
        .in('profile_id', userIds);
      if (empUserErr) {
        cleanupErrors.push(`Failed deleting employer_profiles by profile_id: ${empUserErr.message}`);
      }
    }

    // 6. Delete company_profiles
    if (companyIds.length > 0) {
      const { error: compErr } = await supabaseAdmin
        .from('company_profiles')
        .delete()
        .in('id', companyIds);
      if (compErr) {
        cleanupErrors.push(`Failed deleting company_profiles: ${compErr.message}`);
      }
    }

    // 7. Delete profiles
    if (userIds.length > 0) {
      const { error: profErr } = await supabaseAdmin
        .from('profiles')
        .delete()
        .in('id', userIds);
      if (profErr) {
        cleanupErrors.push(`Failed deleting profiles: ${profErr.message}`);
      }
    }

    // 8. Delete auth users
    for (const uid of userIds) {
      const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (authErr && !authErr.message.toLowerCase().includes('not found')) {
        cleanupErrors.push(`Failed deleting auth user ${uid}: ${authErr.message}`);
      }
    }

    if (cleanupErrors.length > 0) {
      console.error('Cleanup operation warnings/errors:', cleanupErrors.join('; '));
    }

    // Verify that tables returned to zero rows
    const { count: ordCount } = await supabaseAdmin.from('payment_orders').select('*', { count: 'exact', head: true });
    const { count: entCount } = await supabaseAdmin.from('company_subscription_entitlements').select('*', { count: 'exact', head: true });
    const { count: compCount } = await supabaseAdmin.from('company_profiles').select('*', { count: 'exact', head: true });

    record(
      'Teardown: All synthetic records safely removed from staging database',
      ordCount === 0 && entCount === 0 && compCount === 0 && cleanupErrors.length === 0,
      `Remaining counts: payment_orders=${ordCount}, entitlements=${entCount}, company_profiles=${compCount}. Errors: ${cleanupErrors.join('; ') || 'none'}`
    );
  }

  console.log('\n================================================================');
  console.log(`STAGING E2E VALIDATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStagingE2EValidation().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
