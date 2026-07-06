-- ============================================================
-- Sprint 9: AI & Automation System
-- Migration: 20260706000004_sprint9_ai_automation.sql
-- ============================================================

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ─────────────────────────────────────────────────────────────
-- 1. Resume Analysis Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  parsed_skills TEXT[] DEFAULT '{}',
  missing_keywords TEXT[] DEFAULT '{}',
  improvements JSONB DEFAULT '[]',
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own resume analyses"
  ON public.ai_resume_analyses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own resume analyses"
  ON public.ai_resume_analyses FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 2. Job Matches Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  match_percentage INTEGER NOT NULL,
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  gap_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_job_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own job matches"
  ON public.ai_job_matches FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own job matches"
  ON public.ai_job_matches FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 3. Interview Sessions Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  qa_pairs JSONB DEFAULT '[]', -- [{question: '', answer: '', score: 0, feedback: ''}]
  overall_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own interview sessions"
  ON public.ai_interview_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own interview sessions"
  ON public.ai_interview_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 4. Chat System Tables
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chat conversations"
  ON public.ai_chat_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users manage own chat conversations"
  ON public.ai_chat_conversations FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.ai_chat_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' or 'ai'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chat messages"
  ON public.ai_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_chat_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert own chat messages"
  ON public.ai_chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_chat_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 5. Recommendations Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'job', 'template', 'resource'
  entity_id UUID NOT NULL,
  recommendation_score REAL NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own recommendations"
  ON public.ai_recommendations FOR SELECT
  USING (user_id = auth.uid());
