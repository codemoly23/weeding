# Lead Management System Specification

> **Document Version:** 1.4
> **Created:** February 4, 2026
> **Updated:** February 4, 2026
> **Status:** Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅ | Phase 4 Partial

---

## ⚠️ STRICT IMPLEMENTATION GUIDELINES

> **CRITICAL:** These rules MUST be followed for every task in this specification.

### Mandatory Pre-Implementation Analysis

Before starting ANY task from this document:

1. **Codebase Analysis (Required)**
   - Analyze current codebase structure
   - Identify existing patterns, utilities, and components
   - Find related code that will be affected
   - Check for reusable components/functions
   - Identify potential conflicts

### Full-Stack Implementation Requirement

**NO UI MOCKUPS ONLY.** Every task MUST include complete implementation:

| Layer | Must Implement |
|-------|----------------|
| **Database** | Prisma schema, migrations, indexes |
| **API** | Route handlers, validation, error handling |
| **Backend** | Business logic, services, utilities |
| **Frontend** | React components, hooks, state management |
| **UI** | Fully functional interface (not mockups) |
| **Types** | TypeScript interfaces and types |
| **Integration** | Connect all layers end-to-end |

### Post-Task Verification Checklist

After completing EACH task, verify:

```
□ Database schema created/updated
□ Prisma migration generated and applied
□ API endpoints functional (test with curl/Postman)
□ Frontend components rendering correctly
□ Forms submitting data successfully
□ Data flowing from UI → API → Database
□ Error handling implemented
□ TypeScript types complete (no `any`)
□ Console errors resolved
□ Build passes without errors
```

### Codebase Cleanup Requirement

After completing work:

1. **Remove deprecated code** - Delete old/unused implementations
2. **Clean imports** - Remove unused imports
3. **Update exports** - Fix barrel files (index.ts)
4. **Remove dead code** - Functions/components no longer used
5. **Consistent patterns** - Refactor to match new patterns
6. **No backward-compatibility hacks** - Clean removal, not comments

### Task Completion Criteria

A task is ONLY complete when:

- [ ] Full-stack implementation done (DB → API → Frontend)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build succeeds
- [ ] Feature works end-to-end
- [ ] Verification checklist passed
- [ ] Old code cleaned up

---

## 1. Executive Summary

This document outlines the complete specification for building a Lead Management System (LMS) integrated with the LLCPad CMS. The system will capture leads from landing page forms, store them in a centralized database, and provide a comprehensive dashboard for managing, tracking, and converting leads into customers.

### 1.1 Industry Research Sources

