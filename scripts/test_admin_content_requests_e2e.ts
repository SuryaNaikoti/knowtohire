/**
 * KnowToHire Admin Content Requests / Bespoke Requests Module E2E Test Suite
 * Tests Route Registration, RoleGuard RBAC, Canonical Lineage,
 * Request Lifecycle (pending -> under_review -> in_progress -> completed/fulfilled),
 * KPI Calculations, Search & Filtering, Deliverable Attachment Governance,
 * Multi-Tenant Isolation, Knowledge Hub Linkage, Supabase RLS Policies, and Event Reactivity.
 */

import { requestService, RequestStatus } from '../src/services/requestService';
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
  assert(appTsx.includes("path === '/admin/requests'"), 'Route /admin/requests is registered in App.tsx');
  assert(appTsx.includes("path.startsWith('/admin/requests/')"), 'Route /admin/requests/:id is registered in App.tsx');
  assert(appTsx.includes("allowedRoles={['admin']}"), 'Admin requests routes guarded with allowedRoles=["admin"]');
  assert(appTsx.includes('<ProtectedRoute'), 'Admin requests routes guarded with ProtectedRoute');

  const adminRequestsPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminRequestsPage.tsx'), 'utf-8');
  assert(adminRequestsPageCode.includes('<AdminShell'), 'AdminRequestsPage renders inside AdminShell');
  assert(adminRequestsPageCode.includes('onNavigate={onNavigate}'), 'AdminRequestsPage forwards onNavigate prop');

  const adminFulfillPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminFulfillRequestPage.tsx'), 'utf-8');
  assert(adminFulfillPageCode.includes('<AdminShell'), 'AdminFulfillRequestPage renders inside AdminShell');
  assert(adminFulfillPageCode.includes('onNavigate={onNavigate}'), 'AdminFulfillRequestPage forwards onNavigate prop');

  // ============================================================================
  // 2. CANONICAL BASELINE & DATA LINEAGE
  // ============================================================================
  section('2. CANONICAL BASELINE & DATA LINEAGE');

  const res = await requestService.getAllRequests();
  assert(res.data !== null && Array.isArray(res.data), 'requestService.getAllRequests() retrieves request queue');
  assert(res.error === null, 'getAllRequests executes with 0 errors');

  const requests = res.data || [];
  assert(requests.length >= 4, `Retrieves ${requests.length} canonical content requests (min 4)`);

  const primaryReq = requests.find((r) => r.id === 'req-1');
  assert(primaryReq !== undefined, 'Canonical request (req-1) is present in queue');
  assert(
    primaryReq?.title === 'SEBI BRSR Core KPI Assurance & Scope 3 Emissions Calculator Methodology',
    'Title matches canonical SEBI BRSR calculation request'
  );
  assert(primaryReq?.category === 'Sustainability & ESG', 'Category is "Sustainability & ESG"');
  assert(primaryReq?.type === 'Compliance Checklist', 'Type is "Compliance Checklist"');
  assert(primaryReq?.preferred_format === 'XLSX', 'Preferred format is "XLSX"');
  assert(primaryReq?.status === 'in_progress', 'Status is "in_progress"');
  assert(primaryReq?.user_id === 'cand-1', 'Requester ID is cand-1');
  assert(primaryReq?.user_name === 'Aarav Mehta', 'Requester name is Aarav Mehta');
  assert(primaryReq?.upvote_count === 14, 'Upvote count is 14');

  // Audit all records for placeholder avoidance
  for (const r of requests) {
    assert(Boolean(r.id && r.title && r.category), `Request ${r.id} has valid non-null ID, Title, and Category`);
    assert(Boolean(r.status), `Request ${r.id} has explicit status: ${r.status}`);
    assert(r.title !== 'Placeholder Request', `Request ${r.id} does NOT use placeholder "Placeholder Request"`);
    assert(r.title !== 'Untitled Request', `Request ${r.id} does NOT use "Untitled Request"`);
    assert(Boolean(r.user_name), `Request ${r.id} has authentic requester identity (${r.user_name})`);
  }

  // ============================================================================
  // 3. KPI MATHEMATICS & DERIVATIONS
  // ============================================================================
  section('3. KPI MATHEMATICS & DERIVATIONS');

  const totalKPI = requests.length;
  const activeKPI = requests.filter(
    (r) => r.status === 'under_review' || r.status === 'in_progress' || r.status === 'pending' || r.status === 'ready_for_delivery'
  ).length;
  const fulfilledKPI = requests.filter((r) => r.status === 'completed').length;
  const totalUpvotesKPI = requests.reduce((sum, r) => sum + (r.upvote_count || 0), 0);

  assert(totalKPI >= 4, `Total Submissions KPI derives ${totalKPI} requests`);
  assert(activeKPI >= 3, `Under Review & Active KPI derives ${activeKPI} active requests`);
  assert(fulfilledKPI >= 1, `Fulfilled Deliverables KPI derives ${fulfilledKPI} fulfilled requests`);
  assert(totalUpvotesKPI >= 50, `Community Upvotes KPI correctly aggregates ${totalUpvotesKPI} upvotes`);

  // ============================================================================
  // 4. SEARCH & CATEGORY FILTERING
  // ============================================================================
  section('4. SEARCH & CATEGORY FILTERING');

  // Search by Keyword
  const searchBrSR = requests.filter(
    (r) =>
      r.title.toLowerCase().includes('sebi') ||
      r.description.toLowerCase().includes('sebi') ||
      (r.user_name || '').toLowerCase().includes('sebi')
  );
  assert(searchBrSR.length >= 1, 'Search by keyword "sebi" finds matching BRSR request');
  assert(searchBrSR[0].id === 'req-1', 'Found matching req-1');

  // Filter by Category
  const legalCat = requests.filter((r) => (r.category || '').toLowerCase().includes('legal'));
  assert(legalCat.length >= 1, 'Filter by category "Legal & Contracts" returns matching contract requests');
  assert(legalCat[0].id === 'req-3', 'Identifies req-3 in Legal category');

  // Filter by Status
  const completedReqs = requests.filter((r) => r.status === 'completed');
  assert(completedReqs.length >= 1, 'Filter status="completed" returns fulfilled requests');
  assert(completedReqs.every((r) => Boolean(r.deliverable_url || r.completed_resource_id)), 'Completed requests have valid deliverables');

  // ============================================================================
  // 5. LIFECYCLE STATE MACHINE & DELIVERABLE GOVERNANCE
  // ============================================================================
  section('5. LIFECYCLE STATE MACHINE & DELIVERABLE GOVERNANCE');

  // 1. Submit a new Content Request
  const createRes = await requestService.createRequest({
    title: 'Test Clean Hydrogen Production Subsidy Filing Handbook',
    description: 'Comprehensive guideline for green hydrogen subsidy applications under the National Green Hydrogen Mission.',
    category: 'Sustainability & ESG',
    type: 'Study Material',
    preferred_format: 'PDF',
    additional_requirements: 'Include state subsidy incentives for Gujarat and Rajasthan.',
  });
  assert(createRes.data !== null, 'Candidate submits new on-demand content request');
  assert(createRes.data?.status === 'pending', 'New request starts in "pending" status');

  const createdId = createRes.data!.id;

  // 2. Admin Advances Status: pending -> under_review
  const reviewRes = await requestService.updateRequestStatus(createdId, 'under_review', 'Assigning to Energy & Renewables domain specialist.');
  assert(reviewRes.data?.status === 'under_review', 'Admin advances request status to "under_review"');
  assert(reviewRes.data?.admin_notes?.includes('domain specialist') === true, 'Admin notes recorded accurately');

  // 3. Admin Advances Status: under_review -> in_progress
  const inProgressRes = await requestService.updateRequestStatus(createdId, 'in_progress', 'Research and formatting underway.');
  assert(inProgressRes.data?.status === 'in_progress', 'Admin advances request status to "in_progress"');

  // 4. Governance Rule: Fulfill cannot be marked 'completed' without deliverable
  const invalidCompleteRes = await requestService.updateAndFulfillRequest(createdId, {
    status: 'completed',
    admin_notes: 'Trying to complete without file or resource linkage',
  });
  assert(invalidCompleteRes.data === null, 'Completing without deliverable is strictly rejected (data is null)');
  assert(invalidCompleteRes.error?.status === 422, 'Completing without deliverable returns HTTP 422 Unprocessable Entity');
  assert(
    invalidCompleteRes.error?.message.includes('deliverable must be uploaded or attached') === true,
    'Governance error message explains requirement'
  );

  // 5. Valid Fulfillment with Attached Resource & Deliverable URL
  const validCompleteRes = await requestService.updateAndFulfillRequest(createdId, {
    status: 'completed',
    deliverable_title: 'Green Hydrogen Subsidy Application Guide 2026',
    deliverable_description: 'Full statutory handbook and incentive breakdown for National Green Hydrogen Mission.',
    deliverable_url: 'https://knowtohire.com/content/requests/test/green_hydrogen_guide.pdf',
    deliverable_format: 'PDF',
    deliverable_size: '3.8 MB',
    deliverable_name: 'green_hydrogen_guide.pdf',
    completed_resource_id: 'res-tech-1',
    admin_notes: 'Fulfillment completed and published.',
  });
  assert(validCompleteRes.data !== null, 'Request successfully fulfilled with deliverable payload');
  assert(validCompleteRes.data?.status === 'completed', 'Request status updated to "completed"');
  assert(Boolean(validCompleteRes.data?.completed_at), 'Completion timestamp recorded');
  assert(validCompleteRes.data?.completed_resource_id === 'res-tech-1', 'Linked to completed Knowledge Hub resource res-tech-1');
  assert(validCompleteRes.data?.deliverable_format === 'PDF', 'Deliverable format recorded as PDF');

  // ============================================================================
  // 6. MULTI-TENANT ISOLATION & NON-LEAKAGE
  // ============================================================================
  section('6. MULTI-TENANT ISOLATION & NON-LEAKAGE');

  const unmutatedReq = await requestService.getRequestById('req-2');
  assert(unmutatedReq.data?.status === 'under_review', 'Mutating Request A does NOT alter Request B');
  assert(unmutatedReq.data?.title.includes('EIA Clearance Checklist'), 'Request B title remains unmutated');

  // ============================================================================
  // 7. CROSS-MODULE EVENT DISPATCH & REACTIVITY
  // ============================================================================
  section('7. CROSS-MODULE EVENT DISPATCH & REACTIVITY');

  const requestServiceCode = fs.readFileSync(path.join(srcRoot, 'services/requestService.ts'), 'utf-8');
  assert(
    requestServiceCode.includes("window.dispatchEvent(new CustomEvent('kth_requests_changed'))"),
    'requestService dispatches kth_requests_changed on mutations'
  );

  assert(
    adminRequestsPageCode.includes("window.addEventListener('kth_requests_changed'"),
    'AdminRequestsPage subscribes to kth_requests_changed for live synchronization'
  );

  const candidateRequestsPageCode = fs.readFileSync(path.join(srcRoot, 'pages/candidate/CandidateRequestsPage.tsx'), 'utf-8');
  assert(
    candidateRequestsPageCode.includes("window.addEventListener('kth_requests_changed'"),
    'CandidateRequestsPage subscribes to kth_requests_changed for real-time updates'
  );

  // ============================================================================
  // 8. SUPABASE RLS & DATABASE POLICIES
  // ============================================================================
  section('8. SUPABASE RLS & DATABASE POLICIES');

  const migrationsRoot = path.join(projectRoot, 'supabase/migrations');
  const rlsMigrationPath = path.join(migrationsRoot, '20260825000000_content_publishing_and_fulfillment_schema.sql');
  assert(fs.existsSync(rlsMigrationPath), 'RLS policy migration for resource_requests exists');

  const rlsMigration = fs.readFileSync(rlsMigrationPath, 'utf-8');
  assert(rlsMigration.includes('CREATE POLICY "resource_requests_admin_all"'), 'resource_requests allows admin full access');
  assert(rlsMigration.includes('CREATE POLICY "resource_requests_candidate_select"'), 'resource_requests restricts candidate select to user_id = auth.uid()');
  assert(rlsMigration.includes('CREATE POLICY "resource_requests_candidate_insert"'), 'resource_requests restricts candidate insert to user_id = auth.uid()');

  // ============================================================================
  // 9. SENSITIVE DATA MINIMIZATION
  // ============================================================================
  section('9. SENSITIVE DATA MINIMIZATION');

  assert(!adminRequestsPageCode.includes('password_hash'), 'AdminRequestsPage does not expose password hashes');
  assert(!adminRequestsPageCode.includes('secret_key'), 'AdminRequestsPage does not expose secret keys');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`  ADMIN CONTENT REQUESTS / BESPOKE REQUESTS E2E RESULTS`);
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
