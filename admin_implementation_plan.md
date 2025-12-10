# Admin Dashboard Implementation Plan

## Overview
Internal admin panel for managing LLCPad operations - orders, customers, content, and business settings.

**Target URL Structure:** `llcpad.com/admin`

---

## Phase 1: Admin Layout & Authentication

### 1.1 Admin Route Group Structure
```
src/app/admin/
├── layout.tsx              # Admin layout with sidebar
├── page.tsx                # Dashboard overview
├── loading.tsx             # Loading state
├── error.tsx               # Error boundary
├── orders/
│   ├── page.tsx            # Orders list
│   └── [id]/
│       ├── page.tsx        # Order detail
│       └── edit/page.tsx   # Edit order
├── customers/
│   ├── page.tsx            # Customers list
│   └── [id]/page.tsx       # Customer detail
├── services/
│   ├── page.tsx            # Services list
│   ├── new/page.tsx        # Create service
│   └── [id]/edit/page.tsx  # Edit service
├── packages/
│   ├── page.tsx            # Packages list
│   ├── new/page.tsx        # Create package
│   └── [id]/edit/page.tsx  # Edit package
├── content/
│   ├── blog/
│   │   ├── page.tsx        # Blog posts list
│   │   ├── new/page.tsx    # Create post
│   │   └── [id]/edit/page.tsx
│   ├── testimonials/
│   │   ├── page.tsx
│   │   └── [id]/edit/page.tsx
│   └── faq/
│       ├── page.tsx
│       └── [id]/edit/page.tsx
├── tickets/
│   ├── page.tsx            # All tickets
│   └── [id]/page.tsx       # Ticket conversation
├── documents/
│   └── page.tsx            # All documents
├── invoices/
│   ├── page.tsx            # Invoices list
│   └── [id]/page.tsx       # Invoice detail
├── coupons/
│   ├── page.tsx
│   └── new/page.tsx
├── state-fees/
│   └── page.tsx            # Manage state fees
├── users/
│   ├── page.tsx            # Staff users
│   └── [id]/edit/page.tsx
├── settings/
│   ├── page.tsx            # General settings
│   ├── payments/page.tsx   # Payment config
│   └── email/page.tsx      # Email templates
└── reports/
    ├── page.tsx            # Reports overview
    ├── sales/page.tsx
    └── analytics/page.tsx
```

### 1.2 Admin Middleware Protection
```typescript
// src/middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")

  if (isAdminRoute) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const allowedRoles = ["ADMIN", "CONTENT_MANAGER", "SALES_AGENT", "SUPPORT_AGENT"]
    if (!allowedRoles.includes(req.auth.user.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"]
}
```

### 1.3 Role-Based Access Control (RBAC)
```typescript
// src/lib/permissions.ts
export const PERMISSIONS = {
  ADMIN: ["*"], // All permissions
  CONTENT_MANAGER: [
    "blog:read", "blog:write", "blog:delete",
    "testimonials:read", "testimonials:write", "testimonials:delete",
    "faq:read", "faq:write", "faq:delete",
  ],
  SALES_AGENT: [
    "orders:read", "orders:write",
    "customers:read",
    "invoices:read", "invoices:write",
    "coupons:read",
  ],
  SUPPORT_AGENT: [
    "orders:read",
    "customers:read",
    "tickets:read", "tickets:write",
    "documents:read", "documents:write",
  ],
}

export function hasPermission(role: string, permission: string): boolean {
  const rolePermissions = PERMISSIONS[role] || []
  return rolePermissions.includes("*") || rolePermissions.includes(permission)
}
```

---

## Phase 2: Admin Layout Components

### 2.1 Admin Sidebar (`src/components/admin/sidebar.tsx`)
```
📊 Dashboard
📦 Orders
👥 Customers
🛠️ Services
📋 Packages
📝 Content
   ├── Blog
   ├── Testimonials
   └── FAQs
🎫 Tickets
📄 Documents
💳 Invoices
🏷️ Coupons
🗺️ State Fees
👤 Users
⚙️ Settings
📈 Reports
```

