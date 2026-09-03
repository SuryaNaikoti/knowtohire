/**
 * KnowToHire Payment & Monetization Architecture Contracts
 * Provider-agnostic payment and order abstractions.
 *
 * ARCHITECTURAL BOUNDARY:
 * - Independent of specific gateways (Cashfree, Razorpay, etc.)
 * - Zero client-side secrets
 * - Strongly typed product entitlements and lifecycle states
 */

export type PaymentEnvironment = 'sandbox' | 'production';

/**
 * Product & Entitlement Types supported across the KnowToHire platform
 */
export type PaymentProductType =
  | 'knowledge_resource'
  | 'template'
  | 'content_request'
  | 'candidate_subscription'
  | 'employer_subscription'
  | 'job_post'
  | 'future_service';

/**
 * Canonical Internal Payment Status Model
 * Completely decoupled from gateway-specific status codes.
 */
export type PaymentOrderStatus =
  | 'created'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Canonical Transaction State Model
 */
export type PaymentTransactionStatus =
  | 'initiated'
  | 'pending'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'user_dropped';

/**
 * Canonical Refund Status Model
 */
export type PaymentRefundStatus =
  | 'pending'
  | 'processed'
  | 'failed';

/**
 * Customer / Payer Information
 */
export interface PaymentCustomer {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
}

/**
 * Purchased Line Item Details
 */
export interface PaymentItem {
  productType: PaymentProductType;
  productId: string;
  title: string;
  unitAmountINR: number;
  quantity?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Canonical Payment Order Entity
 */
export interface PaymentOrder {
  id: string; // Internal Order UUID (KnowToHire canonical ID)
  orderNumber: string; // Human-friendly order reference (e.g. KTH-ORD-2026-XXXXX)
  userId: string;
  customer: PaymentCustomer;
  item: PaymentItem;
  amountINR: number;
  currency: 'INR';
  status: PaymentOrderStatus;
  provider: 'cashfree' | 'none';
  providerOrderId?: string | null; // e.g. Cashfree order_id
  providerSessionId?: string | null; // e.g. Cashfree payment_session_id
  isPaid: boolean;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Canonical Payment Transaction Entity (For ledger auditability)
 */
export interface PaymentTransaction {
  id: string; // Internal Transaction UUID
  orderId: string; // Foreign Key to PaymentOrder.id
  provider: 'cashfree' | 'none';
  providerTransactionId?: string | null; // e.g. Cashfree payment_id (cf_payment_id)
  amountINR: number;
  currency: 'INR';
  status: PaymentTransactionStatus;
  paymentMethod?: string | null; // 'upi' | 'card' | 'netbanking' | 'wallet'
  errorCode?: string | null;
  errorMessage?: string | null;
  rawResponse?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Canonical Refund Entity (For audit & reconciliation)
 */
export interface PaymentRefund {
  id: string;
  orderId: string;
  transactionId: string;
  providerRefundId?: string | null;
  amountINR: number;
  reason?: string | null;
  status: PaymentRefundStatus;
  processedAt?: string | null;
  createdAt: string;
}

/**
 * Request payload when creating a new order
 */
export interface CreateOrderRequest {
  productType: PaymentProductType;
  productId: string;
  customer?: Partial<PaymentCustomer>;
  customAmountINR?: number; // Validated server-side against catalog price
  notes?: Record<string, string>;
  returnUrl?: string;
}

/**
 * Result returned after order initialization
 */
export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  amountINR: number;
  currency: 'INR';
  provider: 'cashfree' | 'none';
  providerOrderId?: string;
  paymentSessionId?: string; // Token needed by client-side checkout in future phase
  status: PaymentOrderStatus;
}

/**
 * Payment Verification Query & Response
 */
export interface VerifyPaymentRequest {
  orderId: string;
  providerOrderId?: string;
  providerPaymentId?: string;
}

export interface VerifyPaymentResult {
  isVerified: boolean;
  orderStatus: PaymentOrderStatus;
  transactionId?: string;
  paidAmountINR?: number;
  paidAt?: string;
  message: string;
}

/**
 * Webhook Verification & Processing Contracts
 */
export interface WebhookEventPayload {
  rawBody: string; // Raw unparsed request body string (CRITICAL for HMAC SHA256 signature verification)
  signature: string; // Signature from header (e.g. x-webhook-signature)
  timestamp: string; // Timestamp from header (e.g. x-webhook-timestamp)
  eventType: string; // e.g. 'PAYMENT_SUCCESS_WEBHOOK', 'PAYMENT_FAILED_WEBHOOK'
}

export interface ProcessWebhookResult {
  handled: boolean;
  isDuplicate: boolean;
  orderId?: string;
  status?: PaymentOrderStatus;
  message: string;
}

/**
 * Provider-Agnostic Payment Provider Contract
 * Any future payment gateway (Cashfree, etc.) must fulfill this interface.
 */
export interface PaymentProvider {
  readonly name: 'cashfree' | 'none';
  readonly environment: PaymentEnvironment;

  /**
   * Create an order with the payment gateway (Server-Side Only).
   */
  createOrder(order: PaymentOrder): Promise<{
    providerOrderId: string;
    paymentSessionId?: string;
  }>;

  /**
   * Query the latest order status from the gateway (Server-Side Only).
   */
  getOrderStatus(providerOrderId: string): Promise<{
    status: PaymentOrderStatus;
    amountPaidINR: number;
    transactionId?: string;
  }>;

  /**
   * Verify server-side payment confirmation without trusting client payloads.
   */
  verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResult>;

  /**
   * Validate and parse incoming webhook signatures using raw payload.
   */
  handleWebhook(payload: WebhookEventPayload): Promise<ProcessWebhookResult>;
}
