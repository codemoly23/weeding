# Client Site (Landing Page) Implementation Plan

## Overview
Public-facing website for LLCPad - US LLC Formation & Amazon Seller Services platform.

**Target URL Structure:** `llcpad.com`

---

## Phase 1: Project Setup & Foundation

### 1.1 Initialize Next.js Project
```bash
npx create-next-app@latest llcpad --typescript --tailwind --eslint --app --turbopack
```

**Configuration:**
- Next.js 16.0.7+ (⚠️ CVE-2025-66478 fix required)
- TypeScript 5.9.x strict mode
- TailwindCSS 4.1.x
- ESLint with strict rules
- App Router enabled
- Turbopack for dev

### 1.2 Install Core Dependencies
```bash
# UI Components
npx shadcn@latest init
npx shadcn@latest add button card input form dialog sheet tabs accordion

# Database & ORM
npm install prisma @prisma/client
npx prisma init

# Authentication
npm install next-auth@5

# Validation & State
npm install zod @tanstack/react-query zustand

# Email
npm install resend @react-email/components

# Payments
npm install stripe @stripe/stripe-js

# Utilities
npm install date-fns clsx tailwind-merge lucide-react
```

### 1.3 Project Structure Setup
```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Homepage
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx             # Services listing
│   │   │   └── [slug]/page.tsx      # Individual service
│   │   ├── llc/
│   │   │   └── [state]/page.tsx     # State-specific landing
│   │   ├── blog/
│   │   │   ├── page.tsx             # Blog listing
│   │   │   └── [slug]/page.tsx      # Blog post
│   │   ├── faq/page.tsx
│   │   └── testimonials/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx                 # Dashboard home
│   │   ├── orders/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── profile/page.tsx
│   │   └── support/page.tsx
│   ├── checkout/
│   │   ├── page.tsx
│   │   └── success/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts
│   │   │   └── sslcommerz/route.ts
│   │   └── ...
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn components
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   └── dashboard-sidebar.tsx
│   ├── sections/
│   │   ├── hero.tsx
│   │   ├── services-grid.tsx
│   │   ├── pricing-table.tsx
│   │   ├── testimonials.tsx
│   │   ├── faq-section.tsx
│   │   ├── cta-section.tsx
│   │   └── trust-badges.tsx
│   └── forms/
│       ├── contact-form.tsx
│       ├── order-form.tsx
│       └── auth-form.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── stripe.ts
│   ├── email.ts
│   └── utils.ts
├── hooks/
├── types/
└── styles/
```

---

## Phase 2: Database Schema Implementation

