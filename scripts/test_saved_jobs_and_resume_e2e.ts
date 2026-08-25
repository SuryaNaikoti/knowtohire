// Setup mock local storage environment for Node BEFORE service imports
if (typeof window === 'undefined') {
  const store: Record<string, string> = {};
  (global as any).window = {
    localStorage: {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
    },
    dispatchEvent: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  (global as any).localStorage = (global as any).window.localStorage;
}

import {
  jobService,
  savedJobService,
  applicationService,
  candidateDiscoveryService,
} from '../src/services';

async function runVerificationSuite() {
  console.log('================================================================');
  console.log('  KnowToHire: Saved Job Persistence & Resume Access Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const candidateId = '00000000-0000-0000-0000-000000000001';
  const employerCompanyId = '00000000-0000-0000-0000-000000000002';

  // Set candidate auth session
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: candidateId,
      email: 'candidate@knowtohire.com',
      full_name: 'Surya Naikoti',
      role: 'candidate',
    })
  );

  // ----------------------------------------------------
  // PART 1: Candidate Save Job Persistence & Synchronization
  // ----------------------------------------------------
  console.log('--- PART 1: Candidate Save Job Persistence & Sync ---');

  // Set employer auth session first to create job
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: '00000000-0000-0000-0000-000000000002',
      email: 'employer@knowtohire.com',
      full_name: 'Vikram Malhotra',
      role: 'employer',
      company_id: employerCompanyId,
    })
  );

  // Create a job
  const createdJobRes = await jobService.createJob({
    title: 'Senior Full Stack Engineer (Cloud)',
    description: 'Design and build high scale cloud platforms in React and Node.',
    category: 'General Careers',
    location: 'Hyderabad, Telangana',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    department: 'Engineering & Technology',
    status: 'published',
  });

  assert(createdJobRes.data !== null, 'Job created and published successfully');
  const testJobId = createdJobRes.data!.id;

  // Switch to Candidate session
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: candidateId,
      email: 'candidate@knowtohire.com',
      full_name: 'Surya Naikoti',
      role: 'candidate',
    })
  );

  // Verify initial saved state is false
  const initialSaved = await savedJobService.isJobSaved(testJobId);
  assert(initialSaved.data === false, 'Job is initially not saved');

  // Save the job
  const saveRes = await savedJobService.saveJob(testJobId);
  assert(saveRes.data !== null, 'Job saved successfully');
  assert(saveRes.data?.job_id === testJobId, 'Saved job record references target job ID');

  // Verify isJobSaved reflects true
  const savedState = await savedJobService.isJobSaved(testJobId);
  assert(savedState.data === true, 'isJobSaved returns true after bookmarking');

  // Verify getMySavedJobs returns the saved job with its details
  const mySavedRes = await savedJobService.getMySavedJobs();
  assert(mySavedRes.data !== null, 'getMySavedJobs returns data list');
  const foundSaved = mySavedRes.data?.find((s) => s.job_id === testJobId);
  assert(foundSaved !== undefined, 'Saved job list includes newly bookmarked job');
  assert(foundSaved?.job?.title === 'Senior Full Stack Engineer (Cloud)', 'Saved job contains hydrated job title');

  // Unsave the job
  const unsaveRes = await savedJobService.unsaveJob(testJobId);
  assert(unsaveRes.data === true, 'Job unsaved successfully');

  // Verify isJobSaved reflects false after unsave
  const postUnsavedState = await savedJobService.isJobSaved(testJobId);
  assert(postUnsavedState.data === false, 'isJobSaved returns false after unbookmarking');

  // Re-save for cross-page persistence check
  await savedJobService.saveJob(testJobId);
  const recheckSaved = await savedJobService.getMySavedJobs();
  assert(recheckSaved.data?.some((s) => s.job_id === testJobId) === true, 'Job is reliably re-saved and persisted');

  // ----------------------------------------------------
  // PART 2: Candidate Uploaded Resume & Employer Access
  // ----------------------------------------------------
  console.log('\n--- PART 2: Candidate Uploaded Resume & Employer Access ---');

  // Store a candidate uploaded resume in persistent store
  const samplePdfDataUrl = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCg==';
  const sampleFileName = 'Surya_Naikoti_Senior_Engineer_Resume.pdf';

  window.localStorage.setItem(
    `kth_candidate_resume_${candidateId}`,
    JSON.stringify({
      url: samplePdfDataUrl,
      fileName: sampleFileName,
      uploadedAt: new Date().toISOString(),
      size: 102400,
    })
  );

  // Candidate applies for the job
  const applyRes = await applicationService.applyToJob({
    job_id: testJobId,
    cover_letter: 'Excited to apply for the Senior Full Stack Engineer opening.',
  });

  assert(applyRes.data !== null, 'Candidate application submitted successfully');
  const createdApp = applyRes.data!;
  assert(createdApp.resume_url === samplePdfDataUrl, 'Application record captures actual uploaded candidate resume data URL');
  assert(createdApp.candidate_snapshot?.full_name === 'Surya Naikoti', 'Application snapshot contains verified candidate identity');

  // Switch session to Employer
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: '00000000-0000-0000-0000-000000000003',
      email: 'recruiter@enterprise.com',
      full_name: 'Lead Technical Recruiter',
      role: 'employer',
      company_id: employerCompanyId,
    })
  );

  // Employer looks up applicant profile & candidate details
  const candidateLookup = await candidateDiscoveryService.getCandidateById(candidateId);
  assert(candidateLookup.data !== null, 'Employer successfully retrieves discoverable candidate record');
  assert(candidateLookup.data?.resumeUrl === samplePdfDataUrl, 'Employer candidate profile provides actual uploaded resume data URL');
  assert(candidateLookup.data?.resumeFileName === sampleFileName, 'Employer candidate profile provides uploaded resume file name');

  console.log('\n================================================================');
  console.log(`  ALL ${total} VERIFICATION CHECKS PASSED (${passed}/${total})`);
  console.log('================================================================\n');
}

runVerificationSuite().catch((err) => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
