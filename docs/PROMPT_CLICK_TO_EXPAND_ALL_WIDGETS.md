# Prompt: Implement Click-to-Expand Accordion for All Remaining Widgets

Copy and paste this entire prompt to Claude Sonnet 4.6 to implement the feature for all remaining widgets.

---

## Task

Implement the "click canvas element → expand sidebar accordion" feature for ALL remaining page builder widgets. The hero-content widget already has this feature implemented as a reference. You must follow the exact same pattern.

## CRITICAL: Read the Reference Doc First

Read `docs/CLICK_TO_EXPAND_ACCORDION.md` — it explains the full architecture and step-by-step implementation.

## Already Done (DO NOT touch these)

These files are already complete and working. Do NOT modify them:
- `src/lib/page-builder/types.ts` — `BuilderSelection.fieldId` already added
- `src/app/admin/appearance/landing-page/components/ui/accordion-section.tsx` — controlled mode already added
- `src/components/page-builder/settings/use-field-accordion.ts` — hook already created
- `src/components/page-builder/core/widget-wrapper.tsx` — `findFieldId()` already works
- `src/app/admin/appearance/landing-page/components/widget-page-builder.tsx` — `fieldId` already threaded
- `src/components/page-builder/widgets/content/hero-content.tsx` — already has `data-field-id` attributes
- `src/components/page-builder/settings/hero-content-settings.tsx` — already wired with `useFieldAccordion`

## What You Need to Do

For each widget listed below, do exactly 3 things:

### A. Canvas Component — Add `data-field-id` attributes

1. Read the widget's canvas component file
2. Identify each major visual element/section in the JSX return
3. Add `data-field-id="field-name"` to each element's outermost wrapper
4. Use kebab-case for field names (e.g., `"section-header"`, `"submit-button"`)
5. For components using `asChild` (Button, Badge), wrap in `<div data-field-id="...">` or `<span data-field-id="...">`

### B. Settings Panel — Wire the hook

1. Add import: `import { useFieldAccordion } from "@/components/page-builder/settings/use-field-accordion";`
2. Add `activeFieldId?: string | null` to the component's props interface
3. Add `activeFieldId` to the destructured props
4. Add at the top of the component body: `const { getAccordionProps } = useFieldAccordion(activeFieldId);`
5. On EVERY `<AccordionSection>` in the component, spread: `{...getAccordionProps("matching-field-name")}`
6. The field name in `getAccordionProps("x")` MUST match the `data-field-id="x"` in the canvas component

### C. widget-builder-panel.tsx — Pass activeFieldId

In `src/app/admin/appearance/landing-page/components/widget-builder-panel.tsx`, find the conditional for each widget type in the EditMode function and add `activeFieldId={activeFieldId}` prop. Example:

```tsx
// BEFORE:
{widget.type === "heading" && (
  <HeadingWidgetSettingsPanel
    settings={widget.settings as any}
    onChange={onUpdateSettings}
    activeTab={activeTab}
  />
)}

// AFTER:
{widget.type === "heading" && (
  <HeadingWidgetSettingsPanel
    settings={widget.settings as any}
    onChange={onUpdateSettings}
    activeTab={activeTab}
    activeFieldId={activeFieldId}
  />
)}
```

## Widget List — Process Each One

### 1. heading
- **Canvas:** `src/components/page-builder/widgets/content/heading-widget.tsx`
- **Settings:** `src/components/page-builder/settings/heading-widget-settings.tsx`
- Content tab AccordionSections: Content, Heading, Link, Highlight, Split Heading
- Style tab AccordionSections: Alignment, Typography, Text Fill, Text Stroke (Outline), Text Shadow, Highlight Style, Split Text Colors
- Advanced tab AccordionSections: Animation sections, Responsive, Container Style

### 2. text-block
- **Canvas:** `src/components/page-builder/widgets/content/text-block-widget.tsx`
- **Settings:** `src/components/page-builder/settings/text-block-settings.tsx`

### 3. image
- **Canvas:** `src/components/page-builder/widgets/media/image-widget.tsx`
- **Settings:** `src/components/page-builder/settings/image-settings.tsx`

### 4. image-slider
- **Canvas:** `src/components/page-builder/widgets/media/image-slider-widget.tsx`
- **Settings:** `src/components/page-builder/settings/image-slider-settings.tsx`

### 5. trust-badges
- **Canvas:** `src/components/page-builder/widgets/social-proof/trust-badges.tsx`
- **Settings:** `src/components/page-builder/settings/trust-badges-settings.tsx`

### 6. stats-section
- **Canvas:** `src/components/page-builder/widgets/social-proof/stats-section.tsx`
- **Settings:** `src/components/page-builder/settings/stats-section-settings.tsx`

