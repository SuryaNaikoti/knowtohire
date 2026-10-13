import {
  verifyRazorpaySignature,
  fulfillSuccessfulPayment,
  recordFailedPayment,
  loadPersistentPaymentOrder,
  getAuthoritativeItem,
  claimPaymentVerification,
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

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return res.status(401).json({
      success: false,
      error: 'Razorpay secret not configured in server environment.',
    });
  }

  try {
    const body: any = await parseBody(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      user_email,
      user_name,
      item_id,
      item_type,
      company_id,
      status,
      error_code,
      error_description,
    } = body;

    // Handle failed payment notification
    if (status === 'failed') {
      if (razorpay_order_id) {
        const existingOrder = await loadPersistentPaymentOrder(razorpay_order_id, razorpay_payment_id);
        if (existingOrder && (existingOrder.is_paid || existingOrder.status === 'paid')) {
          // STRICT RULE: Never let client-side failure callback downgrade an order that has already been paid
          return res.status(200).json({
            success: true,
            message: 'Order already paid; failure callback ignored',
          });
        }
        await recordFailedPayment(razorpay_order_id, razorpay_payment_id, error_code, error_description);
      }
      return res.status(200).json({
        success: true,
        message: 'Failed payment recorded',
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature.',
      });
    }

    // 1. Signature Verification (HMAC SHA-256)
    const isMatch = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification failed.',
        message: 'Signature mismatch',
      });
    }

    // 2. Load Trusted Persisted Order Record
    // Replay/reconciliation must use trusted server-persisted order details rather than arbitrary client parameters
    const trustedOrder = await loadPersistentPaymentOrder(razorpay_order_id, razorpay_payment_id);

    // If an existing order is found, enforce security: purchaser, product, currency and amount integrity
    if (trustedOrder) {
      if (body.currency && body.currency !== 'INR') {
        return res.status(400).json({
          success: false,
          error: 'Invalid currency: Only INR currency is supported.',
        });
      }
      if (trustedOrder.currency && trustedOrder.currency !== 'INR') {
        return res.status(400).json({
          success: false,
          error: 'Invalid order currency: Expected INR.',
        });
      }
      if (trustedOrder.user_id && user_id && trustedOrder.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: User ID mismatch with existing payment order.',
        });
      }
      if (trustedOrder.item_id && item_id && trustedOrder.item_id !== item_id) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request: Product ID does not match original payment order.',
        });
      }
      // Exact amount validation: if amount or amount_paise is supplied by client, it must match trusted order
      if (body.amount_paise !== undefined) {
        const expectedPaise = Math.round(trustedOrder.amount_inr * 100);
        if (Number(body.amount_paise) !== expectedPaise) {
          return res.status(400).json({
            success: false,
            error: `Payment amount mismatch: Expected ${expectedPaise} paise (${trustedOrder.amount_inr} INR) but received ${body.amount_paise} paise.`,
          });
        }
      }
      // If order is already paid, enforce that incoming payment ID matches the recorded payment ID exactly
      if (trustedOrder.is_paid || trustedOrder.status === 'paid') {
        if (trustedOrder.payment_id && trustedOrder.payment_id !== razorpay_payment_id) {
          return res.status(409).json({
            success: false,
            error: 'Conflict: Order is already paid with a different payment ID.',
          });
        }
      }
      if (body.amount_inr !== undefined && Number(body.amount_inr) !== trustedOrder.amount_inr) {
        return res.status(400).json({
          success: false,
          error: `Payment amount mismatch: Expected ${trustedOrder.amount_inr} INR but received ${body.amount_inr} INR.`,
        });
      }
    } else {
      // Reject verification of unrecorded order if client provides unsupported currency
      if (body.currency && body.currency !== 'INR') {
        return res.status(400).json({
          success: false,
          error: 'Invalid currency: Only INR currency is supported.',
        });
      }
    }

    const effectiveUserId = trustedOrder?.user_id || user_id;
    const effectiveItemId = trustedOrder?.item_id || item_id;
    const effectiveItemType = trustedOrder?.item_type || item_type;
    const effectiveCompanyId = trustedOrder?.company_id || company_id;

    const catalogItem = effectiveItemId ? getAuthoritativeItem(effectiveItemId, effectiveItemType) : null;
    const canonicalPriceINR = catalogItem?.priceINR ?? trustedOrder?.amount_inr ?? 0;
    const canonicalTitle = catalogItem?.title || trustedOrder?.product_title || 'KnowToHire Resource';

    // 3. Persistent Database Claim & Replay Protection
    const claim = await claimPaymentVerification({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amountInr: canonicalPriceINR,
      userId: effectiveUserId,
      productType: catalogItem?.type || effectiveItemType,
      productId: catalogItem?.id || effectiveItemId,
      productTitle: canonicalTitle,
    });

    if (claim.status === 'error') {
      // FAIL CLOSED: Database error during verification claim must fail closed with 500
      return res.status(500).json({
        success: false,
        error: claim.errorMessage || 'Database error occurred during payment verification claim.',
      });
    }

    if ((claim.status as string) === 'conflict') {
      return res.status(409).json({
        success: false,
        error: claim.errorMessage || 'Payment ID or order conflict detected.',
      });
    }

    const isReplay = claim.status === 'already_processed';

    // 4. Server Owns Authoritative Fulfillment & Reconciliation
    // Always reconcile through fulfillSuccessfulPayment, even on retry/replay!
    // This guarantees that if a previous request marked the order paid but crashed before writing
    // the entitlement to user_purchases or company_profiles, the retry will safely resume and fulfill it.
    const fulfillment = await fulfillSuccessfulPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userId: effectiveUserId,
      userEmail: trustedOrder?.customer_email || user_email,
      userName: trustedOrder?.customer_name || user_name,
      itemId: catalogItem?.id || effectiveItemId,
      itemType: catalogItem?.type || effectiveItemType,
      companyId: effectiveCompanyId,
    });

    return res.status(200).json({
      success: true,
      message: isReplay ? 'Payment already verified; entitlement reconciled successfully' : 'Payment verified and fulfilled successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      entitlement_id: fulfillment.entitlement?.id,
      subscription_active: fulfillment.subscriptionActive,
      replayed: isReplay,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Payment verification encountered a server error',
    });
  }
}
