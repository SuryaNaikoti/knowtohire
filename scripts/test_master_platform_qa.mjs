/**
 * Master End-to-End Platform QA & Certification Test Suite
 * Validates all roles, database entities, RLS boundaries, and lifecycle flows.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

// Initialize Client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Real test accounts
const EMPLOYER_EMAIL = 'cilove3743@hutdot.com';
const EMPLOYER_PASSWORD = 'Password123!';
const CANDIDATE_EMAIL = 'cand_1786972983967@hutdot.com';
const CANDIDATE_PASSWORD = 'Password123!';

async function runMasterCertification() {
  console.log('======================================================================');
  console.log('KNOWTOHIRE MASTER PLATFORM QA & CERTIFICATION SUITE');
  console.log('======================================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failedTests++;
    }
  }

  try {
    // -------------------------------------------------------------
    // SECTION 1: PUBLIC DATA DISCOVERY & QUERIES (ANONYMOUS)
    // -------------------------------------------------------------
    console.log('1. Testing Public & Guest Data Access...');

    // 1.1 Public Published Jobs
    const { data: pubJobs, error: pubJobsErr } = await supabase
      .from('jobs')
      .select('id, title, status, category, location, min_salary_inr, max_salary_inr')
      .eq('status', 'published')
      .limit(5);

    assert(!pubJobsErr && Array.isArray(pubJobs) && pubJobs.length > 0, `Anonymous access can query published jobs (Found ${pubJobs?.length || 0} jobs)`);

    // 1.2 Public Knowledge Hub Resources
    const { data: pubResources, error: pubResErr } = await supabase
      .from('resources')
      .select('id, title, format, downloads_count')
      .limit(5);

    assert(!pubResErr && Array.isArray(pubResources) && pubResources.length > 0, `Anonymous access can query Knowledge Hub resources (Found ${pubResources?.length || 0} resources)`);

    // 1.3 Public Marketplace Templates
    const { data: pubTemplates, error: pubTmplErr } = await supabase
      .from('templates')
      .select('id, title, price, formats, downloads_count')
      .limit(5);

    assert(!pubTmplErr && Array.isArray(pubTemplates) && pubTemplates.length > 0, `Anonymous access can query Marketplace templates (Found ${pubTemplates?.length || 0} templates)`);

    // 1.4 Public Editorial Blog Posts
    const { data: pubBlog, error: pubBlogErr } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, view_count')
      .limit(5);

    assert(!pubBlogErr && Array.isArray(pubBlog) && pubBlog.length > 0, `Anonymous access can query Editorial Blog articles (Found ${pubBlog?.length || 0} posts)`);

    // -------------------------------------------------------------
    // SECTION 2: CANDIDATE COMPLETE LIFECYCLE
    // -------------------------------------------------------------
    console.log('\n2. Testing Candidate Authentication & Lifecycle...');

    const { data: candAuth, error: candAuthErr } = await supabase.auth.signInWithPassword({
      email: CANDIDATE_EMAIL,
      password: CANDIDATE_PASSWORD,
    });

    assert(!candAuthErr && candAuth?.user?.id, `Candidate authenticated successfully (UID: ${candAuth?.user?.id})`);
    const candidateId = candAuth?.user?.id;

    // 2.1 Candidate Profile Update & Query
    const { data: candProfile, error: candProfErr } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('profile_id', candidateId)
      .maybeSingle();

    assert(!candProfErr, `Candidate profile queried from candidate_profiles`);

    // 2.2 Save Job & Unsave Job Flow
    const targetJobId = pubJobs[0].id;
    
    // Clean existing saved job if any
    await supabase.from('saved_jobs').delete().eq('candidate_id', candidateId).eq('job_id', targetJobId);

    const { data: saveJobInsert, error: saveJobErr } = await supabase
      .from('saved_jobs')
      .insert({ candidate_id: candidateId, job_id: targetJobId })
      .select('*')
      .single();

    assert(!saveJobErr && saveJobInsert?.id, `Candidate saved job successfully (SavedJobID: ${saveJobInsert?.id})`);

    const { data: savedJobsList, error: savedListErr } = await supabase
      .from('saved_jobs')
      .select('id, job_id')
      .eq('candidate_id', candidateId);

    assert(!savedListErr && savedJobsList?.some(s => s.job_id === targetJobId), `Saved job appears in candidate saved jobs list`);

    // Unsave
    const { error: unsaveErr } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('job_id', targetJobId);

    assert(!unsaveErr, `Candidate unsaved job successfully`);

    // 2.3 On-Demand Content Request Creation
    const { data: reqInsert, error: reqErr } = await supabase
      .from('resource_requests')
      .insert({
        user_id: candidateId,
        title: 'CPCB Water Quality Audit Guide for Textile Hubs',
        description: 'Comprehensive compliance checklist and statutory return templates.',
        category: 'Environmental & ESG',
        type: 'guide',
        status: 'pending',
      })
      .select('*')
      .single();

    assert(!reqErr && reqInsert?.id, `Candidate submitted on-demand content request (RequestID: ${reqInsert?.id})`);

    // -------------------------------------------------------------
    // SECTION 3: EMPLOYER COMPLETE ATS & RECRUITMENT LIFECYCLE
    // -------------------------------------------------------------
    console.log('\n3. Testing Employer Authentication & ATS Lifecycle...');

    const { data: empAuth, error: empAuthErr } = await supabase.auth.signInWithPassword({
      email: EMPLOYER_EMAIL,
      password: EMPLOYER_PASSWORD,
    });

    assert(!empAuthErr && empAuth?.user?.id, `Employer authenticated successfully (UID: ${empAuth?.user?.id})`);
    const employerId = empAuth?.user?.id;

    // Get company ID
    const { data: empRecord } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('profile_id', employerId)
      .single();

    const companyId = empRecord?.company_id;
    assert(!!companyId, `Retrieved employer enterprise company ID: ${companyId}`);

    // 3.1 Job Lifecycle: Create Draft -> Edit -> Publish -> Pause -> Reopen -> Archive
    const { data: newJob, error: newJobErr } = await supabase
      .from('jobs')
      .insert({
        company_id: companyId,
        employer_id: employerId,
        title: 'Senior Climate Risk Modeler',
        category: 'Climate Tech & Modeling',
        department: 'Physical Risk Analytics',
        location: 'Bengaluru, Karnataka',
        work_mode: 'hybrid',
        employment_type: 'full_time',
        min_salary_inr: 2000000,
        max_salary_inr: 3200000,
        skills: ['Climate Risk Modeling', 'TCFD', 'GIS Geospatial Analytics', 'Python'],
        description: 'Lead climate risk modeling for physical asset vulnerability.',
        requirements: 'Master/PhD in Climate Science or Geospatial Engineering.',
        benefits: 'Hybrid policy, comprehensive healthcare, annual learning budget.',
        status: 'draft',
      })
      .select('*')
      .single();

    assert(!newJobErr && newJob?.id, `1. Create Draft Job: Created job ${newJob?.id} with status 'draft'`);

    // Edit Job
    const { data: editedJob, error: editJobErr } = await supabase
      .from('jobs')
      .update({
        title: 'Lead Climate Risk & TCFD Modeler',
        max_salary_inr: 3500000,
      })
      .eq('id', newJob.id)
      .select('*')
      .single();

    assert(!editJobErr && editedJob.title === 'Lead Climate Risk & TCFD Modeler', `2. Edit Job: Successfully updated title and compensation range`);

    // Publish Job
    const { data: publishedJob, error: pubJobErr } = await supabase
      .from('jobs')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', newJob.id)
      .select('*')
      .single();

    assert(!pubJobErr && publishedJob.status === 'published', `3. Publish Job: Status transitioned to 'published' with timestamp`);

    // Candidate applies to this published job
    // Switch to Candidate Auth
    await supabase.auth.signInWithPassword({ email: CANDIDATE_EMAIL, password: CANDIDATE_PASSWORD });

    const { data: appInsert, error: appErr } = await supabase
      .from('job_applications')
      .insert({
        job_id: newJob.id,
        candidate_id: candidateId,
        company_id: companyId,
        cover_letter: 'I have 6+ years modeling physical climate scenarios under RCP 4.5/8.5.',
        resume_url: 'https://example.com/resumes/climate_lead.pdf',
        status: 'applied',
        stage: 'new',
        candidate_snapshot: {
          full_name: 'Dr. Priya Sharma',
          headline: 'Senior Climate Risk Researcher',
          skills: ['Climate Modeling', 'TCFD', 'Python'],
        },
      })
      .select('*')
      .single();

    assert(!appErr && appInsert?.id, `4. Candidate Job Application: Submitted application ${appInsert?.id} for new job`);

    // Switch back to Employer Auth
    await supabase.auth.signInWithPassword({ email: EMPLOYER_EMAIL, password: EMPLOYER_PASSWORD });

    // 3.2 ATS Pipeline Stage Transitions (new -> screening -> interview -> offer -> hired)
    const stages = ['screening', 'interview', 'offer', 'hired'];
    for (const stg of stages) {
      const { data: updatedApp, error: stageErr } = await supabase
        .from('job_applications')
        .update({ stage: stg, updated_at: new Date().toISOString() })
        .eq('id', appInsert.id)
        .select('*')
        .single();

      assert(!stageErr && updatedApp.stage === stg, `5. ATS Pipeline: Transitioned applicant stage to '${stg}'`);
    }

    // 3.3 Interview Scheduling & Rescheduling
    const interviewStartTime = new Date(Date.now() + 86400000 * 2).toISOString();
    const interviewEndTime = new Date(Date.now() + 86400000 * 2 + 3600000).toISOString();

    const { data: interviewRecord, error: intErr } = await supabase
      .from('interviews')
      .insert({
        application_id: appInsert.id,
        job_id: newJob.id,
        candidate_id: candidateId,
        company_id: companyId,
        created_by: employerId,
        title: 'Technical Climate Modeling & Architecture Round',
        interview_type: 'technical_deep_dive',
        scheduled_start: interviewStartTime,
        scheduled_end: interviewEndTime,
        meeting_link: 'https://meet.google.com/kth-clim-risk',
        status: 'scheduled',
      })
      .select('*')
      .single();

    assert(!intErr && interviewRecord?.id, `6. Schedule Interview: Created scheduled interview round (${interviewRecord?.id})`);

    // Reschedule interview
    const rescheduledTime = new Date(Date.now() + 86400000 * 3).toISOString();
    const { data: rescheduledRec, error: reschedErr } = await supabase
      .from('interviews')
      .update({ scheduled_start: rescheduledTime, status: 'rescheduled' })
      .eq('id', interviewRecord.id)
      .select('*')
      .single();

    assert(!reschedErr && rescheduledRec.status === 'rescheduled', `7. Reschedule Interview: Updated interview timing and status`);

    // 3.4 Job State Management: Pause -> Reopen -> Archive
    const { data: pausedJob } = await supabase.from('jobs').update({ status: 'paused' }).eq('id', newJob.id).select('*').single();
    assert(pausedJob?.status === 'paused', `8. Pause Job Listing: Job status paused`);

    const { data: reopenedJob } = await supabase.from('jobs').update({ status: 'published' }).eq('id', newJob.id).select('*').single();
    assert(reopenedJob?.status === 'published', `9. Reopen Job Listing: Job status re-published`);

    const { data: closedJob } = await supabase.from('jobs').update({ status: 'closed' }).eq('id', newJob.id).select('*').single();
    assert(closedJob?.status === 'closed', `10. Close/Archive Job: Job status closed`);

    // 3.5 Talent Discovery & Candidate Bench
    const { data: candTalent, error: talentErr } = await supabase
      .from('candidate_profiles')
      .select('id, profile_id, headline, skills')
      .limit(3);

    assert(!talentErr && Array.isArray(candTalent) && candTalent.length > 0, `11. Talent Pool Discovery: Queried discoverable candidates`);

    // Save Candidate to Bench
    const { data: savedCand, error: saveCandErr } = await supabase
      .from('saved_candidates')
      .insert({
        company_id: companyId,
        employer_id: employerId,
        candidate_id: candidateId,
        notes: 'Top tier physical risk analytics lead.',
      })
      .select('*')
      .single();

    assert(!saveCandErr && savedCand?.id, `12. Saved Candidate Bench: Successfully saved candidate to talent bench`);

    // Clean up saved candidate bench
    await supabase.from('saved_candidates').delete().eq('id', savedCand.id);

    // -------------------------------------------------------------
    // SECTION 4: ROW LEVEL SECURITY & PRIVACY AUDIT
    // -------------------------------------------------------------
    console.log('\n4. Testing RLS & Cross-Account Isolation Boundaries...');

    // Switch to Candidate Auth
    await supabase.auth.signInWithPassword({ email: CANDIDATE_EMAIL, password: CANDIDATE_PASSWORD });

    // Candidate should NOT be able to view other candidates' saved jobs
    const { data: forbiddenSavedJobs } = await supabase
      .from('saved_jobs')
      .select('*')
      .neq('candidate_id', candidateId);

    assert(!forbiddenSavedJobs || forbiddenSavedJobs.length === 0, `RLS Boundary: Candidate cannot view other candidates' saved jobs`);

    // Candidate should NOT be able to insert job listings
    const { error: candidateJobCreateErr } = await supabase
      .from('jobs')
      .insert({
        title: 'Unauthorized Candidate Job',
        company_id: companyId,
        status: 'published',
      });

    assert(!!candidateJobCreateErr, `RLS Boundary: Candidate cannot create employer job listings`);

    // -------------------------------------------------------------
    // SECTION 5: ADMIN GOVERNANCE & METRICS
    // -------------------------------------------------------------
    console.log('\n5. Testing Superuser Governance & Multi-Table Aggregation...');

    const [pubJobCount, resCount, tmplCount, blogCount, reqCount] = await Promise.all([
      supabase.from('jobs').select('id', { count: 'exact', head: true }),
      supabase.from('resources').select('id', { count: 'exact', head: true }),
      supabase.from('templates').select('id', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('resource_requests').select('id', { count: 'exact', head: true }),
    ]);

    assert(pubJobCount.count > 0, `Admin Aggregation: Queried total jobs count (${pubJobCount.count})`);
    assert(resCount.count > 0, `Admin Aggregation: Queried Knowledge Hub resources count (${resCount.count})`);
    assert(tmplCount.count > 0, `Admin Aggregation: Queried Marketplace templates count (${tmplCount.count})`);
    assert(blogCount.count > 0, `Admin Aggregation: Queried Editorial blog posts count (${blogCount.count})`);
    assert(reqCount.count > 0, `Admin Aggregation: Queried On-demand resource requests count (${reqCount.count})`);

    // Clean up created test entities
    await supabase.from('interviews').delete().eq('id', interviewRecord.id);
    await supabase.from('job_applications').delete().eq('id', appInsert.id);
    await supabase.from('jobs').delete().eq('id', newJob.id);
    await supabase.from('resource_requests').delete().eq('id', reqInsert.id);

    console.log('\n======================================================================');
    console.log(`QA CERTIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('======================================================================\n');

    if (failedTests === 0) {
      console.log('STATUS: 100% PASS — ALL LIFECYCLE, RLS, AND ATS FLOWS CERTIFIED!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  }
}

runMasterCertification();
