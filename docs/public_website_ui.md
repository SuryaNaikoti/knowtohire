# KNOWTOHIRE — PUBLIC WEBSITE UI DOCUMENTATION

## Executive Overview

The **KnowToHire Public Website UI** has been fully assembled using the approved **Master UI Moodboard V2** design system and the **reusable React component foundation**.

### Identity & positioning
- **Primary Brand Statement**: "Know More. Hire Better. Grow Faster."
- **Conceptual Journey**: "Knowledge → Opportunity → Growth" (Know → Discover → Apply → Connect → Grow)

---

## 1. Route & Page Inventory (16 Public Routes)

| Route Path | Page Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage.tsx` | Hero, discovery search, 8 career categories, featured jobs, resources, templates, employer CTA, blog, final CTA |
| `/jobs` | `JobsPage.tsx` | Job discovery feed with search, location filter, employment type filter, salary metrics in INR, and job cards grid |
| `/jobs/:id` | `JobDetailsPage.tsx` | Detailed job posting with requirements, INR salary band, requirements checklist, company sidebar, and apply modal preview |
| `/careers` | `CareersPage.tsx` | 8 Career category domains (General, Environmental, ESG, Sustainability, Patent, IPR, Research, Consulting) |
| `/knowledge` | `KnowledgePage.tsx` | Knowledge Hub for E-books, study materials, research papers, and regulatory handbooks |
| `/knowledge/:id` | `ResourceDetailsPage.tsx` | E-book/Research paper preview with page count, rating, author, and download modal preview |
| `/templates` | `TemplatesPage.tsx` | Document Template Marketplace for ATS resumes, legal MSAs, business contracts, and ESG compliance checklists |
| `/templates/:id` | `TemplateDetailsPage.tsx` | Document template details, format info, price tag in INR, included items, and get template modal |
| `/blog` | `BlogPage.tsx` | Editorial blog articles grid |
| `/blog/:slug` | `BlogDetailsPage.tsx` | Full article reading view with high legibility editorial typography |
| `/pricing` | `PricingPage.tsx` | Candidate Free, Employer Starter (`₹1,499/mo`), and Enterprise (`₹4,999/mo`) pricing cards with billing toggle |
| `/about` | `AboutPage.tsx` | Brand story and mission statement |
| `/contact` | `ContactPage.tsx` | Contact support form with subject category selector and Indian office coordinates |
| `/privacy` | `PrivacyPage.tsx` | Legal privacy policy document |
| `/terms` | `TermsPage.tsx` | Legal terms of service document |
| `*` | `NotFoundPage.tsx` | 404 Fallback page with return to home action |

---

## 2. Reusable Public Page Components (`src/components/public/`)

1. **`Navbar.tsx`**: Sticky header with logo mark, navigation links, `Cmd + K` search palette trigger, Sign In, Post Job CTAs, and responsive mobile drawer.
2. **`HeroSection.tsx`**: Hero section with headline **"Know More. Hire Better. Grow Faster."**, dual discovery tabs ("Career & Jobs" vs "Knowledge & Resources"), location selector, and search bar.
3. **`CategoryGrid.tsx`**: 8 Career categories cards grid.
4. **`FeaturedJobs.tsx`**: Featured opportunities section using `JobCard`.
5. **`FeaturedResources.tsx`**: Knowledge Hub preview using `ResourceCard`.
6. **`FeaturedTemplates.tsx`**: Template Marketplace preview using `TemplateCard`.
7. **`FeaturedArticles.tsx`**: Editorial articles preview using `BlogCard`.
8. **`EmployerCTA.tsx`**: Employer hiring value proposition banner.
9. **`CareerGrowthSection.tsx`**: Intelligence & skill match score positioning section.
10. **`FinalCTA.tsx`**: Final ecosystem CTA banner.
11. **`Footer.tsx`**: Global public footer with platform links, candidate/employer sections, company info, and legal links.

---

## 3. Mock Dataset Standards (`src/data/mockData.ts`)

- **Indian Salary Figures**: Formatted in Indian Rupees (`₹24L - ₹32L/yr`, `₹18L - ₹26L/yr`, `₹15L - ₹22L/yr`).
- **Indian Locations**: `Bengaluru, KA`, `Hyderabad, TS`, `Mumbai, MH`, `Delhi NCR`, `Pune, MH`, `Remote`.
- **Domain Topics**: SEBI BRSR mandatory reporting, SPCB environmental compliance, CleanTech patent drafting, ISO 14001, GRI standards.

---

## 4. Responsive Verification & Accessibility

- **Desktop (1440px / 1280px)**: Spacious layouts, 3-4 column card grids, bento sections.
- **Tablet (1024px / 768px)**: Adaptive 2-column card reflow, simplified navbar.
- **Mobile (430px / 375px)**: Single-column card stack, full-width search bar, minimum touch target size `44px`.
- **WCAG 2.2 AA**: All text contrast ratios ≥ 4.5:1, visible focus rings, non-color dependent status pills.
