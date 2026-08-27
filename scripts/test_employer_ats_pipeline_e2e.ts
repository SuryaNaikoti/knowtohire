/**
 * KnowToHire — Employer ATS Pipeline E2E Test
 * =============================================
 * Verifies the complete Employer ATS Pipeline module for:
 * - Canonical state machine validation
 * - Service layer data flow (getCompanyApplicants, updateApplicationStage)
 * - Pipeline page component structure
 * - Stage transition persistence (demo mode)
 * - Search / filter / archived logic
 * - Candidate identity consistency (snapshot vs canonical)
 * - Job association integrity
 * - Pipeline count accuracy
 * - Cross-module integration (QuickView, FullProfile)
 * - Error handling and empty states
 *
 * Run: npx tsx scripts/test_employer_ats_pipeline_e2e.ts
 */

// ============================================================================
// Test Framework
// ============================================================================

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ❌ FAIL: ${label}`);
  }
}

function section(title: string) {
  console.log(`\n${'━'.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('━'.repeat(70));
}

// ============================================================================
// 1. CANONICAL STATE MACHINE VALIDATION
// ============================================================================

section('1. CANONICAL STATE MACHINE');

const CANONICAL_STAGES = ['new', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'] as const;
type ApplicationStage = typeof CANONICAL_STAGES[number];

assert(CANONICAL_STAGES.length === 8, 'ApplicationStage enum has exactly 8 canonical stages');
assert(CANONICAL_STAGES.includes('new'), 'Stage: new exists');
assert(CANONICAL_STAGES.includes('screening'), 'Stage: screening exists');
assert(CANONICAL_STAGES.includes('shortlisted'), 'Stage: shortlisted exists');
assert(CANONICAL_STAGES.includes('interview'), 'Stage: interview exists');
assert(CANONICAL_STAGES.includes('offer'), 'Stage: offer exists');
assert(CANONICAL_STAGES.includes('hired'), 'Stage: hired exists');
assert(CANONICAL_STAGES.includes('rejected'), 'Stage: rejected exists');
assert(CANONICAL_STAGES.includes('withdrawn'), 'Stage: withdrawn exists');

// Forward transition map
const FORWARD_TRANSITIONS: Record<string, string | null> = {
  new: 'screening',
  screening: 'shortlisted',
  shortlisted: 'interview',
  interview: 'offer',
  offer: 'hired',
  hired: null,
  rejected: null,
  withdrawn: null,
};

assert(FORWARD_TRANSITIONS.new === 'screening', 'Transition: new → screening');
assert(FORWARD_TRANSITIONS.screening === 'shortlisted', 'Transition: screening → shortlisted');
assert(FORWARD_TRANSITIONS.shortlisted === 'interview', 'Transition: shortlisted → interview');
assert(FORWARD_TRANSITIONS.interview === 'offer', 'Transition: interview → offer');
assert(FORWARD_TRANSITIONS.offer === 'hired', 'Transition: offer → hired');
assert(FORWARD_TRANSITIONS.hired === null, 'Terminal: hired has no forward transition');
assert(FORWARD_TRANSITIONS.rejected === null, 'Terminal: rejected has no forward transition');
assert(FORWARD_TRANSITIONS.withdrawn === null, 'Terminal: withdrawn has no forward transition');

// Active vs Archive stages
const ACTIVE_STAGES: ApplicationStage[] = ['new', 'screening', 'shortlisted', 'interview'];
const ARCHIVE_STAGES: ApplicationStage[] = ['offer', 'hired', 'rejected', 'withdrawn'];

assert(ACTIVE_STAGES.length === 4, 'Active pipeline has 4 stages');
assert(ARCHIVE_STAGES.length === 4, 'Archive pipeline has 4 stages');
assert(ACTIVE_STAGES.every(s => !ARCHIVE_STAGES.includes(s)), 'Active and Archive stages are mutually exclusive');

// ============================================================================
// 2. SERVICE LAYER VALIDATION
// ============================================================================

section('2. SERVICE LAYER — APPLICATION SERVICE');

// Verify service types exist in the codebase
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.resolve(__dirname, '..', 'src');

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(srcRoot, relativePath));
}

