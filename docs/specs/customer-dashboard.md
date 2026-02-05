# Customer Dashboard Specification

## Overview

Customer dashboard হলো logged-in customer দের জন্য একটি protected area যেখানে তারা তাদের orders, documents, invoices এবং support tickets manage করতে পারবে।

**URL Structure:** `/dashboard/*`
**Access:** `CUSTOMER` role (authenticated users)

---

## Dashboard Pages Structure

```
/dashboard
├── /dashboard                    # Overview/Home
├── /dashboard/orders             # All orders list
│   └── /dashboard/orders/[id]    # Single order details
├── /dashboard/documents          # All documents
├── /dashboard/invoices           # All invoices
├── /dashboard/profile            # Profile settings
└── /dashboard/support            # Support tickets
    └── /dashboard/support/[id]   # Single ticket view
```

---

## Page 1: Dashboard Overview (`/dashboard`)

### Purpose
Customer এর সব গুরুত্বপূর্ণ information এক নজরে দেখানো।

### UI Components

#### 1.1 Welcome Section
```
👋 Welcome back, [Customer Name]!
Here's your account overview.
```

#### 1.2 Quick Stats Cards (4 cards in a row)
| Card | Icon | Data |
|------|------|------|
| Active Orders | 📦 | Count of non-completed orders |
| Pending Documents | 📄 | Documents awaiting upload/review |
| Open Tickets | 🎫 | Unresolved support tickets |
| Total Spent | 💰 | Sum of all paid orders (USD) |

#### 1.3 Recent Orders (Last 5)
| Column | Description |
|--------|-------------|
| Order # | ORD-2024-00001 format, clickable |
| Service | Service name |
| Status | Badge with color |
| Date | Created date |
| Action | "View" button |

#### 1.4 Document Checklist (Active Order এর জন্য)
```
📋 Documents Required for Order #ORD-2024-00156
├── ✅ Passport Copy (Approved)
├── 🟡 Utility Bill (Under Review)
├── ❌ Bank Statement (Rejected) [Re-upload]
└── ⚪ Address Proof (Not Uploaded) [Upload]

Progress: 2/4 approved
[Upload Missing Documents] button
```

#### 1.5 Notifications/Alerts
- Order status changes
- Document approval/rejection
- Payment reminders
- Ticket replies

#### 1.6 Quick Actions
| Action | Button |
|--------|--------|
| Start New Order | Primary CTA |
| Upload Document | Secondary |
| Contact Support | Secondary |

---

## Page 2: Orders List (`/dashboard/orders`)

### Purpose
Customer এর সব orders দেখানো এবং filter করার সুবিধা।

### UI Components

#### 2.1 Page Header
```
My Orders
[Filter Dropdown] [Search Box]
```

#### 2.2 Filter Options
| Filter | Options |
|--------|---------|
| Status | All, Pending, Processing, Completed, Cancelled |
| Date Range | Last 30 days, Last 90 days, This year, All time |
| Service Type | LLC Formation, Amazon Account, etc. |

#### 2.3 Orders Table/Cards
| Column | Description |
|--------|-------------|
| Order # | Clickable link to detail |
| Service | Service name + package |
| LLC Name | (if applicable) |
| State | (if LLC order) |
| Status | Color-coded badge |
| Total | Amount paid |
| Date | Order date |
| Actions | View, Download Invoice |

#### 2.4 Order Status Badges
| Status | Color | Description |
|--------|-------|-------------|
| Pending Payment | Gray | Awaiting payment |
| Processing | Blue | Payment received, work started |
| Waiting for Info | Orange | Documents/info needed |
| In Progress | Yellow | Actively being processed |
| Submitted | Purple | Submitted to state/authority |
| Completed | Green | All done |
| Cancelled | Red | Order cancelled |
| Refunded | Red outline | Refund processed |

#### 2.5 Empty State
```
No orders yet!
Start your US business journey today.
[Browse Services] button
```

#### 2.6 Pagination
- 10 orders per page
- Page numbers + Previous/Next

---

## Page 3: Order Details (`/dashboard/orders/[id]`)

### Purpose
Single order এর পূর্ণ বিবরণ এবং progress tracking।

### UI Components

#### 3.1 Order Header
```
Order #ORD-2024-00156
Status: [Processing Badge]
Placed on: December 10, 2024
```

#### 3.2 Order Progress Timeline (Vertical)
```
✅ Order Placed - Dec 10, 2024
   Payment received via Stripe

✅ Documents Uploaded - Dec 11, 2024
   All required documents submitted

🔵 Under Review - Dec 12, 2024 (Current)
   Our team is reviewing your documents

⚪ LLC Filing
   Will be submitted to Wyoming Secretary of State

⚪ EIN Application
   Federal Tax ID application

⚪ Completed
   All services delivered
```

