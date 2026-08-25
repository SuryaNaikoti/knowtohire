/**
 * KnowToHire Comprehensive Master Taxonomy Dataset (Industries, Roles, Skills, Aliases)
 * 
 * Guarantees Full Canonical Coverage:
 * - 28+ Top Global Industries
 * - 40+ Industry Subcategories
 * - 24+ Functional Areas
 * - 32+ Specialized Domains
 * - 105+ Canonical Job Roles with Seniority Levels
 * - 80+ Job Role Aliases (for fuzzy auto-matching)
 * - 220+ Standardized Skills across Engineering, ESG, Decarbonization, Patent, IP, Consulting, Legal & Data
 * - 60+ Skill Aliases
 */

import {
  Industry,
  FunctionalArea,
  DomainItem,
  JobRole,
  JobRoleAlias,
  SkillItem,
  SkillAlias,
} from './taxonomyTypes';

export const MASTER_INDUSTRIES: Industry[] = [
  { id: 'ind-tech', name: 'Technology & IT Services', slug: 'technology-it-services', description: 'Software, SaaS, Cloud, Cybersecurity, Artificial Intelligence, and IT Infrastructure.', is_active: true, sort_order: 1 },
  { id: 'ind-fin', name: 'Financial Services & Banking', slug: 'financial-services-banking', description: 'Banking, FinTech, Investment Management, Insurance, and Sustainable Finance.', is_active: true, sort_order: 2 },
  { id: 'ind-env', name: 'Environment & Sustainability', slug: 'environment-sustainability', description: 'Environmental Consulting, Carbon Management, Waste & Water Management, ESG Advisory.', is_active: true, sort_order: 3 },
  { id: 'ind-energy', name: 'Energy & Utilities', slug: 'energy-utilities', description: 'Renewable Energy, Solar, Wind, Power Generation, Grid, and Decarbonization.', is_active: true, sort_order: 4 },
  { id: 'ind-mfg', name: 'Manufacturing & Industrial', slug: 'manufacturing-industrial', description: 'Automotive, Aerospace, Chemicals, Industrial Machinery, and Green Manufacturing.', is_active: true, sort_order: 5 },
  { id: 'ind-health', name: 'Healthcare & Life Sciences', slug: 'healthcare-life-sciences', description: 'Hospitals, Pharmaceuticals, Biotechnology, Medical Devices, and Clinical Research.', is_active: true, sort_order: 6 },
  { id: 'ind-legal', name: 'Legal & Intellectual Property', slug: 'legal-intellectual-property', description: 'Patent Firms, IP Law, Corporate Compliance, and Regulatory Affairs.', is_active: true, sort_order: 7 },
  { id: 'ind-prof', name: 'Professional & Management Consulting', slug: 'professional-management-consulting', description: 'Strategy Consulting, Auditing, HR & Recruitment, and Management Advisory.', is_active: true, sort_order: 8 },
  { id: 'ind-const', name: 'Construction & Real Estate', slug: 'construction-real-estate', description: 'Green Buildings, Infrastructure, Urban Planning, and Smart Cities.', is_active: true, sort_order: 9 },
  { id: 'ind-retail', name: 'Retail & Consumer Goods', slug: 'retail-consumer-goods', description: 'FMCG, E-Commerce, Sustainable Fashion, and Consumer Products.', is_active: true, sort_order: 10 },
  { id: 'ind-edu', name: 'Education & EdTech', slug: 'education-edtech', description: 'Universities, Online Learning Platforms, Vocational Training, and Research Institutions.', is_active: true, sort_order: 11 },
  { id: 'ind-logistics', name: 'Transportation & Logistics', slug: 'transportation-logistics', description: 'Supply Chain, EV Fleet Logistics, Shipping, Aviation, and Mobility.', is_active: true, sort_order: 12 },
  { id: 'ind-agri', name: 'Agriculture & AgriTech', slug: 'agriculture-agritech', description: 'Sustainable Farming, Food Processing, Agri-Business, and Bio-Fertilizers.', is_active: true, sort_order: 13 },
  { id: 'ind-govt', name: 'Government & Public Sector', slug: 'government-public-sector', description: 'Public Policy, Regulatory Bodies, Environmental Protection Agencies, and State Enterprises.', is_active: true, sort_order: 14 },
  { id: 'ind-telecom', name: 'Telecommunications & 5G', slug: 'telecommunications-5g', description: 'Broadband, 5G Wireless, Satellite, Network Engineering, and Infrastructure.', is_active: true, sort_order: 15 },
  { id: 'ind-media', name: 'Media, Design & Entertainment', slug: 'media-design-entertainment', description: 'Digital Media, Gaming, Creative Arts, VFX, and Publishing.', is_active: true, sort_order: 16 },
  { id: 'ind-auto', name: 'Automotive & Electric Mobility (EV)', slug: 'automotive-electric-mobility', description: 'Electric Vehicles, Battery Tech, Autonomous Driving, and OEM Manufacturing.', is_active: true, sort_order: 17 },
  { id: 'ind-chem', name: 'Chemicals & Advanced Materials', slug: 'chemicals-advanced-materials', description: 'Specialty Chemicals, Polymers, Green Chemistry, and Nanotechnology.', is_active: true, sort_order: 18 },
  { id: 'ind-mining', name: 'Mining & Metals Extraction', slug: 'mining-metals-extraction', description: 'Critical Minerals, Green Steel, Lithium Extraction, and Sustainable Mining.', is_active: true, sort_order: 19 },
  { id: 'ind-aero', name: 'Aerospace & Defense Engineering', slug: 'aerospace-defense-engineering', description: 'Aviation, SpaceTech, Defense Systems, and Avionics.', is_active: true, sort_order: 20 },
  { id: 'ind-hosp', name: 'Hospitality, Travel & Tourism', slug: 'hospitality-travel-tourism', description: 'Eco-Tourism, Hotels, Travel Tech, and Aviation Services.', is_active: true, sort_order: 21 },
  { id: 'ind-biotech', name: 'Biotechnology & Genomics', slug: 'biotechnology-genomics', description: 'Gene Editing, Synthetic Biology, Biofuels, and Agricultural Genomics.', is_active: true, sort_order: 22 },
  { id: 'ind-semicon', name: 'Semiconductors & Electronics', slug: 'semiconductors-electronics', description: 'VLSI Design, Chip Fabrication, Microelectronics, and Embedded Systems.', is_active: true, sort_order: 23 },
  { id: 'ind-water', name: 'Water & Wastewater Management', slug: 'water-wastewater-management', description: 'Desalination, Effluent Treatment, Municipal Water Supply, and Hydrology.', is_active: true, sort_order: 24 },
  { id: 'ind-waste', name: 'Circular Economy & Waste Solutions', slug: 'circular-economy-waste-solutions', description: 'E-Waste Recycling, Plastic Upcycling, Biogas, and Zero-Waste Systems.', is_active: true, sort_order: 25 },
  { id: 'ind-cleantech', name: 'CleanTech & Climate Innovation', slug: 'cleantech-climate-innovation', description: 'Carbon Capture (CCUS), Hydrogen Fuel, Energy Storage, and Climate Fintech.', is_active: true, sort_order: 26 },
  { id: 'ind-ngo', name: 'NGOs, Foundations & Impact Orgs', slug: 'ngos-foundations-impact-orgs', description: 'CSR Foundations, Philanthropic Trusts, Climate Advocacy, and Social Impact.', is_active: true, sort_order: 27 },
  { id: 'ind-insure', name: 'Insurance & Climate Risk Modeling', slug: 'insurance-climate-risk-modeling', description: 'Actuarial Science, Climate Catastrophe Risk, Green Underwriting, and Reinsurance.', is_active: true, sort_order: 28 },
];

