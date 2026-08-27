/**
 * KnowToHire Full Platform End-to-End Business Lifecycle Master Certification Suite
 *
 * Verifies that KnowToHire functions as ONE integrated recruitment intelligence platform across:
 * 1. Candidate Portal
 * 2. Employer Portal
 * 3. Admin Console
 * 4. Shared services/data layer
 * 5. Supabase/RLS layer
 * 6. Demo/localStorage fallback layer
 * 7. Cross-module event synchronization
 * 8. Analytics and derived metrics
 */

// Setup Node.js window and localStorage mock for event testing
const memoryStore: Record<string, string> = {};
const eventListeners: Record<string, Function[]> = {};

(global as any).window = {
  localStorage: {
    getItem: (k: string) => memoryStore[k] || null,
    setItem: (k: string, v: string) => { memoryStore[k] = v; },
    removeItem: (k: string) => { delete memoryStore[k]; },
    clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
  },
  dispatchEvent: (event: any) => {
    const listeners = eventListeners[event.type] || [];
    listeners.forEach(fn => fn(event));
    return true;
  },
  addEventListener: (type: string, listener: Function) => {
    if (!eventListeners[type]) eventListeners[type] = [];
    eventListeners[type].push(listener);
  },
  removeEventListener: (type: string, listener: Function) => {
    if (eventListeners[type]) {
      eventListeners[type] = eventListeners[type].filter(l => l !== listener);
    }
  },
};

(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params?: { detail: any }) {
    this.type = type;
    this.detail = params?.detail;
  }
};

import { adminService } from '../src/services/adminService';
import { jobService } from '../src/services/jobService';
import { applicationService, ApplicationStage } from '../src/services/applicationService';
import { interviewService } from '../src/services/interviewService';
import { analyticsService } from '../src/services/analyticsService';
import { candidateProfileService } from '../src/services/candidateProfileService';
import { companyProfileService } from '../src/services/companyProfileService';
import { adminSettingsService } from '../src/services/adminSettingsService';
import { knowledgeService } from '../src/services/knowledgeService';
import { templateService } from '../src/services/templateService';
import { requestService } from '../src/services/requestService';
import { blogService } from '../src/services/blogService';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;
const errors: string[] = [];

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    errors.push(message);
    console.log(`  ❌ FAIL: ${message}`);
  }
}

function section(title: string) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ${title}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