This specification incorporates best practices from:
- [HubSpot Lead Management System Guide](https://blog.hubspot.com/sales/lead-management-system)
- [Monday.com Lead Management Software](https://monday.com/blog/crm-and-sales/lead-management-software/)
- [Salesforce Lead Management Best Practices](https://www.default.com/post/salesforce-lead-management)
- [Belkins B2B Lead Scoring System](https://belkins.io/blog/lead-scoring)
- [Gartner Lead Scoring with Intent Signals](https://www.gartner.com/en/digital-markets/insights/lead-scoring-intent-signals)
- [Highspot 2026 Lead Management Playbook](https://www.highspot.com/blog/lead-management/)

---

## 2. Business Requirements

### 2.1 Core Objectives
- Capture leads from multiple landing pages via Lead Form widgets
- Centralize all leads in a manageable admin dashboard
- Track lead journey through customizable pipeline stages
- Enable sales team to follow up and communicate with leads
- Convert qualified leads into registered customers
- Provide analytics and reporting on lead performance

### 2.2 User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Admin | View all captured leads in one place | I can manage and prioritize sales efforts |
| Sales Agent | Follow up with assigned leads | I can convert them to customers |
| Sales Agent | Log communication with leads | I can track interaction history |
| Admin | See conversion analytics | I can measure marketing effectiveness |
| Admin | Configure lead form fields | I can capture relevant information |
| Sales Agent | Convert a lead to customer | They can access services and dashboard |

---

## 3. System Architecture

### 3.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PUBLIC WEBSITE                               │
├─────────────────────────────────────────────────────────────────────┤
│  Landing Page 1    Landing Page 2    Landing Page 3    Service Page │
│       │                 │                 │                 │       │
│   [Lead Form]      [Lead Form]       [Lead Form]       [Lead Form]  │
│       │                 │                 │                 │       │
└───────┴─────────────────┴─────────────────┴─────────────────┴───────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      API: /api/leads          │
                    │   (Lead Capture Endpoint)     │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      PostgreSQL Database      │
                    │   (Leads, Activities, Notes)  │
                    └───────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD                              │
├─────────────────────────────────────────────────────────────────────┤
│  Lead List  │  Pipeline View  │  Lead Detail  │  Analytics  │ Settings│
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Module Structure

```
src/
├── app/
│   ├── api/
│   │   └── leads/
│   │       ├── route.ts              # GET (list), POST (create)
│   │       ├── [id]/
│   │       │   ├── route.ts          # GET, PATCH, DELETE single lead
│   │       │   ├── activities/
│   │       │   │   └── route.ts      # Lead activities
│   │       │   ├── notes/
│   │       │   │   └── route.ts      # Lead notes
│   │       │   └── convert/
│   │       │       └── route.ts      # Convert to customer
│   │       ├── export/
│   │       │   └── route.ts          # Export leads (CSV/Excel)
│   │       └── stats/
│   │           └── route.ts          # Analytics data
│   │
│   └── admin/
│       └── leads/
│           ├── page.tsx              # Lead list/table view
│           ├── pipeline/
│           │   └── page.tsx          # Kanban pipeline view
│           ├── [id]/
│           │   └── page.tsx          # Lead detail page
│           ├── analytics/
│           │   └── page.tsx          # Lead analytics dashboard
│           └── settings/
│               └── page.tsx          # Lead form & pipeline settings
│
├── components/
│   └── admin/
│       └── leads/
│           ├── LeadTable.tsx         # Data table component
│           ├── LeadPipeline.tsx      # Kanban board component
│           ├── LeadDetail.tsx        # Lead detail view
│           ├── LeadActivityLog.tsx   # Activity timeline
│           ├── LeadNoteForm.tsx      # Add notes form
│           ├── LeadConvertModal.tsx  # Convert to customer modal
│           ├── LeadFilters.tsx       # Filter sidebar
│           └── LeadStats.tsx         # Analytics cards
│
├── lib/
│   └── leads/
│       ├── types.ts                  # TypeScript interfaces
│       ├── schemas.ts                # Zod validation schemas
│       ├── constants.ts              # Status, source constants
│       └── utils.ts                  # Helper functions
│
└── hooks/
    └── leads/
        ├── use-leads.ts              # Lead list hook
        ├── use-lead.ts               # Single lead hook
        └── use-lead-stats.ts         # Analytics hook
```

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      Lead       │       │  LeadActivity   │       │    LeadNote     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │──┐    │ id              │       │ id              │
│ firstName       │  │    │ leadId      ────│───────│ leadId      ────│──┐
│ lastName        │  │    │ type            │       │ content         │  │
│ email           │  │    │ description     │       │ createdBy    ───│──│──┐
│ phone           │  │    │ metadata        │       │ createdAt       │  │  │
│ company         │  │    │ createdBy    ───│───┐   │ updatedAt       │  │  │
│ status          │  │    │ createdAt       │   │   └─────────────────┘  │  │
│ source          │  │    └─────────────────┘   │                        │  │
│ score           │  │                          │   ┌─────────────────┐  │  │
│ assignedTo   ───│──│──────────────────────────│───│      User       │──┘  │
│ tags            │  │                          │   ├─────────────────┤     │
│ customFields    │  │                          │   │ id              │─────┘
│ convertedAt     │  │                          │   │ name            │
│ convertedToId ──│──│──────────────────────────┘   │ email           │
│ createdAt       │  │                              │ role            │
│ updatedAt       │  │                              └─────────────────┘
└─────────────────┘  │
                     │
                     │  ┌─────────────────┐
                     │  │  LeadFormConfig │
                     │  ├─────────────────┤
                     └──│ id              │
                        │ name            │
                        │ fields          │
                        │ successMessage  │
                        │ notifications   │
                        │ autoAssign      │
                        │ isActive        │
                        └─────────────────┘
```

### 4.2 Prisma Schema

```prisma
// Add to prisma/schema.prisma

// ============================================
// LEAD MANAGEMENT
// ============================================

enum LeadStatus {
  NEW           // Just captured
  CONTACTED     // Initial contact made
  QUALIFIED     // Meets criteria, potential customer
  PROPOSAL      // Sent proposal/quote
  NEGOTIATION   // In negotiation
  WON           // Converted to customer
  LOST          // Did not convert
  UNQUALIFIED   // Does not meet criteria
}

enum LeadSource {
  WEBSITE           // General website form
  LANDING_PAGE      // Specific landing page
  REFERRAL          // Referred by someone
  SOCIAL_MEDIA      // Social media campaigns
  GOOGLE_ADS        // Google advertising
  FACEBOOK_ADS      // Facebook/Meta advertising
  EMAIL_CAMPAIGN    // Email marketing
  COLD_OUTREACH     // Cold calling/emailing
  PARTNERSHIP       // Partner referral
  OTHER             // Other sources
}

enum LeadActivityType {
  STATUS_CHANGE     // Status was updated
  NOTE_ADDED        // Note was added
  EMAIL_SENT        // Email was sent
  CALL_MADE         // Phone call was made
  MEETING_SCHEDULED // Meeting was scheduled
  MEETING_COMPLETED // Meeting was completed
  DOCUMENT_SENT     // Document/proposal sent
  FOLLOW_UP         // Follow-up action
  ASSIGNED          // Lead was assigned
  CONVERTED         // Converted to customer
  CREATED           // Lead was created
}

model Lead {
  id              String       @id @default(cuid())

  // Contact Information
  firstName       String
  lastName        String?
  email           String
  phone           String?
  company         String?
  website         String?
  country         String?
  city            String?

  // Lead Qualification
  status          LeadStatus   @default(NEW)
  source          LeadSource   @default(WEBSITE)
  sourceDetail    String?      // e.g., specific landing page URL
  score           Int          @default(0)    // 0-100 lead score
  scoreHistory    Json?        // Track score changes over time
  scoreDecayDays  Int          @default(0)    // Days since last activity for decay
  priority        String       @default("MEDIUM") // LOW, MEDIUM, HIGH, URGENT

  // Engagement Tracking (for scoring)
  pageViews       Int          @default(0)    // Total page views
  lastPageViewed  String?      // Last page URL visited
  visitCount      Int          @default(1)    // Number of site visits
  lastActivityAt  DateTime     @default(now()) // For score decay calculation

  // Assignment
  assignedToId    String?
  assignedTo      User?        @relation("AssignedLeads", fields: [assignedToId], references: [id])
  assignedAt      DateTime?

  // Service Interest
  interestedIn    String[]     // Array of service slugs
  budget          String?      // Budget range
  timeline        String?      // When they want to start

  // Custom Data
  customFields    Json?        // Flexible custom field storage
  tags            String[]     // Tags for categorization

  // UTM Tracking
  utmSource       String?
  utmMedium       String?
  utmCampaign     String?
  utmTerm         String?
  utmContent      String?

  // Form Reference
  formConfigId    String?
  formConfig      LeadFormConfig? @relation(fields: [formConfigId], references: [id])

  // Conversion
  convertedAt     DateTime?
  convertedToId   String?      @unique
  convertedTo     User?        @relation("ConvertedLead", fields: [convertedToId], references: [id])
  convertedById   String?
  convertedBy     User?        @relation("ConvertedByUser", fields: [convertedById], references: [id])

  // Metadata
  ipAddress       String?
  userAgent       String?
  pageUrl         String?      // Page where form was submitted

  // Timestamps
  lastContactedAt DateTime?
  nextFollowUpAt  DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relations
  activities      LeadActivity[]
  notes           LeadNote[]

  @@index([status])
  @@index([source])
  @@index([assignedToId])
  @@index([email])
  @@index([createdAt(sort: Desc)])
  @@index([score(sort: Desc)])
  @@index([nextFollowUpAt])
}

model LeadActivity {
  id          String           @id @default(cuid())
  leadId      String
  lead        Lead             @relation(fields: [leadId], references: [id], onDelete: Cascade)

  type        LeadActivityType
  description String
  metadata    Json?            // Additional activity data

  createdById String?
  createdBy   User?            @relation("LeadActivityCreator", fields: [createdById], references: [id])
  createdAt   DateTime         @default(now())

  @@index([leadId])
  @@index([createdAt(sort: Desc)])
}

model LeadNote {
  id          String   @id @default(cuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  content     String   @db.Text
  isPinned    Boolean  @default(false)

  createdById String?
  createdBy   User?    @relation("LeadNoteCreator", fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([leadId])
  @@index([isPinned])
}

model LeadFormConfig {
  id              String   @id @default(cuid())
  name            String   // Internal name
  description     String?

  // Form Configuration
  fields          Json     // Field definitions
  submitButtonText String  @default("Submit")

  // Success Handling
  successMessage  String?
  successRedirect String?  // URL to redirect after submission

  // Notifications
  notifyEmails    String[] // Email addresses to notify
  notifyOnSlack   Boolean  @default(false)
  slackWebhook    String?

  // Auto-assignment
  autoAssignTo    String?  // User ID to auto-assign
  roundRobin      Boolean  @default(false) // Round-robin assignment

  // Default Values
  defaultSource   LeadSource @default(WEBSITE)
  defaultTags     String[]

  // Status
  isActive        Boolean  @default(true)

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  leads           Lead[]

  @@index([isActive])
}

// Add relations to existing User model
model User {
  // ... existing fields ...

  // Lead Management Relations
  assignedLeads     Lead[]         @relation("AssignedLeads")
  convertedLeads    Lead[]         @relation("ConvertedLead")
  leadsConverted    Lead[]         @relation("ConvertedByUser")
  leadActivities    LeadActivity[] @relation("LeadActivityCreator")
  leadNotes         LeadNote[]     @relation("LeadNoteCreator")
}
```

---

## 5. Lead Pipeline & Workflow

### 5.1 Default Pipeline Stages

```
┌─────────┐   ┌───────────┐   ┌───────────┐   ┌──────────┐   ┌─────────────┐   ┌─────┐
│   NEW   │ → │ CONTACTED │ → │ QUALIFIED │ → │ PROPOSAL │ → │ NEGOTIATION │ → │ WON │
└─────────┘   └───────────┘   └───────────┘   └──────────┘   └─────────────┘   └─────┘
     │              │               │               │               │
     └──────────────┴───────────────┴───────────────┴───────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   LOST / UNQUALIFIED  │
                        └───────────────────────┘
```

### 5.2 Status Definitions

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **NEW** | Fresh lead, not yet contacted | Contact, Assign, Disqualify |
| **CONTACTED** | Initial contact made | Qualify, Schedule Follow-up, Disqualify |
| **QUALIFIED** | Meets criteria, genuine interest | Send Proposal, Schedule Meeting |
| **PROPOSAL** | Proposal/quote sent | Follow-up, Negotiate, Close |
| **NEGOTIATION** | Active negotiation | Update Proposal, Close Won/Lost |
| **WON** | Successfully converted | Convert to Customer |
| **LOST** | Did not convert | Archive, Re-engage Later |
| **UNQUALIFIED** | Does not meet criteria | Archive |

### 5.3 Lead Scoring System (2026 Best Practices)

Modern lead scoring prioritizes **behavioral signals over demographics**. A mid-level manager who visits your website five times and engages with content scores higher than a C-level exec who visits once.

#### 5.3.1 Scoring Categories

**A. Demographic/Firmographic Score (Max 30 points)**
| Criteria | Points | Description |
|----------|--------|-------------|
| Email Provided | +5 | Basic contact info |
| Phone Provided | +10 | Direct contact method |
| Company Name | +5 | Business lead indicator |
| Country (Target Market) | +10 | BD, India, Pakistan, UAE = higher |

**B. Behavioral Score (Max 50 points)** ⭐ Most Important
| Criteria | Points | Description |
|----------|--------|-------------|
| Pricing Page Visit | +15 | High purchase intent |
| Service Page Visit | +5 | Interest signal |
| Multiple Page Views (5+) | +10 | Engaged prospect |
| Return Visitor | +10 | Continued interest |
| Downloaded Resource | +5 | Content engagement |
| Form Submission | +5 | Action taken |

**C. Intent/Qualification Score (Max 40 points)**
| Criteria | Points | Description |
|----------|--------|-------------|
| Budget Specified | +15 | Serious intent |
| Timeline < 1 month | +15 | Urgent need |
| Timeline 1-3 months | +10 | Near-term interest |
| High-value service (LLC, Amazon) | +10 | Revenue potential |
| Multiple services interested | +10 | Bigger opportunity |
| Referred by customer | +15 | Higher conversion rate |

#### 5.3.2 Score Decay (Critical for 2026)

Leads that remain inactive lose points over time:
| Inactivity Period | Score Decay |
|-------------------|-------------|
| 7 days | -5 points |
| 14 days | -10 points |
| 30 days | -20 points |
| 60 days | -30 points |
| 90 days | Reset to Cold |

**Score Decay Implementation:**
```typescript
// Daily cron job to decay scores
async function decayLeadScores() {
  const now = new Date();

  // 7-day decay
  await prisma.lead.updateMany({
    where: {
      lastActivityAt: { lt: subDays(now, 7) },
      scoreDecayApplied: { not: 7 }
    },
    data: { score: { decrement: 5 }, scoreDecayApplied: 7 }
  });
  // ... similar for 14, 30, 60, 90 days
}
```

#### 5.3.3 Score Thresholds & Actions

| Score Range | Classification | Automated Action |
|-------------|----------------|------------------|
| 0-25 | ❄️ Cold | Nurture email sequence |
| 26-50 | 🌡️ Warm | Weekly follow-up reminder |
| 51-75 | 🔥 Hot | Priority queue, notify sales |
| 76-100 | 🔥🔥 Very Hot | **Instant notification**, auto-assign |

#### 5.3.4 Buyer's Journey Stage Scoring

Scoring should weight actions closer to purchase higher:

```
Awareness Stage (Low Points)
├── Blog visit: +2
├── Social media click: +1
└── Email open: +1

Consideration Stage (Medium Points)
├── Service page visit: +5
├── Comparison page: +8
├── Case study view: +5
└── Email click: +3

Decision Stage (High Points)
├── Pricing page: +15
├── Contact form: +10
├── Demo request: +20
└── Quote request: +25
```

---

## 6. Speed-to-Lead (Critical 2026 Metric)

> **"Speed wins — respond to leads in seconds, not hours"**
> Studies show businesses using automation can cut manual work by 30%, leading to faster responses and higher conversion rates.

### 6.1 Response Time SLAs

| Lead Score | Target Response Time | Escalation |
|------------|---------------------|------------|
| Very Hot (76-100) | < 5 minutes | Immediate notification |
| Hot (51-75) | < 1 hour | Manager alert at 30 min |
| Warm (26-50) | < 4 hours | Daily report |
| Cold (0-25) | < 24 hours | Weekly batch |

### 6.2 Instant Response System

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LEAD SUBMISSION FLOW                              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Form Submitted       │
                    │  (milliseconds)       │
                    └───────────────────────┘
                                │
               ┌────────────────┼────────────────┐
               ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ Database Write  │ │ Calculate Score │ │ Send Auto-Email │
    │ (< 100ms)       │ │ (< 50ms)        │ │ (< 2 seconds)   │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
               │                │                │
               └────────────────┼────────────────┘
                                ▼
                    ┌───────────────────────┐
                    │ If Score > 75:        │
                    │ Push Notification to  │
                    │ Sales Team (Instant)  │
                    └───────────────────────┘
```

### 6.3 Auto-Response Email (Immediate)

When a lead submits a form, send **within 2 seconds**:
- Confirmation of receipt
- Expected response time
- Helpful resources link
- Calendar booking link (for Hot leads)

### 6.4 Response Time Tracking

Track and report:
- **First Response Time**: Time from submission to first human contact
- **Average Response Time**: By sales agent
- **Response Rate**: % of leads contacted within SLA
- **Missed SLA Count**: Leads not contacted in time

---

## 7. Lead to Customer Conversion

### 6.1 Conversion Requirements

A lead can be converted to a customer when the following conditions are met:

| Requirement | Required | Description |
|-------------|----------|-------------|
| Status = WON | Yes | Lead must be marked as won |
| Email verified | Yes | Valid email address |
| First name provided | Yes | Basic identification |
| At least one service selected | Recommended | Know what they want |
| Payment method on file | Optional | For faster checkout |

### 6.2 Conversion Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                     LEAD CONVERSION WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  1. Mark Lead as WON  │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ 2. Click "Convert to  │
                    │      Customer"        │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ 3. Verify/Complete    │
                    │    Customer Info      │
                    │  - Email (required)   │
                    │  - Password (auto or  │
                    │    manual)            │
                    │  - Phone              │
                    │  - Company            │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ 4. Create User Record │
                    │   - Role: CUSTOMER    │
                    │   - Link to Lead      │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ 5. Send Welcome Email │
                    │   - Login credentials │
                    │   - Getting started   │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ 6. Optional: Create   │
                    │    Initial Order      │
                    └───────────────────────┘
```

### 6.3 Post-Conversion

After conversion:
- Lead record is preserved with `convertedAt` timestamp
- Lead is linked to User record via `convertedToId`
- Lead status remains `WON`
- Activity log shows conversion event
- Customer can now:
  - Log in to customer portal
  - Place orders
  - Track order status
  - Access documents

---

## 7. Admin Dashboard Pages

### 7.1 Lead List View (`/admin/leads`)

**Features:**
- Data table with sortable columns
- Bulk actions (assign, change status, delete)
- Quick filters (status, source, assigned to)
- Search by name, email, company
- Date range filter
- Export to CSV/Excel

**Columns:**
| Column | Sortable | Filterable |
|--------|----------|------------|
| Name | Yes | Search |
| Email | Yes | Search |
| Phone | No | No |
| Company | Yes | Search |
| Status | Yes | Yes |
| Source | Yes | Yes |
| Score | Yes | Range |
| Assigned To | Yes | Yes |
| Created | Yes | Date Range |
| Last Contact | Yes | Date Range |
| Next Follow-up | Yes | Date Range |

### 7.2 Pipeline View (`/admin/leads/pipeline`)

**Features:**
- Kanban board layout
- Drag-and-drop between stages
- Lead count per stage
- Total value per stage (if budget available)
- Quick add lead
- Filter by assigned user

### 7.3 Lead Detail Page (`/admin/leads/[id]`)

**Sections:**

1. **Header**
   - Lead name, company
   - Status badge (changeable)
   - Score indicator
   - Priority level
   - Quick actions (Email, Call, Convert)

2. **Contact Information**
   - Email, phone, website
   - Location
   - Social profiles

3. **Lead Details**
   - Source & UTM data
   - Interested services
   - Budget & timeline
   - Custom fields

4. **Activity Timeline**
   - Chronological list of all activities
   - Filter by activity type
   - Add manual activity

5. **Notes**
   - Add/edit notes
   - Pin important notes
   - Rich text support

6. **Tasks/Follow-ups**
   - Scheduled follow-ups
   - Due dates
   - Completion status

### 7.4 Analytics Dashboard (`/admin/leads/analytics`)

**Metrics:**

1. **Overview Cards**
   - Total leads (this month)
   - New leads today
   - Conversion rate
   - Average lead score

2. **Charts**
   - Leads by source (pie chart)
   - Leads over time (line chart)
   - Conversion funnel (funnel chart)
   - Lead status distribution (bar chart)

3. **Tables**
   - Top performing sources
   - Top converters (sales agents)
   - Recent conversions

### 7.5 Settings Page (`/admin/leads/settings`)

**Sections:**

1. **Pipeline Settings**
   - Customize stage names
   - Add/remove stages
   - Set stage colors

2. **Lead Scoring**
   - Configure scoring rules
   - Set score thresholds

3. **Notifications**
   - New lead notifications
   - Assignment notifications
   - Daily digest settings

4. **Form Configurations**
   - List of form configs
   - Create/edit forms
   - Field mapping

5. **Auto-assignment**
   - Round-robin settings
   - Assignment rules

---

## 8. API Endpoints

### 8.1 Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leads` | Submit new lead (from form) |

### 8.2 Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/leads` | List all leads (with filters) |
| GET | `/api/admin/leads/:id` | Get single lead |
| PATCH | `/api/admin/leads/:id` | Update lead |
| DELETE | `/api/admin/leads/:id` | Delete lead |
| POST | `/api/admin/leads/:id/activities` | Add activity |
| GET | `/api/admin/leads/:id/activities` | Get activities |
| POST | `/api/admin/leads/:id/notes` | Add note |
| GET | `/api/admin/leads/:id/notes` | Get notes |
| PATCH | `/api/admin/leads/:id/notes/:noteId` | Update note |
| DELETE | `/api/admin/leads/:id/notes/:noteId` | Delete note |
| POST | `/api/admin/leads/:id/convert` | Convert to customer |
| POST | `/api/admin/leads/bulk` | Bulk actions |
| GET | `/api/admin/leads/export` | Export leads |
| GET | `/api/admin/leads/stats` | Analytics data |
| GET | `/api/admin/lead-forms` | List form configs |
| POST | `/api/admin/lead-forms` | Create form config |
| PATCH | `/api/admin/lead-forms/:id` | Update form config |
| DELETE | `/api/admin/lead-forms/:id` | Delete form config |

---

## 9. Dynamic Form Fields & Table Columns

> **Key Insight:** Form fields should automatically create corresponding columns in the lead table. Admin shouldn't manually configure both.

### 9.1 Form Field Configuration

Each form can have custom fields that map to lead table columns:

```typescript
interface FormFieldConfig {
  id: string;                    // Unique field ID
  name: string;                  // Internal field name (snake_case)
  label: string;                 // Display label
  type: FieldType;               // Field type
  placeholder?: string;
  required: boolean;
  options?: SelectOption[];      // For select/radio/checkbox
  validation?: ValidationRule[];

  // Table Display Settings
  showInTable: boolean;          // Show as column in lead list?
  tableColumnOrder: number;      // Column position (0 = first)
  tableColumnWidth?: number;     // Column width in pixels

  // Mapping
  mapToLeadField?: keyof Lead;   // Map to built-in field (email, phone, etc.)
  isCustomField: boolean;        // If true, store in customFields JSON
}

type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'number'
  | 'date'
  | 'url'
  | 'hidden';

interface SelectOption {
  value: string;
  label: string;
}
```

### 9.2 Built-in vs Custom Fields

**Built-in Fields** (mapped to Lead model columns):
| Field Name | Maps To | Always Available |
|------------|---------|------------------|
| firstName | `lead.firstName` | Yes |
| lastName | `lead.lastName` | Yes |
| email | `lead.email` | Yes |
| phone | `lead.phone` | Yes |
| company | `lead.company` | Yes |
| country | `lead.country` | Yes |
| budget | `lead.budget` | Yes |
| timeline | `lead.timeline` | Yes |
| interestedIn | `lead.interestedIn` | Yes |

**Custom Fields** (stored in `lead.customFields` JSON):
| Example | Stored As | Table Column |
|---------|-----------|--------------|
| "How did you hear about us?" | `customFields.hear_about_us` | Dynamic |
| "Company size" | `customFields.company_size` | Dynamic |
| "Preferred contact method" | `customFields.contact_method` | Dynamic |

### 9.3 Form Builder UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Form Builder: "LLC Formation Lead Form"                          [Preview] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⋮⋮ First Name *              [text]         [📊 Show in Table] ☑   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⋮⋮ Email Address *           [email]        [📊 Show in Table] ☑   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⋮⋮ Phone Number              [phone]        [📊 Show in Table] ☑   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⋮⋮ Which service interests   [select]       [📊 Show in Table] ☑   │   │
│  │    you? *                    ┌──────────────────────────────────┐   │   │
│  │                              │ ○ LLC Formation                  │   │   │
│  │                              │ ○ EIN Application                │   │   │
│  │                              │ ○ Amazon Seller Account          │   │   │
│  │                              │ ○ Multiple Services              │   │   │
│  │                              └──────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⋮⋮ Budget Range              [select]       [📊 Show in Table] ☐   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⋮⋮ How did you hear about    [select]       [📊 Show in Table] ☐   │   │
│  │    us? (Custom)              [+ Add Option]                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [+ Add Field ▼]                                                            │
│    ├── Text Field                                                           │
│    ├── Email Field                                                          │
│    ├── Phone Field                                                          │
│    ├── Dropdown Select                                                      │
│    ├── Multi-Select                                                         │
│    ├── Text Area                                                            │
│    ├── Checkbox                                                             │
│    └── Hidden Field                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.4 Dynamic Lead Table Columns

The lead list table **automatically** generates columns based on form configuration:

```typescript
// Generate table columns from form config
function generateTableColumns(formConfig: LeadFormConfig): TableColumn[] {
  const columns: TableColumn[] = [
    // Always show these
    { key: 'name', label: 'Name', fixed: true },
    { key: 'email', label: 'Email', fixed: true },
    { key: 'status', label: 'Status', fixed: true },
    { key: 'score', label: 'Score', fixed: true },
  ];

  // Add form-specific columns
  formConfig.fields
    .filter(field => field.showInTable)
    .sort((a, b) => a.tableColumnOrder - b.tableColumnOrder)
    .forEach(field => {
      if (!field.mapToLeadField) {
        // Custom field column
        columns.push({
          key: `customFields.${field.name}`,
          label: field.label,
          type: field.type,
          render: (lead) => renderCustomField(lead.customFields?.[field.name], field.type)
        });
      }
    });

  // Always show these at end
  columns.push(
    { key: 'createdAt', label: 'Created', fixed: true },
    { key: 'actions', label: '', fixed: true }
  );

  return columns;
}

// Render custom field value based on type
function renderCustomField(value: unknown, type: FieldType): React.ReactNode {
  if (!value) return '-';

  switch (type) {
    case 'multiselect':
      return (value as string[]).join(', ');
    case 'checkbox':
      return value ? '✓' : '✗';
    case 'date':
      return formatDate(value as string);
    case 'url':
      return <a href={value as string} target="_blank">{value}</a>;
    default:
      return String(value);
  }
}
```

### 9.5 Column Visibility Settings

Admin can toggle which columns appear in the lead table:

```
┌─────────────────────────────────────────────────────────────────┐
│  Table Column Settings                                    [Save] │
├─────────────────────────────────────────────────────────────────┤
│  ☑ Name (required)                                              │
│  ☑ Email (required)                                             │
│  ☑ Phone                                                        │
│  ☑ Status (required)                                            │
│  ☑ Score                                                        │
│  ☐ Company                                                      │
│  ☑ Service Interested                                           │
│  ☐ Budget Range                                                 │
│  ☐ How did you hear about us?                                   │
│  ☑ Assigned To                                                  │
│  ☑ Created Date                                                 │
│  ☐ Last Activity                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 9.6 Form-to-Lead Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FORM SUBMISSION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

User submits form with fields:
{
  firstName: "John",
  email: "john@example.com",
  service_interest: "llc-formation",      // Built-in → maps to interestedIn
  company_size: "10-50",                  // Custom field
  hear_about_us: "Google Search"          // Custom field
}
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  API processes submission:                                                   │
│                                                                              │
│  1. Map built-in fields to Lead columns:                                    │
│     lead.firstName = "John"                                                  │
│     lead.email = "john@example.com"                                          │
│     lead.interestedIn = ["llc-formation"]                                    │
│                                                                              │
│  2. Store custom fields in JSON:                                            │
│     lead.customFields = {                                                    │
│       "company_size": "10-50",                                              │
│       "hear_about_us": "Google Search"                                      │
│     }                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Lead Table displays:                                                        │
│                                                                              │
│  | Name | Email           | Service    | Company Size | Source        | ... │
│  |------|-----------------|------------|--------------|---------------|-----|
│  | John | john@example... | LLC Form.  | 10-50        | Google Search | ... │
│                                                                              │
│  ↑ Built-in columns        ↑ Custom field columns (from form config)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.7 Multiple Forms, Unified Table

When multiple forms exist with different fields:

| Form A Fields | Form B Fields | Lead Table Shows |
|---------------|---------------|------------------|
| firstName ✓ | firstName ✓ | Name (merged) |
| email ✓ | email ✓ | Email (merged) |
| company_size | - | Company Size (A only) |
| - | referral_code | Referral Code (B only) |
| budget | budget | Budget (merged) |

**Implementation:**
- Union all custom fields from all forms
- Show superset of columns
- Empty cells for leads without that field
- Filter by "Form Source" to see form-specific columns

### 9.8 Export with Custom Fields

When exporting leads to CSV/Excel:
- Include all custom fields as columns
- Column headers = field labels
- Handle arrays (multiselect) as comma-separated

```csv
Name,Email,Phone,Status,Score,Service Interest,Company Size,How Heard
John Doe,john@example.com,+1234567890,NEW,75,LLC Formation,10-50,Google Search
Jane Smith,jane@company.co,+0987654321,QUALIFIED,85,"LLC, EIN",50-100,Referral
```

---

## 10. Form Templates & Instances (2-Tier System)

> **Key Concept:** Separate reusable field definitions (Templates) from page-specific configurations (Instances). This allows creating forms faster while maintaining granular tracking.

### 10.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         2-TIER FORM SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

TIER 1: TEMPLATES (Reusable field definitions)
═══════════════════════════════════════════════
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ "Contact Form"      │  │ "LLC Lead Form"     │  │ "Quick Quote"       │
│ ─────────────────── │  │ ─────────────────── │  │ ─────────────────── │
│ • Name (required)   │  │ • Name (required)   │  │ • Name (required)   │
│ • Email (required)  │  │ • Email (required)  │  │ • Email (required)  │
│ • Message           │  │ • Phone (required)  │  │ • Service (select)  │
│                     │  │ • Service (select)  │  │ • Budget (select)   │
│                     │  │ • Budget (select)   │  │                     │
│                     │  │ • Timeline          │  │                     │
│                     │  │ • Hear about us     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
TIER 2: FORM INSTANCES (Page-specific settings)
═══════════════════════════════════════════════
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ "Homepage Contact"  │  │ "LLC Landing Page"  │  │ "Service Page CTA"  │
│ ─────────────────── │  │ ─────────────────── │  │ ─────────────────── │
│ Template: Contact   │  │ Template: LLC Lead  │  │ Template: Quick     │
│ GTM Event: home_cta │  │ GTM Event: llc_lead │  │ GTM Event: svc_cta  │
│ Auto-assign: Sarah  │  │ Auto-assign: Round  │  │ Auto-assign: None   │
│ Success: Thank you! │  │ Success: Redirect   │  │ Success: Modal      │
│ Status: Active ✓    │  │ Status: Active ✓    │  │ Status: Draft       │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### 10.2 Database Schema

```prisma
model FormTemplate {
  id            String   @id @default(cuid())
  name          String   // "LLC Lead Form"
  description   String?
  fields        Json     // Field definitions array

  // Defaults (can be overridden in instance)
  defaultSuccessMessage  String?
  defaultSuccessRedirect String?
  defaultAutoAssignTo    String?

  // Styling defaults
  defaultStyling         Json?    // Button colors, padding, etc.

  // Management
  isActive      Boolean  @default(true)
  isSystem      Boolean  @default(false) // System templates can't be deleted
  usageCount    Int      @default(0)     // How many instances use this

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  formInstances FormInstance[]

  @@index([isActive])
}

model FormInstance {
  id            String   @id @default(cuid())
  name          String   // "Homepage LLC Form"
  slug          String   @unique // "homepage-llc-form"

  // Template reference
  templateId    String
  template      FormTemplate @relation(fields: [templateId], references: [id])

  // Override fields (optional - if different from template)
  fieldOverrides Json?   // Override specific field settings
  stylingOverrides Json? // Override styling

  // Instance-specific settings
  successMessage   String?
  successRedirect  String?
  autoAssignToId   String?
  roundRobinAssign Boolean  @default(false)

  // Tracking identifiers (for GTM dataLayer)
  trackingEventName String?  // Custom event name, default: "lead_form_submit"
  trackingParams    Json?    // Additional custom params for tracking

  // Status
  isActive      Boolean  @default(true)

  // Stats
  submissionCount Int     @default(0)
  conversionCount Int     @default(0)
  lastSubmission  DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  leads         Lead[]

  @@index([templateId])
  @@index([isActive])
  @@index([slug])
}
```

### 10.3 Admin UI - Template Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Form Templates                                        [+ Create Template]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 📝 LLC Lead Form                                          [Edit] [···] │ │
│  │    5 fields • Used by 3 forms • Last updated: 2 days ago               │ │
│  │    Instances: Homepage LLC, Landing Page, Service Page                 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 📝 Contact Form                                           [Edit] [···] │ │
│  │    3 fields • Used by 2 forms • Last updated: 1 week ago               │ │
│  │    Instances: Footer Contact, About Page                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 📝 Quick Quote                                            [Edit] [···] │ │
│  │    4 fields • Used by 1 form • Last updated: 3 days ago                │ │
│  │    Instances: Pricing Page CTA                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Admin UI - Form Instance Creation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Create Form Instance                                               [Save]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Form Name: [LLC Landing Page Form_____________]                            │
│                                                                              │
│  Template:  [LLC Lead Form ▼]                                               │
│             ├── LLC Lead Form (5 fields)                                    │
│             ├── Contact Form (3 fields)                                     │
│             └── Quick Quote (4 fields)                                      │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  📊 Tracking Settings                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Event Name: [llc_landing_lead________]  (default: lead_form_submit) │   │
│  │                                                                      │   │
│  │ Custom Parameters:                                                   │   │
│  │ ┌─────────────────┐  ┌─────────────────┐                            │   │
│  │ │ Key: [page____] │  │ Value: [landing]│  [+ Add]                   │   │
│  │ └─────────────────┘  └─────────────────┘                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ⚙️ Submission Settings                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Success Action:  ○ Show Message  ● Redirect to URL                  │   │
│  │ Redirect URL: [/thank-you?source=llc-landing___]                    │   │
│  │                                                                      │   │
│  │ Auto-assign to: [Round Robin ▼]                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.5 Widget Selection

In the Page Builder, the Lead Form Widget selects a Form Instance:

```
┌─────────────────────────────────────────────────────────────────┐
│  Lead Form Widget Settings                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Select Form: [LLC Landing Page Form ▼]                         │
│               ├── LLC Landing Page Form (LLC Lead Form)         │
│               ├── Homepage Contact (Contact Form)               │
│               ├── Service Page CTA (Quick Quote)                │
│               └── + Create New Form Instance                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Form Preview:                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Full Name *        [___________________]                │   │
│  │  Email Address *    [___________________]                │   │
│  │  Phone Number *     [___________________]                │   │
│  │  Service Interest * [Select service... ▼]               │   │
│  │  Budget Range       [Select budget... ▼]                │   │
│  │                                                          │   │
│  │            [Submit]                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Conversion Tracking & Analytics

> **One-time global setup** for GTM, Facebook Pixel, and Google Ads. All forms automatically use these tracking codes.

### 11.1 Global Tracking Setup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Settings > Integrations > Conversion Tracking                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🏷️ Google Tag Manager                                          [Enabled ✓] │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Container ID: [GTM-XXXXXXX___]                                      │   │
│  │                                                                      │   │
│  │ ☑ Track form submissions                                            │   │
│  │ ☑ Track page views                                                  │   │
│  │ ☐ Track scroll depth                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  📘 Facebook Pixel                                              [Enabled ✓] │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Pixel ID: [1234567890123456]                                        │   │
│  │                                                                      │   │
│  │ Events to track:                                                    │   │
│  │ ☑ Lead (form submissions)                                           │   │
│  │ ☑ PageView                                                          │   │
│  │ ☑ ViewContent (service pages)                                       │   │
│  │ ☐ InitiateCheckout                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  📊 Google Ads Conversion                                       [Enabled ✓] │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Conversion ID: [AW-123456789___]                                    │   │
│  │ Conversion Label: [AbCdEfGhIjKl]                                    │   │
│  │                                                                      │   │
│  │ ☑ Track form submissions as conversions                             │   │
│  │ Default Value: [$50_____] USD                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  🎵 TikTok Pixel (Future)                                          [Off]   │
│                                                                              │
│                                                    [Test Tracking] [Save]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Database Schema

```prisma
model TrackingSettings {
  id              String   @id @default(cuid())

  // Google Tag Manager
  gtmEnabled      Boolean  @default(false)
  gtmContainerId  String?  // GTM-XXXXXXX
  gtmTrackForms   Boolean  @default(true)
  gtmTrackPages   Boolean  @default(true)

  // Facebook Pixel
  fbPixelEnabled  Boolean  @default(false)
  fbPixelId       String?  // 1234567890123456
  fbTrackLead     Boolean  @default(true)
  fbTrackPageView Boolean  @default(true)
  fbTrackContent  Boolean  @default(false)

  // Google Ads
  gadsEnabled     Boolean  @default(false)
  gadsConversionId    String?  // AW-123456789
  gadsConversionLabel String?  // AbCdEfGhIjKl
  gadsDefaultValue    Float?   // Default conversion value

  // TikTok (Future)
  tiktokEnabled   Boolean  @default(false)
  tiktokPixelId   String?

  updatedAt       DateTime @updatedAt
}
```

### 11.3 Script Injection

Global tracking scripts are injected in the site `<head>`:

```typescript
// src/components/tracking/TrackingScripts.tsx
export function TrackingScripts({ settings }: { settings: TrackingSettings }) {
  return (
    <>
      {/* Google Tag Manager */}
      {settings.gtmEnabled && settings.gtmContainerId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${settings.gtmContainerId}');`}
        </Script>
      )}

      {/* Facebook Pixel */}
      {settings.fbPixelEnabled && settings.fbPixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${settings.fbPixelId}');
          fbq('track', 'PageView');`}
        </Script>
      )}

      {/* Google Ads gtag */}
      {settings.gadsEnabled && settings.gadsConversionId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.gadsConversionId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.gadsConversionId}');`}
          </Script>
        </>
      )}
    </>
  );
}
```

### 11.4 Form Submission Tracking

When a form is submitted, all enabled tracking fires automatically:

```typescript
// src/lib/tracking/track-form-submit.ts
interface TrackFormSubmitParams {
  formInstance: FormInstance;
  lead: Lead;
  settings: TrackingSettings;
}

export function trackFormSubmit({ formInstance, lead, settings }: TrackFormSubmitParams) {
  const eventName = formInstance.trackingEventName || 'lead_form_submit';
  const customParams = formInstance.trackingParams || {};

  // 1. GTM dataLayer push
  if (settings.gtmEnabled) {
    window.dataLayer?.push({
      event: eventName,
      formId: formInstance.id,
      formName: formInstance.name,
      formSlug: formInstance.slug,
      templateName: formInstance.template?.name,
      leadId: lead.id,
      leadScore: lead.score,
      service: lead.interestedIn?.[0],
      ...customParams,
    });
  }

  // 2. Facebook Pixel - Lead event
  if (settings.fbPixelEnabled && settings.fbTrackLead) {
    window.fbq?.('track', 'Lead', {
      content_name: formInstance.name,
      content_category: lead.interestedIn?.[0],
      value: settings.gadsDefaultValue || 0,
      currency: 'USD',
    });
  }

  // 3. Google Ads Conversion
  if (settings.gadsEnabled && settings.gadsConversionId && settings.gadsConversionLabel) {
    window.gtag?.('event', 'conversion', {
      send_to: `${settings.gadsConversionId}/${settings.gadsConversionLabel}`,
      value: settings.gadsDefaultValue || 0,
      currency: 'USD',
      transaction_id: lead.id,
    });
  }
}
```

### 11.5 Tracking Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FORM SUBMISSION TRACKING FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

User clicks "Submit"
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. Client-side validation                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. POST /api/leads                                                          │
│     - Save lead to database                                                  │
│     - Calculate lead score                                                   │
│     - Return { success: true, leadId, score }                               │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. Client receives success response                                         │
│                                                                              │
│     ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                 │
│     │ GTM dataLayer │  │ Facebook fbq  │  │ Google gtag   │                 │
│     │ .push({...})  │  │ ('track',     │  │ ('event',     │                 │
│     │               │  │  'Lead')      │  │  'conversion')│                 │
│     └───────────────┘  └───────────────┘  └───────────────┘                 │
│            │                  │                  │                           │
│            ▼                  ▼                  ▼                           │
│     ┌─────────────────────────────────────────────────────┐                 │
│     │              All tracking fires simultaneously       │                 │
│     └─────────────────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. Show success message OR redirect to thank-you page                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 11.6 Per-Form Event Customization (Optional)

While tracking is global, each Form Instance can customize its event name:

| Form Instance | Event Name | Use Case |
|---------------|------------|----------|
| Homepage LLC Form | `homepage_llc_lead` | Track homepage conversions |
| Landing Page Form | `landing_page_lead` | Track campaign landing pages |
| Service Page CTA | `service_cta_lead` | Track service page interest |
| Footer Contact | `footer_contact` | Track footer engagement |

This allows creating **separate GTM triggers** for different forms while using the same global GTM container.

### 11.7 Analytics Reports

Track conversion performance in Admin Dashboard:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Lead Analytics > Conversion Tracking                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Form Performance (Last 30 days)                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Form Name              │ Submissions │ Conversion │ Avg Score │ Value  │ │
│  ├────────────────────────┼─────────────┼────────────┼───────────┼────────┤ │
│  │ LLC Landing Page       │ 245         │ 32 (13%)   │ 72        │ $4,800 │ │
│  │ Homepage Contact       │ 189         │ 18 (9.5%)  │ 58        │ $2,700 │ │
│  │ Service Page CTA       │ 156         │ 24 (15%)   │ 65        │ $3,600 │ │
│  │ Footer Contact         │ 78          │ 5 (6.4%)   │ 42        │ $750   │ │
│  └────────────────────────┴─────────────┴────────────┴───────────┴────────┘ │
│                                                                              │
│  Source Attribution                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 🔵 Google Ads    35%  ████████████████████░░░░░░░░░░░░░░░░░░░░░░      │ │
│  │ 🟣 Facebook      28%  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░      │ │
│  │ 🟢 Organic       22%  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │ │
│  │ 🟡 Direct        10%  ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │ │
│  │ ⚪ Referral       5%  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Lead Form Widget Integration

### 12.1 Form Widget Updates

The existing Lead Form widget needs to be updated to:

1. **Form Config Selection**
   - Add dropdown to select form configuration
   - Or use default configuration

2. **Field Mapping**
   - Map widget fields to lead fields
   - Support custom fields

3. **Submission Endpoint**
   - POST to `/api/leads`
   - Include form config ID
   - Include page URL and UTM params

### 9.2 Form Submission Payload

```typescript
interface LeadFormSubmission {
  // Required
  firstName: string;
  email: string;

  // Optional
  lastName?: string;
  phone?: string;
  company?: string;

  // Context
  formConfigId?: string;
  pageUrl: string;

  // UTM Tracking
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;

  // Custom fields
  customFields?: Record<string, unknown>;

  // Service interest
  interestedIn?: string[];
}
```

---

## 10. Navigation Structure

### 10.1 Admin Sidebar Addition

```
├── Dashboard
├── Orders
├── Customers
├── Services
├── ─────────────
├── 📊 Leads              ← NEW SECTION
│   ├── All Leads
│   ├── Pipeline
│   ├── Analytics
│   └── Settings
├── ─────────────
├── Content
├── Appearance
│   └── Pages
│       └── Lead Form Widget Settings → Links to /admin/leads/settings
├── Settings
```

### 10.2 Quick Access

Add to admin header:
- Lead count badge (new leads today)
- Quick "Add Lead" button

---

## 11. Notifications & Automation

### 11.1 Email Notifications

| Trigger | Recipients | Template |
|---------|------------|----------|
| New lead submitted | Configured emails, assigned user | `new-lead-notification` |
| Lead assigned | Assigned user | `lead-assigned` |
| Follow-up due | Assigned user | `follow-up-reminder` |
| Lead converted | Admin, assigned user | `lead-converted` |

### 11.2 Automation Rules (Future)

- Auto-assign leads based on source/service
- Auto-tag leads based on criteria
- Auto-score leads on submission
- Auto-send welcome email on form submission

---

## 12. Multi-Channel Lead Capture

> An effective CRM automatically collects leads from websites, emails, ads, and social media, ensuring no inquiry is missed.

### 12.1 Capture Channels

| Channel | Integration Method | Auto-Fields |
|---------|-------------------|-------------|
| **Website Forms** | Lead Form Widget | UTM, Page URL, IP |
| **WhatsApp** | WhatsApp Business API | Phone, Name, Message |
| **Facebook Ads** | Facebook Lead Ads Webhook | All form fields |
| **Google Ads** | Google Lead Form Extensions | All form fields |
| **Live Chat** | Chat widget integration | Transcript, Contact |
| **Email** | Forward to lead email | Email content, attachments |
| **Manual Entry** | Admin dashboard | Agent assigned |

### 12.2 Channel-Specific Scoring

Different channels have different conversion rates:

| Source | Base Score Modifier |
|--------|---------------------|
| Referral | +25 (highest trust) |
| Google Ads | +15 (high intent) |
| Facebook Ads | +10 |
| Website Direct | +10 |
| Social Media | +5 |
| Cold Outreach | +0 |

### 12.3 UTM Parameter Tracking

Capture and analyze:
```typescript
interface UTMData {
  utmSource: string;    // google, facebook, newsletter
  utmMedium: string;    // cpc, email, social
  utmCampaign: string;  // summer_sale_2026
  utmTerm: string;      // llc+formation
  utmContent: string;   // cta_button_blue
}
```

**Use Cases:**
- Track which campaigns generate most leads
- Calculate cost-per-lead by campaign
- Identify highest converting traffic sources
- A/B test landing pages

### 12.4 Facebook Lead Ads Integration (Future)

```typescript
// Webhook endpoint for Facebook Lead Ads
// POST /api/webhooks/facebook-leads
async function handleFacebookLead(req: Request) {
  const { leadgen_id, form_id, field_data } = req.body;

  const lead = await prisma.lead.create({
    data: {
      firstName: field_data.full_name?.split(' ')[0],
      lastName: field_data.full_name?.split(' ').slice(1).join(' '),
      email: field_data.email,
      phone: field_data.phone_number,
      source: 'FACEBOOK_ADS',
      sourceDetail: `form_${form_id}`,
      customFields: { leadgen_id, raw_data: field_data }
    }
  });

  // Trigger instant notification
  await notifyInstantLead(lead);
}
```

---

## 13. Implementation Phases

> **REMINDER:** Each phase requires full-stack implementation. See [Strict Implementation Guidelines](#️-strict-implementation-guidelines).

### Phase 1: Foundation (MVP) ✅ COMPLETED

**Tasks:**
- [x] Database schema (Prisma) - Lead, LeadActivity, LeadNote models
- [x] API endpoints - CRUD for leads
- [x] Lead list view (table) - Full working UI with pagination
- [x] Lead detail page - View/edit lead information
- [x] Basic form submission - Lead Form Widget → API → Database

**Phase 1 Verification:**
```
✅ `npx prisma db push` runs successfully
✅ GET /api/admin/leads returns leads array with pagination
✅ POST /api/admin/leads creates new lead in database
✅ Lead list displays data from database with filters
✅ Clicking lead opens detail page with real data
✅ Form submission creates lead via /api/leads endpoint
✅ No TypeScript errors
✅ Build passes: `npm run build`
```

**Phase 1 Implementation Notes:**
- Added Lead, LeadActivity, LeadNote, LeadFormTemplate, LeadFormInstance, TrackingSettings models to Prisma schema
- Created admin API endpoints: GET/POST /api/admin/leads, GET/PATCH/DELETE /api/admin/leads/[id], /api/admin/leads/[id]/notes, /api/admin/leads/[id]/activities, /api/admin/leads/stats
- Created public API endpoint: POST /api/leads (for form submissions)
- Admin UI at /admin/leads with stats cards, filters, pagination
- Lead detail page at /admin/leads/[id] with tabs (Details, Activity, Notes)
- Lead Form Widget updated to submit to /api/leads with UTM tracking
- Added "Leads" menu item to admin sidebar

### Phase 2: Core Features ✅ COMPLETED

**Tasks:**
- [x] Pipeline (Kanban) view - Drag-drop between stages
- [x] Activity logging - Auto-log status changes, calls, emails
- [x] Notes system - Add/edit/delete notes on leads
- [x] Lead assignment - Assign to team members
- [x] Status management - Update lead status with validation

**Phase 2 Verification:**
```
✅ Kanban board shows leads in correct columns - /admin/leads/pipeline
✅ Drag-drop updates status in database
✅ Activities auto-created on status change
✅ Notes save and display correctly - /api/admin/leads/[id]/notes/[noteId] PATCH/DELETE
✅ Assignment dropdown shows users
✅ Assignment saves to database - works on list and detail pages
✅ All components connected to API
```

**Phase 2 Implementation Notes:**
- Created Pipeline/Kanban view at /admin/leads/pipeline with drag-drop functionality
- Activity logging auto-creates LeadActivity on status change, assignment, priority change
- Notes CRUD complete with /api/admin/leads/[id]/notes and /api/admin/leads/[id]/notes/[noteId]
- Assignment works on both list page (dialog) and detail page (sidebar)
- Status management via Pipeline Stage dropdown with loading states

### Phase 3: Conversion & Integration ✅ COMPLETED

**Tasks:**
- [x] Lead-to-customer conversion - Full workflow
- [x] Lead Form widget integration - Connect to Form Instances
- [x] Form configuration system - Templates & Instances CRUD
- [x] Email notifications - Send on submission

**Phase 3 Verification:**
```
✅ "Convert to Customer" creates User record - /api/admin/leads/[id]/convert
✅ Converted lead marked as WON
✅ Form widget uses formInstanceSlug/formInstanceId props
✅ Form templates CRUD working - /api/admin/lead-form-templates
✅ Form instances CRUD working - /api/admin/lead-forms
✅ Email sends on form submission - Uses email.notify.adminNewLead setting
✅ All data flows verified end-to-end
```

**Phase 3 Implementation Notes:**
- Convert to Customer API at /api/admin/leads/[id]/convert
- Creates new User with CUSTOMER role or links to existing user
- "Convert to Customer" button shows only for WON leads that haven't been converted
- Activity logged when lead is converted
- Form Templates CRUD: /api/admin/lead-form-templates (GET, POST, PATCH, DELETE)
- Form Instances CRUD: /api/admin/lead-forms (GET, POST, PATCH, DELETE)
- Forms management UI at /admin/leads/forms with Templates and Instances tabs
- Email notification template at src/lib/email-templates/new-lead.ts
- Email sends when email.notify.adminNewLead setting is enabled

### Phase 4: Analytics & Polish (Partial)

**Tasks:**
- [x] Analytics dashboard - Charts, metrics, KPIs
- [x] Lead scoring - Auto-calculate on creation/update
- [x] Export functionality - CSV/Excel download
- [x] Settings page - Pipeline, scoring, notifications config
- [ ] Bulk actions - Multi-select, bulk update/delete
- [x] Advanced filters - By date, status, score, source
- [x] Add Lead manually - Add Lead dialog on list page
- [x] Delete Lead - Delete confirmation on list page

**Phase 4 Verification:**
```
✅ Dashboard shows real data - /admin/leads/analytics
✅ Lead score calculates correctly
✅ CSV export downloads with correct data - /api/admin/leads/export
✅ Settings page created - /admin/leads/settings
□ Bulk select/actions work
✅ Filters return correct results
✅ Add Lead dialog works
✅ Delete Lead works
```

**Phase 4 Implementation Notes:**
- Analytics dashboard at /admin/leads/analytics with pipeline distribution, source distribution, conversion funnel
- Export API at /api/admin/leads/export downloads CSV with all lead fields
- Settings page at /admin/leads/settings with tabs: Pipeline, Scoring, Notifications, Auto-Assignment
- Add Lead dialog on list page for manual lead creation
- Delete Lead confirmation dialog with cascade delete

### Phase 5: Automation & Quality

**Tasks:**
- [ ] Lead deduplication system - Detect & merge duplicates
- [ ] Score decay automation (cron job) - Daily decay job
- [ ] Auto-response emails - Send within 2 seconds
- [ ] Speed-to-lead tracking - Track response times
- [ ] Data validation rules - Server-side validation

**Phase 5 Verification:**
```
□ Duplicate detection blocks/merges duplicates
□ Cron job runs and decays scores
□ Auto-response email sends immediately
□ Response time metrics calculated
□ Invalid data rejected with errors
□ All automation tested end-to-end
```

### Phase 6: Integrations (Future)

**Tasks:**
- [ ] WhatsApp Business API
- [ ] Facebook Lead Ads webhook
- [ ] Google Lead Form Extensions
- [ ] Calendar booking integration
- [ ] SMS notifications (Twilio)

### Phase 7: AI Features (Future Roadmap)

**Tasks:**
- [ ] Predictive lead scoring (ML model)
- [ ] AI-powered lead prioritization
- [ ] Automated lead nurturing sequences
- [ ] Chatbot for lead qualification
- [ ] Sentiment analysis on communications

---

## 13. Data Quality & Deduplication

> Poor data quality causes an estimated **$12.9 million annually** in losses for firms. Clean data is essential.

### 13.1 Duplicate Detection

**On Submission:**
```typescript
async function checkDuplicate(email: string, phone?: string) {
  const existing = await prisma.lead.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        ...(phone ? [{ phone: normalizePhone(phone) }] : [])
      ],
      status: { notIn: ['WON', 'LOST', 'UNQUALIFIED'] }
    }
  });

  if (existing) {
    // Update existing lead instead of creating duplicate
    return { isDuplicate: true, existingLeadId: existing.id };
  }
  return { isDuplicate: false };
}
```

**Duplicate Handling Options:**
| Scenario | Action |
|----------|--------|
| Same email, active lead | Update existing, merge data |
| Same email, closed lead | Create new lead, link to previous |
| Same phone, different email | Flag for manual review |
| Same company, different contact | Create new lead, link to company |

### 13.2 Data Validation Rules

| Field | Validation | Auto-Fix |
|-------|------------|----------|
| Email | Valid format, MX check | Lowercase, trim |
| Phone | E.164 format | Normalize, add country code |
| Name | Min 2 chars | Trim, capitalize |
| Company | Min 2 chars | Trim |
| URL | Valid URL format | Add https:// if missing |

### 13.3 Data Hygiene Automation

**Weekly Tasks:**
- Remove test submissions (test@, demo@)
- Merge identified duplicates
- Update bounce-flagged emails
- Archive 90-day inactive leads

### 13.4 Merge Leads Functionality

When duplicates are found, provide merge UI:
- Select primary lead (newer activity = primary)
- Combine notes and activities
- Keep all UTM data (array)
- Sum interaction counts
- Keep highest score

---

## 14. Security Considerations

### 13.1 Access Control

| Role | Permissions |
|------|-------------|
| Admin | Full access to all leads and settings |
| Sales Agent | View/edit assigned leads, add notes |
| Support Agent | View leads, add notes |
| Content Manager | No access |

### 13.2 Data Protection

- Encrypt sensitive data at rest
- Rate limit form submissions
- Honeypot fields for spam prevention
- CAPTCHA integration (optional)
- IP-based duplicate detection

---

## 14. Success Metrics

### 14.1 KPIs to Track

| Metric | Description | Target |
|--------|-------------|--------|
| Lead Volume | New leads per month | Growth |
| Conversion Rate | Leads → Customers | >10% |
| Response Time | First contact time | <24 hours |
| Lead Velocity | Speed through pipeline | Decreasing |
| Source ROI | Leads per source cost | Increasing |

---

## 15. Technical Notes

### 15.1 Performance Considerations

- Paginate lead lists (50 per page)
- Index frequently queried columns
- Cache analytics data (1 hour)
- Lazy load activity timeline

### 15.2 Scalability

- Designed for up to 100,000 leads
- Background jobs for email sending
- Async analytics calculation

---

## Appendix A: Type Definitions

```typescript
// src/lib/leads/types.ts

