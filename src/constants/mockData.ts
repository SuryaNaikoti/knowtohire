export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: string; // 'Full-time' | 'Part-time' | 'Remote' | 'Hybrid'
  department: string;
  salary: string;
  postedAt: string;
  matchScore?: number;
  description: string;
  requirements: string[];
  benefits: string[];
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  format: 'E-Book' | 'Guide' | 'Checklist' | 'Manual';
  coverUrl: string;
  downloadsCount: number;
  rating: number;
  fileSize: string;
  publishedDate: string;
  description: string;
  author: string;
  chapters: string[];
}

export interface Template {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  price: number;
  rating: number;
  downloadsCount: number;
  formats: string[]; // ['Docx', 'Figma', 'Excel', 'PPT', 'PDF']
  creator: string;
  creatorAvatar: string;
  features: string[];
  reviews: { name: string; rating: number; comment: string; date: string }[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverUrl: string;
  category: string;
  readTime: string;
  publishedAt: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  isFeatured?: boolean;
}

export const mockJobs: Job[] = [
  {
    id: 'job-env-1',
    title: 'Senior Environmental Engineer',
    company: 'GreenEarth Consultants',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Karnataka (Bengaluru)',
    type: 'Full-time',
    department: 'Environmental',
    salary: '₹14,00,000 - ₹22,00,000 / yr',
    postedAt: '2 hours ago',
    matchScore: 98,
    description: 'GreenEarth Consultants is seeking a Senior Environmental Engineer to lead industrial EIA projects, wastewater treatment designs, and regulatory compliance audits across South India.',
    requirements: [
      'B.Tech / M.Tech in Environmental or Chemical Engineering.',
      '5+ years experience in EIA (Environmental Impact Assessment) and CPCB clearances.',
      'Proficiency in AutoCAD, GIS, and environmental dispersion modeling software.',
      'Strong knowledge of Water & Air Acts and Hazardous Waste Rules.'
    ],
    benefits: ['Full health & family insurance', 'Green travel allowance', 'Annual L&D budget', 'Performance bonus']
  },
  {
    id: 'job-esg-1',
    title: 'Lead ESG Consultant',
    company: 'SustainEdge Consulting',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Maharashtra (Mumbai)',
    type: 'Hybrid',
    department: 'ESG',
    salary: '₹18,00,000 - ₹28,00,000 / yr',
    postedAt: '4 hours ago',
    matchScore: 96,
    description: 'SustainEdge Consulting is hiring a Lead ESG Consultant to design CSRD, GRI, and BRSR sustainability disclosure frameworks for BSE/NSE listed enterprise clients.',
    requirements: [
      'Master degree in Environmental Science, Sustainability, or MBA.',
      '4+ years advising on ESG frameworks (GRI, TCFD, ISSB, BRSR).',
      'Proven experience conducting Scope 1, 2, and 3 GHG inventory audits.'
    ],
    benefits: ['Hybrid work model', 'Corporate wellness program', 'Global travel opportunities', 'Equity options']
  },
  {
    id: 'job-sus-1',
    title: 'Sustainability Analyst',
    company: 'EcoVision India',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Delhi NCR',
    type: 'Full-time',
    department: 'Sustainability',
    salary: '₹9,00,000 - ₹15,00,000 / yr',
    postedAt: '1 day ago',
    matchScore: 94,
    description: 'EcoVision India is looking for a analytical Sustainability Analyst to analyze carbon footprint metrics, lifecycle assessments (LCA), and supply chain sustainability indicators.',
    requirements: [
      'Degree in Environmental Science or Sustainable Development.',
      '2+ years experience with SimaPro, OpenLCA, or GaBi software.',
      'Strong quantitative analysis and report writing skills.'
    ],
    benefits: ['Health coverage', 'Flexible hours', 'Skill certification funding']
  },
  {
    id: 'job-pat-1',
    title: 'Patent Associate (Pharma & Biotech)',
    company: 'Patent Nexus',
    logo: 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Telangana (Hyderabad)',
    type: 'Full-time',
    department: 'Patent',
    salary: '₹12,00,000 - ₹20,00,000 / yr',
    postedAt: '1 day ago',
    matchScore: 92,
    description: 'Patent Nexus is seeking a registered Patent Agent/Associate to draft patent specifications, conduct prior-art searches, and respond to First Examination Reports (FER).',
    requirements: [
      'M.Sc / M.Pharm / Ph.D. in Life Sciences or Biotechnology.',
      'Registered Patent Agent with the Indian Patent Office (IPO).',
      '3+ years experience in patent drafting and prosecution.'
    ],
    benefits: ['Competitive bonus structure', 'Patent registration support', 'Health insurance']
  },
  {
    id: 'job-ipr-1',
    title: 'IPR Executive & Trademark Specialist',
    company: 'IPR Global',
    logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Maharashtra (Pune)',
    type: 'Hybrid',
    department: 'IPR',
    salary: '₹8,00,000 - ₹14,00,000 / yr',
    postedAt: '2 days ago',
    matchScore: 90,
    description: 'IPR Global is hiring an IPR Executive to manage corporate trademark portfolios, brand protection enforcement, and copyright registrations.',
    requirements: [
      'LL.B or Specialization in Intellectual Property Rights.',
      '2+ years in trademark filing, opposition drafting, and IP clearance.',
      'Strong legal drafting and client negotiation skills.'
    ],
    benefits: ['Flexible hybrid schedule', 'Legal research database access', 'Annual health checkups']
  },
  {
    id: 'job-sci-1',
    title: 'Environmental Scientist (Air Quality & Chemistry)',
    company: 'Future Sustainability Labs',
    logo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Tamil Nadu (Chennai)',
    type: 'Full-time',
    department: 'Research',
    salary: '₹10,00,000 - ₹16,00,000 / yr',
    postedAt: '2 days ago',
    matchScore: 91,
    description: 'Future Sustainability Labs requires an Environmental Scientist to conduct field sampling, ambient air monitoring, and chemical pollution analysis.',
    requirements: [
      'M.Sc in Chemistry, Environmental Science, or Atmospheric Physics.',
      'Experience operating GC-MS, HPLC, and air quality monitoring instruments.',
      'Familiarity with NABL accreditation standards.'
    ],
    benefits: ['NABL lab equipment training', 'Medical coverage', 'Paid research sabbaticals']
  },
  {
    id: 'job-res-1',
    title: 'Research Associate (Circular Economy)',
    company: 'Future Sustainability Labs',
    logo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Remote',
    type: 'Remote',
    department: 'Research',
    salary: '₹7,50,000 - ₹12,00,000 / yr',
    postedAt: '3 days ago',
    matchScore: 89,
    description: 'Conduct policy research, waste stream analysis, and circular economy market studies for international development clients.',
    requirements: ['Master degree in Public Policy or Environmental Studies', '2+ years research publication experience', 'Data analysis skills in R or Python.'],
    benefits: ['100% remote flexibility', 'Publication credit', 'Equipment allowance']
  },
  {
    id: 'job-ehs-1',
    title: 'EHS Manager (Industrial Safety)',
    company: 'EnviroTech Solutions',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Gujarat (Ahmedabad)',
    type: 'Full-time',
    department: 'Environmental',
    salary: '₹16,00,000 - ₹24,00,000 / yr',
    postedAt: '3 days ago',
    matchScore: 93,
    description: 'Lead Environment, Health, and Safety (EHS) compliance across manufacturing plant facilities, ensuring ISO 14001 and ISO 45001 standards.',
    requirements: ['Degree in Safety Engineering or RLI Diploma', '6+ years in chemical/manufacturing plant EHS', 'ISO lead auditor certification.'],
    benefits: ['On-site housing facility', 'Executive health plans', 'Annual bonus']
  },
  {
    id: 'job-water-1',
    title: 'Water Treatment Process Engineer',
    company: 'EnviroTech Solutions',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'West Bengal (Kolkata)',
    type: 'Full-time',
    department: 'Environmental',
    salary: '₹11,00,000 - ₹18,00,000 / yr',
    postedAt: '4 days ago',
    matchScore: 88,
    description: 'Design zero liquid discharge (ZLD) effluent treatment plants (ETP/STP) for industrial manufacturing clients.',
    requirements: ['B.Tech Chemical / Environmental', '3+ years in membrane filtration and RO plant design.'],
    benefits: ['Site allowances', 'Medical coverage', 'Travel stipends']
  },
  {
    id: 'job-carbon-1',
    title: 'Carbon Accounting & Climate Analyst',
    company: 'SustainEdge Consulting',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    location: 'Karnataka (Bengaluru)',
    type: 'Hybrid',
    department: 'ESG',
    salary: '₹12,00,000 - ₹19,00,000 / yr',
    postedAt: '4 days ago',
    matchScore: 95,
    description: 'Quantify GHG emissions, calculate SBTi targets, and prepare net-zero transition roadmaps for corporate clients.',
    requirements: ['Degree in Environmental Accounting or Energy Management', 'Experience with GHG Protocol Standards.'],
    benefits: ['Hybrid work model', 'Carbon offset training', 'Wellness allowance']
  }
];

export const mockResources: Resource[] = [
  {
    id: 'res-env-1',
    title: 'Environmental Compliance Handbook 2026',
    category: 'Environmental',
    format: 'Guide',
    coverUrl: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=300&h=400&q=80',
    downloadsCount: 5420,
    rating: 4.9,
    fileSize: '14.2 MB',
    publishedDate: 'June 10, 2026',
    description: 'A comprehensive regulatory compliance reference covering CPCB guidelines, EIA notifications, Water/Air consent rules, and industrial clearance procedures in India.',
    author: 'Er. Rajesh Sharma, Chief Auditor at GreenEarth',
    chapters: [
      'Overview of Environmental Legislation in India',
      'Consent to Establish (CTE) & Consent to Operate (CTO)',
      'Environmental Impact Assessment (EIA) Notification 2020/2026',
      'Effluent & Air Emission Standard Thresholds',
      'Hazardous & Solid Waste Management Compliance Rules'
    ]
  },
  {
    id: 'res-esg-1',
    title: 'ESG Reporting & BRSR Implementation Manual',
    category: 'ESG',
    format: 'E-Book',
    coverUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&h=400&q=80',
    downloadsCount: 3890,
    rating: 4.8,
    fileSize: '9.6 MB',
    publishedDate: 'May 22, 2026',
    description: 'Step-by-step practical guide to preparing SEBI BRSR (Business Responsibility and Sustainability Reporting) disclosures, Scope 1-3 carbon accounting, and GRI framework alignments.',
    author: 'Priya Sundaram, Lead ESG Specialist',
    chapters: [
      'Understanding SEBI BRSR Core Indicators',
      'Scope 1, 2, and 3 Greenhouse Gas Accounting',
      'Double Materiality Assessment Methodologies',
      'Social & Governance Metrics (Diversity, Safety, Ethics)',
      'Third-Party ESG Audit & Assurance Practices'
    ]
  },
  {
    id: 'res-pat-1',
    title: 'Patent Filing & Prosecution Guide (Indian Patent Office)',
    category: 'Patent',
    format: 'Manual',
    coverUrl: 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=300&h=400&q=80',
    downloadsCount: 4120,
    rating: 4.9,
    fileSize: '11.0 MB',
    publishedDate: 'April 18, 2026',
    description: 'Exhaustive manual on patent search, provisional specification drafting, PCT international filings, FER responses, and hearing procedures at the IPO.',
    author: 'Adv. Ananya Deshmukh, Patent Attorney',
    chapters: [
      'Prior Art Search Techniques & Patent Databases',
      'Drafting Claims & Specifications for Inventions',
      'Provisional vs Complete Specifications',
      'PCT International Application Routing',
      'Responding to First Examination Reports (FER)'
    ]
  },
  {
    id: 'res-res-1',
    title: 'Research Methodology & Academic Writing Kit',
    category: 'Research',
    format: 'Guide',
    coverUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=300&h=400&q=80',
    downloadsCount: 2950,
    rating: 4.7,
    fileSize: '6.5 MB',
    publishedDate: 'March 14, 2026',
    description: 'Essential guidelines for formulating hypotheses, qualitative/quantitative data analysis, literature reviews, and peer-reviewed journal submission formatting.',
    author: 'Dr. K. V. Ramanathan, Senior Research Scientist',
    chapters: [
      'Formulating Clear Research Questions',
      'Literature Review & Citation Management',
      'Statistical Analysis Methods (SPSS, R, Python)',
      'Manuscript Preparation for High-Impact Journals'
    ]
  },
  {
    id: 'res-audit-1',
    title: 'Environmental Audit Checklist & Standard Templates',
    category: 'Environmental',
    format: 'Checklist',
    coverUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=400&q=80',
    downloadsCount: 3100,
    rating: 4.8,
    fileSize: '4.2 MB',
    publishedDate: 'June 01, 2026',
    description: 'Ready-to-use audit checklists for inspecting ETP/STP units, stack emissions, chemical storage safety, and occupational health parameters during site visits.',
    author: 'GreenEarth Consulting Team',
    chapters: [
      'Pre-Audit Inspection Formats',
      'On-Site Waste Stream Audit Worksheets',
      'Air Emission & Stack Monitoring Sheets',
      'Post-Audit Non-Compliance Remediation Form'
    ]
  }
];

export const mockTemplates: Template[] = [
  {
    id: 'temp-1',
    title: 'Professional ATS-Friendly Resume Template',
    description: 'Recruiter-approved, single-column resume layout formatted for 100% extraction accuracy across major ATS applicant software.',
    coverUrl: 'https://images.unsplash.com/photo-1586075010923-2dd45e9b2d4f?auto=format&fit=crop&w=400&h=500&q=80',
    price: 0,
    rating: 4.9,
    downloadsCount: 6850,
    formats: ['Docx', 'PDF'],
    creator: 'KnowToHire Design Team',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80',
    features: ['100% ATS parser extraction verified', 'Word (.docx) & PDF formats', 'Includes action verb cheat sheet', 'Free lifetime updates'],
    reviews: [{ name: 'Siddharth Rao', rating: 5, comment: 'Parsed cleanly when applying online. Highly recommended!', date: 'June 20, 2026' }]
  },
  {
    id: 'temp-2',
    title: 'Executive CV Template (Academic & Research)',
    description: 'Multi-page formal CV template tailored for researchers, scientists, patent associates, and senior consultants listing publications & patents.',
    coverUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&h=500&q=80',
    price: 12.00,
    rating: 4.8,
    downloadsCount: 2340,
    formats: ['Docx', 'Figma'],
    creator: 'Dr. Sarah Chen',
    creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=40&h=40&q=80',
    features: ['Structured sections for research papers & patents', 'Editable in Microsoft Word & Figma', 'Professional typography design'],
    reviews: [{ name: 'Dr. Amit Patel', rating: 5, comment: 'Perfect layout for listing my journal papers and patents.', date: 'May 15, 2026' }]
  },
  {
    id: 'temp-3',
    title: 'Patent Specification Application Template',
    description: 'Standardized legal format template for drafting Indian Patent Office (Form 2) complete patent specifications including claims & abstract.',
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=500&q=80',
    price: 25.00,
    rating: 4.9,
    downloadsCount: 1560,
    formats: ['Docx'],
    creator: 'Patent Nexus Legal Team',
    creatorAvatar: 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=40&h=40&q=80',
    features: ['IPO Form 2 compliant format', 'Pre-formatted claim numbering and drawing references', 'Includes sample patent application text'],
    reviews: [{ name: 'Kavita Nair', rating: 5, comment: 'Saved us hours of manual IPO formatting.', date: 'June 05, 2026' }]
  },
  {
    id: 'temp-4',
    title: 'ESG & Environmental Audit Report Template',
    description: 'Corporate report presentation and document template for presenting ESG audit findings, carbon calculations, and compliance action plans.',
    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&h=500&q=80',
    price: 19.00,
    rating: 4.7,
    downloadsCount: 1890,
    formats: ['Docx', 'PPT'],
    creator: 'SustainEdge Design Studio',
    creatorAvatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=40&h=40&q=80',
    features: ['20 PowerPoint slides & 15-page Word document', 'Infographic charts for GHG emissions', 'Executive summary dashboard layouts'],
    reviews: [{ name: 'Manish Verma', rating: 5, comment: 'Clients loved the clean visual presentation of audit data.', date: 'May 30, 2026' }]
  }
];

export const mockBlogs: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Top Environmental & Sustainability Careers in India (2026 Guide)',
    excerpt: 'Explore high-demand career paths in Environmental Engineering, ESG Consulting, Sustainability Analysis, and Renewable Energy across Indian sectors.',
    coverUrl: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=800&h=450&q=80',
    category: 'Careers',
    readTime: '6 min read',
    publishedAt: 'June 25, 2026',
    authorName: 'Er. Rajesh Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80',
    content: `Sustainability is rapidly transforming corporate operations across India. Key opportunities include:
    
    ### 1. Environmental Engineering
    Designing industrial effluent treatment plants (ETP), zero liquid discharge (ZLD) systems, and conducting Environmental Impact Assessments (EIA).
    
    ### 2. ESG & Sustainability Consulting
    Advising listed companies on SEBI BRSR disclosures, carbon accounting, and global GRI/TCFD framework reporting.
    
    ### 3. Patent & IPR Careers
    Protecting green tech innovations, renewable energy patents, and chemical formulations at the Indian Patent Office.`,
    isFeatured: true
  },
  {
    id: 'blog-2',
    title: 'How to Build a Successful Career in ESG Consulting',
    excerpt: 'Learn the required certifications, carbon accounting tools, and regulatory knowledge needed to become a certified ESG Consultant.',
    coverUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&h=250&q=80',
    category: 'ESG',
    readTime: '8 min read',
    publishedAt: 'June 18, 2026',
    authorName: 'Priya Sundaram',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=40&h=40&q=80',
    content: `ESG consulting requires a blend of environmental science, regulatory law, and financial reporting skills. Focus on mastering GRI standards and GHG Protocol Scope 1-3 calculations.`
  },
  {
    id: 'blog-3',
    title: 'Patent Filing in India: Step-by-Step Explanation',
    excerpt: 'Demystifying the patent process from prior art search and provisional drafting to IPO examination and grant.',
    coverUrl: 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=400&h=250&q=80',
    category: 'Patent',
    readTime: '7 min read',
    publishedAt: 'June 10, 2026',
    authorName: 'Adv. Ananya Deshmukh',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=40&h=40&q=80',
    content: `Understanding patent law in India empowers inventors and IP professionals. Always start with a thorough prior art search before drafting complete specifications.`
  }
];
