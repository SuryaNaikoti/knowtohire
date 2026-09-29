/**
 * KnowToHire Payment Service Layer
 * Clean provider-agnostic facade coordinating order creation, checkout initiation,
 * and entitlement tracking.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from '../types';
import {
  CreateOrderRequest,
  CreateOrderResult,
  VerifyPaymentRequest,
  VerifyPaymentResult,
  PaymentProductType,
} from './types';
import { openRazorpayCheckout } from './razorpayClient';
import { entitlementService } from './entitlementService';
import { getAuthoritativeItem } from './authoritativePricing';

export interface LegacyCheckoutOptions {
  itemType: 'template' | 'resource' | 'content_request' | 'candidate_subscription' | 'employer_subscription' | 'job_post';
  itemId: string;
  itemName: string;
  amountINR: number;
  provider?: 'razorpay' | 'simulated';
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  userId?: string;
  companyId?: string;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

export interface SimulatedCheckoutResult {
  success: boolean;
  transactionId: string;
  orderId: string;
  orderNumber: string;
  amountINR: number;
  paidAt: string;
  productType: string;
  productId: string;
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(100000 + Math.random() * 900000);
  return `KTH-${year}-${seq}`;
}

function generateOrderId(): string {
  return `kth_ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

class UnifiedPaymentService {
  /**
   * Canonical Order Creation (Prepares internal KnowToHire order record)
   */
  public async createOrder(req: CreateOrderRequest): Promise<ServiceResult<CreateOrderResult>> {
    try {
      const orderId = generateOrderId();
      const orderNumber = generateOrderNumber();

      return {
        data: {
          orderId,
          orderNumber,
          amountINR: req.customAmountINR || 0,
          currency: 'INR',
          provider: 'none',
          status: 'created',
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * Verify Payment Status
   */
  public async verifyPayment(req: VerifyPaymentRequest): Promise<ServiceResult<VerifyPaymentResult>> {
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      return {
        data: {
          isVerified: Boolean(data.success),
          orderStatus: data.success ? 'paid' : 'failed',
          transactionId: data.payment_id,
          paidAmountINR: data.amount_inr,
          paidAt: new Date().toISOString(),
          message: data.message || 'Payment status resolved',
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * Primary Checkout Initiation
   */
  public async initiateCheckout(
    options: LegacyCheckoutOptions
  ): Promise<ServiceResult<SimulatedCheckoutResult>> {
    try {
      // 1. Resolve Current User ID & Customer Info
      let effectiveUserId = options.userId;
      let effectiveCustomerEmail = options.customer?.email;
      let effectiveCustomerName = options.customer?.name;

      if (isSupabaseConfigured()) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            effectiveUserId = effectiveUserId || authData.user.id;
            effectiveCustomerEmail = effectiveCustomerEmail || authData.user.email;
            effectiveCustomerName = effectiveCustomerName || (authData.user.user_metadata?.full_name as string);
          }
        } catch {
          // ignore
        }
      }

      if (!effectiveUserId && typeof window !== 'undefined' && window.localStorage) {
        try {
          const demoRaw = window.localStorage.getItem('kth_demo_auth_session');
          if (demoRaw) {
            const demo = JSON.parse(demoRaw);
            effectiveUserId = effectiveUserId || demo.id;
            effectiveCustomerEmail = effectiveCustomerEmail || demo.email;
            effectiveCustomerName = effectiveCustomerName || demo.full_name;
          }
        } catch {
          // ignore
        }
      }

      // 2. Authoritative Price Resolution
      const catalogItem = getAuthoritativeItem(options.itemId, options.itemType);
      const finalPriceINR = catalogItem ? catalogItem.priceINR : options.amountINR;

      // 3. Razorpay Standard Checkout Flow
      return new Promise((resolve) => {
        openRazorpayCheckout({
          amountINR: finalPriceINR,
          name: 'KnowToHire',
          description: catalogItem?.title || options.itemName,
          receipt: `rcpt_${options.itemType}_${Date.now()}`,
          notes: {
            itemId: options.itemId,
            itemType: options.itemType,
          },
          prefill: {
            name: effectiveCustomerName || '',
            email: effectiveCustomerEmail || '',
            contact: options.customer?.phone || '',
          },
          itemId: options.itemId,
          itemType: options.itemType,
          userId: effectiveUserId,
          companyId: options.companyId,
          onSuccess: async (rzpRes) => {
            const resResult: SimulatedCheckoutResult = {
              success: true,
              transactionId: rzpRes.razorpay_payment_id,
              orderId: rzpRes.razorpay_order_id,
              orderNumber: generateOrderNumber(),
              amountINR: finalPriceINR,
              paidAt: new Date().toISOString(),
              productType: options.itemType,
              productId: options.itemId,
            };

            // Authoritatively persist order in Supabase payment_orders
            if (isSupabaseConfigured() && effectiveUserId) {
              try {
                await supabase.from('payment_orders').insert({
                  order_number: resResult.orderNumber,
                  user_id: effectiveUserId,
                  product_type: options.itemType === 'resource' ? 'knowledge_resource' : options.itemType,
                  product_id: options.itemId,
                  product_title: options.itemName,
                  amount_inr: finalPriceINR,
                  currency: 'INR',
                  status: 'paid',
                  provider: 'razorpay',
                  provider_order_id: rzpRes.razorpay_order_id,
                  customer_name: effectiveCustomerName,
                  customer_email: effectiveCustomerEmail,
                  customer_phone: options.customer?.phone,
                  is_paid: true,
                  paid_at: new Date().toISOString(),
                });
              } catch (dbErr) {
                console.warn('[UnifiedPaymentService] Supabase payment_orders insert warning:', dbErr);
              }
            }

            // Record into Creator Sales Ledger if template or resource
            try {
              if (options.itemType === 'template' || options.itemType === 'resource') {
                const commissionRate = 70;
                const commissionINR = Math.round(((finalPriceINR * commissionRate) / 100) * 100) / 100;

                if (typeof window !== 'undefined' && window.localStorage) {
                  const salesRaw = window.localStorage.getItem('kth_creator_sales_data');
                  const salesList = salesRaw ? JSON.parse(salesRaw) : [];
                  const newSale = {
                    id: `sale-${Date.now()}`,
                    itemId: options.itemId,
                    itemTitle: options.itemName,
                    itemType: options.itemType,
                    amountINR: finalPriceINR,
                    commissionINR,
                    commissionStatus: 'available',
                    purchasedAt: new Date().toISOString(),
                    buyerEmail: effectiveCustomerEmail || 'customer@knowtohire.com',
                  };
                  salesList.unshift(newSale);
                  window.localStorage.setItem('kth_creator_sales_data', JSON.stringify(salesList));
                  window.dispatchEvent(new CustomEvent('kth_creator_data_changed'));
                }
              }
            } catch {
              // ignore
            }

            if (options.onSuccess) {
              options.onSuccess(rzpRes.razorpay_payment_id);
            }
            resolve({ data: resResult, error: null });
          },
          onDismiss: () => {
            if (options.onCancel) {
              options.onCancel();
            }
            resolve({
              data: null,
              error: { message: 'Payment cancelled by user', code: 'PAYMENT_CANCELLED' },
            });
          },
          onError: (err) => {
            if (options.onCancel) {
              options.onCancel();
            }
            resolve({
              data: null,
              error: { message: err.message || 'Payment failed', code: 'PAYMENT_ERROR' },
            });
          },
        });
      });
    } catch (err) {
      if (options.onCancel) {
        options.onCancel();
      }
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * Check if a product has been purchased.
   * Supabase + verified Razorpay payment state is authoritative.
   */
  public async isPurchased(productId: string, userId?: string): Promise<boolean> {
    return entitlementService.hasPurchased(productId, userId);
  }

  /**
   * Record verified purchase in authoritative entitlement store.
   */
  public async recordPurchase(
    productId: string,
    transactionId: string,
    userId?: string,
    itemType: 'template' | 'knowledge_resource' = 'template',
    title: string = 'Digital Resource'
  ): Promise<void> {
    let effectiveUserId = userId;
    if (!effectiveUserId && typeof window !== 'undefined' && window.localStorage) {
      try {
        const demoAuth = window.localStorage.getItem('kth_demo_auth_session');
        if (demoAuth) effectiveUserId = JSON.parse(demoAuth)?.id;
      } catch {
        // ignore
      }
    }

    if (effectiveUserId) {
      await entitlementService.recordPurchase({
        userId: effectiveUserId,
        productType: itemType,
        productId,
        productTitle: title,
        amountINR: 0,
        paymentId: transactionId,
      });
    }
  }

  public mapItemType(itemType: LegacyCheckoutOptions['itemType']): PaymentProductType {
    const map: Record<LegacyCheckoutOptions['itemType'], PaymentProductType> = {
      template: 'template',
      resource: 'knowledge_resource',
      content_request: 'content_request',
      candidate_subscription: 'candidate_subscription',
      employer_subscription: 'employer_subscription',
      job_post: 'job_post',
    };
    return map[itemType] || 'future_service';
  }
}

export const paymentService = new UnifiedPaymentService();
export { entitlementService } from './entitlementService';
export { subscriptionService } from './subscriptionService';
export { getAuthoritativeItem } from './authoritativePricing';