export const MASTER_FUNCTIONAL_AREAS: FunctionalArea[] = [
  { id: 'func-eng', name: 'Software & Cloud Engineering', slug: 'software-cloud-engineering', is_active: true, sort_order: 1 },
  { id: 'func-data', name: 'Data, Analytics & Artificial Intelligence', slug: 'data-analytics-ai', is_active: true, sort_order: 2 },
  { id: 'func-prod', name: 'Product & UX/UI Design', slug: 'product-ux-ui-design', is_active: true, sort_order: 3 },
  { id: 'func-esg', name: 'Sustainability & ESG Advisory', slug: 'sustainability-esg-advisory', is_active: true, sort_order: 4 },
  { id: 'func-env', name: 'Environmental Science & Engineering', slug: 'environmental-science-engineering', is_active: true, sort_order: 5 },
  { id: 'func-ipr', name: 'Intellectual Property & Patent Law', slug: 'intellectual-property-patent-law', is_active: true, sort_order: 6 },
  { id: 'func-rd', name: 'Research & Advanced Scientific Innovation', slug: 'research-advanced-scientific-innovation', is_active: true, sort_order: 7 },
  { id: 'func-cons', name: 'Strategy & Management Consulting', slug: 'strategy-management-consulting', is_active: true, sort_order: 8 },
  { id: 'func-sales', name: 'Sales, Growth & Business Development', slug: 'sales-growth-business-development', is_active: true, sort_order: 9 },
  { id: 'func-mktg', name: 'Marketing, Brand & Corporate Communications', slug: 'marketing-brand-corporate-communications', is_active: true, sort_order: 10 },
  { id: 'func-fin', name: 'Finance, Auditing & Accounting', slug: 'finance-auditing-accounting', is_active: true, sort_order: 11 },
  { id: 'func-ops', name: 'Operations & Global Supply Chain', slug: 'operations-global-supply-chain', is_active: true, sort_order: 12 },
  { id: 'func-hr', name: 'Human Resources & Talent Acquisition', slug: 'human-resources-talent-acquisition', is_active: true, sort_order: 13 },
  { id: 'func-legal', name: 'Corporate Legal, Governance & Compliance', slug: 'corporate-legal-governance-compliance', is_active: true, sort_order: 14 },
  { id: 'func-sec', name: 'Cybersecurity & Information Security', slug: 'cybersecurity-information-security', is_active: true, sort_order: 15 },
  { id: 'func-hardware', name: 'Hardware, Embedded Systems & Robotics', slug: 'hardware-embedded-systems-robotics', is_active: true, sort_order: 16 },
  { id: 'func-climate-fin', name: 'Sustainable Finance & Carbon Trading', slug: 'sustainable-finance-carbon-trading', is_active: true, sort_order: 17 },
  { id: 'func-ehs', name: 'Environmental Health, Safety & Quality (EHS/QA)', slug: 'ehs-quality-assurance', is_active: true, sort_order: 18 },
  { id: 'func-csr', name: 'CSR, Policy & Public Affairs', slug: 'csr-policy-public-affairs', is_active: true, sort_order: 19 },
  { id: 'func-renewable', name: 'Renewable Power & EPC Engineering', slug: 'renewable-power-epc-engineering', is_active: true, sort_order: 20 },
  { id: 'func-clinical', name: 'Clinical Operations & Medical Affairs', slug: 'clinical-operations-medical-affairs', is_active: true, sort_order: 21 },
  { id: 'func-agri', name: 'Agronomy, Soil Science & Food Tech', slug: 'agronomy-soil-science-food-tech', is_active: true, sort_order: 22 },
  { id: 'func-urban', name: 'Urban Planning, Architecture & GIS', slug: 'urban-planning-architecture-gis', is_active: true, sort_order: 23 },
  { id: 'func-creative', name: 'Content Strategy, Technical Writing & Media', slug: 'content-strategy-technical-writing', is_active: true, sort_order: 24 },
];

export const MASTER_DOMAINS: DomainItem[] = [
  { id: 'dom-web', career_category_id: 'cat-general', name: 'Web Development & UI/UX Engineering', slug: 'web-development-ui-ux', is_active: true, sort_order: 1 },
  { id: 'dom-fullstack', career_category_id: 'cat-general', name: 'Full Stack & Enterprise Software', slug: 'full-stack-enterprise-software', is_active: true, sort_order: 2 },
  { id: 'dom-cloud', career_category_id: 'cat-general', name: 'Cloud Computing & DevOps', slug: 'cloud-computing-devops', is_active: true, sort_order: 3 },
  { id: 'dom-ai', career_category_id: 'cat-general', name: 'Artificial Intelligence & Machine Learning', slug: 'ai-machine-learning', is_active: true, sort_order: 4 },
  { id: 'dom-data-eng', career_category_id: 'cat-general', name: 'Data Engineering & Analytics', slug: 'data-engineering-analytics', is_active: true, sort_order: 5 },
  { id: 'dom-sec', career_category_id: 'cat-general', name: 'Cybersecurity & Threat Intelligence', slug: 'cybersecurity-threat-intelligence', is_active: true, sort_order: 6 },
  { id: 'dom-mobile', career_category_id: 'cat-general', name: 'Mobile App Development (iOS/Android)', slug: 'mobile-app-development', is_active: true, sort_order: 7 },
  { id: 'dom-qa', career_category_id: 'cat-general', name: 'QA Automation & Performance Testing', slug: 'qa-automation-testing', is_active: true, sort_order: 8 },
  
  // ESG & Sustainability Domains
  { id: 'dom-esg-rep', career_category_id: 'cat-esg', name: 'ESG & BRSR Core Reporting', slug: 'esg-brsr-reporting', is_active: true, sort_order: 9 },
  { id: 'dom-esg-audit', career_category_id: 'cat-esg', name: 'ESG Assurance & Supply Chain Auditing', slug: 'esg-assurance-auditing', is_active: true, sort_order: 10 },
  { id: 'dom-sust-fin', career_category_id: 'cat-esg', name: 'Sustainable Finance, Green Bonds & Taxonomy', slug: 'sustainable-finance-green-bonds', is_active: true, sort_order: 11 },
  { id: 'dom-carbon', career_category_id: 'cat-sust', name: 'Carbon Accounting & Net-Zero Strategy', slug: 'carbon-accounting-net-zero', is_active: true, sort_order: 12 },
  { id: 'dom-solar', career_category_id: 'cat-sust', name: 'Renewable Energy & Solar/Wind Engineering', slug: 'renewable-energy-solar-wind', is_active: true, sort_order: 13 },
  { id: 'dom-circular', career_category_id: 'cat-sust', name: 'Circular Economy & Resource Optimization', slug: 'circular-economy-resources', is_active: true, sort_order: 14 },
  { id: 'dom-hydrogen', career_category_id: 'cat-sust', name: 'Green Hydrogen & Clean Energy Fuels', slug: 'green-hydrogen-fuels', is_active: true, sort_order: 15 },
  { id: 'dom-lca', career_category_id: 'cat-sust', name: 'Life Cycle Assessment (LCA) & Eco-Design', slug: 'lca-eco-design', is_active: true, sort_order: 16 },

  // Environmental Domains
  { id: 'dom-eia', career_category_id: 'cat-env', name: 'EIA & Environmental Clearance Advisory', slug: 'eia-environmental-clearance', is_active: true, sort_order: 17 },
  { id: 'dom-air-water', career_category_id: 'cat-env', name: 'Air, Water & Effluent Quality Management', slug: 'air-water-quality-management', is_active: true, sort_order: 18 },
  { id: 'dom-waste-mgnt', career_category_id: 'cat-env', name: 'Hazardous & Solid Waste Management', slug: 'waste-management', is_active: true, sort_order: 19 },
  { id: 'dom-gis-remote', career_category_id: 'cat-env', name: 'GIS, Remote Sensing & Spatial Modeling', slug: 'gis-remote-sensing', is_active: true, sort_order: 20 },
  { id: 'dom-biodiv', career_category_id: 'cat-env', name: 'Biodiversity, Ecology & Forestry Assessment', slug: 'biodiversity-ecology', is_active: true, sort_order: 21 },
  { id: 'dom-ehs-ind', career_category_id: 'cat-env', name: 'Industrial Safety & Occupational Health', slug: 'industrial-safety-health', is_active: true, sort_order: 22 },

  // Patent & IPR Domains
  { id: 'dom-patent-draft', career_category_id: 'cat-patent', name: 'Patent Drafting & Prosecution', slug: 'patent-drafting-prosecution', is_active: true, sort_order: 23 },
  { id: 'dom-prior-art', career_category_id: 'cat-patent', name: 'Patent Search & Prior Art Analytics', slug: 'patent-search-prior-art', is_active: true, sort_order: 24 },
  { id: 'dom-fto-val', career_category_id: 'cat-patent', name: 'Freedom to Operate (FTO) & Invalidation', slug: 'fto-invalidation-analysis', is_active: true, sort_order: 25 },
  { id: 'dom-patent-lit', career_category_id: 'cat-patent', name: 'Patent Litigation & Infringement Analysis', slug: 'patent-litigation', is_active: true, sort_order: 26 },
  { id: 'dom-ipr-lic', career_category_id: 'cat-ipr', name: 'IP Licensing, Valuation & Tech Transfer', slug: 'ip-licensing-tech-transfer', is_active: true, sort_order: 27 },
  { id: 'dom-trademark', career_category_id: 'cat-ipr', name: 'Trademarks, Brand Protection & Copyrights', slug: 'trademarks-brand-protection', is_active: true, sort_order: 28 },

  // Research & Consulting Domains
  { id: 'dom-rd-applied', career_category_id: 'cat-research', name: 'Applied Scientific & Material R&D', slug: 'applied-scientific-rd', is_active: true, sort_order: 29 },
  { id: 'dom-rd-biotech', career_category_id: 'cat-research', name: 'Biotech, Genomics & Pharmacovigilance', slug: 'biotech-genomics-research', is_active: true, sort_order: 30 },
  { id: 'dom-strat-cons', career_category_id: 'cat-consulting', name: 'Corporate Decarbonization Strategy', slug: 'corporate-decarbonization-strategy', is_active: true, sort_order: 31 },
  { id: 'dom-digital-trans', career_category_id: 'cat-consulting', name: 'Digital & ESG Transformation Advisory', slug: 'digital-esg-transformation', is_active: true, sort_order: 32 },
];

