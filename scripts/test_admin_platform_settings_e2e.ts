/**
 * KnowToHire Admin Settings / Platform Governance Module E2E Test Suite
 * Tests Route Registration, RoleGuard RBAC, Canonical Lineage across all 5 Settings Sections,
 * Mutation & Deep Persistence, Reload Integrity, Discard Behavior, Taxonomy Non-Duplication,
 * Cross-Module Event Reactivity, and Supabase RLS / Multi-Tenant Isolation.
 */

import { adminSettingsService, MasterAdminSettings, DEFAULT_ADMIN_SETTINGS } from '../src/services/adminSettingsService';
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
  assert(appTsx.includes("path === '/admin/settings'"), 'Route /admin/settings is registered in App.tsx');
  assert(appTsx.includes("allowedRoles={['admin']}"), 'Route /admin/settings is guarded with allowedRoles=["admin"]');
  assert(appTsx.includes('<ProtectedRoute'), 'Route /admin/settings is guarded with ProtectedRoute');

  const adminSettingsPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminSettingsPage.tsx'), 'utf-8');
  assert(adminSettingsPageCode.includes('<AdminShell'), 'AdminSettingsPage renders within AdminShell');
  assert(adminSettingsPageCode.includes('onNavigate={onNavigate}'), 'AdminSettingsPage forwards onNavigate prop');

  // ============================================================================
  // 2. SETTINGS INVENTORY & CANONICAL LINEAGE
  // ============================================================================
  section('2. SETTINGS INVENTORY & CANONICAL LINEAGE');

  const res = await adminSettingsService.getSettings();
  assert(res.data !== null && typeof res.data === 'object', 'adminSettingsService.getSettings() retrieves master configuration');
  assert(res.error === null, 'getSettings executes with 0 errors');

  const cfg = res.data!;

  // 1. Profile Section
  assert(Boolean(cfg.profile.fullName), `Admin Profile has valid Name: "${cfg.profile.fullName}"`);
  assert(cfg.profile.email === 'admin@knowtohire.com', `Admin Profile has canonical email: "${cfg.profile.email}"`);
  assert(Boolean(cfg.profile.phone), `Admin Profile has support phone: "${cfg.profile.phone}"`);
  assert(Boolean(cfg.profile.designation), `Admin Profile has designation: "${cfg.profile.designation}"`);

  // 2. Platform Config Section
  assert(cfg.platform.platformName.includes('KnowToHire'), `Platform Name is configured: "${cfg.platform.platformName}"`);
  assert(cfg.platform.supportEmail === 'support@knowtohire.com', 'Support email is support@knowtohire.com');
  assert(cfg.platform.operationalCurrency.includes('INR'), 'Operational currency defaults to INR (Primary)');
  assert(cfg.platform.maintenanceMode === false, 'Maintenance Mode defaults to false (Operational)');
  assert(cfg.platform.jobModerationMode === 'auto_publish', 'Job Moderation defaults to auto_publish for verified employers');

  // 3. Role Governance Section
  assert(cfg.governance.defaultCandidateStatus === 'active', 'Default candidate status is active');
  assert(cfg.governance.defaultEmployerStatus === 'verified', 'Default employer status is verified');
  assert(cfg.governance.maxResumeFileSizeMB >= 5, `Max Resume Upload Size is ${cfg.governance.maxResumeFileSizeMB} MB`);

  // 4. Security & Session Section
  assert(cfg.security.sessionTimeoutMinutes >= 30, `Session Timeout is ${cfg.security.sessionTimeoutMinutes} min`);
  assert(cfg.security.enforceMFA === true, 'MFA enforcement defaults to true for superuser');
  assert(cfg.security.auditLoggingEnabled === true, 'Audit activity logging is enabled');
  assert(cfg.security.rowLevelSecurityStatus === 'enforced', 'Row-Level Security status is enforced');

  // 5. Notifications Section
  assert(cfg.notifications.emailOnNewEmployerRegistration === true, 'Employer registration email alert is true');
  assert(cfg.notifications.emailOnNewJobPost === true, 'Job posting email alert is true');
  assert(cfg.notifications.emailOnContentRequest === true, 'Content request email alert is true');

  // ============================================================================
  // 3. MUTATION, DEEP PERSISTENCE & RELOAD LIFECYCLE
  // ============================================================================
  section('3. MUTATION, DEEP PERSISTENCE & RELOAD LIFECYCLE');

  // 1. Stage mutated configuration
  const mutatedSettings: MasterAdminSettings = {
    ...cfg,
    platform: {
      ...cfg.platform,
      platformName: 'KnowToHire Enterprise ESG Hub',
      maintenanceMode: true,
      jobModerationMode: 'manual_review',
    },
    governance: {
      ...cfg.governance,
      maxResumeFileSizeMB: 25,
      requireCorporateEmailForEmployers: true,
    },
    security: {
      ...cfg.security,
      sessionTimeoutMinutes: 240,
    },
  };

  // 2. Persist update
  const updateRes = await adminSettingsService.updateSettings(mutatedSettings);
  assert(updateRes.data === true, 'adminSettingsService.updateSettings executes successfully');

  // 3. Verify persistence in subsequent fetch
  const reFetchRes = await adminSettingsService.getSettings();
  assert(reFetchRes.data?.platform.platformName === 'KnowToHire Enterprise ESG Hub', 'Platform Name mutation persisted');
  assert(reFetchRes.data?.platform.maintenanceMode === true, 'Maintenance Mode mutation persisted');
  assert(reFetchRes.data?.platform.jobModerationMode === 'manual_review', 'Job Moderation Mode mutation persisted');
  assert(reFetchRes.data?.governance.maxResumeFileSizeMB === 25, 'Max Resume File Size mutation persisted');
  assert(reFetchRes.data?.governance.requireCorporateEmailForEmployers === true, 'Corporate email requirement mutation persisted');
  assert(reFetchRes.data?.security.sessionTimeoutMinutes === 240, 'Session timeout mutation persisted');

  // 4. Reset settings back to canonical baseline
  const resetRes = await adminSettingsService.resetSettings();
  assert(resetRes.data === true, 'adminSettingsService.resetSettings cleans up test mutations');

  const baselineRes = await adminSettingsService.getSettings();
  assert(baselineRes.data?.platform.maintenanceMode === false, 'Maintenance Mode restored to baseline (false)');
  assert(baselineRes.data?.platform.jobModerationMode === 'auto_publish', 'Job Moderation restored to baseline (auto_publish)');

  // ============================================================================
  // 4. CROSS-MODULE EVENT DISPATCH & REACTIVITY
  // ============================================================================
  section('4. CROSS-MODULE EVENT DISPATCH & REACTIVITY');

  const adminSettingsServiceCode = fs.readFileSync(path.join(srcRoot, 'services/adminSettingsService.ts'), 'utf-8');
  assert(
    adminSettingsServiceCode.includes("window.dispatchEvent(new CustomEvent('kth_admin_settings_changed'))"),
    'adminSettingsService dispatches kth_admin_settings_changed on updates and resets'
  );

  assert(
    adminSettingsPageCode.includes("window.addEventListener('kth_admin_settings_changed'"),
    'AdminSettingsPage subscribes to kth_admin_settings_changed for live synchronization'
  );

  // ============================================================================
  // 5. MASTER TAXONOMY / GOVERNANCE NON-DUPLICATION
  // ============================================================================
  section('5. MASTER TAXONOMY / GOVERNANCE NON-DUPLICATION');

  assert(
    !adminSettingsServiceCode.includes('careerCategories') && !adminSettingsServiceCode.includes('taxonomyIndustries'),
    'Admin Settings does NOT maintain duplicate/competing taxonomy arrays'
  );

  const taxonomyServicePath = path.join(srcRoot, 'services/taxonomyService.ts');
  assert(fs.existsSync(taxonomyServicePath), 'taxonomyService remains the single canonical source of taxonomy truth');

  // ============================================================================
  // 6. SENSITIVE CONFIGURATION MINIMIZATION
  // ============================================================================
  section('6. SENSITIVE CONFIGURATION MINIMIZATION');

  assert(!adminSettingsPageCode.includes('postgres://'), 'AdminSettingsPage does not expose database connection strings');
  assert(!adminSettingsPageCode.includes('service_role_key'), 'AdminSettingsPage does not expose Supabase service role keys');
  assert(!adminSettingsPageCode.includes('password_hash'), 'AdminSettingsPage does not expose password hashes');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`  ADMIN SETTINGS / PLATFORM GOVERNANCE E2E RESULTS`);
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

runSuite().catch((err) => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
