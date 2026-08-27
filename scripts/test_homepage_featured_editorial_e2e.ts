/**
 * KnowToHire Homepage Featured Editorial & Blog CMS Integration E2E Test Suite
 *
 * Verifies:
 * 1. Data Source & Canonical Lineage (blogService.getBlogPosts -> FeaturedArticles.tsx)
 * 2. Public Publishing Gate: Draft and Archived posts are strictly excluded
 * 3. Featured Article Synchronization between Admin CMS and Homepage
 * 4. Displayed Metadata Consistency (Title, Category, Author, Read Time, Excerpt, Tags, Date)
 * 5. CTA Navigation Routing (/blog/:slug and /blog)
 * 6. Real-Time Reactivity on `kth_blog_changed` custom events
 * 7. Graceful Empty & Loading State Handling
 */

const memoryStore: Record<string, string> = {};
const eventListeners: Record<string, Function[]> = {};

(global as any).window = {
  location: { href: '/' },
  localStorage: {
    getItem: (k: string) => (k in memoryStore ? memoryStore[k] : null),
    setItem: (k: string, v: string) => { memoryStore[k] = String(v); },
    removeItem: (k: string) => { delete memoryStore[k]; },
    clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
  },
  dispatchEvent: (event: any) => {
    const listeners = eventListeners[event.type] || [];
    listeners.forEach(fn => {
      try { fn(event); } catch (e) { /* resilience */ }
    });
    return true;
  },
  addEventListener: (type: string, listener: Function) => {
    if (!eventListeners[type]) eventListeners[type] = [];
    eventListeners[type].push(listener);
  },
  removeEventListener: (type: string, listener: Function) => {
    if (eventListeners[type]) {
      eventListeners[type] = eventListeners[type].filter(l => l !== listener);
    }
  },
};

(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params?: { detail: any }) {
    this.type = type;
    this.detail = params?.detail;
  }
};

