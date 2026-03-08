# Service Detail Page Enhancement — Implementation Plan

## Context

The SERVICE_DETAILS template (`/admin/appearance/pages/service`) renders dynamic service detail pages for all services. Reference design: `docs/home/1_home/service-llc-formation.html`. Current system has a widget-based page builder with service-hero, service-features, service-pricing, service-faq, and related-services widgets.

This plan:
1. Extracts the "What's Included" card from service-hero into a **new standalone `service-checklist-card` widget** (reusable anywhere)
2. Simplifies service-hero to be content-only (title, description, price, buttons, trust)
3. Replaces duplicated button code with the shared `ButtonCustomStyle` system
4. Enhances the Features tab with drag-and-drop + tag/badge + icon per feature
5. Removes the duplicate "Service Features" card from Basic Info tab
6. Renames "Features" tab to "Comparison Table"
7. Adds a new `"detailed-cards"` variant to `service-features` widget (reference "What's Included" section with icon + description + tag per card)

**User decisions:** Use page builder template approach (not raw HTML in rich text editor). All enhancements must be universal for any service provider (CodeCanyon CMS — not just LLC/legal). Project is under development — no backward compatibility / data migration needed. Old data can be freely deleted.

**shortDesc & description decisions:**
- `shortDesc`: Stays inside the service-hero widget. Auto-reads from service data via `{{service.shortDesc}}` placeholder. No separate widget needed — it's a single line shown below the title in the hero.
- `description` (long): Remains optional. Rendered by the existing `service-description` widget when admin adds it to the page template. No code changes needed — current system handles it fine. Admin can choose whether to include the description section per service.

**Theme binding:** All changes must integrate with the "Legal & Business Services" theme (`public/themes/legal/data.json`). When admin activates this theme, all widgets, service data (features with tags/icons), page templates (SERVICE_DETAILS with correct section layouts), and widget settings auto-load via `theme-importer.ts`. No manual configuration should be needed after theme activation.

**Reference design:** Hero section with two-column layout — left side has title, description, price, CTAs, trust items. Right side has dark green "What You Get" card with checklist items (tags like "Included", "Free ($79 value)") and stats row at bottom.

**New page builder layout (replaces old single-widget approach):**
```
Section ("2-1" layout = 66%/33%, verticalAlign: "center" on both columns)
  ├── Left Column
  │    └── service-hero widget (title, desc, price, buttons, trust ONLY)
  │
  └── Right Column
       └── NEW service-checklist-card widget (dark card + features + stats)
```

This replaces the old approach where service-hero was a single widget with an internal 2-column grid (`gridTemplateColumns: "1fr 420px"`). Now the page builder's section column system handles the layout, making both widgets independently reusable.

---

## Architectural Guidelines (from newsletter.md & theme.md)

> These rules apply to every change in this plan. Follow them strictly.

### Implementation Rules

| Rule | Description |
|------|-------------|
| **Full-Stack Implementation** | শুধু UI বানালে হবে না। Database + Backend API + Frontend সব একসাথে করতে হবে |
| **API Routes Only (No Server Actions)** | Data mutations সব `/api/*` route handlers দিয়ে হবে। Server Actions ব্যবহার করা যাবে না |
| **Role-Based Access** | প্রতিটি admin API route এ `checkAdminOnly()` বা `checkAdminAccess()` check থাকতে হবে |
| **Zod Validation** | প্রতিটি POST/PUT API route এ Zod schema দিয়ে input validate করতে হবে |
| **Consistent API Response** | Format: `{ success: boolean, data?: T, error?: string, details?: string }` |
| **Test After Each Phase** | প্রতিটি phase শেষ করার পর manually test করতে হবে + `npm run build` pass করতে হবে |

### Per-Feature Implementation Order

```
1️⃣ Database Schema Changes (prisma/schema.prisma)
   └─► 2️⃣ Run Migration (npx prisma migrate dev / db push)
       └─► 3️⃣ API Routes with Zod Validation
           └─► 4️⃣ Frontend Pages (admin UI)
               └─► 5️⃣ Widget Registry + Rendering
                   └─► 6️⃣ Testing (all roles, edge cases, build check)
```

### Existing Patterns to Follow

| Pattern | Where to find reference |
|---------|----------------------|
| Admin auth check | `import { checkAdminOnly } from "@/lib/admin-auth"` |
| Shared button type | `ButtonCustomStyle` from `@/lib/header-footer/types` |
| Shared button renderer | `StyledButton` from `@/components/ui/styled-button` |
| Button style editor | `ButtonStyleEditor` from `@/components/admin/button-style-editor` |
| Button utilities | `@/lib/button-utils`, `@/lib/button-presets`, `@/lib/button-constants` |
| Hero content buttons | `HeroContentWidgetSettings.primaryButton` in `@/lib/page-builder/types` |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` — already used in page builder, footer builder, form builder |
| Service context | `useOptionalServiceContext()` from `@/lib/page-builder/contexts/service-context` |
| Widget registration | `src/lib/page-builder/widget-registry.ts` — register new widget type + component + settings |
| Widget settings panel | `src/components/page-builder/settings/` — reference any existing settings component |
| Template variables | `resolvePlaceholders()` from service-context — supports `{{service.slug}}`, `{{service.startingPrice}}` etc. |
| Section column system | `src/lib/page-builder/section-layouts.ts` — "2-1" = `grid-cols-1 lg:grid-cols-3` with `col-span-2`/`col-span-1` |

---

## Plan Summary (6 Phases)

| Phase | What | Files Affected |
|-------|------|----------------|
| **Phase A** | New `service-checklist-card` widget (standalone, reusable) | NEW widget file, NEW settings file, types.ts, widget-registry.ts |
| **Phase B** | Service Hero Widget simplification + button reuse | types.ts, service-hero.tsx, service-hero-settings.tsx |
| **Phase C** | Database migration (tag, tagType, icon on ServiceFeature) + Features tab enhancement (drag-drop, tags, icon picker) + remove Basic Info features card | schema.prisma, API routes, service admin page.tsx |
| **Phase D** | Tab rename "Features" → "Comparison Table" + drag-drop in comparison tab | service admin page.tsx |
| **Phase E** | New `"detailed-cards"` variant for `service-features` widget (reference "What's Included" section) | service-features.tsx, service-features-settings, types.ts |
| **Phase F** | Theme data update — add new fields to `data.json` + update theme-importer for tag/tagType/icon + update SERVICE_DETAILS template layout | data.json, theme-importer.ts, theme-types.ts |

---

## Phase A: New `service-checklist-card` Widget

### A1. Widget Overview

Extract the right-side dark green card from service-hero into a new standalone widget.

**Widget metadata:**
```typescript
{
  type: "service-checklist-card",
  name: "Service Checklist Card",
  category: "Service",           // Appears under "Service" in widget browser
  description: "Dark card with feature checklist and stats — used in service hero sections",
  icon: "CheckSquare",           // Lucide icon for widget browser
}
```

**Why standalone widget:**
- Reusable anywhere in the page builder (hero section, sidebar, pricing section, any page)
- Admin can use it with a "2-1" section layout paired with service-hero, or independently
- Cleaner separation of concerns — hero handles content, this handles feature highlights
- Section column system handles responsive stacking automatically

### A2. Widget Settings Interface

**New type in `src/lib/page-builder/types.ts`:**

```typescript
export interface ServiceChecklistCardWidgetSettings {
  // Card Header
  cardTitle: string;                     // Default: "What You Get"

