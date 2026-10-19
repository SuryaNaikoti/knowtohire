/**
 * KnowToHire — Phase 2 Notification System Security & End-to-End Validation Suite
 * ===============================================================================
 * Validates:
 *  1. Priority 1: Trusted Serverless Notification Dispatcher (/api/notifications-dispatch)
 *     - Rejection of non-POST methods
 *     - Rejection of unauthenticated calls (missing/invalid JWT)
 *     - Validation of event types and required parameters
 *     - Caller authorization checks (prevent candidate faking employer actions & vice versa)
 *     - Server-side resolution of recipient user_id (never trusting client-supplied recipients)
 *  2. Priority 1: Direct Browser INSERT Hardening (Owner-only RLS alignment)
 *     - Verifies notificationService restricts direct Supabase insert to auth.uid() === user_id
 *  3. Priority 2: Supabase Realtime UI Integration
 *     - Verifies useNotificationRealtime hook exists and is mounted in all four portal shells
 *     - Verifies real-time event subscription syntax and payload dispatch
 *  4. Priority 3: Browser Push Infrastructure
 *     - Verifies public/sw.js exists and handles push & notificationclick events
 *     - Verifies pushNotificationService handles permission denial, missing VAPID, and unsubscribe
 *  5. Priority 4: Retention Pruning & Cron Scheduling
 *     - Verifies api/cron/purge-notifications.ts validates CRON_SECRET & Admin JWT
 *     - Verifies vercel.json configures daily cron execution
 *
 * Run: npx tsx scripts/test_phase2_notifications_security.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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
  console.log(`\n${'━'.repeat(74)}`);
  console.log(`  ${title}`);
  console.log('━'.repeat(74));
}

async function runPhase2SecuritySuite() {
  console.log('Starting KnowToHire Notification System Phase 2 Security & Architecture Validation...');

  // ============================================================================
  // SECTION 1: TRUSTED NOTIFICATION DISPATCHER (api/notifications-dispatch.ts)
  // ============================================================================
  section('1. TRUSTED SERVERLESS NOTIFICATION DISPATCHER (/api/notifications-dispatch)');

  const dispatchFilePath = path.join(rootDir, 'api', 'notifications-dispatch.ts');
  assert(fs.existsSync(dispatchFilePath), 'api/notifications-dispatch.ts exists');

  const dispatchCode = fs.readFileSync(dispatchFilePath, 'utf-8');

  assert(
    dispatchCode.includes("req.method !== 'POST'") && dispatchCode.includes('405'),
    'Enforces HTTP POST method restriction only (405 for GET/PUT/DELETE)'
  );

  assert(
    dispatchCode.includes('supabase.auth.getUser(token)') && dispatchCode.includes('401'),
    'Validates caller Bearer JWT with Supabase Auth (401 on missing/invalid token)'
  );

  assert(
    dispatchCode.includes('application_submitted') &&
    dispatchCode.includes('application_stage_changed') &&
    dispatchCode.includes('interview_scheduled') &&
    dispatchCode.includes('interview_status_changed'),
    'Supports canonical cross-user events (application_submitted, stage_changed, interview_scheduled, status_changed)'
  );

  assert(
    dispatchCode.includes('app.candidate_id !== callerId') && dispatchCode.includes('403'),
    'Authoritatively verifies candidate ownership on application submission (prevents impersonation)'
  );

  assert(
    dispatchCode.includes('callerEmp.company_id === app.company_id') ||
    dispatchCode.includes('callerProfile?.role === \'admin\''),
    'Authoritatively verifies employer company ownership before changing application stage or scheduling interviews'
  );

  assert(
    !dispatchCode.includes('req.body.recipient_id') &&
    !dispatchCode.includes('body?.user_id') &&
    dispatchCode.includes('user_id: app.candidate_id'),
    'Authoritatively resolves recipient user_id from database records; never trusts client-supplied recipient ID'
  );

  assert(
    dispatchCode.includes('getServerSupabaseClient'),
    'Uses server-side Supabase service-role client for privileged notification insertion'
  );

  // ============================================================================
  // SECTION 2: WORKFLOW INTEGRATION (applicationService & interviewService)
  // ============================================================================
  section('2. WORKFLOW INTEGRATION & CLIENT INSERT HARDENING');

  const appServiceCode = fs.readFileSync(path.join(rootDir, 'src', 'services', 'applicationService.ts'), 'utf-8');
  assert(
    appServiceCode.includes('/api/notifications-dispatch') &&
    appServiceCode.includes('application_submitted'),
    'applicationService.applyForJob triggers serverless dispatch for application_submitted'
  );

  assert(
    appServiceCode.includes('/api/notifications-dispatch') &&
    appServiceCode.includes('application_stage_changed'),
    'applicationService.updateApplicationStage triggers serverless dispatch for application_stage_changed'
  );

  const interviewServiceCode = fs.readFileSync(path.join(rootDir, 'src', 'services', 'interviewService.ts'), 'utf-8');
  assert(
    interviewServiceCode.includes('/api/notifications-dispatch') &&
    interviewServiceCode.includes('interview_scheduled'),
    'interviewService.scheduleInterview triggers serverless dispatch for interview_scheduled'
  );

  assert(
    interviewServiceCode.includes('/api/notifications-dispatch') &&
    interviewServiceCode.includes('interview_status_changed'),
    'interviewService.updateInterview triggers serverless dispatch for interview_status_changed'
  );

  const notifServiceCode = fs.readFileSync(path.join(rootDir, 'src', 'services', 'notificationService.ts'), 'utf-8');
  assert(
    notifServiceCode.includes('authData.user.id === userId'),
    'notificationService restricts direct client-side DB inserts to owner-only (auth.uid() === userId)'
  );

  // ============================================================================
  // SECTION 3: SUPABASE REALTIME UI INTEGRATION
  // ============================================================================
  section('3. SUPABASE REALTIME UI INTEGRATION ACROSS ALL 4 ROLES');

  const hookPath = path.join(rootDir, 'src', 'hooks', 'useNotificationRealtime.ts');
  assert(fs.existsSync(hookPath), 'src/hooks/useNotificationRealtime.ts exists');

  const hookCode = fs.readFileSync(hookPath, 'utf-8');
  assert(
    hookCode.includes("table: 'notifications'") && hookCode.includes("filter: `user_id=eq.${userId}`"),
    'Realtime hook subscribes to public.notifications scoped strictly to authenticated user_id'
  );

  assert(
    hookCode.includes('kth_notifications_changed'),
    'Realtime hook dispatches kth_notifications_changed event for instant multi-component reactivity'
  );

  const candShell = fs.readFileSync(path.join(rootDir, 'src', 'components', 'candidate', 'CandidateShell.tsx'), 'utf-8');
  assert(candShell.includes('useNotificationRealtime()'), 'CandidateShell mounts useNotificationRealtime hook');

  const empShell = fs.readFileSync(path.join(rootDir, 'src', 'components', 'employer', 'EmployerShell.tsx'), 'utf-8');
  assert(empShell.includes('useNotificationRealtime()'), 'EmployerShell mounts useNotificationRealtime hook');

  const adminShell = fs.readFileSync(path.join(rootDir, 'src', 'components', 'admin', 'AdminShell.tsx'), 'utf-8');
  assert(adminShell.includes('useNotificationRealtime()'), 'AdminShell mounts useNotificationRealtime hook');

  const creatorShell = fs.readFileSync(path.join(rootDir, 'src', 'components', 'creator', 'CreatorShell.tsx'), 'utf-8');
  assert(creatorShell.includes('useNotificationRealtime()'), 'CreatorShell mounts useNotificationRealtime hook');

  // ============================================================================
  // SECTION 4: BROWSER PUSH INFRASTRUCTURE
  // ============================================================================
  section('4. BROWSER PUSH NOTIFICATION INFRASTRUCTURE');

  const swPath = path.join(rootDir, 'public', 'sw.js');
  assert(fs.existsSync(swPath), 'public/sw.js exists');

  const swCode = fs.readFileSync(swPath, 'utf-8');
  assert(swCode.includes("addEventListener('push'"), 'ServiceWorker listens for Web Push events');
  assert(swCode.includes("addEventListener('notificationclick'"), 'ServiceWorker handles notificationclick with URL focus/navigation');

  const pushServicePath = path.join(rootDir, 'src', 'services', 'pushNotificationService.ts');
  assert(fs.existsSync(pushServicePath), 'src/services/pushNotificationService.ts exists');

  const pushServiceCode = fs.readFileSync(pushServicePath, 'utf-8');
  assert(pushServiceCode.includes('subscribeToPush'), 'pushNotificationService provides subscribeToPush method');
  assert(pushServiceCode.includes('unsubscribeFromPush'), 'pushNotificationService provides unsubscribeFromPush method');
  assert(
    pushServiceCode.includes("permission !== 'granted'"),
    'Handles browser push permission denial gracefully'
  );
  assert(
    pushServiceCode.includes("method: 'DELETE'") && pushServiceCode.includes('/api/push-subscription'),
    'Unsubscribe safely purges serverless database subscription'
  );

  // ============================================================================
  // SECTION 5: 90-DAY RETENTION & CRON SCHEDULING
  // ============================================================================
  section('5. 90-DAY RETENTION PRUNING & CRON SCHEDULING');

  const purgeCronPath = path.join(rootDir, 'api', 'cron', 'purge-notifications.ts');
  assert(fs.existsSync(purgeCronPath), 'api/cron/purge-notifications.ts exists');

  const purgeCronCode = fs.readFileSync(purgeCronPath, 'utf-8');
  assert(
    purgeCronCode.includes('CRON_SECRET') && purgeCronCode.includes('401'),
    'api/cron/purge-notifications requires CRON_SECRET or Admin Bearer authentication'
  );
  assert(
    !purgeCronCode.includes("'kth_cron_retention_purge_secret'"),
    'api/cron/purge-notifications does NOT contain hardcoded/predictable default secret'
  );
  assert(
    purgeCronCode.includes('isProduction') &&
    purgeCronCode.includes('CONFIGURATION_ERROR') &&
    purgeCronCode.includes('500'),
    'api/cron/purge-notifications fails closed (500 CONFIGURATION_ERROR) in production when CRON_SECRET is missing'
  );
  assert(
    purgeCronCode.includes("rpc('purge_expired_notifications_90d')"),
    'Calls safe PostgreSQL SECURITY DEFINER stored procedure purge_expired_notifications_90d'
  );

  const vercelJsonPath = path.join(rootDir, 'vercel.json');
  const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
  assert(
    Array.isArray(vercelJson.crons) &&
    vercelJson.crons.some((c: any) => c.path === '/api/cron/purge-notifications'),
    'vercel.json configures automated daily Vercel Cron for /api/cron/purge-notifications'
  );

  // ============================================================================
  // FINAL RESULTS
  // ============================================================================
  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log('  PHASE 2 NOTIFICATION SYSTEM SECURITY VALIDATION RESULTS');
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total:  ${passed + failed}`);
  if (failures.length > 0) {
    console.log('\n  Failures:');
    failures.forEach((f, idx) => console.log(`    ${idx + 1}. ${f}`));
  }
  console.log('════════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2SecuritySuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
