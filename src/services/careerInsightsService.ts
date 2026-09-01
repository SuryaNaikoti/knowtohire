/**
 * KnowToHire Career Insights & Authoritative Matching Service
 *
 * Core Principles:
 * 1. SINGLE SOURCE OF TRUTH:
 *    - Authenticated Candidate Profile (headline, domain, verified skills, experience, education, certifications, location, employment preferences)
 *    - Active Resume and ATS metadata
 *    - Published real job openings across the platform
 *    - Genuine Knowledge Hub resources for learning guides
 * 2. DOMAIN-FIRST RELEVANT JOB FILTERING:
 *    - Prioritizes jobs belonging strictly to the candidate's verified career domain.
 *    - Never allows cross-domain jobs (Environmental/IPR/Patent for a Tech candidate) to become the target role or populate the Career Opportunity Map.
 * 3. SINGLE AUTHORITATIVE MATCH ENGINE:
 *    - Evaluates Candidate ↔ Job compatibility deterministically.
 *    - Same calculation powers: Target Role, Overall Match Score, Progression Alignment, Why This Score Breakdown, Verified Strengths, Identified Gaps, Opportunity Map, and Improve My Match.
 * 4. ABSOLUTELY NO CONTRADICTIONS:
 *    - Skills Alignment count ("X of Y core technical requirements matched directly") strictly equals the count of Target Job requirements matched by the candidate's verified skills.
 *    - Verified Skill Strengths displays the exact skills that match the target role.
 *    - Identified Skill Gaps displays the exact missing skills from the target role and relevant domain market openings.
 *    - Location and employment preferences directly mirror the candidate's profile (e.g. Hyderabad, never hardcoded Bengaluru).
 */

import { candidateProfileService } from './candidateProfileService';
import { resumeService } from './resumeService';
import { CandidateFullProfile } from './types';
import { jobService, Job } from './jobService';
import { knowledgeService, KnowledgeResource } from './knowledgeService';
import { ServiceResult, normalizeServiceError } from './types';
import { cleanSkillArray, isValidSkill } from '@/utils/skillValidation';

export interface CareerMatchExplanation {
  factor: string;
  weightPct: number;
  scorePct: number;
  ratingLabel: 'Excellent' | 'Strong' | 'Developing' | 'Limited' | 'Compatible';
  reason: string;
  isPositive: boolean;
}

export interface GrowthSkillRecommendation {
  skill: string;
  demandPercentage: number | null;
  reason: string;
  recommendedResource: {
    id: string;
    title: string;
    slug?: string;
    category: string;
    url: string;
    isAvailable: boolean;
  } | null;
}

export interface CareerOpportunityRole {
  roleTitle: string;
  jobId: string;
  matchScore: number;
  openingsCount: number;
  salaryRange: string;
  keyStrengths: string[];
  keyMissingSkills: string[];
  isTopMatch: boolean;
}

export interface ActionRecommendation {
  id: string;
  title: string;
  description: string;
  impactLevel: 'High impact' | 'Medium impact' | 'Opportunity';
  actionType: 'skill' | 'experience' | 'resume' | 'jobs' | 'resource';
  actionLabel: string;
  actionUrl: string;
}

export interface SingleJobMatchResult {
  job: Job;
  overallScore: number;
  skillScore: number;
  expScore: number;
  roleScore: number;
  eduScore: number;
  domainScore: number;
  locScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  totalRequiredSkillsCount: number;
  explanations: CareerMatchExplanation[];
  isDomainRelevant: boolean;
}

export interface CareerIntelligenceResult {
  // 1. Current Career Position (Directly from Profile & Resume)
  currentTitle: string;
  currentDomain: string;
  yearsOfExperience: number;
  verifiedSkillsCount: number;
  verifiedSkills: string[];
  location: string;
  employmentPreference: string;

  // 2. Strongest Current Alignment & Target Role
  targetRoleTitle: string;
  targetRoleId?: string;
  targetSalaryRange: string;
  marketOpeningsCount: number;
  totalMarketJobsCount: number;
  matchScore: number;

  // 3. Career Opportunity Map (Ranked multi-role comparisons)
  opportunities: CareerOpportunityRole[];

