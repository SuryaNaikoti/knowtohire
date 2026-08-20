# KNOWTOHIRE — MASTER UI DESIGN SYSTEM & MOODBOARD SPECIFICATION (V2 DEFINITIVE)

## Executive Summary & Positioning

KnowToHire is a unified:
**Career Discovery + Professional Recruitment + Knowledge Ecosystem + Professional Document Marketplace + Content Requests + Administrative Governance Platform.**

### Official Brand Statement
> **Know More. Hire Better. Grow Faster.**

### Conceptual Brand Journey
> **Knowledge → Opportunity → Growth** (Know → Discover → Apply → Connect → Grow)

This document serves as the **definitive visual north star** for KnowToHire. Every future screen, component, layout, token, and user experience across both public discovery and enterprise product portals must strictly adhere to this design specification.

---

## SECTION 01 — BRAND IDENTITY & VISUAL POSITIONING

### Visual Concept & Personality
KnowToHire represents **Professional Intelligence** applied to career progression and talent acquisition.
It balances consumer-facing discovery warmth with enterprise-grade operational clarity.

- **Primary Personality**: Intelligent, Professional, Trustworthy, Modern, Human, Confident.
- **Secondary Personality**: Ambitious, Helpful, Organized, Progressive, Efficient.
- **Avoid**: Generic AI SaaS looks, developer tools, Web3/crypto aesthetics, neon colors, excessive glassmorphism, heavy drop shadows, over-rounded pills everywhere, or carbon copies of LinkedIn, Indeed, Naukri, Coursera, Udemy, or Notion.

### Visual Keywords
`Refined` | `Intelligent` | `Structured` | `Credentialed` | `Aspirational` | `Enterprise-Grade`

---

## SECTION 02 — COLOR SYSTEM & HIERARCHY RULES

KnowToHire uses a light-mode primary visual theme. Neutrals dominate, with controlled brand accents.