  // Item Source
  autoItems: boolean;                    // true = auto-populate from service.features
  manualItems?: Array<{                  // Used when autoItems = false
    text: string;
    tag: string;                         // e.g. "Included", "Free ($79 value)"
    tagType: "included" | "free" | "addon" | "premium" | "custom";
  }>;

  // Scroll & Limit
  scrollable: boolean;                   // Enable vertical scroll in checklist area
  maxHeight: number;                     // Max height (px) when scroll enabled, default 320
  itemLimit: number;                     // Items to show when scroll disabled, default 5

  // Stats Row (bottom of card)
  showStats: boolean;                    // Show stats row at bottom
  stats: Array<{                         // e.g. [{ value: "1,200+", label: "Clients Served" }]
    value: string;
    label: string;
  }>;

  // Card Style
  backgroundColor: string;              // Default: "#1b3a2d" (forest green)
  accentColor: string;                   // Default: "#e84c1e" (coral — top border gradient)
  borderRadius: number;                  // Default: 20
  shadow: string;                        // Default: "0 24px 64px rgba(27,58,45,0.22)"

  // Container Style
  container?: WidgetContainerStyle;
}
```

### A3. Default Settings

```typescript
const DEFAULT_SETTINGS: ServiceChecklistCardWidgetSettings = {
  // Card Header
  cardTitle: "What You Get",

  // Item Source
  autoItems: true,
  manualItems: [],

  // Scroll & Limit
  scrollable: false,
  maxHeight: 320,
  itemLimit: 5,

  // Stats Row
  showStats: true,
  stats: [
    { value: "1,200+", label: "Clients Served" },
    { value: "30+", label: "Countries" },
    { value: "4.9★", label: "Rating" },
  ],

  // Card Style
  backgroundColor: "#1b3a2d",
  accentColor: "#e84c1e",
  borderRadius: 20,
  shadow: "0 24px 64px rgba(27,58,45,0.22)",
};
```

### A4. Checklist Data Logic

```typescript
// Inside the widget component:
const service = useOptionalServiceContext();

// Determine checklist items
const allItems = settings.autoItems
  ? (service?.features || []).map((f) => ({
      text: typeof f === "string" ? f : f.text || String(f),
      tag: f.tag || "Included",
      tagType: (f.tagType || "included") as "included" | "free" | "addon" | "premium" | "custom",
    }))
  : (settings.manualItems || []);

// Apply scroll/limit logic
const displayItems = settings.scrollable
  ? allItems                                         // Show ALL when scrollable
  : allItems.slice(0, settings.itemLimit || 5);      // Limit when not scrollable
```

### A5. Widget Rendering (Visual Output)

The widget renders the dark card from the reference HTML. Structure:

```
┌─────────────────────────────────────────────────┐
│ ══ coral accent line at top ══════════════════   │  ← accentColor top border
│                                                  │
│  ✓ WHAT YOU GET                                  │  ← cardTitle (uppercase, muted)
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ ✅  Articles of Organization    Included  │   │  ← checklist item + tag
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ ✅  Operating Agreement    Free ($79 val) │   │  ← tag reads from DB
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ ✅  State Filing & Processing   Included  │   │
│  └──────────────────────────────────────────┘   │
│  ... (scrollable or limited)                     │
│                                                  │
│  ─────────── divider ────────────                │
│  1,200+        30+          4.9★                 │  ← stats row
│  Clients    Countries      Rating                │
└─────────────────────────────────────────────────┘
```

When `scrollable = true`, the checklist area gets:
```css
overflow-y: auto;
max-height: {maxHeight}px;
/* Custom scrollbar styling matching the dark card theme */
```

### A6. Admin Settings Panel

Settings organized in collapsible sections:

**Content section:**
| Setting | UI Component | Condition |
|---------|-------------|-----------|
| Card Title | Text input | Always |
| Item Source | Radio: "Auto from Service Features" / "Manual Items" | Always |
| Manual Items | Sortable list with text + tag fields | Only when autoItems = false |

**Display section:**
| Setting | UI Component | Condition |
|---------|-------------|-----------|
| Enable Scroll | Switch toggle | Always |
| Max Height (px) | Number input with slider (200–600, step 20) | Only when scrollable = true |
| Items to Show | Number input (1–10) | Only when scrollable = false |

**Stats section:**
| Setting | UI Component | Condition |
|---------|-------------|-----------|
| Show Stats Row | Switch toggle | Always |
| Stats Items | Repeatable fields: value + label | Only when showStats = true |

**Style section:**
| Setting | UI Component | Condition |
|---------|-------------|-----------|
| Background Color | Color picker | Always |
| Accent Color | Color picker | Always |
| Border Radius | Slider (0–40) | Always |
| Shadow | Preset dropdown or text input | Always |

### A7. Corner Cases

| Scenario | Handling |
|----------|----------|
| `autoItems = true` but service has 0 features | Preview mode: show placeholder "Features will appear here from service data". Live: hide entire widget |
| `itemLimit` > total features | Show all available features (no error, no empty slots) |
| `scrollable = true` but few items (shorter than maxHeight) | Show all without scrollbar — no visual issue |
| Widget used outside service context (no ServiceProvider) | If `autoItems = true`, show placeholder. If manual items, render normally |
| `tagType = "custom"` but empty tag text | Show no tag badge |
| Feature has `tag` but no `tagType` | Default tagType to "custom", display as gray badge |
| 50+ features with scroll enabled | `maxHeight` prevents card from growing infinitely |
| Stats row with 0 stats | Hide the stats row + divider entirely |

### A8. Files for Phase A

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/page-builder/types.ts` | MODIFY | Add `ServiceChecklistCardWidgetSettings` interface |
| `src/components/page-builder/widgets/service/service-checklist-card.tsx` | NEW | Widget component rendering |
| `src/components/page-builder/settings/service-checklist-card-settings.tsx` | NEW | Admin settings panel |
| `src/lib/page-builder/widget-registry.ts` | MODIFY | Register new widget type, component, and settings |

### A9. Widget Registration

In `widget-registry.ts`, add:

```typescript
{
  type: "service-checklist-card",
  name: "Service Checklist Card",
  category: "Service",
  description: "Dark card with feature checklist and stats",
  icon: "CheckSquare",
  defaultSettings: DEFAULT_SERVICE_CHECKLIST_CARD_SETTINGS,
  component: lazy(() => import("@/components/page-builder/widgets/service/service-checklist-card")),
  settingsComponent: lazy(() => import("@/components/page-builder/settings/service-checklist-card-settings")),
}
```