  // 4. Authoritative Explainable Dimensions Breakdown
  explanations: CareerMatchExplanation[];

  // 5. Verified Skill Strengths (Genuinely matched)
  matchedSkills: string[];

  // 6. Identified Skill Gaps with Dynamic Market Demand
  growthSkillRecommendations: GrowthSkillRecommendation[];

  // 7. Improve My Match & Recommended Next Actions
  recommendedActions: ActionRecommendation[];

  // State flags
  hasSufficientProfileData: boolean;
  hasSufficientMarketData: boolean;
  emptyStateReason?: string;
}

function normalize(str?: string | null): string {
  return (str || '').toLowerCase().trim();
}

/**
 * Conservative and explainable skill matcher.
 */
export function matchesSkill(skillA: string, skillB: string): boolean {
  const a = normalize(skillA);
  const b = normalize(skillB);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const aliases: Record<string, string[]> = {
    'react': ['react.js', 'reactjs', 'react & typescript', 'react / typescript'],
    'typescript': ['ts', 'react & typescript', 'react / typescript', 'typed javascript'],
    'javascript': ['js', 'es6', 'web development'],
    'node': ['node.js', 'nodejs', 'node & express', 'node.js & api architecture'],
    'api': ['rest api', 'rest apis', 'api architecture', 'graphql', 'grpc'],
    'aws': ['amazon web services', 'cloud infrastructure (aws/gcp)', 'cloud (aws)', 'aws / gcp'],
    'gcp': ['google cloud', 'google cloud platform', 'cloud infrastructure (aws/gcp)'],
    'sql': ['postgresql', 'mysql', 'database systems & sql', 'database systems', 'relational database'],
    'docker': ['containers', 'containerization'],
    'kubernetes': ['k8s', 'container orchestration'],
    'terraform': ['iac', 'infrastructure as code'],
    'ci/cd': ['ci/cd & devops automation', 'devops automation', 'continuous integration'],
    'esg': ['esg compliance', 'esg reporting', 'environmental social governance'],
    'brsr': ['brsr core', 'brsr reporting', 'sebi brsr'],
    'ghg': ['ghg protocol', 'carbon accounting', 'scope 1 2 3'],
    'eia': ['environmental impact assessment', 'eia assessment', 'environmental clearance'],
  };

  for (const [key, group] of Object.entries(aliases)) {
    const isAInGroup = a === key || group.some((g) => a === g || (g.length > 4 && (a.includes(g) || g.includes(a))));
    const isBInGroup = b === key || group.some((g) => b === g || (g.length > 4 && (b.includes(g) || g.includes(b))));
    if (isAInGroup && isBInGroup) return true;
  }

  return false;
}

export function isSoftwareOrTechDomain(title: string, domain: string, skills: string[]): boolean {
  const text = `${title} ${domain} ${skills.join(' ')}`.toLowerCase();

  // If the job is clearly in an environmental, sustainability, ESG, clean energy, or IPR domain,
  // do NOT classify it as software/tech even if it contains 'engineer' or 'technology'.
  const isEnvironmental =
    text.includes('sustainability') ||
    text.includes('esg') ||
    text.includes('environmental') ||
    text.includes('carbon') ||
    text.includes('climate') ||
    text.includes('brsr') ||
    text.includes('eia') ||
    text.includes('ehs') ||
    text.includes('ecology') ||
    text.includes('clean energy') ||
    text.includes('renewable') ||
    text.includes('net zero') ||
    text.includes('decarbonization') ||
    text.includes('energy transition') ||
    text.includes('policy research') ||
    text.includes('public policy') ||
    text.includes('white papers') ||
    text.includes('patent') ||
    text.includes('ipr') ||
    text.includes('intellectual property') ||
    text.includes('prior art');

  // Strong tech signals that are unambiguous
  const hasStrongTechSignal =
    text.includes('developer') ||
    text.includes('full stack') ||
    text.includes('frontend') ||
    text.includes('backend') ||
    text.includes('software') ||
    text.includes('devops') ||
    text.includes('react') ||
    text.includes('node.js') ||
    text.includes('typescript') ||
    text.includes('javascript') ||
    text.includes('kubernetes') ||
    text.includes('docker') ||
    text.includes('terraform') ||
    text.includes('ci/cd') ||
    text.includes('microservice') ||
    text.includes('api architecture');

  // If it's clearly environmental/ESG/IPR/Policy, it's NOT tech
  if (isEnvironmental) return false;

  // If there are strong tech signals, it's tech
  if (hasStrongTechSignal) return true;

  // Weaker signals that are only tech-indicative when NOT in an environmental context
  return (
    text.includes('cloud') ||
    text.includes('engineer') ||
    text.includes('web') ||
    text.includes('solutions') ||
    text.includes('technology') ||
    text.includes('systems') ||
    text.includes('architect')
  );
}

