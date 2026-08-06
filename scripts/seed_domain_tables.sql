-- ==============================================================================
-- KnowToHire Version 1.0 — Direct SQL Seeder (Supabase Dashboard)
-- 
-- HOW TO USE:
--   1. Open https://supabase.com/dashboard/project/roqbodprqmnwxdjsskgb/sql/new
--   2. Paste this entire file into the SQL editor
--   3. Click "Run"
--
-- NOTE: This script ONLY seeds public.profiles, candidate_profiles, 
--       employer_profiles, and companies.
--       Auth users (email+password) MUST be created separately via:
--       Dashboard → Authentication → Users → "Add user" (or via seed-demo.html)
--
-- Auth user UUIDs used in this script are PLACEHOLDERS.
-- After creating auth users, update the UUID values below to match.
--
-- For AUTOMATIC seeding of auth.users too, use the browser tool at:
--   http://localhost:5173/seed-demo.html
-- ==============================================================================

-- NOTE: Run seed-demo.html FIRST to create auth users. 
-- Then run this script with the actual UUIDs from Supabase Auth → Users.

-- ==============================================================================
-- ALTERNATIVELY: If you already ran seed-demo.html and just want to seed
-- the domain tables using the UUIDs already in auth.users, run only the 
-- sections below that match the UUIDs you see in Auth → Users.
-- ==============================================================================

-- 1. Update candidate_profiles with professional details
-- (The trigger auto-creates the rows; we just enrich them here)

-- First, get the profile IDs for candidates
WITH cand_ids AS (
  SELECT id, email FROM public.profiles WHERE email IN (
    'rahul.sharma@gmail.com',
    'sneha.reddy@gmail.com',
    'aditya.rao@gmail.com',
    'neha.kapoor@gmail.com'
  )
)
UPDATE public.candidate_profiles cp
SET
  headline = CASE cand_ids.email
    WHEN 'rahul.sharma@gmail.com'  THEN 'Senior Environmental Engineer (3 Yrs Exp)'
    WHEN 'sneha.reddy@gmail.com'   THEN 'Lead ESG Consultant & Sustainability Auditor (5 Yrs Exp)'
    WHEN 'aditya.rao@gmail.com'    THEN 'Registered Patent Associate (4 Yrs Exp)'
    WHEN 'neha.kapoor@gmail.com'   THEN 'Research Associate — Circular Economy (2 Yrs Exp)'
  END,
  resume_url = CASE cand_ids.email
    WHEN 'rahul.sharma@gmail.com'  THEN 'https://knowtohire.com/resumes/rahul_sharma_cv.pdf'
    WHEN 'sneha.reddy@gmail.com'   THEN 'https://knowtohire.com/resumes/sneha_reddy_cv.pdf'
    WHEN 'aditya.rao@gmail.com'    THEN 'https://knowtohire.com/resumes/aditya_rao_cv.pdf'
    WHEN 'neha.kapoor@gmail.com'   THEN 'https://knowtohire.com/resumes/neha_kapoor_cv.pdf'
  END,
  experience_years = CASE cand_ids.email
    WHEN 'rahul.sharma@gmail.com'  THEN 3
    WHEN 'sneha.reddy@gmail.com'   THEN 5
    WHEN 'aditya.rao@gmail.com'    THEN 4
    WHEN 'neha.kapoor@gmail.com'   THEN 2
  END,
  bio = CASE cand_ids.email
    WHEN 'rahul.sharma@gmail.com'  THEN 'Results-driven Environmental Engineer with 3 years of experience in industrial wastewater treatment design, EIA compliance, and air quality modeling.'
    WHEN 'sneha.reddy@gmail.com'   THEN 'Certified ESG Auditor with 5 years auditing Scope 1-3 GHG inventories, implementing GRI/BRSR disclosures, and leading corporate net-zero strategies.'
    WHEN 'aditya.rao@gmail.com'    THEN 'Registered Patent Agent at IPO with 4 years drafting pharma & biotech patent specifications, prior-art searches, and FER examination responses.'
    WHEN 'neha.kapoor@gmail.com'   THEN 'Research Associate with 2 years conducting circular economy analysis, life cycle assessment (LCA), and environmental policy documentation.'
  END,
  location = CASE cand_ids.email
    WHEN 'rahul.sharma@gmail.com'  THEN 'Bengaluru, Karnataka'
    WHEN 'sneha.reddy@gmail.com'   THEN 'Mumbai, Maharashtra'
    WHEN 'aditya.rao@gmail.com'    THEN 'Hyderabad, Telangana'
    WHEN 'neha.kapoor@gmail.com'   THEN 'New Delhi, Delhi'
  END,
  updated_at = NOW()
