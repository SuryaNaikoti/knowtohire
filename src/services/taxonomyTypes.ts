/**
 * KnowToHire Master Taxonomy & Geography Types & Canonical Seed Dataset
 * 
 * Defines normalized models and comprehensive master data records:
 * - Career Categories
 * - Industries & Sub-industries
 * - Functional Areas
 * - Domains & Specializations
 * - Canonical Job Roles & Role Aliases
 * - Standardized Skills & Skill Aliases
 * - Geography (Countries, States/Provinces, Cities)
 * - Employment, Experience, Education, and Company Size Metadata
 */

export interface CareerCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export interface IndustrySubcategory {
  id: string;
  industry_id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface FunctionalArea {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface DomainItem {
  id: string;
  parent_id?: string | null;
  career_category_id?: string | null;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface JobRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
  career_category_id?: string | null;
  functional_area_id?: string | null;
  domain_id?: string | null;
  industry_id?: string | null;
  seniority_level?: string;
  is_active: boolean;
  sort_order: number;
}

export interface JobRoleAlias {
  id: string;
  role_id: string;
  alias_name: string;
  normalized_alias: string;
  is_active: boolean;
}

export interface SkillItem {
  id: string;
  category: string;
  name: string;
  slug: string;
  description?: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface SkillAlias {
  id: string;
  skill_id: string;
  alias_name: string;
  normalized_alias: string;
  is_active: boolean;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  iso2: string;
  iso3: string;
  phone_code: string;
  currency_code: string;
  currency_symbol: string;
  region: string;
  is_active: boolean;
  sort_order: number;
}

export interface StateRegion {
  id: string;
  country_id: string;
  name: string;
  state_code?: string;
  type: string;
  is_active: boolean;
  sort_order: number;
}

export interface CityItem {
  id: string;
  country_id: string;
  state_id?: string;
  name: string;
  slug: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

// ============================================================================
// CANONICAL MASTER SEED DATASET
// ============================================================================

export const SEED_CAREER_CATEGORIES: CareerCategory[] = [
  { id: 'cat-general', name: 'General Careers', slug: 'general-careers', description: 'Cross-functional and general enterprise careers.', icon: 'Briefcase', is_active: true, sort_order: 1 },
  { id: 'cat-env', name: 'Environmental Careers', slug: 'environmental-careers', description: 'EIA, pollution control, ecological conservation, and natural resource management.', icon: 'Leaf', is_active: true, sort_order: 2 },
  { id: 'cat-esg', name: 'ESG Careers', slug: 'esg-careers', description: 'SEBI BRSR Core, corporate ESG assurance, sustainability disclosure, and sustainable finance.', icon: 'ShieldCheck', is_active: true, sort_order: 3 },
  { id: 'cat-sust', name: 'Sustainability Careers', slug: 'sustainability-careers', description: 'Corporate decarbonization, circular economy, renewable energy, and net-zero strategy.', icon: 'Sun', is_active: true, sort_order: 4 },
  { id: 'cat-patent', name: 'Patent Careers', slug: 'patent-careers', description: 'CleanTech and tech patent prosecution, prior art searches, patent drafting, and IP litigation.', icon: 'FileText', is_active: true, sort_order: 5 },
  { id: 'cat-ipr', name: 'IPR Careers', slug: 'ipr-careers', description: 'Trademarks, copyrights, trade secrets, technology transfer, and licensing.', icon: 'Award', is_active: true, sort_order: 6 },
  { id: 'cat-research', name: 'Research Careers', slug: 'research-careers', description: 'Academic R&D, scientific innovations, life sciences, and applied technologies.', icon: 'Search', is_active: true, sort_order: 7 },
  { id: 'cat-consulting', name: 'Consulting Careers', slug: 'consulting-careers', description: 'Management advisory, digital transformation, environmental & ESG consulting.', icon: 'TrendingUp', is_active: true, sort_order: 8 },
];

export const SEED_INDUSTRIES: Industry[] = [
  { id: 'ind-tech', name: 'Technology & IT Services', slug: 'technology-it-services', description: 'Software, SaaS, Cloud, Cybersecurity, Artificial Intelligence, and IT Infrastructure.', is_active: true, sort_order: 1 },
  { id: 'ind-fin', name: 'Financial Services & Banking', slug: 'financial-services-banking', description: 'Banking, FinTech, Investment Management, Insurance, and Sustainable Finance.', is_active: true, sort_order: 2 },
  { id: 'ind-env', name: 'Environment & Sustainability', slug: 'environment-sustainability', description: 'Environmental Consulting, Carbon Management, Waste & Water Management, ESG Advisory.', is_active: true, sort_order: 3 },
  { id: 'ind-energy', name: 'Energy & Utilities', slug: 'energy-utilities', description: 'Renewable Energy, Solar, Wind, Power Generation, Grid, and Decarbonization.', is_active: true, sort_order: 4 },
  { id: 'ind-mfg', name: 'Manufacturing & Industrial', slug: 'manufacturing-industrial', description: 'Automotive, Aerospace, Chemicals, Industrial Machinery, and Green Manufacturing.', is_active: true, sort_order: 5 },
  { id: 'ind-health', name: 'Healthcare & Life Sciences', slug: 'healthcare-life-sciences', description: 'Hospitals, Pharmaceuticals, Biotechnology, Medical Devices, and Clinical Research.', is_active: true, sort_order: 6 },
  { id: 'ind-legal', name: 'Legal & Intellectual Property', slug: 'legal-intellectual-property', description: 'Patent Firms, IP Law, Corporate Compliance, and Regulatory Affairs.', is_active: true, sort_order: 7 },
  { id: 'ind-prof', name: 'Professional & Business Services', slug: 'professional-business-services', description: 'Strategy Consulting, Auditing, HR & Recruitment, and Management Advisory.', is_active: true, sort_order: 8 },
  { id: 'ind-const', name: 'Construction & Real Estate', slug: 'construction-real-estate', description: 'Green Buildings, Infrastructure, Urban Planning, and Smart Cities.', is_active: true, sort_order: 9 },
  { id: 'ind-retail', name: 'Retail & Consumer Goods', slug: 'retail-consumer-goods', description: 'FMCG, E-Commerce, Sustainable Fashion, and Consumer Products.', is_active: true, sort_order: 10 },
  { id: 'ind-edu', name: 'Education & EdTech', slug: 'education-edtech', description: 'Universities, Online Learning Platforms, Vocational Training, and Research Institutions.', is_active: true, sort_order: 11 },
  { id: 'ind-logistics', name: 'Transportation & Logistics', slug: 'transportation-logistics', description: 'Supply Chain, EV Fleet Logistics, Shipping, Aviation, and Mobility.', is_active: true, sort_order: 12 },
  { id: 'ind-agri', name: 'Agriculture & AgriTech', slug: 'agriculture-agritech', description: 'Sustainable Farming, Food Processing, Agri-Business, and Bio-Fertilizers.', is_active: true, sort_order: 13 },
  { id: 'ind-govt', name: 'Government & Public Sector', slug: 'government-public-sector', description: 'Public Policy, Regulatory Bodies, Environmental Protection Agencies, and State Enterprises.', is_active: true, sort_order: 14 },
];

export const SEED_FUNCTIONAL_AREAS: FunctionalArea[] = [
  { id: 'func-eng', name: 'Software & Cloud Engineering', slug: 'software-cloud-engineering', is_active: true, sort_order: 1 },
  { id: 'func-data', name: 'Data & Artificial Intelligence', slug: 'data-ai', is_active: true, sort_order: 2 },
  { id: 'func-prod', name: 'Product & Design', slug: 'product-design', is_active: true, sort_order: 3 },
  { id: 'func-esg', name: 'Sustainability & ESG Advisory', slug: 'sustainability-esg-advisory', is_active: true, sort_order: 4 },
  { id: 'func-env', name: 'Environmental Science & Engineering', slug: 'environmental-science-engineering', is_active: true, sort_order: 5 },
  { id: 'func-ipr', name: 'Intellectual Property & Legal', slug: 'intellectual-property-legal', is_active: true, sort_order: 6 },
  { id: 'func-rd', name: 'Research & Development', slug: 'research-development', is_active: true, sort_order: 7 },
  { id: 'func-cons', name: 'Management & Strategy Consulting', slug: 'management-strategy-consulting', is_active: true, sort_order: 8 },
  { id: 'func-sales', name: 'Sales & Business Development', slug: 'sales-business-development', is_active: true, sort_order: 9 },
  { id: 'func-mktg', name: 'Marketing & Corporate Communications', slug: 'marketing-corporate-communications', is_active: true, sort_order: 10 },
  { id: 'func-fin', name: 'Finance, Accounting & Auditing', slug: 'finance-accounting-auditing', is_active: true, sort_order: 11 },
  { id: 'func-ops', name: 'Operations & Supply Chain', slug: 'operations-supply-chain', is_active: true, sort_order: 12 },
  { id: 'func-hr', name: 'Human Resources & Talent Acquisition', slug: 'human-resources-talent-acquisition', is_active: true, sort_order: 13 },
];

export const SEED_DOMAINS: DomainItem[] = [
  { id: 'dom-web', career_category_id: 'cat-general', name: 'Web Development & UI/UX Engineering', slug: 'web-development-ui-ux', is_active: true, sort_order: 1 },
  { id: 'dom-fullstack', career_category_id: 'cat-general', name: 'Full Stack & Enterprise Software', slug: 'full-stack-enterprise-software', is_active: true, sort_order: 2 },
  { id: 'dom-cloud', career_category_id: 'cat-general', name: 'Cloud Computing & DevOps', slug: 'cloud-computing-devops', is_active: true, sort_order: 3 },
  { id: 'dom-ai', career_category_id: 'cat-general', name: 'Artificial Intelligence & Machine Learning', slug: 'ai-machine-learning', is_active: true, sort_order: 4 },
  { id: 'dom-data-eng', career_category_id: 'cat-general', name: 'Data Engineering & Analytics', slug: 'data-engineering-analytics', is_active: true, sort_order: 5 },
  { id: 'dom-esg-rep', career_category_id: 'cat-esg', name: 'ESG & BRSR Core Reporting', slug: 'esg-brsr-reporting', is_active: true, sort_order: 6 },
  { id: 'dom-carbon', career_category_id: 'cat-sust', name: 'Carbon Accounting & Net-Zero Strategy', slug: 'carbon-accounting-net-zero', is_active: true, sort_order: 7 },
  { id: 'dom-solar', career_category_id: 'cat-sust', name: 'Renewable Energy & Solar Engineering', slug: 'renewable-energy-solar', is_active: true, sort_order: 8 },
  { id: 'dom-eia', career_category_id: 'cat-env', name: 'EIA & Environmental Clearance Advisory', slug: 'eia-environmental-clearance', is_active: true, sort_order: 9 },
  { id: 'dom-air-water', career_category_id: 'cat-env', name: 'Air & Water Quality Management', slug: 'air-water-quality-management', is_active: true, sort_order: 10 },
  { id: 'dom-patent-draft', career_category_id: 'cat-patent', name: 'Patent Drafting & Prosecution', slug: 'patent-drafting-prosecution', is_active: true, sort_order: 11 },
  { id: 'dom-prior-art', career_category_id: 'cat-patent', name: 'Patent Search & Prior Art Analytics', slug: 'patent-search-prior-art', is_active: true, sort_order: 12 },
  { id: 'dom-ipr-lic', career_category_id: 'cat-ipr', name: 'IP Licensing & Technology Transfer', slug: 'ip-licensing-tech-transfer', is_active: true, sort_order: 13 },
];

export const SEED_JOB_ROLES: JobRole[] = [
  { id: 'role-fullstack-eng', name: 'Full Stack Engineer', slug: 'full-stack-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-fullstack', seniority_level: 'mid_level', is_active: true, sort_order: 1 },
  { id: 'role-frontend-eng', name: 'Frontend Engineer', slug: 'frontend-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-web', seniority_level: 'mid_level', is_active: true, sort_order: 2 },
  { id: 'role-backend-eng', name: 'Backend Engineer', slug: 'backend-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-fullstack', seniority_level: 'mid_level', is_active: true, sort_order: 3 },
  { id: 'role-devops-eng', name: 'DevOps & Cloud Engineer', slug: 'devops-cloud-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-cloud', seniority_level: 'senior', is_active: true, sort_order: 4 },
  { id: 'role-data-scientist', name: 'Data Scientist & ML Engineer', slug: 'data-scientist-ml-engineer', career_category_id: 'cat-general', functional_area_id: 'func-data', domain_id: 'dom-ai', seniority_level: 'mid_level', is_active: true, sort_order: 5 },
  { id: 'role-esg-analyst', name: 'ESG Reporting Analyst', slug: 'esg-reporting-analyst', career_category_id: 'cat-esg', functional_area_id: 'func-esg', domain_id: 'dom-esg-rep', seniority_level: 'mid_level', is_active: true, sort_order: 6 },
  { id: 'role-carbon-consultant', name: 'Carbon Accounting Consultant', slug: 'carbon-accounting-consultant', career_category_id: 'cat-sust', functional_area_id: 'func-esg', domain_id: 'dom-carbon', seniority_level: 'senior', is_active: true, sort_order: 7 },
  { id: 'role-eia-coordinator', name: 'EIA Project Coordinator', slug: 'eia-project-coordinator', career_category_id: 'cat-env', functional_area_id: 'func-env', domain_id: 'dom-eia', seniority_level: 'senior', is_active: true, sort_order: 8 },
  { id: 'role-patent-associate', name: 'Patent Search Associate', slug: 'patent-search-associate', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-prior-art', seniority_level: 'associate', is_active: true, sort_order: 9 },
  { id: 'role-patent-attorney', name: 'Patent Attorney', slug: 'patent-attorney', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-patent-draft', seniority_level: 'senior', is_active: true, sort_order: 10 },
  { id: 'role-sust-manager', name: 'Corporate Sustainability Manager', slug: 'corporate-sustainability-manager', career_category_id: 'cat-sust', functional_area_id: 'func-esg', domain_id: 'dom-carbon', seniority_level: 'lead', is_active: true, sort_order: 11 },
];

export const SEED_JOB_ROLE_ALIASES: JobRoleAlias[] = [
  { id: 'alias-1', role_id: 'role-fullstack-eng', alias_name: 'Full Stack Developer', normalized_alias: 'full stack developer', is_active: true },
  { id: 'alias-2', role_id: 'role-fullstack-eng', alias_name: 'Fullstack Software Engineer', normalized_alias: 'fullstack software engineer', is_active: true },
  { id: 'alias-3', role_id: 'role-fullstack-eng', alias_name: 'SDE II (Full Stack)', normalized_alias: 'sde ii full stack', is_active: true },
  { id: 'alias-4', role_id: 'role-frontend-eng', alias_name: 'React Developer', normalized_alias: 'react developer', is_active: true },
  { id: 'alias-5', role_id: 'role-frontend-eng', alias_name: 'UI Developer', normalized_alias: 'ui developer', is_active: true },
  { id: 'alias-6', role_id: 'role-backend-eng', alias_name: 'Node.js Developer', normalized_alias: 'node js developer', is_active: true },
  { id: 'alias-7', role_id: 'role-backend-eng', alias_name: 'Java Backend Engineer', normalized_alias: 'java backend engineer', is_active: true },
  { id: 'alias-8', role_id: 'role-esg-analyst', alias_name: 'BRSR Analyst', normalized_alias: 'brsr analyst', is_active: true },
  { id: 'alias-9', role_id: 'role-esg-analyst', alias_name: 'Sustainability Disclosure Specialist', normalized_alias: 'sustainability disclosure specialist', is_active: true },
  { id: 'alias-10', role_id: 'role-carbon-consultant', alias_name: 'GHG Protocol Specialist', normalized_alias: 'ghg protocol specialist', is_active: true },
  { id: 'alias-11', role_id: 'role-patent-associate', alias_name: 'Patent Analyst', normalized_alias: 'patent analyst', is_active: true },
  { id: 'alias-12', role_id: 'role-patent-associate', alias_name: 'Prior Art Analyst', normalized_alias: 'prior art analyst', is_active: true },
];

export const SEED_SKILLS: SkillItem[] = [
  // Tech Skills
  { id: 'skill-react', category: 'Software Engineering', name: 'React', slug: 'react', is_verified: true, is_active: true },
  { id: 'skill-ts', category: 'Software Engineering', name: 'TypeScript', slug: 'typescript', is_verified: true, is_active: true },
  { id: 'skill-js', category: 'Software Engineering', name: 'JavaScript', slug: 'javascript', is_verified: true, is_active: true },
  { id: 'skill-node', category: 'Software Engineering', name: 'Node.js', slug: 'nodejs', is_verified: true, is_active: true },
  { id: 'skill-python', category: 'Software Engineering', name: 'Python', slug: 'python', is_verified: true, is_active: true },
  { id: 'skill-sql', category: 'Database & Data', name: 'SQL', slug: 'sql', is_verified: true, is_active: true },
  { id: 'skill-pg', category: 'Database & Data', name: 'PostgreSQL', slug: 'postgresql', is_verified: true, is_active: true },
  { id: 'skill-supabase', category: 'Cloud & Backend', name: 'Supabase', slug: 'supabase', is_verified: true, is_active: true },
  { id: 'skill-aws', category: 'Cloud & Infrastructure', name: 'AWS', slug: 'aws', is_verified: true, is_active: true },
  { id: 'skill-docker', category: 'DevOps & Tooling', name: 'Docker', slug: 'docker', is_verified: true, is_active: true },
  { id: 'skill-tailwind', category: 'Software Engineering', name: 'Tailwind CSS', slug: 'tailwind-css', is_verified: true, is_active: true },
  { id: 'skill-graphql', category: 'Software Engineering', name: 'GraphQL', slug: 'graphql', is_verified: true, is_active: true },
  { id: 'skill-nextjs', category: 'Software Engineering', name: 'Next.js', slug: 'nextjs', is_verified: true, is_active: true },
  { id: 'skill-git', category: 'DevOps & Tooling', name: 'Git', slug: 'git', is_verified: true, is_active: true },

  // Sustainability & ESG Skills
  { id: 'skill-brsr', category: 'ESG & Reporting', name: 'SEBI BRSR Core', slug: 'sebi-brsr-core', is_verified: true, is_active: true },
  { id: 'skill-gri', category: 'ESG & Reporting', name: 'GRI Standards', slug: 'gri-standards', is_verified: true, is_active: true },
  { id: 'skill-ghg', category: 'Sustainability', name: 'GHG Protocol', slug: 'ghg-protocol', is_verified: true, is_active: true },
  { id: 'skill-carbon', category: 'Sustainability', name: 'Carbon Accounting (Scope 1/2/3)', slug: 'carbon-accounting-scopes', is_verified: true, is_active: true },
  { id: 'skill-cdp', category: 'ESG & Reporting', name: 'CDP Reporting', slug: 'cdp-reporting', is_verified: true, is_active: true },
  { id: 'skill-tcfd', category: 'ESG & Reporting', name: 'TCFD / ISSB Disclosures', slug: 'tcfd-issb', is_verified: true, is_active: true },
  { id: 'skill-lca', category: 'Sustainability', name: 'Life Cycle Assessment (LCA)', slug: 'life-cycle-assessment', is_verified: true, is_active: true },
  { id: 'skill-eia', category: 'Environmental Engineering', name: 'EIA Studies', slug: 'eia-studies', is_verified: true, is_active: true },
  { id: 'skill-spcb', category: 'Environmental Engineering', name: 'CPCB / SPCB Liaisoning', slug: 'cpcb-spcb-liaisoning', is_verified: true, is_active: true },

  // Patent & IPR Skills
  { id: 'skill-patent-draft', category: 'Intellectual Property', name: 'Patent Drafting', slug: 'patent-drafting', is_verified: true, is_active: true },
  { id: 'skill-prior-art', category: 'Intellectual Property', name: 'Prior Art Search', slug: 'prior-art-search', is_verified: true, is_active: true },
  { id: 'skill-patent-prosecution', category: 'Intellectual Property', name: 'Patent Prosecution', slug: 'patent-prosecution', is_verified: true, is_active: true },
  { id: 'skill-fto', category: 'Intellectual Property', name: 'Freedom to Operate (FTO)', slug: 'freedom-to-operate-fto', is_verified: true, is_active: true },
  { id: 'skill-trademark', category: 'Intellectual Property', name: 'Trademark Registration', slug: 'trademark-registration', is_verified: true, is_active: true },
];

export const SEED_SKILL_ALIASES: SkillAlias[] = [
  { id: 'salias-1', skill_id: 'skill-react', alias_name: 'React.js', normalized_alias: 'react js', is_active: true },
  { id: 'salias-2', skill_id: 'skill-react', alias_name: 'ReactJS', normalized_alias: 'reactjs', is_active: true },
  { id: 'salias-3', skill_id: 'skill-ts', alias_name: 'TS', normalized_alias: 'ts', is_active: true },
  { id: 'salias-4', skill_id: 'skill-node', alias_name: 'NodeJS', normalized_alias: 'nodejs', is_active: true },
  { id: 'salias-5', skill_id: 'skill-pg', alias_name: 'Postgres', normalized_alias: 'postgres', is_active: true },
  { id: 'salias-6', skill_id: 'skill-brsr', alias_name: 'BRSR Reporting', normalized_alias: 'brsr reporting', is_active: true },
  { id: 'salias-7', skill_id: 'skill-carbon', alias_name: 'Scope 1 2 3 Emissions', normalized_alias: 'scope 1 2 3 emissions', is_active: true },
  { id: 'salias-8', skill_id: 'skill-prior-art', alias_name: 'Patentability Search', normalized_alias: 'patentability search', is_active: true },
];

export const SEED_COUNTRIES: Country[] = [
  { id: 'country-in', name: 'India', slug: 'india', iso2: 'IN', iso3: 'IND', phone_code: '+91', currency_code: 'INR', currency_symbol: '₹', region: 'Asia-Pacific', is_active: true, sort_order: 1 },
  { id: 'country-us', name: 'United States', slug: 'united-states', iso2: 'US', iso3: 'USA', phone_code: '+1', currency_code: 'USD', currency_symbol: '$', region: 'Americas', is_active: true, sort_order: 2 },
  { id: 'country-uk', name: 'United Kingdom', slug: 'united-kingdom', iso2: 'GB', iso3: 'GBR', phone_code: '+44', currency_code: 'GBP', currency_symbol: '£', region: 'Europe', is_active: true, sort_order: 3 },
  { id: 'country-ca', name: 'Canada', slug: 'canada', iso2: 'CA', iso3: 'CAN', phone_code: '+1', currency_code: 'CAD', currency_symbol: 'C$', region: 'Americas', is_active: true, sort_order: 4 },
  { id: 'country-sg', name: 'Singapore', slug: 'singapore', iso2: 'SG', iso3: 'SGP', phone_code: '+65', currency_code: 'SGD', currency_symbol: 'S$', region: 'Asia-Pacific', is_active: true, sort_order: 5 },
  { id: 'country-ae', name: 'United Arab Emirates', slug: 'united-arab-emirates', iso2: 'AE', iso3: 'ARE', phone_code: '+971', currency_code: 'AED', currency_symbol: 'AED', region: 'Middle East', is_active: true, sort_order: 6 },
  { id: 'country-de', name: 'Germany', slug: 'germany', iso2: 'DE', iso3: 'DEU', phone_code: '+49', currency_code: 'EUR', currency_symbol: '€', region: 'Europe', is_active: true, sort_order: 7 },
  { id: 'country-au', name: 'Australia', slug: 'australia', iso2: 'AU', iso3: 'AUS', phone_code: '+61', currency_code: 'AUD', currency_symbol: 'A$', region: 'Asia-Pacific', is_active: true, sort_order: 8 },
];

export const SEED_INDIAN_STATES: StateRegion[] = [
  { id: 'state-ts', country_id: 'country-in', name: 'Telangana', state_code: 'TS', type: 'State', is_active: true, sort_order: 1 },
  { id: 'state-ka', country_id: 'country-in', name: 'Karnataka', state_code: 'KA', type: 'State', is_active: true, sort_order: 2 },
  { id: 'state-mh', country_id: 'country-in', name: 'Maharashtra', state_code: 'MH', type: 'State', is_active: true, sort_order: 3 },
  { id: 'state-dl', country_id: 'country-in', name: 'Delhi', state_code: 'DL', type: 'Union Territory', is_active: true, sort_order: 4 },
  { id: 'state-tn', country_id: 'country-in', name: 'Tamil Nadu', state_code: 'TN', type: 'State', is_active: true, sort_order: 5 },
  { id: 'state-hr', country_id: 'country-in', name: 'Haryana', state_code: 'HR', type: 'State', is_active: true, sort_order: 6 },
  { id: 'state-up', country_id: 'country-in', name: 'Uttar Pradesh', state_code: 'UP', type: 'State', is_active: true, sort_order: 7 },
  { id: 'state-wb', country_id: 'country-in', name: 'West Bengal', state_code: 'WB', type: 'State', is_active: true, sort_order: 8 },
  { id: 'state-gj', country_id: 'country-in', name: 'Gujarat', state_code: 'GJ', type: 'State', is_active: true, sort_order: 9 },
  { id: 'state-ap', country_id: 'country-in', name: 'Andhra Pradesh', state_code: 'AP', type: 'State', is_active: true, sort_order: 10 },
  { id: 'state-kl', country_id: 'country-in', name: 'Kerala', state_code: 'KL', type: 'State', is_active: true, sort_order: 11 },
  { id: 'state-rj', country_id: 'country-in', name: 'Rajasthan', state_code: 'RJ', type: 'State', is_active: true, sort_order: 12 },
  { id: 'state-mp', country_id: 'country-in', name: 'Madhya Pradesh', state_code: 'MP', type: 'State', is_active: true, sort_order: 13 },
  { id: 'state-pb', country_id: 'country-in', name: 'Punjab', state_code: 'PB', type: 'State', is_active: true, sort_order: 14 },
  { id: 'state-od', country_id: 'country-in', name: 'Odisha', state_code: 'OD', type: 'State', is_active: true, sort_order: 15 },
];

export const SEED_CITIES: CityItem[] = [
  // India Popular Tech & Environmental Hubs
  { id: 'city-hyd', country_id: 'country-in', state_id: 'state-ts', name: 'Hyderabad', slug: 'hyderabad', is_popular: true, is_active: true, sort_order: 1 },
  { id: 'city-blr', country_id: 'country-in', state_id: 'state-ka', name: 'Bengaluru', slug: 'bengaluru', is_popular: true, is_active: true, sort_order: 2 },
  { id: 'city-mum', country_id: 'country-in', state_id: 'state-mh', name: 'Mumbai', slug: 'mumbai', is_popular: true, is_active: true, sort_order: 3 },
  { id: 'city-pune', country_id: 'country-in', state_id: 'state-mh', name: 'Pune', slug: 'pune', is_popular: true, is_active: true, sort_order: 4 },
  { id: 'city-delhi', country_id: 'country-in', state_id: 'state-dl', name: 'New Delhi', slug: 'new-delhi', is_popular: true, is_active: true, sort_order: 5 },
  { id: 'city-noida', country_id: 'country-in', state_id: 'state-up', name: 'Noida', slug: 'noida', is_popular: true, is_active: true, sort_order: 6 },
  { id: 'city-gurugram', country_id: 'country-in', state_id: 'state-hr', name: 'Gurugram', slug: 'gurugram', is_popular: true, is_active: true, sort_order: 7 },
  { id: 'city-chennai', country_id: 'country-in', state_id: 'state-tn', name: 'Chennai', slug: 'chennai', is_popular: true, is_active: true, sort_order: 8 },
  { id: 'city-kolkata', country_id: 'country-in', state_id: 'state-wb', name: 'Kolkata', slug: 'kolkata', is_popular: true, is_active: true, sort_order: 9 },
  { id: 'city-ahmedabad', country_id: 'country-in', state_id: 'state-gj', name: 'Ahmedabad', slug: 'ahmedabad', is_popular: true, is_active: true, sort_order: 10 },
  { id: 'city-vizag', country_id: 'country-in', state_id: 'state-ap', name: 'Visakhapatnam', slug: 'visakhapatnam', is_popular: false, is_active: true, sort_order: 11 },
  { id: 'city-kochi', country_id: 'country-in', state_id: 'state-kl', name: 'Kochi', slug: 'kochi', is_popular: false, is_active: true, sort_order: 12 },
  { id: 'city-jaipur', country_id: 'country-in', state_id: 'state-rj', name: 'Jaipur', slug: 'jaipur', is_popular: false, is_active: true, sort_order: 13 },
  { id: 'city-chandigarh', country_id: 'country-in', state_id: 'state-pb', name: 'Chandigarh', slug: 'chandigarh', is_popular: false, is_active: true, sort_order: 14 },
  { id: 'city-bhubaneswar', country_id: 'country-in', state_id: 'state-od', name: 'Bhubaneswar', slug: 'bhubaneswar', is_popular: false, is_active: true, sort_order: 15 },
  // Global Metros
  { id: 'city-nyc', country_id: 'country-us', name: 'New York', slug: 'new-york', is_popular: true, is_active: true, sort_order: 16 },
  { id: 'city-sf', country_id: 'country-us', name: 'San Francisco', slug: 'san-francisco', is_popular: true, is_active: true, sort_order: 17 },
  { id: 'city-london', country_id: 'country-uk', name: 'London', slug: 'london', is_popular: true, is_active: true, sort_order: 18 },
  { id: 'city-toronto', country_id: 'country-ca', name: 'Toronto', slug: 'toronto', is_popular: true, is_active: true, sort_order: 19 },
  { id: 'city-sg', country_id: 'country-sg', name: 'Singapore', slug: 'singapore-city', is_popular: true, is_active: true, sort_order: 20 },
  { id: 'city-dubai', country_id: 'country-ae', name: 'Dubai', slug: 'dubai', is_popular: true, is_active: true, sort_order: 21 },
];
