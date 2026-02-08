# Service Details Page Redesign Plan

## LLCPad - Dynamic Template System for Service Pages

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [2025 Design Trends & Best Practices](#2025-design-trends--best-practices)
4. [Competitor Analysis](#competitor-analysis)
5. [Architecture: Smart Context Widgets](#architecture-smart-context-widgets)
6. [Existing Infrastructure](#existing-infrastructure)
7. [Service Widget Catalog](#service-widget-catalog)
8. [Visual Design Specs & Style Variants](#visual-design-specs--style-variants)
9. [Enhanced Existing Widgets](#enhanced-existing-widgets)
10. [Admin UX: Template Preview](#admin-ux-template-preview)
11. [Default Template Structure](#default-template-structure)
12. [SEO Schema & Structured Data](#seo-schema--structured-data)
13. [Mobile Responsive Specs](#mobile-responsive-specs)
14. [Implementation Phases](#implementation-phases)
15. [File Structure](#file-structure)
16. [Data Flow](#data-flow)

---

## Executive Summary

Transform the current static service details page into a **dynamic template system** using the existing Page Builder. Instead of building a separate block system per service, we extend the Page Builder with **"Smart Context Widgets"** -- widgets that automatically pull data from the current service's context, like WordPress/Elementor's Theme Builder.

### Key Insight

**80% of the infrastructure already exists.** The Page Builder already has `PageTemplateType.SERVICE_DETAILS`, `ServiceProvider` context, placeholder resolution (`{{service.name}}`), and template rendering. What's missing are the **service-specific widget components** and **admin preview UX**.

### Architecture Decision

**Template-based approach** (ONE template for ALL services) vs the old per-service block approach:

| Aspect | Old Plan (Per-Service Blocks) | New Plan (Template System) |
|--------|-------------------------------|---------------------------|
| Database | New `ServicePageBlock` model per service | No new models needed |
| Admin UX | Separate builder per service | Reuse existing Page Builder |
| Layout | Unique layout per service | ONE template, dynamic data |
| Maintenance | N layouts to maintain | 1 template to maintain |
| Consistency | Risk of inconsistency | Guaranteed consistency |
| Code | New registry, new renderer | Reuse existing widget system |

### Goals

- **Template Reuse**: ONE layout template applies to ALL service pages
- **Dynamic Data**: Service data (title, price, features, packages, FAQs) fills in automatically per slug
- **Zero New Models**: Reuse existing `LandingPage` + `LandingPageBlock` tables
- **Backward Compatible**: Existing static pages and widgets work unchanged
- **Per-Service Customization**: `displayOptions` JSON field controls section visibility per service
- **Admin Preview**: Select a sample service to preview real data while editing template
- **Conversion Optimized**: 2025 best practices built into widget designs

---

## Current State Analysis

### Frontend Structure (`/services/[slug]/page.tsx`)

| Section | Description | Customizable? |
|---------|-------------|---------------|
| Breadcrumb | Back link to services | No |
| Hero | Icon, title, short desc, CTA buttons | Partially (text only) |
| What's Included | Feature grid with checkmarks | Yes (features list) |
| Package Comparison | Interactive pricing table | Yes (packages/features) |
| Long Description | Rich HTML content | Yes (rich text) |
| FAQs | Accordion-style Q&A | Yes (FAQ list) |
| Related Services | Card grid | Auto-generated |

### Current Limitations

1. **Fixed Section Order** - Cannot reorder or hide sections
2. **No Section Variants** - Each section has only one design option
3. **No Custom Sections** - Cannot add testimonials, process steps, trust badges, etc.
4. **No Per-Service Customization** - All services use identical layout
5. **No Visual Editor** - Text-only editing in admin panel

### What Already Works

The service details page (`services/[slug]/page.tsx`) already has **two rendering modes**:

```
Mode A: Template Mode (if SERVICE_DETAILS template exists)
  ├── Fetches active template via getActiveTemplateForType("SERVICE_DETAILS")
  ├── Wraps in ServiceProvider context
  ├── Filters sections by displayOptions
  └── Renders via PageBuilderRenderer

Mode B: Fallback Mode (no template)
  └── Hardcoded JSX layout (current default)
```

---

## 2025 Design Trends & Best Practices

### High-Converting Service Page Elements

Based on research from [Unbounce](https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/), [KlientBoost](https://www.klientboost.com/landing-pages/saas-landing-page/), and [Apexure](https://www.apexure.com/blog/best-saas-landing-pages-with-analysis):

| Element | Impact | Priority |
|---------|--------|----------|
| Social Proof | +34% conversions | Critical |
| Single CTA Focus | +266% vs multiple offers | Critical |
| Above-fold Value Prop | Instant impact | Critical |
| Mobile Optimization | Reduce bounce | Critical |
| Trust Signals | Builds credibility | High |
| Process Steps | Reduces anxiety | High |
| Video Content | Increases engagement | Medium |
| Live Chat | Real-time support | Medium |

### Trust Signal Placement Strategy

```
TRUST SIGNALS should be placed:
├── Hero section (above fold)
├── Near pricing (reduce purchase anxiety)
├── Above CTA buttons
└── Footer (reinforcement)
```

### Color Psychology (Midnight Orange Theme)

- **Orange** (#F97316) - Action, energy, urgency (CTAs)
- **Green** (#22C55E) - Success, trust, checkmarks
- **Midnight** (#0A0F1E) - Authority, premium feel
- **White** (#FFFFFF) - Clean, professional content areas

---

## Competitor Analysis

### Common Page Structure Across Competitors (Bizee, ZenBusiness, LegalZoom)

```
┌─────────────────────────────────────────────────────────────┐
│  1. TRUST BAR (Trustpilot, BBB, security badges)           │
├─────────────────────────────────────────────────────────────┤
│  2. HERO (Title, subtitle, main CTA, trust text)           │
├─────────────────────────────────────────────────────────────┤
│  3. FEATURES GRID (What's Included)                        │
├─────────────────────────────────────────────────────────────┤
│  4. PRICING TABLE (comparison, sticky sidebar)             │
├─────────────────────────────────────────────────────────────┤
│  5. PROCESS STEPS (what happens after purchase)            │
├─────────────────────────────────────────────────────────────┤
│  6. DESCRIPTION (detailed rich text)                       │
├─────────────────────────────────────────────────────────────┤
│  7. TESTIMONIALS / REVIEWS                                 │
├─────────────────────────────────────────────────────────────┤
│  8. FAQ ACCORDION                                          │
├─────────────────────────────────────────────────────────────┤
│  9. FINAL CTA                                              │
├─────────────────────────────────────────────────────────────┤
│  10. RELATED SERVICES                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture: Smart Context Widgets

### Core Concept

Service widgets use `useOptionalServiceContext()` to detect if they're inside a service page:
- **Context available** (live page): Pull real data from the current service
- **No context** (admin preview without selection): Show placeholder UI
- **Context from preview selector** (admin with service selected): Show real sample data

This matches the existing `service-hero` widget pattern.

### How It Works

```
Admin creates SERVICE_DETAILS template in Page Builder
         ↓
Adds service widgets: Hero, Features, Pricing, FAQ, etc.
         ↓
Each widget reads data from ServiceContext (auto mode)
         ↓
Template saved to LandingPage table (templateType = SERVICE_DETAILS)
         ↓
User visits /services/llc-formation
         ↓
Server fetches:
  1. Service data (LLC Formation) from Service table
  2. Active SERVICE_DETAILS template from LandingPage table
         ↓
Wraps template in <ServiceProvider service={llcFormationData}>
         ↓
PageBuilderRenderer renders sections/widgets
         ↓
Each service widget reads from context → displays LLC Formation data
         ↓
User visits /services/ein-number → SAME template, DIFFERENT data
```

### Widget Categories

```
SERVICE WIDGETS (Dynamic - pull from ServiceContext)
├── service-hero          - Title, description, icon, CTAs [EXISTS]
├── service-features      - What's Included grid [NEW]
├── service-description   - Rich HTML description [NEW]
├── service-breadcrumb    - Dynamic breadcrumb nav [NEW]
└── related-services      - Related service cards [NEW]

ENHANCED EXISTING WIDGETS (Support both static + dynamic modes)
├── pricing-table         - Add "auto" mode (slug from context) [ENHANCE]
└── faq                   - Add "service" source (FAQs from context) [ENHANCE]

STATIC WIDGETS (Already work in templates - no changes needed)
├── trust-badges          - Trust badges display
├── stats-section         - Statistics with animated counters
├── testimonials-carousel - Customer testimonials
├── process-steps         - How It Works section
├── heading               - Advanced heading
├── text-block            - Rich text editor
├── image                 - Image with effects
├── image-slider          - Hero slider
├── lead-form             - Contact form
├── divider               - Section divider
└── ... (all existing widgets)
```

---

## Existing Infrastructure

### Already Built (No Changes Needed)

| Component | Location | Purpose |
|-----------|----------|---------|
| `PageTemplateType.SERVICE_DETAILS` | `prisma/schema.prisma` | Template type enum |
| `LandingPage.templateType` | `prisma/schema.prisma` | Template assignment field |
| `LandingPage.isTemplateActive` | `prisma/schema.prisma` | Active template flag |
| `ServiceProvider` | `src/lib/page-builder/contexts/service-context.tsx` | React context for service data |
| `useServiceContext()` | Same file | Required context hook |
| `useOptionalServiceContext()` | Same file | Optional context hook (for preview) |
| `resolvePlaceholders()` | Same file | `{{service.xxx}}` template strings |
| `filterSectionsByDisplayOptions()` | Same file | Per-service section visibility |
| `ServiceData` type | Same file | Full service data interface |
| Template rendering | `src/app/(marketing)/services/[slug]/page.tsx` | Already checks for template |
| `getActiveTemplateForType()` | `src/lib/data/templates.ts` | Fetches active template |
| `PageBuilderRenderer` | `src/components/page-builder/renderer/` | Renders sections/widgets |
| `WidgetRegistry` | `src/lib/page-builder/widget-registry.ts` | Widget registration system |
| `service-hero` widget | `src/components/page-builder/widgets/service/service-hero.tsx` | Dynamic hero (working example) |
| Widget type declarations | `src/lib/page-builder/types.ts` | `service-features`, `service-faq`, etc. already in union |

### ServiceContext Data Shape

```typescript
interface ServiceData {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;        // Rich HTML
  icon?: string | null;
  image?: string | null;
  startingPrice: number;
  processingTime?: string | null;
  isPopular: boolean;
  category?: { id, name, slug } | null;
  packages: PackageData[];     // Pricing tiers
  features: ServiceFeatureData[];  // What's Included items
  faqs: ServiceFAQData[];     // Service-specific FAQs
  displayOptions: Partial<ServiceDisplayOptions>;
}
```

### Per-Service Display Options

Each service has a `displayOptions` JSON field that controls which template sections are visible:

```typescript
interface ServiceDisplayOptions {
  showHero: boolean;          // service-hero widget
  showFeatures: boolean;      // service-features widget
  showPricing: boolean;       // pricing-table (auto mode)
  showProcessSteps: boolean;  // process-steps widget
  showFaq: boolean;           // faq widget (service source)
  showRequirements: boolean;
  showDeliverables: boolean;
  showTimeline: boolean;
  showRelatedServices: boolean;
  showTestimonials: boolean;
  showCtaBanner: boolean;
}
```

This means: ONE template, but each service can hide/show specific sections. For example, a simple service might hide the pricing table, while LLC Formation shows everything.

---

## Service Widget Catalog

### 1. Service Hero (EXISTS)

**File:** `src/components/page-builder/widgets/service/service-hero.tsx`

Already built and working. Pulls title, description, icon, price from `ServiceContext`.

Settings:
- Title source: auto (from service) | custom
- Subtitle source: auto | custom
- Price badge: show/hide, custom text with `{{service.startingPrice}}`
- Primary CTA: text, link (supports `{{service.slug}}`), show price
- Secondary CTA: show/hide, text, link
- Background: none | solid | gradient | image
- Text alignment, title size, spacing

### 2. Service Features (NEW)

**File:** `src/components/page-builder/widgets/service/service-features.tsx`

Reads `service.features[]` from context. Renders "What's Included" section.

```typescript
interface ServiceFeaturesWidgetSettings {
  header: WidgetHeaderSettings;   // Show/hide, heading, description, alignment
  variant: "minimal-checkmark" | "cards" | "compact-grid" | "highlighted";
  columns: 1 | 2 | 3 | 4;       // Default: 3 (minimal), 3 (cards), 2 (compact), auto (highlighted)
  showIcons: boolean;
  iconStyle: "check" | "circle-check" | "badge-check" | "custom";
  iconColor: string;              // Default: "#22C55E" (green)
  showDescriptions: boolean;      // Cards variant: show feature description
}
```

**Data source:** `useServiceContext().service.features` (no API call needed)

**Preview placeholder:** Shows 6 sample feature items with checkmark icons.

### 3. Service Description (NEW)

**File:** `src/components/page-builder/widgets/service/service-description.tsx`

Reads `service.description` (HTML) from context. Renders rich text with prose styling.

```typescript
interface ServiceDescriptionWidgetSettings {
  header: WidgetHeaderSettings;   // Show/hide, heading (default: "About {{service.name}}"), alignment
  variant: "clean-prose" | "bordered" | "two-column-sidebar";
  maxWidth: "sm" | "md" | "lg" | "xl" | "full";  // Default: "lg"
  fontSize: "sm" | "md" | "lg";
  // Two-column sidebar settings
  sidebar: {
    show: boolean;
    showProcessingTime: boolean;
    showStartingPrice: boolean;
    showPopularBadge: boolean;
    customHighlights: { icon: string; label: string; value: string }[];
  };
}
```

**Data source:** `useServiceContext().service.description` (no API call needed)

**Preview placeholder:** Shows lorem ipsum with prose typography.

### 4. Service Breadcrumb (NEW)

**File:** `src/components/page-builder/widgets/service/service-breadcrumb.tsx`

Renders dynamic breadcrumb: Home > Services > {Category?} > {Service Name}

```typescript
interface ServiceBreadcrumbWidgetSettings {
  variant: "simple-text" | "pill-chip" | "minimal";
  separator: "chevron" | "slash" | "arrow" | "dot";  // Used by simple-text & minimal
  showHome: boolean;
  homeLabel: string;              // Default: "Home"
  showCategory: boolean;
  fontSize: "xs" | "sm" | "md";
  alignment: "left" | "center";
}
```

**Data source:** `useServiceContext().service.{name, slug, category}` (no API call)

### 5. Related Services (NEW)

**File:** `src/components/page-builder/widgets/service/related-services.tsx`

Fetches related services via API, excluding current service.

```typescript
interface RelatedServicesWidgetSettings {
  header: WidgetHeaderSettings;   // Show/hide, heading (default: "Related Services"), alignment
  maxItems: number;               // Default: 4
  columns: 2 | 3 | 4;            // Default: 4
  cardVariant: "minimal" | "elevated" | "horizontal" | "bordered-badge";
  showPrice: boolean;             // Default: true
  showDescription: boolean;       // Default: true (hidden on mobile)
  showCategoryBadge: boolean;     // Default: false (used by bordered-badge variant)
  ctaText: string;                // Default: "Learn More"
}
```

**Data source:** Hybrid. Gets current slug from `useServiceContext()`, then fetches `GET /api/services/related?slug={slug}&limit={n}` via API.

**API Route (NEW):** `src/app/api/services/related/route.ts`

---

## Visual Design Specs & Style Variants

### Service Features Widget - 4 Style Variants

Each variant pulls data from `service.features[]` via ServiceContext.

#### Variant 1: Minimal Checkmark List (Default)

Clean, compact list with green checkmarks. Best for services with many features.

```
┌──────────────────────────────────────────────────────────┐
│  What's Included                                         │
│                                                          │
│  ✓ Free LLC Formation Filing    ✓ Operating Agreement    │
│  ✓ EIN/Tax ID Number           ✓ Registered Agent (1yr) │
│  ✓ Banking Resolution          ✓ Compliance Calendar    │
└──────────────────────────────────────────────────────────┘
```

**Tailwind classes:**
- Container: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`
- Item: `flex items-start gap-3 py-2`
- Icon: `text-emerald-500 shrink-0 mt-0.5` (Lucide `Check` or `CircleCheck`, 18px)
- Text: `text-sm text-foreground leading-snug`
- Title: `text-2xl font-bold tracking-tight mb-6`

#### Variant 2: Feature Cards with Icons

Elevated cards with centered icon + label. Best for 6-9 features.

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    📄            │  │    🔐            │  │    📋            │
│  Free Filing     │  │   EIN Setup     │  │  Operating Agmt  │
│  State filing    │  │  Federal tax ID  │  │  Custom drafted  │
│  included free   │  │  for your LLC    │  │  for your state  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Tailwind classes:**
- Card: `rounded-xl border bg-card p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`
- Icon wrapper: `mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary`
- Title: `font-semibold text-sm`
- Description: `mt-1 text-xs text-muted-foreground line-clamp-2`
- Grid: `grid grid-cols-2 sm:grid-cols-3 gap-4`

#### Variant 3: Compact Grid

Tight two-column list with subtle dot separators. Good for long feature lists (10+).

```
┌──────────────────────────────────────────────────────────┐
│  • Free LLC Formation         • Banking Resolution       │
│  • Operating Agreement        • Compliance Calendar      │
│  • EIN/Tax ID Number          • Registered Agent (1yr)   │
│  • State Filing Included      • Priority Support         │
└──────────────────────────────────────────────────────────┘
```

**Tailwind classes:**
- Container: `rounded-xl border bg-muted/30 p-6`
- Grid: `grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2`
- Item: `flex items-center gap-2 text-sm py-1`
- Dot: `h-1.5 w-1.5 rounded-full bg-primary shrink-0`

#### Variant 4: Highlighted/Boxed Items

Individual pill-style badges. Best for 4-8 key features.

```
┌──────────────────────────────────────────────────────────┐
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ ✓ Free Filing    │  │ ✓ EIN Setup      │              │
│  └──────────────────┘  └──────────────────┘              │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ ✓ Operating Agmt │  │ ✓ Registered Agt │              │
│  └──────────────────┘  └──────────────────┘              │
└──────────────────────────────────────────────────────────┘
```

**Tailwind classes:**
- Grid: `flex flex-wrap gap-3`
- Badge: `inline-flex items-center gap-2 rounded-lg border bg-emerald-500/5 border-emerald-500/20 px-4 py-2.5 text-sm font-medium`
- Icon: `text-emerald-500` (CircleCheck, 16px)

---

### Service Breadcrumb Widget - 3 Style Variants

All variants render: `Home > Services > {Category?} > {Service Name}`
Last item is current page (non-clickable, muted or bold).

#### Variant 1: Simple Text (Default, Stripe-like)

```
Home  /  Services  /  LLC Formation
```

**Tailwind classes:**
- Nav: `flex items-center gap-1.5 text-sm`
- Link: `text-muted-foreground hover:text-foreground transition-colors`
- Separator: `text-muted-foreground/50 mx-1` (Lucide `ChevronRight` 14px or `/` text)
- Current: `text-foreground font-medium truncate`

#### Variant 2: Pill/Chip Style

```
[ Home ] > [ Services ] > [ LLC Formation ]
```

**Tailwind classes:**
- Nav: `flex items-center gap-2 text-sm`
- Chip: `rounded-full bg-muted px-3 py-1 text-muted-foreground hover:bg-muted/80 transition-colors`
- Active chip: `bg-primary/10 text-primary font-medium`
- Separator: `text-muted-foreground/40` (ChevronRight 14px)

#### Variant 3: Minimal with Custom Separators

```
Home → Services → LLC Formation
```

**Tailwind classes:**
- Nav: `flex items-center gap-2 text-xs text-muted-foreground`
- Link: `hover:text-foreground transition-colors underline-offset-4 hover:underline`
- Current: `text-foreground`
- Separator options: `→` (arrow), `·` (dot), `|` (pipe)

#### Schema.org BreadcrumbList (Generated at page level)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://llcpad.com" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://llcpad.com/services" },
    { "@type": "ListItem", "position": 3, "name": "LLC Formation", "item": "https://llcpad.com/services/llc-formation" }
  ]
}
```

---

### Service Description Widget - 3 Style Variants

Renders `service.description` (HTML) with prose typography.

#### Variant 1: Clean Prose (Default, Blog-style)

Plain rich text, max-width constrained, with typographic rhythm.

```
┌──────────────────────────────────────────────────────────┐
│  About LLC Formation                                     │
│                                                          │
│  Forming an LLC protects your personal assets from       │
│  business liabilities. Our expert team handles the       │
│  entire filing process...                                │
│                                                          │
│  Benefits include:                                       │
│  • Personal asset protection                             │
│  • Tax flexibility                                       │
│  • Professional credibility                              │
└──────────────────────────────────────────────────────────┘
```

**Tailwind classes:**
- Container: `mx-auto max-w-3xl`
- Title: `text-2xl font-bold tracking-tight mb-6` or `text-3xl`
- Prose: `prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-li:marker:text-primary`
- Paragraph: inherits `text-base leading-relaxed text-muted-foreground`

#### Variant 2: Bordered Container (Info Panel)

Description inside a bordered card with optional accent left border.

```
┌──────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────┐   │
│ │ ▎ About LLC Formation                              │   │
│ │ ▎                                                  │   │
│ │ ▎ Forming an LLC protects your personal assets...  │   │
│ │ ▎                                                  │   │
│ │ ▎ Benefits include:                                │   │
│ │ ▎ • Personal asset protection                      │   │
│ │ ▎ • Tax flexibility                                │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Tailwind classes:**
- Card: `rounded-xl border border-l-4 border-l-primary bg-card p-8`
- Title: `text-xl font-semibold mb-4`
- Prose: `prose prose-sm dark:prose-invert max-w-none`

#### Variant 3: Two-Column with Sidebar Highlights (Recommended for LLCPad)

Description on the left, key highlights on the right sidebar.

```
┌──────────────────────────────────────────────────────────┐
│  ┌──────────────────────┐  ┌──────────────────────┐      │
│  │ About LLC Formation  │  │ Key Highlights       │      │
│  │                      │  │                      │      │
│  │ Forming an LLC       │  │ ⏱ 1-3 Business Days │      │
│  │ protects your        │  │ 💰 Starting at $0    │      │
│  │ personal assets...   │  │ ⭐ 4.9/5 Rating      │      │
│  │                      │  │ 🛡️ 100% Guarantee    │      │
│  └──────────────────────┘  └──────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

**Tailwind classes:**
- Grid: `grid grid-cols-1 lg:grid-cols-3 gap-8`
- Content (2/3): `lg:col-span-2 prose prose-slate dark:prose-invert max-w-none`
- Sidebar (1/3): `space-y-4`
- Sidebar card: `rounded-xl border bg-card p-6`
- Highlight item: `flex items-center gap-3 py-2 border-b last:border-0`
- Highlight icon: `h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary`
- Highlight text: `text-sm font-medium`
- Highlight value: `text-xs text-muted-foreground`

**Sidebar data sources:** `service.processingTime`, `service.startingPrice`, `service.isPopular`. Configurable in settings.

---

### Related Services Widget - 4 Card Style Variants

Fetches related services via API, excludes current service. Grid layout (recommended over carousel for ≤4 items).

#### Variant 1: Minimal Card

Flat, borderless cards with subtle hover.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 📋           │  │ 🔑           │  │ 📦           │  │ 🏦           │
│ EIN Number   │  │ Reg. Agent   │  │ Amazon Acct  │  │ Banking      │
│ From $49     │  │ From $99/yr  │  │ From $299    │  │ From $149    │
│              │  │              │  │              │  │              │
│ Learn More → │  │ Learn More → │  │ Learn More → │  │ Learn More → │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Tailwind classes:**
- Card: `group rounded-xl p-6 transition-colors hover:bg-muted/50`
- Icon: `h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4`
- Title: `font-semibold text-base group-hover:text-primary transition-colors`
- Price: `text-sm text-muted-foreground mt-1`
- Link: `text-sm text-primary font-medium mt-3 inline-flex items-center gap-1`
- Arrow: `transition-transform group-hover:translate-x-1` (ArrowRight 14px)

#### Variant 2: Elevated Card (Recommended)

Cards with border + shadow + hover lift. Professional SaaS aesthetic.

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 📋               │  │ 🔑               │  │ 📦               │
│ EIN Number       │  │ Registered Agent │  │ Amazon Account   │
│ Get your federal │  │ Stay compliant   │  │ Professional     │
│ tax ID number    │  │ with a reliable  │  │ seller account   │
│                  │  │ registered agent │  │ setup service    │
│ From $49         │  │ From $99/yr      │  │ From $299        │
│                  │  │                  │  │                  │
│ [Learn More →]   │  │ [Learn More →]   │  │ [Learn More →]   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Tailwind classes:**
- Card: `group rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`
- Icon: `h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4`
- Title: `font-semibold text-lg`
- Description: `text-sm text-muted-foreground mt-2 line-clamp-2`
- Price: `text-sm font-semibold text-primary mt-3`
- Link: `mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary`
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`

#### Variant 3: Horizontal Card

Wide landscape cards, icon left + content right. Good for 2-3 items.

```
┌──────────────────────────────────────────────────────────┐
│  📋  EIN Number                              From $49   │
│      Get your federal tax ID number...     [Learn More] │
├──────────────────────────────────────────────────────────┤
│  🔑  Registered Agent                       From $99/yr │
│      Stay compliant with a reliable...     [Learn More] │
└──────────────────────────────────────────────────────────┘
```

**Tailwind classes:**
- Card: `group flex items-center gap-6 rounded-xl border bg-card p-5 hover:shadow-md transition-all`
- Icon: `h-14 w-14 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center`
- Content: `flex-1 min-w-0`
- Right side: `shrink-0 text-right`
- Price: `text-sm font-semibold text-primary`
- Stack: `space-y-3`

#### Variant 4: Bordered Badge Card

Cards with top color accent border and badge tag.

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │  │ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │  │ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │
│ [Tax Services]   │  │ [Compliance]    │  │ [Amazon]        │
│                  │  │                  │  │                  │
│ EIN Number       │  │ Registered Agent │  │ Amazon Account   │
│ From $49         │  │ From $99/yr      │  │ From $299        │
│ [Get Started →]  │  │ [Get Started →]  │  │ [Get Started →]  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Tailwind classes:**
- Card: `group rounded-xl border border-t-4 border-t-primary bg-card p-6 hover:shadow-lg transition-all duration-300`
- Badge: `inline-flex rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1 mb-3`
- Title: `font-semibold text-lg`
- Price: `text-sm text-muted-foreground mt-1`
- CTA: `mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all`

#### Grid vs Carousel Decision

| Factor | Grid (Recommended) | Carousel |
|--------|-------------------|----------|
| Discoverability | All items visible at once | Hidden behind arrows |
| Mobile UX | Stacks naturally | Swipe can conflict with scroll |
| SEO | All links visible | Content may be hidden |
| Best for | ≤4 items (our case) | 6+ items |

**Decision:** Use **CSS Grid** as default. Carousel only if `maxItems > 4` in future.

---

### Service FAQ Widget - Visual Spec

Already built as `service-faq-accordion.tsx`. Uses premium card-style design with:

- Rounded cards with `grid-rows-[0fr]` → `grid-rows-[1fr]` height animation (300ms)
- Active card: `border-primary/20 bg-primary/[0.03] shadow-md shadow-primary/5`
- Circular chevron button with rotation animation
- Hover lift effect on closed cards: `hover:-translate-y-0.5 hover:shadow-md`
- Single-open behavior (clicking one closes others)

When used in template via FAQ widget with `source: "service"`, inherits the same premium design.

---

## Enhanced Existing Widgets

### Pricing Table - Auto Mode

**File:** `src/components/page-builder/widgets/commerce/pricing-table-widget.tsx`

Current behavior: Requires hardcoded `serviceSlug` in `dataSource` settings.

Enhancement: Add `dataSource.mode: "manual" | "auto"`:
- **"manual"** (default): Uses `dataSource.serviceSlug` -- current behavior, unchanged
- **"auto"**: Reads slug from `useOptionalServiceContext()`, fetches same API

```typescript
// Enhanced dataSource settings
dataSource: {
  type: "service" | "manual";
  mode: "manual" | "auto";     // NEW
  serviceSlug?: string;         // Used when mode === "manual"
}
```

**Backward compatible:** Default `mode: "manual"` means all existing pricing-table widgets work unchanged.

### FAQ Widget - Service Source

**File:** `src/components/page-builder/widgets/layout/faq-accordion-widget.tsx`

Current behavior: `source: "all" | "category"` -- fetches global FAQs via API.

Enhancement: Add `source: "service"`:
- **"all"** / **"category"**: Unchanged API fetch behavior
- **"service"** (NEW): Reads `service.faqs` from `useServiceContext()` directly (no API call)

```typescript
source: "all" | "category" | "service";  // "service" is NEW
```

**Backward compatible:** Default `source: "all"` means all existing FAQ widgets work unchanged.

---

## Admin UX: Template Preview

### "Preview as Service" Dropdown

When editing a page with `templateType === "SERVICE_DETAILS"`, the admin toolbar shows a service selector dropdown.

```
┌─────────────────────────────────────────────────────────────┐
│  Page Builder: Service Details Template                      │
│  ═══════════════════════════════════════════════════════    │
│                                                             │
│  [Desktop] [Mobile]  Preview as: [LLC Formation ▼]  [Save] │
│                                                             │
│  ┌─────────────┐  ┌────────────────────────────────────┐   │
│  │ WIDGETS     │  │                                    │   │
│  │             │  │  [service-breadcrumb]              │   │
│  │ Service     │  │  Home > Services > LLC Formation   │   │
│  │ ├ Hero      │  │                                    │   │
│  │ ├ Features  │  ├────────────────────────────────────┤   │
│  │ ├ Pricing   │  │                                    │   │
│  │ ├ FAQ       │  │  [service-hero]                    │   │
│  │ ├ Descript  │  │  LLC Formation                     │   │
│  │ ├ Breadcr   │  │  Get Started - From $0             │   │
│  │ └ Related   │  │                                    │   │
│  │             │  ├────────────────────────────────────┤   │
│  │ Content     │  │                                    │   │
│  │ ├ Heading   │  │  [service-features]                │   │
│  │ ├ Text      │  │  ✓ Free Formation  ✓ EIN Setup    │   │
│  │ └ Process   │  │  ✓ Operating Agreement  ...       │   │
│  │             │  │                                    │   │
│  │ Commerce    │  ├────────────────────────────────────┤   │
│  │ ├ Pricing   │  │  [pricing-table mode:auto]         │   │
│  │ └ Services  │  │  Basic $0 | Standard $199 | ...   │   │
│  │             │  │                                    │   │
│  └─────────────┘  └────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
1. New component: `src/components/admin/ui/service-preview-selector.tsx`
2. Fetches service list from `GET /api/services/public`
3. When selected, fetches full service data and wraps canvas with `<ServiceProvider>`
4. All service widgets receive real data in builder preview

---

## Default Template Structure

When creating a new SERVICE_DETAILS template, pre-populate with this complete 11-section structure:

```
Section 1: Full-width, no padding
  └── service-breadcrumb (variant: simple-text, show category)

Section 2: Full-width, py-16
  └── service-hero (center aligned, auto title/subtitle, gradient bg)

Section 3: py-12, light bg (bg-muted/30)
  └── trust-badges (compact row: "10,000+ LLCs Formed", "A+ BBB Rating", "4.9★ Trustpilot")

Section 4: py-16
  └── service-features (variant: minimal-checkmark, 3 columns, green icons)

Section 5: py-16, light bg
  └── pricing-table (mode: "auto", view: table comparison)

Section 6: py-12
  └── process-steps (3-4 steps: "Choose Package → Submit Info → We File → You're Done")

Section 7: py-16, light bg
  └── service-description (variant: two-column-sidebar, with key highlights)

Section 8: py-12
  └── testimonials-carousel (auto-play, 3 visible, source: all)

Section 9: py-16, light bg
  └── faq (source: "service", style: cards, expand first)

Section 10: py-12
  └── heading + text-block (CTA banner: "Ready to Get Started?", primary CTA button)

Section 11: py-12, light bg
  └── related-services (variant: elevated, 4 items, grid layout)
```

### Section-by-Section Reasoning

| # | Widget | Why |
|---|--------|-----|
| 1 | Breadcrumb | SEO + navigation context, zero visual weight |
| 2 | Hero | Above-fold value proposition, primary CTA |
| 3 | Trust Badges | Social proof immediately after hero (+34% conversions) |
| 4 | Features | "What's Included" reduces purchase anxiety |
| 5 | Pricing | Comparison drives package selection |
| 6 | Process Steps | "How It Works" reduces uncertainty |
| 7 | Description | Detailed info for researching buyers + SEO content |
| 8 | Testimonials | Social proof near mid-page decision point |
| 9 | FAQ | Address remaining objections |
| 10 | CTA Banner | Final conversion push |
| 11 | Related | Cross-sell, reduces exit rate |

### displayOptions Mapping

Each section maps to a `displayOptions` flag so services can hide irrelevant sections:

```typescript
const sectionDisplayMap: Record<string, keyof ServiceDisplayOptions> = {
  "service-breadcrumb": "showHero",       // Always show if hero shows
  "service-hero": "showHero",
  "trust-badges": "showCtaBanner",        // Controlled by CTA flag
  "service-features": "showFeatures",
  "pricing-table": "showPricing",
  "process-steps": "showProcessSteps",
  "service-description": "showDeliverables",
  "testimonials-carousel": "showTestimonials",
  "faq": "showFaq",
  "heading": "showCtaBanner",             // CTA banner section
  "related-services": "showRelatedServices",
};
```

This is generated via `createDefaultServiceDetailsTemplate()` in `src/lib/page-builder/template-defaults.ts`, using existing `createSection()` and `createWidget()` helpers from the widget registry.

---

## SEO Schema & Structured Data

### Architecture Decision

**All JSON-LD is generated at the page-level server component** (`services/[slug]/page.tsx`), NOT inside individual widgets. This ensures:
- Server-rendered in `<head>` (no hydration issues)
- Single source of truth for structured data
- Widgets remain pure UI components
- Schema output is deterministic and cacheable

### Schema Types to Generate

#### 1. Service Schema (Primary)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "LLC Formation",
  "description": "Professional LLC formation service...",
  "url": "https://llcpad.com/services/llc-formation",
  "provider": {
    "@type": "Organization",
    "name": "LLCPad",
    "url": "https://llcpad.com"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "299",
    "priceCurrency": "USD",
    "offerCount": 3
  },
  "serviceType": "LLC Formation"
}
```

**Data source:** `service.name`, `service.shortDesc`, `service.slug`, `service.packages[].price`

#### 2. BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://llcpad.com" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://llcpad.com/services" },
    { "@type": "ListItem", "position": 3, "name": "LLC Formation" }
  ]
}
```

**Data source:** `service.name`, `service.slug`, `service.category?.name`

#### 3. FAQ Schema (Conditional)

Only generated when `displayOptions.showFaq !== false` AND `service.faqs.length > 0`.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does LLC formation take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Typically 1-3 business days..."
      }
    }
  ]
}
```

**Data source:** `service.faqs[]` (question → name, answer → stripped HTML for text)

**Note:** Google restricted FAQ rich results to government and health sites in Aug 2023, but the schema is still valuable for:
- AI-powered search engines (ChatGPT Search, Perplexity, Google AI Overviews)
- Bing search results
- Schema validators and SEO audit tools

#### 4. Product Schema (For pricing rich results)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "LLC Formation Service",
  "description": "...",
  "offers": [
    {
      "@type": "Offer",
      "name": "Basic Package",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  ]
}
```

### Implementation

```typescript
// src/lib/seo/service-schema.ts
export function generateServiceSchema(service: ServiceData, baseUrl: string) {
  const schemas = [];

  // Always add Service + BreadcrumbList
  schemas.push(buildServiceSchema(service, baseUrl));
  schemas.push(buildBreadcrumbSchema(service, baseUrl));

  // Conditionally add FAQ schema
  if (service.displayOptions?.showFaq !== false && service.faqs.length > 0) {
    schemas.push(buildFAQSchema(service.faqs));
  }

  // Add Product schema if packages exist
  if (service.packages.length > 0) {
    schemas.push(buildProductSchema(service, baseUrl));
  }

  return schemas;
}
```

```tsx
// In services/[slug]/page.tsx (server component)
import { generateServiceSchema } from "@/lib/seo/service-schema";

export async function generateMetadata({ params }) {
  const service = await getService(params.slug);
  return {
    title: service.name,
    description: service.shortDesc,
    // other meta tags
  };
}

export default async function ServicePage({ params }) {
  const service = await getService(params.slug);
  const schemas = generateServiceSchema(service, "https://llcpad.com");

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {/* Rest of page */}
    </>
  );
}
```

---

## Mobile Responsive Specs

### Breakpoint System

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | `< 640px` | Single column, stacked layout |
| Tablet | `640px - 1024px` | Two columns where applicable |
| Desktop | `> 1024px` | Full multi-column layouts |

### Per-Widget Mobile Behavior

#### Service Hero
- **Desktop:** Center-aligned with large title (text-4xl/text-5xl)
- **Mobile:** Left-aligned, title scales to text-2xl/text-3xl
- **CTA buttons:** Stack vertically below 640px (`flex-col sm:flex-row`)
- **Price badge:** Moves below title on mobile
- **Touch target:** CTA buttons minimum 48px height

#### Service Features
- **Desktop:** 3-column grid (`lg:grid-cols-3`)
- **Tablet:** 2-column grid (`sm:grid-cols-2`)
- **Mobile:** Single column list
- **Cards variant:** 2 columns on mobile (`grid-cols-2`), smaller padding (`p-4` vs `p-6`)
- **Icon size:** Maintains 18px minimum for readability

#### Service Breadcrumb
- **Desktop:** Full breadcrumb path visible
- **Mobile:** Truncate middle items if path > 3 levels, show `Home > ... > Service Name`
- **Font size:** `text-xs` on mobile, `text-sm` on desktop
- **Horizontal scroll:** `overflow-x-auto scrollbar-none` if too long
- **Touch targets:** Links have min 44px tap area via padding

#### Pricing Table
- **Desktop:** Side-by-side comparison table
- **Tablet:** Horizontal scroll or card stack
- **Mobile:** Card stack (one package per card), swipeable
- **Sticky header:** Package names stick during scroll
- **Font scaling:** Prices `text-xl` mobile vs `text-3xl` desktop

#### Service Description
- **Desktop (two-column):** Content 2/3 + Sidebar 1/3
- **Tablet:** Content full-width, sidebar below as horizontal cards
- **Mobile:** Content full-width, sidebar stacks below
- **Prose:** `prose-sm` on mobile, `prose` on desktop
- **Container padding:** `px-4` mobile, `px-6` tablet, `px-8` desktop

#### Related Services
- **Desktop:** 4-column grid
- **Tablet:** 2-column grid
- **Mobile:** Single column OR horizontal scroll cards
- **Card content:** Hide description on mobile, show title + price only
- **Touch:** Cards are fully tappable (`<Link>` wraps entire card)

#### FAQ Accordion
- **Desktop/Tablet:** Full-width cards with padding
- **Mobile:** Reduced padding (`p-4` vs `p-6`), question font `text-sm` vs `text-base`
- **Touch target:** Entire card header is clickable, min 48px height
- **Animation:** Maintained on mobile (300ms grid-rows transition)

#### Process Steps
- **Desktop:** Horizontal stepper with connecting lines
- **Tablet:** 2x2 grid
- **Mobile:** Vertical stepper with left-side timeline line
- **Step number:** Circle badge consistent across all breakpoints

### Global Mobile Rules

```css
/* All interactive elements */
button, a, [role="button"] {
  min-height: 44px; /* WCAG touch target */
}

/* Spacing compression on mobile */
section {
  padding-block: theme(spacing.8); /* 32px vs 48-64px desktop */
}

/* Typography scaling */
h1 { font-size: clamp(1.5rem, 4vw, 3rem); }
h2 { font-size: clamp(1.25rem, 3vw, 2.25rem); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Performance on Mobile

- **Images:** Use `next/image` with `sizes` prop, serve WebP/AVIF
- **Lazy loading:** Related services and testimonials use `loading="lazy"`
- **Font:** System font stack for body, custom font only for headings
- **Bundle:** Service widgets are code-split via dynamic imports in renderer

---

## Implementation Phases

### Phase 1: Types & Defaults

**Files:**
- `src/lib/page-builder/types.ts` -- Add `"service-features"`, `"service-description"`, `"service-breadcrumb"`, `"related-services"` settings interfaces; enhance pricing-table dataSource with `mode` field; enhance FAQ source with `"service"` option
- `src/lib/page-builder/defaults.ts` -- Add defaults for 4 new widgets, update pricing-table defaults

**No breaking changes.** All additions are backward compatible.

**Note on WidgetType union:** `"service-features"`, `"service-description"`, `"service-breadcrumb"` may already exist in the union type. Verify before adding duplicates.

### Phase 2: Context-Only Widgets (No API calls)

Build widgets that read directly from ServiceContext:

1. **`service-features`** -- Grid of service features with 4 style variants (minimal-checkmark, cards, compact-grid, highlighted)
2. **`service-description`** -- Rich HTML description with 3 style variants (clean-prose, bordered, two-column-sidebar)
3. **`service-breadcrumb`** -- Dynamic breadcrumb with 3 style variants (simple-text, pill-chip, minimal)

Each follows the `service-hero` pattern: `useOptionalServiceContext()` + placeholder when no context.

**Files per widget:**
- Widget component: `src/components/page-builder/widgets/service/{name}.tsx`
- Settings panel: `src/components/page-builder/settings/{name}-settings.tsx`

### Phase 3: Enhance Existing Widgets

Add dynamic modes to existing widgets:

- **`pricing-table`** -- Add `dataSource.mode: "auto"` that reads slug from ServiceContext
- **`faq`** -- Add `source: "service"` that reads `service.faqs` from context

**Backward compatible.** Defaults preserve current behavior.

### Phase 4: Related Services Widget + API

Build `related-services` widget with 4 card variants (minimal, elevated, horizontal, bordered-badge) and its API route.

**API:** `GET /api/services/related?slug={slug}&limit={n}`
- Returns services from same category, excluding current
- Falls back to popular services if no category match
- Response: `{ services: ServiceCardData[] }`

### Phase 5: SEO Schema Implementation

Create `src/lib/seo/service-schema.ts` with schema generators. Integrate into `services/[slug]/page.tsx` server component.

Schemas: Service, BreadcrumbList, FAQPage (conditional), Product (conditional).

### Phase 6: Admin UX - Template Preview

Add "Preview as Service" dropdown to page editor when editing SERVICE_DETAILS template. Wraps canvas with `ServiceProvider` using selected service's data.

### Phase 7: Registration & Wiring

Register all new widgets, add to renderer map, add settings panels to builder panel, update barrel exports.

### Phase 8: Default Template Factory

Create `createDefaultServiceDetailsTemplate()` in `src/lib/page-builder/template-defaults.ts` — generates the full 11-section default template with proper widget settings.

### Phase 9: Mobile Polish & Testing

Verify all widgets at mobile/tablet breakpoints. Test touch targets, font scaling, layout stacking. Run Lighthouse audit.

### Note: Process Steps Widget

The `process-steps` widget already exists as a static widget. It does NOT need a "service" data source because:
- Process steps are generic ("Choose Package → Submit Info → We File → You're Done")
- They're the same across most services
- Admin can customize text per template section
- If per-service process steps are needed later, this can be enhanced like pricing-table with an `auto` mode

---

## File Structure

### New Files

```
src/components/page-builder/widgets/service/
  service-features.tsx            # Features grid (4 style variants)
  service-description.tsx         # Rich HTML description (3 style variants)
  service-breadcrumb.tsx          # Dynamic breadcrumb (3 style variants)
  related-services.tsx            # Related services cards (4 card variants)

src/components/page-builder/settings/
  service-features-settings.tsx   # Settings: layout, columns, icon style, variant
  service-description-settings.tsx # Settings: variant, maxWidth, sidebar config
  service-breadcrumb-settings.tsx  # Settings: separator, variant, show category
  related-services-settings.tsx    # Settings: card variant, columns, maxItems

src/components/admin/ui/
  service-preview-selector.tsx    # "Preview as Service" dropdown

src/app/api/services/related/
  route.ts                        # GET /api/services/related?slug=&limit=

src/lib/page-builder/
  template-defaults.ts            # Default 11-section template factory

src/lib/seo/
  service-schema.ts               # JSON-LD generators (Service, Breadcrumb, FAQ, Product)
```

### Modified Files

```
src/lib/page-builder/types.ts                    # New types + enhanced types
src/lib/page-builder/defaults.ts                 # New defaults
src/lib/page-builder/register-widgets.ts         # Register 4 new widgets
src/components/page-builder/widgets/service/index.ts  # Barrel exports
src/components/page-builder/renderer/widget-renderer.tsx  # Widget map
src/components/page-builder/widgets/commerce/pricing-table-widget.tsx  # Auto mode
src/components/page-builder/widgets/layout/faq-accordion-widget.tsx    # Service source
src/app/admin/appearance/pages/[id]/page.tsx      # Preview selector
src/app/admin/appearance/landing-page/components/widget-builder-panel.tsx  # Settings panels
```

---

## Data Flow

### Live Page Rendering

```
User visits /services/llc-formation
         ↓
Server: getService("llc-formation") → ServiceData from DB
Server: getActiveTemplateForType("SERVICE_DETAILS") → Template sections
         ↓
<ServiceProvider service={llcFormationData}>
  <PageBuilderRenderer sections={visibleSections} />
</ServiceProvider>
         ↓
Each widget reads from ServiceContext:
  service-hero      → service.name, service.shortDesc, service.icon
  service-features  → service.features[]
  pricing-table     → fetches /api/services/llc-formation (auto mode)
  service-description → service.description (HTML)
  faq               → service.faqs[] (service source)
  related-services  → fetches /api/services/related?slug=llc-formation
```

### Admin Template Editing

```
Admin opens Page Builder for SERVICE_DETAILS template
         ↓
Selects "LLC Formation" from "Preview as Service" dropdown
         ↓
Fetches full service data → wraps canvas with <ServiceProvider>
         ↓
All service widgets show real LLC Formation data
Admin adjusts layout, styling, widget settings
         ↓
Saves template → applies to ALL service detail pages
```

### Per-Service Visibility Control

```
Admin edits "EIN Number" service in Admin > Services > Edit
  → displayOptions: { showPricing: false, showFaq: true, ... }
         ↓
User visits /services/ein-number
  → Template loaded, but pricing section filtered out
  → FAQ section still visible
```

---

## Migration Strategy

### No Database Migration Needed

The new architecture reuses existing tables:
- `LandingPage` with `templateType = SERVICE_DETAILS`
- `LandingPageBlock` for storing widget sections
- `Service.displayOptions` JSON field for per-service visibility

### Rollback Plan

- Original hardcoded layout remains as fallback (Mode B in service page)
- If no SERVICE_DETAILS template exists or has no sections, fallback renders automatically
- Template can be deactivated at any time via `isTemplateActive = false`

---

## Summary

This redesign transforms LLCPad's service pages into a dynamic template system by extending the existing Page Builder:

- **Zero new DB models** -- reuses `LandingPage` + `LandingPageBlock`
- **4 new service widgets** -- service-features (4 variants), service-description (3 variants), service-breadcrumb (3 variants), related-services (4 variants)
- **2 enhanced widgets** -- pricing-table and FAQ gain dynamic `auto`/`service` modes
- **SEO structured data** -- Service, BreadcrumbList, FAQPage, Product schemas generated at page level
- **11-section default template** -- Complete conversion-optimized layout with trust signals, testimonials, CTA
- **Mobile-first responsive** -- All widgets have documented mobile breakpoint behavior
- **Admin preview** -- "Preview as Service" dropdown for real data in builder
- **Backward compatible** -- all existing pages and widgets work unchanged
- **Per-service control** -- `displayOptions` controls section visibility per service
- **9 implementation phases** -- Types → Widgets → Enhancements → API → SEO → Admin UX → Registration → Default Template → Mobile Polish

---

## References

- [Unbounce - SaaS Landing Pages](https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/)
- [KlientBoost - High-Converting SaaS Landing Pages](https://www.klientboost.com/landing-pages/saas-landing-page/)
- [Magic UI - SaaS Landing Page Best Practices 2025](https://magicui.design/blog/saas-landing-page-best-practices)
- [Kinsta - Gutenberg vs Elementor](https://kinsta.com/blog/gutenberg-vs-elementor/)
- [Attention Insight - Psychology of Trust in UX](https://attentioninsight.com/the-psychology-of-trust-in-ux-what-encourages-customer-loyalty/)
- [LogRocket - Trust-Driven UX Examples](https://blog.logrocket.com/ux-design/trust-driven-ux-examples/)
- [Bizee LLC Formation](https://bizee.com)
- [CNBC - Bizee Review 2025](https://www.cnbc.com/select/bizee-review/)
