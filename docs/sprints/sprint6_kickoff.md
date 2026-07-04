# Sprint 6 Kickoff — Marketplace & Payments

## 🎯 Sprint Goal
Build the **Marketplace & Billing Infrastructure** for KnowToHire, enabling premium candidate resume templates, employer seat subscriptions, unified payment checkout flows, and database orders logging.

---

## 🏗️ Technical Scope & Architecture

### 1. Payment Integration (Stripe Simulated Integration)
- Connect checkout pipeline to a simulated payment gateway.
- Create secure callback redirects (`/checkout/success` and `/checkout/cancel`).
- Handle invoice generation and state mapping (`pending`, `completed`, `refunded`).

### 2. Digital Assets & Templates
- Build a marketplace gallery view for premium templates (Vetted resume layouts, ATS-friendly covers).
- Implement interactive preview modal and direct checkout integrations.
- Grant instant secure access/download links upon successful payment callback verification.

### 3. Subscription Management
- **Candidate Packages**: Professional/Premium resume optimizations.
- **Employer Packages**: Seat bundles and profile vetting capabilities.
- Toggle subscription cycles, auto-renewals, and upgrade paths.

### 4. Database Requirements (Schema Migrations)
- Create `marketplace_items` table:
  - `id UUID PRIMARY KEY`, `title`, `description`, `price_cents`, `item_type` (`template`, `subscription`), `metadata JSONB`.
- Create `orders` table:
  - `id UUID PRIMARY KEY`, `user_id`, `status` (`pending`, `completed`, `failed`), `amount_cents`, `currency`, `created_at`.
- Create `order_items` table:
  - `id UUID PRIMARY KEY`, `order_id REFERENCES orders`, `item_id REFERENCES marketplace_items`, `price_cents`.
- Enable strict Row Level Security (RLS) on all transaction tables (only owners and administrators can view invoices/orders).

---

## 📅 5-Day Implementation Plan

### Day 1: Schema Migration & Services Setup
- Deploy SQL migration containing `marketplace_items`, `orders`, and `order_items` tables.
- Establish RLS policies, foreign keys, indexes on `orders(user_id)`.
- Write `paymentService.ts` and `marketplaceService.ts` wrappers.

### Day 2: Templates Gallery & Item Browsing
- Build marketplace route `/marketplace` showing list of items.
- Implement template card components with detail views.
- Configure mock items in local storage/database seeds.

### Day 3: Simulation Checkout Flow
- Build unified `/checkout/:itemId` layout with summary card and payment forms.
- Configure mock Stripe cards validator.
- Set up success/cancel pages with animated statuses.

### Day 4: Subscription & Invoices Panel
- Build user/employer billing dashboard panel.
- Display past orders list with pdf-style simulated invoice downloads.
- Add subscription management controls (Cancel Auto-Renew, Upgrade).

### Day 5: Verification & Integration testing
- Run unit/integration tests on transaction records.
- Run complete compile, lint, and build checks.
- Compile final release branch deliverables.

---

## 🛡️ Risk Assessment & Mitigation
- **Payment Token Leakage**: Add strict typing constraints to prevent raw credential handling.
- **Data Inconsistency on Failed Payment**: Wrap database updates in transactions; orders are created as `pending` and updated to `completed` only upon successful mock callback validation.

---

## 🏁 Definition of Done (DoD)
- TypeScript compile results in **0 errors**.
- ESLint checks run clean with **0 warnings**.
- Production build passes successfully.
- Database contains fully operational tables with RLS enabled.
