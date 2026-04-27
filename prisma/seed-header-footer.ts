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
      logoMaxHeight: 48,
      showAuthButtons: true,
      loginText: "Sign In",
      loginUrl: "/login",
      loginStyle: JSON.stringify({ bgColor: "transparent", textColor: "#374151", borderWidth: 0, borderRadius: 6, hoverBgColor: "#f3f4f6" }),
      registerText: "Start Free",
      registerUrl: "/register",
      registerStyle: JSON.stringify({ bgColor: "#F97316", textColor: "#ffffff", borderWidth: 0, borderRadius: 6, hoverBgColor: "#EA580C" }),
      searchEnabled: false,
      mobileBreakpoint: 1024,
      height: 72,
      textColor: "#1e293b",
      hoverColor: "#9810fa",
      ctaButtons: JSON.stringify([
        {
          text: "Start Planning Free",
          url: "/register",
          style: { bgColor: "#BE6B8B", textColor: "#ffffff", borderWidth: 0, hoverEffect: "darken", borderRadius: 8 },
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
    { label: "Planning Tools",  url: null,                 sortOrder: 0, isMegaMenu: true, megaMenuColumns: 2 },
    { label: "Venues",          url: null,                 sortOrder: 1, isMegaMenu: true, megaMenuColumns: 3 },
    { label: "Vendors",         url: "/vendors",           sortOrder: 2, isMegaMenu: true },
    { label: "Forums",          url: "/forum",             sortOrder: 3, isMegaMenu: true },
    { label: "Dresses",         url: "/dresses",           sortOrder: 4, isMegaMenu: true, megaMenuColumns: 4 },
    { label: "Ideas",           url: "/ideas",             sortOrder: 5, isMegaMenu: true },
    { label: "Registry",        url: "/registry",          sortOrder: 6, isMegaMenu: true, megaMenuColumns: 4 },
    { label: "Wedding Website", url: "/wedding-website",   sortOrder: 7, isMegaMenu: true, megaMenuColumns: 4 },
    { label: "About Us",        url: "/about",             sortOrder: 8, isMegaMenu: false },
    { label: "Contact Us",      url: "/contact",           sortOrder: 9, isMegaMenu: false },
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

  // Mega menu under Planning Tools
  const planningToolsMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Planning Tools" },
  });

  if (planningToolsMenuItem) {
    const ptCategories = [
      {
        label: "Organize with ease",
        sortOrder: 0,
        items: [
          { label: "Checklist",      url: "/tools/checklist",       icon: "ClipboardList", sortOrder: 0 },
          { label: "Seating chart",  url: "/tools/seating",         icon: "heater",        sortOrder: 1 },
          { label: "Event Vendors",  url: "/vendors",               icon: "FolderOpen",    sortOrder: 2 },
          { label: "Guests",         url: "/tools/guests",          icon: "Users",         sortOrder: 3 },
          { label: "Budget",         url: "/tools/budget",          icon: "Calculator",    sortOrder: 4 },
          { label: "Event website",  url: "/wedding-website",       icon: "Globe",         sortOrder: 5 },
        ],
      },
      {
        label: "Personalize your event",
        sortOrder: 1,
        items: [
          { label: "Hotel Blocks",        url: "/tools/hotel-blocks",      icon: "", sortOrder: 0 },
          { label: "Date Finder",         url: "/tools/date-finder",       icon: "", sortOrder: 1 },
          { label: "Cost Guide",          url: "/tools/cost-guide",        icon: "", sortOrder: 2 },
          { label: "Color generator",     url: "/tools/color-generator",   icon: "", sortOrder: 3 },
          { label: "Hashtag generator",   url: "/tools/hashtag-generator", icon: "", sortOrder: 4 },
        ],
      },
    ];

    for (const cat of ptCategories) {
      const catItem = await prisma.menuItem.create({
        data: { label: cat.label, parentId: planningToolsMenuItem.id, headerId: header.id, sortOrder: cat.sortOrder, isVisible: true },
      });
      for (const item of cat.items) {
        await prisma.menuItem.create({
          data: { label: item.label, url: item.url, icon: item.icon || null, parentId: catItem.id, headerId: header.id, sortOrder: item.sortOrder, isVisible: true },
        });
      }
      console.log(`   ✓ Planning Tools category: ${cat.label} (${cat.items.length} items)`);
    }
  }

  // Mega menu under Venues
  const venuesMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Venues" },
  });

  if (venuesMenuItem) {
    const venueCategories = [
      {
        label: "Wedding Venues",
        sortOrder: 0,
        items: [
          { label: "All Wedding Venues",  url: "/venues/wedding",         icon: "Heart",      sortOrder: 0 },
          { label: "Banquet Halls",       url: "/venues/banquet-halls",   icon: "Building2",  sortOrder: 1 },
          { label: "Wineries",            url: "/venues/wineries",        icon: "Wine",        sortOrder: 2 },
          { label: "Gardens",             url: "/venues/gardens",         icon: "Flower2",     sortOrder: 3 },
          { label: "Beach Venues",        url: "/venues/beach",           icon: "Waves",       sortOrder: 4 },
          { label: "Mansions",            url: "/venues/mansions",        icon: "Home",        sortOrder: 5 },
        ],
      },
      {
        label: "Party & Event Venues",
        sortOrder: 1,
        items: [
          { label: "Party Halls",         url: "/venues/party-halls",         icon: "PartyPopper", sortOrder: 0 },
          { label: "Conference Centers",  url: "/venues/conference-centers",  icon: "Briefcase",   sortOrder: 1 },
          { label: "Hotels",              url: "/venues/hotels",              icon: "Hotel",        sortOrder: 2 },
          { label: "Historic Venues",     url: "/venues/historic",            icon: "Landmark",     sortOrder: 3 },
          { label: "Yachts & Boats",      url: "/venues/yachts",             icon: "Ship",          sortOrder: 4 },
          { label: "Outdoor Venues",      url: "/venues/outdoor",             icon: "TreePine",     sortOrder: 5 },
        ],
      },
      {
        label: "Specialty Venues",
        sortOrder: 2,
        items: [
          { label: "Religious Venues",    url: "/venues/religious",   icon: "Church",   sortOrder: 0 },
          { label: "Luxury Estates",      url: "/venues/luxury",      icon: "Diamond",  sortOrder: 1 },
          { label: "Destination Venues",  url: "/venues/destination", icon: "Plane",    sortOrder: 2 },
          { label: "Unique Spaces",       url: "/venues/unique",      icon: "Store",    sortOrder: 3 },
          { label: "Find Near Me",        url: "/venues/near-me",     icon: "MapPin",   sortOrder: 4 },
        ],
      },
    ];

    for (const cat of venueCategories) {
      const catItem = await prisma.menuItem.create({
        data: { label: cat.label, parentId: venuesMenuItem.id, headerId: header.id, sortOrder: cat.sortOrder, isVisible: true },
      });
      for (const item of cat.items) {
        await prisma.menuItem.create({
          data: { label: item.label, url: item.url, icon: item.icon || null, parentId: catItem.id, headerId: header.id, sortOrder: item.sortOrder, isVisible: true },
        });
      }
      console.log(`   ✓ Venues category: ${cat.label} (${cat.items.length} items)`);
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

  // Dresses megaMenuContent (featured-gallery)
  const dressesMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Dresses" },
  });

  if (dressesMenuItem) {
    await prisma.menuItem.update({
      where: { id: dressesMenuItem.id },
      data: {
        megaMenuContent: {
          type: "featured-gallery",
          sectionHeader: "The latest in bridal fashion",
          topLinks: [{ name: "Bride", href: "/dresses/bridal", icon: "shirt" }],
          gallery: {
            title: "FEATURED DESIGNERS",
            aspectRatio: "portrait",
            items: [
              { name: "Essense of Australia",     imageUrl: "/designers/1777004155592-dre1.png", href: "/dresses/essense-of-australia" },
              { name: "Martina Liana Luxe",       imageUrl: "/designers/1777004214636-dre2.png", href: "/dresses/martina-liana-luxe" },
              { name: "Le Blanc by Casablanca",   imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=533&fit=crop", href: "/dresses/casablanca-bridal" },
              { name: "Martina Liana",            imageUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=533&fit=crop", href: "/dresses/martina-liana" },
              { name: "Justin Alexander",         imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=533&fit=crop", href: "/dresses/justin-alexander" },
            ],
          },
        },
      },
    });
    console.log("   ✓ Dresses megaMenuContent set");
  }

  // Registry megaMenuContent (featured-gallery)
  const registryMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Registry" },
  });

  if (registryMenuItem) {
    await prisma.menuItem.update({
      where: { id: registryMenuItem.id },
      data: {
        megaMenuContent: {
          type: "featured-gallery",
          sectionHeader: "Create your all-in-one registry",
          topLinks: [
            { name: "Start Your Registry",  href: "/registry/start" },
            { name: "Registry Retailers",   href: "/registry/retailers" },
            { name: "Registry Ideas",       href: "/registry/ideas" },
          ],
          gallery: {
            title: "FEATURED REGISTRY BRANDS",
            aspectRatio: "square",
            items: [
              { name: "Amazon",         imageUrl: "/designers/1777004751803-amazon.png",  href: "/registry/amazon" },
              { name: "Crate & Barrel", imageUrl: "/designers/1777004759059-crearte.png", href: "/registry/crate-barrel" },
              { name: "Target",         imageUrl: "/designers/1777004763644-tar.png",      href: "/registry/target" },
              { name: "Traveler's Joy", imageUrl: "/designers/1777004769186-travel.png",  href: "/registry/travelers-joy" },
            ],
          },
          featuredLink: { text: "Find a couple's Registry", href: "/registry/find" },
          footerLink:   { text: "See all registry brands",  href: "/registry/brands" },
        },
      },
    });
    console.log("   ✓ Registry megaMenuContent set");
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
          header: "Get wedding inspiration",
          columns: [
            {
              title: "",
              items: [
                { name: "Planning Basics",      href: "/ideas/planning" },
                { name: "Wedding Ceremony",     href: "/ideas/ceremony" },
                { name: "Wedding Reception",    href: "/ideas/reception" },
                { name: "Wedding Services",     href: "/ideas/services" },
                { name: "Wedding Fashion",      href: "/ideas/fashion" },
              ],
            },
            {
              title: "",
              items: [
                { name: "Hair & Makeup",        href: "/ideas/hair-makeup" },
                { name: "Destination Weddings", href: "/ideas/destination" },
                { name: "Married Life",         href: "/ideas/married-life" },
                { name: "Events & Parties",     href: "/ideas/events" },
                { name: "Family & Friends",     href: "/ideas/family" },
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
            { name: "Find a couple's website",     href: "/wedding-website/find" },
          ],
          gallery: {
            title: "CHOOSE YOUR DESIGN",
            aspectRatio: "square",
            items: [
              { name: "Minimal Leaves",   imageUrl: "/designers/1777006588323-ww1.png", href: "/wedding-website/themes?style=minimal-leaves" },
              { name: "Painted Desert",   imageUrl: "/designers/1777006595094-ww2.png", href: "/wedding-website/themes?style=painted-desert" },
              { name: "Classic Garden",   imageUrl: "/designers/1777006599600-ww3.png", href: "/wedding-website/themes?style=classic-garden" },
              { name: "Formal Ampersand", imageUrl: "/designers/1777006603262-ww4.png", href: "/wedding-website/themes?style=formal-ampersand" },
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
