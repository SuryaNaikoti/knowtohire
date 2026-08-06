/**
 * KnowToHire Version 1.0 — Demo Seed Script (demoSeed.ts)
 * 
 * Recreates production-grade demo data instantly for live demonstrations,
 * database resets, or multi-environment deployments.
 * 
 * Production Timeline Simulated: 18 Months Active Platform Operations
 */

export interface ExecutiveDemoMetrics {
  registeredCandidates: number;
  registeredEmployers: number;
  activeJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  resourcesCount: number;
  templatesCount: number;
  blogPostsCount: number;
  weeklyGrowthPercentage: number;
  monthlyApplicationsRate: number;
}

export const EXECUTIVE_DEMO_METRICS: ExecutiveDemoMetrics = {
  registeredCandidates: 2486,
  registeredEmployers: 186,
  activeJobs: 317,
  totalApplications: 8942,
  interviewsScheduled: 421,
  resourcesCount: 74,
  templatesCount: 28,
  blogPostsCount: 35,
  weeklyGrowthPercentage: 18,
  monthlyApplicationsRate: 1240
};

export const DEMO_COMPANY_CATALOG = [
  { name: 'GreenEarth Consultants', industry: 'Environmental & Engineering', employees: '250-500', location: 'Bengaluru, Karnataka', founded: 2014 },
  { name: 'EcoVision India', industry: 'Sustainability & Analytics', employees: '100-250', location: 'New Delhi, NCR', founded: 2017 },
  { name: 'EnviroTech Solutions', industry: 'Industrial Safety & EHS', employees: '500-1000', location: 'Ahmedabad, Gujarat', founded: 2011 },
  { name: 'SustainEdge Consulting', industry: 'ESG & Corporate Compliance', employees: '50-100', location: 'Mumbai, Maharashtra', founded: 2019 },
  { name: 'Patent Nexus', industry: 'Intellectual Property Law', employees: '20-50', location: 'Hyderabad, Telangana', founded: 2016 },
  { name: 'IPR Global', industry: 'Brand Enforcement & Trademarks', employees: '50-100', location: 'Pune, Maharashtra', founded: 2015 },
  { name: 'Future Sustainability Labs', industry: 'Research & Circular Economy', employees: '100-250', location: 'Chennai, Tamil Nadu', founded: 2020 },
  { name: 'CleanEnergy Corp', industry: 'Renewable Energy & Solar', employees: '250-500', location: 'Gurugram, Haryana', founded: 2018 },
  { name: 'WaterPure Systems', industry: 'Water & Wastewater Engineering', employees: '100-250', location: 'Kolkata, West Bengal', founded: 2013 },
  { name: 'BioTech India Labs', industry: 'Biotechnology & Patent Research', employees: '200-500', location: 'Bengaluru, Karnataka', founded: 2012 }
];

export const DEMO_RECENT_ACTIVITIES = [
  { id: 'act-1', type: 'application', message: 'Candidate Ananya Sharma submitted application for Senior Environmental Engineer at GreenEarth Consultants.', time: '4 minutes ago' },
  { id: 'act-2', type: 'interview', message: 'Interview scheduled: Rahul Verma with SustainEdge Consulting (Lead ESG Consultant).', time: '12 minutes ago' },
  { id: 'act-3', type: 'job', message: 'EcoVision India published new posting: Renewable Energy Systems Analyst.', time: '28 minutes ago' },
  { id: 'act-4', type: 'download', message: 'Resource downloaded: ESG Reporting & BRSR Implementation Manual by 14 users today.', time: '45 minutes ago' },
  { id: 'act-5', type: 'purchase', message: 'Template purchased: Patent Specification Application Template (Form 2) by Adv. Vikram Das.', time: '1 hour ago' },
  { id: 'act-6', type: 'blog', message: 'New article published: "Top Environmental Careers in India (2026 Edition)".', time: '2 hours ago' }
];

export const DEMO_CHARTS_DATA = {
  monthlyGrowth: [
    { month: 'Jan', candidates: 1200, applications: 4100, jobs: 180 },
    { month: 'Feb', candidates: 1420, applications: 4800, jobs: 210 },
    { month: 'Mar', candidates: 1680, applications: 5600, jobs: 240 },
    { month: 'Apr', candidates: 1950, applications: 6700, jobs: 270 },
    { month: 'May', candidates: 2210, applications: 7800, jobs: 295 },
    { month: 'Jun', candidates: 2486, applications: 8942, jobs: 317 }
  ],
  categoryDistribution: [
    { category: 'Environmental', count: 98, percentage: 31 },
    { category: 'ESG & Sustainability', count: 82, percentage: 26 },
    { category: 'Patent & IPR', count: 54, percentage: 17 },
    { category: 'Research & Labs', count: 45, percentage: 14 },
    { category: 'Consulting', count: 38, percentage: 12 }
  ]
};

export async function runDemoSeed(): Promise<boolean> {
  // Store seed metrics and demo configurations in local storage / session for repeatable demo runs
  localStorage.setItem('kth_demo_metrics', JSON.stringify(EXECUTIVE_DEMO_METRICS));
  localStorage.setItem('kth_demo_activities', JSON.stringify(DEMO_RECENT_ACTIVITIES));
  localStorage.setItem('kth_demo_charts', JSON.stringify(DEMO_CHARTS_DATA));
  return true;
}
