-- ====================================================================
-- KNOWTOHIRE — PRODUCTION PAYMENT ENTITLEMENTS & SUBSCRIPTION SYNC SCHEMA
-- Migration: 20260928000000_production_payment_and_entitlements_schema.sql
-- Description:
--   1. Ensures payment_orders supports razorpay and payment identifiers
--   2. Creates user_purchases table for user content entitlements
--   3. Adds subscription fields to company_profiles
--   4. RLS policies allowing users to read their purchases & orders
-- ====================================================================

-- 1. Ensure provider check on payment_orders allows 'razorpay' and 'simulated'
DO $$
BEGIN
  -- Drop restrictive status or provider check constraints if they exist
  ALTER TABLE public.payment_orders DROP CONSTRAINT IF EXISTS payment_orders_provider_check;
  ALTER TABLE public.payment_orders DROP CONSTRAINT IF EXISTS payment_orders_status_check;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.payment_orders ADD CONSTRAINT payment_orders_provider_check
  CHECK (provider IN ('razorpay', 'cashfree', 'simulated', 'none'));

ALTER TABLE public.payment_orders ADD CONSTRAINT payment_orders_status_check
  CHECK (status IN ('created', 'pending', 'paid', 'failed', 'cancelled', 'refunded'));

DO $$
BEGIN
  ALTER TABLE public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_provider_check;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.payment_transactions ADD CONSTRAINT payment_transactions_provider_check
  CHECK (provider IN ('razorpay', 'cashfree', 'simulated', 'none'));

-- Ensure company_id column on payment_orders for subscription linking
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payment_orders_company_id ON public.payment_orders(company_id);

-- 2. Add subscription columns to company_profiles
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter';
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS subscription_billing_cycle TEXT DEFAULT 'monthly';
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS subscription_order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL;
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ;

-- 3. Create public.user_purchases table (Canonical user entitlement storage)
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('template', 'knowledge_resource', 'resource', 'content_request')),
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  amount_inr NUMERIC(10,2) NOT NULL DEFAULT 0,
  order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  payment_id TEXT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_purchases_user_product_unique UNIQUE (user_id, product_type, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_product ON public.user_purchases(product_type, product_id);

-- Enable RLS on user_purchases
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing user_purchases policies to avoid collision
DROP POLICY IF EXISTS "Users can read own purchases" ON public.user_purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.user_purchases;
DROP POLICY IF EXISTS "Admins full access to user purchases" ON public.user_purchases;

-- Users can read their own purchases
CREATE POLICY "Users can read own purchases"
  ON public.user_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert purchases matching their verified UID
CREATE POLICY "Users can insert own purchases"
  ON public.user_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "Admins full access to user purchases"
  ON public.user_purchases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Also allow authenticated users to insert orders for themselves
DROP POLICY IF EXISTS "Users can insert own payment orders" ON public.payment_orders;
CREATE POLICY "Users can insert own payment orders"
  ON public.payment_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own payment orders" ON public.payment_orders;
CREATE POLICY "Users can update own payment orders"
  ON public.payment_orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
