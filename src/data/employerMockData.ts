export interface EmployerCompany {
  name: string;
  industry: string;
  location: string;
  website: string;
  logoText: string;
  size: string;
  about: string;
}

export interface EmployerUser {
  name: string;
  title: string;
  email: string;
  phone: string;
  avatarText: string;
}

export interface EmployerJob {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Hybrid';
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  status: 'Active' | 'Draft' | 'Paused' | 'Closed';
  minSalaryINR: number;
  maxSalaryINR: number;
  applicantCount: number;
  shortlistedCount: number;
  interviewCount: number;
  postedDate: string;
  closingDate: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
}

export interface EmployerCandidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experienceYears: number;
  skills: string[];
  matchScore: number; // e.g. 96
  skillsMatch: number; // e.g. 94
  experienceMatch: number; // e.g. 91
  locationMatch: number; // e.g. 100
  roleAlignment: number; // e.g. 89
  stage: 'New' | 'Screening' | 'Shortlisted' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  salaryExpectationINR: string;
  availability: string;
  appliedDate: string;
  appliedRole: string;
  education: string;
  certifications: string[];
  summary: string;
  isSaved?: boolean;
}

export interface EmployerInterview {
  id: string;
  candidateName: string;
  jobTitle: string;
  interviewType: 'Technical Deep-Dive' | 'HR Screening' | 'Executive Review' | 'Case Study';
  date: string;
  time: string;
  interviewer: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface EmployerNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'application' | 'interview' | 'pipeline' | 'system';
  isRead: boolean;
}

export const MOCK_EMPLOYER: EmployerUser = {
  name: 'Priya Nair',
  title: 'Talent Acquisition Manager',
  email: 'priya.nair@acmesustainability.co.in',
  phone: '+91 80 4920 1800',
  avatarText: 'PN',
};

export const MOCK_COMPANY: EmployerCompany = {
  name: 'Acme Sustainability Pvt. Ltd.',
  industry: 'Environmental & ESG Consulting',
  location: 'Bengaluru, Karnataka',
  website: 'https://acmesustainability.co.in',
  logoText: 'AS',
  size: '250 - 500 Employees',
  about: 'Acme Sustainability is a premier Indian environmental engineering and ESG advisory enterprise delivering decarbonization frameworks, BRSR compliance, and clean energy strategies for marquee global corporations.',
};