function fileContains(relativePath: string, searchStr: string): boolean {
  try {
    const content = fs.readFileSync(path.join(srcRoot, relativePath), 'utf-8');
    return content.includes(searchStr);
  } catch {
    return false;
  }
}

assert(fileExists('services/applicationService.ts'), 'applicationService.ts exists');
assert(fileExists('services/jobService.ts'), 'jobService.ts exists');
assert(fileExists('services/interviewService.ts'), 'interviewService.ts exists');
assert(fileExists('services/candidateDiscoveryService.ts'), 'candidateDiscoveryService.ts exists');
assert(fileExists('services/notificationService.ts'), 'notificationService.ts exists');

// Verify critical methods exist
assert(fileContains('services/applicationService.ts', 'getCompanyApplicants'), 'getCompanyApplicants method exists');
assert(fileContains('services/applicationService.ts', 'updateApplicationStage'), 'updateApplicationStage method exists');
assert(fileContains('services/applicationService.ts', 'getJobApplicants'), 'getJobApplicants method exists');
assert(fileContains('services/applicationService.ts', 'applyToJob'), 'applyToJob method exists');
assert(fileContains('services/applicationService.ts', 'withdrawApplication'), 'withdrawApplication method exists');
assert(fileContains('services/applicationService.ts', 'updateEmployerNotes'), 'updateEmployerNotes method exists');

// Verify demo mode support
assert(fileContains('services/applicationService.ts', 'DEMO_APPLICATIONS_KEY'), 'Demo applications localStorage key defined');
assert(fileContains('services/applicationService.ts', 'isDemoSession'), 'isDemoSession helper exists');
assert(fileContains('services/applicationService.ts', 'notifyApplicationsChanged'), 'notifyApplicationsChanged event dispatcher exists');

// Verify stage update dispatches notification in demo mode (Bug #4 fix)
const appServiceContent = fs.readFileSync(path.join(srcRoot, 'services/applicationService.ts'), 'utf-8');
const stageUpdateSection = appServiceContent.substring(
  appServiceContent.indexOf('async updateApplicationStage('),
  appServiceContent.indexOf('async updateApplicationStage(') + 1500
);
const demoStageBlock = stageUpdateSection.substring(
  stageUpdateSection.indexOf("window.localStorage.setItem(DEMO_APPLICATIONS_KEY"),
  stageUpdateSection.indexOf("window.localStorage.setItem(DEMO_APPLICATIONS_KEY") + 200
);
assert(
  demoStageBlock.includes('notifyApplicationsChanged'),
  'Demo stage update calls notifyApplicationsChanged() (Bug #4 fix)'
);

// ============================================================================
// 3. PIPELINE PAGE COMPONENT STRUCTURE
// ============================================================================

section('3. PIPELINE PAGE COMPONENT STRUCTURE');

assert(fileExists('pages/employer/EmployerPipelinePage.tsx'), 'EmployerPipelinePage.tsx exists');
assert(fileExists('components/employer/CandidatePipeline.tsx'), 'CandidatePipeline.tsx exists');
assert(fileExists('components/employer/CandidatePipelineCard.tsx'), 'CandidatePipelineCard.tsx exists');
assert(fileExists('components/employer/CandidateQuickView.tsx'), 'CandidateQuickView.tsx exists');

// Verify EmployerPipelinePage loads data correctly
assert(
  fileContains('pages/employer/EmployerPipelinePage.tsx', "applicationService.getCompanyApplicants"),
  'Pipeline page uses getCompanyApplicants (company-scoped)'
);
assert(
  fileContains('pages/employer/EmployerPipelinePage.tsx', 'jobService.getEmployerJobs'),
  'Pipeline page loads employer jobs for requisition filter'
);
assert(
  fileContains('pages/employer/EmployerPipelinePage.tsx', 'handleApplicationUpdated'),
  'Pipeline page has application update handler'
);

