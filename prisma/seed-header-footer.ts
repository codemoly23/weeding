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
    { label: "Vendors", url: "/vendors", sortOrder: 2, isMegaMenu: true },
    { label: "Forums", url: "/forum", sortOrder: 3, isMegaMenu: true },
    { label: "Ideas", url: "/ideas", sortOrder: 4, isMegaMenu: true },
    { label: "Pricing", url: "/pricing", sortOrder: 5 },
    { label: "Blog", url: "/blog", sortOrder: 6 },
    { label: "Contact", url: "/contact", sortOrder: 7 },
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

  // Mega menu under Vendors
  const vendorsMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Vendors" },
  });

  if (vendorsMenuItem) {
    const vendorMegaMenuData = [
      {
        categoryName: "Start hiring your vendors",
        categoryIcon: "store",
        categoryDesc: "Browse all vendor categories",
        sortOrder: 0,
        items: [
          { label: "Photography",     url: "/vendors?category=PHOTOGRAPHY",    icon: "camera",         sortOrder: 0 },
          { label: "DJs",             url: "/vendors?category=MUSIC_DJ",       icon: "disc",           sortOrder: 1 },
          { label: "Hair & Makeup",   url: "/vendors?category=HAIR_MAKEUP",    icon: "sparkles",       sortOrder: 2 },
          { label: "Wedding Planning",url: "/vendors?category=WEDDING_PLANNER",icon: "clipboard-list", sortOrder: 3 },
          { label: "Catering",        url: "/vendors?category=CATERING",       icon: "utensils",       sortOrder: 4 },
          { label: "Flowers",         url: "/vendors?category=FLOWERS",        icon: "flower-2",       sortOrder: 5 },
          { label: "Videography",     url: "/vendors?category=VIDEOGRAPHY",    icon: "video",          sortOrder: 6 },
          { label: "Officiants",      url: "/vendors?category=OTHER",          icon: "user",           sortOrder: 7 },
        ],
      },
      {
        categoryName: "COMPLETE YOUR WEDDING TEAM",
        categoryIcon: "users",
        categoryDesc: "More vendor categories",
        sortOrder: 1,
        items: [
          { label: "Event Rentals",   url: "/vendors?category=DECORATIONS",    icon: "", sortOrder: 0 },
          { label: "Photo Booths",    url: "/vendors?category=PHOTOGRAPHY",    icon: "", sortOrder: 1 },
          { label: "Bands",           url: "/vendors?category=MUSIC_DJ",       icon: "", sortOrder: 2 },
          { label: "Dress & Attire",  url: "/vendors?category=DRESS_ATTIRE",   icon: "", sortOrder: 3 },
          { label: "Cakes",           url: "/vendors?category=CATERING",       icon: "", sortOrder: 4 },
          { label: "Transportation",  url: "/vendors?category=TRANSPORTATION", icon: "", sortOrder: 5 },
          { label: "Ceremony Music",  url: "/vendors?category=MUSIC_DJ",       icon: "", sortOrder: 6 },
          { label: "Lighting & Decor",url: "/vendors?category=DECORATIONS",    icon: "", sortOrder: 7 },
          { label: "Invitations",     url: "/vendors",                         icon: "", sortOrder: 8 },
          { label: "Travel Agents",   url: "/vendors",                         icon: "", sortOrder: 9 },
          { label: "Jewelry",         url: "/vendors?category=RINGS",          icon: "", sortOrder: 10 },
          { label: "Favors & Gifts",  url: "/vendors",                         icon: "", sortOrder: 11 },
          { label: "Deals",           url: "/vendors",                         icon: "", sortOrder: 12 },
        ],
      },
    ];

    for (const category of vendorMegaMenuData) {
      const categoryItem = await prisma.menuItem.create({
        data: {
          label: category.categoryName,
          categoryName: category.categoryName,
          categoryIcon: category.categoryIcon,
          categoryDesc: category.categoryDesc,
          parentId: vendorsMenuItem.id,
          headerId: header.id,
          sortOrder: category.sortOrder,
          isVisible: true,
        },
      });
      console.log(`   ✓ Created vendor category: ${category.categoryName}`);

      for (const item of category.items) {
        await prisma.menuItem.create({
          data: {
            label: item.label,
            url: item.url,
            icon: item.icon,
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

  // Forums megaMenuContent (forums-grid rich content)
  const forumsMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Forums" },
  });

  if (forumsMenuItem) {
    await prisma.menuItem.update({
      where: { id: forumsMenuItem.id },
      data: {
        megaMenuContent: {
          type: "forums-grid",
          header: "Forums",
          groups: [
            {
              title: "",
              items: [
                { name: "Planning",                 href: "/forum/planning",       icon: "calendar" },
                { name: "Ceremony",                 href: "/forum/ceremony",       icon: "heart" },
                { name: "Style and Décor",          href: "/forum/style-decor",   icon: "sparkles" },
                { name: "Wedding Attire",           href: "/forum/wedding-attire", icon: "shirt" },
                { name: "Married Life",             href: "/forum/married-life",  icon: "heart-handshake" },
                { name: "Fitness and Health",       href: "/forum/fitness",       icon: "activity" },
                { name: "Honeymoon",                href: "/forum/honeymoon",     icon: "plane" },
                { name: "Family and Relationships", href: "/forum/family",        icon: "users" },
                { name: "Hair and Makeup",          href: "/forum/hair-makeup",   icon: "palette" },
                { name: "Community Conversations",  href: "/forum/community",     icon: "message-circle" },
                { name: "Etiquette and Advice",     href: "/forum/etiquette",     icon: "help-circle" },
                { name: "Registry",                 href: "/forum/registry",      icon: "gift" },
                { name: "Reception",                href: "/forum/reception",     icon: "music" },
                { name: "Parties and Events",       href: "/forum/parties",       icon: "party-popper" },
                { name: "Local Groups",             href: "/forum/local",         icon: "map-pin" },
              ],
            },
          ],
          sidebar: {
            title: "STAY UP TO DATE",
            items: [
              { name: "Discussions",     href: "/forum",          icon: "message-square" },
              { name: "Photos",          href: "/forum/photos",   icon: "image" },
              { name: "Videos",          href: "/forum/videos",   icon: "video" },
              { name: "Users",           href: "/forum/users",    icon: "user" },
              { name: "Account support", href: "/forum/support",  icon: "help-circle" },
            ],
          },
        },
      },
    });
    console.log("   ✓ Forums megaMenuContent set");
  }

  // Ideas megaMenuContent (ideas-grid rich content)
  const ideasMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Ideas" },
  });

  if (ideasMenuItem) {
    await prisma.menuItem.update({
      where: { id: ideasMenuItem.id },
      data: {
        megaMenuContent: {
          type: "ideas-grid",
          columns: [
            {
              title: "Decor",
              items: [
                { name: "Wedding Themes",     icon: "palette",      href: "/ideas/themes" },
                { name: "Floral Arrangements", icon: "flower-2",     href: "/ideas/flowers" },
                { name: "Table Settings",      icon: "layout-grid",  href: "/ideas/tables" },
                { name: "Ceremony Decor",      icon: "star",         href: "/ideas/ceremony" },
              ],
            },
            {
              title: "Celebration",
              items: [
                { name: "Reception Ideas",  icon: "party-popper", href: "/ideas/reception" },
                { name: "Wedding Favors",   icon: "gift",         href: "/ideas/favors" },
                { name: "Photo Ideas",      icon: "camera",       href: "/ideas/photos" },
                { name: "Honeymoon Ideas",  icon: "plane",        href: "/ideas/honeymoon" },
              ],
            },
          ],
        },
      },
    });
    console.log("   ✓ Ideas megaMenuContent set");
  }

  // Wedding Website megaMenuContent (featured-gallery rich content)
  const weddingWebsiteMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Wedding Website" },
  });

  if (weddingWebsiteMenuItem) {
    await prisma.menuItem.update({
      where: { id: weddingWebsiteMenuItem.id },
      data: {
        megaMenuContent: {
          type: "featured-gallery",
          sectionHeader: "Set up your website in minutes",
          topLinks: [
            { name: "Create your wedding website", href: "/wedding-website/create" },
            { name: "Find a couple website", href: "/wedding-website/search" },
          ],
          gallery: {
            title: "CHOOSE YOUR DESIGN",
            aspectRatio: "portrait",
            items: [
              { name: "Minimal Leaves",    imageUrl: "/designers/1777006588323-ww1.png", href: "/wedding-website/themes/minimal-leaves" },
              { name: "Painted Desert",    imageUrl: "/designers/1777006595094-ww2.png", href: "/wedding-website/themes/painted-desert" },
              { name: "Classic Garden",    imageUrl: "/designers/1777006599600-ww3.png", href: "/wedding-website/themes/classic-garden" },
              { name: "Formal Ampersand", imageUrl: "/designers/1777006603262-ww4.png", href: "/wedding-website/themes/formal-ampersand" },
            ],
          },
          footerLink: { text: "See all website designs", href: "/wedding-website/themes" },
        },
      },
    });
    console.log("   ✓ Wedding Website megaMenuContent set");
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