export interface Lead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  status: LeadStatus;
  source: LeadSource;
  sourceDetail: string | null;
  score: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedToId: string | null;
  assignedTo: User | null;
  assignedAt: Date | null;
  interestedIn: string[];
  budget: string | null;
  timeline: string | null;
  customFields: Record<string, unknown> | null;
  tags: string[];
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  formConfigId: string | null;
  convertedAt: Date | null;
  convertedToId: string | null;
  convertedTo: User | null;
  lastContactedAt: Date | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'UNQUALIFIED';

export type LeadSource =
  | 'WEBSITE'
  | 'LANDING_PAGE'
  | 'REFERRAL'
  | 'SOCIAL_MEDIA'
  | 'GOOGLE_ADS'
  | 'FACEBOOK_ADS'
  | 'EMAIL_CAMPAIGN'
  | 'COLD_OUTREACH'
  | 'PARTNERSHIP'
  | 'OTHER';

export type LeadActivityType =
  | 'STATUS_CHANGE'
  | 'NOTE_ADDED'
  | 'EMAIL_SENT'
  | 'CALL_MADE'
  | 'MEETING_SCHEDULED'
  | 'MEETING_COMPLETED'
  | 'DOCUMENT_SENT'
  | 'FOLLOW_UP'
  | 'ASSIGNED'
  | 'CONVERTED'
  | 'CREATED';

