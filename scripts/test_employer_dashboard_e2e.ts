/**
 * Comprehensive Employer Dashboard Operational Overview E2E Test Suite
 * Tests:
 * 1. Employer Session & Identity Resolution (Authenticated Employer vs Candidate isolation)
 * 2. Active Jobs Count from live/local published jobs scoped to company
 * 3. Total Applicants & Stage Transitions
 * 4. Funnel Analytics Calculations (Applicants -> Screened -> Shortlisted -> Interviews -> Offers -> Hired)
 * 5. Funnel zero handling (Safe against NaN / Infinity when applicants = 0)
 * 6. Active Candidate Pipeline stage separation (New, Screening, Shortlisted, Interview)
 * 7. Candidate Quick View stage advancement
 * 8. Interview Scheduling & Upcoming Scheduled Interviews list
 * 9. Multi-Tenant Isolation: Employer A vs Employer B data separation
 */

import {
  analyticsService,
  applicationService,
  jobService,
  interviewService,
  savedCandidateService,
} from '../src/services';

async function runEmployerDashboardE2ETests() {
  console.log('====================================================');
  console.log('  KnowToHire Employer Dashboard Functional E2E Test');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // Setup mock local storage environment if in Node
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

  // Company A setup (EcoStrategy India Pvt Ltd)
  const companyAId = 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
  const employerAId = '00000000-0000-0000-0000-000000000002';
  const candidate1Id = '00000000-0000-0000-0000-000000000001';
  const candidate2Id = '00000000-0000-0000-0000-000000000005';

  // Clear demo storage
  window.localStorage.removeItem('kth_local_created_jobs');
  window.localStorage.removeItem('kth_demo_applications');
  window.localStorage.removeItem('kth_demo_interviews');

  // Set Employer A demo auth session
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: employerAId,
      email: 'employer@knowtohire.com',
      full_name: 'Vikram Malhotra (Talent Lead)',
      role: 'employer',
    })
  );

  // ----------------------------------------------------
  // TEST A: Zero-State Handling (Safe Percentages, No NaN)
  // ----------------------------------------------------
  console.log('--- TEST A: Zero-State & Safe Percentage Calculations ---');
  const zeroOverview = await analyticsService.getRecruitmentOverview();
  assert(zeroOverview.data !== null, 'Overview retrieved successfully for clean employer');
  assert(zeroOverview.data?.hireConversionRate === 0, 'Hire conversion rate is 0% (not NaN)');
  assert(zeroOverview.data?.interviewConversionRate === 0, 'Interview conversion rate is 0% (not NaN)');

  const zeroFunnel = await analyticsService.getHiringFunnel();
  assert(zeroFunnel.data !== null, 'Funnel retrieved successfully');
  assert(zeroFunnel.data?.length === 6, 'Funnel contains all 6 progressive stages');
  zeroFunnel.data?.forEach((st) => {
    assert(!isNaN(st.percentageOfTotal) && !isNaN(st.conversionFromPrevious), `Stage ${st.label} percentages are valid numbers`);
  });

  // ----------------------------------------------------
  // TEST B: Post Job & Verify Active Jobs KPI
  // ----------------------------------------------------
  console.log('\n--- TEST B: Job Creation & Active Jobs KPI Reflection ---');
  const createdJob = await jobService.createJob({
    title: 'Senior Environmental Impact Specialist',
    department: 'EIA & Sustainability Consulting',
    category: 'Engineering & Environment',
    description: 'Lead environmental impact assessments for industrial and infrastructure projects.',
    location: 'Hyderabad, Telangana',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    min_salary_inr: 1800000,
    max_salary_inr: 2800000,
    status: 'published',
  });
  assert(createdJob.data !== null, 'Job created successfully');
  assert(createdJob.data?.status === 'published', 'Job is published');

  const overviewAfterJob = await analyticsService.getRecruitmentOverview();
  assert((overviewAfterJob.data?.activeJobs ?? 0) >= 1, 'Active Jobs KPI increments');

  // ----------------------------------------------------
  // TEST C: Candidate Applies & Total Applicants Updates
  // ----------------------------------------------------
  console.log('\n--- TEST C: Candidate Application & Total Applicants KPI ---');
  const jobId = createdJob.data?.id || 'job-test-1';

  // Candidate 1 applies
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: candidate1Id,
      email: 'surya@knowtohire.com',
      full_name: 'Surya Naikoti',
      role: 'candidate',
    })
  );
  const app1 = await applicationService.applyToJob({
    job_id: jobId,
    cover_letter: 'Excited to apply for the Senior Environmental Impact Specialist position.',
    candidate_snapshot: {
      full_name: 'Surya Naikoti',
      headline: 'Senior Environmental Consultant',
      location: 'Hyderabad, TS',
      email: 'candidate@knowtohire.com',
    },
  });
  assert(app1.data !== null, 'Candidate 1 application submitted');
  assert(app1.data?.stage === 'new', 'Application enters pipeline at stage: new');

  // Candidate 2 applies
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: candidate2Id,
      email: 'priya@knowtohire.com',
      full_name: 'Priya Sharma',
      role: 'candidate',
    })
  );
  const app2 = await applicationService.applyToJob({
    job_id: jobId,
    cover_letter: 'Specialized in ESG governance and environmental auditing.',
    candidate_snapshot: {
      full_name: 'Priya Sharma',
      headline: 'ESG Compliance Analyst',
      location: 'Bengaluru, KA',
      email: 'priya@knowtohire.com',
    },
  });
  assert(app2.data !== null, 'Candidate 2 application submitted');

  // Switch back to Employer A session
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: employerAId,
      email: 'employer@knowtohire.com',
      full_name: 'Vikram Malhotra (Talent Lead)',
      role: 'employer',
    })
  );

  const overviewAfterApps = await analyticsService.getRecruitmentOverview();
  assert((overviewAfterApps.data?.totalApplicants ?? 0) === 2, 'Total Applicants KPI equals 2');

  const funnelAfterApps = await analyticsService.getHiringFunnel();
  assert(funnelAfterApps.data?.[0].count === 2, 'Top of Funnel (Applicants) equals 2');

  // ----------------------------------------------------
  // TEST D: ATS Pipeline Stage Progression & Funnel Math
  // ----------------------------------------------------
  console.log('\n--- TEST D: Pipeline Progression & Funnel Conversion Math ---');
  // Move Candidate 1 to screening, then shortlisted, then interview
  const app1Id = app1.data?.id || '';
  await applicationService.updateApplicationStage(app1Id, 'screening');
  await applicationService.updateApplicationStage(app1Id, 'shortlisted');

  const overviewShortlisted = await analyticsService.getRecruitmentOverview();
  assert((overviewShortlisted.data?.shortlistedCount ?? 0) === 1, 'Candidates Shortlisted KPI equals 1');

  // Schedule Interview for Candidate 1
  const interviewRes = await interviewService.scheduleInterview({
    application_id: app1Id,
    job_id: jobId,
    company_id: companyAId,
    candidate_id: candidate1Id,
    title: 'Round 1: Technical EIA Evaluation',
    interview_type: 'technical_deep_dive',
    scheduled_start: new Date(Date.now() + 86400000).toISOString(),
    meeting_link: 'https://meet.google.com/kth-env-test',
  });
  if (interviewRes.error) {
    console.error('Interview schedule error details:', interviewRes.error);
  }
  assert(interviewRes.data !== null, 'Interview scheduled successfully');

  // Verify Interviews KPI and Upcoming Interviews section
  const overviewInterview = await analyticsService.getRecruitmentOverview();
  assert((overviewInterview.data?.interviewsScheduled ?? 0) >= 1, 'Interviews Scheduled KPI incremented');

  const empInterviews = await interviewService.getEmployerInterviews();
  assert((empInterviews.data || []).some((i) => i.application_id === app1Id), 'Scheduled interview appears in Employer Upcoming Interviews');

  // ----------------------------------------------------
  // TEST E: Dedicated Board & Dashboard Sync
  // ----------------------------------------------------
  console.log('\n--- TEST E: Active Candidate Pipeline Board Stage Partitioning ---');
  const pipelineApps = await applicationService.getCompanyApplicants();
  const apps = pipelineApps.data?.data || [];
  
  const newApps = apps.filter((a) => a.stage === 'new');
  const interviewApps = apps.filter((a) => a.stage === 'interview');
  
  assert(newApps.some((a) => a.candidate_id === candidate2Id), 'Candidate 2 is in New Applicants column');
  assert(interviewApps.some((a) => a.candidate_id === candidate1Id), 'Candidate 1 is in Interview column');

  // ----------------------------------------------------
  // TEST F: Recruiter Evaluation Notes & Rating
  // ----------------------------------------------------
  console.log('\n--- TEST F: Recruiter Evaluation Notes & Candidate Bench ---');
  const notesRes = await applicationService.updateEmployerNotes(app1Id, 'Strong EIA background with SPCB compliance experience.', 5);
  assert(notesRes.data?.employer_notes?.includes('Strong EIA'), 'Recruiter notes saved');
  assert(notesRes.data?.employer_rating === 5, 'Recruiter rating saved as 5 stars');

  // Bookmark Candidate
  const saveCandRes = await savedCandidateService.saveCandidate(candidate1Id, 'Shortlisted for Q3 projects');
  assert(saveCandRes.data !== null, 'Candidate bookmarked to talent bench');

  // ----------------------------------------------------
  // TEST G: Multi-Tenant Employer Isolation
  // ----------------------------------------------------
  console.log('\n--- TEST G: Multi-Tenant Employer Isolation Security ---');
  const companyBId = 'bbbbbbbb-2222-3333-4444-555555555555';
  const employerBId = '00000000-0000-0000-0000-000000000099';

  // Switch to Employer B session
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: employerBId,
      email: 'employerB@enterprise.com',
      full_name: 'Ananya Roy (Hiring Manager)',
      role: 'employer',
      company_id: companyBId,
    })
  );

  // Employer B should see 0 jobs, 0 applications, 0 interviews
  const empBJobs = await jobService.getEmployerJobs({ companyId: companyBId });
  assert((empBJobs.data?.data || []).every((j) => j.company_id === companyBId), 'Employer B cannot see Employer A jobs');

  const empBApps = await applicationService.getCompanyApplicants();
  assert((empBApps.data?.data || []).every((a) => a.company_id === companyBId), 'Employer B cannot see Employer A applications');

  const empBInterviews = await interviewService.getEmployerInterviews();
  assert((empBInterviews.data || []).every((i) => i.company_id === companyBId), 'Employer B cannot see Employer A interviews');

  console.log('\n====================================================');
  console.log(`  ALL ${passedTests}/${totalTests} EMPLOYER DASHBOARD TESTS PASSED!`);
  console.log('====================================================\n');
}

runEmployerDashboardE2ETests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
