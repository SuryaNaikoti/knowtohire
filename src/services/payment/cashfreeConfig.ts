/**
 * Cashfree Payment Gateway Configuration Specification
 *
 * CRITICAL SECURITY ARCHITECTURE:
 * - CASHFREE_CLIENT_SECRET is a highly sensitive server-side secret.
 * - NEVER prefix with VITE_ or expose to the frontend / client bundle.
 * - Authenticated Cashfree REST API calls must run exclusively in a trusted server environment
 *   (e.g., Supabase Edge Functions, Node.js API server, or serverless functions).
 */

import { PaymentEnvironment } from './types';

export interface CashfreeConfig {
  environment: PaymentEnvironment;
  apiVersion: string;
  clientId?: string;
  // NOTE: clientSecret is intentionally nullable and excluded from browser context
  clientSecret?: string;
}

/**
 * Gateway API Endpoint URLs for Cashfree
 */
export const CASHFREE_ENDPOINTS = {
  sandbox: {
    baseUrl: 'https://sandbox.cashfree.com/pg',
    ordersUrl: 'https://sandbox.cashfree.com/pg/orders',
  },
  production: {
    baseUrl: 'https://api.cashfree.com/pg',
    ordersUrl: 'https://api.cashfree.com/pg/orders',
  },
} as const;

/**
 * Standard Cashfree API Version targeted for KnowToHire
 */
export const CASHFREE_DEFAULT_API_VERSION = '2025-01-01';

/**
 * Client-safe configuration reader (Frontend context).
 * Guaranteed to NEVER attempt to read or expose CASHFREE_CLIENT_SECRET.
 */
export function getClientPaymentConfig(): {
  environment: PaymentEnvironment;
  isReady: boolean;
} {
  // In frontend Vite context, only non-secret environment switches are readable
  const isProd = import.meta.env.PROD;
  const env: PaymentEnvironment = isProd ? 'production' : 'sandbox';

  return {
    environment: env,
    isReady: false, // In preparation phase, real payment processing is inactive
  };
}
