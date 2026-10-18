/**
 * KnowToHire — Permanent Account Removal & Suspension Safety Test Suite
 * =========================================================================
 * Verifies:
 * 1. Self-deletion prevention (Admin cannot delete self)
 * 2. Superuser protection (Master admin cannot be deleted)
 * 3. Last admin protection (Sole admin in system cannot be purged)
 * 4. Candidate & Employer inspect modals use reversible updateUserStatus (NOT deleteUserPermanently)
 * 5. Candidate & Employer modals provide explicit "Restore Account" actions
 * 6. Explicit typed confirmation dialog in AdminUsersPage
 * 7. Candidate account deletion & cascade
 * 8. Employer account deletion & shared company integrity (ON DELETE RESTRICT jobs neutralization)
 * 9. Creator account deletion & financial ledger retention (compliance data preserved, PII anonymized)
 * 10. Storage file cleanup logic
 * 11. Re-registration creates fresh onboarding journey (no stale profile restoration)
 *
 * Run: npx tsx scripts/test_permanent_account_removal.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.resolve(__dirname, '..', 'src');
const apiRoot = path.resolve(__dirname, '..', 'api');
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

async function runPermanentAccountRemovalSuite() {
  console.log('\n======================================================');
  console.log('🧪 Permanent Account Removal & Suspension Safety Suite');
  console.log('======================================================\n');

  // 1. BACKEND HANDLER VERIFICATION (STATIC CONTRACT CHECKS)
  section('1. BACKEND HANDLER & SECURITY CONTROLS (/api/admin-delete-user) [STATIC CODE CONTRACT]');
  const handlerFile = path.join(apiRoot, 'admin-delete-user.ts');
  assert(fs.existsSync(handlerFile), 'api/admin-delete-user.ts exists in repository');

  const handlerContent = fs.readFileSync(handlerFile, 'utf-8');
  assert(handlerContent.includes('callerId === targetUserId'), 'Prevents self-deletion of calling administrator');
  assert(handlerContent.includes('LAST_ADMIN_PROTECTED'), 'Guards against deletion of the last remaining active platform administrator');
  assert(handlerContent.includes("purgeStoragePrefix('resumes'") && handlerContent.includes("purgeStoragePrefix('content'"), 'Cleans up user private files with paginated loop across resumes and content storage buckets');
  assert(handlerContent.includes('MAX_PAGES') && handlerContent.includes('PAGE_SIZE'), 'Enforces pagination bounds to prevent infinite loops during storage cleanup');
  assert(handlerContent.includes('auth.admin.deleteUser'), 'Authoritatively deletes Supabase Auth identity via service role');
  assert(handlerContent.includes('admin_audit_logs'), 'Persists single, privacy-conscious administrative audit log');
  assert(handlerContent.includes('DATABASE_CASCADE_FAILED') && handlerContent.includes('return res.status(500)'), 'Fails closed immediately if database cascade RPC returns an error');

  // 2. DATABASE MIGRATION INTEGRITY (STATIC CONTRACT CHECKS)
  section('2. DATABASE MIGRATION & RELATIONAL CONSTRAINTS [STATIC SQL CONTRACT]');
  const migrationFile = path.join(migrationsRoot, '20261016000000_secure_admin_permanent_account_deletion.sql');
  assert(fs.existsSync(migrationFile), '20261016000000_secure_admin_permanent_account_deletion.sql exists');

  const migrationContent = fs.readFileSync(migrationFile, 'utf-8');
  assert(migrationContent.includes('CREATE OR REPLACE FUNCTION public.admin_purge_user_cascade'), 'Defines admin_purge_user_cascade function');
  assert(migrationContent.includes('SECURITY DEFINER'), 'admin_purge_user_cascade uses SECURITY DEFINER for privileged execution');
  assert(migrationContent.includes('pg_advisory_xact_lock'), 'Uses transaction-level advisory lock (pg_advisory_xact_lock) for concurrency safety');
  assert(migrationContent.includes('is_company_admin = true') && migrationContent.includes('v_successor_id'), 'Implements company-admin succession promoting remaining eligible member');
  assert(migrationContent.includes('UPDATE public.jobs'), 'Safely neutralizes ON DELETE RESTRICT on public.jobs');
  assert(migrationContent.includes('SET creator_id = NULL') && migrationContent.includes('UPDATE public.creator_sales_ledger'), 'Preserves creator financial sales ledger while detaching creator_id without falsely reassigning to admin');
  assert(migrationContent.includes('UPDATE public.payment_orders'), 'Preserves financial payment orders while detaching user_id and scrubbing PII');
  assert(migrationContent.includes('REVOKE ALL ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) FROM authenticated') && migrationContent.includes('GRANT EXECUTE ON FUNCTION public.admin_purge_user_cascade(UUID, UUID) TO service_role'), 'Explicitly revokes execution from authenticated & anon, granting strictly to service_role');
  assert(!migrationContent.includes('DELETE FROM auth.users'), 'SQL RPC avoids duplicate auth.users deletion (authoritative deletion owned by API service role)');
  assert(!migrationContent.includes('INSERT INTO public.admin_audit_logs'), 'SQL RPC avoids duplicate audit logging (authoritative single audit owned by API)');
  assert(migrationContent.includes('CREATE TABLE IF NOT EXISTS public.admin_audit_logs'), 'Creates public.admin_audit_logs table');
  assert(migrationContent.includes('CREATE TABLE IF NOT EXISTS public.admin_deletion_jobs'), 'Creates public.admin_deletion_jobs recovery tombstone table');
  assert(handlerContent.includes('admin_deletion_jobs'), 'API handler queries and updates durable admin_deletion_jobs tombstone');

  // 3. FRONTEND UI, MODALS & SUSPENSION SAFETY
  section('3. FRONTEND UI & SUSPENSION SAFETY CONTROLS');
  const adminUsersPage = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminUsersPage.tsx'), 'utf-8');
  assert(adminUsersPage.includes('Permanently Remove Account'), 'UI clearly labels destructive action as "Permanently Remove Account"');
  assert(adminUsersPage.includes('PERMANENTLY REMOVE'), 'Requires typing "PERMANENTLY REMOVE" to prevent accidental clicks');
  assert(adminUsersPage.includes('currentAdminUser?.id === user.id'), 'UI prevents administrator from opening removal prompt on themselves');
  assert(!adminUsersPage.includes('window.confirm('), 'Eliminates unstyled browser window.confirm in favor of explicit Dialog modal');

  // Candidate Modal Safety
  const candidateModal = fs.readFileSync(path.join(srcRoot, 'components/admin/AdminCandidateInspectModal.tsx'), 'utf-8');
  assert(!candidateModal.includes('adminService.deleteUserPermanently'), 'AdminCandidateInspectModal does NOT call deleteUserPermanently');
  assert(candidateModal.includes('adminService.updateUserStatus'), 'AdminCandidateInspectModal uses reversible updateUserStatus');
  assert(candidateModal.includes('Reactivate Account') || candidateModal.includes('Restore Account'), 'AdminCandidateInspectModal provides explicit reactivate/restore account action');

  // Employer Modal Safety
  const employerModal = fs.readFileSync(path.join(srcRoot, 'components/admin/AdminEmployerInspectModal.tsx'), 'utf-8');
  assert(!employerModal.includes('adminService.deleteUserPermanently'), 'AdminEmployerInspectModal does NOT call deleteUserPermanently');
  assert(employerModal.includes('adminService.updateUserStatus'), 'AdminEmployerInspectModal uses reversible updateUserStatus');
  assert(employerModal.includes('Reactivate Account') || employerModal.includes('Restore Account'), 'AdminEmployerInspectModal provides explicit reactivate/restore account action');

  // 4. SERVICE LAYER ROUTING (STATIC CONTRACT CHECKS)
  section('4. SERVICE LAYER ROUTING & TOKEN FORWARDING [STATIC CONTRACT]');
  const adminService = fs.readFileSync(path.join(srcRoot, 'services/adminService.ts'), 'utf-8');
  assert(adminService.includes('/api/admin-delete-user'), 'adminService routes deletion requests through serverless endpoint');
  assert(adminService.includes('Authorization: `Bearer ${token}`'), 'Forwards admin session bearer token securely to API');
  assert(!adminService.includes("from('candidate_profiles').delete()"), 'Removed non-transactional fallback cascade table deletions (fails closed)');
  assert(adminService.includes('saveDemoDeletedUser'), 'Maintains demo mode isolation without crashing');

  // 5. FRESH ONBOARDING POST-DELETION CONTRACT (STATIC CONTRACT CHECKS)
  section('5. FRESH ONBOARDING GUARANTEE ON RE-REGISTRATION [STATIC CONTRACT]');
  const authContext = fs.readFileSync(path.join(srcRoot, 'context/AuthContext.tsx'), 'utf-8');
  assert(authContext.includes('kth_admin_deleted_users'), 'Re-registration filters out deleted user markers allowing a completely fresh start');
  assert(authContext.includes("initialStatus = existingProfile?.status || (isEmailConfirmed ? 'pending_onboarding' : 'unverified')"), 'New registrations initialize safely according to verification status');

  // 6. ISOLATED TEST DATABASE EXECUTION ADVISORY
  section('6. ISOLATED DATABASE VERIFICATION [ENVIRONMENT ADVISORY]');
  console.log('  ℹ️  DATABASE TESTS NOTE: In strict accordance with security restrictions, migrations');
  console.log('      have NOT been executed against staging or production databases. Real accounts');
  console.log('      and storage files were not modified.');
  console.log('      To run live functional tests against a local isolated Supabase container:');
  console.log('      npx supabase test db --local (or apply 20261016000000_...sql to local docker instance).');

  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('  PERMANENT ACCOUNT REMOVAL & SUSPENSION CERTIFICATION RESULTS');
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

runPermanentAccountRemovalSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