#### 3.3 Order Summary Card
| Field | Value |
|-------|-------|
| Service | US LLC Formation |
| Package | Amazon Ready ($449) |
| State | Wyoming |
| LLC Name | "TechVenture LLC" |
| Add-ons | Expedited Filing (+$99) |
| State Fee | $100 |
| **Total** | **$648** |

#### 3.4 Documents Section
```
📄 Order Documents

Required Documents:
├── ✅ Passport Copy
│   └── passport_john.pdf (Approved Dec 11)
│       [View] [Download]
├── ✅ Address Proof
│   └── utility_bill.pdf (Approved Dec 11)
│       [View] [Download]
└── ⚪ Bank Statement (Optional)
    └── [Upload]

Delivered Documents:
├── 📄 Articles of Organization
│   └── Available after LLC approval
├── 📄 Operating Agreement
│   └── Available after LLC approval
└── 📄 EIN Letter
    └── Available after EIN received
```

#### 3.5 Payment Information
| Field | Value |
|-------|-------|
| Payment Method | Visa •••• 4242 |
| Transaction ID | pi_3Ox... |
| Payment Date | Dec 10, 2024 |
| Amount | $648.00 USD |
| Status | ✅ Paid |

[Download Invoice] button

#### 3.6 LLC Details (if applicable)
| Field | Value |
|-------|-------|
| LLC Name | TechVenture LLC |
| State | Wyoming |
| Type | Single-Member LLC |
| Registered Agent | Our Company Name |
| Formation Date | Pending |
| EIN | Pending |

#### 3.7 Contact/Notes Section
```
💬 Have questions about this order?
[Contact Support] button

Or reach us on WhatsApp: +1-XXX-XXX-XXXX
```

#### 3.8 Action Buttons
- [Download Invoice]
- [Upload Documents]
- [Contact Support]
- [Request Refund] (if eligible)

---

## Page 4: Documents (`/dashboard/documents`)

### Purpose
Customer এর সব uploaded documents এক জায়গায় manage করা।

### UI Components

#### 4.1 Page Header
```
My Documents
[Upload New] button    [Filter] [Search]
```

#### 4.2 Filter Options
| Filter | Options |
|--------|---------|
| Type | All, Passport, ID, Address Proof, Bank Statement, Other |
| Status | All, Pending, Approved, Rejected |
| Order | All orders, Specific order |

#### 4.3 Documents Grid/List View
Each document card shows:
```
┌─────────────────────────────────┐
│ 📄 passport_scan.pdf            │
│ Type: Passport                  │
│ Order: #ORD-2024-00156          │
│ Status: ✅ Approved             │
│ Uploaded: Dec 11, 2024          │
│                                 │
│ [View] [Download] [Delete]      │
└─────────────────────────────────┘
```

#### 4.4 Document Status Indicators
| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| Pending | ⏳ | Yellow | Awaiting review |
| Under Review | 🔍 | Blue | Being reviewed |
| Approved | ✅ | Green | Accepted |
| Rejected | ❌ | Red | Need to re-upload |

#### 4.5 Rejection Reason Display
```
❌ Rejected: Bank Statement
Reason: "Document is blurry. Please upload a clear, readable copy."
[Re-upload] button
```

#### 4.6 Upload Modal
```
Upload Document
─────────────────
Document Type: [Dropdown - Passport, ID, etc.]
Related Order: [Dropdown - Select order] (optional)

[Drag & drop files here or click to browse]
Accepted: PDF, JPG, PNG (max 10MB)

[Cancel] [Upload]
```

#### 4.7 Document Preview
- In-browser PDF/Image preview
- Zoom controls
- Download button
- Full-screen option

---

## Page 5: Invoices (`/dashboard/invoices`)

### Purpose
সব invoices দেখা এবং download করা।

### UI Components

#### 5.1 Page Header
```
My Invoices
[Filter by Year] [Search]
```

#### 5.2 Invoices Table
| Column | Description |
|--------|-------------|
| Invoice # | INV-2024-00001 |
| Order # | Related order link |
| Date | Invoice date |
| Amount | Total amount |
| Status | Paid, Pending, Overdue |
| Actions | View, Download PDF |

#### 5.3 Invoice Status Badges
| Status | Color |
|--------|-------|
| Paid | Green |
| Pending | Yellow |
| Overdue | Red |

#### 5.4 Invoice PDF Preview
Modal with PDF viewer + Download button

---

## Page 6: Profile Settings (`/dashboard/profile`)

### Purpose
Customer এর personal information এবং preferences manage করা।

### UI Components

