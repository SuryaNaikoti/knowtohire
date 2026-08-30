# KnowToHire — Climate & ESG Talent Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ecf8e.svg)](https://supabase.com/)

**KnowToHire** is a full-stack talent marketplace, Applicant Tracking System (ATS), and career intelligence platform designed for the **Climate Tech, ESG, Sustainability, Decarbonization, and Green Economy** ecosystems.

---

## 🌟 Key Highlights & Architecture

* **5 Integrated Portals & Roles**: Public Discovery, Candidate Workspace, Employer ATS, Admin Governance, and Multi-Step Onboarding.
* **Role-Guard Security & Portal Isolation**: Client and server-level role boundaries protecting candidate, employer, and superuser administrative capabilities.
* **Real-Time Push & In-App Notifications**: Dynamic unread counter badges, event bus dispatchers (`kth_notifications_changed`), category filtering (*Application*, *Interview*, *Offer*, *System*), and preference suppression.
* **Master Climate & ESG Taxonomy**: 500+ structured nodes spanning GHG Accounting (Scope 1/2/3), SBTi, Carbon Markets, BRSR Core, Hydrogen, Circular Economy, and Renewable Energy.
* **ATS Kanban Pipeline & Interview Workspace**: Full candidate lifecycle management with drag-and-drop/click stage movement, recruiter private notes, interview scheduling, and candidate calendar sync.
* **Knowledge Hub & Templates Marketplace CMS**: Whitepapers, ESG reporting templates, e-books, and candidate custom content requests with admin fulfillment.
* **100% Multi-Viewport Responsive**: Validated across Desktop (1440px), Tablet (768px, 834px), and Mobile (320px, 390px, 414px) with zero horizontal overflow.

---

## 🚀 Portals & Feature Matrix

### 1. Public Marketplace (`/`)
* **Job Discovery (`/jobs`)**: Faceted search by domain, location, work mode (Remote/Hybrid/Onsite), and salary range (INR).
* **Job Details (`/jobs/:id`)**: Full requisition spec, requirements, similar jobs, bookmarking, and 1-click apply.
* **Careers Guide (`/careers`)**: Career pathways, competency matrix, and compensation benchmarks.
* **Knowledge Hub (`/knowledge`)**: Searchable e-books, ESG whitepapers, and BRSR guides with download counters.
* **Templates Marketplace (`/templates`)**: ATS-compatible resume and cover letter templates with live preview.
* **Editorial Blog (`/blog`)**: Articles, climate industry news, and career guides.
* **Pricing Plans (`/pricing`)**: Candidate Pro vs. Employer ATS hiring plans with feature breakdown.
* **Company & Legal (`/about`, `/contact`, `/privacy`, `/terms`)**: Mission, leadership, contact inquiries, and DPDP compliance.

### 2. Candidate Workspace (`/candidate/*`)
* **Dashboard (`/candidate`)**: Executive KPI cards, profile completion prompt, upcoming interview countdown, and application pipeline mini-tracker.
* **Profile & Resume Builder (`/candidate/profile`, `/candidate/resume`)**: Full profile editor, ATS keyword parser score, and printable preview canvas.
* **Job Feed & Applications Tracker (`/candidate/jobs`, `/candidate/applications`)**: Tailored recommendations with match score, stage tracking (*Applied* $\rightarrow$ *Screening* $\rightarrow$ *Interview* $\rightarrow$ *Offer* $\rightarrow$ *Hired*), and recruiter feedback.
* **Interviews Calendar (`/candidate/interviews`)**: Round agenda, panelist bios, meeting links, and reschedule requests.
* **Career Insights (`/candidate/career-insights`)**: Market salary trends and skill-gap recommendations.
* **Custom Requests (`/candidate/requests`)**: Request specialized research/templates and track admin fulfillment.
* **Notification Center & Settings (`/candidate/notifications`, `/candidate/settings`)**: Alert center and alert preference governance.

### 3. Employer ATS Workspace (`/employer/*`)
* **ATS Dashboard (`/employer`)**: Requisitions overview, recruitment funnel conversion chart, and recent applicant stream.
* **Requisition Management (`/employer/jobs`, `/employer/jobs/new`)**: Multi-step job wizard with canonical role auto-resolution, markdown description editor, and salary ranges.
* **Talent Directory & Candidate Dossier (`/employer/candidates`, `/employer/candidates/:id`)**: Sourcing database, ATS resume viewer, private notes, and candidate comparison tool (`/employer/candidates/compare`).
* **Kanban Pipeline (`/employer/pipeline`)**: Visual 6-stage recruitment board with direct stage advancement.
* **Interview Workspace (`/employer/interviews`)**: Recruiter calendar, round scorecard logging, and multi-interviewer scheduling modal.
* **Analytics & Company Profile (`/employer/analytics`, `/employer/company-profile`)**: Sourcing channels, time-to-hire metrics, and company branding editor.

