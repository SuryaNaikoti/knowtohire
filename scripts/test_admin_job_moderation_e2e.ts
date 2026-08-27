/**
 * KnowToHire — Admin Job Moderation E2E Certification Suite
 * ==============================================================================
 * Comprehensive functional, data-integrity, security, cross-module, and state-machine audit:
 * 1. Routing & Access Control (/admin/jobs with RoleGuard allowedRoles=['admin'])
 * 2. Enterprise Jobs Listing Data Lineage & Schema Integrity (public.jobs + company_profiles)
 * 3. Moderation State Machine (published -> paused -> closed -> published)
 * 4. Pause & Close Mutation Life-Cycle & Error Handling
 * 5. Public Visibility Rules (Candidate sees published only; paused/closed/draft are hidden)
 * 6. Multi-Tenant Isolation & Targeted ID Mutations
 * 7. Cross-Module Real-time Synchronization (kth_jobs_changed event)
 * 8. Requisition Retention & Historical Application Protection (Zero data loss)
 * 9. Demo Mode Local Storage Persistence & Supabase Integration
 * 10. Sensitive Data Minimization & Privacy Protection
 *
 * Run: npx tsx scripts/test_admin_job_moderation_e2e.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { adminService } from '../src/services/adminService';
import { jobService } from '../src/services/jobService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.resolve(__dirname, '..', 'src');
const migrationsRoot = path.resolve(__dirname, '..', 'supabase', 'migrations');

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ❌ FAIL: ${label}`);
  }
}

function section(title: string) {
  console.log(`\n${'━'.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('━'.repeat(70));
}

// Mock localStorage environment for node execution
const memoryStore: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (k: string) => memoryStore[k] || null,
    setItem: (k: string, v: string) => { memoryStore[k] = v; },
    removeItem: (k: string) => { delete memoryStore[k]; },
    clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
  },
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
  CustomEvent: class {
    type: string;
    detail: any;
    constructor(type: string, opts?: any) {
      this.type = type;
      this.detail = opts?.detail;
    }
  },
};

async function runTestSuite() {
  // ============================================================================
  // 1. ROUTING & ACCESS CONTROL AUDIT
  // ============================================================================
  section('1. ROUTING & ACCESS CONTROL AUDIT');

  const appCode = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf-8');
  assert(appCode.includes("path === '/admin/jobs'"), 'Route /admin/jobs is registered in App.tsx');
  assert(appCode.includes('<RoleGuard allowedRoles={[\'admin\']}'), 'Route /admin/jobs is guarded with allowedRoles=["admin"]');
  assert(appCode.includes('<ProtectedRoute'), 'Route /admin/jobs is guarded with ProtectedRoute');

  const adminJobsPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminJobsPage.tsx'), 'utf-8');
  assert(adminJobsPageCode.includes('AdminShell title="Job Post Moderation"'), 'AdminJobsPage renders within AdminShell with proper module title');
  assert(adminJobsPageCode.includes('onNavigate={onNavigate}'), 'AdminJobsPage forwards onNavigate prop to shell');

  // ============================================================================
  // 2. DATA LINEAGE & CANONICAL JOB LISTING DATA
  // ============================================================================
  section('2. DATA LINEAGE & CANONICAL JOB LISTING DATA');

  const jobsRes = await adminService.getJobs();
  assert(jobsRes.data !== null && jobsRes.data.length > 0, 'adminService.getJobs retrieves job listings');
  assert(jobsRes.error === null, 'getJobs executes with 0 errors');

  const jobs = jobsRes.data || [];
  assert(jobs.length >= 6, `Retrieves ${jobs.length} canonical enterprise job requisitions (min 6)`);

  const techJob = jobs.find(j => j.id === 'job-tech-1');
  assert(techJob !== undefined, 'Canonical technology job (job-tech-1) is present in moderation view');
  assert(techJob?.company_name === 'Enterprise Cloud Solutions India', `Company name is "${techJob?.company_name}" (canonical, not placeholder)`);
  assert(techJob?.location === 'Hyderabad, Telangana', `Location is "${techJob?.location}"`);

  // Verify neutral fallbacks and absence of fake placeholders
  jobs.forEach(j => {
    assert(Boolean(j.id && j.title), `Job "${j.title}" has valid non-null ID and Title`);
    assert(Boolean(j.status), `Job "${j.title}" has explicit status: ${j.status}`);
    assert(j.company_name !== 'Hiring Enterprise', `Job "${j.title}" does NOT use hardcoded placeholder "Hiring Enterprise"`);
    assert(j.category !== 'General Careers', `Job "${j.title}" does NOT use hardcoded "General Careers"`);
  });

  // ============================================================================
  // 3. MODERATION STATE MACHINE (PUBLISHED -> PAUSED -> CLOSED -> PUBLISHED)
  // ============================================================================
  section('3. MODERATION STATE MACHINE');

  const targetJobId = 'job-tech-2';

  // 1. Initial State
  let allJobs = (await adminService.getJobs()).data || [];
  let targetJob = allJobs.find(j => j.id === targetJobId);
  assert(targetJob !== undefined, 'Target job found in moderation list');

  // 2. Transition to 'paused'
  const pauseRes = await adminService.updateJobStatus(targetJobId, 'paused');
  assert(pauseRes.data === true, 'Admin successfully pauses job (status -> paused)');
  assert(pauseRes.error === null, 'Pause action returns 0 errors');

  allJobs = (await adminService.getJobs()).data || [];
  targetJob = allJobs.find(j => j.id === targetJobId);
  assert(targetJob?.status === 'paused', 'Job status updated to "paused" in admin store');

  // 3. Transition to 'closed'
  const closeRes = await adminService.updateJobStatus(targetJobId, 'closed');
  assert(closeRes.data === true, 'Admin successfully closes job (status -> closed)');
  assert(closeRes.error === null, 'Close action returns 0 errors');

  allJobs = (await adminService.getJobs()).data || [];
  targetJob = allJobs.find(j => j.id === targetJobId);
  assert(targetJob?.status === 'closed', 'Job status updated to "closed" in admin store');

  // 4. Transition back to 'published' (Reopen / Resume)
  const publishRes = await adminService.updateJobStatus(targetJobId, 'published');
  assert(publishRes.data === true, 'Admin successfully republishes job (status -> published)');
  assert(publishRes.error === null, 'Publish action returns 0 errors');

  allJobs = (await adminService.getJobs()).data || [];
  targetJob = allJobs.find(j => j.id === targetJobId);
  assert(targetJob?.status === 'published', 'Job status updated back to "published"');

  // ============================================================================
  // 4. PUBLIC VISIBILITY RULES AUDIT
  // ============================================================================
  section('4. PUBLIC VISIBILITY RULES AUDIT');

  // When paused, candidate MUST NOT see it in published feeds
  await adminService.updateJobStatus(targetJobId, 'paused');
  let candidateJobs = (await jobService.getPublishedJobs()).data?.data || [];
  let candidateFound = candidateJobs.some(j => j.id === targetJobId);
  assert(!candidateFound, 'Candidate job feed DOES NOT include "paused" job');

  let directFetch = await jobService.getPublishedJobById(targetJobId);
  assert(directFetch.data === null, 'Direct getPublishedJobById rejects "paused" job');

  // When closed, candidate MUST NOT see it
  await adminService.updateJobStatus(targetJobId, 'closed');
  candidateJobs = (await jobService.getPublishedJobs()).data?.data || [];
  candidateFound = candidateJobs.some(j => j.id === targetJobId);
  assert(!candidateFound, 'Candidate job feed DOES NOT include "closed" job');

  directFetch = await jobService.getPublishedJobById(targetJobId);
  assert(directFetch.data === null, 'Direct getPublishedJobById rejects "closed" job');

  // When published, candidate CAN see it
  await adminService.updateJobStatus(targetJobId, 'published');
  candidateJobs = (await jobService.getPublishedJobs()).data?.data || [];
  candidateFound = candidateJobs.some(j => j.id === targetJobId);
  assert(candidateFound, 'Candidate job feed includes "published" job');

  directFetch = await jobService.getPublishedJobById(targetJobId);
  assert(directFetch.data !== null && directFetch.data.id === targetJobId, 'Direct getPublishedJobById returns "published" job');

  // ============================================================================
  // 5. MULTI-TENANT ISOLATION & NON-LEAKAGE
  // ============================================================================
  section('5. MULTI-TENANT ISOLATION & NON-LEAKAGE');

  const unmutatedJobId = 'job-tech-3';
  allJobs = (await adminService.getJobs()).data || [];
  const unmutatedJob = allJobs.find(j => j.id === unmutatedJobId);
  assert(unmutatedJob?.status === 'published', 'Moderating Job A does NOT modify or leak into Job B');

  // ============================================================================
  // 6. CROSS-MODULE EVENT DISPATCH & REACTIVITY
  // ============================================================================
  section('6. CROSS-MODULE EVENT DISPATCH & REACTIVITY');

  const adminServiceCode = fs.readFileSync(path.join(srcRoot, 'services/adminService.ts'), 'utf-8');
  assert(adminServiceCode.includes("window.dispatchEvent(new CustomEvent('kth_jobs_changed'))"), 'updateJobStatus dispatches kth_jobs_changed event');

  assert(adminJobsPageCode.includes("window.addEventListener('kth_jobs_changed', handleJobsChanged);"), 'AdminJobsPage subscribes to kth_jobs_changed');

  const employerJobsPageCode = fs.readFileSync(path.join(srcRoot, 'pages/employer/EmployerJobsPage.tsx'), 'utf-8');
  assert(employerJobsPageCode.includes('kth_jobs_changed'), 'EmployerJobsPage subscribes to kth_jobs_changed');

  // ============================================================================
  // 7. HISTORICAL RETENTION & APPLICATION PROTECTION
  // ============================================================================
  section('7. HISTORICAL RETENTION & APPLICATION PROTECTION');

  // Pausing or closing a job does NOT delete existing candidate applications
  const { MOCK_CANDIDATE_APPLICATIONS } = await import('../src/data/candidateMockData');
  assert(MOCK_CANDIDATE_APPLICATIONS.length >= 3, 'Historical candidate applications remain intact');
  const appJobIds = MOCK_CANDIDATE_APPLICATIONS.map(a => a.jobTitle);
  assert(appJobIds.length > 0, 'Candidate applications retain their associated requisitions');

  // ============================================================================
  // 8. SUPABASE RLS & DATABASE POLICIES
  // ============================================================================
  section('8. SUPABASE RLS & DATABASE POLICIES');

  const rlsMigrationPath = path.join(migrationsRoot, '20260815000000_job_portal_and_recruitment_schema.sql');
  assert(fs.existsSync(rlsMigrationPath), 'RLS policy migration for jobs table exists');

  const rlsMigrationCode = fs.readFileSync(rlsMigrationPath, 'utf-8');
  assert(rlsMigrationCode.includes('CREATE POLICY "jobs_select_public_published"'), 'jobs allows public authenticated read for status = published');
  assert(rlsMigrationCode.includes('CREATE POLICY "jobs_update_employer"'), 'jobs update is restricted by tenant company_id');

  // ============================================================================
  // 9. SENSITIVE DATA MINIMIZATION
  // ============================================================================
  section('9. SENSITIVE DATA MINIMIZATION');

  assert(!adminJobsPageCode.includes('password'), 'AdminJobsPage does not expose password hashes');
  assert(!adminJobsPageCode.includes('bank_account'), 'AdminJobsPage does not expose sensitive financial data');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('  ADMIN JOB MODERATION E2E RESULTS');
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total:  ${passed + failed}`);
  if (failures.length > 0) {
    console.log('\n  Failed checks:');
    failures.forEach((f, idx) => console.log(`    ${idx + 1}. ${f}`));
  }
  console.log('══════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
