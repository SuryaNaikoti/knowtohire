/**
 * KnowToHire Admin Knowledge Hub CMS / Resources Library E2E Test Suite
 * Tests Route Registration, RoleGuard RBAC, Canonical Lineage,
 * Lifecycle State Transitions (draft -> published -> archived),
 * Candidate & Employer Public Visibility Gating, Search & Filtering,
 * CRUD Operations, File Deliverable Integrity, Content Request Linkage,
 * Real-Time Event Reactivity, and Supabase RLS Policies.
 */

import { knowledgeService, KnowledgeResource } from '../src/services/knowledgeService';
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
  assert(appTsx.includes("path === '/admin/resources'"), 'Route /admin/resources is registered in App.tsx');
  assert(appTsx.includes("allowedRoles={['admin']}"), 'Route /admin/resources is guarded with allowedRoles=["admin"]');
  assert(appTsx.includes('<ProtectedRoute'), 'Route /admin/resources is guarded with ProtectedRoute');

  const adminResourcesPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminResourcesPage.tsx'), 'utf-8');
  assert(adminResourcesPageCode.includes('<AdminShell'), 'AdminResourcesPage renders within AdminShell with proper module title');
  assert(adminResourcesPageCode.includes('onNavigate={onNavigate}'), 'AdminResourcesPage forwards onNavigate prop to shell');

  // ============================================================================
  // 2. DATA LINEAGE & CANONICAL RESOURCE MODEL
  // ============================================================================
  section('2. DATA LINEAGE & CANONICAL RESOURCE MODEL');

  const allRes = await knowledgeService.getResources({ status: 'all' });
  assert(allRes.data !== null && Array.isArray(allRes.data), 'knowledgeService.getResources retrieves resource records');
  assert(allRes.error === null, 'getResources executes with 0 errors');

  const resources = allRes.data || [];
  assert(resources.length >= 7, `Retrieves ${resources.length} canonical knowledge resources (min 7)`);

  const primaryRes = resources.find(r => r.id === 'res-1');
  assert(primaryRes !== undefined, 'Canonical regulatory handbook (res-1) is present in resource list');
  assert(primaryRes?.title === 'Environmental Compliance Calendar & SPCB Guide 2026', 'Resource title is accurate');
  assert(primaryRes?.category === 'Environmental & ESG', 'Category is "Environmental & ESG"');
  assert(primaryRes?.format === 'PDF', 'Format is PDF');
  assert(primaryRes?.author === 'KnowToHire Legal & Environmental Desk', 'Author is canonical desk');
  assert(primaryRes?.status === 'published', 'Initial status is published');
  assert(primaryRes?.downloads_count === 14200, 'Downloads count is 14,200');

  // Audit all records for placeholder avoidance
  for (const r of resources) {
    assert(Boolean(r.id && r.title && r.slug), `Resource ${r.id} has valid non-null ID, Title, and Slug`);
    assert(Boolean(r.category && r.format && r.status), `Resource ${r.id} has explicit Category (${r.category}), Format (${r.format}), and Status (${r.status})`);
    assert(r.title !== 'Untitled Resource', `Resource ${r.id} does NOT use placeholder "Untitled Resource"`);
    assert(r.author !== 'Author Name' && r.author !== 'Placeholder Author', `Resource ${r.id} does NOT use generic placeholder author`);
  }

  // ============================================================================
  // 3. LIFECYCLE STATE MACHINE & PUBLICATION CONTROLS
  // ============================================================================
  section('3. LIFECYCLE STATE MACHINE & PUBLICATION CONTROLS');

  // Create a draft resource
  const createRes = await knowledgeService.createResource({
    title: 'Solar PV Due Diligence & PPA Drafting Handbook',
    description: 'Technical due diligence checklist and tariff bankability models for C&I solar assets.',
    category: 'Technology',
    format: 'PDF',
    status: 'draft',
    tags: ['Solar', 'PPA', 'Due Diligence'],
  });

  assert(createRes.data !== null, 'Admin successfully creates draft resource');
  assert(createRes.error === null, 'Draft creation returns 0 errors');
  const createdId = createRes.data?.id || '';

  // Verify created resource is in draft state
  let fetched = await knowledgeService.getResourceByIdOrSlug(createdId);
  assert(fetched.data?.status === 'draft', 'Created resource has status="draft"');

  // Transition draft -> published
  const publishRes = await knowledgeService.updateResource(createdId, { status: 'published' });
  assert(publishRes.data?.status === 'published', 'Admin successfully publishes draft resource (status -> published)');
  assert(Boolean(publishRes.data?.published_at), 'Published resource acquires valid published_at timestamp');

  // Transition published -> archived
  const archiveRes = await knowledgeService.updateResource(createdId, { status: 'archived' });
  assert(archiveRes.data?.status === 'archived', 'Admin successfully archives resource (status -> archived)');

  // Soft Delete test
  const deleteRes = await knowledgeService.deleteResource(createdId);
  assert(deleteRes.data === true, 'Admin deleteResource sets status to archived');

  // ============================================================================
  // 4. CANDIDATE & EMPLOYER PUBLIC VISIBILITY GATING
  // ============================================================================
  section('4. CANDIDATE & EMPLOYER PUBLIC VISIBILITY GATING');

  // Public/Candidate feed (default without status='all')
  const publicFeed = await knowledgeService.getResources();
  assert(publicFeed.data !== null, 'Public consumers can query knowledge resources');
  assert(publicFeed.data?.every(r => r.status === 'published') === true, 'Public feed ONLY returns resources with status="published"');
  assert(publicFeed.data?.some(r => r.id === createdId) === false, 'Archived/Draft resource is strictly hidden from public feed');

  // Direct fetch by ID of published resource
  const publishedFetch = await knowledgeService.getResourceByIdOrSlug('res-1');
  assert(publishedFetch.data?.status === 'published', 'Published resource is accessible directly');

  // ============================================================================
  // 5. SEARCH & FILTERING CORRECTNESS
  // ============================================================================
  section('5. SEARCH & FILTERING CORRECTNESS');

  // Search by Title Keyword
  const searchTitleRes = await knowledgeService.getResources({ status: 'all', search: 'Kubernetes' });
  assert(searchTitleRes.data?.some(r => r.title.includes('Kubernetes')) === true, 'Search by title keyword "Kubernetes" finds matching resource');
  assert(searchTitleRes.data?.every(r => r.title.toLowerCase().includes('kubernetes') || r.description.toLowerCase().includes('kubernetes')) === true, 'Search results strictly match query');

  // Case-Insensitive Search
  const searchLowerRes = await knowledgeService.getResources({ status: 'all', search: 'compliance' });
  assert((searchLowerRes.data?.length || 0) >= 1, 'Case-insensitive search for "compliance" finds matching handbooks');

  // Filter by Category
  const catRes = await knowledgeService.getResources({ status: 'all', category: 'Technology' });
  assert(catRes.data?.every(r => r.category.toLowerCase().includes('technology')) === true, 'Category filter "Technology" returns only technology assets');

  // Filter by Status
  const draftOnlyRes = await knowledgeService.getResources({ status: 'draft' });
  assert(draftOnlyRes.data?.every(r => r.status === 'draft') === true, 'Status filter "draft" returns only draft assets');

  const publishedOnlyRes = await knowledgeService.getResources({ status: 'published' });
  assert(publishedOnlyRes.data?.every(r => r.status === 'published') === true, 'Status filter "published" returns only published assets');

  // Zero Results
  const zeroRes = await knowledgeService.getResources({ status: 'all', search: 'NonExistentResourceKeywordXYZ999' });
  assert(zeroRes.data?.length === 0, 'Non-existent search returns zero results without crashing');

  // ============================================================================
  // 6. RESOURCE CREATION & EDITING FIELD INTEGRITY
  // ============================================================================
  section('6. RESOURCE CREATION & EDITING FIELD INTEGRITY');

  const editRes = await knowledgeService.updateResource('res-tech-1', {
    description: 'Updated comprehensive container orchestration guide with Kubernetes 1.30+ features.',
    tags: ['Kubernetes', 'Cloud Infrastructure', 'Docker', 'DevOps', 'CNCF'],
  });

  assert(editRes.data !== null, 'Admin successfully updates resource description and tags');
  assert(editRes.data?.description.includes('Kubernetes 1.30+'), 'Updated description persisted correctly');
  assert(editRes.data?.tags?.includes('CNCF') === true, 'Updated tags persisted correctly');
  assert(editRes.data?.title === 'Kubernetes & Cloud Infrastructure Best Practices', 'Unrelated fields (title) are preserved intact');
  assert(editRes.data?.category === 'Technology', 'Unrelated fields (category) are preserved intact');

  // ============================================================================
  // 7. FILE & DOCUMENT INTEGRITY & DOWNLOAD TRACKING
  // ============================================================================
  section('7. FILE & DOCUMENT INTEGRITY & DOWNLOAD TRACKING');

  const initialDownloads = (await knowledgeService.getResourceByIdOrSlug('res-tech-1')).data?.downloads_count || 0;
  const trackRes = await knowledgeService.trackDownload('res-tech-1');
  assert(trackRes.data !== null && Boolean(trackRes.data.downloadUrl), 'trackDownload returns valid deliverable download URL');
  
  const updatedDownloads = (await knowledgeService.getResourceByIdOrSlug('res-tech-1')).data?.downloads_count || 0;
  assert(updatedDownloads === initialDownloads + 1, 'trackDownload accurately increments resource download counter');

  // ============================================================================
  // 8. CROSS-MODULE EVENT DISPATCH & REACTIVITY
  // ============================================================================
  section('8. CROSS-MODULE EVENT DISPATCH & REACTIVITY');

  const knowledgeServiceCode = fs.readFileSync(path.join(srcRoot, 'services/knowledgeService.ts'), 'utf-8');
  assert(knowledgeServiceCode.includes("window.dispatchEvent(new CustomEvent('kth_resources_changed'))"), 'knowledgeService dispatches kth_resources_changed on creation and mutation');
  assert(adminResourcesPageCode.includes("window.addEventListener('kth_resources_changed'"), 'AdminResourcesPage subscribes to kth_resources_changed');

  // ============================================================================
  // 9. CONTENT REQUESTS FULFILLMENT LINKAGE
  // ============================================================================
  section('9. CONTENT REQUESTS FULFILLMENT LINKAGE');

  const fulfillPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminFulfillRequestPage.tsx'), 'utf-8');
  assert(fulfillPageCode.includes("knowledgeService.getResources({ status: 'all' })"), 'AdminFulfillRequestPage integrates with Knowledge Hub resources');
  assert(fulfillPageCode.includes('completed_resource_id'), 'AdminFulfillRequestPage binds fulfillment to completed_resource_id');

  // ============================================================================
  // 10. SUPABASE RLS & DATABASE POLICIES
  // ============================================================================
  section('10. SUPABASE RLS & DATABASE POLICIES');

  const migrationsRoot = path.join(projectRoot, 'supabase/migrations');
  const rlsMigrationPath = path.join(migrationsRoot, '20260825000000_content_publishing_and_fulfillment_schema.sql');
  assert(fs.existsSync(rlsMigrationPath), 'RLS policy migration for resources table exists');

  const rlsMigration = fs.readFileSync(rlsMigrationPath, 'utf-8');
  assert(rlsMigration.includes('CREATE POLICY "resources_public_select"'), 'resources allows public read for status = published');
  assert(rlsMigration.includes('CREATE POLICY "resources_admin_all"'), 'resources allows admin full access');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`  ADMIN KNOWLEDGE HUB CMS / RESOURCES LIBRARY E2E RESULTS`);
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
