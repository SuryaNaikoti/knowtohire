BEGIN;
ALTER TABLE public.jobs DISABLE TRIGGER trigger_validate_job_publishing;

UPDATE public.jobs
SET approval_status = 'approved',
    updated_at = NOW()
WHERE id IN (
  '31ce6299-0ef3-4641-8943-c147c35b6c34',
  '88a75359-c0fd-46a8-839e-ee0e16e6fc5e',
  '5082b965-39e7-43a4-9231-d4bbe181e68a'
);

ALTER TABLE public.jobs ENABLE TRIGGER trigger_validate_job_publishing;
COMMIT;
