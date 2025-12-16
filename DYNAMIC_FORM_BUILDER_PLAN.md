# Dynamic Service Form Builder - Architecture Plan

## 🎯 Main Goal

CodeCanyon-ready, no-code form builder যেখানে admin যেকোনো service এর জন্য multi-step application form তৈরি করতে পারবে।

**Important:** Current design এবং existing functionality unchanged থাকবে।

---

## Current State Analysis

### যা আছে (Existing - NOT TO BE CHANGED)

| Component | Location | Status |
|-----------|----------|--------|
| Dynamic Form Config | `src/lib/data/service-forms.ts` | Static file, 46K+ tokens |
| Service Checkout | `src/app/checkout/[service]/page.tsx` | Working, reads from config |
| LLC Checkout | `src/app/checkout/page.tsx` | Hardcoded, separate system |
| State Selector | `src/components/ui/state-selector.tsx` | API-driven, dynamic |
| Country Selector | `src/components/ui/country-selector.tsx` | Hardcoded array |
| State Fees | `StateFee` model in Prisma | Database-driven |

### Supported Field Types (Current)

```typescript
type FieldType =
  | 'text' | 'email' | 'phone' | 'number' | 'date'
  | 'select' | 'textarea' | 'checkbox' | 'radio'
  | 'file' | 'country' | 'state';
```

---

## 📊 Database Schema Design

### 1. Form Template Structure

```prisma
// Form template for each service
model ServiceFormTemplate {
  id          String   @id @default(cuid())
  serviceId   String   @unique
  service     Service  @relation(fields: [serviceId], references: [id])

  tabs        FormTab[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Each tab in the form (Step 1, Step 2, etc.)
model FormTab {
  id              String   @id @default(cuid())
  templateId      String
  template        ServiceFormTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  name            String   // "Personal Information"
  description     String?  // "Your basic personal details"
  order           Int      // 1, 2, 3...
  icon            String?  // "user", "map-pin", "file"

  fields          FormField[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([templateId, order])
}

// Individual form fields
model FormField {
  id              String   @id @default(cuid())
  tabId           String
  tab             FormTab  @relation(fields: [tabId], references: [id], onDelete: Cascade)

  // Field Configuration
  name            String   // "firstName", "countryOfBirth"
  label           String   // "First Name", "Country of Birth"
  type            FieldType
  placeholder     String?
  helpText        String?  // Tooltip text
  defaultValue    String?

  // Validation
  required        Boolean  @default(false)
  validation      Json?    // { minLength: 2, maxLength: 50, pattern: "^[a-zA-Z]+$" }

  // Layout
  order           Int
  width           FieldWidth @default(FULL) // FULL, HALF, THIRD

  // Dynamic Options (for select, radio, checkbox)
  options         Json?    // Static: [{ value: "US", label: "United States" }]
  dataSourceType  DataSourceType? // STATIC, COUNTRY_LIST, STATE_LIST, CUSTOM_API
  dataSourceKey   String?  // "countries", "us_states", custom endpoint

  // Conditional Logic
  conditionalLogic Json?   // { show: true, when: "fieldName", operator: "equals", value: "US" }

  // Dependencies
  dependsOn       String?  // Another field's name (e.g., state depends on country)

  // File upload settings
  accept          String?  // ".pdf,.jpg,.png"
  maxSize         Int?     // Max file size in MB

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([tabId, order])
}

enum FieldType {
  TEXT
  EMAIL
  PHONE
  NUMBER
  DATE
  TEXTAREA
  SELECT
  MULTI_SELECT
  RADIO
  CHECKBOX
  CHECKBOX_GROUP
  FILE_UPLOAD
  IMAGE_UPLOAD
  COUNTRY_SELECT
  STATE_SELECT
  ADDRESS
  SIGNATURE
  RICH_TEXT
  HEADING
  PARAGRAPH
  DIVIDER
}

enum FieldWidth {
  FULL      // 100%
  HALF      // 50%
  THIRD     // 33%
  TWO_THIRD // 66%
}

enum DataSourceType {
  STATIC          // Options defined in field
  COUNTRY_LIST    // From system country list
  STATE_LIST      // Depends on selected country
  CURRENCY_LIST   // System currencies
  CUSTOM_LIST     // From CustomList model
  API_ENDPOINT    // External API
}
```

### 2. Dynamic Data Sources

