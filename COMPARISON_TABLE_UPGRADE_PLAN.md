# Comparison Table Upgrade Plan

## Overview

Screenshots analysis অনুযায়ী নিচের features গুলো implement করতে হবে:

### Screenshot Analysis:

1. **Column Selection & Highlighting** - Package select করলে সেই column highlight হয় (orange/primary color)
2. **Order Summary Sidebar** - Right side এ selected package, state fee, add-ons এর summary
3. **Add-on Fees in Rows** - কিছু row তে "+ $50", "+ $150" button থাকে যা click করলে total এ add হয়
4. **Mixed Cell Content** - Check (✓), Cross (✗), Dash (—), অথবা Text/Price সব ধরনের content support
5. **Feature Tooltips** - Feature name এর পাশে (i) icon hover করলে tooltip
6. **Processing Time** - Package header এ "3 weeks" / "3 days" processing time
7. **State Fee Display** - "+ $52 state fee" প্রতিটা package এর নিচে

---

## Current State

### Database Schema (যা আছে):
- `ServiceFeature` - Master feature list
- `Package` - Packages with price
- `PackageFeatureMap` - Feature mapping with `included` boolean এবং `customValue` string

### যা নেই:
- Add-on pricing model
- Feature type (check/cross/dash/addon/text)
- Processing time field
- State fee integration in comparison

---

## Implementation Plan

### Phase 1: Database Schema Update

#### 1.1 Update `PackageFeatureMap` Model

```prisma
model PackageFeatureMap {
  id          String         @id @default(cuid())
  packageId   String
  package     Package        @relation(fields: [packageId], references: [id], onDelete: Cascade)
  featureId   String
  feature     ServiceFeature @relation(fields: [featureId], references: [id], onDelete: Cascade)

  // Existing
  included    Boolean        @default(false)
  customValue String?

  // NEW FIELDS
  valueType   FeatureValueType @default(BOOLEAN)  // BOOLEAN, TEXT, ADDON, DASH
  addonPrice  Decimal?       @db.Decimal(10, 2)   // Add-on price if valueType=ADDON
  addonPriceBDT Decimal?     @db.Decimal(10, 2)   // BDT price for addon
  isSelected  Boolean        @default(false)      // For pre-selected addons

  @@unique([packageId, featureId])
}

enum FeatureValueType {
  BOOLEAN    // Shows ✓ or ✗
  TEXT       // Shows customValue text
  ADDON      // Shows "+ $XX" button
  DASH       // Shows — (not applicable)
}
```

#### 1.2 Update `Package` Model

```prisma
model Package {
  // ... existing fields ...

  // NEW FIELDS
  processingTime     String?    // "3 weeks", "3 business days"
  processingTimeNote String?    // "(instead of 3 weeks)"
  badgeText          String?    // "Recommended", "Best Value"
  badgeColor         String?    // "orange", "green"
}
```

#### 1.3 Migration Command
```bash
npx prisma migrate dev --name add_comparison_table_features
```

---

### Phase 2: Admin Side Changes

#### 2.1 Files to Modify:

| File | Change |
|------|--------|
| `src/app/admin/services/[id]/page.tsx` | Update comparison table editor |
| `src/app/api/admin/services/[id]/packages/route.ts` | Add new fields support |
| `src/app/api/admin/packages/[packageId]/features/route.ts` | Update feature mapping API |

#### 2.2 Admin Comparison Table Editor UI Changes:

**Current State:**
- Simple toggle (✓/✗) for each cell

**New State:**
Each cell এ dropdown/popover থাকবে:
```
┌─────────────────────────────────┐
│ Value Type: [Dropdown]          │
│  ○ Included (✓)                 │
│  ○ Not Included (✗)             │
│  ○ Not Applicable (—)           │
│  ○ Add-on (+$XX)                │
│  ○ Custom Text                  │
├─────────────────────────────────┤
│ If Add-on:                      │
│  Price USD: [___$50___]         │
│  Price BDT: [___5000___]        │
│  Pre-selected: [ ]              │
├─────────────────────────────────┤
│ If Custom Text:                 │
│  Value: [__"10 per month"__]    │
└─────────────────────────────────┘
```