export interface LeadActivity {
  id: string;
  leadId: string;
  type: LeadActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  createdById: string | null;
  createdBy: User | null;
  createdAt: Date;
}

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  isPinned: boolean;
  createdById: string | null;
  createdBy: User | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadFormConfig {
  id: string;
  name: string;
  description: string | null;
  fields: FormFieldConfig[];
  submitButtonText: string;
  successMessage: string | null;
  successRedirect: string | null;
  notifyEmails: string[];
  notifyOnSlack: boolean;
  slackWebhook: string | null;
  autoAssignTo: string | null;
  roundRobin: boolean;
  defaultSource: LeadSource;
  defaultTags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
  mapTo?: keyof Lead; // Map to lead field
}

export interface LeadFilters {
  status?: LeadStatus[];
  source?: LeadSource[];
  assignedToId?: string;
  tags?: string[];
  scoreMin?: number;
  scoreMax?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  bySource: Record<LeadSource, number>;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  conversionRate: number;
  averageScore: number;
}
```

---

## Appendix B: UI Mockups Reference

### Lead List View
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Leads                                              [+ Add Lead] [Export]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [🔍 Search...]  Status: [All ▼]  Source: [All ▼]  Assigned: [All ▼]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ☐ │ Name          │ Email              │ Status    │ Score │ Assigned │ ... │
├───┼───────────────┼────────────────────┼───────────┼───────┼──────────┼─────┤
│ ☐ │ John Doe      │ john@example.com   │ 🟢 NEW    │  75   │ Sarah    │ ... │
│ ☐ │ Jane Smith    │ jane@company.co    │ 🔵 QUAL   │  85   │ Mike     │ ... │
│ ☐ │ Bob Johnson   │ bob@startup.io     │ 🟡 PROP   │  60   │ Sarah    │ ... │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Pipeline View
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Pipeline View                                            [Filter] [+ Add]   │
├──────────────────────────────────────────────────────────────────────────────┤
│ NEW (12)      │ CONTACTED(8) │ QUALIFIED(5) │ PROPOSAL(3) │ WON (15)         │
├───────────────┼──────────────┼──────────────┼─────────────┼──────────────────┤
│ ┌───────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌─────────┐ │ ┌──────────────┐ │
│ │ John Doe  │ │ │ Jane S.  │ │ │ Bob J.   │ │ │ Alice   │ │ │ Tom Wilson   │ │
│ │ Score: 75 │ │ │ Score:85 │ │ │ Score:60 │ │ │ Score:90│ │ │ Converted ✓  │ │
│ │ LLC Form  │ │ │ EIN App  │ │ │ Amazon   │ │ │ All Svcs│ │ │ Jan 15, 2026 │ │
│ └───────────┘ │ └──────────┘ │ └──────────┘ │ └─────────┘ │ └──────────────┘ │
│ ┌───────────┐ │ ┌──────────┐ │ ...          │ ...         │ ...              │
│ │ Mary Lee  │ │ │ Chris P. │ │              │             │                  │
│ │ Score: 45 │ │ │ Score:70 │ │              │             │                  │
│ └───────────┘ │ └──────────┘ │              │             │                  │
└───────────────┴──────────────┴──────────────┴─────────────┴──────────────────┘
```

