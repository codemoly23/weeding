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

Modern, feature-rich image widget with professional effects inspired by Elementor, Webflow, and 2025-2026 design trends.

```typescript
interface ImageWidget {
  type: "image";
  settings: {
    // === BASIC ===
    src: string;                    // Image URL
    alt: string;                    // Alt text for accessibility
    title?: string;                 // Title attribute (tooltip)

    // === SIZE & FIT ===
    objectFit: "cover" | "contain" | "fill" | "none" | "scale-down";
    aspectRatio: "auto" | "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "2:3" | "3:4" | "9:16";
    maxWidth?: number;              // Max width as percentage (1-100)
    alignment: "left" | "center" | "right";

    // === STYLING ===
    borderRadius: number;           // Border radius in pixels
    shadow: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "glow";
    shadowColor?: string;           // Custom shadow color for glow effect
    border: {
      width: number;
      color: string;
      style: "solid" | "dashed" | "dotted" | "double";
    };

    // === LINK OPTIONS ===
    link?: {
      url: string;
      openInNewTab: boolean;
      lightbox: boolean;            // Open in fullscreen lightbox modal
    };

    // === CAPTION ===
    caption?: {
      enabled: boolean;
      text: string;
      position: "below" | "overlay-bottom" | "overlay-top" | "overlay-center";
      backgroundColor?: string;
      textColor?: string;
      fontSize: "xs" | "sm" | "md" | "lg";
    };

    // === HOVER EFFECTS ===
    hoverEffect:
      | "none"
      | "zoom"                      // Scale up
      | "zoom-out"                  // Scale down
      | "brighten"                  // Increase brightness
      | "darken"                    // Decrease brightness
      | "grayscale"                 // Convert to grayscale
      | "blur"                      // Apply blur
      | "rotate"                    // Slight rotation
      | "tilt-left"                 // Tilt to left
      | "tilt-right"                // Tilt to right
      | "lift"                      // Lift up with shadow
      | "glow"                      // Glow effect with shadow color
      | "shine"                     // Diagonal shine sweep
      | "overlay-fade";             // Fade in overlay
    hoverTransitionDuration: number; // Transition duration in ms

    // === OVERLAY ===
    overlay?: {
      enabled: boolean;
      color: string;
      opacity: number;              // 0-1
      showOnHover: boolean;         // Only show on hover
    };

    // === ENTRANCE ANIMATION ===
    animation: "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "bounce" | "flip";
    animationDuration: number;      // Duration in ms
    animationDelay: number;         // Delay in ms

    // === FLOATING ANIMATION ===
    floatAnimation: "none" | "float" | "pulse" | "bounce" | "swing" | "wobble";

    // === PARALLAX ===
    parallax?: {
      enabled: boolean;
      speed: number;                // 0-1 (higher = more movement)
      direction: "vertical" | "horizontal";
    };

    // === MASK/SHAPE ===
    mask: "none" | "circle" | "rounded-lg" | "rounded-xl" | "hexagon" | "blob" | "diamond" | "triangle";

    // === PERFORMANCE ===
    lazyLoad: boolean;              // Enable lazy loading
    priority: boolean;              // Above-fold priority loading

    // === CSS FILTERS ===
    filters?: {
      brightness: number;           // 0-200 (100 = normal)
      contrast: number;             // 0-200 (100 = normal)
      saturation: number;           // 0-200 (100 = normal)
      blur: number;                 // 0-20 pixels
      grayscale: number;            // 0-100 percent
      sepia: number;                // 0-100 percent
      hueRotate: number;            // 0-360 degrees
    };
  };
}
```

#### Image Widget Features

| Category | Features |
|----------|----------|
| **Hover Effects** | Zoom, zoom-out, brighten, darken, grayscale, blur, rotate, tilt, lift, glow, shine sweep, overlay fade |
| **Entrance Animations** | Fade, slide (4 directions), zoom, bounce, flip - triggered on scroll |
| **Floating Animations** | Float, pulse, bounce, swing, wobble - continuous looping |
| **Parallax** | Vertical or horizontal parallax on scroll |
| **Lightbox** | Full-screen modal with click-to-close |
| **Masks/Shapes** | Circle, rounded corners, hexagon, blob, diamond, triangle |
| **Filters** | Brightness, contrast, saturation, blur, grayscale, sepia, hue-rotate |
| **Captions** | Below image or overlay (top/center/bottom) with custom styling |
| **Shadows** | 6 preset sizes + custom glow color |

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

### Phase 1: Core Infrastructure ✅
- [x] Create Section, Column, Widget type definitions
- [x] Build widget registry system
- [x] Create layout selector component
- [x] Create widget browser component
- [x] Build section/column rendering

### Phase 2: Essential Widgets ✅
- [x] Hero Content widget (with button style presets: Craft, Flow, Neural)
- [x] Image widget (comprehensive modern features)
- [x] Trust Badges widget
- [x] Stats Section widget
- [x] Heading widget
- [x] Text Block widget
- [x] Divider widget (10 styles including gradient, dotted, icon, text)

### Phase 3: Form Widgets ✅
- [x] Lead Form widget
- [ ] Contact Form widget
- [ ] Form submission handling

### Phase 4: More Widgets
- [x] Video widget
- [x] Testimonial widget
- [ ] FAQ widget
- [ ] Pricing widgets

### Phase 5: Advanced Features
- [x] Drag & drop reordering (sections)
- [x] Copy/duplicate sections
- [x] Section settings (background: solid/gradient/image/video, spacing, max-width)
- [x] Column settings (vertical alignment, padding)
- [x] Widget spacing controls (margin top/bottom)
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

---

## Changelog

### v3.0 (2026-01-12)
- **Image Widget**: Complete rewrite with modern features
  - 13 hover effects (zoom, glow, shine, tilt, lift, etc.)
  - 8 entrance animations with Intersection Observer
  - 5 floating animations (continuous looping)
  - Parallax scrolling support
  - Lightbox modal
  - 8 mask shapes (circle, hexagon, blob, diamond, etc.)
  - 7 CSS filters
  - Caption overlay support
- **Spacer Widget**: Removed (widgets now have built-in spacing controls)
- **Migration Status**: Updated to reflect completed phases

### v2.0
- Section-Based Architecture (Elementor/Webflow style)
- Widget registry system
- Core widgets implementation

*Document Version: 3.0 - Comprehensive Widget System*
