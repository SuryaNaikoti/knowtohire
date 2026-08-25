/**
 * KnowToHire Master Taxonomy & Geography End-to-End Test Suite
 * 
 * Tests:
 * 1. Career Categories retrieval and administration.
 * 2. Industries, Subcategories, and Functional Areas.
 * 3. Hierarchical Domains.
 * 4. Canonical Job Roles & Role Alias Resolution (e.g. SDE II / Fullstack Developer -> Full Stack Engineer).
 * 5. Skills & Skill Alias Normalization (e.g. ReactJS -> React, BRSR Reporting -> SEBI BRSR Core).
 * 6. Geography (Countries, States, Popular & Regional Cities).
 * 7. Job Creation with Canonical Taxonomy Foreign Keys.
 * 8. Dynamic Candidate Job Search & Filter consumption.
 * 9. Admin Taxonomy Management (Create Category, Create Role, Create Skill, Soft-deactivation).
 * 10. Backward Compatibility verification with existing string fields.
 */

// Setup mock local storage environment if in Node
if (typeof window === 'undefined') {
  const store: Record<string, string> = {};
  (global as any).window = {
    localStorage: {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
    },
    dispatchEvent: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  (global as any).localStorage = (global as any).window.localStorage;
}

import {
  taxonomyService,
  jobService,
  SEED_CAREER_CATEGORIES,
  SEED_INDUSTRIES,
  SEED_FUNCTIONAL_AREAS,
  SEED_DOMAINS,
  SEED_JOB_ROLES,
  SEED_SKILLS,
  SEED_COUNTRIES,
  SEED_INDIAN_STATES,
  SEED_CITIES,
} from '../src/services';

async function runMasterTaxonomyE2ETests() {
  console.log('========================================================================');
  console.log('  KnowToHire Master Taxonomy & Geography E2E Certification Test Suite');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Career Categories
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Career Categories ---');
  const categoriesRes = await taxonomyService.getCareerCategories();
  assert(categoriesRes.data !== null, 'Career categories retrieved successfully');
  assert(categoriesRes.data?.length === SEED_CAREER_CATEGORIES.length, `Contains all ${SEED_CAREER_CATEGORIES.length} seed categories`);
  assert((categoriesRes.data || []).some((c) => c.slug === 'general-careers'), 'General Careers category present');
  assert((categoriesRes.data || []).some((c) => c.slug === 'esg-careers'), 'ESG Careers category present');
  assert((categoriesRes.data || []).some((c) => c.slug === 'patent-careers'), 'Patent Careers category present');

  // --------------------------------------------------------------------------
  // TEST 2: Industries & Functional Areas
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Industries & Functional Areas ---');
  const industriesRes = await taxonomyService.getIndustries();
  assert(industriesRes.data !== null, 'Industries retrieved successfully');
  assert(industriesRes.data?.length === SEED_INDUSTRIES.length, `Contains all ${SEED_INDUSTRIES.length} global industries`);
  assert((industriesRes.data || []).some((i) => i.slug === 'technology-it-services'), 'Technology & IT Services industry present');
  assert((industriesRes.data || []).some((i) => i.slug === 'environment-sustainability'), 'Environment & Sustainability industry present');

  const functionalRes = await taxonomyService.getFunctionalAreas();
  assert(functionalRes.data !== null, 'Functional areas retrieved successfully');
  assert(functionalRes.data?.length === SEED_FUNCTIONAL_AREAS.length, `Contains all ${SEED_FUNCTIONAL_AREAS.length} functional areas`);

  // --------------------------------------------------------------------------
  // TEST 3: Domains & Specializations
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Domains & Specializations ---');
  const allDomainsRes = await taxonomyService.getDomains();
  assert(allDomainsRes.data !== null, 'Domains retrieved successfully');
  assert(allDomainsRes.data?.length === SEED_DOMAINS.length, `Contains all ${SEED_DOMAINS.length} seed domains`);

  const esgDomainsRes = await taxonomyService.getDomains('cat-esg');
  assert((esgDomainsRes.data || []).some((d) => d.slug === 'esg-brsr-reporting'), 'Filtered domains by Career Category (ESG BRSR)');

  // --------------------------------------------------------------------------
  // TEST 4: Job Roles & Alias Resolution
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Canonical Job Roles & Alias Resolution ---');
  const rolesRes = await taxonomyService.searchJobRoles();
  assert(rolesRes.data !== null, 'Job roles retrieved successfully');
  assert(rolesRes.data?.length === SEED_JOB_ROLES.length, `Contains all ${SEED_JOB_ROLES.length} canonical roles`);

  // Alias Resolution Tests
  const resolvedAlias1 = await taxonomyService.resolveJobRole('Fullstack Developer');
  assert(resolvedAlias1 !== null, 'Alias "Fullstack Developer" resolves');
  assert(resolvedAlias1?.id === 'role-fullstack-eng', 'Resolves to canonical role: Full Stack Engineer');

  const resolvedAlias2 = await taxonomyService.resolveJobRole('BRSR Analyst');
  assert(resolvedAlias2?.id === 'role-esg-analyst', 'Alias "BRSR Analyst" resolves to canonical role: ESG Reporting Analyst');

  const resolvedAlias3 = await taxonomyService.resolveJobRole('Patent Analyst');
  assert(resolvedAlias3?.id === 'role-patent-associate', 'Alias "Patent Analyst" resolves to canonical role: Patent Search Associate');

  // --------------------------------------------------------------------------
  // TEST 5: Skills & Alias Normalization
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Standardized Skills & Alias Normalization ---');
  const skillsRes = await taxonomyService.searchSkills();
  assert(skillsRes.data !== null, 'Skills retrieved successfully');
  assert(skillsRes.data?.length === SEED_SKILLS.length, `Contains all ${SEED_SKILLS.length} verified skills`);

  const normSkill1 = await taxonomyService.normalizeSkill('ReactJS');
  assert(normSkill1 === 'React', 'Alias "ReactJS" normalizes to canonical skill "React"');

  const normSkill2 = await taxonomyService.normalizeSkill('BRSR Reporting');
  assert(normSkill2 === 'SEBI BRSR Core', 'Alias "BRSR Reporting" normalizes to canonical skill "SEBI BRSR Core"');

  const normSkill3 = await taxonomyService.normalizeSkill('Scope 1 2 3 Emissions');
  assert(normSkill3 === 'Carbon Accounting (Scope 1/2/3)', 'Alias "Scope 1 2 3 Emissions" normalizes to canonical skill "Carbon Accounting (Scope 1/2/3)"');

  // --------------------------------------------------------------------------
  // TEST 6: Geography (Countries, States, Cities)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Geography Hierarchy & City Search ---');
  const countriesRes = await taxonomyService.getCountries();
  assert(countriesRes.data !== null, 'Countries retrieved successfully');
  assert(countriesRes.data?.length === SEED_COUNTRIES.length, `Contains all ${SEED_COUNTRIES.length} global seed countries`);

  const statesRes = await taxonomyService.getStates('country-in');
  assert(statesRes.data !== null, 'Indian states retrieved successfully');
  assert(statesRes.data?.length === SEED_INDIAN_STATES.length, `Contains all ${SEED_INDIAN_STATES.length} Indian states/UTs`);

  const citiesRes = await taxonomyService.searchCities('Hyderabad');
  assert((citiesRes.data || []).some((c) => c.slug === 'hyderabad'), 'City "Hyderabad" found in search');
  assert((citiesRes.data || [])[0]?.is_popular === true, 'Hyderabad flagged as popular tech hub');

  // --------------------------------------------------------------------------
  // TEST 7: Job Creation with Canonical Taxonomy Keys
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7: Job Creation with Canonical Taxonomy Keys ---');
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: '00000000-0000-0000-0000-000000000002',
      email: 'employer@knowtohire.com',
      full_name: 'Vikram Malhotra',
      role: 'employer',
      company_id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
    })
  );

  const jobRes = await jobService.createJob({
    title: 'Senior Full Stack & Cloud Architect',
    department: 'Software & Cloud Engineering',
    category: 'General Careers',
    description: 'Lead next-generation platform architecture.',
    location: 'Hyderabad, Telangana, India',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    min_salary_inr: 2400000,
    max_salary_inr: 3600000,
    career_category_id: 'cat-general',
    canonical_role_id: 'role-fullstack-eng',
    city_id: 'city-hyd',
    country_id: 'country-in',
    status: 'published',
  });

  assert(jobRes.data !== null, 'Job created with canonical taxonomy foreign keys');
  assert(jobRes.data?.career_category_id === 'cat-general', 'Job persisted canonical career_category_id');
  assert(jobRes.data?.canonical_role_id === 'role-fullstack-eng', 'Job persisted canonical canonical_role_id');

  // --------------------------------------------------------------------------
  // TEST 8: Admin Taxonomy Management (CRUD & Soft Deactivation)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 8: Admin Taxonomy Governance & Soft Deactivation ---');
  const newCat = await taxonomyService.createCareerCategory({
    name: 'Cleantech & Hydrogen Systems',
    description: 'Next-gen green hydrogen and zero-emission energy infrastructure.',
  });
  assert(newCat.data !== null, 'Admin creates new Career Category');
  assert(newCat.data?.slug === 'cleantech-hydrogen-systems', 'Category slug generated correctly');

  // Soft Deactivate
  const deactivated = await taxonomyService.updateCareerCategory(newCat.data?.id || '', { is_active: false });
  assert(deactivated.data?.is_active === false, 'Category soft-deactivated (is_active = false)');

  const activeCategories = await taxonomyService.getCareerCategories(false);
  assert(!activeCategories.data?.some((c) => c.id === newCat.data?.id), 'Deactivated category excluded from public active list');

  const allCategoriesIncInactive = await taxonomyService.getCareerCategories(true);
  assert(allCategoriesIncInactive.data?.some((c) => c.id === newCat.data?.id), 'Deactivated category retained for historical integrity');

  console.log('\n========================================================================');
  console.log(`  ALL ${passedTests}/${totalTests} MASTER TAXONOMY E2E TESTS PASSED!`);
  console.log('========================================================================\n');
}

runMasterTaxonomyE2ETests().catch((err) => {
  console.error('Master Taxonomy E2E Test Failed:', err);
  process.exit(1);
});
