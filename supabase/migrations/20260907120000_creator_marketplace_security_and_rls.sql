-- ====================================================================
-- KNOWTOHIRE — MIGRATION: CREATOR MARKETPLACE RLS & DATABASE GUARDS
-- Migration: 20260907120000_creator_marketplace_security_and_rls.sql
-- Description:
--   1. Expands user_role enum to include 'creator'
--   2. Adds commercial, versioning, review and creator ownership columns to public.resources and public.templates
--   3. Adds public.creator_sales_ledger table with append-only / immutable RLS
--   4. Creates database-level trigger functions enforcing:
--      - Creators CANNOT alter selling_price_inr, creator_commission_pct, platform_share_pct,
--        creator_earnings_per_sale_inr, terms_version, terms_set_by, terms_set_at,
--        terms_accepted_version, status, published_at, or creator_id.
--      - Creators CANNOT set status to 'published', 'terms_pending', or 'rejected'.
--      - Creators CANNOT publish content directly or modify another creator's content.
--      - Admin alone can assign prices, set commissions, and release content to 'published'.
--      - Creators can accept terms only when in 'terms_pending', which transitions status to 'ready_to_publish'.
--      - Creator sales ledger cannot be forged or altered by Creators (Admin/Service Role only).
--   5. Updates RLS policies on resources, templates, and creator_sales_ledger.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXPAND USER ROLE ENUM TO INCLUDE 'creator'
-- --------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'creator' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'creator';
  END IF;
END $$;

-- --------------------------------------------------------------------
-- 2. SCHEMA EXPANSION: ADD WORKFLOW & COMMERCIAL FIELDS TO RESOURCES & TEMPLATES
-- --------------------------------------------------------------------

-- Resources table enhancements
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS selling_price_inr NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS creator_commission_pct NUMERIC(5,2);
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS platform_share_pct NUMERIC(5,2);
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS creator_earnings_per_sale_inr NUMERIC(10,2);
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS terms_version BIGINT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS terms_set_by TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS terms_set_at TIMESTAMPTZ;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS terms_accepted_by TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS terms_accepted_version BIGINT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS review_feedback TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Templates table enhancements
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS selling_price_inr NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS creator_commission_pct NUMERIC(5,2);
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS platform_share_pct NUMERIC(5,2);
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS creator_earnings_per_sale_inr NUMERIC(10,2);
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS terms_version BIGINT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS terms_set_by TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS terms_set_at TIMESTAMPTZ;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS terms_accepted_by TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS terms_accepted_version BIGINT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS review_feedback TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Validate 8 allowed statuses check constraint
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_status_check;
ALTER TABLE public.resources ADD CONSTRAINT resources_status_check CHECK (
  status IN (
    'draft',
    'pending_review',
    'changes_requested',
    'terms_pending',
    'ready_to_publish',
    'published',
    'rejected',
    'archived'
  )
);

ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_status_check;
ALTER TABLE public.templates ADD CONSTRAINT templates_status_check CHECK (
  status IN (
    'draft',
    'pending_review',
    'changes_requested',
    'terms_pending',
    'ready_to_publish',
    'published',
    'rejected',
    'archived'
  )
);