---

## Phase B: Service Hero Widget Simplification + Button Reuse

### B1. Remove Right Card Code from Service Hero

**Fields to REMOVE from `ServiceHeroWidgetSettings`:**

```typescript
// DELETE these from the interface:
rightCardShow: boolean;
rightCardTitle: string;
rightCardAutoItems: boolean;
rightCardItems?: Array<{ text: string; tag: string; tagType: "included" | "free" | "addon" }>;
rightCardStats?: Array<{ value: string; label: string }>;
```

**Code to REMOVE from `service-hero.tsx`:**
- The entire `layout: "two-column"` rendering branch (internal `gridTemplateColumns: "1fr 420px"` grid)
- The right card JSX (dark green card with checklist, stats)
- The `checklist` computation logic (moved to the new widget)
- The `stats` variable usage for right card

**Result:** service-hero becomes a single-column content widget only. The `layout` field becomes unnecessary — remove it or keep as `"single"` only.

### B2. Button System — Replace Custom Buttons with Shared System

**Fields to REMOVE from `ServiceHeroWidgetSettings`:**

```typescript
// DELETE these:
primaryCtaText: string;
primaryCtaLink: string;
showPriceInButton: boolean;
showSecondaryButton: boolean;
secondaryCtaText: string;
secondaryCtaLink: string;
```

**Fields to ADD (matching hero-content widget pattern):**

```typescript
// ADD these to ServiceHeroWidgetSettings:
primaryButton: {
  show: boolean;
  text: string;              // Supports {{service.startingPrice}}, {{service.slug}}
  link: string;              // Supports {{service.slug}} e.g. "/checkout/{{service.slug}}"
  badge?: string;            // Optional badge text e.g. "From $199"
  style?: ButtonCustomStyle; // Full style system: presets, colors, hover effects
  openInNewTab?: boolean;
};

secondaryButton: {
  show: boolean;
  text: string;
  link: string;
  badge?: string;
  style?: ButtonCustomStyle;
  openInNewTab?: boolean;
};
```

**Default values:**

```typescript
primaryButton: {
  show: true,
  text: "Get Started — ${{service.startingPrice}} + State Fee",
  link: "/checkout/{{service.slug}}",
  badge: undefined,
  style: undefined,     // Will use theme default
  openInNewTab: false,
},
secondaryButton: {
  show: true,
  text: "Book Free Consultation",
  link: "/contact",
  badge: undefined,
  style: undefined,
  openInNewTab: false,
},
```

### B3. Button Rendering Change

```tsx
// BEFORE (custom inline rendering):
<Link href={resolvedPrimaryLink} className="...hardcoded classes...">
  {resolvedPrimaryText} <ArrowRight />
</Link>

// AFTER (shared system):
{settings.primaryButton.show && (
  <StyledButton
    style={settings.primaryButton.style}
    as="link"
    href={resolvePlaceholders(settings.primaryButton.link, service)}
    openInNewTab={settings.primaryButton.openInNewTab}
    size="lg"
  >
    {resolvePlaceholders(settings.primaryButton.text, service)}
  </StyledButton>
)}

{settings.secondaryButton.show && (
  <StyledButton
    style={settings.secondaryButton.style}
    as="link"
    href={resolvePlaceholders(settings.secondaryButton.link, service)}
    openInNewTab={settings.secondaryButton.openInNewTab}
    size="lg"
  >
    {resolvePlaceholders(settings.secondaryButton.text, service)}
  </StyledButton>
)}
```

**Template variable support:**
Button `text` and `link` fields pass through `resolvePlaceholders()` before rendering. Already works in current system — just ensure new structure also calls it.

Available template variables:
- `{{service.slug}}` → service slug
- `{{service.name}}` → service name
- `{{service.startingPrice}}` → lowest package price
- `{{service.shortDesc}}` → short description

### B4. Admin Settings Panel Change

Replace the current simple text inputs in service-hero-settings with `ButtonStyleEditor`:

```tsx
// BEFORE (in service-hero-settings.tsx):
<Input label="Button Text" value={settings.primaryCtaText} ... />
<Input label="Button Link" value={settings.primaryCtaLink} ... />
<Switch label="Show Price in Button" ... />

// AFTER:
// Reuse the exact same button settings UI pattern from hero-content-settings.tsx
// This gives: text, link, badge, show toggle, style presets (Ocean, Sunset, etc.),
// colors, border, hover effects — all 15+ effect types
<ButtonStyleEditor
  style={settings.primaryButton.style}
  onChange={(style) => updateSetting("primaryButton", { ...settings.primaryButton, style })}
  buttonText={settings.primaryButton.text}
  showPreview={true}
  showPresets={true}
/>
```

**Key components to reuse (not recreate):**

| Component | From | Purpose |
|-----------|------|---------|
| `StyledButton` | `@/components/ui/styled-button` | Renders button with all 15+ hover effects |
| `ButtonStyleEditor` | `@/components/admin/button-style-editor` | Admin UI for editing button styles + presets |
| `ButtonCustomStyle` | `@/lib/header-footer/types` | TypeScript interface for button styling |
| `BUTTON_STYLE_PRESETS` | `@/lib/button-presets` | 15+ presets (Ocean, Sunset, Neon, Emerald, Midnight, Coral, Arctic, Red, etc.) |
| `hasCustomStyle()` | `@/lib/button-utils` | Check if custom styling applied |
| `CraftButton` | `@/components/ui/styled-button` | Special effect component for craft-expand |
| `PrimaryFlowButton` | `@/components/ui/styled-button` | Special effect component for flow-border |
| `NeuralButton` | `@/components/ui/styled-button` | Special effect component for neural |

### B5. Simplified ServiceHeroWidgetSettings (Final Shape)

After removing right card + old buttons, the interface becomes:

```typescript
export interface ServiceHeroWidgetSettings {
  // Content Source
  titleSource: "auto" | "custom";
  customTitle?: string;
  subtitleSource: "auto" | "custom";
  customSubtitle?: string;

  // Category Badge (shown above title)
  showCategoryBadge: boolean;
  categoryBadgeText?: string;
  categoryBadgeTag?: string;         // e.g. "Most Popular", "New"

  // Title Visual Effects
  titleHighlightWord?: string;       // word to color in primary/forest
  titleUnderlineWord?: string;       // word to show with coral underline

  // Price Badge
  showPriceBadge: boolean;
  priceBadgeText: string;            // Supports {{service.startingPrice}}

  // Price Hero (prominent display)
  showPriceHero: boolean;
  priceHeroNote?: string;            // e.g. "Essential plan — was $250"

  // Primary Button (SHARED SYSTEM)
  primaryButton: {
    show: boolean;
    text: string;
    link: string;
    badge?: string;
    style?: ButtonCustomStyle;
    openInNewTab?: boolean;
  };

  // Secondary Button (SHARED SYSTEM)
  secondaryButton: {
    show: boolean;
    text: string;
    link: string;
    badge?: string;
    style?: ButtonCustomStyle;
    openInNewTab?: boolean;
  };

  // Trust Items (shown below CTAs)
  showTrustItems: boolean;
  trustItems?: Array<{ text: string }>;

  // Appearance
  backgroundType: "none" | "solid" | "gradient" | "image";
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  textAlignment: "left" | "center" | "right";
  titleSize: "default" | "large" | "xl";
  spacing: "sm" | "md" | "lg" | "xl";

  // Spacing (Advanced)
  marginTop?: number;
  marginBottom?: number;

  // Container Style
  container?: WidgetContainerStyle;
}
```

