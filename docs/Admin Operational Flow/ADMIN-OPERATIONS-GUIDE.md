# Ceremoney — Admin Dashboard Complete Operational Guide

**Version:** 1.0 | **Platform:** Ceremoney SaaS  
**Prepared for:** Internal Operations, Onboarding, and Platform Management  
**Last Updated:** April 2026

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Admin Roles & Access Levels](#2-admin-roles--access-levels)
3. [Dashboard Overview & KPI Monitoring](#3-dashboard-overview--kpi-monitoring)
4. [Module-Wise Management](#4-module-wise-management)
   - 4.1 [User & Customer Management](#41-user--customer-management)
   - 4.2 [Order & Invoice Management](#42-order--invoice-management)
   - 4.3 [Vendor & Venue Management](#43-vendor--venue-management)
   - 4.4 [Lead Management & CRM](#44-lead-management--crm)
   - 4.5 [Support & Ticket System](#45-support--ticket-system)
   - 4.6 [Content Management](#46-content-management)
   - 4.7 [Marketing & Campaigns](#47-marketing--campaigns)
   - 4.8 [Appearance & Theme Control](#48-appearance--theme-control)
   - 4.9 [Services & Catalog Management](#49-services--catalog-management)
   - 4.10 [Wedding Planner Admin](#410-wedding-planner-admin)
5. [Settings & Configuration Control](#5-settings--configuration-control)
6. [Reporting & Analytics](#6-reporting--analytics)
7. [Maintenance & Health Procedures](#7-maintenance--health-procedures)
8. [End-to-End Admin Journey (Scenario Walkthroughs)](#8-end-to-end-admin-journey-scenario-walkthroughs)
9. [Emergency & Escalation Procedures](#9-emergency--escalation-procedures)
10. [Admin Checklist — Daily / Weekly / Monthly](#10-admin-checklist--daily--weekly--monthly)

---

## 1. Platform Overview

### What is Ceremoney?

Ceremoney is a **multi-event digital planning SaaS platform** serving couples, vendors, and businesses who manage weddings, baptisms, parties, and corporate events. The platform operates across **Sweden (primary market)**, English-speaking markets, and Arabic/RTL-speaking regions.

### Core Platform Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     CEREMONEY PLATFORM                          │
├────────────────────┬────────────────────┬───────────────────────┤
│   PUBLIC WEBSITE   │  CUSTOMER PORTAL   │    ADMIN DASHBOARD    │
│  (Marketing site)  │  (Planning tools)  │  (/admin — this doc)  │
├────────────────────┴────────────────────┴───────────────────────┤
│   DATABASE: PostgreSQL + Prisma   │   STORAGE: AWS S3           │
│   AUTH: NextAuth (JWT)            │   PAYMENTS: Stripe/Swish    │
│   REALTIME: Socket.io             │   EMAIL: SendGrid/SES       │
└─────────────────────────────────────────────────────────────────┘
```

### Admin Dashboard Entry Point

| Environment | URL |
|-------------|-----|
| Production  | `https://ceremoney.com/admin` |
| Staging     | `https://staging.ceremoney.com/admin` |
| Local Dev   | `http://localhost:3000/admin` |

**Authentication:** Email + Password via NextAuth. JWT stored in HTTP-only cookie. Session expires in 30 days (configurable). MFA recommended for all admin accounts.

---

## 2. Admin Roles & Access Levels

### Role Hierarchy

```
SUPER_ADMIN
    │
    ├── ADMIN (Operational)
    │       ├── SUPPORT_AGENT
    │       ├── SALES_AGENT
    │       └── CONTENT_MANAGER
    │
    └── VENDOR (Self-managed profile)
            └── CUSTOMER (Event owner)
                    └── COLLABORATOR (Shared access)
                            └── GUEST (RSVP only)
```

### Role Capabilities Matrix

| Module | super_admin | admin | support_agent | sales_agent | content_manager |
|--------|:-----------:|:-----:|:-------------:|:-----------:|:---------------:|
| Dashboard Overview | ✅ Full | ✅ Full | ✅ Limited | ✅ Limited | ✅ Limited |
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ |
| Orders & Invoices | ✅ | ✅ | 👁 View | ✅ | ❌ |
| Vendor Approvals | ✅ | ✅ | ❌ | ✅ | ❌ |
| Lead Management | ✅ | ✅ | ❌ | ✅ Full | ❌ |
| Support Tickets | ✅ | ✅ | ✅ Full | ❌ | ❌ |
| Blog / Content | ✅ | ✅ | ❌ | ❌ | ✅ Full |
| Marketing Campaigns | ✅ | ✅ | ❌ | ✅ | ❌ |
| Appearance / Theme | ✅ | ✅ | ❌ | ❌ | ✅ |
| Settings (Global) | ✅ | Limited | ❌ | ❌ | ❌ |
| Plugin Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Permissions Control | ✅ | ❌ | ❌ | ❌ | ❌ |
| Data Export / Import | ✅ | Limited | ❌ | ❌ | ❌ |
| Financial Reports | ✅ | ✅ | ❌ | 👁 View | ❌ |

### Creating Admin Accounts

**Path:** `/admin/users` → `+ Invite Admin`

1. Enter email address and select role
2. System sends invitation email with one-time setup link
3. New admin sets password on first login
4. Permissions auto-apply based on role
5. Custom permission overrides can be set at `/admin/users/permissions`

---

## 3. Dashboard Overview & KPI Monitoring

### Main Dashboard Layout (`/admin`)

The dashboard loads automatically after login and shows a real-time snapshot of platform health.

```
┌──────────────────────────────────────────────────────┐
│  STAT CARDS ROW                                      │
│  [Total Revenue] [Active Users] [Open Tickets]       │
│  [New Orders]    [Active Plans] [Pending Vendors]    │
├─────────────────────────┬────────────────────────────┤
│  REVENUE CHART          │  RECENT ORDERS             │
│  (30/90/365 day toggle) │  (last 10 with status)     │
├─────────────────────────┼────────────────────────────┤
│  LEAD PIPELINE SUMMARY  │  SUPPORT QUEUE SUMMARY     │
│  (funnel by stage)      │  (open / pending / urgent) │
├─────────────────────────┴────────────────────────────┤
│  SYSTEM ALERTS & NOTIFICATIONS BAR                   │
└──────────────────────────────────────────────────────┘
```

### Key Performance Indicators (KPIs)

#### Business KPIs

| KPI | Description | Target | Alert Threshold |
|-----|-------------|--------|-----------------|
| MRR (Monthly Recurring Revenue) | Sum of active subscriptions | Growing | MoM drop > 5% |
| New Customer Signups | Daily/weekly registrations | Trending up | < 10/week |
| Active Premium/Elite Plans | Paying subscribers count | > 60% of users | < 40% |
| Churn Rate | Cancellations / total subs | < 3% monthly | > 5% |
| Vendor Approval Rate | Approved / applied vendors | > 70% | < 50% |

#### Operational KPIs

| KPI | Description | Target |
|-----|-------------|--------|
| Ticket Resolution Time | Avg. hours to close | < 24 hours |
| Lead Conversion Rate | Leads converted to orders | > 15% |
| Support CSAT Score | Customer satisfaction % | > 85% |
| Uptime | Platform availability | 99.9% |
| Email Delivery Rate | Campaign deliverability | > 98% |

### Dashboard Refresh & Real-time Data

- Stat cards refresh every **60 seconds** automatically
- Socket.io pushes live updates for new tickets and orders
- Revenue chart uses cached data (refreshes hourly via `unstable_cache`)
- Click any stat card to drill into the full module

---

## 4. Module-Wise Management

---

### 4.1 User & Customer Management

**Route:** `/admin/customers` | `/admin/users`

#### Customer Lifecycle Management

```
SIGNUP → EMAIL VERIFICATION → FREE TIER → UPGRADE → ACTIVE → [CANCEL/CHURN]
                                                              ↓
                                                      WIN-BACK CAMPAIGN
```

#### Customer Search & Filter

Available at `/admin/customers`:

| Filter | Options |
|--------|---------|
| Plan Tier | Free, Premium, Elite, Vendor, White-Label |
| Status | Active, Inactive, Suspended, Cancelled |
| Registration Date | Date range picker |
| Country | Auto-detected or manually set |
| Event Type | Wedding, Baptism, Party, Corporate |

#### Viewing a Customer Profile (`/admin/customers/[id]`)

The customer detail page shows:

- **Account Info:** Name, email, phone, registration date, last login
- **Plan & Billing:** Current tier, billing cycle, next renewal, Stripe customer ID
- **Events:** All projects created with status, event date, guest count
- **Orders:** Full order history with amounts and statuses
- **Support History:** All tickets filed by this customer
- **Activity Log:** Login history, feature usage, last activity timestamp

#### Admin Actions on Customer Accounts

| Action | How | Notes |
|--------|-----|-------|
| Change Plan | Edit plan tier dropdown | Triggers Stripe subscription update |
| Suspend Account | Toggle account status | Blocks login, preserves data |
| Reset Password | Send reset email | Link expires in 24 hours |
| Impersonate User | "Login as" button (super_admin only) | Audit-logged with timestamp |
| Delete Account | Soft delete → 30-day grace | GDPR: Full erasure on request |
| Export User Data | GDPR data export button | Generates ZIP with all user data |
| Add Internal Note | Notes tab | Visible only to admin staff |

#### Staff / Admin Users (`/admin/users`)

- Create, edit, suspend admin staff accounts
- Assign roles: `ADMIN`, `SUPPORT_AGENT`, `SALES_AGENT`, `CONTENT_MANAGER`
- Custom permission overrides at `/admin/users/permissions`
- Role-permission matrix is editable — changes apply immediately with cache invalidation

---

### 4.2 Order & Invoice Management

**Route:** `/admin/orders` | `/admin/invoices`

#### Order Flow

```
CUSTOMER CHECKOUT
      │
      ▼
ORDER CREATED (status: PENDING)
      │
      ├── Payment Success ──→ CONFIRMED ──→ PROCESSING ──→ COMPLETED
      │
      └── Payment Failed ──→ FAILED (retry link sent)
                         └── CANCELLED (after 48h no retry)
```

#### Order Status Definitions

| Status | Meaning | Admin Action |
|--------|---------|--------------|
| `PENDING` | Awaiting payment | Monitor, send reminder if > 1 hour |
| `CONFIRMED` | Payment received | Auto-activates plan feature |
| `PROCESSING` | Manual fulfillment in progress | Update when done |
| `COMPLETED` | Fully delivered | No action needed |
| `CANCELLED` | Voided before completion | Issue refund if payment taken |
| `REFUNDED` | Money returned | Stripe refund processed |
| `DISPUTED` | Chargeback filed | Escalate to finance team |

#### Managing an Order (`/admin/orders/[id]`)

1. **View full order details:** Items, pricing, discounts, taxes (VAT 25% for SE)
2. **Edit order** (`/admin/orders/[id]/edit`): Adjust quantities, apply manual discount, change status
3. **Generate Invoice:** Auto-generates PDF with Org.nr, Moms, invoice number
4. **Send Invoice Email:** One-click send to customer email on file
5. **Add Order Note:** Internal notes visible only to admin
6. **Process Refund:** Partial or full, triggers Stripe refund API

#### Swedish Market Invoice Requirements

Every invoice must include:
- **Org.nr** (Organisation number)
- **Moms** (VAT): 25% for Swedish customers
- Sequential **invoice number**
- **F-skatt** status if applicable
- Payment terms (default: 30 days)

Invoices are auto-generated at `/admin/invoices` and available as PDF download.

---

### 4.3 Vendor & Venue Management

**Route:** `/admin/vendors` | `/admin/venues`

#### Vendor Application Workflow

```
VENDOR SUBMITS APPLICATION
          │
          ▼
   STATUS: PENDING_REVIEW
          │
    Admin Review ──────────────────────────────────────┐
          │                                            │
    ┌─────┴──────┐                              ┌──────┴──────┐
    │  APPROVED  │                              │  REJECTED   │
    └─────┬──────┘                              └──────┬──────┘
          │                                            │
   Profile Published                         Rejection email sent
   in Vendor Directory                       with reason & reapply link
```

#### Vendor Review Checklist

When reviewing a vendor application at `/admin/vendors`:

- [ ] Business name and contact info verified
- [ ] Service category correctly assigned
- [ ] Portfolio images reviewed (no inappropriate content)
- [ ] Pricing information present
- [ ] Geographic service area set
- [ ] Business registration or legitimacy checked (for SE: Bolagsverket)

#### Vendor Status Management

| Status | Description | Action |
|--------|-------------|--------|
| `PENDING` | Application submitted, under review | Review and approve/reject |
| `APPROVED` | Active in directory | Monitor reviews, handle reports |
| `REJECTED` | Application denied | Can reapply after 30 days |
| `SUSPENDED` | Temporarily removed | Investigate complaint, restore or permanently ban |
| `BANNED` | Permanently removed | Document reason in internal note |

#### Venue Management (`/admin/venues`)

- Add, edit, and remove venue listings
- Assign venue to geographic region
- Mark venue capacity, catering options, indoor/outdoor
- Link to vendor profile if vendor-owned venue
- Toggle visibility (published/unpublished)

#### Vendor Review Moderation (`/admin/vendors/reviews`)

- View all customer reviews for all vendors
- Flag reviews for investigation
- Remove reviews that violate platform policy
- Vendor can dispute — admin has final say
- Automatically score-weight: reviews older than 12 months decay in influence

---

### 4.4 Lead Management & CRM

**Route:** `/admin/leads`

#### Lead Sources

Leads enter the system from:
1. **Contact Forms** on the public website (configured at `/admin/leads/forms`)
2. **Live Chat** conversations escalated to lead
3. **Vendor Inquiry** forms
4. **Manual Entry** by Sales Agent
5. **Imported CSV** via bulk import

#### Lead Pipeline Stages

```
NEW LEAD
   │
   ▼
CONTACTED ──→ QUALIFIED ──→ PROPOSAL SENT ──→ NEGOTIATING ──→ CONVERTED (→ Order)
   │                                                                │
   └──────────────────────── LOST ◄──────────────────────────────┘
                          (with reason)
```

**Pipeline Board:** `/admin/leads/pipeline` — Kanban-style drag-and-drop management.

#### Lead Detail Actions (`/admin/leads/[id]`)

| Action | Description |
|--------|-------------|
| Assign Agent | Route lead to specific sales agent |
| Add Note | Internal note with timestamp |
| Log Activity | Call, email, meeting, demo |
| Change Stage | Move through pipeline |
| Convert to Order | Creates order from lead data |
| Merge Duplicates | Merge with detected duplicate leads |
| Score | Auto-scored by recency + engagement; manual override available |

#### Lead Analytics (`/admin/leads/analytics`)

- **Conversion funnel:** Visualizes drop-off at each stage
- **Source breakdown:** Which form/channel generates most leads
- **Agent performance:** Leads assigned vs. converted per agent
- **Time-to-close:** Avg. days from new to converted
- **Lost reasons:** Pie chart of most common rejection reasons

#### Duplicate Detection (`/admin/leads/duplicates`)

- System auto-detects duplicates by email + phone combination
- Review detected pairs and merge or dismiss
- Merge preserves all notes, activities, and history from both records

---

### 4.5 Support & Ticket System

**Route:** `/admin/tickets`

#### Ticket Lifecycle

```
CUSTOMER SUBMITS TICKET (email / portal / live chat)
            │
            ▼
      TICKET CREATED (status: OPEN)
            │
     Agent Assigned ──────────────────────────────────┐
            │                                         │
     FIRST RESPONSE                            AUTO-ESCALATED
     (target: < 4 hours)                  (if no response in 8 hrs)
            │
     ┌──────┴───────────────────┐
     │                          │
  PENDING_CUSTOMER           IN_PROGRESS
  (awaiting reply)           (agent working)
     │                          │
     └────────────┬─────────────┘
                  │
            RESOLVED
            (target: < 24 hours)
                  │
           CLOSED (after 48h no reply from customer)
```

#### Ticket Priority Levels

| Priority | Criteria | Response SLA | Resolution SLA |
|----------|----------|--------------|----------------|
| 🔴 URGENT | Payment issue, account locked, data loss | 1 hour | 4 hours |
| 🟠 HIGH | Feature broken, billing question | 4 hours | 12 hours |
| 🟡 MEDIUM | How-to question, UI issue | 8 hours | 24 hours |
| 🟢 LOW | Feature request, general feedback | 24 hours | 72 hours |

#### Working a Ticket (`/admin/tickets/[id]`)

1. **Review ticket context:** Read full conversation thread
2. **Check customer profile:** Click customer name to see plan tier and history
3. **Use Canned Responses:** Pre-written replies at `/admin/tickets/canned-responses`
4. **Internal Notes:** Add private notes for team coordination (not visible to customer)
5. **Escalate:** Re-assign to senior agent or admin
6. **Merge:** Combine duplicate tickets from same customer
7. **Resolve:** Mark resolved and send closing message
8. **CSAT Survey:** Auto-sent 24 hours after ticket closes

#### Live Chat Management (`/admin/tickets/chat`)

- Real-time chat via Socket.io
- Queue view: shows all active chats with wait time
- Agent availability toggle (online/away/offline)
- Chat history saved to ticket system automatically
- Transfer chat to another agent
- Escalate to ticket if resolution needed

#### Canned Responses (`/admin/tickets/canned-responses`)

Manage a library of pre-written responses organized by category:
- Account & Billing
- Technical Issues
- Plan Upgrades / Downgrades
- Vendor Questions
- General FAQs

Create new canned responses with `{{customer_name}}`, `{{plan_tier}}`, `{{order_id}}` variables.

#### Support Analytics (`/admin/tickets/analytics`)

- **Volume by day/week:** Ticket inflow trend
- **Resolution time histogram:** Distribution of close times
- **CSAT scores:** Average satisfaction by agent and overall
- **Category breakdown:** Most common ticket types
- **Agent workload:** Open tickets per agent

---

### 4.6 Content Management

**Route:** `/admin/content`

#### Blog Management (`/admin/content/blog`)

**Workflow for publishing a blog post:**

```
DRAFT → REVIEW → SCHEDULED / PUBLISHED
```

| Action | Steps |
|--------|-------|
| Create Post | Click "+ New Post" → Rich text editor opens |
| SEO Settings | Set meta title, description, og:image, slug |
| Categories | Assign from `/admin/content/blog-categories` |
| Schedule | Set future publish date/time |
| Publish | Toggle to "Published" — live immediately |
| Unpublish | Toggle back to draft — removes from public site |

#### FAQ Management (`/admin/content/faq`)

- Global FAQs shown on marketing pages and help center
- Service-specific FAQs managed at `/admin/services/[slug]`
- Rich text editor with category grouping
- Drag-and-drop reorder
- Toggle active/inactive per FAQ

#### Legal Pages (`/admin/content/legal`)

Manage legally required content at `/admin/content/legal`:

| Page | Slug | Review Frequency |
|------|------|-----------------|
| Terms of Service | `terms-of-service` | Annually + after major changes |
| Privacy Policy | `privacy-policy` | Annually + GDPR updates |
| Cookie Policy | `cookie-policy` | Annually |
| Refund Policy | `refund-policy` | Quarterly |
| GDPR Notice | `gdpr-notice` | After any regulatory update |

**⚠️ Important:** Legal page changes should be reviewed by legal counsel before publishing. A version history is automatically maintained.

#### Testimonials (`/admin/content/testimonials`)

- Add customer testimonials for the marketing homepage
- Include customer name, event type, optional photo, star rating
- Toggle featured/non-featured
- Reorder by drag-and-drop

#### Ticker / Announcement Bar (`/admin/content/ticker`)

- Configure the scrolling announcement bar at top of public site
- Multiple tickers with schedule dates
- Supports plain text and links
- Enable/disable per ticker item

---

### 4.7 Marketing & Campaigns

**Route:** `/admin/marketing`

#### Campaign Types

| Type | Description | Use Case |
|------|-------------|----------|
| `EMAIL` | Batch email to subscribers | Newsletter, promotions |
| `SMS` | Text message blast | Flash sales, event reminders |
| `PUSH` | Web push notifications | Feature announcements |

#### Creating an Email Campaign (`/admin/marketing/campaigns/new`)

**Step-by-step workflow:**

1. **Name & Type:** Set internal name, select Email/SMS/Push
2. **Audience:** Filter recipients by plan tier, country, event type, registration date
3. **Template:** Choose from saved templates at `/admin/marketing/templates` or build new
4. **Content:** Edit in rich-text email editor with variable substitution
5. **Preview:** Send test email to your own address
6. **Schedule:** Send now or schedule for specific date/time
7. **Review:** Check estimated recipient count before confirming send

#### Campaign Status Flow

```
DRAFT → SCHEDULED → SENDING → SENT
                              │
                         ANALYTICS AVAILABLE
                         (opens, clicks, bounces, unsubscribes)
```

#### Campaign Analytics (`/admin/marketing/campaigns/[id]`)

| Metric | Description | Benchmark |
|--------|-------------|-----------|
| Delivery Rate | % successfully delivered | > 98% |
| Open Rate | % of delivered that were opened | > 25% |
| Click Rate | % of openers who clicked | > 3% |
| Unsubscribe Rate | % who unsubscribed | < 0.5% |
| Bounce Rate | Hard + soft bounces | < 2% |

#### Newsletter Management (`/admin/marketing/newsletter`)

- View all newsletter subscribers
- Export subscriber list (CSV)
- Manage subscription segments
- Set double opt-in on/off in settings
- View unsubscribes and reasons

#### Email Templates (`/admin/marketing/templates`)

- Create reusable HTML/MJML email templates
- Variable placeholders: `{{first_name}}`, `{{plan}}`, `{{event_date}}`, etc.
- Preview in desktop and mobile view
- Duplicate and edit existing templates
- Mark templates as archived when no longer in use

---

### 4.8 Appearance & Theme Control

**Route:** `/admin/appearance`

#### Header Configuration (`/admin/appearance/header`)

**What you can control:**
- Logo upload (PNG/SVG, max 1MB)
- Header background color and transparency
- Navigation menu items and order
- CTA button text and link
- Sticky header behavior
- Mobile hamburger menu style

**Menu Management** (`/admin/appearance/header/menu`):
- Add, edit, remove menu items
- Set internal link or external URL
- Create dropdown submenus
- Drag-and-drop reorder
- Show/hide per user login state (logged-in vs. anonymous)

#### Footer Configuration (`/admin/appearance/footer`)

- Column layout (2, 3, or 4 columns)
- Logo display and size
- Social media links (Instagram, Facebook, Pinterest, TikTok, LinkedIn)
- Widget columns: links, contact info, newsletter signup
- Copyright text
- Footer color scheme

**Footer Presets** (`/admin/appearance/footer/components/PresetGallery`):
- Select from pre-built footer designs
- Apply preset → customise on top

#### Theme Management (`/admin/appearance/themes`)

- View all available themes
- Preview theme before activating
- Activate theme (live immediately after confirmation)
- Theme Customize (`/admin/appearance/themes/customize`):
  - Primary / secondary / accent colors
  - Font family (Inter for SE/EN, Cairo for AR)
  - Border radius style (sharp / soft / rounded)
  - Button style (filled / outlined / ghost)
  - Spacing density (compact / default / relaxed)

**⚠️ Theme changes affect the public-facing website immediately. Always preview before activating.**

#### Landing Page Builder

Manage marketing landing pages with a drag-and-drop block builder:
- Add blocks from library (hero, features, pricing, testimonials, FAQ, CTA)
- Edit block content inline
- Reorder blocks via drag-and-drop
- Preview on desktop / tablet / mobile
- Publish or keep as draft
- SEO settings per page (title, description, canonical URL)

---

### 4.9 Services & Catalog Management

**Route:** `/admin/services`

#### Service Setup Workflow

```
CREATE CATEGORY → CREATE SERVICE → CONFIGURE PACKAGES
                                         │
                               ┌─────────┴──────────┐
                               │                    │
                        ADD FEATURES          BUILD FORM
                        TO PACKAGES           (form-builder)
```

#### Service Categories (`/admin/services/categories`)

- Create categories (e.g., Wedding Planning, Photography, Catering)
- Assign icon and description
- Toggle active/inactive
- Nested subcategories supported

#### Service Configuration (`/admin/services/[slug]`)

For each service, configure:
- Name, slug, description
- Base pricing and currency (SEK, USD, BDT)
- Service-specific FAQs
- Linked packages (Basic, Premium, Elite)
- Gallery images
- SEO metadata

#### Form Builder (`/admin/services/[slug]/form-builder`)

Build custom intake forms for each service:
- **Drag-and-drop fields:** Text, email, phone, date, select, checkbox, file upload
- **Organized in Tabs:** Group related fields into tabs
- **Field Validation:** Required, min/max length, regex patterns
- **Conditional Logic:** Show/hide fields based on previous answers
- **Order:** Reorder fields and tabs

#### Service Locations & Pricing (`/admin/service-locations`)

- Add geographic service areas
- Set location-based pricing multipliers
- State/regional fee configuration (`/admin/settings/state-fees`)

#### Package Management

For each service package:
- Name and description
- Price (monthly / annually with discount)
- Feature list (what's included / not included)
- Highlight / recommended badge toggle
- Sort order on pricing page

---

### 4.10 Wedding Planner Admin

**Route:** `/admin/planner`

#### Admin View of Customer Projects

Admins can see an overview of all active wedding planning projects:

| View | Data Shown |
|------|-----------|
| Project List | Customer name, event date, plan tier, guest count, completion % |
| Event Type Breakdown | Wedding / Baptism / Party / Corporate |
| Activity Feed | Recent project actions across platform |
| Feature Adoption | Which planner tools are being actively used |

#### Platform Usage Insights

Track which planning features are adopted:
- Guest Management usage rate
- RSVP response rates
- Seating chart usage
- Budget tracker usage
- Website builder usage

This data informs product development and feature prioritization.

---

## 5. Settings & Configuration Control

**Route:** `/admin/settings`

### Settings Map

```
/admin/settings
    ├── /payments          — Stripe, Swish, Klarna API keys, webhooks
    ├── /email             — SMTP / SendGrid / SES configuration
    ├── /media-storage     — AWS S3 bucket config, CloudFront CDN
    ├── /tracking          — Google Analytics, Facebook Pixel, GTM
    ├── /plugins           — Plugin marketplace management
    ├── /state-fees        — Tax and fee rules by region
    ├── /lists             — System and custom dropdown lists
    └── /data              — Export, import, and reset tools
```

### Payment Configuration (`/admin/settings/payments`)

| Gateway | Purpose | Region |
|---------|---------|--------|
| Stripe | Card payments, subscriptions, invoices | Global |
| Swish | Mobile-to-mobile payments | Sweden only |
| Klarna | Buy Now Pay Later / installments | Sweden + EU |

**Setup steps for each gateway:**
1. Enter API keys (test vs. live toggle)
2. Configure webhook endpoints
3. Set default currency (SEK for SE, USD for global)
4. Enable/disable per gateway
5. Test with test card before going live

### Email Configuration (`/admin/settings/email`)

Configure transactional email provider:
- **SMTP:** Manual server setup (for custom providers)
- **SendGrid:** API key + sender domain verification
- **AWS SES:** Region, access key, verified sender domain

Email types configured:
- Welcome email (on signup)
- Order confirmation
- Invoice delivery
- Password reset
- Ticket confirmation
- RSVP confirmation to guests
- Campaign sends

**Email Test:** Always send a test email after configuration changes.

### Media Storage (`/admin/settings/media-storage`)

- **S3 Bucket:** Name, region, access key, secret key
- **CloudFront:** Distribution domain for CDN delivery
- **Max upload size:** Configurable per file type
- **Allowed types:** Image (jpg/png/webp), PDF, Video (mp4)
- **Presigned URLs:** Auto-generated for direct browser-to-S3 upload

### Analytics & Tracking (`/admin/settings/tracking`)

Configure marketing pixels and analytics:
- Google Analytics 4 (GA4) — Measurement ID
- Facebook Pixel — Pixel ID
- Google Tag Manager — Container ID
- Custom scripts — Injected in `<head>` or `<body>`

### Plugin System (`/admin/settings/plugins`)

Ceremoney supports installable plugins:

| Action | Description |
|--------|-------------|
| Browse | View available plugins in marketplace |
| Install | Upload .zip or install from registry |
| Activate/Deactivate | Toggle without losing settings |
| Configure | Plugin-specific settings page |
| Update | One-click update to latest version |
| Uninstall | Remove plugin and optionally purge data |

**Active plugin settings** accessible at `/admin/settings/plugins/[slug]`.

### Custom Lists (`/admin/settings/lists`)

Manage dropdown values used across the platform:

**System Lists** (predefined, editable values):
- Event types
- Guest dietary options
- Countries and regions
- Vendor categories

**Custom Lists** (admin-created):
- Create new list with key name
- Add/edit/remove/reorder items
- Lists available in form builder and planner features

---

## 6. Reporting & Analytics

### Revenue Reporting

**Path:** Admin Dashboard → Revenue Chart, or `/admin/orders` with export

| Report | Frequency | Data Included |
|--------|-----------|---------------|
| MRR Report | Monthly | Recurring revenue by plan tier |
| Order Report | Daily/Weekly | New orders, amounts, statuses |
| Refund Report | Monthly | Refunds issued, reasons |
| VAT Report | Monthly | Swedish Moms (25%) collected |
| Lifetime Value | Quarterly | Average LTV per customer segment |

### User & Growth Reporting

| Metric | Where to Find | Export |
|--------|--------------|--------|
| New signups | Dashboard stat card → click to drill | CSV |
| Churn (cancellations) | Orders > filter CANCELLED | CSV |
| Plan distribution | Users > filter by plan | CSV |
| Geographic distribution | Users > country column | CSV |

### Lead & Sales Reporting

**Path:** `/admin/leads/analytics`

- Funnel conversion rates by stage
- Lead source attribution
- Sales agent performance comparison
- Time-series: leads received vs. converted per month

### Support Reporting

**Path:** `/admin/tickets/analytics`

- Ticket volume by week
- Average resolution time by category
- CSAT score trends
- Top ticket categories (most common issues)
- Agent performance

### Marketing Reporting

**Path:** `/admin/marketing/campaigns/[id]`

Per-campaign metrics + aggregate trend view across all campaigns:
- Best-performing subject lines
- Best send day/time analysis
- List growth trend (subscribers)

### Exporting Data

**Path:** `/admin/settings/data`

| Export Type | Format | Includes |
|-------------|--------|---------|
| Full Customer Data | CSV/JSON | All customer records |
| Orders | CSV | All orders with status, amounts |
| Leads | CSV | All leads with stage and notes |
| Subscribers | CSV | Newsletter list |
| GDPR User Export | ZIP | Single user's complete data |

---

## 7. Maintenance & Health Procedures

### Daily Health Checks

Every operational day, the on-duty admin should verify:

1. **Platform Uptime:** Check status page / Vercel dashboard
2. **Failed Payments:** Orders in `FAILED` status → trigger retry emails
3. **Open Tickets:** Ensure no urgent ticket is older than 1 hour unassigned
4. **Pending Vendor Applications:** Review queue at `/admin/vendors`
5. **Email Delivery:** Check SendGrid/SES bounce rate dashboard
6. **Error Log:** Review Vercel error logs for 5XX spikes

### Weekly Maintenance Tasks

| Task | How | Owner |
|------|-----|-------|
| Database Backup Verification | Check RDS automated backups | DevOps |
| Spam Review | Check flagged content in blog comments / testimonials | Content Manager |
| Stale Lead Cleanup | Archive leads not touched in 90 days | Sales Agent |
| Duplicate Lead Merge | Process queue at `/admin/leads/duplicates` | Sales Agent |
| Blog Content Review | Review scheduled posts queue | Content Manager |
| User Report Review | Check for abusive vendor/customer reports | Admin |

### Monthly Maintenance Tasks

| Task | How | Owner |
|------|-----|-------|
| Plugin Updates | `/admin/settings/plugins` → update available | Super Admin |
| Legal Page Review | Review for regulatory changes | Super Admin |
| Permission Audit | Review role permissions, revoke stale access | Super Admin |
| Financial Reconciliation | Match orders vs. Stripe payouts | Finance |
| Churn Analysis | Identify at-risk customers | Sales/CS |
| Performance Review | Analyze slow queries in Prisma Studio | DevOps |
| S3 Storage Audit | Review unused files, set lifecycle rules | DevOps |

### Database Management

**Prisma Studio:** `npm run db:studio` (dev) or connect to production via SSH tunnel.

**Regular Tasks:**
- Verify indexes on high-traffic tables (`Event`, `Order`, `Lead`, `VendorProfile`)
- Check for long-running queries
- Monitor connection pool usage
- Vacuum and analyze tables (PostgreSQL maintenance)

**Schema Changes:**
```bash
# After any schema change:
npm run db:migrate   # Generate and apply migration
npm run db:generate  # Regenerate Prisma client
npm run build        # Verify build passes
```

### Cache Management

When content changes are not reflecting live:

```
1. Revalidate by path: Admin auto-triggers revalidatePath() on save
2. Manual cache clear: Available in /admin/settings/data
3. CDN cache: CloudFront → Create Invalidation (for media)
4. Permission cache: Clears automatically every 5 minutes; 
                     manual clear available in admin-auth.ts
```

---

## 8. End-to-End Admin Journey (Scenario Walkthroughs)

### Scenario A: New Vendor Onboarding

```
1. Vendor submits application at /register/vendor
2. Admin receives email notification: "New vendor application"
3. Admin navigates to /admin/vendors → filter: PENDING
4. Opens vendor profile → reviews all details
5. Checks portfolio images for quality/appropriateness
6. Verifies business legitimacy (Bolagsverket for SE vendors)
7. Decision:
   ├── APPROVE: Click "Approve" → vendor email sent → profile published
   └── REJECT: Click "Reject" → add rejection reason → email sent with reason
8. If APPROVE: Vendor appears in /vendors directory immediately
9. Admin adds note: "Approved on [date] by [admin name]"
```

### Scenario B: Customer Billing Issue

```
1. Customer submits ticket: "I was charged twice"
2. Support agent receives ticket at /admin/tickets → priority: HIGH
3. Opens ticket → reads description
4. Clicks customer name → views /admin/customers/[id]
5. Checks Orders tab → sees two orders for same plan
6. Navigates to /admin/orders/[id] for duplicate order
7. Verifies with Stripe dashboard (linked from order)
8. Issues refund: Order detail → "Issue Refund" → Full refund → Confirm
9. Returns to ticket → uses canned response "Duplicate charge resolved"
10. Adds internal note with order IDs for finance reconciliation
11. Resolves ticket → customer receives closing email + CSAT survey
```

### Scenario C: Running a Promotional Campaign

```
1. Marketing manager goes to /admin/marketing/campaigns/new
2. Sets name: "April Easter Promotion", type: EMAIL
3. Audience: Plan = FREE, Country = Sweden, Registered < 6 months ago
4. Selects template: "Upgrade Promo" from /admin/marketing/templates
5. Edits content: Updates headline, discount code, CTA button
6. Sends test email to marketing@ceremoney.com
7. Reviews test email in inbox — checks rendering on mobile
8. Schedules send: Tuesday 10:00 AM CET
9. On send day: system auto-processes scheduled campaign
10. 24 hours later: checks /admin/marketing/campaigns/[id] analytics
11. Reviews open rate, click rate, new upgrades attributed
```

### Scenario D: Publishing a Blog Post

```
1. Content manager goes to /admin/content/blog → "+ New Post"
2. Writes post in rich text editor
3. Sets: title, slug (auto-generated, editable), categories
4. Adds featured image (uploads to S3)
5. Fills SEO tab: meta title, meta description, og:image
6. Previews post in full-page preview
7. Sets status to PUBLISHED or schedules for future date
8. Post appears on public blog (/blog/[slug]) immediately if published
9. Shares URL in company Slack for internal review
```

### Scenario E: Handling a GDPR Data Deletion Request

```
1. Customer emails: "Please delete all my data (GDPR Article 17)"
2. Admin navigates to /admin/customers → search by email
3. Opens customer profile
4. First: exports customer data as GDPR ZIP (send to customer if requested)
5. Verifies no active subscriptions or pending invoices
6. If active subscription: cancel in Stripe first
7. Clicks "Delete Account" → system initiates 30-day soft delete
8. After 30 days: system auto-purges all personal data from database
9. Admin logs action in internal notes with date, request reference
10. Replies to customer confirming data deletion schedule
11. Maintains deletion log for 12 months (audit trail, no personal data)
```

---

## 9. Emergency & Escalation Procedures

### Severity Levels

| Severity | Definition | Response Time | Escalation |
|----------|-----------|---------------|------------|
| P0 — Critical | Platform down, all users affected | Immediate | CTO + DevOps on-call |
| P1 — Major | Core feature broken, payments failing | 30 minutes | Senior Dev + Admin |
| P2 — Significant | Non-critical feature broken, workaround exists | 2 hours | Dev team |
| P3 — Minor | UI/UX issue, cosmetic bug | 24 hours | Normal ticket queue |

### P0 Response Procedure

```
1. Confirm the incident (check Vercel, RDS health, CloudFront)
2. Post incident status in #incident-response Slack channel
3. Update public status page immediately (even if brief: "Investigating")
4. Begin diagnosis:
   ├── Check Vercel deployment logs for recent deploys
   ├── Check database connectivity and query times
   └── Check third-party services (Stripe, SendGrid, AWS)
5. Rollback if recent deploy caused issue: Vercel → Deployments → Rollback
6. Communicate ETA to affected users (use /admin/content/ticker for banner)
7. Resolve and post-mortem within 48 hours
```

### Payment Failure Emergency

If Stripe webhook stops processing:

1. Check `/admin/orders` for spike in PENDING/FAILED orders
2. Verify Stripe webhook endpoint is live and responding 200
3. Replay failed webhook events from Stripe dashboard
4. Manually update affected order statuses if webhook replay fails
5. Notify affected customers with resolution timeline

### Data Breach Response

```
1. Immediately revoke all API keys potentially exposed
2. Force logout all admin sessions (rotate NextAuth secret)
3. Notify legal/compliance team within 1 hour
4. Assess scope: which data, how many users affected
5. GDPR requires notification to data authority within 72 hours
6. Notify affected users with clear explanation and actions taken
7. Document everything for post-incident report
```

---

## 10. Admin Checklist — Daily / Weekly / Monthly

### Daily Checklist ✓

```
□ Check dashboard for anomalies (revenue dips, spike in tickets)
□ Review overnight orders — resolve any FAILED status
□ Process urgent support tickets (P0/P1 priority first)
□ Review pending vendor applications (target: same-day response)
□ Check email delivery health in SendGrid/SES
□ Verify no unassigned urgent tickets older than 2 hours
□ Scan for system errors in Vercel deployment logs
□ Check live chat queue — ensure coverage during business hours
```

### Weekly Checklist ✓

```
□ Run lead pipeline review — update stages, archive stale
□ Merge detected duplicate leads
□ Review scheduled campaign queue (upcoming 7 days)
□ Audit new vendor reviews for policy violations
□ Check plugin update notifications
□ Review content publishing schedule (blog, FAQs)
□ Export weekly orders report for finance team
□ Update announcement ticker for any promotions
□ Run npm run lint / tsc --noEmit on staging (zero errors target)
```

### Monthly Checklist ✓

```
□ Generate and send monthly invoice report to accountant
□ Calculate Swedish Moms (25% VAT) for the period
□ Review and update pricing if needed (admin dashboard editable)
□ Conduct permission audit — remove stale admin accounts
□ Review churn report — identify win-back opportunities
□ Update legal pages if regulatory changes occurred
□ Review plugin versions — test updates on staging before production
□ Database backup verification — restore test to staging
□ S3 storage review — identify orphaned files
□ Performance review — slow query analysis via Prisma Studio
□ Team retrospective — review support metrics, improve processes
□ Update this documentation if any processes changed
```

---

## Appendix A — Admin URL Quick Reference

| Section | URL |
|---------|-----|
| Dashboard | `/admin` |
| Customers | `/admin/customers` |
| Orders | `/admin/orders` |
| Invoices | `/admin/invoices` |
| Vendors | `/admin/vendors` |
| Venues | `/admin/venues` |
| Leads | `/admin/leads` |
| Lead Pipeline | `/admin/leads/pipeline` |
| Lead Analytics | `/admin/leads/analytics` |
| Tickets | `/admin/tickets` |
| Live Chat | `/admin/tickets/chat` |
| Ticket Analytics | `/admin/tickets/analytics` |
| Canned Responses | `/admin/tickets/canned-responses` |
| Blog | `/admin/content/blog` |
| FAQs | `/admin/content/faq` |
| Legal Pages | `/admin/content/legal` |
| Testimonials | `/admin/content/testimonials` |
| Ticker | `/admin/content/ticker` |
| Campaigns | `/admin/marketing/campaigns` |
| Newsletter | `/admin/marketing/newsletter` |
| Templates | `/admin/marketing/templates` |
| Header | `/admin/appearance/header` |
| Footer | `/admin/appearance/footer` |
| Themes | `/admin/appearance/themes` |
| Services | `/admin/services` |
| Categories | `/admin/services/categories` |
| Locations | `/admin/service-locations` |
| Planner Overview | `/admin/planner` |
| Users & Staff | `/admin/users` |
| Permissions | `/admin/users/permissions` |
| Profile | `/admin/profile` |
| Settings | `/admin/settings` |
| Payments Setup | `/admin/settings/payments` |
| Email Setup | `/admin/settings/email` |
| Storage Setup | `/admin/settings/media-storage` |
| Tracking | `/admin/settings/tracking` |
| Plugins | `/admin/settings/plugins` |
| Custom Lists | `/admin/settings/lists` |
| Data Tools | `/admin/settings/data` |

---

## Appendix B — Keyboard Shortcuts

Available via the keyboard shortcuts dialog (press `?` in admin dashboard):

| Shortcut | Action |
|----------|--------|
| `G D` | Go to Dashboard |
| `G C` | Go to Customers |
| `G O` | Go to Orders |
| `G T` | Go to Tickets |
| `G L` | Go to Leads |
| `G V` | Go to Vendors |
| `G S` | Go to Settings |
| `N O` | New Order |
| `N T` | New Ticket |
| `N L` | New Lead |
| `?` | Show keyboard shortcuts |
| `Esc` | Close modal / go back |

---

## Appendix C — Role Permission Quick Reference

| Permission Key | Admin | Support | Sales | Content |
|----------------|:-----:|:-------:|:-----:|:-------:|
| `manage_users` | ✅ | ❌ | ❌ | ❌ |
| `manage_orders` | ✅ | 👁 | ✅ | ❌ |
| `manage_vendors` | ✅ | ❌ | ✅ | ❌ |
| `manage_tickets` | ✅ | ✅ | ❌ | ❌ |
| `manage_content` | ✅ | ❌ | ❌ | ✅ |
| `manage_campaigns` | ✅ | ❌ | ✅ | ❌ |
| `manage_appearance` | ✅ | ❌ | ❌ | ✅ |
| `manage_settings` | ✅ | ❌ | ❌ | ❌ |
| `manage_plugins` | ✅ | ❌ | ❌ | ❌ |
| `view_reports` | ✅ | ❌ | ✅ | ❌ |
| `manage_leads` | ✅ | ❌ | ✅ | ❌ |
| `export_data` | ✅ | ❌ | ❌ | ❌ |

Custom permission overrides are managed at `/admin/users/permissions`.

---

*Document maintained by Ceremoney Operations Team. Update after any platform process change.*