```prisma
// System-managed lists (Countries, States, etc.)
model SystemList {
  id          String   @id @default(cuid())
  key         String   @unique // "countries", "us_states", "currencies"
  name        String   // "Countries", "US States"
  type        String   // "country", "state", "currency"

  items       SystemListItem[]

  isEditable  Boolean  @default(false) // Admin can edit?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SystemListItem {
  id          String   @id @default(cuid())
  listId      String
  list        SystemList @relation(fields: [listId], references: [id], onDelete: Cascade)

  value       String   // "US", "BD"
  label       String   // "United States", "Bangladesh"
  code        String?  // ISO code
  icon        String?  // Flag emoji or URL
  metadata    Json?    // { phoneCode: "+1", currency: "USD" }

  parentId    String?  // For hierarchical data (state -> country)
  parent      SystemListItem? @relation("ListItemHierarchy", fields: [parentId], references: [id])
  children    SystemListItem[] @relation("ListItemHierarchy")

  order       Int      @default(0)
  isPopular   Boolean  @default(false)  // Show in quick select
  isActive    Boolean  @default(true)

  @@index([listId, parentId])
  @@index([listId, isPopular])
  @@unique([listId, value])
}

// Custom lists created by admin
model CustomList {
  id          String   @id @default(cuid())
  key         String   @unique
  name        String
  description String?

  items       CustomListItem[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CustomListItem {
  id          String   @id @default(cuid())
  listId      String
  list        CustomList @relation(fields: [listId], references: [id], onDelete: Cascade)

  value       String
  label       String
  metadata    Json?
  order       Int      @default(0)
  isActive    Boolean  @default(true)

  @@index([listId])
}
```

### 3. Form Submissions

```prisma
// Store form submissions
model FormSubmission {
  id              String   @id @default(cuid())
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id])

  templateId      String
  templateVersion Int      // Track which version of form was used

  data            Json     // All form data as JSON

  // File references
  files           FormSubmissionFile[]

  status          SubmissionStatus @default(DRAFT)
  submittedAt     DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model FormSubmissionFile {
  id              String   @id @default(cuid())
  submissionId    String
  submission      FormSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  fieldName       String   // Which field this file belongs to
  fileName        String
  fileUrl         String
  fileSize        Int
  mimeType        String

  createdAt       DateTime @default(now())
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  NEEDS_REVISION
}
```

### 4. State Fee Integration (Existing Model - Link Only)

```prisma
// State fees for services (already exists, just linking)
model StateFee {
  id          String   @id @default(cuid())
  state       String   // "Wyoming", "Delaware"
  stateCode   String   // "WY", "DE"

  // Link to SystemListItem for consistency
  stateItemId String?

  // Fee structure
  filingFee   Decimal
  expeditedFee Decimal?
  annualFee   Decimal?

  // Processing times
  processingDays    Int
  expeditedDays     Int?

  // Additional info
  features    Json?    // State-specific features
  notes       String?

  isActive    Boolean  @default(true)

  @@unique([stateCode])
}
```

### 5. Existing Model Updates (Minimal - Additive Only)

```prisma
// Add relation to Service model
model Service {
  // ... existing fields unchanged ...

  // NEW: Form template relation
  formTemplate ServiceFormTemplate?
}

// Add relation to Order model (for future)
model Order {
  // ... existing fields unchanged ...

  // NEW: Form submissions (optional)
  formSubmissions FormSubmission[]
}
```

---

## 🏗️ Admin Dashboard - Form Builder UI

### Form Builder Features

