-- ====================================================================
-- MIGRATION: Fix application_status_history trigger and stage tracking
-- ====================================================================

-- 1. Ensure canonical columns exist with proper defaults on application_status_history
ALTER TABLE public.application_status_history 
  ALTER COLUMN to_stage SET DEFAULT 'new'::application_stage;

-- 2. Update trigger function to record stage transitions accurately using canonical schema
CREATE OR REPLACE FUNCTION public.handle_application_stage_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.application_status_history (
      application_id,
      from_stage,
      to_stage,
      changed_by,
      note
    ) VALUES (
      NEW.id,
      NULL,
      NEW.stage,
      auth.uid(),
      'Initial application submission'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO public.application_status_history (
      application_id,
      from_stage,
      to_stage,
      changed_by,
      note
    ) VALUES (
      NEW.id,
      OLD.stage,
      NEW.stage,
      auth.uid(),
      CASE 
        WHEN NEW.stage = 'withdrawn' THEN 'Application withdrawn by candidate'
        WHEN NEW.stage = 'rejected' THEN COALESCE(NEW.rejection_reason, 'Candidate application rejected')
        ELSE 'Application stage updated'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reload schema cache
NOTIFY pgrst, 'reload schema';