export function isSustainabilityDomain(title: string, domain: string, skills: string[]): boolean {
  const text = `${title} ${domain} ${skills.join(' ')}`.toLowerCase();
  return (
    text.includes('sustainability') ||
    text.includes('esg') ||
    text.includes('environmental') ||
    text.includes('carbon') ||
    text.includes('climate') ||
    text.includes('brsr') ||
    text.includes('eia') ||
    text.includes('ehs') ||
    text.includes('ecology') ||
    text.includes('clean energy') ||
    text.includes('renewable') ||
    text.includes('net zero') ||
    text.includes('decarbonization') ||
    text.includes('energy transition')
  );
}

export function isPatentOrIPRDomain(title: string, domain: string, skills: string[]): boolean {
  const text = `${title} ${domain} ${skills.join(' ')}`.toLowerCase();
  return (
    text.includes('patent') ||
    text.includes('ipr') ||
    text.includes('intellectual property') ||
    text.includes('prior art') ||
    text.includes('freedom to operate') ||
    text.includes('trademark')
  );
}

function getRatingTier(scorePct: number): 'Excellent' | 'Strong' | 'Developing' | 'Limited' {
  if (scorePct >= 90) return 'Excellent';
  if (scorePct >= 75) return 'Strong';
  if (scorePct >= 60) return 'Developing';
  return 'Limited';
}

/**
 * Centralized Single Match Engine for Candidate ↔ Job compatibility.
 */