#### 6.1 Profile Sections (Tabs or Accordion)

**Tab 1: Personal Information**
| Field | Type | Editable |
|-------|------|----------|
| Full Name | Text | Yes |
| Email | Email | No (verified) |
| Phone | Phone | Yes |
| Country | Dropdown | Yes |
| Address | Text | Yes |
| Profile Photo | Image Upload | Yes |

**Tab 2: Security**
| Field | Action |
|-------|--------|
| Password | [Change Password] button |
| Two-Factor Auth | Toggle (future) |
| Active Sessions | List with [Logout] option |

**Tab 3: Notifications**
| Notification Type | Email | SMS (future) |
|-------------------|-------|--------------|
| Order Updates | ✅ | ⬜ |
| Document Status | ✅ | ⬜ |
| Payment Receipts | ✅ | ⬜ |
| Marketing/Promotions | ⬜ | ⬜ |

**Tab 4: Billing Information** (future)
- Saved payment methods
- Billing address
- Tax information

#### 6.2 Change Password Modal
```
Change Password
───────────────
Current Password: [••••••••]
New Password: [••••••••]
Confirm Password: [••••••••]

Password requirements:
• At least 8 characters
• One uppercase letter
• One number

[Cancel] [Update Password]
```

#### 6.3 Delete Account (future)
```
⚠️ Delete Account
This action is irreversible. All your data will be permanently deleted.
[Request Account Deletion]
```

---

## Page 7: Support Tickets (`/dashboard/support`)

### Purpose
Customer support tickets manage করা।

### UI Components

#### 7.1 Page Header
```
Support Tickets
[Create New Ticket] button    [Filter] [Search]
```

#### 7.2 Filter Options
| Filter | Options |
|--------|---------|
| Status | All, Open, In Progress, Resolved, Closed |
| Priority | All, Low, Medium, High, Urgent |

#### 7.3 Tickets List
| Column | Description |
|--------|-------------|
| Ticket # | TKT-2024-00001 |
| Subject | Ticket title |
| Status | Badge |
| Priority | Badge |
| Last Update | Date/time |
| Actions | View |

#### 7.4 Ticket Status Badges
| Status | Color |
|--------|-------|
| Open | Blue |
| In Progress | Yellow |
| Waiting for Response | Orange |
| Resolved | Green |
| Closed | Gray |

#### 7.5 Create Ticket Modal/Page
```
Create Support Ticket
─────────────────────
Related Order: [Dropdown - Optional]
Subject: [Text input]
Priority: [Low / Medium / High]
Category: [Billing / Technical / Document / General]

Message:
[Textarea - Describe your issue...]

Attachments: [Upload files]

[Cancel] [Submit Ticket]
```

---

## Page 8: Ticket Details (`/dashboard/support/[id]`)

### Purpose
Single ticket এর conversation view।

### UI Components

#### 8.1 Ticket Header
```
Ticket #TKT-2024-00001
Subject: Question about EIN processing time
Status: [In Progress] Priority: [Medium]
Created: Dec 10, 2024
```

#### 8.2 Conversation Thread
```
┌─ Customer (You) ─────────────────── Dec 10, 2:30 PM ─┐
│ Hello, I submitted my LLC formation order 5 days    │
│ ago. When can I expect my EIN to be ready?          │
└─────────────────────────────────────────────────────┘

┌─ Support Team (Sarah) ──────────────Dec 10, 4:15 PM ─┐
│ Hi John! Thanks for reaching out.                    │
│                                                      │
│ Your LLC was approved yesterday. We've already      │
│ submitted your EIN application to the IRS.          │
│                                                      │
│ EIN typically takes 3-5 business days after LLC     │
│ approval. You should receive it by Dec 15.          │
│                                                      │
│ I'll update your order status now.                  │
└─────────────────────────────────────────────────────┘

┌─ Customer (You) ─────────────────── Dec 10, 4:20 PM ─┐
│ Great, thank you for the quick response!            │
└─────────────────────────────────────────────────────┘
```

#### 8.3 Reply Box
```
[Textarea - Type your reply...]
[Attach File]
[Send Reply] button
```

#### 8.4 Ticket Actions
- [Mark as Resolved] (customer can close)
- [Reopen Ticket] (if closed)

---

## Dashboard Layout

