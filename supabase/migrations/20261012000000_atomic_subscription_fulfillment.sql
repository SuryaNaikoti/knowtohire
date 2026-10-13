-- ====================================================================
-- KNOWTOHIRE — ATOMIC EMPLOYER SUBSCRIPTION FULFILLMENT & ENTITLEMENTS
-- Migration: 20261012000000_atomic_subscription_fulfillment.sql
-- Description:
--   1. Creates public.company_subscription_entitlements for durable per-order idempotency
--   2. Implements public.fulfill_company_subscription atomic RPC:
--      - Validates payment order exists, is paid, and matches payment ID
--      - Authoritatively verifies employer belongs to company via employer_profiles
--      - Performs durable per-order idempotency check (rejects double extensions)
--      - Authoritatively calculates plan duration from canonical tier & billing cycle
--      - Locks and updates company_profiles subscription columns
--      - Atomically inserts entitlement record
--      - Fails closed on any inconsistency or DB write error
--   3. Restricts RPC execution strictly to service_role with explicit search_path
-- ====================================================================

-- 1. Create durable company_subscription_entitlements table
CREATE TABLE IF NOT EXISTS public.company_subscription_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL UNIQUE REFERENCES public.payment_orders(id) ON DELETE RESTRICT,
  provider_order_id TEXT,
  provider_payment_id TEXT NOT NULL,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('starter', 'enterprise')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  amount_inr NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_subscription_entitlements_company 
  ON public.company_subscription_entitlements(company_id);

CREATE INDEX IF NOT EXISTS idx_company_subscription_entitlements_payment 
  ON public.company_subscription_entitlements(provider_payment_id);

-- Enable Row Level Security
ALTER TABLE public.company_subscription_entitlements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Employers can view own company subscription entitlements" ON public.company_subscription_entitlements;
DROP POLICY IF EXISTS "Admins full access to company subscription entitlements" ON public.company_subscription_entitlements;

-- Policy: Employers can view their company entitlements
CREATE POLICY "Employers can view own company subscription entitlements"
  ON public.company_subscription_entitlements
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT ep.company_id FROM public.employer_profiles ep WHERE ep.profile_id = auth.uid()
    )
  );

-- Policy: Admins have full access
CREATE POLICY "Admins full access to company subscription entitlements"
  ON public.company_subscription_entitlements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. Atomic Subscription Fulfillment RPC
