BEGIN;

-- Temporarily disable the publishing governance trigger for this transaction
ALTER TABLE public.jobs DISABLE TRIGGER trigger_validate_job_publishing;

-- 1. Archive duplicate job ef8b9628-9167-498a-bb5a-f467f78fa9ab
UPDATE public.jobs
SET status = 'closed',
    is_active = false,
    moderator_notes = 'Archived: Duplicate of canonical job 88a75359-c0fd-46a8-839e-ee0e16e6fc5e',
    updated_at = NOW()
WHERE id = 'ef8b9628-9167-498a-bb5a-f467f78fa9ab';

-- 2. Archive test job 84215ee4-886e-4f56-9b01-f2d5c69bb5e6
UPDATE public.jobs
SET status = 'closed',
    is_active = false,
    moderator_notes = 'Archived: Confirmed keyboard-mash test data in skills array',
    updated_at = NOW()
WHERE id = '84215ee4-886e-4f56-9b01-f2d5c69bb5e6';

-- Re-enable the trigger
ALTER TABLE public.jobs ENABLE TRIGGER trigger_validate_job_publishing;

COMMIT;
