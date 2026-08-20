export interface CandidateProfile {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  avatarText: string;
  profileStrength: number; // e.g. 88
  about: string;
  experience: {
    title: string;
    company: string;
    period: string;
    location: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  skills: string[];
  certifications: string[];
}

export interface CandidateApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedDate: string;
  salaryText: string;
  currentStage: 'Applied' | 'Screening' | 'Technical Interview' | 'Final HR' | 'Offer';
  statusVariant: 'indigo' | 'cyan' | 'amber' | 'emerald' | 'rose';
  nextStep?: string;
  nextStepDate?: string;
  matchScore: number;
}

export interface CandidateNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'application' | 'interview' | 'recommendation' | 'insight' | 'system';
  isRead: boolean;
}

export const MOCK_CANDIDATE_PROFILE: CandidateProfile = {
  name: 'Aarav Mehta',
  headline: 'Senior Environmental & ESG Consultant',
  location: 'Hyderabad, Telangana',
  email: 'aarav.mehta@example.com',
  phone: '+91 98765 43210',
  avatarText: 'AM',
  profileStrength: 88,
  about: 'Environmental consultant with 5+ years of experience leading SEBI BRSR compliance, ISO 14001 audits, and corporate decarbonization strategies across renewable energy and manufacturing sectors in India.',
  experience: [
    {
      title: 'Senior ESG Consultant',
      company: 'EcoStrategy India Pvt Ltd',
      period: '2023 - Present',
      location: 'Hyderabad',
      description: 'Led BRSR mandatory reporting readiness and Scope 1 & 2 carbon accounting for top 500 listed Indian corporate clients.',
    },
    {
      title: 'Environmental Compliance Specialist',
      company: 'GreenTech Infrastructure',
      period: '2021 - 2023',
      location: 'Bengaluru',
      description: 'Secured MoEFCC environmental clearances and SPCB consent to operate (CTO) for commercial clean energy projects.',
    },
  ],
  education: [
    {
      degree: 'M.Sc in Environmental Science & Technology',
      institution: 'Indian Institute of Technology (IIT) Bombay',
      year: '2021',
    },
    {
      degree: 'B.Tech in Chemical Engineering',
      institution: 'National Institute of Technology (NIT) Warangal',
      year: '2019',
    },
  ],
  skills: ['ESG Reporting', 'SEBI BRSR', 'ISO 14001', 'Carbon Accounting', 'EIA Assessment', 'GRI Standards', 'Hazardous Waste Compliance'],
  certifications: [
    'GRI Certified Sustainability Professional (2024)',
    'Lead Auditor ISO 14001:2015 Environmental Management',
  ],
};

export const MOCK_CANDIDATE_APPLICATIONS: CandidateApplication[] = [
  {
    id: 'app-1',
    jobTitle: 'Senior Sustainability Consultant',
    company: 'EcoStrategy India Pvt Ltd',
    location: 'Hyderabad, TS',
    appliedDate: '10 Aug 2026',
    salaryText: '₹24L - ₹32L/yr',
    currentStage: 'Technical Interview',
    statusVariant: 'cyan',
    nextStep: 'Technical Deep-Dive Video Interview',
    nextStepDate: '14 Aug 2026, 11:00 AM',
    matchScore: 96,
  },
  {
    id: 'app-2',
    jobTitle: 'Environmental Compliance Officer',
    company: 'GreenTech Infrastructure Corp',
    location: 'Bengaluru, KA',
    appliedDate: '06 Aug 2026',
    salaryText: '₹18L - ₹26L/yr',
    currentStage: 'Screening',
    statusVariant: 'indigo',
    nextStep: 'HR Phone Screening',
    nextStepDate: '15 Aug 2026, 03:30 PM',
    matchScore: 94,
  },
  {
    id: 'app-3',
    jobTitle: 'ESG Risk Analyst',
    company: 'Apex Capital Advisors',
    location: 'Mumbai, MH',
    appliedDate: '02 Aug 2026',
    salaryText: '₹15L - ₹22L/yr',
    currentStage: 'Applied',
    statusVariant: 'indigo',
    nextStep: 'Application Under Initial Review',
    matchScore: 92,
  },
];

export const MOCK_CANDIDATE_NOTIFICATIONS: CandidateNotification[] = [
  {
    id: 'notif-1',
    title: 'Interview Scheduled',
    message: 'EcoStrategy India scheduled your Technical Interview for 14 Aug 2026, 11:00 AM.',
    timestamp: '2 hours ago',
    category: 'interview',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'New High-Match Job Available',
    message: 'Lead Sustainability Manager at Tata Cleantech (98% Match, ₹28L - ₹36L/yr).',
    timestamp: '5 hours ago',
    category: 'recommendation',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Profile Strength Reminder',
    message: 'Add 1 certification tag to reach 100% profile completeness.',
    timestamp: '1 day ago',
    category: 'insight',
    isRead: true,
  },
];
