# Section-Based Page Builder System

## Overview

Elementor/Webflow style page builder যেখানে:
- **Section** = Row container with column layout
- **Column** = Container within section
- **Widget** = Atomic component inside column

---

## Core Concept

```
Page
  └── Section (1 col / 2 col / 3 col / custom)
        └── Column
              └── Widget (Hero Content, Image, Lead Form, etc.)
```

---

## User Flow

### Example 1: Simple Hero + Trust + Stats

```
Step 1: Click "Add Block" → Select 1 Column
        → Add "Hero Content" widget

Step 2: Click "Add Block" → Select 1 Column
        → Add "Trust Badges" widget (full width)

Step 3: Click "Add Block" → Select 1 Column
        → Add "Stats Section" widget (full width)
```

**Result:**
```
┌─────────────────────────────────────────┐
│           Hero Content                  │
│  Badge
│ Headline
│  Subheadline         
│  Features  
│  Buttons  
│  Trust Text        
├─────────────────────────────────────────┤
│  [Badge] [Badge] [Badge] [Badge]        │  ← Trust Badges
├─────────────────────────────────────────┤
│  10,000+    50+     4.9/5     24h       │  ← Stats Section
└─────────────────────────────────────────┘
```

### Example 2: Split Hero with Lead Form

```
Step 1: Click "Add Block" → Select 2 Columns (50/50)
        → Left: Add "Hero Content" widget
        → Right: Add "Lead Form" widget

Step 2: Click "Add Block" → Select 1 Column
        → Add "Trust Badges" widget
```

**Result:**
```
┌──────────────────────┬──────────────────────┐
│    Hero Content      │     Lead Form        │
│    - Badge           │     - Name           │
│    - Headline        │     - Email          │
│    - Subheadline     │     - Phone          │
│    - Features        │     - Submit         │
│    - Buttons         │                      │
├──────────────────────┴──────────────────────┤
│    Trust Badges (Full Width)                │
└─────────────────────────────────────────────┘
```

### Example 3: Hero with Image

```
Step 1: Click "Add Block" → Select 2 Columns (50/50)
        → Left: Add "Hero Content" widget
        → Right: Add "Image" widget

Step 2: Click "Add Block" → Select 1 Column
        → Add "Stats Section" widget
```

---

## Column Layouts

```
1 Column:     [████████████████████████]

2 Columns:    [███████████] [███████████]  (50/50)
              [███████] [███████████████]  (33/66)
              [███████████████] [███████]  (66/33)

3 Columns:    [███████] [███████] [███████]  (33/33/33)
              [████] [████████████] [████]   (25/50/25)

4 Columns:    [█████] [█████] [█████] [█████]  (25/25/25/25)
```

---

## Data Structure

### Page Schema

```typescript
interface LandingPage {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  globalSettings: GlobalSettings;
}
```

### Section Schema

```typescript
interface Section {
  id: string;
  order: number;
  layout: SectionLayout;
  columns: Column[];
  settings: {
    fullWidth: boolean;
    backgroundColor?: string;
    backgroundImage?: string;
    paddingTop: number;
    paddingBottom: number;
    gap: number;
    maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  };
}

type SectionLayout =
  | "1"           // Full width
  | "1-1"         // 50/50
  | "1-2"         // 33/66
  | "2-1"         // 66/33
  | "1-1-1"       // 33/33/33
  | "1-2-1"       // 25/50/25
  | "1-1-1-1";    // 25/25/25/25
```

### Column Schema

```typescript
interface Column {
  id: string;
  widgets: Widget[];
  settings: {
    verticalAlign: "top" | "center" | "bottom";
    padding: number;
    backgroundColor?: string;
  };
}
```

### Widget Schema