export const MOCK_EMPLOYER_JOBS: EmployerJob[] = [
  {
    id: 'job-1',
    title: 'Senior Sustainability Consultant',
    department: 'Sustainability & ESG',
    location: 'Hyderabad, TS',
    employmentType: 'Hybrid',
    workMode: 'Hybrid',
    status: 'Active',
    minSalaryINR: 2400000,
    maxSalaryINR: 3200000,
    applicantCount: 84,
    shortlistedCount: 12,
    interviewCount: 4,
    postedDate: '01 Aug 2026',
    closingDate: '31 Aug 2026',
    description: 'Lead Scope 1, 2 & 3 carbon accounting, BRSR readiness, and SBTi alignment for enterprise clients.',
    responsibilities: [
      'Conduct Scope 1, 2, and 3 GHG emission accounting and SBTi target setting.',
      'Lead SEBI BRSR Core readiness audits for listed Indian companies.',
    ],
    requirements: [
      '6+ years experience in environmental consulting or corporate ESG advisory.',
      'Master degree in Environmental Science or Chemical Engineering.',
    ],
    skills: ['ESG Reporting', 'BRSR', 'ISO 14001', 'Carbon Accounting', 'GRI Standards'],
  },
  {
    id: 'job-2',
    title: 'ESG Strategy Manager',
    department: 'Corporate Strategy',
    location: 'Bengaluru, KA',
    employmentType: 'Full-Time',
    workMode: 'On-site',
    status: 'Active',
    minSalaryINR: 2800000,
    maxSalaryINR: 3600000,
    applicantCount: 62,
    shortlistedCount: 8,
    interviewCount: 3,
    postedDate: '04 Aug 2026',
    closingDate: '05 Sep 2026',
    description: 'Formulate Net-Zero corporate strategies and clean tech investment due diligence.',
    responsibilities: ['Oversee corporate sustainability metrics and investor ESG reporting.'],
    requirements: ['7+ years experience in management consulting or corporate ESG.'],
    skills: ['ESG Strategy', 'Sustainable Finance', 'Net Zero', 'Stakeholder Management'],
  },
  {
    id: 'job-3',
    title: 'Environmental Compliance Specialist',
    department: 'EHS & Regulatory Compliance',
    location: 'Mumbai, MH',
    employmentType: 'Hybrid',
    workMode: 'Hybrid',
    status: 'Active',
    minSalaryINR: 1500000,
    maxSalaryINR: 2200000,
    applicantCount: 45,
    shortlistedCount: 6,
    interviewCount: 2,
    postedDate: '08 Aug 2026',
    closingDate: '10 Sep 2026',
    description: 'Oversee MoEFCC environmental clearances and state pollution control board (SPCB) consent filings.',
    responsibilities: ['Secure CTE/CTO renewals and lead hazardous waste audits.'],
    requirements: ['4+ years in industrial environmental compliance.'],
    skills: ['EIA Assessment', 'SPCB Clearances', 'Hazardous Waste', 'ISO 14001'],
  },
  {
    id: 'job-4',
    title: 'ESG Risk Analyst',
    department: 'Investment Advisory',
    location: 'Delhi NCR',
    employmentType: 'Hybrid',
    workMode: 'Remote',
    status: 'Active',
    minSalaryINR: 1200000,
    maxSalaryINR: 1800000,
    applicantCount: 31,
    shortlistedCount: 4,
    interviewCount: 2,
    postedDate: '10 Aug 2026',
    closingDate: '15 Sep 2026',
    description: 'Evaluate ESG due diligence and sustainability risks across private equity portfolio assets.',
    responsibilities: ['Formulate quarterly ESG risk rating dashboards.'],
    requirements: ['3+ years in ESG risk rating or equity research.'],
    skills: ['ESG Due Diligence', 'SASB', 'Financial Modeling', 'Data Analytics'],
  },
  {
    id: 'job-5',
    title: 'Sustainability Data Analyst',
    department: 'Analytics & Technology',
    location: 'Pune, MH',
    employmentType: 'Hybrid',
    workMode: 'Hybrid',
    status: 'Draft',
    minSalaryINR: 1400000,
    maxSalaryINR: 2100000,
    applicantCount: 0,
    shortlistedCount: 0,
    interviewCount: 0,
    postedDate: 'Pending Publish',
    closingDate: '30 Sep 2026',
    description: 'Analyze emissions data streams and automate environmental dashboard reporting.',
    responsibilities: ['Build automated carbon accounting pipelines.'],
    requirements: ['3+ years in Python/SQL data analytics for environmental data.'],
    skills: ['Data Analytics', 'Python', 'PowerBI', 'Carbon Accounting'],
  },
  {
    id: 'job-6',
    title: 'Patent Analyst — CleanTech',
    department: 'Intellectual Property',
    location: 'Remote',
    employmentType: 'Full-Time',
    workMode: 'Remote',
    status: 'Closed',
    minSalaryINR: 1800000,
    maxSalaryINR: 2600000,
    applicantCount: 24,
    shortlistedCount: 2,
    interviewCount: 3,
    postedDate: '15 Jun 2026',
    closingDate: '30 Jul 2026',
    description: 'Conducted freedom-to-operate searches for clean energy patents in India.',
    responsibilities: ['Performed novelty and prior art patent searches.'],
    requirements: ['Registered Indian Patent Agent preferred.'],
    skills: ['Patent Prior Art', 'IP Freedom to Operate', 'WIPO', 'CleanTech'],
  },
];