-- --------------------------------------------------------------------
-- 3. CREATOR SALES LEDGER (IMMUTABLE FINANCIAL RECORD)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.creator_sales_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  item_type TEXT NOT NULL CHECK (item_type IN ('resource', 'template')),
  item_id UUID NOT NULL,
  item_title TEXT NOT NULL,
  order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  sale_price_inr NUMERIC(10,2) NOT NULL CHECK (sale_price_inr >= 0),
  commission_pct NUMERIC(5,2) NOT NULL CHECK (commission_pct >= 0 AND commission_pct <= 100),
  creator_earning_inr NUMERIC(10,2) NOT NULL CHECK (creator_earning_inr >= 0),
  platform_share_inr NUMERIC(10,2) NOT NULL CHECK (platform_share_inr >= 0),
  terms_version_applied BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('pending', 'available', 'paid', 'reversed')),
  buyer_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_sales_ledger_creator_id ON public.creator_sales_ledger(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_sales_ledger_item ON public.creator_sales_ledger(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_creator_sales_ledger_order_id ON public.creator_sales_ledger(order_id);

-- Enable RLS on creator_sales_ledger
ALTER TABLE public.creator_sales_ledger ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 4. DATABASE-LEVEL SECURITY TRIGGER FUNCTIONS
-- --------------------------------------------------------------------

-- Function: Enforce immutable commercial terms & status control on public.resources
CREATE OR REPLACE FUNCTION public.enforce_resource_creator_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_caller_role public.user_role;
BEGIN
  -- Determine current authenticated caller role
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();

  -- If caller is Admin or system service role, allow authorized changes
  IF v_caller_role = 'admin' OR auth.role() = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- FOR CREATOR / REGULAR AUTHENTICATED CALLERS:
  -- 1. Cannot alter creator_id ownership
  IF NEW.creator_id IS DISTINCT FROM OLD.creator_id THEN
    RAISE EXCEPTION 'Forbidden: creator_id ownership cannot be changed (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Cannot alter selling_price_inr or price
  IF NEW.selling_price_inr IS DISTINCT FROM OLD.selling_price_inr OR NEW.price IS DISTINCT FROM OLD.price THEN
    RAISE EXCEPTION 'Forbidden: Commercial selling price can only be configured by Platform Admin (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  -- 3. Cannot alter commission percentage or platform share
  IF NEW.creator_commission_pct IS DISTINCT FROM OLD.creator_commission_pct OR
     NEW.platform_share_pct IS DISTINCT FROM OLD.platform_share_pct OR
     NEW.creator_earnings_per_sale_inr IS DISTINCT FROM OLD.creator_earnings_per_sale_inr THEN
    RAISE EXCEPTION 'Forbidden: Creator commission rates and platform share are admin-controlled (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  -- 4. Cannot alter terms version or terms assignment timestamps/admin signatures
  IF NEW.terms_version IS DISTINCT FROM OLD.terms_version OR
     NEW.terms_set_by IS DISTINCT FROM OLD.terms_set_by OR
     NEW.terms_set_at IS DISTINCT FROM OLD.terms_set_at THEN
    RAISE EXCEPTION 'Forbidden: Terms versioning metadata is admin-controlled (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  -- 5. Status Manipulation Guards:
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Creator CANNOT publish directly
    IF NEW.status = 'published' THEN
      RAISE EXCEPTION 'Forbidden: Content publication is strictly reserved for Platform Admin (RLS-Guard)'
        USING ERRCODE = '42501';
    END IF;

    -- Creator CANNOT set 'terms_pending' (only Admin setting terms can)
    IF NEW.status = 'terms_pending' THEN
      RAISE EXCEPTION 'Forbidden: Cannot set status to terms_pending (RLS-Guard)'
        USING ERRCODE = '42501';
    END IF;

    -- Creator CANNOT set 'rejected'
    IF NEW.status = 'rejected' THEN
      RAISE EXCEPTION 'Forbidden: Only Platform Admin can reject content (RLS-Guard)'
        USING ERRCODE = '42501';
    END IF;

    -- Acceptance rule: Creator can move to ready_to_publish ONLY if current status is terms_pending
    IF NEW.status = 'ready_to_publish' THEN
      IF OLD.status != 'terms_pending' THEN
        RAISE EXCEPTION 'Forbidden: Terms can only be accepted when status is terms_pending (RLS-Guard)'
          USING ERRCODE = '42501';
      END IF;
      -- Terms version acceptance check
      IF NEW.terms_accepted_version IS DISTINCT FROM OLD.terms_version THEN
        RAISE EXCEPTION 'Forbidden: Accepted terms version must exactly match current terms_version (RLS-Guard)'
          USING ERRCODE = '42501';
      END IF;
    END IF;

    -- Decline rule: Creator declining terms can transition to 'changes_requested'
    IF NEW.status = 'changes_requested' THEN
      IF OLD.status != 'terms_pending' AND OLD.status != 'changes_requested' THEN
        RAISE EXCEPTION 'Forbidden: Terms can only be declined when status is terms_pending (RLS-Guard)'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  -- 6. Cannot alter terms_accepted_version unless legitimately accepting pending terms
  IF NEW.terms_accepted_version IS DISTINCT FROM OLD.terms_accepted_version THEN
    IF OLD.status != 'terms_pending' OR NEW.status != 'ready_to_publish' THEN
      RAISE EXCEPTION 'Forbidden: terms_accepted_version cannot be altered outside legitimate acceptance (RLS-Guard)'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  -- 7. Cannot manipulate publication date
  IF NEW.published_at IS DISTINCT FROM OLD.published_at THEN
    RAISE EXCEPTION 'Forbidden: published_at is admin-controlled upon publication (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on resources
DROP TRIGGER IF EXISTS trg_enforce_resource_creator_guard ON public.resources;
CREATE TRIGGER trg_enforce_resource_creator_guard
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_resource_creator_guard();

-- Function: Enforce immutable commercial terms & status control on public.templates
CREATE OR REPLACE FUNCTION public.enforce_template_creator_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_caller_role public.user_role;
BEGIN
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();

  IF v_caller_role = 'admin' OR auth.role() = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- 1. Cannot alter creator_id ownership
  IF NEW.creator_id IS DISTINCT FROM OLD.creator_id THEN
    RAISE EXCEPTION 'Forbidden: creator_id ownership cannot be changed (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Cannot alter selling_price_inr or price
  IF NEW.selling_price_inr IS DISTINCT FROM OLD.selling_price_inr OR NEW.price IS DISTINCT FROM OLD.price THEN
    RAISE EXCEPTION 'Forbidden: Commercial selling price can only be configured by Platform Admin (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  -- 3. Cannot alter commission percentage or platform share
  IF NEW.creator_commission_pct IS DISTINCT FROM OLD.creator_commission_pct OR
     NEW.platform_share_pct IS DISTINCT FROM OLD.platform_share_pct OR
     NEW.creator_earnings_per_sale_inr IS DISTINCT FROM OLD.creator_earnings_per_sale_inr THEN
    RAISE EXCEPTION 'Forbidden: Creator commission rates and platform share are admin-controlled (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  -- 4. Cannot alter terms version or terms assignment timestamps/admin signatures
  IF NEW.terms_version IS DISTINCT FROM OLD.terms_version OR
     NEW.terms_set_by IS DISTINCT FROM OLD.terms_set_by OR
     NEW.terms_set_at IS DISTINCT FROM OLD.terms_set_at THEN
    RAISE EXCEPTION 'Forbidden: Terms versioning metadata is admin-controlled (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  -- 5. Status Manipulation Guards:
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'published' THEN
      RAISE EXCEPTION 'Forbidden: Content publication is strictly reserved for Platform Admin (RLS-Guard)'
        USING ERRCODE = '42501';
    END IF;

    IF NEW.status = 'terms_pending' THEN
      RAISE EXCEPTION 'Forbidden: Cannot set status to terms_pending (RLS-Guard)'
        USING ERRCODE = '42501';
    END IF;

    IF NEW.status = 'rejected' THEN
      RAISE EXCEPTION 'Forbidden: Only Platform Admin can reject content (RLS-Guard)'
        USING ERRCODE = '42501';
    END IF;

    IF NEW.status = 'ready_to_publish' THEN
      IF OLD.status != 'terms_pending' THEN
        RAISE EXCEPTION 'Forbidden: Terms can only be accepted when status is terms_pending (RLS-Guard)'
          USING ERRCODE = '42501';
      END IF;
      IF NEW.terms_accepted_version IS DISTINCT FROM OLD.terms_version THEN
        RAISE EXCEPTION 'Forbidden: Accepted terms version must exactly match current terms_version (RLS-Guard)'
          USING ERRCODE = '42501';
      END IF;
    END IF;

    IF NEW.status = 'changes_requested' THEN
      IF OLD.status != 'terms_pending' AND OLD.status != 'changes_requested' THEN
        RAISE EXCEPTION 'Forbidden: Terms can only be declined when status is terms_pending (RLS-Guard)'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  -- 6. Cannot alter terms_accepted_version outside legitimate acceptance
  IF NEW.terms_accepted_version IS DISTINCT FROM OLD.terms_accepted_version THEN
    IF OLD.status != 'terms_pending' OR NEW.status != 'ready_to_publish' THEN
      RAISE EXCEPTION 'Forbidden: terms_accepted_version cannot be altered outside legitimate acceptance (RLS-Guard)'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  -- 7. Cannot manipulate publication date
  IF NEW.published_at IS DISTINCT FROM OLD.published_at THEN
    RAISE EXCEPTION 'Forbidden: published_at is admin-controlled upon publication (RLS-Guard)'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on templates
DROP TRIGGER IF EXISTS trg_enforce_template_creator_guard ON public.templates;
CREATE TRIGGER trg_enforce_template_creator_guard
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_template_creator_guard();

-- --------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

-- ==================== RESOURCES TABLE POLICIES ====================
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 5.1 Public Read Policy:
-- Unauthenticated and authenticated users can view published, non-deleted resources.
-- Creators can view their own resources regardless of status.
-- Admins can view all resources.
DROP POLICY IF EXISTS "resources_public_select" ON public.resources;
DROP POLICY IF EXISTS "resources_creator_select" ON public.resources;
DROP POLICY IF EXISTS "resources_admin_all" ON public.resources;

CREATE POLICY "resources_public_select"
  ON public.resources
  FOR SELECT
  TO public
  USING (
    deleted_at IS NULL AND status = 'published'
  );

CREATE POLICY "resources_creator_select"
  ON public.resources
  FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid()
  );

CREATE POLICY "resources_creator_insert"
  ON public.resources
  FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id = auth.uid() AND
    status IN ('draft', 'pending_review') AND
    selling_price_inr = 0 AND
    creator_commission_pct IS NULL AND
    terms_version IS NULL AND
    terms_accepted_version IS NULL
  );

