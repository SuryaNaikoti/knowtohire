import {
  verifyWebhookSignature,
  getStoredOrder,
  saveStoredOrder,
  recordFailedPayment,
  fulfillSuccessfulPayment,
} from '../src/services/payment/serverPaymentCoordinator';

// Helper to read raw body for HMAC SHA256 signature verification
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

// In-memory processed webhook events store for strict idempotency
const processedWebhookEvents = new Set<string>();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Razorpay webhook secret (defaults to RAZORPAY_KEY_SECRET or RAZORPAY_WEBHOOK_SECRET)
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

    // Verify webhook HMAC signature
    const isValidSignature = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const payload = JSON.parse(rawBody || '{}');
    const eventId = payload.event_id || `${payload.event}_${payload.created_at}_${payload.payload?.payment?.entity?.id || ''}`;

    // Webhook Idempotency Check
    if (processedWebhookEvents.has(eventId)) {
      return res.status(200).json({ status: 'ok', message: 'Webhook already processed (Idempotent)' });
    }
    processedWebhookEvents.add(eventId);

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;

    if (event === 'order.paid' || event === 'payment.captured') {
      if (orderId && paymentId) {
        await fulfillSuccessfulPayment({
          orderId,
          paymentId,
        });
      }
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
      return res.status(200).json({ status: 'ok', handled: true, event });
    }

    // Ignore other unhandled events safely
    return res.status(200).json({ status: 'ok', handled: false, event });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
}