```typescript
interface Widget {
  id: string;
  type: WidgetType;
  settings: Record<string, any>;  // Widget-specific settings
}

type WidgetType =
  // Content Widgets
  | "hero-content"
  | "text-block"
  | "heading"
  | "rich-text"

  // Media Widgets
  | "image"
  | "video"
  | "gallery"
  | "lottie"

  // Form Widgets
  | "lead-form"
  | "contact-form"
  | "newsletter"

  // Social Proof Widgets
  | "trust-badges"
  | "stats-section"
  | "testimonial"
  | "testimonials-carousel"
  | "logo-cloud"
  | "reviews"

  // Commerce Widgets
  | "pricing-card"
  | "pricing-table"
  | "feature-comparison"

  // Layout Widgets
  | "spacer"
  | "divider"
  | "accordion"
  | "tabs"

  // CTA Widgets
  | "cta-banner"
  | "button-group"

  // Advanced Widgets
  | "faq"
  | "timeline"
  | "team-grid"
  | "feature-grid"
  | "countdown"
  | "map"
  | "custom-html";
```

---

## Widget Definitions

### 1. Hero Content Widget

The main hero text content - grouped together for convenience.

```typescript
interface HeroContentWidget {
  type: "hero-content";
  settings: {
    // Badge
    badge: {
      show: boolean;
      icon: string;
      text: string;
      style: "pill" | "outline" | "solid";
    };

    // Headline
    headline: {
      text: string;
      highlightWords: string[];
      highlightColor: string;
      size: "sm" | "md" | "lg" | "xl";
    };

    // Subheadline
    subheadline: {
      text: string;
      show: boolean;
    };

    // Features List
    features: {
      show: boolean;
      items: Array<{ icon: string; text: string }>;
      columns: 1 | 2 | 3;
      iconColor: string;
    };

    // Primary Button
    primaryButton: {
      show: boolean;
      text: string;
      link: string;
      badge?: string;
      style: ButtonStyle;
    };

    // Secondary Button
    secondaryButton: {
      show: boolean;
      text: string;
      link: string;
      style: "link" | "outline" | "ghost";
    };

    // Trust Text (with stars)
    trustText: {
      show: boolean;
      rating: number;
      text: string;
    };

    // Alignment
    alignment: "left" | "center" | "right";
  };
}
```

### 2. Image Widget

```typescript
interface ImageWidget {
  type: "image";
  settings: {
    src: string;
    alt: string;
    objectFit: "cover" | "contain" | "fill";
    borderRadius: number;
    shadow: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
    aspectRatio?: "auto" | "1:1" | "4:3" | "16:9" | "3:2";
    animation: "none" | "fade" | "slide-up" | "zoom";
  };
}
```

### 3. Lead Form Widget

```typescript
interface LeadFormWidget {
  type: "lead-form";
  settings: {
    title?: string;
    description?: string;

    fields: Array<{
      type: "text" | "email" | "phone" | "select" | "textarea";
      name: string;
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[];  // For select
    }>;

    submitButton: {
      text: string;
      style: ButtonStyle;
      fullWidth: boolean;
    };

    successMessage: string;

    // Integration
    submitTo: "database" | "webhook" | "email";
    webhookUrl?: string;
    emailTo?: string;

    // Styling
    backgroundColor?: string;
    padding: number;
    borderRadius: number;
    shadow: boolean;
  };
}
```

### 4. Trust Badges Widget

```typescript
interface TrustBadgesWidget {
  type: "trust-badges";
  settings: {
    badges: Array<{
      icon: string;
      text: string;
    }>;

    layout: "horizontal" | "grid";
    columns: 2 | 3 | 4 | 5;

    style: {
      backgroundColor: string;
      borderColor: string;
      iconColor: string;
      textColor: string;
      borderRadius: number;
    };

    centered: boolean;
  };
}
```

### 5. Stats Section Widget

```typescript
interface StatsSectionWidget {
  type: "stats-section";
  settings: {
    stats: Array<{
      value: string;      // "10,000+"
      label: string;      // "LLCs Formed"
      prefix?: string;    // "$"
      suffix?: string;    // "+"
      animate: boolean;   // Count up animation
    }>;

    columns: 2 | 3 | 4 | 5;

    style: {
      valueColor: string;
      labelColor: string;
      valueSize: "sm" | "md" | "lg" | "xl";
      divider: boolean;
    };

    centered: boolean;
  };
}
```

### 6. Video Widget

