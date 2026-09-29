import crypto from 'crypto';
import { getAuthoritativeItem, CatalogItem } from './authoritativePricing';

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  item_id?: string;
  item_type?: string;
  company_id?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  message: string;
  payment_id?: string;
  order_id?: string;
  entitlement_id?: string;
  subscription_active?: boolean;
  replayed?: boolean;
  error?: string;
}

export interface StoredOrder {
  id: string;
  provider_order_id: string;
  payment_id?: string;
  amount_inr: number;
  currency: string;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  receipt?: string;
  user_id?: string;
  customer_email?: string;
  customer_name?: string;
  item_id?: string;
  item_type?: string;
  product_title: string;
  company_id?: string;
  is_paid?: boolean;
  paid_at?: string;
  created_at: string;
  last_error_code?: string;
  last_error_message?: string;
  failed_at?: string;
}

export interface ServerEntitlement {
  id: string;
  user_id: string;
  product_type: 'template' | 'knowledge_resource' | 'employer_subscription' | 'candidate_subscription' | 'content_request';
  product_id: string;
  product_title: string;
  amount_inr: number;
  order_id: string;
  payment_id: string;
  purchased_at: string;
}

// In-memory replay & processed idempotency caches (Global across hot-reloads)
declare global {
  // eslint-disable-next-line no-var
  var __kth_orders: Map<string, StoredOrder> | undefined;
  // eslint-disable-next-line no-var
  var __kth_processed_payments: Map<string, { timestamp: number; orderId: string; userId?: string }> | undefined;
  // eslint-disable-next-line no-var
  var __kth_server_entitlements: Map<string, ServerEntitlement> | undefined;
}

if (!globalThis.__kth_orders) {
  globalThis.__kth_orders = new Map<string, StoredOrder>();
}
if (!globalThis.__kth_processed_payments) {
  globalThis.__kth_processed_payments = new Map<string, { timestamp: number; orderId: string; userId?: string }>();
}
if (!globalThis.__kth_server_entitlements) {
  globalThis.__kth_server_entitlements = new Map<string, ServerEntitlement>();
}

const orderStorage = globalThis.__kth_orders;
const processedPayments = globalThis.__kth_processed_payments;
const serverEntitlements = globalThis.__kth_server_entitlements;

export function getStoredOrder(orderId: string): StoredOrder | null {
  return orderStorage.get(orderId) || null;
}

export function saveStoredOrder(orderId: string, orderData: StoredOrder): void {
  orderStorage.set(orderId, orderData);
}

export function getAllStoredOrders(): StoredOrder[] {
  return Array.from(orderStorage.values());
}

export function getServerEntitlementsForUser(userId: string): ServerEntitlement[] {
  if (!userId) return [];
  return Array.from(serverEntitlements.values()).filter((e) => e.user_id === userId);
}

export function hasServerEntitlement(productId: string, userId?: string): boolean {
  if (!productId || !userId) return false;
  const canonical = getAuthoritativeItem(productId);
  const idsToCheck = [productId];
  if (canonical && canonical.id && !idsToCheck.includes(canonical.id)) {
    idsToCheck.push(canonical.id);
  }

  // 1. Direct entitlement map
  const match = Array.from(serverEntitlements.values()).find(
    (e) => e.user_id === userId && idsToCheck.includes(e.product_id)
  );
  if (match) return true;

  // 2. Paid orders map
  const paidOrder = Array.from(orderStorage.values()).find(
    (o) => o.is_paid && o.user_id === userId && (idsToCheck.includes(o.item_id || '') || (canonical && o.item_id === canonical.id))
  );
  return Boolean(paidOrder);
}

/**
 * Validates Razorpay HMAC SHA256 Signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  if (!orderId || !paymentId || !signature || !secret) return false;

  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Validates Razorpay Webhook HMAC SHA256 Signature
 */
