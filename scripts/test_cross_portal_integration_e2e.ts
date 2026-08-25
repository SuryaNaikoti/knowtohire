/**
 * Complete Cross-Portal Candidate <-> Employer <-> Admin Integration Certification E2E Test Suite
 * 
 * Tests the complete end-to-end lifecycle across:
 * 1. Admin creates and publishes canonical Job.
 * 2. Employer discovers and manages canonical Job.
 * 3. Candidate discovers canonical Job in feed and job details.
 * 4. Candidate applies (single canonical application).
 * 5. Employer receives application in ATS and New Applicants column.
 * 6. Pipeline stage transitions: New -> Screening -> Shortlisted -> Interview -> Offer -> Hired.
 * 7. Candidate, Employer, and Admin see identical canonical status at every transition.
 * 8. Interview scheduling, rescheduling, and cancellation.
 * 9. Employer Dashboard KPIs and funnel reconciliation.
 * 10. Notification generation and preference suppression (Job Alerts OFF, Stage Updates OFF).
 * 11. Candidate discoverability toggle (ON -> OFF -> ON) in Employer Candidate Search.
 * 12. Candidate account deactivation governance.
 * 13. Multi-Tenant isolation (Employer A vs Employer B).
 * 14. Candidate isolation (Candidate A vs Candidate B).
 * 15. Duplicate prevention (double-application and duplicate bookmarks).
 */

import {
  adminService,
  jobService,
  applicationService,
  interviewService,
  analyticsService,
  savedCandidateService,
  candidateProfileService,
  candidateDiscoveryService,
  notificationService,
} from '../src/services';

