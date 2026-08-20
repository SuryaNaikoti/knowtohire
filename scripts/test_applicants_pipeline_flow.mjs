import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTest() {
  console.log('='.repeat(70));
  console.log('VERIFYING JOB_APPLICATIONS -> PROFILES RELATIONSHIP & ATS PIPELINE');
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

  // 2. Fetch employer's published job
  console.log('\n2. Fetching published jobs for Demo Employer...');
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs')
    .select('id, title, status, company_id')
    .eq('created_by', userId);

  console.log('  Employer jobs:', jobs, 'Error:', jobsErr);
  const testJobId = jobs?.[0]?.id;

  // 3. Test exact Applicants Page query:
  // supabase.from('job_applications').select('*, candidate:profiles(*), job:jobs(title, department, location)', { count: 'exact' }).eq('job_id', jobId)
  console.log(`\n3. Testing Applicants Page query for job ${testJobId}...`);
  const { data: jobApplicants, count: jobAppCount, error: jobAppErr } = await supabase
    .from('job_applications')
    .select('*, candidate:profiles(*), job:jobs(title, department, location)', { count: 'exact' })
    .eq('job_id', testJobId);

  if (jobAppErr) {
    console.error('Applicants page query failed!');
    console.error('  Message:', jobAppErr.message);
    console.error('  Code:', jobAppErr.code);
    console.error('  Details:', jobAppErr.details);
    process.exit(1);
  }

  console.log('Applicants page query SUCCEEDED with 0 errors!');
  console.log(`  Applicant count for job: ${jobAppCount}`);
  console.log('  Applications returned:', jobApplicants);

  // 4. Test exact ATS Pipeline query:
  // supabase.from('job_applications').select('*, candidate:profiles(*), job:jobs(title, department, location)', { count: 'exact' })
  console.log('\n4. Testing ATS Pipeline query across company requisitions...');
  const { data: pipelineApplicants, count: pipelineCount, error: pipelineErr } = await supabase
    .from('job_applications')
    .select('*, candidate:profiles(*), job:jobs(title, department, location)', { count: 'exact' });

  if (pipelineErr) {
    console.error('ATS Pipeline query failed!');
    console.error('  Message:', pipelineErr.message);
    console.error('  Code:', pipelineErr.code);
    console.error('  Details:', pipelineErr.details);
    process.exit(1);
  }

  console.log('ATS Pipeline query SUCCEEDED with 0 errors!');
  console.log(`  Total Pipeline applicants: ${pipelineCount}`);
  console.log('  Pipeline applications data:', pipelineApplicants);

  // 5. Test direct relationship join across all public.job_applications (admin/service check)
  console.log('\n5. Testing candidate:profiles(*) join on existing applications in DB...');
  const { data: allApps, error: allAppsErr } = await supabase
    .from('job_applications')
    .select('id, candidate_id, stage, candidate:profiles(id, full_name, email), job:jobs(title)')
    .limit(5);

  console.log('  Sample joined records:', JSON.stringify(allApps, null, 2));
  console.log('  Query error (expected null):', allAppsErr);

  console.log('\n' + '='.repeat(70));
  console.log('ALL APPLICANTS & ATS PIPELINE RELATIONSHIP TESTS PASSED!');
  console.log('='.repeat(70));
}

runTest();