### Sidebar Navigation
```
┌──────────────────────┐
│ 🏢 LLCPad            │
├──────────────────────┤
│ 📊 Overview          │ ← Active indicator
│ 📦 My Orders         │
│ 📄 Documents         │
│ 🧾 Invoices          │
│ 👤 Profile           │
│ 🎫 Support           │
├──────────────────────┤
│ 🛒 New Order         │ ← CTA Button
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

### Top Header (Mobile & Desktop)
```
┌─────────────────────────────────────────────────────┐
│ ☰ (mobile)  LLCPad         🔔 Notifications  👤 John │
└─────────────────────────────────────────────────────┘
```

### Mobile Navigation
- Hamburger menu for sidebar
- Bottom navigation bar (optional):
  - Home | Orders | Documents | Support | Profile

---

## API Endpoints (Customer)

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customer/orders` | List all orders |
| GET | `/api/customer/orders/[id]` | Single order details |
| GET | `/api/customer/orders/[id]/timeline` | Order timeline |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customer/documents` | List all documents |
| POST | `/api/customer/documents/upload` | Upload document |
| DELETE | `/api/customer/documents/[id]` | Delete document |
| GET | `/api/customer/documents/[id]/download` | Download document |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customer/invoices` | List all invoices |
| GET | `/api/customer/invoices/[id]` | Invoice details |
| GET | `/api/customer/invoices/[id]/pdf` | Download PDF |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customer/profile` | Get profile |
| PATCH | `/api/customer/profile` | Update profile |
| POST | `/api/customer/profile/change-password` | Change password |
| PATCH | `/api/customer/profile/notifications` | Update preferences |

### Support
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customer/tickets` | List tickets |
| POST | `/api/customer/tickets` | Create ticket |
| GET | `/api/customer/tickets/[id]` | Ticket details |
| POST | `/api/customer/tickets/[id]/reply` | Reply to ticket |
| PATCH | `/api/customer/tickets/[id]/status` | Close/reopen ticket |

---

## Database Models (Customer Related)

### Existing Models Used
- `User` - Customer account
- `Order` - Customer orders
- `OrderItem` - Order line items
- `Document` - Uploaded documents
- `Invoice` - Payment invoices
- `Ticket` - Support tickets
- `TicketMessage` - Ticket replies

### Additional Fields Needed (if not exists)

```prisma
// Add to User model
model User {
  // ... existing fields
  phone           String?
  country         String?
  address         String?
  avatar          String?
  notifyEmail     Boolean @default(true)
  notifyOrderUpdate Boolean @default(true)
  notifyDocStatus Boolean @default(true)
  notifyMarketing Boolean @default(false)
}

// Add to Order model for timeline
model OrderTimeline {
  id        String   @id @default(cuid())
  orderId   String
  status    String
  title     String
  description String?
  createdAt DateTime @default(now())

  order     Order    @relation(fields: [orderId], references: [id])
}
```

---

## Security Considerations

### Authentication
- All `/dashboard/*` routes require authentication
- Middleware check for valid session
- Redirect to `/login` if not authenticated

### Authorization
- Customer can ONLY access their own data
- API endpoints must verify `userId` matches session user
- No access to other customers' orders/documents

### Data Protection
- Sensitive documents encrypted at rest (R2)
- Document URLs are signed/temporary (expire in 1 hour)
- No direct file path exposure

### Input Validation
- All form inputs validated with Zod
- File upload type/size restrictions
- XSS prevention on user-generated content

---

## UI/UX Guidelines

### Color Scheme (Status)
| Status Type | Color (Tailwind) |
|-------------|------------------|
| Success/Approved | `green-500` |
| Warning/Pending | `yellow-500` |
| Error/Rejected | `red-500` |
| Info/Processing | `blue-500` |
| Neutral/Draft | `gray-500` |

### Loading States
- Skeleton loaders for data fetching
- Button loading spinners
- Progress bars for uploads

### Empty States
- Friendly illustrations
- Clear call-to-action
- Helpful guidance text

### Error Handling
- Toast notifications for actions
- Form validation errors inline
- Friendly error pages

### Responsive Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, bottom nav |
| Tablet | 768-1024px | Collapsible sidebar |
| Desktop | > 1024px | Fixed sidebar |

---

## Implementation Priority

### Phase 1 (MVP)
1. ✅ Dashboard layout with sidebar
2. ⬜ Overview page with stats
3. ⬜ Orders list and detail pages
4. ⬜ Basic document upload/view

### Phase 2
5. ⬜ Documents management page
6. ⬜ Profile settings
7. ⬜ Support tickets

### Phase 3
8. ⬜ Invoices page
9. ⬜ Notifications system
10. ⬜ Advanced filters and search

---

## Notes

1. **Real-time Updates (Future)**: Consider WebSocket/SSE for live order status updates
2. **Multi-language (Future)**: Structure UI for i18n support (Bengali, Hindi)
3. **Mobile App (Future)**: API designed to support mobile app later
4. **Offline Support (Future)**: Consider PWA for document access offline

---

*Document Version: 1.0*
*Created: February 2026*
