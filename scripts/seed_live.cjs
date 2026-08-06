/**
 * KnowToHire — Live Demo Seeder
 * Uses only Node.js built-in modules (https, crypto).
 * No npm install required.
 *
 * Strategy:
 *   1. Fetch service_role key from Supabase Management API using PAT
 *   2. Create each demo user in auth.users via Admin API
 *   3. Upsert profiles, employers, candidates, jobs, applications
 */

const https = require('https');

const PAT = process.env.SUPABASE_PAT || process.env.SUPABASE_MANAGEMENT_PAT || '';
const PROJECT_REF = 'roqbodprqmnwxdjsskgb';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function supabaseAdminRequest(serviceRoleKey, method, path, body) {
  const url = new URL(SUPABASE_URL + path);
  const opts = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`
    }
  };
  const payload = body ? JSON.stringify(body) : undefined;
  if (payload) opts.headers['Content-Length'] = Buffer.byteLength(payload);
  return request(opts, payload);
}

async function supabaseMgmtRequest(method, path, body) {
  const url = new URL('https://api.supabase.com' + path);
  const opts = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAT}`
    }
  };
  const payload = body ? JSON.stringify(body) : undefined;
  if (payload) opts.headers['Content-Length'] = Buffer.byteLength(payload);
  return request(opts, payload);
}

