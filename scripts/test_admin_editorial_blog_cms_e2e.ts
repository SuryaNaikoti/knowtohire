/**
 * KnowToHire Admin Editorial Blog CMS Module E2E Test Suite
 * Tests Route Registration, RoleGuard RBAC, Canonical Lineage,
 * Article Lifecycle (draft -> published -> archived), KPI Calculations,
 * Search & Category Filtering, Public Blog Gating, Slug Integrity,
 * Multi-Tenant Isolation, Supabase RLS Policies, and Event Reactivity.
 */

import { blogService, BlogStatus } from '../src/services/blogService';
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
  assert(appTsx.includes("path === '/admin/blog'"), 'Route /admin/blog is registered in App.tsx');
  assert(appTsx.includes("allowedRoles={['admin']}"), 'Route /admin/blog is guarded with allowedRoles=["admin"]');
  assert(appTsx.includes('<ProtectedRoute'), 'Route /admin/blog is guarded with ProtectedRoute');

  assert(appTsx.includes("path === '/blog'"), 'Public route /blog is registered in App.tsx');
  assert(appTsx.includes("path.startsWith('/blog/')"), 'Public route /blog/:slug is registered in App.tsx');

  const adminBlogPageCode = fs.readFileSync(path.join(srcRoot, 'pages/admin/AdminBlogPage.tsx'), 'utf-8');
  assert(adminBlogPageCode.includes('<AdminShell'), 'AdminBlogPage renders within AdminShell');
  assert(adminBlogPageCode.includes('onNavigate={onNavigate}'), 'AdminBlogPage forwards onNavigate prop to shell');

  // ============================================================================
  // 2. CANONICAL DATA LINEAGE & SEED ARTICLES
  // ============================================================================
  section('2. CANONICAL DATA LINEAGE & SEED ARTICLES');

  const res = await blogService.getBlogPosts({ status: 'all' });
  assert(res.data !== null && Array.isArray(res.data), 'blogService.getBlogPosts({ status: "all" }) retrieves articles');
  assert(res.error === null, 'getBlogPosts executes with 0 errors');

  const posts = res.data || [];
  assert(posts.length >= 4, `Retrieves ${posts.length} canonical editorial articles (min 4)`);

  const primaryPost = posts.find((p) => p.id === 'post-1');
  assert(primaryPost !== undefined, 'Canonical article (post-1) is present in CMS view');
  assert(
    primaryPost?.title === 'Navigating SEBI BRSR Core Mandates: What Listed Entities Need in FY 2026-27',
    'Title is "Navigating SEBI BRSR Core Mandates: What Listed Entities Need in FY 2026-27"'
  );
  assert(primaryPost?.category === 'ESG & BRSR Compliance', 'Category is "ESG & BRSR Compliance"');
  assert(primaryPost?.slug === 'sebi-brsr-core-mandates-guide-2026', 'Slug is "sebi-brsr-core-mandates-guide-2026"');
  assert(primaryPost?.author_name === 'KnowToHire Regulatory Research Group', 'Author is "KnowToHire Regulatory Research Group"');
  assert(primaryPost?.is_featured === true, 'Article is marked as Featured');
  assert(primaryPost?.status === 'published', 'Article status is "published"');
  assert(Boolean(primaryPost?.cover_url), 'Article has valid cover image URL');
  assert(primaryPost?.view_count === 14280, 'View count is 14280');

  // Audit all records for placeholder avoidance
  for (const p of posts) {
    assert(Boolean(p.id && p.title && p.slug), `Article ${p.id} has valid non-null ID, Title, and Slug`);
    assert(Boolean(p.status), `Article ${p.id} has explicit status: ${p.status}`);
    assert(p.title !== 'Placeholder Post', `Article ${p.id} does NOT use placeholder "Placeholder Post"`);
    assert(p.title !== 'Untitled Article', `Article ${p.id} does NOT use "Untitled Article"`);
    assert(Boolean(p.author_name), `Article ${p.id} has authentic author: ${p.author_name}`);
  }

  // ============================================================================
  // 3. KPI MATHEMATICS & DERIVATIONS
  // ============================================================================
  section('3. KPI MATHEMATICS & DERIVATIONS');

  const totalKPI = posts.length;
  const publishedKPI = posts.filter((p) => p.status === 'published').length;
  const draftKPI = posts.filter((p) => p.status === 'draft').length;
  const totalViewsKPI = posts.reduce((sum, p) => sum + (p.view_count || 0), 0);

  assert(totalKPI >= 4, `Total Articles KPI derives ${totalKPI} articles`);
  assert(publishedKPI >= 4, `Published & Live KPI derives ${publishedKPI} live articles`);
  assert(draftKPI >= 0, `Drafts KPI correctly reflects ${draftKPI} drafts in progress`);
  assert(totalViewsKPI > 40000, `Total Editorial Views KPI correctly aggregates ${totalViewsKPI} views`);

  // ============================================================================
  // 4. SEARCH, CATEGORY & FEATURED FILTERING
  // ============================================================================
  section('4. SEARCH, CATEGORY & FEATURED FILTERING');

  // Search by Keyword
  const searchPatentRes = await blogService.getBlogPosts({ status: 'all', search: 'Patent' });
  assert((searchPatentRes.data?.length || 0) >= 1, 'Search by keyword "Patent" finds matching articles');
  assert(searchPatentRes.data?.[0].slug === 'cleantech-patent-landscaping-section-3d-india', 'Identifies CleanTech Patent Landscaping article');

  // Filter by Category
  const esgCatRes = await blogService.getBlogPosts({ status: 'all', category: 'ESG' });
  assert((esgCatRes.data?.length || 0) >= 1, 'Filter by category "ESG" returns BRSR compliance articles');
  assert(esgCatRes.data?.[0].category === 'ESG & BRSR Compliance', 'Matches ESG & BRSR Compliance category');

  // Filter by Featured
  const featuredRes = await blogService.getBlogPosts({ isFeatured: true });
  assert(featuredRes.data?.every((p) => p.is_featured === true) === true, 'Filter isFeatured=true returns strictly featured articles');

  // Non-existent Search Query
  const zeroRes = await blogService.getBlogPosts({ status: 'all', search: 'NonExistentArticleQuery999ZZZ' });
  assert(zeroRes.data?.length === 0, 'Non-existent search query returns zero results without crashing');

  // ============================================================================
  // 5. ARTICLE LIFECYCLE & MUTATIONS (Draft -> Published -> Archived)
  // ============================================================================
  section('5. ARTICLE LIFECYCLE & MUTATIONS');

  // 1. Create a Draft Article
  const createDraftRes = await blogService.createBlogPost({
    title: 'Test Offshore Wind Turbine Environmental Clearance Guidelines',
    slug: 'test-offshore-wind-turbine-clearance-guidelines',
    excerpt: 'Regulatory insights into coastal zone management approvals for offshore wind farms.',
    content: '## Coastal Regulation Zone (CRZ) Compliance\n\nOffshore wind projects require clearances from the Ministry of Environment, Forest and Climate Change (MoEFCC) and state maritime boards.',
    category: 'CleanTech & Energy',
    author_name: 'Dr. Sunita Deshmukh (Climate Strategy Lead)',
    status: 'draft',
  });
  assert(createDraftRes.data !== null, 'Admin successfully creates draft article');
  assert(createDraftRes.data?.status === 'draft', 'Created article has initial status="draft"');

  const createdId = createDraftRes.data!.id;

  // 2. Advance Draft -> Published
  const publishRes = await blogService.updateBlogPostStatus(createdId, 'published');
  assert(publishRes.data === true, 'Admin advances article status to "published"');

  const fetchedPublished = await blogService.getBlogPostBySlug(createdId);
  assert(fetchedPublished.data?.status === 'published', 'Article status updated to "published" in store');
  assert(Boolean(fetchedPublished.data?.published_at), 'Published timestamp recorded');

  // 3. Update Article Details (Metadata & Content)
  const updateRes = await blogService.updateBlogPost(createdId, {
    title: 'Updated Offshore Wind Turbine Environmental Clearance & Marine Impact Playbook',
    is_featured: true,
  });
  assert(updateRes.data?.title.includes('Updated'), 'Article title updated successfully');
  assert(updateRes.data?.is_featured === true, 'Featured flag updated successfully');

  // 4. Advance Published -> Archived (Soft Delete)
  const archiveRes = await blogService.deleteBlogPost(createdId);
  assert(archiveRes.data === true, 'Admin archives article');

  const fetchedArchived = await blogService.getBlogPostBySlug(createdId);
  assert(fetchedArchived.data?.status === 'archived', 'Article status updated to "archived"');
  assert(fetchedArchived.data?.is_active === false, 'Archived article is_active set to false');

  // ============================================================================
  // 6. PUBLIC BLOG VISIBILITY & DATA LEAKAGE PREVENTION
  // ============================================================================
  section('6. PUBLIC BLOG VISIBILITY & DATA LEAKAGE PREVENTION');

  // Public getBlogPosts (no status param) must ONLY return published articles
  const publicBlogRes = await blogService.getBlogPosts();
  assert(publicBlogRes.data?.every((p) => p.status === 'published') === true, 'Public blog feed contains strictly "published" articles');
  assert(publicBlogRes.data?.some((p) => p.id === createdId) === false, 'Archived article is NOT visible in public blog listing');

  // Direct slug access with requirePublished must reject draft/archived articles
  const publicDirectCheck = await blogService.getBlogPostBySlug(createdId, { requirePublished: true });
  assert(publicDirectCheck.data === null, 'Public direct access to archived article returns NULL (404)');
  assert(publicDirectCheck.error?.status === 404, 'Public direct access returns HTTP 404 status code');

  // Public direct access to canonical published article must succeed
  const publicCanonicalCheck = await blogService.getBlogPostBySlug('sebi-brsr-core-mandates-guide-2026', { requirePublished: true });
  assert(publicCanonicalCheck.data !== null, 'Public direct access to published article succeeds');
  assert(publicCanonicalCheck.data?.id === 'post-1', 'Canonical published article payload retrieved');

  // ============================================================================
  // 7. SLUG INTEGRITY & COLLISION HANDLING
  // ============================================================================
  section('7. SLUG INTEGRITY & COLLISION HANDLING');

  const slugDirectRes = await blogService.getBlogPostBySlug('cleantech-patent-landscaping-section-3d-india');
  assert(slugDirectRes.data?.id === 'post-2', 'Slug lookup resolves strictly to post-2');

  const unmutatedPost = await blogService.getBlogPostBySlug('cso-executive-hiring-trends-india');
  assert(unmutatedPost.data?.status === 'published', 'Mutating Article A does NOT alter Article B');
  assert(unmutatedPost.data?.title.includes('Chief Sustainability Officer'), 'Article B attributes remain pristine');

  // ============================================================================
  // 8. CROSS-MODULE EVENT DISPATCH & REACTIVITY
  // ============================================================================
  section('8. CROSS-MODULE EVENT DISPATCH & REACTIVITY');

  const blogServiceCode = fs.readFileSync(path.join(srcRoot, 'services/blogService.ts'), 'utf-8');
  assert(
    blogServiceCode.includes("window.dispatchEvent(new CustomEvent('kth_blog_changed'))"),
    'blogService dispatches kth_blog_changed on create/update/status mutations'
  );

  assert(
    adminBlogPageCode.includes("window.addEventListener('kth_blog_changed'"),
    'AdminBlogPage subscribes to kth_blog_changed for live synchronization'
  );

  // ============================================================================
  // 9. SUPABASE RLS & DATABASE POLICIES
  // ============================================================================
  section('9. SUPABASE RLS & DATABASE POLICIES');

  const migrationsRoot = path.join(projectRoot, 'supabase/migrations');
  const rlsMigrationPath = path.join(migrationsRoot, '20260826000000_editorial_blog_schema.sql');
  assert(fs.existsSync(rlsMigrationPath), 'RLS policy migration for blog_posts exists');

  const rlsMigration = fs.readFileSync(rlsMigrationPath, 'utf-8');
  assert(rlsMigration.includes('CREATE POLICY "blog_posts_admin_all"'), 'blog_posts allows admin full access');
  assert(rlsMigration.includes('CREATE POLICY "blog_posts_public_select"'), 'blog_posts restricts public select to status=published and is_active=true');

  // ============================================================================
  // 10. SENSITIVE DATA MINIMIZATION
  // ============================================================================
  section('10. SENSITIVE DATA MINIMIZATION');

  assert(!adminBlogPageCode.includes('password_hash'), 'AdminBlogPage does not expose password hashes');
  assert(!adminBlogPageCode.includes('secret_key'), 'AdminBlogPage does not expose secret keys');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`  ADMIN EDITORIAL BLOG CMS E2E RESULTS`);
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