### 7. divider
- **Canvas:** `src/components/page-builder/widgets/layout/divider-widget.tsx`
- **Settings:** `src/components/page-builder/settings/divider-widget-settings.tsx`

### 8. service-card
- **Canvas:** `src/components/page-builder/widgets/commerce/service-card-widget.tsx`
- **Settings:** `src/components/page-builder/settings/service-card-settings.tsx`

### 9. service-list
- **Canvas:** `src/components/page-builder/widgets/commerce/service-list-widget.tsx`
- **Settings:** `src/components/page-builder/settings/service-list-settings.tsx`

### 10. process-steps
- **Canvas:** `src/components/page-builder/widgets/content/process-steps.tsx`
- **Settings:** `src/components/page-builder/settings/process-steps-settings.tsx`

### 11. pricing-table
- **Canvas:** `src/components/page-builder/widgets/commerce/pricing-table-widget.tsx`
- **Settings:** `src/components/page-builder/settings/pricing-table-settings.tsx`

### 12. testimonials-carousel
- **Canvas:** `src/components/page-builder/widgets/social-proof/testimonials-widget.tsx`
- **Settings:** `src/components/page-builder/settings/testimonials-settings.tsx`

### 13. lead-form
- **Canvas:** `src/components/page-builder/widgets/forms/lead-form-widget.tsx`
- **Settings:** `src/components/page-builder/settings/lead-form-settings.tsx`

### 14. button-group
- **Canvas:** `src/components/page-builder/widgets/cta/button-group-widget.tsx`
- **Settings:** `src/components/page-builder/settings/button-group-settings.tsx`

### 15. service-hero
- **Canvas:** `src/components/page-builder/widgets/service/service-hero.tsx`
- **Settings:** `src/components/page-builder/settings/service-hero-settings.tsx`

### 16. faq-accordion / faq
- **Canvas:** `src/components/page-builder/widgets/layout/faq-accordion-widget.tsx`
- **Settings:** `src/components/page-builder/settings/faq-accordion-settings.tsx`
- Note: Both "faq" and "faq-accordion" widget types share this same component

### 17. blog-post-grid
- **Canvas:** `src/components/page-builder/widgets/blog/blog-post-grid.tsx`
- **Settings:** Look for its settings panel (may not have `activeTab` prop yet — add it if missing)

### 18. blog-post-carousel
- **Canvas:** `src/components/page-builder/widgets/blog/blog-post-carousel.tsx`
- **Settings:** Look for its settings panel

### 19. blog-featured-post
- **Canvas:** `src/components/page-builder/widgets/blog/blog-featured-post.tsx`
- **Settings:** Look for its settings panel

### 20. blog-post-list
- **Canvas:** `src/components/page-builder/widgets/blog/blog-post-list.tsx`
- **Settings:** Look for its settings panel

### 21. blog-recent-posts
- **Canvas:** `src/components/page-builder/widgets/blog/blog-recent-posts.tsx`
- **Settings:** Look for its settings panel

## Rules

1. **DO NOT modify any file listed in "Already Done" section**
2. **Use kebab-case** for all field IDs: `"section-header"` not `"sectionHeader"`
3. **The field ID must match** between `data-field-id="x"` (canvas) and `getAccordionProps("x")` (settings)
4. **Every AccordionSection** in every settings panel must get `{...getAccordionProps("matching-id")}`
5. **Only add data-field-id to meaningful visual sections** — not to tiny internal spans or utility divs
6. **For conditional elements** (shown/hidden based on settings), add data-field-id to the outermost visible wrapper
7. **Run `npx tsc --noEmit`** after ALL changes to verify zero TypeScript errors
8. **Process widgets one at a time** — do all 3 steps (A, B, C) for one widget before moving to the next
9. **For blog widgets** that don't have `activeTab` prop yet — still add `activeFieldId` prop and wire the hook

## Field ID Naming Guidelines

Choose field IDs that describe what the user sees on screen:

| Visual Element | Good Field ID | Bad Field ID |
|---|---|---|
| Section header/title area | `header` or `section-header` | `sectionHeaderConfig` |
| Image display area | `image` | `imageSettings` |
| Submit button | `submit-button` | `submitBtn` |
| Navigation arrows | `navigation` | `nav` |
| Star ratings display | `ratings` | `ratingStars` |
| Price badge | `price-badge` | `priceBadge` |
| Individual step in process | `steps` (the whole group) | `step-1` |

## Verification Checklist

After completing ALL widgets:

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Dev server runs without errors
- [ ] Clicking on a visual element in any widget canvas expands the correct accordion in the sidebar
- [ ] Clicking on empty space in a widget selects it without expanding any accordion
- [ ] Manually clicking accordion headers still works normally (toggle open/close)
- [ ] All existing widget editing functionality still works (no regressions)
