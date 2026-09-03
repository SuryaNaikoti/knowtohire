# KNOWTOHIRE — CASHFREE PAYMENT GATEWAY INTEGRATION READINESS SPECIFICATION

**Current Phase:** `Architecture Readiness Only`  
**Future Phase:** `Cashfree Integration & Activation`  
**Status:** Prepared & Architecturally Guarded (Zero live processing active)

---

## 1. Executive Summary & Objective

KnowToHire has selected **Cashfree Payments** as its payment gateway provider for digital asset sales, subscriptions, and on-demand content fulfillment in India.

This architectural readiness phase establishes a solid, clean, provider-agnostic foundation without modifying the user experience, deploying checkout popups, creating fake successful transactions, or making any network requests to Cashfree.

### Primary Readiness Principles
1. **No Live Payments:** No Cashfree JS checkout SDK is mounted, and no real transactions are processed.
2. **Provider Agnosticism:** The application interacts with a `PaymentService` facade, which interfaces through a `PaymentProvider` contract. No business layer is coupled to Cashfree.
3. **Strict Client-Server Security Boundary:** `CASHFREE_CLIENT_SECRET` is never readable by or exposed to Vite/React client code. All future authenticated Cashfree calls are restricted to trusted server environments (e.g. Supabase Edge Functions / Backend API).
4. **Server-Side Canonical Truth:** Payment success is never granted simply because a browser client reports completion. Real fulfillment occurs strictly after server-side cryptographic signature verification of Cashfree webhooks.
5. **No Broken UX:** The existing user experience across Candidate, Employer, and Admin portals remains 100% intact.

---

## 2. Current vs. Target Payment Architecture

### Current Pre-Existing Payment Surface (Audited)
Prior to this readiness specification, the codebase contained:
- `src/services/paymentService.ts`: A rudimentary utility with legacy Razorpay script fallback and test simulation logic.
- `src/pages/public/PricingPage.tsx`: Plan subscription action calling `paymentService.initiateCheckout`.
- `src/pages/public/TemplateDetailsPage.tsx`: Resume & compliance template purchase trigger.
- `src/pages/candidate/CandidateRequestDetailsPage.tsx`: Unlock button calling `paymentService.initiateCheckout` and `requestService.markRequestPaid`.
- Supabase column additions in migration `20260825120000_paid_content_requests_and_pricing.sql` tracking `price_inr`, `is_paid`, and `payment_id` on `public.resource_requests`.

### Target Architecture (Clean Decoupled Flow)

```
┌────────────────────────────────────────────────────────┐
│               KnowToHire Client Application            │
│  (PricingPage, TemplateDetailsPage, CandidateRequests) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             paymentService (Unified Facade)            │
│                 src/services/payment/                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             PaymentProvider Interface Contract         │
│          (createOrder, verifyPayment, handleWebhook)   │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│     CashfreeProvider      │ │    Future Alternative    │
│  (Server/Edge Function)   │ │      Payment Gateway     │
└─────────────┬─────────────┘ └──────────────────────────┘
              │ (HTTPS + Secret Key)
              ▼
┌───────────────────────────┐
│     Cashfree REST API     │
│   (Orders, Verification)  │
└───────────────────────────┘
```

---

## 3. Provider Abstraction & Data Models

The provider abstraction is located in `src/services/payment/types.ts`:

### 3.1 Product & Entitlement Model (`PaymentProductType`)
Purchases on KnowToHire are strictly typed to guarantee clear entitlement tracking:
- `knowledge_resource`: Handbooks, research reports, regulatory guides.
- `template`: ATS resume templates, ESG audit toolkits, legal agreements.
- `content_request`: Tailored on-demand environmental/regulatory reports.
- `candidate_subscription`: Premium candidate feature access.
- `employer_subscription`: Enterprise ATS & job posting plans.
- `job_post`: Single paid sponsored job listings.
- `future_service`: Extensible for bespoke consulting services.

### 3.2 Canonical Internal Payment Status Model (`PaymentOrderStatus`)
Completely independent of gateway-specific terminology:
- `created`: Internal order initialized; gateway order not yet finalized.
- `pending`: Payer redirected or session active; payment awaiting completion.
- `paid`: Payment verified server-side (via Webhook / API); entitlement granted.
- `failed`: Payer transaction declined or timed out.
- `cancelled`: User actively dismissed or cancelled the transaction.
- `refunded`: Transaction successfully reversed/refunded.

### 3.3 Core Database Schema Entities (`supabase/migrations/20260903000000_...sql`)
1. **`public.payment_orders`**:
   - `id` (UUID Primary Key)
   - `order_number` (Human readable: `KTH-2026-XXXXXX`)
   - `user_id` (FK to `public.profiles`)
   - `product_type`, `product_id`, `product_title`
   - `amount_inr` (Validated server-side against catalog price)
   - `status`, `provider` (`'cashfree'`)
   - `provider_order_id`, `provider_session_id`
   - `is_paid`, `paid_at`, timestamps, metadata
