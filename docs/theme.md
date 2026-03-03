# Theme System & Page Builder — Concept Document

## Overview: What We're Building

**Goal:** "Legal & Business Services" theme activate korle, home page automatically v3-forge.html er design load korbe — admin ke manually page builder e giye kono kichui korte hobe na.

**Reference Design:** `docs/home/1_home/v3-forge.html`

---

## Current System Architecture

### Theme System (kothay ki ache)

```
public/themes/legal/
  ├── meta.json       → Theme name, description, thumbnail
  └── data.json       → ALL content: pages, services, colors, settings, etc.
```

**Activation flow:**
1. Admin `/admin/appearance/themes` e jay
2. "Legal & Business Services" theme er "Activate" e click kore
3. System `data.json` read kore
4. Database er sob content DELETE kore (services, pages, blogs, FAQs, etc.)
5. `data.json` er content INSERT kore (atomic transaction)
6. Home page er blocks/sections automatically load hoy

**Database model:**
```
ActiveTheme → themeId, themeName, colorPalette, fontConfig, widgetDefaults
LandingPage → slug ("home"), templateType (HOME), isSystem (true)
  └── LandingPageBlock → type ("widget-page-sections"), settings (JSON = Section[])
        └── Section → layout, columns[], settings (background, padding, etc.)
              └── Column → widgets[]
                    └── Widget → type ("hero-content"), settings (JSON)
```

### Page Builder System (ki ki widget ache)

**Currently registered 27 widgets:**

| Category | Widgets |
|----------|---------|
| Content | `hero-content`, `heading`, `text-block`, `process-steps` |
| Media | `image`, `image-slider` |
| Social Proof | `trust-badges`, `stats-section`, `testimonials-carousel` |
| Commerce | `service-card`, `service-list`, `pricing-table` |
| Layout | `divider`, `faq-accordion` |
| Forms | `lead-form` |
| CTA | `button-group` |
| Blog | `blog-post-grid`, `blog-post-carousel`, `blog-featured-post`, `blog-post-list`, `blog-recent-posts` |
| Service Detail | `service-hero`, `service-features`, `service-description`, `service-breadcrumb`, `related-services` |

**Section layouts available:** `"1"`, `"1-1"`, `"1-2"`, `"2-1"`, `"1-1-1"`, `"1-2-1"`, `"1-1-1-1"`

---

## v3-forge.html Hero Design — Ki Ki Ache

### Hero Section (2-column layout)