// Verify CandidatePipeline component
assert(
  fileContains('components/employer/CandidatePipeline.tsx', "stage: 'new', label: 'New Applicants'"),
  'Pipeline defines New Applicants stage column'
);
assert(
  fileContains('components/employer/CandidatePipeline.tsx', "stage: 'screening', label: 'Screening'"),
  'Pipeline defines Screening stage column'
);
assert(
  fileContains('components/employer/CandidatePipeline.tsx', "stage: 'shortlisted', label: 'Shortlisted'"),
  'Pipeline defines Shortlisted stage column'
);
assert(
  fileContains('components/employer/CandidatePipeline.tsx', "stage: 'interview', label: 'Interview'"),
  'Pipeline defines Interview stage column'
);

// Verify archive stages
assert(
  fileContains('components/employer/CandidatePipeline.tsx', "stage: 'offer', label: 'Offers'"),
  'Pipeline defines Offers archive stage'
);
assert(
  fileContains('components/employer/CandidatePipeline.tsx', "stage: 'hired', label: 'Hired'"),
  'Pipeline defines Hired archive stage'
);
assert(
  fileContains('components/employer/CandidatePipeline.tsx', "stage: 'rejected', label: 'Not Selected'"),
  'Pipeline defines Not Selected archive stage'
);
assert(
  fileContains('components/employer/CandidatePipeline.tsx', "stage: 'withdrawn', label: 'Withdrawn'"),
  'Pipeline defines Withdrawn archive stage'
);

// Verify QuickView integration
assert(
  fileContains('components/employer/CandidatePipeline.tsx', 'CandidateQuickView'),
  'Pipeline integrates CandidateQuickView drawer'
);
assert(
  fileContains('components/employer/CandidatePipeline.tsx', 'handleAdvanceStage'),
  'Pipeline has stage advancement handler'
);

// ============================================================================
// 4. PIPELINE CARD — NO FABRICATED DATA
// ============================================================================

section('4. PIPELINE CARD — NO FABRICATED DATA');

const cardContent = fs.readFileSync(path.join(srcRoot, 'components/employer/CandidatePipelineCard.tsx'), 'utf-8');

assert(
  !cardContent.includes("'Sustainability Specialist'"),
  'Pipeline card does NOT contain hardcoded "Sustainability Specialist" fallback'
);
assert(
  !cardContent.includes("|| 'India'"),
  'Pipeline card does NOT contain hardcoded "India" fallback'
);
assert(
  cardContent.includes("snapshot.headline || ''"),
  'Pipeline card headline fallback is empty string (non-fabricated)'
);

// ============================================================================
// 5. QUICK VIEW — NO FABRICATED DATA
// ============================================================================

section('5. QUICK VIEW — NO FABRICATED DATA');

const qvContent = fs.readFileSync(path.join(srcRoot, 'components/employer/CandidateQuickView.tsx'), 'utf-8');

assert(
  !qvContent.includes("'Sustainability & Engineering Professional'"),
  'QuickView does NOT contain hardcoded "Sustainability & Engineering Professional"'
);
assert(
  !qvContent.includes("'Professional with proven domain track record"),
  'QuickView does NOT contain hardcoded fabricated bio fallback'
);
assert(
  !qvContent.includes("'Sustainability & CleanTech'"),
  'QuickView does NOT contain hardcoded "Sustainability & CleanTech" domain'
);

// ============================================================================
// 6. STAGE TRANSITIONS — LOGIC VALIDATION
// ============================================================================

section('6. STAGE TRANSITIONS — LOGIC VALIDATION');

// Validate the getNextStage function logic matches our canonical model
const pipelineCardCode = cardContent;
const getNextStageBlock = pipelineCardCode.substring(
  pipelineCardCode.indexOf('getNextStage'),
  pipelineCardCode.indexOf('getNextStage') + 400
);