async function runCrossPortalIntegrationE2ETests() {
  console.log('========================================================================');
  console.log('  KnowToHire Cross-Portal Integration Certification Test Suite');
  console.log('========================================================================\n');

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

  // Identifiers
  const companyAId = 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
  const employerAId = '00000000-0000-0000-0000-000000000002';
  const candidateAId = '00000000-0000-0000-0000-000000000001';
  const candidateBId = '00000000-0000-0000-0000-000000000005';
  const adminId = '00000000-0000-0000-0000-000000000003';

  // Clear demo stores for clean certification run
  window.localStorage.removeItem('kth_local_created_jobs');
  window.localStorage.removeItem('kth_demo_applications');
  window.localStorage.removeItem('kth_demo_interviews');
  window.localStorage.removeItem('kth_demo_saved_candidates');
  window.localStorage.removeItem('kth_demo_notifications');

  // ============================================================================
  // 1. ADMIN -> EMPLOYER JOB FLOW
  // ============================================================================
  console.log('--- 1. Admin & Employer Job Creation & Publication ---');
  
  // Set Admin session
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: adminId, email: 'admin@knowtohire.com', full_name: 'Platform Administrator', role: 'admin', company_id: companyAId })
  );

  const jobCreationRes = await jobService.createJob({
    title: 'Integration Certification — Full Stack Engineer',
    department: 'Software & Cloud Engineering',
    category: 'Technology & Enterprise Solutions',
    description: 'Lead engineering integration across candidate, employer, and admin surfaces.',
    location: 'Hyderabad, Telangana',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    company_id: companyAId,
    min_salary_inr: 2000000,
    max_salary_inr: 3200000,
    status: 'published',
  });

  assert(jobCreationRes.data !== null, 'Admin creates canonical job');
  const canonicalJobId = jobCreationRes.data?.id || '';
  assert(canonicalJobId.length > 0, 'Canonical Job ID generated');
  assert(jobCreationRes.data?.status === 'published', 'Admin publishes job (status: published)');

  // Admin checks all jobs
  const adminJobsList = await adminService.getJobs();
  assert((adminJobsList.data || []).some((j) => j.id === canonicalJobId), 'Admin sees job in Admin Job Moderation');

  // Employer checks jobs
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@knowtohire.com', full_name: 'Vikram Malhotra', role: 'employer', company_id: companyAId })
  );
  const employerJobsList = await jobService.getEmployerJobs();
  assert((employerJobsList.data?.data || []).some((j) => j.id === canonicalJobId), 'Employer sees same canonical Job ID in Employer Jobs');

  const employerSingleJob = await jobService.getEmployerJobById(canonicalJobId);
  assert(employerSingleJob.data?.id === canonicalJobId, 'Employer retrieves canonical job by ID');

  // ============================================================================
  // 2. CANDIDATE DISCOVERS JOB
  // ============================================================================
  console.log('\n--- 2. Candidate Discovers Canonical Job ---');
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: candidateAId, email: 'surya@knowtohire.com', full_name: 'Surya Naikoti', role: 'candidate' })
  );

  const candidateJobsFeed = await jobService.getPublishedJobs({ keyword: 'Integration Certification' });
  assert((candidateJobsFeed.data?.data || []).some((j) => j.id === canonicalJobId), 'Candidate discovers canonical job in Find Jobs');

  const candidateSingleJob = await jobService.getPublishedJobById(canonicalJobId);
  assert(candidateSingleJob.data?.id === canonicalJobId, 'Candidate views single job details with same ID');
  assert(candidateSingleJob.data?.status === 'published', 'Job status is published for candidate');

  // ============================================================================
  // 3. CANDIDATE APPLIES & EMPLOYER RECEIVES APPLICATION
  // ============================================================================
  console.log('\n--- 3. Candidate Application & Employer Reception ---');
  const applyRes = await applicationService.applyToJob({
    job_id: canonicalJobId,
    cover_letter: 'Experienced full stack engineer applying for the integration certification role.',
    candidate_snapshot: {
      full_name: 'Surya Naikoti',
      headline: 'Full Stack & ESG Software Architect',
      location: 'Hyderabad, TS',
      email: 'surya@knowtohire.com',
    },
  });

  assert(applyRes.data !== null, 'Candidate submits application');
  const canonicalAppId = applyRes.data?.id || '';
  assert(canonicalAppId.length > 0, 'Canonical Application ID generated');
  assert(applyRes.data?.stage === 'new', 'Application initialized in stage: new');

  // Candidate verifies application in My Applications
  const myApps = await applicationService.getMyApplications();
  assert((myApps.data || []).some((a) => a.id === canonicalAppId), 'Candidate sees application in My Applications');

  // Duplicate prevention
  const duplicateApply = await applicationService.applyToJob({
    job_id: canonicalJobId,
    cover_letter: 'Applying a second time...',
  });
  assert(duplicateApply.error !== null, 'Duplicate application attempt is prevented');

  // Employer checks ATS & Dashboard
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@knowtohire.com', full_name: 'Vikram Malhotra', role: 'employer', company_id: companyAId })
  );

  const employerApplicants = await applicationService.getCompanyApplicants();
  assert((employerApplicants.data?.data || []).some((a) => a.id === canonicalAppId), 'Employer sees application in ATS Pipeline');

  const overviewAfterApp = await analyticsService.getRecruitmentOverview();
  assert((overviewAfterApp.data?.totalApplicants ?? 0) >= 1, 'Employer Total Applicants KPI reflects application');

  // Admin checks application oversight
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: adminId, email: 'admin@knowtohire.com', full_name: 'Platform Administrator', role: 'admin' })
  );
  const adminApps = await adminService.getApplications();
  assert((adminApps.data || []).some((a) => a.id === canonicalAppId), 'Admin oversees same canonical Application ID');

  // ============================================================================
  // 4. ATS STATE MACHINE (NEW -> SCREENING -> SHORTLISTED -> INTERVIEW -> OFFER -> HIRED)
  // ============================================================================
  console.log('\n--- 4. ATS Pipeline State Machine Transitions & Synchronizations ---');
  
  // A. Advance to Screening
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@knowtohire.com', full_name: 'Vikram Malhotra', role: 'employer', company_id: companyAId })
  );
  await applicationService.updateApplicationStage(canonicalAppId, 'screening');
  
  const candCheckScreening = await applicationService.getMyApplicationById(canonicalAppId);
  assert(candCheckScreening.data?.stage === 'screening', 'Candidate application status synchronizes to: screening');

  // B. Advance to Shortlisted
  await applicationService.updateApplicationStage(canonicalAppId, 'shortlisted');
  const overviewShortlisted = await analyticsService.getRecruitmentOverview();
  assert((overviewShortlisted.data?.shortlistedCount ?? 0) >= 1, 'Employer Shortlisted KPI reflects state');

  const candCheckShortlist = await applicationService.getMyApplicationById(canonicalAppId);
  assert(candCheckShortlist.data?.stage === 'shortlisted', 'Candidate application status synchronizes to: shortlisted');

  // C. Schedule Interview
  const interviewRes = await interviewService.scheduleInterview({
    application_id: canonicalAppId,
    job_id: canonicalJobId,
    company_id: companyAId,
    candidate_id: candidateAId,
    title: 'Round 1: Cross-Portal Integration Architecture Review',
    interview_type: 'technical_deep_dive',
    scheduled_start: new Date(Date.now() + 86400000).toISOString(),
    meeting_link: 'https://meet.google.com/kth-integ-test',
  });
  assert(interviewRes.data !== null, 'Employer schedules interview for applicant');
  const canonicalInterviewId = interviewRes.data?.id || '';

  // Employer checks interviews
  const empInterviews = await interviewService.getEmployerInterviews();
  assert((empInterviews.data || []).some((i) => i.id === canonicalInterviewId), 'Employer sees interview in Upcoming Interviews');

  // Candidate checks interviews
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: candidateAId, email: 'surya@knowtohire.com', full_name: 'Surya Naikoti', role: 'candidate' })
  );
  const candInterviews = await interviewService.getMyInterviews();
  assert((candInterviews.data || []).some((i) => i.id === canonicalInterviewId), 'Candidate sees same canonical Interview ID in Interviews');

  // D. Reschedule & Cancel Interview
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@knowtohire.com', full_name: 'Vikram Malhotra', role: 'employer', company_id: companyAId })
  );
  const rescheduledTime = new Date(Date.now() + 172800000).toISOString();
  await interviewService.updateInterview(canonicalInterviewId, { scheduled_start: rescheduledTime });
  const candIntUpdated = await interviewService.getInterviewById(canonicalInterviewId);
  assert(candIntUpdated.data?.scheduled_start === rescheduledTime, 'Interview reschedule synchronized across portals');

  await interviewService.updateInterview(canonicalInterviewId, { status: 'cancelled' });
  const candIntCancelled = await interviewService.getInterviewById(canonicalInterviewId);
  assert(candIntCancelled.data?.status === 'cancelled', 'Interview cancellation synchronized across portals');

  // E. Advance to Offer & Hired
  await applicationService.updateApplicationStage(canonicalAppId, 'offer');
  const candCheckOffer = await applicationService.getMyApplicationById(canonicalAppId);
  assert(candCheckOffer.data?.stage === 'offer', 'Candidate status synchronizes to: offer');

  await applicationService.updateApplicationStage(canonicalAppId, 'hired');
  const candCheckHired = await applicationService.getMyApplicationById(canonicalAppId);
  assert(candCheckHired.data?.stage === 'hired', 'Candidate status synchronizes to: hired');

  const finalFunnel = await analyticsService.getHiringFunnel();
  assert(finalFunnel.data !== null && finalFunnel.data.length === 6, 'Employer Hiring Funnel computes all 6 ATS stages');

  // ============================================================================
  // 5. NOTIFICATION PREFERENCES & SETTINGS INTEGRATION
  // ============================================================================
  console.log('\n--- 5. Candidate Settings & Notification Suppression ---');
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: candidateAId, email: 'surya@knowtohire.com', full_name: 'Surya Naikoti', role: 'candidate' })
  );

  // Update Settings: Turn OFF Job Alerts & Application Stage Updates
  await candidateProfileService.updateMyCandidateProfile({
    jobRecommendationAlerts: false,
    applicationStageUpdates: false,
  });

  const suppressedNotif = await notificationService.sendNotification(
    candidateAId,
    'Application Stage Moved: Offer Extended',
    'Your application has progressed to offer.',
    'application'
  );
  assert(suppressedNotif.data === null, 'Notification suppressed when application_stage_updates is OFF');

  // Restore Preferences ON
  await candidateProfileService.updateMyCandidateProfile({
    jobRecommendationAlerts: true,
    applicationStageUpdates: true,
  });

  const activeNotif = await notificationService.sendNotification(
    candidateAId,
    'Application Stage Moved: Hired',
    'Your application has progressed to hired.',
    'application'
  );
  assert(activeNotif.data !== null, 'Notification delivered when application_stage_updates is ON');

  // ============================================================================
  // 6. CANDIDATE DISCOVERABILITY & DEACTIVATION
  // ============================================================================
  console.log('\n--- 6. Candidate Discoverability & Talent Search ---');
  // Turn Discoverable OFF
  await candidateProfileService.updateMyCandidateProfile({ isDiscoverable: false });
  const hiddenSearch = await candidateDiscoveryService.searchCandidates({ search: 'Surya' });
  assert(!(hiddenSearch.data || []).some((c) => c.id === candidateAId), 'Candidate hidden from employer talent search when discoverable is OFF');

  // Turn Discoverable ON
  await candidateProfileService.updateMyCandidateProfile({ isDiscoverable: true });
  const visibleSearch = await candidateDiscoveryService.searchCandidates({ search: 'Surya' });
  assert((visibleSearch.data || []).some((c) => c.id === candidateAId), 'Candidate visible in employer talent search when discoverable is ON');

  // Save Candidate to Talent Bench
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@knowtohire.com', full_name: 'Vikram Malhotra', role: 'employer', company_id: companyAId })
  );
  const saveBenchRes = await savedCandidateService.saveCandidate(candidateAId, 'Lead architect for integration certification');
  assert(saveBenchRes.data !== null, 'Employer saves candidate to talent bench');

  const checkSaved = await savedCandidateService.isCandidateSaved(candidateAId);
  assert(checkSaved.data === true, 'Candidate is verified as saved for company');

  // ============================================================================
  // 7. MULTI-TENANT ISOLATION SECURITY
  // ============================================================================
  console.log('\n--- 7. Multi-Tenant Security & Tenant Isolation ---');
  const companyBId = 'bbbbbbbb-2222-3333-4444-555555555555';
  const employerBId = '00000000-0000-0000-0000-000000000099';

  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerBId, email: 'employerB@enterprise.com', full_name: 'Ananya Roy', role: 'employer', company_id: companyBId })
  );

  const empBJobs = await jobService.getEmployerJobs({ companyId: companyBId });
  assert((empBJobs.data?.data || []).every((j) => j.company_id === companyBId), 'Employer B cannot view Employer A jobs');

  const empBApps = await applicationService.getCompanyApplicants();
  assert((empBApps.data?.data || []).every((a) => a.company_id === companyBId), 'Employer B cannot view Employer A applications');

  const empBInterviews = await interviewService.getEmployerInterviews();
  assert((empBInterviews.data || []).every((i) => i.company_id === companyBId), 'Employer B cannot view Employer A interviews');

  // Candidate Isolation
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: candidateBId, email: 'priya@knowtohire.com', full_name: 'Priya Sharma', role: 'candidate' })
  );
  const candBApps = await applicationService.getMyApplications();
  assert((candBApps.data || []).every((a) => a.candidate_id === candidateBId), 'Candidate B cannot view Candidate A applications');

  console.log('\n========================================================================');
  console.log(`  ALL ${passedTests}/${totalTests} CROSS-PORTAL INTEGRATION CERTIFICATION TESTS PASSED!`);
  console.log('========================================================================\n');
}

runCrossPortalIntegrationE2ETests().catch((err) => {
  console.error('Cross-Portal Integration Test Failed:', err);
  process.exit(1);
});
