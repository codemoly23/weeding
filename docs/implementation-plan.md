# NestifyPro — Implementation Plan

> **Product Specification**: See [features-and-flow.md](./features-and-flow.md) for features, user roles, flows, and screens.
>
> **Sync Rule**: If this document is updated, reflect the relevant changes in [features-and-flow.md](./features-and-flow.md) as well.

---

## STRICT IMPLEMENTATION GUIDELINES

> **CRITICAL: শুধু UI implement করলে হবে না। প্রতিটি feature এর জন্য FULL-STACK implementation করতে হবে — Database + Backend + Frontend + Testing সব একসাথে।**

### Implementation Rules

| Rule | Description |
|------|-------------|
| **No UI-Only Implementation** | শুধু frontend UI বানালে হবে না। Backend + Database সব একসাথে করতে হবে |
| **Complete Feature** | একটা feature শুরু করলে সেটা পুরোপুরি শেষ করতে হবে — frontend, backend, database, API সব |
| **Test After Each Feature** | প্রতিটি feature শেষ করার পর manually test করতে হবে |
| **Menu Updates** | নতুন page/feature add করলে sidebar navigation তেও add করতে হবে |
| **Role-Based Access** | প্রতিটি route/API তে role check থাকতে হবে — কোনো route unprotected রাখা যাবে না |
| **API Routes Only (No Server Actions)** | Data mutations সব `/api/*` route handlers দিয়ে হবে। Server Actions ব্যবহার করা যাবে না। কারণ: ভবিষ্যতে QuickBooks, CRM, Mobile App — সব same API call করবে |
| **i18n Mandatory** | প্রতিটি feature এ hardcoded string রাখা যাবে না। সব user-facing text `messages/en.json` এ key হিসেবে থাকবে এবং `t()` / `useTranslations()` দিয়ে render হবে। নতুন feature = নতুন translation keys |

### Per-Feature Implementation Checklist

প্রতিটি feature implement করার সময় এই checklist follow করতে হবে:

```
☐ 1. DATABASE
   ☐ Prisma schema update (নতুন models/fields)
   ☐ Run: npx prisma migrate dev --name <feature-name>
   ☐ Run: npx prisma generate
   ☐ Seed data update (if needed)

☐ 2. BACKEND (API Routes — NO Server Actions)
   ☐ API routes (app/api/) with Zod validation — all writes/mutations here
   ☐ Auth check: await auth() at top of every handler
   ☐ Role permission check before operations
   ☐ Consistent response: { success: boolean, data?: T, error?: string }
   ☐ RESTful design: GET (list/read), POST (create), PUT (update), DELETE (remove)
   ☐ API must be callable by external clients (not just Next.js frontend)

☐ 3. FRONTEND
   ☐ Pages (app/(dashboard)/...)
   ☐ Components (reuse existing shared components)
   ☐ Forms with React Hook Form + Zod validation
   ☐ TanStack Query for data fetching/mutations
   ☐ Loading states and error handling
   ☐ Empty states for no-data scenarios

☐ 4. NAVIGATION & ACCESS
   ☐ Sidebar menu update (role-based visibility)
   ☐ Breadcrumb update
   ☐ Role-based route protection (server-side redirect)

☐ 5. NOTIFICATIONS
   ☐ Email notifications (if applicable — see email events table)
   ☐ In-app activity feed update (if applicable)

☐ 6. TRANSLATIONS (i18n)
   ☐ সব user-facing strings (page titles, button labels, form labels, placeholders,
     error messages, empty states, toast messages, table headers, status labels)
     → messages/en.json এ namespace অনুযায়ী key add করতে হবে
   ☐ Server Components: const t = await getTranslations("namespace")
   ☐ Client Components: const t = useTranslations("namespace")
   ☐ Zod validation messages: schema factory function এ t() pass করতে হবে
   ☐ Email templates: recipient এর locale অনুযায়ী language select করতে হবে
   ☐ সব ৬টি language file (en, ar, es, fr, pt, bn) এ নতুন keys add করতে হবে
   ☐ কোনো hardcoded English string UI তে রাখা যাবে না

☐ 7. TESTING
   ☐ Manual test each user role's access
   ☐ Test CRUD operations (create, read, update, delete)
   ☐ Test edge cases (empty data, invalid input, unauthorized access)
   ☐ Test responsive layout (mobile + desktop)
   ☐ Test language switching (English → Arabic RTL → back to English)
   ☐ Verify npm run build passes without errors
```

### Implementation Order Per Feature

```
Feature Implementation করতে হবে এই order এ:

1️⃣ Database Schema Changes (prisma/schema.prisma)
   └─► 2️⃣ Run Migration (npx prisma migrate dev)
       └─► 3️⃣ API Routes with Zod Validation
           └─► 4️⃣ Server Components (data fetching pages)
               └─► 5️⃣ Client Components (forms, interactive UI)
                   └─► 6️⃣ Sidebar/Navigation Updates
                       └─► 7️⃣ Email Notifications (if needed)
                           └─► 8️⃣ Testing All Roles
```

### Example: Implementing "Expense Tracking" Feature

```
✅ CORRECT APPROACH:

1. prisma/schema.prisma
   - Verify Expense model exists with all fields
   - Run: npx prisma migrate dev --name add-expenses

2. src/app/api/expenses/route.ts
   - GET: List expenses (filtered by ownerId for OWNER role)
   - POST: Create expense with Zod validation
   - Auth + role check at top

3. src/app/api/expenses/[id]/route.ts
   - GET, PUT, DELETE with auth + ownership check

4. src/app/(dashboard)/expenses/page.tsx
   - Server Component: fetch expenses, render DataTable
   - Filter by property, category, date range

5. src/app/(dashboard)/expenses/new/page.tsx
   - Client Component: ExpenseForm with React Hook Form + Zod
   - Property/Unit dropdowns, receipt file upload

6. src/components/dashboard/sidebar.tsx
   - Add "Expenses" menu item under Financial section
   - Show only for SUPER_ADMIN, OWNER roles

7. Email: N/A for expenses

8. Test:
   - SUPER_ADMIN can see all expenses
   - OWNER can only see own property expenses
   - TENANT cannot access expenses page (redirected)
   - Create, edit, delete expense works
   - Receipt upload works
   - npm run build passes

❌ WRONG APPROACH:
   - শুধু expenses/page.tsx তে UI add করা
   - API route না বানানো
   - Role check না দেওয়া
   - Sidebar menu update ভুলে যাওয়া
```

### Feature Location Guide

| Feature | Dashboard Location | API Route | Roles |
|---------|-------------------|-----------|-------|
| Properties | `/(dashboard)/properties/*` | `/api/properties/*` | SUPER_ADMIN, OWNER |
| Units | `/(dashboard)/properties/[id]/units/*` | `/api/units/*` | SUPER_ADMIN, OWNER |
| Tenants | `/(dashboard)/tenants/*` | `/api/tenants/*` | SUPER_ADMIN, OWNER, STAFF |
| Leases + E-Sign | `/(dashboard)/leases/*` | `/api/leases/*`, `/api/leases/[id]/sign` | SUPER_ADMIN, OWNER, TENANT (sign) |
| Inspections | `/(dashboard)/inspections/*` | `/api/inspections/*` | SUPER_ADMIN, OWNER, STAFF |
| Maintenance | `/(dashboard)/maintenance/*` | `/api/maintenance/*` | All roles (varies) |
| Invoices | `/(dashboard)/invoices/*` | `/api/invoices/*` | SUPER_ADMIN, OWNER, TENANT |
| Payments | `/(dashboard)/payments/*` | `/api/payments/*` | SUPER_ADMIN, OWNER, TENANT |
| Expenses | `/(dashboard)/expenses/*` | `/api/expenses/*` | SUPER_ADMIN, OWNER |
| Documents (global) | `/(dashboard)/documents` | `/api/documents/*` | SUPER_ADMIN, OWNER |
| Documents (contextual) | Tabs on entity detail pages | `/api/documents/*` (filtered) | All roles (own docs) |
| Messages | `/(dashboard)/messages/*` | `/api/messages/*` | All roles |
| Reports | `/(dashboard)/reports/*` | `/api/reports/*` | SUPER_ADMIN, OWNER |
| Notices | `/(dashboard)/notices/*` | `/api/notices/*` | All roles (varies) |
| Settings | `/(dashboard)/settings/*` | `/api/settings/*` | SUPER_ADMIN (system), All (profile) |
| Plugins | `/(dashboard)/settings/plugins` | `/api/plugins/*` | SUPER_ADMIN only |

---