```
┌─────────────────────────────────────────────────────────────────┐
│  Service: ITIN Application                                       │
│  Form Builder                                            [Save]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TABS                          PREVIEW                           │
│  ┌──────────────────┐         ┌──────────────────────────────┐  │
│  │ + Add Tab        │         │  1. Personal Information     │  │
│  │                  │         │  ─────────────────────────── │  │
│  │ 1. Personal Info │◄──────► │  First Name *    [________]  │  │
│  │    ≡ drag        │         │  Last Name *     [________]  │  │
│  │                  │         │  Date of Birth * [________]  │  │
│  │ 2. Address       │         │  Country         [▼ Select]  │  │
│  │    ≡ drag        │         │                              │  │
│  │                  │         │       [Previous] [Next]      │  │
│  │ 3. Documents     │         └──────────────────────────────┘  │
│  │    ≡ drag        │                                           │
│  │                  │         FIELD PROPERTIES                  │
│  └──────────────────┘         ┌──────────────────────────────┐  │
│                               │  Label: First Name           │  │
│  FIELD TYPES                  │  Name:  firstName            │  │
│  ┌──────────────────┐         │  Type:  [Text ▼]             │  │
│  │ 📝 Text          │         │  Width: [Half ▼]             │  │
│  │ 📧 Email         │         │  ☑ Required                  │  │
│  │ 📱 Phone         │         │  Placeholder: Enter name...  │  │
│  │ 📅 Date          │         │  Help Text: ⓘ tooltip        │  │
│  │ 🔽 Select        │         │                              │  │
│  │ 🌍 Country       │         │  VALIDATION                  │  │
│  │ 🗺️ State         │         │  Min Length: [2]             │  │
│  │ 📤 File Upload   │         │  Max Length: [50]            │  │
│  │ ✍️ Signature     │         │  Pattern: [_______]          │  │
│  │ ─ Divider        │         │                              │  │
│  │ H Heading        │         │  CONDITIONAL LOGIC           │  │
│  └──────────────────┘         │  Show when: [field] = [val]  │  │
│                               └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Tab Configuration

```
┌─────────────────────────────────────────┐
│  Edit Tab                         [X]   │
├─────────────────────────────────────────┤
│                                         │
│  Tab Name *                             │
│  [Personal Information        ]         │
│                                         │
│  Description                            │
│  [Your basic personal details ]         │
│                                         │
│  Icon                                   │
│  [user ▼] 👤 📍 📄 💳 📤               │
│                                         │
│  Order                                  │
│  [1]                                    │
│                                         │
│        [Cancel]  [Save Tab]             │
└─────────────────────────────────────────┘
```

---

## 🔄 Data Source Management

### Admin Panel - Lists Management

```
┌─────────────────────────────────────────────────────────────────┐
│  Data Sources / Lists                              [+ New List]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SYSTEM LISTS (Built-in)                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🌍 Countries          │ 195 items │ System  │ [View]    │   │
│  │ 🇺🇸 US States          │ 50 items  │ System  │ [View]    │   │
│  │ 💰 Currencies         │ 150 items │ System  │ [View]    │   │
│  │ 📞 Phone Codes        │ 195 items │ System  │ [View]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  CUSTOM LISTS                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📋 Business Types     │ 12 items  │ Custom  │ [Edit]    │   │
│  │ 📋 Industry Types     │ 25 items  │ Custom  │ [Edit]    │   │
│  │ 📋 Tax Filing Status  │ 5 items   │ Custom  │ [Edit]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  STATE FEES                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Configure state-specific fees for services              │   │
│  │                                      [Manage Fees →]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Form Renderer

### Dynamic Form Component Architecture

```typescript
// Types
interface FormConfig {
  tabs: TabConfig[];
  settings: FormSettings;
}

interface TabConfig {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  fields: FieldConfig[];
}

interface FieldConfig {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  width: 'full' | 'half' | 'third' | 'two-third';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  validation?: ValidationRules;
  options?: Option[];
  dataSource?: DataSourceConfig;
  conditionalLogic?: ConditionalLogic;
  dependsOn?: string;
}

interface DataSourceConfig {
  type: 'static' | 'country_list' | 'state_list' | 'custom_list' | 'api';
  key?: string;
  endpoint?: string;
  dependsOnField?: string; // For cascading selects
}
```

### Form Renderer Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   1. Fetch Form Template                                        │
│      GET /api/services/{slug}/form-template                     │
│                     ↓                                           │
│   2. Fetch Data Sources                                         │
│      GET /api/lists/countries                                   │
│      GET /api/lists/states?country=US (lazy load)              │
│                     ↓                                           │
│   3. Render Form with React Hook Form                           │
│      - Dynamic field rendering based on type                    │
│      - Validation from config                                   │
│      - Conditional field visibility                             │
│                     ↓                                           │
│   4. Handle Cascading Selects                                   │
│      - Country changes → Fetch states                           │
│      - State changes → Update fees                              │
│                     ↓                                           │
│   5. Submit Form Data                                           │
│      POST /api/orders/{orderId}/submission                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 State Fee Dynamic Integration

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  Order Summary                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LLC Formation (Standard)                             $99       │
│                                                                  │
│  State: [Wyoming ▼]  ←── User selects state                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  Base Price:                              $99       │       │
│  │  Wyoming State Filing Fee:               +$100      │ ←──── │
│  │  Registered Agent (1 year):              +$49       │  Fee  │
│  │  ─────────────────────────────────────────────      │  from │
│  │  Total:                                  $248       │  DB   │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
│  Processing Time: 3-5 business days                             │
│  [Need it faster? Expedited +$50, 24 hours]                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 API Endpoints

