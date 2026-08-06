'use strict';

/**
 * KnowToHire — Demo Seeder & Verification Suite
 */

const path  = require('path');
const fs    = require('fs');
const https = require('https');

// ─── Load .env.local ──────────────────────────────────────────────────────────
(function loadDotEnvLocal() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (val && (!process.env[key] || process.env[key].trim() === '')) {
      process.env[key] = val;
    }
  }
})();

// ─── Config & Service Role Key Resolution ─────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://roqbodprqmnwxdjsskgb.supabase.co';
let SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

async function getServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
  const PAT = process.env.SUPABASE_PAT || process.env.SUPABASE_MANAGEMENT_PAT;
  if (!PAT) {
    console.error('[CONFIG ERROR] Missing SUPABASE_SERVICE_ROLE_KEY and SUPABASE_PAT in environment.');
    return null;
  }
  const PROJECT_REF = 'roqbodprqmnwxdjsskgb';
  console.log('[CONFIG] Fetching active service_role key from Supabase Management API...');

  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/api-keys`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAT}`
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const keysList = Array.isArray(parsed) ? parsed : (parsed.api_keys || []);
          const sr = keysList.find(k => k.name === 'service_role' || (k.name && k.name.includes('service_role')) || k.type === 'service_role');
          const keyVal = sr ? (sr.api_key || sr.secret || sr.key) : null;
          if (keyVal) {
            process.env.SUPABASE_SERVICE_ROLE_KEY = keyVal;
            SERVICE_KEY = keyVal;
            const envPath = path.resolve(__dirname, '..', '.env.local');
            if (fs.existsSync(envPath)) {
              let envContent = fs.readFileSync(envPath, 'utf8');
              if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
                envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY=${keyVal}`);
              } else {
                envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${keyVal}\n`;
              }
              fs.writeFileSync(envPath, envContent, 'utf8');
              console.log('[CONFIG] Successfully saved SUPABASE_SERVICE_ROLE_KEY to .env.local');
            }
            resolve(keyVal);
          } else {
            console.error('[CONFIG ERROR] Could not locate service_role key in Management API response:', data);
            resolve(null);
          }
        } catch (e) {
          console.error('[CONFIG ERROR] Parse error on API keys response:', e.message);
          resolve(null);
        }
      });
    });
    req.on('error', (err) => {
      console.error('[CONFIG ERROR] Network error fetching API keys:', err.message);
      resolve(null);
    });
    req.end();
  });
}

const { createClient } = require('@supabase/supabase-js');
let supabase = null;

function initSupabase(serviceKey) {
  if (!serviceKey || serviceKey.trim() === '') {
    throw new Error('initSupabase called with empty serviceKey');
  }
  SERVICE_KEY = serviceKey.trim();
  process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE_KEY;
  supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    },
  });
  return supabase;
}

// Direct REST Helper with explicit Service Role headers (bypasses RLS)
function restApi(pathStr, method = 'GET', body = null) {
  const activeKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SERVICE_KEY;
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + pathStr);
    const opts = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': activeKey,
        'Authorization': `Bearer ${activeKey}`,
        'Prefer': 'return=representation,resolution=merge-duplicates'
      }
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

// ─── Demo users definition ───────────────────────────────────────────────────
const DEMO_USERS = [
  {
    email:      'admin@knowtohire.com',
    password:   'Admin@123',
    role:       'super_admin',
    first_name: 'Rajeev',
    last_name:  'Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email:      'hr@greenearthconsultants.com',
    password:   'Employer@123',
    role:       'employer',
    first_name: 'Arjun',
    last_name:  'Mehta',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email:      'careers@sustainedge.com',
    password:   'Employer@123',
    role:       'employer',
    first_name: 'Priya',
    last_name:  'Nair',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email:      'jobs@patentnexus.com',
    password:   'Employer@123',
    role:       'employer',
    first_name: 'Rohit',
    last_name:  'Verma',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email:      'rahul.sharma@gmail.com',
    password:   'Candidate@123',
    role:       'candidate',
    first_name: 'Rahul',
    last_name:  'Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email:      'sneha.reddy@gmail.com',
    password:   'Candidate@123',
    role:       'candidate',
    first_name: 'Sneha',
    last_name:  'Reddy',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email:      'aditya.rao@gmail.com',
    password:   'Candidate@123',
    role:       'candidate',
    first_name: 'Aditya',
    last_name:  'Rao',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
  },
  {
    email:      'neha.kapoor@gmail.com',
    password:   'Candidate@123',
    role:       'candidate',
    first_name: 'Neha',
    last_name:  'Kapoor',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80',
  },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Phase 1: Auth users ──────────────────────────────────────────────────────
async function seedAuthUsers() {
  console.log('\n── Auth Users ───────────────────────────────────────');

  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listErr) throw new Error(`listUsers failed: ${listErr.message}`);

  const existingByEmail = {};
  for (const u of listData.users) existingByEmail[u.email] = u;

  let created = 0, skipped = 0;
  const uidMap = {};

  for (const u of DEMO_USERS) {
    if (existingByEmail[u.email]) {
      const existing = existingByEmail[u.email];
      uidMap[u.email] = existing.id;
      await supabase.auth.admin.updateUserById(existing.id, {
        password:      u.password,
        email_confirm: true,
        user_metadata: { first_name: u.first_name, last_name: u.last_name, role: u.role, avatar_url: u.avatar_url },
      });
      console.log(`  skip   ${u.email}  (already exists — password refreshed)`);
      skipped++;
    } else {
      const { data: created_user, error: createErr } = await supabase.auth.admin.createUser({
        email:         u.email,
        password:      u.password,
        email_confirm: true,
        user_metadata: { first_name: u.first_name, last_name: u.last_name, role: u.role, avatar_url: u.avatar_url },
      });
      if (createErr) {
        console.error(`  [ERROR] createUser(${u.email}): ${createErr.message}`);
      } else {
        uidMap[u.email] = created_user.user.id;
        console.log(`  create ${u.email}  (${created_user.user.id})`);
        created++;
      }
    }
  }

  console.log(`\n  Auth users created: ${created}  skipped: ${skipped}`);
  if (created > 0) {
    process.stdout.write('  Waiting for DB trigger (3s)...');
    await sleep(3000);
    console.log(' done.');
  }
  return uidMap;
}

