-- Hardened Database Migration Schema v3.1 (Idempotent & Audited)

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.template_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price_cents INT NOT NULL DEFAULT 0,
    preview_image_url TEXT,
    download_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_cents INT NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    amount_cents INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'stripe',
    gateway_reference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL CHECK (
        item_type IN (
            'template',
            'subscription_plan',
            'featured_job',
            'recruiter_seat',
            'premium_candidate',
            'employer_subscription'
        )
    ),
    item_id UUID NOT NULL,
    price_cents INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.template_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    purchase_price_cents INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(candidate_id, template_id)
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount_cents INT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    provider VARCHAR(50) DEFAULT 'stripe',
    transaction_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
    price_cents INT NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
    gateway_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    amount_cents INT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Indexes & Unique Constraints (Idempotent)
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_candidate ON public.template_purchases(candidate_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON public.payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);

-- Enforce single active plan per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_subscription
ON public.subscriptions(user_id, plan_id)
WHERE status = 'active';

-- 3. Enable RLS
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 4. Recreate RLS Policies (Idempotency - Drop & Recreate)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read for template_categories" ON public.template_categories;
    DROP POLICY IF EXISTS "Admin write for template_categories" ON public.template_categories;
    DROP POLICY IF EXISTS "Public read for active templates" ON public.templates;
    DROP POLICY IF EXISTS "Admin write for templates" ON public.templates;
    DROP POLICY IF EXISTS "Public read for active subscription_plans" ON public.subscription_plans;
    DROP POLICY IF EXISTS "Admin write for subscription_plans" ON public.subscription_plans;
    DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
    DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
    DROP POLICY IF EXISTS "Admin read all orders" ON public.orders;
    DROP POLICY IF EXISTS "Users read own order_items" ON public.order_items;
    DROP POLICY IF EXISTS "Admin read all order_items" ON public.order_items;
    DROP POLICY IF EXISTS "Candidates read own purchases" ON public.template_purchases;
    DROP POLICY IF EXISTS "Candidates insert own purchases" ON public.template_purchases;
    DROP POLICY IF EXISTS "Candidates update own purchases" ON public.template_purchases;
    DROP POLICY IF EXISTS "Admin read all purchases" ON public.template_purchases;
    DROP POLICY IF EXISTS "Users read own payments" ON public.payments;
    DROP POLICY IF EXISTS "Users insert own payments" ON public.payments;
    DROP POLICY IF EXISTS "Admin read all payments" ON public.payments;
    DROP POLICY IF EXISTS "Users read own payment_events" ON public.payment_events;
    DROP POLICY IF EXISTS "Admin read all payment_events" ON public.payment_events;
    DROP POLICY IF EXISTS "Users read own subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Admin read all subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Users read own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users insert own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Admin read all invoices" ON public.invoices;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Policy definitions
CREATE POLICY "Public read for template_categories" ON public.template_categories FOR SELECT USING (true);
CREATE POLICY "Admin write for template_categories" ON public.template_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

CREATE POLICY "Public read for active templates" ON public.templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write for templates" ON public.templates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

CREATE POLICY "Public read for active subscription_plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write for subscription_plans" ON public.subscription_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin read all orders" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

CREATE POLICY "Users read own order_items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
);
CREATE POLICY "Admin read all order_items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

CREATE POLICY "Candidates read own purchases" ON public.template_purchases FOR SELECT USING (candidate_id = auth.uid());
CREATE POLICY "Candidates insert own purchases" ON public.template_purchases FOR INSERT WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "Candidates update own purchases" ON public.template_purchases FOR UPDATE USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "Admin read all purchases" ON public.template_purchases FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

CREATE POLICY "Users read own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND user_id = auth.uid())
);
CREATE POLICY "Users insert own payments" ON public.payments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = payments.order_id AND o.user_id = auth.uid()
    )
);
CREATE POLICY "Admin read all payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

CREATE POLICY "Users read own payment_events" ON public.payment_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.payments p
        JOIN public.orders o ON o.id = p.order_id
        WHERE p.id = payment_events.payment_id AND o.user_id = auth.uid()
    )
);
CREATE POLICY "Admin read all payment_events" ON public.payment_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

CREATE POLICY "Users read own subscriptions" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin read all subscriptions" ON public.subscriptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

CREATE POLICY "Users read own invoices" ON public.invoices FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own invoices" ON public.invoices FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin read all invoices" ON public.invoices FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin')
);

-- 5. Auto updated_at Trigger (Refactored for PostgreSQL compliance)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers using drop-first approach
DROP TRIGGER IF EXISTS trigger_update_templates_updated_at ON public.templates;
CREATE TRIGGER trigger_update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER trigger_update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_template_purchases_updated_at ON public.template_purchases;
CREATE TRIGGER trigger_update_template_purchases_updated_at
BEFORE UPDATE ON public.template_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_payments_updated_at ON public.payments;
CREATE TRIGGER trigger_update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trigger_update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_invoices_updated_at ON public.invoices;
CREATE TRIGGER trigger_update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Schema Grants Block
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO anon, authenticated;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT
ON SEQUENCES TO anon, authenticated;