**Removed fields:** `layout`, `rightCardShow`, `rightCardTitle`, `rightCardAutoItems`, `rightCardItems`, `rightCardStats`, `primaryCtaText`, `primaryCtaLink`, `showPriceInButton`, `showSecondaryButton`, `secondaryCtaText`, `secondaryCtaLink`.

### B6. Files for Phase B

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/page-builder/types.ts` | MODIFY | Simplify `ServiceHeroWidgetSettings` — remove right card fields + old button fields, add shared button structure |
| `src/components/page-builder/widgets/service/service-hero.tsx` | MODIFY | Remove two-column layout code, remove right card rendering, replace button rendering with `StyledButton` |
| `src/components/page-builder/settings/service-hero-settings.tsx` | MODIFY | Remove right card settings, replace button settings with `ButtonStyleEditor` |

---

## Phase C: Database Migration + Features Tab Enhancement

### C1. Database Schema Change

**Add new fields to `ServiceFeature`:**

```prisma
model ServiceFeature {
  id              String              @id @default(cuid())
  text            String
  sortOrder       Int                 @default(0)
  serviceId       String
  createdAt       DateTime            @default(now())
  description     String?
  tooltip         String?
  tag             String?             // 🆕 "Included", "Free ($79 value)", "Add-on ($49)", custom text
  tagType         String?             // 🆕 "included" | "free" | "addon" | "premium" | "custom"
  icon            String?             // 🆕 Lucide icon name e.g. "FileText", "Shield", "CreditCard", "Building2"
  updatedAt       DateTime            @updatedAt
  packageMappings PackageFeatureMap[]
  service         Service             @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@index([serviceId])
}
```

**Why `String?` instead of enum for tagType:** CodeCanyon CMS — different service providers may want custom tag types. String is more flexible. Validation happens at the application layer via Zod.

**Why `icon` as `String?`:** Stores Lucide icon name (e.g., `"FileText"`, `"Shield"`, `"CreditCard"`, `"Building2"`). Rendered via dynamic Lucide icon lookup. Optional — if empty, widget shows a default check icon.

**Migration:**
```bash
npx prisma migrate dev --name add-feature-tag-icon-fields
```

### C2. Remove "Service Features" Card from Basic Info Tab

**Current state:** Basic Info tab has a "Service Features" card with simple `{ text: string }[]` items. This duplicates the Features tab's `ServiceFeature` DB model.

**Action:** Delete the entire "Service Features" `<Card>` block from the Basic Info tab (lines ~1012-1055 in service admin page.tsx).

Also remove the related state/handlers:
- `addFeature()` function
- `updateFeature()` function
- `removeFeature()` function
- The `features` array in the service save payload (for new services)

The Features tab (now the single source of truth) handles all feature CRUD via its own API routes.

### C3. Features Tab Enhancement — Drag-and-Drop

**Current problem:** `GripVertical` icon exists but drag-and-drop is not wired up.

**Implementation:** Use `@dnd-kit/core` + `@dnd-kit/sortable` (already in package.json).

Reference: `src/app/admin/appearance/pages/[slug]/page.tsx` (sections drag-drop) or `src/app/admin/appearance/footer/page.tsx` (footer widgets drag-drop).

```tsx
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Wrap feature list:
<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={masterFeatures.map(f => f.id)} strategy={verticalListSortingStrategy}>
    {masterFeatures.map((feature, index) => (
      <SortableFeatureRow key={feature.id} feature={feature} index={index} />
    ))}
  </SortableContext>
</DndContext>
```

**On drag end:** Reorder the features array, call the existing bulk sort API:
```
PUT /api/admin/services/[slug]/features
Body: { featureOrders: [{ id, sortOrder }] }
```
This API route already exists — no new route needed.

### C4. Features Tab Enhancement — Tag/Badge Per Feature

Add a tag dropdown per feature row (inline in the feature list or in the edit dialog).

**Tag presets:**

| Tag Preset | tagType | Default tag text | Color (frontend) |
|------------|---------|------------------|-------------------|
| No tag | `""` (empty) | — | No badge shown |
| Included | `included` | "Included" | Green (bg-emerald-500/15, text-emerald-400) |
| Free | `free` | "Free" | Amber (bg-amber-500/15, text-amber-400) |
| Add-on | `addon` | "Add-on" | Coral/orange (bg-orange-500/15, text-orange-400) |
| Premium | `premium` | "Premium" | Purple (bg-purple-500/15, text-purple-400) |
| Custom... | `custom` | "" (admin types) | Gray (bg-white/10, text muted) |

**UI for tag selection:**

```tsx
<Select value={feature.tagType || ""} onValueChange={(val) => updateFeatureTag(feature.id, val)}>
  <SelectTrigger className="w-[130px]">
    <SelectValue placeholder="No tag" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">No tag</SelectItem>
    <SelectItem value="included">Included</SelectItem>
    <SelectItem value="free">Free</SelectItem>
    <SelectItem value="addon">Add-on</SelectItem>
    <SelectItem value="premium">Premium</SelectItem>
    <SelectItem value="custom">Custom...</SelectItem>
  </SelectContent>
