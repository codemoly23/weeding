# Service Details Template Specification

> **Document Version:** 1.3
> **Created:** February 4, 2026
> **Updated:** February 4, 2026
> **Status:** Phase 1 Complete - Foundation Implemented

---

## ⚠️ CRITICAL: Implementation Rules

> **এই নিয়মগুলো অবশ্যই মানতে হবে। কোনো ব্যতিক্রম নেই।**

### Rule 1: Codebase Analysis First

প্রতিটি task শুরু করার **আগে** অবশ্যই:
- [ ] Current codebase structure analyze করতে হবে
- [ ] Existing patterns ও conventions বুঝতে হবে
- [ ] Related files ও dependencies identify করতে হবে
- [ ] যা আছে তার সাথে conflict হবে কিনা check করতে হবে

```
❌ WRONG: সরাসরি code লেখা শুরু করা
✅ RIGHT: আগে codebase বুঝে তারপর implement করা
```

### Rule 2: Fullstack Implementation Only

**শুধু UI mockup বা partial implementation গ্রহণযোগ্য নয়।** প্রতিটি feature এ অবশ্যই:

| Layer | Must Include |
|-------|--------------|
| **Database** | Prisma schema, migrations, indexes |
| **Backend API** | API routes, validation, error handling |
| **Server Logic** | Business logic, utilities, types |
| **Frontend UI** | Components, forms, state management |
| **Integration** | API calls, data fetching, caching |

```
❌ WRONG: "এখানে UI mockup দেওয়া হলো, পরে implement করা হবে"
✅ RIGHT: Complete fullstack implementation with working code
```

### Rule 3: Post-Implementation Checklist

প্রতিটি task শেষে **mandatory checklist** verify করতে হবে:

```
┌─────────────────────────────────────────────────────────────────┐
│ ✅ TASK COMPLETION CHECKLIST                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Database:                                                       │
│ [ ] Schema updated in prisma/schema.prisma                      │
│ [ ] Migration created and applied                               │
│ [ ] Indexes added for query optimization                        │
│                                                                 │
│ Backend:                                                        │
│ [ ] API routes created/updated                                  │
│ [ ] Input validation with Zod                                   │
│ [ ] Error handling implemented                                  │
│ [ ] TypeScript types defined                                    │
│                                                                 │
│ Frontend:                                                       │
│ [ ] UI components created                                       │
│ [ ] Forms with validation                                       │
│ [ ] Loading/error states handled                                │
│ [ ] Responsive design verified                                  │
│                                                                 │
│ Integration:                                                    │
│ [ ] API integration working                                     │
│ [ ] Data fetching optimized                                     │
│ [ ] Cache invalidation handled                                  │
│                                                                 │
│ Testing:                                                        │
│ [ ] Manual testing completed                                    │
│ [ ] Edge cases verified                                         │
│ [ ] No console errors                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Rule 4: Codebase Cleanup

Task শেষে পুরনো/deprecated code **অবশ্যই clean করতে হবে**:

- [ ] Remove unused imports
- [ ] Delete deprecated files/components
- [ ] Remove commented-out code
- [ ] Update related documentation
- [ ] Remove old migration files (if applicable)
- [ ] Clean up unused dependencies

```
❌ WRONG: নতুন code যোগ করে পুরনো code রেখে দেওয়া
✅ RIGHT: পুরনো format completely replace ও clean করা
```

### Rule 5: No Placeholder Code

```typescript
// ❌ NEVER DO THIS:
function handleSubmit() {
  // TODO: implement later
}

