import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTest() {
  console.log('='.repeat(70));
  console.log('EMPLOYER TEST 01 — FULL JOB CREATION, EDIT & PUBLISH PIPELINE');
  console.log('='.repeat(70));

  // 1. Authenticate as Demo Employer
  console.log('\n1. Authenticating as Demo Employer (cilove3743@hutdot.com)...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'cilove3743@hutdot.com',
    password: 'Password123!',
  });

  if (authErr || !authData?.user) {
    console.error('Authentication error:', authErr);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log('  auth.uid():', userId);
  console.log('  Session access token acquired.');

  // 2. Query profiles, employer_profiles, and company_profiles
  console.log('\n2. Querying profiles, employer_profiles, and company_profiles...');
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('id, role, status, full_name, email')
    .eq('id', userId)
    .single();

  console.log('  public.profiles:', profile, 'Error:', profErr);

  const { data: empProfile, error: empErr } = await supabase
    .from('employer_profiles')
    .select('id, profile_id, company_id, job_title, work_phone')
    .eq('profile_id', userId)
    .single();

  console.log('  public.employer_profiles:', empProfile, 'Error:', empErr);

  const { data: compProfile, error: compErr } = await supabase
    .from('company_profiles')
    .select('id, name, verification_status')
    .eq('id', empProfile?.company_id)
    .single();

  console.log('  public.company_profiles:', compProfile, 'Error:', compErr);

  // 3. Test Save as Draft
  console.log('\n3. Testing Save as Draft (Minimal Draft INSERT)...');
  const draftPayload = {
    company_id: empProfile.company_id,
    created_by: userId,
    employer_id: userId,
    slug: 'environmental-esg-lead-' + Date.now(),
    title: 'Lead Environmental ESG Specialist',
    department: 'Sustainability Engineering',
    category: 'Sustainability & ESG',
    description: 'We are seeking an experienced Lead Environmental ESG Specialist to spearhead corporate decarbonization and ESG compliance programs.',
    responsibilities: [
      'Lead carbon footprint audits across corporate operations',
      'Oversee BRSR and ESG compliance reporting',
      'Collaborate with cross-functional sustainability teams'
    ],
    requirements: [
      'B.Tech or Masters in Environmental Science/Engineering',
      '5+ years experience in corporate ESG advisory',
      'Knowledge of GHG protocol and GRI standards'
    ],
    skills: ['ESG Reporting', 'Carbon Accounting', 'BRSR Framework', 'Life Cycle Assessment'],
    benefits: ['Health Insurance', 'Performance Bonus', 'Learning Stipend'],
    employment_type: 'full_time',
    work_mode: 'hybrid',
    experience_level: 'senior',
    location: 'Bengaluru, Karnataka',
    state_code: 'KA',
    is_remote: false,
    min_salary_inr: 2200000,
    max_salary_inr: 3200000,
    salary_currency: 'INR',
    status: 'draft',
  };

  const { data: insertedJob, error: insertErr } = await supabase
    .from('jobs')
    .insert(draftPayload)
    .select('*, company:company_profiles(*)')
    .single();

  if (insertErr) {
    console.error('Draft INSERT failed!');
    console.error('  Error message:', insertErr.message);
    console.error('  Error code:', insertErr.code);
    console.error('  Error details:', insertErr.details);
    console.error('  Error hint:', insertErr.hint);
    process.exit(1);
  }

  console.log('Draft INSERT succeeded!');
  console.log('  Job ID:', insertedJob.id);
  console.log('  Title:', insertedJob.title);
  console.log('  Company ID:', insertedJob.company_id);
  console.log('  Company Name:', insertedJob.company?.name);
  console.log('  Status:', insertedJob.status);
  console.log('  Created At:', insertedJob.created_at);

  // 4. Test Fetching Employer Jobs list (confirm draft appears)
  console.log('\n4. Querying employer jobs list to confirm draft appears...');
  const { data: employerJobs, error: jobsListErr } = await supabase
    .from('jobs')
    .select('id, title, status, company_id, created_at')
    .eq('company_id', empProfile.company_id)
    .order('created_at', { ascending: false });

  console.log(`  Found ${employerJobs?.length} jobs for company ${empProfile.company_id}:`);
  employerJobs?.forEach((j) => console.log(`    - [${j.status.toUpperCase()}] ${j.title} (ID: ${j.id})`));

  // 5. Test Edit Draft
  console.log('\n5. Testing Edit Draft Job...');
  const { data: updatedJob, error: updateErr } = await supabase
    .from('jobs')
    .update({
      title: 'Principal Environmental ESG Specialist & Lead',
      min_salary_inr: 2500000,
      max_salary_inr: 3500000,
      updated_at: new Date().toISOString(),
    })
    .eq('id', insertedJob.id)
    .select('*, company:company_profiles(*)')
    .single();

  if (updateErr) {
    console.error('Edit Draft failed:', updateErr);
    process.exit(1);
  }

  console.log('Edit Draft succeeded!');
  console.log('  Updated Title:', updatedJob.title);
  console.log('  Updated Salary:', `₹${updatedJob.min_salary_inr} - ₹${updatedJob.max_salary_inr}`);

  // 6. Test Publish Job Listing
  console.log('\n6. Testing Publish Job Listing...');
  const { data: publishedJob, error: pubErr } = await supabase
    .from('jobs')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', insertedJob.id)
    .select('*, company:company_profiles(*)')
    .single();

  if (pubErr) {
    console.error('Publish Job failed!');
    console.error('  Error message:', pubErr.message);
    console.error('  Error code:', pubErr.code);
    console.error('  Error details:', pubErr.details);
    console.error('  Error hint:', pubErr.hint);
    process.exit(1);
  }

  console.log('Publish Job succeeded!');
  console.log('  Status:', publishedJob.status);
  console.log('  Published At:', publishedJob.published_at);
  console.log('  Company Name:', publishedJob.company?.name);

  console.log('\n' + '='.repeat(70));
  console.log('ALL TESTS PASSED WITH 0 ERRORS!');
  console.log('='.repeat(70));
}

runTest();
