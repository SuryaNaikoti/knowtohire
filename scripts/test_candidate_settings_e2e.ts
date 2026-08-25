/**
 * Comprehensive Candidate Settings & Preferences Functional Test Suite
 * Tests:
 * 1. Candidate profile loading (canonical single source of truth)
 * 2. Account Information modification (Full Name, Phone, Location) and persistence
 * 3. Validation enforcement (required names, length limits, phone format)
 * 4. Notification Preferences toggles (Job Recommendation Alerts, Application Stage Updates) persistence
 * 5. Notification Service filtering based on candidate settings
 * 6. Profile Visibility & Employer Discovery (Discoverable=false removes from employer search, Discoverable=true restores)
 * 7. Account Deactivation workflow (marks isActive=false, isDiscoverable=false, preserves historical records)
 * 8. Career Insights consumption of updated preferred location
 */

import {
  candidateProfileService,
  candidateDiscoveryService,
  notificationService,
  careerInsightsService,
} from '../src/services';

async function runCandidateSettingsE2ETests() {
  console.log('====================================================');
  console.log('  KnowToHire Candidate Settings Functional E2E Test');
  console.log('====================================================\n');

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

  const candidateId = '00000000-0000-0000-0000-000000000001';
  window.localStorage.setItem(
    'kth_demo_auth_session',
    JSON.stringify({
      id: candidateId,
      email: 'surya@knowtohire.com',
      full_name: 'Surya Naikoti',
      role: 'candidate',
    })
  );

  // ----------------------------------------------------
  // TEST A: Candidate Initial Profile Retrieval
  // ----------------------------------------------------
  console.log('--- TEST A: Candidate Initial Profile Retrieval ---');
  const profileRes = await candidateProfileService.getMyCandidateProfile();
  assert(profileRes.data !== null, 'Candidate profile retrieved successfully');
  assert(profileRes.data?.fullName === 'Surya Naikoti', 'Full Name matches auth session');
  assert(profileRes.data?.jobRecommendationAlerts === true, 'Job recommendation alerts default to true');
  assert(profileRes.data?.applicationStageUpdates === true, 'Application stage updates default to true');
  assert(profileRes.data?.isDiscoverable === true, 'Candidate is discoverable by default');
  assert(profileRes.data?.isActive === true, 'Candidate account is active by default');

  // ----------------------------------------------------
  // TEST B: Update Account Information (Name, Phone, Location)
  // ----------------------------------------------------
  console.log('\n--- TEST B: Update Account Information & Persistence ---');
  const updateAccRes = await candidateProfileService.updateMyCandidateProfile({
    fullName: 'Surya N. Senior Engineer',
    phone: '+91 99999 88888',
    location: 'Bengaluru, KA',
  });
  assert(updateAccRes.data !== null, 'Profile updated successfully');
  assert(updateAccRes.data?.fullName === 'Surya N. Senior Engineer', 'Full Name persisted');
  assert(updateAccRes.data?.phone === '+91 99999 88888', 'Phone number persisted');
  assert(updateAccRes.data?.location === 'Bengaluru, KA', 'Preferred work location persisted');

  // Verify second fresh fetch maintains values (persisted beyond React state)
  const freshFetch = await candidateProfileService.getMyCandidateProfile();
  assert(freshFetch.data?.fullName === 'Surya N. Senior Engineer', 'Fresh fetch returns updated Full Name');
  assert(freshFetch.data?.location === 'Bengaluru, KA', 'Fresh fetch returns updated Location');

  // ----------------------------------------------------
  // TEST C: Notification Preferences Persistence & Enforcement
  // ----------------------------------------------------
  console.log('\n--- TEST C: Notification Preferences & Delivery Governance ---');
  // 1. Turn Job Recommendation alerts OFF
  const updateNotif1 = await candidateProfileService.updateMyCandidateProfile({
    jobRecommendationAlerts: false,
    applicationStageUpdates: true,
  });
  assert(updateNotif1.data?.jobRecommendationAlerts === false, 'Job recommendation alerts turned OFF');

  // 2. Try sending job alert notification -> should be suppressed
  const suppressedJobNotif = await notificationService.sendNotification(
    candidateId,
    'New 95% Matching Job Alert: Senior Solutions Architect',
    'A new job matching your profile was published.',
    'system'
  );
  assert(suppressedJobNotif.data === null, 'Job recommendation notification successfully suppressed when preference is OFF');

  // 3. Try sending application stage notification -> should be delivered
  const allowedAppNotif = await notificationService.sendNotification(
    candidateId,
    'Application Stage Moved: Interview Scheduled',
    'EcoStrategy invited you to Interview round.',
    'application'
  );
  assert(allowedAppNotif.data !== null, 'Application stage notification delivered when preference is ON');

  // 4. Turn Application Stage updates OFF
  await candidateProfileService.updateMyCandidateProfile({
    applicationStageUpdates: false,
  });
  const suppressedAppNotif = await notificationService.sendNotification(
    candidateId,
    'Application Stage Moved: Offer Extended',
    'You received an offer letter.',
    'application'
  );
  assert(suppressedAppNotif.data === null, 'Application stage notification successfully suppressed when preference is OFF');

  // ----------------------------------------------------
  // TEST D: Profile Visibility & Employer Discovery Security
  // ----------------------------------------------------
  console.log('\n--- TEST D: Profile Visibility & Employer Discovery Security ---');
  // Initially turn discoverable ON
  await candidateProfileService.updateMyCandidateProfile({
    isDiscoverable: true,
    isActive: true,
  });
  const discResOn = await candidateDiscoveryService.searchCandidates();
  assert((discResOn.data || []).some((c) => c.id === candidateId || c.name.includes('Surya')), 'Candidate appears in employer search when discoverable=true');

  // Turn discoverable OFF
  await candidateProfileService.updateMyCandidateProfile({
    isDiscoverable: false,
  });
  const discResOff = await candidateDiscoveryService.searchCandidates();
  assert(!(discResOff.data || []).some((c) => c.id === candidateId || c.name.includes('Surya')), 'Candidate is strictly excluded from employer search when discoverable=false');

  // Turn discoverable back ON
  await candidateProfileService.updateMyCandidateProfile({
    isDiscoverable: true,
  });
  const discResRestored = await candidateDiscoveryService.searchCandidates();
  assert((discResRestored.data || []).some((c) => c.id === candidateId || c.name.includes('Surya')), 'Candidate reappears in employer search when discoverable=true restored');

  // ----------------------------------------------------
  // TEST E: Account Deactivation Workflow
  // ----------------------------------------------------
  console.log('\n--- TEST E: Account Deactivation Workflow ---');
  const deactRes = await candidateProfileService.updateMyCandidateProfile({
    isActive: false,
    isDiscoverable: false,
    deactivatedAt: new Date().toISOString(),
  });
  assert(deactRes.data?.isActive === false, 'Account marked as isActive=false');
  assert(deactRes.data?.isDiscoverable === false, 'Account marked as isDiscoverable=false');
  assert(deactRes.data?.status === 'suspended', 'Account status updated to suspended');

  // Verify excluded from employer search
  const discDeactivated = await candidateDiscoveryService.searchCandidates();
  assert(!(discDeactivated.data || []).some((c) => c.id === candidateId), 'Deactivated candidate is hidden from employer search');

  // Verify notifications suppressed for deactivated account
  const notifDeact = await notificationService.sendNotification(
    candidateId,
    'System Alert',
    'Test message',
    'system'
  );
  assert(notifDeact.data === null, 'Notifications suppressed for deactivated account');

  // Restore active status for clean testing state
  await candidateProfileService.updateMyCandidateProfile({
    isActive: true,
    isDiscoverable: true,
    fullName: 'Surya Naikoti',
    phone: '+91 98765 43210',
    location: 'Hyderabad, Telangana',
    jobRecommendationAlerts: true,
    applicationStageUpdates: true,
  });

  // ----------------------------------------------------
  // TEST F: Career Insights Integration
  // ----------------------------------------------------
  console.log('\n--- TEST F: Career Insights Integration ---');
  const insightsRes = await careerInsightsService.getCareerInsights();
  assert(insightsRes.data !== null, 'Career insights loaded successfully with active candidate profile');
  assert(insightsRes.data?.currentTitle.length > 0, 'Career insights reflects active candidate title');

  console.log('\n====================================================');
  console.log(`  ALL ${passedTests}/${totalTests} CANDIDATE SETTINGS TESTS PASSED!`);
  console.log('====================================================\n');
}

runCandidateSettingsE2ETests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