```
┌─────────────────────────────────────────────────────────────────┐
│  Background: Cream (#faf8f4)                                     │
│  Decorative circles (absolute positioned, border only)           │
│                                                                   │
│  ┌──────────────── LEFT (60%) ──────────────┐  ┌── RIGHT (40%) ──┐│
│  │                                           │  │                  ││
│  │  [●] Now serving 30+ countries worldwide  │  │  APPLICATION     ││
│  │                                           │  │  TRACKER [Live]  ││
│  │  Form Your                                │  │                  ││
│  │  US LLC                                   │  │  ✓ Order Placed  ││
│  │  Filed in 24 Hours.                       │  │  ✓ State Filing  ││
│  │  ───── (coral underline)                  │  │  ⏳ EIN (IRS)    ││
│  │                                           │  │  ○ Documents     ││
│  │  We handle every piece of paperwork...    │  │                  ││
│  │                                           │  │  1,200+ | 30+ |  ││
│  │  [Start My LLC] [How It Works]            │  │  4.9★            ││
│  │                                           │  │                  ││
│  │  (RM)(PS)(AK)(FH)(CO)                    │  │  [Start your own]││
│  │  1,200+ entrepreneurs already launched    │  │                  ││
│  │                                           │  │                  ││
│  └───────────────────────────────────────────┘  └──────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Left side elements:**
1. **Badge/Tag:** Pulsing coral dot + "Now serving 30+ countries worldwide" (pill style)
2. **Title:** "Form Your" (dark) + "US LLC" (forest green) + "Filed in 24 Hours." (coral underline)
   - Font: Outfit, 900 weight, clamp(44px, 6vw, 76px)
3. **Subtitle:** "We handle every piece of paperwork..." (text-mid color, 18px)
4. **2 CTA Buttons:**
   - Primary: "Start My LLC — Free Consultation" (coral bg, white text)
   - Secondary: "How It Works" (outline, dark border)
5. **Social Proof:** 5 colored avatar circles (initials: RM, PS, AK, FH, CO) + "1,200+ entrepreneurs already launched their US business"

**Right side elements (Application Tracker Card):**
- Forest green background, rounded top corners
- Coral gradient line at top
- Header: Clock icon + "APPLICATION TRACKER" + green "Live" dot
- 4 Steps with vertical connector lines:
  1. ✓ Order Placed & Verified — "Documents prepared" (DONE, green)
  2. ✓ State Filing Submitted — "Wyoming Secretary of State" (DONE, green)
  3. ⏳ EIN Application (IRS) — "Tax ID processing" (ACTIVE, yellow/amber)
  4. ○ Documents Delivered — "All certificates + Operating Agreement" (PENDING, dim)
- Stats bar: "1,200+ LLCs Formed | 30+ Countries | 4.9★ Rating"
- CTA: "Start your own → Free consultation" (coral bg)

### Ticker Section (hero er niche)

```
┌──────────────────────────────────────────────────────────────────┐
│  Background: Dark forest (#0f2318)                                │
│  ← India · 320+ | Pakistan · 220+ | UAE · 160+ | Nigeria · 110+ →│
│  (infinite marquee scroll, items duplicate for seamless loop)     │
└──────────────────────────────────────────────────────────────────┘
```

- Dark green background with subtle borders
- Items: Country name (bold) + separator dot + client count
- 8 countries: India, Pakistan, UAE, Nigeria, Philippines, Turkey, Egypt, Indonesia
- Items duplicated (8×2 = 16 items) for seamless infinite scroll
- Animation: `marquee 28s linear infinite`

---

## GAP Analysis — Ki Ki Nai / Somossa Ki

### Current hero-content Widget Limitations

| Feature | v3-forge.html e ache | Page Builder e ache? | Status |
|---------|---------------------|---------------------|--------|
| Badge with pulsing dot | Yes | Yes (badge with icon) | Partial — dot animation nai |
| Multi-line title with colors | Yes (3 lines, different colors) | Partial (highlightWords ache) | Needs: line-by-line color control, coral underline |
| Subtitle | Yes | Yes | OK |
| 2 CTA buttons | Yes | Yes (primary + secondary) | OK |
| Avatar group (social proof) | Yes (5 colored circles with initials) | NO | MISSING |
| Social proof text | Yes ("1,200+ entrepreneurs...") | Partial (trustText with stars) | Needs: avatar integration |
| Application Tracker Card | Yes (complex right-side card) | NO | MISSING — completely new widget needed |
| 2-column hero layout | Yes (content left + card right) | Section "2-1" layout diye possible | Workaround possible |
| Decorative circles | Yes (absolute positioned) | Section background e partial | Limited |

### Ticker/Marquee — Completely Missing

| Feature | Status |
|---------|--------|
| Marquee/ticker widget | NOT AVAILABLE — new widget banate hobe |
| Infinite scroll animation | New implementation needed |
| Country + client count items | Custom data structure needed |
| Dark background | Section background diye hobe |

---

## Implementation Strategy

### Approach: Theme data.json e default content rakhbo

**Concept:**
1. Legal theme er `data.json` er `pages[home].blocks` e hero + ticker sections pre-configured thakbe
2. Theme activate korle ei sections automatically home page e load hobe
3. Admin ke page builder e giye kichui korte hobe na

### Step 1: Hero Section (Page Builder diye)

**Option A: Existing widgets diye workaround**
- Section layout: `"2-1"` (66% left, 33% right)
- Left column: `hero-content` widget (badge, title, subtitle, CTAs, trustText)
- Right column: ??? — kono existing widget diye Application Tracker card toiri kora jabe NA

**Option B: New widgets banano (RECOMMENDED)**
- `hero-content` widget UPGRADE korte hobe:
  - Avatar group support add korte hobe
  - Multi-color title lines support
  - Coral underline effect
- New widget: `application-tracker` (right side card)
  - Steps with done/active/pending states
  - Stats bar
  - CTA button
  - Forest green card design

### Step 2: Ticker Widget (New)

New widget: `ticker-marquee`
- Settings: items array (text + bold text pairs)
- Background color (default: dark forest)
- Speed control
- Separator style
- Direction (left-to-right or right-to-left)

### Step 3: Theme data.json Update

Home page blocks e 2 ta section add korbo:
1. Hero section (2-column layout with hero-content + application-tracker)
2. Ticker section (full-width with ticker-marquee widget)

---

## Priority & Roadmap

### Phase 1: Hero + Ticker — DONE ✓
1. ✓ **hero-content** widget upgrade (avatar group, multi-color title, underline, customFontSize)
2. ✓ **custom-html** widget create (replaced application-tracker — more flexible)
3. ✓ **ticker-marquee** widget create
4. ✓ Legal theme `data.json` update (home page hero + ticker sections)
5. ✓ Theme importer fix (respect `useTheme: false` for non-theme colors)

### Phase 2: Stats Section — NEXT
See detailed implementation guide below in "Stats Section Implementation Guide"

### Phase 3: Remaining Sections (Future)
v3-forge.html er baki sections aste aste add hobe:
- Services grid (8 service cards, different sizes)
- Process steps (4 steps with connector lines)
- Why Us / Bento grid (dark bg, metric cards)
- Pricing (3-tier comparison)
- Testimonials
- FAQ
- CTA / Footer

---

## Section Alignment Rules (CRITICAL)

### The Rule

**All homepage sections MUST have identical horizontal alignment settings** so content edges line up on the same vertical line across sections.

Required settings for every new section:

```json
{
  "settings": {
    "paddingLeft": 28,
    "paddingRight": 28,
    "maxWidth": "xl",
    "fullWidth": true
  }
}
```

### What NOT to do

1. **NEVER add `padding-inline` or extra `padding-left`/`padding-right` in customCSS on the `.mx-auto` container.** This creates double padding — the section already applies `paddingLeft/Right: 28px`, so adding more in customCSS will push content inward and break alignment.

   ```css
   /* BAD — causes double padding */
   & > .mx-auto { padding-inline: 28px; }

   /* BAD — overrides consistent maxWidth */
   & > .mx-auto { max-width: 1160px; }
   ```

2. **NEVER set `max-width` in customCSS on the `.mx-auto` container.** Let `maxWidth: "xl"` handle it consistently. If you override it to a different value (e.g., `1160px`), that section's content will be narrower than others.

3. **NEVER add horizontal padding at the column level** (`col.settings.paddingLeft/Right`) when the section already has `paddingLeft/Right`. This also causes double padding.

### How the rendering works

```
<section style="padding-left: 28px; padding-right: 28px;">     ← section-level padding
  <div class="mx-auto max-w-screen-xl">                        ← maxWidth container
    <div class="grid ..." style="gap: ...">                    ← layout grid
      <column 1>
      <column 2>
    </div>
  </div>
</section>
```

- `paddingLeft/Right` applies to the outer `<section>` element
- `maxWidth: "xl"` maps to `max-w-screen-xl` (1280px) on the inner container
- Column padding would add INSIDE the grid — avoid it for alignment

### customCSS safe usage

customCSS CAN override grid columns, style inner elements, etc. — just never touch the container's horizontal padding or max-width:

```css
/* SAFE — override grid columns for asymmetric layout */
@media (min-width: 1024px) { & .grid { grid-template-columns: 1fr 420px; } }

/* SAFE — style inner widget elements */
& h2 { font-size: clamp(28px, 4vw, 44px) !important; }
& a.group:hover { background: rgba(232, 76, 30, 0.06); }
```

### Bug history

The hero section (`section_hero_forge`) had this customCSS:
```css
& > .mx-auto { max-width: 1160px; padding-inline: 28px; }
```
This added 28px extra padding inside the container ON TOP of the 28px section-level padding, causing hero content to be ~56px to the right of stats/services content. Fix was removing the `padding-inline` and `max-width` override from customCSS.

---

## Section-Level Custom CSS

### Concept

Protita widget e Custom CSS field rakhbo na — onek unnecessary hobe. Instead, **Section level e ekta Custom CSS textarea** thakbe. Admin chaile section er moddher jokono widget ke chhoto khato tweak korte parbe ekhane CSS likhe.

### Why Section Level, Not Widget Level?

1. **Section e rakhle** oi section er shob widgets ek jaygay theke customize kora jay
2. Widget by widget CSS likhte hoy na — ekta field e sob hoy
3. Page builder UI cleaner thake — widget settings e extra field er dorkar nai
4. 90% edge case section-level CSS diye solve hoy

### Implementation

```
Section (customCSS field + isolation: isolate)
  ├── Column 1
  │     ├── hero-content widget
  │     └── button widget
  └── Column 2
        └── application-tracker widget
```

**SectionSettings e new field:**
```typescript
interface SectionSettings {
  // ...existing fields...
  customCSS?: string;  // Admin er custom CSS input
}
```

**Rendering:**
```tsx
// Section container e unique class + scoped style
<div className={`section-custom-${section.id}`} style={{ isolation: 'isolate' }}>
  <style>{`
    .section-custom-${section.id} {
      ${section.settings.customCSS || ''}
    }
  `}</style>
  {/* columns + widgets render here */}
</div>
```

### z-index Sandboxing (Security)

**Problem:** Admin jodi custom CSS e `z-index: 9999` dey, seta header, modal, dropdown shob kichur upor chole asbe.

**Solution:** `isolation: isolate` — CSS property ja new stacking context create kore.

```css
.section-custom-[sectionId] {
  isolation: isolate; /* automatically applied */
}
```

**Ei property ki kore:**
- Section er moddhe z-index shudhu **sei section er bhitore** kaz kore
- Bairer header (z-200), modal (z-50), dropdown (z-40) — kichu affect hoy na
- Admin freely z-index likhte pare, site er baki kichu break hobe na

**Our z-index reference:**

| Element | z-index | Protected? |
|---------|---------|------------|
| Header/Navbar | 200 | Yes — isolation diye sandboxed |
| Mobile nav | 199 | Yes |
| Modals | 50 | Yes |
| Dropdowns | 40 | Yes |
| Section custom CSS | Capped by `isolation: isolate` | Sandbox er bhitore |

### Page Builder UI

Section settings panel e (**Advanced** tab er moddhe):
- Label: "Custom CSS"
- Input: Monospace textarea (syntax highlighting optional)
- Helper text: "CSS rules applied within this section only. z-index is sandboxed."
- Default: Empty

### Custom JS — Intentionally Excluded

- **Security risk:** JS inject korle XSS vulnerability hote pare
- **Not needed:** Interactive behaviors widget settings diye handle kora hoy (animations, hover effects, etc.)
- Future e jodi kono special case lage, section-level custom JS consider kora jabe — but shudhu admin role er jonno

---

## Custom Typography System (Per-Widget Font Control)

### Problem

Widgets use Tailwind size tokens (sm/md/lg/xl/2xl) that map to fixed breakpoint classes like `text-4xl md:text-5xl`. This doesn't support fluid typography (`clamp()`) and limits theme control — the same "xl" token maps to identical sizes everywhere, but a hero heading (76px) and a section heading (46px) need different values.

### Solution

Every widget supports optional custom typography fields in its settings JSON. When present, these fields apply as inline styles and override the default Tailwind token classes. When absent, the widget falls back to its original Tailwind behavior.

### How It Works

**Conditional class + inline style pattern:**
```tsx
<h2
  className={cn(
    !heading.fontWeight && "font-bold",        // Tailwind default only if no custom weight
    !heading.letterSpacing && "tracking-tight", // Tailwind default only if no custom spacing
    !heading.customFontSize && headingSizeClasses[heading.size] // Token class only if no custom size
  )}
  style={{
    color: heading.color || "#0f172a",
    ...(heading.customFontSize ? { fontSize: heading.customFontSize } : {}),
    ...(heading.fontWeight ? { fontWeight: heading.fontWeight } : {}),
    ...(heading.lineHeight ? { lineHeight: heading.lineHeight } : {}),
    ...(heading.letterSpacing ? { letterSpacing: heading.letterSpacing } : {}),
  }}
>
```

When `customFontSize` is set (e.g., `"clamp(30px, 4vw, 46px)"`), the Tailwind size class is removed and the inline style takes over. When not set, the original token-based class applies.

### Supported Fields by Widget

#### SectionHeader widgets (service-card, service-list, pricing-table, process-steps)

All four SectionHeader widgets support the same pattern for badge, heading, and description:

```json
{
  "header": {
    "badge": {
      "text": "Our Services",
      "customFontSize": "12px",
      "fontWeight": 700,
      "letterSpacing": "1.5px",
      "textTransform": "uppercase"
    },
    "heading": {
      "text": "Services We Offer",
      "size": "lg",
      "customFontSize": "clamp(30px, 4vw, 46px)",
      "fontWeight": 800,
      "lineHeight": 1.1,
      "letterSpacing": "-0.025em"
    },
    "description": {
      "text": "We handle everything...",
      "size": "md",
      "customFontSize": "15px",
      "lineHeight": 1.7
    }
  }
}
```

**Fields:**
| Field | Applies to | Type | Example |
|-------|-----------|------|---------|
| `customFontSize` | badge, heading, description | string (CSS value) | `"clamp(30px, 4vw, 46px)"`, `"15px"` |
| `fontWeight` | badge, heading | number | `800` |
| `lineHeight` | heading, description | number | `1.35` |
| `letterSpacing` | badge, heading | string (CSS value) | `"-0.025em"`, `"1.5px"` |
| `textTransform` | badge | string | `"uppercase"` |

#### service-card (card content)

```json
{
  "content": {
    "customTitleFontSize": "18px",
    "titleFontWeight": 700,
    "titleLetterSpacing": "-0.01em",
    "customDescFontSize": "13px",
    "descLineHeight": 1.65
  }
}
```

#### process-steps (step content)

```json
{
  "stepContent": {
    "customTitleFontSize": "17px",
    "titleFontWeight": 700,
    "customDescFontSize": "13px",
    "descLineHeight": 1.65
  }
}
```

#### hero-content (headline)

```json
{
  "headline": {
    "customFontSize": "clamp(44px, 6vw, 76px)",
    "fontWeight": 900,
    "lineHeight": 1,
    "letterSpacing": "-0.04em"
  }
}
```

#### stats-section (stat values and labels)

```json
{
  "style": {
    "customValueFontSize": "48px",
    "valueFontWeight": 900,
    "valueLetterSpacing": "-0.04em",
    "valueLineHeight": 1,
    "customLabelFontSize": "13px",
    "labelFontWeight": 500,
    "labelLetterSpacing": "0.3px"
  }
}
```

#### testimonials (header)

Same pattern as SectionHeader widgets — `header.badge`, `header.heading`, `header.description` all support `customFontSize`, `fontWeight`, `lineHeight`, `letterSpacing`.

#### blog-section-header

```json
{
  "heading": {
    "customFontSize": "clamp(24px, 3vw, 36px)",
    "fontWeight": 800,
    "lineHeight": 1.2,
    "letterSpacing": "-0.02em"
  },
  "subheading": {
    "customFontSize": "15px",
    "lineHeight": 1.6
  }
}
```

#### ticker-marquee

```json
{
  "customFontSize": "14px",
  "fontWeight": 600
}
```

### How to Use in Theme data.json

1. Open `public/themes/<theme-name>/data.json`
2. Find the widget settings for the section you want to customize
3. Add the custom typography fields alongside existing settings
4. Values are CSS strings — you can use `px`, `em`, `rem`, `clamp()`, `calc()`, etc.
5. Activate the theme — the importer preserves all fields via spread operator

### Backward Compatibility

- All custom typography fields are **optional** (`?` in TypeScript)
- If a field is missing or undefined, the widget uses its original Tailwind token behavior
- Existing themes without custom typography continue to work identically
- No database migration required — fields are stored in JSON settings

### Best Practices for Theme Developers

1. **Use `clamp()` for headings** to get fluid responsive sizing: `"clamp(30px, 4vw, 46px)"`
2. **Use fixed `px` for small text** (badges, descriptions, labels): `"13px"`
3. **Always set `lineHeight`** when changing `customFontSize` — default Tailwind line-heights may not match
4. **Use negative `letterSpacing`** for large headings (tighter tracking): `"-0.025em"`
5. **Use positive `letterSpacing`** for small uppercase text (badges): `"1.5px"`
6. **Keep the `size` token** even when using `customFontSize` — it serves as fallback if the custom field is removed
7. **Reference the HTML template** (e.g., `docs/home/1_home/v3-forge.html`) to extract exact values

## Key Technical Points

1. **Widget rendering:** `src/components/page-builder/widgets/content/hero-content.tsx`
2. **Widget settings UI:** `src/components/page-builder/settings/hero-content-settings.tsx`
3. **Widget registry:** `src/components/page-builder/widgets/index.ts`
4. **Frontend renderer:** `src/components/landing-page/widget-sections-renderer.tsx`
5. **Theme importer:** `src/lib/theme/theme-importer.ts`
6. **Theme data:** `public/themes/legal/data.json`
7. **Widget types:** `src/lib/page-builder/types.ts`
8. **Widget defaults:** `src/lib/page-builder/defaults.ts`

---

## Summary

**Ki hobe:**
- "Legal & Business Services" theme activate korle home page e v3-forge.html er hero + ticker automatically dekhabe
- Admin ke manually page builder e giye kichui korte hobe na
- Shob content theme er `data.json` e pre-configured thakbe
- Page builder e gele admin chaile customize korte parbe (text change, color change, etc.)

**Ki ki new widget lagbe:**
1. `application-tracker` — hero er right-side card
2. `ticker-marquee` — scrolling country/stats bar

**Ki upgrade lagbe:**
1. `hero-content` — avatar group, multi-color title, coral underline support

**Ki already ache jeta use korbo:**
- Section `"2-1"` layout (hero section er jonno)
- Section `"1"` layout (ticker section er jonno)
- Section background system (cream bg, dark forest bg)
- Theme import system (data.json → database)

---

## Stats Section Implementation Guide

### Reference Design (v3-forge.html)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Background: Dark forest (#1b3a2d)                                        │
│  Overlay text: "LLC" (rotated 90°, right side, near-invisible)            │
│                                                                            │
│  ┌──────── LEFT (50%) ────────┐  ┌──────── RIGHT (50%) ────────────────┐ │
│  │                             │  │                                      │ │
│  │  Numbers that speak         │  │  ┌──────────┬──────────────────┐    │ │
│  │  for themselves             │  │  │ 1200+    │ 30+              │    │ │
│  │       ^^^^^^^^^^            │  │  │ US LLCs  │ Countries Served │    │ │
│  │       (coral color)         │  │  │ Formed   │                  │    │ │
│  │                             │  │  ├──────────┼──────────────────┤    │ │
│  │  We've helped over 1,200    │  │  │ 4.9★     │ 24h              │    │ │
│  │  international entrepre...  │  │  │ Avg.     │ We File Within   │    │ │
│  │                             │  │  │ Rating   │                  │    │ │
│  │  [Talk to Our Team]         │  │  └──────────┴──────────────────┘    │ │
│  │                             │  │  (rounded corners, 1px grid lines)  │ │
│  └─────────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Reference CSS (from v3-forge.html)

```css
/* Section */
.stats-section {
  background: var(--forest);        /* #1b3a2d */
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

/* "LLC" watermark overlay — rotated text on right side */
.stats-section::before {
  content: 'LLC';
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  font-family: 'Outfit', sans-serif;
  font-size: 240px;
  font-weight: 900;
  color: rgba(255,255,255,0.025);
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: -8px;
}

/* 2-column layout */
.stats-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

/* Left column heading */
.stats-left h2 {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 800;
  color: var(--cream);              /* #faf8f4 */
  line-height: 1.15;
  letter-spacing: -0.025em;
  margin-bottom: 20px;
}
.stats-left h2 em {
  color: var(--coral-2);            /* #ff6a3d */
  font-style: normal;
}

/* Left column body text */
.stats-left p {
  font-size: 16px;
  color: rgba(250,248,244,0.55);
  line-height: 1.75;
  max-width: 380px;
  margin-bottom: 32px;
}

/* Stats grid (right column) — THE KEY DESIGN */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;                         /* 1px gap = grid lines */
  background: rgba(255,255,255,0.07); /* gap color = grid line color */
  border-radius: 20px;
  overflow: hidden;
}

.stat-box {
  padding: 32px 28px;
  background: rgba(255,255,255,0.04); /* each cell has semi-transparent bg */
}

.stat-box__num {
  font-family: 'Outfit', sans-serif;
  font-size: 48px;
  font-weight: 900;
  color: var(--cream);              /* #faf8f4 */
  letter-spacing: -0.04em;
  line-height: 1;
}

.stat-box__num em {
  color: var(--coral-2);            /* #ff6a3d suffix color */
  font-style: normal;
}

.stat-box__label {
  font-size: 13px;
  color: rgba(250,248,244,0.45);
  margin-top: 8px;
  font-weight: 500;
  letter-spacing: 0.3px;
}
```

### Reference HTML

```html
<section class="stats-section">
  <div class="container">
    <div class="stats-layout">
      <!-- Left: heading + text + CTA -->
      <div class="stats-left r r-right">
        <h2>Numbers that speak<br>for <em>themselves</em></h2>
        <p>We've helped over 1,200 international entrepreneurs navigate the US
           business formation process — from first-time founders to serial
           entrepreneurs scaling globally.</p>
        <a href="#contact" class="btn btn--coral btn--lg">Talk to Our Team</a>
      </div>
      <!-- Right: 2×2 stats card grid -->
      <div class="stats-grid r r-left d2">
        <div class="stat-box">
          <div class="stat-box__num">1,200<em>+</em></div>
          <div class="stat-box__label">US LLCs Formed</div>
        </div>
        <div class="stat-box">
          <div class="stat-box__num">30<em>+</em></div>
          <div class="stat-box__label">Countries Served</div>
        </div>
        <div class="stat-box">
          <div class="stat-box__num">4.9<em>★</em></div>
          <div class="stat-box__label">Avg. Rating</div>
        </div>
        <div class="stat-box">
          <div class="stat-box__num">24<em>h</em></div>
          <div class="stat-box__label">We File Within</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Counter Animation (reference JS)

Numbers animate from 0 to target when scrolled into view:
- Duration: 1800ms
- Easing: `easeOutQuart` — `1 - Math.pow(1 - t, 4)`
- Trigger: IntersectionObserver with threshold 0.4
- Runs once only (unobserves after first trigger)
- Data attributes: `data-target`, `data-decimals`, `data-suffix`

**Note:** Our stats widget ALREADY has animated counters with IntersectionObserver
(`useAnimatedCounter` hook in `stats-section.tsx`). Just need to ensure the card-grid
variant preserves this animation.

### Responsive Breakpoints (reference)

```css
/* Tablet: stack columns, stats go 4-across */
@media (max-width: 960px) {
  .stats-layout { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}
/* Mobile: stats back to 2×2 */
@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
```

---

### Implementation Plan — Widget Breakdown

#### Section Configuration

| Setting | Value |
|---------|-------|
| Layout | `"1-1"` (50/50 split) |
| Background | Solid `#1b3a2d` (forest green) |
| paddingTop | 80 |
| paddingBottom | 80 |
| paddingLeft / paddingRight | 0 |
| maxWidth | `"xl"` |
| gap | 64 |
| fullWidth | true |
| customCSS | See below |

**Section customCSS** (for "LLC" watermark overlay):
```css
&::before {
  content: 'LLC';
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  font-family: 'Outfit', sans-serif;
  font-size: 240px;
  font-weight: 900;
  color: rgba(255,255,255,0.025);
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: -8px;
}
```

**Alternative approach (better):** Instead of customCSS, add a `decorativeText` field
to SectionSettings:
```typescript
decorativeText?: {
  enabled: boolean;
  text: string;           // "LLC"
  position: "left" | "right" | "center";
  rotation: number;       // 90 (degrees)
  fontSize: number;       // 240 (px)
  fontFamily: string;     // "Outfit"
  fontWeight: number;     // 900
  color: string;          // "rgba(255,255,255,0.025)"
  offset: number;         // -40 (px from edge)
};
```
This is more admin-friendly than raw CSS. But customCSS works too — choose one.

#### Left Column (3 widgets stacked vertically)

**Column settings:**
```json
{
  "verticalAlign": "center",
  "padding": 0,
  "paddingLeft": 28,
  "paddingRight": 28
}
```

##### Widget 1: `heading` (h2)

Use the **heading** widget (NOT hero-content). It has full typography control
and highlight word support.

```json
{
  "type": "heading",
  "settings": {
    "content": {
      "text": "Numbers that speak\nfor themselves",
      "htmlTag": "h2",
      "highlight": {
        "enabled": true,
        "words": "themselves",
        "style": "color"
      }
    },
    "style": {
      "alignment": "left",
      "typography": {
        "fontFamily": "Outfit",
        "fontSize": 48,
        "fontSizeUnit": "px",
        "fontWeight": 800,
        "lineHeight": 1.15,
        "letterSpacing": -0.025,
        "letterSpacingUnit": "em"
      },
      "textFill": {
        "type": "solid",
        "color": "#faf8f4"
      },
      "highlightStyle": {
        "color": "#ff6a3d"
      }
    }
  },
  "spacing": { "marginBottom": 20 }
}
```

**Important notes for heading widget:**
- `text` supports `\n` for line breaks — use it for "Numbers that speak\nfor themselves"
- `highlight.words: "themselves"` highlights that word
- `highlight.style: "color"` applies just color (not background)
- `highlightStyle.color: "#ff6a3d"` = coral-2 color
- Typography: fontFamily "Outfit" may need Google Fonts loaded (already in layout)
- Reference uses `clamp(32px, 4vw, 48px)` — set fontSize=48 and optionally add
  responsive overrides or use `fontSizeUnit: "clamp"` if supported

##### Widget 2: `text-block` (paragraph)

```json
{
  "type": "text-block",
  "settings": {
    "content": "<p>We've helped over 1,200 international entrepreneurs navigate the US business formation process — from first-time founders to serial entrepreneurs scaling globally.</p>",
    "typography": {
      "fontSize": 16,
      "lineHeight": 1.75,
      "color": "rgba(250,248,244,0.55)"
    }
  },
  "spacing": { "marginBottom": 32 }
}
```

**Note:** text-block uses Tiptap HTML content. The `max-width: 380px` can be set via
the widget's container style or via the column width.

##### Widget 3: `button-group` (CTA)

```json
{
  "type": "button-group",
  "settings": {
    "buttons": [
      {
        "id": "btn_stats_cta",
        "text": "Talk to Our Team",
        "link": "#contact",
        "style": {
          "bgColor": "#e84c1e",
          "textColor": "#ffffff",
          "borderRadius": 10,
          "hoverEffect": "default"
        }
      }
    ],
    "alignment": "left",
    "layout": "horizontal",
    "gap": 12
  }
}
```

#### Right Column (1 widget)

**Column settings:**
```json
{
  "verticalAlign": "center",
  "padding": 0,
  "paddingLeft": 28,
  "paddingRight": 28
}
```

##### Widget 4: `stats-section` with NEW "card-grid" variant

**⚠️ REQUIRES CODE CHANGE — New variant for stats-section widget**

The current stats widget renders a flat grid. The reference design needs a "card-grid"
variant with rounded container, 1px gap grid lines, and cell backgrounds.

```json
{
  "type": "stats-section",
  "settings": {
    "variant": "card-grid",
    "stats": [
      { "id": "stat_1", "value": "1200", "label": "US LLCs Formed", "suffix": "+", "animate": true },
      { "id": "stat_2", "value": "30", "label": "Countries Served", "suffix": "+", "animate": true },
      { "id": "stat_3", "value": "4.9", "label": "Avg. Rating", "suffix": "★", "animate": true },
      { "id": "stat_4", "value": "24", "label": "We File Within", "suffix": "h", "animate": true }
    ],
    "columns": 2,
    "style": {
      "valueColor": "#faf8f4",
      "labelColor": "rgba(250,248,244,0.45)",
      "suffixColor": "#ff6a3d",
      "valueSize": "xl",
      "layout": "vertical",
      "divider": false
    },
    "cardGrid": {
      "borderRadius": 20,
      "gridGap": 1,
      "gridLineColor": "rgba(255,255,255,0.07)",
      "cellBackground": "rgba(255,255,255,0.04)",
      "cellPadding": "32px 28px",
      "valueFontFamily": "Outfit",
      "valueFontWeight": 900,
      "valueFontSize": 48,
      "valueLetterSpacing": "-0.04em",
      "labelFontSize": 13,
      "labelFontWeight": 500,
      "labelLetterSpacing": "0.3px",
      "labelMarginTop": 8
    },
    "centered": false,
    "animateOnScroll": true,
    "colors": { "useTheme": false }
  }
}
```

---

### Code Changes Required

#### 1. Add `variant` field to StatsSectionWidgetSettings

**File:** `src/lib/page-builder/types.ts`

```typescript
export interface StatsSectionWidgetSettings {
  // ADD THIS:
  variant?: "default" | "card-grid";

  // ADD THIS (card-grid specific config):
  cardGrid?: {
    borderRadius: number;       // 20
    gridGap: number;            // 1 (px)
    gridLineColor: string;      // "rgba(255,255,255,0.07)"
    cellBackground: string;     // "rgba(255,255,255,0.04)"
    cellPadding: string;        // "32px 28px"
    valueFontFamily?: string;   // "Outfit"
    valueFontWeight?: number;   // 900
    valueFontSize?: number;     // 48 (px)
    valueLetterSpacing?: string; // "-0.04em"
    labelFontSize?: number;     // 13 (px)
    labelFontWeight?: number;   // 500
    labelLetterSpacing?: string; // "0.3px"
    labelMarginTop?: number;    // 8 (px)
  };

  // ADD THIS (suffix can have separate color):
  style: {
    // ...existing fields...
    suffixColor?: string;       // "#ff6a3d" — coral suffix color
  };

  // ...rest stays same...
}
```

#### 2. Add card-grid rendering to stats-section widget

**File:** `src/components/page-builder/widgets/social-proof/stats-section.tsx`

When `variant === "card-grid"`, render:

```tsx
// Card-grid variant
if (variant === "card-grid") {
  const cg = settings.cardGrid || DEFAULT_CARD_GRID;
  return (
    <WidgetContainer container={settings.container}>
      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{
          borderRadius: `${cg.borderRadius}px`,
          background: cg.gridLineColor,      // shows through as grid lines
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${cg.gridGap}px`,
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.id}
              style={{
                padding: cg.cellPadding,
                background: cg.cellBackground,
              }}
            >
              <div style={{
                fontFamily: cg.valueFontFamily || "inherit",
                fontSize: `${cg.valueFontSize || 48}px`,
                fontWeight: cg.valueFontWeight || 900,
                color: style.valueColor,
                letterSpacing: cg.valueLetterSpacing || "-0.04em",
                lineHeight: 1,
              }}>
                {stat.prefix}
                <AnimatedValue stat={stat} isVisible={isVisible} />
                {stat.suffix && (
                  <span style={{ color: style.suffixColor || style.valueColor }}>
                    {stat.suffix}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: `${cg.labelFontSize || 13}px`,
                fontWeight: cg.labelFontWeight || 500,
                color: style.labelColor,
                letterSpacing: cg.labelLetterSpacing || "0.3px",
                marginTop: `${cg.labelMarginTop || 8}px`,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetContainer>
  );
}
```

**Key difference from default variant:**
- No icons (card-grid omits icons entirely)
- Suffix displayed INLINE with number (not in AnimatedStat component)
- Suffix has its own color (`suffixColor`)
- Container has rounded corners + overflow hidden
- Grid uses 1px gap with background color as divider lines
- Each cell has semi-transparent background
- Typography is bigger and more bold (48px, weight 900)
- No dividers (the 1px gap IS the divider)
- No top border option

#### 3. Add variant selector to settings panel

**File:** `src/components/page-builder/settings/stats-section-settings.tsx`

Add a `SelectInput` at the top of the content tab:

```tsx
<SelectInput
  label="Design Variant"
  value={s.variant || "default"}
  onChange={(v) => updateField("variant", v as "default" | "card-grid")}
  options={[
    { value: "default", label: "Default (flat grid with icons)" },
    { value: "card-grid", label: "Card Grid (rounded, dark card style)" },
  ]}