</Select>
```

**Tag text behavior:**
- `tagType = "included"` → auto-set `tag = "Included"` (admin can override, e.g. "All Plans")
- `tagType = "free"` → show input pre-filled with "Free" (admin can customize to "Free ($79 value)")
- `tagType = "addon"` → show input pre-filled with "Add-on" (admin can customize to "Add-on ($49)")
- `tagType = "premium"` → show input pre-filled with "Premium"
- `tagType = "custom"` → show empty text input for custom tag text
- `tagType = ""` (no tag) → no input, no badge displayed

### C5. Service Context Data Flow — Ensure tag/tagType Available

Verify that the service detail page's data fetching query includes tag fields:

```typescript
features: {
  select: { id: true, text: true, description: true, tag: true, tagType: true, icon: true, sortOrder: true },
  orderBy: { sortOrder: "asc" },
}
```

This ensures `service.features` in the widget context (via `useOptionalServiceContext()`) has `tag`, `tagType`, `icon`, and `description` fields available for both the `service-checklist-card` and `service-features` (detailed-cards variant) widgets to read.

### C6. API Route Updates

**Update:** `PUT /api/admin/features/[featureId]/route.ts`

Add `tag` and `tagType` to the Zod schema:

```typescript
const updateFeatureSchema = z.object({
  text: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  tooltip: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),           // 🆕
  tagType: z.string().nullable().optional(),        // 🆕
  icon: z.string().nullable().optional(),           // 🆕
});
```

**Update:** `POST /api/admin/services/[slug]/features/route.ts`

Add to create schema:

```typescript
const createFeatureSchema = z.object({
  text: z.string().min(1),
  description: z.string().nullable().optional(),
  tooltip: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),           // 🆕
  tagType: z.string().nullable().optional(),        // 🆕
  icon: z.string().nullable().optional(),           // 🆕
});
```

### C7. Features Tab — Icon Picker Per Feature

Add a Lucide icon picker per feature row (inline or in the edit dialog). This icon is used by the `service-features` widget's `"detailed-cards"` variant (Phase E) and optionally by `service-checklist-card`.

**UI:** A small icon selector button per feature row. Clicking opens a dropdown/popover with common Lucide icon search. Reference: the existing `ServiceIcon` component (`src/components/ui/service-icon.tsx`) already renders Lucide icons by name — reuse this pattern.

**Common icons for services:**
`FileText`, `Shield`, `CreditCard`, `Building2`, `Globe`, `Clock`, `Users`, `CheckSquare`, `Briefcase`, `Lock`, `Mail`, `Phone`, `MapPin`, `DollarSign`, `Award`, `Zap`, `Heart`, `Star`, `Flag`, `Key`

**If no icon selected:** Widgets fall back to a default icon (check icon for checklist card, circle-check for detailed cards).

### C8. Files for Phase C

| File | Action | Purpose |
|------|--------|---------|
| `prisma/schema.prisma` | MODIFY | Add `tag String?`, `tagType String?`, `icon String?` to ServiceFeature model |
| `src/app/api/admin/features/[featureId]/route.ts` | MODIFY | Add tag/tagType/icon to Zod schema and Prisma update |
| `src/app/api/admin/services/[slug]/features/route.ts` | MODIFY | Add tag/tagType/icon to create Zod schema |
| `src/app/admin/services/[slug]/page.tsx` | MODIFY | Remove "Service Features" card from Basic Info tab; enhance Features tab with drag-drop + tag select + icon picker |
| `src/app/(marketing)/services/[slug]/page.tsx` | MODIFY | Ensure features query includes `tag`, `tagType`, `icon`, `description` fields |

---

## Phase D: Tab Rename + Comparison Table Drag-Drop

### D1. Tab Rename

**Current tabs:**
```
Basic Info | Features (18) | Packages (3) | FAQs (4) | Location Pricing | SEO
```

**After:**
```
Basic Info | Comparison Table (18) | Packages (3) | FAQs (4) | Location Pricing | SEO
```

**Why rename:**
- "Features" was ambiguous with the (now-removed) Basic Info "Service Features" card
- "Comparison Table" clearly indicates this is for package comparison/pricing table configuration
- Content is features with package mappings (included/addon/text per package) — that's a comparison table

**Code change:**

```tsx
// Tab trigger:
<TabsTrigger value="features">Comparison Table ({masterFeatures.length})</TabsTrigger>

// Card header inside the tab:
<CardTitle>Package Comparison Features</CardTitle>
<CardDescription>
  Define features for the pricing comparison table. Drag to reorder.
  Each feature can be mapped to packages as included, add-on, or custom text.
</CardDescription>
```

### D2. Drag-Drop in Comparison Table Tab

Same `@dnd-kit` pattern as Phase C's Features tab enhancement. The Master Feature List in this tab also has `GripVertical` without drag logic.

Uses the same bulk sort API: `PUT /api/admin/services/[slug]/features` with `{ featureOrders: [{ id, sortOrder }] }`.

**Note:** Phase C and D both modify `src/app/admin/services/[slug]/page.tsx`. They can be implemented together in practice — separated here for clarity.

### D3. Files for Phase D

| File | Action | Purpose |
|------|--------|---------|
| `src/app/admin/services/[slug]/page.tsx` | MODIFY | Rename tab + card headers (same file already touched in Phase C) |

---

## Phase E: `service-features` Widget — New `"detailed-cards"` Variant

### E1. Overview

The reference HTML's "What's Included" section shows feature cards in a 3-column grid, each with:
- **Icon** (unique SVG per feature — document, shield, credit card, etc.)
- **Title** (h3 — "Articles of Organization")
- **Description** (paragraph — detailed explanation)
- **Tag badge** ("ALL PLANS", "PROFESSIONAL & COMPLETE", "ALL PLANS • FREE ($79 VALUE)")
- **Hover effect** (border color change, shadow, translateY)
- **Section header** (eyebrow "WHAT'S INCLUDED" + heading + subtitle)

The existing `service-features` widget already has 4 variants (`minimal-checkmark`, `cards`, `compact-grid`, `highlighted`). The `cards` variant is closest but lacks per-feature icon, description display in cards mode, and tag badges. Instead of modifying `cards`, add a new `"detailed-cards"` variant specifically designed to match the reference.

### E2. Why Not Use `service-description` or Rich Text?

- `service.description` (rich text) is for free-form prose content — not structured card grids
- This section's data is 100% from `ServiceFeature` model (text + description + tag + icon)
- Structured widget = dynamic, consistent across services, theme-aware
- Rich text = static per service, hard to maintain, breaks CMS pattern

### E3. Changes to `ServiceFeaturesWidgetSettings`

Add the new variant to the existing type:

```typescript
export interface ServiceFeaturesWidgetSettings {
  header: WidgetHeaderSettings;
  variant: "minimal-checkmark" | "cards" | "compact-grid" | "highlighted" | "detailed-cards";  // 🆕 added
  columns: 1 | 2 | 3 | 4;
  showIcons: boolean;
  iconStyle: "check" | "circle-check" | "badge-check";
  iconColor: string;
  showDescriptions: boolean;
  showTags: boolean;              // 🆕 show tag badges per feature (for detailed-cards)