CREATE OR REPLACE FUNCTION public.fulfill_company_subscription(
  p_order_id TEXT,
  p_payment_id TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  status TEXT, -- 'fulfilled' | 'already_fulfilled' | 'order_not_found' | 'order_not_paid' | 'payment_id_mismatch' | 'invalid_relationship' | 'error'
  company_id UUID,
  plan_tier TEXT,
  billing_cycle TEXT,
  expires_at TIMESTAMPTZ,
  already_fulfilled BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_parsed_order_uuid UUID := NULL;
  v_existing_entitlement RECORD;
  v_employer RECORD;
  v_company RECORD;
  v_tier TEXT;
  v_billing_cycle TEXT;
  v_duration_interval INTERVAL;
  v_new_expires_at TIMESTAMPTZ;
  v_base_time TIMESTAMPTZ;
  v_product_id TEXT;
BEGIN
  -- Validate inputs
  IF p_order_id IS NULL OR length(trim(p_order_id)) = 0 THEN
    RETURN QUERY SELECT 'error'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'Order ID is required'::TEXT;
    RETURN;
  END IF;

  IF p_payment_id IS NULL OR length(trim(p_payment_id)) = 0 THEN
    RETURN QUERY SELECT 'error'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'Payment ID is required'::TEXT;
    RETURN;
  END IF;

  -- 1. Lock payment_orders row FOR UPDATE
  SELECT * INTO v_order
  FROM public.payment_orders
  WHERE provider_order_id = p_order_id
  FOR UPDATE;

  IF v_order IS NULL THEN
    BEGIN
      v_parsed_order_uuid := p_order_id::UUID;
      SELECT * INTO v_order
      FROM public.payment_orders
      WHERE id = v_parsed_order_uuid
      FOR UPDATE;
    EXCEPTION WHEN invalid_text_representation THEN
      v_parsed_order_uuid := NULL;
    END;
  END IF;

  IF v_order IS NULL THEN
    RETURN QUERY SELECT 'order_not_found'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'Payment order not found'::TEXT;
    RETURN;
  END IF;

  -- 2. Verify payment order status and payment ID match
  IF v_order.status <> 'paid' OR NOT COALESCE(v_order.is_paid, FALSE) THEN
    RETURN QUERY SELECT 'order_not_paid'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'Order is not marked paid'::TEXT;
    RETURN;
  END IF;

  IF v_order.provider_payment_id IS NOT NULL AND v_order.provider_payment_id <> p_payment_id THEN
    RETURN QUERY SELECT 'payment_id_mismatch'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'Payment ID does not match order record'::TEXT;
    RETURN;
  END IF;

  -- Verify product type is employer_subscription
  IF v_order.product_type <> 'employer_subscription' THEN
    RETURN QUERY SELECT 'error'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'Order is not an employer subscription product'::TEXT;
    RETURN;
  END IF;

  -- 3. Durable Per-Order Idempotency Check
  SELECT * INTO v_existing_entitlement
  FROM public.company_subscription_entitlements
  WHERE order_id = v_order.id
  FOR UPDATE;

  IF v_existing_entitlement IS NOT NULL THEN
    -- Already fulfilled: Return idempotently without modifying state or re-extending
    RETURN QUERY SELECT 
      'already_fulfilled'::TEXT, 
      v_existing_entitlement.company_id, 
      v_existing_entitlement.plan_tier, 
      v_existing_entitlement.billing_cycle, 
      v_existing_entitlement.expires_at, 
      TRUE, 
      NULL::TEXT;
    RETURN;
  END IF;

  -- 4. Authoritative Employer-Company Relationship Verification
  -- Must resolve authenticated user id either from argument or order record
  IF p_user_id IS NOT NULL AND v_order.user_id IS NOT NULL AND v_order.user_id <> p_user_id THEN
    RETURN QUERY SELECT 'invalid_relationship'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'User ID mismatch between request and order'::TEXT;
    RETURN;
  END IF;

  -- Look up employer profile to verify membership in company
  SELECT * INTO v_employer
  FROM public.employer_profiles
  WHERE profile_id = COALESCE(p_user_id, v_order.user_id);

  IF v_employer IS NULL OR v_employer.company_id IS NULL THEN
    RETURN QUERY SELECT 'invalid_relationship'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'No verified employer-company profile relationship found'::TEXT;
    RETURN;
  END IF;

  -- If order has a specific company_id, ensure it strictly matches the employer's company
  IF v_order.company_id IS NOT NULL AND v_order.company_id <> v_employer.company_id THEN
    RETURN QUERY SELECT 'invalid_relationship'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'Order company does not match employer profile company'::TEXT;
    RETURN;
  END IF;

  -- 5. Lock and retrieve company profile
  SELECT * INTO v_company
  FROM public.company_profiles
  WHERE id = v_employer.company_id
  FOR UPDATE;

  IF v_company IS NULL THEN
    RETURN QUERY SELECT 'error'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ, FALSE, 'Target company profile does not exist'::TEXT;
    RETURN;
  END IF;

  -- 6. Authoritatively derive plan tier, billing cycle, and duration
  v_product_id := lower(COALESCE(v_order.product_id, ''));

  IF v_product_id LIKE '%enterprise%' THEN
    v_tier := 'enterprise';
  ELSE
    v_tier := 'starter';
  END IF;

  IF v_product_id LIKE '%annual%' THEN
    v_billing_cycle := 'annual';
    v_duration_interval := INTERVAL '365 days';
  ELSE
    v_billing_cycle := 'monthly';
    v_duration_interval := INTERVAL '30 days';
  END IF;

  -- Calculate expiration: extend if currently active and unexpired, else start from now
  IF v_company.subscription_status = 'active' AND v_company.subscription_expires_at IS NOT NULL AND v_company.subscription_expires_at > now() THEN
    v_base_time := v_company.subscription_expires_at;
  ELSE
    v_base_time := now();
  END IF;

  v_new_expires_at := v_base_time + v_duration_interval;

  -- 7. Insert durable entitlement record
  INSERT INTO public.company_subscription_entitlements (
    company_id,
    order_id,
    provider_order_id,
    provider_payment_id,
    plan_tier,
    billing_cycle,
    starts_at,
    expires_at,
    amount_inr,
    created_at
  ) VALUES (
    v_company.id,
    v_order.id,
    v_order.provider_order_id,
    p_payment_id,
    v_tier,
    v_billing_cycle,
    v_base_time,
    v_new_expires_at,
    v_order.amount_inr,
    now()
  );

  -- 8. Atomically update company_profiles subscription status
  UPDATE public.company_profiles
  SET subscription_tier = v_tier,
      subscription_status = 'active',
      subscription_billing_cycle = v_billing_cycle,
      subscription_expires_at = v_new_expires_at,
      subscription_order_id = v_order.id,
      subscription_updated_at = now()
  WHERE id = v_company.id;

  -- Also link company_id to payment_orders if missing
  IF v_order.company_id IS NULL THEN
    UPDATE public.payment_orders
    SET company_id = v_company.id,
        updated_at = now()
    WHERE id = v_order.id;
  END IF;

  RETURN QUERY SELECT 
    'fulfilled'::TEXT, 
    v_company.id, 
    v_tier, 
    v_billing_cycle, 
    v_new_expires_at, 
    FALSE, 
    NULL::TEXT;
END;
$$;

-- 3. Strict Security Grants: Revoke from public, anon, and authenticated; Grant ONLY to service_role
REVOKE EXECUTE ON FUNCTION public.fulfill_company_subscription(TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_company_subscription(TEXT, TEXT, UUID) TO service_role;