/>
```

When variant is "card-grid", show additional settings in the Style tab for card grid
configuration (borderRadius, gridLineColor, cellBackground, etc.).

#### 4. Add defaults

**File:** `src/lib/page-builder/defaults.ts`

```typescript
export const DEFAULT_CARD_GRID_SETTINGS = {
  borderRadius: 20,
  gridGap: 1,
  gridLineColor: "rgba(255,255,255,0.07)",
  cellBackground: "rgba(255,255,255,0.04)",
  cellPadding: "32px 28px",
  valueFontFamily: "Outfit",
  valueFontWeight: 900,
  valueFontSize: 48,
  valueLetterSpacing: "-0.04em",
  labelFontSize: 13,
  labelFontWeight: 500,
  labelLetterSpacing: "0.3px",
  labelMarginTop: 8,
};
```

#### 5. Update theme data.json

**File:** `public/themes/legal/data.json`

Add a new section in the home page blocks array (after the ticker section) with the
complete stats section configuration. Section ID: `"sec_stats"`.

---

### Theme Binding Checklist

After implementing the code changes:
1. Add the stats section JSON to `data.json` pages → home → blocks
2. Re-activate theme at `/admin/appearance/themes` → "Legal & Business Services"
3. Verify: home page shows stats section with correct design
4. Verify: stats numbers animate on scroll
5. Verify: "LLC" watermark text visible (very faint) on right side
6. Verify: responsive behavior (2-col → 1-col on tablet, stats grid adapts)

### Files to Modify (Summary)

| File | Change |
|------|--------|
| `src/lib/page-builder/types.ts` | Add `variant`, `cardGrid`, `suffixColor` to StatsSectionWidgetSettings |
| `src/lib/page-builder/defaults.ts` | Add `DEFAULT_CARD_GRID_SETTINGS`, update stats defaults map |
| `src/components/page-builder/widgets/social-proof/stats-section.tsx` | Add card-grid rendering branch |
| `src/components/page-builder/settings/stats-section-settings.tsx` | Add variant selector + card-grid style settings |
| `public/themes/legal/data.json` | Add stats section to home page blocks |

---

## Blog Section — "Free Guides for Global Founders" (Order 9)

### Reference Design

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Background: White (#ffffff)                                                  │
│  Padding: 100px top/bottom, 28px left/right                                  │
│                                                                               │
│  [Insights]        Free guides for              [Browse All Articles →]       │
│                    global founders                                            │
│                                                                               │
│  ┌─────────────────┬──────────────────┬──────────────────┐                   │
│  │  FEATURED CARD   │  Card 2           │  Card 3           │                   │
│  │  (dark forest bg │  Form 5472:       │  US Bank Account   │                   │
│  │  1.15fr, 2 rows) │  The $25,000...   │  for Non-Residents │                   │
│  │                   ├──────────────────┼──────────────────┤                   │
│  │  Wyoming vs       │  Card 4           │  Card 5           │                   │
│  │  Delaware LLC     │  2026 Remittance  │  TikTok Shop      │                   │
│  │  for Non-Residents│  Tax              │  Setup             │                   │
│  └─────────────────┴──────────────────┴──────────────────┘                   │
│                                                                               │
│  [EIN Without SSN] [Form 5472 Guide] [US Banking Guide] [Amazon Seller 101]  │
│  [ITIN Application] [TikTok Shop Setup]                                       │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Approach: Existing Widget + Section customCSS

**No new widget code needed.** Uses existing `blog-post-grid` widget. The bento grid layout
is achieved entirely through section-level `customCSS` which overrides the default
3-column grid into a bento layout with the first card spanning 2 rows.

### Section Configuration

| Setting | Value |
|---------|-------|
| Section ID | `sec_blog_forge` |
| Order | 9 (after testimonials at 8) |
| Layout | `"1"` (single column) |
| Background | Solid `#ffffff` (white) |
| paddingTop / paddingBottom | 100 / 100 |
| paddingLeft / paddingRight | 28 / 28 |
| maxWidth | `"xl"` |
| fullWidth | true |

