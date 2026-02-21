# Click-to-Expand Accordion Feature (Elementor-Style)

## What It Does

When a user clicks on a specific element (e.g., headline, button) inside a widget on the page builder canvas, the corresponding accordion section in the left sidebar settings panel automatically expands. This mimics WordPress Elementor's behavior.

## Architecture Overview

```
Canvas click on element
  → widget-wrapper.tsx detects `data-field-id` via DOM walk
  → onSelect("primary-button") called
  → widget-page-builder.tsx passes fieldId in BuilderSelection
  → widget-builder-panel.tsx passes fieldId to EditMode → settings panel
  → useFieldAccordion hook forces matching AccordionSection open
```

## Files Involved

| File | Role |
|------|------|
| `src/lib/page-builder/types.ts` | `BuilderSelection.fieldId` — carries field ID through selection state |
| `src/app/admin/appearance/landing-page/components/ui/accordion-section.tsx` | Supports controlled mode (`isOpen`, `onOpenChange`) |
| `src/components/page-builder/settings/use-field-accordion.ts` | Reusable hook that maps `activeFieldId` → accordion props |
| `src/components/page-builder/core/widget-wrapper.tsx` | `findFieldId()` — walks DOM upward from click target to find `data-field-id` |
| `src/app/admin/appearance/landing-page/components/widget-page-builder.tsx` | Passes `fieldId` into `onSelectionChange()` |
| `src/app/admin/appearance/landing-page/components/widget-builder-panel.tsx` | Threads `activeFieldId` from selection → EditMode → settings panels |
| Widget canvas components (e.g., `hero-content.tsx`) | Has `data-field-id` attributes on DOM elements |
| Widget settings panels (e.g., `hero-content-settings.tsx`) | Uses `useFieldAccordion` hook, spreads props on AccordionSections |

## Step-by-Step: How It Was Implemented

### Step 1: Extended BuilderSelection (types.ts)

Added `fieldId` to the selection state interface:

```typescript
// src/lib/page-builder/types.ts
export interface BuilderSelection {
  type: SelectionType;
  sectionId?: string;
  columnId?: string;
  widgetId?: string;
  fieldId?: string | null;  // ← ADDED
}
```

### Step 2: AccordionSection Controlled Mode (accordion-section.tsx)

Added `isOpen` and `onOpenChange` props for external control while preserving backward compatibility:

```typescript
interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  isOpen?: boolean;           // ← ADDED: controlled mode
  onOpenChange?: (open: boolean) => void;  // ← ADDED
  // ... rest unchanged
}

export function AccordionSection({ ..., isOpen: controlledOpen, onOpenChange, ... }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleToggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  // ... rest uses `isOpen` and `handleToggle`
}
```

### Step 3: Created useFieldAccordion Hook (use-field-accordion.ts)

```typescript
// src/components/page-builder/settings/use-field-accordion.ts
export function useFieldAccordion(activeFieldId?: string | null) {
  const [forcedField, setForcedField] = useState<string | null>(null);
  const prevFieldRef = useRef(activeFieldId);

  useEffect(() => {
    if (activeFieldId && activeFieldId !== prevFieldRef.current) {
      setForcedField(activeFieldId);
    }
    prevFieldRef.current = activeFieldId;
  }, [activeFieldId]);

  const getAccordionProps = useCallback(
    (fieldId: string) => {
      if (forcedField === fieldId) {
        return {
          isOpen: true as const,
          onOpenChange: () => setForcedField(null),
        };
      }
      return {};
    },
    [forcedField]
  );

  return { getAccordionProps };
}
```

**How it works:**
- When `activeFieldId` changes to a new value, `forcedField` is set
- `getAccordionProps("field-id")` returns `{ isOpen: true, onOpenChange }` for the matching field
- For non-matching fields, returns `{}` (accordion stays in uncontrolled mode)
- Once user interacts (clicks accordion header), `forcedField` clears → returns to uncontrolled

### Step 4: DOM Detection in widget-wrapper.tsx

Added `findFieldId()` that walks up from click target looking for `data-field-id`:

```typescript
function findFieldId(target: HTMLElement, boundary: HTMLElement): string | null {
  let el: HTMLElement | null = target;
  while (el && el !== boundary) {
    const fieldId = el.getAttribute("data-field-id");
    if (fieldId) return fieldId;
    el = el.parentElement;
  }
  return null;
}
```

Updated `onSelect` type and `onClickCapture`:

