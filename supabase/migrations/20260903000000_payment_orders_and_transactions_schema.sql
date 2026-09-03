-- ====================================================================
-- KNOWTOHIRE — MIGRATION: PAYMENT & MONETIZATION SCHEMA (PREPARATION)
-- Migration: 20260903000000_payment_orders_and_transactions_schema.sql
-- Description: Provider-agnostic tables for Orders, Transactions, and Webhook Events
-- ====================================================================

-- 1. Create payment_orders table
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL, -- 'knowledge_resource', 'template', 'content_request', 'candidate_subscription', 'employer_subscription', 'job_post', 'future_service'
  product_id TEXT NOT NULL, -- Canonical resource_id, template_id, request_id, etc.
  product_title TEXT NOT NULL,
  amount_inr NUMERIC(10,2) NOT NULL CHECK (amount_inr >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'cancelled', 'refunded')),
  provider TEXT NOT NULL DEFAULT 'cashfree', -- 'cashfree'
  provider_order_id TEXT, -- e.g. Cashfree order_id
  provider_session_id TEXT, -- e.g. Cashfree payment_session_id
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create payment_transactions table (Ledger entries for each attempt/payment)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'cashfree',
  provider_transaction_id TEXT, -- e.g. Cashfree cf_payment_id
  amount_inr NUMERIC(10,2) NOT NULL CHECK (amount_inr >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending', 'successful', 'failed', 'cancelled', 'user_dropped')),
  payment_method TEXT, -- 'upi', 'card', 'netbanking', 'wallet'
  error_code TEXT,
  error_message TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create payment_webhook_events table (For strict idempotent processing)
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL, -- e.g. Cashfree event ID or hash of signature+timestamp
  provider TEXT NOT NULL DEFAULT 'cashfree',
  event_type TEXT NOT NULL, -- e.g. 'PAYMENT_SUCCESS_WEBHOOK'
  order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  provider_order_id TEXT,
  signature_verified BOOLEAN NOT NULL DEFAULT false,
  processed_status TEXT NOT NULL DEFAULT 'pending' CHECK (processed_status IN ('pending', 'processed', 'failed', 'ignored')),
  payload JSONB NOT NULL,
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Performance and Idempotency Indexes
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_product ON public.payment_orders(product_type, product_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_provider_order_id ON public.payment_orders(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_tx_id ON public.payment_transactions(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_event_id ON public.payment_webhook_events(event_id);

-- 5. Row Level Security (RLS)
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Users can read own payment orders"
  ON public.payment_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read and manage all payment orders
CREATE POLICY "Admins full access to payment orders"
  ON public.payment_orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Customers can view transactions of their own orders
CREATE POLICY "Users can read own transactions"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_orders
      WHERE payment_orders.id = payment_transactions.order_id
        AND payment_orders.user_id = auth.uid()
    )
  );

-- Admins can read all transactions
CREATE POLICY "Admins full access to payment transactions"
  ON public.payment_transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Webhook events are restricted to service role and platform admins
CREATE POLICY "Admins read webhook events"
  ON public.payment_webhook_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
