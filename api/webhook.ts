import {
  verifyWebhookSignature,
  recordFailedPayment,
  fulfillSuccessfulPayment,
  claimWebhookEvent,
  completeWebhookEvent,
  claimPaymentVerification,
  loadPersistentPaymentOrder,
  isProductionEnvironment,
} from './_serverPayment.js';

async function getRawBody(req: any): Promise<string> {
  if (typeof req.body === 'string') {
    return req.body;
  }
  if (req.body && Buffer.isBuffer(req.body)) {
    return req.body.toString('utf-8');
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk.toString('utf-8');
    });
    req.on('end', () => {
      resolve(raw);
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Enforce dedicated webhook secret in production; allow key_secret fallback only in non-production local development
  let webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    if (isProductionEnvironment()) {
      console.error('[ServerPaymentSecurity] CRITICAL: RAZORPAY_WEBHOOK_SECRET is missing in production environment. Webhook verification aborted.');
      return res.status(500).json({ error: 'Webhook configuration error: RAZORPAY_WEBHOOK_SECRET is required in production.' });
    }
    // Non-production / local test fallback
    webhookSecret = process.env.RAZORPAY_KEY_SECRET;
  }

  if (!webhookSecret) {
    return res.status(401).json({ error: 'Webhook secret not configured on server.' });
  }

  const signature = req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
  }

  try {
    const rawBody = await getRawBody(req);

    // 1. Verify webhook HMAC signature first before claiming or touching DB
    const isValidSignature = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const payload = JSON.parse(rawBody || '{}');
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;

    const eventId = payload.event_id || `${event}_${payload.created_at}_${paymentId || orderId || ''}`;

    // 2. Atomic Persistent Event Claim
    const claimResult = await claimWebhookEvent(eventId, event, payload, 60);

    if (claimResult.status === 'error') {
      // FAIL CLOSED: Database error during claim must return retryable 5xx to trigger gateway retry
      return res.status(500).json({ error: claimResult.errorMessage || 'Database error during event claim' });
    }

    if (claimResult.status === 'already_processed') {
      return res.status(200).json({ status: 'ok', message: 'Webhook already processed (Idempotent)' });
    }

    if (claimResult.status === 'in_flight') {
      return res.status(429).json({ status: 'in_flight', message: 'Webhook event is currently being processed by another instance' });
    }

    // 3. Process Event Fulfillment
    try {
      if (event === 'order.paid' || event === 'payment.captured') {
        if (!orderId || !paymentId) {
          // Missing critical identifiers in payload: complete event and acknowledge
          console.warn(`[Webhook] Event ${event} missing orderId or paymentId: orderId=${orderId}, paymentId=${paymentId}`);
          await completeWebhookEvent(eventId, 'processed', claimResult.leaseToken, undefined, orderId);
          return res.status(200).json({ status: 'ok', handled: false, message: 'Missing orderId or paymentId in payload' });
        }

        // Authoritatively resolve order and amount
        const trustedOrder = await loadPersistentPaymentOrder(orderId, paymentId);
        const amountPaise = paymentEntity?.amount ?? orderEntity?.amount_paid ?? orderEntity?.amount;
        const eventAmountInr = amountPaise !== undefined ? Math.round(Number(amountPaise)) / 100 : undefined;
        const authoritativeAmountInr = eventAmountInr ?? trustedOrder?.amount_inr ?? 0;

        // Atomically claim payment verification in database before fulfillment
        const claim = await claimPaymentVerification({
          paymentId,
          orderId,
          amountInr: authoritativeAmountInr,
          userId: trustedOrder?.user_id,
          productType: trustedOrder?.item_type,
          productId: trustedOrder?.item_id,
          productTitle: trustedOrder?.product_title,
        });

        if (claim.status === 'error') {
          // Transient database error: throw to mark webhook event failed and trigger Razorpay retry
          throw new Error(claim.errorMessage || 'Database error occurred during payment verification claim.');
        }

        if ((claim.status as string) === 'conflict') {
          console.warn(`[Webhook] Payment ID / order conflict detected: paymentId=${paymentId}, orderId=${orderId}`);
          await completeWebhookEvent(eventId, 'processed', claimResult.leaseToken, claim.errorMessage, orderId);
          return res.status(200).json({ status: 'conflict', message: claim.errorMessage, event });
        }

        // status is 'claimed' or 'already_processed' -> Safely execute authoritative fulfillment
        await fulfillSuccessfulPayment({
          orderId,
          paymentId,
          userId: trustedOrder?.user_id,
          userEmail: trustedOrder?.customer_email,
          userName: trustedOrder?.customer_name,
          itemId: trustedOrder?.item_id,
          itemType: trustedOrder?.item_type,
          companyId: trustedOrder?.company_id,
        });

        await completeWebhookEvent(eventId, 'processed', claimResult.leaseToken, undefined, orderId);
        return res.status(200).json({ status: 'ok', handled: true, event });
      }

      if (event === 'payment.failed') {
        if (orderId) {
          await recordFailedPayment(
            orderId,
            paymentId,
            paymentEntity?.error_code,
            paymentEntity?.error_description
          );
        }
        await completeWebhookEvent(eventId, 'processed', claimResult.leaseToken, undefined, orderId);
        return res.status(200).json({ status: 'ok', handled: true, event });
      }

      // Non-actionable or informational events (e.g. payment.authorized, refund.processed)
      // Acknowledge cleanly with 200 so Razorpay does not endlessly retry non-actionable webhooks
      await completeWebhookEvent(eventId, 'processed', claimResult.leaseToken, undefined, orderId);
      return res.status(200).json({ status: 'ok', handled: false, event, message: 'Event acknowledged' });
    } catch (fulfillmentErr: any) {
      // Mark event failed so subsequent delivery can safely retry, and return 500 so Razorpay retries
      await completeWebhookEvent(eventId, 'failed', claimResult.leaseToken, fulfillmentErr?.message || 'Fulfillment error');
      return res.status(500).json({ error: fulfillmentErr?.message || 'Transient fulfillment error' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
}