### Strict Color Hierarchy
1. **Neutrals (80% Surface Area)**: Slate & Pure White (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`, `#E2E8F0`, `#334155`, `#0F172A`).
2. **Primary Action (12%)**: SaaS Indigo (`#4F46E5` Indigo 600) — Primary buttons, active tabs, main brand markers.
3. **Growth Accent (5%)**: Emerald (`#10B981`) — ONLY for match scores, career progression, verified tags, positive trends.
4. **Intelligence Accent (3%)**: Cyan / Teal (`#06B6D4` / `#0D9488`) — ONLY for recommendations, AI insights, learning highlights.

### Token Definitions
```css
/* Primary Brand Indigo */
--kth-primary-900: #1E1B4B;
--kth-primary-800: #312E81;
--kth-primary-700: #4338CA;
--kth-primary-600: #4F46E5; /* Primary Brand & Action */
--kth-primary-500: #6366F1;
--kth-primary-100: #E0E7FF;
--kth-primary-50:  #EEF2FF;

/* Accents */
--kth-accent-emerald: #10B981; /* Growth & Verification */
--kth-accent-cyan:    #06B6D4; /* Intelligence & Insights */
--kth-accent-teal:    #0D9488;

/* Neutrals */
--kth-white:     #FFFFFF;
--kth-slate-50:  #F8FAFC; /* Main Light Canvas */
--kth-slate-100: #F1F5F9; /* Card Surface Fill */
--kth-slate-200: #E2E8F0; /* Primary Border Color */
--kth-slate-300: #CBD5E1;
--kth-slate-400: #94A3B8; /* Muted & Disabled */
--kth-slate-500: #64748B; /* Secondary Text */
--kth-slate-600: #475569;
--kth-slate-700: #334155; /* Primary Body Text */
--kth-slate-800: #1E293B; /* Dark Card Surface / Header */
--kth-slate-900: #0F172A; /* Dark Accent Background */

/* Semantics */
--kth-success: #10B981;
--kth-warning: #F59E0B;
--kth-error:   #EF4444;
--kth-info:    #0EA5E9;
```

---

## SECTION 03 — TYPOGRAPHY SYSTEM

- **Headings & Display**: `Plus Jakarta Sans`, sans-serif.
- **Body & UI Controls**: `Inter`, sans-serif.
- **Data & Monospace**: `JetBrains Mono` (used ONLY for match scores, Indian Rupee metrics, timestamps, and enterprise data tables).

### Typographic Scale
| Level | Font Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display XL** | 48px (3.0rem) | 1.15 | 700 (Bold) | Marketing Hero Headlines |
| **H1** | 36px (2.25rem) | 1.2 | 700 (Bold) | Main Page Titles, Dashboard Greetings |
| **H2** | 28px (1.75rem) | 1.25 | 600 (SemiBold) | Section Titles, Portal Headers |
| **H3** | 22px (1.375rem) | 1.3 | 600 (SemiBold) | Card Headers, Modal Titles |
| **H4** | 18px (1.125rem) | 1.35 | 600 (SemiBold) | Widget Titles |
| **Body Large** | 16px (1.0rem) | 1.5 | 400 (Regular) | Intro paragraphs |
| **Body Base** | 14px (0.875rem) | 1.5 | 400 / 500 | Default UI, tables, inputs |
| **Small** | 12px (0.75rem) | 1.4 | 500 (Medium) | Meta tags, timestamps |
| **Caption / Label** | 11px (0.6875rem) | 1.3 | 600 (SemiBold) | All-caps status tags & pills |

---

## SECTION 04 — SPACING & SHAPE SYSTEM

### Base Spacing Scale (`4px` Grid)
`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`, `80px`, `96px`
- Marketing pages use spacious margins (`48px – 80px`).
- Operational dashboards use tighter margins (`16px – 24px`).

### Border Radius Hierarchy
- **Small Controls (Buttons, Inputs)**: `6px – 8px` (`--radius-md`)
- **Standard Cards & Containers**: `10px – 12px` (`--radius-lg`)
- **Featured Hero Containers**: `16px` (`--radius-xl`)
- **Status Chips & Pills ONLY**: `9999px` (`--radius-full`)

### Border-First Shadow System
- Prefer crisp `1px solid #E2E8F0` borders over heavy drop shadows.
- Elevation shadows: `--shadow-sm: 0 1px 3px rgba(15,23,42,0.08)`, `--shadow-md: 0 4px 6px -1px rgba(15,23,42,0.08)`.

---

## SECTION 05 — CORE COMPONENT STANDARDS (21st.dev Inspired)

### Button States (9 States)
1. **Primary Indigo**: `bg-[#4F46E5] text-white hover:bg-[#4338CA]`
2. **Secondary Slate**: `bg-white text-slate-800 border border-slate-200 hover:bg-slate-100`
3. **Growth Emerald**: `bg-[#10B981] text-white hover:bg-[#059669]`
4. **Outline**: `bg-transparent text-[#4F46E5] border border-[#4F46E5] hover:bg-[#EEF2FF]`
5. **Ghost**: `bg-transparent text-slate-600 hover:bg-slate-100`
6. **Destructive**: `bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white`
7. **Success**: `bg-emerald-50 text-emerald-700 border border-emerald-200`
8. **Icon Button**: Square `36px x 36px` or `40px x 40px` flex container
9. **Loading & Disabled**: `opacity-60 cursor-not-allowed` with spinning indicator

### Input States (6 States)
- Default, Focus (`ring-2 ring-indigo-500/20 border-indigo-600`), Filled, Error (`border-red-500`), Success (`border-emerald-500`), Disabled (`bg-slate-100`).

### Badges & Status Pills
- `Full-Time` (Indigo), `Remote` (Slate), `Verified Employer` (Cyan), `Shortlisted` (Emerald), `Under Review` (Amber), `96% Match` (Emerald), `₹24L - ₹32L/yr` (Mono Slate).

### Enterprise Data Tables
- Sticky `#F8FAFC` headers, `44px` row height, hover highlight, status pills, Indian Rupee currency figures (`₹18.5L/yr`), row action dropdowns.

---

## SECTION 06 — NAVIGATION SYSTEM

- **Public Header**: Logo mark, Find Jobs, Knowledge Hub, Templates, Content Requests, Blog, Sign In / Post Job CTA.
- **Candidate Sidebar**: Overview, Saved Jobs, Applications, Career Insights, Resume Builder, Settings.
- **Employer ATS Sidebar**: Pipeline Overview, Active Jobs, Applicants, Candidate Database, Company Profile, Analytics.
- **Admin Governance Sidebar**: Platform Health, User Governance, Employer Verification, Content Moderation, Financials, Audit Logs.
- **Mobile Navbar**: Compact header with hamburger drawer trigger and quick search button.

---

## SECTION 07 — PUBLIC PRODUCT VISUAL DIRECTION

- **Homepage Hero**: Features brand statement **"Know More. Hire Better. Grow Faster."**
- **Dual Discovery Path Tabs**: "Career & Job Opportunities" vs "Knowledge & Professional Resources".
- **Search Bar**: Keyword search with location dropdown (`Bengaluru, KA`, `Mumbai`, `Delhi NCR`, `Remote`) and instant filter pills.
- **Job Cards**: Company logo avatar, Job title, location, salary range (`₹24L - ₹32L/yr`), remote badge, skill tags, match score pill (`96% Match`).
- **Knowledge Cards**: Cover preview, E-book tag (`PDF`), author, rating (`★ 4.9`), download count (`14.2k downloads`).
- **Template Marketplace Cards**: Preview frame, Format badge (`DOCX / PDF`), price tag (`Free / ₹499`), ATS-friendly badge.
- **Editorial Blog**: Featured article card with reading time, category tag, author avatar.

---

## SECTION 08 — CANDIDATE PRODUCT VISUAL DIRECTION

- **Dashboard**: Greeting banner, profile completeness widget (`88% Complete`).
- **KPI Metrics**: Applications Sent (`14`), Interview Calls (`3`), Saved Jobs (`8`), Skill Match Rating (`88%`).
- **Application Tracker Pipeline**: 5-step interactive horizontal progress bar (Step 1: Applied → Step 2: Screening → Step 3: Tech Interview → Step 4: Final HR → Step 5: Offer `₹18.5L/yr`).
- **Career Insights Widget**: Skill gap analysis recommendations ("Add GraphQL to increase match score by 12%").

---

## SECTION 09 — EMPLOYER PRODUCT VISUAL DIRECTION

- **Dashboard**: Active recruitment campaign header (`Sr. Full-Stack Engineer`).
- **Hiring Funnel Metrics**: Active Jobs (`12`), Total Applicants (`184`), Shortlisted (`24`), Offers Extended (`3`).
- **Applicant Pipeline Kanban**: Candidate card with photo, key skills, match score (`94%`), application stage dropdown, Quick Resume Drawer trigger.
- **Candidate Detail Drawer**: Slide-over panel with full candidate summary, score breakdown, resume download link, and interview scheduler.

---

## SECTION 10 — ADMIN PRODUCT VISUAL DIRECTION (INDIAN CURRENCY `₹`)

- **Enterprise Governance KPIs**:
  - Total Platform Users: `1,48,250`
  - Verified Employers: `4,210`
  - Total Resource Downloads: `3,84,500`
  - Monthly Recurring Revenue (MRR): `₹48.6L`
  - Annual GMV: `₹4.82Cr`
- **Data Visualization**: Clean SVG line chart for monthly revenue growth and bar chart for job postings vs applications.
- **Moderation Table**: Audit log and content moderation queue with bulk approval actions.

---

## SECTION 11 — RESPONSIVE MATRIX & ACCESSIBILITY

### Responsive Breakpoints
- **Desktop (`1280px+`)**: Multi-column bento grids, rich dashboard sidebars.
- **Tablet (`768px – 1279px`)**: 2-column adaptive layouts, collapsible sidebar navigation.
- **Mobile (`375px – 767px`)**: Single-column stacked cards, minimum touch target height `44px`, sticky bottom quick-apply bar.

### Accessibility Standards (WCAG 2.2 AA)
- Minimum contrast ratio 4.5:1 for body text, 6:1 for primary text.
- Visible focus rings (`ring-2 ring-indigo-500 ring-offset-2`).
- Status indicators pair colors with text/icons (not color alone).
