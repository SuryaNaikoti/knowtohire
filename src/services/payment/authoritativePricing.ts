/**
 * Authoritative Server-Side Product Catalog & Pricing Definition
 * Shared between Serverless API functions, Vite dev server middleware, and client services.
 * Ensures the client can NEVER tamper with prices or amounts.
 */

export interface CatalogItem {
  id: string;
  type: 'template' | 'knowledge_resource' | 'employer_subscription' | 'candidate_subscription' | 'content_request';
  title: string;
  priceINR: number;
  isFree?: boolean;
  filePath?: string;
  storageBucket?: 'templates' | 'knowledge-hub' | 'content';
}

export const CANONICAL_CATALOG: Record<string, CatalogItem> = {
  // --- Templates ---
  'tmpl-1': {
    id: 'tmpl-1',
    type: 'template',
    title: 'Executive ATS Resume Template — Sustainability & ESG',
    priceINR: 499,
    filePath: 'templates/tmpl-1/sustainability_esg_ats_resume.docx',
    storageBucket: 'templates',
  },
  'sustainability-esg-executive-ats-resume': {
    id: 'tmpl-1',
    type: 'template',
    title: 'Executive ATS Resume Template — Sustainability & ESG',
    priceINR: 499,
    filePath: 'templates/tmpl-1/sustainability_esg_ats_resume.docx',
    storageBucket: 'templates',
  },
  'tmpl-2': {
    id: 'tmpl-2',
    type: 'template',
    title: 'Environmental Impact Assessment (EIA) Consultancy Agreement',
    priceINR: 999,
    filePath: 'templates/tmpl-2/eia_consultancy_agreement_template.docx',
    storageBucket: 'templates',
  },
  'eia-consultancy-master-services-agreement': {
    id: 'tmpl-2',
    type: 'template',
    title: 'Environmental Impact Assessment (EIA) Consultancy Agreement',
    priceINR: 999,
    filePath: 'templates/tmpl-2/eia_consultancy_agreement_template.docx',
    storageBucket: 'templates',
  },
  'tmpl-3': {
    id: 'tmpl-3',
    type: 'template',
    title: 'Corporate ESG Compliance Audit Checklist & Scoring Matrix',
    priceINR: 0,
    isFree: true,
    filePath: 'templates/tmpl-3/corporate_esg_audit_matrix_toolkit.xlsx',
    storageBucket: 'templates',
  },
  'corporate-esg-compliance-audit-checklist': {
    id: 'tmpl-3',
    type: 'template',
    title: 'Corporate ESG Compliance Audit Checklist & Scoring Matrix',
    priceINR: 0,
    isFree: true,
    filePath: 'templates/tmpl-3/corporate_esg_audit_matrix_toolkit.xlsx',
    storageBucket: 'templates',
  },
  'tmpl-4': {
    id: 'tmpl-4',
    type: 'template',
    title: 'Independent Patent Research & Prior Art Search Contract',
    priceINR: 799,
    filePath: 'templates/tmpl-4/patent_research_consultant_contract.docx',
    storageBucket: 'templates',
  },
  'patent-research-consultant-agreement': {
    id: 'tmpl-4',
    type: 'template',
    title: 'Independent Patent Research & Prior Art Search Contract',
    priceINR: 799,
    filePath: 'templates/tmpl-4/patent_research_consultant_contract.docx',
    storageBucket: 'templates',
  },

  // --- Knowledge Hub Resources ---
  'res-tech-1': {
    id: 'res-tech-1',
    type: 'knowledge_resource',
    title: 'Production Kubernetes Infrastructure Blueprint',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-1/kubernetes_infrastructure_guide.pdf',
    storageBucket: 'knowledge-hub',
  },
  'production-kubernetes-infrastructure-blueprint': {
    id: 'res-tech-1',
    type: 'knowledge_resource',
    title: 'Production Kubernetes Infrastructure Blueprint',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-1/kubernetes_infrastructure_guide.pdf',
    storageBucket: 'knowledge-hub',
  },
  'res-tech-2': {
    id: 'res-tech-2',
    type: 'knowledge_resource',
    title: 'Infrastructure as Code with Terraform & AWS',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-2/terraform_aws_iac_handbook.pdf',
    storageBucket: 'knowledge-hub',
  },
  'infrastructure-as-code-terraform-aws': {
    id: 'res-tech-2',
    type: 'knowledge_resource',
    title: 'Infrastructure as Code with Terraform & AWS',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-2/terraform_aws_iac_handbook.pdf',
    storageBucket: 'knowledge-hub',
  },
  'res-tech-3': {
    id: 'res-tech-3',
    type: 'knowledge_resource',
    title: 'Enterprise System Architecture & Microservices Design',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-3/enterprise_microservices_architecture.pdf',
    storageBucket: 'knowledge-hub',
  },
  'enterprise-system-architecture-microservices-design': {
    id: 'res-tech-3',
    type: 'knowledge_resource',
    title: 'Enterprise System Architecture & Microservices Design',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-tech-3/enterprise_microservices_architecture.pdf',
    storageBucket: 'knowledge-hub',
  },
  'res-1': {
    id: 'res-1',
    type: 'knowledge_resource',
    title: 'Environmental Compliance Calendar & SPCB Guide 2026',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-1/environmental_compliance_calendar_2026.pdf',
    storageBucket: 'knowledge-hub',
  },
  'environmental-compliance-calendar-spcb-guide-2026': {
    id: 'res-1',
    type: 'knowledge_resource',
    title: 'Environmental Compliance Calendar & SPCB Guide 2026',
    priceINR: 0,
    isFree: true,
    filePath: 'resources/res-1/environmental_compliance_calendar_2026.pdf',
    storageBucket: 'knowledge-hub',
  },
  'res-2': {
    id: 'res-2',
    type: 'knowledge_resource',
    title: 'Patent Filing & IPR Guide for Tech Startups',
    priceINR: 499,
    filePath: 'resources/res-2/patent_filing_ipr_startups.pdf',
    storageBucket: 'knowledge-hub',
  },
  'patent-filing-ipr-guide-tech-startups': {
    id: 'res-2',
    type: 'knowledge_resource',
    title: 'Patent Filing & IPR Guide for Tech Startups',
    priceINR: 499,
    filePath: 'resources/res-2/patent_filing_ipr_startups.pdf',
    storageBucket: 'knowledge-hub',
  },

  // --- Subscriptions ---
  'sub_starter_monthly': {
    id: 'sub_starter_monthly',
    type: 'employer_subscription',
    title: 'KnowToHire Employer Starter (Monthly)',
    priceINR: 1499,
  },
  'sub_starter_annual': {
    id: 'sub_starter_annual',
    type: 'employer_subscription',
    title: 'KnowToHire Employer Starter (Annual)',
    priceINR: 14388,
  },
  'sub_enterprise_monthly': {
    id: 'sub_enterprise_monthly',
    type: 'employer_subscription',
    title: 'KnowToHire Enterprise Hiring (Monthly)',
    priceINR: 4999,
  },
  'sub_enterprise_annual': {
    id: 'sub_enterprise_annual',
    type: 'employer_subscription',
    title: 'KnowToHire Enterprise Hiring (Annual)',
    priceINR: 47988,
  },
};

/**
 * Resolves authoritative price in INR for any catalog item.
 * Throws error if item is unknown.
 */
export function getAuthoritativeItem(itemId: string, _itemType?: string): CatalogItem | null {
  if (!itemId) return null;
  const canonical = CANONICAL_CATALOG[itemId];
  if (canonical) return canonical;

  // Prefix matching for subscription ids like 'sub_starter_monthly'
  if (itemId.startsWith('sub_')) {
    const key = itemId.toLowerCase();
    if (CANONICAL_CATALOG[key]) return CANONICAL_CATALOG[key];
  }

  return null;
}