---

## Appendix C: 2026 AI Features Roadmap

> "Agent-based CRM systems analyze context, predict outcomes, and autonomously execute the optimal action for each individual prospect."

### C.1 Predictive Lead Scoring

Instead of rule-based scoring, ML models analyze historical data:

```
Historical Data Analysis:
├── Which leads converted? (features)
├── Time to conversion
├── Engagement patterns
├── Source effectiveness
└── Demographic correlations

→ Train model to predict conversion probability
→ Score new leads based on similarity to converted leads
```

**Implementation (Phase 7):**
1. Collect 1000+ leads with conversion outcomes
2. Extract features (demographics, behavior, source)
3. Train classification model (Random Forest / XGBoost)
4. Score = Conversion probability × 100

### C.2 Intelligent Lead Routing

AI-based assignment considering:
- Agent's historical conversion rate for similar leads
- Agent's current workload
- Lead's time zone vs agent availability
- Lead's language preference
- Service expertise match

### C.3 Automated Nurture Sequences

```
Lead Score: 35 (Warm, needs nurturing)
            │
            ▼
┌─────────────────────────────────────┐
│    AI-Generated Nurture Sequence    │
├─────────────────────────────────────┤
│ Day 1: Welcome email                │
│ Day 3: Educational content          │
│ Day 7: Case study relevant to       │
│        their interested service     │
│ Day 14: Limited-time offer          │
│ Day 21: Re-engagement check         │
└─────────────────────────────────────┘
```

