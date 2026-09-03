/**
 * KnowToHire Payment Service Layer
 * Clean provider-agnostic facade coordinating order creation, checkout initiation,
 * and entitlement tracking.
 *
 * CURRENT PHASE: "Architecture Readiness Only"
 * - Decouples application UI from payment gateway specifics.
 * - Guarantees zero live Cashfree API calls or checkout popups.
 * - Preserves existing demo/test flow compatibility for on-demand requests, templates, and pricing.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResult, normalizeServiceError } from '../types';
import {
  PaymentProvider,
  CreateOrderRequest,
  CreateOrderResult,
  VerifyPaymentRequest,
  VerifyPaymentResult,
} from './types';
import { CashfreeProvider } from './cashfreeProvider';
import { getClientPaymentConfig } from './cashfreeConfig';

export interface LegacyCheckoutOptions {
  itemType: 'template' | 'resource' | 'content_request' | 'candidate_subscription' | 'employer_subscription' | 'job_post';
  itemId: string;
  itemName: string;
  amountINR: number;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

class UnifiedPaymentService {
  private provider: PaymentProvider;

  constructor() {
    const config = getClientPaymentConfig();
    this.provider = new CashfreeProvider(config.environment);
  }

  /**
   * Return the registered payment provider instance (CashfreeProvider)
   */
  public getProvider(): PaymentProvider {
    return this.provider;
  }

  /**
   * Canonical Order Creation (Prepares internal KnowToHire order record)
   */
  public async createOrder(req: CreateOrderRequest): Promise<ServiceResult<CreateOrderResult>> {
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        return {
          data: null,
          error: { message: 'Authentication required to create a payment order.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const orderId = `kth_ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const orderNumber = `KTH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      return {
        data: {
          orderId,
          orderNumber,
          amountINR: req.customAmountINR || 0,
          currency: 'INR',
          provider: 'cashfree',
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
      const result = await this.provider.verifyPayment(req);
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }

  /**
   * Backward-Compatible initiateCheckout
   * Maintains existing platform functionality across Pricing, Template Details, and Content Requests
   * without opening real Cashfree checkouts or making live gateway requests.
   */
  public async initiateCheckout(
    options: LegacyCheckoutOptions
  ): Promise<ServiceResult<{ success: boolean; transactionId?: string }>> {
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData?.user) {
        return {
          data: null,
          error: { message: 'Please sign in to proceed with checkout.', code: 'UNAUTHORIZED', status: 401 },
        };
      }

      const userId = userData.user.id;

      // In production preparation phase, inform user / invoke callbacks safely
      // Preserve existing non-breaking developer/sandbox simulation behaviour
      const simulatedPaymentId = `pay_sim_${Date.now()}`;

      // Gracefully attempt DB recording if orders table exists, otherwise ignore
      try {
        await supabase.from('orders').insert({
          user_id: userId,
          total_amount: options.amountINR,
          status: 'pending',
        });
      } catch {
        // Table not required in frontend preparation phase
      }

      if (options.onSuccess) {
        options.onSuccess(simulatedPaymentId);
      }

      return {
        data: { success: true, transactionId: simulatedPaymentId },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  }
}

export const paymentService = new UnifiedPaymentService();