Features:
- Collapsible on mobile
- Active state indicators
- Badge counts (pending orders, open tickets)
- Role-based menu filtering

### 2.2 Admin Header (`src/components/admin/header.tsx`)
- Search bar (global search)
- Notifications dropdown
- Quick actions menu
- User profile dropdown
- Theme toggle (light/dark)

### 2.3 Common Admin Components
```
src/components/admin/
├── sidebar.tsx
├── header.tsx
├── data-table.tsx          # Reusable table with sorting/filtering
├── stat-card.tsx           # Dashboard stat cards
├── recent-activity.tsx     # Activity feed
├── status-badge.tsx        # Order/ticket status badges
├── action-menu.tsx         # Row action dropdown
├── confirm-dialog.tsx      # Delete confirmation
├── file-upload.tsx         # Document upload
├── rich-text-editor.tsx    # Blog content editor
├── date-range-picker.tsx   # Report date selection
└── charts/
    ├── revenue-chart.tsx
    ├── orders-chart.tsx
    └── country-chart.tsx
```

---

## Phase 3: Dashboard Overview

### 3.1 Dashboard Stats Cards
```typescript
// Key metrics to display
interface DashboardStats {
  totalRevenue: number           // This month
  revenueGrowth: number          // % vs last month
  totalOrders: number            // This month
  pendingOrders: number          // Needs attention
  newCustomers: number           // This month
  openTickets: number            // Unresolved
  pendingDocuments: number       // Awaiting review
  conversionRate: number         // Orders / Visitors
}
```

### 3.2 Dashboard Widgets
1. **Revenue Chart** - Line chart (30 days)
2. **Orders by Status** - Pie/Donut chart
3. **Recent Orders** - Table (last 5)
4. **Recent Tickets** - Table (last 5 open)
5. **Top Services** - Bar chart
6. **Customers by Country** - Map or bar chart
7. **Activity Feed** - Recent system events

### 3.3 Quick Actions
- Create new order
- Add customer
- Process pending orders
- View open tickets

---

## Phase 4: Orders Management

### 4.1 Orders List Page (`/admin/orders`)

#### Filters
- Status: All, Pending, Processing, In Progress, Completed, Cancelled
- Payment Status: All, Paid, Pending, Failed
- Date Range: Today, This Week, This Month, Custom
- Service Type
- Search: Order #, Customer name, Email

#### Table Columns
| Column | Type |
|--------|------|
| Order # | Link to detail |
| Customer | Name + Email |
| Service | Service name |
| Total | Amount + Currency |
| Status | Badge |
| Payment | Badge |
| Date | Relative time |
| Actions | Menu |

#### Bulk Actions
- Mark as Processing
- Mark as Completed
- Export to CSV
- Send bulk email

### 4.2 Order Detail Page (`/admin/orders/[id]`)

#### Sections
1. **Order Header**
   - Order number, status badges
   - Quick action buttons
   - Created/Updated timestamps

2. **Customer Information**
   - Name, Email, Phone
   - Country
   - Link to customer profile

3. **Order Items**
   - Service, Package, Quantity, Price
   - State fees breakdown
   - Subtotal, Discount, Total

4. **LLC Details** (if applicable)
   - LLC Name
   - State
   - Type (LLC, PLLC, etc.)

5. **Documents**
   - Upload/Download documents
   - Document status
   - Preview capability

6. **Timeline**
   - Status changes history
   - Notes history
   - Document uploads

7. **Internal Notes**
   - Add new note
   - Note history (staff only)

8. **Payment Information**
   - Payment method
   - Transaction ID
   - Payment date
   - Refund actions

### 4.3 Order Status Workflow
```
PENDING → PROCESSING → IN_PROGRESS → COMPLETED
    ↓         ↓            ↓
    └─── CANCELLED ←───────┘
              ↓
          REFUNDED
```

### 4.4 Order Actions
- Change status
- Add internal note
- Send customer email
- Upload document
- Generate/Download invoice
- Issue refund
- Cancel order

