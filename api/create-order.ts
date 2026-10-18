import Razorpay from 'razorpay';
import {
  getAuthoritativeItem,
  saveStoredOrder,
  createDurablePaymentOrder,
  getServerSupabaseClient,
  hasSupabaseServiceRole,
} from './_serverPayment.js';

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
    let authoritativeAmountINR: number | null = null;
    let productTitle = 'KnowToHire Purchase';
    const catalogItem = itemId ? getAuthoritativeItem(itemId, itemType) : null;

    if (catalogItem) {
      authoritativeAmountINR = catalogItem.priceINR;
      productTitle = catalogItem.title;
    }

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

    const effectiveProductType = catalogItem?.type || itemType || 'knowledge_resource';
    let validatedCompanyId = companyId || null;

    // Strict Employer-Company Relationship Validation for employer subscriptions
    if (effectiveProductType === 'employer_subscription') {
      if (!userId) {
        return res.status(400).json({
          error: 'Authenticated user ID is required for employer subscriptions.',
        });
      }

      if (hasSupabaseServiceRole()) {
        try {
          const supabase = getServerSupabaseClient();
          const { data: ep, error: epErr } = await supabase
            .from('employer_profiles')
            .select('company_id')
            .eq('profile_id', userId)
            .maybeSingle();

          if (epErr || !ep || !ep.company_id) {
            return res.status(403).json({
              error: 'Forbidden: No registered employer company profile found for this account. Please complete employer onboarding first.',
            });
          }

          if (companyId && companyId !== ep.company_id) {
            return res.status(403).json({
              error: 'Forbidden: Client company ID does not match authoritative employer company profile.',
            });
          }

          validatedCompanyId = ep.company_id;
        } catch (dbErr: any) {
          console.error('[CreateOrder] Exception checking employer company profile:', dbErr);
          return res.status(500).json({
            error: dbErr?.message || 'Failed to verify employer company profile.',
            stage: 'employer_company_lookup',
          });
        }
      }
    }

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: {
        ...(notes || {}),
        itemId: itemId || '',
        itemType: effectiveProductType,
        userId: userId || '',
        companyId: validatedCompanyId || '',
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    // 1. In-memory cache for fast local retrieval
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
      item_type: effectiveProductType,
      product_title: productTitle,
      company_id: validatedCompanyId || undefined,
      created_at: new Date().toISOString(),
    });

    // 2. Durable database persistence in Supabase
    const durableResult = await createDurablePaymentOrder({
      providerOrderId: order.id,
      amountINR: authoritativeAmountINR,
      currency: 'INR',
      productType: effectiveProductType,
      productId: catalogItem?.id || itemId || order.id,
      productTitle,
      userId,
      customerEmail: userEmail,
      customerName: userName,
      companyId: validatedCompanyId || undefined,
      metadata: {
        receipt: order.receipt,
        notes: orderOptions.notes,
      },
    });

    if (!durableResult.success) {
      console.error('[CreateOrder] Durable order persistence failed:', durableResult.error);
      return res.status(500).json({
        error: durableResult.error || 'Failed to persist order in payment ledger.',
        stage: 'durable_persistence',
      });
    }

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
    const errorDetails = error?.error?.description || error?.message || 'Failed to create Razorpay order';
    const errorCode = error?.error?.code || error?.code || 'ORDER_CREATION_FAILED';
    console.error('[CreateOrder] Exception during order creation:', {
      message: error?.message,
      description: error?.error?.description,
      code: errorCode,
      status: error?.statusCode,
      stack: error?.stack,
    });
    return res.status(500).json({
      error: errorDetails,
      code: errorCode,
      stage: 'razorpay_order_api',
    });
  }
}
