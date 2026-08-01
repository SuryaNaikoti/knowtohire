# KnowToHire Design System v3.0 (Master Platform UI Standard)

This document establishes the official visual design system, interaction rules, typography scale, component primitives, dark mode tokens, motion guidelines, and layout grids for the entire KnowToHire platform.

---

## 1. Design Principles

1. **AI-First Operating System**: Interfaces prioritize intelligent directives, real-time feedback, and automated workflow recommendations over passive data listing.
2. **Elevated SaaS Aesthetics**: High-contrast typography (Inter), soft glassmorphic depth (`backdrop-blur-md bg-white/80`), dark slate hero surfaces (`#0F172A`), and emerald accents (`#059669`).
3. **Intentional Whitespace & Elevation**: Avoid flat outlined box grids. Use background surface contrast (`#F9FAFB` light, `#0B0F17` dark) and layered shadows (`shadow-xs` to `shadow-xl`).
4. **WCAG 2.2 AA Accessibility**: Strict contrast ratios, focus indicator rings (`focus:ring-2 focus:ring-emerald-500`), screen reader ARIA labels, and reduced-motion support.

---

## 2. Token Specification

### Color Tokens
```css
/* Light Surface System */
--bg-canvas: #F9FAFB;
--bg-surface: #FFFFFF;
--bg-surface-subtle: #F1F3F5;
--border-subtle: rgba(226, 232, 240, 0.8);
--text-primary: #0F172A;
--text-secondary: #64748B;
--text-muted: #94A3B8;

/* Brand & Accent Tokens */
--accent-emerald: #059669;
--accent-emerald-light: #ECFDF5;
--accent-blue: #2563EB;
--accent-purple: #7C3AED;
--accent-amber: #D97706;
--accent-rose: #E11D48;

/* Dark Surface System */
--dark-canvas: #0B0F17;
--dark-surface: #111827;
--dark-surface-elevated: #1F2937;
--dark-border: rgba(55, 65, 81, 0.7);
--dark-text-primary: #F9FAFB;
--dark-text-secondary: #9CA3AF;
```

### Typography Scale
- **Display Bold**: `font-extrabold text-2xl sm:text-3xl tracking-tight` (Hero Greetings, Core Indexes)
- **Section Heading**: `font-extrabold text-sm text-slate-900 tracking-wide uppercase`
- **Sub-label**: `font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest`
- **Body Text**: `font-sans text-xs text-slate-600 font-medium leading-relaxed`

---

## 3. Core Component Library Standards

### A. Metric & KPI Cards
- Must feature a primary index value, micro trend indicator (`▲ +8%`), percentile pill, and micro chart / progress ring indicator.
- Must support interactive click-through routing to detailed report pages.

### B. AI Intelligence Centerpiece
- Primary dark slate canvas (`bg-slate-900` / `#0F172A`) with subtle emerald glowing ambient backdrop.
- Interactive priority checklist with state persistence and direct workflow navigation.

### C. Job Match Cards
- Must display company emblem, title, company name, location, salary range, work mode, match % pill, matched skills, missing skills, quick apply, save bookmark, and full details CTA.

### D. Empty States
- Must feature an icon, friendly title, concise explanation, and a primary CTA leading to the appropriate feature setup page.

---

## 4. Theme System & Dark Mode Rules
- All cards, headers, sidebars, and widgets must respond seamlessly to `Light`, `Dark`, `System`, and `High Contrast` user settings using Tailwind `dark:` variants and CSS custom variables.
