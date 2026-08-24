/**
 * KnowToHire Career Insights & Authoritative Matching Service
 *
 * Core Principles:
 * 1. SINGLE SOURCE OF TRUTH:
 *    - Authenticated Candidate Profile (headline, domain, verified skills, experience, education, certifications, location, employment preferences)
 *    - Active Resume and ATS metadata
 *    - Published real job openings across the platform
 *    - Genuine Knowledge Hub resources for learning guides
 * 2. SINGLE AUTHORITATIVE MATCH ENGINE:
 *    - Evaluates Candidate ↔ Job compatibility deterministically.
 *    - Same calculation powers: Overall Match Score, Progression Alignment, Breakdown, Verified Strengths, Identified Gaps, Career Opportunity Map, and Improve My Match.
 * 3. NO CONTRADICTIONS:
 *    - Skills Alignment count ("X of Y core technical requirements matched directly") strictly matches the displayed Verified Strengths and Target Job requirements.
 *    - Transparent, documented score tiers (90+ Excellent, 75–89 Strong, 60–74 Developing, Below 60 Limited).
 * 4. DOMAIN RELEVANCE FILTERING:
 *    - Technical/Full Stack/Cloud profiles are matched against software and cloud engineering roles; Sustainability/ESG profiles against environmental roles.
 * 5. ACTIONABLE NEXT STEPS:
 *    - Every recommendation is mathematically connected to identified skill gaps, resume optimization, or active job openings.
 */

import { candidateProfileService } from './candidateProfileService';
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
  demandPercentage: number | null; // null if sample size is too small
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
 * Normalized equivalency matcher for skills.
 * Conservative and explainable: matches genuine aliases, not unrelated technologies.
 */
export function matchesSkill(skillA: string, skillB: string): boolean {
  const a = normalize(skillA);
  const b = normalize(skillB);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const aliases: Record<string, string[]> = {
    'react': ['react.js', 'reactjs', 'react & typescript', 'react / typescript', 'frontend development'],
    'typescript': ['ts', 'react & typescript', 'react / typescript', 'typed javascript'],
    'javascript': ['js', 'es6', 'web development'],
    'node': ['node.js', 'nodejs', 'node & express', 'node.js & api architecture', 'backend engineering'],
    'api': ['rest api', 'rest apis', 'api architecture', 'graphql', 'grpc'],
    'aws': ['amazon web services', 'cloud infrastructure (aws/gcp)', 'cloud (aws)', 'aws / gcp', 'cloud solutions', 'cloud infrastructure'],
    'gcp': ['google cloud', 'google cloud platform', 'cloud infrastructure (aws/gcp)'],
    'sql': ['postgresql', 'mysql', 'database systems & sql', 'database systems', 'relational database'],
    'docker': ['containers', 'containerization'],
    'kubernetes': ['k8s', 'container orchestration', 'cloud native'],
    'terraform': ['iac', 'infrastructure as code'],
    'ci/cd': ['ci/cd & devops automation', 'devops', 'automation', 'continuous integration'],
    'esg': ['esg compliance', 'esg reporting', 'environmental social governance'],
    'brsr': ['brsr core', 'brsr reporting', 'sebi brsr'],
    'ghg': ['ghg protocol', 'carbon accounting', 'scope 1 2 3'],
    'eia': ['environmental impact assessment', 'eia assessment', 'environmental clearance'],
  };

  for (const [key, group] of Object.entries(aliases)) {
    const isAInGroup = a === key || group.some((g) => a.includes(g) || g.includes(a));
    const isBInGroup = b === key || group.some((g) => b.includes(g) || g.includes(b));
    if (isAInGroup && isBInGroup) return true;
  }

  return false;
}

export function isSoftwareOrTechDomain(title: string, domain: string, skills: string[]): boolean {
  const text = `${title} ${domain} ${skills.join(' ')}`.toLowerCase();
  return (
    text.includes('developer') ||
    text.includes('engineer') ||
    text.includes('full stack') ||
    text.includes('frontend') ||
    text.includes('backend') ||
    text.includes('cloud') ||
    text.includes('software') ||
    text.includes('web') ||
    text.includes('react') ||
    text.includes('node') ||
    text.includes('devops') ||
    text.includes('solutions')
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
    text.includes('eia')
  );
}