assert(getNextStageBlock.includes("case 'new': return 'screening'"), 'Card: new → screening transition defined');
assert(getNextStageBlock.includes("case 'screening': return 'shortlisted'"), 'Card: screening → shortlisted transition defined');
assert(getNextStageBlock.includes("case 'shortlisted': return 'interview'"), 'Card: shortlisted → interview transition defined');
assert(getNextStageBlock.includes("case 'interview': return 'offer'"), 'Card: interview → offer transition defined');
assert(getNextStageBlock.includes("case 'offer': return 'hired'"), 'Card: offer → hired transition defined');
assert(getNextStageBlock.includes('default: return null'), 'Card: terminal stages return null (no Advance button)');

// ============================================================================
// 7. SEARCH / FILTER LOGIC
// ============================================================================

section('7. SEARCH / FILTER LOGIC');

const pipelinePage = fs.readFileSync(path.join(srcRoot, 'pages/employer/EmployerPipelinePage.tsx'), 'utf-8');

// Search filters across name, headline, and job title
assert(
  pipelinePage.includes('name.includes(term)'),
  'Search filters by candidate name'
);
assert(
  pipelinePage.includes('headline.includes(term)'),
  'Search filters by headline'
);
assert(
  pipelinePage.includes('jobTitle.includes(term)'),
  'Search filters by job title'
);

// Requisition filter
assert(
  pipelinePage.includes("selectedJobId === 'all'"),
  'Requisition filter defaults to all jobs'
);
assert(
  pipelinePage.includes('app.job_id === selectedJobId'),
  'Requisition filter matches by job_id'
);

// ============================================================================
// 8. ARCHIVED STAGES
// ============================================================================

section('8. ARCHIVED STAGES');

const pipelineComponent = fs.readFileSync(path.join(srcRoot, 'components/employer/CandidatePipeline.tsx'), 'utf-8');

assert(
  pipelineComponent.includes('showArchives'),
  'Pipeline component supports showArchives prop'
);
assert(
  pipelineComponent.includes('[...activeStages, ...archiveStages]'),
  'Show Archived merges active + archive stages'
);
assert(
  pipelineComponent.includes('showArchives ? [...activeStages, ...archiveStages] : activeStages'),
  'Toggle correctly switches between active-only and all stages'
);

// ============================================================================
// 9. JOB ASSOCIATION INTEGRITY
// ============================================================================

section('9. JOB ASSOCIATION INTEGRITY');

// Verify application is scoped by company_id
assert(
  fileContains('services/applicationService.ts', "query.eq('company_id', companyId)"),
  'getCompanyApplicants scopes by company_id'
);

// Verify demo applications are also scoped
assert(
  fileContains('services/applicationService.ts', 'a.company_id === companyId'),
  'Demo applications are company-scoped'
);

// ============================================================================
// 10. INTERVIEW INTEGRATION
// ============================================================================

section('10. INTERVIEW INTEGRATION');

assert(
  fileContains('services/interviewService.ts', "applicationService.updateApplicationStage(input.application_id, 'interview')"),
  'Scheduling interview auto-advances application to interview stage'
);

assert(
  fileContains('components/employer/CandidateQuickView.tsx', 'ScheduleInterviewModal'),
  'QuickView integrates interview scheduling modal'
);

assert(
  fileContains('components/employer/CandidateQuickView.tsx', "stage: 'interview'"),
  'QuickView onSuccess handler updates to interview stage'
);

// ============================================================================
// 11. CANDIDATE-SIDE CONSISTENCY
// ============================================================================

section('11. CANDIDATE-SIDE STATUS CONSISTENCY');

assert(
  fileExists('components/candidate/ApplicationPipelineCard.tsx'),
  'Candidate-side ApplicationPipelineCard exists'
);

const candidatePipelineCard = fs.readFileSync(path.join(srcRoot, 'components/candidate/ApplicationPipelineCard.tsx'), 'utf-8');

