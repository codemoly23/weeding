/**
 * Seed Header & Footer Configuration
 *
 * Default header and footer for Ceremoney — wedding & event planning platform.
 */

import prisma from "../src/lib/db";

async function seedHeaderFooter() {
  console.log("🎨 Seeding Header & Footer Configuration...\n");

  // ==========================================
  // HEADER CONFIGURATION
  // ==========================================
  console.log("📌 Creating Header Configuration...");

  await prisma.menuItem.deleteMany({
    where: { headerId: { not: null } },
  });
  await prisma.headerConfig.deleteMany({});

  const header = await prisma.headerConfig.create({
    data: {
      name: "Default Header",
      isActive: true,
      layout: "DEFAULT",
      sticky: true,
      transparent: false,
      topBarEnabled: false,
      logoPosition: "LEFT",
      logoMaxHeight: 56,
      showAuthButtons: true,
      loginText: "Sign In",
      registerText: "Start Planning",
      registerUrl: "/register",
      searchEnabled: false,
      mobileBreakpoint: 1024,
      height: 80,
      ctaButtons: JSON.stringify([
        {
          text: "Start Planning",
          url: "/register",
          variant: "primary",
        },
      ]),
    },
  });

  console.log(`   ✓ Created header config: ${header.id}`);

  // ==========================================
  // HEADER MENU ITEMS
  // ==========================================
  console.log("\n📌 Creating Header Menu Items...");

  const menuItems = [
    { label: "Home", url: "/", sortOrder: 0 },
    { label: "Features", url: "/#features", sortOrder: 1, isMegaMenu: true },
    { label: "Vendors", url: "/vendors", sortOrder: 2 },
    { label: "Pricing", url: "/pricing", sortOrder: 3 },
    { label: "Blog", url: "/blog", sortOrder: 4 },
    { label: "Contact", url: "/contact", sortOrder: 5 },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        ...item,
        headerId: header.id,
        isVisible: true,
        visibleOnMobile: true,
      },
    });
    console.log(`   ✓ Created menu item: ${item.label}`);
  }

  // Mega menu under Features
  const featuresMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Features" },
  });

  if (featuresMenuItem) {
    const megaMenuData = [
      {
        categoryName: "Planning Tools",
        categoryIcon: "calendar",
        categoryDesc: "Everything you need to plan",
        sortOrder: 0,
        items: [
          { label: "Guest Management", url: "/#guests", badge: "Core", sortOrder: 0 },
          { label: "Seating Chart Editor", url: "/#seating", badge: "Popular", sortOrder: 1 },
          { label: "12-Month Checklist", url: "/#checklist", sortOrder: 2 },
          { label: "Budget Tracker", url: "/#budget", sortOrder: 3 },
          { label: "Event Itinerary", url: "/#itinerary", sortOrder: 4 },
        ],
      },
      {
        categoryName: "Event Website",
        categoryIcon: "globe",
        categoryDesc: "Beautiful public event pages",
        sortOrder: 1,
        items: [
          { label: "RSVP Forms", url: "/#rsvp", badge: "Popular", sortOrder: 0 },
          { label: "Website Builder", url: "/#website", sortOrder: 1 },
          { label: "Invitation Designer", url: "/#invitations", sortOrder: 2 },
          { label: "Countdown Timer", url: "/#countdown", sortOrder: 3 },
          { label: "Photo Gallery", url: "/#gallery", sortOrder: 4 },
        ],
      },
      {
        categoryName: "Vendor Tools",
        categoryIcon: "store",
        categoryDesc: "Find and manage vendors",
        sortOrder: 2,
        items: [
          { label: "Vendor Directory", url: "/vendors", badge: "Popular", sortOrder: 0 },
          { label: "Vendor Inquiries", url: "/#inquiries", sortOrder: 1 },
          { label: "Vendor Reviews", url: "/#reviews", sortOrder: 2 },
        ],
      },
      {
        categoryName: "Advanced",
        categoryIcon: "sparkles",
        categoryDesc: "Elite plan features",
        sortOrder: 3,
        items: [
          { label: "Stationery Engine", url: "/#stationery", badge: "Elite", sortOrder: 0 },
          { label: "QR Entrance Mode", url: "/#qr", badge: "Elite", sortOrder: 1 },
          { label: "Collaborators", url: "/#collaborators", badge: "Elite", sortOrder: 2 },
          { label: "SMS Credits", url: "/#sms", badge: "Elite", sortOrder: 3 },
        ],
      },
    ];

    for (const category of megaMenuData) {
      const categoryItem = await prisma.menuItem.create({
        data: {
          label: category.categoryName,
          categoryName: category.categoryName,
          categoryIcon: category.categoryIcon,
          categoryDesc: category.categoryDesc,
          parentId: featuresMenuItem.id,
          headerId: header.id,
          sortOrder: category.sortOrder,
          isVisible: true,
        },
      });
      console.log(`   ✓ Created category: ${category.categoryName}`);

      for (const item of category.items) {
        await prisma.menuItem.create({
          data: {
            label: item.label,
            url: item.url,
            badge: item.badge,
            parentId: categoryItem.id,
            headerId: header.id,
            sortOrder: item.sortOrder,
            isVisible: true,
          },
        });
      }
      console.log(`      → Added ${category.items.length} items`);
    }
  }

  // ==========================================
  // FOOTER CONFIGURATION
  // ==========================================
  console.log("\n📌 Creating Footer Configuration...");

  await prisma.menuItem.deleteMany({
    where: { footerWidgetId: { not: null } },
  });
  await prisma.footerWidget.deleteMany({});
  await prisma.footerConfig.deleteMany({});

  const footer = await prisma.footerConfig.create({
    data: {
      name: "Default Footer",
      isActive: true,
      layout: "MULTI_COLUMN",
      columns: 5,
      newsletterEnabled: true,
      newsletterTitle: "Stay inspired",
      newsletterSubtitle: "Get wedding tips, planning guides, and product updates.",
      showSocialLinks: true,
      socialPosition: "brand",
      showContactInfo: true,
      contactPosition: "brand",
      bottomBarEnabled: true,
      showDisclaimer: true,
      disclaimerText: "© Ceremoney. All rights reserved. Ceremoney is a wedding and event planning platform, not a legal or financial service.",
      bottomLinks: JSON.stringify([
        { label: "Privacy Policy", url: "/privacy" },
        { label: "Terms of Service", url: "/terms" },
        { label: "Refund Policy", url: "/refund-policy" },
      ]),
      paddingTop: 48,
      paddingBottom: 32,
    },
  });

  console.log(`   ✓ Created footer config: ${footer.id}`);

  // ==========================================
  // FOOTER WIDGETS
  // ==========================================
  console.log("\n📌 Creating Footer Widgets...");

  // Widget 1: Brand (Column 1)
  await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "BRAND",
      title: null,
      showTitle: false,
      column: 1,
      sortOrder: 0,
      content: JSON.stringify({
        showLogo: true,
        showDescription: true,
        showContact: true,
        showSocial: true,
      }),
    },
  });
  console.log("   ✓ Created BRAND widget (Column 1)");

  // Widget 2: Features (Column 2)
  const featuresWidget = await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "LINKS",
      title: "Features",
      showTitle: true,
      column: 2,
      sortOrder: 0,
    },
  });

  const featureLinks = [
    { label: "Guest Management", url: "/#guests", sortOrder: 0 },
    { label: "Seating Chart", url: "/#seating", sortOrder: 1 },
    { label: "Event Website", url: "/#website", sortOrder: 2 },
    { label: "RSVP Forms", url: "/#rsvp", sortOrder: 3 },
    { label: "Budget Tracker", url: "/#budget", sortOrder: 4 },
    { label: "Vendor Directory", url: "/vendors", sortOrder: 5 },
  ];

  for (const link of featureLinks) {
    await prisma.menuItem.create({
      data: { ...link, footerWidgetId: featuresWidget.id, isVisible: true },
    });
  }
  console.log("   ✓ Created LINKS widget: Features (Column 2)");

  // Widget 3: Event Types (Column 3)
  const eventTypesWidget = await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "LINKS",
      title: "Event Types",
      showTitle: true,
      column: 3,
      sortOrder: 0,
    },
  });

  const eventTypeLinks = [
    { label: "Wedding Planning", url: "/planner/create?type=wedding", sortOrder: 0 },
    { label: "Baptism Planning", url: "/planner/create?type=baptism", sortOrder: 1 },
    { label: "Party Planning", url: "/planner/create?type=party", sortOrder: 2 },
    { label: "Corporate Events", url: "/planner/create?type=corporate", sortOrder: 3 },
    { label: "White Label", url: "/pricing#white-label", sortOrder: 4 },
  ];

  for (const link of eventTypeLinks) {
    await prisma.menuItem.create({
      data: { ...link, footerWidgetId: eventTypesWidget.id, isVisible: true },
    });
  }
  console.log("   ✓ Created LINKS widget: Event Types (Column 3)");

  // Widget 4: Company (Column 4)
  const companyWidget = await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "LINKS",
      title: "Company",
      showTitle: true,
      column: 4,
      sortOrder: 0,
    },
  });

  const companyLinks = [
    { label: "About Us", url: "/about", sortOrder: 0 },
    { label: "Pricing", url: "/pricing", sortOrder: 1 },
    { label: "Blog", url: "/blog", sortOrder: 2 },
    { label: "FAQs", url: "/faq", sortOrder: 3 },
    { label: "Contact", url: "/contact", sortOrder: 4 },
  ];

  for (const link of companyLinks) {
    await prisma.menuItem.create({
      data: { ...link, footerWidgetId: companyWidget.id, isVisible: true },
    });
  }
  console.log("   ✓ Created LINKS widget: Company (Column 4)");

  // Widget 5: Legal (Column 5)
  const legalWidget = await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "LINKS",
      title: "Legal",
      showTitle: true,
      column: 5,
      sortOrder: 0,
    },
  });

  const legalLinks = [
    { label: "Privacy Policy", url: "/privacy", sortOrder: 0 },
    { label: "Terms of Service", url: "/terms", sortOrder: 1 },
    { label: "Refund Policy", url: "/refund-policy", sortOrder: 2 },
    { label: "Disclaimer", url: "/disclaimer", sortOrder: 3 },
  ];

  for (const link of legalLinks) {
    await prisma.menuItem.create({
      data: { ...link, footerWidgetId: legalWidget.id, isVisible: true },
    });
  }
  console.log("   ✓ Created LINKS widget: Legal (Column 5)");

  // ==========================================
  // SUMMARY
  // ==========================================
  const menuItemCount = await prisma.menuItem.count();
  const widgetCount = await prisma.footerWidget.count();

  console.log("\n" + "=".repeat(50));
  console.log("✅ Header & Footer Seeding Complete!");
  console.log("=".repeat(50));
  console.log(`   📌 Header Config: 1`);
  console.log(`   📌 Menu Items: ${menuItemCount}`);
  console.log(`   📌 Footer Config: 1`);
  console.log(`   📌 Footer Widgets: ${widgetCount}`);
  console.log("=".repeat(50) + "\n");
}

seedHeaderFooter()
  .catch((e) => {
    console.error("❌ Error seeding header/footer:", e);
    process.exit(1);
  });