export const MOCK_EMPLOYER_CANDIDATES: EmployerCandidate[] = [
  {
    id: 'cand-1',
    name: 'Aarav Mehta',
    title: 'Senior Environmental & ESG Consultant',
    location: 'Hyderabad, TS',
    experienceYears: 5,
    skills: ['ESG Reporting', 'BRSR', 'GRI', 'ISO 14001', 'Carbon Accounting'],
    matchScore: 96,
    skillsMatch: 94,
    experienceMatch: 91,
    locationMatch: 100,
    roleAlignment: 89,
    stage: 'Interview',
    salaryExpectationINR: '₹24L - ₹28L/yr',
    availability: '30 Days Notice',
    appliedDate: '02 Aug 2026',
    appliedRole: 'Senior Sustainability Consultant',
    education: 'M.Sc in Environmental Science, IIT Bombay',
    certifications: ['GRI Certified Professional', 'Lead Auditor ISO 14001'],
    summary: '5+ years leading SEBI BRSR compliance, ISO 14001 audits, and Scope 1 & 2 GHG accounting for top corporate entities in India.',
    isSaved: true,
  },
  {
    id: 'cand-2',
    name: 'Ananya Rao',
    title: 'Senior ESG Analyst & BRSR Specialist',
    location: 'Bengaluru, KA',
    experienceYears: 6,
    skills: ['SEBI BRSR', 'Carbon Accounting', 'SASB', 'TCFD', 'Financial Modeling'],
    matchScore: 94,
    skillsMatch: 92,
    experienceMatch: 95,
    locationMatch: 90,
    roleAlignment: 92,
    stage: 'Screening',
    salaryExpectationINR: '₹28L - ₹32L/yr',
    availability: 'Immediate',
    appliedDate: '04 Aug 2026',
    appliedRole: 'ESG Strategy Manager',
    education: 'M.Tech in Environmental Engineering, IISc Bengaluru',
    certifications: ['GARP SCR Certified', 'TCFD Reporting Specialist'],
    summary: 'Specialized in investor-grade ESG reporting and SEBI BRSR Core assurance metrics for enterprise financial institutions.',
    isSaved: true,
  },
  {
    id: 'cand-3',
    name: 'Rohan Sharma',
    title: 'Environmental Compliance Lead',
    location: 'Mumbai, MH',
    experienceYears: 8,
    skills: ['EIA Assessment', 'SPCB Permits', 'Hazardous Waste', 'EHS Management'],
    matchScore: 92,
    skillsMatch: 90,
    experienceMatch: 96,
    locationMatch: 95,
    roleAlignment: 87,
    stage: 'Shortlisted',
    salaryExpectationINR: '₹30L - ₹35L/yr',
    availability: '45 Days Notice',
    appliedDate: '05 Aug 2026',
    appliedRole: 'Environmental Compliance Specialist',
    education: 'B.Tech in Chemical Engineering, NIT Trichy',
    certifications: ['NEBOSH IGC Certified', 'Lead Auditor ISO 45001'],
    summary: 'Hands-on manager securing MoEFCC clearances and managing pollution control board audits across large infrastructure projects.',
    isSaved: false,
  },
  {
    id: 'cand-4',
    name: 'Kavya Nair',
    title: 'Sustainability Auditor & Consultant',
    location: 'Delhi NCR',
    experienceYears: 4,
    skills: ['ISO 14001', 'Energy Audit', 'GRI', 'Water Balance'],
    matchScore: 90,
    skillsMatch: 88,
    experienceMatch: 86,
    locationMatch: 100,
    roleAlignment: 90,
    stage: 'New',
    salaryExpectationINR: '₹20L - ₹24L/yr',
    availability: '15 Days Notice',
    appliedDate: '07 Aug 2026',
    appliedRole: 'Senior Sustainability Consultant',
    education: 'M.Sc in Environmental Studies, Delhi University',
    certifications: ['BEE Certified Energy Auditor'],
    summary: 'Auditor conducting industrial energy & effluent audits across renewable power plants in North India.',
    isSaved: false,
  },
  {
    id: 'cand-5',
    name: 'Vikramaditya Sen',
    title: 'CleanTech Patent Specialist & IP Attorney',
    location: 'Pune, MH',
    experienceYears: 7,
    skills: ['Patent Prior Art', 'IP Freedom to Operate', 'CleanTech', 'Drafting'],
    matchScore: 95,
    skillsMatch: 96,
    experienceMatch: 94,
    locationMatch: 90,
    roleAlignment: 95,
    stage: 'Offer',
    salaryExpectationINR: '₹32L - ₹38L/yr',
    availability: '30 Days Notice',
    appliedDate: '01 Aug 2026',
    appliedRole: 'Patent Analyst — CleanTech',
    education: 'LL.M in IP Law & B.Tech Biotech',
    certifications: ['Registered Indian Patent Agent'],
    summary: 'Registered Patent Agent with 7 years managing solar PV and green hydrogen patent portfolios at IPO.',
    isSaved: true,
  },
  {
    id: 'cand-6',
    name: 'Meera Joshi',
    title: 'GHG Carbon Accounting Analyst',
    location: 'Hyderabad, TS',
    experienceYears: 3,
    skills: ['Scope 1 & 2', 'GHG Protocol', 'Excel Data Modeling', 'BRSR'],
    matchScore: 88,
    skillsMatch: 85,
    experienceMatch: 82,
    locationMatch: 100,
    roleAlignment: 88,
    stage: 'Hired',
    salaryExpectationINR: '₹18L/yr',
    availability: 'Joined',
    appliedDate: '20 Jul 2026',
    appliedRole: 'Senior Sustainability Consultant',
    education: 'B.Sc in Environmental Analytics, Osmania University',
    certifications: ['GHG Accounting Specialist'],
    summary: 'Focused on Scope 1, 2 & 3 data verification and carbon offset calculation models.',
    isSaved: false,
  },
];