---

## Phase 5: Customer Management

### 5.1 Customers List (`/admin/customers`)

#### Filters
- Status: All, Active, Inactive
- Country
- Registration Date
- Has Orders: Yes/No
- Search: Name, Email, Phone

#### Table Columns
| Column | Type |
|--------|------|
| Customer | Avatar + Name |
| Email | Text |
| Country | Flag + Name |
| Orders | Count |
| Total Spent | Amount |
| Joined | Date |
| Actions | Menu |

### 5.2 Customer Detail (`/admin/customers/[id]`)

#### Sections
1. **Profile Overview**
   - Avatar, Name, Email
   - Phone, Country
   - Account status
   - Edit profile button

2. **Statistics**
   - Total orders
   - Total spent
   - Average order value
   - First/Last order date

3. **Orders History**
   - All orders table
   - Quick status view

4. **Documents**
   - All uploaded documents
   - Status of each

5. **Support Tickets**
   - Ticket history
   - Quick reply

6. **Activity Log**
   - Login history
   - Actions taken

### 5.3 Customer Actions
- Edit profile
- Reset password
- Send email
- Disable account
- View as customer (impersonate)
- Export data (GDPR)
- Delete account

---

## Phase 6: Services & Packages Management

### 6.1 Services List (`/admin/services`)
- Drag-drop reordering
- Active/Inactive toggle
- Edit, Duplicate, Delete actions
- View packages for each service

### 6.2 Service Editor (`/admin/services/[id]/edit`)
```typescript
interface ServiceForm {
  name: string
  slug: string              // Auto-generated, editable
  description: string       // Rich text editor
  shortDesc: string
  icon: string              // Icon picker
  image: string             // Image upload
  isActive: boolean
  sortOrder: number
  // SEO
  metaTitle: string
  metaDescription: string
  keywords: string[]
}
```

### 6.3 Packages List (`/admin/packages`)
- Filter by service
- Active/Inactive toggle
- Popular badge toggle
- Price editing inline

### 6.4 Package Editor (`/admin/packages/[id]/edit`)
```typescript
interface PackageForm {
  serviceId: string         // Select dropdown
  name: string              // Basic, Standard, Premium
  description: string       // Rich text
  priceUSD: number
  priceBDT: number
  features: string[]        // Dynamic list
  isPopular: boolean
  isActive: boolean
  sortOrder: number
}
```

---

## Phase 7: Content Management

### 7.1 Blog Management

#### Blog Posts List (`/admin/content/blog`)
- Filter: Status (Draft, Published, Archived)
- Filter: Category
- Search: Title, Content
- Sort: Date, Title

#### Blog Editor (`/admin/content/blog/[id]/edit`)
```typescript
interface BlogPostForm {
  title: string
  slug: string
  excerpt: string           // Short description
  content: string           // Rich text editor with image upload
  coverImage: string        // Image upload
  categories: string[]      // Multi-select
  tags: string[]            // Tag input
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  publishedAt: Date | null
  // SEO
  metaTitle: string
  metaDescription: string
}
```

Features:
- Auto-save drafts
- Preview mode
- Schedule publishing
- SEO preview (Google snippet)

#### Blog Categories
- Create/Edit/Delete categories
- Assign posts to categories

### 7.2 Testimonials Management

#### List View (`/admin/content/testimonials`)
- Drag-drop reordering
- Active/Inactive toggle

#### Editor
```typescript
interface TestimonialForm {
  name: string
  company: string
  country: string           // Country selector
  avatar: string            // Image upload
  content: string           // Text area
  rating: number            // 1-5 stars
  isActive: boolean
  sortOrder: number
}
```

### 7.3 FAQ Management

#### List View (`/admin/content/faq`)
- Group by category
- Drag-drop reordering within category

#### Editor
```typescript
interface FAQForm {
  question: string
  answer: string            // Rich text
  category: string          // Dropdown or new
  isActive: boolean
  sortOrder: number
}
```

