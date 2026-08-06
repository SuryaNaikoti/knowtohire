-- ==============================================================================
-- KnowToHire Version 1.0 — Demo Dataset & Initializer Seed Script
-- ==============================================================================

-- 1. Ensure core schema and extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Seed Predefined Users in auth.users & public.profiles
-- Password hash for all accounts uses standard bcrypt string compatible with Supabase Auth
-- Passwords:
-- Admin: Admin@123
-- Employers: Employer@123
-- Candidates: Candidate@123

DO $$
DECLARE
  v_admin_id UUID := '11111111-1111-1111-1111-111111111111';
  v_emp1_id UUID  := '22222222-2222-2222-2222-222222222222';
  v_emp2_id UUID  := '33333333-3333-3333-3333-333333333333';
  v_emp3_id UUID  := '44444444-4444-4444-4444-444444444444';
  v_cand1_id UUID := '55555555-5555-5555-5555-555555555555';
  v_cand2_id UUID := '66666666-6666-6666-6666-666666666666';
  v_cand3_id UUID := '77777777-7777-7777-7777-777777777777';
  v_cand4_id UUID := '88888888-8888-8888-8888-888888888888';
BEGIN

  -- Insert Profiles
  INSERT INTO public.profiles (id, email, role, first_name, last_name, avatar_url, headline, created_at, updated_at)
  VALUES
    (v_admin_id, 'admin@knowtohire.com', 'super_admin', 'Rajeev', 'Sharma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', 'Platform Director & Chief Administrator', NOW(), NOW()),
    (v_emp1_id, 'hr@greenearthconsultants.com', 'employer', 'Arjun', 'Mehta', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', 'HR Manager at GreenEarth Consultants', NOW(), NOW()),
    (v_emp2_id, 'careers@sustainedge.com', 'employer', 'Priya', 'Nair', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80', 'Head of Talent Acquisition at SustainEdge', NOW(), NOW()),
    (v_emp3_id, 'jobs@patentnexus.com', 'employer', 'Rohit', 'Verma', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', 'Recruitment Lead at Patent Nexus', NOW(), NOW()),
    (v_cand1_id, 'rahul.sharma@gmail.com', 'candidate', 'Rahul', 'Sharma', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80', 'Senior Environmental Engineer (3 Yrs Exp)', NOW(), NOW()),
    (v_cand2_id, 'sneha.reddy@gmail.com', 'candidate', 'Sneha', 'Reddy', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80', 'Lead ESG Consultant & Sustainability Auditor (5 Yrs Exp)', NOW(), NOW()),
    (v_cand3_id, 'aditya.rao@gmail.com', 'candidate', 'Aditya', 'Rao', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80', 'Registered Patent Associate (4 Yrs Exp)', NOW(), NOW()),
    (v_cand4_id, 'neha.kapoor@gmail.com', 'candidate', 'Neha', 'Kapoor', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80', 'Research Associate — Circular Economy (2 Yrs Exp)', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    avatar_url = EXCLUDED.avatar_url,
    headline = EXCLUDED.headline;

  -- Insert Employer Entities
  INSERT INTO public.employers (id, profile_id, company_name, company_logo, cover_image, about, website, industry, employee_count, address, gst_number, created_at)
  VALUES
    ('a1111111-1111-1111-1111-111111111111', v_emp1_id, 'GreenEarth Consultants Pvt Ltd', 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=120&h=120&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=400&q=80', 'Leading environmental compliance and engineering consulting firm specializing in EIA audits, CPCB clearances, and zero liquid discharge wastewater plant designs.', 'https://greenearthconsultants.com', 'Environmental Engineering', '100-250 Employees', 'Level 4, EcoTower, Outer Ring Road, Bengaluru, KA 560103', '29AAAAA0000A1Z5', NOW()),
    ('a2222222-2222-2222-2222-222222222222', v_emp2_id, 'SustainEdge Consulting', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=400&q=80', 'Premier ESG strategy and sustainability reporting advisory assisting BSE/NSE listed corporations with SEBI BRSR disclosures, Scope 1-3 GHG accounting, and net-zero roadmaps.', 'https://sustainedge.com', 'ESG & Sustainability', '50-100 Employees', 'Suite 1202, Maker Chambers V, Nariman Point, Mumbai, MH 400021', '27BBBBB1111B1Z2', NOW()),
    ('a3333333-3333-3333-3333-333333333333', v_emp3_id, 'Patent Nexus', 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=120&h=120&q=80', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=400&q=80', 'Full-service intellectual property rights and patent prosecution firm managing global patent portfolios, IPO filings, and technology transfer agreements.', 'https://patentnexus.com', 'Intellectual Property Legal Services', '25-50 Employees', 'Phase III, Cyber Towers, HITEC City, Hyderabad, TS 500081', '36CCCCC2222C1Z9', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Insert Candidate Entities
  INSERT INTO public.candidates (id, profile_id, current_title, summary, total_experience_years, resume_url, expected_salary, current_salary, preferred_location, preferred_domain, created_at)
  VALUES
    ('b1111111-1111-1111-1111-111111111111', v_cand1_id, 'Environmental Engineer', 'Results-driven Environmental Engineer with 3 years of experience in industrial wastewater treatment design, environmental clearance compliance, and air pollution control modeling.', 3, 'https://knowtohire.com/resumes/rahul_sharma_cv.pdf', 1500000, 1100000, 'Bengaluru / Remote', 'Environmental Engineering', NOW()),
    ('b2222222-2222-2222-2222-222222222222', v_cand2_id, 'ESG Consultant', 'Certified ESG Auditor and Sustainability Specialist with 5 years experience auditing Scope 1-3 GHG inventories, implementing GRI/BRSR disclosures, and leading corporate net-zero strategies.', 5, 'https://knowtohire.com/resumes/sneha_reddy_cv.pdf', 2200000, 1650000, 'Mumbai / Hybrid', 'ESG Consulting', NOW()),
    ('b3333333-3333-3333-3333-333333333333', v_cand3_id, 'Patent Associate', 'Registered Patent Agent at the Indian Patent Office (IPO) with 4 years experience drafting pharma & biotech patent specifications, prior-art searches, and FER examination responses.', 4, 'https://knowtohire.com/resumes/aditya_rao_cv.pdf', 1800000, 1300000, 'Hyderabad / Full-time', 'Patent & IPR', NOW()),
    ('b4444444-4444-4444-4444-444444444444', v_cand4_id, 'Research Associate', 'Detail-oriented Research Associate with 2 years of experience conducting circular economy analysis, life cycle assessment (LCA), and environmental policy documentation.', 2, 'https://knowtohire.com/resumes/neha_kapoor_cv.pdf', 1000000, 750000, 'Remote / Delhi NCR', 'Environmental Policy & Research', NOW())
  ON CONFLICT (id) DO NOTHING;

END $$;