export function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string,
  webhookSecret: string
): boolean {
  if (!rawBody || !receivedSignature || !webhookSecret) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(receivedSignature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Authoritative Server-Side Payment Fulfillment.
 * Reusable by both /api/verify-payment and Razorpay order.paid webhooks.
 * Enforces canonical pricing from catalog, establishes order-user-product lineage,
 * and idempotently creates user entitlement.
 */
export async function fulfillSuccessfulPayment(params: {
  orderId: string;
  paymentId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  itemId?: string;
  itemType?: string;
  companyId?: string;
}): Promise<{
  success: boolean;
  order: StoredOrder;
  entitlement?: ServerEntitlement;
  subscriptionActive?: boolean;
}> {
  const { orderId, paymentId } = params;

  // Retrieve existing server-side order established during /api/create-order
  const existingOrder = getStoredOrder(orderId);

  // Authoritatively establish user, item, and type (trust stored order over client if exists)
  const effectiveUserId = existingOrder?.user_id || params.userId;
  const effectiveItemId = existingOrder?.item_id || params.itemId;
  const rawItemType = existingOrder?.item_type || params.itemType;
  const effectiveCompanyId = existingOrder?.company_id || params.companyId;

  // Resolve canonical catalog metadata
  let catalogItem: CatalogItem | null = null;
  if (effectiveItemId) {
    catalogItem = getAuthoritativeItem(effectiveItemId, rawItemType);
  }

  const effectiveItemType = catalogItem?.type || (rawItemType as any) || 'knowledge_resource';
  const canonicalPriceINR = catalogItem?.priceINR ?? existingOrder?.amount_inr ?? 0;
  const canonicalTitle = catalogItem?.title || existingOrder?.product_title || 'KnowToHire Resource';

  // Update order record to paid state
  const updatedOrder: StoredOrder = {
    id: orderId,
    provider_order_id: orderId,
    payment_id: paymentId,
    amount_inr: canonicalPriceINR,
    currency: 'INR',
    status: 'paid',
    is_paid: true,
    paid_at: existingOrder?.paid_at || new Date().toISOString(),
    receipt: existingOrder?.receipt,
    user_id: effectiveUserId,
    customer_email: existingOrder?.customer_email || params.userEmail,
    customer_name: existingOrder?.customer_name || params.userName,
    item_id: catalogItem?.id || effectiveItemId,
    item_type: effectiveItemType,
    product_title: canonicalTitle,
    company_id: effectiveCompanyId,
    created_at: existingOrder?.created_at || new Date().toISOString(),
  };

  saveStoredOrder(orderId, updatedOrder);

  // Create Server-Side Entitlement (Idempotently)
  let entitlement: ServerEntitlement | undefined;

  if (effectiveUserId && effectiveItemId && (effectiveItemType === 'template' || effectiveItemType === 'knowledge_resource')) {
    const canonicalProductId = catalogItem?.id || effectiveItemId;
    const entitlementKey = `${effectiveUserId}_${effectiveItemType}_${canonicalProductId}`;

    if (!serverEntitlements.has(entitlementKey)) {
      entitlement = {
        id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        user_id: effectiveUserId,
        product_type: effectiveItemType,
        product_id: canonicalProductId,
        product_title: canonicalTitle,
        amount_inr: canonicalPriceINR,
        order_id: orderId,
        payment_id: paymentId,
        purchased_at: updatedOrder.paid_at || new Date().toISOString(),
      };
      serverEntitlements.set(entitlementKey, entitlement);
    } else {
      entitlement = serverEntitlements.get(entitlementKey);
    }
  }

  return {
    success: true,
    order: updatedOrder,
    entitlement,
    subscriptionActive: effectiveItemType === 'employer_subscription',
  };
}

/**
 * Core Idempotent Payment Verification & Fulfillment
 */
export async function processPaymentVerification(
  input: VerifyPaymentInput,
  keySecret: string
): Promise<VerifyPaymentResult> {
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
  } = input;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return {
      success: false,
      error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature.',
      message: 'Verification failed',
    };
  }

  // 1. Signature Verification
  const isMatch = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    keySecret
  );

  if (!isMatch) {
    return {
      success: false,
      error: 'Invalid payment signature. Verification failed.',
      message: 'Signature mismatch',
    };
  }

  // 2. Replay Protection / Idempotency Check
  if (processedPayments.has(razorpay_payment_id)) {
    const existing = processedPayments.get(razorpay_payment_id)!;
    const existingOrder = getStoredOrder(existing.orderId);
    return {
      success: true,
      message: 'Payment already verified and processed (Idempotent replay)',
      payment_id: razorpay_payment_id,
      order_id: existing.orderId,
      subscription_active: existingOrder?.item_type === 'employer_subscription',
      replayed: true,
    };
  }

  // 3. Mark payment as processed in replay cache
  processedPayments.set(razorpay_payment_id, {
    timestamp: Date.now(),
    orderId: razorpay_order_id,
    userId: user_id,
  });

  // 4. Server Owns Authoritative Fulfillment
  const fulfillment = await fulfillSuccessfulPayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    userId: user_id,
    userEmail: user_email,
    userName: user_name,
    itemId: item_id,
    itemType: item_type,
    companyId: company_id,
  });

  return {
    success: true,
    message: 'Payment verified and fulfilled successfully',
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
    entitlement_id: fulfillment.entitlement?.id,
    subscription_active: fulfillment.subscriptionActive,
    replayed: false,
  };
}

/**
 * Handle Failed or Cancelled Payment (From Webhook or Client Callback)
 */
export async function recordFailedPayment(
  orderId: string,
  _paymentId?: string,
  errorCode?: string,
  errorDescription?: string
): Promise<void> {
  const existing = getStoredOrder(orderId);
  if (existing) {
    saveStoredOrder(orderId, {
      ...existing,
      status: 'failed',
      is_paid: false,
      last_error_code: errorCode,
      last_error_message: errorDescription,
      failed_at: new Date().toISOString(),
    });
  }
}