### 4. Master Admin Governance Console (`/admin/*`)
* **Admin Overview (`/admin`)**: Platform-wide metrics (active users, live jobs, applications, active employers).
* **User & Employer Moderation (`/admin/users`, `/admin/employers`)**: User governance, corporate verification queue, and verified badge management.
* **Job & Application Oversight (`/admin/jobs`, `/admin/applications`)**: Compliance inspection, featured job toggling, and global application audit.
* **CMS Workspaces (`/admin/resources`, `/admin/templates`, `/admin/blog`)**: Full CMS editors with live markdown preview for publishing content.
* **Content Requests Fulfillment (`/admin/requests`, `/admin/requests/:id`)**: Assign, upload deliverable assets, and deliver custom requests.
* **Taxonomy Engine & System Settings (`/admin/taxonomy`, `/admin/settings`)**: Domain taxonomy management, security session policies, and audit logs.

### 5. Authentication & Onboarding
* **Auth Center (`/login`, `/register`, `/forgot-password`, `/reset-password`)**: Email/password authentication, social OAuth, and **1-Click Demo Logins** for instant evaluation across Candidate, Employer, and Admin roles.
* **Onboarding Wizards (`/onboarding/candidate`, `/onboarding/employer`)**: Profile setup, skills mapping, and company profile creation.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 18](https://reactjs.org/) + [TypeScript 5](https://www.typescriptlang.org/) | UI rendering, type-safety, and component architecture |
| **Build Tool** | [Vite 5](https://vitejs.dev/) | Development server and production bundling |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + Custom Tokens | Design system tokens (`kth-primary`, `kth-slate`) |
| **Icons & Media** | [Lucide React](https://lucide.dev/) + [PDF.js](https://mozilla.github.io/pdf.js/) | Iconography and ATS resume PDF rendering |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) + Local Mock Fallback | Persistent relational storage with seamless offline/mock mode |
| **Testing** | [Puppeteer](https://pptr.dev/) | Cross-role E2E tests & multi-viewport responsive QA |

---

## 📦 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/SuryaNaikoti/knowtohire.git
cd knowtohire
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

Example `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

> **Note**: The application includes a fallback data service. If Supabase keys are not set, it operates with local mock persistence.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```
Generates optimized static assets in `dist/`.

---

## 🧪 Automated Testing & QA

* **Typecheck**:
  ```bash
  npx tsc --noEmit
  ```
* **Multi-Viewport & Responsive Browser QA** (Desktop 1440px, iPad 768/834px, Mobile 320/390/414px):
  ```bash
  node pre_launch_qa.cjs
  ```
* **Cross-Role End-to-End Workflow Verification**:
  ```bash
  node cross_role_e2e.cjs
  ```

---

## 📁 Project Structure

```
KnowToHire/
├── src/
│   ├── components/        # Reusable UI, Layout, Navigation, and Role components
│   │   ├── admin/         # Admin shell and management drawers
│   │   ├── auth/          # ProtectedRoute, RoleGuard, GuestRoute
│   │   ├── candidate/     # Candidate cards, pipelines, and headers
│   │   ├── cards/         # JobCard, ResourceCard, TemplateCard, BlogCard
│   │   ├── data-display/  # ProgressTimeline, KPICard, Table
│   │   ├── employer/      # ATS Kanban pipeline, QuickView drawer, interview modal
│   │   ├── navigation/    # Navbar, Sidebar, UserMenuDropdown
│   │   ├── public/        # Homepage and marketplace sections
│   │   └── ui/            # Button, Input, Modal, Drawer, Combobox, Card, Badge
│   ├── context/           # AuthContext & global state providers
│   ├── data/              # Mock dataset fallback
│   ├── design-system/     # Design tokens, colors, typography, currency formatters
│   ├── lib/               # Supabase client & utility functions
│   ├── pages/             # Route page controllers
│   │   ├── admin/         # 10 Admin management views
│   │   ├── auth/          # Login, Register, Password reset, Verification
│   │   ├── candidate/     # 12 Candidate portal views
│   │   ├── employer/      # 11 Employer ATS portal views
│   │   ├── onboarding/    # Multi-step onboarding flows
│   │   └── public/        # 14 Public discovery views
│   ├── services/          # Business logic, data persistence, and API adapters
│   └── types/             # TypeScript definitions and database schemas
├── supabase/              # Database schema migrations and SQL policies
├── pre_launch_qa.cjs      # 62-point multi-viewport browser QA runner
├── cross_role_e2e.cjs     # End-to-end recruitment lifecycle test suite
├── tailwind.config.js     # Tailwind CSS theme configuration
└── vite.config.ts         # Vite bundler configuration
```

---

## 📄 License

Proprietary © [KnowToHire](https://github.com/SuryaNaikoti/knowtohire). All rights reserved.