### Public APIs (Frontend)

```
// Get form template for a service
GET /api/services/{slug}/form-template
Response: FormConfig

// Get list data
GET /api/lists/{key}
GET /api/lists/states?country=US
Response: ListItem[]

// Get state fees
GET /api/state-fees?state=WY
GET /api/state-fees?serviceId=xxx&state=WY
Response: StateFee

// Calculate order total
POST /api/orders/calculate
Body: { serviceId, packageId, state, addons[] }
Response: { subtotal, stateFee, total, processingDays }

// Save form submission
POST /api/orders/{orderId}/submission
Body: { tabId, data: {} }

// Complete form submission
PUT /api/orders/{orderId}/submission/complete
```

### Admin Form Builder API

```
// Form Template CRUD
GET    /api/admin/services/{id}/form-template
POST   /api/admin/services/{id}/form-template
PUT    /api/admin/services/{id}/form-template

// Tab Management
POST   /api/admin/form-templates/{id}/tabs
PUT    /api/admin/form-templates/{id}/tabs/{tabId}
DELETE /api/admin/form-templates/{id}/tabs/{tabId}
PUT    /api/admin/form-templates/{id}/tabs/reorder

// Field Management
POST   /api/admin/form-tabs/{tabId}/fields
PUT    /api/admin/form-tabs/{tabId}/fields/{fieldId}
DELETE /api/admin/form-tabs/{tabId}/fields/{fieldId}
PUT    /api/admin/form-tabs/{tabId}/fields/reorder

// List Management
GET    /api/admin/lists
POST   /api/admin/lists
PUT    /api/admin/lists/{id}
DELETE /api/admin/lists/{id}

// List Items
POST   /api/admin/lists/{id}/items
PUT    /api/admin/lists/{id}/items/{itemId}
DELETE /api/admin/lists/{id}/items/{itemId}
PUT    /api/admin/lists/{id}/items/reorder
POST   /api/admin/lists/{id}/import  // CSV import
```

---

## 📦 Seed Data for Demo

```typescript
// seed-form-templates.ts
const formTemplates = {
  llcFormation: {
    tabs: [
      {
        name: "Business Information",
        fields: [
          { name: "businessName", label: "Business Name", type: "TEXT", required: true },
          { name: "businessType", label: "Business Type", type: "SELECT", dataSource: { type: "custom_list", key: "business_types" } },
          { name: "state", label: "Formation State", type: "STATE_SELECT", required: true },
          // ...
        ]
      },
      {
        name: "Owner Information",
        fields: [
          { name: "ownerFirstName", label: "First Name", type: "TEXT", required: true },
          { name: "ownerLastName", label: "Last Name", type: "TEXT", required: true },
          // ...
        ]
      },
      // More tabs...
    ]
  },

  itinApplication: {
    tabs: [
      {
        name: "Personal Information",
        fields: [
          { name: "firstName", label: "First Name", type: "TEXT", required: true, width: "HALF" },
          { name: "middleName", label: "Middle Name", type: "TEXT", width: "HALF" },
          { name: "lastName", label: "Last Name", type: "TEXT", required: true },
          { name: "dateOfBirth", label: "Date of Birth", type: "DATE", required: true },
          { name: "countryOfBirth", label: "Country of Birth", type: "COUNTRY_SELECT", required: true },
          { name: "citizenship", label: "Country of Citizenship", type: "COUNTRY_SELECT", required: true },
        ]
      },
      // More tabs...
    ]
  }
};
```

---

## 📋 Implementation Phases

### Phase 1: Database & API (Backend)
- [x] Create Prisma models (additive, no existing model changes) ✅ completed
- [x] Run migration ✅ completed
- [x] Seed system lists (countries, states, currencies) ✅ completed
- [x] Create form template API endpoints ✅ completed
- [x] Create list management API endpoints ✅ completed