---

## Phase 8: Support Tickets

### 8.1 Tickets List (`/admin/tickets`)

#### Filters
- Status: Open, In Progress, Waiting, Resolved, Closed
- Priority: Urgent, High, Medium, Low
- Assigned To: Agent selector
- Date Range

#### Table Columns
| Column | Type |
|--------|------|
| Ticket # | Link |
| Subject | Truncated text |
| Customer | Name + Email |
| Status | Badge |
| Priority | Badge |
| Assigned | Agent name |
| Last Reply | Relative time |
| Actions | Menu |

### 8.2 Ticket Detail (`/admin/tickets/[id]`)

#### Layout
- Left: Conversation thread
- Right: Ticket info sidebar

#### Sidebar Info
- Customer details
- Related orders
- Previous tickets
- Quick actions

#### Actions
- Reply (with email notification)
- Change status
- Change priority
- Assign to agent
- Add internal note
- Close ticket

#### Canned Responses
- Pre-defined reply templates
- Insert with one click
- Personalization variables

---

## Phase 9: Documents Management

### 9.1 Documents List (`/admin/documents`)

#### Filters
- Type: Passport, ID, EIN Letter, etc.
- Status: Pending, Approved, Rejected
- Customer
- Order
- Date Range

#### Table Columns
| Column | Type |
|--------|------|
| Name | Filename |
| Type | Document type |
| Customer | Name |
| Order | Order # link |
| Status | Badge |
| Uploaded | Date |
| Actions | Menu |

### 9.2 Document Actions
- Preview (in-browser for images/PDF)
- Download
- Approve
- Reject (with reason)
- Request re-upload

### 9.3 Bulk Document Operations
- Bulk approve
- Bulk download (ZIP)
- Export list to CSV

---

## Phase 10: Invoices & Finance

### 10.1 Invoices List (`/admin/invoices`)

#### Filters
- Status: Draft, Sent, Paid, Overdue
- Date Range
- Customer
- Amount Range

#### Features
- Generate invoice from order
- Send invoice email
- Mark as paid
- Download PDF
- Void invoice

### 10.2 Invoice Detail (`/admin/invoices/[id]`)
- Invoice preview
- PDF download
- Send/Resend email
- Payment recording
- Partial payment support

### 10.3 Invoice Template
- Company logo
- Invoice number
- Customer billing details
- Line items
- Subtotal, Tax, Total
- Payment terms
- Bank details

---

## Phase 11: Coupons & Discounts

### 11.1 Coupons List (`/admin/coupons`)
- Active/Expired filter
- Usage statistics
- Quick enable/disable

### 11.2 Coupon Editor
```typescript
interface CouponForm {
  code: string              // Auto-generate option
  description: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  minOrder: number | null   // Minimum order value
  maxDiscount: number | null // Max discount for %
  usageLimit: number | null // Total uses allowed
  isActive: boolean
  expiresAt: Date | null
}
```

### 11.3 Coupon Features
- One-time vs Multi-use
- Expiration date
- Minimum order requirement
- Service-specific coupons
- Customer-specific coupons

---

## Phase 12: State Fees Management

### 12.1 State Fees List (`/admin/state-fees`)
- All 50 states + DC
- Sortable by fee
- Popular state toggle
- Quick inline editing

### 12.2 State Fee Editor
```typescript
interface StateFeeForm {
  stateCode: string         // Read-only
  stateName: string
  llcFee: number
  annualFee: number
  processingTime: string
  isPopular: boolean
  // Landing page content
  metaTitle: string
  metaDescription: string
  content: string           // Rich text for landing page
}
```

---

## Phase 13: User Management

### 13.1 Staff Users List (`/admin/users`)
- Role filter
- Active/Inactive filter
- Last login column

### 13.2 User Editor
```typescript
interface StaffUserForm {
  name: string
  email: string
  role: UserRole
  isActive: boolean
  permissions: string[]     // Fine-grained permissions
}
```

