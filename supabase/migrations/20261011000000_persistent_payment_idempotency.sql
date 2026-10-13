-- ====================================================================
-- KNOWTOHIRE — PERSISTENT PAYMENT IDEMPOTENCY & ATOMIC EVENT CLAIM
-- Migration: 20261011000000_persistent_payment_idempotency.sql
-- Description:
--   1. Ensures payment_orders tracks provider_payment_id with unique constraint
--   2. Provides atomic RPC functions for claiming webhook events with safe leasing and fencing
--   3. Provides atomic RPC functions for claiming and recording payment verifications
--   4. Strictly restricts RPC execution to service_role with explicit search_path
-- ====================================================================

-- 1. Ensure provider_payment_id exists on payment_orders for unique lookup
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS provider_payment_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_orders_provider_payment_id 
  ON public.payment_orders(provider_payment_id) 
  WHERE provider_payment_id IS NOT NULL;

-- 2. Add lease, lease_token (fencing), and attempt tracking to payment_webhook_events
ALTER TABLE public.payment_webhook_events ADD COLUMN IF NOT EXISTS lease_timeout TIMESTAMPTZ;
ALTER TABLE public.payment_webhook_events ADD COLUMN IF NOT EXISTS lease_token TEXT;
ALTER TABLE public.payment_webhook_events ADD COLUMN IF NOT EXISTS processing_attempts INTEGER DEFAULT 0;

