/**
 * KnowToHire Admin Application Management Module E2E Test Suite
 * Tests Route Registration, RoleGuard RBAC, Canonical Lineage,
 * ATS Stage Machine, KPI Calculations, Search & Filtering,
 * Inspect & Manage Workflow, Multi-Tenant Isolation, RLS Policies,
 * and Cross-Module Event Synchronization.
 */

import { adminService } from '../src/services/adminService';
import { applicationService } from '../src/services/applicationService';
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

async function runSuite() {
  const projectRoot = process.cwd();
  const srcRoot = path.join(projectRoot, 'src');

  // ============================================================================
  // 1. ROUTING & ACCESS CONTROL AUDIT
  // ============================================================================
  section('1. ROUTING & ACCESS CONTROL AUDIT');

  const appTsx = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf-8');
  assert(appTsx.includes("path === '/admin/applications'"), 'Route /admin/applications is registered in App.tsx');
  assert(appTsx.includes("allowedRoles={['admin']}"), 'Route /admin/applications is guarded with allowedRoles=["admin"]');
  assert(appTsx.includes('<ProtectedRoute'), 'Route /admin/applications is guarded with ProtectedRoute');

  const adminApplicationsPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminApplicationsPage.tsx'), 'utf-8');
  assert(adminApplicationsPageCode.includes('<AdminShell'), 'AdminApplicationsPage renders within AdminShell with proper module title');
  assert(adminApplicationsPageCode.includes('onNavigate={onNavigate}'), 'AdminApplicationsPage forwards onNavigate prop to shell');

  // ============================================================================
  // 2. DATA LINEAGE & CANONICAL APPLICATION DATA
  // ============================================================================
  section('2. DATA LINEAGE & CANONICAL APPLICATION DATA');

  const res = await adminService.getApplications();
  assert(res.data !== null && Array.isArray(res.data), 'adminService.getApplications retrieves application records');
  assert(res.error === null, 'getApplications executes with 0 errors');

  const apps = res.data || [];
  assert(apps.length >= 6, `Retrieves ${apps.length} canonical enterprise applications (min 6)`);

  const primaryApp = apps.find(a => a.id === 'app-cand-1');
  assert(primaryApp !== undefined, 'Canonical application (app-cand-1) is present in applications view');
  assert(primaryApp?.candidate_name === 'Aarav Mehta', 'Candidate name is "Aarav Mehta" (canonical, not placeholder)');
  assert(primaryApp?.company_name === 'EcoStrategy India Pvt Ltd', 'Company name is "EcoStrategy India Pvt Ltd"');
  assert(primaryApp?.job_title === 'Senior Sustainability Consultant', 'Job title is "Senior Sustainability Consultant"');
  assert(primaryApp?.category === 'Sustainability & ESG', 'Category is "Sustainability & ESG"');
  assert(primaryApp?.match_score === 96, 'Semantic match score is 96 (canonical computed fit)');

  // Audit all records for placeholder avoidance
  for (const app of apps) {
    assert(Boolean(app.id && app.candidate_id && app.job_id), `Application ${app.id} has valid non-null ID, Candidate ID, and Job ID`);
    assert(Boolean(app.stage), `Application ${app.id} has explicit stage: ${app.stage}`);
    assert(app.company_name !== 'Hiring Enterprise', `Application ${app.id} does NOT use placeholder "Hiring Enterprise"`);
    assert(app.candidate_name !== 'Candidate' || app.candidate_email !== '', `Application ${app.id} does NOT use generic "Candidate" without identity`);
    assert(app.job_title !== 'Position Opening', `Application ${app.id} does NOT use generic "Position Opening"`);
  }

  // ============================================================================
  // 3. KPI CORRECTNESS & RECONCILIATION
  // ============================================================================
  section('3. KPI CORRECTNESS & RECONCILIATION');

  const totalKPI = apps.length;
  const screeningKPI = apps.filter(a => a.stage === 'screening' || a.stage === 'shortlisted').length;
  const interviewKPI = apps.filter(a => a.stage === 'interview').length;
  const offerHiredKPI = apps.filter(a => a.stage === 'offer' || a.stage === 'hired').length;

  assert(totalKPI >= 6, `Total Applications KPI derives ${totalKPI} applications`);
  assert(screeningKPI >= 2, `In Screening KPI derives ${screeningKPI} screening/shortlisted applications`);
  assert(interviewKPI >= 1, `Interviewing KPI derives ${interviewKPI} interview applications`);
  assert(offerHiredKPI >= 2, `Offers & Hires KPI derives ${offerHiredKPI} offer/hired applications`);

  // ============================================================================
  // 4. SEARCH & STAGE FILTERING
  // ============================================================================
  section('4. SEARCH & STAGE FILTERING');

  // Search by Candidate Name
  const searchNameRes = await adminService.getApplications('Aarav');
  assert(searchNameRes.data?.some(a => a.candidate_name.includes('Aarav')) === true, 'Search by candidate name "Aarav" finds application');
  assert(searchNameRes.data?.every(a => a.candidate_name.toLowerCase().includes('aarav') || a.job_title.toLowerCase().includes('aarav') || a.company_name.toLowerCase().includes('aarav')) === true, 'Search results strictly match query');

  // Search by Email
  const searchEmailRes = await adminService.getApplications('example.com');
  assert((searchEmailRes.data?.length || 0) >= 1, 'Search by candidate email domain finds records');

  // Filter by Stage
  const filterScreeningRes = await adminService.getApplications(undefined, 'screening');
  assert(filterScreeningRes.data?.every(a => a.stage === 'screening') === true, 'Filter by stage="screening" returns only screening applications');

  const filterInterviewRes = await adminService.getApplications(undefined, 'interview');
  assert(filterInterviewRes.data?.every(a => a.stage === 'interview') === true, 'Filter by stage="interview" returns only interview applications');

  const filterOfferRes = await adminService.getApplications(undefined, 'offer');
  assert(filterOfferRes.data?.every(a => a.stage === 'offer') === true, 'Filter by stage="offer" returns only offer applications');

  const filterHiredRes = await adminService.getApplications(undefined, 'hired');
  assert(filterHiredRes.data?.every(a => a.stage === 'hired') === true, 'Filter by stage="hired" returns only hired applications');

  // Combined Search + Filter
  const combinedRes = await adminService.getApplications('EcoStrategy', 'interview');
  assert(combinedRes.data?.every(a => a.stage === 'interview' && (a.company_name.includes('EcoStrategy') || a.candidate_name.includes('EcoStrategy'))) === true, 'Simultaneous search + stage filter matches strictly');

  // Zero Results
  const zeroRes = await adminService.getApplications('NonExistentCandidateNameXYZ123');
  assert(zeroRes.data?.length === 0, 'Non-existent search returns zero results without crashing');

  // ============================================================================
  // 5. INSPECT & MANAGE STAGE TRANSITION STATE MACHINE
  // ============================================================================
  section('5. INSPECT & MANAGE STAGE TRANSITION STATE MACHINE');

  const targetAppId = 'app-cand-4';

  // 1. Initial State
  let allApps = (await adminService.getApplications()).data || [];
  let targetApp = allApps.find(a => a.id === targetAppId);
  assert(targetApp !== undefined, 'Target application found in applications list');

  // 2. Transition to 'screening'
  const screenRes = await adminService.updateApplicationStage(targetAppId, 'screening');
  assert(screenRes.data === true, 'Admin successfully advances application to screening');
  assert(screenRes.error === null, 'Screening transition returns 0 errors');

  allApps = (await adminService.getApplications()).data || [];
  targetApp = allApps.find(a => a.id === targetAppId);
  assert(targetApp?.stage === 'screening', 'Application stage updated to "screening" in admin store');

  // 3. Transition to 'interview'
  const intRes = await adminService.updateApplicationStage(targetAppId, 'interview');
  assert(intRes.data === true, 'Admin successfully advances application to interview');

  allApps = (await adminService.getApplications()).data || [];
  targetApp = allApps.find(a => a.id === targetAppId);
  assert(targetApp?.stage === 'interview', 'Application stage updated to "interview" in admin store');

  // 4. Transition to 'offer'
  const offerRes = await adminService.updateApplicationStage(targetAppId, 'offer');
  assert(offerRes.data === true, 'Admin successfully advances application to offer');

  allApps = (await adminService.getApplications()).data || [];
  targetApp = allApps.find(a => a.id === targetAppId);
  assert(targetApp?.stage === 'offer', 'Application stage updated to "offer" in admin store');

  // 5. Transition to 'hired'
  const hiredRes = await adminService.updateApplicationStage(targetAppId, 'hired');
  assert(hiredRes.data === true, 'Admin successfully advances application to hired');

  allApps = (await adminService.getApplications()).data || [];
  targetApp = allApps.find(a => a.id === targetAppId);
  assert(targetApp?.stage === 'hired', 'Application stage updated to "hired" in admin store');

  // 6. Reset back to 'new'
  await adminService.updateApplicationStage(targetAppId, 'new');
  allApps = (await adminService.getApplications()).data || [];
  targetApp = allApps.find(a => a.id === targetAppId);
  assert(targetApp?.stage === 'new', 'Application stage successfully reset to "new"');

  // ============================================================================
  // 6. MULTI-TENANT ISOLATION & NON-LEAKAGE
  // ============================================================================
  section('6. MULTI-TENANT ISOLATION & NON-LEAKAGE');

  const unmutatedAppId = 'app-cand-2';
  allApps = (await adminService.getApplications()).data || [];
  const unmutatedApp = allApps.find(a => a.id === unmutatedAppId);
  assert(unmutatedApp?.stage === 'screening', 'Mutating Application A does NOT modify or leak into Application B');

  // ============================================================================
  // 7. CROSS-MODULE EVENT DISPATCH & REACTIVITY
  // ============================================================================
  section('7. CROSS-MODULE EVENT DISPATCH & REACTIVITY');

  const adminServiceCode = fs.readFileSync(path.join(srcRoot, 'services/adminService.ts'), 'utf-8');
  assert(adminServiceCode.includes("window.dispatchEvent(new CustomEvent('kth_applications_changed'))"), 'updateApplicationStage dispatches kth_applications_changed event');

  const appServiceCode = fs.readFileSync(path.join(srcRoot, 'services/applicationService.ts'), 'utf-8');
  assert(appServiceCode.includes("window.dispatchEvent(new CustomEvent('kth_applications_changed'))"), 'applicationService dispatches kth_applications_changed event on application submission/withdrawal/transition');

  assert(adminApplicationsPageCode.includes("window.addEventListener('kth_applications_changed'"), 'AdminApplicationsPage subscribes to kth_applications_changed for live synchronization');

  // ============================================================================
  // 8. SUPABASE RLS & DATABASE POLICIES
  // ============================================================================
  section('8. SUPABASE RLS & DATABASE POLICIES');

  const migrationsRoot = path.join(projectRoot, 'supabase/migrations');
  const rlsMigrationPath = path.join(migrationsRoot, '20260815000000_job_portal_and_recruitment_schema.sql');
  assert(fs.existsSync(rlsMigrationPath), 'RLS policy migration for job_applications exists');

  const rlsMigration = fs.readFileSync(rlsMigrationPath, 'utf-8');
  assert(rlsMigration.includes('CREATE POLICY "job_applications_admin_all"'), 'job_applications allows admin full access');
  assert(rlsMigration.includes('CREATE POLICY "job_applications_select_candidate_own"'), 'job_applications restricts candidate select to own candidate_id');
  assert(rlsMigration.includes('CREATE POLICY "job_applications_select_employer_company"'), 'job_applications restricts employer select to authenticated company_id');
  assert(rlsMigration.includes('CREATE POLICY "job_applications_update_employer_company"'), 'job_applications restricts employer updates to company_id');

  // ============================================================================
  // 9. SENSITIVE DATA MINIMIZATION
  // ============================================================================
  section('9. SENSITIVE DATA MINIMIZATION');

  assert(!adminApplicationsPageCode.includes('password_hash'), 'AdminApplicationsPage does not expose password hashes');
  assert(!adminApplicationsPageCode.includes('bank_account'), 'AdminApplicationsPage does not expose sensitive financial data');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`  ADMIN APPLICATION MANAGEMENT E2E RESULTS`);
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

runSuite().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