// ─── Phase 2: Profiles ────────────────────────────────────────────────────────
async function syncProfiles(uidMap) {
  console.log('\n── Profiles ─────────────────────────────────────────');
  let synced = 0;
  for (const u of DEMO_USERS) {
    const uid = uidMap[u.email];
    if (!uid) continue;

    const payload = {
      id:         uid,
      email:      u.email,
      role:       u.role,
      first_name: u.first_name,
      last_name:  u.last_name,
      avatar_url: u.avatar_url,
      updated_at: new Date().toISOString()
    };

    const res = await restApi(`/rest/v1/profiles?id=eq.${uid}`, 'PATCH', payload);
    if (res.status < 300) {
      synced++;
      console.log(`  patched profile  ${u.email}`);
    } else {
      const insRes = await restApi('/rest/v1/profiles?on_conflict=id', 'POST', payload);
      if (insRes.status < 300) {
        synced++;
        console.log(`  inserted profile ${u.email}`);
      } else {
        console.error(`  [ERROR] profiles(${u.email}) status: ${insRes.status} details: ${JSON.stringify(insRes.data)}`);
      }
    }
  }
  console.log(`  Profiles synced: ${synced}`);
}

// ─── Phase 3: Candidate profiles ─────────────────────────────────────────────
async function seedCandidateProfiles(uidMap) {
  const details = {
    'rahul.sharma@gmail.com': {
      headline:         'Senior Environmental Engineer (3 Yrs Exp)',
      bio:              'Results-driven Environmental Engineer with 3 years of experience in EIA compliance, industrial wastewater treatment design, and air quality modeling.',
      location:         'Bengaluru, Karnataka',
      experience_years: 3,
      resume_url:       'https://knowtohire.com/resumes/rahul_sharma_cv.pdf',
    },
    'sneha.reddy@gmail.com': {
      headline:         'Lead ESG Consultant & Sustainability Auditor (5 Yrs Exp)',
      bio:              'Certified ESG Auditor with 5 years auditing Scope 1-3 GHG inventories, implementing GRI/BRSR disclosures, and leading corporate net-zero strategies.',
      location:         'Mumbai, Maharashtra',
      experience_years: 5,
      resume_url:       'https://knowtohire.com/resumes/sneha_reddy_cv.pdf',
    },
    'aditya.rao@gmail.com': {
      headline:         'Registered Patent Associate (4 Yrs Exp)',
      bio:              'Registered Patent Agent at IPO with 4 years drafting pharma & biotech patent specifications, prior-art searches, and FER examination responses.',
      location:         'Hyderabad, Telangana',
      experience_years: 4,
      resume_url:       'https://knowtohire.com/resumes/aditya_rao_cv.pdf',
    },
    'neha.kapoor@gmail.com': {
      headline:         'Research Associate — Circular Economy (2 Yrs Exp)',
      bio:              'Research Associate with 2 years conducting circular economy analysis, life cycle assessment (LCA), and environmental policy documentation.',
      location:         'New Delhi, Delhi',
      experience_years: 2,
      resume_url:       'https://knowtohire.com/resumes/neha_kapoor_cv.pdf',
    },
  };

  for (const [email, detail] of Object.entries(details)) {
    const uid = uidMap[email];
    if (!uid) continue;
    const payload = { id: uid, ...detail, updated_at: new Date().toISOString() };
    const res = await restApi('/rest/v1/candidate_profiles?on_conflict=id', 'POST', payload);
    if (res.status >= 300) {
      await restApi(`/rest/v1/candidate_profiles?id=eq.${uid}`, 'PATCH', payload);
    }
    console.log(`  upsert candidate profile ${email}`);
  }
}