export function calculateCandidateJobMatch(
  profile: CandidateFullProfile | null,
  job: Job,
  candidateSkills: string[],
  yearsOfExperience: number
): SingleJobMatchResult {
  const jobSkills: string[] = cleanSkillArray(job.skills);
  const jobTitleNorm = normalize(job.title);
  const jobCategoryNorm = normalize(job.category);
  const jobLocationNorm = normalize(job.location);
  const currentTitle = profile?.headline?.trim() || 'Software Engineer';
  const currentDomain = profile?.domainSpecialization?.trim() || 'Software Engineering';
  const candidateLocation = profile?.location?.trim() || '';
  const candidateTitleNorm = normalize(currentTitle);
  const candidateDomainNorm = normalize(currentDomain);

  // Check Candidate and Job Domain Affiliations
  const isCandidateTech = isSoftwareOrTechDomain(currentTitle, currentDomain, candidateSkills);
  const isCandidateESG = isSustainabilityDomain(currentTitle, currentDomain, candidateSkills);
  const isCandidateIPR = isPatentOrIPRDomain(currentTitle, currentDomain, candidateSkills);

  const isJobTech = isSoftwareOrTechDomain(job.title, job.category || '', jobSkills);
  const isJobESG = isSustainabilityDomain(job.title, job.category || '', jobSkills);
  const isJobIPR = isPatentOrIPRDomain(job.title, job.category || '', jobSkills);

  let isDomainRelevant = true;
  // Tech candidate: ESG/IPR jobs are NEVER relevant, regardless of weak tech signals
  if (isCandidateTech && !isCandidateESG && (isJobESG || isJobIPR)) {
    isDomainRelevant = false;
  }
  // ESG candidate: pure tech jobs (without ESG overlap) are not relevant
  if (isCandidateESG && !isCandidateTech && isJobTech && !isJobESG) {
    isDomainRelevant = false;
  }
  // IPR candidate: non-IPR jobs are not relevant
  if (isCandidateIPR && !isCandidateTech && !isCandidateESG && !isJobIPR) {
    isDomainRelevant = false;
  }

  // 1. Skills Alignment (35%)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  if (jobSkills.length > 0) {
    for (const js of jobSkills) {
      if (candidateSkills.some((cs) => matchesSkill(cs, js))) {
        matchedSkills.push(js);
      } else {
        missingSkills.push(js);
      }
    }
  } else {
    const descNorm = normalize(job.description);
    for (const cs of candidateSkills) {
      if (descNorm.includes(normalize(cs))) {
        matchedSkills.push(cs);
      }
    }
  }

  const totalRequired = jobSkills.length > 0 ? jobSkills.length : candidateSkills.length || 1;
  const skillMatchRatio = matchedSkills.length / totalRequired;
  const skillScore = Math.min(100, Math.round(skillMatchRatio * 100));

  // 2. Experience Alignment (25%)
  let expScore = 70;
  const jobExpLevel = job.experience_level || 'mid_level';
  if (jobExpLevel === 'fresher') {
    expScore = 95;
  } else if (jobExpLevel === 'associate' || jobExpLevel === 'mid_level') {
    expScore = yearsOfExperience >= 2 ? 90 : 65;
  } else if (jobExpLevel === 'senior' || jobExpLevel === 'lead') {
    expScore = yearsOfExperience >= 4 ? 90 : 55;
  } else if (jobExpLevel === 'executive') {
    expScore = yearsOfExperience >= 8 ? 85 : 45;
  }

  // 3. Role Seniority & Title Alignment (15%)
  let roleScore = 40;
  const titleTokens = jobTitleNorm.split(/[\s,&/-]+/).filter((t) => t.length > 2);
  const candidateTokens = candidateTitleNorm.split(/[\s,&/-]+/).filter((t) => t.length > 2);
  const overlapCount = titleTokens.filter((t) => candidateTokens.includes(t)).length;
  if (overlapCount >= 2) roleScore = 95;
  else if (overlapCount === 1) roleScore = 80;
  else if (candidateTitleNorm.includes('engineer') && jobTitleNorm.includes('engineer')) roleScore = 75;
  else if (candidateTitleNorm.includes('architect') && jobTitleNorm.includes('architect')) roleScore = 80;
  else if (candidateTitleNorm.includes('consultant') && jobTitleNorm.includes('consultant')) roleScore = 75;

  // 4. Education & Certifications (10%)
  const educationList = Array.isArray(profile?.education) ? profile.education : [];
  const certsList = Array.isArray(profile?.certifications) ? profile.certifications : [];
  let eduScore = 70;
  if (educationList.length >= 1) eduScore += 15;
  if (certsList.length >= 1) eduScore += 15;
  eduScore = Math.min(100, eduScore);

  // 5. Domain Alignment (10%)
  let domainScore = 40;
  if (isDomainRelevant) {
    if (candidateDomainNorm && jobCategoryNorm && (candidateDomainNorm.includes(jobCategoryNorm) || jobCategoryNorm.includes(candidateDomainNorm))) {
      domainScore = 95;
    } else {
      domainScore = 85;
    }
  } else {
    domainScore = 15;
  }

  // 6. Location & Work Mode (5%)
  let locScore = 70;
  if (job.is_remote) {
    locScore = 100;
  } else if (candidateLocation && jobLocationNorm && (normalize(candidateLocation).includes(jobLocationNorm) || jobLocationNorm.includes(normalize(candidateLocation)))) {
    locScore = 95;
  }

  // Overall Weighted Score
  let overallScore = Math.round(
    skillScore * 0.35 +
    expScore * 0.25 +
    roleScore * 0.15 +
    eduScore * 0.10 +
    domainScore * 0.10 +
    locScore * 0.05
  );

  if (!isDomainRelevant) {
    overallScore = Math.min(overallScore, 35);
  }

  const explanations: CareerMatchExplanation[] = [
    {
      factor: 'Skills Alignment',
      weightPct: 35,
      scorePct: skillScore,
      ratingLabel: getRatingTier(skillScore),
      reason: `${matchedSkills.length} of ${totalRequired} core technical requirements matched directly.`,
      isPositive: skillScore >= 60,
    },
    {
      factor: 'Experience Alignment',
      weightPct: 25,
      scorePct: expScore,
      ratingLabel: getRatingTier(expScore),
      reason: `${yearsOfExperience}+ years relevant experience evaluated for ${job.experience_level?.replace('_', ' ') || 'role level'}.`,
      isPositive: expScore >= 70,
    },
    {
      factor: 'Seniority Alignment',
      weightPct: 15,
      scorePct: roleScore,
      ratingLabel: getRatingTier(roleScore),
      reason: `Seniority compatibility derived from headline "${currentTitle}".`,
      isPositive: roleScore >= 60,
    },
    {
      factor: 'Domain Alignment',
      weightPct: 20,
      scorePct: Math.round((domainScore + eduScore) / 2),
      ratingLabel: getRatingTier(domainScore),
      reason: isDomainRelevant
        ? 'Direct domain compatibility with verified credentials.'
        : 'Cross-domain requisition with limited primary alignment.',
      isPositive: isDomainRelevant,
    },
    {
      factor: 'Location & Work Preference',
      weightPct: 5,
      scorePct: locScore,
      ratingLabel: 'Compatible',
      reason: job.is_remote
        ? `Fully Remote — compatible with ${candidateLocation || 'any location'}.`
        : candidateLocation && normalize(candidateLocation).includes(jobLocationNorm)
        ? `Job in ${job.location} matches your location (${candidateLocation}).`
        : `Job in ${job.location} (Candidate: ${candidateLocation || 'Not specified'}).`,
      isPositive: locScore >= 70,
    },
  ];

  return {
    job,
    overallScore,
    skillScore,
    expScore,
    roleScore,
    eduScore,
    domainScore,
    locScore,
    matchedSkills,
    missingSkills,
    totalRequiredSkillsCount: totalRequired,
    explanations,
    isDomainRelevant,
  };
}

