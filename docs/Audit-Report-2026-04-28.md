# Ceremoney — Full Project Audit Report
**Date:** 2026-04-28
**Branch:** sagor
**Auditor:** Senior Full-Stack Code Auditor (Multi-layer: Security + API + DB + Frontend)
**Total Issues Found:** 122
**Status:** NOT PRODUCTION READY

---

## Production Readiness Verdict

> ❌ **NOT PRODUCTION READY**
>
> The project contains **9 Critical**, **31 High**, **52 Medium**, and **30 Low** severity issues.
> Several Critical issues allow **unauthenticated access to sensitive data** and **unsafe object creation**.
> These must be fixed before any public launch.

---

## Summary Table

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 9 | Must fix immediately |
| 🟠 High | 31 | Fix before beta |
| 🟡 Medium | 52 | Fix before launch |
| 🟢 Low | 30 | Fix during polish |
| **Total** | **122** | |

---

## Part 1 — 🔴 CRITICAL ISSUES (9)

> These issues can be exploited right now. Fix before anything else.

---

### C1 — No Authentication on GET `/api/orders` — Exposes All Customer Data

| Field | Detail |
|-------|--------|
| **File** | `src/app/api/orders/route.ts` lines 293–362 |
| **Severity** | 🔴 Critical |
| **Module** | Orders API |
| **Root Cause** | GET handler has no `auth()` call |
| **Impact** | Any anonymous user can retrieve ALL orders — customer names, emails, payment status |
| **Fix** | Add `const session = await auth(); if (!session?.user) return 401` at top of GET handler |

---

### C2 — No Authentication on POST `/api/orders` — Anyone Can Create Orders and User Accounts

| Field | Detail |
|-------|--------|
| **File** | `src/app/api/orders/route.ts` lines 99–289 |
| **Severity** | 🔴 Critical |
| **Module** | Orders API |
| **Root Cause** | POST handler auto-creates user accounts and processes orders without any session check |
| **Impact** | Attacker can inject fake user accounts and fake orders into the system |
| **Fix** | Add auth check; require valid session; only allow order creation for the logged-in user |

---

### C3 — Hardcoded Encryption Key Fallback

| Field | Detail |
|-------|--------|
| **File** | `src/lib/encryption.ts` lines 16–37 |
| **Severity** | 🔴 Critical |
| **Module** | Encryption Library |
| **Root Cause** | If `ENCRYPTION_KEY` env var is missing, code falls back to a hardcoded default key in the source code |
| **Impact** | All encrypted secrets (API keys, tokens, passwords) are decryptable by anyone who reads the source code |
| **Fix** | Throw a startup error if `ENCRYPTION_KEY` is missing. Never fall back to a hardcoded default |

---

### C4 — Insecure ID Generation Using `Math.random()`

| Field | Detail |
|-------|--------|
| **File** | `src/app/api/vendor/register/route.ts:72` and `src/app/api/vendors/[slug]/inquiries/route.ts:50–52` |
| **Severity** | 🔴 Critical |
| **Module** | Vendor Registration, Inquiry System |
| **Root Cause** | `Math.random().toString(36)` used to generate Vendor IDs, Inquiry IDs, Conversation IDs, Message IDs |
| **Impact** | IDs are predictable and can collide — attacker can guess valid IDs to access other users' conversations |
| **Fix** | Replace all `Math.random()` ID generation with `crypto.randomUUID()` |

---

### C5 — Broken RSVP Validation Logic (`!attending === undefined`)

| Field | Detail |
|-------|--------|
| **File** | `src/app/api/public/rsvp/[slug]/route.ts:23` |
| **Severity** | 🔴 Critical |
| **Module** | Public RSVP |
| **Root Cause** | `if (!attending === undefined)` — the `!` negates the boolean, making validation never trigger |
| **Impact** | Invalid/empty RSVP submissions are silently accepted and saved to DB |
| **Fix** | Remove the `!` — should be `if (attending === undefined \|\| attending === null)` |