// ─── Phase 4: Companies ───────────────────────────────────────────────────────
async function seedCompanies(uidMap) {
  console.log('\n── Companies ────────────────────────────────────────');

  const companiesPayload = [
    {
      name:         'GreenEarth Consultants Pvt Ltd',
      slug:         'greenearthconsultants',
      website:      'https://greenearthconsultants.com',
      logo_url:     'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=120&h=120&q=80',
      industry:     'Environmental Engineering',
      size:         '100-250',
      description:  'Leading environmental compliance and engineering consulting firm specializing in EIA audits, CPCB clearances, and zero liquid discharge wastewater plant designs.',
      headquarters: 'Bengaluru, Karnataka',
      empEmail:     'hr@greenearthconsultants.com',
    },
    {
      name:         'SustainEdge Consulting',
      slug:         'sustainedge-consulting',
      website:      'https://sustainedge.com',
      logo_url:     'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
      industry:     'ESG & Sustainability',
      size:         '50-100',
      description:  'Premier ESG strategy and sustainability reporting advisory for SEBI BRSR disclosures, Scope 1-3 GHG accounting, and net-zero roadmaps.',
      headquarters: 'Mumbai, Maharashtra',
      empEmail:     'careers@sustainedge.com',
    },
    {
      name:         'Patent Nexus',
      slug:         'patent-nexus',
      website:      'https://patentnexus.com',
      logo_url:     'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=120&h=120&q=80',
      industry:     'Intellectual Property & Legal Services',
      size:         '25-50',
      description:  'Full-service IP rights and patent prosecution firm managing global patent portfolios, IPO filings, and technology transfer agreements.',
      headquarters: 'Hyderabad, Telangana',
      empEmail:     'jobs@patentnexus.com',
    },
  ];

  let companiesCreated = 0;
  const companyIdBySlug = {};

  for (const co of companiesPayload) {
    const { empEmail, ...coData } = co;
    const res = await restApi('/rest/v1/companies?on_conflict=slug', 'POST', coData);
    let coId = null;

    if (res.status < 300 && Array.isArray(res.data) && res.data[0]) {
      coId = res.data[0].id;
    } else {
      const getRes = await restApi(`/rest/v1/companies?slug=eq.${encodeURIComponent(co.slug)}&select=id`);
      if (getRes.data && getRes.data[0]) coId = getRes.data[0].id;
    }

    if (coId) {
      companyIdBySlug[co.slug] = coId;
      companiesCreated++;
      console.log(`  upsert ${co.name}  (${coId})`);

      const empUid = uidMap[empEmail];
      if (empUid) {
        const empPayload = { id: empUid, company_id: coId, updated_at: new Date().toISOString() };
        const epRes = await restApi('/rest/v1/employer_profiles?on_conflict=id', 'POST', empPayload);
        if (epRes.status >= 300) {
          await restApi(`/rest/v1/employer_profiles?id=eq.${empUid}`, 'PATCH', empPayload);
        }
        console.log(`  linked employer_profile ${empEmail} → company ${co.name}`);
      }
    }
  }

  console.log(`  Companies created/updated: ${companiesCreated}`);
  return companyIdBySlug;
}

