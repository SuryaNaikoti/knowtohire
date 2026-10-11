import {
  verifyWebhookSignature,
  recordFailedPayment,
  fulfillSuccessfulPayment,
  claimWebhookEvent,
  completeWebhookEvent,
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

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

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
        if (orderId && paymentId) {
          await fulfillSuccessfulPayment({
            orderId,
            paymentId,
          });
        }
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

      // Safe ignore for other informational events
      await completeWebhookEvent(eventId, 'processed', claimResult.leaseToken, undefined, orderId);
      return res.status(200).json({ status: 'ok', handled: false, event });
    } catch (fulfillmentErr: any) {
      // Mark event failed so subsequent delivery can safely retry
      await completeWebhookEvent(eventId, 'failed', claimResult.leaseToken, fulfillmentErr?.message || 'Fulfillment error');
      throw fulfillmentErr;
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
}
