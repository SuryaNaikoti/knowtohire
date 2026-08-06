const PAT = process.env.SUPABASE_PAT || process.env.SUPABASE_MANAGEMENT_PAT || '';
const PROJECT_REF = 'roqbodprqmnwxdjsskgb';

const sqlSeedQuery = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Seed auth.users with valid bcrypt encrypted passwords
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
  confirmation_token, recovery_token, email_change_token_new, email_change
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated',
    'admin@knowtohire.com',
    crypt('Admin@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Rajeev", "last_name": "Sharma", "role": "super_admin"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated',
    'hr@greenearthconsultants.com',
    crypt('Employer@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Arjun", "last_name": "Mehta", "role": "employer"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated', 'authenticated',
    'careers@sustainedge.com',
    crypt('Employer@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Priya", "last_name": "Nair", "role": "employer"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated', 'authenticated',
    'jobs@patentnexus.com',
    crypt('Employer@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Rohit", "last_name": "Verma", "role": "employer"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated', 'authenticated',
    'rahul.sharma@gmail.com',
    crypt('Candidate@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Rahul", "last_name": "Sharma", "role": "candidate"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '66666666-6666-6666-6666-666666666666',
    'authenticated', 'authenticated',
    'sneha.reddy@gmail.com',
    crypt('Candidate@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Sneha", "last_name": "Reddy", "role": "candidate"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '77777777-7777-7777-7777-777777777777',
    'authenticated', 'authenticated',
    'aditya.rao@gmail.com',
    crypt('Candidate@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Aditya", "last_name": "Rao", "role": "candidate"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '88888888-8888-8888-8888-888888888888',
    'authenticated', 'authenticated',
    'neha.kapoor@gmail.com',
    crypt('Candidate@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Neha", "last_name": "Kapoor", "role": "candidate"}',
    NOW(), NOW(), '', '', '', ''
  )
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- 2. Seed public.profiles
INSERT INTO public.profiles (id, email, role, first_name, last_name, avatar_url, headline, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@knowtohire.com', 'super_admin', 'Rajeev', 'Sharma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', 'Platform Director & Chief Administrator', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'hr@greenearthconsultants.com', 'employer', 'Arjun', 'Mehta', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', 'HR Manager at GreenEarth Consultants', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'careers@sustainedge.com', 'employer', 'Priya', 'Nair', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80', 'Head of Talent Acquisition at SustainEdge', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'jobs@patentnexus.com', 'employer', 'Rohit', 'Verma', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', 'Recruitment Lead at Patent Nexus', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'rahul.sharma@gmail.com', 'candidate', 'Rahul', 'Sharma', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80', 'Senior Environmental Engineer (3 Yrs Exp)', NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'sneha.reddy@gmail.com', 'candidate', 'Sneha', 'Reddy', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80', 'Lead ESG Consultant & Sustainability Auditor (5 Yrs Exp)', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'aditya.rao@gmail.com', 'candidate', 'Aditya', 'Rao', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80', 'Registered Patent Associate (4 Yrs Exp)', NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', 'neha.kapoor@gmail.com', 'candidate', 'Neha', 'Kapoor', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80', 'Research Associate — Circular Economy (2 Yrs Exp)', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  headline = EXCLUDED.headline,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- 3. Seed public.employers
INSERT INTO public.employers (id, profile_id, company_name, company_logo, cover_image, about, website, industry, employee_count, address, gst_number, created_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'GreenEarth Consultants Pvt Ltd', 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=120&h=120&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=400&q=80', 'Leading environmental compliance and engineering consulting firm specializing in EIA audits, CPCB clearances, and zero liquid discharge wastewater plant designs.', 'https://greenearthconsultants.com', 'Environmental Engineering', '100-250 Employees', 'Level 4, EcoTower, Outer Ring Road, Bengaluru, KA 560103', '29AAAAA0000A1Z5', NOW()),
  ('a2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'SustainEdge Consulting', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=400&q=80', 'Premier ESG strategy and sustainability reporting advisory assisting BSE/NSE listed corporations with SEBI BRSR disclosures, Scope 1-3 GHG accounting, and net-zero roadmaps.', 'https://sustainedge.com', 'ESG & Sustainability', '50-100 Employees', 'Suite 1202, Maker Chambers V, Nariman Point, Mumbai, MH 400021', '27BBBBB1111B1Z2', NOW()),
  ('a3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Patent Nexus', 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=120&h=120&q=80', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=400&q=80', 'Full-service intellectual property rights and patent prosecution firm managing global patent portfolios, IPO filings, and technology transfer agreements.', 'https://patentnexus.com', 'Intellectual Property Legal Services', '25-50 Employees', 'Phase III, Cyber Towers, HITEC City, Hyderabad, TS 500081', '36CCCCC2222C1Z9', NOW())
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_logo = EXCLUDED.company_logo,
  about = EXCLUDED.about;

-- 4. Seed public.candidates
INSERT INTO public.candidates (id, profile_id, current_title, summary, total_experience_years, resume_url, expected_salary, current_salary, preferred_location, preferred_domain, created_at)
VALUES
  ('b1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Environmental Engineer', 'Results-driven Environmental Engineer with 3 years experience in industrial wastewater treatment design, environmental clearance compliance, and air pollution control modeling.', 3, 'https://knowtohire.com/resumes/rahul_sharma_cv.pdf', 1500000, 1100000, 'Bengaluru / Remote', 'Environmental Engineering', NOW()),
  ('b2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'ESG Consultant', 'Certified ESG Auditor and Sustainability Specialist with 5 years experience auditing Scope 1-3 GHG inventories, implementing GRI/BRSR disclosures, and leading corporate net-zero strategies.', 5, 'https://knowtohire.com/resumes/sneha_reddy_cv.pdf', 2200000, 1650000, 'Mumbai / Hybrid', 'ESG Consulting', NOW()),
  ('b3333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'Patent Associate', 'Registered Patent Agent at the Indian Patent Office (IPO) with 4 years experience drafting pharma & biotech patent specifications, prior-art searches, and FER examination responses.', 4, 'https://knowtohire.com/resumes/aditya_rao_cv.pdf', 1800000, 1300000, 'Hyderabad / Full-time', 'Patent & IPR', NOW()),
  ('b4444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 'Research Associate', 'Detail-oriented Research Associate with 2 years of experience conducting circular economy analysis, life cycle assessment (LCA), and environmental policy documentation.', 2, 'https://knowtohire.com/resumes/neha_kapoor_cv.pdf', 1000000, 750000, 'Remote / Delhi NCR', 'Environmental Policy & Research', NOW())
ON CONFLICT (id) DO UPDATE SET
  current_title = EXCLUDED.current_title,
  summary = EXCLUDED.summary;
`;

async function executeQuery() {
  console.log('Sending SQL query via Supabase Management API...');
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sqlSeedQuery })
  });

  const text = await res.text();
  console.log('Status Code:', res.status);
  console.log('Response Body:', text);
}

executeQuery();
