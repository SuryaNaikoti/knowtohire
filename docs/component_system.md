# KNOWTOHIRE — COMPONENT SYSTEM DOCUMENTATION

## 1. Overview & Architecture

The **KnowToHire UI Foundation** is a modular, composable React + TypeScript + Tailwind CSS component library built strictly from the approved **KnowToHire Master UI Moodboard V2**.

### Identity & Positioning
- **Brand Positioning**: "Know More. Hire Better. Grow Faster."
- **Conceptual Journey**: "Knowledge → Opportunity → Growth" (Know → Discover → Apply → Connect → Grow)
- **Hierarchy Standard**:
```text
KnowToHire Brand Identity
        ↓
KnowToHire Design Tokens (tokens.ts)
        ↓
KnowToHire Component Standards
        ↓
21st.dev / shadcn Patterns
        ↓
KnowToHire React Components
        ↓
Pages & Portals
```

---

## 2. Token Architecture (`src/design-system/tokens.ts`)

- **Primary SaaS Indigo (`#4F46E5` Indigo 600)**: Used for primary brand actions, active state markers, and search palette accents (12% palette frequency).
- **Growth Emerald (`#10B981`)**: Used exclusively for match scores, career progression, verified tags, and positive trends (5% frequency).
- **Intelligence Cyan (`#06B6D4`)**: Used exclusively for recommendations, AI insights, learning highlights, and e-book tags (3% frequency).
- **Slate & White Neutrals (`#FFFFFF`, `#F8FAFC`, `#E2E8F0`, `#334155`, `#0F172A`)**: Dominates surface areas (80% frequency).
- **Indian Currency Formatter (`formatINR`)**: Standardized function producing Rupee Lakhs/Crores notation (e.g., `₹24L - ₹32L/yr`, `₹48.6L MRR`, `₹4.82Cr GMV`).

---

## 3. Component Inventory & Specifications

### A. Core Primitives (`src/components/ui/`)
1. **Button (`Button.tsx`)**:
   - 9 States/Variants: `primary` (Indigo), `secondary` (Slate border), `emerald` (Growth), `outline`, `ghost`, `destructive`, `success`, `icon`, `isLoading`.
   - Accessible focus ring (`ring-2 ring-indigo-600 ring-offset-2`).
2. **Input (`Input.tsx`)**:
   - 6 States: Default, Focus (`border-indigo-600 ring-2 ring-indigo-600/20`), Filled (`bg-slate-50 border-slate-300`), Error (`border-red-500`), Success (`border-emerald-500`), Disabled (`bg-slate-100 cursor-not-allowed`).
3. **Select (`Select.tsx`)**:
   - Custom select box with chevron icon and label/error bindings.
4. **Switch (`Switch.tsx`) & Checkbox (`Checkbox.tsx`)**:
   - Toggle switch and multi-select checkbox controls.
5. **Badge (`Badge.tsx`)**:
   - Status tags: `indigo`, `emerald`, `cyan`, `amber`, `rose`, `slate`, `mono`. Includes optional animated live pulse indicator dot.
6. **Card (`Card.tsx`)**:
   - Card primitives: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. Variants: `standard`, `interactive`, `featured`, `metric`.
7. **Table (`Table.tsx`)**:
   - Enterprise data table with `44px` row height, sticky header support (`bg-slate-50`), hover row highlight, and responsive container wrapper.
8. **Tabs (`Tabs.tsx`)**:
   - Variants: `segmented`, `underline`, and `discovery` (used for "Career & Jobs" vs "Knowledge & Resources").
9. **Dialog (`Dialog.tsx`) & Drawer (`Drawer.tsx`)**:
   - Accessible overlays with backdrop blur filters and zoom-in/slide-in animations.
10. **CommandPalette (`CommandPalette.tsx`)**:
    - Global `Cmd + K` search dialog modal for quick jump discovery across Jobs, Knowledge, Templates, and Dashboards.
11. **Alert (`Alert.tsx`) & EmptyState (`EmptyState.tsx`)**:
    - Feedback banners and zero-data state displays.
12. **Progress (`Progress.tsx`) & Skeleton (`Skeleton.tsx`)**:
    - Candidate profile completeness progress bar and shimmer loading states.

### B. Composite Content Cards (`src/components/cards/`)
1. **JobCard (`JobCard.tsx`)**:
   - Company avatar, title, location, salary range in INR (`₹24L - ₹32L/yr`), skills tags, remote badge, verified badge, match score pill (`96%`), save toggle, and apply CTA.
2. **ResourceCard (`ResourceCard.tsx`)**:
   - E-book & research paper preview: category tag, title, author, PDF format tag, rating (`★ 4.9`), download counter, download CTA.
3. **TemplateCard (`TemplateCard.tsx`)**:
   - Resume & business doc template preview: thumbnail frame, title, DOCX format, download counter, use template CTA.
4. **BlogCard (`BlogCard.tsx`)**:
   - Editorial article card: category, title, excerpt, reading time, author.

### C. Dashboard Primitives (`src/components/data-display/`)
1. **KPICard (`KPICard.tsx`)**: Metric card supporting titles, numbers, trend indicators, and Indian Rupee metrics (`₹48.6L MRR`).
2. **ProgressTimeline (`ProgressTimeline.tsx`)**: Candidate 5-stage application progress timeline (Step 1: Applied → Step 2: Screening → Step 3: Tech Round → Step 4: Final HR → Step 5: Offer `₹18.5L/yr`).

### D. Navigation & Layout (`src/components/navigation/`, `src/components/layout/`)
1. **Navbar (`Navbar.tsx`)**: Public header featuring brand statement, navigation links, search palette trigger pill (`Cmd+K`), sign-in, and post job CTAs.
2. **Sidebar (`Sidebar.tsx`)**: Portal sidebars for Candidate, Employer ATS, and Admin Governance views.
3. **Container (`Container.tsx`)**: Layout container with maximum width rules.

---

## 4. 21st.dev & Component Pattern Mapping

- **Bento Grid**: Asymmetric 12-column grid layout for platform features and candidate insights.
- **Command Palette (`Cmd+K`)**: Floating search modal overlay.
- **Enterprise Data Table**: High-density 44px rows with sticky `#F8FAFC` headers.
- **Discovery Tabs**: Segmented tab bar with active white pills and glowing backdrop.

---

## 5. Accessibility & WCAG 2.2 AA Compliance

- All interactive controls have visible focus rings (`focus:ring-2 focus:ring-kth-primary-600 focus:ring-offset-2`).
- Contrast ratios strictly ≥ 4.5:1 for body text, 6:1 for primary headlines.
- Minimum touch target size `44px` on mobile.
- Non-color reliance: status badges combine color tints with icons or clear text labels.
