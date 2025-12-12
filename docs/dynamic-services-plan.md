# Dynamic Services Management System - Implementation Plan

## Overview

Transform the hardcoded services system into a fully dynamic, admin-manageable system where all service categories, services, packages, and FAQs can be created, updated, and deleted from the admin dashboard.

---

## Current State

- Services are hardcoded in `src/lib/data/services.ts`
- 25+ services with packages, FAQs, features
- Service pages read from static TypeScript file
- No admin interface for service management

---

## Target State

- All services stored in PostgreSQL database
- Admin dashboard with full CRUD operations
- Rich text editor (Sun Editor) for descriptions
- Real-time updates without code deployment
- Image upload for service icons/images

---

## Database Schema

### 1. ServiceCategory Table
```prisma
model ServiceCategory {
  id          String    @id @default(cuid())
  name        String    // "Formation & Legal"
  slug        String    @unique // "formation-legal"
  description String?
  icon        String?   // Icon name from lucide-react
  order       Int       @default(0) // Display order
  isActive    Boolean   @default(true)

  services    Service[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### 2. Service Table
```prisma
model Service {
  id              String    @id @default(cuid())
  name            String    // "LLC Formation"
  slug            String    @unique // "llc-formation"
  shortDesc       String    // Short description for cards
  description     String    @db.Text // Rich HTML content (Sun Editor)
  icon            String?   // Icon name
  image           String?   // Image URL (Cloudflare R2)
  startingPrice   Int       // Lowest package price
  processingTime  String?   // "3-5 business days"
  popular         Boolean   @default(false)
  isActive        Boolean   @default(true)
  order           Int       @default(0)

  // SEO
  metaTitle       String?
  metaDescription String?

  // Relations
  categoryId      String
  category        ServiceCategory @relation(fields: [categoryId], references: [id])
  packages        ServicePackage[]
  faqs            ServiceFAQ[]
  features        ServiceFeature[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([categoryId])
  @@index([slug])
}
```

### 3. ServicePackage Table
```prisma
model ServicePackage {
  id          String    @id @default(cuid())
  name        String    // "Basic", "Standard", "Premium"
  price       Int       // Price in cents or dollars
  description String?   // Package tagline
  popular     Boolean   @default(false)
  order       Int       @default(0)

  serviceId   String
  service     Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  features    PackageFeature[]
  notIncluded PackageNotIncluded[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([serviceId])
}
```

### 4. PackageFeature Table
```prisma
model PackageFeature {
  id        String  @id @default(cuid())
  text      String  // "Comprehensive Search"
  order     Int     @default(0)

  packageId String
  package   ServicePackage @relation(fields: [packageId], references: [id], onDelete: Cascade)

  @@index([packageId])
}
```

### 5. PackageNotIncluded Table
```prisma
model PackageNotIncluded {
  id        String  @id @default(cuid())
  text      String  // "Office Action Response"
  order     Int     @default(0)

  packageId String
  package   ServicePackage @relation(fields: [packageId], references: [id], onDelete: Cascade)

  @@index([packageId])
}
```

### 6. ServiceFeature Table (Main service features shown on cards)
```prisma
model ServiceFeature {
  id        String  @id @default(cuid())
  text      String  // "Comprehensive trademark search"
  order     Int     @default(0)

  serviceId String
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@index([serviceId])
}
```

### 7. ServiceFAQ Table
```prisma
model ServiceFAQ {
  id        String  @id @default(cuid())
  question  String
  answer    String  @db.Text // Can be rich text
  order     Int     @default(0)

  serviceId String
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@index([serviceId])
}
```

---

## API Endpoints

### Public APIs (for frontend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all active services |
| GET | `/api/services/[slug]` | Get single service with packages, FAQs |
| GET | `/api/services/categories` | List all active categories with services |
| GET | `/api/services/popular` | Get popular services |
| GET | `/api/services/by-category/[slug]` | Services by category |

### Admin APIs (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/services` | List all services (including inactive) |
| POST | `/api/admin/services` | Create new service |
| GET | `/api/admin/services/[id]` | Get service for editing |
| PUT | `/api/admin/services/[id]` | Update service |
| DELETE | `/api/admin/services/[id]` | Delete service |
| PATCH | `/api/admin/services/[id]/toggle` | Toggle active status |
| POST | `/api/admin/services/reorder` | Reorder services |

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/categories` | List all categories |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/[id]` | Update category |
| DELETE | `/api/admin/categories/[id]` | Delete category |
| POST | `/api/admin/categories/reorder` | Reorder categories |

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/services/[id]/packages` | Add package |
| PUT | `/api/admin/packages/[id]` | Update package |
| DELETE | `/api/admin/packages/[id]` | Delete package |
| POST | `/api/admin/packages/reorder` | Reorder packages |

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/services/[id]/faqs` | Add FAQ |
| PUT | `/api/admin/faqs/[id]` | Update FAQ |
| DELETE | `/api/admin/faqs/[id]` | Delete FAQ |
| POST | `/api/admin/faqs/reorder` | Reorder FAQs |

---

## Admin Dashboard Pages

### 1. Services List Page (`/admin/services`)

```
+--------------------------------------------------+
|  Services                            [+ Add New] |
+--------------------------------------------------+
| Search: [___________]  Category: [All ▼]         |
+--------------------------------------------------+
| ☰ | Icon | Name           | Category | Price | ⚡ |
+--------------------------------------------------+
| ☰ | 🏢   | LLC Formation  | Formation| $199  | ✓ |
| ☰ | 📄   | EIN Application| Formation| $99   | ✓ |
| ☰ | ™️   | Trademark Reg. | Formation| $599  | ✓ |
+--------------------------------------------------+
```

Features:
- Drag-and-drop reordering (☰ handle)
- Quick toggle active/inactive (⚡)
- Filter by category
- Search by name
- Bulk actions (delete, activate, deactivate)

### 2. Service Edit Page (`/admin/services/[id]`)

**Tab: Basic Info**
```
+--------------------------------------------------+
| ← Back to Services                               |
+--------------------------------------------------+
| [Basic Info] [Packages] [FAQs] [SEO]             |
+--------------------------------------------------+
| Service Name *                                    |
| [LLC Formation                               ]   |
|                                                  |
| URL Slug *                                       |
| [llc-formation                              ]    |
|                                                  |
| Category *                                       |
| [Formation & Legal                          ▼]   |
|                                                  |
| Short Description *                              |
| [Form your US LLC in any state...           ]   |
|                                                  |
| Full Description (Rich Text) *                   |
| +----------------------------------------------+|
| | B I U | H1 H2 H3 | • | 1. | Link | Image    ||
| |----------------------------------------------||
| | <p>A Limited Liability Company (LLC)...      ||
| |                                              ||
| +----------------------------------------------+|
|                                                  |
| Icon (Lucide)        | Starting Price           |
| [Building2      ▼]   | [$199                ]   |
|                                                  |
| Processing Time      | [x] Popular Service      |
| [3-5 business days]  | [x] Active               |
|                                                  |
|                      [Cancel] [Save Changes]     |
+--------------------------------------------------+
```

**Tab: Packages**
```
+--------------------------------------------------+
| Packages                           [+ Add Package]|
+--------------------------------------------------+
| ☰ Basic - $199                            [Edit] |
|   ✓ Name Search  ✓ Filing  ✓ Certificate        |
+--------------------------------------------------+
| ☰ Standard - $299 ⭐ Popular              [Edit] |
|   ✓ Everything in Basic  ✓ EIN  ✓ Operating Ag. |
+--------------------------------------------------+
| ☰ Premium - $399                          [Edit] |
|   ✓ Everything in Standard  ✓ Banking  ✓ 1 Year |
+--------------------------------------------------+
```

**Package Edit Modal**
```
+------------------------------------------+
| Edit Package                         [X] |
+------------------------------------------+
| Package Name *     | Price *             |
| [Standard      ]   | [$299          ]    |
|                                          |
| Description                              |
| [Most popular choice              ]      |
|                                          |
| [x] Mark as Popular                      |
|                                          |
| Included Features            [+ Add]     |
| ☰ [Everything in Basic          ] [X]   |
| ☰ [EIN Application              ] [X]   |
| ☰ [Operating Agreement          ] [X]   |
|                                          |
| Not Included                 [+ Add]     |
| ☰ [Banking Assistance           ] [X]   |
|                                          |
|              [Cancel] [Save Package]     |
+------------------------------------------+
```

**Tab: FAQs**
```
+--------------------------------------------------+
| FAQs                                   [+ Add FAQ]|
+--------------------------------------------------+
| ☰ How long does LLC formation take?       [Edit] |
| ☰ Do I need a US address?                 [Edit] |
| ☰ Can non-US residents form an LLC?       [Edit] |
+--------------------------------------------------+
```

**Tab: SEO**
```
+--------------------------------------------------+
| SEO Settings                                      |
+--------------------------------------------------+
| Meta Title                                        |
| [LLC Formation Service - Start Your US Business] |
|                                                  |
| Meta Description                                 |
| [Form your US LLC quickly and easily...      ]  |
|                                                  |
| Preview:                                         |
| +----------------------------------------------+|
| | LLC Formation Service - Start Your US Bus... ||
| | https://llcpad.com/services/llc-formation    ||
| | Form your US LLC quickly and easily with...  ||
| +----------------------------------------------+|
+--------------------------------------------------+
```

### 3. Categories Management (`/admin/services/categories`)

```
+--------------------------------------------------+
| Service Categories                   [+ Add New] |
+--------------------------------------------------+
| ☰ | Icon | Name              | Services | Active |
+--------------------------------------------------+
| ☰ | 🏢   | Formation & Legal | 6        | ✓      |
| ☰ | 📋   | Compliance & Docs | 7        | ✓      |
| ☰ | 🛒   | Amazon Services   | 8        | ✓      |
| ☰ | 💰   | Tax & Finance     | 3        | ✓      |
+--------------------------------------------------+
```

---

## Implementation Steps

### Phase 1: Database Setup (Day 1)

1. **Update Prisma Schema**
   - Add all service-related models
   - Create migrations
   - Generate Prisma client

2. **Create Seed Script**
   - Migrate existing hardcoded services to database
   - Run seed to populate initial data

### Phase 2: API Development (Day 2-3)

1. **Public APIs**
   - `/api/services` - List services
   - `/api/services/[slug]` - Service details
   - `/api/services/categories` - Categories list

2. **Admin APIs**
   - Full CRUD for services
   - Full CRUD for categories
   - CRUD for packages, FAQs, features

3. **Middleware**
   - Admin authentication check
   - Rate limiting
   - Input validation with Zod

### Phase 3: Admin UI (Day 4-6)

1. **Install Dependencies**
   ```bash
   npm install suneditor suneditor-react
   npm install @dnd-kit/core @dnd-kit/sortable
   ```

2. **Services List Page**
   - DataTable with sorting, filtering
   - Drag-and-drop reordering
   - Quick actions (toggle, delete)

3. **Service Editor**
   - Tabbed interface
   - Sun Editor integration
   - Image upload to R2
   - Package management
   - FAQ management

4. **Categories Page**
   - Simple CRUD interface
   - Reordering

### Phase 4: Frontend Integration (Day 7)

1. **Update Service Pages**
   - Fetch from API instead of static file
   - Add loading states
   - Add error handling
   - Cache with SWR/React Query

2. **Update Home Page**
   - Dynamic service cards
   - Dynamic categories

3. **Update Checkout Pages**
   - Fetch service/package from API
   - Validate package selection

### Phase 5: Migration & Testing (Day 8)

1. **Data Migration**
   - Run seed script with all existing services
   - Verify all data transferred correctly

2. **Testing**
   - Test all CRUD operations
   - Test frontend pages
   - Test checkout flows
   - Test rich text rendering

3. **Cleanup**
   - Remove hardcoded services.ts (or keep as fallback)
   - Update imports across codebase

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── services/
│   │   │   ├── route.ts              # GET all services
│   │   │   ├── [slug]/
│   │   │   │   └── route.ts          # GET single service
│   │   │   ├── categories/
│   │   │   │   └── route.ts          # GET categories
│   │   │   └── popular/
│   │   │       └── route.ts          # GET popular services
│   │   └── admin/
│   │       ├── services/
│   │       │   ├── route.ts          # GET/POST services
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts      # GET/PUT/DELETE service
│   │       │   │   ├── toggle/
│   │       │   │   │   └── route.ts  # PATCH toggle
│   │       │   │   ├── packages/
│   │       │   │   │   └── route.ts  # POST package
│   │       │   │   └── faqs/
│   │       │   │       └── route.ts  # POST FAQ
│   │       │   └── reorder/
│   │       │       └── route.ts      # POST reorder
│   │       ├── categories/
│   │       │   ├── route.ts          # GET/POST categories
│   │       │   ├── [id]/
│   │       │   │   └── route.ts      # PUT/DELETE category
│   │       │   └── reorder/
│   │       │       └── route.ts      # POST reorder
│   │       ├── packages/
│   │       │   └── [id]/
│   │       │       └── route.ts      # PUT/DELETE package
│   │       └── faqs/
│   │           └── [id]/
│   │               └── route.ts      # PUT/DELETE FAQ
│   └── admin/
│       └── services/
│           ├── page.tsx              # Services list
│           ├── new/
│           │   └── page.tsx          # Create service
│           ├── [id]/
│           │   └── page.tsx          # Edit service
│           └── categories/
│               └── page.tsx          # Categories management
├── components/
│   └── admin/
│       ├── services/
│       │   ├── service-form.tsx      # Service edit form
│       │   ├── service-table.tsx     # Services data table
│       │   ├── package-editor.tsx    # Package edit modal
│       │   ├── faq-editor.tsx        # FAQ edit modal
│       │   └── feature-list.tsx      # Sortable feature list
│       └── ui/
│           └── rich-text-editor.tsx  # Sun Editor wrapper
├── lib/
│   ├── validations/
│   │   └── service.ts                # Zod schemas
│   └── services/
│       └── service-queries.ts        # Database queries
└── types/
    └── service.ts                    # TypeScript types
```

---

## Sun Editor Configuration

```typescript
// components/admin/ui/rich-text-editor.tsx
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

const editorOptions = {
  buttonList: [
    ['undo', 'redo'],
    ['font', 'fontSize', 'formatBlock'],
    ['bold', 'italic', 'underline', 'strike'],
    ['fontColor', 'hiliteColor'],
    ['removeFormat'],
    ['outdent', 'indent'],
    ['align', 'list', 'lineHeight'],
    ['table', 'link', 'image'],
    ['fullScreen', 'showBlocks', 'codeView'],
  ],
  height: '400px',
  imageUploadUrl: '/api/admin/upload',
};
```

---

## Caching Strategy

1. **Server-side caching**
   - Cache service list for 5 minutes
   - Cache individual service for 1 minute
   - Invalidate on admin updates

2. **Client-side caching (SWR)**
   ```typescript
   const { data: services } = useSWR('/api/services', fetcher, {
     revalidateOnFocus: false,
     revalidateOnReconnect: false,
     dedupingInterval: 60000, // 1 minute
   });
   ```

3. **ISR (Incremental Static Regeneration)**
   - Service pages: revalidate every 60 seconds
   - On admin update: trigger revalidation

---

## Security Considerations

1. **Admin API Protection**
   - Check user role (ADMIN or CONTENT_MANAGER)
   - Rate limiting (100 requests/minute)
   - Input sanitization for rich text

2. **Image Uploads**
   - File type validation
   - Size limits (max 5MB)
   - Virus scanning (optional)

3. **Audit Logging**
   - Log all admin actions
   - Track who changed what

---

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 1 day | Database schema, migrations, seed |
| Phase 2 | 2 days | All API endpoints |
| Phase 3 | 3 days | Admin UI with Sun Editor |
| Phase 4 | 1 day | Frontend integration |
| Phase 5 | 1 day | Migration, testing, cleanup |
| **Total** | **8 days** | |

---

## Questions to Clarify

1. Should we support multiple languages for service content?
2. Do we need version history for service changes?
3. Should we allow scheduling service activation/deactivation?
4. Do we need service duplication feature?
5. Should prices support multiple currencies (USD, BDT)?

---

## Next Steps

1. Review and approve this plan
2. Start Phase 1: Database setup
3. Create migration script for existing services
