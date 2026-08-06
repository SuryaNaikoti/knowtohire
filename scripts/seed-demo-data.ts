import { createClient } from '@supabase/supabase-js';
import { seedDemoUsers } from './seed-demo-users';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LaaDEhdZxxR36h28ZuMVHw_piI-yOpv';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function seedDemoData() {
  console.log('====================================================');
  console.log('🚀 KnowToHire Version 1.0 — Complete Backend Seeder');
  console.log('====================================================\n');

  // Step 1: Provision Demo Users & Sync Profiles
  await seedDemoUsers();

  // Step 2: Fetch Profile IDs
  const { data: profiles } = await supabase.from('profiles').select('id, email, role');
  const profileMap = new Map((profiles || []).map((p) => [p.email, p]));

  // Step 3: Seed Employers (Idempotent)
  console.log('📦 Seeding Employers...');
  const employersData = [
    {
      company_name: 'GreenEarth Consultants Pvt Ltd',
      profile_id: profileMap.get('hr@greenearthconsultants.com')?.id,
      company_logo: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=120&h=120&q=80',
      cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=400&q=80',
      about: 'Leading environmental engineering consulting firm specializing in EIA audits, CPCB clearances, and zero liquid discharge plant designs.',
      website: 'https://greenearthconsultants.com',
      industry: 'Environmental Engineering',
      employee_count: '100-250 Employees',
      address: 'Level 4, EcoTower, Outer Ring Road, Bengaluru, KA 560103',
      gst_number: '29AAAAA0000A1Z5',
    },
    {
      company_name: 'SustainEdge Consulting',
      profile_id: profileMap.get('careers@sustainedge.com')?.id,
      company_logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
      cover_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=400&q=80',
      about: 'Premier ESG strategy and sustainability reporting advisory assisting BSE/NSE listed corporations with SEBI BRSR disclosures and carbon accounting.',
      website: 'https://sustainedge.com',
      industry: 'ESG & Sustainability',
      employee_count: '50-100 Employees',
      address: 'Suite 1202, Maker Chambers V, Nariman Point, Mumbai, MH 400021',
      gst_number: '27BBBBB1111B1Z2',
    },
    {
      company_name: 'Patent Nexus',
      profile_id: profileMap.get('jobs@patentnexus.com')?.id,
      company_logo: 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=120&h=120&q=80',
      cover_image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=400&q=80',
      about: 'Full-service intellectual property legal firm managing global patent portfolios, IPO filings, and technology transfer agreements.',
      website: 'https://patentnexus.com',
      industry: 'Intellectual Property Legal Services',
      employee_count: '25-50 Employees',
      address: 'Phase III, Cyber Towers, HITEC City, Hyderabad, TS 500081',
      gst_number: '36CCCCC2222C1Z9',
    },
  ];

  for (const emp of employersData) {
    if (emp.profile_id) {
      await supabase.from('employers').upsert(emp, { onConflict: 'company_name' });
    }
  }

  // Step 4: Seed Candidates (Idempotent)
  console.log('📦 Seeding Candidates...');
  const candidatesData = [
    {
      profile_id: profileMap.get('rahul.sharma@gmail.com')?.id,
      current_title: 'Environmental Engineer',
      summary: '3 years of experience in industrial wastewater treatment, EIA audits, and CPCB compliance.',
      total_experience_years: 3,
      resume_url: 'https://knowtohire.com/resumes/rahul_sharma_cv.pdf',
      expected_salary: 1500000,
      current_salary: 1100000,
      preferred_location: 'Bengaluru / Remote',
      preferred_domain: 'Environmental Engineering',
    },
    {
      profile_id: profileMap.get('sneha.reddy@gmail.com')?.id,
      current_title: 'Lead ESG Consultant',
      summary: '5 years auditing Scope 1-3 GHG inventories and SEBI BRSR sustainability disclosures.',
      total_experience_years: 5,
      resume_url: 'https://knowtohire.com/resumes/sneha_reddy_cv.pdf',
      expected_salary: 2200000,
      current_salary: 1650000,
      preferred_location: 'Mumbai / Hybrid',
      preferred_domain: 'ESG Consulting',
    },
    {
      profile_id: profileMap.get('aditya.rao@gmail.com')?.id,
      current_title: 'Patent Associate',
      summary: 'Registered Patent Agent at IPO with 4 years drafting pharma & biotech patents.',
      total_experience_years: 4,
      resume_url: 'https://knowtohire.com/resumes/aditya_rao_cv.pdf',
      expected_salary: 1800000,
      current_salary: 1300000,
      preferred_location: 'Hyderabad / Full-time',
      preferred_domain: 'Patent & IPR',
    },
    {
      profile_id: profileMap.get('neha.kapoor@gmail.com')?.id,
      current_title: 'Research Associate',
      summary: '2 years conducting circular economy market analysis, LCA studies, and policy research.',
      total_experience_years: 2,
      resume_url: 'https://knowtohire.com/resumes/neha_kapoor_cv.pdf',
      expected_salary: 1000000,
      current_salary: 750000,
      preferred_location: 'Remote / Delhi NCR',
      preferred_domain: 'Environmental Policy & Research',
    },
  ];

  for (const cand of candidatesData) {
    if (cand.profile_id) {
      await supabase.from('candidates').upsert(cand, { onConflict: 'profile_id' });
    }
  }

  // Step 5: Seed 10 Realistic Jobs
  console.log('📦 Seeding 10 Realistic Jobs...');
  const jobsData = [
    { title: 'Senior Environmental Engineer', company: 'GreenEarth Consultants Pvt Ltd', location: 'Bengaluru', salary: '₹14,00,000 - ₹22,00,000 / yr', type: 'Full-time', status: 'published' },
    { title: 'Lead ESG Consultant', company: 'SustainEdge Consulting', location: 'Mumbai', salary: '₹18,00,000 - ₹28,00,000 / yr', type: 'Hybrid', status: 'published' },
    { title: 'Sustainability Analyst', company: 'EcoVision India', location: 'Delhi NCR', salary: '₹9,00,000 - ₹15,00,000 / yr', type: 'Full-time', status: 'published' },
    { title: 'Patent Associate (Pharma & Biotech)', company: 'Patent Nexus', location: 'Hyderabad', salary: '₹12,00,000 - ₹20,00,000 / yr', type: 'Full-time', status: 'published' },
    { title: 'IPR Executive & Trademark Specialist', company: 'IPR Global', location: 'Pune', salary: '₹8,00,000 - ₹14,00,000 / yr', type: 'Hybrid', status: 'published' },
    { title: 'Environmental Scientist (Air Quality)', company: 'Future Sustainability Labs', location: 'Chennai', salary: '₹10,00,000 - ₹16,00,000 / yr', type: 'Full-time', status: 'published' },
    { title: 'Research Associate (Circular Economy)', company: 'Future Sustainability Labs', location: 'Remote', salary: '₹7,50,000 - ₹12,00,000 / yr', type: 'Remote', status: 'published' },
    { title: 'EHS Manager (Industrial Safety)', company: 'EnviroTech Solutions', location: 'Ahmedabad', salary: '₹16,00,000 - ₹24,00,000 / yr', type: 'Full-time', status: 'published' },
    { title: 'Water Treatment Process Engineer', company: 'EnviroTech Solutions', location: 'Kolkata', salary: '₹11,00,000 - ₹18,00,000 / yr', type: 'Full-time', status: 'published' },
    { title: 'Carbon Accounting Analyst', company: 'SustainEdge Consulting', location: 'Bengaluru', salary: '₹12,00,000 - ₹19,00,000 / yr', type: 'Hybrid', status: 'published' },
  ];

  for (const j of jobsData) {
    await supabase.from('jobs').upsert(j, { onConflict: 'title' });
  }

  // Step 6: Seed Resources, Templates, Blogs, and Audit Logs
  console.log('📦 Seeding Knowledge Hub, Templates, & Blog CMS...');
  
  const resourcesData = [
    { title: 'Environmental Compliance Handbook 2026', category: 'Environmental', format: 'Guide', rating: 4.9, downloads_count: 5420 },
    { title: 'ESG Reporting & BRSR Implementation Manual', category: 'ESG', format: 'E-Book', rating: 4.8, downloads_count: 3890 },
    { title: 'Patent Filing & Prosecution Guide (IPO)', category: 'Patent', format: 'Manual', rating: 4.9, downloads_count: 4120 },
  ];
  for (const r of resourcesData) {
    await supabase.from('resources').upsert(r, { onConflict: 'title' });
  }

  const templatesData = [
    { title: 'Professional ATS-Friendly Resume Template', price: 0, rating: 4.9, downloads_count: 6850 },
    { title: 'Executive CV Template (Academic & Research)', price: 12, rating: 4.8, downloads_count: 2340 },
    { title: 'Patent Specification Application Template', price: 25, rating: 4.9, downloads_count: 1560 },
  ];
  for (const t of templatesData) {
    await supabase.from('templates').upsert(t, { onConflict: 'title' });
  }

  const blogsData = [
    { title: 'Top Environmental & Sustainability Careers in India (2026 Guide)', category: 'Careers', read_time: '6 min read' },
    { title: 'How to Build a Successful Career in ESG Consulting', category: 'ESG', read_time: '8 min read' },
    { title: 'Patent Filing in India: Step-by-Step Explanation', category: 'Patent', read_time: '7 min read' },
  ];
  for (const b of blogsData) {
    await supabase.from('blog_posts').upsert(b, { onConflict: 'title' });
  }

  console.log('\n====================================================');
  console.log('STATUS: DEMO BACKEND SEEDING COMPLETED SUCCESSFULLY 🎉');
  console.log('====================================================\n');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed-demo-data.ts')) {
  seedDemoData().catch(console.error);
}
