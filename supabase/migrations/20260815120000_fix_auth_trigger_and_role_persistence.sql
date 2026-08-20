-- ====================================================================
-- KNOWTOHIRE — FIX AUTH TRIGGER, SEARCH PATH, AND ROLE PERSISTENCE
-- Migration: 20260815120000_fix_auth_trigger_and_role_persistence.sql
-- ====================================================================

-- 1. Robust handle_new_user function with explicit search_path and schema qualification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  requested_role public.user_role;
  initial_status public.account_status;
  user_full_name TEXT;
BEGIN
  -- Extract full_name metadata safely
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

  -- Sanitize role input: ONLY allow 'candidate' or 'employer' from metadata
  IF NEW.raw_user_meta_data->>'role' = 'employer' THEN
    requested_role := 'employer'::public.user_role;
  ELSE
    requested_role := 'candidate'::public.user_role;
  END IF;

  -- Determine account status based on email verification state
  IF NEW.email_confirmed_at IS NOT NULL THEN
    initial_status := 'pending_onboarding'::public.account_status;
  ELSE
    initial_status := 'unverified'::public.account_status;
  END IF;

  -- Upsert profile with correct role and status
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(user_full_name, 'User'),
    requested_role,
    initial_status
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        status = CASE 
          WHEN public.profiles.status = 'active' THEN 'active'::public.account_status 
          ELSE EXCLUDED.status 
        END,
        updated_at = NOW();

  -- Automatically initialize candidate_profiles row if candidate
  IF requested_role = 'candidate' THEN
    INSERT INTO public.candidate_profiles (profile_id)
    VALUES (NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Ensure trigger is active on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Add profiles_insert_own policy allowing authenticated users to create/initialize their own profile row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY "profiles_insert_own"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
