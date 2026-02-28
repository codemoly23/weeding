const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/themes/legal/data.json', 'utf8'));

// ============================================
// FIX 1: Mark the correct 8 services as popular with sortOrder
// Reference order: LLC Formation, EIN, Amazon Reinstatement, Amazon Seller,
// TikTok Shop, Form 5472, Business Bank Account, USPTO Trademark
// ============================================

// The 8 featured services by slug, in reference order
const featured = [
  { slug: 'llc-formation', sortOrder: 1, isPopular: true },
  { slug: 'ein-application', sortOrder: 2, isPopular: true },
  { slug: 'account-reinstatement', sortOrder: 3, isPopular: false },
  { slug: 'amazon-seller', sortOrder: 4, isPopular: true },
  { slug: 'tiktok-shop-setup', sortOrder: 5, isPopular: false },
  { slug: 'form-5472', sortOrder: 6, isPopular: false },
  { slug: 'business-banking', sortOrder: 7, isPopular: false },
  { slug: 'trademark-registration', sortOrder: 8, isPopular: false },
];

const featuredSlugs = new Set(featured.map(f => f.slug));

// Update services
data.services.forEach(s => {
  const feat = featured.find(f => f.slug === s.slug);
  if (feat) {
    s.isPopular = feat.isPopular;
    s.sortOrder = feat.sortOrder;
  } else {
    // Non-featured services get higher sortOrder
    s.sortOrder = 100;
    s.isPopular = false;
  }
});

// Rename services to match reference exactly
const nameMap = {
  'ein-application': 'EIN for Non-US Residents',
  'account-reinstatement': 'Amazon Account Reinstatement',
  'amazon-seller': 'Amazon Seller Account Setup',
  'form-5472': 'Form 5472 Filing',
  'business-banking': 'US Business Bank Account',
  'trademark-registration': 'USPTO Trademark Registration',
};

data.services.forEach(s => {
  if (nameMap[s.slug]) {
    s.name = nameMap[s.slug];
  }
});

// Update category for specific services to match reference
// In reference: Account Reinstatement is E-Commerce, Form 5472 is Compliance,
// Business Bank Account is Finance, Trademark is Legal Protection
// But our categories are: formation, compliance, amazon, tax-finance
// account-reinstatement is already amazon (E-Commerce) ✓
// form-5472 is already compliance ✓
// business-banking is tax-finance (Finance) - reference shows no category tag for it, just default
// trademark-registration is formation - reference shows "Legal Protection" tag

// Actually in the reference HTML:
// LLC Formation -> "Formation & Legal" tag, coral
// EIN -> "Formation & Legal" tag, coral
// Amazon Account Reinstatement -> "E-Commerce" tag, blue
// Amazon Seller Account Setup -> "E-Commerce" tag, blue
// TikTok Shop US Setup -> "E-Commerce" tag, blue
// Form 5472 Filing -> "Compliance" tag, forest
// US Business Bank Account -> "Finance" tag, purple
// USPTO Trademark Registration -> "Legal Protection" tag, purple

// business-banking currently is tax-finance which is purple ✓ (just different name)
// trademark-registration currently is formation (coral) but reference shows "Legal Protection" (purple)
// We'll leave trademark in formation for now since our categories don't have "Legal Protection"
// The color still comes from the category

console.log('Updated services:');
data.services
  .filter(s => featuredSlugs.has(s.slug))
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .forEach((s, i) => {
    console.log(`  ${i}: [${s.categorySlug}] ${s.name} (pop:${s.isPopular} sort:${s.sortOrder})`);
  });

// ============================================
// FIX 2: Swap section order - all_services BEFORE forge_services
// ============================================
const home = data.pages.find(p => p.slug === 'home');
const block = home.blocks.find(b => b.type === 'widget-page-sections');

// Find and remove both sections
const allServicesIdx = block.settings.findIndex(s => s.id === 'section_all_services');
const forgeServicesIdx = block.settings.findIndex(s => s.id === 'section_forge_services');

console.log('\nBefore swap:');
block.settings.forEach((s, i) => console.log(`  ${i}: ${s.id}`));

// Remove both (higher index first to avoid shifting)
const forgeSection = block.settings.splice(Math.max(allServicesIdx, forgeServicesIdx), 1)[0];
const allSection = block.settings.splice(Math.min(allServicesIdx, forgeServicesIdx), 1)[0];

// Insert in correct order: all_services first, then forge_services
// After hero(0), ticker(1), stats(2) => all_services(3), forge_services(4)
block.settings.splice(3, 0, allSection, forgeSection);

// Update order numbers
block.settings.forEach((s, i) => { s.order = i; });

console.log('\nAfter swap:');
block.settings.forEach((s, i) => console.log(`  ${i}: ${s.id}`));

// ============================================
// FIX 3: Fix forge section heading - no highlight, 2 lines
// ============================================
const forgeSec = block.settings.find(s => s.id === 'section_forge_services');
const forgeWidget = forgeSec.columns[0].widgets[0];

// Fix heading: 2-line, no orange highlight
forgeWidget.settings.header.heading.text = 'Every service your\nUS business needs';
forgeWidget.settings.header.heading.highlightWords = '';  // no highlight
forgeWidget.settings.header.heading.highlightColor = '';

// Fix filter: use sort-order instead of popular to get exact 8 in order
forgeWidget.settings.filters.sortBy = 'sort-order';
forgeWidget.settings.filters.limit = 8;

console.log('\nForge heading:', forgeWidget.settings.header.heading.text);
console.log('Forge sortBy:', forgeWidget.settings.filters.sortBy);

// ============================================
// SAVE
// ============================================
fs.writeFileSync('public/themes/legal/data.json', JSON.stringify(data, null, 2), 'utf8');
console.log('\nDone! Theme data updated.');