---

### C6 — Data Corruption: `priceMin` Value Saves to Wrong DB Field

| Field | Detail |
|-------|--------|
| **File** | `src/app/api/vendor/profile/route.ts:63` |
| **Severity** | 🔴 Critical |
| **Module** | Vendor Profile API |
| **Root Cause** | Update logic maps `priceMin` input → `startingPrice` DB column instead of `priceMin` column |
| **Impact** | Every time a vendor updates their price, it gets saved to the wrong field. Pricing data is silently corrupted |
| **Fix** | Change `startingPrice: priceMin ?` to `priceMin: priceMin ?` on line 63 |

---

### C7 — Type Safety Bypassed on Prisma Query Builder

| Field | Detail |
|-------|--------|
| **File** | `src/app/api/admin/leads/route.ts:99` |
| **Severity** | 🔴 Critical |
| **Module** | Admin Leads API |
| **Root Cause** | `const where: Record<string, any> = {}` bypasses TypeScript/Prisma type checking with `eslint-disable` comment |
| **Impact** | Invalid field names or injected keys can reach the database query, causing unintended data exposure or errors |
| **Fix** | Use `Prisma.LeadWhereInput` type instead of `Record<string, any>` |

---

### C8 — Zero Input Validation on Guest Creation

| Field | Detail |
|-------|--------|
| **File** | `src/app/api/planner/projects/[id]/guests/route.ts:43–72` |
| **Severity** | 🔴 Critical |
| **Module** | Wedding Planner — Guests |
| **Root Cause** | POST handler accepts all fields with no Zod/schema validation |
| **Impact** | `Number("abc")` → `NaN` stored in DB; `new Date("invalid")` → Invalid Date stored; XSS strings stored in names |
| **Fix** | Add Zod schema validation for all guest fields (name, email, phone, tableNumber, dates, enums) |

---

### C9 — Seating Chart Stored in Two Places — Can Permanently Desync

| Field | Detail |
|-------|--------|
| **File** | `prisma/schema.prisma` — `WeddingGuest.tableNumber` (line 1858) vs `SeatingTable.guestIds` (line 1695) |
| **Severity** | 🔴 Critical |
| **Module** | Seating Chart, Database Schema |
| **Root Cause** | Two different models store guest-to-table assignments with no sync mechanism between them |
| **Impact** | Seating chart can show a guest at Table 1 visually, but DB has them at Table 3. No automatic fix |
| **Fix** | Pick one source of truth. Remove `WeddingGuest.tableNumber` and derive from `SeatingTable.guestIds`, or reverse |

---

## Part 2 — 🟠 HIGH ISSUES (31)

### Security & Authentication

