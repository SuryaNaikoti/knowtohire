import Razorpay from 'razorpay';
import { getAuthoritativeItem } from '../src/services/payment/authoritativePricing';
import { saveStoredOrder } from '../src/services/payment/serverPaymentCoordinator';

// Helper to read JSON request body in Vercel Serverless environment
async function parseBody(req: any) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(401).json({
      error: 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.',
    });
  }

  try {
    const body: any = await parseBody(req);
    const { itemId, itemType, receipt, notes, userId, userEmail, userName, companyId } = body;

    // --- SERVER-AUTHORITATIVE PRICING ---
    // If itemId is provided, price MUST be verified from canonical catalog, never blindly trusted from client.
    let authoritativeAmountINR: number | null = null;
    let productTitle = 'KnowToHire Purchase';

    if (itemId) {
      const catalogItem = getAuthoritativeItem(itemId, itemType);
      if (catalogItem) {
        authoritativeAmountINR = catalogItem.priceINR;
        productTitle = catalogItem.title;
      }
    }

    // Fallback if no catalog item matched (or legacy amount passed for custom requests)
    if (authoritativeAmountINR === null) {
      const clientAmountPaise = Math.round(Number(body.amount));
      if (clientAmountPaise && !isNaN(clientAmountPaise) && clientAmountPaise >= 100) {
        authoritativeAmountINR = clientAmountPaise / 100;
      }
    }

    if (authoritativeAmountINR === null || authoritativeAmountINR <= 0) {
      return res.status(400).json({
        error: 'Invalid order item or amount. Paid purchases must be at least ₹1.00.',
      });
    }

    const amountInPaise = Math.round(authoritativeAmountINR * 100);

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: {
        ...(notes || {}),
        itemId: itemId || '',
        itemType: itemType || '',
        userId: userId || '',
        companyId: companyId || '',
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save order in server-side state for idempotent verification
    saveStoredOrder(order.id, {
      id: order.id,
      provider_order_id: order.id,
      amount_inr: authoritativeAmountINR,
      currency: 'INR',
      status: 'created',
      receipt: order.receipt,
      user_id: userId,
      customer_email: userEmail,
      customer_name: userName,
      item_id: itemId,
      item_type: itemType,
      product_title: productTitle,
      company_id: companyId,
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({
      key_id: keyId,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      product_title: productTitle,
      amount_inr: authoritativeAmountINR,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.error?.description || error?.message || 'Failed to create Razorpay order',
    });
  }
}