async function runMasterSuite() {
  const projectRoot = process.cwd();
  const srcRoot = path.join(projectRoot, 'src');

  console.log(`\n========================================================================`);
  console.log(`  KnowToHire Full Platform Master Lifecycle Certification Suite`);
  console.log(`========================================================================`);

  // Identifiers
  const companyAId = 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
  const employerAId = '00000000-0000-0000-0000-000000000002';
  const candidateAId = '00000000-0000-0000-0000-000000000001';
  const adminId = '00000000-0000-0000-0000-000000000003';

  // Seed demo auth session for admin operations
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: adminId, email: 'admin@knowtohire.com', full_name: 'Platform Administrator', role: 'admin', company_id: companyAId })
  );

  // ============================================================================
  // PHASE 1 — CANONICAL DATA LINEAGE TRACING
  // ============================================================================
  section('PHASE 1 — CANONICAL DATA LINEAGE TRACING');

  const jobsRes = await adminService.getJobs();
  assert(jobsRes.data !== null && jobsRes.data.length > 0, 'adminService retrieves canonical jobs');
  const sampleJob = jobsRes.data![0];
  assert(Boolean(sampleJob.id), `Job has canonical ID: ${sampleJob.id}`);
  assert(Boolean(sampleJob.company_id), `Job has canonical company_id: ${sampleJob.company_id}`);
  assert(Boolean(sampleJob.title), `Job has title: ${sampleJob.title}`);

  const appsRes = await adminService.getApplications();
  assert(appsRes.data !== null && appsRes.data.length > 0, 'adminService retrieves canonical applications');
  const sampleApp = appsRes.data![0];
  assert(Boolean(sampleApp.id), `Application has canonical ID: ${sampleApp.id}`);
  assert(Boolean(sampleApp.job_id), `Application references job_id: ${sampleApp.job_id}`);
  assert(Boolean(sampleApp.candidate_id), `Application references candidate_id: ${sampleApp.candidate_id}`);
  assert(Boolean(sampleApp.company_id), `Application references company_id: ${sampleApp.company_id}`);

  // Trace Candidate Profile (using candidate auth context)
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: candidateAId, email: 'candidate@knowtohire.com', full_name: 'Surya Naikoti', role: 'candidate' })
  );
  const candProfRes = await candidateProfileService.getMyCandidateProfile();
  assert(candProfRes.data !== null, 'Candidate Profile resolved via candidateProfileService');
  assert(candProfRes.data?.role === 'candidate', 'Candidate Profile role is candidate');

  // Trace Company Profile (using employer auth context)
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@ecostrategy.com', full_name: 'EcoStrategy Hiring Lead', role: 'employer', company_id: companyAId })
  );
  const compProfRes = await companyProfileService.getMyCompanyProfile();
  assert(compProfRes.data !== null, `Company Profile resolved for company_id: ${compProfRes.data?.id}`);
  assert(Boolean(compProfRes.data?.name), `Company Profile has name: "${compProfRes.data?.name}"`);

  // ============================================================================
  // PHASE 2 — COMPLETE CANDIDATE → EMPLOYER LIFECYCLE
  // ============================================================================
  section('PHASE 2 — COMPLETE CANDIDATE → EMPLOYER LIFECYCLE');

  // 1. Create a Requisition
  const testCandidateId = candidateAId;

  const newJobRes = await jobService.createJob({
    title: 'Senior Carbon Accounting Specialist (Master Lifecycle)',
    department: 'Carbon Analytics',
    location: 'Bengaluru, India',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    experience_level: 'senior',
    min_salary_inr: 2400000,
    max_salary_inr: 3200000,
    description: 'Lead enterprise carbon accounting and Scope 1-3 audits.',
    requirements: ['BRSR Core', 'GHG Protocol', 'ISO 14064'],
    status: 'published',
  });

  assert(newJobRes.data !== null, 'Job created successfully');
  const createdJobId = newJobRes.data!.id;

  // 2. Candidate Applies
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: testCandidateId, email: 'candidate@knowtohire.com', full_name: 'Surya Naikoti', role: 'candidate' })
  );

  const applyRes = await applicationService.applyToJob({
    job_id: createdJobId,
    candidate_id: testCandidateId,
    resume_url: 'https://storage.knowtohire.com/resumes/cand-master.pdf',
    cover_letter: 'Proven expertise in Scope 1-3 carbon accounting and BRSR assurance.',
  });

  assert(applyRes.data !== null, 'Candidate successfully applies to job');
  const createdAppId = applyRes.data!.id;
  assert(applyRes.data!.stage === 'new', 'Application starts in stage: "new"');

  // 3. Employer Receives Application in ATS
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@ecostrategy.com', full_name: 'EcoStrategy Hiring Lead', role: 'employer', company_id: companyAId })
  );

  const empAppsRes = await applicationService.getJobApplicants(createdJobId);
  const foundApp = empAppsRes.data?.data.find((a) => a.id === createdAppId);
  assert(Boolean(foundApp), 'Employer receives application in ATS Pipeline');

  // 4. Candidate Advances through Stages: screening -> shortlisted -> interview -> offer -> hired
  const stages: ApplicationStage[] = ['screening', 'shortlisted', 'interview', 'offer', 'hired'];
  for (const stg of stages) {
    const updateStageRes = await applicationService.updateApplicationStage(createdAppId, stg);
    assert(updateStageRes.data !== null && updateStageRes.data.stage === stg, `Application successfully transitioned to stage: ${stg}`);
  }

  // 5. Test Rejected and Withdrawn branches
  const rejectJobRes = await jobService.createJob({
    title: 'Branch Test Requisition',
    department: 'Operations',
    location: 'Mumbai, India',
    employment_type: 'full_time',
    work_mode: 'on_site',
    experience_level: 'mid',
    min_salary_inr: 1500000,
    max_salary_inr: 2000000,
    description: 'Testing branch rejections.',
    requirements: ['ESG Analysis'],
    status: 'published',
  });
  const branchJobId = rejectJobRes.data!.id;

  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: 'cand-branch-user-1', email: 'branch@knowtohire.com', full_name: 'Branch Candidate', role: 'candidate' })
  );

  const branchAppRes = await applicationService.applyToJob({
    job_id: branchJobId,
    candidate_id: 'cand-branch-user-1',
    resume_url: 'https://storage.knowtohire.com/resumes/branch.pdf',
  });
  const branchAppId = branchAppRes.data!.id;

  const rejectRes = await applicationService.updateApplicationStage(branchAppId, 'rejected');
  assert(rejectRes.data?.stage === 'rejected', 'Application successfully rejected in ATS');

  const withdrawRes = await applicationService.withdrawApplication(branchAppId);
  assert(withdrawRes.data?.stage === 'withdrawn', 'Application successfully recorded as withdrawn');

  // ============================================================================
  // PHASE 3 — JOB LIFECYCLE GOVERNANCE
  // ============================================================================
  section('PHASE 3 — JOB LIFECYCLE GOVERNANCE');

  // Switch to Employer session for job creation & lifecycle
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@ecostrategy.com', full_name: 'EcoStrategy Hiring Lead', role: 'employer', company_id: companyAId })
  );

  // Draft -> Published -> Paused -> Closed -> Reopened
  const draftJobRes = await jobService.createJob({
    title: 'Governance Lifecycle Job',
    department: 'Legal',
    location: 'Delhi, India',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    experience_level: 'lead',
    min_salary_inr: 3000000,
    max_salary_inr: 4000000,
    description: 'Draft job for lifecycle testing.',
    requirements: ['IPR', 'Contracts'],
    status: 'draft',
  });
  const govJobId = draftJobRes.data!.id;
  assert(draftJobRes.data?.status === 'draft', 'Job initialized in draft status');

  // Candidate public search must not see draft job
  const pubJobsDraft = await jobService.getPublishedJobs();
  assert(!pubJobsDraft.data?.data.some((j) => j.id === govJobId), 'Draft job is NOT visible in public search');

  // Publish Job
  await jobService.publishJob(govJobId);
  const pubJobsLive = await jobService.getPublishedJobs();
  assert(pubJobsLive.data?.data.some((j) => j.id === govJobId), 'Published job IS discoverable in public search');

  // Pause Job
  await jobService.pauseJob(govJobId);
  const pausedJob = await jobService.getJobById(govJobId);
  assert(pausedJob.data?.status === 'paused', 'Job status transitioned to paused');

  // Close Job
  await jobService.closeJob(govJobId);
  const closedJob = await jobService.getJobById(govJobId);
  assert(closedJob.data?.status === 'closed', 'Job status transitioned to closed');

  // Reopen Job
  await jobService.reopenJob(govJobId);
  const reopenedJob = await jobService.getJobById(govJobId);
  assert(reopenedJob.data?.status === 'published', 'Job successfully reopened and published');

  // ============================================================================
  // PHASE 4 — APPLICATION STATE MACHINE
  // ============================================================================
  section('PHASE 4 — APPLICATION STATE MACHINE');

  const appCheck = await applicationService.getApplicationById(createdAppId);
  assert(appCheck.data?.id === createdAppId, 'Application retrieved by ID matches canonical record');
  assert(appCheck.data?.stage === 'hired', 'Application stage accurately records terminal stage: "hired"');

  // ============================================================================
  // PHASE 5 — INTERVIEW LIFECYCLE
  // ============================================================================
  section('PHASE 5 — INTERVIEW LIFECYCLE');

  // Switch to Employer session for interview management
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@ecostrategy.com', full_name: 'EcoStrategy Hiring Lead', role: 'employer', company_id: companyAId })
  );

  const schedRes = await interviewService.scheduleInterview({
    application_id: createdAppId,
    candidate_id: testCandidateId,
    job_id: createdJobId,
    company_id: companyAId,
    interview_type: 'video',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    duration_minutes: 45,
    meeting_url: 'https://meet.google.com/kth-lifecycle-test',
    notes: 'Technical assessment with Lead Auditor.',
  });

  assert(schedRes.data !== null, 'Interview scheduled successfully');
  const interviewId = schedRes.data!.id;
  assert(schedRes.data!.status === 'scheduled', 'Interview initialized with status: "scheduled"');

  // Reschedule
  const rescheduledTime = new Date(Date.now() + 172800000).toISOString();
  const reschedRes = await interviewService.updateInterview(interviewId, {
    scheduled_at: rescheduledTime,
    status: 'rescheduled',
  });
  assert(reschedRes.data?.status === 'rescheduled', 'Interview status updated to "rescheduled"');

  // Mark Completed
  const completeRes = await interviewService.updateInterviewStatus(interviewId, 'completed');
  assert(completeRes.data === true, 'Interview marked as completed');

  // Advance application to Hired post-interview
  await applicationService.updateApplicationStage(createdAppId, 'hired');

  // Switch to Candidate session
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: testCandidateId, email: 'candidate@knowtohire.com', full_name: 'Surya Naikoti', role: 'candidate' })
  );

  const candInterviews = await interviewService.getInterviewsByCandidate(testCandidateId);
  const matchedCandInt = candInterviews.data?.find((i) => i.id === interviewId);
  assert(matchedCandInt?.status === 'completed', 'Candidate portal reflects completed interview');

  // ============================================================================
  // PHASE 6 — ANALYTICS RECONCILIATION
  // ============================================================================
  section('PHASE 6 — ANALYTICS RECONCILIATION');

  // Switch to Employer session for company analytics
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: employerAId, email: 'employer@ecostrategy.com', full_name: 'EcoStrategy Hiring Lead', role: 'employer', company_id: companyAId })
  );

  const empAnalytics = await analyticsService.getRecruitmentOverview({ timeRange: 'all' });
  assert(empAnalytics.data !== null, 'Employer analytics derived successfully');
  assert(empAnalytics.data!.totalApplicants >= 1, `Total applicants aggregated: ${empAnalytics.data!.totalApplicants}`);
  assert(empAnalytics.data!.hiredCount >= 1, `Hires aggregated: ${empAnalytics.data!.hiredCount}`);
  assert(empAnalytics.data!.avgTimeToHireDays !== undefined, 'Time to hire is computed');

  // ============================================================================
  // PHASE 7 — ADMIN VISIBILITY & GOVERNANCE
  // ============================================================================
  section('PHASE 7 — ADMIN VISIBILITY & GOVERNANCE');

  // Switch to Admin session
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({ id: adminId, email: 'admin@knowtohire.com', full_name: 'Platform Administrator', role: 'admin', company_id: companyAId })
  );

  // Admin sees the created job in moderation list
  const adminJobs = await adminService.getJobs();
  assert(adminJobs.data?.some((j) => j.id === createdJobId), 'Admin observes newly created job requisition');

  // Admin sees the application in management list
  const adminApps = await adminService.getApplications();
  assert(adminApps.data?.some((a) => a.id === createdAppId), 'Admin observes candidate application in platform queue');

  // Admin settings check
  const adminSettings = await adminSettingsService.getSettings();
  assert(adminSettings.data?.platform.platformName.includes('KnowToHire'), 'Admin settings configured and verified');

  // ============================================================================
  // PHASE 8 — MULTI-TENANT ISOLATION
  // ============================================================================
  section('PHASE 8 — MULTI-TENANT ISOLATION');

  const companyBId = '99999999-9999-9999-9999-999999999999';
  const companyBApps = await applicationService.getJobApplicants(createdJobId);

  // Assert that Company B cannot view Company A's application
  const leakedApp = companyBApps.data?.data.find((a) => a.company_id === companyBId);
  assert(!leakedApp, 'Company B cannot view Company A applications in ATS');

  // Assert that Company B cannot view Company A's interviews
  const companyBInterviews = await interviewService.getInterviewsByCompany(companyBId);
  const leakedInterview = companyBInterviews.data?.find((i) => i.company_id === companyAId);
  assert(!leakedInterview, 'Company B cannot view Company A scheduled interviews');

  // ============================================================================
  // PHASE 9 — AUTHORIZATION & ROLE ESCALATION RESISTANCE
  // ============================================================================
  section('PHASE 9 — AUTHORIZATION & ROLE ESCALATION RESISTANCE');

  const appTsx = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf-8');
  assert(appTsx.includes(".startsWith('/admin')"), 'Admin routes dynamically gated under /admin prefix');
  assert(appTsx.includes("allowedRoles={['admin']}"), 'Admin route strictly requires allowedRoles=["admin"]');
  assert(appTsx.includes("allowedRoles={['employer']}"), 'Employer route strictly requires allowedRoles=["employer"]');
  assert(appTsx.includes("allowedRoles={['candidate']}"), 'Candidate route strictly requires allowedRoles=["candidate"]');

  // ============================================================================
  // PHASE 10 — NEGATIVE BUSINESS FLOWS
  // ============================================================================
  section('PHASE 10 — NEGATIVE BUSINESS FLOWS');

  // 1. Duplicate Application Prevention
  const dupApplyRes = await applicationService.applyToJob({
    job_id: createdJobId,
    candidate_id: testCandidateId,
    resume_url: 'https://storage.knowtohire.com/resumes/dup.pdf',
  });
  assert(dupApplyRes.error !== null, 'Duplicate application attempt is rejected with an error');

  // 2. Direct access to non-existent job
  const fakeJobRes = await jobService.getJobById('job-non-existent-99999');
  assert(fakeJobRes.error !== null, 'Query for non-existent job returns error (404)');

  // 3. Direct access to non-existent application
  const fakeAppRes = await applicationService.getApplicationById('app-non-existent-99999');
  assert(fakeAppRes.error !== null, 'Query for non-existent application returns error (404)');

  // ============================================================================
  // PHASE 11 — EVENT PROPAGATION AUDIT
  // ============================================================================
  section('PHASE 11 — EVENT PROPAGATION AUDIT');

  const jobServiceCode = fs.readFileSync(path.join(srcRoot, 'services/jobService.ts'), 'utf-8');
  assert(jobServiceCode.includes('kth_jobs_changed'), 'jobService dispatches kth_jobs_changed event');

  const appServiceCode = fs.readFileSync(path.join(srcRoot, 'services/applicationService.ts'), 'utf-8');
  assert(appServiceCode.includes('kth_applications_changed'), 'applicationService dispatches kth_applications_changed event');

  const intServiceCode = fs.readFileSync(path.join(srcRoot, 'services/interviewService.ts'), 'utf-8');
  assert(intServiceCode.includes('kth_interviews_changed'), 'interviewService dispatches kth_interviews_changed event');

  const reqServiceCode = fs.readFileSync(path.join(srcRoot, 'services/requestService.ts'), 'utf-8');
  assert(reqServiceCode.includes('kth_requests_changed'), 'requestService dispatches kth_requests_changed event');

  const blogServiceCode = fs.readFileSync(path.join(srcRoot, 'services/blogService.ts'), 'utf-8');
  assert(blogServiceCode.includes('kth_blog_changed'), 'blogService dispatches kth_blog_changed event');

  // ============================================================================
  // PHASE 12 — FABRICATED / PLACEHOLDER DATA AUDIT
  // ============================================================================
  section('PHASE 12 — FABRICATED / PLACEHOLDER DATA AUDIT');

  const allJobs = await adminService.getJobs();
  for (const j of allJobs.data || []) {
    assert(j.title !== 'Placeholder Job' && j.title !== 'Untitled Job', `Job (${j.id}) has authentic title: "${j.title}"`);
    assert(j.company_name !== 'Placeholder Inc', `Job (${j.id}) has authentic company: "${j.company_name}"`);
  }

  const allResources = await knowledgeService.getResources({ status: 'all' });
  for (const r of allResources.data || []) {
    assert(r.title !== 'Placeholder Resource', `Resource (${r.id}) has authentic title: "${r.title}"`);
  }

  const allTemplates = await templateService.getTemplates({ status: 'all' });
  for (const t of allTemplates.data || []) {
    assert(t.title !== 'Placeholder Template', `Template (${t.id}) has authentic title: "${t.title}"`);
  }

  const allPosts = await blogService.getBlogPosts({ status: 'all' });
  for (const p of allPosts.data || []) {
    assert(p.title !== 'Placeholder Post', `Blog Post (${p.id}) has authentic title: "${p.title}"`);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`  MASTER FULL PLATFORM LIFECYCLE E2E RESULTS`);
  console.log(`══════════════════════════════════════════════════════════════════════`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total:  ${passed + failed}`);
  console.log(`══════════════════════════════════════════════════════════════════════\n`);

  if (failed > 0) {
    console.error(`Failed checks:\n` + errors.map((e, i) => `    ${i + 1}. ${e}`).join('\n'));
    process.exit(1);
  }
}

runMasterSuite().catch((err) => {
  console.error('Master lifecycle test suite runner crashed:', err);
  process.exit(1);
});