```typescript
onSelect?: (fieldId?: string | null) => void;

// In onClickCapture:
const fieldId = findFieldId(e.target as HTMLElement, e.currentTarget as HTMLElement);
onSelect(fieldId);
```

### Step 5: Thread fieldId Through Selection Chain

**widget-page-builder.tsx:**
```typescript
onSelect={(fieldId) =>
  onSelectionChange({
    type: "widget",
    sectionId: section.id,
    columnId: column.id,
    widgetId: widget.id,
    fieldId: fieldId ?? null,
  })
}
```

**widget-builder-panel.tsx (EditMode):**
```typescript
// EditModeProps: added activeFieldId?: string | null
// EditMode renders with: activeFieldId={selection.fieldId}
// Each settings panel receives: activeFieldId={activeFieldId}
```

### Step 6: Add data-field-id to Canvas Widget (hero-content.tsx)

Added `data-field-id` attributes to each visual element:

```tsx
{/* Badge */}
<Badge data-field-id="badge" ...>

{/* Headline */}
<h1 data-field-id="headline" ...>

{/* Subheadline */}
<p data-field-id="subheadline" ...>

{/* Features */}
<div data-field-id="features" ...>

{/* Buttons - wrapped in div since Button components use asChild */}
<div data-field-id="primary-button">{renderPrimaryButton()}</div>
<div data-field-id="secondary-button">{renderSecondaryButton()}</div>

{/* Trust Text */}
<div data-field-id="trust-text" ...>
```

**Important:** For components that use `asChild` (Button, Badge, etc.), wrap them in a `<div data-field-id="...">` or add the attribute directly if the component forwards unknown props to the DOM element.

### Step 7: Wire Hook in Settings Panel (hero-content-settings.tsx)

```typescript
import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";

interface Props {
  // ... existing props
  activeFieldId?: string | null;  // ← ADDED
}

export function HeroContentWidgetSettingsPanel({ ..., activeFieldId }) {
  const { getAccordionProps } = useFieldAccordion(activeFieldId);

  // Spread on each AccordionSection:
  <AccordionSection title="Badge" {...getAccordionProps("badge")}>
  <AccordionSection title="Headline" {...getAccordionProps("headline")}>
  <AccordionSection title="Primary Button" {...getAccordionProps("primary-button")}>
  // ... etc
}
```

## Field ID Naming Convention

- Use kebab-case: `"primary-button"`, not `"primaryButton"`
- Match the visual element, not the settings key
- The same field ID string must be used in:
  1. Canvas component: `data-field-id="primary-button"`
  2. Settings panel: `getAccordionProps("primary-button")`

## Extending to Other Widgets

For each widget, you need to do 3 things:

### A. Canvas Component — Add `data-field-id` attributes
Add `data-field-id="field-name"` to each major visual element in the widget's JSX.

### B. Settings Panel — Wire the hook
1. Add `activeFieldId?: string | null` to the props interface
2. Call `const { getAccordionProps } = useFieldAccordion(activeFieldId)`
3. Spread `{...getAccordionProps("field-name")}` on each AccordionSection

### C. widget-builder-panel.tsx — Pass activeFieldId
Add `activeFieldId={activeFieldId}` to the settings panel component in the EditMode function.

## Reference: hero-content Field ID Mapping

| Canvas data-field-id | Settings AccordionSection title | Settings getAccordionProps key |
|---|---|---|
| `badge` | "Badge" | `"badge"` |
| `headline` | "Headline" | `"headline"` |
| `subheadline` | "Subheadline" | `"subheadline"` |
| `features` | "Features List" | `"features"` |
| `primary-button` | "Primary Button" | `"primary-button"` |
| `secondary-button` | "Secondary Button" | `"secondary-button"` |
| `trust-text` | "Trust Text" | `"trust-text"` |

## Already Implemented

- [x] hero-content

## Remaining Widgets (need implementation)

- [ ] heading
- [ ] text-block
- [ ] image
- [ ] image-slider
- [ ] trust-badges
- [ ] stats-section
- [ ] divider
- [ ] service-card
- [ ] service-list
- [ ] process-steps
- [ ] pricing-table
- [ ] testimonials-carousel
- [ ] lead-form
- [ ] button-group
- [ ] service-hero
- [ ] faq-accordion / faq
- [ ] blog-post-grid
- [ ] blog-post-carousel
- [ ] blog-featured-post
- [ ] blog-post-list
- [ ] blog-recent-posts