### C.4 Chatbot Pre-Qualification

Website chatbot that:
- Asks qualifying questions
- Captures lead information
- Provides instant answers
- Books meetings for hot leads
- Hands off to human when needed

### C.5 Key AI Metrics (Future KPIs)

| Metric | Description |
|--------|-------------|
| Prediction Accuracy | % of correctly predicted conversions |
| Model Lift | Improvement over rule-based scoring |
| Automation Rate | % of leads handled without human |
| AI Response Time | Avg time for AI first touch |

---

## Appendix D: LLCPad-Specific Considerations

### D.1 Service-Based Scoring Weights

For LLC formation business, weight these services higher:

| Service | Score Weight | Reason |
|---------|--------------|--------|
| LLC Formation | 1.5x | Core revenue |
| Amazon Seller Account | 1.5x | High-value package |
| EIN Application | 1.2x | Usually bundled |
| Registered Agent | 1.0x | Recurring revenue |
| Virtual Address | 1.0x | Add-on service |
| Compliance | 0.8x | Lower immediate value |

### D.2 Target Market Scoring

| Country | Score Modifier | Notes |
|---------|----------------|-------|
| Bangladesh | +15 | Primary market |
| India | +15 | Primary market |
| Pakistan | +10 | Growing market |
| UAE | +10 | High-value market |
| Other | +0 | Standard |