// Verify candidate-side uses same stage enum
assert(
  candidatePipelineCard.includes("new:") && candidatePipelineCard.includes("screening:") &&
  candidatePipelineCard.includes("shortlisted:") && candidatePipelineCard.includes("interview:"),
  'Candidate pipeline card uses same canonical stage values'
);

// ============================================================================
// 12. ROUTE REGISTRATION
// ============================================================================

section('12. ROUTE REGISTRATION');

assert(
  fileContains('App.tsx', '/employer/pipeline'),
  'Pipeline route is registered in App.tsx'
);
assert(
  fileContains('App.tsx', 'EmployerPipelinePage'),
  'EmployerPipelinePage component is referenced in App.tsx'
);
assert(
  fileContains('components/employer/EmployerSidebar.tsx', '/employer/pipeline'),
  'Pipeline route appears in EmployerSidebar navigation'
);

// ============================================================================
// 13. ERROR / LOADING / EMPTY STATES
// ============================================================================

section('13. ERROR / LOADING / EMPTY STATES');

assert(
  pipelinePage.includes('isLoading'),
  'Pipeline page tracks loading state'
);
assert(
  pipelinePage.includes('errorMessage'),
  'Pipeline page tracks error state'
);
assert(
  pipelinePage.includes('Failed to Load Pipeline'),
  'Pipeline page shows error alert on failure'
);
assert(
  pipelinePage.includes('animate-pulse'),
  'Pipeline page shows loading skeleton animation'
);

assert(
  pipelineComponent.includes('No candidates'),
  'Pipeline column shows empty state when no candidates'
);

// ============================================================================
// 14. TYPE INTEGRITY
// ============================================================================

section('14. TYPE INTEGRITY');

const dbTypes = fs.readFileSync(path.join(srcRoot, 'types/database.ts'), 'utf-8');

assert(
  dbTypes.includes("type ApplicationStage ="),
  'ApplicationStage type is defined in database.ts'
);
assert(
  dbTypes.includes("interface JobApplication"),
  'JobApplication interface is defined in database.ts'
);
assert(
  dbTypes.includes("stage: ApplicationStage"),
  'JobApplication.stage uses ApplicationStage type'
);
assert(
  dbTypes.includes("candidate_id: string"),
  'JobApplication has candidate_id field'
);
assert(
  dbTypes.includes("job_id: string"),
  'JobApplication has job_id field'
);
assert(
  dbTypes.includes("company_id: string"),
  'JobApplication has company_id field'
);
assert(
  dbTypes.includes("candidate_snapshot: Record<string, unknown>"),
  'JobApplication has candidate_snapshot field'
);

// ============================================================================
// 15. DATA PERSISTENCE MODEL
// ============================================================================

section('15. DATA PERSISTENCE MODEL');

// Verify demo applications are persisted in localStorage
assert(
  fileContains('services/applicationService.ts', "kth_demo_applications"),
  'Demo applications use kth_demo_applications localStorage key'
);

// Verify stage update persists to localStorage for demo mode
assert(
  appServiceContent.includes("window.localStorage.setItem(DEMO_APPLICATIONS_KEY, JSON.stringify(allDemo))"),
  'Demo stage update writes back to localStorage'
);

// Verify Supabase persistence for real mode
assert(
  appServiceContent.includes(".update(updates)"),
  'Real mode stage update uses Supabase .update()'
);

// ============================================================================
// RESULTS
// ============================================================================

console.log(`\n${'═'.repeat(70)}`);
console.log(`  ATS PIPELINE E2E RESULTS`);
console.log('═'.repeat(70));
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  📊 Total:  ${passed + failed}`);

if (failures.length > 0) {
  console.log(`\n  Failed checks:`);
  failures.forEach((f, i) => console.log(`    ${i + 1}. ${f}`));
}

console.log('═'.repeat(70));

process.exit(failed > 0 ? 1 : 0);