### 13.3 Activity Logging
- Track all admin actions
- Who did what, when
- Audit trail for compliance

---

## Phase 14: Settings

### 14.1 General Settings (`/admin/settings`)
```typescript
interface GeneralSettings {
  siteName: string
  siteUrl: string
  supportEmail: string
  supportPhone: string
  address: string
  timezone: string
  currency: {
    default: string
    exchangeRate: number    // USD to BDT
  }
  socialLinks: {
    facebook: string
    twitter: string
    linkedin: string
    instagram: string
  }
}
```

### 14.2 Payment Settings (`/admin/settings/payments`)
- Stripe configuration
- SSLCommerz configuration
- Enable/disable payment methods
- Test mode toggle

### 14.3 Email Settings (`/admin/settings/email`)
- SMTP/Resend configuration
- Email templates editor
- Test email functionality
- Email signature

### 14.4 Notification Settings
- Order notifications
- Ticket notifications
- Document notifications
- Admin alerts

---

## Phase 15: Reports & Analytics

### 15.1 Reports Overview (`/admin/reports`)
- Quick stats summary
- Date range selector
- Export all data option

### 15.2 Sales Reports (`/admin/reports/sales`)
```typescript
interface SalesReport {
  period: "daily" | "weekly" | "monthly" | "yearly"
  metrics: {
    revenue: number
    orders: number
    averageOrderValue: number
    refunds: number
    netRevenue: number
  }
  breakdown: {
    byService: ServiceRevenue[]
    byState: StateRevenue[]
    byCountry: CountryRevenue[]
    byPaymentMethod: PaymentRevenue[]
  }
}
```

Charts:
- Revenue over time (line)
- Orders by status (pie)
- Revenue by service (bar)
- Top states (bar)
- Customer countries (map)

### 15.3 Customer Analytics
- New vs returning customers
- Customer lifetime value
- Geographic distribution
- Acquisition channels

### 15.4 Export Options
- Export to CSV
- Export to Excel
- PDF reports
- Scheduled email reports

---

## Phase 16: Admin API Endpoints

### Order APIs
```
GET    /api/admin/orders              # List orders (with filters)
GET    /api/admin/orders/:id          # Get order detail
PATCH  /api/admin/orders/:id          # Update order
POST   /api/admin/orders/:id/status   # Change status
POST   /api/admin/orders/:id/notes    # Add note
POST   /api/admin/orders/:id/refund   # Process refund
```

### Customer APIs
```
GET    /api/admin/customers           # List customers
GET    /api/admin/customers/:id       # Get customer detail
PATCH  /api/admin/customers/:id       # Update customer
DELETE /api/admin/customers/:id       # Delete customer
POST   /api/admin/customers/:id/email # Send email
```

### Service APIs
```
GET    /api/admin/services            # List services
POST   /api/admin/services            # Create service
GET    /api/admin/services/:id        # Get service
PATCH  /api/admin/services/:id        # Update service
DELETE /api/admin/services/:id        # Delete service
PATCH  /api/admin/services/reorder    # Reorder services
```

### Package APIs
```
GET    /api/admin/packages            # List packages
POST   /api/admin/packages            # Create package
PATCH  /api/admin/packages/:id        # Update package
DELETE /api/admin/packages/:id        # Delete package
```

### Content APIs
```
# Blog
GET    /api/admin/blog                # List posts
POST   /api/admin/blog                # Create post
PATCH  /api/admin/blog/:id            # Update post
DELETE /api/admin/blog/:id            # Delete post

# Testimonials
GET    /api/admin/testimonials
POST   /api/admin/testimonials
PATCH  /api/admin/testimonials/:id
DELETE /api/admin/testimonials/:id

# FAQ
GET    /api/admin/faq
POST   /api/admin/faq
PATCH  /api/admin/faq/:id
DELETE /api/admin/faq/:id
```

### Ticket APIs
```
GET    /api/admin/tickets             # List tickets
GET    /api/admin/tickets/:id         # Get ticket
PATCH  /api/admin/tickets/:id         # Update ticket
POST   /api/admin/tickets/:id/reply   # Reply to ticket
```

