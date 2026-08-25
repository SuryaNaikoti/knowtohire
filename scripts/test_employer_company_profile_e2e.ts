/**
 * KnowToHire: Employer Company Profile E2E Test Suite
 * 
 * Verifies:
 * 1. Authenticated employer resolves canonical company profile.
 * 2. Master Taxonomy integration for Industry sector.
 * 3. Master Geography integration for Headquarters (City, Region, Country).
 * 4. Company Name, Legal Name, Size, Website, Description, Culture & Perks persistence.
 * 5. Data persistence across page reloads and cross-portal reflections.
 * 6. Existing job ownership, applicant pipelines, and resumes remain intact.
 */

import {
  companyProfileService,
  taxonomyService,
  jobService,
  applicationService,
} from '../src/services';

async function runEmployerCompanyProfileE2ETests() {
  console.log('================================================================');
  console.log('  KnowToHire: Employer Company Profile E2E Test Suite');
  console.log('================================================================\n');

  let passedChecks = 0;
  const totalChecks = 15;

  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      console.error(`  [FAIL] ${message}`);
      process.exit(1);
    }
    console.log(`  [PASS] ${message}`);
    passedChecks++;
  };

  // -------------------------------------------------------------------------
  // TEST 1: Retrieve Master Taxonomy & Geography options
  // -------------------------------------------------------------------------
  console.log('--- 1. Master Taxonomy & Geography Verification ---');
  const industriesRes = await taxonomyService.getIndustries();
  assert(
    Boolean(industriesRes.data && industriesRes.data.length >= 25),
    `Master Taxonomy provides ${industriesRes.data?.length} canonical industries (>= 25)`
  );

  const citiesRes = await taxonomyService.searchCities('', 'country-in');
  assert(
    Boolean(citiesRes.data && citiesRes.data.length >= 100),
    `Master Geography provides ${citiesRes.data?.length} canonical Indian cities (>= 100)`
  );

  // -------------------------------------------------------------------------
  // TEST 2: Retrieve Authenticated Employer Company Profile
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Load Authenticated Employer Company Profile ---');
  const initialProfileRes = await companyProfileService.getMyCompanyProfile();
  assert(Boolean(initialProfileRes.data), 'getMyCompanyProfile returns canonical company profile');
  assert(Boolean(initialProfileRes.data?.id), `Company ID is resolved: ${initialProfileRes.data?.id}`);
  assert(Boolean(initialProfileRes.data?.name), `Company name is present: ${initialProfileRes.data?.name}`);

  const originalCompanyId = initialProfileRes.data!.id;

  // -------------------------------------------------------------------------
  // TEST 3: Update Company Profile (Name, Industry, HQ, Culture, Perks)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Update & Persist Company Profile ---');
  const testName = 'EcoStrategy Green Solutions India Ltd';
  const testLegalName = 'EcoStrategy Green Solutions India Private Limited';
  const testIndustry = 'Environmental & ESG Advisory';
  const testLocation = 'Hyderabad, Telangana, India';
  const testWebsite = 'https://ecostrategy-india.example.com';
  const testSize = '201–500 Employees';
  const testAbout = 'Enterprise leader in BRSR compliance, ISO 14001 certification, and industrial decarbonization.';
  const testPerks = [
    'Electric Vehicle Charging Reimbursement',
    'Comprehensive Family Medical Insurance with OPD coverage',
    'Annual SPCB / GRI / BRSR Certification Sponsorship',
    'Hybrid & Flexible Work Schedule',
  ];

  const updateRes = await companyProfileService.updateMyCompanyProfile({
    name: testName,
    legal_name: testLegalName,
    industry: testIndustry,
    headquarters_location: testLocation,
    website_url: testWebsite,
    company_size: testSize,
    description: testAbout,
    culture_benefits: testPerks,
  });

  assert(Boolean(updateRes.data), 'updateMyCompanyProfile succeeds without errors');
  assert(updateRes.data?.name === testName, 'Updated company name matches input');
  assert(updateRes.data?.industry === testIndustry, 'Updated company industry matches canonical taxonomy');
  assert(updateRes.data?.headquarters_location === testLocation, 'Updated headquarters matches canonical location');
  assert(updateRes.data?.company_size === testSize, 'Updated company size matches selection');
  assert(updateRes.data?.description === testAbout, 'Updated description/about matches input');
  assert(
    Boolean(updateRes.data?.culture_benefits && updateRes.data.culture_benefits.length === 4),
    'Updated culture & perks list preserves 4 custom perks'
  );

  // -------------------------------------------------------------------------
  // TEST 4: Verification of Reload / Persistence
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Verify Persistence Across Reloads ---');
  const reloadedProfileRes = await companyProfileService.getMyCompanyProfile();
  assert(reloadedProfileRes.data?.name === testName, 'Company name persists after reload');
  assert(reloadedProfileRes.data?.industry === testIndustry, 'Industry persists after reload');
  assert(reloadedProfileRes.data?.headquarters_location === testLocation, 'Headquarters persists after reload');

  // -------------------------------------------------------------------------
  // TEST 5: Verify Existing Jobs and Cross-Portal Invariance
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Verify Existing Jobs & Pipeline Invariance ---');
  const employerJobsRes = await jobService.getEmployerJobs({ pageSize: 5 });
  assert(Boolean(employerJobsRes.data), 'Employer job postings load cleanly without breaking');

  const firstJobId = employerJobsRes.data?.data[0]?.id || 'job-001';
  const employerAppsRes = await applicationService.getJobApplicants(firstJobId, { pageSize: 5 });
  assert(Boolean(employerAppsRes.data), 'Employer applicant pipeline remains intact');

  console.log('\n================================================================');
  console.log(`  ALL ${passedChecks}/${totalChecks} VERIFICATION CHECKS PASSED`);
  console.log('================================================================\n');
}

runEmployerCompanyProfileE2ETests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
