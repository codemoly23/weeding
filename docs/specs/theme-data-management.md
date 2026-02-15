# Theme & Data Management System

> **Status:** Implemented
> **Priority:** Before CodeCanyon submission

## Overview

4-layer theme system with full demo content, data export/import, factory reset, and dynamic color palette for the CMS.

---

## Architecture: 4-Layer Theme System

```
Layer 1: Widget Defaults (code-level)  [EXISTING]
   → Every widget has defaultSettings in defaults.ts
   → Theme-independent - always same generic placeholder
   → Applied when user adds a new widget to page builder

Layer 2: Theme Widget Presets (theme data.json → widgetPresets)
   → Per-widget demo content overrides per theme
   → "Legal" theme hero widget → LLC-specific hero content
   → Applied when user adds NEW widget while theme is active

Layer 3: Full Site Import (theme activation)
   → One-click imports: services, pages, blogs, FAQs, testimonials,
     settings, header, footer, menu, legal pages, form templates
   → Replaces all content (preserves users, orders, leads)

Layer 4: Theme Color Palette (CSS variables)
   → Stored in data.json under "colorPalette" key
   → Saved to ActiveTheme.colorPalette on activation
   → ThemeColorProvider injects into :root via <style> tag
   → Controls: buttons, sections, links, cards, header/footer
   → Widget-specific colors override when explicitly set
```

---

## 1. Theme Package Structure

Each theme is a folder in `/public/themes/`:

```
public/themes/
├── legal/
│   ├── meta.json        ← Theme metadata
│   ├── data.json        ← Full site content + colors + widget presets
│   └── thumbnail.jpg    ← Preview image (optional)
│
├── cleaning-service/    ← Future theme
├── digital-agency/      ← Future theme
└── consulting/          ← Future theme
```

### meta.json

```json
{
  "name": "Legal & Business Services",
  "version": "1.0",
  "description": "Complete LLC formation & business services website...",
  "category": "legal-business",
  "thumbnail": "thumbnail.jpg",
  "serviceCount": 24,
  "author": "LLCPad"
}
```

### data.json Structure

```json
{
  "version": "1.0",
  "exportedAt": "2026-02-15T00:00:00Z",

  "colorPalette": {
    "light": {
      "background": "#ffffff",
      "foreground": "#0f172a",
      "primary": "#F97316",
      "primary-foreground": "#ffffff",
      "secondary": "#0A0F1E",
      "muted": "#F1F5F9",
      "accent": "#F97316",
      "destructive": "#EF4444",
      "border": "#E2E8F0",
      "ring": "#F97316"
    },
    "dark": { "..." }
  },

  "widgetPresets": {
    "hero-content": { "headline": { "text": "Start Your US LLC..." } },
    "services-grid": { "heading": "Our Services" }
  },

  "settings": { "site_name": "LLCPad", "..." },
  "serviceCategories": [],
  "services": [],
  "pages": [],
  "blogCategories": [],
  "blogs": [],
  "faqs": [],
  "testimonials": [],
  "legalPages": [],
  "headerConfig": {},
  "menuItems": [],
  "footerConfig": {},
  "footerWidgets": [],
  "formTemplates": [],
  "locationFees": []
}
```

---

## 2. Color System

Colors follow shadcn/ui's CSS variable pattern. Theme activation overrides Tailwind v4 `@theme` variables via inline `<style>` tag.

### How It Works

1. `globals.css` defines default colors via `@theme { --color-primary: #F97316; ... }`
2. `ThemeColorProvider` (server component in root layout) reads `ActiveTheme.colorPalette`
3. If active theme exists, generates `<style>:root { --color-primary: #...; }</style>`
4. CSS specificity: inline style > @theme defaults → colors change globally
5. All shadcn/ui components (`bg-primary`, `text-muted-foreground`, etc.) auto-update

### Color Variables

| Variable | Purpose |
|----------|---------|
| `--color-primary` | Buttons, links, focus rings, accents |
| `--color-secondary` | Secondary buttons, dark sections |
| `--color-muted` | Subtle backgrounds, disabled states |
| `--color-accent` | Highlighted elements |
| `--color-destructive` | Error states, delete buttons |
| `--color-background` | Page background |
| `--color-foreground` | Primary text |
| `--color-border` | Borders, dividers |
| `--color-card` | Card backgrounds |