-- 3. Atomic Webhook Event Claim Function
-- Uses SELECT ... FOR UPDATE or INSERT with atomic fencing token
CREATE OR REPLACE FUNCTION public.claim_payment_webhook_event(
  p_event_id TEXT,
  p_event_type TEXT,
  p_provider TEXT,
  p_payload JSONB,
  p_lease_token TEXT,
  p_lease_seconds INTEGER DEFAULT 60
)
RETURNS TABLE (
  status TEXT, -- 'claimed' | 'already_processed' | 'in_flight' | 'error'
  is_new BOOLEAN,
  current_status TEXT,
  lease_token TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing RECORD;
BEGIN
  -- Attempt initial insert if this is the first arrival
  BEGIN
    INSERT INTO public.payment_webhook_events (
      event_id,
      event_type,
      provider,
      payload,
      processed_status,
      processing_attempts,
      lease_timeout,
      lease_token,
      created_at
    ) VALUES (
      p_event_id,
      p_event_type,
      COALESCE(p_provider, 'razorpay'),
      p_payload,
      'pending',
      1,
      now() + (p_lease_seconds || ' seconds')::INTERVAL,
      p_lease_token,
      now()
    );

    RETURN QUERY SELECT 'claimed'::TEXT, TRUE, 'pending'::TEXT, p_lease_token::TEXT, NULL::TEXT;
    RETURN;
  EXCEPTION WHEN unique_violation THEN
    -- Event row already exists; lock the existing row FOR UPDATE to prevent race on re-claim
    NULL;
  END;

  -- Row exists: Lock with FOR UPDATE to prevent concurrent workers from both claiming
  SELECT * INTO v_existing 
  FROM public.payment_webhook_events 
  WHERE event_id = p_event_id 
  FOR UPDATE;

  IF v_existing IS NULL THEN
    RETURN QUERY SELECT 'error'::TEXT, FALSE, 'missing'::TEXT, NULL::TEXT, 'Record not found during claim'::TEXT;
    RETURN;
  END IF;

  -- 1. If already successfully processed:
  IF v_existing.processed_status = 'processed' THEN
    RETURN QUERY SELECT 'already_processed'::TEXT, FALSE, 'processed'::TEXT, v_existing.lease_token::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- 2. If in pending status but lease has expired, or previously marked failed (safe retry):
  IF v_existing.processed_status = 'failed' OR (v_existing.processed_status = 'pending' AND (v_existing.lease_timeout IS NULL OR v_existing.lease_timeout < now())) THEN
    UPDATE public.payment_webhook_events
    SET processed_status = 'pending',
        processing_attempts = COALESCE(processing_attempts, 0) + 1,
        lease_timeout = now() + (p_lease_seconds || ' seconds')::INTERVAL,
        lease_token = p_lease_token,
        processing_error = NULL
    WHERE event_id = p_event_id;

    RETURN QUERY SELECT 'claimed'::TEXT, FALSE, 'pending'::TEXT, p_lease_token::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- 3. If currently claimed and lease is active:
  RETURN QUERY SELECT 'in_flight'::TEXT, FALSE, 'pending'::TEXT, v_existing.lease_token::TEXT, NULL::TEXT;
END;
$$;

-- 4. Complete Webhook Event Processing (With Fencing Token Verification)
CREATE OR REPLACE FUNCTION public.complete_payment_webhook_event(
  p_event_id TEXT,
  p_status TEXT, -- 'processed' | 'failed'
  p_lease_token TEXT,
  p_error TEXT DEFAULT NULL,
  p_order_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  -- 1. Strictly enforce allowed status transitions
  IF p_status NOT IN ('processed', 'failed') THEN
    RETURN QUERY SELECT FALSE, 'Invalid status: Must be processed or failed'::TEXT;
    RETURN;
  END IF;

  -- 2. Strictly require non-empty lease fencing token
  IF p_lease_token IS NULL OR length(trim(p_lease_token)) = 0 THEN
    RETURN QUERY SELECT FALSE, 'Fencing token required for completion'::TEXT;
    RETURN;
  END IF;

  -- 3. Strict Fencing check: Only allow completion if lease_token matches current active claimant
  UPDATE public.payment_webhook_events
  SET processed_status = p_status,
      processed_at = CASE WHEN p_status = 'processed' THEN now() ELSE processed_at END,
      processing_error = p_error,
      order_id = COALESCE(p_order_id, order_id),
      lease_timeout = NULL,
      lease_token = NULL
  WHERE event_id = p_event_id
    AND lease_token = p_lease_token;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated > 0 THEN
    RETURN QUERY SELECT TRUE, 'Event updated successfully'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, 'Fencing token mismatch or event not found'::TEXT;
  END IF;
END;
$$;

-- 5. Atomic Payment Verification Claim Function
CREATE OR REPLACE FUNCTION public.claim_payment_verification(
  p_payment_id TEXT,
  p_order_id TEXT,
  p_amount_inr NUMERIC,
  p_user_id UUID DEFAULT NULL,
  p_product_type TEXT DEFAULT NULL,
  p_product_id TEXT DEFAULT NULL,
  p_product_title TEXT DEFAULT NULL
)
RETURNS TABLE (
  status TEXT, -- 'claimed' | 'already_processed' | 'conflict' | 'error'
  order_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_order RECORD;
  v_conflicting_order RECORD;
  v_parsed_uuid UUID := NULL;
BEGIN
  -- 1. Payment ID reuse prevention: Check if payment_id is already assigned to a DIFFERENT order
  SELECT * INTO v_conflicting_order
  FROM public.payment_orders
  WHERE provider_payment_id = p_payment_id
    AND provider_order_id IS DISTINCT FROM p_order_id
  FOR UPDATE;

  IF v_conflicting_order IS NOT NULL THEN
    RETURN QUERY SELECT 'conflict'::TEXT, v_conflicting_order.id;
    RETURN;
  END IF;

  -- 2. Idempotent replay: Check if this exact order already exists with this payment_id and is paid
  SELECT * INTO v_existing_order 
  FROM public.payment_orders 
  WHERE provider_payment_id = p_payment_id
    AND provider_order_id = p_order_id
  FOR UPDATE;

  IF v_existing_order IS NOT NULL AND v_existing_order.status = 'paid' THEN
    RETURN QUERY SELECT 'already_processed'::TEXT, v_existing_order.id;
    RETURN;
  END IF;

  -- 3. Resolve authoritative order: First try provider_order_id (Razorpay provider order ID)
  SELECT * INTO v_existing_order 
  FROM public.payment_orders 
  WHERE provider_order_id = p_order_id
  FOR UPDATE;

  -- If not found by provider_order_id, test if p_order_id is a valid internal UUID
  IF v_existing_order IS NULL THEN
    BEGIN
      v_parsed_uuid := p_order_id::UUID;
      SELECT * INTO v_existing_order
      FROM public.payment_orders
      WHERE id = v_parsed_uuid
      FOR UPDATE;
    EXCEPTION WHEN invalid_text_representation THEN
      v_parsed_uuid := NULL;
    END;
  END IF;

  -- 4. If authoritative order is found, validate integrity before claiming
  IF v_existing_order IS NOT NULL THEN
    IF v_existing_order.status = 'paid' THEN
      RETURN QUERY SELECT 'already_processed'::TEXT, v_existing_order.id;
      RETURN;
    END IF;

    -- Strict Exact Amount Equality Check: Verified amount must exactly match authoritative order amount
    IF p_amount_inr IS NOT NULL AND v_existing_order.amount_inr <> p_amount_inr THEN
      RETURN QUERY SELECT 'conflict'::TEXT, v_existing_order.id;
      RETURN;
    END IF;

    -- Strict Currency Check: Must be INR
    IF v_existing_order.currency IS NOT NULL AND v_existing_order.currency <> 'INR' THEN
      RETURN QUERY SELECT 'conflict'::TEXT, v_existing_order.id;
      RETURN;
    END IF;

    -- Purchaser Identity Consistency Check
    IF v_existing_order.user_id IS NOT NULL AND p_user_id IS NOT NULL AND v_existing_order.user_id <> p_user_id THEN
      RETURN QUERY SELECT 'conflict'::TEXT, v_existing_order.id;
      RETURN;
    END IF;

    -- Update existing order atomically
    UPDATE public.payment_orders
    SET provider_payment_id = p_payment_id,
        status = 'paid',
        is_paid = true,
        paid_at = now(),
        updated_at = now()
    WHERE id = v_existing_order.id;

    RETURN QUERY SELECT 'claimed'::TEXT, v_existing_order.id;
    RETURN;
  END IF;

  -- 5. Order row does not exist in payment_orders; fail closed (do not insert arbitrary untrusted order)
  RETURN QUERY SELECT 'error'::TEXT, NULL::UUID;
END;
$$;

-- 6. STRICT SECURITY GRANTS: Revoke from public, anon, and authenticated; Grant ONLY to service_role
REVOKE EXECUTE ON FUNCTION public.claim_payment_webhook_event(TEXT, TEXT, TEXT, JSONB, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_payment_webhook_event(TEXT, TEXT, TEXT, JSONB, TEXT, INTEGER) TO service_role;

REVOKE EXECUTE ON FUNCTION public.complete_payment_webhook_event(TEXT, TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_payment_webhook_event(TEXT, TEXT, TEXT, TEXT, UUID) TO service_role;

REVOKE EXECUTE ON FUNCTION public.claim_payment_verification(TEXT, TEXT, NUMERIC, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_payment_verification(TEXT, TEXT, NUMERIC, UUID, TEXT, TEXT, TEXT) TO service_role;