### Tech Stack (February 2026 - Latest Stable)

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.x | Framework (App Router, Turbopack, React Compiler) |
| React | 19.2.x | UI (Server Components for reads, API routes for writes) |
| TypeScript | 5.9.x | Language (strict mode) |
| Node.js | 22.x LTS | Runtime (Active LTS until April 2027) |
| PostgreSQL | 18.x | Database (AIO support) |
| Prisma | 7.2.x | ORM (Rust-free, pure TypeScript) |
| Auth.js | 5.x | Authentication (NextAuth v5, email/password only) |
| Tailwind CSS | 4.2.x | Styling (CSS-first config) |
| shadcn/ui | Latest | UI Components (Radix UI based, `npx shadcn@latest`) |
| Zod | 4.x | Validation |
| TanStack Query | 5.x | Server state |
| Zustand | 5.x | Client state (minimal) |
| Recharts | 2.x | Dashboard charts |
| React Hook Form | 7.x | Forms |
| Lucide React | Latest | Icons |
| Motion | 12.x | Animations (subtle) |
| Nodemailer | 7.x | Email (SMTP/Gmail) |
| React Email | Latest | Email templates |
| @aws-sdk/client-s3 | Latest | File storage (Cloudflare R2) |
| Stripe | Latest | Payment gateway |
| next-intl | Latest | Internationalization (i18n, App Router native) |

### Architecture Decisions

1. **App Router** — Server Components by default, `"use client"` only when needed (forms, interactive UI)
2. **API Routes, NOT Server Actions** — All data mutations go through `/api/*` route handlers (REST). Server Actions are NOT used. This is intentional:
   - **Third-party integration ready**: Same API endpoints can be consumed by QuickBooks, CRMs, external services, mobile apps, or any HTTP client
   - **Future mobile app**: Flutter/React Native app can call the same REST API without any backend changes
   - **Webhook-friendly**: External services (Stripe, payment gateways, tenant screening) can POST to our API
   - **Testable**: API routes can be tested independently with curl/Postman/automated tests
   - **Consistent pattern**: One way to do data operations = simpler codebase, easier for CodeCanyon buyers to extend
   - Server Components fetch data directly via Prisma (read operations) for performance, but all writes/mutations go through API routes
