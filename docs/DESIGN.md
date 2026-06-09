# Ceremoney — Landing Page Design System

> Reference document for the visual design, layout structure, components, and styling conventions of the Ceremoney landing page (`http://localhost:3000/`).

---

## Table of Contents

1. [Page Architecture](#1-page-architecture)
2. [Typography](#2-typography)
3. [Color System](#3-color-system)
4. [Spacing & Layout Grid](#4-spacing--layout-grid)
5. [Header](#5-header)
6. [Hero Section](#6-hero-section)
7. [Page Builder Widgets](#7-page-builder-widgets)
8. [Footer](#8-footer)
9. [Buttons & Interactive Elements](#9-buttons--interactive-elements)
10. [Animations & Motion](#10-animations--motion)
11. [Responsive Design](#11-responsive-design)
12. [Accessibility](#12-accessibility)
13. [File Map](#13-file-map)

---

## 1. Page Architecture

The landing page is **template-driven** — content is stored in the database and rendered dynamically via a widget/section system.

```
(marketing)/layout.tsx
├── TopUtilityBarWidget          ← Optional announcement bar
├── Header                       ← Sticky, scroll-aware
├── <main>
│   └── page.tsx
│       └── WidgetSectionsRenderer
│           └── [Sections]
│               └── [Widgets]    ← 40+ widget types
└── Footer
```

**Rendering mode:** `export const dynamic = 'force-dynamic'`
**SEO:** JSON-LD schemas — Organization, FAQ, Product — injected via `<MultiJsonLd>`

---

## 2. Typography

### Font Families

| Variable | Font | Weights | Usage |
|----------|------|---------|-------|
| `--font-sans` | Inter | 400, 500, 600, 700, 800 | Body, UI, labels |
| `--font-serif` | Cormorant Garamond | 400, 500, 600, 700 (normal + italic) | Headings, display |
| `--font-accent` | (inherits serif) | — | Decorative accents |

Both fonts are loaded via `next/font/google` in `src/app/layout.tsx`.

### Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-sm` | 14px | Labels, captions, secondary text |
| `text-base` | 16px | Body copy |
| `text-lg` | 18px | Emphasized body, card subtitles |
| `text-xl` | 20px | Small headings |
| `text-2xl` | 24px | Section subtitles |
| `text-4xl` | 36px | Section titles |
| `text-5xl+` | 48px+ | Hero headlines |

### Hero Headline Sizes

| Token | Usage |
|-------|-------|
| `lg` | Compact hero |
| `xl` | Standard hero |
| `2xl` | Full-screen hero |

---

## 3. Color System

### Brand Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary (Dark) | `#1A1A1A` | Buttons, headings, primary text |
| Primary Hover | `#2A2A2A` | Button hover states |
| Midnight | `#0A0F1E` | Dark section backgrounds |
| Midnight Light | `#1E2642` | Dark section secondary bg |
| Gold / Accent | `#8A6F3E` | Highlights, focus rings, premium accents |
| Star / Rating | `#E4A93B` | Star ratings |

### Neutral Scale (Slate)

| Token | Hex | Usage |
|-------|-----|-------|
| Slate-50 | `#F8FAFC` | Page background |
| Slate-100 | `#F1F5F9` | Muted / secondary bg |
| Slate-200 | `#E2E8F0` | Borders, dividers |
| Slate-500 | `#64748B` | Muted text, placeholders |
| Slate-700 | `#334155` | Secondary body text |
| Slate-900 | `#0F172A` | Primary text |
| Slate-950 | `#020617` | Near-black, footer bg |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#22C55E` | Confirmations, badges |
| Warning | `#F59E0B` | Caution states |
| Error | `#EF4444` | Validation, destructive actions |
| Info | `#3B82F6` | Info banners |

### Planigate (Wedding Planning) Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-section` | `#EFE8DB` | Cream/beige section backgrounds |
| `bg-soft` | `#F5EFE5` | Light beige alternates |
| `fg` | `#1A1A1A` | Foreground text |
| `accent` | `#8A6F3E` | Gold accent |
| `border` | `#E5DFD3` | Subtle borders |

### CSS Custom Properties (in `globals.css`)

```css
--color-primary:     #1A1A1A
--color-secondary:   #0A0F1E
--color-accent:      #8A6F3E
--color-destructive: #EF4444
--color-muted:       #F1F5F9
--color-card:        #ffffff
--color-border:      #E2E8F0
--color-ring:        #8A6F3E
```

---

## 4. Spacing & Layout Grid

### Base Unit: 4px

| Token | Value | Class Example |
|-------|-------|---------------|
| space-1 | 4px | `p-1`, `gap-1` |
| space-2 | 8px | `p-2`, `gap-2` |
| space-4 | 16px | `p-4`, `gap-4` |
| space-6 | 24px | `p-6`, `gap-6` |
| space-8 | 32px | `p-8`, `gap-8` |
| space-12 | 48px | `p-12` |
| space-16 | 64px | `p-16` |

### Section Column Layouts

| Layout Token | Grid Split | Use Case |
|-------------|-----------|----------|
| `1` | 100% | Full-width content, hero |
| `1-1` | 50 / 50 | Two-column feature rows |
| `1-2` | 33 / 66 | Sidebar + main content |
| `2-1` | 66 / 33 | Main content + sidebar |
| `1-1-1` | 33 / 33 / 33 | Feature cards (3-up) |
| `1-2-1` | 25 / 50 / 25 | Center-focused sections |
| `1-1-1-1` | 25 / 25 / 25 / 25 | Four-column grids |

### Max-Width Containers

| Token | Width | Usage |
|-------|-------|-------|
| `sm` | 640px | Narrow articles, modals |
| `md` | 768px | Content-focused sections |
| `lg` | 1024px | Standard sections |
| `xl` | 1280px | Default page max-width |
| `2xl` | 1536px | Wide sections |
| `full` | 100% | Full-bleed backgrounds |

---

## 5. Header

### Layouts

| Variant | Description |
|---------|-------------|
| `DEFAULT` | Logo left, nav center, CTAs right |
| `CENTERED` | Logo center, nav below |
| `SPLIT` | Logo left, nav center, CTAs right (wider split) |
| `MINIMAL` | Logo + one CTA only |
| `MEGA` | Full-width mega menu with category dropdowns |

### Behavior

- **Sticky/fixed** — remains at top of viewport on scroll
- **Glass effect** — `backdrop-blur` + transparency on scroll
- **Scroll threshold:** 100px = fully opaque → transparent transition (0–1 progress)
- **Auto text-color detection** — switches between dark/light text based on background luminance
- **Mobile** — hamburger drawer menu below `md` breakpoint

### Default Colors

| Element | Value |
|---------|-------|
| Background | `#ffffff` |
| Text (light bg) | `#0f172a` |
| Text (dark bg) | `#ffffff` |
| Nav hover | `#f97316` (orange) |

### Sub-Components

```
header/
├── index.tsx                  ← Orchestrator, layout picker
├── layouts/
│   ├── HeaderDefault.tsx
│   ├── HeaderCentered.tsx
│   ├── HeaderSplit.tsx
│   ├── HeaderMinimal.tsx
│   └── HeaderMega.tsx
└── components/
    ├── Logo.tsx
    ├── Navigation.tsx
    ├── MobileMenu.tsx
    ├── CTAButtons.tsx
    ├── UserMenu.tsx
    ├── LanguageSwitcher.tsx
    ├── SearchButton.tsx
    └── TopBar.tsx             ← Announcement bar
```

---

## 6. Hero Section

### Variants

| Variant | Layout | Visual |
|---------|--------|--------|
| `centered` | Full-width centered text + CTAs | Clean, typographic |
| `split` | Left: text, Right: image/visual | Feature-forward |
| `split-dashboard` | Left: text, Right: animated dashboard | SaaS-style |
| `minimal` | Reduced padding, no background | Inline/embedded |
| `slider` | Full-screen image slider | Visual-first |
| `video` | Background video | Immersive |
| `with-form` | Left: text, Right: inline form | Lead-gen |

### Hero Settings Structure

```ts
{
  variant: 'centered' | 'split' | 'split-dashboard' | 'minimal' | ...

  headline: {
    text: string
    highlightWord: string      // Word wrapped in colored span
    size: 'lg' | 'xl' | '2xl'
    color: string
    highlightColor: string
  }

  subheadline: {
    text: string
    size: string
    color: string
  }

  badge: {
    enabled: boolean
    text: string
    emoji: string
    style: string
    bgColor: string
    textColor: string
    borderColor: string
  }

  features: {
    enabled: boolean
    items: FeatureItem[]
    columns: number
    iconStyle: string
  }

  primaryCTA: { text, url, variant, style }
  secondaryCTA: { text, url, variant, style }

  background: {
    type: 'solid' | 'gradient' | 'image' | 'video' | 'pattern'
    color: string
    gradient: { from, to, direction }
    image: { url, position, size }
    overlay: { color, opacity }
    pattern: PatternType
  }

  trust: {
    text: string
    badges: TrustBadge[]
    alignment: 'left' | 'center' | 'right'
  }

  stats: {
    enabled: boolean
    items: StatItem[]
    layout: string
    columns: number
  }

  dashboard: {
    preset: 'analytics' | 'ecommerce' | 'saas' | 'crm' | 'custom'
    animatedWords: { enabled, words[], type: 'slide-up' | 'fade' | 'flip' | 'typewriter' }
  }
}
```

### Background Pattern Types

`dots` · `grid` · `grid-fine` · `diagonal` · `waves` · `circuit` · `geometric` · `confetti`

---

## 7. Page Builder Widgets

All widgets are rendered by `WidgetSectionsRenderer` → `WidgetRenderer`.

### Widget Categories

#### Content & Layout
| Widget | Purpose |
|--------|---------|
| `HeroContentWidget` | Full hero block |
| `HeadingWidget` | Standalone heading |
| `TextBlockWidget` | Rich text content |
| `DividerWidget` | Visual separator |
| `ImageWidget` | Single image |
| `ImageSliderWidget` | Image carousel |
| `TickerMarqueeWidget` | Scrolling text/logos |
| `FeaturesShowcaseWidget` | Feature grid/list |

#### Social Proof
| Widget | Purpose |
|--------|---------|
| `TestimonialsWidget` | Review carousel |
| `StatsSection` | KPI numbers |
| `TrustBadges` | Logo trust strip |

#### Commerce
| Widget | Purpose |
|--------|---------|
| `ServiceCardWidget` | Service offering card |
| `ServiceListWidget` | List of services |
| `PricingTableWidget` | Pricing tiers |
| `VendorListingWidget` | Vendor directory |

#### CTAs & Forms
| Widget | Purpose |
|--------|---------|
| `CtaBannerWidget` | Call-to-action banner |
| `ButtonGroupWidget` | Multiple CTA buttons |
| `LeadFormWidget` | Contact / lead capture |
| `NewsletterCtaWidget` | Email subscription |

#### Planigate (Wedding-specific)
| Widget | Purpose |
|--------|---------|
| `PlanigateHeroWidget` | Wedding planning hero |
| `PlanigateFeaturesWidget` | Platform features |
| `PlanigateEventTypesWidget` | Event type selection |
| `PlanigateVendorsWidget` | Vendor showcase |
| `PlanigateStatsWidget` | Platform statistics |
| `PlanigateCtaWidget` | Conversion CTA |

#### Blog
| Widget | Purpose |
|--------|---------|
| `BlogPostGridWidget` | Post grid |
| `BlogPostCarouselWidget` | Post carousel |
| `BlogFeaturedPostWidget` | Featured post |
| `BlogPostListWidget` | Post list |
| `BlogRecentPostsWidget` | Recent posts sidebar |

#### Utility
| Widget | Purpose |
|--------|---------|
| `FaqAccordionWidget` | FAQ accordion |
| `ProcessStepsWidget` | Step-by-step flow |
| `EventSearchHeroWidget` | Search/filter hero |
| `EventGalleryGridWidget` | Photo gallery |
| `CustomHtmlWidget` | Raw HTML injection |

### Section Settings (applied per section wrapping widgets)

```ts
{
  fullWidth: boolean
  background: BackgroundSettings
  padding: { top, bottom, left, right }   // px values
  margin: { top, bottom }
  minHeight: number
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  borderRadius: number
  decorativeGlows: GlowConfig[]           // Radial accent blobs
  watermark: WatermarkConfig              // Background text
  customCSS: string                       // Scoped per-section CSS
  visibleOnMobile: boolean
  visibleOnDesktop: boolean
}
```

---

## 8. Footer

### Layouts

| Variant | Description |
|---------|-------------|
| `STACKED` | Standard stacked columns |
| `MINIMAL` | Single-row minimal |
| `CENTERED` | Centered logo + links |
| `ASYMMETRIC` | Unequal column widths |
| `APP_FOCUSED` | App download + social focus |
| `MEGA` | Full-width multi-column |
| `MEGA_PLUS` | Extended mega with extra rows |

### Widget Types (Footer)

`BRAND` · `LINKS` · `CONTACT` · `SOCIAL` · `TEXT` · `SERVICES` · `STATES` · `RECENT_POSTS` · `CUSTOM_HTML` · `BUTTON` · `NEWSLETTER`

### Styling Options

| Option | Values |
|--------|--------|
| Background | solid · gradient · pattern · image |
| Top border | none · solid · gradient · wave |
| Social shape | circle · square · rounded · pill |
| Social size | sm · md · lg · xl |
| Social color mode | brand · monochrome · accent |
| Link hover | underline · slide · highlight |
| Typography size | sm · base · lg · xl |
| Typography weight | medium · semibold · bold |
| Text transform | none · uppercase · capitalize |
| Container | boxed · full-width |
| Shadow | none · sm · md · lg · xl |

---

## 9. Buttons & Interactive Elements

### Button Variants (base)

```
default · destructive · outline · secondary · ghost · link
```

### Special Button Components

| Component | Effect |
|-----------|--------|
| `CraftButton` | Icon expands on hover |
| `FlowButton` | Rotating gradient border |
| `NeuralButton` | Border beam animation |
| `StyledButton` | Fully custom styled |

### Hover Effects (18 types)

| Effect | Behavior |
|--------|---------|
| `none` | No hover effect |
| `darken` | Background darkens |
| `lighten` | Background lightens |
| `shadow-lift` | Shadow appears, lifts |
| `shadow-press` | Shadow compresses, sinks |
| `scale-up` | Button grows |
| `scale-down` | Button shrinks |
| `slide-fill` | Color slides in from edge |
| `border-fill` | Border animates in |
| `gradient-shift` | Gradient angle shifts |
| `glow-pulse` | Glow pulses outward |
| `ripple` | Ripple from click point |
| `craft-expand` | Icon expands (CraftButton) |
| `heartbeat` | Pulsing box-shadow |
| `flow-border` | Rotating border gradient |
| `stitches` | 3D dashed border |
| `ring-hover` | Focus ring on hover |
| `neural` | Border beam animation |

### Button Custom Style Props

```ts
{
  bgColor, textColor, borderColor
  useGradient, gradientFrom, gradientTo, gradientDirection
  borderWidth, borderRadius
  hoverBgColor, hoverTextColor, hoverBorderColor
  hoverEffect: HoverEffectType
  shadow, hoverShadow
  icon, iconPosition, customIconSvg
  openInNewTab
}
```

---

## 10. Animations & Motion

### Keyframe Animations (globals.css)

| Name | Duration | Behavior |
|------|----------|---------|
| `heartbeat` | 2s infinite | Box-shadow pulse |
| `float` | 3s infinite | Vertical bounce |
| `swing` | 2s infinite | Slight rotation |
| `wobble` | 2s infinite | Translate + rotate |
| `shine` | — | Horizontal light sweep |
| `slideUpEntrance` | 0.6s | Slide up + fade in |
| `scaleIn` | 0.6s | Scale from 0.8 to 1 |
| `fadeIn` | 0.6s | Opacity 0 → 1 |

### Animated Words (Hero)

| Type | Behavior |
|------|---------|
| `slide-up` | Word slides up and fades in |
| `fade` | Cross-fade between words |
| `flip` | 3D flip transition |
| `typewriter` | Character-by-character typing |

Transition duration: **0.5s** between words.

### Process Step Connectors

`flow` · `pulse` · `dash` · `shimmer` · `draw`

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

### Transition Timing Guidelines

| Type | Duration |
|------|----------|
| Micro-interactions | 100–200ms |
| Small transitions | 200–300ms |
| Medium transitions | 300–500ms |
| Page entrance | 500–600ms |

---

## 11. Responsive Design

### Breakpoints

| Name | Min-Width | Applies To |
|------|-----------|-----------|
| `sm` | 640px | — |
| `md` | 768px | Mobile/desktop split point |
| `lg` | 1024px | — |
| `xl` | 1280px | Default max layout width |
| `2xl` | 1536px | Wide screens |

### Mobile Behavior

- Header collapses to hamburger drawer menu at `< md`
- Section column layouts collapse to single column at `< md`
- Hero variants reflow: split → stacked
- Widget `visibleOnMobile` / `visibleOnDesktop` flags control per-section visibility
- Touch targets: minimum **44×44px**, spacing ≥ 8px

### RTL Support (Arabic)

- i18n: `next-intl` with `SE`, `EN`, `AR` locales
- **Never use** `left` / `right` directional CSS — use logical properties (`start` / `end`)
- Font for AR: Cairo or IBM Plex Sans Arabic
- All layouts tested in RTL mode

---

## 12. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Skip link | `<a href="#main-content">` with visible focus style in root layout |
| Focus rings | `ring` with `--color-ring: #8A6F3E` |
| Color contrast | WCAG AA — 4.5:1 body, 3:1 large text & UI |
| Alt text | Required on all `<img>` |
| Form labels | All inputs must have associated `<label>` |
| Heading hierarchy | h1 → h2 → h3 (no skips) |
| Keyboard navigation | All interactive elements keyboard-accessible |
| ARIA labels | Applied where visual-only elements lack text |
| Reduced motion | `prefers-reduced-motion` media query applied globally |

---

## 13. File Map

```
src/
├── app/
│   ├── layout.tsx                              # Root layout, fonts, providers
│   ├── globals.css                             # Design tokens, keyframes, utilities
│   └── (marketing)/
│       ├── layout.tsx                          # Marketing shell (Header + Footer)
│       └── page.tsx                            # Landing page entry point
│
├── components/
│   ├── layout/
│   │   ├── header/
│   │   │   ├── index.tsx                       # Header orchestrator
│   │   │   ├── layouts/                        # 5 header layout variants
│   │   │   └── components/                     # Logo, Nav, Mobile, CTA, User…
│   │   ├── footer.tsx                          # Footer (7 layouts, widget-driven)
│   │   └── footer-language-switcher.tsx
│   │
│   ├── landing-page/
│   │   └── widget-sections-renderer.tsx        # Section + widget renderer
│   │
│   ├── landing-blocks/
│   │   ├── hero/
│   │   │   ├── index.tsx                       # Hero block entry
│   │   │   └── variants/                       # centered, split, split-dashboard, minimal
│   │   └── shared/
│   │       ├── HeroBackground.tsx
│   │       ├── AnimatedWords.tsx
│   │       ├── DashboardVisual.tsx
│   │       ├── TrustBadges.tsx
│   │       └── StatsSection.tsx
│   │
│   ├── page-builder/
│   │   └── widgets/                            # 40+ individual widget components
│   │
│   └── ui/
│       ├── button.tsx
│       ├── craft-button.tsx
│       ├── flow-button.tsx
│       ├── neural-button.tsx
│       └── styled-button.tsx
│
└── lib/
    ├── page-builder/types.ts                   # Section, Widget, Background types
    ├── landing-blocks/types.ts                 # Hero variant & settings types
    ├── header-footer/types.ts                  # Header/footer config types
    └── button-constants.ts                     # Button color constants
```

---

*Last updated: 2026-06-09*
