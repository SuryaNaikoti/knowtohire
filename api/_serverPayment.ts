import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * Authoritative Server-Side Product Catalog & Pricing Definition
 */
export interface CatalogItem {
  id: string;
  type: 'template' | 'knowledge_resource' | 'employer_subscription' | 'candidate_subscription' | 'content_request';
  title: string;
  priceINR: number;
  isFree?: boolean;
  filePath?: string;
  storageBucket?: 'templates' | 'knowledge-hub' | 'content';
}

export const CANONICAL_CATALOG: Record<string, CatalogItem> = {
  // --- Templates ---
  'tmpl-1': {
    id: 'tmpl-1',
    type: 'template',
    title: 'Executive ATS Resume Template — Sustainability & ESG',
    priceINR: 499,
    filePath: 'templates/tmpl-1/sustainability_esg_ats_resume.docx',
    storageBucket: 'templates',
  },
  'sustainability-esg-executive-ats-resume': {
    id: 'tmpl-1',
    type: 'template',
    title: 'Executive ATS Resume Template — Sustainability & ESG',
    priceINR: 499,
    filePath: 'templates/tmpl-1/sustainability_esg_ats_resume.docx',
    storageBucket: 'templates',
  },
  'tmpl-2': {
    id: 'tmpl-2',
    type: 'template',
    title: 'Environmental Impact Assessment (EIA) Consultancy Agreement',
    priceINR: 999,
    filePath: 'templates/tmpl-2/eia_consultancy_agreement_template.docx',
    storageBucket: 'templates',
  },
  'eia-consultancy-master-services-agreement': {
    id: 'tmpl-2',
    type: 'template',
    title: 'Environmental Impact Assessment (EIA) Consultancy Agreement',
    priceINR: 999,
    filePath: 'templates/tmpl-2/eia_consultancy_agreement_template.docx',
    storageBucket: 'templates',
  },
  'tmpl-3': {
    id: 'tmpl-3',
    type: 'template',
    title: 'Corporate ESG Compliance Audit Checklist & Scoring Matrix',
    priceINR: 0,
    isFree: true,
    filePath: 'templates/tmpl-3/corporate_esg_audit_matrix_toolkit.xlsx',
    storageBucket: 'templates',
  },
  'corporate-esg-compliance-audit-checklist': {
    id: 'tmpl-3',
    type: 'template',
    title: 'Corporate ESG Compliance Audit Checklist & Scoring Matrix',
    priceINR: 0,
    isFree: true,
    filePath: 'templates/tmpl-3/corporate_esg_audit_matrix_toolkit.xlsx',
    storageBucket: 'templates',
  },
  'tmpl-4': {
    id: 'tmpl-4',
    type: 'template',
    title: 'Independent Patent Research & Prior Art Search Contract',
    priceINR: 799,
    filePath: 'templates/tmpl-4/patent_research_consultant_contract.docx',
    storageBucket: 'templates',
  },
  'patent-research-consultant-agreement': {
    id: 'tmpl-4',
    type: 'template',
    title: 'Independent Patent Research & Prior Art Search Contract',
    priceINR: 799,
    filePath: 'templates/tmpl-4/patent_research_consultant_contract.docx',
    storageBucket: 'templates',
  },

  // --- Knowledge Hub Resources ---
  'res-tech-1': {
    id: 'res-tech-1',
    type: 'knowledge_resource',
    title: 'Production Kubernetes Infrastructure Blueprint',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-1/kubernetes_infrastructure_guide.pdf',
    storageBucket: 'knowledge-hub',
  },
  'production-kubernetes-infrastructure-blueprint': {
    id: 'res-tech-1',
    type: 'knowledge_resource',
    title: 'Production Kubernetes Infrastructure Blueprint',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-1/kubernetes_infrastructure_guide.pdf',
    storageBucket: 'knowledge-hub',
  },
  'res-tech-2': {
    id: 'res-tech-2',
    type: 'knowledge_resource',
    title: 'Infrastructure as Code with Terraform & AWS',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-2/terraform_aws_iac_handbook.pdf',
    storageBucket: 'knowledge-hub',
  },
  'infrastructure-as-code-terraform-aws': {
    id: 'res-tech-2',
    type: 'knowledge_resource',
    title: 'Infrastructure as Code with Terraform & AWS',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-2/terraform_aws_iac_handbook.pdf',
    storageBucket: 'knowledge-hub',
  },
  'res-tech-3': {
    id: 'res-tech-3',
    type: 'knowledge_resource',
    title: 'Enterprise System Architecture & Microservices Design',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-3/enterprise_microservices_architecture.pdf',
    storageBucket: 'knowledge-hub',
  },
  'enterprise-system-architecture-microservices-design': {
    id: 'res-tech-3',
    type: 'knowledge_resource',
    title: 'Enterprise System Architecture & Microservices Design',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-3/enterprise_microservices_architecture.pdf',
    storageBucket: 'knowledge-hub',
  },
  'res-1': {
    id: 'res-1',
    type: 'knowledge_resource',
    title: 'Environmental Compliance Calendar & SPCB Guide 2026',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-1/environmental_compliance_calendar_2026.pdf',
    storageBucket: 'knowledge-hub',
  },
  'environmental-compliance-calendar-spcb-guide-2026': {
    id: 'res-1',
    type: 'knowledge_resource',
    title: 'Environmental Compliance Calendar & SPCB Guide 2026',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-1/environmental_compliance_calendar_2026.pdf',
    storageBucket: 'knowledge-hub',
  },
  'res-2': {
    id: 'res-2',
    type: 'knowledge_resource',
    title: 'Patent Filing & IPR Guide for Tech Startups',
    priceINR: 499,
    filePath: 'resources/res-2/patent_filing_ipr_startups.pdf',
    storageBucket: 'knowledge-hub',
  },
  'patent-filing-ipr-guide-tech-startups': {
    id: 'res-2',
    type: 'knowledge_resource',
    title: 'Patent Filing & IPR Guide for Tech Startups',
    priceINR: 499,
    filePath: 'resources/res-2/patent_filing_ipr_startups.pdf',
    storageBucket: 'knowledge-hub',
  },

  // --- Subscriptions ---
  'sub_starter_monthly': {
    id: 'sub_starter_monthly',
    type: 'employer_subscription',
    title: 'KnowToHire Employer Starter (Monthly)',
    priceINR: 1499,
  },
  'sub_starter_annual': {
    id: 'sub_starter_annual',
    type: 'employer_subscription',
    title: 'KnowToHire Employer Starter (Annual)',
    priceINR: 14388,
  },
  'sub_enterprise_monthly': {
    id: 'sub_enterprise_monthly',
    type: 'employer_subscription',
    title: 'KnowToHire Enterprise Hiring (Monthly)',
    priceINR: 4999,
  },
  'sub_enterprise_annual': {
    id: 'sub_enterprise_annual',
    type: 'employer_subscription',
    title: 'KnowToHire Enterprise Hiring (Annual)',
    priceINR: 47988,
  },
};

