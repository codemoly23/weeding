# Font System — Theme-Level Typography Customization

## Overview

The reference design (v3-forge.html) uses **3 font categories**:

| Category | Font | Role | Where Used |
|----------|------|------|------------|
| **Primary (Display)** | Outfit | Headings, stat numbers, prices, CTAs, logos | All bold/large text |
| **Secondary (Body)** | Inter | Body text, tooltips, paragraphs | All readable prose |
| **Accent (Decorative)** | Georgia | Single decorative element | `.info-icon` only (italic serif "i") |

The current theme system has **2 font slots** (`headingFont` + `bodyFont`) stored in `ThemeFontConfig`. This plan extends it to **3 slots** and ensures every widget automatically uses the correct font via CSS variables — no per-widget manual font-family needed.

---

## Current System (How Fonts Work Today)

### CSS Variables (globals.css)
```css
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Inter", ui-sans-serif, system-ui, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
```

### ThemeColorProvider (color-provider.tsx)
- Reads `fontConfig` from `ActiveTheme` database
- Generates Google Fonts `<link>` tag
- Overrides `--font-sans` and `--font-heading` CSS variables
- Currently only supports `headingFont` and `bodyFont`

### ThemeFontConfig (theme-types.ts)
```typescript
interface ThemeFontConfig {
  headingFont: string;  // Google Fonts family
  bodyFont: string;     // Google Fonts family
}
```

### Customize Page (themes/customize/page.tsx)
- Fonts tab with 2 dropdowns: Heading Font, Body Font
- 25 Google Fonts available
- FontPreview component shows sample text
- Saves via PUT `/api/admin/themes/customize`

---

## Widget-by-Widget Font Analysis

### Category: PRIMARY FONT (Display — Outfit in reference)

These elements should use `--font-heading` (the display/brand font):

| Widget | Element | Current Font Source | Reference |
|--------|---------|-------------------|-----------|
| **Hero Content** | Headline | Tailwind classes + settings `fontWeight` | Outfit 900, clamp(44px,6vw,76px) |
| **Hero Content** | Badge text | Tailwind `text-[13px] font-medium` | Outfit 600 |
| **Hero Content** | Button text | Tailwind `text-[15px] font-semibold` | Outfit 600 |
| **Hero Content** | Avatar initials | Tailwind `text-xs font-bold` | Outfit 900 |
| **Heading Widget** | All heading text | Settings `fontFamily` inline style | Outfit 800 |
| **Stats Section** (default) | Value number | Tailwind `font-bold tabular-nums` | Outfit 900 |
| **Stats Section** (default) | Label | Tailwind `text-sm font-medium uppercase` | Inter 500 |
| **Stats Section** (card-grid) | Value number | Inline `fontFamily: cg.valueFontFamily` | Outfit 900, 48px |
| **Stats Section** (card-grid) | Label | Inline `fontSize/fontWeight` | Inter 500, 13px |
| **Process Steps** | Section heading | Tailwind `font-bold tracking-tight` | Outfit 800 |
| **Process Steps** | Step title | Tailwind `font-semibold` | Outfit 700 |
| **Process Steps** | Step number | Tailwind `font-bold` | Outfit 800 |
| **Pricing Table** | Plan name | Component-driven | Outfit 800, 26px |
| **Pricing Table** | Price amount | Component-driven | Outfit 900, 52px |
| **Pricing Table** | Tier label | Component-driven | Outfit 700 |
| **Testimonials** | Author name | Component-driven | Outfit 800 |
| **Testimonials** | Quote mark | Component-driven | Outfit 900, 56px |
| **Testimonials** | Avatar text | Component-driven | Outfit 900 |
| **FAQ Accordion** | Section title | Settings-driven | Outfit 800 |
| **Trust Badges** | Badge text | Tailwind `text-sm font-medium` | Inter 500 |
| **Button Group** | Button text | StyledButton settings | Outfit 600-700 |
| **Ticker Marquee** | Item text | Tailwind `text-[13px] font-semibold` | Outfit 600 |
| **Service Card** | Service name | Tailwind | Outfit 700 |
| **Service Card** | Price | Tailwind | Outfit 700 |

### Category: SECONDARY FONT (Body — Inter in reference)

These elements should use `--font-sans` (body/readable font):

| Widget | Element | Current Font Source | Reference |
|--------|---------|-------------------|-----------|
| **Hero Content** | Subheadline | Tailwind responsive classes | Inter 400 |
| **Hero Content** | Feature items | Tailwind `text-sm` | Inter 400 |
| **Hero Content** | Trust text | Tailwind `text-sm` | Inter 400 |
| **Hero Content** | Avatar group text | Tailwind `text-sm` | Inter 400 |
| **Text Block** | All body text | Settings `fontFamily` inline | Inter 400, 16px |
| **Process Steps** | Step description | Tailwind responsive | Inter 400 |
| **Stats Section** (default) | Label text | Tailwind `text-sm` | Inter 500 |
| **Stats Section** (card-grid) | Label text | Inline style | Inter 500 |
| **Pricing Table** | Feature list | Component-driven | Inter 400 |
| **FAQ Accordion** | Answer text | Settings-driven | Inter 400 |
| **Testimonials** | Quote text | Component-driven | Inter 400 |
| **Lead Form** | Form labels/inputs | shadcn/ui defaults | Inter 400 |
| **Blog Widgets** | Post excerpt | Settings-driven | Inter 400 |