CREATE POLICY "resources_creator_update"
  ON public.resources
  FOR UPDATE
  TO authenticated
  USING (
    creator_id = auth.uid()
  )
  WITH CHECK (
    creator_id = auth.uid()
  );

CREATE POLICY "resources_admin_all"
  ON public.resources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==================== TEMPLATES TABLE POLICIES ====================
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_public_select" ON public.templates;
DROP POLICY IF EXISTS "templates_creator_select" ON public.templates;
DROP POLICY IF EXISTS "templates_creator_insert" ON public.templates;
DROP POLICY IF EXISTS "templates_creator_update" ON public.templates;
DROP POLICY IF EXISTS "templates_admin_all" ON public.templates;

CREATE POLICY "templates_public_select"
  ON public.templates
  FOR SELECT
  TO public
  USING (
    deleted_at IS NULL AND status = 'published' AND is_active = true
  );

CREATE POLICY "templates_creator_select"
  ON public.templates
  FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid()
  );

CREATE POLICY "templates_creator_insert"
  ON public.templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id = auth.uid() AND
    status IN ('draft', 'pending_review') AND
    selling_price_inr = 0 AND
    creator_commission_pct IS NULL AND
    terms_version IS NULL AND
    terms_accepted_version IS NULL
  );

CREATE POLICY "templates_creator_update"
  ON public.templates
  FOR UPDATE
  TO authenticated
  USING (
    creator_id = auth.uid()
  )
  WITH CHECK (
    creator_id = auth.uid()
  );

CREATE POLICY "templates_admin_all"
  ON public.templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==================== CREATOR_SALES_LEDGER POLICIES ====================
-- Creators can ONLY SELECT their own earnings/sales records
DROP POLICY IF EXISTS "creator_sales_ledger_creator_select" ON public.creator_sales_ledger;
CREATE POLICY "creator_sales_ledger_creator_select"
  ON public.creator_sales_ledger
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

-- Admins have full access to creator sales ledger
DROP POLICY IF EXISTS "creator_sales_ledger_admin_all" ON public.creator_sales_ledger;
CREATE POLICY "creator_sales_ledger_admin_all"
  ON public.creator_sales_ledger
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Creators CANNOT INSERT, UPDATE, OR DELETE ledger records (Only Admin / Service Role / Webhook backend)
-- No INSERT/UPDATE/DELETE policies granted to Creators