export const careerInsightsService = {
  /**
   * Computes authoritative, deterministic career intelligence for the authenticated candidate.
   */
  async getCareerInsights(): Promise<ServiceResult<CareerIntelligenceResult>> {
    try {
      // 1. Fetch Candidate Profile, Published Jobs, and Knowledge Resources in parallel
      const [profileRes, jobsRes, resourcesRes] = await Promise.all([
        candidateProfileService.getMyCandidateProfile(),
        jobService.getPublishedJobs({ pageSize: 50 }),
        knowledgeService.getResources(),
      ]);

      const profile = profileRes.data;
      let rawJobs: Job[] = jobsRes.data?.data || [];
      const allResources: KnowledgeResource[] = resourcesRes.data || [];

      // 1.1 Fetch & Extract Individual Candidate Resume Data
      const candidateId = profile?.id || '00000000-0000-0000-0000-000000000001';
      const storedResume = resumeService.getStoredDemoResume(candidateId);
      const resumeAnalysis = storedResume?.atsAnalysis;

      // Extract candidate data dynamically from single source of truth (merging Profile + Parsed Resume)
      const resumeExtractedSkills = cleanSkillArray(resumeAnalysis?.matchedKeywords || []);
      const profileSkills = cleanSkillArray(profile?.skills || []);
      const mergedSkills = Array.from(new Set([...profileSkills, ...resumeExtractedSkills]));

      const currentTitle = profile?.headline?.trim() || resumeAnalysis?.matchedDomain || 'Software Engineer & Professional';
      const currentDomain = profile?.domainSpecialization?.trim() || resumeAnalysis?.matchedDomain || 'Software Engineering';
      const candidateSkills = mergedSkills;
      const experienceList = Array.isArray(profile?.experience) ? profile.experience : [];
      const candidateLocation = profile?.location?.trim() || 'Location Not Specified';
      const employmentPreference = profile?.employmentPreference || 'Full-Time / Hybrid';

      // Estimate total years of candidate experience from history or resume score
      const yearsOfExperience = experienceList.length > 0
        ? Math.max(experienceList.length * 2, 3)
        : (resumeAnalysis?.experienceYearsCalculated || (candidateSkills.length >= 5 ? 3 : 1));

      // Check for profile data sufficiency
      if (candidateSkills.length === 0 && experienceList.length === 0) {
        return {
          data: {
            currentTitle,
            currentDomain,
            yearsOfExperience,
            verifiedSkillsCount: candidateSkills.length,
            verifiedSkills: candidateSkills,
            location: candidateLocation,
            employmentPreference,
            targetRoleTitle: 'Profile Assessment Needed',
            targetSalaryRange: 'Salary not disclosed',
            marketOpeningsCount: 0,
            totalMarketJobsCount: rawJobs.length,
            matchScore: 0,
            opportunities: [],
            matchedSkills: [],
            growthSkillRecommendations: [],
            explanations: [],
            recommendedActions: [
              {
                id: 'action-complete-profile',
                title: 'Complete Candidate Profile',
                description: 'Add your verified skills, experience, and education to generate real market matching.',
                impactLevel: 'High impact',
                actionType: 'skill',
                actionLabel: 'Edit Profile',
                actionUrl: '/candidate/profile/edit',
              },
              {
                id: 'action-upload-resume',
                title: 'Upload Active Resume',
                description: 'Upload your verified resume to sync credentials and unlock career intelligence.',
                impactLevel: 'High impact',
                actionType: 'resume',
                actionLabel: 'Upload Resume',
                actionUrl: '/candidate/resume',
              },
            ],
            hasSufficientProfileData: false,
            hasSufficientMarketData: rawJobs.length > 0,
            emptyStateReason: 'Upload your resume or add your verified skills and experience to compute role matching.',
          },
          error: null,
        };
      }

      // Filter and clean all jobs with skill validation
      const allJobs: Job[] = rawJobs.map((j) => ({
        ...j,
        skills: cleanSkillArray(j.skills),
      }));

      // 2. Score All Jobs using Single Match Engine
      const scoredResults: SingleJobMatchResult[] = allJobs.map((job) =>
        calculateCandidateJobMatch(profile, job, candidateSkills, yearsOfExperience)
      );

      // DOMAIN-FIRST RELEVANT JOB FILTERING
      const domainRelevantResults = scoredResults.filter((sr) => sr.isDomainRelevant);

      if (domainRelevantResults.length === 0) {
        return {
          data: {
            currentTitle,
            currentDomain,
            yearsOfExperience,
            verifiedSkillsCount: candidateSkills.length,
            verifiedSkills: candidateSkills,
            location: candidateLocation,
            employmentPreference,
            targetRoleTitle: currentTitle,
            targetSalaryRange: 'Salary not disclosed',
            marketOpeningsCount: 0,
            totalMarketJobsCount: allJobs.length,
            matchScore: 0,
            opportunities: [],
            matchedSkills: candidateSkills.slice(0, 4),
            growthSkillRecommendations: [],
            explanations: [
              {
                factor: 'Domain Inventory',
                weightPct: 100,
                scorePct: 0,
                ratingLabel: 'Limited',
                reason: `No active job requisitions currently available in your primary domain (${currentDomain}).`,
                isPositive: false,
              },
            ],
            recommendedActions: [
              {
                id: 'action-explore-jobs',
                title: 'Explore Available Jobs',
                description: 'Browse all published openings across the platform.',
                impactLevel: 'Opportunity',
                actionType: 'jobs',
                actionLabel: 'Explore Jobs',
                actionUrl: '/candidate/jobs',
              },
            ],
            hasSufficientProfileData: true,
            hasSufficientMarketData: false,
            emptyStateReason: `No active openings currently available in your career domain (${currentDomain}).`,
          },
          error: null,
        };
      }

      // Sort domain-relevant jobs by highest match score
      domainRelevantResults.sort((a, b) => b.overallScore - a.overallScore);

      const best = domainRelevantResults[0];
      const targetJob = best.job;
      const targetRoleTitle = targetJob.title || currentTitle;

      // Build Career Opportunity Map (Ranked multi-role comparisons strictly within domain)
      const opportunities: CareerOpportunityRole[] = domainRelevantResults.slice(0, 4).map((sr, idx) => {
        const j = sr.job;
        let salRange = 'Salary not disclosed';
        if (j.min_salary_inr && j.max_salary_inr && j.min_salary_inr > 0) {
          const minL = (j.min_salary_inr / 100000).toFixed(1).replace('.0', '');
          const maxL = (j.max_salary_inr / 100000).toFixed(1).replace('.0', '');
          salRange = `₹${minL}L – ₹${maxL}L/yr`;
        }

        const roleOpenings = allJobs.filter((oj) => {
          const oTitle = normalize(oj.title);
          const jTitle = normalize(j.title);
          return oTitle.includes(jTitle) || jTitle.includes(oTitle);
        }).length || 1;

        return {
          roleTitle: j.title,
          jobId: j.id,
          matchScore: sr.overallScore,
          openingsCount: roleOpenings,
          salaryRange: salRange,
          keyStrengths: sr.matchedSkills.slice(0, 3),
          keyMissingSkills: sr.missingSkills.slice(0, 2),
          isTopMatch: idx === 0,
        };
      });

      // Count truly relevant verified openings in candidate domain
      const isCandidateTech = isSoftwareOrTechDomain(currentTitle, currentDomain, candidateSkills);
      const isCandidateESG = isSustainabilityDomain(currentTitle, currentDomain, candidateSkills);

      const relevantOpenings = allJobs.filter((j) => {
        const jTitle = normalize(j.title);
        const tTitle = normalize(targetRoleTitle);
        const isJobInDomain = isCandidateTech
          ? isSoftwareOrTechDomain(j.title, j.category || '', j.skills || [])
          : isCandidateESG
          ? isSustainabilityDomain(j.title, j.category || '', j.skills || [])
          : true;

        return isJobInDomain && (jTitle.includes(tTitle) || tTitle.includes(jTitle) || normalize(j.category) === normalize(targetJob.category));
      }).length;

      // Format target salary range
      let targetSalaryRange = 'Salary not disclosed';
      if (targetJob.min_salary_inr && targetJob.max_salary_inr && targetJob.min_salary_inr > 0) {
        const minL = (targetJob.min_salary_inr / 100000).toFixed(1).replace('.0', '');
        const maxL = (targetJob.max_salary_inr / 100000).toFixed(1).replace('.0', '');
        targetSalaryRange = `₹${minL}L – ₹${maxL}L/yr`;
      } else if (targetJob.min_salary_inr && targetJob.min_salary_inr > 0) {
        const minL = (targetJob.min_salary_inr / 100000).toFixed(1).replace('.0', '');
        targetSalaryRange = `From ₹${minL}L/yr`;
      }

      // 3. Calculate Market-Wide Skill Demand across relevant job inventory
      const skillDemandCounts: Record<string, number> = {};
      const relevantMarketJobs = allJobs.filter((j) => {
        return isCandidateTech
          ? isSoftwareOrTechDomain(j.title, j.category || '', j.skills || [])
          : isCandidateESG
          ? isSustainabilityDomain(j.title, j.category || '', j.skills || [])
          : true;
      });

      const poolSize = relevantMarketJobs.length;

      for (const j of relevantMarketJobs) {
        const sList = cleanSkillArray(j.skills);
        for (const s of sList) {
          skillDemandCounts[s] = (skillDemandCounts[s] || 0) + 1;
        }
      }

      // Verified Skill Strengths: Candidate verified skills that directly match target role requirements
      const targetMatchedSkills = best.matchedSkills;
      const otherDomainSkills = candidateSkills.filter((cs) =>
        !targetMatchedSkills.some((ms) => matchesSkill(cs, ms)) &&
        Object.keys(skillDemandCounts).some((ds) => matchesSkill(cs, ds))
      );
      const displayStrengths = targetMatchedSkills.length > 0
        ? Array.from(new Set([...targetMatchedSkills, ...otherDomainSkills]))
        : candidateSkills.filter((cs) => Object.keys(skillDemandCounts).some((ds) => matchesSkill(cs, ds)));

      // Identified Skill Gaps: (Target Job Requirements MINUS Candidate Skills) + Closely Related Domain Market Gaps
      const targetJobMissing = cleanSkillArray(best.missingSkills).filter(
        (ms) => !candidateSkills.some((cs) => matchesSkill(cs, ms))
      );

      // Extract additional missing skills strictly from domain-relevant market jobs
      const domainMarketGaps: string[] = [];
      for (const j of relevantMarketJobs) {
        for (const s of cleanSkillArray(j.skills)) {
          if (
            isValidSkill(s) &&
            !candidateSkills.some((cs) => matchesSkill(cs, s)) &&
            !targetJobMissing.some((ts) => matchesSkill(ts, s)) &&
            !domainMarketGaps.some((dg) => matchesSkill(dg, s))
          ) {
            domainMarketGaps.push(s);
          }
        }
      }

      // Order gaps: Target role missing requirements first, followed by high-demand domain technical skills
      const uniqueGaps = Array.from(new Set([...targetJobMissing, ...domainMarketGaps]));

      // Growth Skills with dynamically calculated percentages or sample size disclaimers
      const growthSkillRecommendations: GrowthSkillRecommendation[] = uniqueGaps.slice(0, 4).map((skill) => {
        const occurrences = skillDemandCounts[skill] || 1;
        const demandPct = poolSize >= 3 ? Math.round((occurrences / poolSize) * 100) : null;

        // Match with real Knowledge Hub Resources
        const matchingResource = allResources.find((r) => {
          const rTitle = normalize(r.title);
          const rDesc = normalize(r.description);
          const rTags = Array.isArray(r.tags) ? r.tags.map(normalize) : [];
          const sNorm = normalize(skill);
          return rTitle.includes(sNorm) || rDesc.includes(sNorm) || rTags.some((t) => t.includes(sNorm));
        });

        const reason = demandPct !== null
          ? `Required in ${demandPct}% of relevant openings for ${targetRoleTitle}.`
          : `High-relevance requirement identified for ${targetRoleTitle} (limited market sample).`;

        return {
          skill,
          demandPercentage: demandPct,
          reason,
          recommendedResource: matchingResource
            ? {
                id: matchingResource.id,
                title: matchingResource.title,
                slug: matchingResource.slug,
                category: matchingResource.category || 'Study Guide',
                url: `/knowledge/${matchingResource.slug || matchingResource.id}`,
                isAvailable: true,
              }
            : null,
        };
      });

      // 4. Build Concrete, Actionable Next Actions
      const recommendedActions: ActionRecommendation[] = [];

      if (growthSkillRecommendations.length > 0) {
        const topGap = growthSkillRecommendations[0];
        if (topGap.recommendedResource?.isAvailable) {
          recommendedActions.push({
            id: 'action-learn-skill',
            title: `Strengthen ${topGap.skill}`,
            description: `High relevance for ${targetRoleTitle}. Access structured study material from the Knowledge Hub.`,
            impactLevel: 'High impact',
            actionType: 'resource',
            actionLabel: 'View Study Guide',
            actionUrl: topGap.recommendedResource.url,
          });
        } else {
          recommendedActions.push({
            id: 'action-add-skill',
            title: `Add ${topGap.skill} to Profile`,
            description: `Required by relevant openings. Add demonstrated projects or certifications to increase alignment.`,
            impactLevel: 'High impact',
            actionType: 'skill',
            actionLabel: 'Update Profile Skills',
            actionUrl: '/candidate/profile/edit',
          });
        }
      }

      recommendedActions.push({
        id: 'action-optimize-resume',
        title: `Optimize Resume for ${targetRoleTitle}`,
        description: `Run ATS keyword analysis against your target requisition to elevate role matching.`,
        impactLevel: 'Medium impact',
        actionType: 'resume',
        actionLabel: 'Optimize Resume',
        actionUrl: '/candidate/resume',
      });

      recommendedActions.push({
        id: 'action-view-jobs',
        title: `Explore Matching Openings`,
        description: `${relevantOpenings} relevant openings currently available in ${currentDomain}.`,
        impactLevel: 'Opportunity',
        actionType: 'jobs',
        actionLabel: 'View Matching Jobs',
        actionUrl: `/candidate/jobs?keyword=${encodeURIComponent(targetRoleTitle)}`,
      });

      return {
        data: {
          currentTitle,
          currentDomain,
          yearsOfExperience,
          verifiedSkillsCount: candidateSkills.length,
          verifiedSkills: candidateSkills,
          location: candidateLocation,
          employmentPreference,
          targetRoleTitle,
          targetRoleId: targetJob.id,
          targetSalaryRange,
          marketOpeningsCount: relevantOpenings,
          totalMarketJobsCount: allJobs.length,
          matchScore: best.overallScore,
          opportunities,
          matchedSkills: displayStrengths,
          growthSkillRecommendations,
          explanations: best.explanations,
          recommendedActions,
          hasSufficientProfileData: true,
          hasSufficientMarketData: true,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