### Category: ACCENT FONT (Decorative — Georgia in reference)

| Widget | Element | Current Font Source | Reference |
|--------|---------|-------------------|-----------|
| (none currently) | Info icon "i" | Hardcoded in reference only | Georgia serif italic |

> The accent font is very minor (only one decorative element). Adding it as a 3rd CSS variable (`--font-accent`) makes the system future-proof for serif/decorative elements.

---

## Implementation Plan

### Step 1: Extend ThemeFontConfig Type

**File:** `src/lib/theme/theme-types.ts`

```typescript
export interface ThemeFontConfig {
  headingFont: string;    // Display/brand font (Outfit)
  bodyFont: string;       // Body/readable font (Inter)
  accentFont?: string;    // Decorative/serif font (Georgia) — optional
}

export const DEFAULT_FONT_CONFIG: ThemeFontConfig = {
  headingFont: "Outfit",   // Changed from "Inter"
  bodyFont: "Inter",
  accentFont: "Georgia",
};
```

### Step 2: Add `--font-accent` CSS Variable

**File:** `src/app/globals.css`

```css
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Outfit", ui-sans-serif, system-ui, sans-serif;
  --font-accent: "Georgia", serif;
}
```

### Step 3: Update ThemeColorProvider

**File:** `src/lib/theme/color-provider.tsx`

Update `generateFontCSS()`:
```typescript
function generateFontCSS(fontConfig: ThemeFontConfig): string {
  const bodyFallback = "ui-sans-serif, system-ui, sans-serif";
  const headingFallback = "ui-sans-serif, system-ui, sans-serif";
  const accentFallback = "serif";

  let css = `:root {\n`;
  css += `  --font-sans: "${fontConfig.bodyFont}", ${bodyFallback};\n`;
  css += `  --font-heading: "${fontConfig.headingFont}", ${headingFallback};\n`;
  if (fontConfig.accentFont) {
    css += `  --font-accent: "${fontConfig.accentFont}", ${accentFallback};\n`;
  }
  css += `}`;
  return css;
}
```

Update `getGoogleFontsUrl()`:
```typescript
function getGoogleFontsUrl(fontConfig: ThemeFontConfig): string {
  const families = new Set([fontConfig.bodyFont, fontConfig.headingFont]);
  // Only add accent font if it's a Google Font (not system font like Georgia)
  if (fontConfig.accentFont && !SYSTEM_FONTS.includes(fontConfig.accentFont)) {
    families.add(fontConfig.accentFont);
  }
  // ...rest same
}

const SYSTEM_FONTS = ["Georgia", "Times New Roman", "Courier New", "Arial", "Verdana"];
```

### Step 4: Update Customize Page — Fonts Tab

**File:** `src/app/admin/appearance/themes/customize/page.tsx`

Add a 3rd font selector for "Accent / Decorative Font" with description:
- "Used for decorative serif elements (e.g., info icons, pull quotes)."
- Include system serif fonts in the dropdown: Georgia, Times New Roman, Playfair Display, Merriweather

### Step 5: Update data.json — Default Font Config

**File:** `public/themes/legal/data.json`

Add `fontConfig` to the theme data:
```json
{
  "fontConfig": {
    "headingFont": "Outfit",
    "bodyFont": "Inter",
    "accentFont": "Georgia"
  }
}
```

### Step 6: Ensure Widgets Use CSS Variables (NOT Hardcoded Fonts)

Most widgets already inherit from CSS. The key changes needed:

#### 6a. Heading Widget — Use `--font-heading` as default
**File:** `src/components/page-builder/widgets/content/heading-widget.tsx`

In `getTypographyStyles()`, when `fontFamily` is empty/undefined, it should NOT set fontFamily (letting the CSS `h1-h6 { font-family: var(--font-heading) }` rule apply). This already works correctly today.

#### 6b. Text Block Widget — Uses `--font-sans` via body inheritance
**File:** `src/components/page-builder/widgets/content/text-block-widget.tsx`

When `fontFamily` is undefined, it inherits from body which uses `--font-sans`. Already works correctly.

#### 6c. Stats Section (card-grid) — Default `valueFontFamily` to `var(--font-heading)`
**File:** `src/lib/page-builder/defaults.ts`

Change:
```typescript
// Before
valueFontFamily: "Outfit",

// After
valueFontFamily: undefined,  // inherits --font-heading from CSS
```

**File:** `src/components/page-builder/widgets/social-proof/stats-section.tsx`

In `CardGridValue`, change the fontFamily fallback:
```typescript
// Before
fontFamily: cg.valueFontFamily || "inherit",

// After
fontFamily: cg.valueFontFamily || "var(--font-heading)",
```