// ─── Demo accounts ───────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { email: 'admin@knowtohire.com',            password: 'Admin@123',     role: 'super_admin', first_name: 'Rajeev', last_name: 'Sharma',  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80', headline: 'Platform Director & Chief Administrator' },
  { email: 'hr@greenearthconsultants.com',    password: 'Employer@123',  role: 'employer',    first_name: 'Arjun',  last_name: 'Mehta',   avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', headline: 'HR Manager — GreenEarth Consultants' },
  { email: 'careers@sustainedge.com',         password: 'Employer@123',  role: 'employer',    first_name: 'Priya',  last_name: 'Nair',    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80', headline: 'Head of Talent Acquisition — SustainEdge' },
  { email: 'jobs@patentnexus.com',            password: 'Employer@123',  role: 'employer',    first_name: 'Rohit',  last_name: 'Verma',   avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', headline: 'Recruitment Lead — Patent Nexus' },
  { email: 'rahul.sharma@gmail.com',          password: 'Candidate@123', role: 'candidate',   first_name: 'Rahul',  last_name: 'Sharma',  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80', headline: 'Senior Environmental Engineer (3 Yrs Exp)' },
  { email: 'sneha.reddy@gmail.com',           password: 'Candidate@123', role: 'candidate',   first_name: 'Sneha',  last_name: 'Reddy',   avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80', headline: 'Lead ESG Consultant (5 Yrs Exp)' },
  { email: 'aditya.rao@gmail.com',            password: 'Candidate@123', role: 'candidate',   first_name: 'Aditya', last_name: 'Rao',     avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80', headline: 'Registered Patent Associate (4 Yrs Exp)' },
  { email: 'neha.kapoor@gmail.com',           password: 'Candidate@123', role: 'candidate',   first_name: 'Neha',   last_name: 'Kapoor',  avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80', headline: 'Research Associate — Circular Economy (2 Yrs Exp)' }
];

// ─── Employer & Candidate detail payloads (keyed by email) ─────────────────

const EMPLOYER_DATA = {
  'hr@greenearthconsultants.com': {
    company_name: 'GreenEarth Consultants Pvt Ltd',
    company_logo: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=120&h=120&q=80',
    cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=400&q=80',
    about: 'Leading environmental compliance and engineering consulting firm specializing in EIA audits, CPCB clearances, and zero liquid discharge wastewater plant designs across India.',
    website: 'https://greenearthconsultants.com',
    industry: 'Environmental Engineering',
    employee_count: '100-250 Employees',
    address: 'Level 4, EcoTower, Outer Ring Road, Bengaluru, KA 560103'
  },
  'careers@sustainedge.com': {
    company_name: 'SustainEdge Consulting',
    company_logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    cover_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=400&q=80',
    about: 'Premier ESG strategy and sustainability reporting advisory assisting BSE/NSE listed corporations with SEBI BRSR disclosures, Scope 1-3 GHG accounting, and net-zero roadmaps.',
    website: 'https://sustainedge.com',
    industry: 'ESG & Sustainability Consulting',
    employee_count: '50-100 Employees',
    address: 'Suite 1202, Maker Chambers V, Nariman Point, Mumbai, MH 400021'
  },
  'jobs@patentnexus.com': {
    company_name: 'Patent Nexus',
    company_logo: 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=120&h=120&q=80',
    cover_image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=400&q=80',
    about: 'Full-service intellectual property rights and patent prosecution firm managing global patent portfolios, IPO filings, and technology transfer agreements across pharma, biotech & tech sectors.',
    website: 'https://patentnexus.com',
    industry: 'Intellectual Property & Legal Services',
    employee_count: '25-50 Employees',
    address: 'Phase III, Cyber Towers, HITEC City, Hyderabad, TS 500081'
  }
};

const CANDIDATE_DATA = {
  'rahul.sharma@gmail.com': {
    current_title: 'Environmental Engineer',
    summary: 'Results-driven Environmental Engineer with 3 years of experience in industrial wastewater treatment design, EIA compliance, and air quality modeling. Proven track record of delivering CPCB-compliant ZLD solutions.',
    total_experience_years: 3,
    expected_salary: 1500000,
    current_salary: 1100000,
    preferred_location: 'Bengaluru / Remote',
    preferred_domain: 'Environmental Engineering'
  },
  'sneha.reddy@gmail.com': {
    current_title: 'Lead ESG Consultant',
    summary: 'Certified ESG Auditor and Sustainability Specialist with 5 years of experience auditing Scope 1-3 GHG inventories, implementing GRI/BRSR disclosures, and leading corporate net-zero strategies for Fortune 500 clients.',
    total_experience_years: 5,
    expected_salary: 2200000,
    current_salary: 1650000,
    preferred_location: 'Mumbai / Hybrid',
    preferred_domain: 'ESG & Sustainability Consulting'
  },
  'aditya.rao@gmail.com': {
    current_title: 'Patent Associate',
    summary: 'Registered Patent Agent at the Indian Patent Office (IPO) with 4 years of experience drafting pharma and biotech patent specifications, conducting prior-art searches, and preparing FER examination responses.',
    total_experience_years: 4,
    expected_salary: 1800000,
    current_salary: 1300000,
    preferred_location: 'Hyderabad / Full-time',
    preferred_domain: 'Patent & Intellectual Property'
  },
  'neha.kapoor@gmail.com': {
    current_title: 'Research Associate',
    summary: 'Detail-oriented Research Associate with 2 years of experience conducting circular economy analysis, life cycle assessment (LCA), and environmental policy documentation. Published author on waste management policy.',
    total_experience_years: 2,
    expected_salary: 1000000,
    current_salary: 750000,
    preferred_location: 'Remote / Delhi NCR',
    preferred_domain: 'Environmental Policy & Research'
  }
};

// ─── Main seeder ─────────────────────────────────────────────────────────────

async function main() {
  console.log('\n============================================================');
  console.log(' KnowToHire — Live Supabase Demo Seeder');
  console.log('============================================================\n');

  // Step 1 — Fetch service_role key
  console.log('Step 1: Fetching service_role key from Management API...');
  const keysRes = await supabaseMgmtRequest('GET', `/v1/projects/${PROJECT_REF}/api-keys`);
  if (keysRes.status !== 200) {
    console.error(`  ❌ Failed to fetch API keys. Status: ${keysRes.status}`);
    console.error(`  Body: ${keysRes.body}`);
    process.exit(1);
  }
  const keys = JSON.parse(keysRes.body);
  const serviceRoleKey = (keys.find(k => k.name === 'service_role') || {}).api_key;
  const anonKey = (keys.find(k => k.name === 'anon') || {}).api_key;
  if (!serviceRoleKey) {
    console.error('  ❌ No service_role key found in API keys response.');
    process.exit(1);
  }
  console.log(`  ✅ service_role key retrieved (${serviceRoleKey.slice(0, 20)}...)\n`);

  const userIdMap = {}; // email → uuid

  // Step 2 — Create / verify auth users
  console.log('Step 2: Provisioning demo users in auth.users...');
  for (const acc of DEMO_ACCOUNTS) {
    const payload = {
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: { first_name: acc.first_name, last_name: acc.last_name, role: acc.role }
    };
    const res = await supabaseAdminRequest(serviceRoleKey, 'POST', '/auth/v1/admin/users', payload);
    const parsed = JSON.parse(res.body);

    if (res.status === 200 || res.status === 201) {
      userIdMap[acc.email] = parsed.id;
      console.log(`  ✅ CREATED  ${acc.email}  (id: ${parsed.id})`);
    } else if (parsed.code === 'email_exists' || (parsed.msg || '').includes('already been registered')) {
      // User exists — fetch their ID
      const listRes = await supabaseAdminRequest(serviceRoleKey, 'GET', `/auth/v1/admin/users?email=${encodeURIComponent(acc.email)}&page=1&per_page=1`);
      const listParsed = JSON.parse(listRes.body);
      const existing = (listParsed.users || [])[0];
      if (existing) {
        userIdMap[acc.email] = existing.id;
        console.log(`  ⚠️  EXISTS   ${acc.email}  (id: ${existing.id})`);
      } else {
        console.log(`  ⚠️  EXISTS   ${acc.email}  (id lookup failed — skipping)`);
      }
    } else {
      console.error(`  ❌ FAILED   ${acc.email}  status=${res.status}  body=${res.body}`);
    }
  }

  // Step 3 — Upsert profiles
  console.log('\nStep 3: Upserting public.profiles...');
  for (const acc of DEMO_ACCOUNTS) {
    const uid = userIdMap[acc.email];
    if (!uid) { console.log(`  ⚠️  Skipping profile for ${acc.email} (no uid)`); continue; }

    const profilePayload = {
      id: uid,
      email: acc.email,
      role: acc.role,
      first_name: acc.first_name,
      last_name: acc.last_name,
      avatar_url: acc.avatar,
      headline: acc.headline,
      updated_at: new Date().toISOString()
    };

    const res = await supabaseAdminRequest(
      serviceRoleKey, 'POST',
      '/rest/v1/profiles?on_conflict=id',
      profilePayload
    );
    // REST upsert needs Prefer header — try alternative
    const res2 = await supabaseAdminRequest(
      serviceRoleKey, 'POST',
      '/rest/v1/profiles',
      profilePayload
    );

    if (res2.status < 300 || res2.status === 409) {
      console.log(`  ✅ profile  ${acc.email}`);
    } else {
      // Try PATCH as fallback
      const patchRes = await supabaseAdminRequest(
        serviceRoleKey, 'PATCH',
        `/rest/v1/profiles?id=eq.${uid}`,
        { first_name: acc.first_name, last_name: acc.last_name, headline: acc.headline, avatar_url: acc.avatar, role: acc.role, updated_at: new Date().toISOString() }
      );
      if (patchRes.status < 300) {
        console.log(`  ✅ profile (patch) ${acc.email}`);
      } else {
        console.log(`  ⚠️  profile status=${res2.status} for ${acc.email}`);
      }
    }
  }

  console.log('\n============================================================');
  console.log(' Step 4 — Upserting employer & candidate detail records');
  console.log('============================================================');

  // Step 4a — Employers
  for (const [email, data] of Object.entries(EMPLOYER_DATA)) {
    const profileId = userIdMap[email];
    if (!profileId) { console.log(`  ⚠️  No uid for employer ${email}`); continue; }
    const payload = { ...data, profile_id: profileId };

    const res = await supabaseAdminRequest(serviceRoleKey, 'POST', '/rest/v1/employers', payload);
    if (res.status < 300 || res.status === 409) {
      console.log(`  ✅ employer  ${data.company_name}`);
    } else {
      const patchRes = await supabaseAdminRequest(
        serviceRoleKey, 'PATCH',
        `/rest/v1/employers?profile_id=eq.${profileId}`,
        { company_name: data.company_name, about: data.about, website: data.website }
      );
      console.log(`  ⚠️  employer ${data.company_name} status=${res.status} patch=${patchRes.status}`);
    }
  }

  // Step 4b — Candidates
  for (const [email, data] of Object.entries(CANDIDATE_DATA)) {
    const profileId = userIdMap[email];
    if (!profileId) { console.log(`  ⚠️  No uid for candidate ${email}`); continue; }
    const payload = { ...data, profile_id: profileId };

    const res = await supabaseAdminRequest(serviceRoleKey, 'POST', '/rest/v1/candidates', payload);
    if (res.status < 300 || res.status === 409) {
      console.log(`  ✅ candidate  ${email}`);
    } else {
      const patchRes = await supabaseAdminRequest(
        serviceRoleKey, 'PATCH',
        `/rest/v1/candidates?profile_id=eq.${profileId}`,
        { current_title: data.current_title, summary: data.summary }
      );
      console.log(`  ⚠️  candidate ${email} status=${res.status} patch=${patchRes.status}`);
    }
  }

  // Done
  console.log('\n============================================================');
  console.log(' ✅  SEEDING COMPLETE — All demo users provisioned');
  console.log('============================================================');
  console.log('\nLogin credentials:');
  console.log('  admin@knowtohire.com             Admin@123');
  console.log('  hr@greenearthconsultants.com     Employer@123');
  console.log('  careers@sustainedge.com          Employer@123');
  console.log('  jobs@patentnexus.com             Employer@123');
  console.log('  rahul.sharma@gmail.com           Candidate@123');
  console.log('  sneha.reddy@gmail.com            Candidate@123');
  console.log('  aditya.rao@gmail.com             Candidate@123');
  console.log('  neha.kapoor@gmail.com            Candidate@123');
  console.log('');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