### 2.1 Prisma Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ USER & AUTH ============
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  phone         String?
  country       String?
  image         String?
  password      String?
  role          UserRole  @default(CUSTOMER)

  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  documents     Document[]
  tickets       Ticket[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  CUSTOMER
  ADMIN
  CONTENT_MANAGER
  SALES_AGENT
  SUPPORT_AGENT
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============ SERVICES & PACKAGES ============
model Service {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String   @db.Text
  shortDesc   String?
  icon        String?
  image       String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  packages    Package[]
  orderItems  OrderItem[]

  // SEO
  metaTitle       String?
  metaDescription String?
  keywords        String[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Package {
  id          String   @id @default(cuid())
  serviceId   String
  name        String   // Basic, Standard, Premium
  description String?  @db.Text
  priceUSD    Decimal  @db.Decimal(10, 2)
  priceBDT    Decimal? @db.Decimal(10, 2)
  features    String[] // Array of feature strings
  isPopular   Boolean  @default(false)
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  service     Service  @relation(fields: [serviceId], references: [id])
  orderItems  OrderItem[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ============ ORDERS & PAYMENTS ============
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  userId          String
  status          OrderStatus @default(PENDING)

  // Pricing
  subtotalUSD     Decimal     @db.Decimal(10, 2)
  discountUSD     Decimal     @default(0) @db.Decimal(10, 2)
  totalUSD        Decimal     @db.Decimal(10, 2)
  currency        String      @default("USD")
  exchangeRate    Decimal?    @db.Decimal(10, 4)

  // Payment
  paymentMethod   String?     // stripe, sslcommerz
  paymentStatus   PaymentStatus @default(PENDING)
  paymentId       String?     // External payment ID
  paidAt          DateTime?

  // LLC Details (if applicable)
  llcName         String?
  llcState        String?
  llcType         String?     // LLC, PLLC, Series LLC

  // Contact
  customerName    String
  customerEmail   String
  customerPhone   String?
  customerCountry String?

  // Relations
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  documents       Document[]
  notes           OrderNote[]
  invoices        Invoice[]

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum OrderStatus {
  PENDING
  PROCESSING
  IN_PROGRESS
  WAITING_FOR_INFO
  COMPLETED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  serviceId   String
  packageId   String?

  name        String
  description String?
  quantity    Int      @default(1)
  priceUSD    Decimal  @db.Decimal(10, 2)

  // State fees if applicable
  stateFee    Decimal? @db.Decimal(10, 2)

  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  service     Service  @relation(fields: [serviceId], references: [id])
  package     Package? @relation(fields: [packageId], references: [id])

  createdAt   DateTime @default(now())
}

model OrderNote {
  id          String   @id @default(cuid())
  orderId     String
  authorId    String?
  content     String   @db.Text
  isInternal  Boolean  @default(false)

  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
}

// ============ DOCUMENTS ============
model Document {
  id          String         @id @default(cuid())
  orderId     String?
  userId      String
  type        DocumentType
  name        String
  fileName    String
  fileUrl     String
  fileSize    Int
  mimeType    String
  status      DocumentStatus @default(PENDING)

  order       Order?         @relation(fields: [orderId], references: [id])
  user        User           @relation(fields: [userId], references: [id])

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum DocumentType {
  PASSPORT
  ID_CARD
  ADDRESS_PROOF
  ARTICLES_OF_ORG
  EIN_LETTER
  OPERATING_AGREEMENT
  BANK_STATEMENT
  OTHER
}

enum DocumentStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}

// ============ INVOICES ============
model Invoice {
  id            String        @id @default(cuid())
  invoiceNumber String        @unique
  orderId       String

  subtotal      Decimal       @db.Decimal(10, 2)
  discount      Decimal       @default(0) @db.Decimal(10, 2)
  tax           Decimal       @default(0) @db.Decimal(10, 2)
  total         Decimal       @db.Decimal(10, 2)
  currency      String        @default("USD")

  status        InvoiceStatus @default(DRAFT)
  dueDate       DateTime?
  paidAt        DateTime?

  order         Order         @relation(fields: [orderId], references: [id])

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

// ============ SUPPORT TICKETS ============
model Ticket {
  id          String       @id @default(cuid())
  userId      String
  subject     String
  status      TicketStatus @default(OPEN)
  priority    TicketPriority @default(MEDIUM)

  user        User         @relation(fields: [userId], references: [id])
  messages    TicketMessage[]

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_FOR_CUSTOMER
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model TicketMessage {
  id          String   @id @default(cuid())
  ticketId    String
  authorId    String?
  content     String   @db.Text
  isStaff     Boolean  @default(false)

  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
}

// ============ CONTENT ============
model BlogPost {
  id            String      @id @default(cuid())
  title         String
  slug          String      @unique
  excerpt       String?     @db.Text
  content       String      @db.Text
  coverImage    String?
  authorId      String?
  status        PostStatus  @default(DRAFT)
  publishedAt   DateTime?

  categories    BlogCategory[]
  tags          String[]

  // SEO
  metaTitle       String?
  metaDescription String?

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model BlogCategory {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  posts       BlogPost[]
}

model Testimonial {
  id          String   @id @default(cuid())
  name        String
  company     String?
  country     String?
  avatar      String?
  content     String   @db.Text
  rating      Int      @default(5)
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  createdAt   DateTime @default(now())
}

model FAQ {
  id          String   @id @default(cuid())
  question    String
  answer      String   @db.Text
  category    String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ============ SETTINGS ============
model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text
  type      String   @default("string") // string, number, boolean, json

  updatedAt DateTime @updatedAt
}

// ============ STATE FEES ============
model StateFee {
  id          String   @id @default(cuid())
  stateCode   String   @unique // e.g., "WY", "DE", "NM"
  stateName   String
  llcFee      Decimal  @db.Decimal(10, 2)
  annualFee   Decimal? @db.Decimal(10, 2)
  processingTime String? // e.g., "3-5 business days"
  isPopular   Boolean  @default(false)

  // SEO for state landing pages
  metaTitle       String?
  metaDescription String?
  content         String?  @db.Text

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ============ COUPONS ============
model Coupon {
  id          String      @id @default(cuid())
  code        String      @unique
  description String?
  type        CouponType  @default(PERCENTAGE)
  value       Decimal     @db.Decimal(10, 2)
  minOrder    Decimal?    @db.Decimal(10, 2)
  maxDiscount Decimal?    @db.Decimal(10, 2)
  usageLimit  Int?
  usedCount   Int         @default(0)
  isActive    Boolean     @default(true)
  expiresAt   DateTime?

  createdAt   DateTime    @default(now())
}

enum CouponType {
  PERCENTAGE
  FIXED
}
```

### 2.2 Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

---

## Phase 3: Core Components Implementation

### 3.1 Layout Components

#### Header (`src/components/layout/header.tsx`)
- Logo (left)
- Navigation links: Services, Pricing, About, Blog, Contact
- CTA button: "Get Started" or "Dashboard" (if logged in)
- Mobile hamburger menu
- Sticky on scroll

#### Footer (`src/components/layout/footer.tsx`)
- Company info & logo
- Service links
- Legal links (Privacy, Terms, Disclaimer)
- Contact info
- Social media links
- Copyright notice

### 3.2 Homepage Sections

#### Hero Section (`src/components/sections/hero.tsx`)
- Headline: "Start Your US LLC in 24 Hours"
- Subheadline with value proposition
- CTA buttons: "Start Now" + "Book Consultation"
- Trust badges (BBB, Google Reviews, etc.)
- Hero image/illustration

#### Services Grid (`src/components/sections/services-grid.tsx`)
- 8 service cards in responsive grid
- Icon, title, short description, price starting at
- Hover effects
- Link to individual service page

#### Pricing Table (`src/components/sections/pricing-table.tsx`)
- 3-column pricing comparison
- Feature checklist
- Popular badge
- State fee calculator integration
- CTA buttons

#### Testimonials (`src/components/sections/testimonials.tsx`)
- Carousel/slider of customer reviews
- Name, country, rating, review text
- Avatar images

#### FAQ Section (`src/components/sections/faq-section.tsx`)
- Accordion component
- Categorized FAQs
- Schema markup for SEO

#### CTA Section (`src/components/sections/cta-section.tsx`)
- Final conversion push
- "Ready to Start?" messaging
- Primary CTA button
- Trust elements

### 3.3 Service Pages

#### Service Listing (`src/app/(public)/services/page.tsx`)
- All services in grid/list view
- Filter by category
- Service cards with pricing

#### Individual Service (`src/app/(public)/services/[slug]/page.tsx`)
- Service details
- Package comparison table
- Process steps timeline
- FAQs specific to service
- Related services
- CTA section

### 3.4 State Landing Pages (`src/app/(public)/llc/[state]/page.tsx`)
- State-specific LLC information
- State fees and processing time
- Benefits of forming in that state
- Package pricing with state fees
- SEO optimized content
- Schema markup

---

## Phase 4: Authentication System

### 4.1 Auth Configuration (`src/lib/auth.ts`)
```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      // Email/Password login
    }),
  ],
  pages: {
    signIn: "/login",
    signUp: "/register",
    error: "/login",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role
      }
      return session
    },
  },
})
```

### 4.2 Auth Pages
- `/login` - Email/password + Google OAuth
- `/register` - Registration form with country selection
- `/forgot-password` - Password reset via email
- `/verify` - Email verification page

---

## Phase 5: Customer Dashboard

### 5.1 Dashboard Layout
- Sidebar navigation
- Responsive (collapsible on mobile)
- User profile dropdown

### 5.2 Dashboard Pages

#### Overview (`/dashboard`)
- Active orders summary
- Recent activity
- Quick actions
- Notifications

#### Orders (`/dashboard/orders`)
- Order list with status badges
- Order detail view
- Timeline of order progress
- Download documents

#### Documents (`/dashboard/documents`)
- All documents grid
- Filter by type/status
- Upload new documents
- Download/preview

#### Profile (`/dashboard/profile`)
- Personal information
- Change password
- Notification preferences

#### Support (`/dashboard/support`)
- Ticket list
- Create new ticket
- Ticket conversation view

---

## Phase 6: Checkout & Payment

### 6.1 Checkout Flow
1. Cart/Package selection
2. LLC details form (if applicable)
3. Contact information
4. Payment method selection
5. Review & confirm
6. Payment processing
7. Success page

### 6.2 Stripe Integration (`src/lib/stripe.ts`)
- Checkout session creation
- Webhook handling
- Payment intent for custom flows

### 6.3 SSLCommerz Integration
- BDT payments for Bangladesh
- Webhook verification
- Status callbacks

---

## Phase 7: SEO & Performance

### 7.1 SEO Implementation
- Dynamic meta tags per page
- Open Graph tags
- Twitter cards
- JSON-LD schema markup
- Sitemap generation
- robots.txt

### 7.2 Performance Optimization
- Image optimization (next/image)
- Font optimization
- Code splitting
- Lazy loading
- Server Components by default
- `use cache` directive for static data

### 7.3 Analytics
- Google Analytics 4
- Conversion tracking
- Event tracking

---

## Phase 8: Email System - COMPLETED

### 8.1 Email Templates (React Email) - COMPLETED
- [x] Welcome email
- [x] Order confirmation
- [x] Order status updates
- [x] Document uploaded notification
- [x] Password reset
- [x] Invoice
- [x] Document approved notification
- [x] Ticket reply notification

### 8.2 Email Service (`src/lib/email.ts`) - COMPLETED
- [x] Resend integration
- [x] Template rendering
- [ ] Queue for bulk emails (future enhancement)

---

## Implementation Checklist

### Week 1-2: Foundation - COMPLETED
- [x] Project setup with Next.js 16.0.7+
- [x] Install all dependencies
- [x] Configure TailwindCSS 4.1
- [x] Set up shadcn/ui
- [x] Create project structure
- [x] Set up Prisma with PostgreSQL
- [x] Create database schema
- [x] Configure environment variables

### Week 3-4: Core UI - COMPLETED
- [x] Header component
- [x] Footer component
- [x] Homepage hero section
- [x] Services grid
- [x] Pricing table
- [x] Testimonials section
- [x] FAQ accordion
- [x] CTA sections

### Week 5-6: Pages & Content - COMPLETED
- [x] About page
- [x] Contact page with form
- [x] Services listing page
- [x] Individual service pages
- [x] State landing pages (WY, DE, NM) - `/llc/[state]`
- [x] Blog listing & post pages - `/blog`, `/blog/[slug]`
- [x] FAQ page - `/faq`

### Week 7-8: Authentication & Dashboard - COMPLETED
- [x] NextAuth.js setup (UI ready, backend pending)
- [x] Login page
- [x] Register page
- [x] Password reset flow
- [x] Dashboard layout
- [x] Dashboard overview
- [x] Orders page
- [x] Documents page
- [x] Profile page
- [x] Support tickets

### Week 9-10: Payments & Orders - COMPLETED
- [x] Checkout flow
- [x] Stripe integration
- [ ] SSLCommerz integration
- [x] Webhook handlers
- [x] Order creation (UI ready)
- [ ] Invoice generation
- [ ] Email notifications

### Week 11-12: Polish & Launch - COMPLETED
- [x] SEO optimization
- [ ] Performance audit
- [x] Mobile responsiveness
- [ ] Cross-browser testing
- [ ] Security audit
- [x] Error handling
- [x] Loading states
- [x] 404/500 pages
- [ ] Final QA

---

## API Endpoints Summary

### Public APIs
- `GET /api/services` - List services
- `GET /api/services/[slug]` - Service details
- `GET /api/packages` - List packages
- `GET /api/state-fees` - State fees
- `GET /api/blog` - Blog posts
- `GET /api/testimonials` - Testimonials
- `GET /api/faq` - FAQs
- `POST /api/contact` - Contact form

### Auth APIs
- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification

### Protected APIs (Customer)
- `GET /api/orders` - User orders
- `GET /api/orders/[id]` - Order details
- `POST /api/orders` - Create order
- `GET /api/documents` - User documents
- `POST /api/documents/upload` - Upload document
- `GET /api/tickets` - Support tickets
- `POST /api/tickets` - Create ticket
- `POST /api/tickets/[id]/messages` - Reply to ticket
- `GET /api/profile` - User profile
- `PATCH /api/profile` - Update profile

### Payment Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook
- `POST /api/webhooks/sslcommerz` - SSLCommerz webhook

---

## File Naming Reference

| File | Purpose |
|------|---------|
| `page.tsx` | Route page component |
| `layout.tsx` | Route layout wrapper |
| `loading.tsx` | Loading UI |
| `error.tsx` | Error UI |
| `not-found.tsx` | 404 UI |
| `route.ts` | API route handler |

---

## Notes

1. **Security First**: Always validate input, sanitize output, use HTTPS
2. **Mobile First**: Design for mobile, enhance for desktop
3. **SEO Critical**: Every page needs proper meta tags and schema
4. **Performance**: Use Server Components, optimize images, lazy load
5. **Accessibility**: ARIA labels, keyboard navigation, color contrast
6. **Internationalization Ready**: Structure for future i18n support
