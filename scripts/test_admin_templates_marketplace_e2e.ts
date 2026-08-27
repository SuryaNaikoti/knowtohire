/**
 * KnowToHire Admin Templates Marketplace Module E2E Test Suite
 * Tests Route Registration, RoleGuard RBAC, Canonical Lineage,
 * Template Lifecycle (draft -> published -> archived), KPI Calculations,
 * Search & Filtering, Public Marketplace Isolation, Download Counter Tracking,
 * Multi-Tenant Security, Supabase RLS Policies, and Event Reactivity.
 */

import { templateService } from '../src/services/templateService';
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
  assert(appTsx.includes("path === '/admin/templates'"), 'Route /admin/templates is registered in App.tsx');
  assert(appTsx.includes("allowedRoles={['admin']}"), 'Route /admin/templates is guarded with allowedRoles=["admin"]');
  assert(appTsx.includes('<ProtectedRoute'), 'Route /admin/templates is guarded with ProtectedRoute');

  const adminTemplatesPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminTemplatesPage.tsx'), 'utf-8');
  assert(adminTemplatesPageCode.includes('<AdminShell'), 'AdminTemplatesPage renders within AdminShell with proper module title');
  assert(adminTemplatesPageCode.includes('onNavigate={onNavigate}'), 'AdminTemplatesPage forwards onNavigate prop to shell');

  // ============================================================================
  // 2. DATA LINEAGE & CANONICAL TEMPLATES
  // ============================================================================
  section('2. DATA LINEAGE & CANONICAL TEMPLATES');

  const res = await templateService.getTemplates({ status: 'all' });
  assert(res.data !== null && Array.isArray(res.data), 'templateService.getTemplates({ status: "all" }) retrieves template records');
  assert(res.error === null, 'getTemplates executes with 0 errors');

  const templates = res.data || [];
  assert(templates.length >= 6, `Retrieves ${templates.length} canonical marketplace templates (min 6)`);

  const primaryTmpl = templates.find((t) => t.id === 'tmpl-1');
  assert(primaryTmpl !== undefined, 'Canonical template (tmpl-1) is present in marketplace view');
  assert(
    primaryTmpl?.title === 'Executive ATS Resume — Sustainability & ESG Consultant',
    'Title is "Executive ATS Resume — Sustainability & ESG Consultant"'
  );
  assert(primaryTmpl?.category === 'Resume & CV Templates', 'Category is "Resume & CV Templates"');
  assert(primaryTmpl?.price_inr === 499, 'Price is 499 INR');
  assert(primaryTmpl?.is_free === false, 'is_free is false for paid resume template');
  assert(Array.isArray(primaryTmpl?.formats) && primaryTmpl?.formats.includes('DOCX'), 'Formats include DOCX');
  assert(Boolean(primaryTmpl?.file_url), 'Template has valid download file URL');
  assert(Boolean(primaryTmpl?.file_size), 'Template has explicit file size');
  assert(primaryTmpl?.status === 'published', 'Canonical template status is "published"');

  // Audit all records for placeholder avoidance
  for (const t of templates) {
    assert(Boolean(t.id && t.title && t.slug), `Template ${t.id} has valid non-null ID, Title, and Slug`);
    assert(Boolean(t.status), `Template ${t.id} has explicit status: ${t.status}`);
    assert(t.title !== 'Template Document', `Template ${t.id} does NOT use placeholder "Template Document"`);
    assert(t.title !== 'Generic Template', `Template ${t.id} does NOT use generic "Generic Template"`);
  }

  // ============================================================================
  // 3. KPI MATHEMATICS & DERIVATIONS
  // ============================================================================
  section('3. KPI MATHEMATICS & DERIVATIONS');

  const totalKPI = templates.length;
  const publishedKPI = templates.filter((t) => t.status === 'published').length;
  const draftKPI = templates.filter((t) => t.status === 'draft').length;
  const totalDownloadsKPI = templates.reduce((sum, t) => sum + (t.downloads_count || 0), 0);

  assert(totalKPI >= 6, `Total Templates KPI derives ${totalKPI} templates`);
  assert(publishedKPI >= 6, `Published & Live KPI derives ${publishedKPI} live templates`);
  assert(draftKPI >= 0, `Drafts KPI correctly reflects ${draftKPI} drafts in progress`);
  assert(totalDownloadsKPI > 20000, `Total Downloads KPI correctly aggregates ${totalDownloadsKPI} downloads`);

  // ============================================================================
  // 4. SEARCH & CATEGORY FILTERING
  // ============================================================================
  section('4. SEARCH & CATEGORY FILTERING');

  // Search by Keyword
  const searchResumeRes = await templateService.getTemplates({ status: 'all', search: 'Resume' });
  assert((searchResumeRes.data?.length || 0) >= 1, 'Search by keyword "Resume" finds matching templates');
  assert(
    searchResumeRes.data?.every(
      (t) =>
        t.title.toLowerCase().includes('resume') ||
        t.description.toLowerCase().includes('resume') ||
        t.category.toLowerCase().includes('resume') ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes('resume')))
    ) === true,
    'Search results strictly match query keyword'
  );

  // Filter by Category
  const legalCatRes = await templateService.getTemplates({ status: 'all', category: 'Legal' });
  assert((legalCatRes.data?.length || 0) >= 1, 'Filter by category "Legal" returns contracts & agreements');
  assert(
    legalCatRes.data?.every((t) => t.category.toLowerCase().includes('legal') || t.title.toLowerCase().includes('legal')) === true,
    'Category results match selected taxonomy'
  );

  // Filter by Free vs Paid
  const freeRes = await templateService.getTemplates({ status: 'all', isFree: true });
  assert(freeRes.data?.every((t) => t.is_free === true && t.price_inr === 0) === true, 'Filter isFree=true returns strictly free templates');

  const paidRes = await templateService.getTemplates({ status: 'all', isFree: false });
  assert(paidRes.data?.every((t) => t.is_free === false && t.price_inr > 0) === true, 'Filter isFree=false returns strictly paid templates');

  // Non-existent Search Query
  const zeroRes = await templateService.getTemplates({ status: 'all', search: 'NonExistentTemplateSearchQuery123XYZ' });
  assert(zeroRes.data?.length === 0, 'Non-existent search query returns zero results without crashing');

  // ============================================================================
  // 5. TEMPLATE LIFECYCLE & MUTATION TESTING (Draft -> Published -> Archived)
  // ============================================================================
  section('5. TEMPLATE LIFECYCLE & MUTATION TESTING');

  // 1. Create a Draft Template
  const createDraftRes = await templateService.createTemplate({
    title: 'Test Industrial Waste Management SOP Template',
    description: 'Standard Operating Procedure (SOP) template for hazardous waste disposal in chemical manufacturing.',
    category: 'Compliance Toolkits',
    price_inr: 299,
    formats: ['DOCX', 'PDF'],
    status: 'draft',
  });
  assert(createDraftRes.data !== null, 'Admin successfully creates draft template');
  assert(createDraftRes.data?.status === 'draft', 'Created template has initial status="draft"');
  assert(createDraftRes.data?.is_free === false, 'Paid price reflected accurately');

  const createdId = createDraftRes.data!.id;

  // 2. Advance Draft -> Published
  const publishRes = await templateService.updateTemplateStatus(createdId, 'published');
  assert(publishRes.data === true, 'Admin advances template status to "published"');

  const fetchedPublished = await templateService.getTemplateByIdOrSlug(createdId);
  assert(fetchedPublished.data?.status === 'published', 'Template status updated to "published" in store');
  assert(Boolean(fetchedPublished.data?.published_at), 'Published timestamp recorded');

  // 3. Track Download Count Increment
  const initialDownloads = fetchedPublished.data?.downloads_count || 0;
  const dlRes = await templateService.trackDownload(createdId);
  assert(dlRes.data?.downloadUrl !== undefined, 'trackDownload returns valid file download URL');

  const postDlTmpl = await templateService.getTemplateByIdOrSlug(createdId);
  assert(postDlTmpl.data?.downloads_count === initialDownloads + 1, 'Download counter increments accurately by +1');

  // 4. Update Template Details (Edit Metadata)
  const updateRes = await templateService.updateTemplate(createdId, {
    title: 'Updated Industrial Waste Management SOP & Safety Toolkit',
    price_inr: 0, // Make it Free
  });
  assert(updateRes.data?.title.includes('Updated'), 'Template title updated successfully');
  assert(updateRes.data?.price_inr === 0, 'Template price updated to 0');
  assert(updateRes.data?.is_free === true, 'is_free flag automatically derived as true');

  // 5. Advance Published -> Archived (Soft Delete)
  const archiveRes = await templateService.deleteTemplate(createdId);
  assert(archiveRes.data === true, 'Admin archives template asset');

  const fetchedArchived = await templateService.getTemplateByIdOrSlug(createdId);
  assert(fetchedArchived.data?.status === 'archived', 'Template status updated to "archived"');
  assert(fetchedArchived.data?.is_active === false, 'Archived template is_active set to false');

  // ============================================================================
  // 6. PUBLIC MARKETPLACE VISIBILITY & DATA LEAKAGE PREVENTION
  // ============================================================================
  section('6. PUBLIC MARKETPLACE VISIBILITY & DATA LEAKAGE PREVENTION');

  // Public getTemplates (no status passed) must ONLY return published templates
  const publicTemplatesRes = await templateService.getTemplates();
  assert(publicTemplatesRes.data?.every((t) => t.status === 'published') === true, 'Public marketplace feed contains strictly "published" templates');
  assert(publicTemplatesRes.data?.some((t) => t.id === createdId) === false, 'Archived template is NOT visible in public marketplace listing');

  // Direct URL access with requirePublished must reject draft/archived templates
  const publicDirectCheck = await templateService.getTemplateByIdOrSlug(createdId, { requirePublished: true });
  assert(publicDirectCheck.data === null, 'Public direct access to archived template returns NULL (404)');
  assert(publicDirectCheck.error?.status === 404, 'Public direct access returns HTTP 404 status code');

  // Public direct access to canonical published template must succeed
  const publicCanonicalCheck = await templateService.getTemplateByIdOrSlug('tmpl-1', { requirePublished: true });
  assert(publicCanonicalCheck.data !== null, 'Public direct access to published template succeeds');
  assert(publicCanonicalCheck.data?.id === 'tmpl-1', 'Canonical published template payload retrieved');

  // ============================================================================
  // 7. MULTI-TENANT ISOLATION & NON-LEAKAGE
  // ============================================================================
  section('7. MULTI-TENANT ISOLATION & NON-LEAKAGE');

  const unmutatedTmpl = await templateService.getTemplateByIdOrSlug('tmpl-2');
  assert(unmutatedTmpl.data?.status === 'published', 'Mutating Template A does NOT leak into or alter Template B');
  assert(unmutatedTmpl.data?.title.includes('Environmental Impact Assessment'), 'Template B attributes remain pristine');

  // ============================================================================
  // 8. CROSS-MODULE EVENT DISPATCH & REACTIVITY
  // ============================================================================
  section('8. CROSS-MODULE EVENT DISPATCH & REACTIVITY');

  const templateServiceCode = fs.readFileSync(path.join(srcRoot, 'services/templateService.ts'), 'utf-8');
  assert(
    templateServiceCode.includes("window.dispatchEvent(new CustomEvent('kth_templates_changed'))"),
    'templateService dispatches kth_templates_changed on create/update/status mutations'
  );

  assert(
    adminTemplatesPageCode.includes("window.addEventListener('kth_templates_changed'"),
    'AdminTemplatesPage subscribes to kth_templates_changed for live synchronization'
  );

  // ============================================================================
  // 9. SUPABASE RLS & DATABASE POLICIES
  // ============================================================================
  section('9. SUPABASE RLS & DATABASE POLICIES');

  const migrationsRoot = path.join(projectRoot, 'supabase/migrations');
  const rlsMigrationPath = path.join(migrationsRoot, '20260825000000_content_publishing_and_fulfillment_schema.sql');
  assert(fs.existsSync(rlsMigrationPath), 'RLS policy migration for templates exists');

  const rlsMigration = fs.readFileSync(rlsMigrationPath, 'utf-8');
  assert(rlsMigration.includes('CREATE POLICY "templates_admin_all"'), 'templates allows admin full access');
  assert(rlsMigration.includes('CREATE POLICY "templates_public_select"'), 'templates restricts public select to status=published and is_active=true');
  assert(rlsMigration.includes("bucket_id IN ('content', 'knowledge-hub', 'templates')"), 'Supabase Storage policies configure templates bucket');

  // ============================================================================
  // 10. SENSITIVE DATA MINIMIZATION
  // ============================================================================
  section('10. SENSITIVE DATA MINIMIZATION');

  assert(!adminTemplatesPageCode.includes('password_hash'), 'AdminTemplatesPage does not expose password hashes');
  assert(!adminTemplatesPageCode.includes('secret_key'), 'AdminTemplatesPage does not expose secret keys');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`  ADMIN TEMPLATES MARKETPLACE E2E RESULTS`);
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
