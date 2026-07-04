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
  formats: string[]; // ['Docx', 'Figma', 'Excel', 'PPT']
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
    id: 'job-1',
    title: 'Senior Software Engineer',
    company: 'Stripe',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&h=80&q=80',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    department: 'Engineering',
    salary: '$180,000 - $220,000 / yr',
    postedAt: '2 days ago',
    matchScore: 94,
    description: 'We are looking for a Senior Software Engineer to help build the next generation of global checkout infrastructure. You will work on robust APIs, fault-tolerant distributed networks, and scale transactional engines handling billions of monthly volume.',
    requirements: [
      '8+ years of professional backend software engineering experience.',
      'Strong expertise in Go, Ruby, Java, or Rust.',
      'Experience designing and scaling RESTful APIs and distributed microservices.',
      'Deep understanding of PostgreSQL, Redis, and message queues (Kafka/RabbitMQ).'
    ],
    benefits: [
      'Comprehensive healthcare, vision, and dental insurance plans.',
      'Flexible paid time off (PTO) and parental leave.',
      'Annual learning & development stipend ($2,500).',
      'Home office equipment budget ($1,500).'
    ]
  },
  {
    id: 'job-2',
    title: 'Lead Product Designer',
    company: 'Notion',
    logo: 'https://images.unsplash.com/photo-1568200306481-967613f0c74a?auto=format&fit=crop&w=80&h=80&q=80',
    location: 'Remote (US/Canada)',
    type: 'Remote',
    department: 'Design',
    salary: '$160,000 - $190,000 / yr',
    postedAt: '1 week ago',
    matchScore: 88,
    description: 'Notion is seeking a Lead Product Designer to shape the future of collaborative knowledge workspaces. In this role, you will lead the core product editor design, draft intuitive UI interfaces, conduct customer user-testing sessions, and collaborate directly with product and engineering departments.',
    requirements: [
      '6+ years of UX/UI product design experience in SaaS environments.',
      'Exceptional portfolio showcasing interactions, workspace systems, and product thinking.',
      'Proficiency in Figma, prototyping software, and components design libraries.',
      'Experience conducting user interviews and iterating designs based on telemetry.'
    ],
    benefits: [
      'Competitive equity packages.',
      'Health wellness monthly stipend ($200).',
      '401(k) retirement matching (4% match).',
      'Annual remote team meetups in creative spaces.'
    ]
  },
  {
    id: 'job-3',
    title: 'Principal AI Researcher',
    company: 'Google DeepMind',
    logo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=80&h=80&q=80',
    location: 'London, UK (On-site)',
    type: 'Full-time',
    department: 'Research',
    salary: '£140,000 - £180,000 / yr',
    postedAt: '3 days ago',
    matchScore: 92,
    description: 'Join Google DeepMind as a Principal AI Researcher to push the boundaries of artificial general intelligence (AGI). You will collaborate with elite scientists, lead large-scale reinforcement learning runs, and design neural networks for biological, physical, and coding reasoning structures.',
    requirements: [
      'Ph.D. in Computer Science, Mathematics, Machine Learning, or related field.',
      'Publication record at top ML venues (NeurIPS, ICML, ICLR, CVPR).',
      'Strong research implementation skills in JAX, PyTorch, or TensorFlow.',
      'Experience leading large-scale neural network training pipelines.'
    ],
    benefits: [
      'Top-tier international pension and compensation packages.',
      'Unlimited access to state-of-the-art GPU cluster compute blocks.',
      'Comprehensive family medical coverage.',
      'Subsidized gourmet on-site dining and wellness gyms.'
    ]
  },
  {
    id: 'job-4',
    title: 'Product Marketing Manager',
    company: 'Linear',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=80&h=80&q=80',
    location: 'New York, NY (Hybrid)',
    type: 'Hybrid',
    department: 'Marketing',
    salary: '$130,000 - $160,000 / yr',
    postedAt: '5 days ago',
    matchScore: 82,
    description: 'We are seeking a Product Marketing Manager to craft the narrative, launch campaigns, and drive adoption for Linear features. You will translate developer tools specifications into clear user value points and orchestrate global features rollouts.',
    requirements: [
      '4+ years of product marketing experience within developer tools or B2B SaaS.',
      'Superb writing skills and visual storytelling capability.',
      'Experience managing multi-channel launches (social, email, changelog).',
      'Familiarity with modern developer tools and tracking systems.'
    ],
    benefits: [
      'Flexible remote schedule options.',
      'Full healthcare coverage + mental health wellness apps access.',
      'Stipend for learning materials and books ($1,000).',
      'Bi-annual company retreats.'
    ]
  }
];

