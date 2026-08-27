/**
 * KnowToHire: Employer Candidates Module (/employer/candidates) E2E Certification Suite
 * 
 * Tests & Certifies:
 * 1. Candidate Talent Discovery listing & canonical profile data hydration.
 * 2. Search functionality (name, partial, skill, domain, empty).
 * 3. Specialization filter.
 * 4. Experience & notice period filtering.
 * 5. Sorting modes.
 * 6. Single candidate detail profile lookup.
 * 7. Candidate comparison selection & integrity.
 * 8. Multi-tenant privacy & discoverability.
 * 9. SAVE CANDIDATE — identity persistence & hydration (CRITICAL).
 * 10. SAVED CANDIDATES — profile data integrity.
 * 11. UNSAVE CANDIDATE — removal & cleanup.
 * 12. CROSS-MODULE IDENTITY CONSISTENCY.
 */

import {
  candidateDiscoveryService,
  savedCandidateService,
  taxonomyService,
  DiscoverableCandidate,
} from '../src/services';

async function runEmployerCandidatesE2ETestSuite() {
  console.log('========================================================================');
  console.log('  KnowToHire: Employer Candidates Module (/employer/candidates) E2E Suite');
  console.log('========================================================================\n');

  // Setup mock local storage environment if in Node
  const sessionStore: Record<string, string> = {};
  const localStore: Record<string, string> = {
    kth_demo_auth_session: JSON.stringify({
      id: '00000000-0000-0000-0000-000000000002',
      role: 'employer',
      company_id: 'fa97faee-1cdf-41e6-a151-f51c7fa4c396',
      email: 'employer@ecostrategy.in',
    }),
    'kth_demo_cand_profile_00000000-0000-0000-0000-000000000001': JSON.stringify({
      headline: 'Senior Full Stack & Cloud Solutions Engineer',
      domainSpecialization: 'Engineering & Technology Advisory',
      location: 'Hyderabad, Telangana',
      skills: ['React & TypeScript', 'Node.js & API Architecture', 'Cloud Infrastructure (AWS/GCP)', 'BRSR Reporting'],
      experienceYears: 6,
      noticePeriodDays: 30,
      expectedSalary: 1800000,
      isDiscoverable: true,
      isActive: true,
    }),
  };

  if (typeof window === 'undefined') {
    (global as any).window = {
      localStorage: {
        getItem: (k: string) => localStore[k] || null,
        setItem: (k: string, v: string) => { localStore[k] = v; },
        removeItem: (k: string) => { delete localStore[k]; },
      },
      sessionStorage: {
        getItem: (k: string) => sessionStore[k] || null,
        setItem: (k: string, v: string) => { sessionStore[k] = v; },
        removeItem: (k: string) => { delete sessionStore[k]; },
      },
      dispatchEvent: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    (global as any).localStorage = (global as any).window.localStorage;
    (global as any).sessionStorage = (global as any).window.sessionStorage;
  }

  let passedCount = 0;

  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      console.error(`  [FAIL] ${message}`);
      process.exit(1);
    }
    console.log(`  [PASS] ${message}`);
    passedCount++;
  };

  // -------------------------------------------------------------------------
  // 1. CANDIDATE TALENT DISCOVERY LISTING & HYDRATION
  // -------------------------------------------------------------------------
  console.log('--- 1. Candidate Talent Discovery & Hydration ---');
  const initialRes = await candidateDiscoveryService.searchCandidates();
  assert(Boolean(initialRes.data && initialRes.data.length > 0), 'Candidates loaded from talent discovery pool');

  const cand1 = initialRes.data![0];
  assert(Boolean(cand1.id), 'Candidate has canonical profile ID');
  assert(Boolean(cand1.name), 'Candidate has name hydrated');
  assert(cand1.name !== 'Candidate', 'Candidate name is NOT the generic fallback');
  assert(Boolean(cand1.headline), 'Candidate has headline hydrated');
  assert(Boolean(cand1.location), 'Candidate has location hydrated');
  assert(cand1.location !== 'India' || cand1.name === 'Candidate', 'Candidate location is NOT the generic fallback');
  assert(typeof cand1.experienceYears === 'number', 'Candidate has numeric experience years');
  assert(typeof cand1.profileCompletion === 'number', 'Candidate has profile completion percentage');
  assert(Array.isArray(cand1.skills) && cand1.skills.length > 0, 'Candidate has skills array');

  // -------------------------------------------------------------------------
  // 2. SEARCH FUNCTIONALITY
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Search Functionality (Name, Skill, Domain) ---');
  const nameSearch = await candidateDiscoveryService.searchCandidates({ search: cand1.name });
  assert(
    Boolean(nameSearch.data?.some((c) => c.id === cand1.id)),
    `Exact name search finds candidate "${cand1.name}"`
  );

  const partialName = cand1.name.slice(0, 4);
  const partialSearch = await candidateDiscoveryService.searchCandidates({ search: partialName });
  assert(
    Boolean(partialSearch.data?.some((c) => c.id === cand1.id)),
    `Partial name search "${partialName}" matches candidate`
  );

  const skillSearch = await candidateDiscoveryService.searchCandidates({ search: 'React' });
  assert(
    Boolean(skillSearch.data?.every((c) => c.skills.some((s) => s.toLowerCase().includes('react')) || c.headline.toLowerCase().includes('react'))),
    'Skill search filters results accurately by skill/headline keyword'
  );

  const emptySearch = await candidateDiscoveryService.searchCandidates({ search: 'nonexistent_candidate_query_xyz' });
  assert(emptySearch.data?.length === 0, 'Nonexistent search returns empty candidate array');

  // -------------------------------------------------------------------------
  // 3. SPECIALIZATION FILTERING
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Specialization / Domain Filtering ---');
  const categoriesRes = await taxonomyService.getCareerCategories();
  assert(Boolean(categoriesRes.data && categoriesRes.data.length >= 8), 'Career categories loaded from taxonomy');

  const domainSearch = await candidateDiscoveryService.searchCandidates({ domain: 'Engineering' });
  assert(
    Boolean(domainSearch.data?.every((c) => c.domain.toLowerCase().includes('engineering'))),
    'Domain filter accurately limits candidates to Engineering specialization'
  );

  const allDomainSearch = await candidateDiscoveryService.searchCandidates({ domain: 'all' });
  assert(
    Boolean(allDomainSearch.data && allDomainSearch.data.length >= domainSearch.data!.length),
    'Resetting domain to "all" restores the eligible candidate pool'
  );

  // -------------------------------------------------------------------------
  // 4. EXPERIENCE & NOTICE PERIOD FILTERING
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Experience & Notice Period Filtering ---');
  const exp3Search = await candidateDiscoveryService.searchCandidates({ minExperience: 3 });
  assert(
    Boolean(exp3Search.data?.every((c) => c.experienceYears >= 3)),
    'Min experience filter (3+ yrs) returns only candidates with >= 3 years experience'
  );

  const exp8Search = await candidateDiscoveryService.searchCandidates({ minExperience: 8 });
  assert(
    Boolean(exp8Search.data?.every((c) => c.experienceYears >= 8)),
    'Min experience filter (8+ yrs) returns only senior candidates'
  );

  const notice30Search = await candidateDiscoveryService.searchCandidates({ maxNoticeDays: 30 });
  assert(
    Boolean(notice30Search.data?.every((c) => c.noticePeriodDays <= 30)),
    'Max notice filter (<= 30 days) returns fast joiners'
  );

  // -------------------------------------------------------------------------
  // 5. SORTING MODES
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Candidate Sorting Modes ---');
  const sortExpHigh = await candidateDiscoveryService.searchCandidates({ sortBy: 'experience_high' });
  const expList = sortExpHigh.data!.map((c) => c.experienceYears);
  const isExpSortedDesc = expList.every((val, i, arr) => i === 0 || arr[i - 1] >= val);
  assert(isExpSortedDesc, 'Sort: Experience High-to-Low orders descending');

  const sortSalaryLow = await candidateDiscoveryService.searchCandidates({ sortBy: 'salary_low' });
  const salaryList = sortSalaryLow.data!.map((c) => c.expectedSalaryINR);
  const isSalarySortedAsc = salaryList.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
  assert(isSalarySortedAsc, 'Sort: Expected CTC Low-to-High orders ascending');

  const sortNoticeFast = await candidateDiscoveryService.searchCandidates({ sortBy: 'notice_fast' });
  const noticeList = sortNoticeFast.data!.map((c) => c.noticePeriodDays);
  const isNoticeSortedAsc = noticeList.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
  assert(isNoticeSortedAsc, 'Sort: Immediate Joiners orders by ascending notice period');

  // -------------------------------------------------------------------------
  // 6. SINGLE CANDIDATE DETAIL & QUICK VIEW PROFILE LOOKUP
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Single Candidate Detail & Quick View Profile Lookup ---');
  const singleCandRes = await candidateDiscoveryService.getCandidateById(cand1.id);
  assert(Boolean(singleCandRes.data && singleCandRes.data.id === cand1.id), 'Candidate profile loaded by ID');
  assert(singleCandRes.data?.name === cand1.name, 'Candidate profile name matches discovery listing');
  assert(singleCandRes.data?.location === cand1.location, 'Candidate profile location matches discovery listing');
  assert(singleCandRes.data?.headline === cand1.headline, 'Candidate profile headline matches discovery listing');

  // Quick View Screening Snapshot Attributes Integrity
  assert(typeof singleCandRes.data?.profileCompletion === 'number', 'Quick View: Candidate has numeric profile completion');
  assert(typeof singleCandRes.data?.experienceYears === 'number', 'Quick View: Candidate has numeric experience years');
  assert(Boolean(singleCandRes.data?.domain), 'Quick View: Candidate has domain specialization');
  assert(typeof singleCandRes.data?.expectedSalaryINR === 'number', 'Quick View: Candidate has expected salary');
  assert(typeof singleCandRes.data?.noticePeriodDays === 'number', 'Quick View: Candidate has notice period days');
  assert(Array.isArray(singleCandRes.data?.skills) && singleCandRes.data.skills.length > 0, 'Quick View: Candidate has verified skills');
  assert(Boolean(singleCandRes.data?.bio || singleCandRes.data?.experienceSummary), 'Quick View: Candidate has professional summary');
  assert(Array.isArray(singleCandRes.data?.experienceList), 'Quick View: Candidate has experience array');
  assert(Array.isArray(singleCandRes.data?.educationList), 'Quick View: Candidate has education array');

  // -------------------------------------------------------------------------
  // 7. CANDIDATE COMPARISON SELECTION & INTEGRITY
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Candidate Comparison Selection & Integrity ---');
  const compareIds = [cand1.id];
  window.sessionStorage.setItem('kth_compare_candidate_ids', JSON.stringify(compareIds));

  const storedCompareRaw = window.sessionStorage.getItem('kth_compare_candidate_ids');
  assert(Boolean(storedCompareRaw), 'Comparison candidate IDs persisted in sessionStorage');
  const parsedCompare = JSON.parse(storedCompareRaw!);
  assert(parsedCompare.includes(cand1.id), 'Selected candidate ID is present in comparison session');

  const compareProfiles: DiscoverableCandidate[] = [];
  for (const cid of parsedCompare) {
    const res = await candidateDiscoveryService.getCandidateById(cid);
    if (res.data) compareProfiles.push(res.data);
  }
  assert(compareProfiles.length === 1, 'Comparison workspace hydrates exactly 1 selected candidate');
  assert(compareProfiles[0].id === cand1.id, 'Hydrated comparison candidate has matching canonical ID');

  // -------------------------------------------------------------------------
  // 8. MULTI-TENANT PRIVACY & CANDIDATE DISCOVERABILITY SETTINGS
  // -------------------------------------------------------------------------
  console.log('\n--- 8. Multi-Tenant Privacy & Candidate Discoverability Settings ---');
  const candSettingsKey = `kth_demo_cand_profile_${cand1.id}`;
  const candSettings = JSON.parse(window.localStorage.getItem(candSettingsKey) || '{}');
  candSettings.isDiscoverable = false;
  window.localStorage.setItem(candSettingsKey, JSON.stringify(candSettings));

  const hiddenSearch = await candidateDiscoveryService.searchCandidates();
  assert(
    !hiddenSearch.data?.some((c) => c.id === cand1.id),
    'Non-discoverable candidate is completely hidden from employer discovery'
  );

  candSettings.isDiscoverable = true;
  window.localStorage.setItem(candSettingsKey, JSON.stringify(candSettings));

  const visibleSearch = await candidateDiscoveryService.searchCandidates();
  assert(
    Boolean(visibleSearch.data?.some((c) => c.id === cand1.id)),
    'Candidate becomes visible again when discoverability is enabled'
  );

  // -------------------------------------------------------------------------
  // 9. SAVE CANDIDATE — IDENTITY PERSISTENCE & HYDRATION (CRITICAL)
  // -------------------------------------------------------------------------
  console.log('\n--- 9. Save Candidate — Identity Persistence & Hydration ---');

  // Clean up any prior saved candidates
  await savedCandidateService.unsaveCandidate(cand1.id);

  // Save the candidate
  const saveRes = await savedCandidateService.saveCandidate(cand1.id);
  assert(Boolean(saveRes.data), 'Save candidate succeeds');
  assert(saveRes.data!.candidate_id === cand1.id, 'Saved record contains correct canonical candidate_id');

  // Verify company scoping
  const demoAuth = JSON.parse(window.localStorage.getItem('kth_demo_auth_session') || '{}');
  assert(saveRes.data!.company_id === demoAuth.company_id, 'Saved record has correct company_id (employer isolation)');
  assert(saveRes.data!.employer_id === demoAuth.id, 'Saved record has correct employer_id');

  // CRITICAL: Verify the hydrated candidate profile
  assert(Boolean(saveRes.data!.candidate), 'Saved record includes hydrated candidate profile');
  assert(saveRes.data!.candidate!.full_name === cand1.name, `Saved candidate name is "${cand1.name}", NOT a fallback`);
  assert(saveRes.data!.candidate!.full_name !== 'Candidate', 'Saved candidate name is NOT the generic "Candidate" fallback');

  // Verify duplicate save prevention
  const dupeSaveRes = await savedCandidateService.saveCandidate(cand1.id);
  assert(Boolean(dupeSaveRes.data), 'Duplicate save does not error');
  const myListAfterDupe = await savedCandidateService.getMySavedCandidates();
  const dupeCount = myListAfterDupe.data!.filter((r) => r.candidate_id === cand1.id).length;
  assert(dupeCount === 1, 'Duplicate save does NOT create duplicate records');

  // Verify isCandidateSaved
  const isSavedRes = await savedCandidateService.isCandidateSaved(cand1.id);
  assert(isSavedRes.data === true, 'isCandidateSaved returns true for saved candidate');

  // -------------------------------------------------------------------------
  // 10. SAVED CANDIDATES — PROFILE DATA INTEGRITY (CRITICAL)
  // -------------------------------------------------------------------------
  console.log('\n--- 10. Saved Candidates Page — Profile Data Integrity ---');

  const mySavedRes = await savedCandidateService.getMySavedCandidates();
  assert(Boolean(mySavedRes.data && mySavedRes.data.length > 0), 'getMySavedCandidates returns non-empty list');

  const savedRecord = mySavedRes.data!.find((r) => r.candidate_id === cand1.id);
  assert(Boolean(savedRecord), 'Saved record for target candidate exists in list');
  assert(savedRecord!.candidate_id === cand1.id, 'Saved record candidate_id matches canonical ID');

  // CRITICAL IDENTITY VERIFICATION — This is the user-reported defect
  const savedName = savedRecord!.candidate?.full_name;
  const savedHeadline = savedRecord!.candidate?.candidate_profile?.headline;
  const savedLocation = savedRecord!.candidate?.candidate_profile?.location;
  const savedSkills = savedRecord!.candidate?.candidate_profile?.skills;

  assert(Boolean(savedName), 'Saved candidate has hydrated full_name');
  assert(savedName !== 'Candidate', `Saved candidate name "${savedName}" is NOT the fallback "Candidate"`);
  assert(savedName === cand1.name, `Saved candidate name "${savedName}" matches discovery name "${cand1.name}"`);

  assert(Boolean(savedHeadline), 'Saved candidate has hydrated headline');
  assert(savedHeadline !== 'Sustainability Specialist', `Saved candidate headline "${savedHeadline}" is NOT the fallback`);
  assert(savedHeadline === cand1.headline, `Saved candidate headline matches discovery headline`);

  assert(Boolean(savedLocation), 'Saved candidate has hydrated location');
  assert(savedLocation !== 'India' || cand1.location === 'India', `Saved candidate location "${savedLocation}" is NOT the fallback (or candidate is actually in India)`);
  assert(savedLocation === cand1.location, `Saved candidate location "${savedLocation}" matches discovery location "${cand1.location}"`);

  assert(Array.isArray(savedSkills) && savedSkills.length > 0, 'Saved candidate has hydrated skills array');

  // -------------------------------------------------------------------------
  // 11. UNSAVE CANDIDATE — REMOVAL & CLEANUP
  // -------------------------------------------------------------------------
  console.log('\n--- 11. Unsave Candidate — Removal & Cleanup ---');

  const unsaveRes = await savedCandidateService.unsaveCandidate(cand1.id);
  assert(unsaveRes.data === true, 'Unsave candidate succeeds');

  const isSavedAfterUnsave = await savedCandidateService.isCandidateSaved(cand1.id);
  assert(isSavedAfterUnsave.data === false, 'isCandidateSaved returns false after unsave');

  const savedListAfterUnsave = await savedCandidateService.getMySavedCandidates();
  const removedRecord = savedListAfterUnsave.data!.find((r) => r.candidate_id === cand1.id);
  assert(!removedRecord, 'Unsaved candidate no longer appears in saved candidates list');

  // Re-save to verify re-save works
  const reSaveRes = await savedCandidateService.saveCandidate(cand1.id);
  assert(Boolean(reSaveRes.data), 'Re-save after unsave succeeds');
  assert(reSaveRes.data!.candidate_id === cand1.id, 'Re-saved record has correct candidate_id');

  // Clean up
  await savedCandidateService.unsaveCandidate(cand1.id);

  // -------------------------------------------------------------------------
  // 12. CROSS-MODULE IDENTITY CONSISTENCY
  // -------------------------------------------------------------------------
  console.log('\n--- 12. Cross-Module Identity Consistency ---');

  // Trace: Discovery → Profile → Save → Saved List → Profile again
  const discoveryId = cand1.id;

  const profileRes = await candidateDiscoveryService.getCandidateById(discoveryId);
  const profileId = profileRes.data!.id;
  assert(discoveryId === profileId, 'Discovery ID === Profile ID');

  await savedCandidateService.saveCandidate(discoveryId);
  const savedList = await savedCandidateService.getMySavedCandidates();
  const savedEntry = savedList.data!.find((r) => r.candidate_id === discoveryId);
  assert(Boolean(savedEntry), 'Saved entry found with discovery ID');
  assert(savedEntry!.candidate_id === discoveryId, 'Saved candidate_id === Discovery ID');
  assert(savedEntry!.candidate?.full_name === cand1.name, 'Saved candidate name === Discovery name');

  // Verify comparison also uses same ID
  const compareResId = compareProfiles[0].id;
  assert(compareResId === discoveryId, 'Comparison candidate ID === Discovery ID');

  // Clean up
  await savedCandidateService.unsaveCandidate(discoveryId);

  console.log('\n========================================================================');
  console.log(`  ALL ${passedCount} EMPLOYER CANDIDATES CERTIFICATION CHECKS PASSED!`);
  console.log('========================================================================\n');
}

runEmployerCandidatesE2ETestSuite().catch((err) => {
  console.error('Candidate Test Suite Fatal Error:', err);
  process.exit(1);
});
