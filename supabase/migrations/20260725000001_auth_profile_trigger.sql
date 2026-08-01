-- Migration: 20260725000001_auth_profile_trigger.sql
-- Description: Production-grade, idempotent database trigger for automated profile creation upon auth.users signup.
-- EPIC-01 / TASK-01

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role public.user_role;
  extracted_first_name VARCHAR(100);
  extracted_last_name VARCHAR(100);
BEGIN
  -- Extract user role from raw_user_meta_data safely with 'candidate' fallback
  BEGIN
    assigned_role := COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.user_role,
      'candidate'::public.user_role
    );
  EXCEPTION WHEN OTHERS THEN
    assigned_role := 'candidate'::public.user_role;
  END;

  -- Extract names or fall back to metadata / email prefix
  extracted_first_name := COALESCE(
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(NEW.email, '@', 1)
  );

  extracted_last_name := COALESCE(
    NEW.raw_user_meta_data ->> 'last_name',
    ''
  );

  -- 1. Idempotently insert into public.profiles
  INSERT INTO public.profiles (id, email, role, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    assigned_role,
    extracted_first_name,
    extracted_last_name,
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
    last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = NOW();

  -- 2. Idempotently insert into public.candidate_profiles if role is candidate
  IF assigned_role = 'candidate'::public.user_role THEN
    INSERT INTO public.candidate_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  -- 3. Idempotently insert into public.employer_profiles if role is employer
  ELSIF assigned_role = 'employer'::public.user_role THEN
    INSERT INTO public.employer_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error context gracefully without aborting auth.users insert transaction
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create trigger idempotently
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
