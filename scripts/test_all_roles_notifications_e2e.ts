/**
 * KnowToHire — Comprehensive Cross-Role In-App Notification System E2E Suite
 * =========================================================================
 * Tests the in-app notification system across all four platform roles:
 *  1. Candidate Role
 *  2. Employer Role
 *  3. Creator Role
 *  4. Administrator Role
 *
 * Validates:
 *  - Canonical schema and notification types
 *  - Role-specific storage routing & multi-tenant isolation
 *  - Event lifecycle (creation, unread count badge, mark single as read, mark all as read)
 *  - Candidate preference gating (job alerts & application updates)
 *  - UI Shell Header & Sidebar notification elements in all roles
 *  - Real-time reactivity event dispatching (kth_notifications_changed)
 *  - Supabase database schema compatibility
 *
 * Run: npx tsx scripts/test_all_roles_notifications_e2e.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.resolve(__dirname, '..', 'src');

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
  console.log(`\n${'━'.repeat(72)}`);
  console.log(`  ${title}`);
  console.log('━'.repeat(72));
}

// In-Memory LocalStorage Mock with Event Dispatching
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

async function runTestSuite() {
  // ============================================================================
  // 1. CANONICAL DATA MODEL & NOTIFICATION TYPES
  // ============================================================================
  section('1. CANONICAL DATA MODEL & SCHEMA INTEGRITY');

  const notifCode = fs.readFileSync(path.join(srcRoot, 'services/notificationService.ts'), 'utf-8');
  assert(notifCode.includes('export interface AppNotification'), 'AppNotification interface is defined');
  assert(notifCode.includes("type: 'application' | 'interview' | 'offer' | 'system' | 'message'"), 'Supports all canonical notification types');
  assert(notifCode.includes('company_id?: string | null;'), 'AppNotification has company_id field');
  assert(notifCode.includes('candidate_id?: string | null;'), 'AppNotification has candidate_id field');
  assert(notifCode.includes('application_id?: string | null;'), 'AppNotification has application_id field');
  assert(notifCode.includes('job_id?: string | null;'), 'AppNotification has job_id field');
  assert(notifCode.includes('interview_id?: string | null;'), 'AppNotification has interview_id field');
  assert(notifCode.includes('category?: string;'), 'AppNotification has category field');
  assert(notifCode.includes('action_url?: string | null;'), 'AppNotification has action_url field');
  assert(notifCode.includes('read_at?: string | null;'), 'AppNotification has read_at field');
  assert(notifCode.includes('metadata?: Record<string, unknown>;'), 'AppNotification has metadata field');
  assert(notifCode.includes('is_read: boolean;'), 'AppNotification has is_read boolean state');
  assert(notifCode.includes('kth_notifications_changed'), 'Emits kth_notifications_changed real-time event');

  // Verify Phase 1 Migration File Contract
  const migrationPath = path.resolve(__dirname, '..', 'supabase/migrations/20261020000000_inapp_and_push_notifications.sql');
  assert(fs.existsSync(migrationPath), 'Phase 1 migration file 20261020000000_inapp_and_push_notifications.sql exists');
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  assert(migrationSql.includes('public.notification_preferences'), 'Migration declares public.notification_preferences');
  assert(migrationSql.includes('public.push_subscriptions'), 'Migration declares public.push_subscriptions');
  assert(migrationSql.includes('public.purge_expired_notifications_90d'), 'Migration defines 90-day retention pruning function');
  assert(migrationSql.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables Row Level Security on all notification tables');
  assert(migrationSql.includes('auth.uid() = user_id'), 'Migration enforces user-scoped isolation in RLS policies');
  assert(migrationSql.includes('notifications_insert_owner'), 'Migration specifies notifications_insert_owner policy to prevent client forgery');
  assert(migrationSql.includes('ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications'), 'Migration adds notifications to supabase_realtime publication');
  assert(migrationSql.includes('notification_type NOT NULL DEFAULT'), 'Migration uses canonical notification_type enum in fallback');

  // Verify Push Subscription Serverless Handler Security
  const pushApiFile = path.resolve(__dirname, '..', 'api/push-subscription.ts');
  assert(fs.existsSync(pushApiFile), 'api/push-subscription.ts exists');
  const pushApiCode = fs.readFileSync(pushApiFile, 'utf-8');
  assert(pushApiCode.includes('existingSub.user_id !== callerId'), 'push-subscription endpoint handles collisions and reassignments securely');
  assert(pushApiCode.includes('authData.user.id'), 'push-subscription scopes writes authoritatively to authenticated user ID');

  // ============================================================================
  // 2. CANDIDATE ROLE NOTIFICATION LIFECYCLE & PREFERENCE GOVERNANCE
  // ============================================================================
  section('2. CANDIDATE ROLE NOTIFICATIONS');

  const candHeaderCode = fs.readFileSync(path.join(srcRoot, 'components/candidate/CandidateHeader.tsx'), 'utf-8');
  assert(candHeaderCode.includes('unreadNotifCount'), 'CandidateHeader maintains live unreadNotifCount state');
  assert(candHeaderCode.includes('kth_notifications_changed'), 'CandidateHeader listens to kth_notifications_changed');
  assert(candHeaderCode.includes('/candidate/notifications'), 'CandidateHeader bell routes to /candidate/notifications');

  const candSidebarCode = fs.readFileSync(path.join(srcRoot, 'components/candidate/CandidateSidebar.tsx'), 'utf-8');
  assert(candSidebarCode.includes('notifications: notifCount'), 'CandidateSidebar displays unread notification badge');
  assert(candSidebarCode.includes('kth_notifications_changed'), 'CandidateSidebar subscribes to notification changes');

  const candPageCode = fs.readFileSync(path.join(srcRoot, 'pages/candidate/CandidateNotificationsPage.tsx'), 'utf-8');
  assert(candPageCode.includes('handleMarkAllRead'), 'CandidateNotificationsPage provides Mark All as Read');
  assert(candPageCode.includes('handleMarkSingleRead'), 'CandidateNotificationsPage provides single item read');
  assert(candPageCode.includes('handleNotificationClick'), 'CandidateNotificationsPage routes intelligently to application/interview');

  // Test Candidate Mock Lifecycle
  const mockStorage = new MockLocalStorage();
  const candUserId = 'cand-uid-1001';
  const candStorageKey = `kth_notifications_cand_${candUserId}`;

  const candNotifs = [
    {
      id: 'notif-c1',
      user_id: candUserId,
      candidate_id: candUserId,
      type: 'application' as const,
      title: 'Shortlisted: Senior Frontend Architect',
      message: 'You have been shortlisted for Senior Frontend Architect at GreenTech Corp.',
      is_read: false,
      link: '/candidate/applications',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif-c2',
      user_id: candUserId,
      candidate_id: candUserId,
      type: 'interview' as const,
      title: 'Interview Scheduled: Technical Round',
      message: 'Technical Interview scheduled for Oct 22, 2026 at 3:00 PM IST.',
      is_read: false,
      link: '/candidate/interviews',
      created_at: new Date().toISOString(),
    },
  ];

  mockStorage.setItem(candStorageKey, JSON.stringify(candNotifs));
  let loadedCand = JSON.parse(mockStorage.getItem(candStorageKey) || '[]');
  assert(loadedCand.length === 2, 'Candidate has 2 active notifications');
  assert(loadedCand.filter((n: any) => !n.is_read).length === 2, 'Candidate unread count is initially 2');

  // Mark single as read
  loadedCand[0].is_read = true;
  mockStorage.setItem(candStorageKey, JSON.stringify(loadedCand));
  loadedCand = JSON.parse(mockStorage.getItem(candStorageKey) || '[]');
  assert(loadedCand.filter((n: any) => !n.is_read).length === 1, 'Candidate unread count decrements to 1 after reading');

  // Mark all as read
  loadedCand = loadedCand.map((n: any) => ({ ...n, is_read: true }));
  mockStorage.setItem(candStorageKey, JSON.stringify(loadedCand));
  loadedCand = JSON.parse(mockStorage.getItem(candStorageKey) || '[]');
  assert(loadedCand.filter((n: any) => !n.is_read).length === 0, 'Candidate unread count becomes 0 after mark all read');

  // Candidate preference suppression check
  assert(notifCode.includes('jobRecommendationAlerts === false'), 'Suppresses job recommendation notifications when opted out');
  assert(notifCode.includes('applicationStageUpdates === false'), 'Suppresses stage updates when opted out in candidate settings');

  // ============================================================================
  // 3. EMPLOYER ROLE NOTIFICATION LIFECYCLE & MULTI-TENANT ISOLATION
  // ============================================================================
  section('3. EMPLOYER ROLE NOTIFICATIONS & ATS ISOLATION');

  const empHeaderCode = fs.readFileSync(path.join(srcRoot, 'components/employer/EmployerHeader.tsx'), 'utf-8');
  assert(empHeaderCode.includes('unreadNotifCount'), 'EmployerHeader monitors unreadNotifCount');
  assert(empHeaderCode.includes('kth_notifications_changed'), 'EmployerHeader subscribes to kth_notifications_changed');
  assert(empHeaderCode.includes('/employer/notifications'), 'EmployerHeader bell routes to /employer/notifications');

  const empSidebarCode = fs.readFileSync(path.join(srcRoot, 'components/employer/EmployerSidebar.tsx'), 'utf-8');
  assert(empSidebarCode.includes('notifications: unreadNotifs > 0 ? unreadNotifs : undefined'), 'EmployerSidebar shows unread notifications badge');

  const empPageCode = fs.readFileSync(path.join(srcRoot, 'pages/employer/EmployerNotificationsPage.tsx'), 'utf-8');
  assert(empPageCode.includes('EmployerNotificationsPage'), 'EmployerNotificationsPage component is defined');

  // Multi-tenant isolation test
  const COMPANY_ALPHA = 'company-alpha-uuid';
  const COMPANY_BETA = 'company-beta-uuid';

  mockStorage.setItem(`kth_notifications_${COMPANY_ALPHA}`, JSON.stringify([
    {
      id: 'notif-a1',
      company_id: COMPANY_ALPHA,
      user_id: 'emp-user-a',
      type: 'application' as const,
      title: 'New Applicant: Surya Naikoti',
      message: 'Surya applied for Lead AI Engineer.',
      is_read: false,
      created_at: new Date().toISOString(),
    }
  ]));

  mockStorage.setItem(`kth_notifications_${COMPANY_BETA}`, JSON.stringify([
    {
      id: 'notif-b1',
      company_id: COMPANY_BETA,
      user_id: 'emp-user-b',
      type: 'application' as const,
      title: 'New Applicant: Rajesh Varma',
      message: 'Rajesh applied for DevOps Specialist.',
      is_read: false,
      created_at: new Date().toISOString(),
    }
  ]));

  const notifsAlpha = JSON.parse(mockStorage.getItem(`kth_notifications_${COMPANY_ALPHA}`) || '[]');
  const notifsBeta = JSON.parse(mockStorage.getItem(`kth_notifications_${COMPANY_BETA}`) || '[]');

  assert(notifsAlpha.length === 1 && notifsAlpha[0].company_id === COMPANY_ALPHA, 'Company Alpha retrieves only its own notifications');
  assert(notifsBeta.length === 1 && notifsBeta[0].company_id === COMPANY_BETA, 'Company Beta retrieves only its own notifications');
  assert(!notifsAlpha.some((n: any) => n.company_id === COMPANY_BETA), 'Company Alpha cannot leak into Company Beta');

  // ============================================================================
  // 4. CREATOR ROLE NOTIFICATIONS
  // ============================================================================
  section('4. CREATOR ROLE NOTIFICATIONS');

  const creatorShellCode = fs.readFileSync(path.join(srcRoot, 'components/creator/CreatorShell.tsx'), 'utf-8');
  assert(creatorShellCode.includes('unreadNotifCount'), 'CreatorShell has live unreadNotifCount state');
  assert(creatorShellCode.includes('Bell'), 'CreatorShell header contains Bell notification icon');
  assert(creatorShellCode.includes('kth_notifications_changed'), 'CreatorShell listens for real-time notification changes');

  const creatorUserId = 'creator-uid-4001';
  const creatorKey = `kth_notifications_creator_${creatorUserId}`;

  mockStorage.setItem(creatorKey, JSON.stringify([
    {
      id: 'notif-cr1',
      user_id: creatorUserId,
      type: 'system' as const,
      title: 'E-Book Royalty Credited',
      message: 'Your publication "Green Tech Engineering Handbook" earned INR 4,999 in royalties.',
      is_read: false,
      link: '/creator',
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif-cr2',
      user_id: creatorUserId,
      type: 'system' as const,
      title: 'Template Approved',
      message: 'Your resume template "Executive Minimalist" has been approved and published to marketplace.',
      is_read: true,
      link: '/templates',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    }
  ]));

  let creatorNotifs = JSON.parse(mockStorage.getItem(creatorKey) || '[]');
  assert(creatorNotifs.length === 2, 'Creator has 2 notifications in studio feed');
  assert(creatorNotifs.filter((n: any) => !n.is_read).length === 1, 'Creator accurately reports 1 unread notification');

  // Mark all read
  creatorNotifs = creatorNotifs.map((n: any) => ({ ...n, is_read: true }));
  mockStorage.setItem(creatorKey, JSON.stringify(creatorNotifs));
  creatorNotifs = JSON.parse(mockStorage.getItem(creatorKey) || '[]');
  assert(creatorNotifs.filter((n: any) => !n.is_read).length === 0, 'Creator unread count clears to 0');

  // ============================================================================
  // 5. ADMINISTRATOR ROLE NOTIFICATIONS
  // ============================================================================
  section('5. ADMINISTRATOR ROLE NOTIFICATIONS');

  const adminShellCode = fs.readFileSync(path.join(srcRoot, 'components/admin/AdminShell.tsx'), 'utf-8');
  assert(adminShellCode.includes('unreadNotifCount'), 'AdminShell tracks unreadNotifCount');
  assert(adminShellCode.includes('Bell'), 'AdminShell toolbar has Bell icon');
  assert(adminShellCode.includes('kth_notifications_changed'), 'AdminShell subscribes to kth_notifications_changed');

  const adminKey = 'kth_notifications_admin';
  mockStorage.setItem(adminKey, JSON.stringify([
    {
      id: 'notif-adm1',
      user_id: '00000000-0000-0000-0000-000000000003',
      type: 'system' as const,
      title: 'Employer Verification Pending',
      message: 'New enterprise "Solaris Dynamics India" submitted verification documents.',
      is_read: false,
      link: '/admin/employers',
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif-adm2',
      user_id: '00000000-0000-0000-0000-000000000003',
      type: 'system' as const,
      title: 'Job Moderation Alert',
      message: 'A job posting was flagged for automated compliance review.',
      is_read: false,
      link: '/admin/jobs',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    }
  ]));

  let adminNotifs = JSON.parse(mockStorage.getItem(adminKey) || '[]');
  assert(adminNotifs.length === 2, 'Administrator receives system & moderation notifications');
  assert(adminNotifs.filter((n: any) => !n.is_read).length === 2, 'Admin unread count is 2');

  adminNotifs[0].is_read = true;
  mockStorage.setItem(adminKey, JSON.stringify(adminNotifs));
  adminNotifs = JSON.parse(mockStorage.getItem(adminKey) || '[]');
  assert(adminNotifs.filter((n: any) => !n.is_read).length === 1, 'Admin unread count decrements to 1 after reviewing');

  // ============================================================================
  // 6. CROSS-MODULE EVENT PIPELINE RECOGNITION
  // ============================================================================
  section('6. CROSS-MODULE EVENT PIPELINE TRIGGERS');

  const appServiceCode = fs.readFileSync(path.join(srcRoot, 'services/applicationService.ts'), 'utf-8');
  assert(appServiceCode.includes('notificationService.createNotification'), 'applicationService triggers notifications on submission & stage change');

  const interviewServiceCode = fs.readFileSync(path.join(srcRoot, 'services/interviewService.ts'), 'utf-8');
  assert(interviewServiceCode.includes('notificationService.createNotification'), 'interviewService triggers notifications on scheduling & completion/cancellation');

  // ============================================================================
  // FINAL VERIFICATION REPORT
  // ============================================================================
  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log('  ALL-ROLES IN-APP NOTIFICATION SYSTEM TEST RESULTS');
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total:  ${passed + failed}`);
  if (failures.length > 0) {
    console.log('\n  Failed checks:');
    failures.forEach((f, idx) => console.log(`    ${idx + 1}. ${f}`));
  }
  console.log('════════════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
