/**
 * KnowToHire Payment Service Layer
 * Clean provider-agnostic facade coordinating order creation, checkout initiation,
 * and entitlement tracking.
 *
 * CURRENT PHASE: "Simulated Checkout" (Cashfree not integrated yet)
 * - Provides a complete purchase workflow simulation (select → cart → pay → download).
 * - NO real Cashfree API calls, no live payments, no real card processing.
 * - Generates simulated order IDs and transaction IDs for UI flow continuity.
 * - Works without Supabase auth for public-facing purchase buttons.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from '../types';
import {
  CreateOrderRequest,
  CreateOrderResult,
  VerifyPaymentRequest,
  VerifyPaymentResult,
  PaymentProductType,
} from './types';

export interface LegacyCheckoutOptions {
  itemType: 'template' | 'resource' | 'content_request' | 'candidate_subscription' | 'employer_subscription' | 'job_post';
  itemId: string;
  itemName: string;
  amountINR: number;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

/**
 * Result of a simulated checkout flow
 */
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

/**
 * Generate a human-readable order number
 */
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(100000 + Math.random() * 900000);
  return `KTH-${year}-${seq}`;
}

/**
 * Generate a unique order ID
 */
function generateOrderId(): string {
  return `kth_ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate a simulated payment/transaction ID
 */
function generateTransactionId(): string {
  return `pay_sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
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
   * Verify Payment Status (simulated — always returns successful for demo)
   */
  public async verifyPayment(_req: VerifyPaymentRequest): Promise<ServiceResult<VerifyPaymentResult>> {
    return {
      data: {
        isVerified: true,
        orderStatus: 'paid',
        transactionId: generateTransactionId(),
        paidAmountINR: 0,
        paidAt: new Date().toISOString(),
        message: 'Simulated payment verified successfully.',
      },
      error: null,
    };
  }

  /**
   * Simulated Checkout Flow
   * 
   * This is the primary method called by all purchase buttons across the platform.
   * It simulates a complete payment cycle:
   * 1. Creates an order record
   * 2. Simulates a brief "processing" delay (1.5 seconds)
   * 3. Returns a successful payment result
   * 4. Calls onSuccess callback to enable download
   *
   * Works without authentication for public-facing buttons.
   * When auth is available, optionally records to orders table.
   */
  public async initiateCheckout(
    options: LegacyCheckoutOptions
  ): Promise<ServiceResult<SimulatedCheckoutResult>> {
    try {
      const orderId = generateOrderId();
      const orderNumber = generateOrderNumber();
      const transactionId = generateTransactionId();

      // Simulate payment processing delay (realistic UX)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Optionally record to database if user is authenticated
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('orders').insert({
            user_id: userData.user.id,
            total_amount: options.amountINR,
            status: 'paid',
            payment_id: transactionId,
          }).then(() => { /* ignore errors — table may not exist */ });
        }
      } catch {
        // DB recording is optional in simulation phase
      }

      const result: SimulatedCheckoutResult = {
        success: true,
        transactionId,
        orderId,
        orderNumber,
        amountINR: options.amountINR,
        paidAt: new Date().toISOString(),
        productType: options.itemType,
        productId: options.itemId,
      };

      // Call success callback
      if (options.onSuccess) {
        options.onSuccess(transactionId);
      }

      return { data: result, error: null };
    } catch (err) {
      if (options.onCancel) {
        options.onCancel();
      }
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * Check if a product has been "purchased" in the current session.
   * Uses sessionStorage to track simulated purchases.
   */
  public isPurchased(productId: string): boolean {
    try {
      const purchases = JSON.parse(sessionStorage.getItem('kth_purchases') || '{}');
      return !!purchases[productId];
    } catch {
      return false;
    }
  }

  /**
   * Record a simulated purchase in session storage.
   */
  public recordPurchase(productId: string, transactionId: string): void {
    try {
      const purchases = JSON.parse(sessionStorage.getItem('kth_purchases') || '{}');
      purchases[productId] = {
        transactionId,
        purchasedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('kth_purchases', JSON.stringify(purchases));
    } catch {
      // Silently fail if sessionStorage is unavailable
    }
  }

  /**
   * Get the mapped PaymentProductType from a legacy item type string.
   */
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