export const mockResources: Resource[] = [
  {
    id: 'resource-1',
    title: 'AI Engineering Playbook: Production LLMs',
    category: 'Engineering',
    format: 'E-Book',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=400&q=80',
    downloadsCount: 4820,
    rating: 4.9,
    fileSize: '12.4 MB',
    publishedDate: 'May 12, 2026',
    description: 'The ultimate guide to building, evaluation, caching, and running Large Language Models in production pipelines. Covers vector databases, context injection, prompt engineering patterns, security controls, and throughput tuning.',
    author: 'Dr. Sarah Chen, AI Lead at KnowToHire',
    chapters: [
      'Introduction: The LLM Stack in Production',
      'Prompt Engineering & Structured Output Parsers',
      'Retrieval-Augmented Generation (RAG) Architecture',
      'Vector Databases: Pinecone, pgvector, and Qdrant',
      'Fine-Tuning vs. Few-Shot In-Context Learning',
      'Evaluating Model Output, Bias, and Security Holes'
    ]
  },
  {
    id: 'resource-2',
    title: 'Product Management Bible: Scaling SaaS',
    category: 'Management',
    format: 'Manual',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&h=400&q=80',
    downloadsCount: 3210,
    rating: 4.8,
    fileSize: '8.1 MB',
    publishedDate: 'March 18, 2026',
    description: 'Learn the exact frameworks used by Silicon Valley product leaders to structure teams, define product telemetry, validate customer acquisition fits, track retention indexes, and execute global feature rollouts.',
    author: 'Marcus Vance, Ex-Director of Product at Notion',
    chapters: [
      'Defining Product-Market Fit (PMF) Metrics',
      'SaaS Unit Economics: LTV, CAC, and Churn Mechanics',
      'User Research & Telemetry-Driven Hypotheses',
      'Designing High-Conversion Onboarding Funnels',
      'Frameworks for Feature Prioritization (RICE/Kano)',
      'Orchestrating Agile Cross-Functional Launch Cycles'
    ]
  },
  {
    id: 'resource-3',
    title: 'Financial Modeling Core: VC & Startup Valuation',
    category: 'Finance',
    format: 'Checklist',
    coverUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=300&h=400&q=80',
    downloadsCount: 2890,
    rating: 4.7,
    fileSize: '4.8 MB',
    publishedDate: 'April 20, 2026',
    description: 'A step-by-step spreadsheet checklist for designing financial models, dilution schedules, cap tables, cash-burn logs, valuation metrics, and runway tracking mechanisms.',
    author: 'Elena Rostova, Venture Partner at SeedCapital',
    chapters: [
      'Foundations of Startup Dilution & Equity Splits',
      'Designing the 3-Statement Financial Forecasting Model',
      'Venture Capital Valuation: Pre-Money vs. Post-Money',
      'Cap Table Mechanics: Options Pools & Convertible Notes',
      'Modeling Customer Growth & Multi-Channel Spend Scales',
      'Valuation Presentation Decks for Series A Pitch Runs'
    ]
  }
];

export const mockTemplates: Template[] = [
  {
    id: 'temp-1',
    title: 'Minimalist Tech Resume Template',
    description: 'A single-page, ATS-optimized minimalist resume template customized for software engineers, product designers, and technical product managers. Engineered to parse cleanly with major recruitment engines.',
    coverUrl: 'https://images.unsplash.com/photo-1586075010923-2dd45e9b2d4f?auto=format&fit=crop&w=400&h=500&q=80',
    price: 15.00,
    rating: 4.9,
    downloadsCount: 1450,
    formats: ['Docx', 'Figma'],
    creator: 'Alex Rivera, Senior Designer',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80',
    features: [
      'ATS-compatible layout structure verified by recruiters.',
      'Available in both Microsoft Word (docx) and Figma layout links.',
      'Includes 30+ resume writing pointers for technical sections.',
      'Free lifetime layout updates and cover letter mockup additions.'
    ],
    reviews: [
      { name: 'John Doe', rating: 5, comment: 'ATS parser had 100% extraction rates on my resume. Landed interviews at Stripe!', date: 'June 1, 2026' },
      { name: 'Sarah Miller', rating: 4.8, comment: 'Clean, elegant layout. Very easy to customize in Figma.', date: 'May 20, 2026' }
    ]
  },
  {
    id: 'temp-2',
    title: 'Series A Venture Pitch Deck',
    description: 'A premium, modern pitch deck template composed of 22 visual slides designed to showcase traction, financial models, market size, competition indexes, and funding requirements.',
    coverUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&h=500&q=80',
    price: 29.00,
    rating: 4.8,
    downloadsCount: 890,
    formats: ['PPT', 'Figma'],
    creator: 'KnowToHire Design Lab',
    creatorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=40&h=40&q=80',
    features: [
      '22 premium, highly structured presentation slides.',
      'Optimized layout flows for problem-solution storytelling.',
      'Vector charts, competitive grids, and roadmap tables included.',
      'Available in Google Slides, PowerPoint, and Figma formats.'
    ],
    reviews: [
      { name: 'David Park', rating: 5, comment: 'We closed our $3.2M round using these layouts. Highly recommended!', date: 'May 12, 2026' },
      { name: 'Emily Taylor', rating: 4.6, comment: 'Beautiful typography pairing. Made my financials look professional.', date: 'April 28, 2026' }
    ]
  },
  {
    id: 'temp-3',
    title: 'SaaS Business Financial Model',
    description: 'A comprehensive, automated Excel financial forecasting workbook. Includes automated formulas to calculate customer metrics (LTV, CAC, payback period), headcount schedules, and cap table models.',
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=500&q=80',
    price: 24.00,
    rating: 4.7,
    downloadsCount: 1120,
    formats: ['Excel'],
    creator: 'Elena Rostova, VC Partner',
    creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=40&h=40&q=80',
    features: [
      'Fully automated financial sheets with dashboard graphs.',
      'Headcount planning inputs and corporate tax calculation algorithms.',
      'Pre-configured CAC/LTV valuation matrices.',
      'Includes instructions worksheet for simple calculations.'
    ],
    reviews: [
      { name: 'Robert Chen', rating: 5, comment: 'Saved me 40 hours of Excel formulas design. Essential tool for founders.', date: 'June 10, 2026' }
    ]
  }
];

