/**
 * Razorpay Standard Web Checkout Integration Client
 * Handles order creation, modal invocation, and payment signature verification.
 */

import { subscriptionService } from './subscriptionService';

export interface RazorpayCustomerPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayCheckoutOptions {
  amountINR: number; // in Rupees
  name?: string;
  description?: string;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: RazorpayCustomerPrefill;
  itemId?: string;
  itemType?: string;
  userId?: string;
  companyId?: string;
  onSuccess: (paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
  onError?: (error: Error) => void;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  message?: string;
  payment_id?: string;
  order_id?: string;
  error?: string;
}

/**
 * Load Razorpay Checkout.js dynamically if not already loaded via index.html
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay Standard Checkout:
 * 1. Calls backend /api/create-order with server-authoritative itemId/type
 * 2. Launches Razorpay standard checkout popup
 * 3. Verifies signature against /api/verify-payment upon payment completion
 * 4. Persists user entitlement and syncs subscriptions
 */
export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const {
    amountINR,
    name = 'KnowToHire',
    description = 'Platform Purchase',
    receipt,
    notes = {},
    prefill = {},
    itemId,
    itemType,
    userId,
    companyId,
    onSuccess,
    onDismiss,
    onError,
  } = options;

  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    // Step 1: Create Order on Backend (Server-authoritative pricing)
    const amountInPaise = Math.round(amountINR * 100);

    const createOrderResponse = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt || `kth_${Date.now()}`,
        notes,
        itemId,
        itemType,
        userId,
        userEmail: prefill.email,
        userName: prefill.name,
        companyId,
      }),
    });

    const orderData = await createOrderResponse.json();


    if (!createOrderResponse.ok || !orderData.order_id) {
      throw new Error(orderData.error || 'Failed to create payment order. Please try again.');
    }

    // Resolve public key ID from server order response or Vite environment
    const razorpayKeyId = (orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim();

    if (!razorpayKeyId) {
      throw new Error('Razorpay Key ID is not available. Please check your environment configuration.');
    }

    // Step 2: Configure and open Razorpay modal
    const checkoutOptions: any = {
      key: razorpayKeyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name,
      description: orderData.product_title || description,
      order_id: orderData.order_id,
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || '',
      },
      theme: {
        color: '#4f46e5', // Brand primary indigo
      },
      modal: {
        backdropclose: false,
        escape: true,
        handleback: true,
        confirm_close: true,
        ondismiss: async () => {
          // Record cancelled / dropped payment to server
          try {
            await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'failed',
                razorpay_order_id: orderData.order_id,
                error_code: 'USER_DROPPED',
                error_description: 'User dismissed checkout modal',
              }),
            });
          } catch {
            // ignore
          }

          if (onDismiss) onDismiss();
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        // Backend signature verification
        try {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: userId,
              user_email: prefill.email,
              user_name: prefill.name,
              item_id: itemId,
              item_type: itemType,
              company_id: companyId,
            }),
          });

          const verifyData: RazorpayVerificationResponse = await verifyResponse.json();

          if (!verifyResponse.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Payment signature verification failed.');
          }

          // Fulfillment is authoritatively owned and completed by the server during /api/verify-payment.
          // In the browser, we dispatch an update event so listening components update immediately.
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kth_purchases_updated', {
                detail: {
                  userId,
                  productId: itemId,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                },
              })
            );
          }

          // If Employer Subscription, synchronize company record
          if (itemType === 'employer_subscription') {
            const tier = itemId?.includes('enterprise') ? 'enterprise' : 'starter';
            const billingCycle = itemId?.includes('annual') ? 'annual' : 'monthly';
            await subscriptionService.activateCompanySubscription({
              companyId,
              tier,
              billingCycle,
              amountINR,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
            });
          }

          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        } catch (verifyErr: any) {
          if (onError) {
            onError(verifyErr);
          } else {
            alert(verifyErr.message || 'Payment verification failed');
          }
        }
      },
    };

    const rzp = new window.Razorpay(checkoutOptions);

    rzp.on('payment.failed', async (failedResponse: any) => {

      try {
        await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'failed',
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: failedResponse.error?.metadata?.payment_id,
            error_code: failedResponse.error?.code,
            error_description: failedResponse.error?.description,
          }),
        });
      } catch {
        // ignore
      }

      const err = new Error(
        failedResponse.error?.description || 'Payment was unsuccessful or cancelled by user.'
      );
      if (onError) {
        onError(err);
      }
    });

    try {
      rzp.open();
    } catch (openErr: any) {
      console.warn('[RazorpayClient] rzp.open() threw:', openErr);
      if (onError) {
        onError(openErr);
      } else {
        alert(openErr?.message || 'Failed to open Razorpay modal');
      }
    }
  } catch (err: any) {
    if (onError) {
      onError(err);
    } else {
      alert(err.message || 'Payment initiation failed.');
    }
  }
}