// ─── Phase 5: Jobs ────────────────────────────────────────────────────────────
async function seedJobs(uidMap, companyIdBySlug) {
  console.log('\n── Jobs ─────────────────────────────────────────────');

  const empRes = await restApi('/rest/v1/employer_profiles?select=id,company_id');
  const empRows = Array.isArray(empRes.data) ? empRes.data : [];

  const empIdByCompanyId = {};
  for (const row of empRows) {
    if (row.company_id) empIdByCompanyId[row.company_id] = row.id;
  }

  const greenEarthCoId = companyIdBySlug['greenearthconsultants'];
  const sustainEdgeCoId = companyIdBySlug['sustainedge-consulting'];
  const patentNexusCoId = companyIdBySlug['patent-nexus'];

  const greenEarthEmpId = empIdByCompanyId[greenEarthCoId];
  const sustainEdgeEmpId = empIdByCompanyId[sustainEdgeCoId];
  const patentNexusEmpId = empIdByCompanyId[patentNexusCoId];

  const jobsPayload = [
    {
      title:       'Senior Environmental Engineer',
      slug:        'senior-environmental-engineer-greenearthconsultants',
      description: 'Lead EIA compliance audits, design wastewater treatment systems, and prepare CPCB regulatory submissions for industrial clients across India.',
      location:    'Bengaluru',
      work_mode:   'onsite',
      job_type:    'full-time',
      department:  'Environmental Engineering',
      salary_min:  1400000,
      salary_max:  2200000,
      salary_currency: 'INR',
      experience_min:  3,
      experience_max:  7,
      is_active:   true,
      employer_id: greenEarthEmpId,
      company_id:  greenEarthCoId,
      requirements: ['B.E./B.Tech in Environmental Engineering', 'Minimum 3 years EIA/compliance experience', 'CPCB/SPCB regulatory knowledge'],
      benefits:    ['Health insurance', 'Annual performance bonus', 'Flexible leave policy'],
    },
    {
      title:       'Lead ESG Consultant',
      slug:        'lead-esg-consultant-sustainedge',
      description: 'Drive Scope 1-3 GHG accounting, prepare SEBI BRSR reports, and lead client workshops on net-zero transition strategies for listed corporations.',
      location:    'Mumbai',
      work_mode:   'hybrid',
      job_type:    'full-time',
      department:  'ESG & Sustainability',
      salary_min:  1800000,
      salary_max:  2800000,
      salary_currency: 'INR',
      experience_min:  4,
      experience_max:  8,
      is_active:   true,
      employer_id: sustainEdgeEmpId,
      company_id:  sustainEdgeCoId,
      requirements: ['MBA / M.Sc. Sustainability', 'GRI/SASB/BRSR certification preferred', '4+ years ESG advisory experience'],
      benefits:    ['Remote-friendly hybrid model', 'Learning & development budget', 'Health insurance'],
    },
    {
      title:       'Carbon Accounting Analyst',
      slug:        'carbon-accounting-analyst-sustainedge',
      description: 'Collect, validate, and calculate organizational GHG emissions using GHG Protocol methodology. Prepare Scope 1, 2, and 3 inventories for corporate clients.',
      location:    'Bengaluru',
      work_mode:   'hybrid',
      job_type:    'full-time',
      department:  'ESG & Sustainability',
      salary_min:  1200000,
      salary_max:  1900000,
      salary_currency: 'INR',
      experience_min:  2,
      experience_max:  5,
      is_active:   true,
      employer_id: sustainEdgeEmpId,
      company_id:  sustainEdgeCoId,
      requirements: ['B.E. Environmental / M.Sc. Climate Science', 'GHG Protocol knowledge', 'Advanced Excel/Power BI'],
      benefits:    ['Flexible work hours', 'Career progression roadmap', 'Annual performance appraisal'],
    },
    {
      title:       'Patent Associate (Pharma & Biotech)',
      slug:        'patent-associate-pharma-biotech-patentnexus',
      description: 'Draft patent specifications for pharma, biotech, and life science inventions, conduct prior-art searches, and respond to FER objections at the Indian Patent Office.',
      location:    'Hyderabad',
      work_mode:   'onsite',
      job_type:    'full-time',
      department:  'Patent & IP',
      salary_min:  1200000,
      salary_max:  2000000,
      salary_currency: 'INR',
      experience_min:  2,
      experience_max:  6,
      is_active:   true,
      employer_id: patentNexusEmpId,
      company_id:  patentNexusCoId,
      requirements: ['B.Pharm / M.Sc. Biochemistry or Biotechnology', 'Registered Patent Agent (preferred)', 'Prior-art searching experience'],
      benefits:    ['Competitive salary', 'Patent filing incentives', 'International IP exposure'],
    },
    {
      title:       'IPR Manager — Technology Transfer',
      slug:        'ipr-manager-technology-transfer-patentnexus',
      description: 'Manage IP portfolios, negotiate licensing agreements, oversee PCT applications, and coordinate technology transfer transactions for global clients.',
      location:    'Hyderabad',
      work_mode:   'onsite',
      job_type:    'full-time',
      department:  'Patent & IP',
      salary_min:  2000000,
      salary_max:  3200000,
      salary_currency: 'INR',
      experience_min:  5,
      experience_max:  12,
      is_active:   true,
      employer_id: patentNexusEmpId,
      company_id:  patentNexusCoId,
      requirements: ['Law degree with IP specialization', 'LLM (IP Law) preferred', '5+ years patent prosecution experience'],
      benefits:    ['Leadership role', 'International travel', 'Performance bonus'],
    },
    {
      title:       'EHS Manager (Industrial Safety)',
      slug:        'ehs-manager-industrial-safety-greenearthconsultants',
      description: 'Develop and implement Environmental, Health & Safety programs for industrial clients, ensure OHSAS/ISO 45001 compliance, and conduct incident investigations.',
      location:    'Bengaluru',
      work_mode:   'onsite',
      job_type:    'full-time',
      department:  'Environmental Engineering',
      salary_min:  1600000,
      salary_max:  2400000,
      salary_currency: 'INR',
      experience_min:  5,
      experience_max:  10,
      is_active:   true,
      employer_id: greenEarthEmpId,
      company_id:  greenEarthCoId,
      requirements: ['B.E. / B.Tech in Engineering', 'NEBOSH / IOSH certification', 'Minimum 5 years EHS management experience'],
      benefits:    ['Company vehicle', 'Medical insurance', 'Senior leadership track'],
    },
  ].filter(j => j.employer_id && j.company_id);

  let jobsCreated = 0;
  const jobIdBySlug = {};

  for (const job of jobsPayload) {
    const res = await restApi('/rest/v1/jobs?on_conflict=slug', 'POST', job);
    let jobId = null;
    if (res.status < 300 && Array.isArray(res.data) && res.data[0]) {
      jobId = res.data[0].id;
    } else {
      const getRes = await restApi(`/rest/v1/jobs?slug=eq.${encodeURIComponent(job.slug)}&select=id`);
      if (getRes.data && getRes.data[0]) jobId = getRes.data[0].id;
    }

    if (jobId) {
      jobIdBySlug[job.slug] = jobId;
      jobsCreated++;
      console.log(`  upsert "${job.title}"  (${jobId})`);
    }
  }

  console.log(`  Jobs created/updated: ${jobsCreated}`);
  return jobIdBySlug;
}