#### 6d. Hero Content — Add `font-family: var(--font-heading)` for headline
**File:** `src/components/page-builder/widgets/content/hero-content.tsx`

The hero headline is rendered as an `<h1>` tag, so it already picks up `var(--font-heading)` from the `h1-h6` CSS rule. No change needed.

For badge, buttons, and other elements that are NOT headings but should use the display font, add inline `fontFamily: 'var(--font-heading)'` or a CSS class.

### Step 7: Add Global CSS Classes for Font Categories

**File:** `src/app/globals.css`

```css
@layer base {
  /* Elements that should use the display/heading font */
  .font-display {
    font-family: var(--font-heading);
  }

  /* Elements that should use the accent/decorative font */
  .font-accent {
    font-family: var(--font-accent);
  }
}
```

This lets widgets use `className="font-display"` instead of hardcoding font-family.

---

## Widget Changes Summary

| Widget | What to Change | Difficulty |
|--------|---------------|------------|
| **Hero Content** | Badge, buttons: add `font-display` class | Easy |
| **Heading Widget** | Already works via `h1-h6` CSS rule | None |
| **Text Block** | Already inherits `--font-sans` | None |
| **Stats Section** (default) | Value: add `font-display` class | Easy |
| **Stats Section** (card-grid) | Change fallback to `var(--font-heading)` | Easy |
| **Process Steps** | Section heading uses h2 (already works). Badge/step number: add `font-display` | Easy |
| **Ticker Marquee** | Add `font-display` class to items | Easy |
| **Pricing Table** | Plan name, price: add `font-display` where not using h-tags | Medium |
| **Testimonials** | Quote mark, author name: add `font-display` | Medium |
| **FAQ Accordion** | Section title uses h-tag (works). Answer inherits body | None |
| **Trust Badges** | Body font — already inherits | None |
| **Button Group** | Buttons: add `font-display` class | Easy |
| **Service Card** | Name (h3 works), price: add `font-display` | Easy |
| **Blog Widgets** | Title (h-tag works), excerpt inherits body | None |
| **Lead Form** | Uses shadcn/ui — inherits body | None |
| **Custom HTML** | User controls everything | None |
| **Image/Slider** | Minimal text — inherits body | None |
| **Divider** | No text | None |

---

## Theme Importer Update

**File:** `src/lib/theme/theme-importer.ts`

When importing a theme, the `fontConfig` from `data.json` should be saved to `ActiveTheme.fontConfig`. Currently this already works for `headingFont` and `bodyFont`. The importer just needs to pass through `accentFont` as well — no special handling needed since it's part of `fontConfig` JSON blob.

---

## Reference: v3-forge.html Font Usage Map

### Outfit (Primary Display) — 40+ occurrences
```
- body headings: all h2 elements → Outfit 800
- hero title: clamp(44px,6vw,76px) → Outfit 900
- hero card titles: 14px uppercase → Outfit 700
- step numbers: 12px → Outfit 800
- stat numbers: 48px → Outfit 900
- section headings: clamp(30-46px) → Outfit 800
- service names: 18px → Outfit 700
- service prices: 14px → Outfit 700
- step card titles: 17px → Outfit 700
- why-us numbers: clamp(64-96px) → Outfit 900
- pricing plan names: 26px → Outfit 800
- pricing amounts: 52px → Outfit 900
- pricing badges/caps: 11px → Outfit 700
- testimonial names: 16px → Outfit 800
- testimonial quote mark: 56px → Outfit 900
- testimonial avatars: 16px → Outfit 900
- blog section watermark: 180px → Outfit 900
- blog titles: 17px → Outfit 800
- contact heading: Outfit 800
- footer wordmark: 32px → Outfit 900
- footer section headers: 12px uppercase → Outfit 700
- logo: 21px → Outfit 800
```

### Inter (Secondary Body) — Default everywhere else
```
- body text: default font-family
- paragraphs, descriptions, feature lists
- tooltip text: 11.5px, Inter 400
- button text: inherits from body (font-family: inherit)
```

### Georgia (Accent Decorative) — 1 occurrence
```
- .info-icon "i": 9px italic serif
```

---

## Verification Checklist

After implementation:

1. [ ] Change heading font to "Playfair Display" in customize page
2. [ ] Verify ALL headings (hero title, section h2s, card h3s) switch font
3. [ ] Verify stat numbers in card-grid switch font
4. [ ] Verify pricing amounts switch font
5. [ ] Verify blog post titles switch font
6. [ ] Verify body text (paragraphs, descriptions) still uses body font
7. [ ] Verify FAQ answers use body font
8. [ ] Change body font to "Poppins" — verify body text changes
9. [ ] Verify heading text does NOT change when body font changes
10. [ ] Reset fonts to default — verify Outfit headings + Inter body
11. [ ] Check Google Fonts `<link>` loads correct families with all weights
12. [ ] Verify no FOUT (Flash of Unstyled Text) — `display=swap` in link