FROM cand_ids
WHERE cp.id = cand_ids.id;

-- 2. Upsert companies
INSERT INTO public.companies (name, slug, website, logo_url, industry, size, description, headquarters)
VALUES
  ('GreenEarth Consultants Pvt Ltd', 'greenearthconsultants', 'https://greenearthconsultants.com',
   'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=120&h=120&fit=crop',
   'Environmental Engineering', '100-250',
   'Leading environmental compliance and engineering consulting firm specializing in EIA audits, CPCB clearances, and zero liquid discharge wastewater plant designs.',
   'Bengaluru, KA'),
  ('SustainEdge Consulting', 'sustainedge-consulting', 'https://sustainedge.com',
   'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&h=120&fit=crop',
   'ESG & Sustainability', '50-100',
   'Premier ESG strategy and sustainability reporting advisory for SEBI BRSR disclosures, Scope 1-3 GHG accounting, and net-zero roadmaps.',
   'Mumbai, MH'),
  ('Patent Nexus', 'patent-nexus', 'https://patentnexus.com',
   'https://images.unsplash.com/photo-1568200306481-967613f0c74a?w=120&h=120&fit=crop',
   'Intellectual Property & Legal Services', '25-50',
   'Full-service IP rights and patent prosecution firm managing global patent portfolios, IPO filings, and technology transfer agreements.',
   'Hyderabad, TS')
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  logo_url    = EXCLUDED.logo_url;

-- 3. Link employer_profiles to their companies
UPDATE public.employer_profiles ep
SET
  company_id = c.id,
  updated_at = NOW()
FROM public.profiles p
JOIN public.companies c ON (
  (p.email = 'hr@greenearthconsultants.com' AND c.slug = 'greenearthconsultants') OR
  (p.email = 'careers@sustainedge.com'      AND c.slug = 'sustainedge-consulting') OR
  (p.email = 'jobs@patentnexus.com'          AND c.slug = 'patent-nexus')
)
WHERE ep.id = p.id;

-- 4. Update profile avatar_urls
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&q=80', updated_at = NOW() WHERE email = 'admin@knowtohire.com';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80', updated_at = NOW() WHERE email = 'hr@greenearthconsultants.com';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80', updated_at = NOW() WHERE email = 'careers@sustainedge.com';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80', updated_at = NOW() WHERE email = 'jobs@patentnexus.com';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&q=80', updated_at = NOW() WHERE email = 'rahul.sharma@gmail.com';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=80', updated_at = NOW() WHERE email = 'sneha.reddy@gmail.com';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&q=80', updated_at = NOW() WHERE email = 'aditya.rao@gmail.com';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&q=80', updated_at = NOW() WHERE email = 'neha.kapoor@gmail.com';

-- 5. Verification query — run to confirm all seeding succeeded
SELECT
  p.email,
  p.role,
  p.first_name,
  p.last_name,
  p.avatar_url IS NOT NULL AS has_avatar,
  cp.headline IS NOT NULL  AS has_candidate_profile,
  ep.company_id IS NOT NULL AS has_employer_profile
FROM public.profiles p
LEFT JOIN public.candidate_profiles cp ON cp.id = p.id
LEFT JOIN public.employer_profiles   ep ON ep.id = p.id
WHERE p.email IN (
  'admin@knowtohire.com',
  'hr@greenearthconsultants.com',
  'careers@sustainedge.com',
  'jobs@patentnexus.com',
  'rahul.sharma@gmail.com',
  'sneha.reddy@gmail.com',
  'aditya.rao@gmail.com',
  'neha.kapoor@gmail.com'
)
ORDER BY p.role, p.email;