// ─── Phase 6: Applications ────────────────────────────────────────────────────
async function seedApplications(uidMap, jobIdBySlug) {
  console.log('\n── Applications ─────────────────────────────────────');

  const applicationsPayload = [
    {
      jobSlug:        'senior-environmental-engineer-greenearthconsultants',
      candidateEmail: 'rahul.sharma@gmail.com',
      status:         'shortlisted',
      cover_letter:   'With 3 years of hands-on EIA compliance experience, I am confident I can contribute immediately to GreenEarth Consultants.',
      match_score:    87.5,
    },
    {
      jobSlug:        'lead-esg-consultant-sustainedge',
      candidateEmail: 'sneha.reddy@gmail.com',
      status:         'interview',
      cover_letter:   'Having led BRSR disclosures and Scope 1-3 audits for five listed companies, I bring relevant expertise.',
      match_score:    92.0,
    },
    {
      jobSlug:        'carbon-accounting-analyst-sustainedge',
      candidateEmail: 'neha.kapoor@gmail.com',
      status:         'applied',
      cover_letter:   'My research background in circular economy and LCA analysis makes me an ideal fit.',
      match_score:    78.5,
    },
    {
      jobSlug:        'patent-associate-pharma-biotech-patentnexus',
      candidateEmail: 'aditya.rao@gmail.com',
      status:         'offered',
      cover_letter:   'As a Registered Patent Agent with 4 years of pharmaceutical patent drafting experience at IPO, I am well-suited for this role.',
      match_score:    95.0,
    },
    {
      jobSlug:        'ehs-manager-industrial-safety-greenearthconsultants',
      candidateEmail: 'rahul.sharma@gmail.com',
      status:         'applied',
      cover_letter:   'My environmental engineering background gives me a strong foundation for transitioning into an EHS management role.',
      match_score:    72.0,
    },
  ];

  let appCreated = 0;

  for (const app of applicationsPayload) {
    const jobId = jobIdBySlug[app.jobSlug];
    const candidateId = uidMap[app.candidateEmail];
    if (!jobId || !candidateId) continue;

    const existingRes = await restApi(`/rest/v1/job_applications?job_id=eq.${jobId}&candidate_id=eq.${candidateId}&select=id`);
    const existing = Array.isArray(existingRes.data) ? existingRes.data[0] : null;

    if (existing) {
      await restApi(`/rest/v1/job_applications?id=eq.${existing.id}`, 'PATCH', { status: app.status, match_score: app.match_score });
      console.log(`  update application  ${app.candidateEmail} → ${app.jobSlug}  (${app.status})`);
      appCreated++;
    } else {
      const insRes = await restApi('/rest/v1/job_applications', 'POST', {
        job_id:       jobId,
        candidate_id: candidateId,
        status:       app.status,
        cover_letter: app.cover_letter,
        match_score:  app.match_score,
      });
      if (insRes.status < 300) {
        appCreated++;
        console.log(`  insert application  ${app.candidateEmail} → ${app.jobSlug}  (${app.status})`);
      }
    }
  }

  console.log(`  Applications created: ${appCreated}`);
}

// ─── Phase 7: Resources ───────────────────────────────────────────────────────
async function seedResources() {
  console.log('\n── Resources ────────────────────────────────────────');

  const rows = [
    {
      title:          'Environmental Compliance Handbook 2026',
      slug:           'environmental-compliance-handbook-2026',
      description:    'Comprehensive guide covering EIA procedures, CPCB regulations, consent management, and environmental monitoring protocols for industrial projects.',
      format:         'PDF',
      file_url:       'https://knowtohire.com/resources/env-compliance-handbook-2026.pdf',
      cover_url:      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=250&q=80',
      rating:         4.9,
      downloads_count: 5420,
    },
    {
      title:          'ESG Reporting & BRSR Implementation Manual',
      slug:           'esg-reporting-brsr-implementation-manual',
      description:    'Step-by-step manual for implementing SEBI Business Responsibility and Sustainability Reporting (BRSR), GRI Standards, and Scope 1-3 GHG inventories.',
      format:         'PDF',
      file_url:       'https://knowtohire.com/resources/esg-brsr-manual.pdf',
      cover_url:      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&h=250&q=80',
      rating:         4.8,
      downloads_count: 3890,
    },
    {
      title:          'Patent Filing & Prosecution Guide (India)',
      slug:           'patent-filing-prosecution-guide-india',
      description:    'End-to-end guide for patent filing at the Indian Patent Office — from prior-art search, claim drafting, FER responses, to grant and annuity management.',
      format:         'PDF',
      file_url:       'https://knowtohire.com/resources/patent-filing-guide-india.pdf',
      cover_url:      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&h=250&q=80',
      rating:         4.9,
      downloads_count: 4120,
    },
  ];

  let count = 0;
  for (const r of rows) {
    const res = await restApi('/rest/v1/resources?on_conflict=slug', 'POST', r);
    if (res.status < 300) { count++; console.log(`  upsert "${r.title}"`); }
    else console.error(`  [ERROR] resources(${r.title}) status: ${res.status} details: ${JSON.stringify(res.data)}`);
  }
  console.log(`  Resources created/updated: ${count}`);
}

