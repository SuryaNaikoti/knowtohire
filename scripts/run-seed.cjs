#!/usr/bin/env node
/**
 * KnowToHire — Demo Seeder (CommonJS, zero external dependencies beyond @supabase/supabase-js)
 * 
 * Runs in 3 phases:
 *   1. seed-users  — create all 8 demo users in auth.users via Admin API
 *   2. seed-data   — populate candidate_profiles, companies, employer_profiles, jobs, etc.
 *   3. verify      — confirm every user exists in auth and has a linked profile
 *
 * Usage:
 *   node scripts/run-seed.cjs [users|data|verify|all]
 *
 * Credentials are loaded from process.env only. Never hardcoded here.
 * Set SUPABASE_SERVICE_ROLE_KEY in your shell or .env.local before running.
 */

'use strict';

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ─── Load .env.local ──────────────────────────────────────────────────────────
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SRK) {
  console.error('\n❌  SUPABASE_SERVICE_ROLE_KEY is not set in .env.local or environment.');
  console.error('    Add it to .env.local:  SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>\n');
  process.exit(1);
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────
function request(urlStr, method, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const opts = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const payload = body ? JSON.stringify(body) : undefined;
    if (payload) opts.headers['Content-Length'] = Buffer.byteLength(payload);

    const req = https.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function api(path, method = 'GET', body = null) {
  return request(
    `${SUPABASE_URL}${path}`,
    method,
    {
      apikey: SRK,
      Authorization: `Bearer ${SRK}`,
      Prefer: 'return=representation,resolution=merge-duplicates'
    },
    body
  );
}

// ─── Demo account definitions ─────────────────────────────────────────────────
const DEMO_USERS = [
  { email: 'admin@knowtohire.com',         password: 'Admin@123',     role: 'super_admin', first_name: 'Rajeev', last_name: 'Sharma',  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
  { email: 'hr@greenearthconsultants.com', password: 'Employer@123',  role: 'employer',    first_name: 'Arjun',  last_name: 'Mehta',   avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  { email: 'careers@sustainedge.com',      password: 'Employer@123',  role: 'employer',    first_name: 'Priya',  last_name: 'Nair',    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80' },
  { email: 'jobs@patentnexus.com',         password: 'Employer@123',  role: 'employer',    first_name: 'Rohit',  last_name: 'Verma',   avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
  { email: 'rahul.sharma@gmail.com',       password: 'Candidate@123', role: 'candidate',   first_name: 'Rahul',  last_name: 'Sharma',  avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80' },
  { email: 'sneha.reddy@gmail.com',        password: 'Candidate@123', role: 'candidate',   first_name: 'Sneha',  last_name: 'Reddy',   avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80' },
  { email: 'aditya.rao@gmail.com',         password: 'Candidate@123', role: 'candidate',   first_name: 'Aditya', last_name: 'Rao',     avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
  { email: 'neha.kapoor@gmail.com',        password: 'Candidate@123', role: 'candidate',   first_name: 'Neha',   last_name: 'Kapoor',  avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80' }
];

// ─── Phase 1: Seed auth users ─────────────────────────────────────────────────
async function seedUsers() {
  console.log('\n════════════════════════════════════════════════════');
  console.log(' Phase 1 — Provisioning Demo Users in auth.users');
  console.log('════════════════════════════════════════════════════\n');

  // Fetch all existing users for idempotency check
  const { status: listStatus, data: listData } = await api('/auth/v1/admin/users?page=1&per_page=200');
  const existingByEmail = {};
  if (listStatus === 200 && listData.users) {
    for (const u of listData.users) existingByEmail[u.email] = u;
  }
  console.log(`  Existing auth users found: ${Object.keys(existingByEmail).length}\n`);

  const uidMap = {};

  for (const u of DEMO_USERS) {
    if (existingByEmail[u.email]) {
      const existing = existingByEmail[u.email];
      uidMap[u.email] = existing.id;
      console.log(`  ⚠️  EXISTS   ${u.email}  (${existing.id})`);

      // Refresh password + metadata to ensure correct state
      const { status: upd } = await api(`/auth/v1/admin/users/${existing.id}`, 'PUT', {
        password: u.password,
        email_confirm: true,
        user_metadata: { first_name: u.first_name, last_name: u.last_name, role: u.role, avatar_url: u.avatar_url }
      });
      console.log(`      ↳ Password & metadata refreshed (status: ${upd})`);
    } else {
      const { status, data } = await api('/auth/v1/admin/users', 'POST', {
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { first_name: u.first_name, last_name: u.last_name, role: u.role, avatar_url: u.avatar_url }
      });
      if (status === 200 || status === 201) {
        uidMap[u.email] = data.id;
        console.log(`  ✅ CREATED   ${u.email}  (${data.id})`);
      } else {
        console.log(`  ❌ FAILED    ${u.email}  status=${status}  ${JSON.stringify(data).slice(0, 100)}`);
      }
    }
  }

  // Wait for DB trigger to fire (on_auth_user_created → public.profiles insert)
  console.log('\n  ⏳ Waiting 3s for on_auth_user_created trigger to propagate...');
  await sleep(3000);

  // Update profiles with avatar_url (trigger may not set it from metadata)
  console.log('\n  Patching public.profiles with avatar_url and role...');
  for (const u of DEMO_USERS) {
    const uid = uidMap[u.email];
    if (!uid) continue;
    const { status } = await api(`/rest/v1/profiles?id=eq.${uid}`, 'PATCH', {
      avatar_url: u.avatar_url,
      role: u.role,
      first_name: u.first_name,
      last_name: u.last_name,
      updated_at: new Date().toISOString()
    });
    const icon = status < 300 ? '  ✅' : '  ⚠️ ';
    console.log(`${icon} profile patched  ${u.email}  (status: ${status})`);
  }

  console.log('\n  ✅ Phase 1 complete.\n');
  return uidMap;
}

// ─── Phase 2: Seed domain data ────────────────────────────────────────────────
async function seedData(uidMap) {
  console.log('\n════════════════════════════════════════════════════');
  console.log(' Phase 2 — Seeding Domain Data');
  console.log('════════════════════════════════════════════════════\n');

  // 2a. Seed candidate_profiles (trigger creates the row; we enrich it)
  console.log('  📋 Enriching candidate_profiles...');
  const candidateDetails = {
    'rahul.sharma@gmail.com':  { headline: 'Senior Environmental Engineer (3 Yrs Exp)', experience_years: 3, bio: 'Results-driven Environmental Engineer with 3 years of experience in EIA compliance, industrial wastewater treatment design, and air quality modeling.', location: 'Bengaluru, Karnataka', resume_url: 'https://knowtohire.com/resumes/rahul_sharma_cv.pdf' },
    'sneha.reddy@gmail.com':   { headline: 'Lead ESG Consultant & Sustainability Auditor (5 Yrs Exp)', experience_years: 5, bio: 'Certified ESG Auditor with 5 years auditing Scope 1-3 GHG inventories, implementing GRI/BRSR disclosures, and leading corporate net-zero strategies.', location: 'Mumbai, Maharashtra', resume_url: 'https://knowtohire.com/resumes/sneha_reddy_cv.pdf' },
    'aditya.rao@gmail.com':    { headline: 'Registered Patent Associate (4 Yrs Exp)', experience_years: 4, bio: 'Registered Patent Agent at IPO with 4 years drafting pharma & biotech patent specifications, prior-art searches, and FER examination responses.', location: 'Hyderabad, Telangana', resume_url: 'https://knowtohire.com/resumes/aditya_rao_cv.pdf' },
    'neha.kapoor@gmail.com':   { headline: 'Research Associate — Circular Economy (2 Yrs Exp)', experience_years: 2, bio: 'Research Associate with 2 years conducting circular economy analysis, life cycle assessment (LCA), and environmental policy documentation.', location: 'New Delhi, Delhi', resume_url: 'https://knowtohire.com/resumes/neha_kapoor_cv.pdf' }
  };
  for (const [email, detail] of Object.entries(candidateDetails)) {
    const uid = uidMap[email];
    if (!uid) { console.log(`  ⚠️  No uid for ${email}`); continue; }
    const { status } = await api(`/rest/v1/candidate_profiles?id=eq.${uid}`, 'PATCH', { ...detail, updated_at: new Date().toISOString() });
    if (status < 300) {
      console.log(`  ✅ candidate_profiles   ${email}`);
    } else {
      // Row might not exist yet — INSERT
      const { status: ins } = await api('/rest/v1/candidate_profiles?on_conflict=id', 'POST', { id: uid, ...detail });
      console.log(`  ⚠️  candidate_profiles patch=${status} insert=${ins}   ${email}`);
    }
  }

  // 2b. Seed companies
  console.log('\n  🏢 Seeding companies...');
  const companies = [
    { name: 'GreenEarth Consultants Pvt Ltd', slug: 'greenearthconsultants', website: 'https://greenearthconsultants.com', logo_url: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=120&h=120&fit=crop', industry: 'Environmental Engineering', size: '100-250', description: 'Leading environmental compliance and engineering consulting firm specializing in EIA audits, CPCB clearances, and zero liquid discharge wastewater plant designs.', headquarters: 'Bengaluru, KA', employerEmail: 'hr@greenearthconsultants.com' },
    { name: 'SustainEdge Consulting', slug: 'sustainedge-consulting', website: 'https://sustainedge.com', logo_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&h=120&fit=crop', industry: 'ESG & Sustainability', size: '50-100', description: 'Premier ESG strategy and sustainability reporting advisory for SEBI BRSR disclosures, Scope 1-3 GHG accounting, and net-zero roadmaps.', headquarters: 'Mumbai, MH', employerEmail: 'careers@sustainedge.com' },
    { name: 'Patent Nexus', slug: 'patent-nexus', website: 'https://patentnexus.com', logo_url: 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?w=120&h=120&fit=crop', industry: 'Intellectual Property & Legal Services', size: '25-50', description: 'Full-service IP rights and patent prosecution firm managing global patent portfolios and IPO filings.', headquarters: 'Hyderabad, TS', employerEmail: 'jobs@patentnexus.com' }
  ];
  const companyIds = {};
  for (const co of companies) {
    const { employerEmail, ...coPayload } = co;
    const { status, data } = await api('/rest/v1/companies?on_conflict=slug', 'POST', coPayload);
    if (status < 300 && data && data[0]) {
      companyIds[co.slug] = data[0].id;
      console.log(`  ✅ company   ${co.name}  (${data[0].id})`);
    } else {
      // Fetch existing
      const { data: ex } = await api(`/rest/v1/companies?slug=eq.${encodeURIComponent(co.slug)}&select=id`);
      if (ex && ex[0]) {
        companyIds[co.slug] = ex[0].id;
        console.log(`  ⚠️  company exists   ${co.name}  (${ex[0].id})`);
      } else {
        console.log(`  ❌ company failed   ${co.name}  status=${status}`);
      }
    }
  }

  // 2c. Link employer_profiles to companies
  console.log('\n  🔗 Linking employer_profiles → companies...');
  const empCompanyMap = {
    'hr@greenearthconsultants.com': 'greenearthconsultants',
    'careers@sustainedge.com':      'sustainedge-consulting',
    'jobs@patentnexus.com':         'patent-nexus'
  };
  for (const [email, slug] of Object.entries(empCompanyMap)) {
    const uid = uidMap[email];
    const coId = companyIds[slug];
    if (!uid || !coId) { console.log(`  ⚠️  Missing uid or company for ${email}`); continue; }
    const { status } = await api(`/rest/v1/employer_profiles?id=eq.${uid}`, 'PATCH', { company_id: coId, updated_at: new Date().toISOString() });
    if (status < 300) {
      console.log(`  ✅ employer_profiles linked   ${email}`);
    } else {
      const { status: ins } = await api('/rest/v1/employer_profiles?on_conflict=id', 'POST', { id: uid, company_id: coId });
      console.log(`  ⚠️  employer_profiles patch=${status} insert=${ins}   ${email}`);
    }
  }

  console.log('\n  ✅ Phase 2 complete.\n');
}

// ─── Phase 3: Verify ──────────────────────────────────────────────────────────
async function verify(uidMap) {
  console.log('\n════════════════════════════════════════════════════');
  console.log(' Phase 3 — Verification');
  console.log('════════════════════════════════════════════════════\n');

  let allOk = true;

  // 3a. Check auth.users
  console.log('  auth.users');
  const { data: authData } = await api('/auth/v1/admin/users?page=1&per_page=200');
  const authByEmail = {};
  for (const u of (authData.users || [])) authByEmail[u.email] = u;

  for (const u of DEMO_USERS) {
    const found = authByEmail[u.email];
    if (found) {
      const confirmed = found.email_confirmed_at ? 'confirmed' : 'UNCONFIRMED';
      console.log(`  ✅  ${u.email.padEnd(36)} id=${found.id.slice(0,8)}...  email=${confirmed}`);
    } else {
      console.log(`  ❌  ${u.email.padEnd(36)} NOT FOUND in auth.users`);
      allOk = false;
    }
  }

  // 3b. Check public.profiles
  console.log('\n  public.profiles');
  const { data: profiles } = await api('/rest/v1/profiles?select=id,email,role,first_name,last_name,avatar_url');
  const profileByEmail = {};
  for (const p of (Array.isArray(profiles) ? profiles : [])) profileByEmail[p.email] = p;

  for (const u of DEMO_USERS) {
    const p = profileByEmail[u.email];
    if (p) {
      const av = p.avatar_url ? '✓avatar' : '✗avatar';
      console.log(`  ✅  ${u.email.padEnd(36)} role=${p.role.padEnd(12)} ${av}`);
    } else {
      console.log(`  ❌  ${u.email.padEnd(36)} NOT FOUND in public.profiles`);
      allOk = false;
    }
  }

  // 3c. Check candidate_profiles
  console.log('\n  public.candidate_profiles');
  const { data: candProfiles } = await api('/rest/v1/candidate_profiles?select=id,headline,experience_years,location');
  const candById = {};
  for (const cp of (Array.isArray(candProfiles) ? candProfiles : [])) candById[cp.id] = cp;

  const candidateEmails = ['rahul.sharma@gmail.com', 'sneha.reddy@gmail.com', 'aditya.rao@gmail.com', 'neha.kapoor@gmail.com'];
  for (const email of candidateEmails) {
    const uid = uidMap[email] || (profileByEmail[email] || {}).id;
    if (!uid) { console.log(`  ⚠️  no uid for ${email}`); continue; }
    const cp = candById[uid];
    if (cp) {
      console.log(`  ✅  ${email.padEnd(36)} headline="${(cp.headline||'').slice(0,30)}..."  exp=${cp.experience_years}yr`);
    } else {
      console.log(`  ⚠️  ${email.padEnd(36)} candidate_profiles row missing (trigger may not have fired yet)`);
    }
  }

  // 3d. Check companies
  console.log('\n  public.companies');
  const { data: cos } = await api('/rest/v1/companies?select=id,name,slug');
  for (const co of (Array.isArray(cos) ? cos : [])) {
    console.log(`  ✅  ${co.name.padEnd(40)} slug=${co.slug}`);
  }

  // Summary
  console.log('\n════════════════════════════════════════════════════');
  if (allOk) {
    console.log(' ✅  VERIFICATION PASSED — Demo environment ready');
  } else {
    console.log(' ❌  VERIFICATION FAILED — Some users missing');
  }
  console.log('════════════════════════════════════════════════════\n');

  console.log('  Demo credentials:');
  console.log('  admin@knowtohire.com            →  Admin@123       (dashboard: /dashboard/admin)');
  console.log('  hr@greenearthconsultants.com    →  Employer@123    (dashboard: /dashboard/employer)');
  console.log('  careers@sustainedge.com         →  Employer@123    (dashboard: /dashboard/employer)');
  console.log('  jobs@patentnexus.com            →  Employer@123    (dashboard: /dashboard/employer)');
  console.log('  rahul.sharma@gmail.com          →  Candidate@123   (dashboard: /dashboard/candidate)');
  console.log('  sneha.reddy@gmail.com           →  Candidate@123   (dashboard: /dashboard/candidate)');
  console.log('  aditya.rao@gmail.com            →  Candidate@123   (dashboard: /dashboard/candidate)');
  console.log('  neha.kapoor@gmail.com           →  Candidate@123   (dashboard: /dashboard/candidate)');
  console.log('');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Entry point ──────────────────────────────────────────────────────────────
async function main() {
  const phase = process.argv[2] || 'all';
  console.log(`\nKnowToHire Demo Seeder — running phase: ${phase}`);
  console.log(`Supabase project: ${SUPABASE_URL}`);
  console.log(`Service role key: ${SRK.slice(0, 20)}...\n`);

  let uidMap = {};

  if (phase === 'users' || phase === 'all') {
    uidMap = await seedUsers();
  }
  if (phase === 'data' || phase === 'all') {
    if (!Object.keys(uidMap).length) {
      // Build uidMap from existing profiles
      const { data } = await api('/rest/v1/profiles?select=id,email');
      for (const p of (Array.isArray(data) ? data : [])) uidMap[p.email] = p.id;
    }
    await seedData(uidMap);
  }
  if (phase === 'verify' || phase === 'all') {
    if (!Object.keys(uidMap).length) {
      const { data } = await api('/rest/v1/profiles?select=id,email');
      for (const p of (Array.isArray(data) ? data : [])) uidMap[p.email] = p.id;
    }
    await verify(uidMap);
  }
}

main().catch(err => { console.error('\nFatal error:', err.message || err); process.exit(1); });