  // Container Style
  container?: WidgetContainerStyle;
}
```

### E4. `"detailed-cards"` Variant Rendering

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│   WHAT'S INCLUDED (eyebrow)                                                         │
│   Everything you need to legally form your US LLC (heading)                          │
│   Every plan includes the foundational documents... (description)                   │
│                                                                                      │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                    │
│   │  📄 (icon bg)    │  │  🛡️ (icon bg)    │  │  💳 (icon bg)    │                    │
│   │                  │  │                  │  │                  │                    │
│   │  Articles of     │  │  Operating       │  │  EIN / Tax ID    │                    │
│   │  Organization    │  │  Agreement       │  │  Application     │                    │
│   │                  │  │                  │  │                  │                    │
│   │  The official... │  │  Defines owner...│  │  Your LLC's...   │                    │
│   │                  │  │                  │  │                  │                    │
│   │  [ALL PLANS]     │  │  [ALL PLANS •    │  │  [PROFESSIONAL   │                    │
│   │                  │  │   FREE ($79)]    │  │   & COMPLETE]    │                    │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘                    │
│                                                                                      │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                    │
│   │  🏛️              │  │  📋              │  │  🏦              │                    │
│   │  Registered      │  │  BOI Ownership   │  │  US Business     │                    │
│   │  Agent — 1yr     │  │  Filing          │  │  Banking Guide   │                    │
│   │  Free            │  │                  │  │                  │                    │
│   │  Legally req...  │  │  FinCEN's Ben... │  │  Step-by-step... │                    │
│   │                  │  │                  │  │                  │                    │
│   │  [PROFESSIONAL   │  │  [PROFESSIONAL   │  │  [COMPLETE PLAN] │                    │
│   │   & COMPLETE]    │  │   & COMPLETE]    │  │                  │                    │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘                    │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Each card structure:**

```tsx
<div className="group relative overflow-hidden rounded-2xl border border-border bg-white p-7 transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
  {/* Bottom accent line on hover */}
  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />

  {/* Icon */}
  <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-xl bg-primary/7 transition-all duration-300 group-hover:bg-primary">
    <DynamicLucideIcon name={feature.icon || "CircleCheck"} className="h-6 w-6 text-primary transition-colors group-hover:text-white" />
  </div>

  {/* Title */}
  <h3 className="font-display text-base font-bold tracking-tight text-foreground mb-2">{feature.text}</h3>

  {/* Description */}
  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

  {/* Tag badge */}
  {feature.tag && (
    <div className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
         style={getTagBadgeStyle(feature.tagType)}>
      {feature.tag}
    </div>
  )}
</div>
```

**Tag badge colors (in detailed-cards, light background):**

| tagType | Badge Background | Badge Text Color |
|---------|-----------------|-----------------|
| `included` | `rgba(27, 58, 45, 0.08)` | `#1b3a2d` (forest) |
| `free` | `rgba(232, 76, 30, 0.1)` | `#e84c1e` (coral) |
| `addon` | `rgba(232, 76, 30, 0.1)` | `#e84c1e` (coral) |
| `premium` | `rgba(167, 139, 250, 0.1)` | `#7c3aed` (purple) |
| `custom` | `rgba(0, 0, 0, 0.06)` | `currentColor` |

These match the reference HTML's `.inc-card__tag--included` and `.inc-card__tag--addon` classes.

### E5. Dynamic Lucide Icon Rendering

Need a helper to render Lucide icons by string name:

```tsx
// Can use the existing ServiceIcon component pattern, or create a lightweight helper:
import * as LucideIcons from "lucide-react";

function DynamicLucideIcon({ name, ...props }: { name: string } & LucideIcons.LucideProps) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<LucideIcons.LucideProps>>)[name];
  if (!Icon) return <LucideIcons.CircleCheck {...props} />;  // Fallback
  return <Icon {...props} />;
}
```

**Note:** Importing all Lucide icons increases bundle size. Consider:
- Using `next/dynamic` for the icon component
- Or maintaining a curated map of ~30 common service icons (lighter)
- Reference: `src/components/ui/service-icon.tsx` already has a pattern for this

### E6. Section Header — Eyebrow Support

The reference has an "eyebrow" text ("WHAT'S INCLUDED") above the heading. The existing `WidgetHeaderSettings` already has `heading` and `description`. Need to add:

```typescript
export interface WidgetHeaderSettings {
  show: boolean;
  heading: string;
  description: string;
  alignment: "left" | "center";
  eyebrow?: string;              // 🆕 Small uppercase text above heading (e.g., "WHAT'S INCLUDED")
  eyebrowColor?: string;         // 🆕 Default: coral/accent color
}
```

This benefits all widgets that use `WidgetHeaderSettings`, not just service-features.

### E7. Files for Phase E

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/page-builder/types.ts` | MODIFY | Add `"detailed-cards"` to variant union, add `showTags` field, add `eyebrow` to WidgetHeaderSettings |
| `src/components/page-builder/widgets/service/service-features.tsx` | MODIFY | Add `"detailed-cards"` variant rendering with icon + description + tag |
| `src/components/page-builder/settings/service-features-settings.tsx` | MODIFY | Add `"detailed-cards"` to variant dropdown, add showTags toggle, add eyebrow input |

---

## Phase F: Theme Data Update — "Legal & Business Services" Theme Binding

### F1. Overview

When admin activates the "Legal & Business Services" theme, everything configured in this plan must auto-load:
- Services with features (including new `tag`, `tagType`, `icon` fields)
- SERVICE_DETAILS page template with correct section layout (2-column hero + checklist card, features section with detailed-cards variant)
- Widget settings pre-configured to match the reference design

### F2. Update Theme Types

**File:** `src/lib/theme-types.ts` (or wherever `ThemeComparisonFeature` is defined)

Add new fields to the theme comparison feature type:

```typescript
interface ThemeComparisonFeature {
  text: string;
  tooltip?: string;
  description?: string;
  sortOrder: number;
  tag?: string;          // 🆕
  tagType?: string;      // 🆕
  icon?: string;         // 🆕
  packages: Record<string, {
    valueType: "BOOLEAN" | "TEXT" | "ADDON" | "DASH";
    included: boolean;
    customValue?: string;
    addonPriceUSD?: number;
    addonPriceBDT?: number;
  }>;
}
```

### F3. Update Theme Importer

**File:** `src/lib/theme-importer.ts`

In the section that creates `ServiceFeature` records from `comparisonFeatures`, extract the new fields:

```typescript
// Current (approximately):
await db.serviceFeature.create({
  data: {
    text: cf.text,
    description: cf.description,
    tooltip: cf.tooltip,
    sortOrder: cf.sortOrder,
    serviceId: serviceId,
  }
});

