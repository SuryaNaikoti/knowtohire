---
name: ui-ux-pro-max
description: Comprehensive UI/UX Pro Max design intelligence system containing 67+ UI styles, 161+ color palettes, 57+ typography pairings, 99+ UX guidelines, motion animation rules, and accessibility standards for building world-class enterprise SaaS interfaces.
---

# UI/UX Pro Max Design Intelligence Skill

This skill provides comprehensive design intelligence, styling rules, typography pairings, color token palettes, responsive layouts, motion animation guidelines, and UX standards for KnowToHire.

---

## 1. Core Design System & Aesthetic Principles

### 1.1 Color Tokens & Palette Architecture
- **Primary Brand**: Emerald (`#10b981`, `#059669`, `#047857`) & Deep Slate (`#0f172a`, `#1e293b`).
- **Accent Badges**:
  - `Verified / Success`: Teal (`#14b8a6`) & Emerald (`#10b981`).
  - `Pending / In Review`: Amber (`#f59e0b`).
  - `Featured / Premium`: Indigo (`#6366f1`).
  - `Alert / Rejected`: Rose (`#f43f5e`).
  - `Active / Open`: Blue (`#3b82f6`).
- **Surfaces**:
  - Light mode: Pure White (`#ffffff`), Warm Slate (`#f8fafc`), Subdued Border (`border-slate-200/80`).
  - Dark mode: Slate Deep (`#0f172a`), Dark Glass (`rgba(30, 41, 59, 0.7)`), Subdued Border (`border-slate-800/80`).

### 1.2 Typography System
- **Headings**: Modern geometric/humanist typeface (`font-heading`, `tracking-tight`, `font-black`).
- **Body**: Clean readable Sans-Serif (`Inter`, `system-ui`, `font-semibold` / `font-medium`).
- **Hierarchy**:
  - Page Titles: `text-2xl sm:text-3xl font-black tracking-tight`.
  - Section Titles: `text-base font-extrabold font-heading text-slate-900`.
  - Body Text: `text-xs sm:text-sm font-medium text-slate-600`.
  - Micro-Labels: `text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400`.

---

## 2. Motion & Micro-Interactions (Framer Motion)

### 2.1 Standardized Motion Variants
- **Page Entrance (`PageContainer`)**:
  - `initial: { opacity: 0, y: 12 }`
  - `animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }`
- **Staggered Cards (`StaggerGrid` & `StaggerItem`)**:
  - Container stagger delay: `0.05s`.
  - Child item transition: `opacity: 0 -> 1, y: 16 -> 0`.
- **Tactile Buttons (`MotionButton`)**:
  - Hover: `{ scale: 1.02 }`
  - Tap: `{ scale: 0.97 }`
- **Modal Overlays (`MotionModal`)**:
  - Backdrop: `bg-slate-950/60 backdrop-blur-md` with `opacity: 0 -> 1`.
  - Dialog: `scale: 0.95 -> 1, opacity: 0 -> 1, y: 16 -> 0`.

---

## 3. Responsive Mobile UX Rules

1. **Zero Horizontal Scroll**: Tables on mobile screen sizes ($<768px$) must hide horizontally clipped columns and render as dedicated **Mobile Card Lists** (`block md:hidden`).
2. **Essential Bottom Navigation**: Mobile sticky bottom bar contains only 4 essential items (`[Overview] [Search] [Alerts] [Profile]`).
3. **No Empty Header Voids**: Desktop top header container must use `hidden md:flex` so no empty 64px white space appears above page content on mobile.
4. **Touch Target Size**: Touch targets (buttons, pills, dropdown items) must be at least `44px x 44px` with clear padding.
5. **No Dead Clicks (Permanent QA Rule)**: Every button, badge link, tab, or action MUST perform its intended function or present clear guidance. Dead clicks are strictly forbidden.

---

## 4. Component Patterns

- **Executive Metric Cards**: Clean white card (`bg-white rounded-2xl border border-slate-200/80 shadow-2xs`), top accent color border (`border-t-4 border-t-emerald-500`), dominant metric number (`text-3xl font-black`), label underneath (`text-slate-400 uppercase tracking-wider`).
- **Data Filter Toolbars**: Search input on left, select dropdowns on right, quick filter preset pills wrapped with `overflow-x-auto whitespace-nowrap`.
- **Status Badges**: Rounded pills (`rounded-full px-2.5 py-1 text-[11px] font-bold`) with dot indicator (`w-1.5 h-1.5 rounded-full`).
