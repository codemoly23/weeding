🔍 Comprehensive Button Code Duplication Analysis
আমি এখন ALL button-related code check করেছি। এখানে findings:

❌ MAJOR Duplications Found:

1. Button Style Presets - 3x Duplication
   Same preset array defined in 3 files:

File Lines Presets Count
button-style-editor.tsx ~160 lines 15 presets
admin/appearance/header ~160 lines 15 presets
admin/appearance/footer ~160 lines 15 presets
Total Duplicate Code: ~480 lines!

All 15 presets duplicated:

ocean-gradient
sunset-glow
neon-cyber
emerald-success
midnight-premium
coral-sunset
arctic-frost
red-alert
outline-modern
craft-expand
heartbeat
flow-border
stitches
ring-hover
neural 2. Craft Button Default Color - 12x Hardcoded
bgColor: "#18181b" hardcoded 12 different places:

button-style-editor.tsx
hero-cta-buttons.tsx
CTAButtons.tsx (multiple times)
admin pages
landing blocks
footer.tsx
Should be: Centralized constant

3. Icon Rendering Logic - Partial Duplication
   renderButtonIcon এবং renderPreviewIcon functions:

✅ Utility file তে define করা আছে
❌ কিন্তু wrapper logic 5 জায়গায় duplicate
✅ What's Working Well:
Utility Functions - Properly centralized in button-utils.ts

getHoverEffectClass
getNormalBackground
getHoverBackground
Used in 7 files ✅
CraftButton Component - Properly reusable ✅

Icon Rotation - Centralized in CraftButton ✅

📊 Efficiency Score by Category:
Category Score Status
Hover Effects 100% ✅ Fully centralized
Icon Rotation 100% ✅ Fixed by us
Utility Functions 95% ✅ Mostly centralized
Button Presets 33% ❌ 3x duplication
Default Colors 10% ❌ 12x hardcoded
Icon Rendering 70% ⚠️ Partial duplication
Overall Efficiency: 68%

🎯 Critical Issues:
Button Presets (~480 lines duplicate)

Same 15 presets copy-pasted 3 times
Any preset change করতে 3 জায়গায় edit করতে হয়
Maintenance nightmare
Magic Numbers/Colors

Craft dark color (#18181b) 12 জায়গায়
Orange (#f97316) multiple places
Should use constants
💡 Recommended Fixes:

// Create: src/lib/button-presets.ts
export const BUTTON_PRESETS = [...] // Single source of truth

// Create: src/lib/button-constants.ts
export const CRAFT_BG_COLOR = '#18181b'
export const ORANGE_PRIMARY = '#f97316'