export const MOCK_EMPLOYER_INTERVIEWS: EmployerInterview[] = [
  {
    id: 'int-1',
    candidateName: 'Aarav Mehta',
    jobTitle: 'Senior Sustainability Consultant',
    interviewType: 'Technical Deep-Dive',
    date: '14 Aug 2026',
    time: '11:00 AM IST',
    interviewer: 'Dr. S. Kulkarni (VP ESG)',
    status: 'Scheduled',
  },
  {
    id: 'int-2',
    candidateName: 'Ananya Rao',
    jobTitle: 'ESG Strategy Manager',
    interviewType: 'HR Screening',
    date: '15 Aug 2026',
    time: '03:30 PM IST',
    interviewer: 'Priya Nair (TA Manager)',
    status: 'Scheduled',
  },
  {
    id: 'int-3',
    candidateName: 'Rohan Sharma',
    jobTitle: 'Environmental Compliance Specialist',
    interviewType: 'Case Study',
    date: '16 Aug 2026',
    time: '02:00 PM IST',
    interviewer: 'V. Ramanathan (Director EHS)',
    status: 'Scheduled',
  },
];

export const MOCK_EMPLOYER_NOTIFICATIONS: EmployerNotification[] = [
  {
    id: 'notif-1',
    title: 'New High-Score Applicant',
    message: 'Aarav Mehta (96% Match) applied to Senior Sustainability Consultant.',
    timestamp: '1 hour ago',
    category: 'application',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Interview Confirmed',
    message: 'Ananya Rao accepted HR Screening for 15 Aug 2026, 3:30 PM.',
    timestamp: '3 hours ago',
    category: 'interview',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Job Performance Milestone',
    message: 'Senior Sustainability Consultant listing reached 84 applicants.',
    timestamp: '1 day ago',
    category: 'pipeline',
    isRead: true,
  },
];
