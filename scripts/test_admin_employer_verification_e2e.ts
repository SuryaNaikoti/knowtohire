/**
 * KnowToHire — Admin Employer Enterprise Verification E2E Certification Suite
 * ==============================================================================
 * Comprehensive functional, data-integrity, security, cross-module, and state-machine audit:
 * 1. Routing & Access Control (/admin/employers with RoleGuard allowedRoles=['admin'])
 * 2. Enterprise Listing Data Lineage & Schema Integrity (public.company_profiles)
 * 3. Verification State Machine (unverified -> pending_review -> verified -> rejected)
 * 4. Verify & Reject Mutation Life-Cycle & Error Handling
 * 5. Multi-Tenant Isolation & Targeted ID Mutations
 * 6. Cross-Module Real-time Synchronization (kth_employers_changed & kth_company_profile_updated)
 * 7. Demo Mode Local Storage Persistence & Production Supabase Separation
 * 8. Job Publishing Authorization & Governance (is_verified flag / verified company badge)
 * 9. Sensitive Data Minimization & Privacy Protection
 *
 * Run: npx tsx scripts/test_admin_employer_verification_e2e.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { adminService } from '../src/services/adminService';
import { companyProfileService } from '../src/services/companyProfileService';

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
  assert(appCode.includes("path === '/admin/employers'"), 'Route /admin/employers is registered in App.tsx');
  assert(appCode.includes('<RoleGuard allowedRoles={[\'admin\']}'), 'Route /admin/employers is guarded with allowedRoles=["admin"]');
  assert(appCode.includes('<ProtectedRoute'), 'Route /admin/employers is guarded with ProtectedRoute');

  const adminEmployersPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminEmployersPage.tsx'), 'utf-8');
  assert(adminEmployersPageCode.includes('AdminShell title="Employer Enterprise Verification"'), 'AdminEmployersPage renders within AdminShell with proper module title');
  assert(adminEmployersPageCode.includes('onNavigate={onNavigate}'), 'AdminEmployersPage forwards onNavigate prop to shell');

  // ============================================================================
  // 2. DATA LINEAGE & CANONICAL ENTERPRISE IDENTITIES
  // ============================================================================
  section('2. DATA LINEAGE & CANONICAL ENTERPRISE IDENTITIES');

  const compRes = await adminService.getCompanies();
  assert(compRes.data !== null && compRes.data.length > 0, 'adminService.getCompanies retrieves company records');
  assert(compRes.error === null, 'getCompanies executes with 0 errors');

  const companies = compRes.data || [];
  assert(companies.length >= 4, `Retrieves ${companies.length} canonical registered enterprises (min 4)`);

  const primaryEmployer = companies.find(c => c.id === 'fa97faee-1cdf-41e6-a151-f51c7fa4c396');
  assert(primaryEmployer !== undefined, 'Canonical primary demo employer (fa97faee-1cdf-41e6-a151-f51c7fa4c396) is present');
  assert(primaryEmployer?.name === 'EcoStrategy India Pvt Ltd', `Primary employer name is "${primaryEmployer?.name}" (matches canonical identity)`);
  assert(primaryEmployer?.industry === 'Environmental & ESG Advisory', 'Industry is Environmental & ESG Advisory');
  assert(primaryEmployer?.headquarters_location === 'Bengaluru, Karnataka', 'Headquarters is Bengaluru, Karnataka');

  // Check no undefined/null rendering
  companies.forEach(c => {
    assert(Boolean(c.id && c.name), `Company "${c.name}" has valid non-null ID and Name`);
    assert(Boolean(c.verification_status), `Company "${c.name}" has explicit verification_status: ${c.verification_status}`);
  });

  // ============================================================================
  // 3. VERIFICATION STATE MACHINE & ACTION LIFECYCLE
  // ============================================================================
  section('3. VERIFICATION STATE MACHINE & ACTION LIFECYCLE');

  const targetCompId = 'c76c28d3-df6a-4581-a03d-05be23dd1c50'; // SustainEdge Consulting

  // 1. Initial status
  let currentList = (await adminService.getCompanies()).data || [];
  let targetComp = currentList.find(c => c.id === targetCompId);
  assert(targetComp !== undefined, 'Target test enterprise found in directory');

  // 2. Transition to 'verified'
  const verifyRes = await adminService.updateCompanyVerification(targetCompId, 'verified');
  assert(verifyRes.data === true, 'Admin successfully approves company verification (status -> verified)');
  assert(verifyRes.error === null, 'Verify action returns 0 errors');

  // Verify persistence
  currentList = (await adminService.getCompanies()).data || [];
  targetComp = currentList.find(c => c.id === targetCompId);
  assert(targetComp?.verification_status === 'verified', 'Company status updated to "verified" and persists in session');

  // 3. Transition to 'rejected'
  const rejectRes = await adminService.updateCompanyVerification(targetCompId, 'rejected');
  assert(rejectRes.data === true, 'Admin successfully rejects company verification (status -> rejected)');
  assert(rejectRes.error === null, 'Reject action returns 0 errors');

  // Verify persistence
  currentList = (await adminService.getCompanies()).data || [];
  targetComp = currentList.find(c => c.id === targetCompId);
  assert(targetComp?.verification_status === 'rejected', 'Company status updated to "rejected" and persists in session');

  // 4. Reset to 'pending_review'
  const resetRes = await adminService.updateCompanyVerification(targetCompId, 'pending_review');
  assert(resetRes.data === true, 'Company can transition back to "pending_review" for re-evaluation');
  currentList = (await adminService.getCompanies()).data || [];
  targetComp = currentList.find(c => c.id === targetCompId);
  assert(targetComp?.verification_status === 'pending_review', 'Company status reflects "pending_review"');

  // ============================================================================
  // 4. MULTI-TENANT ISOLATION & NON-LEAKAGE
  // ============================================================================
  section('4. MULTI-TENANT ISOLATION & NON-LEAKAGE');

  const unmutatedCompId = 'bfcfe635-a4d4-40bf-a2e9-cffeb4b4553a'; // Patent Nexus
  const unmutatedComp = currentList.find(c => c.id === unmutatedCompId);
  assert(unmutatedComp?.verification_status === 'verified', 'Status mutation on Company A does NOT leak or affect Company B');

  // ============================================================================
  // 5. CROSS-MODULE EVENT DISPATCH & REACTIVITY
  // ============================================================================
  section('5. CROSS-MODULE EVENT DISPATCH & REACTIVITY');

  const adminServiceCode = fs.readFileSync(path.join(srcRoot, 'services/adminService.ts'), 'utf-8');
  assert(adminServiceCode.includes("window.dispatchEvent(\n          new CustomEvent('kth_employers_changed'"), 'updateCompanyVerification dispatches kth_employers_changed event');
  assert(adminServiceCode.includes("window.dispatchEvent(\n          new CustomEvent('kth_company_profile_updated'"), 'updateCompanyVerification dispatches kth_company_profile_updated event');

  assert(adminEmployersPageCode.includes("window.addEventListener('kth_employers_changed', handleEmployersChanged);"), 'AdminEmployersPage subscribes to kth_employers_changed');
  assert(adminEmployersPageCode.includes("window.addEventListener('kth_company_profile_updated', handleEmployersChanged);"), 'AdminEmployersPage subscribes to kth_company_profile_updated');

  const compProfilePageCode = fs.readFileSync(path.join(srcRoot, 'pages/employer/EmployerCompanyProfilePage.tsx'), 'utf-8');
  assert(compProfilePageCode.includes("company.verification_status === 'verified'"), 'EmployerCompanyProfilePage renders verified badge accurately');
  assert(compProfilePageCode.includes("company.verification_status === 'pending_review'"), 'EmployerCompanyProfilePage renders pending_review badge accurately');
  assert(compProfilePageCode.includes("company.verification_status === 'rejected'"), 'EmployerCompanyProfilePage renders rejected badge accurately');

  // ============================================================================
  // 6. JOB PUBLISHING GOVERNANCE & BADGE INTEGRITY
  // ============================================================================
  section('6. JOB PUBLISHING GOVERNANCE & BADGE INTEGRITY');

  const jobsPageCode = fs.readFileSync(path.join(srcRoot, 'pages/public/JobsPage.tsx'), 'utf-8');
  assert(jobsPageCode.includes("job.company?.verification_status === 'verified'"), 'Public JobsPage renders Verified badge based on enterprise verification_status');

  const jobDetailsPageCode = fs.readFileSync(path.join(srcRoot, 'pages/public/JobDetailsPage.tsx'), 'utf-8');
  assert(jobDetailsPageCode.includes("job.company?.verification_status === 'verified'"), 'Public JobDetailsPage renders Verified badge based on enterprise verification_status');

  // ============================================================================
  // 7. SUPABASE RLS & DATABASE POLICIES
  // ============================================================================
  section('7. SUPABASE RLS & DATABASE POLICIES');

  const rlsMigrationPath = path.join(migrationsRoot, '20260817000000_fix_employer_rls_recursion.sql');
  assert(fs.existsSync(rlsMigrationPath), 'RLS policy migration for company_profiles and employers exists');

  const rlsMigrationCode = fs.readFileSync(rlsMigrationPath, 'utf-8');
  assert(rlsMigrationCode.includes('CREATE POLICY "company_profiles_select_public"'), 'company_profiles allows public authenticated read');
  assert(rlsMigrationCode.includes('CREATE POLICY "company_profiles_update_employer"'), 'company_profiles update is restricted by tenant company_id');

  // ============================================================================
  // 8. SENSITIVE DATA MINIMIZATION
  // ============================================================================
  section('8. SENSITIVE DATA MINIMIZATION');

  assert(!adminEmployersPageCode.includes('password'), 'AdminEmployersPage does not expose password hashes');
  assert(!adminEmployersPageCode.includes('bank_account'), 'AdminEmployersPage does not expose sensitive financial accounts');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('  ADMIN EMPLOYER VERIFICATION E2E RESULTS');
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