### Phase 2: Admin Form Builder
- [x] Tab management UI (add, edit, delete, reorder) ✅ completed
- [x] Field management UI (drag & drop) ✅ completed
- [x] Field property editor ✅ completed
- [x] Preview mode ✅ completed
- [ ] Template import/export

### Phase 3: Frontend Form Renderer
- [x] Dynamic form renderer component ✅ completed
- [x] Field type components (text, select, date, file, etc.) ✅ completed
- [x] Cascading select logic ✅ completed
- [x] Conditional field visibility ✅ completed
- [x] Validation engine ✅ completed

### Phase 4: State Fee Integration
- [x] State fee management UI ✅ completed
- [x] Dynamic price calculation ✅ completed
- [x] Order summary component ✅ completed
- [x] Checkout integration ✅ completed

### Phase 5: Polish & Documentation
- [x] State fees seeder (from SystemList) ✅ completed
- [x] Demo form template seeder (LLC Formation) ✅ completed
- [ ] User documentation
- [ ] CodeCanyon documentation

---

## 📁 File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── services/
│   │   │   └── [id]/
│   │   │       └── form-builder/
│   │   │           └── page.tsx          # Form builder UI
│   │   └── settings/
│   │       └── lists/
│   │           ├── page.tsx              # Lists overview
│   │           └── [key]/
│   │               └── page.tsx          # List editor
│   └── api/
│       ├── admin/
│       │   ├── form-templates/
│       │   │   └── [id]/
│       │   │       ├── route.ts          # Template CRUD
│       │   │       └── tabs/
│       │   │           └── route.ts      # Tab management
│       │   ├── form-tabs/
│       │   │   └── [tabId]/
│       │   │       └── fields/
│       │   │           └── route.ts      # Field management
│       │   ├── lists/
│       │   │   └── route.ts              # System lists
│       │   └── custom-lists/
│       │       └── route.ts              # Custom lists
│       ├── services/
│       │   └── [slug]/
│       │       └── form/
│       │           └── route.ts          # Public form API
│       └── lists/
│           └── route.ts                  # Public list API
├── components/
│   ├── admin/
│   │   └── form-builder/
│   │       ├── form-builder.tsx          # Main builder component
│   │       ├── tab-manager.tsx           # Tab sidebar
│   │       ├── field-palette.tsx         # Field type selector
│   │       ├── field-editor.tsx          # Field properties panel
│   │       ├── field-renderer.tsx        # Preview field
│   │       └── preview-mode.tsx          # Full form preview
│   └── checkout/
│       └── dynamic-form-renderer.tsx     # Frontend form renderer
├── lib/
│   ├── api/
│   │   └── form-api.ts                   # API client functions
│   └── validations/
│       └── form-schema.ts                # Zod schemas for form
└── prisma/
    ├── schema.prisma                     # Updated schema
    └── seeds/
        ├── seed-system-lists.ts          # Countries, states, etc.
        └── seed-form-templates.ts        # Demo form templates
```

---

## 🔒 Security Considerations

1. **Admin Only**: Form builder APIs require ADMIN role
2. **Input Sanitization**: All field values sanitized before storage
3. **File Validation**: File uploads validated by type and size
4. **CSRF Protection**: All mutations use POST/PUT/DELETE
5. **Rate Limiting**: API endpoints rate-limited

---

## ⚡ Performance Considerations

1. **Caching**: Form templates cached for 60 seconds
2. **Lazy Loading**: List data loaded on demand
3. **Pagination**: Large lists use cursor-based pagination
4. **Optimistic Updates**: UI updates before API confirms
5. **Debouncing**: Search inputs debounced (300ms)

---

## 🎯 Key Benefits for CodeCanyon

1. **No-Code Form Builder** - Users can create any service form
2. **Pre-built Templates** - Quick start with common forms
3. **Dynamic Pricing** - State fees auto-calculated
4. **Extensible** - Add custom fields, lists, data sources
5. **Multi-step Forms** - Professional checkout experience
6. **File Uploads** - Document collection built-in
7. **Conditional Logic** - Smart forms that adapt
8. **Mobile Responsive** - Works on all devices

---

## ⚠️ Important Notes

- **LLC Checkout**: Remains separate for now (can be migrated later)
- **Backward Compatible**: Existing orders unaffected
- **Gradual Migration**: Services can be migrated one by one
- **Fallback**: If no DB template, can fallback to service-forms.ts
- **Current Design**: All existing UI/UX remains unchanged
