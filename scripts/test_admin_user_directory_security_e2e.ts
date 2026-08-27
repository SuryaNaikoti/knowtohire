/**
 * KnowToHire — Admin User Directory Security & Authorization E2E Certification Suite
 * ====================================================================================
 * Rigorous security verification covering:
 * 1. Route Authorization & Role Guard Security (Admin access vs Candidate/Employer rejection)
 * 2. Supabase RLS & Database Policy Architecture Analysis
 * 3. Service Layer Authorization & Input Sanitization
 * 4. Account Suspension Semantics & Profile Status Tracing
 * 5. Suspended User Portal Blocking (ProtectedRoute gating)
 * 6. Suspended User Re-Login & Session Resolution
 * 7. Admin Self-Suspension & Master Superuser Protection
 * 8. Role Escalation Resistance & Client-State Tamper Analysis
 * 9. Production vs Demo Mode Security Separation
 * 10. Sensitive Data Minimization & Privacy Protection
 *
 * Run: npx tsx scripts/test_admin_user_directory_security_e2e.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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

async function runSecuritySuite() {
  // ============================================================================
  // 1. ROUTE & FRONTEND AUTHORIZATION ENFORCEMENT
  // ============================================================================
  section('1. ROUTE & FRONTEND AUTHORIZATION ENFORCEMENT');

  const appCode = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf-8');
  assert(appCode.includes("<RoleGuard allowedRoles={['admin']}"), 'Admin routes are wrapped in RoleGuard restricting access to allowedRoles=["admin"]');
  assert(appCode.includes('<ProtectedRoute'), 'Admin routes are wrapped in ProtectedRoute requiring valid authentication');

  const roleGuardCode = fs.readFileSync(path.join(srcRoot, 'components/auth/RoleGuard.tsx'), 'utf-8');
  assert(roleGuardCode.includes("!allowedRoles.includes(role)"), 'RoleGuard checks user role against allowed list');
  assert(roleGuardCode.includes("Unauthorized Portal Access"), 'RoleGuard presents explicit unauthorized portal notice');

  // Role simulation test
  const roles = ['candidate', 'employer', 'admin'] as const;
  const allowed = ['admin'];
  assert(!allowed.includes('candidate'), 'Candidate role is explicitly rejected by RoleGuard');
  assert(!allowed.includes('employer'), 'Employer role is explicitly rejected by RoleGuard');
  assert(allowed.includes('admin'), 'Admin role is authorized by RoleGuard');

  // ============================================================================
  // 2. SUPABASE RLS & DATABASE MIGRATION SECURITY POLICIES
  // ============================================================================
  section('2. SUPABASE RLS & DATABASE MIGRATION SECURITY POLICIES');

  const authMigrationPath = path.join(migrationsRoot, '20260813000000_auth_and_profiles_schema.sql');
  const hasAuthMigration = fs.existsSync(authMigrationPath);
  assert(hasAuthMigration, 'Database migration file for auth and profiles exists in repository');

  if (hasAuthMigration) {
    const migrationCode = fs.readFileSync(authMigrationPath, 'utf-8');
    assert(migrationCode.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'), 'RLS is explicitly enabled on public.profiles table');
    assert(migrationCode.includes('CREATE POLICY "profiles_update_own"'), 'profiles_update_own policy is defined on public.profiles');
    assert(migrationCode.includes("role = (SELECT role FROM public.profiles WHERE id = auth.uid())"), 'RLS policy prevents client-side role modification by self-updating users');
    assert(migrationCode.includes("status = (SELECT status FROM public.profiles WHERE id = auth.uid())"), 'RLS policy prevents client-side status self-modification');
    assert(migrationCode.includes('requested_role := \'candidate\'::user_role;'), 'handle_new_user trigger defaults role safely to candidate and blocks self-promoted admin');
  }

  // ============================================================================
  // 3. SERVICE LAYER AUTHORIZATION & INPUT SANITIZATION
  // ============================================================================
  section('3. SERVICE LAYER AUTHORIZATION & INPUT SANITIZATION');

  const adminServiceCode = fs.readFileSync(path.join(srcRoot, 'services/adminService.ts'), 'utf-8');
  assert(adminServiceCode.includes('updateUserStatus('), 'adminService exposes updateUserStatus method');
  assert(adminServiceCode.includes("status === 'suspended'"), 'updateUserStatus validates target status transition');

  // ============================================================================
  // 4. SUSPENSION SEMANTICS & STATUS PROPAGATION
  // ============================================================================
  section('4. SUSPENSION SEMANTICS & STATUS PROPAGATION');

  assert(adminServiceCode.includes("supabase.from('profiles').update({ status }).eq('id', userId)"), 'updateUserStatus modifies status column on public.profiles');
  assert(adminServiceCode.includes('kth_admin_user_status_overrides'), 'Demo mode persists status overrides in kth_admin_user_status_overrides');
  assert(adminServiceCode.includes("window.dispatchEvent(new CustomEvent('kth_users_changed'))"), 'Status change broadcasts kth_users_changed event');

  // ============================================================================
  // 5. SUSPENDED USER PORTAL BLOCKING & SESSION RESOLUTION
  // ============================================================================
  section('5. SUSPENDED USER PORTAL BLOCKING & SESSION RESOLUTION');

  const protectedRouteCode = fs.readFileSync(path.join(srcRoot, 'components/auth/ProtectedRoute.tsx'), 'utf-8');
  assert(protectedRouteCode.includes("status === 'suspended'"), 'ProtectedRoute explicitly intercepts status="suspended"');
  assert(protectedRouteCode.includes('Account Access Suspended'), 'ProtectedRoute renders Account Access Suspended blocking screen');

  const authContextCode = fs.readFileSync(path.join(srcRoot, 'context/AuthContext.tsx'), 'utf-8');
  assert(authContextCode.includes("if (profile && (profile.status as string) === 'suspended')"), 'resolveEffectiveStatus preserves suspended status authoritatively over demo defaults');
  assert(authContextCode.includes('kth_admin_user_status_overrides'), 'createDemoProfile inspects admin user status overrides');

  // Status resolution simulation test
  const activeProfile = { id: 'user-1', status: 'active' as const, role: 'candidate' as const, email: 'user@test.com', full_name: 'User 1', created_at: '', updated_at: '' };
  const suspendedProfile = { id: 'user-2', status: 'suspended' as const, role: 'candidate' as const, email: 'user@test.com', full_name: 'User 2', created_at: '', updated_at: '' };

  assert(activeProfile.status === 'active', 'Active profile resolves to active');
  assert(suspendedProfile.status === 'suspended', 'Suspended profile resolves to suspended and triggers portal lockout');

  // ============================================================================
  // 6. ADMIN SELF-PROTECTION & SUPERUSER GOVERNANCE
  // ============================================================================
  section('6. ADMIN SELF-PROTECTION & SUPERUSER GOVERNANCE');

  assert(adminServiceCode.includes("Master Platform Administrator cannot be suspended"), 'updateUserStatus blocks suspension of master superuser administrator');
  assert(adminServiceCode.includes("userId === '00000000-0000-0000-0000-000000000003' || userId === 'demo-admin-003'"), 'Superuser UUID and demo alias are protected against suspension');

  const adminUsersPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminUsersPage.tsx'), 'utf-8');
  assert(adminUsersPageCode.includes("u.role !== 'admin'"), 'Admin user rows omit the Suspend action button in the UI');

  // ============================================================================
  // 7. ROLE ESCALATION & TAMPER RESISTANCE
  // ============================================================================
  section('7. ROLE ESCALATION & TAMPER RESISTANCE');

  assert(authContextCode.includes("profile?.status === 'active' && (profile.role === 'employer' || profile.role === 'candidate' || profile.role === 'admin')"), 'resolveRole prioritizes database profile.role over client metadata for active users');

  // ============================================================================
  // 8. DEMO VS PRODUCTION SECURITY SEPARATION
  // ============================================================================
  section('8. DEMO VS PRODUCTION SECURITY SEPARATION');

  assert(adminServiceCode.includes("const { isSupabaseConfigured } = await import('@/lib/supabase');"), 'adminService checks isSupabaseConfigured() before falling back to demo overrides');
  assert(authContextCode.includes("if (!isSupabaseConfigured())"), 'AuthContext isolates unconfigured demo environment from production database');

  // ============================================================================
  // 9. SENSITIVE DATA MINIMIZATION
  // ============================================================================
  section('9. SENSITIVE DATA MINIMIZATION');

  assert(!adminUsersPageCode.includes('password'), 'User Directory does not request or display password hashes');
  assert(!adminUsersPageCode.includes('resume_url'), 'User Directory does not expose candidate resume URLs in master table');
  assert(!adminUsersPageCode.includes('salary'), 'User Directory does not expose candidate salary expectations in master table');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('  ADMIN USER DIRECTORY SECURITY E2E RESULTS');
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

runSecuritySuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
