# Checkout & Payment Integration — Complete Analysis & Implementation Plan

> ## Implementation Methodology
>
> **No UI mockup only.** Every feature must be fully functional.
>
> 1. **Frontend work** — Analyze UI/UX first. Research best practices from the internet if needed. Then implement production-ready UI.
> 2. **Backend work** — Implement all backend logic, API routes, and business logic.
> 3. **Schema updates** — When database schema changes are needed, update `prisma/schema.prisma` and run `npx prisma db push`.
> 4. **Verification** — After all implementation is complete, verify everything against the checklist at the end of this document to confirm all flows work correctly.

---

## Table of Contents
1. [Current State Analysis](#1-current-state-analysis)
2. [Issues & Missing Features](#2-issues--missing-features)
3. [Ideal UI/UX Flow Design](#3-ideal-uiux-flow-design)
4. [Implementation Plan](#4-implementation-plan)
5. [File Change Summary](#5-file-change-summary)

---

## 1. Current State Analysis

### 1.1 Payment Gateways (Stripe & PayPal)

**Both are REAL, production-ready implementations — but NOT connected to the checkout flow.**

| Layer | Stripe | PayPal | Status |
|-------|--------|--------|--------|
| npm packages | `stripe` v20, `@stripe/stripe-js` v8.5 | `@paypal/react-paypal-js` v8.9 | Installed |
| Backend library | `src/lib/stripe.ts` | `src/lib/paypal.ts` | Complete |
| Session/Order creation API | `POST /api/checkout` | `POST /api/paypal/create-order` | Complete |
| Capture API | N/A (Stripe handles via hosted checkout) | `POST /api/paypal/capture-order` | Complete |
| Webhook handlers | `POST /api/webhooks/stripe` | `POST /api/webhooks/paypal` | Complete |
| Admin settings UI | Full (test/live mode, keys, test connection) | Full (sandbox/live, keys, test connection) | Complete |
| Frontend component | `payment-gateway-selector.tsx` | `paypal-button.tsx` | Created but UNUSED |
| Gateway detection API | `GET /api/checkout/gateways` | Same endpoint | Complete |
| **Integrated in checkout page?** | **NO** | **NO** | **MISSING** |

### 1.2 Current Checkout Flow

```
Service Page → "Proceed to Checkout" / "Get Started"
    ↓
/checkout/[service] — Multi-step form:
    Step 1–N: Dynamic form fields (from form builder DB or static config)
    Account Step: (new users only — email, name, password)
    Final Step: Terms & Agreements → "Submit Application - $XXX"
    ↓
POST /api/service-orders → Creates user (if new) + Creates order (PENDING) + Creates invoice (DRAFT)
    ↓
Redirect → /checkout/success → "Order Confirmed!"
```

**Problem:** There is NO payment collection step. The order is created as PENDING and no money is ever charged.

### 1.3 File Upload in Checkout

- Form builder supports `FILE_UPLOAD` field type
- Files stored as `File` objects in React state
- On form submit, `JSON.stringify(formData)` is called — **File objects become `{}` (empty object)** because File cannot be JSON serialized
- R2 library (`src/lib/storage/r2.ts`) exists with `uploadToR2()`, `deleteFromR2()` — but is only used by `/api/upload` (admin image uploads)
- **Files uploaded by customers during checkout are LOST**

### 1.4 Services Without Form Templates

- If a service has no `ServiceFormTemplate` record in DB AND no static form config, checkout shows a **blocking error**: "Checkout Not Configured"
- No fallback to a minimal form or direct payment
- The "Proceed to Checkout" button on service page still appears, leading to a dead end

### 1.5 Success Page Issues

- Shows "We've received your payment successfully" — **misleading**, no payment was collected
- No Stripe session verification (`GET /api/checkout?session_id=` returns mock data)
- No PayPal payment verification

---

## 2. Issues & Missing Features

### Critical (Must Fix)

| # | Issue | Details |
|---|-------|---------|
| C1 | **No payment step in checkout** | Form submits directly to order creation. No Stripe/PayPal UI shown. Payment components exist but are not imported in checkout page. |
| C2 | **File uploads broken** | `File` objects cannot be JSON serialized. Customer-uploaded files during checkout are silently lost (become `{}`). |
| C3 | **Services without forms can't checkout** | Shows "Checkout Not Configured" error. No minimal form fallback or direct-to-payment option. |

### High Priority

| # | Issue | Details |
|---|-------|---------|
| H1 | **Stripe checkout GET endpoint returns mock data** | `GET /api/checkout?session_id=` returns hardcoded mock instead of verifying Stripe session. Success page cannot verify payment. |
| H2 | **Invoice status not updated on payment** | Stripe/PayPal webhooks update Order status to PAID but don't update the linked Invoice to PAID. |
| H3 | **No payment failure handling** | If payment fails or is cancelled, no cleanup happens. No retry mechanism for failed payments. |

### Medium Priority

| # | Issue | Details |
|---|-------|---------|
| M1 | **Success page says "payment received" always** | Should show different message based on actual payment status. |
| M2 | **No orphaned file cleanup** | If R2 file uploads are implemented, failed/abandoned checkouts leave orphaned files. |
| M3 | **Stripe checkout API hardcoded to USD** | `currency: "usd"` hardcoded in line items. Should use business settings currency. |
| M4 | **No idempotency in webhooks** | Webhooks can double-process if called twice. No idempotency check. |

---

## 3. Ideal UI/UX Flow Design

### 3.1 Flow A: Service WITH Form Template

```
┌─────────────────────────────────────────────────────────────────┐
│  Service Page                                                   │
│  User clicks "Get Started" or selects a package                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  /checkout/[service] — Multi-step Checkout                      │
│                                                                 │
│  Step 1–N: Dynamic form fields (from form builder)              │
│     • Text, email, phone, select, textarea, date, country...   │
│     • File uploads → immediately upload to R2 on selection      │
│     • Conditional logic supported                               │
│                                                                 │
│  Account Step (new users only):                                 │
│     • Email (with real-time availability check)                 │
│     • First Name, Last Name                                     │
│     • Phone (optional), Country (optional)                      │
│     • Password, Confirm Password                                │
│     • Inline login for existing users                           │
│                                                                 │
│  Review & Payment Step (FINAL):                                 │
│     • Order summary (service, package, location, total)         │
│     • Terms of Service checkbox                                 │
│     • Disclaimer checkbox                                       │
│     • ┌──────────────────────────────────┐                      │
│       │  Payment Gateway Selector         │                      │
│       │  ○ Credit/Debit Card (Stripe)     │                      │
│       │  ○ PayPal                         │                      │
│       └──────────────────────────────────┘                      │
│     • "Complete Order — $XXX" button                            │
│       (disabled until terms agreed + gateway selected)          │
│                                                                 │
│  On "Complete Order" click:                                     │
│     1. Create user account (if new)                             │
│     2. Create order in DB (paymentStatus: PENDING)              │
│     3. Create invoice in DB (status: DRAFT)                     │
│     4. Redirect to payment:                                     │
│        • Stripe: redirect to Stripe hosted checkout URL         │
│        • PayPal: show PayPal button overlay for in-page pay     │
│     5. On payment success (webhook):                            │
│        • Order → paymentStatus: PAID, status: PROCESSING        │
│        • Invoice → status: PAID, paidAt: now()                  │
│     6. Redirect to success page                                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  /checkout/success                                              │
│                                                                 │
│  If payment PAID:                                               │
│     ✓ "Order Confirmed — Payment Received!"                     │
│     • Order number, service, total                              │
│     • "What happens next" steps                                 │
│     • Links: View Order, Go to Dashboard                        │
│                                                                 │
│  If payment PENDING (user abandoned Stripe/PayPal):             │
│     ⏳ "Order Received — Payment Pending"                        │
│     • "Complete your payment to proceed"                        │
│     • "Pay Now" button → retry payment                          │
│                                                                 │
│  If payment FAILED:                                             │
│     ✗ "Payment Failed"                                          │
│     • Error message from gateway                                │
│     • "Try Again" button → retry payment                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Flow B: Service WITHOUT Form Template

```
┌─────────────────────────────────────────────────────────────────┐
│  Service Page                                                   │
│  User clicks "Get Started" or selects a package                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  /checkout/[service] — Simplified Checkout (no form steps)      │
│                                                                 │
│  Account Step (new users only):                                 │
│     • Same as Flow A (email, name, password)                    │
│                                                                 │
│  Review & Payment Step:                                         │
│     • Order summary (service, package, total)                   │
│     • Terms + Disclaimer checkboxes                             │
│     • Payment Gateway Selector                                  │
│     • "Complete Order — $XXX" button                            │
│                                                                 │
│  Same payment flow as Flow A                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Key difference:** When no form template exists, skip form steps entirely. Show only account creation (if needed) + payment. No "Checkout Not Configured" error.

### 3.3 File Upload Flow (During Checkout)

```
User selects file in form field
    ↓
Immediately upload to R2 via POST /api/checkout/upload
    ↓
Response: { fileId, url, fileName, fileSize }
    ↓
Store fileId + url in formValues (not the File object)
    ↓
On form submit: send fileId/url references (not File objects)
    ↓
Backend: Create OrderDocument records linking files to order
    ↓
If checkout abandoned (no order created within 24h):
    → Cron job / scheduled cleanup removes orphaned files from R2
```

### 3.4 Payment Failure & Cleanup

```
Order created → Payment initiated
    ↓
Payment SUCCEEDS (webhook):
    → Order: paymentStatus = PAID, status = PROCESSING
    → Invoice: status = PAID, paidAt = now()
    → Files: Keep all uploaded files linked to order

Payment FAILS (webhook):
    → Order: paymentStatus = FAILED
    → Invoice: status = DRAFT (unchanged)
    → Show "Payment Failed" on success page with retry button
    → Files: Keep (user may retry payment)

Payment CANCELLED (user closes Stripe/PayPal):
    → Order stays PENDING
    → Show "Payment Pending" on success page with "Pay Now" button
    → Files: Keep (user may return to pay)

Order EXPIRED (no payment after 72 hours):
    → (Future enhancement) Cron job marks as CANCELLED
    → Files: Delete from R2
```

### 3.5 Webhook → Invoice Status Sync

```
Stripe webhook: checkout.session.completed
    ↓
Update Order: paymentStatus = PAID
    ↓
Find Invoice where orderId = order.id
    ↓
Update Invoice: status = PAID, paidAt = now()

Same for PayPal webhook: PAYMENT.CAPTURE.COMPLETED
```

---

## 4. Implementation Plan

### Phase 1: Fix File Uploads in Checkout

**Goal:** Files uploaded during checkout are saved to R2 and linked to the order.

**Changes:**

1. **Create `/api/checkout/upload/route.ts`** (NEW)
   - POST: Accepts file upload (FormData)
   - Uploads to R2 via `uploadToR2()` (falls back to local)
   - Returns `{ fileId, url, fileName, fileSize, mimeType }`
   - Accepts file types: images, PDFs, docs (not just images like current `/api/upload`)
   - Max 25MB per file
   - Does NOT require auth (checkout users may not be logged in yet)
   - Stores file reference in a new `TempUpload` table with expiry

2. **Modify `src/app/checkout/[service]/page.tsx`** (MODIFY)
   - When user selects a file in form field:
     - Show upload progress indicator
     - Call `POST /api/checkout/upload` with FormData
     - On success: store `{ fileId, url, fileName }` in formValues (not File object)
     - On error: show toast, allow retry
   - On form submit: send file references (URLs/IDs), not File objects

3. **Modify `POST /api/service-orders/route.ts`** (MODIFY)
   - After creating order: create `Document` records for each file in formData
   - Link documents to order via `orderId`
   - Move temp uploads to permanent storage path if needed

4. **Add `TempUpload` model to schema** (MODIFY `prisma/schema.prisma`)
   ```prisma
   model TempUpload {
     id        String   @id @default(cuid())
     fileName  String
     fileUrl   String
     fileSize  Int
     mimeType  String
     storage   String   @default("r2") // "r2" or "local"
     expiresAt DateTime // 24h from upload
     createdAt DateTime @default(now())

     @@index([expiresAt])
   }
   ```

### Phase 2: Integrate Payment Gateways into Checkout

**Goal:** Add a payment step to the checkout flow using existing Stripe & PayPal infrastructure.

**Changes:**

1. **Modify `src/app/checkout/[service]/page.tsx`** (MODIFY — major changes)
   - Replace the final "Terms & Agreements" step with a combined "Review & Payment" step
   - Import and render `PaymentGatewaySelector` component
   - Fetch enabled gateways from `GET /api/checkout/gateways` on mount
   - Add state: `selectedGateway`, `enabledGateways`, `isPaymentProcessing`
   - Change submit button text from "Submit Application" to "Complete Order"
   - On "Complete Order" click:
     1. Validate terms & disclaimers
     2. Create user account if new (POST to new endpoint or keep in service-orders)
     3. Create order via `POST /api/service-orders` (returns orderId)
     4. **If Stripe selected:**
        - Call `POST /api/checkout` with orderId, service details, total
        - Get Stripe session URL
        - `window.location.href = session.url` (redirect to Stripe hosted checkout)
     5. **If PayPal selected:**
        - Render PayPal button
        - PayPal SDK handles the flow (create → approve → capture)
        - On success: redirect to `/checkout/success?orderId={orderId}`
   - If NO payment gateways are configured:
     - Skip payment step, submit directly (current behavior)
     - Show info: "Payment will be collected separately"

2. **Modify `POST /api/service-orders/route.ts`** (MODIFY)
   - Add `paymentGateway` field to request schema (optional: "stripe" | "paypal" | null)
   - Store `paymentMethod` in order based on selected gateway
   - Return `orderId` (order number) for use in payment APIs

3. **Modify `POST /api/checkout/route.ts`** (MODIFY)
   - Accept `orderId` (required now, not optional)
   - Fetch order from DB to get line items, total, customer email
   - Use business settings currency instead of hardcoded "usd"
   - Return session URL for redirect

4. **Fix `GET /api/checkout/route.ts`** (MODIFY)
   - Remove mock data
   - Actually verify Stripe session via `getCheckoutSession(sessionId)`
   - Return real order status

### Phase 3: Fix Success Page & Payment Status

**Goal:** Success page correctly reflects payment status and allows retry.

**Changes:**

1. **Modify `src/app/checkout/success/page.tsx`** (MODIFY)
   - Check for `session_id` query param (Stripe redirect)
     - If present: verify Stripe session via `GET /api/checkout?session_id=`
   - Fetch order and check `paymentStatus`
   - Show different UI based on status:
     - `PAID` → "Order Confirmed — Payment Received!" (green)
     - `PENDING` → "Order Received — Payment Pending" (yellow) + "Pay Now" button
     - `FAILED` → "Payment Failed" (red) + "Try Again" button
   - "Pay Now" / "Try Again" button creates new payment session and redirects

2. **Create `POST /api/orders/[id]/pay/route.ts`** (NEW)
   - Creates a new Stripe session or PayPal order for an existing unpaid order
   - Used by "Pay Now" button on success page and dashboard
   - Requires auth (user must be order owner)

### Phase 4: Webhook Invoice Sync

**Goal:** Webhooks update Invoice status when payment succeeds/fails.

**Changes:**

1. **Modify `src/app/api/webhooks/stripe/route.ts`** (MODIFY)
   - In `handleCheckoutSessionCompleted()`: after updating order, find and update linked Invoice
     ```
     Find invoice where orderId = order.id
     Update invoice: status = "PAID", paidAt = now()
     ```
   - Add idempotency check: skip if order already PAID

2. **Modify `src/app/api/webhooks/paypal/route.ts`** (MODIFY)
   - Same: after updating order, update linked Invoice to PAID
   - Add idempotency check

### Phase 5: Handle Services Without Forms

**Goal:** Services without form templates can still go through checkout (direct to payment).

**Changes:**

1. **Modify `src/app/checkout/[service]/page.tsx`** (MODIFY)
   - Remove "Checkout Not Configured" error page
   - If `formConfig` is null (no form template):
     - Skip form steps entirely
     - Show only: Account step (if new user) → Review & Payment step
     - Minimal form: just account creation + terms + payment
   - If `formConfig` exists: current behavior (dynamic form steps + account + payment)

### Phase 6: Payment in Admin & Customer Dashboard

**Goal:** Admin and customers can trigger payment for unpaid orders.

**Changes:**

1. **Modify `src/app/admin/orders/[id]/page.tsx`** (MODIFY)
   - Add "Request Payment" button for orders with `paymentStatus: PENDING`
   - This button could send payment link to customer email (future)
   - Or generate a payment URL

2. **Modify `src/app/dashboard/orders/[id]/page.tsx`** (MODIFY)
   - If order `paymentStatus === "PENDING"`: show "Pay Now" button
   - Calls `POST /api/orders/[id]/pay` to create payment session
   - Redirects to Stripe/PayPal

---

## 5. File Change Summary

### New Files (5)

| File | Purpose |
|------|---------|
| `src/app/api/checkout/upload/route.ts` | File upload endpoint for checkout |
| `src/app/api/orders/[id]/pay/route.ts` | Create payment session for existing order |
| `prisma/schema.prisma` (TempUpload model) | Temporary upload tracking |
| *(none — existing components are reused)* | |

### Modified Files (9)

| File | Changes |
|------|---------|
| `src/app/checkout/[service]/page.tsx` | Add payment step, fix file upload, handle no-form services |
| `src/app/checkout/success/page.tsx` | Show payment status, add retry/pay-now buttons |
| `src/app/api/service-orders/route.ts` | Accept paymentGateway field, link uploaded files |
| `src/app/api/checkout/route.ts` | Fix GET endpoint, use dynamic currency |
| `src/app/api/webhooks/stripe/route.ts` | Update Invoice on payment, idempotency |
| `src/app/api/webhooks/paypal/route.ts` | Update Invoice on payment, idempotency |
| `src/app/admin/orders/[id]/page.tsx` | Add "Pay Now" option for unpaid orders |
| `src/app/dashboard/orders/[id]/page.tsx` | Add "Pay Now" button for customer |
| `prisma/schema.prisma` | Add TempUpload model |

### Existing Files Reused (No Changes)

| File | Role |
|------|------|
| `src/components/checkout/payment-gateway-selector.tsx` | Payment method selection UI |
| `src/components/checkout/paypal-button.tsx` | PayPal in-page payment button |
| `src/lib/stripe.ts` | Stripe backend library |
| `src/lib/paypal.ts` | PayPal backend library |
| `src/lib/payment-settings.ts` | Payment config from DB |
| `src/lib/storage/r2.ts` | R2 file storage |
| `src/app/api/checkout/gateways/route.ts` | Enabled gateways API |
| `src/app/api/paypal/create-order/route.ts` | PayPal order creation |
| `src/app/api/paypal/capture-order/route.ts` | PayPal payment capture |
| `src/app/api/admin/settings/payments/page.tsx` | Admin payment settings |

---

## Phase Priority Order

| Phase | Name | Depends On | Complexity |
|-------|------|-----------|------------|
| **Phase 1** | Fix File Uploads | None | Medium |
| **Phase 2** | Integrate Payment Gateways | None | High (largest change) |
| **Phase 3** | Fix Success Page | Phase 2 | Medium |
| **Phase 4** | Webhook Invoice Sync | Phase 2 | Low |
| **Phase 5** | Handle No-Form Services | Phase 2 | Low |
| **Phase 6** | Dashboard Pay Now | Phase 2, 3 | Low |

**Recommended order:** Phase 2 → Phase 4 → Phase 1 → Phase 5 → Phase 3 → Phase 6

Rationale: Phase 2 (payment integration) is the most critical fix and unblocks phases 3-6. Phase 4 (webhook sync) is a quick addition to Phase 2. Phase 1 (file uploads) is independent and can be done in parallel. Phase 5 (no-form services) is a small change to Phase 2's work. Phase 3 (success page) and Phase 6 (dashboard pay) build on the payment flow.

---

## Final Verification Checklist

After all phases are implemented, verify each item:

### Payment Gateways
- [ ] Stripe checkout redirect works end-to-end (click Pay → Stripe page → redirected back)
- [ ] PayPal in-page payment works end-to-end (click Pay → PayPal popup → payment captured)
- [ ] Payment gateway selector shows only enabled gateways (from admin settings)
- [ ] If only one gateway enabled, it is auto-selected
- [ ] If no gateway enabled, checkout shows appropriate message

### Order & Payment Flow
- [ ] Order created with `paymentStatus: PENDING` before payment
- [ ] After Stripe payment: order updated to `PAID` via webhook
- [ ] After PayPal payment: order updated to `PAID` via capture API
- [ ] Failed payment: order stays `PENDING`, user can retry
- [ ] Duplicate webhook calls are handled idempotently (no double updates)

### Invoice Sync
- [ ] Invoice auto-created when order is placed (status: `DRAFT`)
- [ ] Invoice updated to `PAID` when Stripe webhook fires
- [ ] Invoice updated to `PAID` when PayPal webhook fires
- [ ] Invoice PDF reflects correct payment status

### File Uploads
- [ ] Files uploaded to R2 during checkout (not stored as File objects in JSON)
- [ ] Upload progress shown to user
- [ ] Uploaded file URLs saved correctly in order data
- [ ] Files accessible after order is complete

### Services Without Forms
- [ ] Services without form templates can proceed to checkout
- [ ] Checkout skips form steps, shows only account + review/payment
- [ ] Order created correctly for form-less services

### Success Page
- [ ] Shows "Payment Received" for paid orders (green)
- [ ] Shows "Payment Pending" for unpaid orders (yellow) with Pay Now button
- [ ] Shows "Payment Failed" for failed payments (red) with retry button
- [ ] Stripe `session_id` query param verified against Stripe API (no mock data)

### Dashboard
- [ ] Customer can see "Pay Now" button on unpaid orders
- [ ] Pay Now creates new payment session and redirects
- [ ] Admin can see payment status on order detail page
- [ ] Both Stripe and PayPal work from dashboard Pay Now

### General
- [ ] No hardcoded business info — all from business settings
- [ ] Currency symbol correct (from business config)
- [ ] Both USD and BDT currencies work
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] No console errors in browser during checkout flow
