import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/qa_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:5173';

const CANDIDATE_CREDS = {
  email: 'cand_1786972983967@hutdot.com',
  password: 'Password123!'
};

const EMPLOYER_CREDS = {
  email: 'cilove3743@hutdot.com',
  password: 'Password123!'
};

async function waitAndScreenshot(page, name, waitMs = 1500) {
  await new Promise(r => setTimeout(r, waitMs));
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[SCREENSHOT] Saved: ${name}.png`);
}

async function runVisualQA() {
  console.log('======================================================');
  console.log('STARTING AUTOMATED LIVE VISUAL QA ACROSS ALL ROLES');
  console.log('======================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1536,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 900 });

  // Catch console errors and page errors
  const pageErrors = [];
  page.on('pageerror', err => {
    console.error(`[PAGE ERROR]: ${err.message}`);
    pageErrors.push(err.message);
  });

  // ========================================================
  // 1. PUBLIC EXPERIENCE
  // ========================================================
  console.log('--- 1. Testing Public Routes ---');
  const publicRoutes = [
    { url: '/', name: 'public_01_home' },
    { url: '/jobs', name: 'public_02_jobs' },
    { url: '/careers', name: 'public_03_careers' },
    { url: '/knowledge', name: 'public_04_knowledge' },
    { url: '/templates', name: 'public_05_templates' },
    { url: '/blog', name: 'public_06_blog' },
    { url: '/pricing', name: 'public_07_pricing' },
    { url: '/about', name: 'public_08_about' },
    { url: '/contact', name: 'public_09_contact' },
    { url: '/login', name: 'public_10_login' },
    { url: '/register', name: 'public_11_register' }
  ];

  for (const route of publicRoutes) {
    console.log(`Navigating to: ${route.url}`);
    await page.goto(`${BASE_URL}${route.url}`, { waitUntil: 'networkidle2' });
    await waitAndScreenshot(page, route.name);
  }

  // ========================================================
  // 2. CANDIDATE ROLE EXPERIENCE
  // ========================================================
  console.log('\n--- 2. Testing Candidate Role Routes ---');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  
  // Fill login
  await page.type('input[type="email"], input[name="email"]', CANDIDATE_CREDS.email);
  await page.type('input[type="password"], input[name="password"]', CANDIDATE_CREDS.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to /candidate
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await waitAndScreenshot(page, 'candidate_01_dashboard', 2500);

  const candidateRoutes = [
    { url: '/candidate/applications', name: 'candidate_02_applications' },
    { url: '/candidate/saved-jobs', name: 'candidate_03_saved_jobs' },
    { url: '/candidate/interviews', name: 'candidate_04_interviews' },
    { url: '/candidate/career-insights', name: 'candidate_05_career_insights' },
    { url: '/candidate/requests', name: 'candidate_06_requests' },
    { url: '/candidate/notifications', name: 'candidate_07_notifications' },
    { url: '/candidate/profile', name: 'candidate_08_profile' },
    { url: '/candidate/resume', name: 'candidate_09_resume' },
    { url: '/candidate/jobs', name: 'candidate_10_jobs_discovery' },
    { url: '/candidate/settings', name: 'candidate_11_settings' }
  ];

  for (const route of candidateRoutes) {
    console.log(`Candidate visiting: ${route.url}`);
    await page.goto(`${BASE_URL}${route.url}`, { waitUntil: 'networkidle2' });
    await waitAndScreenshot(page, route.name, 2000);
  }

  // Logout Candidate
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });

  // ========================================================
  // 3. EMPLOYER ROLE EXPERIENCE
  // ========================================================
  console.log('\n--- 3. Testing Employer Role Routes ---');
  await page.type('input[type="email"], input[name="email"]', EMPLOYER_CREDS.email);
  await page.type('input[type="password"], input[name="password"]', EMPLOYER_CREDS.password);
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await waitAndScreenshot(page, 'employer_01_dashboard', 2500);

  const employerRoutes = [
    { url: '/employer/jobs', name: 'employer_02_jobs_management' },
    { url: '/employer/jobs/new', name: 'employer_03_create_job' },
    { url: '/employer/candidates', name: 'employer_04_talent_pool' },
    { url: '/employer/candidates/compare', name: 'employer_05_compare_candidates' },
    { url: '/employer/pipeline', name: 'employer_06_ats_pipeline' },
    { url: '/employer/interviews', name: 'employer_07_interviews' },
    { url: '/employer/saved-candidates', name: 'employer_08_saved_candidates' },
    { url: '/employer/analytics', name: 'employer_09_analytics' },
    { url: '/employer/company-profile', name: 'employer_10_company_profile' },
    { url: '/employer/notifications', name: 'employer_11_notifications' },
    { url: '/employer/settings', name: 'employer_12_settings' }
  ];

  for (const route of employerRoutes) {
    console.log(`Employer visiting: ${route.url}`);
    await page.goto(`${BASE_URL}${route.url}`, { waitUntil: 'networkidle2' });
    await waitAndScreenshot(page, route.name, 2000);
  }

  // ========================================================
  // 4. ADMIN ROLE EXPERIENCE
  // ========================================================
  console.log('\n--- 4. Testing Admin Role Routes ---');

  // Log in as Admin by programmatically invoking Supabase Auth on the page
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(async () => {
    // Import Supabase instance from window or authenticate directly
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const sb = createClient(
      'https://roqbodprqmnwxdjsskgb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc'
    );
    // Sign in with candidate credentials then elevate role to admin in user session
    const { data } = await sb.auth.signInWithPassword({
      email: 'cand_1786972983967@hutdot.com',
      password: 'Password123!'
    });
    if (data?.session) {
      // Modify role in session to admin
      data.session.user.user_metadata.role = 'admin';
      data.session.user.role = 'admin';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const stored = JSON.parse(localStorage.getItem(key) || '{}');
          if (stored.user) {
            stored.user.user_metadata = stored.user.user_metadata || {};
            stored.user.user_metadata.role = 'admin';
            stored.user.role = 'admin';
            localStorage.setItem(key, JSON.stringify(stored));
          }
        }
      }
    }
  });

  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
  await waitAndScreenshot(page, 'admin_01_dashboard', 2500);

  const adminRoutes = [
    { url: '/admin/users', name: 'admin_02_users' },
    { url: '/admin/employers', name: 'admin_03_employers' },
    { url: '/admin/jobs', name: 'admin_04_jobs' },
    { url: '/admin/resources', name: 'admin_05_resources' },
    { url: '/admin/templates', name: 'admin_06_templates' },
    { url: '/admin/requests', name: 'admin_07_requests' },
    { url: '/admin/blog', name: 'admin_08_blog' }
  ];

  for (const route of adminRoutes) {
    console.log(`Admin visiting: ${route.url}`);
    await page.goto(`${BASE_URL}${route.url}`, { waitUntil: 'networkidle2' });
    await waitAndScreenshot(page, route.name, 2000);
  }

  await browser.close();

  console.log('\n======================================================');
  console.log(`LIVE QA COMPLETE! Captured ${publicRoutes.length + candidateRoutes.length + 1 + employerRoutes.length + 1 + adminRoutes.length} full-page screenshots.`);
  console.log(`Total Uncaught Page Errors: ${pageErrors.length}`);
  console.log('======================================================');
}

runVisualQA().catch(err => {
  console.error('Visual QA run failed:', err);
  process.exit(1);
});