// Updated:
await db.serviceFeature.create({
  data: {
    text: cf.text,
    description: cf.description,
    tooltip: cf.tooltip,
    sortOrder: cf.sortOrder,
    serviceId: serviceId,
    tag: cf.tag ?? null,         // 🆕
    tagType: cf.tagType ?? null, // 🆕
    icon: cf.icon ?? null,       // 🆕
  }
});
```

### F4. Update Theme Data JSON

**File:** `public/themes/legal/data.json`

**4a. Service comparison features — add tag/tagType/icon:**

```json
{
  "slug": "llc-formation",
  "comparisonFeatures": [
    {
      "text": "Articles of Organization",
      "description": "The official state document that legally creates your LLC...",
      "tooltip": "Filed with Secretary of State",
      "sortOrder": 0,
      "tag": "All Plans",
      "tagType": "included",
      "icon": "FileText",
      "packages": { "Essential": { "valueType": "BOOLEAN", "included": true }, ... }
    },
    {
      "text": "Operating Agreement",
      "description": "Defines ownership structure, voting rights...",
      "sortOrder": 1,
      "tag": "All Plans • Free ($79 value)",
      "tagType": "free",
      "icon": "Shield",
      "packages": { ... }
    },
    {
      "text": "EIN / Tax ID Application",
      "description": "Your LLC's federal Employer Identification Number...",
      "sortOrder": 2,
      "tag": "Professional & Complete",
      "tagType": "included",
      "icon": "CreditCard",
      "packages": { ... }
    }
  ]
}
```

**4b. SERVICE_DETAILS page template — update section layout:**

The `pages` array in data.json must have the updated SERVICE_DETAILS template with:

```json
{
  "slug": "service",
  "templateType": "SERVICE_DETAILS",
  "blocks": [{
    "type": "widget-page-sections",
    "settings": [
      {
        "id": "hero_section",
        "order": 1,
        "layout": "2-1",
        "settings": {
          "gap": 48,
          "paddingTop": 60,
          "paddingBottom": 80,
          "background": { "type": "solid", "color": "#faf8f4" }
        },
        "columns": [
          {
            "settings": { "verticalAlign": "center" },
            "widgets": [{
              "type": "service-hero",
              "settings": {
                "showCategoryBadge": true,
                "showPriceHero": true,
                "showTrustItems": true,
                "primaryButton": {
                  "show": true,
                  "text": "Get Started — ${{service.startingPrice}} + State Fee",
                  "link": "/checkout/{{service.slug}}"
                },
                "secondaryButton": {
                  "show": true,
                  "text": "Book Free Consultation",
                  "link": "/contact"
                }
              }
            }]
          },
          {
            "settings": { "verticalAlign": "center" },
            "widgets": [{
              "type": "service-checklist-card",
              "settings": {
                "cardTitle": "What You Get",
                "autoItems": true,
                "scrollable": false,
                "itemLimit": 5,
                "showStats": true,
                "stats": [
                  { "value": "1,200+", "label": "Clients Served" },
                  { "value": "30+", "label": "Countries" },
                  { "value": "4.9★", "label": "Rating" }
                ]
              }
            }]
          }
        ]
      },
      {
        "id": "features_section",
        "order": 2,
        "layout": "1",
        "settings": {
          "paddingTop": 100,
          "paddingBottom": 100,
          "background": { "type": "solid", "color": "#ffffff" }
        },
        "columns": [{
          "widgets": [{
            "type": "service-features",
            "settings": {
              "header": {
                "show": true,
                "eyebrow": "What's Included",
                "heading": "Everything you need to legally form your US LLC",
                "description": "Every plan includes the foundational documents required by the state. Higher tiers add EIN, registered agent, and compliance services.",
                "alignment": "center"
              },
              "variant": "detailed-cards",
              "columns": 3,
              "showIcons": true,
              "showDescriptions": true,
              "showTags": true
            }
          }]
        }]
      }
    ]
  }]
}
```

**Note:** The heading "Everything you need to legally form your US LLC" is LLC-specific in the theme data. When other service providers use this CMS, they'd either modify the theme data or change it per-service via widget settings. The `{{service.name}}` placeholder can be used: `"Everything you need for {{service.name}}"`.

### F5. Theme Importer — Widget Type Registration

New widget types (`service-checklist-card`) don't need special importer changes — the importer already stores widget settings as JSON in `LandingPageBlock.settings`. As long as the widget type is registered in `widget-registry.ts`, the renderer will find and render it.

However, ensure the importer's `useTheme: true` injection list includes the new widgets if they should use theme colors:

```typescript
// In theme-importer.ts, add to the widget types that get theme color injection:
const THEME_AWARE_WIDGETS = [
  "hero-content",
  "stats-section",
  "service-list",
  "process-steps",
  "faq-accordion",
  "pricing-table",
  "service-checklist-card",  // 🆕
  "service-features",         // 🆕 (for detailed-cards variant)
];
```

### F6. Files for Phase F

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/theme-types.ts` | MODIFY | Add tag/tagType/icon to ThemeComparisonFeature type |
| `src/lib/theme-importer.ts` | MODIFY | Extract tag/tagType/icon when creating ServiceFeature; add new widgets to theme-aware list |
| `public/themes/legal/data.json` | MODIFY | Add tag/tagType/icon to comparisonFeatures; update SERVICE_DETAILS template with new section layout and widget settings |

---

## Section Layout Recommendation for Service Hero

When admin sets up the service detail page template in `/admin/appearance/pages/service`:

**Recommended section configuration:**
```
Section 1: "2-1" layout (66%/33%)
  ├── Left Column
  │    ├── verticalAlign: "center"
  │    └── Widget: service-hero
  │
  └── Right Column
       ├── verticalAlign: "center"
       └── Widget: service-checklist-card

  Section settings:
  ├── gap: 48-64px
  ├── paddingTop: 60px
  ├── paddingBottom: 80px
  ├── background: cream (#faf8f4) or theme default
  └── maxWidth: "lg" or "xl"
```

**How it maps to reference HTML:**
- Reference uses `grid-template-columns: 1fr 420px` with `gap: 64px`
- Page builder "2-1" layout = `grid-cols-1 lg:grid-cols-3` (col1 = 66%, col2 = 33%)
- Close enough proportionally, and more responsive-friendly
- Both columns get `verticalAlign: "center"` to vertically center-align content
- On mobile: auto-stacks (hero on top, checklist card below)

---

## Tag Color Reference (for service-checklist-card widget rendering)

| tagType | Card Badge Background | Card Badge Text |
|---------|----------------------|-----------------|
| `included` | `rgba(74, 222, 128, 0.15)` | `#4ade80` (green-400) |
| `free` | `rgba(251, 191, 36, 0.15)` | `#fbbf24` (amber-400) |
| `addon` | `rgba(232, 76, 30, 0.15)` | `#e84c1e` (coral) |
| `premium` | `rgba(167, 139, 250, 0.15)` | `#a78bfa` (purple-400) |
| `custom` / fallback | `rgba(255, 255, 255, 0.1)` | `rgba(250, 248, 244, 0.6)` (cream muted) |

These match the reference HTML's `.svc-hero__check-tag--included` and `.svc-hero__check-tag--free` classes.

---

## All File Paths Summary

### New files to create

```
src/components/page-builder/widgets/service/service-checklist-card.tsx      — New widget component (Phase A)
src/components/page-builder/settings/service-checklist-card-settings.tsx    — New widget settings panel (Phase A)
```

### Existing files to modify