export const mockBlogs: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The AI Resume Optimization Guide for 2026',
    excerpt: 'ATS parsing tools are smarter than ever. Learn how to design your resume structures, highlight technical skills keywords, and format sections to align with modern corporate matching dashboards.',
    coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&h=450&q=80',
    category: 'Careers',
    readTime: '6 min read',
    publishedAt: 'June 15, 2026',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80',
    content: `Recruitment engines in 2026 do not just look for keyword matching; they analyze contextual semantics. When applying for roles, your resume undergoes structural parsing. Here is how you optimize your profile:
    
    ### 1. Maintain Standard Section Headings
    Avoid creative section names like "My Journey" or "Core Powers". Use "Professional Experience", "Education", and "Technical Skills" to allow parsers to categorize content instantly.
    
    ### 2. Standardize File Layouts
    Single-column layouts in Microsoft Word (docx) or clean PDF outputs remain the gold standard. Avoid multi-column text boxes, since parsers can read text horizontally across dividers and blend sentences.
    
    ### 3. Highlight Practical Results
    Rather than listing task duties, list numeric accomplishments: "Increased caching speed by 40% utilizing Redis clustering structures" instead of "Managed database memory caching systems."`,
    isFeatured: true
  },
  {
    id: 'blog-2',
    title: 'How to Build a World-Class Candidate Sourcing Pipeline',
    excerpt: 'Hiring is an engineering funnel. Learn how to draft precise technical specs, utilize AI candidate matching score indicators, and manage recruitment stages using visual Kanban columns.',
    coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&h=250&q=80',
    category: 'Recruiting',
    readTime: '8 min read',
    publishedAt: 'June 08, 2026',
    authorName: 'Dr. Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=40&h=40&q=80',
    content: `Designing a recruitment workflow requires high operational structure. Recruiters must treat candidates as high-value resources. 
    
    *   **Step 1: Set Detailed Candidate Targets:** Write precise requirements list, outline tech stacks, and set target match scores.
    *   **Step 2: Automate Sourcing Filters:** Utilize automated screening tests for technical roles.
    *   **Step 3: Kanban Pipeline Synchronization:** Active pipelines should be mapped visibly so all teammates see candidate progress states.`
  },
  {
    id: 'blog-3',
    title: 'Startup Valuation Rules: Pre-seed to Series A',
    excerpt: 'Navigating startup dilution patterns requires financial model clarity. Learn how options pools, safe notes, and Series A valuations affect cap tables.',
    coverUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&h=250&q=80',
    category: 'Finance',
    readTime: '10 min read',
    publishedAt: 'May 28, 2026',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=40&h=40&q=80',
    content: `Startups seeking VC funding must understand cap tables. SAFE notes are easy to issue but compound dilution percentages heavily during primary valuation pricing rounds.
    
    *   **Option Pools:** VC firms will require pre-money options pool creation (10-15%), which dilutes founders before investment cash joins the sheets.
    *   **Headcount Schedules:** Align financial forecast models with actual team scaling roadmaps to justify valuation multipliers.`
  }
];
