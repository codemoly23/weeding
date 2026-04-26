/**
 * Seed Footer — Reference Design
 *
 * Sets up the footer to match the reference design:
 * - Dark gradient background (purple-navy)
 * - Brand column (left) + 4 link columns (right)
 * - Column headings with icons
 * - Links with chevron prefix
 * - Pill-style trust badges
 * - Social icons (circle style)
 * - Split bottom bar
 *
 * Run: npx tsx prisma/seed-footer-design.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedFooterDesign() {
  console.log("🎨 Seeding Reference Footer Design...\n");

  // ─── Find active footer ──────────────────────────────────────────────────
  let footer = await prisma.footerConfig.findFirst({ where: { isActive: true } });
  if (!footer) {
    console.log("   No active footer found — creating one...");
    footer = await prisma.footerConfig.create({
      data: { name: "Default Footer", isActive: true, layout: "MULTI_COLUMN", columns: 5, paddingTop: 64, paddingBottom: 40 },
    });
  }
  console.log(`   ✓ Using footer: ${footer.id}\n`);

  // ─── Clear existing widgets ───────────────────────────────────────────────
  console.log("🗑️  Clearing existing footer widgets...");
  await prisma.menuItem.deleteMany({ where: { footerWidgetId: { not: null } } });
  await prisma.footerWidget.deleteMany({ where: { footerId: footer.id } });
  console.log("   ✓ Cleared\n");

  // ─── Update footer config ─────────────────────────────────────────────────
  console.log("⚙️  Updating footer configuration...");
  await prisma.footerConfig.update({
    where: { id: footer.id },
    data: {
      layout:           "MULTI_COLUMN",
      columns:          5,
      // Background — dark purple gradient
      bgType:           "gradient",
      bgGradient: JSON.stringify({
        type:   "linear",
        colors: [
          { color: "#1a1040", position: 0 },
          { color: "#0f0826", position: 100 },
        ],
        angle: 180,
      }),
      // Custom CSS — radial glow overlays on left and right edges (matches reference)
      customCSS: `
.footer-dynamic-styles::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at -5% 55%, rgba(192, 38, 211, 0.15) 0%, transparent 38%),
    radial-gradient(ellipse at 105% 45%, rgba(147, 51, 234, 0.10) 0%, transparent 38%);
  pointer-events: none;
  z-index: 0;
}`,
      // Text colors
      textColor:        "#e2d9f3",
      headingColor:     "#ffffff",
      linkColor:        "#ffffff",
      linkHoverColor:   "#a855f7",
      accentColor:      "#a855f7",
      borderColor:      "#6b21a8",
      dividerStyle:     "solid",
      dividerColor:     "rgba(255,255,255,0.15)",
      // Typography
      headingSize:      "lg",
      headingWeight:    "bold",
      headingStyle:     "normal",
      // Social icons
      showSocialLinks:  true,
      socialPosition:   "brand",
      socialShape:      "circle",
      socialSize:       "md",
      socialColorMode:  "brand",
      socialHoverEffect: "scale",
      socialBgStyle:    "subtle",
      // Links
      linkPrefix:       "chevron",
      linkHoverEffect:  "color",
      // Trust badges — rendered inside brand column via showBrandBadges, not in bottom bar
      showTrustBadges:  false,
      trustBadges: JSON.stringify([
        { style: "pill", text: "Top Rated", iconName: "star",   iconColor: "#f59e0b", image: "", alt: "Top Rated" },
        { style: "pill", text: "Secure",    iconName: "shield", iconColor: "#06b6d4", image: "", alt: "Secure"    },
        { style: "pill", text: "Fast",      iconName: "zap",    iconColor: "#eab308", image: "", alt: "Fast"      },
      ]),
      // Bottom bar
      bottomBarEnabled: true,
      bottomBarLayout:  "split",
      copyrightText:    `© ${new Date().getFullYear()} EventPlanner Pro. All rights reserved. Made with ❤️ for event planners worldwide.`,
      showDisclaimer:   false,
      bottomLinks: JSON.stringify([
        { label: "Privacy Policy",   url: "/privacy"  },
        { label: "Terms of Service", url: "/terms"    },
        { label: "Cookie Policy",    url: "/cookies"  },
        { label: "Accessibility",    url: "/accessibility" },
      ]),
      // Spacing & effects
      paddingTop:       64,
      paddingBottom:    40,
      topBorderStyle:   "solid",
      topBorderHeight:  1,
      topBorderColor:   "#6b21a8",
      shadow:           "none",
      enableAnimations: false,
    },
  });
  console.log("   ✓ Footer config updated\n");

  // ─── Widget 1: Brand (Column 1) ────────────────────────────────────────────
  console.log("📦 Creating widgets...");
  await prisma.footerWidget.create({
    data: {
      footerId:  footer.id,
      type:      "BRAND",
      title:     null,
      showTitle: false,
      column:    1,
      sortOrder: 0,
      content: JSON.stringify({
        showTagline: true,
        tagline:     "The all-in-one platform for stress-free event planning. Plan, manage, and celebrate life's special moments with confidence.",
        showContact: false,
        showSocial:  false,  // Social shown via separate SOCIAL widget below
      }),
    },
  });
  console.log("   ✓ BRAND widget — Column 1");

  // ─── Widget 2: Social (Column 1, below Brand) ─────────────────────────────
  await prisma.footerWidget.create({
    data: {
      footerId:  footer.id,
      type:      "SOCIAL",
      title:     null,
      showTitle: false,
      column:    1,
      sortOrder: 1,
    },
  });
  console.log("   ✓ SOCIAL widget — Column 1 (below Brand)");

  // ─── Widget 3: For Planners (Column 2) ────────────────────────────────────
  const plannersWidget = await prisma.footerWidget.create({
    data: {
      footerId:    footer.id,
      type:        "LINKS",
      title:       "For Planners",
      showTitle:   true,
      headingIcon: "users",
      column:      2,
      sortOrder:   0,
    },
  });
  const plannerLinks = [
    { label: "Event Dashboard",   url: "/dashboard",       sortOrder: 0 },
    { label: "Guest Management",  url: "/#guests",         sortOrder: 1 },
    { label: "Budget Tracker",    url: "/#budget",         sortOrder: 2 },
    { label: "Checklist",         url: "/#checklist",      sortOrder: 3 },
    { label: "Invitations",       url: "/#invitations",    sortOrder: 4 },
  ];
  for (const link of plannerLinks) {
    await prisma.menuItem.create({ data: { ...link, footerWidgetId: plannersWidget.id, isVisible: true } });
  }
  console.log("   ✓ LINKS widget — For Planners (Column 2)");

  // ─── Widget 4: For Vendors (Column 3) ─────────────────────────────────────
  const vendorsWidget = await prisma.footerWidget.create({
    data: {
      footerId:    footer.id,
      type:        "LINKS",
      title:       "For Vendors",
      showTitle:   true,
      headingIcon: "building",
      column:      3,
      sortOrder:   0,
    },
  });
  const vendorLinks = [
    { label: "List Business",   url: "/vendors/register",  sortOrder: 0 },
    { label: "Dashboard",       url: "/vendor/dashboard",  sortOrder: 1 },
    { label: "Pricing",         url: "/pricing",           sortOrder: 2 },
    { label: "Success Stories", url: "/blog?tag=success",  sortOrder: 3 },
    { label: "Resources",       url: "/blog",              sortOrder: 4 },
  ];
  for (const link of vendorLinks) {
    await prisma.menuItem.create({ data: { ...link, footerWidgetId: vendorsWidget.id, isVisible: true } });
  }
  console.log("   ✓ LINKS widget — For Vendors (Column 3)");

  // ─── Widget 5: Event Types (Column 4) ─────────────────────────────────────
  const eventWidget = await prisma.footerWidget.create({
    data: {
      footerId:    footer.id,
      type:        "LINKS",
      title:       "Event Types",
      showTitle:   true,
      headingIcon: "party-popper",
      column:      4,
      sortOrder:   0,
    },
  });
  const eventLinks = [
    { label: "Weddings",     url: "/planner/create?type=wedding",   sortOrder: 0 },
    { label: "Birthdays",    url: "/planner/create?type=party",     sortOrder: 1 },
    { label: "Corporate",    url: "/planner/create?type=corporate", sortOrder: 2 },
    { label: "Baby Showers", url: "/planner/create?type=baptism",   sortOrder: 3 },
    { label: "Conferences",  url: "/planner/create?type=corporate", sortOrder: 4 },
  ];
  for (const link of eventLinks) {
    await prisma.menuItem.create({ data: { ...link, footerWidgetId: eventWidget.id, isVisible: true } });
  }
  console.log("   ✓ LINKS widget — Event Types (Column 4)");

  // ─── Widget 6: Support (Column 5) ─────────────────────────────────────────
  const supportWidget = await prisma.footerWidget.create({
    data: {
      footerId:    footer.id,
      type:        "LINKS",
      title:       "Support",
      showTitle:   true,
      headingIcon: "headphones",
      column:      5,
      sortOrder:   0,
    },
  });
  const supportLinks = [
    { label: "Help Center",  url: "/help",      sortOrder: 0 },
    { label: "Contact Us",   url: "/contact",   sortOrder: 1 },
    { label: "FAQs",         url: "/faq",       sortOrder: 2 },
    { label: "Blog",         url: "/blog",      sortOrder: 3 },
    { label: "Community",    url: "/community", sortOrder: 4 },
  ];
  for (const link of supportLinks) {
    await prisma.menuItem.create({ data: { ...link, footerWidgetId: supportWidget.id, isVisible: true } });
  }
  console.log("   ✓ LINKS widget — Support (Column 5)");

  // ─── Ensure all social links are set ─────────────────────────────────────────
  console.log("🔗 Ensuring social media links...");
  const socialLinks = [
    { key: "business.social.facebook",  value: "https://facebook.com/ceremoney"        },
    { key: "business.social.twitter",   value: "https://x.com/ceremoney"               },
    { key: "business.social.instagram", value: "https://instagram.com/ceremoney"       },
    { key: "business.social.linkedin",  value: "https://linkedin.com/company/ceremoney" },
  ];
  for (const s of socialLinks) {
    await prisma.setting.upsert({
      where:  { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, type: "url" },
    });
  }
  console.log("   ✓ Facebook, Twitter, Instagram, LinkedIn set\n");

  console.log("\n✅ Footer reference design seeded successfully!");
  console.log("   → Go to /admin/appearance/footer to preview and fine-tune.\n");
}

seedFooterDesign()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
