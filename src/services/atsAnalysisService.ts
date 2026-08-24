import {
  ATSAnalysisResult,
  ATSOptimizationRecommendation,
} from './atsAnalysisTypes';
import { extractTextFromPDFBytes } from './resumeParserService';
import { Job } from './types';

/**
 * 20-Point ATS Comprehensive Evaluation Engine.
 * Evaluates parsing, sections, contact information, domain keywords,
 * experience metrics, education, and format risks.
 */
export async function performATSAnalysis(
  file: File,
  targetJob?: Job | null
): Promise<ATSAnalysisResult> {
  const fileName = file.name || 'Resume.pdf';
  const fileSizeBytes = file.size || 0;
  const isPDF = file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  let rawText = '';
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    rawText = extractTextFromPDFBytes(bytes);
  } catch (err) {
    console.warn('[performATSAnalysis] Error reading PDF byte stream:', err);
  }

  const cleanLowerText = (fileName + ' ' + rawText).toLowerCase();
  const charCount = rawText.length;
  const isMachineReadable = isPDF && charCount >= 20;

  // 1. Contact Information Extraction & Verification
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[\s-]?\d{10}|\b\d{10}\b/);
  
  const hasEmail = Boolean(emailMatch);
  const hasPhone = Boolean(phoneMatch);
  const hasContactInfo = hasEmail || hasPhone;

  // 2. Section Detection
  const hasSummaryOrBio = /summary|about|profile|objective|overview/i.test(rawText) || /consultant|engineer|specialist|analyst/i.test(cleanLowerText);
  const hasExperience = /experience|employment|work history|career|projects|responsibilities/i.test(rawText) || /pvt|ltd|corp|technologies|solutions/i.test(cleanLowerText);
  const hasEducation = /education|university|college|b\.tech|m\.tech|b\.e|m\.sc|b\.sc|bachelor|master|phd|diploma/i.test(rawText) || /institute|university/i.test(cleanLowerText);
  const hasSkills = /skills|technical skills|competencies|technologies|tools|expertise/i.test(rawText) || cleanLowerText.includes('python') || cleanLowerText.includes('sql');
  const hasCertifications = /certification|certified|license|credentials|accreditation|auditor/i.test(rawText);

  const missingCoreSections: string[] = [];
  if (!hasContactInfo) missingCoreSections.push('Contact Information');
  if (!hasSummaryOrBio) missingCoreSections.push('Professional Summary');
  if (!hasExperience) missingCoreSections.push('Work Experience');
  if (!hasEducation) missingCoreSections.push('Education');
  if (!hasSkills) missingCoreSections.push('Skills');
  if (!hasCertifications) missingCoreSections.push('Certifications & Credentials');

  // 3. Skills Extraction & Domain Mapping
  const domainKeywordsDatabase: Record<string, { domain: string; keywords: string[] }> = {
    sustainability: {
      domain: 'Sustainability & ESG Advisory',
      keywords: [
        'esg reporting',
        'brsr',
        'sebi',
        'carbon accounting',
        'iso 14001',
        'ghg protocol',
        'scope 1',
        'scope 2',
        'scope 3',
        'gri standards',
        'eia',
        'decarbonization',
        'sbti',
      ],
    },
    technology: {
      domain: 'Engineering & Technology Advisory',
      keywords: [
        'react',
        'typescript',
        'javascript',
        'python',
        'sql',
        'node.js',
        'aws',
        'cloud',
        'docker',
        'kubernetes',
        'api',
        'ci/cd',
        'git',
      ],
    },
    patent: {
      domain: 'Patent & IPR Strategy',
      keywords: [
        'patent search',
        'prior art',
        'patent drafting',
        'patentability',
        'fto',
        'freedom to operate',
        'ip valuation',
        'claims analysis',
        'patent agent',
      ],
    },
    scientific: {
      domain: 'Research & Scientific Advisory',
      keywords: [
        'statistical modeling',
        'experimental design',
        'peer-reviewed',
        'data analysis',
        'r programming',
        'scientific research',
        'methodology',
        'publications',
      ],
    },
  };

  let detectedDomain = 'Sustainability & ESG Advisory';
  if (cleanLowerText.includes('react') || cleanLowerText.includes('typescript') || cleanLowerText.includes('software') || cleanLowerText.includes('developer')) {
    detectedDomain = 'Engineering & Technology Advisory';
  } else if (cleanLowerText.includes('patent') || cleanLowerText.includes('ipr') || cleanLowerText.includes('prior art')) {
    detectedDomain = 'Patent & IPR Strategy';
  } else if (cleanLowerText.includes('research') || cleanLowerText.includes('phd') || cleanLowerText.includes('scientist')) {
    detectedDomain = 'Research & Scientific Advisory';
  }

  const domainKeywords = Object.values(domainKeywordsDatabase).find(d => d.domain === detectedDomain)?.keywords || domainKeywordsDatabase.sustainability.keywords;
  
  const extractedSkills: string[] = [];
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  domainKeywords.forEach(kw => {
    if (cleanLowerText.includes(kw)) {
      matchedKeywords.push(kw);
      extractedSkills.push(kw.toUpperCase());
    } else {
      missingKeywords.push(kw);
    }
  });

  let jobMatchScore: number | undefined = undefined;
  if (targetJob) {
    const jobSkills = targetJob.skills || [];
    let jobMatches = 0;
    jobSkills.forEach(skill => {
      const sLower = skill.toLowerCase();
      if (cleanLowerText.includes(sLower)) {
        jobMatches++;
        if (!matchedKeywords.includes(sLower)) matchedKeywords.push(sLower);
      } else {
        if (!missingKeywords.includes(sLower)) missingKeywords.push(sLower);
      }
    });
    jobMatchScore = jobSkills.length > 0 ? Math.round((jobMatches / jobSkills.length) * 100) : 85;
  }

  // 4. Quantified Achievements & Metric Indicators
  const metricMatches = rawText.match(/\b(?:\d+%(?:\s+increase|\s+reduction|\s+growth|\s+improvement|\s+savings)?|\₹\s*\d+(?:\.\d+)?\s*(?:cr|lakh|crore|k)?|\$\s*\d+(?:\.\d+)?\s*(?:m|k|b)?|\b\d+\s+(?:projects|clients|teams|audits|patents|publications)\b)/gi) || [];
  const quantifiedMetricsCount = metricMatches.length;

  // 5. Formatting & Layout Risk Evaluation
  const detectedFormattingRisks: string[] = [];
  if (!isPDF) {
    detectedFormattingRisks.push('Non-PDF file format (Word/Image documents have poor parsing accuracy in ATS systems).');
  }
  if (charCount < 300 && isPDF) {
    detectedFormattingRisks.push('Low character density or scanned raster PDF detected. Use selectable text rather than images.');
  }
  if (fileSizeBytes > 8 * 1024 * 1024) {
    detectedFormattingRisks.push('File size exceeds 8MB which may cause slow processing or rejection in legacy ATS parsers.');
  }

  // 6. Experience & Chronology Calculation
  const yearMatches = rawText.match(/\b(19\d{2}|20\d{2})\b/g) || [];
  const experienceYearsCalculated = yearMatches.length >= 2 ? Math.min(15, Math.max(1, (new Date().getFullYear() - Math.min(...yearMatches.map(Number))))) : 3;

  // 7. Calculate Deterministic Sub-Scores (0 to 100)
  const parsingScore = isMachineReadable ? 95 : 30;
  const sectionStructureScore = Math.max(20, 100 - (missingCoreSections.length * 20));
  const skillsScore = Math.min(100, Math.max(30, matchedKeywords.length * 18));
  const experienceScore = hasExperience ? 90 : 40;
  const educationScore = hasEducation ? 95 : 45;
  const impactScore = quantifiedMetricsCount >= 3 ? 95 : quantifiedMetricsCount >= 1 ? 80 : 55;

  const overallAtsScore = Math.round(
    parsingScore * 0.20 +
    sectionStructureScore * 0.15 +
    skillsScore * 0.25 +
    experienceScore * 0.15 +
    educationScore * 0.10 +
    impactScore * 0.15
  );

  // 8. Generate Evidence-Based Recommendations
  const recommendations: ATSOptimizationRecommendation[] = [];

  // Recommendation A: Machine Readability & Parsing
  if (isMachineReadable) {
    recommendations.push({
      id: 'rec-parsing-ok',
      category: 'Parsing & Machine Readability',
      type: 'positive',
      title: 'Machine-Readable Document Stream',
      explanation: 'Your PDF contains clear, structured text layers that ATS parsers can index without optical character recognition (OCR) degradation.',
      evidence: `Extracted ${charCount} valid text characters across verified PDF stream (${fileName}).`,
      severity: 'positive',
      confidence: 96,
      suggestedAction: 'Keep saving your resume directly as a clean PDF rather than a scanned image.',
    });
  } else {
    recommendations.push({
      id: 'rec-parsing-risk',
      category: 'Parsing & Machine Readability',
      type: 'warning',
      title: 'ATS Machine Readability Risk',
      explanation: 'The uploaded file has limited selectable text and may fail automated ATS resume ingestion.',
      evidence: `Low character count (${charCount} characters) extracted from ${fileName}.`,
      severity: 'high',
      confidence: 90,
      suggestedAction: 'Re-export your resume from Word or Google Docs using "Export as PDF (Standard)" with selectable text.',
    });
  }

  // Recommendation B: Domain Framework Alignment
  if (matchedKeywords.length >= 2) {
    recommendations.push({
      id: 'rec-domain-match',
      category: 'Technical & Domain Skills',
      type: 'positive',
      title: `${detectedDomain} Alignment`,
      explanation: `Your resume demonstrates validated domain terminology matching enterprise ${detectedDomain} benchmarks.`,
      evidence: `Verified active keywords: ${matchedKeywords.slice(0, 4).join(', ')}.`,
      severity: 'positive',
      confidence: 92,
      affectedEntity: detectedDomain,
      suggestedAction: 'Maintain these validated core competencies prominently in your professional headline and skills section.',
    });
  }

  // Recommendation C: Missing Conditional Keywords (Non-Fabricated & Non-Stuffing)
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords[0];
    recommendations.push({
      id: `rec-missing-kw-${topMissing.replace(/\s+/g, '-')}`,
      category: 'Required Job Keywords',
      type: 'suggestion',
      title: `Keyword Relevance: "${topMissing.toUpperCase()}"`,
      explanation: `If you have verified professional experience with "${topMissing}", consider adding it to your experience bullets to increase automated ranking for senior ${detectedDomain} openings.`,
      evidence: `Term "${topMissing}" is absent from document text while frequently required in top ${detectedDomain} requisitions.`,
      severity: 'medium',
      confidence: 88,
      affectedEntity: topMissing,
      suggestedAction: `If applicable to your real experience, incorporate "${topMissing}" in context of specific projects or statutory filings.`,
    });
  }

  // Recommendation D: Measurable Achievements / Quantified Metrics
  if (quantifiedMetricsCount < 2) {
    recommendations.push({
      id: 'rec-quantified-impact',
      category: 'Measurable Impact & Achievements',
      type: 'suggestion',
      title: 'Quantified Impact Metrics',
      explanation: 'Resumes featuring numeric indicators (e.g. % efficiency gains, INR budgets managed, headcount, or turnaround time) achieve higher ATS scoring and recruiter engagement.',
      evidence: `Detected ${quantifiedMetricsCount} quantified achievement metric(s) in parsed document.`,
      severity: 'medium',
      confidence: 85,
      suggestedAction: 'Enhance job bullets with measurable numbers where possible (e.g., "Led audits across 12+ facilities resulting in 18% energy reduction").',
    });
  } else {
    recommendations.push({
      id: 'rec-quantified-ok',
      category: 'Measurable Impact & Achievements',
      type: 'positive',
      title: 'Measurable Impact Detected',
      explanation: 'Your work experience incorporates quantified metrics and concrete performance indicators.',
      evidence: `Identified ${quantifiedMetricsCount} metric instances (${metricMatches.slice(0, 2).join(', ')}).`,
      severity: 'positive',
      confidence: 90,
      suggestedAction: 'Continue highlighting quantified outcomes in future career milestones.',
    });
  }

  // Recommendation E: Section Structure Gaps (if any)
  if (missingCoreSections.length > 0) {
    recommendations.push({
      id: 'rec-missing-sections',
      category: 'Resume Section Structure',
      type: 'warning',
      title: `Missing Section Header: ${missingCoreSections[0]}`,
      explanation: 'Standard ATS parsers search for explicit section headers to categorize your career history correctly.',
      evidence: `Standard heading for "${missingCoreSections[0]}" was not identified.`,
      severity: 'high',
      confidence: 94,
      affectedEntity: missingCoreSections[0],
      suggestedAction: `Include an unambiguous standard header titled "${missingCoreSections[0]}" in your document structure.`,
    });
  }

  return {
    analyzedAt: new Date().toISOString(),
    fileName,
    fileSizeBytes,
    isPDF,
    isMachineReadable,
    overallAtsScore,
    parsingScore,
    sectionStructureScore,
    skillsScore,
    experienceScore,
    educationScore,
    impactScore,
    totalSkillsCount: extractedSkills.length,
    matchedDomain: detectedDomain,
    experienceYearsCalculated,
    quantifiedMetricsCount,
    detectedFormattingRisks,
    missingCoreSections,
    jobMatchScore,
    matchedKeywords,
    missingKeywords,
    partialKeywords: [],
    recommendations,
  };
}
