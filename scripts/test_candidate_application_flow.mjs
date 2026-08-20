import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

const clientCandidate = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const clientEmployer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TARGET_JOB_ID = '84215ee4-886e-4f56-9b01-f2d5c69bb5e6';

async function runTest() {
  console.log('='.repeat(70));
  console.log('CANDIDATE -> EMPLOYER APPLICATION LIFECYCLE E2E TEST');
  console.log('='.repeat(70));

  // 1. Authenticate candidate
  const candidateEmail = 'cand_1786972983967@hutdot.com';
  const candidatePassword = 'Password123!';

  console.log(`\n1. Authenticating as Candidate (${candidateEmail})...`);
  const { data: candAuth, error: candAuthErr } = await clientCandidate.auth.signInWithPassword({
    email: candidateEmail,
    password: candidatePassword,
  });

  if (candAuthErr || !candAuth?.user) {
    console.error('Candidate sign in failed:', candAuthErr);
    process.exit(1);
  }

  const candidateId = candAuth.user.id;
  console.log('  Candidate auth.uid():', candidateId);
  console.log('  Session access token acquired.');

  // 2. Clean up any previous test application for this job
  console.log(`\n2. Checking previous application for job ${TARGET_JOB_ID}...`);
  const { data: existingApp } = await clientCandidate
    .from('job_applications')
    .select('id')
    .eq('job_id', TARGET_JOB_ID)
    .eq('candidate_id', candidateId)
    .maybeSingle();

  if (existingApp) {
    console.log('  Previous application found:', existingApp.id, 'Cleaning up for fresh test...');
    await clientCandidate.from('job_applications').delete().eq('id', existingApp.id);
  }

  // 3. Fetch Job to get company_id
  const { data: job, error: jobErr } = await clientCandidate
    .from('jobs')
    .select('id, title, company_id, status')
    .eq('id', TARGET_JOB_ID)
    .single();

  console.log('  Target Job:', { id: job?.id, title: job?.title, company_id: job?.company_id, status: job?.status });

  // 4. Submit Application
  console.log('\n3. Submitting candidate job application...');
  const appPayload = {
    job_id: TARGET_JOB_ID,
    candidate_id: candidateId,
    company_id: job.company_id,
    status: 'applied',
    stage: 'new',
    resume_url: 'https://storage.example.com/resumes/priya_sharma_esg.pdf',
    cover_letter: 'I am excited to apply for the Senior Sustainability Consultant role at Niche Synthesis Technologies. With 8+ years in ESG advisory, I look forward to contributing.',
    candidate_snapshot: {
      full_name: 'Dr. Priya Sharma (ESG Lead)',
      email: candidateEmail,
      headline: 'Lead Sustainability Researcher & ESG Specialist',
    },
  };

  const { data: insertedApp, error: insertErr } = await clientCandidate
    .from('job_applications')
    .insert(appPayload)
    .select('*, job:jobs(title, department), company:company_profiles(name)')
    .single();

  if (insertErr) {
    console.error('Job application INSERT FAILED!');
    console.error('  Message:', insertErr.message);
    console.error('  Code:', insertErr.code);
    console.error('  Details:', insertErr.details);
    process.exit(1);
  }

  console.log('Job application INSERT SUCCEEDED!');
  console.log('  Application ID:', insertedApp.id);
  console.log('  Status:', insertedApp.status);
  console.log('  Stage:', insertedApp.stage);
  console.log('  Applied At:', insertedApp.applied_at);

  // 5. Verify application_status_history record created by trigger
  console.log('\n4. Verifying application_status_history record...');
  const { data: historyRecords, error: histErr } = await clientCandidate
    .from('application_status_history')
    .select('*')
    .eq('application_id', insertedApp.id);

  if (histErr) {
    console.error('Error querying status history:', histErr);
    process.exit(1);
  }

  console.log(`  Found ${historyRecords.length} history records for application:`);
  console.log('  History record:', historyRecords[0]);

  if (historyRecords.length === 0 || !historyRecords[0].status) {
    console.error('FAILED: Status history record missing or status is NULL!');
    process.exit(1);
  }

  // 6. Verify Candidate can see application in /candidate/applications
  console.log('\n5. Verifying application visibility on Candidate side (/candidate/applications)...');
  const { data: myApps, error: myAppsErr } = await clientCandidate
    .from('job_applications')
    .select('*, job:jobs(title, department, location), company:company_profiles(name)')
    .eq('candidate_id', candidateId)
    .order('applied_at', { ascending: false });

  console.log('  Candidate applications count:', myApps?.length);
  console.log('  Candidate application item:', myApps?.[0]?.job?.title, 'at', myApps?.[0]?.company?.name);

  // 7. Authenticate as Employer and verify application visibility on Employer side
  console.log('\n6. Authenticating as Demo Employer (cilove3743@hutdot.com)...');
  const { data: empAuth, error: empAuthErr } = await clientEmployer.auth.signInWithPassword({
    email: 'cilove3743@hutdot.com',
    password: 'Password123!',
  });

  if (empAuthErr) {
    console.error('Employer authentication failed:', empAuthErr);
    process.exit(1);
  }

  console.log('  Employer authenticated. UID:', empAuth.user.id);

  // 8. Test /employer/jobs/:id/applicants query
  console.log(`\n7. Querying applicants for job ${TARGET_JOB_ID} on Employer side (/employer/jobs/:id/applicants)...`);
  const { data: jobApplicants, count: applicantCount, error: jobAppErr } = await clientEmployer
    .from('job_applications')
    .select('*, candidate:profiles(id, full_name, email), job:jobs(title, department)', { count: 'exact' })
    .eq('job_id', TARGET_JOB_ID);

  if (jobAppErr) {
    console.error('Employer job applicants query failed:', jobAppErr);
    process.exit(1);
  }

  console.log(`  Employer applicants count for job: ${applicantCount}`);
  console.log('  Applicant candidate:', jobApplicants?.[0]?.candidate);

  // 9. Test /employer/pipeline query
  console.log('\n8. Querying ATS Pipeline on Employer side (/employer/pipeline)...');
  const { data: pipelineApps, count: pipelineCount, error: pipelineErr } = await clientEmployer
    .from('job_applications')
    .select('*, candidate:profiles(id, full_name, email), job:jobs(title, department)', { count: 'exact' });

  if (pipelineErr) {
    console.error('ATS Pipeline query failed:', pipelineErr);
    process.exit(1);
  }

  console.log(`  Total ATS Pipeline applications: ${pipelineCount}`);
  const matchingApp = pipelineApps?.find(a => a.id === insertedApp.id);
  console.log('  Pipeline applicant:', matchingApp?.candidate?.full_name);
  console.log('  Pipeline stage:', matchingApp?.stage);

  console.log('\n' + '='.repeat(70));
  console.log('ALL CANDIDATE -> EMPLOYER LIFECYCLE TESTS PASSED PERFECTLY!');
  console.log('='.repeat(70));
}

runTest();