#### 2.3 Package Editor Updates:

Add new fields to package creation/edit dialog:
- Processing Time (text input)
- Processing Time Note (text input)
- Badge Text (text input)
- Badge Color (color picker/dropdown)

---

### Phase 3: Client Side Changes

#### 3.1 Files to Modify:

| File | Change |
|------|--------|
| `src/components/services/package-comparison-table.tsx` | Complete redesign |
| `src/app/(marketing)/services/[slug]/page.tsx` | Add state selector, order summary |
| `src/app/api/services/[slug]/route.ts` | Return new fields |

#### 3.2 New Component Structure:

```
PackageComparisonSection/
├── StateSelector (dropdown for state selection)
├── PackageComparisonTable (main table)
│   ├── TableHeader (package columns with selection)
│   ├── TableBody (feature rows)
│   │   ├── FeatureRow
│   │   │   ├── FeatureCell (✓/✗/—/text)
│   │   │   └── AddonCell (+ $XX button)
│   │   └── ...
│   └── TableFooter (Select Package buttons)
└── OrderSummary (sticky sidebar)
    ├── Selected Package
    ├── State Fee
    ├── Selected Addons
    └── Total
```

#### 3.3 State Management:

```typescript
interface ComparisonTableState {
  selectedPackageId: string | null;
  selectedState: string;           // "wyoming", "delaware"
  selectedAddons: {
    featureId: string;
    packageId: string;
    price: number;
    name: string;
  }[];
}

// Calculated
const stateFee = getStateFee(selectedState);
const packagePrice = selectedPackage?.priceUSD || 0;
const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
const grandTotal = packagePrice + stateFee + addonsTotal;
```

#### 3.4 Visual Design:

**Selected Column Highlighting:**
```css
/* Selected package column */
.package-column-selected {
  background: linear-gradient(to bottom,
    rgba(255, 107, 0, 0.1) 0%,
    rgba(255, 107, 0, 0.05) 100%
  );
  border-left: 2px solid #ff6b00;
  border-right: 2px solid #ff6b00;
}

/* Selected column header */
.package-header-selected {
  background: #ff6b00;
  color: white;
}

/* Selected column cells - checkmarks become orange */
.check-icon-selected {
  color: #ff6b00;
}
```

**Add-on Button:**
```tsx
<Button
  variant="outline"
  size="sm"
  className={cn(
    "h-8 px-3 text-sm font-medium",
    isSelected
      ? "bg-orange-500 text-white border-orange-500"
      : "border-gray-300 hover:border-orange-500"
  )}
  onClick={() => toggleAddon(featureId, packageId)}
>
  {isSelected ? <Check className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
  ${price}
</Button>
```

#### 3.5 Order Summary Component:

```tsx
<Card className="sticky top-24 w-80">
  <CardHeader>
    <CardTitle>Order Summary</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex justify-between">
      <span>Standard Package:</span>
      <span>$199</span>
    </div>
    <div className="flex justify-between">
      <span>New Mexico State Fee:</span>
      <span>$52</span>
    </div>
    {selectedAddons.map(addon => (
      <div key={addon.featureId} className="flex justify-between">
        <span>{addon.name}:</span>
        <span>${addon.price}</span>
      </div>
    ))}
    <Separator />
    <div className="flex justify-between font-bold text-lg">
      <span>Total:</span>
      <span>${grandTotal}</span>
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full bg-orange-500 hover:bg-orange-600">
      Get Started
    </Button>
    <p className="text-xs text-center mt-2 text-muted-foreground">
      <RefreshCw className="w-3 h-3 inline mr-1" />
      One-time fee
    </p>
  </CardFooter>
</Card>
```

---

### Phase 4: API Updates

#### 4.1 Update Service Fetch API

`src/app/api/services/[slug]/route.ts`:

```typescript
// Include new fields in response
const service = await prisma.service.findUnique({
  where: { slug },
  include: {
    packages: {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        featureMap: {
          include: { feature: true },
          orderBy: { feature: { sortOrder: 'asc' } }
        }
      }
    },
    masterFeatures: {
      orderBy: { sortOrder: 'asc' },
      include: {
        packageMappings: true
      }
    }
  }
});
```

#### 4.2 State Fees API

Already exists: `src/app/api/state-fees/route.ts`

---

### Phase 5: Seed Data Update

#### 5.1 Update `prisma/seed.ts`:

```typescript
// LLC Formation features with proper value types
const features = [
  {
    text: "Preparing & Filing the Articles of Organization",
    tooltip: "We prepare and file your LLC formation documents",
    valueType: "BOOLEAN",
    packages: { basic: true, standard: true, premium: true }
  },
  {
    text: "Expedited Filing",
    description: "3 business days (instead of 3 weeks)",
    valueType: "ADDON",
    packages: {
      basic: { addonPrice: 50 },
      standard: { addonPrice: 50 },
      premium: { included: true }
    }
  },
  {
    text: "Domain Name + Business Email",
    valueType: "DASH",  // Not applicable for basic/standard
    packages: { basic: "DASH", standard: "DASH", premium: true }
  },
  // ... more features
];

// Package with processing time
await prisma.package.create({
  data: {
    name: "Premium",
    priceUSD: 299,
    processingTime: "3 days",
    processingTimeNote: null,
    badgeText: null,
    isPopular: false,
    // ...
  }
});
```

---

## File Change Summary

### New Files:
- None (all modifications to existing files)

### Modified Files:

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add FeatureValueType enum, update PackageFeatureMap, Package models |
| `prisma/seed.ts` | Update seed data with new fields |
| `src/app/admin/services/[id]/page.tsx` | New comparison table editor UI |
| `src/app/api/admin/packages/[packageId]/features/route.ts` | Support new fields |
| `src/app/api/admin/services/[id]/packages/route.ts` | Support processingTime, badge fields |
| `src/components/services/package-comparison-table.tsx` | Complete redesign with selection, addons |
| `src/app/(marketing)/services/[slug]/page.tsx` | Add OrderSummary sidebar, state selector |
| `src/app/api/services/[slug]/route.ts` | Return new fields |

---

## Implementation Order

```
1. Schema Update (prisma/schema.prisma)
   ↓
2. Migration (npx prisma migrate dev)
   ↓
3. Update Seed Data (prisma/seed.ts)
   ↓
4. Admin API Updates (api/admin/...)
   ↓
5. Admin UI Updates (admin/services/[id]/page.tsx)
   ↓
6. Client API Updates (api/services/[slug])
   ↓
7. Client Component Redesign (package-comparison-table.tsx)
   ↓
8. Service Page Update (services/[slug]/page.tsx)
   ↓
9. Testing & Polish
```

---

## Estimated Complexity

| Component | Complexity | Reason |
|-----------|------------|--------|
| Schema Update | Low | Simple field additions |
| Admin Table Editor | High | Complex UI with popover/dropdown per cell |
| Client Comparison Table | High | Selection state, addon toggles, highlighting |
| Order Summary | Medium | State management, calculations |
| APIs | Low | Simple field additions |

---

## Questions to Clarify

1. **Add-on Selection Behavior:**
   - Can user select add-ons from multiple packages? Or only from selected package?
   - Screenshot suggests only selected package's addons are clickable

2. **State Fee:**
   - State selector কোথায় থাকবে? Table এর উপরে? Order Summary তে?
   - Default state কোনটা হবে?

3. **Mobile View:**
   - Order Summary mobile এ কোথায় দেখাবে? Bottom sticky?
   - Add-on selection mobile এ কিভাবে কাজ করবে?

4. **Checkout Flow:**
   - "Get Started" button click করলে কোথায় যাবে?
   - Selected package, state, addons কিভাবে pass হবে?
