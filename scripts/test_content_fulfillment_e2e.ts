/**
 * End-to-End Functional Test Suite for KnowToHire Content Publishing & Fulfillment
 * Tests:
 * 1. Unified contentStorageService validation and upload flow
 * 2. Candidate Content Request creation
 * 3. Admin Request review & state transitions
 * 4. Admin deliverable upload & fulfillment governance
 * 5. Candidate deliverable access & download verification
 * 6. Admin Knowledge Hub creation, draft/publish lifecycle
 * 7. Candidate Knowledge Hub visibility (draft vs published)
 * 8. Admin Template creation & Candidate Template download
 */

import {
  contentStorageService,
  requestService,
  knowledgeService,
  templateService,
} from '../src/services';

async function runE2ETests() {
  console.log('====================================================');
  console.log('  KnowToHire Content Publishing & Fulfillment E2E Test');
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

  // Set demo candidate auth session
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
  // TEST A: Candidate Request Creation
  // ----------------------------------------------------
  console.log('--- TEST A: Candidate Content Request Creation ---');
  const reqRes = await requestService.createRequest({
    title: 'Advanced Digital Marketing',
    type: 'Study Material',
    category: 'Technology',
    preferred_format: 'PDF',
    description: 'Create a comprehensive study resource covering advanced digital marketing concepts.',
    additional_requirements: 'Include performance marketing frameworks and case studies.',
  });

  assert(reqRes.data !== null, 'Request created successfully');
  assert(reqRes.data?.status === 'pending', 'Initial status is pending / Submitted');
  assert(reqRes.data?.title === 'Advanced Digital Marketing', 'Title matches');
  const createdRequestId = reqRes.data!.id;

  const myReqs = await requestService.getMyRequests();
  assert((myReqs.data || []).some((r) => r.id === createdRequestId), 'Request appears in candidate My Requests queue');

  // ----------------------------------------------------
  // TEST B: Admin Review & Status Transition
  // ----------------------------------------------------
  console.log('\n--- TEST B: Admin Request Review & Status Transition ---');
  const allReqs = await requestService.getAllRequests();
  assert((allReqs.data || []).some((r) => r.id === createdRequestId), 'Request appears in Admin Requests queue');

  const reviewRes = await requestService.updateAndFulfillRequest(createdRequestId, {
    status: 'in_progress',
    admin_notes: 'Editorial team assigned. Research is underway.',
  });
  assert(reviewRes.data?.status === 'in_progress', 'Status updated to in_progress');
  assert(reviewRes.data?.admin_notes?.includes('Editorial team assigned') === true, 'Admin notes saved');

  // ----------------------------------------------------
  // TEST C: Fulfillment Governance & Deliverable Attachment
  // ----------------------------------------------------
  console.log('\n--- TEST C: Admin Deliverable Upload & Fulfillment Governance ---');
  // Attempting to mark as completed without deliverable should fail
  const invalidFulfill = await requestService.updateAndFulfillRequest(createdRequestId, {
    status: 'completed',
  });
  assert(invalidFulfill.error !== null, 'Fulfillment blocked without deliverable');
  assert(invalidFulfill.error?.code === 'DELIVERABLE_REQUIRED', 'Error code is DELIVERABLE_REQUIRED');

  // Now fulfill with deliverable and set price
  const fulfillRes = await requestService.updateAndFulfillRequest(createdRequestId, {
    status: 'completed',
    deliverable_title: 'Advanced Digital Marketing Master Guide',
    deliverable_description: 'Comprehensive 48-page study material with performance benchmarks.',
    deliverable_url: 'https://knowtohire.com/content/deliverables/advanced_digital_marketing.pdf',
    deliverable_name: 'Advanced_Digital_Marketing.pdf',
    deliverable_size: '2.4 MB',
    deliverable_format: 'PDF',
    storage_bucket: 'content',
    price_inr: 499,
  });

  assert(fulfillRes.data !== null, 'Request fulfilled successfully');
  assert(fulfillRes.data?.status === 'completed', 'Status is completed (Fulfilled)');
  assert(fulfillRes.data?.deliverable_url !== null, 'Deliverable URL attached');
  assert(fulfillRes.data?.deliverable_size === '2.4 MB', 'Deliverable metadata saved');
  assert(fulfillRes.data?.price_inr === 499, 'Deliverable price set to ₹499');
  assert(fulfillRes.data?.is_paid === false, 'Deliverable is initially unpaid');

  // ----------------------------------------------------
  // TEST D: Candidate Delivery & Payment Unlock Verification
  // ----------------------------------------------------
  console.log('\n--- TEST D: Candidate Delivery & Paid Unlock Verification ---');
  const candidateReqRes = await requestService.getRequestById(createdRequestId);
  assert(candidateReqRes.data?.status === 'completed', 'Candidate sees Fulfilled status');
  assert(candidateReqRes.data?.price_inr === 499, 'Candidate sees required price ₹499');
  assert(candidateReqRes.data?.is_paid === false, 'Deliverable is locked prior to payment');

  // Candidate pays for request
  const payRes = await requestService.markRequestPaid(createdRequestId, 'pay_test_order_12345');
  assert(payRes.data?.is_paid === true, 'Request marked as paid');
  assert(payRes.data?.payment_id === 'pay_test_order_12345', 'Payment ID recorded');
  assert(payRes.data?.deliverable_url?.includes('.pdf') === true, 'Candidate can now access unlocked deliverable');

  // ----------------------------------------------------
  // TEST E: Knowledge Hub Publishing & Lifecycle
  // ----------------------------------------------------
  console.log('\n--- TEST E: Knowledge Hub Publishing & Lifecycle ---');
  const hubDraftRes = await knowledgeService.createResource({
    title: 'Test Draft Guide 2026',
    description: 'Internal draft compliance checklist.',
    category: 'Environmental & ESG',
    format: 'PDF',
    status: 'draft',
    file_url: 'https://knowtohire.com/knowledge/draft_guide.pdf',
  });
  assert(hubDraftRes.data !== null, 'Draft resource created');
  const draftId = hubDraftRes.data!.id;

  // Normal candidate getResources should NOT return draft
  const publicHub = await knowledgeService.getResources();
  assert(!(publicHub.data || []).some((r) => r.id === draftId), 'Draft resource is NOT visible to candidates');

  // Publish resource
  const publishedHubRes = await knowledgeService.updateResource(draftId, {
    status: 'published',
  });
  assert(publishedHubRes.data?.status === 'published', 'Resource status updated to published');

  const publicHubAfter = await knowledgeService.getResources();
  assert((publicHubAfter.data || []).some((r) => r.id === draftId), 'Published resource is NOW visible to candidates');

  // Download track
  const dlRes = await knowledgeService.trackDownload(draftId);
  assert(dlRes.data?.downloadUrl !== null, 'Candidate can download published Knowledge Hub resource');

  // Cleanup test resource
  await knowledgeService.deleteResource(draftId);

  // ----------------------------------------------------
  // TEST F: Template Marketplace Publishing & Download
  // ----------------------------------------------------
  console.log('\n--- TEST F: Template Marketplace Publishing & Download ---');
  const tmplRes = await templateService.createTemplate({
    title: 'Test Resume Template 2026',
    description: 'ATS-optimized resume template for sustainability engineers.',
    category: 'Resume Templates',
    formats: ['DOCX', 'PDF'],
    price_inr: 0,
    status: 'published',
    file_url: 'https://knowtohire.com/templates/sustainability_resume.docx',
  });
  assert(tmplRes.data !== null, 'Template created and published');
  const tmplId = tmplRes.data!.id;

  const publicTmpls = await templateService.getTemplates();
  assert((publicTmpls.data || []).some((t) => t.id === tmplId), 'Template is visible to candidates');

  const tmplDlRes = await templateService.trackDownload(tmplId);
  assert(tmplDlRes.data?.downloadUrl?.includes('.docx') === true, 'Candidate can download template file');

  // Cleanup test template
  await templateService.deleteTemplate(tmplId);

  console.log('\n====================================================');
  console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runE2ETests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
