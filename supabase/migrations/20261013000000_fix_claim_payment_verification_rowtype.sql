-- ====================================================================
-- KNOWTOHIRE — FIX CLAIM_PAYMENT_VERIFICATION ROWTYPE & PRIMARY-KEY CHECK
-- Migration: 20261013000000_fix_claim_payment_verification_rowtype.sql
-- Description:
--   Corrects PL/pgSQL variable declarations in public.claim_payment_verification:
--   Replaces generic RECORD with strongly-typed public.payment_orders%ROWTYPE
--   and uses explicit primary-key existence checks (.id IS NOT NULL).
--   Preserves the complete function signature, return shape, security definer,
--   search_path, table locking, strict validation, and service_role grants.
-- ====================================================================

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
  v_existing_order public.payment_orders%ROWTYPE;
  v_conflicting_order public.payment_orders%ROWTYPE;
  v_parsed_uuid UUID := NULL;
BEGIN
  -- 1. Payment ID reuse prevention: Check if payment_id is already assigned to a DIFFERENT order
  SELECT * INTO v_conflicting_order
  FROM public.payment_orders
  WHERE provider_payment_id = p_payment_id
    AND provider_order_id IS DISTINCT FROM p_order_id
  FOR UPDATE;

  IF v_conflicting_order.id IS NOT NULL THEN
    RETURN QUERY SELECT 'conflict'::TEXT, v_conflicting_order.id;
    RETURN;
  END IF;

  -- 2. Idempotent replay: Check if this exact order already exists with this payment_id and is paid
  SELECT * INTO v_existing_order 
  FROM public.payment_orders 
  WHERE provider_payment_id = p_payment_id
    AND provider_order_id = p_order_id
  FOR UPDATE;

  IF v_existing_order.id IS NOT NULL AND v_existing_order.status = 'paid' THEN
    RETURN QUERY SELECT 'already_processed'::TEXT, v_existing_order.id;
    RETURN;
  END IF;

  -- 3. Resolve authoritative order: First try provider_order_id (Razorpay provider order ID)
  SELECT * INTO v_existing_order 
  FROM public.payment_orders 
  WHERE provider_order_id = p_order_id
  FOR UPDATE;

  -- If not found by provider_order_id, test if p_order_id is a valid internal UUID
  IF v_existing_order.id IS NULL THEN
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
  IF v_existing_order.id IS NOT NULL THEN
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

-- STRICT SECURITY GRANTS: Revoke from public, anon, and authenticated; Grant ONLY to service_role
REVOKE EXECUTE ON FUNCTION public.claim_payment_verification(TEXT, TEXT, NUMERIC, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_payment_verification(TEXT, TEXT, NUMERIC, UUID, TEXT, TEXT, TEXT) TO service_role;
