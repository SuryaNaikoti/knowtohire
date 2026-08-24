export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  isVerified: boolean;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Hybrid';
  minSalaryINR: number;
  maxSalaryINR: number;
  skills: string[];
  matchScore: number;
  postedDate: string;
  department: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface Resource {
  id: string;
  title: string;
  category: 'E-Book' | 'Study Material' | 'Research Paper' | 'White Paper';
  author: string;
  format: 'PDF' | 'EPUB';
  pageCount: number;
  rating: number;
  downloadCount: string;
  isFree: boolean;
  priceINR: number;
  description: string;
  topics: string[];
}

export interface Template {
  id: string;
  title: string;
  category: 'Resume Template' | 'Business Contract' | 'Legal Doc' | 'Compliance Checklist';
  format: 'DOCX' | 'PDF' | 'ZIP';
  priceINR: number;
  isFree: boolean;
  downloads: string;
  description: string;
  whatsIncluded: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  readingTime: string;
  date: string;
}

export const MOCK_JOBS: Job[] = [
  // Technology & Cloud Engineering Requisitions
  {
    id: 'job-tech-1',
    title: 'Senior Full Stack & Cloud Solutions Engineer',
    company: 'Enterprise Cloud Solutions India',
    location: 'Hyderabad, Telangana',
    isRemote: true,
    isVerified: true,
    employmentType: 'Full-Time',
    minSalaryINR: 2200000,
    maxSalaryINR: 3200000,
    skills: ['React & TypeScript', 'Node.js & API Architecture', 'Cloud Infrastructure (AWS/GCP)', 'Database Systems & SQL', 'Kubernetes', 'CI/CD & DevOps Automation'],
    matchScore: 95,
    postedDate: '1 day ago',
    department: 'Engineering & Technology',
    description: 'We are seeking a Senior Full Stack & Cloud Solutions Engineer to architect enterprise-grade web platforms and cloud-native backend microservices.',
    responsibilities: [
      'Architect and build resilient React + TypeScript frontend applications and high-throughput Node.js microservices.',
      'Deploy and optimize cloud infrastructure across AWS & GCP with containerized Kubernetes pipelines.',
      'Lead database design, SQL query tuning, and zero-downtime CI/CD automation.',
    ],
    requirements: [
      '5+ years in full stack engineering and cloud infrastructure architecture.',
      'Hands-on proficiency in React, TypeScript, Node.js, and SQL database design.',
      'Experience with container orchestration (Docker/Kubernetes) and cloud deployment (AWS/GCP).',
    ],
    benefits: ['Flexible remote / hybrid work', 'Annual learning and certification allowance', 'Comprehensive medical insurance'],
  },
  {
    id: 'job-tech-2',
    title: 'Senior Cloud Engineer',
    company: 'NextGen Cloud Systems',
    location: 'Hyderabad, Telangana',
    isRemote: true,
    isVerified: true,
    employmentType: 'Full-Time',
    minSalaryINR: 2400000,
    maxSalaryINR: 3500000,
    skills: ['Cloud Infrastructure (AWS/GCP)', 'Kubernetes', 'Terraform', 'CI/CD & DevOps Automation', 'Node.js & API Architecture', 'Database Systems & SQL'],
    matchScore: 92,
    postedDate: '2 days ago',
    department: 'Cloud Infrastructure',
    description: 'Lead multi-region AWS/GCP cloud engineering, Kubernetes cluster management, and Terraform infrastructure-as-code automation.',
    responsibilities: [
      'Provision, secure, and monitor scalable cloud environments on AWS and GCP using Terraform.',
      'Configure auto-scaling Kubernetes clusters and streamline deployment workflows.',
    ],
    requirements: [
      '4+ years managing production AWS/GCP cloud environments.',
      'Demonstrated expertise in Terraform, Kubernetes, and secure API gateways.',
    ],
    benefits: ['Health insurance', 'Performance bonus', 'Flexible remote policy'],
  },
  {
    id: 'job-tech-3',
    title: 'Full Stack Engineer',
    company: 'Innovate Tech Labs',
    location: 'Bengaluru, Karnataka',
    isRemote: true,
    isVerified: true,
    employmentType: 'Hybrid',
    minSalaryINR: 1800000,
    maxSalaryINR: 2600000,
    skills: ['React & TypeScript', 'Node.js & API Architecture', 'Database Systems & SQL', 'Cloud Infrastructure (AWS/GCP)', 'CI/CD & DevOps Automation', 'Kubernetes'],
    matchScore: 88,
    postedDate: '3 days ago',
    department: 'Software Engineering',
    description: 'Join our agile product team to build responsive web applications, design REST/GraphQL APIs, and manage containerized cloud deployment pipelines.',
    responsibilities: [
      'Implement scalable React components and TypeScript UI foundations.',
      'Develop secure Node.js RESTful endpoints and integrate cloud data pipelines.',
      'Manage container deployment pipelines using Kubernetes and CI/CD automation.',
    ],
    requirements: ['3+ years experience with modern JavaScript/TypeScript, React, Node.js, and SQL.'],
    benefits: ['Stock options', 'Hybrid work model', 'Wellness stipend'],
  },
  {
    id: 'job-tech-4',
    title: 'Solutions Architect',
    company: 'Apex Enterprise Software',
    location: 'Hyderabad, Telangana',
    isRemote: true,
    isVerified: true,
    employmentType: 'Full-Time',
    minSalaryINR: 3000000,
    maxSalaryINR: 4200000,
    skills: ['Cloud Infrastructure (AWS/GCP)', 'Node.js & API Architecture', 'Database Systems & SQL', 'Kubernetes', 'System Architecture', 'React & TypeScript'],
    matchScore: 85,
    postedDate: '4 days ago',
    department: 'Enterprise Architecture',
    description: 'Design enterprise software systems, evaluate technical trade-offs, and guide engineering teams in implementing secure cloud architectures.',
    responsibilities: [
      'Author technical architectural blueprints and oversee cloud migration roadmaps.',
      'Ensure high availability, data security, and sub-second API performance.',
    ],
    requirements: ['7+ years experience in software architecture and distributed cloud systems.'],
    benefits: ['Executive health coverage', 'Annual performance incentive', 'Flexible schedule'],
  },

  // Environmental, Sustainability & ESG Requisitions
  {
    id: 'job-1',
    title: 'Senior Sustainability Consultant',
    company: 'EcoStrategy India Pvt Ltd',
    location: 'Hyderabad, Telangana',
    isRemote: true,
    isVerified: true,
    employmentType: 'Hybrid',
    minSalaryINR: 2400000,
    maxSalaryINR: 3200000,
    skills: ['ESG Reporting', 'ISO 14001', 'Carbon Accounting', 'GRI Standards'],
    matchScore: 96,
    postedDate: '2 days ago',
    department: 'Sustainability & ESG',
    description: 'We are seeking an experienced Senior Sustainability Consultant to lead ESG compliance, decarbonization roadmaps, and corporate sustainability audits for marquee enterprise clients in India.',
    responsibilities: [
      'Lead ESG framework readiness (BRSR, GRI, TCFD, CDP) for Fortune 500 & Indian enterprise clients.',
      'Conduct Scope 1, 2, and 3 GHG emission accounting and Science-Based Targets (SBTi) alignment.',
      'Advise executive leadership on corporate ESG risks and sustainability opportunities.',
    ],
    requirements: [
      '6+ years experience in environmental consulting or corporate ESG advisory in India.',
      'Master degree in Environmental Engineering, Sustainability Management, or related field.',
      'Strong knowledge of SEBI BRSR (Business Responsibility and Sustainability Reporting) mandatory guidelines.',
    ],
    benefits: ['Flexible hybrid work policy', 'Full medical cover for family', 'Annual professional learning stipend of ₹1,00,000'],
  },
  {
    id: 'job-2',
    title: 'Environmental Compliance Officer',
    company: 'GreenTech Infrastructure Corp',
    location: 'Bengaluru, Karnataka',
    isRemote: false,
    isVerified: true,
    employmentType: 'Full-Time',
    minSalaryINR: 1800000,
    maxSalaryINR: 2600000,
    skills: ['EIA Assessment', 'CPCB Regulations', 'Waste Management', 'EHS Audit'],
    matchScore: 94,
    postedDate: '1 day ago',
    department: 'Environmental Health & Safety',
    description: 'Join GreenTech to manage environmental clearances, EIA studies, and state pollution control board (SPCB) compliance across major infrastructure and renewable energy developments.',
    responsibilities: [
      'Secure environmental clearances (EC) and Consent to Establish/Operate (CTE/CTO) from MoEFCC and SPCBs.',
      'Oversee environmental management plans (EMP) and hazardous waste compliance protocols.',
    ],
    requirements: [
      '4+ years hands-on experience in industrial environmental compliance and EIA documentation.',
      'B.Tech / M.Sc in Environmental Science, Chemical Engineering, or Environmental Law.',
    ],
    benefits: ['Performance bonus up to ₹3,00,000/yr', 'Health insurance', 'On-site housing allowance'],
  },
  {
    id: 'job-3',
    title: 'ESG Risk Analyst',
    company: 'Apex Capital Advisors',
    location: 'Mumbai, Maharashtra',
    isRemote: true,
    isVerified: true,
    employmentType: 'Hybrid',
    minSalaryINR: 1500000,
    maxSalaryINR: 2200000,
    skills: ['ESG Due Diligence', 'Sustainable Finance', 'Financial Modeling', 'SASB'],
    matchScore: 92,
    postedDate: '3 days ago',
    department: 'Investment & ESG Advisory',
    description: 'Analyze environmental, social, and governance risks across portfolio companies for a premier Indian private equity firm.',
    responsibilities: [
      'Conduct pre-investment ESG due diligence and impact evaluations for growth-stage tech startups.',
      'Formulate quarterly ESG dashboard reports for institutional investor compliance.',
    ],
    requirements: ['3+ years in equity research, ESG risk rating, or management consulting in India.'],
    benefits: ['Quarterly performance incentives', 'Remote work flexibility'],
  },
  {
    id: 'job-4',
    title: 'Patent Analyst & IPR Specialist',
    company: 'InnovateIP Legal Services',
    location: 'Delhi NCR (Gurugram)',
    isRemote: true,
    isVerified: true,
    employmentType: 'Hybrid',
    minSalaryINR: 2000000,
    maxSalaryINR: 2800000,
    skills: ['Patent Prior Art', 'IP Freedom to Operate', 'Patent Drafting', 'CleanTech Patents'],
    matchScore: 95,
    postedDate: '4 days ago',
    department: 'Intellectual Property',
    description: 'Provide technical patent analytics, prior art searches, and patentability assessments for clean energy and biotechnology patents in India.',
    responsibilities: [
      'Perform novelty, invalidity, and freedom-to-operate (FTO) searches across Indian Patent Office (IPO) and WIPO databases.',
      'Collaborate with R&D teams to draft high-quality patent specifications.',
    ],
    requirements: ['Registered Patent Agent with Indian Patent Office preferred.', 'B.Tech/M.Tech in Engineering or Biotech.'],
    benefits: ['Patent filing bonus', 'Professional membership reimbursements'],
  },
  {
    id: 'job-5',
    title: 'Lead Sustainability Manager',
    company: 'Tata Cleantech Capital',
    location: 'Bengaluru, Karnataka',
    isRemote: false,
    isVerified: true,
    employmentType: 'Full-Time',
    minSalaryINR: 2800000,
    maxSalaryINR: 3600000,
    skills: ['Corporate Sustainability', 'Net Zero Strategy', 'Renewables', 'Stakeholder Mgmt'],
    matchScore: 98,
    postedDate: 'Just now',
    department: 'Corporate Sustainability',
    description: 'Drive Net-Zero transition strategies and renewable power purchase agreements across commercial clean technology ventures.',
    responsibilities: ['Formulate corporate Net-Zero 2035 strategies and renewable energy sourcing plans.'],
    requirements: ['8+ years in corporate sustainability leadership in India.'],
    benefits: ['Stock options plan', 'Executive health checkups'],
  },
  {
    id: 'job-6',
    title: 'Research Consultant — Clean Energy Policy',
    company: 'Center for Energy & Climate Policy',
    location: 'Pune, Maharashtra',
    isRemote: true,
    isVerified: true,
    employmentType: 'Contract',
    minSalaryINR: 1600000,
    maxSalaryINR: 2400000,
    skills: ['Policy White Papers', 'Energy Transition', 'Data Analytics', 'Public Policy'],
    matchScore: 90,
    postedDate: '5 days ago',
    department: 'Policy Research',
    description: 'Author policy briefs and empirical research reports on India green hydrogen policy and power sector decarbonization.',
    responsibilities: ['Conduct primary & secondary policy research on clean energy financing in India.'],
    requirements: ['M.A./Ph.D. in Public Policy, Economics, or Environmental Studies.'],
    benefits: ['Flexible project contracts', 'Publication attribution'],
  },
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res-tech-1',
    title: 'Kubernetes & Cloud Infrastructure Best Practices',
    category: 'Study Material',
    author: 'KnowToHire Cloud Engineering Desk',
    format: 'PDF',
    pageCount: 120,
    rating: 4.9,
    downloadCount: '21.4k',
    isFree: true,
    priceINR: 0,
    description: 'Container orchestration, Kubernetes ingress controllers, zero-downtime rolling updates, and microservices clustering.',
    topics: ['Kubernetes', 'Cloud Infrastructure (AWS/GCP)', 'Docker', 'DevOps'],
  },
  {
    id: 'res-tech-2',
    title: 'Infrastructure as Code with Terraform & AWS',
    category: 'White Paper',
    author: 'DevOps & Cloud Architecture Team',
    format: 'PDF',
    pageCount: 85,
    rating: 4.8,
    downloadCount: '15.1k',
    isFree: true,
    priceINR: 0,
    description: 'Declarative cloud provisioning, state management, security groups, and automated pipeline deployments with Terraform.',
    topics: ['Terraform', 'AWS', 'Infrastructure as Code', 'Cloud Security'],
  },
  {
    id: 'res-tech-3',
    title: 'Enterprise System Architecture & Microservices Design',
    category: 'White Paper',
    author: 'KnowToHire Architecture Review Board',
    format: 'PDF',
    pageCount: 110,
    rating: 4.9,
    downloadCount: '18.3k',
    isFree: true,
    priceINR: 0,
    description: 'High-throughput microservices architecture, event-driven systems, fault tolerance, and domain-driven design patterns.',
    topics: ['System Architecture', 'Microservices', 'Distributed Systems', 'API Architecture'],
  },
  {
    id: 'res-1',
    title: 'Environmental Compliance Calendar & SPCB Guide 2026',
    category: 'E-Book',
    author: 'KnowToHire Legal & Environmental Desk',
    format: 'PDF',
    pageCount: 140,
    rating: 4.9,
    downloadCount: '14.2k',
    isFree: true,
    priceINR: 0,
    description: 'A comprehensive regulatory roadmap covering monthly, quarterly, and annual SPCB & MoEFCC filing deadlines across all Indian states.',
    topics: ['SPCB Compliance', 'CTE/CTO Renewal', 'Hazardous Waste Rules', 'BRSR Framework'],
  },
  {
    id: 'res-2',
    title: 'Patent Filing & IPR Guide for Tech Startups',
    category: 'Research Paper',
    author: 'Dr. R. Sharma, Patent Attorney',
    format: 'PDF',
    pageCount: 95,
    rating: 4.8,
    downloadCount: '9.8k',
    isFree: false,
    priceINR: 499,
    description: 'Step-by-step guide to navigating the Indian Patent Office, expedited examination for startups, and international PCT applications.',
    topics: ['Indian Patent Act', 'Prior Art Search', 'Patentability Criteria', 'IP Licensing'],
  },
  {
    id: 'res-3',
    title: 'SEBI BRSR Core & ESG Reporting Handbook',
    category: 'White Paper',
    author: 'KnowToHire Intelligence Team',
    format: 'PDF',
    pageCount: 110,
    rating: 4.9,
    downloadCount: '18.5k',
    isFree: true,
    priceINR: 0,
    description: 'Complete analysis of SEBI BRSR mandatory disclosure indicators for India top 1000 listed companies.',
    topics: ['SEBI BRSR', 'Scope 1 & 2 Emissions', 'Supply Chain ESG', 'Assurance Metrics'],
  },
  {
    id: 'res-4',
    title: 'Industrial Sustainability Audit Protocol',
    category: 'Study Material',
    author: 'Indian Energy & Environmental Institute',
    format: 'PDF',
    pageCount: 88,
    rating: 4.7,
    downloadCount: '6.2k',
    isFree: false,
    priceINR: 799,
    description: 'Field inspection checklists and quantitative audit methodology for industrial energy, water, and effluent compliance.',
    topics: ['Energy Audit', 'Water Balance', 'ETP Compliance', 'ISO 50001'],
  },
];

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 'tmpl-1',
    title: 'Executive ATS Resume — Sustainability & ESG Consultant',
    category: 'Resume Template',
    format: 'DOCX',
    priceINR: 499,
    isFree: false,
    downloads: '8.4k',
    description: 'ATS-optimized resume and cover letter template tailored specifically for environmental, ESG, and sustainability professionals in India.',
    whatsIncluded: ['Full Editable DOCX Template', 'Matching Cover Letter', 'Action Verbs & Keyword Cheat Sheet', 'ATS Formatting Guide'],
  },
  {
    id: 'tmpl-2',
    title: 'Environmental Impact Assessment (EIA) Consultancy Agreement',
    category: 'Legal Doc',
    format: 'DOCX',
    priceINR: 999,
    isFree: false,
    downloads: '4.1k',
    description: 'Lawyer-vetted Master Services Agreement (MSA) for environmental consultants rendering EIA and clearance services in India.',
    whatsIncluded: ['MSA Agreement Template', 'Scope of Work Schedule', 'Indemnity & Liability Clauses', 'Payment Milestone Breakdown'],
  },
  {
    id: 'tmpl-3',
    title: 'Corporate ESG Compliance Audit Checklist',
    category: 'Compliance Checklist',
    format: 'PDF',
    priceINR: 0,
    isFree: true,
    downloads: '12.6k',
    description: 'Ready-to-print audit matrix for internal compliance teams conducting quarterly ESG reviews across manufacturing plants.',
    whatsIncluded: ['Interactive PDF Checklist', 'Scoring Rubric', 'Action Item Tracker Sheet'],
  },
  {
    id: 'tmpl-4',
    title: 'Independent Patent Research Consultant Contract',
    category: 'Business Contract',
    format: 'DOCX',
    priceINR: 799,
    isFree: false,
    downloads: '5.9k',
    description: 'Standard NDA and freelance research service agreement protecting proprietary patent prior art searches and technical disclosures.',
    whatsIncluded: ['Freelance Service Agreement', 'Strict IP Assignment Clause', 'Mutual Non-Disclosure Agreement (NDA)'],
  },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    slug: 'mastering-brsr-esg-compliance-2026',
    title: 'Mastering SEBI BRSR & ESG Compliance for Indian Enterprises in 2026',
    category: 'ESG Compliance',
    author: 'Priya Sundaram',
    authorRole: 'Head of ESG Research, KnowToHire',
    readingTime: '6 min read',
    date: 'Aug 10, 2026',
    excerpt: 'As SEBI enforces BRSR Core assurance across Indian listed entities, learn the key data management strategies needed for seamless compliance.',
    content: `
      <h2>The Evolving Landscape of SEBI BRSR Compliance in India</h2>
      <p>Business Responsibility and Sustainability Reporting (BRSR) has transitioned from a voluntary disclosure framework into a compulsory strategic imperative for India's top listed organizations...</p>
      <h3>Key Pillars of BRSR Core Assurance</h3>
      <p>1. GHG Emission Quantification (Scope 1, 2, & 3)<br>2. Circularity & Waste Management<br>3. Fair Wages & Diversity Metrics</p>
    `,
  },
  {
    slug: 'patent-analysts-shaping-green-energy',
    title: 'How Patent Analysts Are Shaping Green Energy Innovations in India',
    category: 'Patent & IPR',
    author: 'Vikramaditya Sen',
    authorRole: 'Senior IP Attorney & Contributor',
    readingTime: '5 min read',
    date: 'Aug 04, 2026',
    excerpt: 'CleanTech patents are surging across solar PV, battery chemistry, and green hydrogen in India. Here is how patent analysts drive R&D value.',
    content: `
      <h2>The CleanTech Patent Boom in the Indian Patent Office</h2>
      <p>Patent landscape analytics are no longer just for legal teams—they guide clean energy venture investments and sovereign R&D roadmaps...</p>
    `,
  },
  {
    slug: 'resume-strategies-sustainability-pros',
    title: 'Top Resume & Portfolio Strategies for Sustainability Professionals',
    category: 'Career Advice',
    author: 'Ananya Roy',
    authorRole: 'Executive Career Coach',
    readingTime: '4 min read',
    date: 'Jul 28, 2026',
    excerpt: 'Discover how to highlight ISO certifications, carbon accounting metrics, and BRSR readiness to catch the attention of top recruiters.',
    content: `
      <h2>Quantifying Impact on Your Career Portfolio</h2>
      <p>Employers hiring sustainability consultants want concrete evidence of regulatory compliance, emissions reductions, and cost savings...</p>
    `,
  },
];

export const CAREER_CATEGORIES = [
  { name: 'General Careers', count: '1,240 Jobs', icon: 'Briefcase' },
  { name: 'Environmental Careers', count: '480 Jobs', icon: 'Leaf' },
  { name: 'ESG Careers', count: '310 Jobs', icon: 'ShieldCheck' },
  { name: 'Sustainability Careers', count: '520 Jobs', icon: 'Sun' },
  { name: 'Patent Careers', count: '290 Jobs', icon: 'FileText' },
  { name: 'IPR Careers', count: '180 Jobs', icon: 'Award' },
  { name: 'Research Careers', count: '410 Jobs', icon: 'Search' },
  { name: 'Consulting Careers', count: '650 Jobs', icon: 'TrendingUp' },
];