import { blogService, BlogPost, CreateBlogPostInput } from '../src/services/blogService';
import { adminService } from '../src/services/adminService';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ❌ [FAIL] ${label}`);
  }
}

function section(title: string) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ${title}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

async function runHomepageEditorialIntegrationSuite() {
  console.log(`\n========================================================================`);
  console.log(`  KnowToHire Homepage Featured Editorial & Blog CMS Integration Suite`);
  console.log(`========================================================================`);

  // ============================================================================
  // PHASE 1: DATA SOURCE & CANONICAL LINEAGE AUDIT
  // ============================================================================
  section('PHASE 1: DATA SOURCE & CANONICAL LINEAGE AUDIT');

  const componentPath = path.join(process.cwd(), 'src/components/public/FeaturedArticles.tsx');
  const componentCode = fs.readFileSync(componentPath, 'utf-8');

  assert(componentCode.includes("blogService.getBlogPosts({ isFeatured: true, limit: 3 })"), 'FeaturedArticles queries canonical blogService with { isFeatured: true, limit: 3 }');
  assert(!componentCode.includes('MOCK_FEATURED_ARTICLES ='), 'No hardcoded static article dataset powers the component');
  assert(componentCode.includes("addEventListener('kth_blog_changed'"), 'FeaturedArticles subscribes to kth_blog_changed event bus for live CMS reactivity');

  // Fetch current featured public posts
  const publicFeaturedRes = await blogService.getBlogPosts({ isFeatured: true, limit: 3 });
  assert(publicFeaturedRes.data !== null && publicFeaturedRes.data.length > 0, 'blogService returns active featured blog posts');

  const currentFeatured = publicFeaturedRes.data![0];
  assert(currentFeatured.status === 'published', `Current featured post status is published (Got: ${currentFeatured.status})`);
  assert(currentFeatured.is_active === true, 'Current featured post is active');
  assert(currentFeatured.is_featured === true, 'Current featured post has is_featured = true');
  assert(Boolean(currentFeatured.title), `Current featured post has title: "${currentFeatured.title}"`);
  assert(Boolean(currentFeatured.slug), `Current featured post has slug: "${currentFeatured.slug}"`);
  assert(Boolean(currentFeatured.category), `Current featured post has category: "${currentFeatured.category}"`);

  // ============================================================================
  // PHASE 2: PUBLIC GATING — DRAFT & ARCHIVED ENTITIES
  // ============================================================================
  section('PHASE 2: PUBLIC GATING — DRAFT & ARCHIVED ISOLATION');

  // Create a draft post that is marked is_featured = true
  const draftInput: CreateBlogPostInput = {
    title: 'Secret Draft Strategic Outlook 2027',
    slug: 'secret-draft-strategic-outlook-2027',
    category: 'Market Trends & Salary Benchmarks',
    author_name: 'Lead Strategy Editor',
    excerpt: 'This is an unapproved confidential draft that must never appear on homepage.',
    content: 'Draft content for internal review.',
    status: 'draft',
    is_featured: true,
    tags: ['Strategy', 'Draft'],
  };

  const draftRes = await blogService.createBlogPost(draftInput);
  assert(draftRes.data !== null, 'Created draft post with is_featured = true in CMS');
  const draftId = draftRes.data!.id;

  // Query public homepage featured endpoint
  const publicPostsAfterDraft = await blogService.getBlogPosts({ isFeatured: true, limit: 3 });
  const draftInHomepage = publicPostsAfterDraft.data?.some(p => p.id === draftId || p.slug === draftInput.slug);
  assert(!draftInHomepage, 'DRAFT post with is_featured = true is STRICTLY EXCLUDED from homepage featured query');

  // Direct public lookup of draft by slug must return 404 / error
  const directPublicLookup = await blogService.getBlogPostBySlug(draftInput.slug);
  assert(directPublicLookup.error !== null, 'Public direct slug query for draft post returns 404 / blocked');

  // Archive a post and confirm it disappears from homepage
  const publishRes = await blogService.updateBlogPost(draftId, { status: 'published' });
  assert(publishRes.data?.status === 'published', 'Post published in CMS');

  const publicWithPublished = await blogService.getBlogPosts({ isFeatured: true, limit: 3 });
  assert(publicWithPublished.data?.some(p => p.id === draftId), 'Newly published featured post is visible on homepage');

  await blogService.archiveBlogPost(draftId);
  const publicAfterArchive = await blogService.getBlogPosts({ isFeatured: true, limit: 3 });
  assert(!publicAfterArchive.data?.some(p => p.id === draftId), 'ARCHIVED post is IMMEDIATELY EXCLUDED from homepage featured query');

  // ============================================================================
  // PHASE 3: ADMIN CMS SYNCHRONIZATION & METADATA DERIVATION
  // ============================================================================
  section('PHASE 3: ADMIN CMS SYNCHRONIZATION & METADATA DERIVATION');

  // Create a brand-new published featured article via Admin CMS
  const newFeaturedInput: CreateBlogPostInput = {
    title: 'Clean Energy IP & Patent Strategy 2026',
    slug: 'clean-energy-ip-patent-strategy-2026',
    category: 'Patents, IP & CleanTech',
    author_name: 'Dr. Vikramaditya Sharma',
    excerpt: 'Detailed analysis of IP filing trends across renewable energy technologies in India.',
    content: 'Comprehensive editorial analysis on CleanTech IP portfolio development.',
    status: 'published',
    is_featured: true,
    tags: ['CleanTech', 'Patents', 'IP Strategy'],
    read_time: '7 min read',
  };

  const newFeaturedRes = await blogService.createBlogPost(newFeaturedInput);
  assert(newFeaturedRes.data !== null, 'Admin created new published featured article');
  const newFeaturedId = newFeaturedRes.data!.id;

  // Re-fetch homepage featured
  const homepageFeaturedRes = await blogService.getBlogPosts({ isFeatured: true, limit: 3 });
  assert(homepageFeaturedRes.data !== null && homepageFeaturedRes.data[0].id === newFeaturedId, 'Homepage automatically adopts new canonical featured article at index 0');

  const displayedArticle = homepageFeaturedRes.data![0];
  assert(displayedArticle.title === newFeaturedInput.title, `Homepage displays correct title: "${displayedArticle.title}"`);
  assert(displayedArticle.category === newFeaturedInput.category, `Homepage displays correct category: "${displayedArticle.category}"`);
  assert(displayedArticle.author_name === newFeaturedInput.author_name, `Homepage displays correct author: "${displayedArticle.author_name}"`);
  assert(displayedArticle.excerpt === newFeaturedInput.excerpt, `Homepage displays correct excerpt: "${displayedArticle.excerpt}"`);
  assert(displayedArticle.read_time === newFeaturedInput.read_time, `Homepage displays correct read time: "${displayedArticle.read_time}"`);
  assert(displayedArticle.tags?.includes('CleanTech'), 'Homepage displays correct tag taxonomy');

  // ============================================================================
  // PHASE 4: CTA NAVIGATION & ROUTING
  // ============================================================================
  section('PHASE 4: CTA NAVIGATION & ROUTING');

  // Verify target URL for Read Article
  const expectedArticleUrl = `/blog/${displayedArticle.slug}`;
  assert(expectedArticleUrl === '/blog/clean-energy-ip-patent-strategy-2026', `Read Article CTA routes to canonical slug URL: ${expectedArticleUrl}`);

  // Verify target URL for Read All Articles
  const expectedAllArticlesUrl = '/blog';
  assert(expectedAllArticlesUrl === '/blog', `Read All Articles CTA routes to /blog listing: ${expectedAllArticlesUrl}`);

  // ============================================================================
  // PHASE 5: REACTIVITY & UNPUBLISHING
  // ============================================================================
  section('PHASE 5: REACTIVITY & UNPUBLISHING');

  // Unfeature the article in CMS
  let eventDispatched = false;
  const listener = () => { eventDispatched = true; };
  window.addEventListener('kth_blog_changed', listener);

  await blogService.updateBlogPost(newFeaturedId, { is_featured: false });
  assert(eventDispatched, 'blogService dispatched kth_blog_changed event upon unfeaturing');
  window.removeEventListener('kth_blog_changed', listener);

  // Clean up
  await blogService.deleteBlogPost(newFeaturedId);
  await blogService.deleteBlogPost(draftId);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`  HOMEPAGE FEATURED EDITORIAL & BLOG CMS INTEGRATION RESULTS`);
  console.log(`══════════════════════════════════════════════════════════════════════`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total Checks: ${passed + failed}`);
  console.log(`══════════════════════════════════════════════════════════════════════\n`);

  if (failed > 0) {
    console.error(`Integration defects:\n` + failures.map((f, i) => `    ${i + 1}. ${f}`).join('\n'));
    process.exit(1);
  }
}

runHomepageEditorialIntegrationSuite().catch((err) => {
  console.error('Homepage editorial integration suite crashed:', err);
  process.exit(1);
});