### Document APIs
```
GET    /api/admin/documents           # List documents
PATCH  /api/admin/documents/:id       # Update status
POST   /api/admin/documents/:id/approve
POST   /api/admin/documents/:id/reject
```

### Invoice APIs
```
GET    /api/admin/invoices
POST   /api/admin/invoices            # Generate from order
GET    /api/admin/invoices/:id
PATCH  /api/admin/invoices/:id
POST   /api/admin/invoices/:id/send
```

### Report APIs
```
GET    /api/admin/reports/dashboard   # Dashboard stats
GET    /api/admin/reports/sales       # Sales report
GET    /api/admin/reports/customers   # Customer analytics
GET    /api/admin/reports/export      # Export data
```

### Settings APIs
```
GET    /api/admin/settings            # Get all settings
PATCH  /api/admin/settings            # Update settings
GET    /api/admin/settings/:key       # Get specific setting
```

---

## Implementation Checklist

### Week 1-2: Foundation - COMPLETED
- [x] Admin route group setup
- [x] Admin layout with sidebar
- [ ] Role-based middleware
- [ ] RBAC system
- [x] Admin header component
- [x] Data table component
- [x] Common UI components (StatCard, etc.)

### Week 3-4: Orders & Customers - COMPLETED
- [x] Orders list page
- [x] Order detail page
- [x] Order status workflow (UI)
- [x] Order actions (UI)
- [x] Customers list page
- [x] Customer detail page
- [x] Customer actions (UI)

### Week 5-6: Services & Content
- [ ] Services CRUD
- [ ] Packages CRUD
- [ ] Blog post editor
- [ ] Rich text editor integration
- [ ] Image upload system
- [ ] Testimonials CRUD
- [ ] FAQ CRUD

### Week 7-8: Support & Documents - COMPLETED
- [x] Tickets list
- [x] Ticket conversation view
- [x] Canned responses (UI)
- [ ] Documents management
- [ ] Document preview
- [ ] Document approval workflow

### Week 9-10: Finance & Settings
- [ ] Invoices management
- [ ] Invoice PDF generation
- [ ] Coupons CRUD
- [ ] State fees management
- [ ] General settings
- [ ] Payment settings
- [ ] Email settings

### Week 11-12: Reports & Polish - PARTIAL
- [x] Dashboard overview
- [ ] Sales reports
- [ ] Customer analytics
- [ ] Charts integration
- [ ] Export functionality
- [ ] User management
- [ ] Activity logging
- [ ] Final testing

---

## Security Considerations

1. **Authentication**
   - Session-based auth
   - Session timeout (30 mins idle)
   - Force logout on password change

2. **Authorization**
   - RBAC on every route
   - API-level permission checks
   - Audit logging

3. **Data Protection**
   - Input validation (Zod)
   - XSS prevention
   - CSRF tokens
   - SQL injection prevention (Prisma)

4. **File Security**
   - Validate file types
   - Scan for malware
   - Secure storage (R2)
   - Signed URLs

5. **Audit Trail**
   - Log all admin actions
   - IP logging
   - Timestamp logging

---

## Performance Optimization

1. **Pagination**
   - All list pages paginated
   - Default 20 items per page
   - Cursor-based for large datasets

2. **Caching**
   - Cache dashboard stats
   - Cache report data
   - Invalidate on changes

3. **Lazy Loading**
   - Charts loaded on demand
   - Heavy components code-split

4. **Database**
   - Proper indexes
   - Query optimization
   - Connection pooling

---

## Notes

1. **Real-time Updates**: Consider WebSocket for ticket notifications
2. **Offline Support**: PWA capabilities for admin on mobile
3. **Dark Mode**: Respect system preference, allow toggle
4. **Keyboard Shortcuts**: Power user features (Ctrl+K search, etc.)
5. **Undo Actions**: Grace period for deletions
6. **Bulk Operations**: Select-all, bulk actions for efficiency