```
# Phase A — New Checklist Card Widget
src/lib/page-builder/types.ts                                    — Add ServiceChecklistCardWidgetSettings interface
src/lib/page-builder/widget-registry.ts                          — Register service-checklist-card widget

# Phase B — Hero Simplification + Shared Buttons
src/lib/page-builder/types.ts                                    — Simplify ServiceHeroWidgetSettings (remove right card + old buttons, add shared buttons)
src/components/page-builder/widgets/service/service-hero.tsx      — Remove two-column layout, right card, old buttons; add StyledButton rendering
src/components/page-builder/settings/service-hero-settings.tsx    — Remove right card settings, replace button settings with ButtonStyleEditor

# Phase C — DB Migration + Features Tab Enhancement
prisma/schema.prisma                                              — Add tag, tagType, icon to ServiceFeature model
src/app/api/admin/features/[featureId]/route.ts                  — Add tag/tagType/icon to update Zod schema
src/app/api/admin/services/[slug]/features/route.ts              — Add tag/tagType/icon to create Zod schema
src/app/admin/services/[slug]/page.tsx                           — Remove Basic Info features card, enhance Features tab (drag-drop + tags + icon picker)
src/app/(marketing)/services/[slug]/page.tsx                     — Ensure features query includes tag, tagType, icon, description

# Phase D — Tab Rename
src/app/admin/services/[slug]/page.tsx                           — Rename tab + card headers (already touched in Phase C)

# Phase E — Service Features "detailed-cards" Variant
src/lib/page-builder/types.ts                                    — Add "detailed-cards" to variant union, add showTags, add eyebrow to WidgetHeaderSettings
src/components/page-builder/widgets/service/service-features.tsx  — Add "detailed-cards" variant rendering (icon + description + tag cards)
src/components/page-builder/settings/service-features-settings.tsx — Add "detailed-cards" to variant dropdown, showTags toggle, eyebrow input

# Phase F — Theme Data Binding
src/lib/theme-types.ts                                            — Add tag/tagType/icon to ThemeComparisonFeature type
src/lib/theme-importer.ts                                         — Extract tag/tagType/icon when creating ServiceFeature; add new widgets to theme-aware list
public/themes/legal/data.json                                     — Add tag/tagType/icon to comparisonFeatures; update SERVICE_DETAILS template layout + widget settings
```

---

## Implementation Order

1. **Phase C** — DB migration (tag/tagType/icon) + Features tab enhancement (drag-drop, tags, icon picker) + remove Basic Info features card
2. **Phase D** — Tab rename "Features" → "Comparison Table" + drag-drop in comparison tab
3. **Phase A** — Create `service-checklist-card` widget (new files + registry)
4. **Phase B** — Simplify service-hero (remove right card + reuse shared buttons)
5. **Phase E** — Add `"detailed-cards"` variant to `service-features` widget (icon + description + tag cards + eyebrow header)
6. **Phase F** — Update theme data.json + theme-importer + theme-types for full "Legal & Business Services" theme binding

**Rationale for order change:** Phase C (DB migration) must come first because Phase A, B, and E all depend on the new `tag`, `tagType`, and `icon` fields. Phase D is a quick rename that pairs with C. Phase F comes last because it requires all widgets and features to be implemented first.

---

## Verification Checklist

### Phase C — DB + Features Tab (do first)
- [ ] `npx prisma migrate dev` succeeds with new tag/tagType/icon fields
- [ ] Feature create API accepts tag, tagType, and icon
- [ ] Feature update API accepts tag, tagType, and icon
- [ ] Features tab shows tag dropdown per feature row
- [ ] Tag presets: Included (green), Free (amber), Add-on (orange), Premium (purple), Custom (gray)
- [ ] Custom tagType shows text input for custom tag text
- [ ] Pre-filled tag text for standard types (admin can override)
- [ ] Icon picker per feature — clicking opens Lucide icon dropdown
- [ ] Feature without icon selected shows no icon (or default fallback)
- [ ] Drag-and-drop reorders features in the list
- [ ] After drag-drop, sort order persisted to DB via bulk sort API
- [ ] Basic Info tab no longer shows "Service Features" card
- [ ] `npm run build` passes

### Phase D — Tab Rename
- [ ] Tab reads "Comparison Table (N)" instead of "Features (N)"
- [ ] Card header reads "Package Comparison Features" with updated description
- [ ] Comparison Table tab has working drag-and-drop
- [ ] `npm run build` passes

### Phase A — New Checklist Card Widget
- [ ] `service-checklist-card` appears in widget browser under "Service" category
- [ ] Widget renders dark card with checklist items matching reference design
- [ ] Auto mode reads features from service context (`useOptionalServiceContext()`)
- [ ] Manual mode shows admin-configured items
- [ ] Scroll OFF: shows limited items (default 5)
- [ ] Scroll ON: shows all items with vertical scroll, respects maxHeight
- [ ] Stats row shows at bottom with dividers
- [ ] Stats row hidden when `showStats = false`
- [ ] Card style settings work (background color, accent, radius, shadow)
- [ ] Tag colors render correctly per tagType (included=green, free=amber, addon=coral)
- [ ] Empty features: preview = placeholder, live = widget hidden
- [ ] Widget works outside service context (manual items mode)
- [ ] `npm run build` passes

### Phase B — Hero Simplification
- [ ] service-hero no longer renders right card or internal two-column grid
- [ ] service-hero renders as single-column content (title, desc, price, buttons, trust)
- [ ] Primary button uses `StyledButton` with all style presets working
- [ ] Secondary button uses `StyledButton`
- [ ] Button style editor shows 15+ presets (Ocean, Sunset, Neon, etc.) in admin panel
- [ ] Template variables work in button text: `{{service.startingPrice}}`, `{{service.slug}}`
- [ ] Admin settings panel no longer shows right card settings
- [ ] Page builder: "2-1" section with service-hero (left) + service-checklist-card (right) matches reference design
- [ ] Mobile: two widgets stack vertically (hero on top, card below)
- [ ] `npm run build` passes

### Phase E — Detailed Cards Variant
- [ ] `"detailed-cards"` appears in variant dropdown in service-features settings
- [ ] Renders 3-column card grid matching reference "What's Included" section
- [ ] Each card shows: icon (from feature.icon), title (feature.text), description (feature.description), tag badge (feature.tag)
- [ ] Icons render from Lucide by name; missing icon falls back to CircleCheck
- [ ] Tag badge colors match tagType (included=forest, free=coral, addon=coral, premium=purple)
- [ ] Hover effect: border color change, shadow lift, translateY
- [ ] Bottom accent line on hover (scale animation)
- [ ] Section header shows eyebrow text ("WHAT'S INCLUDED") above heading
- [ ] Eyebrow color defaults to coral/accent, customizable
- [ ] Responsive: 3 cols → 2 cols (tablet) → 1 col (mobile)
- [ ] Features with no description show card without description paragraph
- [ ] Features with no tag show card without tag badge
- [ ] `npm run build` passes

### Phase F — Theme Binding
- [ ] `ThemeComparisonFeature` type includes tag, tagType, icon fields
- [ ] theme-importer creates ServiceFeature records with tag/tagType/icon from data.json
- [ ] `data.json` services have comparisonFeatures with tag/tagType/icon populated
- [ ] `data.json` SERVICE_DETAILS template uses "2-1" layout for hero section
- [ ] `data.json` SERVICE_DETAILS template has service-checklist-card in right column
- [ ] `data.json` SERVICE_DETAILS template has service-features with "detailed-cards" variant
- [ ] Theme activation: full page loads correctly with all new widgets + data
- [ ] New widgets in theme-aware list receive `useTheme: true` injection
- [ ] `npm run build` passes