export function getAuthoritativeItem(itemId: string, _itemType?: string): CatalogItem | null {
  if (!itemId) return null;
  const canonical = CANONICAL_CATALOG[itemId];
  if (canonical) return canonical;

  if (itemId.startsWith('sub_')) {
    const key = itemId.toLowerCase();
    if (CANONICAL_CATALOG[key]) return CANONICAL_CATALOG[key];
  }

  return null;
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

// In-memory cache optimization (Secondary layer, not correctness layer)
declare global {
  // eslint-disable-next-line no-var
  var __kth_orders: Map<string, StoredOrder> | undefined;
  // eslint-disable-next-line no-var
  var __kth_processed_payments: Map<string, { timestamp: number; orderId: string; userId?: string }> | undefined;
  // eslint-disable-next-line no-var
  var __kth_server_entitlements: Map<string, ServerEntitlement> | undefined;
  // eslint-disable-next-line no-var
  var __kth_processed_webhooks: Map<string, { status: 'pending' | 'processed' | 'failed'; timestamp: number; lease: number; leaseToken?: string }> | undefined;
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
if (!globalThis.__kth_processed_webhooks) {
  globalThis.__kth_processed_webhooks = new Map<string, { status: 'pending' | 'processed' | 'failed'; timestamp: number; lease: number; leaseToken?: string }>();
}

export const orderStorage = globalThis.__kth_orders;
export const processedPayments = globalThis.__kth_processed_payments;
export const serverEntitlements = globalThis.__kth_server_entitlements;
export const processedWebhooks = globalThis.__kth_processed_webhooks;

/**
 * Server-Side Supabase Client (Uses service role key in serverless environment)
 * Never exported to client or logs.
 */
export function getServerSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || 'https://roqbodprqmnwxdjsskgb.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

  return createClient(url, serviceKey || anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getStoredOrder(orderId: string): StoredOrder | null {
  return orderStorage.get(orderId) || null;
}

export function saveStoredOrder(orderId: string, orderData: StoredOrder): void {
  orderStorage.set(orderId, orderData);
}

/**
 * Loads the trusted persistent payment order from Supabase or memory.
 * Never trusts arbitrary client overrides.
 */
export async function loadPersistentPaymentOrder(
  providerOrderId: string,
  providerPaymentId?: string
): Promise<StoredOrder | null> {
  // 1. Check in-memory store
  const cached = orderStorage.get(providerOrderId);
  if (cached) return cached;

  // 2. Query persistent Supabase payment_orders if service key available
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = getServerSupabaseClient();
      let query = supabase.from('payment_orders').select('*');
      if (providerPaymentId) {
        query = query.or(`provider_order_id.eq.${providerOrderId},provider_payment_id.eq.${providerPaymentId}`);
      } else {
        query = query.eq('provider_order_id', providerOrderId);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (!error && data) {
        const loaded: StoredOrder = {
          id: data.id,
          provider_order_id: data.provider_order_id || providerOrderId,
          payment_id: data.provider_payment_id || providerPaymentId,
          amount_inr: Number(data.amount_inr) || 0,
          currency: data.currency || 'INR',
          status: data.status,
          user_id: data.user_id,
          customer_email: data.customer_email,
          customer_name: data.customer_name,
          item_id: data.product_id,
          item_type: data.product_type,
          product_title: data.product_title,
          company_id: data.company_id,
          is_paid: data.is_paid || data.status === 'paid',
          paid_at: data.paid_at,
          created_at: data.created_at,
        };
        orderStorage.set(providerOrderId, loaded);
        return loaded;
      }
    } catch {
      // Fall through to memory check
    }
  }

  return null;
}

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

    if (expectedSignature.length !== signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

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

    if (expectedSignature.length !== receivedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(receivedSignature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Atomic Webhook Event Claim
 * Prevents multiple Vercel instances from concurrently processing the same event.
 * Uses persistent DB RPC with SELECT FOR UPDATE and lease-owner fencing tokens.
 * Fails closed if the database is configured but throws an error.
 */
export async function claimWebhookEvent(
  eventId: string,
  eventType: string,
  payload: any,
  leaseSeconds = 60,
  workerToken?: string
): Promise<{
  claimed: boolean;
  status: 'claimed' | 'already_processed' | 'in_flight' | 'error';
  leaseToken: string;
  errorMessage?: string;
}> {
  const leaseToken = workerToken || `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();

  // 1. Check in-memory lease first (fast local rejection)
  const cached = processedWebhooks.get(eventId);
  if (cached) {
    if (cached.status === 'processed') {
      return { claimed: false, status: 'already_processed', leaseToken: cached.leaseToken || '' };
    }
    if (cached.status === 'pending' && cached.lease > now) {
      return { claimed: false, status: 'in_flight', leaseToken: cached.leaseToken || '' };
    }
  }

  // 2. Set memory lease immediately as fast local fence
  processedWebhooks.set(eventId, {
    status: 'pending',
    timestamp: now,
    lease: now + leaseSeconds * 1000,
    leaseToken,
  });

  // 3. Persistent DB-backed atomic RPC if Supabase service role is present
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = getServerSupabaseClient();
      const { data, error } = await supabase.rpc('claim_payment_webhook_event', {
        p_event_id: eventId,
        p_event_type: eventType,
        p_provider: 'razorpay',
        p_payload: payload,
        p_lease_token: leaseToken,
        p_lease_seconds: leaseSeconds,
      });

      if (error) {
        // FAIL CLOSED: Do not proceed if durable claiming fails
        processedWebhooks.delete(eventId);
        return { claimed: false, status: 'error', leaseToken, errorMessage: error.message };
      }

      if (data && data[0]) {
        const claimResult = data[0].status;
        const assignedToken = data[0].lease_token || leaseToken;

        if (claimResult === 'already_processed') {
          processedWebhooks.set(eventId, { status: 'processed', timestamp: now, lease: 0, leaseToken: assignedToken });
          return { claimed: false, status: 'already_processed', leaseToken: assignedToken };
        }
        if (claimResult === 'in_flight') {
          return { claimed: false, status: 'in_flight', leaseToken: assignedToken };
        }
        if (claimResult === 'claimed') {
          return { claimed: true, status: 'claimed', leaseToken: assignedToken };
        }
        return { claimed: false, status: 'error', leaseToken, errorMessage: data[0].error_message || 'Claim rejected' };
      }
    } catch (err: any) {
      // FAIL CLOSED: Database outage must reject execution and allow gateway retry
      processedWebhooks.delete(eventId);
      return { claimed: false, status: 'error', leaseToken, errorMessage: err?.message || 'Database connection error during claim' };
    }
  }

  return { claimed: true, status: 'claimed', leaseToken };
}

/**
 * Finalizes webhook processing state atomically with lease fencing verification
 */
export async function completeWebhookEvent(
  eventId: string,
  status: 'processed' | 'failed',
  leaseToken: string,
  errorMessage?: string,
  orderId?: string
): Promise<{ success: boolean; message?: string }> {
  // Update memory state
  processedWebhooks.set(eventId, {
    status,
    timestamp: Date.now(),
    lease: 0,
    leaseToken,
  });

  // Update persistent DB state if available
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = getServerSupabaseClient();
      const { data, error } = await supabase.rpc('complete_payment_webhook_event', {
        p_event_id: eventId,
        p_status: status,
        p_lease_token: leaseToken,
        p_error: errorMessage || null,
        p_order_id: orderId || null,
      });

      if (error) {
        return { success: false, message: error.message };
      }
      if (data && data[0]) {
        return { success: data[0].success, message: data[0].message };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Database error during completion' };
    }
  }

  return { success: true };
}

/**
 * Persistent Payment Verification Claim
 * Atomically marks payment order as paid in the database or detects existing paid record.
 * Fails closed if the database is configured but encounters an error.
 */
export async function claimPaymentVerification(params: {
  paymentId: string;
  orderId: string;
  amountInr: number;
  userId?: string;
  productType?: string;
  productId?: string;
  productTitle?: string;
}): Promise<{
  claimed: boolean;
  status: 'claimed' | 'already_processed' | 'error';
  orderId?: string;
  errorMessage?: string;
}> {
  const { paymentId, orderId, amountInr, userId, productType, productId, productTitle } = params;

  // 1. In-memory check for immediate replay detection
  if (processedPayments.has(paymentId)) {
    const existing = processedPayments.get(paymentId)!;
    return {
      claimed: false,
      status: 'already_processed',
      orderId: existing.orderId,
    };
  }

  // 2. Persistent database atomic claim if service role key configured
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = getServerSupabaseClient();
      const { data, error } = await supabase.rpc('claim_payment_verification', {
        p_payment_id: paymentId,
        p_order_id: orderId,
        p_amount_inr: amountInr,
        p_user_id: userId || null,
        p_product_type: productType || null,
        p_product_id: productId || null,
        p_product_title: productTitle || null,
      });

      if (error) {
        // FAIL CLOSED: Do not allow unverified fulfillment on persistent database failure
        return { claimed: false, status: 'error', errorMessage: error.message };
      }

      if (data && data[0]) {
        const claimStatus = data[0].status;
        const verifiedOrderId = data[0].order_id || orderId;

        if (claimStatus === 'already_processed') {
          processedPayments.set(paymentId, { timestamp: Date.now(), orderId: verifiedOrderId, userId });
          return { claimed: false, status: 'already_processed', orderId: verifiedOrderId };
        }

        if (claimStatus === 'claimed') {
          processedPayments.set(paymentId, { timestamp: Date.now(), orderId: verifiedOrderId, userId });
          return { claimed: true, status: 'claimed', orderId: verifiedOrderId };
        }
      }
    } catch (err: any) {
      // FAIL CLOSED: Database outage must prevent double fulfillment
      return { claimed: false, status: 'error', errorMessage: err?.message || 'Database outage during payment verification' };
    }
  }

  // Fallback to local memory lock when service role key not configured (e.g. testing)
  processedPayments.set(paymentId, { timestamp: Date.now(), orderId, userId });
  return { claimed: true, status: 'claimed', orderId };
}

/**
 * Authoritative Fulfillment
 * Idempotently creates user purchases, provisions subscriptions, and records paid orders.
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
  const existingOrder = getStoredOrder(orderId);

  const effectiveUserId = existingOrder?.user_id || params.userId;
  const effectiveItemId = existingOrder?.item_id || params.itemId;
  const rawItemType = existingOrder?.item_type || params.itemType;
  const effectiveCompanyId = existingOrder?.company_id || params.companyId;

  let catalogItem: CatalogItem | null = null;
  if (effectiveItemId) {
    catalogItem = getAuthoritativeItem(effectiveItemId, rawItemType);
  }

  const effectiveItemType = catalogItem?.type || (rawItemType as any) || 'knowledge_resource';
  const canonicalPriceINR = catalogItem?.priceINR ?? existingOrder?.amount_inr ?? 0;
  const canonicalTitle = catalogItem?.title || existingOrder?.product_title || 'KnowToHire Resource';

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

  // Persistent Entitlement Creation (Enforced by Database Unique Constraint)
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

    // Write to persistent Supabase user_purchases if service key or credentials available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = getServerSupabaseClient();
      const { error: upsertErr } = await supabase.from('user_purchases').upsert({
        user_id: effectiveUserId,
        product_type: effectiveItemType,
        product_id: canonicalProductId,
        product_title: canonicalTitle,
        amount_inr: canonicalPriceINR,
        payment_id: paymentId,
        purchased_at: new Date().toISOString(),
      }, { onConflict: 'user_id,product_type,product_id' });

      if (upsertErr) {
        // PROPAGATE REQUIRED ENTITLEMENT ERROR: Never falsely report success when entitlement fails
        throw new Error(`Failed to grant user purchase entitlement: ${upsertErr.message}`);
      }
    }
  }

  // Persistent Subscription Synchronization
  if (effectiveItemType === 'employer_subscription') {
    const tier = effectiveItemId?.includes('enterprise') ? 'enterprise' : 'starter';
    const isAnnual = effectiveItemId?.includes('annual');
    const durationMs = (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && effectiveCompanyId) {
      const supabase = getServerSupabaseClient();
      
      // Fetch current subscription status to prevent shortening or duplicate extension
      const { data: currentComp, error: fetchErr } = await supabase
        .from('company_profiles')
        .select('subscription_tier, subscription_status, subscription_expires_at, subscription_order_id')
        .eq('id', effectiveCompanyId)
        .maybeSingle();

      if (fetchErr) {
        throw new Error(`Failed to query company profile for subscription update: ${fetchErr.message}`);
      }

      // Check if this exact order was already applied to the company profile (Replay / Retry)
      const isSameOrderReplay = currentComp?.subscription_order_id === orderId && currentComp?.subscription_status === 'active';

      let expiresAt: string;
      if (isSameOrderReplay && currentComp?.subscription_expires_at) {
        // Keep existing expiration timestamp intact; DO NOT reset or alter on replay!
        expiresAt = currentComp.subscription_expires_at;
      } else {
        // Genuine new subscription or renewal
        const now = Date.now();
        const currentExpiry = currentComp?.subscription_expires_at ? new Date(currentComp.subscription_expires_at).getTime() : 0;
        
        // If current subscription is active and still valid in the future, extend from current expiry; otherwise from now
        const baseTime = (currentComp?.subscription_status === 'active' && currentExpiry > now)
          ? currentExpiry
          : now;

        expiresAt = new Date(baseTime + durationMs).toISOString();
      }

      const { error: subErr } = await supabase.from('company_profiles').update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_billing_cycle: isAnnual ? 'annual' : 'monthly',
        subscription_expires_at: expiresAt,
        subscription_order_id: orderId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? orderId : null,
        subscription_updated_at: new Date().toISOString(),
      }).eq('id', effectiveCompanyId);

      if (subErr) {
        // PROPAGATE REQUIRED SUBSCRIPTION ERROR: Never report success if company subscription fails
        throw new Error(`Failed to update company subscription: ${subErr.message}`);
      }
    }
  }

  return {
    success: true,
    order: updatedOrder,
    entitlement,
    subscriptionActive: effectiveItemType === 'employer_subscription',
  };
}

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