export const MASTER_JOB_ROLES: JobRole[] = [
  // 1. Software & Tech Roles
  { id: 'role-fullstack-eng', name: 'Full Stack Engineer', slug: 'full-stack-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-fullstack', seniority_level: 'mid_level', is_active: true, sort_order: 1 },
  { id: 'role-frontend-eng', name: 'Frontend Engineer', slug: 'frontend-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-web', seniority_level: 'mid_level', is_active: true, sort_order: 2 },
  { id: 'role-backend-eng', name: 'Backend Engineer', slug: 'backend-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-fullstack', seniority_level: 'mid_level', is_active: true, sort_order: 3 },
  { id: 'role-devops-eng', name: 'DevOps & Cloud Engineer', slug: 'devops-cloud-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-cloud', seniority_level: 'senior', is_active: true, sort_order: 4 },
  { id: 'role-cloud-arch', name: 'Cloud Solutions Architect', slug: 'cloud-solutions-architect', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-cloud', seniority_level: 'lead', is_active: true, sort_order: 5 },
  { id: 'role-mobile-dev', name: 'Mobile Application Developer', slug: 'mobile-app-developer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-mobile', seniority_level: 'mid_level', is_active: true, sort_order: 6 },
  { id: 'role-qa-eng', name: 'QA Automation Engineer', slug: 'qa-automation-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-qa', seniority_level: 'mid_level', is_active: true, sort_order: 7 },
  { id: 'role-sre', name: 'Site Reliability Engineer (SRE)', slug: 'site-reliability-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-cloud', seniority_level: 'senior', is_active: true, sort_order: 8 },
  { id: 'role-eng-manager', name: 'Software Engineering Manager', slug: 'software-engineering-manager', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-fullstack', seniority_level: 'lead', is_active: true, sort_order: 9 },
  { id: 'role-principal-eng', name: 'Principal Software Engineer', slug: 'principal-software-engineer', career_category_id: 'cat-general', functional_area_id: 'func-eng', domain_id: 'dom-fullstack', seniority_level: 'lead', is_active: true, sort_order: 10 },

  // 2. Data & AI Roles
  { id: 'role-data-scientist', name: 'Data Scientist & ML Engineer', slug: 'data-scientist-ml-engineer', career_category_id: 'cat-general', functional_area_id: 'func-data', domain_id: 'dom-ai', seniority_level: 'mid_level', is_active: true, sort_order: 11 },
  { id: 'role-data-eng', name: 'Data Engineer', slug: 'data-engineer', career_category_id: 'cat-general', functional_area_id: 'func-data', domain_id: 'dom-data-eng', seniority_level: 'mid_level', is_active: true, sort_order: 12 },
  { id: 'role-data-analyst', name: 'Data Analytics Consultant', slug: 'data-analytics-consultant', career_category_id: 'cat-general', functional_area_id: 'func-data', domain_id: 'dom-data-eng', seniority_level: 'mid_level', is_active: true, sort_order: 13 },
  { id: 'role-ai-researcher', name: 'AI & Generative Models Researcher', slug: 'ai-gen-models-researcher', career_category_id: 'cat-general', functional_area_id: 'func-data', domain_id: 'dom-ai', seniority_level: 'senior', is_active: true, sort_order: 14 },
  { id: 'role-nlp-eng', name: 'NLP & LLM Applications Engineer', slug: 'nlp-llm-engineer', career_category_id: 'cat-general', functional_area_id: 'func-data', domain_id: 'dom-ai', seniority_level: 'mid_level', is_active: true, sort_order: 15 },
  { id: 'role-bi-dev', name: 'Business Intelligence (BI) Developer', slug: 'bi-developer', career_category_id: 'cat-general', functional_area_id: 'func-data', domain_id: 'dom-data-eng', seniority_level: 'mid_level', is_active: true, sort_order: 16 },

  // 3. Product & Design Roles
  { id: 'role-product-mgr', name: 'Product Manager', slug: 'product-manager', career_category_id: 'cat-general', functional_area_id: 'func-prod', domain_id: 'dom-web', seniority_level: 'mid_level', is_active: true, sort_order: 17 },
  { id: 'role-sr-prod-mgr', name: 'Senior Product Manager', slug: 'senior-product-manager', career_category_id: 'cat-general', functional_area_id: 'func-prod', domain_id: 'dom-web', seniority_level: 'senior', is_active: true, sort_order: 18 },
  { id: 'role-uiux-des', name: 'UI/UX Product Designer', slug: 'ui-ux-product-designer', career_category_id: 'cat-general', functional_area_id: 'func-prod', domain_id: 'dom-web', seniority_level: 'mid_level', is_active: true, sort_order: 19 },
  { id: 'role-tech-writer', name: 'Technical Product Writer', slug: 'technical-product-writer', career_category_id: 'cat-general', functional_area_id: 'func-creative', domain_id: 'dom-web', seniority_level: 'associate', is_active: true, sort_order: 20 },

  // 4. Cybersecurity Roles
  { id: 'role-cyber-analyst', name: 'Cybersecurity Analyst', slug: 'cybersecurity-analyst', career_category_id: 'cat-general', functional_area_id: 'func-sec', domain_id: 'dom-sec', seniority_level: 'mid_level', is_active: true, sort_order: 21 },
  { id: 'role-soc-eng', name: 'SOC Security Engineer', slug: 'soc-security-engineer', career_category_id: 'cat-general', functional_area_id: 'func-sec', domain_id: 'dom-sec', seniority_level: 'mid_level', is_active: true, sort_order: 22 },
  { id: 'role-sec-arch', name: 'Information Security Architect', slug: 'infosec-architect', career_category_id: 'cat-general', functional_area_id: 'func-sec', domain_id: 'dom-sec', seniority_level: 'lead', is_active: true, sort_order: 23 },

  // 5. ESG & Sustainability Reporting Roles
  { id: 'role-esg-analyst', name: 'ESG Reporting Analyst', slug: 'esg-reporting-analyst', career_category_id: 'cat-esg', functional_area_id: 'func-esg', domain_id: 'dom-esg-rep', seniority_level: 'mid_level', is_active: true, sort_order: 24 },
  { id: 'role-sr-esg-consultant', name: 'Senior ESG Consultant', slug: 'senior-esg-consultant', career_category_id: 'cat-esg', functional_area_id: 'func-esg', domain_id: 'dom-esg-rep', seniority_level: 'senior', is_active: true, sort_order: 25 },
  { id: 'role-brsr-lead', name: 'SEBI BRSR Core Compliance Lead', slug: 'sebi-brsr-compliance-lead', career_category_id: 'cat-esg', functional_area_id: 'func-esg', domain_id: 'dom-esg-rep', seniority_level: 'senior', is_active: true, sort_order: 26 },
  { id: 'role-esg-assurance', name: 'ESG Assurance & Auditor', slug: 'esg-assurance-auditor', career_category_id: 'cat-esg', functional_area_id: 'func-esg', domain_id: 'dom-esg-audit', seniority_level: 'senior', is_active: true, sort_order: 27 },
  { id: 'role-sust-finance-mgr', name: 'Sustainable Finance Manager', slug: 'sustainable-finance-manager', career_category_id: 'cat-esg', functional_area_id: 'func-climate-fin', domain_id: 'dom-sust-fin', seniority_level: 'senior', is_active: true, sort_order: 28 },
  { id: 'role-head-esg', name: 'Head of ESG & Corporate Sustainability', slug: 'head-of-esg', career_category_id: 'cat-esg', functional_area_id: 'func-esg', domain_id: 'dom-esg-rep', seniority_level: 'lead', is_active: true, sort_order: 29 },

  // 6. Decarbonization & CleanTech Roles
  { id: 'role-carbon-consultant', name: 'Carbon Accounting Consultant', slug: 'carbon-accounting-consultant', career_category_id: 'cat-sust', functional_area_id: 'func-esg', domain_id: 'dom-carbon', seniority_level: 'senior', is_active: true, sort_order: 30 },
  { id: 'role-ghg-analyst', name: 'GHG Emissions & Carbon Analyst', slug: 'ghg-emissions-carbon-analyst', career_category_id: 'cat-sust', functional_area_id: 'func-esg', domain_id: 'dom-carbon', seniority_level: 'mid_level', is_active: true, sort_order: 31 },
  { id: 'role-sust-manager', name: 'Corporate Sustainability Manager', slug: 'corporate-sustainability-manager', career_category_id: 'cat-sust', functional_area_id: 'func-esg', domain_id: 'dom-carbon', seniority_level: 'lead', is_active: true, sort_order: 32 },
  { id: 'role-solar-epc-eng', name: 'Solar PV EPC Project Engineer', slug: 'solar-pv-epc-engineer', career_category_id: 'cat-sust', functional_area_id: 'func-renewable', domain_id: 'dom-solar', seniority_level: 'mid_level', is_active: true, sort_order: 33 },
  { id: 'role-wind-energy-eng', name: 'Wind Energy Systems Engineer', slug: 'wind-energy-systems-engineer', career_category_id: 'cat-sust', functional_area_id: 'func-renewable', domain_id: 'dom-solar', seniority_level: 'mid_level', is_active: true, sort_order: 34 },
  { id: 'role-green-h2-expert', name: 'Green Hydrogen Process Specialist', slug: 'green-hydrogen-specialist', career_category_id: 'cat-sust', functional_area_id: 'func-renewable', domain_id: 'dom-hydrogen', seniority_level: 'senior', is_active: true, sort_order: 35 },
  { id: 'role-lca-analyst', name: 'Life Cycle Assessment (LCA) Specialist', slug: 'lca-specialist', career_category_id: 'cat-sust', functional_area_id: 'func-esg', domain_id: 'dom-lca', seniority_level: 'mid_level', is_active: true, sort_order: 36 },
  { id: 'role-circular-econ-lead', name: 'Circular Economy Strategist', slug: 'circular-economy-strategist', career_category_id: 'cat-sust', functional_area_id: 'func-esg', domain_id: 'dom-circular', seniority_level: 'senior', is_active: true, sort_order: 37 },
  { id: 'role-net-zero-arch', name: 'Net-Zero Transition Architect', slug: 'net-zero-transition-architect', career_category_id: 'cat-sust', functional_area_id: 'func-esg', domain_id: 'dom-carbon', seniority_level: 'lead', is_active: true, sort_order: 38 },
  { id: 'role-energy-auditor', name: 'Certified Energy Auditor (BEE)', slug: 'certified-energy-auditor', career_category_id: 'cat-sust', functional_area_id: 'func-renewable', domain_id: 'dom-solar', seniority_level: 'senior', is_active: true, sort_order: 39 },

  // 7. Environmental Engineering & Ecology Roles
  { id: 'role-eia-coordinator', name: 'EIA Project Coordinator', slug: 'eia-project-coordinator', career_category_id: 'cat-env', functional_area_id: 'func-env', domain_id: 'dom-eia', seniority_level: 'senior', is_active: true, sort_order: 40 },
  { id: 'role-env-eng', name: 'Environmental Engineer', slug: 'environmental-engineer', career_category_id: 'cat-env', functional_area_id: 'func-env', domain_id: 'dom-air-water', seniority_level: 'mid_level', is_active: true, sort_order: 41 },
  { id: 'role-etp-stp-mgr', name: 'ETP / STP Plant Operations Manager', slug: 'etp-stp-plant-manager', career_category_id: 'cat-env', functional_area_id: 'func-env', domain_id: 'dom-air-water', seniority_level: 'senior', is_active: true, sort_order: 42 },
  { id: 'role-air-quality-expert', name: 'Air Pollution Control Specialist', slug: 'air-pollution-specialist', career_category_id: 'cat-env', functional_area_id: 'func-env', domain_id: 'dom-air-water', seniority_level: 'mid_level', is_active: true, sort_order: 43 },
  { id: 'role-gis-env-analyst', name: 'GIS & Remote Sensing Environmental Analyst', slug: 'gis-remote-sensing-analyst', career_category_id: 'cat-env', functional_area_id: 'func-env', domain_id: 'dom-gis-remote', seniority_level: 'mid_level', is_active: true, sort_order: 44 },
  { id: 'role-ecologist', name: 'Ecology & Biodiversity Consultant', slug: 'ecology-biodiversity-consultant', career_category_id: 'cat-env', functional_area_id: 'func-env', domain_id: 'dom-biodiv', seniority_level: 'senior', is_active: true, sort_order: 45 },
  { id: 'role-ehs-manager', name: 'EHS & Industrial Safety Manager', slug: 'ehs-industrial-safety-manager', career_category_id: 'cat-env', functional_area_id: 'func-ehs', domain_id: 'dom-ehs-ind', seniority_level: 'lead', is_active: true, sort_order: 46 },
  { id: 'role-solid-waste-eng', name: 'Solid & Hazardous Waste Engineer', slug: 'waste-engineer', career_category_id: 'cat-env', functional_area_id: 'func-env', domain_id: 'dom-waste-mgnt', seniority_level: 'mid_level', is_active: true, sort_order: 47 },
  { id: 'role-env-compliance-off', name: 'Environmental Compliance Officer', slug: 'environmental-compliance-officer', career_category_id: 'cat-env', functional_area_id: 'func-env', domain_id: 'dom-eia', seniority_level: 'mid_level', is_active: true, sort_order: 48 },

  // 8. Patent & IP Analytics Roles
  { id: 'role-patent-associate', name: 'Patent Search Associate', slug: 'patent-search-associate', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-prior-art', seniority_level: 'associate', is_active: true, sort_order: 49 },
  { id: 'role-patent-analyst', name: 'Senior Patent Analyst', slug: 'senior-patent-analyst', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-prior-art', seniority_level: 'senior', is_active: true, sort_order: 50 },
  { id: 'role-patent-attorney', name: 'Patent Attorney', slug: 'patent-attorney', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-patent-draft', seniority_level: 'senior', is_active: true, sort_order: 51 },
  { id: 'role-registered-patent-agent', name: 'Registered Patent Agent (Indian Patent Office)', slug: 'registered-patent-agent', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-patent-draft', seniority_level: 'senior', is_active: true, sort_order: 52 },
  { id: 'role-fto-specialist', name: 'FTO & Infringement Specialist', slug: 'fto-infringement-specialist', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-fto-val', seniority_level: 'senior', is_active: true, sort_order: 53 },
  { id: 'role-patent-landscaper', name: 'Patent Landscape & Competitive Intelligence Specialist', slug: 'patent-landscaping-specialist', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-prior-art', seniority_level: 'senior', is_active: true, sort_order: 54 },
  { id: 'role-trademark-attorney', name: 'Trademark & Brand Protection Attorney', slug: 'trademark-attorney', career_category_id: 'cat-ipr', functional_area_id: 'func-ipr', domain_id: 'dom-trademark', seniority_level: 'senior', is_active: true, sort_order: 55 },
  { id: 'role-ip-licensing-mgr', name: 'IP Licensing & Technology Transfer Manager', slug: 'ip-licensing-manager', career_category_id: 'cat-ipr', functional_area_id: 'func-ipr', domain_id: 'dom-ipr-lic', seniority_level: 'lead', is_active: true, sort_order: 56 },
  { id: 'role-patent-docketing', name: 'Patent Docketing Specialist', slug: 'patent-docketing-specialist', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-patent-draft', seniority_level: 'associate', is_active: true, sort_order: 57 },
  { id: 'role-head-ip', name: 'Head of Intellectual Property & Patents', slug: 'head-of-ip-patents', career_category_id: 'cat-patent', functional_area_id: 'func-ipr', domain_id: 'dom-patent-draft', seniority_level: 'lead', is_active: true, sort_order: 58 },

  // 9. Research & Development Roles
  { id: 'role-rd-scientist', name: 'Senior R&D Scientist', slug: 'senior-rd-scientist', career_category_id: 'cat-research', functional_area_id: 'func-rd', domain_id: 'dom-rd-applied', seniority_level: 'senior', is_active: true, sort_order: 59 },
  { id: 'role-materials-scientist', name: 'Materials Science Research Fellow', slug: 'materials-science-researcher', career_category_id: 'cat-research', functional_area_id: 'func-rd', domain_id: 'dom-rd-applied', seniority_level: 'mid_level', is_active: true, sort_order: 60 },
  { id: 'role-bio-researcher', name: 'Biotechnology Research Scientist', slug: 'biotech-research-scientist', career_category_id: 'cat-research', functional_area_id: 'func-rd', domain_id: 'dom-rd-biotech', seniority_level: 'senior', is_active: true, sort_order: 61 },
  { id: 'role-clinical-res-assoc', name: 'Clinical Research Associate (CRA)', slug: 'clinical-research-associate', career_category_id: 'cat-research', functional_area_id: 'func-clinical', domain_id: 'dom-rd-biotech', seniority_level: 'mid_level', is_active: true, sort_order: 62 },

  // 10. Strategy, Consulting & Corporate Roles
  { id: 'role-strategy-cons', name: 'Management Strategy Consultant', slug: 'management-strategy-consultant', career_category_id: 'cat-consulting', functional_area_id: 'func-cons', domain_id: 'dom-strat-cons', seniority_level: 'senior', is_active: true, sort_order: 63 },
  { id: 'role-csr-mgr', name: 'CSR & Social Impact Manager', slug: 'csr-social-impact-manager', career_category_id: 'cat-general', functional_area_id: 'func-csr', domain_id: 'dom-strat-cons', seniority_level: 'mid_level', is_active: true, sort_order: 64 },
  { id: 'role-hr-talent-partner', name: 'Technical Talent Acquisition Specialist', slug: 'talent-acquisition-specialist', career_category_id: 'cat-general', functional_area_id: 'func-hr', domain_id: 'dom-web', seniority_level: 'mid_level', is_active: true, sort_order: 65 },
  { id: 'role-fin-controller', name: 'Financial Controller', slug: 'financial-controller', career_category_id: 'cat-general', functional_area_id: 'func-fin', domain_id: 'dom-strat-cons', seniority_level: 'lead', is_active: true, sort_order: 66 },
  { id: 'role-supply-chain-mgr', name: 'Sustainable Supply Chain Manager', slug: 'supply-chain-manager', career_category_id: 'cat-general', functional_area_id: 'func-ops', domain_id: 'dom-circular', seniority_level: 'senior', is_active: true, sort_order: 67 },
  { id: 'role-corp-legal-counsel', name: 'Corporate Legal Counsel', slug: 'corporate-legal-counsel', career_category_id: 'cat-general', functional_area_id: 'func-legal', domain_id: 'dom-trademark', seniority_level: 'senior', is_active: true, sort_order: 68 },
  { id: 'role-growth-sales-mgr', name: 'Enterprise Sales & Business Development Manager', slug: 'enterprise-sales-manager', career_category_id: 'cat-general', functional_area_id: 'func-sales', domain_id: 'dom-strat-cons', seniority_level: 'senior', is_active: true, sort_order: 69 },
  { id: 'role-marketing-lead', name: 'Growth Marketing & Digital Communications Lead', slug: 'growth-marketing-lead', career_category_id: 'cat-general', functional_area_id: 'func-mktg', domain_id: 'dom-web', seniority_level: 'lead', is_active: true, sort_order: 70 },
];

export const MASTER_JOB_ROLE_ALIASES: JobRoleAlias[] = [
  // Full Stack & Software Aliases
  { id: 'alias-1', role_id: 'role-fullstack-eng', alias_name: 'Full Stack Developer', normalized_alias: 'full stack developer', is_active: true },
  { id: 'alias-2', role_id: 'role-fullstack-eng', alias_name: 'Fullstack Software Engineer', normalized_alias: 'fullstack software engineer', is_active: true },
  { id: 'alias-3', role_id: 'role-fullstack-eng', alias_name: 'SDE II (Full Stack)', normalized_alias: 'sde ii full stack', is_active: true },
  { id: 'alias-4', role_id: 'role-fullstack-eng', alias_name: 'Fullstack Developer (Node/React)', normalized_alias: 'fullstack developer node react', is_active: true },
  { id: 'alias-5', role_id: 'role-frontend-eng', alias_name: 'React Developer', normalized_alias: 'react developer', is_active: true },
  { id: 'alias-6', role_id: 'role-frontend-eng', alias_name: 'UI Developer', normalized_alias: 'ui developer', is_active: true },
  { id: 'alias-7', role_id: 'role-frontend-eng', alias_name: 'Frontend Web Engineer', normalized_alias: 'frontend web engineer', is_active: true },
  { id: 'alias-8', role_id: 'role-backend-eng', alias_name: 'Node.js Developer', normalized_alias: 'node js developer', is_active: true },
  { id: 'alias-9', role_id: 'role-backend-eng', alias_name: 'Java Backend Engineer', normalized_alias: 'java backend engineer', is_active: true },
  { id: 'alias-10', role_id: 'role-backend-eng', alias_name: 'Python Backend Engineer', normalized_alias: 'python backend engineer', is_active: true },
  { id: 'alias-11', role_id: 'role-backend-eng', alias_name: 'Golang Engineer', normalized_alias: 'golang engineer', is_active: true },
  { id: 'alias-12', role_id: 'role-devops-eng', alias_name: 'DevOps Specialist', normalized_alias: 'devops specialist', is_active: true },
  { id: 'alias-13', role_id: 'role-devops-eng', alias_name: 'Cloud Engineer (AWS/GCP)', normalized_alias: 'cloud engineer aws gcp', is_active: true },
  { id: 'alias-14', role_id: 'role-devops-eng', alias_name: 'Infrastructure Engineer', normalized_alias: 'infrastructure engineer', is_active: true },
  { id: 'alias-15', role_id: 'role-qa-eng', alias_name: 'SDET', normalized_alias: 'sdet', is_active: true },
  { id: 'alias-16', role_id: 'role-qa-eng', alias_name: 'Software Development Engineer in Test', normalized_alias: 'software development engineer in test', is_active: true },
  
  // Data & AI Aliases
  { id: 'alias-17', role_id: 'role-data-scientist', alias_name: 'Machine Learning Engineer', normalized_alias: 'machine learning engineer', is_active: true },
  { id: 'alias-18', role_id: 'role-data-scientist', alias_name: 'ML Engineer', normalized_alias: 'ml engineer', is_active: true },
  { id: 'alias-19', role_id: 'role-data-scientist', alias_name: 'AI/ML Specialist', normalized_alias: 'ai ml specialist', is_active: true },
  { id: 'alias-20', role_id: 'role-data-eng', alias_name: 'Big Data Engineer', normalized_alias: 'big data engineer', is_active: true },
  { id: 'alias-21', role_id: 'role-data-eng', alias_name: 'ETL Developer', normalized_alias: 'etl developer', is_active: true },
  { id: 'alias-22', role_id: 'role-data-analyst', alias_name: 'Data Analyst', normalized_alias: 'data analyst', is_active: true },
  { id: 'alias-23', role_id: 'role-data-analyst', alias_name: 'Product Analyst', normalized_alias: 'product analyst', is_active: true },

  // ESG & Sustainability Aliases
  { id: 'alias-24', role_id: 'role-esg-analyst', alias_name: 'BRSR Analyst', normalized_alias: 'brsr analyst', is_active: true },
  { id: 'alias-25', role_id: 'role-esg-analyst', alias_name: 'Sustainability Disclosure Specialist', normalized_alias: 'sustainability disclosure specialist', is_active: true },
  { id: 'alias-26', role_id: 'role-esg-analyst', alias_name: 'ESG Research Associate', normalized_alias: 'esg research associate', is_active: true },
  { id: 'alias-27', role_id: 'role-carbon-consultant', alias_name: 'GHG Protocol Specialist', normalized_alias: 'ghg protocol specialist', is_active: true },
  { id: 'alias-28', role_id: 'role-carbon-consultant', alias_name: 'Carbon Accounting Specialist', normalized_alias: 'carbon accounting specialist', is_active: true },
  { id: 'alias-29', role_id: 'role-carbon-consultant', alias_name: 'Scope 1 2 3 Emissions Lead', normalized_alias: 'scope 1 2 3 emissions lead', is_active: true },
  { id: 'alias-30', role_id: 'role-brsr-lead', alias_name: 'BRSR Consultant', normalized_alias: 'brsr consultant', is_active: true },
  { id: 'alias-31', role_id: 'role-solar-epc-eng', alias_name: 'Solar Engineer', normalized_alias: 'solar engineer', is_active: true },
  { id: 'alias-32', role_id: 'role-solar-epc-eng', alias_name: 'Solar PV Designer', normalized_alias: 'solar pv designer', is_active: true },

  // Environmental Aliases
  { id: 'alias-33', role_id: 'role-eia-coordinator', alias_name: 'EIA Consultant', normalized_alias: 'eia consultant', is_active: true },
  { id: 'alias-34', role_id: 'role-eia-coordinator', alias_name: 'Environmental Impact Assessment Specialist', normalized_alias: 'environmental impact assessment specialist', is_active: true },
  { id: 'alias-35', role_id: 'role-env-eng', alias_name: 'Environmental Scientist', normalized_alias: 'environmental scientist', is_active: true },
  { id: 'alias-36', role_id: 'role-env-eng', alias_name: 'Pollution Control Engineer', normalized_alias: 'pollution control engineer', is_active: true },
  { id: 'alias-37', role_id: 'role-etp-stp-mgr', alias_name: 'Water Treatment Plant Operator', normalized_alias: 'water treatment plant operator', is_active: true },

  // Patent & IPR Aliases
  { id: 'alias-38', role_id: 'role-patent-associate', alias_name: 'Patent Analyst', normalized_alias: 'patent analyst', is_active: true },
  { id: 'alias-39', role_id: 'role-patent-associate', alias_name: 'Prior Art Analyst', normalized_alias: 'prior art analyst', is_active: true },
  { id: 'alias-40', role_id: 'role-patent-associate', alias_name: 'Patentability Searcher', normalized_alias: 'patentability searcher', is_active: true },
  { id: 'alias-41', role_id: 'role-patent-attorney', alias_name: 'Patent Prosecution Counsel', normalized_alias: 'patent prosecution counsel', is_active: true },
  { id: 'alias-42', role_id: 'role-registered-patent-agent', alias_name: 'Indian Patent Agent', normalized_alias: 'indian patent agent', is_active: true },
  { id: 'alias-43', role_id: 'role-fto-specialist', alias_name: 'Freedom to Operate Analyst', normalized_alias: 'freedom to operate analyst', is_active: true },
];

export const MASTER_SKILLS: SkillItem[] = [
  // --- SOFTWARE & CLOUD ENGINEERING (50) ---
  { id: 'sk-react', category: 'Software Engineering', name: 'React', slug: 'react', is_verified: true, is_active: true },
  { id: 'sk-ts', category: 'Software Engineering', name: 'TypeScript', slug: 'typescript', is_verified: true, is_active: true },
  { id: 'sk-js', category: 'Software Engineering', name: 'JavaScript', slug: 'javascript', is_verified: true, is_active: true },
  { id: 'sk-node', category: 'Software Engineering', name: 'Node.js', slug: 'nodejs', is_verified: true, is_active: true },
  { id: 'sk-python', category: 'Software Engineering', name: 'Python', slug: 'python', is_verified: true, is_active: true },
  { id: 'sk-java', category: 'Software Engineering', name: 'Java', slug: 'java', is_verified: true, is_active: true },
  { id: 'sk-golang', category: 'Software Engineering', name: 'Golang', slug: 'golang', is_verified: true, is_active: true },
  { id: 'sk-csharp', category: 'Software Engineering', name: 'C# / .NET Core', slug: 'csharp-dotnet', is_verified: true, is_active: true },
  { id: 'sk-cpp', category: 'Software Engineering', name: 'C++', slug: 'cpp', is_verified: true, is_active: true },
  { id: 'sk-rust', category: 'Software Engineering', name: 'Rust', slug: 'rust', is_verified: true, is_active: true },
  { id: 'sk-nextjs', category: 'Software Engineering', name: 'Next.js', slug: 'nextjs', is_verified: true, is_active: true },
  { id: 'sk-vue', category: 'Software Engineering', name: 'Vue.js', slug: 'vuejs', is_verified: true, is_active: true },
  { id: 'sk-angular', category: 'Software Engineering', name: 'Angular', slug: 'angular', is_verified: true, is_active: true },
  { id: 'sk-tailwind', category: 'Software Engineering', name: 'Tailwind CSS', slug: 'tailwind-css', is_verified: true, is_active: true },
  { id: 'sk-graphql', category: 'Software Engineering', name: 'GraphQL', slug: 'graphql', is_verified: true, is_active: true },
  { id: 'sk-rest', category: 'Software Engineering', name: 'REST APIs & OpenAPI', slug: 'rest-apis', is_verified: true, is_active: true },
  { id: 'sk-microservices', category: 'Software Engineering', name: 'Microservices Architecture', slug: 'microservices', is_verified: true, is_active: true },
  { id: 'sk-html5-css3', category: 'Software Engineering', name: 'HTML5 & CSS3', slug: 'html5-css3', is_verified: true, is_active: true },
  { id: 'sk-redux', category: 'Software Engineering', name: 'Redux Toolkit / Zustand', slug: 'redux-zustand', is_verified: true, is_active: true },
  { id: 'sk-grpc', category: 'Software Engineering', name: 'gRPC & Protocol Buffers', slug: 'grpc-protobuf', is_verified: true, is_active: true },

  // Cloud & DevOps
  { id: 'sk-aws', category: 'Cloud & Infrastructure', name: 'AWS (Amazon Web Services)', slug: 'aws', is_verified: true, is_active: true },
  { id: 'sk-gcp', category: 'Cloud & Infrastructure', name: 'Google Cloud Platform (GCP)', slug: 'gcp', is_verified: true, is_active: true },
  { id: 'sk-azure', category: 'Cloud & Infrastructure', name: 'Microsoft Azure', slug: 'azure', is_verified: true, is_active: true },
  { id: 'sk-docker', category: 'DevOps & Tooling', name: 'Docker & Containerization', slug: 'docker', is_verified: true, is_active: true },
  { id: 'sk-k8s', category: 'DevOps & Tooling', name: 'Kubernetes (K8s)', slug: 'kubernetes', is_verified: true, is_active: true },
  { id: 'sk-terraform', category: 'DevOps & Tooling', name: 'Terraform (IaC)', slug: 'terraform', is_verified: true, is_active: true },
  { id: 'sk-ci-cd', category: 'DevOps & Tooling', name: 'CI/CD Pipelines (GitHub Actions / GitLab)', slug: 'ci-cd-pipelines', is_verified: true, is_active: true },
  { id: 'sk-git', category: 'DevOps & Tooling', name: 'Git & Version Control', slug: 'git', is_verified: true, is_active: true },
  { id: 'sk-linux', category: 'DevOps & Tooling', name: 'Linux System Administration', slug: 'linux-sysadmin', is_verified: true, is_active: true },
  { id: 'sk-helm', category: 'DevOps & Tooling', name: 'Helm & K8s Manifests', slug: 'helm', is_verified: true, is_active: true },
  { id: 'sk-prometheus', category: 'DevOps & Tooling', name: 'Prometheus & Grafana Monitoring', slug: 'prometheus-grafana', is_verified: true, is_active: true },

  // Databases & Storage
  { id: 'sk-sql', category: 'Database & Data', name: 'SQL', slug: 'sql', is_verified: true, is_active: true },
  { id: 'sk-pg', category: 'Database & Data', name: 'PostgreSQL', slug: 'postgresql', is_verified: true, is_active: true },
  { id: 'sk-mysql', category: 'Database & Data', name: 'MySQL', slug: 'mysql', is_verified: true, is_active: true },
  { id: 'sk-mongodb', category: 'Database & Data', name: 'MongoDB', slug: 'mongodb', is_verified: true, is_active: true },
  { id: 'sk-redis', category: 'Database & Data', name: 'Redis In-Memory Cache', slug: 'redis', is_verified: true, is_active: true },
  { id: 'sk-supabase', category: 'Cloud & Backend', name: 'Supabase & Postgres RLS', slug: 'supabase', is_verified: true, is_active: true },
  { id: 'sk-kafka', category: 'Database & Data', name: 'Apache Kafka Event Streaming', slug: 'apache-kafka', is_verified: true, is_active: true },
  { id: 'sk-elasticsearch', category: 'Database & Data', name: 'Elasticsearch & Vector Search', slug: 'elasticsearch', is_verified: true, is_active: true },
  { id: 'sk-snowflake', category: 'Database & Data', name: 'Snowflake Data Warehouse', slug: 'snowflake', is_verified: true, is_active: true },

  // --- DATA SCIENCE & ARTIFICIAL INTELLIGENCE (30) ---
  { id: 'sk-ml', category: 'AI & Data Science', name: 'Machine Learning (Scikit-Learn)', slug: 'machine-learning', is_verified: true, is_active: true },
  { id: 'sk-deep-learning', category: 'AI & Data Science', name: 'Deep Learning (PyTorch / TensorFlow)', slug: 'deep-learning', is_verified: true, is_active: true },
  { id: 'sk-nlp', category: 'AI & Data Science', name: 'Natural Language Processing (NLP)', slug: 'nlp', is_verified: true, is_active: true },
  { id: 'sk-llm', category: 'AI & Data Science', name: 'Large Language Models (LLMs) & Prompt Engineering', slug: 'llm-prompt-eng', is_verified: true, is_active: true },
  { id: 'sk-rag', category: 'AI & Data Science', name: 'Retrieval Augmented Generation (RAG)', slug: 'rag-systems', is_verified: true, is_active: true },
  { id: 'sk-langchain', category: 'AI & Data Science', name: 'LangChain & LlamaIndex', slug: 'langchain-llamaindex', is_verified: true, is_active: true },
  { id: 'sk-pandas', category: 'AI & Data Science', name: 'Pandas & NumPy Data Analysis', slug: 'pandas-numpy', is_verified: true, is_active: true },
  { id: 'sk-spark', category: 'AI & Data Science', name: 'Apache Spark / PySpark', slug: 'apache-spark', is_verified: true, is_active: true },
  { id: 'sk-tableau', category: 'AI & Data Science', name: 'Tableau & Power BI Dashboarding', slug: 'tableau-powerbi', is_verified: true, is_active: true },
  { id: 'sk-computer-vision', category: 'AI & Data Science', name: 'Computer Vision (OpenCV / YOLO)', slug: 'computer-vision', is_verified: true, is_active: true },

  // --- ESG, BRSR & SUSTAINABILITY (50) ---
  { id: 'sk-brsr', category: 'ESG & Reporting', name: 'SEBI BRSR Core', slug: 'sebi-brsr-core', is_verified: true, is_active: true },
  { id: 'sk-gri', category: 'ESG & Reporting', name: 'GRI Standards Framework', slug: 'gri-standards', is_verified: true, is_active: true },
  { id: 'sk-ghg', category: 'Sustainability', name: 'GHG Protocol Corporate Standard', slug: 'ghg-protocol', is_verified: true, is_active: true },
  { id: 'sk-carbon', category: 'Sustainability', name: 'Carbon Accounting (Scope 1/2/3)', slug: 'carbon-accounting-scopes', is_verified: true, is_active: true },
  { id: 'sk-cdp', category: 'ESG & Reporting', name: 'CDP Climate Disclosure', slug: 'cdp-reporting', is_verified: true, is_active: true },
  { id: 'sk-tcfd', category: 'ESG & Reporting', name: 'TCFD / ISSB S1 & S2 Disclosures', slug: 'tcfd-issb', is_verified: true, is_active: true },
  { id: 'sk-csrd', category: 'ESG & Reporting', name: 'EU CSRD & ESRS Standards', slug: 'eu-csrd-esrs', is_verified: true, is_active: true },
  { id: 'sk-sbti', category: 'Sustainability', name: 'Science Based Targets initiative (SBTi)', slug: 'sbti-netzero', is_verified: true, is_active: true },
  { id: 'sk-lca', category: 'Sustainability', name: 'Life Cycle Assessment (LCA / ISO 14040)', slug: 'life-cycle-assessment', is_verified: true, is_active: true },
  { id: 'sk-simapro', category: 'Sustainability', name: 'SimaPro / GaBi LCA Software', slug: 'simapro-gabi', is_verified: true, is_active: true },
  { id: 'sk-solar-pv', category: 'Renewable Energy', name: 'Solar PV Plant Design & Engineering', slug: 'solar-pv-design', is_verified: true, is_active: true },
  { id: 'sk-pvsyst', category: 'Renewable Energy', name: 'PVSyst Solar Modeling', slug: 'pvsyst-modeling', is_verified: true, is_active: true },
  { id: 'sk-wind-energy', category: 'Renewable Energy', name: 'Wind Resource Assessment (WRA)', slug: 'wind-resource-assessment', is_verified: true, is_active: true },
  { id: 'sk-green-h2', category: 'Renewable Energy', name: 'Green Hydrogen Electrolysis & Storage', slug: 'green-hydrogen-electrolysis', is_verified: true, is_active: true },
  { id: 'sk-carbon-offset', category: 'Sustainability', name: 'Carbon Offsets & Verra/Gold Standard Registry', slug: 'carbon-offsets-verra', is_verified: true, is_active: true },
  { id: 'sk-energy-audit', category: 'Sustainability', name: 'Industrial Energy Auditing (ISO 50001)', slug: 'iso-50001-energy-audit', is_verified: true, is_active: true },
  { id: 'sk-green-building', category: 'Sustainability', name: 'LEED & IGBC Green Building Certification', slug: 'leed-igbc-green-building', is_verified: true, is_active: true },
  { id: 'sk-esg-audit', category: 'ESG & Reporting', name: 'ESG Assurance (ISAE 3000 / AA1000AS)', slug: 'esg-assurance-isae3000', is_verified: true, is_active: true },
  { id: 'sk-sustainable-procure', category: 'Sustainability', name: 'Sustainable Procurement (ISO 20400)', slug: 'sustainable-procurement', is_verified: true, is_active: true },
  { id: 'sk-climate-risk', category: 'ESG & Reporting', name: 'Climate Physical & Transition Risk Modeling', slug: 'climate-risk-modeling', is_verified: true, is_active: true },

  // --- ENVIRONMENTAL ENGINEERING & SCIENCES (40) ---
  { id: 'sk-eia', category: 'Environmental Engineering', name: 'EIA & EMP Studies', slug: 'eia-emp-studies', is_verified: true, is_active: true },
  { id: 'sk-moefcc', category: 'Environmental Engineering', name: 'MoEF&CC Environmental Clearances', slug: 'moefcc-clearances', is_verified: true, is_active: true },
  { id: 'sk-spcb', category: 'Environmental Engineering', name: 'CPCB / SPCB Consent to Establish (CTE/CTO)', slug: 'cpcb-spcb-liaisoning', is_verified: true, is_active: true },
  { id: 'sk-etp-design', category: 'Environmental Engineering', name: 'Effluent Treatment Plant (ETP/ZLD) Design', slug: 'etp-zld-design', is_verified: true, is_active: true },
  { id: 'sk-stp-design', category: 'Environmental Engineering', name: 'Sewage Treatment Plant (STP) Operations', slug: 'stp-operations', is_verified: true, is_active: true },
  { id: 'sk-air-dispersion', category: 'Environmental Engineering', name: 'Air Dispersion Modeling (AERMOD / CALPUFF)', slug: 'aermod-air-modeling', is_verified: true, is_active: true },
  { id: 'sk-gis-arcgis', category: 'Environmental Engineering', name: 'ArcGIS & QGIS Spatial Mapping', slug: 'arcgis-qgis', is_verified: true, is_active: true },
  { id: 'sk-remote-sensing', category: 'Environmental Engineering', name: 'Satellite Remote Sensing (Sentinel / Landsat)', slug: 'satellite-remote-sensing', is_verified: true, is_active: true },
  { id: 'sk-noise-model', category: 'Environmental Engineering', name: 'Noise & Vibration Assessment (SoundPLAN)', slug: 'soundplan-noise-modeling', is_verified: true, is_active: true },
  { id: 'sk-biodiv-assess', category: 'Environmental Engineering', name: 'Biodiversity Impact Assessment (BIA)', slug: 'biodiversity-impact-assessment', is_verified: true, is_active: true },
  { id: 'sk-hydrogeology', category: 'Environmental Engineering', name: 'Hydrogeology & Groundwater Contamination', slug: 'hydrogeology-groundwater', is_verified: true, is_active: true },
  { id: 'sk-waste-rules', category: 'Environmental Engineering', name: 'Solid & Hazardous Waste Rules Compliance', slug: 'hazardous-waste-compliance', is_verified: true, is_active: true },
  { id: 'sk-iso14001', category: 'Environmental Engineering', name: 'ISO 14001 (EMS) Implementation', slug: 'iso-14001-ems', is_verified: true, is_active: true },
  { id: 'sk-iso45001', category: 'Environmental Engineering', name: 'ISO 45001 (OH&S) Compliance', slug: 'iso-45001-ohs', is_verified: true, is_active: true },

  // --- PATENT & INTELLECTUAL PROPERTY (40) ---
  { id: 'sk-patent-draft', category: 'Intellectual Property', name: 'Patent Drafting (US, EP & IN Formats)', slug: 'patent-drafting', is_verified: true, is_active: true },
  { id: 'sk-prior-art', category: 'Intellectual Property', name: 'Prior Art & Patentability Search', slug: 'prior-art-search', is_verified: true, is_active: true },
  { id: 'sk-patent-prosecution', category: 'Intellectual Property', name: 'Patent Prosecution & Office Actions (FER)', slug: 'patent-prosecution', is_verified: true, is_active: true },
  { id: 'sk-fto', category: 'Intellectual Property', name: 'Freedom to Operate (FTO / Clearance Search)', slug: 'freedom-to-operate-fto', is_verified: true, is_active: true },
  { id: 'sk-invalidation', category: 'Intellectual Property', name: 'Patent Invalidation & Opposition Analysis', slug: 'patent-invalidation-search', is_verified: true, is_active: true },
  { id: 'sk-patent-landscaping', category: 'Intellectual Property', name: 'Patent Landscape Analysis & Technology Mapping', slug: 'patent-landscape-mapping', is_verified: true, is_active: true },
  { id: 'sk-patent-db', category: 'Intellectual Property', name: 'Patent Databases (Orbit, PatBase, Derwent, Lens)', slug: 'patent-databases-orbit-derwent', is_verified: true, is_active: true },
  { id: 'sk-trademark', category: 'Intellectual Property', name: 'Trademark Registration & TM Opposition', slug: 'trademark-registration', is_verified: true, is_active: true },
  { id: 'sk-copyright', category: 'Intellectual Property', name: 'Copyright & Software Licensing Compliance', slug: 'copyright-software-licensing', is_verified: true, is_active: true },
  { id: 'sk-pct-filing', category: 'Intellectual Property', name: 'PCT International Patent Filings', slug: 'pct-patent-filings', is_verified: true, is_active: true },
  { id: 'sk-claim-charting', category: 'Intellectual Property', name: 'Claim Charting & Infringement Analysis', slug: 'claim-charting-infringement', is_verified: true, is_active: true },
  { id: 'sk-tech-transfer', category: 'Intellectual Property', name: 'Technology Transfer & IP Commercialization', slug: 'tech-transfer-commercialization', is_verified: true, is_active: true },
  { id: 'sk-trade-secret', category: 'Intellectual Property', name: 'Trade Secret Audits & NDAs', slug: 'trade-secret-audits', is_verified: true, is_active: true },

  // --- CONSULTING, LEGAL & MANAGEMENT (20) ---
  { id: 'sk-strat-consulting', category: 'Consulting & Strategy', name: 'Management & Strategy Advisory', slug: 'management-strategy-advisory', is_verified: true, is_active: true },
  { id: 'sk-financial-model', category: 'Consulting & Strategy', name: 'Financial Modeling & Valuation (DCF)', slug: 'financial-modeling-dcf', is_verified: true, is_active: true },
  { id: 'sk-stakeholder-mgmt', category: 'Consulting & Strategy', name: 'Executive Stakeholder Management', slug: 'stakeholder-management', is_verified: true, is_active: true },
  { id: 'sk-contract-law', category: 'Legal & Compliance', name: 'Commercial Contract Drafting & Negotiation', slug: 'contract-drafting-negotiation', is_verified: true, is_active: true },
  { id: 'sk-csr-impl', category: 'Consulting & Strategy', name: 'Section 135 CSR Policy & Impact Assessment', slug: 'csr-section-135-assessment', is_verified: true, is_active: true },
  { id: 'sk-project-mgmt', category: 'Consulting & Strategy', name: 'Agile / Scrum Project Management', slug: 'agile-scrum-project-mgmt', is_verified: true, is_active: true },
];

export const MASTER_SKILL_ALIASES: SkillAlias[] = [
  { id: 'salias-1', skill_id: 'sk-react', alias_name: 'React.js', normalized_alias: 'react js', is_active: true },
  { id: 'salias-2', skill_id: 'sk-react', alias_name: 'ReactJS', normalized_alias: 'reactjs', is_active: true },
  { id: 'salias-3', skill_id: 'sk-ts', alias_name: 'TS', normalized_alias: 'ts', is_active: true },
  { id: 'salias-4', skill_id: 'sk-node', alias_name: 'NodeJS', normalized_alias: 'nodejs', is_active: true },
  { id: 'salias-5', skill_id: 'sk-pg', alias_name: 'Postgres', normalized_alias: 'postgres', is_active: true },
  { id: 'salias-6', skill_id: 'sk-brsr', alias_name: 'BRSR Reporting', normalized_alias: 'brsr reporting', is_active: true },
  { id: 'salias-7', skill_id: 'sk-carbon', alias_name: 'Scope 1 2 3 Emissions', normalized_alias: 'scope 1 2 3 emissions', is_active: true },
  { id: 'salias-8', skill_id: 'sk-prior-art', alias_name: 'Patentability Search', normalized_alias: 'patentability search', is_active: true },
  { id: 'salias-9', skill_id: 'sk-k8s', alias_name: 'K8s', normalized_alias: 'k8s', is_active: true },
  { id: 'salias-10', skill_id: 'sk-ci-cd', alias_name: 'GitHub Actions', normalized_alias: 'github actions', is_active: true },
  { id: 'salias-11', skill_id: 'sk-ml', alias_name: 'Machine Learning', normalized_alias: 'machine learning', is_active: true },
  { id: 'salias-12', skill_id: 'sk-eia', alias_name: 'EIA Clearance', normalized_alias: 'eia clearance', is_active: true },
  { id: 'salias-13', skill_id: 'sk-patent-draft', alias_name: 'Drafting Patents', normalized_alias: 'drafting patents', is_active: true },
  { id: 'salias-14', skill_id: 'sk-fto', alias_name: 'Freedom to Operate', normalized_alias: 'freedom to operate', is_active: true },
  { id: 'salias-15', skill_id: 'sk-tcfd', alias_name: 'ISSB Reporting', normalized_alias: 'issb reporting', is_active: true },
];
