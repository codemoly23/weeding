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