| # | Issue | File | Impact |
|---|-------|------|--------|
| H1 | All API routes skip middleware — each route must implement auth itself (and some don't) | `src/middleware.ts:17-19` | Auth bypass risk |
| H2 | No rate limiting on login endpoint — brute force attacks fully open | `api/auth/login/route.ts` | Account takeover |
| H3 | No rate limiting on registration endpoint — account spam possible | `api/auth/register/route.ts` | Spam/abuse |
| H4 | JWT session `maxAge` = 30 days — token compromise window too long | `src/lib/auth.ts:12` | Long exposure window |
| H5 | Inconsistent authorization on `/api/admin/users` — `roles` param changes what roles can access | `api/admin/users/route.ts:13-21` | Data exposure |
| H6 | Stripe/PayPal webhook has no idempotency check — replaying event processes payment twice | `api/billing/webhook/route.ts` + `api/webhooks/stripe/route.ts` | Double-charge risk |
| H7 | `item.quantity` assumed to exist in pay route — crashes if missing | `api/orders/[id]/pay/route.ts:64` | Runtime crash |

### Database & Schema

| # | Issue | File | Impact |
|---|-------|------|--------|
| H8 | `Order.coupon`, `Document.order`, `OrderItem.package/service` — no `onDelete` defined | `schema.prisma:281,341,310` | Orphaned DB records |
| H9 | `OrderNote.authorId` and `InternalNote.authorId` are nullable — audit trail broken | `schema.prisma:319,453` | Compliance failure |
| H10 | Seating chart dual storage (same as C9 root) | `schema.prisma` | Data inconsistency |
| H11 | `LocalGuest` missing DB fields: `gdprConsentAt`, `selfRegistered`, `invitationSentAt` — lost on auth sync | `planner-storage.ts` | Silent data loss |
| H12 | No merge/conflict resolution when syncing localStorage to DB on login | `planner-storage.ts` | Anonymous user data lost |

### API Validation

| # | Issue | File | Impact |
|---|-------|------|--------|
| H13 | No validation on budget: `budgetGoal`, category name, `color` field | `api/planner/.../budget/route.ts:38-57` | Negative budgets, XSS |
| H14 | No bounds validation on lat/lng coordinates — `lat: 999` accepted | `api/vendor/profile/route.ts:57-58` | Corrupt geo data |
| H15 | POST inquiry accepted with no schema validation | `api/vendors/[slug]/inquiries/route.ts:31` | Invalid data in DB |
| H16 | Rating validation bug — NaN passes as valid rating | `api/vendors/[slug]/reviews/route.ts:28` | Invalid ratings stored |
| H17 | No max cap on `?limit=` parameter in orders list — `?limit=999999` is valid | `api/orders/route.ts:293-298` | DoS / DB overload |
| H18 | Same unlimited page size risk on admin leads list | `api/admin/leads/route.ts:93` | DoS / DB overload |
| H19 | Campaign existence not checked before `startCampaign(id)` called | `api/admin/campaigns/[id]/send/route.ts:18` | Silent crash |
| H20 | File upload checks MIME type only (client-controlled) — magic bytes not verified | `api/upload/route.ts:10-11` | Malicious file upload |
| H21 | Race condition in lead duplicate detection — check-then-insert not atomic | `api/leads/route.ts:88-93` | Duplicate leads |
| H22 | No schema validation on public RSVP submission | `api/public/rsvp/[slug]/route.ts:17` | Invalid RSVP data |
| H23 | Vendor registration: only 8-char minimum password, no complexity | `api/vendor/register/route.ts:40` | Weak passwords |

### Frontend

| # | Issue | File | Impact |
|---|-------|------|--------|
| H24 | No `generateMetadata` on `/planner/[id]` — all project pages share same title | `planner/[id]/page.tsx` | SEO broken |
| H25 | No individual OG metadata on vendor profile pages | `vendors/[slug]/page.tsx` | SEO broken |
| H26 | Header fetches 3 data sources client-side on every render | `components/layout/header/index.tsx` | Slow header |
| H27 | Dashboard layout uses `useState` — may be missing `"use client"` directive | `app/dashboard/layout.tsx` | SSR crash risk |
| H28 | `Promise.all` of API fetches has no error state — partial failure shows broken page silently | `planner/[id]/page.tsx:248-303` | Silent broken UI |
| H29 | Vendor dashboard errors only `console.error`'d — user sees blank/loading forever | `vendor/dashboard/page.tsx:46-79` | Bad UX |
| H30 | No `loading.tsx` files in any route segment — streaming optimization unused | All route segments | Slower perceived load |
| H31 | No `error.tsx` route segments beyond root — sub-route errors uncaught | All route segments | Unhandled error pages |

---

## Part 3 — 🟡 MEDIUM ISSUES (52)

### Security (Medium)

| # | Issue | File |
|---|-------|------|
| M1 | `AUTH_SECRET` used with `!` non-null assertion — app crashes if env var missing | `src/lib/admin-auth.ts:45-46` |
| M2 | Decryption errors suppressed and return `null` silently — tampered tokens hidden | `src/lib/admin-auth.ts:30-41` |
| M3 | JWT missing `aud` (audience) claim validation | `src/lib/jwt.ts:49` |
| M4 | `sameSite: "lax"` on session cookie — should be `"strict"` for sensitive ops | `src/lib/auth.ts:21` |
| M5 | Database reset uses simple `"RESET"` string — no CSRF token, no 2FA confirmation | `api/admin/data/reset/route.ts:14` |
| M6 | `x-forwarded-for` header is user-controllable — rate limiting can be bypassed | `api/leads/route.ts:79-81` |
| M7 | Admin profile password change minimum is 6 chars (weaker than registration) | `api/admin/profile/password/route.ts:25` |
| M8 | Masked `••••` value in settings update causes silent no-op | `api/admin/settings/[key]/route.ts:88-94` |

### API Validation (Medium)

| # | Issue | File |
|---|-------|------|
| M9 | `sortBy` query param not whitelisted — any column name accepted as sort field | `api/admin/leads/route.ts:146` |
| M10 | `status` enum not validated before Prisma query — invalid values crash DB call | `api/orders/route.ts:306-307` |
| M11 | Empty `catch` blocks in payment gateway loader — errors silently ignored | `api/checkout/gateways/route.ts:23-50` |
| M12 | RSVP token only 16 bytes — should be 32+ bytes for security tokens | `api/public/rsvp/[slug]/route.ts:46` |
| M13 | `side` field validation broken — any invalid string defaults to BRIDE silently | `api/public/rsvp/[slug]/route.ts:44` |
| M14 | All list endpoints missing pagination (10+ routes affected) | Multiple API routes |
| M15 | Filename sanitization incomplete — `../` sequences still possible in file uploads | `api/upload/route.ts:73` |
| M16 | Fire-and-forget email sending swallows all errors | `api/leads/route.ts:257` |
| M17 | Campaign list returns ALL campaigns with no limit | `api/admin/campaigns/route.ts:25` |
| M18 | Budget `color` field accepts any string including XSS — no hex regex | `api/planner/.../budget/route.ts:61` |
| M19 | `req.json()` not wrapped in try-catch in multiple routes — crashes on invalid JSON | Multiple routes |
| M20 | `parseFloat`/`parseInt` used without bounds checking throughout vendor API | `api/vendor/profile/route.ts` |
| M21 | `new Date(string)` used without validation — `Invalid Date` stored silently | Multiple routes |
| M22 | Email regex `[^\s@]+@[^\s@]+\.[^\s@]+` is too permissive | `api/vendor/register/route.ts:35-36` |

### Database & Schema (Medium)

| # | Issue | File |
|---|-------|------|
| M23 | Missing indexes on `authorId`, `formTemplateId`, `invitationCode` (slow queries) | `schema.prisma` multiple |
| M24 | `WeddingGuest (projectId, email)` lacks composite unique constraint — duplicate guests possible | `schema.prisma:1846` |
| M25 | `invitationCode` not marked `@unique` — duplicate invitation codes possible | `schema.prisma:1872` |
| M26 | `Lead.formTemplateId` has no `@relation` — dangling FK, no cascade delete | `schema.prisma:1234` |
| M27 | `Coupon.usageLimit` not enforced at DB level — race condition allows over-use | `schema.prisma:641` |
| M28 | `RsvpQuestion.options` JSON has no structure validation | `schema.prisma:1819` |
| M29 | `VendorConversation` cascade asymmetry: `SetNull` on inquiry, `Cascade` on vendor | `schema.prisma:2248` |
| M30 | `Document.name/fileName/fileUrl/mimeType` are nullable — broken download links | `schema.prisma:329-347` |
| M31 | `Lead.scoreHistory` JSON format is undefined/undocumented | `schema.prisma:1209` |
| M32 | No transaction wrappers for multi-step DB operations (order creation, coupon usage) | `src/lib/db.ts` |
| M33 | No DB connection error recovery or retry logic | `src/lib/db.ts:10-16` |
| M34 | localStorage schema has no version field — no migration strategy on schema change | `planner-storage.ts` |
| M35 | Seating chart local ↔ DB sync has no conflict resolution (newer version unclear) | `planner-storage.ts` |
| M36 | `BlogCategory.parent` uses `onDelete: Cascade` — child categories deleted unintentionally | `schema.prisma:518` |

### Frontend (Medium)

| # | Issue | File |
|---|-------|------|
| M37 | `document.title = ...` used instead of Next.js `generateMetadata` API | `planner/[id]/layout.tsx:38` |
| M38 | `typeof window` check in render path causes SSR hydration mismatch | `planner/page.tsx:78-79` |
| M39 | Header reads from localStorage in `useEffect` — brief flicker showing logged-out state | `components/layout/header/index.tsx` |
| M40 | `useEffect` deps disabled with `// eslint-disable-next-line` in multiple places | Multiple pages |
| M41 | `router` object in `useEffect` deps causes unnecessary refetches | `planner/[id]/layout.tsx:57` |
| M42 | Spinner div lacks `role="status"`, `aria-busy`, `aria-label` | `planner/page.tsx:287` |
| M43 | Collapsible sections missing `aria-expanded` and `aria-controls` | `planner/[id]/page.tsx:64-74` |
| M44 | Stats cards missing descriptive `aria-label` for screen readers | `vendor/dashboard/page.tsx` |
| M45 | QR code image missing `alt` text | `planner/[id]/guests/page.tsx` |
| M46 | Duplicate `SessionProvider` wrapper in planner layout | `planner/layout.tsx` |
| M47 | No skip-to-main-content link for keyboard users | Sitewide |
| M48 | Registration and login forms use `fetch` instead of Next.js Server Actions | `(auth)/register/page.tsx` |
| M49 | No `generateStaticParams` on any `[id]` dynamic route | All `[id]` routes |
| M50 | No dynamic sitemap generation (`/app/sitemap.ts` missing) | Root |
| M51 | Buttons lack `focus:ring` styles — keyboard navigation visually broken | Multiple |
| M52 | `localStorage` garbage collection missing — storage fills up over time | `planner-storage.ts` |

---

## Part 4 — 🟢 LOW ISSUES (30)

| # | Issue | Location |
|---|-------|----------|
| L1 | Registration password minimum is 8 chars — recommend 12+ with complexity | `api/auth/register` |
| L2 | Login form has no real-time field-level validation feedback | `(auth)/login/page.tsx` |
| L3 | Register form has no real-time field-level validation feedback | `(auth)/register/page.tsx` |
| L4 | `next.config.ts` has `ignoreBuildErrors: true` — TypeScript errors hidden from CI | `next.config.ts` |
| L5 | `next.config.ts` has `eslint.ignoreDuringBuilds: true` — lint errors hidden from CI | `next.config.ts` |
| L6 | `VendorProfile.userId` allows delete + recreate — vendor history lost | `schema.prisma:2104` |
| L7 | No health check endpoint (`/api/health`) for DB monitoring | Missing file |
| L8 | No structured logging — all errors go to `console.error` only | Sitewide |
| L9 | No env variable validation on startup — missing vars crash at first use, not boot | Missing file |
| L10 | Auth session 30-day expiry — industry standard is 7–14 days | `src/lib/auth.ts:12` |
| L11 | Admin and vendor routes not marked `noindex` in robots metadata | SEO config |
| L12 | No `robots.ts` or proper `sitemap.ts` for marketing pages | Root |
| L13 | Stats cards not memoized — unnecessary re-renders | `dashboard/page.tsx:143-156` |
| L14 | `ProjectCard` component defined inline — recreated on every render | `planner/page.tsx:115-194` |
| L15 | Grid breakpoints jump awkwardly: 2→3→4→5 cols with no `md:` step | `planner/page.tsx:293` |
| L16 | Loading text uses `text-gray-400` — may fail WCAG contrast on light backgrounds | `planner/page.tsx:288` |
| L17 | Submit button doesn't show disabled state visually while loading | `(auth)/login/page.tsx:158-167` |
| L18 | No `console.log` removal strategy — debug logs may leak to production | Sitewide |
| L19 | `setInterval` in vendor layout recreated on every effect run | `vendor/layout.tsx:67` |
| L20 | `rsvpToken` only 16 bytes — should be 32+ | `api/public/rsvp/[slug]/route.ts:46` |
| L21 | `BlogCategory` parent cascade-deletes all child categories on parent delete | `schema.prisma:518` |
| L22 | `VendorConversation.projectId` nullable with no documented handling for null | `schema.prisma:2240` |
| L23 | `FormField.validation` and `options` JSON fields have no documented structure | `schema.prisma:742-747` |
| L24 | Socket.io server is a separate process — no documented Vercel deployment strategy | `server.ts` |
| L25 | Plugin upload endpoint allows arbitrary server-side code execution | `api/admin/plugins/upload` |
| L26 | `trustHost: true` in NextAuth config — should be explicit in production | `src/lib/auth.ts:4` |
| L27 | No `Content-Security-Policy` header configured | `next.config.ts` |
| L28 | No `Strict-Transport-Security` (HSTS) header configured | `next.config.ts` |
| L29 | `Referrer-Policy: origin-when-cross-origin` leaks full URL to same-origin 3rd parties | `next.config.ts` |
| L30 | `X-Frame-Options: SAMEORIGIN` — should use `Content-Security-Policy: frame-ancestors` instead (modern standard) | `next.config.ts` |

---

## Part 5 — AI-Generated Code Conflict Patterns

> The following inconsistencies indicate different AI agents contributed code with conflicting conventions.

| Pattern | Evidence | Risk Level |
|---------|----------|------------|
| Mixed ID generation | Some routes: `cuid()` (Prisma default), some: `Math.random()`, some: `crypto.randomUUID()` | 🔴 Security |
| Mixed validation style | Some routes: Zod schema, most: no validation, some: manual `if (!x)` checks | 🔴 Data integrity |
| Mixed auth patterns | Some routes: `auth()` from NextAuth, some: `getServerSession`, some: no auth at all | 🔴 Auth bypass |
| Mixed error response shape | Some: `{ error: "..." }`, some: `{ message: "..." }`, some: `{ status: 400 }` | 🟠 Frontend breaks |
| Mixed DB operation style | Some routes use `prisma.$transaction`, most use plain queries | 🟠 Data consistency |
| Mixed pagination | Some routes paginate, most return all records | 🟠 DoS risk |
| Duplicate SessionProvider | Wrapped at both root layout and planner layout | 🟡 Unexpected behavior |
| Mixed loading patterns | Some use Next.js Suspense, most use manual `useState` spinners | 🟡 UX inconsistency |
| Mixed metadata approach | Some use `export const metadata`, some use `document.title`, some have none | 🟡 SEO broken |

---

## Part 6 — Architecture Risk Areas

| Area | Issue | Severity |
|------|-------|----------|
| `next.config.ts` `ignoreBuildErrors: true` | TypeScript errors invisible in CI/CD builds — likely added to hide AI-generated type errors | 🔴 Critical |
| `next.config.ts` `eslint.ignoreDuringBuilds: true` | ESLint errors invisible — code quality blind spot | 🟠 High |
| No rate limiting | Zero rate limiting across 150+ API endpoints — no Redis throttle, no Edge middleware throttle | 🔴 Critical |
| No centralized error logging | All errors go to `console.error` only — no Sentry, no monitoring, no alerts | 🟠 High |
| No health check endpoint | No `/api/health` or `/api/health/db` — cannot detect DB connectivity issues in production | 🟠 High |
| Socket.io on Vercel | Real-time chat runs on separate `server.ts` process — Vercel does not support persistent WebSocket servers | 🟠 High |
| Plugin system | Plugin upload runs arbitrary server-side code — no sandboxing | 🟠 High |
| localStorage ↔ DB sync | No documented merge strategy for anonymous → authenticated data migration | 🔴 Critical |

---

## Part 7 — Fix Priority Roadmap

### Week 1 — Before Any Traffic (Blockers)

- [ ] Fix C1: Add auth to GET `/api/orders`
- [ ] Fix C2: Add auth to POST `/api/orders`
- [ ] Fix C3: Remove hardcoded encryption key fallback
- [ ] Fix C4: Replace all `Math.random()` IDs with `crypto.randomUUID()`
- [ ] Fix C5: Fix RSVP validation logic bug (`!attending === undefined`)
- [ ] Fix C6: Fix `priceMin` → wrong DB field mapping in vendor profile
- [ ] Fix H6: Add webhook idempotency check (prevent double-charge)
- [ ] Fix H17 + H18: Add max cap on `?limit=` parameters
- [ ] Remove `ignoreBuildErrors: true` from `next.config.ts` and fix all resulting TS errors

### Week 2 — Before Beta

- [ ] Fix C7: Type-safe Prisma query builder in admin leads
- [ ] Fix C8: Add Zod validation to guest creation endpoint
- [ ] Fix C9: Resolve seating chart dual source of truth
- [ ] Fix H2 + H3: Add rate limiting to login and registration
- [ ] Add missing Zod validation to all unvalidated API routes (H13–H22)
- [ ] Fix DB: Add missing `onDelete` rules (H8)
- [ ] Fix DB: Add missing indexes (M23–M26)
- [ ] Fix DB: Add composite unique constraints (M24, M25)
- [ ] Fix H11 + H12: localStorage→DB sync strategy with GDPR fields

### Week 3 — Before General Launch

- [ ] Add structured logging (Sentry or equivalent)
- [ ] Add rate limiting middleware (Redis/Upstash or Vercel Edge)
- [ ] Fix all frontend accessibility issues (M42–M47)
- [ ] Create `loading.tsx` and `error.tsx` for all route segments (H30, H31)
- [ ] Add `generateMetadata` to all dynamic routes (H24, H25)
- [ ] Resolve Socket.io deployment strategy for Vercel
- [ ] Add Content-Security-Policy and HSTS headers
- [ ] Remove all `console.log` and debug statements
- [ ] Add `/api/health` endpoint
- [ ] Add environment variable validation on startup

---

## Part 8 — Files Requiring Most Attention

| File | Issues | Priority |
|------|--------|----------|
| `src/app/api/orders/route.ts` | C1, C2, M10, M14, M19 | 🔴 Immediate |
| `src/lib/encryption.ts` | C3 | 🔴 Immediate |
| `src/app/api/vendor/register/route.ts` | C4, H23, M22 | 🔴 Immediate |
| `src/app/api/vendors/[slug]/inquiries/route.ts` | C4, H15 | 🔴 Immediate |
| `src/app/api/public/rsvp/[slug]/route.ts` | C5, H22, M12, M13 | 🔴 Immediate |
| `src/app/api/vendor/profile/route.ts` | C6, H14 | 🔴 Immediate |
| `src/app/api/admin/leads/route.ts` | C7, H18, M9 | 🔴 Immediate |
| `src/app/api/planner/projects/[id]/guests/route.ts` | C8, M19, M21 | 🔴 Immediate |
| `prisma/schema.prisma` | C9, H8, H9, M23–M31, M36 | 🟠 This sprint |
| `src/lib/planner-storage.ts` | H11, H12, M34, M35, M52 | 🟠 This sprint |
| `src/middleware.ts` | H1 | 🟠 This sprint |
| `next.config.ts` | L4, L5, L27, L28 | 🟠 This sprint |
| `src/lib/db.ts` | M32, M33 | 🟡 Next sprint |
| `src/lib/auth.ts` | H4, L10, L26 | 🟡 Next sprint |

---

*Report generated: 2026-04-28. No code was modified during this audit.*
*To begin fixes, confirm which priority level or specific issues to address first.*