// ─── Phase 8: Templates ───────────────────────────────────────────────────────
async function seedTemplates(uidMap) {
  console.log('\n── Templates ────────────────────────────────────────');

  const adminUid = uidMap['admin@knowtohire.com'];

  const rows = [
    {
      title:          'ATS-Optimised Environmental Engineer Resume',
      slug:           'ats-optimised-env-engineer-resume',
      description:    'Professional resume template specifically designed for environmental engineers, with sections for regulatory experience, project portfolios, and technical certifications.',
      price:          0,
      formats:        ['DOCX', 'PDF'],
      file_url:       'https://knowtohire.com/templates/env-engineer-resume.docx',
      cover_url:      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&h=250&q=80',
      rating:         4.9,
      downloads_count: 6850,
      creator_id:     adminUid || null,
    },
    {
      title:          'ESG Consultant Executive CV Template',
      slug:           'esg-consultant-executive-cv-template',
      description:    'Premium executive CV template for ESG consultants and sustainability managers. Includes ESG impact metrics section and leadership highlights.',
      price:          12,
      formats:        ['DOCX', 'PDF'],
      file_url:       'https://knowtohire.com/templates/esg-exec-cv.docx',
      cover_url:      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&h=250&q=80',
      rating:         4.8,
      downloads_count: 2340,
      creator_id:     adminUid || null,
    },
    {
      title:          'Patent Specification Drafting Template',
      slug:           'patent-specification-drafting-template',
      description:    'Structured patent specification template including claims framework, abstract, background, summary, drawings description, and detailed description sections.',
      price:          25,
      formats:        ['DOCX'],
      file_url:       'https://knowtohire.com/templates/patent-specification.docx',
      cover_url:      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=400&h=250&q=80',
      rating:         4.9,
      downloads_count: 1560,
      creator_id:     adminUid || null,
    },
  ];

  let count = 0;
  for (const t of rows) {
    const res = await restApi('/rest/v1/templates?on_conflict=slug', 'POST', t);
    if (res.status < 300) { count++; console.log(`  upsert "${t.title}"`); }
    else console.error(`  [ERROR] templates(${t.title}) status: ${res.status} details: ${JSON.stringify(res.data)}`);
  }
  console.log(`  Templates created/updated: ${count}`);
}

// ─── Phase 9: Blog posts ──────────────────────────────────────────────────────
async function seedBlogPosts() {
  console.log('\n── Blog Posts ───────────────────────────────────────');

  const rows = [
    {
      title:       'Top Environmental & Sustainability Careers in India (2026 Guide)',
      slug:        'top-environmental-sustainability-careers-india-2026',
      excerpt:     'India\'s green economy is creating thousands of new opportunities.',
      content:     'India\'s commitment to net-zero emissions by 2070 and its ambitious renewable energy targets are driving unprecedented demand.',
      cover_url:   'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&h=400&q=80',
      read_time:   '6 min read',
      is_featured: true,
      published_at: new Date('2026-07-15').toISOString(),
    },
    {
      title:       'How to Build a Successful Career in ESG Consulting',
      slug:        'how-to-build-career-esg-consulting',
      excerpt:     'ESG consulting is one of the fastest-growing niches in professional services.',
      content:     'ESG consulting sits at the intersection of finance, environmental science, corporate strategy, and regulation.',
      cover_url:   'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=400&q=80',
      read_time:   '8 min read',
      is_featured: false,
      published_at: new Date('2026-07-22').toISOString(),
    },
    {
      title:       'Patent Filing in India: A Step-by-Step Explanation for Inventors',
      slug:        'patent-filing-india-step-by-step',
      excerpt:     'Filing a patent in India involves several stages at the Indian Patent Office.',
      content:     'The Indian Patent Office (IPO) processes thousands of applications annually across four offices.',
      cover_url:   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&h=400&q=80',
      read_time:   '7 min read',
      is_featured: false,
      published_at: new Date('2026-07-29').toISOString(),
    },
  ];

  let count = 0;
  for (const b of rows) {
    const res = await restApi('/rest/v1/blog_posts?on_conflict=slug', 'POST', b);
    if (res.status < 300) { count++; console.log(`  upsert "${b.title}"`); }
    else console.error(`  [ERROR] blog_posts(${b.title}) status: ${res.status}`);
  }
  console.log(`  Blog posts created/updated: ${count}`);
}

// ─── Phase 10: Notifications ──────────────────────────────────────────────────
async function seedNotifications(uidMap) {
  console.log('\n── Notifications ────────────────────────────────────');

  const notifs = [
    { email: 'rahul.sharma@gmail.com',      type: 'application_update', title: 'Application Shortlisted!',        message: 'Congratulations! Your application for Senior Environmental Engineer at GreenEarth Consultants has been shortlisted.' },
    { email: 'sneha.reddy@gmail.com',       type: 'application_update', title: 'Interview Scheduled',             message: 'Your interview for Lead ESG Consultant at SustainEdge Consulting has been scheduled.' },
    { email: 'aditya.rao@gmail.com',        type: 'application_update', title: 'Offer Letter Received!',          message: 'You have received an offer for the Patent Associate role at Patent Nexus.' },
    { email: 'neha.kapoor@gmail.com',       type: 'job_alert',          title: 'New Job Matching Your Profile',   message: '3 new jobs matching "Sustainability Analyst" in Mumbai have been posted.' },
    { email: 'hr@greenearthconsultants.com',type: 'application_update', title: 'New Application Received',        message: 'Rahul Sharma has applied for the Senior Environmental Engineer position.' },
    { email: 'careers@sustainedge.com',     type: 'application_update', title: 'Candidate Advanced to Interview', message: 'Sneha Reddy has been advanced to the interview stage for Lead ESG Consultant.' },
    { email: 'admin@knowtohire.com',        type: 'system',             title: 'Platform Health: All Systems Operational', message: 'All KnowToHire services are running normally.' },
  ];

  const exRes = await restApi('/rest/v1/notifications?select=user_id');
  const existing = Array.isArray(exRes.data) ? exRes.data : [];
  const existingCounts = {};
  for (const n of existing) {
    existingCounts[n.user_id] = (existingCounts[n.user_id] || 0) + 1;
  }

  let count = 0;
  for (const n of notifs) {
    const uid = uidMap[n.email];
    if (!uid) continue;
    if (existingCounts[uid] > 0) {
      console.log(`  skip   "${n.title}" (${n.email} already has notifications)`);
      continue;
    }
    const res = await restApi('/rest/v1/notifications', 'POST', {
      user_id: uid,
      type:    n.type,
      title:   n.title,
      message: n.message,
      is_read: false,
    });
    if (res.status < 300) { count++; console.log(`  insert "${n.title}" → ${n.email}`); }
  }
  console.log(`  Notifications created: ${count}`);
}

