-- ====================================================================
-- KNOWTOHIRE — MIGRATION: PAID CONTENT & MONETIZATION SCHEMA
-- Migration: 20260825120000_paid_content_requests_and_pricing.sql
-- ====================================================================

-- 1. Add pricing and payment tracking columns to public.resource_requests
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS price_inr NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.resource_requests ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 2. Add Index for fast payment verification lookups
CREATE INDEX IF NOT EXISTS idx_resource_requests_is_paid ON public.resource_requests(is_paid);
CREATE INDEX IF NOT EXISTS idx_resource_requests_price_inr ON public.resource_requests(price_inr);