```typescript
interface VideoWidget {
  type: "video";
  settings: {
    source: "youtube" | "vimeo" | "custom";
    url: string;
    thumbnail?: string;

    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    controls: boolean;

    aspectRatio: "16:9" | "4:3" | "1:1";
    borderRadius: number;
    shadow: boolean;
  };
}
```

### 7. Testimonial Widget

```typescript
interface TestimonialWidget {
  type: "testimonial";
  settings: {
    quote: string;
    author: {
      name: string;
      role: string;
      company?: string;
      avatar?: string;
    };
    rating?: number;

    style: {
      backgroundColor?: string;
      quoteColor: string;
      showQuoteIcon: boolean;
    };
  };
}
```

---

## Widget Browser UI

When user clicks "+" in a column:

```
┌─────────────────────────────────────────────────────────┐
│  Add Widget                                        ✕    │
├─────────────────────────────────────────────────────────┤
│  🔍 Search widgets...                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⭐ Most Used                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Hero    │ │ Image   │ │ Lead    │ │ Trust   │      │
│  │ Content │ │         │ │ Form    │ │ Badges  │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📝 Content                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Hero    │ │ Heading │ │ Text    │ │ Rich    │      │
│  │ Content │ │         │ │ Block   │ │ Text    │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📷 Media                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Image   │ │ Video   │ │ Gallery │ │ Lottie  │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📋 Forms                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ Lead    │ │ Contact │ │ News-   │                  │
│  │ Form    │ │ Form    │ │ letter  │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                         │
│  ⭐ Social Proof                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Trust   │ │ Stats   │ │ Testi-  │ │ Logo    │      │
│  │ Badges  │ │ Section │ │ monial  │ │ Cloud   │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  💰 Commerce                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ Pricing │ │ Pricing │ │ Feature │                  │
│  │ Card    │ │ Table   │ │ Compare │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Section/Column Selector UI

When user clicks "Add Block":

```
┌─────────────────────────────────────────────────────────┐
│  Select Layout                                     ✕    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ █████████████████████████████████████████████   │   │
│  │                  1 Column                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ████████████████████  ████████████████████      │   │
│  │              2 Columns (50/50)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ████████████  ██████████████████████████████    │   │
│  │              2 Columns (33/66)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ██████████████████████████████  ████████████    │   │
│  │              2 Columns (66/33)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ █████████████  █████████████  █████████████     │   │
│  │              3 Columns (33/33/33)                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
src/
├── lib/
│   └── page-builder/
│       ├── types.ts              # All type definitions
│       ├── widget-registry.ts    # Widget registration
│       ├── section-layouts.ts    # Layout configurations
│       └── defaults.ts           # Default settings
│
├── components/
│   └── page-builder/
│       │
│       ├── core/
│       │   ├── page-canvas.tsx       # Main canvas
│       │   ├── section.tsx           # Section container
│       │   ├── column.tsx            # Column container
│       │   └── widget-wrapper.tsx    # Widget container
│       │
│       ├── ui/
│       │   ├── add-section-button.tsx
│       │   ├── layout-selector.tsx   # Column layout modal
│       │   ├── widget-browser.tsx    # Widget selection modal
│       │   ├── section-toolbar.tsx   # Section controls
│       │   └── widget-toolbar.tsx    # Widget controls
│       │
│       ├── widgets/
│       │   ├── content/
│       │   │   ├── hero-content.tsx
│       │   │   ├── heading.tsx
│       │   │   └── text-block.tsx
│       │   │
│       │   ├── media/
│       │   │   ├── image-widget.tsx
│       │   │   ├── video-widget.tsx
│       │   │   └── gallery-widget.tsx
│       │   │
│       │   ├── forms/
│       │   │   ├── lead-form.tsx
│       │   │   ├── contact-form.tsx
│       │   │   └── newsletter.tsx
│       │   │
│       │   └── social-proof/
│       │       ├── trust-badges.tsx
│       │       ├── stats-section.tsx
│       │       └── testimonial.tsx
│       │
│       └── settings/
│           ├── section-settings.tsx
│           ├── column-settings.tsx
│           └── widget-settings/
│               ├── hero-content-settings.tsx
│               ├── image-settings.tsx
│               ├── lead-form-settings.tsx
│               ├── trust-badges-settings.tsx
│               └── stats-section-settings.tsx
│
└── app/
    └── admin/
        └── appearance/
            └── landing-page/
                └── page.tsx          # Page builder page
