-- ====================================================================
-- KNOWTOHIRE — MIGRATION: RESTRICT USER_PURCHASES WRITE ACCESS
-- Migration: 20261013140000_restrict_user_purchases_write_access.sql
-- Description:
--   1. Drops the permissive "Users can insert own purchases" policy on public.user_purchases.
--   2. Ensures public.user_purchases records can ONLY be inserted or modified by:
--      - The backend server via SUPABASE_SERVICE_ROLE_KEY (which automatically bypasses RLS)
--        after verifying genuine Razorpay signatures.
--      - Platform administrators (profiles.role = 'admin') via the existing
--        "Admins full access to user purchases" policy.
--   3. Preserves ordinary users' ability to read their own verified purchases
--      via "Users can read own purchases".
--   4. Eliminates self-entitlement privilege escalation where ordinary users could
--      grant themselves access to paid templates or resources without verified payment.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. DROP UNTRUSTED CLIENT INSERT POLICY ON USER_PURCHASES
-- --------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can insert own purchases" ON public.user_purchases;

-- --------------------------------------------------------------------
-- 2. VERIFY RLS IS ENABLED AND POLICIES ARE AUTHORITATIVE
-- --------------------------------------------------------------------

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Note:
-- - "Users can read own purchases" (SELECT auth.uid() = user_id) remains INTACT.
-- - "Admins full access to user purchases" (ALL profiles.role = 'admin') remains INTACT.
-- - Service role automatically bypasses RLS for authoritative server payment verification.