### D.3 Budget Indicators

| Budget Range | Score | Intent Signal |
|--------------|-------|---------------|
| < $500 | +5 | Basic package |
| $500 - $1000 | +15 | Standard package |
| $1000 - $2500 | +25 | Premium package |
| > $2500 | +35 | Enterprise/Multiple services |

---

---

## Appendix E: Post-Implementation Cleanup Checklist

> **MANDATORY:** After completing implementation, clean up the codebase.

### E.1 Files to Review/Remove

| Category | Action | Examples |
|----------|--------|----------|
| **Deprecated widgets** | Remove if replaced | Old lead form widget versions |
| **Unused components** | Delete completely | Mock/placeholder components |
| **Test files** | Keep only relevant | Remove abandoned test files |
| **Commented code** | Remove | `// OLD: previous implementation` |
| **Console.logs** | Remove from production | Debug statements |

### E.2 Code Patterns to Fix

```typescript
// ❌ BAD - Backward compatibility hack
export { OldComponent as NewComponent }; // Remove this

// ❌ BAD - Unused import
import { something } from './unused'; // Delete

// ❌ BAD - Dead code
function unusedHelper() { } // Delete entirely

// ❌ BAD - Type escape
const data: any = response; // Add proper type

// ✅ GOOD - Clean, typed, used
import { Lead } from '@/types/lead';
const lead: Lead = await getLead(id);
```

### E.3 Database Cleanup

- [ ] Remove unused columns from schema
- [ ] Delete abandoned migrations (if not applied)
- [ ] Update seed data to match new schema
- [ ] Remove deprecated model relations

### E.4 Final Verification

```bash
# Run these commands to verify clean codebase:

# 1. Check for TypeScript errors
npm run build

# 2. Check for lint errors
npm run lint

# 3. Check for unused exports (optional)
npx ts-prune

# 4. Check bundle size
npm run build && ls -la .next/static/chunks

# 5. Test all pages load
npm run dev # Manual check
```

### E.5 Documentation Updates

- [ ] Update README if architecture changed
- [ ] Update API documentation
- [ ] Remove references to deleted features
- [ ] Update CLAUDE.md if patterns changed

---

*End of Specification Document*