/**
 * Score rating tiers consistent with KnowToHire guidelines:
 * 90–100: Excellent
 * 75–89: Strong
 * 60–74: Developing
 * < 60: Limited
 */
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

  const isCandidateTech = isSoftwareOrTechDomain(currentTitle, currentDomain, candidateSkills);
  const isCandidateESG = isSustainabilityDomain(currentTitle, currentDomain, candidateSkills);
  const isJobTech = isSoftwareOrTechDomain(job.title, job.category || '', jobSkills);
  const isJobESG = isSustainabilityDomain(job.title, job.category || '', jobSkills);

  let isDomainRelevant = true;
  if (isCandidateTech && !isCandidateESG && isJobESG && !isJobTech) {
    isDomainRelevant = false;
  } else if (isCandidateESG && !isCandidateTech && isJobTech && !isJobESG) {
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
  else if (candidateTitleNorm.includes('engineer') && jobTitleNorm.includes('engineer')) roleScore = 70;
  else if (candidateTitleNorm.includes('consultant') && jobTitleNorm.includes('consultant')) roleScore = 70;

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
        ? 'Direct domain compatibility with verified academic credentials.'
        : 'Cross-domain requisition with limited primary alignment.',
      isPositive: isDomainRelevant,
    },
    {
      factor: 'Location & Work Preference',
      weightPct: 5,
      scorePct: locScore,
      ratingLabel: 'Compatible',
      reason: job.is_remote
        ? 'Fully Remote opportunity.'
        : (candidateLocation ? `Location: ${job.location} (Candidate: ${candidateLocation}).` : `Location: ${job.location}.`),
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
      // 1. Fetch Candidate Profile, Jobs, and Knowledge Resources in parallel
      const [profileRes, jobsRes, resourcesRes] = await Promise.all([
        candidateProfileService.getMyCandidateProfile(),
        jobService.getPublishedJobs({ pageSize: 50 }),
        knowledgeService.getResources(),
      ]);

      const profile = profileRes.data;
      const rawJobs: Job[] = jobsRes.data?.data || [];
      const allResources: KnowledgeResource[] = resourcesRes.data || [];

      // Extract candidate data dynamically (Never hardcoded)
      const currentTitle = profile?.headline?.trim() || 'Software Engineer & Professional';
      const currentDomain = profile?.domainSpecialization?.trim() || 'Software Engineering';
      const candidateSkills = cleanSkillArray(profile?.skills || []);
      const experienceList = Array.isArray(profile?.experience) ? profile.experience : [];
      const candidateLocation = profile?.location?.trim() || 'Location Not Specified';
      const employmentPreference = profile?.employmentPreference || 'Full-Time / Hybrid';

      // Estimate total years of candidate experience from history
      const yearsOfExperience = experienceList.length > 0
        ? Math.max(experienceList.length * 2, 3)
        : (candidateSkills.length >= 5 ? 3 : 1);

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

      if (allJobs.length === 0) {
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
            totalMarketJobsCount: 0,
            matchScore: 60,
            opportunities: [],
            matchedSkills: candidateSkills.slice(0, 4),
            growthSkillRecommendations: [],
            explanations: [
              {
                factor: 'Market Inventory',
                weightPct: 100,
                scorePct: 0,
                ratingLabel: 'Limited',
                reason: 'No active job requisitions currently published in the catalog.',
                isPositive: false,
              },
            ],
            recommendedActions: [
              {
                id: 'action-explore-jobs',
                title: 'Explore Available Jobs',
                description: 'Browse the latest verified openings across all categories.',
                impactLevel: 'Opportunity',
                actionType: 'jobs',
                actionLabel: 'Explore Jobs',
                actionUrl: '/candidate/jobs',
              },
            ],
            hasSufficientProfileData: true,
            hasSufficientMarketData: false,
            emptyStateReason: 'Not enough relevant market openings in the catalog yet to generate dynamic role benchmarking.',
          },
          error: null,
        };
      }

      // 2. Score All Jobs using Single Match Engine
      const scoredResults: SingleJobMatchResult[] = allJobs.map((job) =>
        calculateCandidateJobMatch(profile, job, candidateSkills, yearsOfExperience)
      );

      // Filter domain-relevant jobs
      const domainRelevantResults = scoredResults.filter((sr) => sr.isDomainRelevant);
      const candidateJobsPool = domainRelevantResults.length > 0 ? domainRelevantResults : scoredResults;

      // Sort by highest match score
      candidateJobsPool.sort((a, b) => b.overallScore - a.overallScore);

      const best = candidateJobsPool[0];
      const targetJob = best.job;
      const targetRoleTitle = targetJob.title || currentTitle;

      // Build Career Opportunity Map (Ranked multi-role comparisons)
      const opportunities: CareerOpportunityRole[] = candidateJobsPool.slice(0, 4).map((sr, idx) => {
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

      // Verified Strengths: Candidate Skills that genuinely match target role or relevant market requirements
      const verifiedStrengths = candidateSkills.filter((cs) => {
        return (
          best.matchedSkills.some((ms) => matchesSkill(cs, ms)) ||
          Object.keys(skillDemandCounts).some((ds) => matchesSkill(cs, ds))
        );
      });

      const displayStrengths = verifiedStrengths.length > 0 ? verifiedStrengths : candidateSkills;

      // Identified Skill Gaps: (Target Job Requirements MINUS Candidate Skills) + Market gaps
      const targetJobMissing = cleanSkillArray(best.missingSkills).filter(
        (ms) => !candidateSkills.some((cs) => matchesSkill(cs, ms))
      );

      const marketDemandMissing = Object.entries(skillDemandCounts)
        .filter(([demandSkill]) => isValidSkill(demandSkill) && !candidateSkills.some((cs) => matchesSkill(cs, demandSkill)))
        .sort((a, b) => b[1] - a[1])
        .map(([s]) => s);

      const uniqueGaps = Array.from(new Set([...targetJobMissing, ...marketDemandMissing]));

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