3. **Self-hosted VPS** — Raw VPS deployment (Hetzner/Contabo) with PM2/systemd, NO Docker
4. **Auth** — Email/password only (no Google/Facebook OAuth in v1.0)
5. **Plugin Architecture** — Minimal hook points for future addons (payment gateways, sidebar items, dashboard widgets)
6. **Configurable Payment Gateway** — Abstract interface, Stripe built-in, easy to add PayPal/others
7. **File Storage** — Cloudflare R2 (S3-compatible API via @aws-sdk/client-s3)
8. **Email** — Nodemailer with SMTP/Gmail config
9. **In-App Messaging** — Simple async DB-based conversations (NOT WebSocket/Socket.io — avoids complexity)
10. **Single Prisma Schema** — One `schema.prisma` file (Prisma 7 doesn't officially support multi-file schemas yet in all setups; keep it simple)
11. **Multilingual (i18n)** — `next-intl` with cookie-based locale detection (`NEXT_LOCALE`), NO URL prefix routing. User preference stored in `User.locale` DB field, synced to cookie on login. RTL support for Arabic via `dir="rtl"` on `<html>`. Buyers add languages by copying `messages/en.json`.

### Project Structure

```
K:\projects\property\
├── .claude/
│   └── rules.md                      # Claude AI rules
├── CLAUDE.md                         # Claude quick reference
├── docs/
│   ├── features-and-flow.md          # Product specification
│   └── implementation-plan.md        # This file
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration files
│   └── seed.ts                       # Demo/seed data
├── src/
│   ├── app/
│   │   ├── (auth)/                   # Auth pages (no sidebar)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── layout.tsx            # Auth layout (centered card)
│   │   ├── (dashboard)/              # Dashboard pages (sidebar + topbar)
│   │   │   ├── layout.tsx            # Dashboard layout
│   │   │   ├── page.tsx              # Dashboard home (role-based redirect)
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx          # List properties (dashboard stats + grid/compact/list views)
│   │   │   │   ├── new/page.tsx      # Add property (4-section form with inline units)
│   │   │   │   ├── available-units/page.tsx  # Available units (standalone, all VACANT)
│   │   │   │   ├── all-units/page.tsx        # All units (standalone, all statuses)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Property detail
│   │   │   │       ├── edit/page.tsx # Edit property (4-section form with unit CRUD)
│   │   │   │       └── units/
│   │   │   │           ├── page.tsx  # List units
│   │   │   │           └── [unitId]/page.tsx
│   │   │   ├── tenants/
│   │   │   │   ├── page.tsx          # List tenants (stats + table/card views + filters)
│   │   │   │   ├── new/page.tsx      # Add tenant (8-section form)
│   │   │   │   ├── applications/page.tsx  # Tenant applications pipeline
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Tenant detail
│   │   │   │       └── edit/page.tsx # Edit tenant
│   │   │   ├── leases/
│   │   │   │   ├── page.tsx          # All Leases dashboard (stats + card/table views + filters)
│   │   │   │   ├── new/page.tsx      # Create lease (6-section form)
│   │   │   │   ├── active/page.tsx   # Active Leases page (stats + filters)
│   │   │   │   ├── expiring/page.tsx # Expiring Leases page (urgency table)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Lease detail
│   │   │   │       └── edit/page.tsx # Edit lease
│   │   │   ├── maintenance/
│   │   │   │   ├── page.tsx          # All Requests + filters
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx     # Request detail + comments
│   │   │   ├── inspections/
│   │   │   │   ├── page.tsx          # All inspections list
│   │   │   │   ├── new/page.tsx      # Create inspection (select unit + type)
│   │   │   │   ├── [id]/page.tsx     # Inspection detail + checklist items
│   │   │   │   └── compare/page.tsx  # Side-by-side move-in vs move-out
│   │   │   ├── payments/
│   │   │   │   ├── page.tsx          # All Payments
│   │   │   │   └── overdue/page.tsx  # Overdue list
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── expenses/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── documents/page.tsx    # Global documents hub (search, filter, bulk)
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx          # Conversations list
│   │   │   │   └── [id]/page.tsx     # Conversation thread
│   │   │   ├── reports/page.tsx      # Report selection + generation
│   │   │   ├── notices/page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx          # General settings
│   │   │       ├── payment/page.tsx
│   │   │       ├── email/page.tsx
│   │   │       ├── storage/page.tsx
│   │   │       ├── plugins/page.tsx  # Plugin activation/management
│   │   │       └── profile/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── properties/route.ts          # GET (list), POST (create)
│   │   │   ├── properties/[id]/route.ts     # GET, PUT, DELETE
│   │   │   ├── units/route.ts
│   │   │   ├── units/[id]/route.ts
│   │   │   ├── tenants/route.ts
│   │   │   ├── tenants/[id]/route.ts
│   │   │   ├── tenants/stats/route.ts         # Tenant stats endpoint
│   │   │   ├── tenants/invite/route.ts        # Tenant invite endpoint
│   │   │   ├── leases/route.ts
│   │   │   ├── leases/[id]/route.ts
│   │   │   ├── leases/stats/route.ts          # Lease stats endpoint
│   │   │   ├── maintenance/route.ts
│   │   │   ├── maintenance/[id]/route.ts
│   │   │   ├── maintenance/[id]/comments/route.ts
│   │   │   ├── inspections/route.ts
│   │   │   ├── inspections/[id]/route.ts
│   │   │   ├── inspections/[id]/items/route.ts
│   │   │   ├── inspections/compare/route.ts   # Compare move-in vs move-out
│   │   │   ├── leases/[id]/sign/route.ts      # E-signature endpoint
│   │   │   ├── invoices/route.ts
│   │   │   ├── invoices/[id]/route.ts
│   │   │   ├── payments/route.ts
│   │   │   ├── payments/[id]/route.ts
│   │   │   ├── expenses/route.ts
│   │   │   ├── expenses/[id]/route.ts
│   │   │   ├── documents/route.ts
│   │   │   ├── documents/[id]/route.ts
│   │   │   ├── messages/route.ts
│   │   │   ├── messages/[id]/route.ts
│   │   │   ├── notices/route.ts
│   │   │   ├── reports/route.ts
│   │   │   ├── settings/route.ts
│   │   │   ├── upload/route.ts              # File upload endpoint
│   │   │   └── webhooks/stripe/route.ts     # Stripe webhook
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Redirect to /login or /dashboard
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (auto-generated)
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx           # Collapsible sidebar with role-based menu
│   │   │   ├── topbar.tsx            # Top bar with user menu, notifications
│   │   │   ├── stat-card.tsx         # KPI stat card component
│   │   │   ├── alert-banner.tsx      # Overdue/Urgent/Expiring alert
│   │   │   └── recent-activity.tsx   # Activity feed
│   │   ├── forms/                    # Reusable form components
│   │   ├── tables/
│   │   │   └── data-table.tsx        # Generic data table with search/filter/sort/pagination
│   │   └── shared/
│   │       ├── page-header.tsx       # Page title + breadcrumb + actions
│   │       ├── empty-state.tsx       # Empty state placeholder
│   │       ├── confirm-dialog.tsx    # Confirmation modal
│   │       ├── file-upload.tsx       # Single file upload component
│   │       └── multi-image-upload.tsx # Multi-image drag & drop upload
│   ├── modules/                      # Pre-bundled plugin modules
│   │   ├── _registry.ts              # Plugin manifest registry
│   │   ├── saas/                     # SaaS multi-tenancy module (inactive by default)
│   │   │   ├── manifest.ts           # { slug, name, version, description }
│   │   │   ├── routes/               # SaaS-specific pages (lazy-loaded)
│   │   │   ├── components/           # SaaS-specific components
│   │   │   └── schema.prisma.txt     # Additional DB tables (applied on activation)
│   │   ├── bulk-sms/                 # Bulk SMS/Email module (inactive by default)
│   │   │   ├── manifest.ts
│   │   │   ├── routes/
│   │   │   └── components/
│   │   └── listing/                  # Property listing module (inactive by default)
│   │       ├── manifest.ts
│   │       ├── routes/
│   │       └── components/
│   ├── lib/
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── auth.ts                   # Auth.js v5 config
│   │   ├── auth-guard.ts             # Role-based access helpers
│   │   ├── plugins/
│   │   │   ├── plugin-manager.ts     # isActive(), activate(), deactivate(), verifyKey()
│   │   │   └── plugin-guard.tsx      # <PluginGuard slug="saas"> wrapper component
│   │   ├── payment/
│   │   │   ├── types.ts              # PaymentGateway interface
│   │   │   ├── stripe.ts             # Stripe implementation
│   │   │   └── index.ts              # Gateway factory/loader
│   │   ├── storage.ts                # Cloudflare R2 file storage
│   │   ├── email.ts                  # Nodemailer wrapper
│   │   ├── utils.ts                  # formatCurrency, formatDate, cn(), etc.
│   │   └── constants.ts              # Roles, statuses, categories enums
│   ├── hooks/
│   │   ├── use-current-user.ts       # Get logged-in user
│   │   └── use-debounce.ts           # Search debounce
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript types
│   └── styles/
│       └── globals.css               # Tailwind imports + custom CSS
├── emails/                           # React Email templates
│   ├── invoice-created.tsx
│   ├── payment-reminder.tsx
│   ├── payment-received.tsx
│   ├── lease-expiring.tsx
│   ├── lease-sign-request.tsx        # E-signature: lease ready to sign
│   ├── lease-fully-signed.tsx        # E-signature: both parties signed
│   ├── inspection-scheduled.tsx      # Inspection notification
│   ├── inspection-completed.tsx      # Inspection report ready
│   ├── maintenance-update.tsx
│   └── tenant-invite.tsx
├── public/
│   ├── logo.svg
│   └── placeholder.png
├── ecosystem.config.js               # PM2 config for VPS deployment
├── .env.example                      # Environment template
├── package.json
├── next.config.ts
├── tsconfig.json
└── prisma.config.ts
```

### Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum UserRole {
  SUPER_ADMIN
  OWNER
  TENANT
  STAFF
  MAINTAINER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum PropertyType {
  RESIDENTIAL
  COMMERCIAL
  MIXED
}

enum PropertyStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum UnitType {
  APARTMENT
  HOUSE
  CONDO
  OFFICE
  SHOP
  STUDIO
  OTHER
}

enum UnitStatus {
  VACANT
  OCCUPIED
  MAINTENANCE
  RESERVED
}

enum LeaseStatus {
  DRAFT
  PENDING
  ACTIVE
  EXPIRED
  TERMINATED
  RENEWED
}

enum MaintenancePriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum MaintenanceStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum InvoiceStatus {
  PENDING
  PAID
  OVERDUE
  PARTIALLY_PAID
  CANCELLED
}

enum InvoiceType {
  RENT
  SECURITY_DEPOSIT
  LATE_FEE
  MAINTENANCE
  OTHER
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum PaymentMethod {
  ONLINE
  CASH
  CHECK
  BANK_TRANSFER
  OTHER
}

enum ExpenseCategory {
  MAINTENANCE
  INSURANCE
  TAX
  UTILITY
  MANAGEMENT_FEE
  LEGAL
  OTHER
}

enum NoticePriority {
  NORMAL
  IMPORTANT
  URGENT
}

enum LateFeeType {
  FIXED
  PERCENTAGE
}

enum InspectionType {
  MOVE_IN
  MOVE_OUT
}

enum ItemCondition {
  GOOD
  FAIR
  POOR
  DAMAGED
}

enum TenantStatus {
  APPLICATION_SUBMITTED
  SCREENING
  APPROVED
  REJECTED
  ACTIVE
  INACTIVE
  EVICTED
}

// ==================== AUTH (Auth.js) ====================

model User {
  id             String    @id @default(cuid())
  name           String
  email          String    @unique
  password       String?
  role           UserRole  @default(TENANT)
  status         UserStatus @default(ACTIVE)
  avatar         String?
  phone          String?
  dateOfBirth    DateTime?
  emailVerified  DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  accounts       Account[]
  sessions       Session[]
  properties     Property[]       @relation("PropertyOwner")
  tenant         Tenant?
  assignedMaintenance MaintenanceRequest[] @relation("AssignedMaintenance")
  maintenanceComments MaintenanceComment[]
  inspections    Inspection[]     @relation("CreatedInspections")
  documents      Document[]       @relation("UploadedDocuments")
  sentMessages   Message[]        @relation("SentMessages")
  conversations  ConversationParticipant[]
  notices        Notice[]
  expenses       Expense[]

  @@index([email])
  @@index([role])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ==================== PROPERTIES ====================

model Property {
  id          String         @id @default(cuid())
  name        String
  type        PropertyType
  address     String
  city        String
  state       String
  country     String         @default("US")
  zipCode     String
  description String?
  image       String?
  status      PropertyStatus @default(ACTIVE)
  ownerId     String
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  owner    User      @relation("PropertyOwner", fields: [ownerId], references: [id])
  units    Unit[]
  expenses Expense[]
  documents Document[]

  @@index([ownerId])
  @@index([status])
}

model Unit {
  id         String     @id @default(cuid())
  propertyId String
  unitNumber String
  type       UnitType
  floor      Int?
  bedrooms   Int        @default(0)
  bathrooms  Int        @default(0)
  area       Float?
  rentAmount Float
  status     UnitStatus @default(VACANT)
  amenities  String[]
  images     String[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  property     Property              @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  leases       Lease[]
  maintenance  MaintenanceRequest[]
  inspections  Inspection[]
  expenses     Expense[]
  documents    Document[]

  @@unique([propertyId, unitNumber])
  @@index([propertyId])
  @@index([status])
}

// ==================== TENANTS & LEASES ====================

model Tenant {
  id                    String       @id @default(cuid())
  userId                String       @unique
  status                TenantStatus @default(APPLICATION_SUBMITTED)
  emergencyContact      String?
  emergencyPhone        String?
  emergencyRelationship String?
  emergencyEmail        String?
  idDocumentUrl         String?
  moveInDate            DateTime?
  moveOutDate           DateTime?
  employer              String?
  position              String?
  annualIncome          Float?
  employmentStartDate   DateTime?
  creditScore           Int?
  notes                 String?
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  leases   Lease[]
  invoices Invoice[]
  payments Payment[]
  maintenance MaintenanceRequest[]
  inspections Inspection[]
  documents Document[]

  @@index([status])
}

model Lease {
  id              String      @id @default(cuid())
  unitId          String
  tenantId        String
  startDate       DateTime
  endDate         DateTime
  rentAmount      Float
  securityDeposit Float       @default(0)
  paymentDay      Int         @default(1)
  status          LeaseStatus @default(PENDING)
  // Late fee configuration
  lateFeeAmount       Float       @default(50)
  lateFeeGracePeriod  Int         @default(5)
  lateFeeType         LateFeeType @default(FIXED)
  // Automation settings
  autoGenerateInvoices Boolean    @default(true)
  autoSendReminders    Boolean    @default(false)
  autoSendReceipts     Boolean    @default(false)
  terms           String?
  documentUrl     String?
  // E-Signature fields
  ownerSignature    String?     // URL to signature image (canvas/typed)
  ownerSignedAt     DateTime?
  tenantSignature   String?     // URL to signature image (canvas/typed)
  tenantSignedAt    DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  unit     Unit           @relation(fields: [unitId], references: [id])
  tenant   Tenant         @relation(fields: [tenantId], references: [id])
  invoices Invoice[]
  renewals LeaseRenewal[]
  documents Document[]

  @@index([unitId])
  @@index([tenantId])
  @@index([status])
  @@index([endDate])
}

model LeaseRenewal {
  id            String   @id @default(cuid())
  leaseId       String
  oldEndDate    DateTime
  newEndDate    DateTime
  newRentAmount Float?
  notes         String?
  createdAt     DateTime @default(now())

  lease Lease @relation(fields: [leaseId], references: [id], onDelete: Cascade)
}

// ==================== MAINTENANCE ====================

model MaintenanceRequest {
  id           String              @id @default(cuid())
  unitId       String
  tenantId     String?
  assignedToId String?
  title        String
  description  String
  category     String              @default("General")
  priority     MaintenancePriority @default(MEDIUM)
  status       MaintenanceStatus   @default(OPEN)
  images       String[]
  cost         Float?
  completedAt  DateTime?
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt

  unit       Unit                 @relation(fields: [unitId], references: [id])
  tenant     Tenant?              @relation(fields: [tenantId], references: [id])
  assignedTo User?                @relation("AssignedMaintenance", fields: [assignedToId], references: [id])
  comments   MaintenanceComment[]

  @@index([unitId])
  @@index([status])
  @@index([priority])
  @@index([assignedToId])
}

model MaintenanceComment {
  id        String   @id @default(cuid())
  requestId String
  userId    String
  content   String
  createdAt DateTime @default(now())

  request MaintenanceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  user    User               @relation(fields: [userId], references: [id])
}

// ==================== FINANCE ====================

model Invoice {
  id         String        @id @default(cuid())
  leaseId    String?
  tenantId   String
  type       InvoiceType   @default(RENT)
  amount     Float
  paidAmount Float         @default(0)
  dueDate    DateTime
  status     InvoiceStatus @default(PENDING)
  notes      String?
  paidAt     DateTime?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  lease    Lease?    @relation(fields: [leaseId], references: [id])
  tenant   Tenant    @relation(fields: [tenantId], references: [id])
  payments Payment[]

  @@index([tenantId])
  @@index([status])
  @@index([dueDate])
}

model Payment {
  id              String        @id @default(cuid())
  invoiceId       String
  tenantId        String
  amount          Float
  method          PaymentMethod @default(ONLINE)
  transactionId   String?
  gatewayResponse Json?
  status          PaymentStatus @default(PENDING)
  createdAt       DateTime      @default(now())

  invoice Invoice @relation(fields: [invoiceId], references: [id])
  tenant  Tenant  @relation(fields: [tenantId], references: [id])

  @@index([invoiceId])
  @@index([tenantId])
  @@index([status])
}

model Expense {
  id          String          @id @default(cuid())
  propertyId  String
  unitId      String?
  category    ExpenseCategory @default(OTHER)
  description String
  amount      Float
  date        DateTime
  vendor      String?
  receiptUrl  String?
  createdById String
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  property  Property @relation(fields: [propertyId], references: [id])
  unit      Unit?    @relation(fields: [unitId], references: [id])
  createdBy User     @relation(fields: [createdById], references: [id])

  @@index([propertyId])
  @@index([date])
}

model LateFeeRule {
  id              String      @id @default(cuid())
  gracePeriodDays Int         @default(5)
  feeType         LateFeeType @default(FIXED)
  feeAmount       Float       @default(50)
  maxFee          Float?
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// ==================== INSPECTIONS ====================

model Inspection {
  id          String         @id @default(cuid())
  unitId      String
  tenantId    String?
  type        InspectionType
  date        DateTime
  notes       String?
  completedAt DateTime?
  createdById String
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  unit      Unit             @relation(fields: [unitId], references: [id])
  tenant    Tenant?          @relation(fields: [tenantId], references: [id])
  createdBy User             @relation("CreatedInspections", fields: [createdById], references: [id])
  items     InspectionItem[]

  @@index([unitId])
  @@index([tenantId])
  @@index([type])
}

model InspectionItem {
  id           String        @id @default(cuid())
  inspectionId String
  name         String        // e.g., "Living Room - Walls", "Kitchen - Appliances"
  condition    ItemCondition @default(GOOD)
  notes        String?
  images       String[]

  inspection Inspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
}

// ==================== DOCUMENTS ====================

model Document {
  id           String   @id @default(cuid())
  name         String
  type         String
  fileUrl      String
  fileSize     Int?
  propertyId   String?
  unitId       String?
  tenantId     String?
  leaseId      String?
  uploadedById String
  createdAt    DateTime @default(now())

  property   Property? @relation(fields: [propertyId], references: [id])
  unit       Unit?     @relation(fields: [unitId], references: [id])
  tenant     Tenant?   @relation(fields: [tenantId], references: [id])
  lease      Lease?    @relation(fields: [leaseId], references: [id])
  uploadedBy User      @relation("UploadedDocuments", fields: [uploadedById], references: [id])

  @@index([propertyId])
  @@index([tenantId])
}

// ==================== MESSAGING ====================

model Conversation {
  id            String   @id @default(cuid())
  subject       String
  lastMessageAt DateTime @default(now())
  createdAt     DateTime @default(now())

  participants ConversationParticipant[]
  messages     Message[]
}

model ConversationParticipant {
  id             String   @id @default(cuid())
  conversationId String
  userId         String
  lastReadAt     DateTime?
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id])

  @@unique([conversationId, userId])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User         @relation("SentMessages", fields: [senderId], references: [id])

  @@index([conversationId, createdAt])
}

// ==================== NOTICES & SETTINGS ====================

model Notice {
  id         String         @id @default(cuid())
  title      String
  content    String
  priority   NoticePriority @default(NORMAL)
  targetRole UserRole?
  propertyId String?
  isPinned   Boolean        @default(false)
  expiresAt  DateTime?
  postedById String
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  postedBy User @relation(fields: [postedById], references: [id])

  @@index([createdAt])
}

model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  group     String   @default("general")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([group])
}

model PaymentGateway {
  id        String   @id @default(cuid())
  name      String
  provider  String
  config    Json
  isDefault Boolean  @default(false)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ==================== PLUGINS ====================

model Plugin {
  id             String    @id @default(cuid())
  slug           String    @unique
  name           String
  description    String?
  version        String
  isActive       Boolean   @default(false)
  activationKey  String?
  activatedAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

### Payment Gateway Interface

```typescript
// src/lib/payment/types.ts
export interface PaymentGatewayProvider {
  name: string;
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }>;
  verifyPayment(paymentIntentId: string): Promise<{
    status: "succeeded" | "failed" | "pending";
    amount: number;
    transactionId: string;
  }>;
  handleWebhook(body: string, signature: string): Promise<{
    event: string;
    paymentIntentId: string;
    status: string;
  }>;
}
```

### Plugin System Architecture

**Why pre-bundled (not upload-based):** Next.js compiles at build time. WordPress-style "upload zip → activate" would require `npm install` + `npm run build` on every plugin change, causing version conflicts and downtime. Instead, all module code ships with the core product and is gated by DB flags.

**Database table:**
```prisma
model Plugin {
  id             String   @id @default(cuid())
  slug           String   @unique  // "saas", "bulk-sms", "listing"
  name           String
  description    String?
  version        String
  isActive       Boolean  @default(false)
  activationKey  String?
  activatedAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

**Plugin manifest (per module):**
```typescript
// src/modules/saas/manifest.ts
export const saasPlugin = {
  slug: "saas",
  name: "SaaS Multi-Tenancy",
  version: "1.0.0",
  description: "Enable multi-tenant SaaS mode with custom landing pages",
  sidebarItems: [
    { label: "Tenants (SaaS)", href: "/saas/tenants", icon: "Users" },
    { label: "Plans & Pricing", href: "/saas/plans", icon: "CreditCard" },
    { label: "Landing Page", href: "/saas/landing", icon: "Layout" },
  ],
  settingsItems: [
    { label: "SaaS Settings", href: "/settings/saas" },
  ],
} as const;
```

**Plugin manager:**
```typescript
// src/lib/plugins/plugin-manager.ts
import { db } from "@/lib/db";
import { cache } from "react";

// Cached per-request (Server Component friendly)
export const isPluginActive = cache(async (slug: string): Promise<boolean> => {
  const plugin = await db.plugin.findUnique({ where: { slug } });
  return plugin?.isActive ?? false;
});

export async function activatePlugin(slug: string, key: string): Promise<boolean> {
  const isValid = await verifyActivationKey(slug, key);
  if (!isValid) return false;
  await db.plugin.update({
    where: { slug },
    data: { isActive: true, activationKey: key, activatedAt: new Date() },
  });
  return true;
}
```

**Plugin guard (component wrapper):**
```typescript
// src/lib/plugins/plugin-guard.tsx
import { isPluginActive } from "./plugin-manager";
import { notFound } from "next/navigation";

export async function PluginGuard({ slug, children }: { slug: string; children: React.ReactNode }) {
  const active = await isPluginActive(slug);
  if (!active) notFound();
  return <>{children}</>;
}
```

**Usage in routes (e.g., SaaS module page):**
```typescript
// src/app/(dashboard)/saas/tenants/page.tsx
import { PluginGuard } from "@/lib/plugins/plugin-guard";
import dynamic from "next/dynamic";

const SaasTenantsPage = dynamic(() => import("@/modules/saas/routes/tenants"));

export default function Page() {
  return (
    <PluginGuard slug="saas">
      <SaasTenantsPage />
    </PluginGuard>
  );
}
```

**Sidebar integration:**
```typescript
// In sidebar.tsx — dynamically show plugin menu items
const plugins = await db.plugin.findMany({ where: { isActive: true } });
const pluginMenuItems = plugins.flatMap(p => {
  const manifest = pluginRegistry[p.slug]; // from src/modules/_registry.ts
  return manifest?.sidebarItems ?? [];
});
// Render core menu items + pluginMenuItems
```

**Key benefits:**
- Zero-downtime activation (no rebuild)
- `next/dynamic` lazy-loads plugin components (inactive plugins = zero bundle cost)
- DB-driven = instant on/off
- CodeCanyon model: sell activation keys as separate addons
- Plugin data preserved on deactivation (just hidden)

### Key Coding Patterns

**API Route Pattern:**
```typescript
// src/app/api/properties/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createPropertySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL", "MIXED"]),
  address: z.string().min(1),
  // ...
});

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const properties = await db.property.findMany({
    where: session.user.role === "SUPER_ADMIN" ? {} : { ownerId: session.user.id },
    include: { units: true },
  });

  return Response.json({ success: true, data: properties });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "OWNER"].includes(session.user.role)) {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const property = await db.property.create({ data: { ...parsed.data, ownerId: session.user.id } });
  return Response.json({ success: true, data: property }, { status: 201 });
}
```

**Server Component Pattern:**
```typescript
// src/app/(dashboard)/properties/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function PropertiesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const properties = await db.property.findMany({
    where: session.user.role === "SUPER_ADMIN" ? {} : { ownerId: session.user.id },
    include: { units: true, _count: { select: { units: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <PropertyList properties={properties} />;
}
```

**Naming Conventions:**
- Files: `kebab-case.tsx` (e.g., `property-list.tsx`)
- Components: `PascalCase` (e.g., `PropertyList`)
- Functions: `camelCase` (e.g., `getPropertyById`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- Database tables: `PascalCase` models (Prisma convention), `snake_case` in raw SQL
- API responses: `{ success: boolean, data?: T, error?: string }`

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nestifypro"

# Auth
AUTH_SECRET="your-auth-secret"
AUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Storage (Cloudflare R2)
CLOUDFLARE_R2_ENDPOINT=""
CLOUDFLARE_R2_ACCESS_KEY=""
CLOUDFLARE_R2_SECRET_KEY=""
CLOUDFLARE_R2_BUCKET=""

# Email (SMTP)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="NestifyPro"
```

### Implementation Phases

#### Phase 1: Foundation (Week 1)
1. `npx create-next-app@latest` with TypeScript, Tailwind, App Router
2. Install dependencies: prisma, @auth/prisma-adapter, zod, @tanstack/react-query, zustand, recharts, react-hook-form, lucide-react, motion, nodemailer, stripe, @aws-sdk/client-s3, bcryptjs
3. `npx shadcn@latest init` + add core components (button, input, card, dialog, table, select, badge, tabs, dropdown-menu, sheet, toast, form, avatar, separator)
4. Set up Prisma schema + initial migration + seed
5. Configure Auth.js v5 (email/password only, with bcrypt password hashing)
6. Create dashboard layout (sidebar + topbar)
7. Create shared components (data-table, page-header, stat-card, empty-state, confirm-dialog, file-upload)
8. Create `lib/` utilities (db, auth, storage, email, utils, constants)
9. Plugin system foundation (plugin-manager, plugin-guard, module registry, Plugin DB table, seed inactive plugins)
10. Create CLAUDE.md + .claude/rules.md
11. PM2 ecosystem config for VPS deployment

#### Phase 2: Property Management (Week 2-3)
1. Properties CRUD pages + API routes
2. Units CRUD pages + API routes (nested under properties)
3. **Properties Enhancement** (see detailed plan below)
4. **Tenants Enhancement** (see detailed plan below)
5. Tenant invite flow (email with registration link)
6. Lease management pages + API routes
7. Lease renewal workflow
8. E-Signature flow (canvas/typed signature on leases, sign endpoint)
9. Move-in/Move-out Inspection CRUD + API routes
10. Inspection checklist items + photo upload + comparison report
11. Dashboard page with role-based KPIs
12. Dashboard stat cards + alert banners

---

### Properties Enhancement — Detailed Implementation Plan

> **Goal**: Enhance the Properties module to match the reference design with dashboard stats, view modes, inline unit management, standalone Available Units and All Units pages.

#### Step 1: Sidebar Navigation Update

**File:** `src/components/dashboard/app-sidebar.tsx`

Add 2 new sub-items under Properties:
```
Properties
├─ All Properties     → /properties          (icon: ListFilter)
├─ Add Property       → /properties/new      (icon: Plus)
├─ Available Units    → /properties/available-units  (icon: KeyRound) ← NEW
└─ All Units          → /properties/all-units        (icon: LayoutGrid) ← NEW
```

**Translation keys** (`messages/en.json` → `nav` namespace):
```json
"availableUnits": "Available Units",
"allUnits": "All Units"
```

Update all 6 language files (en, ar, es, fr, pt, bn).

---

#### Step 2: Enhanced Properties List Page (Dashboard Stats + Improved Cards + View Modes)

**File:** `src/app/(dashboard)/properties/page.tsx` — Rewrite

**New layout structure:**
```
┌─ PageHeader (title + breadcrumbs + Refresh + Add Property buttons) ─────┐
├─ PropertiesStats (2 rows of 5 stat cards) ──────────────────────────────┤
├─ Section heading: "Properties" + "Manage your property portfolio" ──────┤
│  + ViewModeToggle (Grid | Compact | List icons) ─────────── top-right  │
├─ PropertyFilters (Search + Type + Status + Sort + Unit filter) ─────────┤
├─ Property cards grid / compact rows / list table ───────────────────────┤
└─ EmptyState (if no results) ────────────────────────────────────────────┘
```

**Stats data** — Prisma aggregation queries (`Promise.all`):
| Stat | Query |
|------|-------|
| Total Properties | `db.property.count({ where: { ...ownerFilter } })` |
| Available Properties | `db.property.count({ where: { units: { some: { status: "VACANT" } }, ...ownerFilter } })` |
| Occupied Properties | `db.property.count({ where: { units: { some: { status: "OCCUPIED" } }, ...ownerFilter } })` |
| Average Rent | `db.unit.aggregate({ _avg: { rentAmount: true }, where: { property: { ...ownerFilter } } })` |
| Under Maintenance | `db.property.count({ where: { units: { some: { status: "MAINTENANCE" } }, ...ownerFilter } })` |
| Total Rent Value | `db.lease.aggregate({ _sum: { rentAmount: true }, where: { status: "ACTIVE", unit: { property: { ...ownerFilter } } } })` |
| Total Units | `db.unit.count({ where: { property: { ...ownerFilter } } })` |
| Available Units | `db.unit.count({ where: { status: "VACANT", property: { ...ownerFilter } } })` |
| Occupied Units | `db.unit.count({ where: { status: "OCCUPIED", property: { ...ownerFilter } } })` |
| Units in Maintenance | `db.unit.count({ where: { status: "MAINTENANCE", property: { ...ownerFilter } } })` |

**New components to create:**
| Component | File | Type |
|-----------|------|------|
| PropertiesStats | `src/components/properties/properties-stats.tsx` | Server (async) |
| ViewModeToggle | `src/components/properties/view-mode-toggle.tsx` | Client ("use client") |
| PropertyCardCompact | `src/components/properties/property-card-compact.tsx` | Client |
| PropertyListRow | `src/components/properties/property-list-row.tsx` | Client |

**Enhanced PropertyCard** (`src/components/properties/property-card.tsx`):
- Status badge (top-left on image) + Type badge (top-right on image)
- Unit status breakdown: "3 Units · 2 occupied · 1 available"
- Unit types label: "Types: Apartment, Office"
- Rent range: "$1,800.00 - $3,200.00 /month" (min-max from units)
- Highlight "X available" in green if has vacant units
- 3-dot `DropdownMenu` (View, Edit, Delete)

**Enhanced PropertyFilters** (`src/components/properties/property-filters.tsx`):
- Add Sort dropdown: Newest First, Oldest First, Name A-Z, Name Z-A, Most Units
- Add Unit filter dropdown: All Units, Has Available, Fully Occupied

**View mode** stored as URL query param `?view=grid|compact|list`.

**Data fetching changes**: Include unit details in properties query:
```typescript
include: {
  units: {
    select: { status: true, type: true, rentAmount: true },
  },
  _count: { select: { units: true } },
}
```

---

#### Step 3: Enhanced Add/Edit Property Form (4-Section with Inline Units)

**File:** `src/components/properties/property-form.tsx` — Major rewrite

**Form sections (4 Cards):**

**1. General Information** (Card):
```
┌─────────────────────┬────────────────────┐
│ Property name       │ Property type ▼    │
├─────────────────────┼────────────────────┤
│ Property status ▼   │ (empty)            │
├─────────────────────┴────────────────────┤
│ Description (textarea, full-width)       │
└──────────────────────────────────────────┘
```

**2. Address** (Card):
```
┌──────────────────────────────────────────┐
│ Street address (full-width)              │
├─────────────────────┬────────────────────┤
│ City                │ State/Province     │
├─────────────────────┼────────────────────┤
│ ZIP/Postal code     │ Country            │
└─────────────────────┴────────────────────┘
```

**3. Unit Management** (Card, NEW):
```
┌─ ℹ️ Smart Unit Management ──────────────────────────────┐
│ Your property will automatically be configured as        │
│ single or multi-unit based on units you add.             │
└──────────────────────────────────────────────────────────┘

┌─ Unit 1 ──────────────────────────────────── [✕ Remove] ─┐
│ Unit number  │ Unit type ▼    │ Floor                      │
│ Bedrooms     │ Bathrooms      │ Square footage             │
│ Rent amount  │ Security deposit│ Status ▼                  │
│ ┌─ Unit Images ──────────────────────────────────────┐    │
│ │ Upload area: PNG/JPG/GIF, 10MB, 0/15 uploaded      │    │
│ └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘

           ┌─ + Add Unit ─┐
```

- Uses `useFieldArray` from react-hook-form for dynamic unit fields
- Each unit has Zod validation (unit number required, rent >= 0, etc.)
- Remove button per unit (with confirmation if editing existing unit with leases)

**4. Amenities & Features** (Card, NEW):
```
┌─ 4-column checkbox grid ────────────────────────────────┐
│ ○ Parking          │ ○ In-unit laundry │ ○ Air conditioning│ ○ Central heating │
│ ○ High-speed Wi-Fi │ ○ Furnished       │ ○ Hardwood Floors │ ○ Dishwasher      │
│ ○ Balcony/Terrace  │ ○ Walk-in Closets │ ○ Pet-friendly    │ ○ Swimming pool   │
│ ○ Fitness Center   │ ○ Elevator        │ ○ Storage         │ ○ Fireplace       │
├─────────────────────────────────────────────────────────┤
│ Custom amenity input: [____________] [+]                 │
└──────────────────────────────────────────────────────────┘
```

**5. Property Images** (Card, NEW):
```
┌─ Upload property images ────────────────────────────────┐
│ Drag and drop or click to browse                         │
│ PNG, JPG, GIF · Up to 10MB each · 0/20 uploaded         │
│              [Choose Files]                               │
└──────────────────────────────────────────────────────────┘
```

**API changes** — `POST /api/properties` (`src/app/api/properties/route.ts`):
- Accept optional `units: []` array in request body
- Accept optional `amenities: []` array (applied to all units)
- Create property + units in a Prisma `$transaction`
- Zod schema extended:
```typescript
const createPropertySchema = z.object({
  // ...existing fields...
  units: z.array(z.object({
    unitNumber: z.string().min(1),
    type: z.enum([...UNIT_TYPES]),
    floor: z.number().int().optional(),
    bedrooms: z.number().int().min(0).default(0),
    bathrooms: z.number().int().min(0).default(0),
    area: z.number().positive().optional(),
    rentAmount: z.number().min(0).default(0),
    status: z.enum([...UNIT_STATUSES]).default("VACANT"),
    amenities: z.array(z.string()).default([]),
    images: z.array(z.string().url()).default([]),
  })).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
});
```

**Constants update** (`src/lib/constants.ts`):
```typescript
export const PROPERTY_AMENITIES = [
  "Parking", "In-unit laundry", "Air conditioning", "Central heating",
  "High-speed Wi-Fi", "Furnished", "Hardwood Floors", "Dishwasher",
  "Balcony/Terrace", "Walk-in Closets", "Pet-friendly", "Swimming pool",
  "Fitness Center", "Elevator", "Storage", "Fireplace",
];
```

---

#### Step 4: Available Units Page

**New file:** `src/app/(dashboard)/properties/available-units/page.tsx`

Server component showing all VACANT units across all properties.

**Layout:**
```
┌─ PageHeader (Available Units + breadcrumbs + Refresh + Add Property) ───┐
├─ UnitsStats (5 stat cards) ─────────────────────────────────────────────┤
│  Available Units │ Average Rent │ Most Common Type │ Popular Layout     │
│  (count)         │ ($X,XXX)     │ (Apartment)      │ (1 Bedroom)       │
│  Across X props  │ Range: $X-$Y │ X units          │ X units           │
│  + Unique Properties (count)                                            │
├─ Section: "Available Units" + ViewModeToggle ───────────────────────────┤
├─ UnitFilters (Search + Type + Beds + Baths + Sort) ─────────────────────┤
├─ AvailableUnitCard grid ────────────────────────────────────────────────┤
└─ EmptyState ────────────────────────────────────────────────────────────┘
```

**Data fetching:**
```typescript
const units = await db.unit.findMany({
  where: {
    status: "VACANT",
    property: { status: "ACTIVE", ...ownerFilter },
    ...typeFilter, ...bedsFilter, ...bathsFilter, ...searchFilter,
  },
  include: {
    property: { select: { id: true, name: true, city: true, state: true, image: true, description: true } },
  },
  orderBy: sortOrder,
});
```

**Stats queries:**
- Available Units count + distinct property count
- Avg rent of vacant units + min/max range
- Most common unit type (groupBy type, max count)
- Most common bedroom count (groupBy bedrooms, max count)

**New components:**
| Component | File |
|-----------|------|
| AvailableUnitCard | `src/components/units/available-unit-card.tsx` |
| UnitsStats | `src/components/units/units-stats.tsx` |
| UnitFilters | `src/components/units/unit-filters.tsx` |

**AvailableUnitCard** design:
- Green "Available" badge (top-left) + Type badge (top-right)
- Property image or building placeholder
- Title: "{Property Name} - Unit {Number}"
- Description from property
- Location: "📍 {City}, {State}"
- Icons row: 🛏 beds · 🛁 baths · 📐 area ft² · Floor X
- Rent: "$X,XXX.XX /month"
- 3-dot menu (View Details, Edit)

---

#### Step 5: All Units Page

**New file:** `src/app/(dashboard)/properties/all-units/page.tsx`

Same layout as Available Units but shows ALL units (all statuses).

**Stats (5 cards):**
- Total Units (across X properties)
- Occupied Units (currently rented)
- Available Units (ready for tenants)
- Under Maintenance (in repair)
- Average Rent (currency)

**Additional filter**: Status dropdown (All/Vacant/Occupied/Maintenance/Reserved)

**Status badge colors:**
- Vacant → green
- Occupied → blue
- Maintenance → yellow/orange
- Reserved → purple

---

#### Step 6: Translation Keys

Add to `messages/en.json`:

**`nav` namespace:**
```json
"availableUnits": "Available Units",
"allUnits": "All Units"
```

**`properties` namespace (new keys):**
```json
"stats.totalProperties": "Total Properties",
"stats.availableProperties": "Available Properties",
"stats.occupiedProperties": "Occupied Properties",
"stats.averageRent": "Average Rent",
"stats.underMaintenance": "Under Maintenance",
"stats.totalRentValue": "Total Rent Value",
"stats.totalUnits": "Total Units",
"stats.availableUnits": "Available Units",
"stats.occupiedUnits": "Occupied Units",
"stats.unitsInMaintenance": "Units in Maintenance",
"gridView": "Grid view",
"compactView": "Compact view",
"listView": "List view",
"managePortfolio": "Manage your property portfolio",
"generalInformation": "General Information",
"generalInfoDescription": "Provide key details about your property.",
"unitManagement": "Unit Management",
"unitManagementDescription": "Manage all units for this property, including size, rent amount, and current status.",
"smartUnitManagement": "Smart Unit Management",
"smartUnitDescription": "Your property will automatically be configured as single or multi-unit based on the number of units you add. Start with one unit and add more using the \"Add New Unit\" button.",
"amenitiesAndFeatures": "Amenities & Features",
"amenitiesDescription": "Select the core amenities and features that best describe this property.",
"addCustomAmenity": "Add custom amenity or feature",
"propertyImages": "Property Images",
"propertyImagesDescription": "Upload high-quality images to showcase your property.",
"addUnit": "Add Unit",
"removeUnit": "Remove Unit",
"securityDeposit": "Security deposit",
"squareFootage": "Square footage",
"rentPerMonth": "/month",
"unitTypes": "Types",
"refresh": "Refresh"
```

**`units` namespace (new keys):**
```json
"availableUnitsTitle": "Available Units",
"availableUnitsDescription": "Individual units currently available for rent",
"allUnitsTitle": "All Units",
"allUnitsDescription": "All units across all properties",
"stats.availableUnits": "Available Units",
"stats.averageRent": "Average Rent",
"stats.mostCommonType": "Most Common Type",
"stats.popularLayout": "Popular Layout",
"stats.uniqueProperties": "Unique Properties",
"stats.totalUnits": "Total Units",
"stats.occupiedUnits": "Occupied Units",
"stats.underMaintenance": "Under Maintenance",
"searchAvailableUnits": "Search available units...",
"searchAllUnits": "Search all units...",
"anyBeds": "Any Beds",
"anyBaths": "Any Baths",
"anyType": "All Types",
"anyStatus": "All Statuses",
"lowestRent": "Lowest Rent",
"highestRent": "Highest Rent"
```

Update all 6 language files (en, ar, es, fr, pt, bn) with same keys.

---

#### Step 7: Files Summary

**New files to create:**
| File | Purpose |
|------|---------|
| `src/app/(dashboard)/properties/available-units/page.tsx` | Available Units page (server component) |
| `src/app/(dashboard)/properties/all-units/page.tsx` | All Units page (server component) |
| `src/components/properties/properties-stats.tsx` | Properties page stat cards (server) |
| `src/components/properties/view-mode-toggle.tsx` | Grid/Compact/List toggle (client) |
| `src/components/properties/property-card-compact.tsx` | Compact horizontal card (client) |
| `src/components/properties/property-list-row.tsx` | List view table row (client) |
| `src/components/units/available-unit-card.tsx` | Standalone unit card with property info (client) |
| `src/components/units/units-stats.tsx` | Unit page stat cards (server) |
| `src/components/units/unit-filters.tsx` | Unit page filters (client) |
| `src/components/shared/multi-image-upload.tsx` | Multi-image drag & drop upload (client) |

**Files to modify:**
| File | Changes |
|------|---------|
| `src/components/dashboard/app-sidebar.tsx` | Add Available Units + All Units nav items |
| `src/app/(dashboard)/properties/page.tsx` | Add stats, view modes, enhanced filters, richer card data |
| `src/components/properties/property-form.tsx` | Add Unit Management, Amenities & Features, Property Images sections |
| `src/components/properties/property-card.tsx` | Enhanced with unit breakdown, rent range, action menu |
| `src/components/properties/property-filters.tsx` | Add sort + unit filter dropdowns |
| `src/app/api/properties/route.ts` | POST accepts `units` + `amenities` arrays, transaction |
| `src/lib/constants.ts` | Add `PROPERTY_AMENITIES` constant |
| `messages/en.json` | New translation keys (properties + units + nav namespaces) |
| `messages/ar.json`, `es.json`, `fr.json`, `pt.json`, `bn.json` | Same new keys |

---

#### Verification Checklist (Properties Enhancement)

- [ ] Sidebar: Properties shows 4 sub-items (All Properties, Add Property, Available Units, All Units)
- [ ] Properties list: 10 stat cards render with correct data
- [ ] Properties list: Grid/Compact/List view toggle works via URL param
- [ ] Properties list: Search, type filter, status filter, sort, unit filter all work
- [ ] Property cards: Show unit breakdown, rent range, type badge, 3-dot menu
- [ ] Add Property: 4-section form renders (General Info, Address, Unit Management, Amenities)
- [ ] Add Property: Can add/remove units inline, submit creates property + units in transaction
- [ ] Edit Property: Loads existing units in Unit Management section, allows CRUD
- [ ] Available Units: Shows only VACANT units with 5 stat cards and filters
- [ ] All Units: Shows all units with status filter and 5 stat cards
- [ ] All pages: Fully translated (no hardcoded English strings)
- [ ] Role-based: OWNER sees only own properties/units, SUPER_ADMIN sees all
- [ ] `npm run build` passes without errors

---

### Tenants Enhancement — Detailed Implementation Plan

> **Goal**: Enhance the Tenants module with dashboard stats, table/card view modes, 8-section add/edit form, tenant application lifecycle, and a dedicated Applications page.

#### Step 1: Prisma Schema Migration

**File:** `prisma/schema.prisma`

Added `TenantStatus` enum with 7 values: `APPLICATION_SUBMITTED`, `SCREENING`, `APPROVED`, `REJECTED`, `ACTIVE`, `INACTIVE`, `EVICTED`.

Added new fields to `Tenant` model:
- `status TenantStatus @default(APPLICATION_SUBMITTED)` with `@@index([status])`
- `employer String?`, `position String?`, `annualIncome Float?`, `employmentStartDate DateTime?`
- `creditScore Int?`
- `emergencyRelationship String?`, `emergencyEmail String?`

Added `dateOfBirth DateTime?` to `User` model.

Migration: `npx prisma migrate dev --name add-tenant-status-and-fields`

---

#### Step 2: API Routes — Enhanced CRUD + Stats

**Files modified:**
- `src/app/api/tenants/route.ts` — Expanded POST schema with ~20 fields (firstName, lastName, password, dateOfBirth, avatar, tenantStatus, employer, position, annualIncome, employmentStartDate, creditScore, emergencyContact, emergencyPhone, emergencyRelationship, emergencyEmail, moveInDate, notes, documentUrls). GET supports `tenantStatus` filter param.
- `src/app/api/tenants/[id]/route.ts` — Expanded PUT schema with all new fields. firstName/lastName merge logic.

**File created:**
- `src/app/api/tenants/stats/route.ts` — Stats endpoint returning: totalTenants, activeTenants, pendingReview, avgCreditScore, approved, rejected, avgIncome, thisMonth count, monthlyChange %.

Stats queries use `Promise.all` with 9 parallel Prisma queries.

---

#### Step 3: Sidebar — Add Applications Sub-Item

**File:** `src/components/dashboard/app-sidebar.tsx`

```
Tenants
├── All Tenants        → /tenants
├── Add Tenant         → /tenants/new
└── Applications       → /tenants/applications  (icon: ClipboardCheck)
```

---

#### Step 4: Tenants Stats Component

**File created:** `src/components/tenants/tenants-stats.tsx`

Async server component with 8 stat cards in `grid gap-4 grid-cols-2 md:grid-cols-4`:

| Card | Icon | Description |
|------|------|-------------|
| Total Tenants | `Users` | All tenant profiles |
| Active Tenants | `UserCheck` | Currently living in properties |
| Pending Review | `UserSearch` | Awaiting background check |
| Avg Credit Score | `BarChart3` | Fair average |
| Approved | `CheckCircle` | Ready to move in |
| Rejected | `XCircle` | Applications declined |
| Avg Income | `DollarSign` | Annual income average |
| This Month | `CalendarPlus` | New applications + trend % |

---

#### Step 5: Tenant Filters Component

**File created:** `src/components/tenants/tenant-filters.tsx`

Client component with:
- Debounced search input (400ms)
- Status dropdown (7 TenantStatus values)
- Sort dropdown (Newest, Oldest, Name A-Z, Name Z-A)
- View toggle: Table (`LayoutList`) | Cards (`LayoutGrid`) via URL `?view=` param

---

#### Step 6: Tenant Card Component

**File created:** `src/components/tenants/tenant-card.tsx`

Client component showing:
- Avatar + status badge + description text
- Contact info (Mail/Phone/Building2/Calendar icons)
- 3-dot DropdownMenu (View/Edit/Invite/Delete)
- Delete confirmation via AlertDialog
- `transition-all hover:shadow-lg hover:-translate-y-0.5` hover effect

---

#### Step 7: Enhanced Tenant Form (8 Sections)

**File:** `src/components/tenants/tenant-form.tsx` — Complete rewrite

Zod schema with ~20 fields + password confirmation refine. Layout: asymmetric 2-column grid (`md:grid-cols-12`).

| Row | Left (col-span-4) | Right (col-span-8) |
|-----|-------------------|---------------------|
| 1 | **Profile Photo** — Circular avatar upload | **Personal Information** — firstName*, lastName*, email*, phone*, dateOfBirth*, SSN |
| 2 | **Account Setup** — Password*, confirmPassword*, tenantStatus* | **Employment Information** — Employer, position, annualIncome, employmentStartDate |
| 3 | **Emergency Contact** — Name, relationship, phone, email | **Additional Information** — Credit score (300-850), move-in date |
| Full | **Documents** — MultiImageUpload with PDF/Word/Image accept types |
| Full | **Notes** — Textarea |

**Also modified:**
- `src/app/(dashboard)/tenants/new/page.tsx` — Full-width layout, Back to Tenants button
- `src/app/(dashboard)/tenants/[id]/edit/page.tsx` — Fetches all new fields, passes to form

---

#### Step 8: Enhanced Tenants List Page

**File:** `src/app/(dashboard)/tenants/page.tsx` — Rewritten

Structure: PageHeader → TenantsStats → section heading → TenantFilters → conditional render (cards grid / TenantTable / EmptyState).

**File:** `src/components/tenants/tenant-table.tsx` — Rewritten with TenantStatus column, Credit Score column, 3-dot action menu per row (View/Edit/Invite/Delete).

---

#### Step 9: Tenant Applications Page

**File created:** `src/app/(dashboard)/tenants/applications/page.tsx`

Server component filtering tenants by application pipeline statuses (APPLICATION_SUBMITTED, SCREENING, APPROVED, REJECTED).

Structure: PageHeader + Refresh → ApplicationFilters → section heading → ApplicationsTable or EmptyState.

**File created:** `src/components/tenants/applications-table.tsx` — Quick-action Approve/Reject via DropdownMenu with confirmation AlertDialog.

**File created:** `src/components/tenants/application-filters.tsx` — Search + status filter in Card.

---

#### Step 10: Translation Keys (All 6 Languages)

~130 new keys in `tenants` namespace + `nav.applications` across all 6 locale files (en, ar, es, fr, pt, bn).

Key groups: stats.*, form sections (profilePhoto, firstName, lastName, dateOfBirth, ssn, accountSetup, password, confirmPassword, tenantStatus, employer, position, annualIncome, etc.), status labels, status descriptions, view modes, list/table headers, application page keys.

---

#### Files Summary (Tenants Enhancement)

**New files (7):**
| File | Purpose |
|------|---------|
| `src/components/tenants/tenants-stats.tsx` | Stats dashboard (8 cards) |
| `src/components/tenants/tenant-filters.tsx` | Search + status + sort + view toggle |
| `src/components/tenants/tenant-card.tsx` | Card view component |
| `src/app/(dashboard)/tenants/applications/page.tsx` | Applications page |
| `src/components/tenants/applications-table.tsx` | Applications table with quick actions |
| `src/components/tenants/application-filters.tsx` | Application-specific filters |
| `src/app/api/tenants/stats/route.ts` | Stats API endpoint |

**Modified files (9):**
| File | Changes |
|------|---------|
| `prisma/schema.prisma` | TenantStatus enum, new Tenant/User fields |
| `src/app/api/tenants/route.ts` | Enhanced POST/GET with new fields |
| `src/app/api/tenants/[id]/route.ts` | Enhanced PUT/GET with new fields |
| `src/components/dashboard/app-sidebar.tsx` | Add Applications sub-item |
| `src/components/tenants/tenant-form.tsx` | Complete rewrite: 8 sections, 20+ fields |
| `src/components/tenants/tenant-table.tsx` | New columns + action menu |
| `src/app/(dashboard)/tenants/page.tsx` | Full dashboard with stats/filters/views |
| `src/app/(dashboard)/tenants/new/page.tsx` | Layout update + Back button |
| `src/app/(dashboard)/tenants/[id]/edit/page.tsx` | Fetch + pass new fields |

---

#### Verification Checklist (Tenants Enhancement)

- [x] Prisma migration succeeds with TenantStatus enum
- [x] Sidebar shows: All Tenants, Add Tenant, Applications
- [x] `/tenants` page shows 8 stat cards + table/card toggle + filters
- [x] Card view displays tenant cards with status badges, contact info, property/lease info
- [x] `/tenants/new` shows 8-section form with avatar upload, all new fields, document upload
- [x] `/tenants/[id]/edit` loads all fields and saves changes
- [x] `/tenants/applications` shows application-pipeline tenants with approve/reject actions
- [x] All pages are fully translated (6 languages)
- [x] Role-based access: OWNER sees only own property tenants, SUPER_ADMIN sees all
- [ ] `npm run build` passes without errors

---

#### Phase 3: Financial Module (Week 3-4)
1. Invoice model + auto-generation logic (cron or on-demand)
2. Invoice CRUD pages + API routes
3. Stripe integration (PaymentIntent flow)
4. Payment gateway abstract interface
5. Payment recording (online + manual)
6. Expense CRUD pages + API routes
7. Late fee rule configuration + auto-application
8. Overdue payment detection + alerts

#### Phase 4: Operations (Week 4-5)
1. Maintenance request CRUD + API routes
2. Maintenance comments system
3. Maintenance assignment to staff/maintainer
4. Document management — Hub + Spoke architecture:
   a. Global Documents page (search, filter, bulk actions)
   b. Contextual Documents tabs on entity detail pages (property, tenant, lease, unit, maintenance)
   c. Single data model — Document linked to multiple entities
5. In-app messaging — async threads only (keep simple, no WebSocket)
6. Notice board — basic CRUD (simple text, no rich editor)
7. Role-based access enforcement on all routes

#### Phase 5: Reports & Polish (Week 5-6)
1. Report generation (Income, Expense, P&L, Occupancy, Inspection, etc.)
2. CSV export (using native JS)
3. PDF export (using @react-pdf/renderer or jspdf) — including inspection comparison reports
4. Dashboard charts (Recharts: Revenue bar chart, Property pie chart, Payment donut)
5. Email notification templates (React Email) — including e-signature + inspection emails
6. Email sending for all automated events
7. Settings pages (General, Payment, Email, Storage, Profile)
8. Responsive design pass (mobile-first — every workflow tested on mobile)
9. Seed data script with realistic demo data

#### Phase 6: CodeCanyon Release (Week 6-7)
1. Envato purchase code verification endpoint
2. Installation wizard (first-run setup: admin account, company info, DB connection)
3. Documentation: Installation Guide (raw VPS with PM2/Nginx), User Guide, API Reference
4. Demo data for CodeCanyon preview
5. Nginx reverse proxy config template
6. Security audit (CSRF, XSS, SQL injection, rate limiting)
7. Performance pass (image optimization, code splitting, caching)
8. Screenshots + demo video prep
9. Final testing

#### Phase 7: Multilingual / i18n

**Library**: `next-intl` | **Strategy**: Cookie-based locale (NO URL prefix)

**Initial languages**: `en` (English), `ar` (Arabic/RTL), `es` (Spanish), `fr` (French), `pt` (Portuguese), `bn` (Bengali)

**Key files:**
| File | Purpose |
|------|---------|
| `src/i18n/request.ts` | next-intl config — locale from cookie → Accept-Language → default |
| `src/middleware.ts` | Set `NEXT_LOCALE` cookie on first visit |
| `messages/en.json` | Master English translations (~620-700 keys, namespaced) |
| `messages/{ar,es,fr,pt,bn}.json` | Other language translations |
| `src/components/shared/language-switcher.tsx` | Globe icon dropdown |
| `src/app/api/settings/locale/route.ts` | PUT user locale preference |

**Implementation steps:**
1. Install `next-intl`, create `src/i18n/request.ts`, create `messages/en.json`
2. Update `next.config.ts` with `createNextIntlPlugin()`
3. Update `src/app/layout.tsx` — `NextIntlClientProvider`, dynamic `lang`/`dir`
4. Create `src/middleware.ts` — cookie initialization from Accept-Language
5. Add `locale String @default("en")` to User model, run migration
6. Update `src/lib/auth.ts` — expose locale in JWT/Session
7. Create language switcher component + `/api/settings/locale` endpoint
8. Extract strings from all ~50 pages and ~120 components
9. Zod schema factories for i18n validation messages
10. Email template i18n (send in recipient's preferred language)
11. RTL CSS support for Arabic (Tailwind logical properties + `dir="rtl"`)
12. Create translations for ar, es, fr, pt, bn
13. Create `docs/i18n-guide.md` for CodeCanyon buyers

**Translation patterns:**
- Server Components: `const t = await getTranslations("namespace")`
- Client Components: `const t = useTranslations("namespace")`
- Zod schemas: Schema factory functions accepting `t` function
- Emails: Load messages by `User.locale`

**Namespace structure in JSON:** `common`, `nav`, `auth`, `dashboard`, `properties`, `tenants`, `leases`, `maintenance`, `invoices`, `payments`, `expenses`, `messages`, `notices`, `reports`, `documents`, `inspections`, `settings`, `validation`, `emails`

**How buyers add languages:**
1. Copy `messages/en.json` → `messages/xx.json`
2. Translate all values
3. Add locale code to `locales` array in `src/i18n/request.ts`
4. No rebuild needed — cookie-based detection picks it up

#### v1.1 Planned (Post-Launch)
1. Additional payment gateways (PayPal, Razorpay, Paystack) via abstract interface
2. Tenant screening integration (TransUnion/Experian API — US market)
3. QuickBooks-compatible export (CSV format matching QB import)
4. Calendar view for leases/maintenance (lease expiry, inspection dates, payment due dates)

### Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes without errors
- [ ] Auth flow: Register (email/password) → Login → Forgot password → Reset
- [ ] All CRUD operations work for every entity
- [ ] Role-based access: each role sees only what they should
- [ ] Stripe test payment flow works end-to-end
- [ ] Invoice auto-generation creates correct invoices
- [ ] Late fee auto-calculation works
- [ ] E-Signature: Owner signs → Tenant signs → Lease becomes fully signed → Signed PDF generated
- [ ] Inspections: Create move-in → Create move-out → Comparison report generates correctly
- [ ] Documents: Upload from entity page → Appears in contextual tab AND global Documents page
- [ ] Documents: Global search/filter works across all entity types
- [ ] File upload to Cloudflare R2 works
- [ ] Email sending works (invoice, reminder, e-signature request, inspection notification, etc.)
- [ ] Reports generate correct data (including inspection reports)
- [ ] CSV/PDF export downloads correctly
- [ ] Dashboard charts render with correct data
- [ ] In-app messaging works between users (async threads)
- [ ] PM2 starts app correctly (`pm2 start ecosystem.config.js`)
- [ ] Seed data populates realistic demo
- [ ] i18n: Language switcher works on login page and dashboard
- [ ] i18n: Switching language updates cookie + DB + page re-renders
- [ ] i18n: Arabic (RTL) layout flips correctly
- [ ] i18n: Settings → General has "Default Language" dropdown
- [ ] i18n: Settings → Profile has "Language" preference
- [ ] i18n: Emails sent in recipient's preferred language
- [ ] i18n: Buyer can add new language by copying `messages/en.json`
- [ ] Mobile responsive on all pages (test every workflow on mobile viewport)