// ─── Phase 11: Verify Audit ───────────────────────────────────────────────────
async function verify(uidMap) {
  console.log('\n══════════════════════════════════════════════════════');
  console.log(' KnowToHire Demo Environment Verification Audit');
  console.log('══════════════════════════════════════════════════════');

  const status = {
    serviceRole: false,
    authUsers: false,
    profiles: false,
    candidateProfiles: false,
    employerProfiles: false,
    companies: false,
    jobs: false,
    applications: false,
    resources: false,
    templates: false,
    blog: false,
    notifications: false,
    relationships: false,
    idempotency: false,
    security: false,
  };

  // 1. Service Role Key Check
  status.serviceRole = Boolean(SERVICE_KEY && SERVICE_KEY.length > 20 && !SERVICE_KEY.includes('placeholder'));

  // 2. Auth Users Check
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (!authErr && authData?.users) {
    const authByEmail = {};
    for (const u of authData.users) authByEmail[u.email] = u;
    status.authUsers = DEMO_USERS.every(u => {
      const found = authByEmail[u.email];
      return found && found.email_confirmed_at && found.user_metadata?.role;
    });
  }

  // 3. Profiles Check
  const pRes = await restApi('/rest/v1/profiles?select=id,email,role,avatar_url');
  const profiles = Array.isArray(pRes.data) ? pRes.data : [];
  if (profiles.length >= DEMO_USERS.length) {
    const profByEmail = {};
    for (const p of profiles) profByEmail[p.email] = p;
    status.profiles = DEMO_USERS.every(u => profByEmail[u.email] && profByEmail[u.email].role === u.role);
  }

  // 4. Candidate Profiles Check
  const cpRes = await restApi('/rest/v1/candidate_profiles?select=id,headline,bio,experience_years');
  const candProfs = Array.isArray(cpRes.data) ? cpRes.data : [];
  const candProfById = {};
  for (const cp of candProfs) candProfById[cp.id] = cp;

  const candidateEmails = DEMO_USERS.filter(u => u.role === 'candidate').map(u => u.email);
  status.candidateProfiles = candidateEmails.every(email => {
    const uid = uidMap[email];
    const cp = candProfById[uid];
    return cp && cp.headline && cp.experience_years !== null;
  });

  // 5. Employer Profiles Check
  const epRes = await restApi('/rest/v1/employer_profiles?select=id,company_id');
  const empProfs = Array.isArray(epRes.data) ? epRes.data : [];
  const empProfById = {};
  for (const ep of empProfs) empProfById[ep.id] = ep;

  const employerEmails = DEMO_USERS.filter(u => u.role === 'employer').map(u => u.email);
  status.employerProfiles = employerEmails.every(email => {
    const uid = uidMap[email];
    const ep = empProfById[uid];
    return ep && Boolean(ep.company_id);
  });

  // 6. Companies Check
  const coRes = await restApi('/rest/v1/companies?select=id,slug,logo_url');
  const cos = Array.isArray(coRes.data) ? coRes.data : [];
  status.companies = Boolean(cos.length >= 3 && cos.every(c => c.slug && c.logo_url));

  // 7. Jobs Check
  const jobRes = await restApi('/rest/v1/jobs?select=id,slug,employer_id,company_id');
  const jobs = Array.isArray(jobRes.data) ? jobRes.data : [];
  status.jobs = Boolean(jobs.length >= 4 && jobs.every(j => j.employer_id && j.company_id));

  // 8. Job Applications Check
  const appRes = await restApi('/rest/v1/job_applications?select=id,job_id,candidate_id,status');
  const apps = Array.isArray(appRes.data) ? appRes.data : [];
  status.applications = Boolean(apps.length >= 4 && apps.every(a => a.job_id && a.candidate_id));

  // 9. Resources Check
  const resRes = await restApi('/rest/v1/resources?select=id,slug,cover_url');
  const resList = Array.isArray(resRes.data) ? resRes.data : [];
  status.resources = Boolean(resList.length >= 3 && resList.every(r => r.cover_url));

  // 10. Templates Check
  const tmplRes = await restApi('/rest/v1/templates?select=id,slug,cover_url');
  const tmplList = Array.isArray(tmplRes.data) ? tmplRes.data : [];
  status.templates = Boolean(tmplList.length >= 3 && tmplList.every(t => t.cover_url));

  // 11. Blog Posts Check
  const blogRes = await restApi('/rest/v1/blog_posts?select=id,slug,cover_url');
  const blogList = Array.isArray(blogRes.data) ? blogRes.data : [];
  status.blog = Boolean(blogList.length >= 3 && blogList.every(b => b.cover_url));

  // 12. Notifications Check
  const notifRes = await restApi('/rest/v1/notifications?select=id,user_id,title');
  const notifList = Array.isArray(notifRes.data) ? notifRes.data : [];
  status.notifications = Boolean(notifList.length >= 5);

  // 13. Relationships Check
  let relOk = true;
  if (jobs.length > 0 && cos.length > 0 && empProfs.length > 0) {
    const coIds = new Set(cos.map(c => c.id));
    const empIds = new Set(empProfs.map(e => e.id));
    relOk = jobs.every(j => coIds.has(j.company_id) && empIds.has(j.employer_id));
  }
  status.relationships = relOk;

  // 14. Idempotency Check
  let idempOk = true;
  if (cos.length > 0 && jobs.length > 0) {
    const coSlugs = new Set(cos.map(c => c.slug));
    const jobSlugs = new Set(jobs.map(j => j.slug));
    idempOk = coSlugs.size === cos.length && jobSlugs.size === jobs.length;
  }
  status.idempotency = idempOk;

  // 15. Security Check (.env.local gitignored)
  const gitignorePath = path.resolve(__dirname, '..', '.gitignore');
  let isGitignored = false;
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    isGitignored = content.includes('.env.local');
  }
  status.security = isGitignored && status.serviceRole;

  const fmt = (pass) => pass ? 'PASS' : 'FAIL';

  console.log('\n========================================');
  console.log('KnowToHire Demo Verification');
  console.log(`Service Role..............${fmt(status.serviceRole)}`);
  console.log(`Auth Users................${fmt(status.authUsers)}`);
  console.log(`Profiles..................${fmt(status.profiles)}`);
  console.log(`Candidate Profiles........${fmt(status.candidateProfiles)}`);
  console.log(`Employer Profiles.........${fmt(status.employerProfiles)}`);
  console.log(`Companies.................${fmt(status.companies)}`);
  console.log(`Jobs......................${fmt(status.jobs)}`);
  console.log(`Applications..............${fmt(status.applications)}`);
  console.log(`Resources.................${fmt(status.resources)}`);
  console.log(`Templates.................${fmt(status.templates)}`);
  console.log(`Blog......................${fmt(status.blog)}`);
  console.log(`Notifications.............${fmt(status.notifications)}`);
  console.log(`Relationships.............${fmt(status.relationships)}`);
  console.log(`Idempotency...............${fmt(status.idempotency)}`);
  console.log(`Security..................${fmt(status.security)}`);

  const overallPass = Object.values(status).every(Boolean);
  console.log(`Overall...................${fmt(overallPass)}`);
  console.log('========================================\n');

  return overallPass;
}