---

## 3. Admin UI

### Theme Gallery (`/admin/appearance/themes`)

- Grid of available themes with thumbnail, name, description, service count
- "Active" badge on currently active theme
- "Activate" button with dialog offering:
  - **"Activate with Demo Content"** → Full Layer 3 import
  - **"Apply Colors Only"** → Only Layer 4 color palette
- Warning about content replacement
- Progress indicator during import

### Data Management (`/admin/settings/data`)

Three sections:

1. **Export Data** → Downloads `llcpad-export-{date}.json`
2. **Import Data** → File upload, validation preview, typed "CONFIRM" confirmation
3. **Reset Data** → Danger zone, typed "RESET" confirmation, factory reset

---

## 4. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/themes` | List available themes |
| POST | `/api/admin/themes/import` | Activate theme (full or colors-only) |
| POST | `/api/admin/data/export` | Export all data as JSON download |
| POST | `/api/admin/data/import` | Import data from uploaded JSON |
| PUT | `/api/admin/data/import` | Validate data without importing |
| POST | `/api/admin/data/reset` | Factory reset all content |

---

## 5. Database

### ActiveTheme Model

```prisma
model ActiveTheme {
  id           String   @id @default(cuid())
  themeId      String   @unique
  themeName    String
  activatedAt  DateTime @default(now())
  colorPalette Json?
}
```

---

## 6. Data Safety Rules

**NEVER deleted during import/reset:**
- User, Account, Session (auth)
- Order, OrderItem, OrderNote (financial)
- Invoice (financial)
- Lead, LeadActivity, LeadNote (sales)
- ActivityLog (audit)
- RolePermission (RBAC)
- Location (system lists)
- SystemList items (countries, states, currencies)
- CannedResponse (support)
- Plugin, PluginSetting (plugins)

**Always deleted and recreated:**
- Service, Package, ServiceFeature, PackageFeatureMap, ServiceFAQ
- ServiceCategory
- ServiceFormTemplate, FormTab, FormField
- LandingPage, LandingPageBlock
- BlogPost, BlogCategory
- FAQ (global)
- Testimonial
- LegalPage
- LocationFee
- Setting (all)
- HeaderConfig, MenuItem
- FooterConfig, FooterWidget
- ActiveTheme

---

## 7. Available Themes

| # | Theme | Services | Category | Status |
|---|-------|----------|----------|--------|
| 1 | **Legal & Business Services** | 24 | legal-business | Implemented |
| 2 | Cleaning Service | - | home-services | Planned |
| 3 | Digital Agency | - | marketing | Planned |
| 4 | Restaurant/Catering | - | food-beverage | Planned |
| 5 | Consulting | - | professional | Planned |

---

## 8. Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | ActiveTheme model |
| `src/lib/theme/theme-types.ts` | All TypeScript interfaces |
| `src/lib/theme/theme-exporter.ts` | Export logic |
| `src/lib/theme/theme-importer.ts` | Import logic (Prisma transaction) |
| `src/lib/theme/theme-reset.ts` | Factory reset logic |
| `src/lib/theme/color-provider.tsx` | CSS variable injection |
| `src/app/api/admin/themes/route.ts` | GET themes list |
| `src/app/api/admin/themes/import/route.ts` | POST activate theme |
| `src/app/api/admin/data/export/route.ts` | POST export data |
| `src/app/api/admin/data/import/route.ts` | POST/PUT import data |
| `src/app/api/admin/data/reset/route.ts` | POST reset data |
| `src/app/admin/appearance/themes/page.tsx` | Theme Gallery UI |
| `src/app/admin/settings/data/page.tsx` | Data Management UI |
| `public/themes/legal/meta.json` | Legal theme metadata |
| `public/themes/legal/data.json` | Legal theme full data |
| `scripts/export-legal-theme.ts` | Script to rebuild data.json from DB |
