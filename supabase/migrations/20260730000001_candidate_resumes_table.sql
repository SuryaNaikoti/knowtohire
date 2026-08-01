-- Create candidate_resumes metadata tracking table
CREATE TABLE IF NOT EXISTS public.candidate_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'supabase' NOT NULL,
    parser_provider VARCHAR(50) DEFAULT 'mock' NOT NULL,
    parser_version VARCHAR(50) DEFAULT 'v1' NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    parsed_at TIMESTAMPTZ,
    confidence_score INTEGER,
    status VARCHAR(50) DEFAULT 'uploaded' NOT NULL
);

-- Enable RLS
ALTER TABLE public.candidate_resumes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS candidate_resumes_owner_all ON public.candidate_resumes;
CREATE POLICY candidate_resumes_owner_all ON public.candidate_resumes
    FOR ALL TO authenticated
    USING (candidate_id = auth.uid())
    WITH CHECK (candidate_id = auth.uid());

DROP POLICY IF EXISTS candidate_resumes_read_employer ON public.candidate_resumes;
CREATE POLICY candidate_resumes_read_employer ON public.candidate_resumes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('employer', 'admin', 'super_admin')
        )
    );