```

---

## Settings Panel (Left Sidebar)

### When Section is Selected:
```
┌─────────────────────────────┐
│ ← Back          Section     │
├─────────────────────────────┤
│ Content | Style | Advanced  │
├─────────────────────────────┤
│                             │
│ Layout                      │
│ ┌─────────────────────────┐ │
│ │ [1] [2] [2] [3] [Custom]│ │
│ └─────────────────────────┘ │
│                             │
│ Background                  │
│ ○ None  ○ Color  ○ Image   │
│                             │
│ Spacing                     │
│ Padding Top    [40] px      │
│ Padding Bottom [40] px      │
│ Column Gap     [24] px      │
│                             │
│ Container Width             │
│ [████████████░░░░] 1280px   │
│                             │
└─────────────────────────────┘
```

### When Widget is Selected:
```
┌─────────────────────────────┐
│ ← Back      Hero Content    │
├─────────────────────────────┤
│ Content | Style | Advanced  │
├─────────────────────────────┤
│                             │
│ ▼ Badge                     │
│   ☑ Show Badge             │
│   Icon  [🇺🇸 ▼]             │
│   Text  [Trusted by...]    │
│                             │
│ ▼ Headline                  │
│   Text  [Start Your...]    │
│   Highlight [US LLC]       │
│   Color [████] #F97316     │
│                             │
│ ▼ Subheadline              │
│   ...                       │
│                             │
│ ▼ Features List            │
│   ...                       │
│                             │
│ ▼ Primary Button           │
│   ...                       │
│                             │
│ ▼ Secondary Button         │
│   ...                       │
│                             │
│ ▼ Trust Text               │
│   ...                       │
│                             │
└─────────────────────────────┘
```

---

## Database Schema

```prisma
model LandingPage {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  isPublished   Boolean  @default(false)

  // JSON structure
  sections      Json     // Array of Section objects
  globalSettings Json    // Global page settings

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// The 'sections' JSON will contain:
// [
//   {
//     id: "section-1",
//     layout: "1-1",
//     columns: [
//       { id: "col-1", widgets: [...] },
//       { id: "col-2", widgets: [...] }
//     ],
//     settings: { ... }
//   },
//   ...
// ]
```

---

## Migration Strategy

### Phase 1: Core Infrastructure
- [ ] Create Section, Column, Widget type definitions
- [ ] Build widget registry system
- [ ] Create layout selector component
- [ ] Create widget browser component
- [ ] Build section/column rendering

### Phase 2: Essential Widgets
- [ ] Hero Content widget (migrate from existing)
- [ ] Image widget
- [ ] Trust Badges widget
- [ ] Stats Section widget

### Phase 3: Form Widgets
- [ ] Lead Form widget
- [ ] Contact Form widget
- [ ] Form submission handling

### Phase 4: More Widgets
- [ ] Video widget
- [ ] Testimonial widget
- [ ] FAQ widget
- [ ] Pricing widgets

### Phase 5: Advanced Features
- [ ] Drag & drop reordering
- [ ] Copy/paste sections
- [ ] Section templates/presets
- [ ] Global styles
- [ ] Responsive controls

---

## Scalability Benefits

1. **Adding New Widgets**
   - Create component + settings panel
   - Register in widget registry
   - Done! Works everywhere automatically

2. **Adding New Layouts**
   - Add layout config to section-layouts.ts
   - Done! Available in layout selector

3. **Third-party Widgets**
   - Plugin system possible
   - Developers can create custom widgets

4. **Theming**
   - Global styles apply to all widgets
   - Individual widget overrides possible

---

## CodeCanyon Marketing Points

- "Elementor-Style Drag & Drop Page Builder"
- "30+ Pre-built Widgets"
- "Unlimited Layout Combinations"
- "No Coding Required"
- "Fully Responsive"
- "Developer-Friendly Plugin System"

---

*Document Version: 2.0 - Section-Based Architecture*