// ✅ ALWAYS DO THIS:
async function handleSubmit(data: FormData) {
  try {
    const validated = schema.parse(data);
    const result = await api.create(validated);
    toast.success('Created successfully');
    router.push(`/admin/items/${result.id}`);
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
}
```

---

## 1. Executive Summary

This document outlines the specification for making Service Details pages customizable via the Page Builder. Instead of hardcoded layouts, admins can use the Page Builder to design service detail pages with dynamic widgets that automatically pull service data.

### 1.1 Core Concept

```
WordPress-like approach: ONE template for ALL services + per-service content
```

**Current State:** Service details page layout is hardcoded
**Target State:** Service details page is fully customizable via Page Builder

### 1.2 Key Architecture Decision

| Concern | Where to Configure | Frequency |
|---------|-------------------|-----------|
| **Layout/Design** | Page Builder → Service Details Template | Once (applies to all) |
| **Content/Data** | Service Edit Page → Each service | Per service |
| **Section Visibility** | Service Edit Page → Display Options | Per service (optional) |

**Benefits:**
- Admin designs layout once in Page Builder
- Content managed per-service in Service Edit Page
- Optional per-service section hide/show without touching Page Builder
- Scales to 100+ services without additional page management

### 1.3 What This Approach Avoids

| ❌ NOT This (Bad) | ✅ This (Good) |
|-------------------|----------------|
| Creating separate page for each service in Page Builder | ONE template for all services |
| 50 services = 50 pages to manage | 50 services = 1 template + 50 content entries |
| Inconsistent design across services | Consistent professional look |
| Admin must learn Page Builder for every service | Admin only enters content in familiar form |
| Layout changes require editing 50 pages | Layout changes apply to all services instantly |

---

## 2. System Architecture

### 2.1 Two-Tier Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PAGE BUILDER                                 │
│              (Layout/Structure - Design ONCE for all)                │
│                                                                      │
│  "Service Details Template" page contains:                           │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Section 1: Service Hero        → {{service.title}}, {{price}}   │ │
│  │ Section 2: Features Grid       → {{service.features}}           │ │
│  │ Section 3: Pricing Table       → {{service.pricingTiers}}       │ │
│  │ Section 4: Process Steps       → {{service.processSteps}}       │ │
│  │ Section 5: FAQ Accordion       → {{service.faqs}}               │ │
│  │ Section 6: CTA Banner          → {{service.slug}}               │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ Template applies to ALL services
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE EDIT PAGE                               │
│              (Content/Data - Configure PER service)                  │
│                                                                      │
│  /admin/services/llc-formation                                       │
│  ├── [Content Tab]                                                   │
│  │   ├── Title: "LLC Formation"                                      │
│  │   ├── Short Description: "Launch your US business..."             │
│  │   ├── Features: [✓ State Filing, ✓ Operating Agreement, ...]     │
│  │   ├── Pricing Tiers: [Basic $199, Pro $299, Premium $499]        │
│  │   └── FAQs: [Q1, Q2, Q3...]                                      │
│  │                                                                   │
│  └── [Display Options Tab] ← Per-service visibility toggle           │
│      ├── [✓] Show Hero Section                                       │
│      ├── [✓] Show Features Section                                   │
│      ├── [✓] Show Pricing Table                                      │
│      ├── [ ] Show Process Steps (hidden for this service)            │
│      ├── [✓] Show FAQ Section                                        │
│      └── [✓] Show CTA Banner                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Runtime Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER VISITS SERVICE PAGE                          │
│                  /services/llc-formation                             │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  1. Extract slug from │
                    │     URL (llc-formation)│
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  2. Fetch Service     │
                    │     from Database     │
                    │  (includes content +  │
                    │   displayOptions)     │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  3. Load Template     │
                    │  (SERVICE_DETAILS     │
                    │   from Page Builder)  │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  4. Filter Sections   │
                    │  based on service's   │
                    │  displayOptions       │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  5. Render with       │
                    │  ServiceContext       │
                    │  (widgets pull data)  │
                    └───────────────────────┘
```

### 2.2 Data Access Strategy (Option A)

**Decision: Fetch Once, All Widgets Use**

```typescript
// Service fetched ONCE at page level
const service = await getServiceBySlug(slug);

// Passed to all widgets via Context
<ServiceContext.Provider value={service}>
  <PageBuilderRenderer sections={templatePage.sections} />
</ServiceContext.Provider>

// Each widget accesses via hook
function ServiceHeroWidget() {
  const service = useServiceContext();
  return <h1>{service.title}</h1>;
}
```

**Why Option A:**
- Single database query (performance)
- Consistent data across all widgets
- No race conditions
- Simpler caching strategy

---

## 3. Service Hero Widget

### 3.1 Widget Definition

| Property | Value |
|----------|-------|
| **Name** | Service Hero |
| **Type** | `service-hero` |
| **Category** | Service Widgets |
| **Description** | Displays service title, tagline, price badge, and CTA buttons |

### 3.2 Widget Purpose

The Service Hero widget displays the main introduction section of a service page, including:
- Service title (dynamic)
- Short description/tagline (dynamic)
- Starting price badge (dynamic)
- Primary CTA button (customizable)
- Secondary CTA button (customizable)
- Background styling (customizable)

### 3.3 Visual Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           LLC Formation                                      │
│                                                                             │
│     Launch your US business in 24-48 hours. No SSN required.                │
│     Trusted by 10,000+ international entrepreneurs from                     │
│     Bangladesh, India, Pakistan & 50+ countries.                            │
│                                                                             │
│            ┌──────────────────┐    ┌─────────────────┐                      │
│            │ Get Started - $0 │    │ Ask a Question  │                      │
│            └──────────────────┘    └─────────────────┘                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Data Fields

#### Dynamic Fields (from Service)

| Field | Source | Placeholder | Example |
|-------|--------|-------------|---------|
| Title | `service.title` | `{{service.title}}` | "LLC Formation" |
| Short Description | `service.shortDescription` | `{{service.shortDescription}}` | "Launch your US business..." |
| Starting Price | `service.startingPrice` | `{{service.startingPrice}}` | "$0" / "From $199" |
| Slug | `service.slug` | `{{service.slug}}` | "llc-formation" |
| Description | `service.description` | `{{service.description}}` | Full HTML description |

#### Static/Customizable Fields (Admin configurable)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `showPriceBadge` | boolean | `true` | Show/hide price badge |
| `priceBadgeText` | string | `"From {{service.startingPrice}}"` | Price badge format |
| `primaryCtaText` | string | `"Get Started"` | Primary button text |
| `primaryCtaLink` | string | `"/checkout/{{service.slug}}"` | Primary button link |
| `secondaryCtaText` | string | `"Ask a Question"` | Secondary button text |
| `secondaryCtaLink` | string | `"#contact"` | Secondary button link |
| `showSecondaryButton` | boolean | `true` | Show/hide secondary button |
| `backgroundType` | enum | `"gradient"` | `"gradient" \| "image" \| "solid" \| "none"` |
| `backgroundColor` | string | `"#f8fafc"` | Background color (if solid) |
| `backgroundGradient` | string | `"from-orange-50 to-white"` | Tailwind gradient classes |
| `backgroundImage` | string | `null` | Background image URL |
| `textAlignment` | enum | `"center"` | `"left" \| "center" \| "right"` |
| `titleSize` | enum | `"4xl"` | `"2xl" \| "3xl" \| "4xl" \| "5xl"` |
| `spacing` | enum | `"lg"` | `"sm" \| "md" \| "lg" \| "xl"` |

### 3.5 Widget Settings UI (Admin Panel)

```
┌─────────────────────────────────────────────────────────────────┐
│ Service Hero Widget Settings                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ CONTENT                                                         │
│ ─────────────────────────────────────────────────────────────── │
│ Title Source:       [● Auto from Service  ○ Custom]             │
│ Custom Title:       [________________________] (if custom)      │
│                                                                 │
│ Subtitle Source:    [● Auto from Service  ○ Custom]             │
│ Custom Subtitle:    [________________________] (if custom)      │
│                                                                 │
│ PRICE BADGE                                                     │
│ ─────────────────────────────────────────────────────────────── │
│ Show Price Badge:   [✓]                                         │
│ Badge Text:         [From {{service.startingPrice}}___]         │
│                                                                 │
│ BUTTONS                                                         │
│ ─────────────────────────────────────────────────────────────── │
│ Primary Button:                                                 │
│   Text:             [Get Started_______________]                │
│   Link:             [/checkout/{{service.slug}}]                │
│   Show Price:       [✓] Append price to button                  │
│                                                                 │
│ Secondary Button:                                               │
│   Enabled:          [✓]                                         │
│   Text:             [Ask a Question____________]                │
│   Link:             [#contact__________________]                │
│                                                                 │
│ APPEARANCE                                                      │
│ ─────────────────────────────────────────────────────────────── │
│ Background:         [Gradient ▼]                                │
│                     ○ None  ○ Solid  ● Gradient  ○ Image        │
│ Gradient:           [from-orange-50 to-white___]                │
│                                                                 │
│ Text Alignment:     [○ Left  ● Center  ○ Right]                 │
│ Title Size:         [● Default  ○ Large  ○ Extra Large]         │
│ Vertical Padding:   [● Medium  ○ Large  ○ Extra Large]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Widget Data Schema

```typescript
interface ServiceHeroWidgetData {
  // Content
  titleSource: 'auto' | 'custom';
  customTitle?: string;
  subtitleSource: 'auto' | 'custom';
  customSubtitle?: string;

  // Price Badge
  showPriceBadge: boolean;
  priceBadgeText: string; // Supports {{service.startingPrice}}

  // Primary Button
  primaryCtaText: string;
  primaryCtaLink: string; // Supports {{service.slug}}
  showPriceInButton: boolean;

  // Secondary Button
  showSecondaryButton: boolean;
  secondaryCtaText: string;
  secondaryCtaLink: string;

  // Appearance
  backgroundType: 'none' | 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  textAlignment: 'left' | 'center' | 'right';
  titleSize: 'default' | 'large' | 'xl';
  spacing: 'sm' | 'md' | 'lg' | 'xl';
}
```

---

## 4. Other Service-Specific Widgets

### 4.1 Widget Catalog

| Widget Name | Type | Description |
|-------------|------|-------------|
| **Service Hero** | `service-hero` | Title, tagline, CTA buttons |
| **Service Features** | `service-features` | Feature list with icons |
| **Service Pricing Table** | `service-pricing` | Pricing tiers/packages |
| **Service Process Steps** | `service-process` | Step-by-step process |
| **Service FAQ** | `service-faq` | Frequently asked questions |
| **Service Requirements** | `service-requirements` | What's needed from customer |
| **Service Deliverables** | `service-deliverables` | What customer receives |
| **Service Timeline** | `service-timeline` | Expected delivery timeline |
| **Related Services** | `related-services` | Other services to consider |
| **Service Testimonials** | `service-testimonials` | Customer reviews for this service |

### 4.2 Service Features Widget

```typescript
interface ServiceFeaturesWidgetData {
  titleSource: 'auto' | 'custom';
  customTitle?: string; // Default: "What's Included"
  layout: 'grid' | 'list' | 'cards';
  columns: 2 | 3 | 4;
  showIcons: boolean;
  iconStyle: 'checkmark' | 'bullet' | 'custom';
  // Data: {{service.features}} - array of strings/objects
}
```

### 4.3 Service Pricing Table Widget

```typescript
interface ServicePricingWidgetData {
  titleSource: 'auto' | 'custom';
  customTitle?: string; // Default: "Choose Your Package"
  layout: 'horizontal' | 'vertical';
  highlightRecommended: boolean;
  showComparisonTable: boolean;
  ctaText: string; // Default: "Select Plan"
  // Data: {{service.pricingTiers}} - array of pricing objects
}
```

### 4.4 Service Process Steps Widget

```typescript
interface ServiceProcessWidgetData {
  titleSource: 'auto' | 'custom';
  customTitle?: string; // Default: "How It Works"
  layout: 'horizontal' | 'vertical' | 'alternating';
  showStepNumbers: boolean;
  showConnectors: boolean;
  // Data: {{service.processSteps}} - array of step objects
}
```

### 4.5 Service FAQ Widget

```typescript
interface ServiceFaqWidgetData {
  titleSource: 'auto' | 'custom';
  customTitle?: string; // Default: "Frequently Asked Questions"
  layout: 'accordion' | 'grid' | 'list';
  expandFirst: boolean;
  allowMultipleOpen: boolean;
  // Data: {{service.faqs}} - array of {question, answer}
}
```

---

## 5. Service Context System

### 5.1 Context Definition

```typescript
// src/lib/page-builder/contexts/service-context.tsx

import { createContext, useContext } from 'react';
import type { Service } from '@prisma/client';

interface ServiceContextValue {
  service: Service & {
    features: ServiceFeature[];
    pricingTiers: PricingTier[];
    processSteps: ProcessStep[];
    faqs: FAQ[];
    requirements: string[];
    deliverables: string[];
  };
  isLoading: boolean;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

export function ServiceProvider({
  service,
  children
}: {
  service: ServiceContextValue['service'];
  children: React.ReactNode;
}) {
  return (
    <ServiceContext.Provider value={{ service, isLoading: false }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServiceContext() {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error(
      'useServiceContext must be used within a ServiceProvider. ' +
      'This widget requires a service context (use on Service Details template only).'
    );
  }

  return context;
}
```

### 5.2 Usage in Page Renderer

```typescript
// src/app/(frontend)/services/[slug]/page.tsx

import { ServiceProvider } from '@/lib/page-builder/contexts/service-context';
import { PageBuilderRenderer } from '@/components/page-builder/renderer';
import { filterSectionsByDisplayOptions } from '@/lib/page-builder/utils';

export default async function ServiceDetailsPage({
  params
}: {
  params: { slug: string }
}) {
  // 1. Fetch service data (SINGLE QUERY)
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  // 2. Get template page for SERVICE_DETAILS
  const templatePage = await getTemplateForType('SERVICE_DETAILS');

  if (!templatePage) {
    // Fallback to default hardcoded layout
    return <DefaultServiceLayout service={service} />;
  }

  // 3. Filter sections based on service's displayOptions
  const visibleSections = filterSectionsByDisplayOptions(
    templatePage.sections,
    service.displayOptions
  );

  // 4. Render with ServiceProvider wrapping everything
  return (
    <ServiceProvider service={service}>
      <PageBuilderRenderer
        sections={visibleSections}
        context={{ service }}
      />
    </ServiceProvider>
  );
}
```

### 5.3 Section Filtering Utility

```typescript
// src/lib/page-builder/utils/filter-sections.ts

import { DEFAULT_DISPLAY_OPTIONS, ServiceDisplayOptions } from '@/lib/types';

const WIDGET_TO_DISPLAY_OPTION: Record<string, keyof ServiceDisplayOptions> = {
  'service-hero': 'showHero',
  'service-features': 'showFeatures',
  'service-pricing': 'showPricing',
  'service-process': 'showProcessSteps',
  'service-faq': 'showFaq',
  'service-requirements': 'showRequirements',
  'service-deliverables': 'showDeliverables',
  'service-timeline': 'showTimeline',
  'related-services': 'showRelatedServices',
  'service-testimonials': 'showTestimonials',
  'service-cta': 'showCtaBanner',
};

export function filterSectionsByDisplayOptions(
  sections: Section[],
  displayOptions: Partial<ServiceDisplayOptions> = {}
): Section[] {
  // Merge with defaults
  const options = { ...DEFAULT_DISPLAY_OPTIONS, ...displayOptions };

  return sections.filter(section => {
    // Get primary widget type in section
    const primaryWidgetType = section.widgets[0]?.type;

    // Check if this widget type has a display option
    const displayOptionKey = WIDGET_TO_DISPLAY_OPTION[primaryWidgetType];

    if (displayOptionKey) {
      return options[displayOptionKey];
    }

    // Non-service widgets are always shown
    return true;
  });
}
```

### 5.4 Widget Implementation Example

```typescript
// src/components/page-builder/widgets/service-hero.tsx

'use client';

import { useServiceContext } from '@/lib/page-builder/contexts/service-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceHeroProps {
  data: ServiceHeroWidgetData;
}

export function ServiceHeroWidget({ data }: ServiceHeroProps) {
  const { service } = useServiceContext();

  // Resolve dynamic values
  const title = data.titleSource === 'auto'
    ? service.title
    : data.customTitle;

  const subtitle = data.subtitleSource === 'auto'
    ? service.shortDescription
    : data.customSubtitle;

  const primaryLink = data.primaryCtaLink
    .replace('{{service.slug}}', service.slug);

  const priceText = data.priceBadgeText
    .replace('{{service.startingPrice}}', formatPrice(service.startingPrice));

  return (
    <section className={cn(
      'py-16',
      data.backgroundType === 'gradient' && `bg-gradient-to-b ${data.backgroundGradient}`,
      data.backgroundType === 'solid' && `bg-[${data.backgroundColor}]`,
      data.textAlignment === 'center' && 'text-center',
    )}>
      <div className="container mx-auto px-4">
        {data.showPriceBadge && (
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm mb-4">
            {priceText}
          </span>
        )}

        <h1 className={cn(
          'font-bold mb-4',
          data.titleSize === 'default' && 'text-4xl',
          data.titleSize === 'large' && 'text-5xl',
          data.titleSize === 'xl' && 'text-6xl',
        )}>
          {title}
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>

        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href={primaryLink}>
              {data.primaryCtaText}
              {data.showPriceInButton && ` - ${formatPrice(service.startingPrice)}`}
            </a>
          </Button>

          {data.showSecondaryButton && (
            <Button variant="outline" size="lg" asChild>
              <a href={data.secondaryCtaLink}>
                {data.secondaryCtaText}
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
```

---

## 6. Template System Integration

### 6.1 Template Types Enum

```typescript
// Add to existing PageTemplateType enum

enum PageTemplateType {
  NONE = 'NONE',           // Custom page, no template
  HOMEPAGE = 'HOMEPAGE',
  SERVICE_DETAILS = 'SERVICE_DETAILS',  // ← For individual service pages
  SERVICES_LIST = 'SERVICES_LIST',
  BLOG_POST = 'BLOG_POST',
  BLOG_LIST = 'BLOG_LIST',
  ABOUT_PAGE = 'ABOUT_PAGE',
  CONTACT_PAGE = 'CONTACT_PAGE',
  CHECKOUT = 'CHECKOUT',
  CUSTOM_PAGE = 'CUSTOM_PAGE',
}
```

### 6.2 Template Assignment Flow

```
Admin visits: /admin/pages
       │
       ▼
Creates page: "service details"
       │
       ▼
Clicks "Assign as Template"
       │
       ▼
Selects: "Service Details"
       │
       ▼
Database updates:
  - page.templateType = 'SERVICE_DETAILS'
  - Previous SERVICE_DETAILS page.templateType = 'NONE'
```

### 6.3 Database Query for Template

```typescript
async function getTemplateForType(
  type: PageTemplateType
): Promise<Page | null> {
  return await prisma.page.findFirst({
    where: {
      templateType: type,
      published: true,
    },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          widgets: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
}
```

---

## 7. Widget Registration

### 7.1 Widget Registry Update

```typescript
// src/lib/page-builder/widgets/registry.ts

import { ServiceHeroWidget } from './service-hero';
import { ServiceFeaturesWidget } from './service-features';
import { ServicePricingWidget } from './service-pricing';
// ... other imports

export const widgetRegistry = {
  // Existing widgets
  'hero': HeroWidget,
  'text': TextWidget,
  'features': FeaturesWidget,

  // Service-specific widgets (NEW)
  'service-hero': ServiceHeroWidget,
  'service-features': ServiceFeaturesWidget,
  'service-pricing': ServicePricingWidget,
  'service-process': ServiceProcessWidget,
  'service-faq': ServiceFaqWidget,
  'service-requirements': ServiceRequirementsWidget,
  'service-deliverables': ServiceDeliverablesWidget,
  'service-timeline': ServiceTimelineWidget,
  'related-services': RelatedServicesWidget,
  'service-testimonials': ServiceTestimonialsWidget,
};

// Widget metadata for admin UI
export const widgetMeta = {
  'service-hero': {
    name: 'Service Hero',
    category: 'Service',
    icon: 'Sparkles',
    description: 'Dynamic service title, description, and CTA buttons',
    requiresContext: 'service', // Marks as service-only widget
  },
  // ... other widget metadata
};
```

### 7.2 Widget Availability by Template

```typescript
// Service widgets only available when editing SERVICE_DETAILS template

function getAvailableWidgets(templateType: PageTemplateType) {
  const baseWidgets = ['hero', 'text', 'features', 'cta', 'testimonials'];

  const templateWidgets: Record<PageTemplateType, string[]> = {
    SERVICE_DETAILS: [
      ...baseWidgets,
      'service-hero',
      'service-features',
      'service-pricing',
      'service-process',
      'service-faq',
      'service-requirements',
      'service-deliverables',
      'service-timeline',
      'related-services',
      'service-testimonials',
    ],
    BLOG_POST: [
      ...baseWidgets,
      'blog-content',
      'blog-author',
      'blog-related',
    ],
    // ... other templates
  };

  return templateWidgets[templateType] || baseWidgets;
}
```

---

## 8. Service Database Schema Requirements

### 8.1 Enhanced Service Model

```prisma
model Service {
  id                String   @id @default(cuid())

  // Basic Info
  title             String
  slug              String   @unique
  shortDescription  String?  @db.Text  // For hero subtitle
  description       String?  @db.Text  // Full description (HTML)

  // Pricing
  startingPrice     Decimal? @db.Decimal(10, 2)
  priceLabel        String?  // "From $X" or "Starting at $X"

  // Structured Data (JSON fields for widgets)
  features          Json?    // Array of feature objects
  pricingTiers      Json?    // Array of pricing tier objects
  processSteps      Json?    // Array of step objects
  faqs              Json?    // Array of FAQ objects
  requirements      Json?    // Array of requirement strings
  deliverables      Json?    // Array of deliverable strings
  timeline          String?  // e.g., "24-48 hours"

  // Display Options (per-service visibility control)
  displayOptions    Json     @default("{}")  // ServiceDisplayOptions

  // Media
  icon              String?
  heroImage         String?
  gallery           Json?    // Array of image URLs

  // SEO
  metaTitle         String?
  metaDescription   String?

  // Status
  published         Boolean  @default(false)
  featured          Boolean  @default(false)

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  category          ServiceCategory? @relation(fields: [categoryId], references: [id])
  categoryId        String?

  @@index([published, featured])
  @@index([slug])
}
```

### 8.2 JSON Field Type Definitions

```typescript
// Display options for per-service section visibility
interface ServiceDisplayOptions {
  showHero: boolean;           // Default: true
  showFeatures: boolean;       // Default: true
  showPricing: boolean;        // Default: true
  showProcessSteps: boolean;   // Default: true
  showFaq: boolean;            // Default: true
  showRequirements: boolean;   // Default: true
  showDeliverables: boolean;   // Default: true
  showTimeline: boolean;       // Default: true
  showRelatedServices: boolean; // Default: true
  showTestimonials: boolean;   // Default: true
  showCtaBanner: boolean;      // Default: true
}

// Default display options (all visible)
const DEFAULT_DISPLAY_OPTIONS: ServiceDisplayOptions = {
  showHero: true,
  showFeatures: true,
  showPricing: true,
  showProcessSteps: true,
  showFaq: true,
  showRequirements: true,
  showDeliverables: true,
  showTimeline: true,
  showRelatedServices: true,
  showTestimonials: true,
  showCtaBanner: true,
};

// Service features structure
interface ServiceFeature {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  included: boolean; // For comparison tables
}

// Pricing tier structure
interface PricingTier {
  id: string;
  name: string;        // "Basic", "Pro", "Enterprise"
  price: number;
  billingPeriod?: string;  // "one-time", "monthly", "yearly"
  description?: string;
  features: string[];
  isRecommended?: boolean;
  ctaText?: string;
}

// Process step structure
interface ProcessStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon?: string;
  duration?: string;  // "Day 1", "1-2 hours"
}

// FAQ structure
interface FAQ {
  id: string;
  question: string;
  answer: string;  // Can be HTML
  order: number;
}
```

---

## 9. Admin Service Edit Page Integration

### 9.1 Current Behavior (Preserved)

The existing service edit page at `/admin/services/[id]` remains unchanged:
- Edit basic info (title, slug, description)
- Edit pricing
- Edit features, FAQs, etc.
- Manage images

### 9.2 New "Display Options" Tab

Add a new tab to the Service Edit Page for per-service section visibility control:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Edit Service: LLC Formation                                      [Preview] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ [Basic Info] [Pricing] [Features] [FAQs] [SEO] [Display Options]            │
│                                                       ▲                     │
│                                                       │ NEW TAB             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Display Options Tab UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DISPLAY OPTIONS                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│ Control which sections appear on this service's page.                       │
│ The overall layout is defined in the Service Details template.              │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ SECTION VISIBILITY                                                      │ │
│ │ ───────────────────────────────────────────────────────────────────────│ │
│ │                                                                         │ │
│ │ [✓] Hero Section                                                        │ │
│ │     Service title, description, and CTA buttons                         │ │
│ │                                                                         │ │
│ │ [✓] Features Section                                                    │ │
│ │     List of included features and benefits                              │ │
│ │                                                                         │ │
│ │ [✓] Pricing Table                                                       │ │
│ │     Pricing tiers and comparison table                                  │ │
│ │                                                                         │ │
│ │ [ ] Process Steps                              ← Hidden for this service │ │
│ │     Step-by-step process explanation                                    │ │
│ │                                                                         │ │
│ │ [✓] FAQ Section                                                         │ │
│ │     Frequently asked questions                                          │ │
│ │                                                                         │ │
│ │ [✓] Related Services                                                    │ │
│ │     Recommended related services                                        │ │
│ │                                                                         │ │
│ │ [✓] CTA Banner                                                          │ │
│ │     Call-to-action section at bottom                                    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 💡 TIP                                                                  │ │
│ │ To change the overall layout, section order, or styling for ALL         │ │
│ │ services, edit the Service Details template in Page Builder.            │ │
│ │                                                                         │ │
│ │ [Open Page Builder →]                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                                    [Cancel]  [Save Changes] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.4 Display Options Schema

```typescript
// Add to Service model
interface ServiceDisplayOptions {
  showHero: boolean;           // Default: true
  showFeatures: boolean;       // Default: true
  showPricing: boolean;        // Default: true
  showProcessSteps: boolean;   // Default: true
  showFaq: boolean;            // Default: true
  showRequirements: boolean;   // Default: true
  showDeliverables: boolean;   // Default: true
  showTimeline: boolean;       // Default: true
  showRelatedServices: boolean; // Default: true
  showTestimonials: boolean;   // Default: true
  showCtaBanner: boolean;      // Default: true
}

// Prisma schema addition
model Service {
  // ... existing fields ...

  // Display Options (per-service visibility control)
  displayOptions    Json?    @default("{}")  // ServiceDisplayOptions

  // ... rest of fields ...
}
```

### 9.5 How Display Options Work at Runtime

```typescript
// src/app/(frontend)/services/[slug]/page.tsx

export default async function ServiceDetailsPage({ params }) {
  const service = await getServiceBySlug(params.slug);
  const template = await getTemplateForType('SERVICE_DETAILS');

  // Get display options with defaults
  const displayOptions = {
    showHero: true,
    showFeatures: true,
    showPricing: true,
    showProcessSteps: true,
    showFaq: true,
    showRelatedServices: true,
    showCtaBanner: true,
    ...service.displayOptions, // Override with service-specific settings
  };

  // Filter template sections based on displayOptions
  const visibleSections = template.sections.filter(section => {
    const widgetType = section.widgets[0]?.type;

    switch (widgetType) {
      case 'service-hero':
        return displayOptions.showHero;
      case 'service-features':
        return displayOptions.showFeatures;
      case 'service-pricing':
        return displayOptions.showPricing;
      case 'service-process':
        return displayOptions.showProcessSteps;
      case 'service-faq':
        return displayOptions.showFaq;
      case 'related-services':
        return displayOptions.showRelatedServices;
      case 'service-cta':
        return displayOptions.showCtaBanner;
      default:
        return true; // Show non-service widgets always
    }
  });

  return (
    <ServiceProvider service={service}>
      <PageBuilderRenderer sections={visibleSections} />
    </ServiceProvider>
  );
}
```

### 9.6 Widget-to-Display-Option Mapping

| Widget Type | Display Option | Default |
|-------------|----------------|---------|
| `service-hero` | `showHero` | `true` |
| `service-features` | `showFeatures` | `true` |
| `service-pricing` | `showPricing` | `true` |
| `service-process` | `showProcessSteps` | `true` |
| `service-faq` | `showFaq` | `true` |
| `service-requirements` | `showRequirements` | `true` |
| `service-deliverables` | `showDeliverables` | `true` |
| `service-timeline` | `showTimeline` | `true` |
| `related-services` | `showRelatedServices` | `true` |
| `service-testimonials` | `showTestimonials` | `true` |
| `service-cta` | `showCtaBanner` | `true` |

### 9.7 Use Cases

**Use Case 1: Simple Service (e.g., EIN Application)**
- Hide Process Steps (too simple to need)
- Hide Pricing Table (single fixed price)
- Show everything else

**Use Case 2: Complex Service (e.g., Full LLC Package)**
- Show all sections
- All display options enabled

**Use Case 3: Coming Soon Service**
- Show only Hero with "Coming Soon" badge
- Hide Pricing, FAQ, CTA
- Show basic Features as preview

---

## 10. Fallback Behavior

### 10.1 No Template Assigned

If no page is assigned to SERVICE_DETAILS template:
- Use default hardcoded layout
- Show admin notification suggesting to create template

### 10.2 Missing Service Fields

Widgets should handle missing data gracefully:

```typescript
function ServiceHeroWidget({ data }: ServiceHeroProps) {
  const { service } = useServiceContext();

  // Graceful fallbacks
  const title = service.title || 'Service';
  const subtitle = service.shortDescription || service.description?.slice(0, 150) || '';
  const price = service.startingPrice ?? null;

  return (
    // ... render with fallbacks
  );
}
```

### 10.3 Widget Outside Service Context

```typescript
function ServiceHeroWidget({ data }: ServiceHeroProps) {
  try {
    const { service } = useServiceContext();
    // ... normal render
  } catch (error) {
    // Widget used outside service page
    return (
      <div className="p-8 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">
          ⚠️ Service Hero widget requires Service Details template context.
          This widget only works on service detail pages.
        </p>
      </div>
    );
  }
}
```

---

## 11. Implementation Phases

> **⚠️ REMINDER:** প্রতিটি Phase শুরুর আগে codebase analysis করতে হবে।
> প্রতিটি Phase শেষে completion checklist verify করতে হবে।
> শুধু UI mockup নয়, fullstack implementation করতে হবে।

### Phase 1: Foundation ✅ COMPLETED (2026-02-04)

**Pre-Implementation Analysis:**
- [x] Analyze current service page structure (`src/app/(marketing)/services/[slug]/page.tsx`)
- [x] Review existing Page Builder context system
- [x] Check Service model in `prisma/schema.prisma`

**Implementation:**
- [x] Add `displayOptions` field to Service model (DB) → `prisma/schema.prisma:159`
- [x] Create and run Prisma migration → Used `prisma db push`
- [x] Create ServiceContext and ServiceProvider → `src/lib/page-builder/contexts/service-context.tsx`
- [x] Update service page to use context → `src/app/(marketing)/services/[slug]/page.tsx`
- [x] Implement Service Hero widget (fullstack) → `src/components/page-builder/widgets/service/service-hero.tsx`
- [x] Add template type checking → Service page checks for SERVICE_DETAILS template

**New Files Created:**
- `src/lib/page-builder/contexts/service-context.tsx` - ServiceProvider, useServiceContext, filterSectionsByDisplayOptions
- `src/components/page-builder/renderer/index.tsx` - PageBuilderRenderer for frontend
- `src/components/page-builder/renderer/widget-renderer.tsx` - WidgetRenderer component
- `src/components/page-builder/widgets/service/service-hero.tsx` - ServiceHeroWidget
- `src/components/page-builder/widgets/service/index.ts` - Barrel export
- `src/lib/data/templates.ts` - getActiveTemplateForType utility

**Updated Files:**
- `prisma/schema.prisma` - Added displayOptions field to Service model
- `src/lib/page-builder/types.ts` - Added service widget types and settings interfaces
- `src/lib/page-builder/widget-registry.ts` - Added "service" category
- `src/lib/page-builder/defaults.ts` - Added DEFAULT_SERVICE_HERO_SETTINGS
- `src/lib/page-builder/register-widgets.ts` - Registered ServiceHeroWidget
- `src/lib/page-builder/index.ts` - Exported service context

**Post-Implementation:**
- [x] Verify checklist ✅
- [ ] Remove old hardcoded service layout code (kept as fallback for now)
- [x] Clean up unused imports

---

### Phase 2: Core Widgets

**Pre-Implementation Analysis:**
- [ ] Review Service Hero implementation pattern
- [ ] Check existing widget registry structure

**Implementation:**
- [ ] Service Features widget (fullstack)
- [ ] Service Pricing widget (fullstack)
- [ ] Service Process Steps widget (fullstack)
- [ ] Service FAQ widget (fullstack)

**Post-Implementation:**
- [ ] Verify checklist ✅
- [ ] Remove any duplicate feature/pricing components
- [ ] Clean up old code

---

### Phase 3: Additional Widgets

**Pre-Implementation Analysis:**
- [ ] Review Phase 2 widget patterns

**Implementation:**
- [ ] Service Requirements widget (fullstack)
- [ ] Service Deliverables widget (fullstack)
- [ ] Service Timeline widget (fullstack)
- [ ] Related Services widget (fullstack)
- [ ] Service CTA Banner widget (fullstack)

**Post-Implementation:**
- [ ] Verify checklist ✅
- [ ] Cleanup deprecated code

---

### Phase 4: Admin Integration - Display Options

**Pre-Implementation Analysis:**
- [ ] Review current Service Edit page structure
- [ ] Analyze existing tab system in admin

**Implementation:**
- [ ] Add "Display Options" tab to Service Edit Page (UI + API)
- [ ] Create display options form with validation
- [ ] Add section visibility filtering in page renderer
- [ ] Add "Open Page Builder" link for template editing
- [ ] Update Service API to handle displayOptions

**Post-Implementation:**
- [ ] Verify checklist ✅
- [ ] Remove old layout toggle code (if any)
- [ ] Clean up

---

### Phase 5: Admin Integration - Page Builder

**Pre-Implementation Analysis:**
- [ ] Review current widget registry
- [ ] Analyze widget settings panel structure

**Implementation:**
- [ ] Widget availability filtering by template type
- [ ] Widget settings UI for each service widget
- [ ] Preview with sample service data
- [ ] Widget drag-drop integration

**Post-Implementation:**
- [ ] Verify checklist ✅
- [ ] Clean up

---

### Phase 6: Polish & Cleanup

**Final Cleanup:**
- [ ] Remove ALL deprecated service layout code
- [ ] Remove unused components
- [ ] Remove commented code
- [ ] Update CLAUDE.md if needed
- [ ] Verify no console errors
- [ ] Test all service pages
- [ ] Fallback handling
- [ ] Error boundaries

---

## 12. File Structure

```
src/
├── app/
│   └── (frontend)/
│       └── services/
│           └── [slug]/
│               └── page.tsx          # Uses ServiceProvider
│
├── components/
│   └── page-builder/
│       ├── widgets/
│       │   ├── service/
│       │   │   ├── service-hero.tsx
│       │   │   ├── service-features.tsx
│       │   │   ├── service-pricing.tsx
│       │   │   ├── service-process.tsx
│       │   │   ├── service-faq.tsx
│       │   │   ├── service-requirements.tsx
│       │   │   ├── service-deliverables.tsx
│       │   │   ├── service-timeline.tsx
│       │   │   ├── related-services.tsx
│       │   │   └── index.ts          # Barrel export
│       │   └── registry.ts           # Updated with service widgets
│       │
│       └── contexts/
│           └── service-context.tsx   # ServiceProvider & hook
│
└── lib/
    └── page-builder/
        └── types/
            └── service-widgets.ts    # Widget data interfaces
```

---

## Appendix A: Dynamic Placeholder Syntax

### Supported Placeholders

| Placeholder | Resolves To |
|-------------|-------------|
| `{{service.title}}` | Service title |
| `{{service.slug}}` | Service URL slug |
| `{{service.shortDescription}}` | Short description |
| `{{service.startingPrice}}` | Formatted starting price |
| `{{service.timeline}}` | Delivery timeline |
| `{{service.category}}` | Category name |

### Usage in Widget Settings

```typescript
// Admin enters: "Get Started - From {{service.startingPrice}}"
// Rendered as: "Get Started - From $199"

function resolvePlaceholders(template: string, service: Service): string {
  return template
    .replace(/\{\{service\.title\}\}/g, service.title)
    .replace(/\{\{service\.slug\}\}/g, service.slug)
    .replace(/\{\{service\.shortDescription\}\}/g, service.shortDescription || '')
    .replace(/\{\{service\.startingPrice\}\}/g, formatPrice(service.startingPrice))
    .replace(/\{\{service\.timeline\}\}/g, service.timeline || '')
    .replace(/\{\{service\.category\}\}/g, service.category?.name || '');
}
```

---

## Appendix B: Quick Reference Summary

### Where to Configure What

| What | Where | Who | When |
|------|-------|-----|------|
| **Section Order** | Page Builder → Template | Designer/Admin | Once |
| **Widget Styling** | Page Builder → Widget Settings | Designer/Admin | Once |
| **Section Spacing** | Page Builder → Section Settings | Designer/Admin | Once |
| **Service Title** | Service Edit → Basic Info | Content Manager | Per service |
| **Service Features** | Service Edit → Features Tab | Content Manager | Per service |
| **Service Pricing** | Service Edit → Pricing Tab | Content Manager | Per service |
| **Service FAQs** | Service Edit → FAQs Tab | Content Manager | Per service |
| **Hide a Section** | Service Edit → Display Options | Content Manager | Per service |

### Admin Workflow

```
INITIAL SETUP (One-time):
1. Go to Page Builder
2. Create "Service Details" page
3. Add widgets: Hero, Features, Pricing, FAQ, CTA
4. Assign as "Service Details" template
5. Done! All services now use this layout

ADDING NEW SERVICE (Per-service):
1. Go to /admin/services
2. Click "Add New Service"
3. Fill in content (title, features, pricing, FAQs)
4. Optionally: Go to "Display Options" tab to hide sections
5. Publish
6. Done! Service page automatically uses template

CHANGING LAYOUT (Rare):
1. Go to Page Builder
2. Edit "Service Details" template
3. Reorder sections, change styling
4. Save
5. Done! All service pages updated instantly
```

### Mental Model

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   Page Builder Template     =    "The Frame"                   │
│   (Layout, Structure)             (Same for all paintings)     │
│                                                                │
│   Service Edit Content      =    "The Painting"                │
│   (Text, Images, Data)           (Different for each)          │
│                                                                │
│   Display Options           =    "Which parts to show"         │
│   (Section Visibility)           (Per-painting adjustments)    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

*End of Specification Document*