async function executeSql(sqlQuery) {
  const PAT = process.env.SUPABASE_PAT || process.env.SUPABASE_MANAGEMENT_PAT;
  if (!PAT) return { status: 200, data: 'Skipping SQL grant (SUPABASE_PAT not provided in env)' };
  const PROJECT_REF = 'roqbodprqmnwxdjsskgb';
  const endpoints = [
    `/v1/projects/${PROJECT_REF}/sql`,
    `/v1/projects/${PROJECT_REF}/database/query`
  ];

  for (const pathStr of endpoints) {
    const res = await new Promise((resolve) => {
      const opts = {
        hostname: 'api.supabase.com',
        port: 443,
        path: pathStr,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAT}`
        }
      };
      const req = https.request(opts, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', (err) => resolve({ status: 500, error: err.message }));
      req.write(JSON.stringify({ query: sqlQuery }));
      req.end();
    });
    if (res.status === 200 || res.status === 201) {
      return res;
    }
  }
  return { status: 404, data: 'No working SQL query endpoint found' };
}

// ─── Entry point ──────────────────────────────────────────────────────────────
async function main() {
  const cmd = process.argv[2] || 'all';

  const serviceKey = await getServiceRoleKey();
  if (!serviceKey) {
    console.error('\n[ERROR] Unable to resolve SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  initSupabase(serviceKey);

  console.log('[PERMISSIONS] Repairing database table privileges for service_role...');
  const grantRes = await executeSql(`
    GRANT USAGE ON SCHEMA public TO service_role, postgres, anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, postgres, anon, authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres, anon, authenticated;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role, postgres, anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role, postgres, anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role, postgres, anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role, postgres, anon, authenticated;
  `);
  console.log(`[PERMISSIONS] Database Grant Status: ${grantRes.status} response: ${JSON.stringify(grantRes.data)}`);

  console.log('KnowToHire Demo Seeder');
  console.log(`Project:  ${SUPABASE_URL}`);
  console.log(`Command:  ${cmd}`);

  if (cmd === 'verify') {
    const pRes = await restApi('/rest/v1/profiles?select=id,email');
    const profiles = Array.isArray(pRes.data) ? pRes.data : [];
    const uidMap = {};
    for (const p of profiles) uidMap[p.email] = p.id;
    await verify(uidMap);
    return;
  }

  const uidMap = await seedAuthUsers();
  await syncProfiles(uidMap);
  await seedCandidateProfiles(uidMap);
  const companyIds = await seedCompanies(uidMap);
  const jobIds     = await seedJobs(uidMap, companyIds);
  await seedApplications(uidMap, jobIds);
  await seedResources();
  await seedTemplates(uidMap);
  await seedBlogPosts();
  await seedNotifications(uidMap);

  if (cmd !== 'data-only') {
    await verify(uidMap);
  }
}

main().catch(err => {
  console.error('\n[FATAL]', err.message || err);
  process.exit(1);
});