2. **`public.payment_transactions`**:
   - Ledger record for every payment attempt, gateway transaction ID (`cf_payment_id`), payment method (`upi`, `card`, `netbanking`), error codes, and audit logs.
3. **`public.payment_webhook_events`**:
   - Strict idempotency store capturing raw event payloads, signature verification status, and processing history.

---

## 4. Cashfree Configuration & Security Guidelines

### 4.1 Environment Separation

| Parameter | Sandbox (Testing) | Production (Live) |
| :--- | :--- | :--- |
| **Cashfree Base URL** | `https://sandbox.cashfree.com/pg` | `https://api.cashfree.com/pg` |
| **Orders Endpoint** | `https://sandbox.cashfree.com/pg/orders` | `https://api.cashfree.com/pg/orders` |
| **API Version** | `2025-01-01` | `2025-01-01` |
| **Dashboard** | `test.cashfree.com` | `merchant.cashfree.com` |

### 4.2 Strict Secret Protection
- **`CASHFREE_CLIENT_SECRET`** must **NEVER** be prefixed with `VITE_` or bundled into client code.
- Vite bundles everything prefixed with `VITE_` into public JavaScript files viewable by anyone in the browser.
- All Cashfree API requests requiring HTTP headers `x-client-id` and `x-client-secret` must originate from a secure backend server or Supabase Edge Function.

---

## 5. End-to-End Future Integration Lifecycle

When Cashfree is fully activated in the next phase, the flow will proceed as follows:

```
[Customer Browser]               [KnowToHire Backend / Edge Function]                 [Cashfree PG]
        │                                        │                                          │
        ├─ 1. Click "Purchase" ─────────────────>│                                          │
        │     (productId, productType)           ├─ 2. Fetch canonical price from DB        │
        │                                        ├─ 3. Insert `payment_orders` (status: created)
        │                                        ├─ 4. POST /pg/orders ────────────────────>│
        │                                        │     (order_id, amount, customer_details) │
        │                                        │<─── 5. Returns payment_session_id ───────┤
        │<── 6. Return payment_session_id ───────┤                                          │
        │                                                                                   │
        ├─ 7. Mount Cashfree JS SDK Checkout ──────────────────────────────────────────────>│
        │     cashfree.checkout({ paymentSessionId })                                       │
        ├─ 8. Customer completes UPI / Netbanking / Card payment ──────────────────────────>│
        │                                                                                   │
        │                                        │<─── 9. Cashfree Server Webhook ──────────┤
        │                                        │     (POST /api/webhooks/cashfree)        │
        │                                        ├─ 10. Verify HMAC-SHA256 signature        │
        │                                        ├─ 11. Check idempotency in DB             │
        │                                        ├─ 12. If status == PAID:                  │
        │                                        │      Update order & grant entitlement    │
        │                                        │─── 13. Return 200 OK to Cashfree ───────>│
        │                                        │                                          │
        ├─ 14. Query order status confirmation ─>│                                          │
        │<── 15. Return entitlement unlocked ────┤                                          │
```

---

## 6. Webhook Security & Idempotency Strategy

1. **Raw Body Integrity:**
   - Webhook signatures (`x-webhook-signature`) must be computed on the **unparsed raw text body** together with `x-webhook-timestamp` using the merchant secret key.
   - Parsing JSON beforehand changes whitespace and key order, corrupting the HMAC digest.
2. **Replay & Timestamp Protection:**
   - Discard any webhook events whose timestamp drifts more than 5 minutes from server clock time.
3. **Idempotency Guarantee:**
   - When an event arrives, check `public.payment_webhook_events` for `event_id`. If already marked `processed`, return HTTP 200 immediately without re-granting entitlements or modifying order states.

---

## 7. Product Entitlement Strategy

Upon server-verified payment completion:
- **`template`:** Create record in `public.user_template_entitlements` allowing permanent high-speed file download links.
- **`knowledge_resource`:** Create record in `public.user_resource_entitlements` unlocking document downloads.
- **`content_request`:** Update `public.resource_requests` with `is_paid = true`, `payment_id = txId`, and `paid_at = now()`, immediately unlocking deliverable download and notifying the editorial team.
- **`employer_subscription`:** Update `public.company_profiles` subscription tier and expiry date.

---

## 8. Exact Steps for Future Integration Phase

When merchant onboarding and KYC are completed:
1. Obtain Cashfree **Sandbox Credentials** (`CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`).
2. Deploy a Supabase Edge Function: `supabase/functions/cashfree-order/` to generate `payment_session_id`.
3. Deploy a Supabase Edge Function: `supabase/functions/cashfree-webhook/` to handle and verify incoming webhooks.
4. Add the Cashfree JS SDK script (`https://sdk.cashfree.com/js/v3/cashfree.js`) to the client.
5. Execute end-to-end sandbox transactions across all supported payment modes (UPI, Cards, Net Banking).
6. Perform production KYC cutover and configure production webhook URLs in the Cashfree Merchant Dashboard.
