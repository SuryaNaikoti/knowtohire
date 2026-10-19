-- ====================================================================
-- KNOWTOHIRE — MODULE 14: IN-APP & BROWSER PUSH NOTIFICATIONS
-- Migration: 20261020000000_inapp_and_push_notifications.sql
-- ====================================================================
-- Description:
-- Idempotent schema migration for Phase 1 of KnowToHire Notification System:
-- 1. Enhances public.notifications with metadata, category, action_url, read_at.
-- 2. Creates public.notification_preferences for cross-role user notification settings.
-- 3. Creates public.push_subscriptions for Web Push (VAPID) browser device endpoints.
-- 4. Implements public.purge_expired_notifications_90d() for safe 90-day retention pruning.
-- 5. Hardens RLS policies to ensure user-scoped ownership and service-role/server authoritativeness.
-- 6. Adds performance indexes for unread count calculation and chronological pagination.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ENHANCE PUBLIC.NOTIFICATIONS SCHEMA
-- --------------------------------------------------------------------

-- Ensure canonical notification_type enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'application',
      'application_update',
      'interview',
      'job_alert',
      'message',
      'offer',
      'payment',
      'system'
    );
  END IF;
END $$;

-- Ensure public.notifications table exists if running in fresh environments
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotently add Phase 1 schema attributes
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'system';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url VARCHAR(255);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS candidate_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS application_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS interview_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Trigger to automatically synchronize read_at timestamp when is_read transitions to true
CREATE OR REPLACE FUNCTION public.sync_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND (OLD.is_read = false OR OLD.read_at IS NULL) THEN
    NEW.read_at := COALESCE(NEW.read_at, NOW());
  ELSIF NEW.is_read = false THEN
    NEW.read_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_notification_read_at ON public.notifications;
CREATE TRIGGER trg_sync_notification_read_at
  BEFORE UPDATE OF is_read ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_notification_read_at();

-- Performance indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_category 
  ON public.notifications(user_id, category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
  ON public.notifications(created_at);

-- --------------------------------------------------------------------
-- 2. UNIFIED NOTIFICATION PREFERENCES TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  application_alerts BOOLEAN NOT NULL DEFAULT true,
  interview_reminders BOOLEAN NOT NULL DEFAULT true,
  marketing_updates BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatic updated_at trigger
DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_preferences_select_owner" ON public.notification_preferences;
CREATE POLICY "notification_preferences_select_owner"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_insert_owner" ON public.notification_preferences;
CREATE POLICY "notification_preferences_insert_owner"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_update_owner" ON public.notification_preferences;
CREATE POLICY "notification_preferences_update_owner"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 3. BROWSER PUSH SUBSCRIPTIONS TABLE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

DROP TRIGGER IF EXISTS trg_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER trg_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on push subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subscriptions_select_owner" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_select_owner"
  ON public.push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_subscriptions_insert_owner" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_insert_owner"
  ON public.push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_subscriptions_update_owner" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_update_owner"
  ON public.push_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_subscriptions_delete_owner" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_delete_owner"
  ON public.push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY ON NOTIFICATIONS
-- --------------------------------------------------------------------

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own notifications
DROP POLICY IF EXISTS "notifications_select_owner" ON public.notifications;
CREATE POLICY "notifications_select_owner"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert only their own notifications (prevents cross-user forgery from client)
DROP POLICY IF EXISTS "notifications_insert_owner" ON public.notifications;
CREATE POLICY "notifications_insert_owner"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update is_read and read_at on their own notifications
DROP POLICY IF EXISTS "notifications_update_owner" ON public.notifications;
CREATE POLICY "notifications_update_owner"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own notifications (e.g. dismissing an alert)
DROP POLICY IF EXISTS "notifications_delete_owner" ON public.notifications;
CREATE POLICY "notifications_delete_owner"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 5. 90-DAY RETENTION PRUNING MECHANISM
-- --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.purge_expired_notifications_90d()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Strictly delete notifications created over 90 days ago
  -- Preserves business records, payment orders, invoices, and audit logs
  DELETE FROM public.notifications
  WHERE created_at < (NOW() - INTERVAL '90 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Revoke execute from public/anon/authenticated to ensure only administrative/cron execution
REVOKE EXECUTE ON FUNCTION public.purge_expired_notifications_90d() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_notifications_90d() TO service_role;

-- --------------------------------------------------------------------
-- 6. REALTIME REPLICA IDENTITY & PUBLICATION CONFIGURATION
-- --------------------------------------------------------------------
-- Ensure primary key is transmitted on Realtime UPDATE/DELETE payloads
ALTER TABLE public.notifications REPLICA IDENTITY DEFAULT;

-- Idempotently add public.notifications to the supabase_realtime publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'notifications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
  END IF;
END $$;