### Widgets in This Section

#### Widget 1: `blog-post-grid` (ID: `widget_blog_grid_forge`)

**Header settings:**
- Badge: "Insights" — coral text (#e84c1e), uppercase, 12px, 700 weight
- Heading: "Free guides for\nglobal founders" — ink (#0e1109), clamp(28px,3.5vw,42px), 800 weight
- View All: "Browse All Articles" → `/blog`, button-outline style, forest green (#1b3a2d)
- Alignment: `space-between`
- marginBottom: 56

**Data source:** `source: "all"`, `postCount: 5`, `orderBy: "date"`, `orderDirection: "desc"`

**Layout:** grid, 3 cols desktop / 2 tablet / 1 mobile, gap 20, equalHeight true

**Card settings:**
- Style: `bordered`, borderRadius: 20, hoverEffect: `lift`, contentPadding: 24
- Image: show true, aspectRatio `16:9`, hoverEffect `zoom`
- Category badge: show true, position `above-title`, style `pill`
- Title: fontSize `md`, fontWeight 700, maxLines 2
- Excerpt: fontSize `sm`, maxLength 140
- Meta: items `["readingTime"]`, separator `dot`, fontSize `xs`
- Read more: show false (handled by customCSS hover)

#### Widget 2: `heading` (ID: `widget_blog_topics`)

Topic tag pills rendered as HTML `<a>` links with inline styles. Tags: EIN Without SSN, Form 5472 Guide, US Banking Guide, Amazon Seller 101, ITIN Application, TikTok Shop Setup.

### Section customCSS (Bento Grid Transformation)

The key CSS selectors target the blog widget's DOM structure:

```
section.section-custom-sec_blog_forge
  └── div[data-field-id="posts"]           ← the grid container
        └── div                             ← animation wrapper per card
              └── a.group                   ← BlogCard link
                    ├── div (image)
                    └── div (content: badge, h3, p, meta)
```

**What the CSS does:**

1. **Bento grid override:** Changes `grid-template-columns` from `repeat(3, 1fr)` to `1.15fr 1fr 1fr` with 2 rows
2. **Featured first card:** `grid-row: 1 / -1` spans full height; dark forest bg (#0f2318); image becomes absolute overlay at 0.18 opacity
3. **Featured card text:** White title (clamp 22-28px), muted excerpt (rgba 0.5), muted meta (rgba 0.35)
4. **Featured badge:** Dark pill style (rgba bg, light text)
5. **All headings:** `font-family: var(--font-heading)`, weight 800, tight tracking
6. **Regular card hover:** translateY(-6px), box-shadow, title color changes to forest green
7. **Regular badges:** Transparent bg, uppercase 11px, 1px border
8. **Responsive:** Tablet (1fr 1fr, featured spans full width) → Mobile (1fr single column)

### Blog Categories (Theme Data)

Added to `data.json.blogCategories`:

| Slug | Name | sortOrder |
|------|------|-----------|
| llc-guide | LLC Guide | 0 |
| tax-compliance | Tax & Compliance | 1 |
| banking | Banking | 2 |
| new-law | New Law | 3 |
| e-commerce | E-Commerce | 4 |

### Blog Posts (Theme Data)

Added to `data.json.blogs` — 5 SEO-optimized posts with full HTML content (1500-2500 words each):

| # | Title | Slug | Category | Cover Image |
|---|-------|------|----------|-------------|
| 1 | Wyoming vs Delaware LLC for Non-Residents: Which State Should You Choose in 2026? | wyoming-vs-delaware-llc-non-residents-2026 | llc-guide | Unsplash (US map) |
| 2 | Form 5472: The $25,000 Filing Every Foreign LLC Owner Must Know | form-5472-foreign-llc-owner-guide | tax-compliance | Unsplash (tax docs) |
| 3 | US Bank Account for Non-Residents: What Changed in 2026 | us-bank-account-non-residents-2026 | banking | Unsplash (banking) |
| 4 | The 2026 Remittance Tax: What Every Foreign LLC Owner Needs to Know | 2026-remittance-tax-foreign-llc-owners-guide | new-law | Unsplash (currency) |
| 5 | How to Set Up TikTok Shop in the US as a Non-Resident | tiktok-shop-us-non-resident-setup-guide | e-commerce | Unsplash (TikTok) |

Each post includes: metaTitle (≤60 chars), metaDescription (≤160 chars), excerpt, coverImage URL, categorySlug, internal links to service pages.

### Theme Import Flow for Blog Data

When theme is activated, `theme-importer.ts` handles blog data:

1. **Delete phase:** All existing `BlogCategory` and `BlogPost` records are deleted
2. **blogCategories:** Creates categories (2-pass: first creates all, then sets parentSlug relationships)
3. **blogs:** Creates posts with `categorySlug` → category connection, sets `coverImage`, `status: PUBLISHED`, `publishedAt: new Date()`

Fields imported per blog post: `title`, `slug`, `content`, `excerpt`, `coverImage`, `status`, `publishedAt`, `metaTitle`, `metaDescription`, `categories` (via categorySlug connection)

---

## Complete Theme Section Registry (Home Page)

All homepage sections bound to the "Legal & Business Services" theme:

| Order | Section ID | Widget(s) | Description |
|-------|-----------|-----------|-------------|
| 0 | section_hero_forge | hero-content + custom-html | Hero with badge, headline, CTAs, social proof + Application Tracker card |
| 1 | section_ticker_forge | ticker-marquee | Country stats marquee (dark forest bg, 14 items via "clients-marquee" ticker) |
| 2 | section_stats | heading + stats-section | "Numbers that speak for themselves" — watermark + 4 stat cards |
| 3 | section_services_forge | service-card | 8 service cards in 2-column masonry grid (cream bg) |
| 4 | sec_process_forge | process-steps | 4-step process "How it works" (white bg) |
| 5 | section_why_forge | heading + text-block + custom-html | "Why global founders trust us" bento grid (dark bg) |
| 6 | sec_pricing_forge | pricing-cards | 3-tier pricing comparison (cream bg) |
| 7 | sec_clients_marquee | ticker-marquee | Client logos marquee (white bg, fade edges) |
| 8 | sec_testimonials_rail | testimonials-carousel | Rail carousel with 9 testimonials (dark bg, gradient) |
| 9 | sec_blog_forge | blog-post-grid + heading | Blog bento grid with 5 posts + topic pills (white bg) |

### Data Deleted on Theme Reset/Activation

When "Reset & Activate" is triggered, these database tables are wiped and recreated from `data.json`:

| Data Type | data.json Key | Database Model | Notes |
|-----------|--------------|----------------|-------|
| Settings | `settings` | SiteSettings | Global site config |
| Color Palette | `colorPalette` | ActiveTheme | Light + dark CSS vars |
| Font Config | `fontConfig` | ActiveTheme | heading/body/accent fonts |
| Service Categories | `serviceCategories` | ServiceCategory | Category hierarchy |
| Services + Packages | `services` | Service, ServicePackage, ComparisonFeature | Full service data |
| Pages + Sections | `pages` | LandingPage, LandingPageBlock | All page builder content |
| Blog Categories | `blogCategories` | BlogCategory | Category slugs + names |
| Blog Posts | `blogs` | BlogPost | Full content + SEO metadata |
| FAQs | `faqs` | FAQ | Questions + answers |
| Testimonials | `testimonials` | Testimonial | Reviews + ratings |
| Legal Pages | `legalPages` | LegalPage | Privacy, terms, refund |
| Header Config | `headerConfig` | HeaderConfig | Navigation settings |
| Menu Items | `menuItems` | MenuItem | Nav menu hierarchy |
| Footer Config | `footerConfig` | FooterConfig | Footer layout |
| Footer Widgets | `footerWidgets` | FooterWidget | Footer columns content |
| Tickers | `tickers` | Ticker, TickerItem | Marquee content |
| Locations | `locations` | Location | Service locations |
| Location Fees | `locationFees` | LocationFee | Per-location pricing |
| Form Templates | `formTemplates` | FormTemplate | Lead form configs |

---

## Widget Development Rules — Avoiding Infinite Loops & Re-render Bugs

### The Problem

Client-side widgets that merge default settings with incoming props can cause **infinite API call loops** and **unnecessary re-renders** if object references aren't stabilized. This happened in `testimonials-widget.tsx` (continuous `/api/testimonials` calls) and was also found in `service-list-widget.tsx` and `lead-form-widget.tsx`.

### Root Cause

```tsx
// BAD — creates new object reference EVERY render
const settings = deepMerge(DEFAULTS, partialSettings);

useEffect(() => {
  fetch(`/api/something?limit=${settings.dataSource.limit}`);
}, [settings.dataSource]); // ← object reference changes every render → infinite loop
```

**Cycle:** render → new object → useEffect sees "changed" dep → fetch → setState → re-render → repeat forever

### Rules for All New Widgets

#### Rule 1: Always memoize merged settings

```tsx
// CORRECT — useMemo prevents new object on every render
const settings = useMemo(
  () => deepMerge(DEFAULTS, partialSettings),
  [JSON.stringify(partialSettings)]
);
```

Or if the widget uses a `mergeSettings()` helper (like blog widgets do):

```tsx
const settings = useMemo(() => mergeSettings(rawSettings), [rawSettings]);
```

#### Rule 2: useEffect dependencies must be primitives

Never put an object or array directly in a useEffect dependency array. Extract primitive values first:

```tsx
// BAD
useEffect(() => { ... }, [settings.dataSource, settings.filters]);

// CORRECT — extract stable primitives
const fetchLimit = settings.dataSource.limit;
const fetchSortBy = settings.dataSource.sortBy;
const fetchType = settings.dataSource.testimonialType || "all";
const fetchTags = settings.dataSource.filterByTags?.join(",") || "";

useEffect(() => { ... }, [fetchLimit, fetchSortBy, fetchType, fetchTags]);
```

For arrays, convert to a string key: `array.join(",")` — this gives a stable primitive for comparison.

#### Rule 3: useCallback dependencies — use refs for state that changes after fetch

If a `useCallback` fetches data and then conditionally sets state based on current state, use a ref to avoid circular dependency:

```tsx
// BAD — selectedItem in deps → setSelectedItem inside callback → identity change → re-fetch
const fetchData = useCallback(async () => {
  const data = await fetch(...);
  if (!selectedItem) setSelectedItem(data[0]);
}, [selectedItem]); // ← changes when selectedItem is set

// CORRECT — ref doesn't cause identity change
const selectedItemRef = useRef(selectedItem);
selectedItemRef.current = selectedItem;

const fetchData = useCallback(async () => {
  const data = await fetch(...);
  if (!selectedItemRef.current) setSelectedItem(data[0]);
}, []); // ← stable, no circular dependency
```

### Quick Checklist for New Widget PRs

- [ ] Settings merge wrapped in `useMemo`?
- [ ] `useEffect` deps are all primitives (string, number, boolean)?
- [ ] No object/array directly in `useEffect` dependency array?
- [ ] `useCallback` doesn't depend on state it sets inside itself?
- [ ] No `deepMerge()` / spread merge outside of `useMemo`?
- [ ] Test: open the page, check Network tab — API should fire ONCE, not continuously?
