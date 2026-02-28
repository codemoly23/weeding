import prisma from "@/lib/db";
import type {
  ThemeData,
  ThemeColorPalette,
  ThemeServiceCategory,
  ThemeService,
  ThemeServicePackage,
  ThemeComparisonFeature,
  ThemePage,
  ThemePageBlock,
  ThemeBlogCategory,
  ThemeBlogPost,
  ThemeFAQ,
  ThemeTestimonial,
  ThemeLegalPage,
  ThemeHeaderConfig,
  ThemeMenuItem,
  ThemeFooterConfig,
  ThemeFooterWidget,
  ThemeFormTemplate,
  ThemeFormTab,
  ThemeFormField,
  ThemeLocation,
  ThemeLocationFee,
  ThemeTicker,
  ThemeSettings,
} from "./theme-types";
// ============================================
// HELPER: Convert Prisma Decimal to number
// ============================================

/** Duck-typed interface matching Prisma Decimal objects */
interface DecimalLike {
  toNumber(): number;
}

function decimalToNumber(value: DecimalLike | null | undefined): number {
  if (value == null) return 0;
  return value.toNumber();
}

// ============================================
// DEFAULT COLOR PALETTE
// ============================================

const DEFAULT_COLOR_PALETTE: ThemeColorPalette = {
  light: {
    background: "#ffffff",
    foreground: "#0f172a",
    card: "#ffffff",
    "card-foreground": "#0f172a",
    popover: "#ffffff",
    "popover-foreground": "#0f172a",
    primary: "#F97316",
    "primary-foreground": "#ffffff",
    secondary: "#0A0F1E",
    "secondary-foreground": "#ffffff",
    muted: "#F1F5F9",
    "muted-foreground": "#64748B",
    accent: "#F97316",
    "accent-foreground": "#ffffff",
    destructive: "#EF4444",
    "destructive-foreground": "#ffffff",
    border: "#E2E8F0",
    input: "#E2E8F0",
    ring: "#F97316",
  },
  dark: {
    background: "#0f172a",
    foreground: "#f8fafc",
    card: "#0f172a",
    "card-foreground": "#f8fafc",
    popover: "#0f172a",
    "popover-foreground": "#f8fafc",
    primary: "#F97316",
    "primary-foreground": "#ffffff",
    secondary: "#1e293b",
    "secondary-foreground": "#f8fafc",
    muted: "#1e293b",
    "muted-foreground": "#94a3b8",
    accent: "#1e293b",
    "accent-foreground": "#f8fafc",
    destructive: "#7f1d1d",
    "destructive-foreground": "#ffffff",
    border: "#1e293b",
    input: "#1e293b",
    ring: "#F97316",
  },
};

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

export async function exportThemeData(): Promise<ThemeData> {
  // ---- Settings ----
  const settingsRows = await prisma.setting.findMany();
  const settings: ThemeSettings = {};
  for (const row of settingsRows) {
    settings[row.key] = row.value;
  }

  // ---- Active Theme Color Palette ----
  const activeTheme = await prisma.activeTheme.findFirst();
  const colorPalette: ThemeColorPalette =
    activeTheme?.colorPalette != null
      ? (activeTheme.colorPalette as unknown as ThemeColorPalette)
      : DEFAULT_COLOR_PALETTE;
  const fontConfig = activeTheme?.fontConfig != null
    ? (activeTheme.fontConfig as unknown as Record<string, string>)
    : undefined;

  // ---- Service Categories ----
  const categoriesRaw = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const serviceCategories: ThemeServiceCategory[] = categoriesRaw.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    icon: c.icon ?? "",
    color: c.color ?? "",
    sortOrder: c.sortOrder,
  }));

  // ---- Services with ALL relations ----
  const servicesRaw = await prisma.service.findMany({
    include: {
      category: true,
      packages: {
        include: {
          features: true,
          notIncluded: true,
          featureMap: { include: { feature: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      features: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      formTemplate: {
        include: {
          tabs: {
            include: { fields: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const services: ThemeService[] = servicesRaw.map((svc) => {
    // Map packages
    const packages: ThemeServicePackage[] = svc.packages.map((pkg) => ({
      name: pkg.name,
      price: decimalToNumber(pkg.priceUSD),
      compareAtPrice: pkg.compareAtPriceUSD ? decimalToNumber(pkg.compareAtPriceUSD) : null,
      description: pkg.description ?? "",
      processingTime: pkg.processingTime ?? undefined,
      processingIcon: pkg.processingIcon ?? undefined,
      badgeText: pkg.badgeText ?? null,
      badgeColor: pkg.badgeColor ?? null,
      features: pkg.features.map((f) => f.text),
      notIncluded: pkg.notIncluded.map((ni) => ni.text),
      isPopular: pkg.isPopular,
    }));

    // Build comparison features from service features + package feature maps
    const comparisonFeatures: ThemeComparisonFeature[] = svc.features.map(
      (feature) => {
        const packagesMap: ThemeComparisonFeature["packages"] = {};
        for (const pkg of svc.packages) {
          const mapping = pkg.featureMap.find(
            (fm) => fm.featureId === feature.id
          );
          if (mapping) {
            packagesMap[pkg.name] = {
              valueType: mapping.valueType,
              included: mapping.included,
              customValue: mapping.customValue ?? undefined,
              addonPriceUSD: mapping.addonPriceUSD
                ? decimalToNumber(mapping.addonPriceUSD)
                : undefined,
              addonPriceBDT: mapping.addonPriceBDT
                ? decimalToNumber(mapping.addonPriceBDT)
                : undefined,
            };
          }
        }
        return {
          text: feature.text,
          tooltip: feature.tooltip ?? undefined,
          description: feature.description ?? undefined,
          sortOrder: feature.sortOrder,
          packages: packagesMap,
        };
      }
    );

    // Parse displayOptions from JSON field
    let displayOptions: Record<string, unknown> | undefined;
    if (svc.displayOptions != null && typeof svc.displayOptions === "object") {
      displayOptions = svc.displayOptions as Record<string, unknown>;
    }

    return {
      slug: svc.slug,
      name: svc.name,
      shortDesc: svc.shortDesc,
      metaTitle: svc.metaTitle ?? undefined,
      metaDescription: svc.metaDescription ?? undefined,
      description: svc.description,
      icon: svc.icon ?? "",
      image: svc.image ?? undefined,
      startingPrice: decimalToNumber(svc.startingPrice),
      categorySlug: svc.category?.slug ?? "",
      isPopular: svc.isPopular,
      badgeText: svc.badgeText ?? null,
      badgeColor: svc.badgeColor ?? null,
      sortOrder: svc.sortOrder,
      features: svc.features.map((f) => f.text),
      packages,
      comparisonFeatures:
        comparisonFeatures.length > 0 ? comparisonFeatures : undefined,
      faqs: svc.faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      })),
      displayOptions,
      hasLocationBasedPricing: svc.hasLocationBasedPricing || undefined,
      locationFeeLabel: svc.locationFeeLabel ?? undefined,
    };
  });

  // ---- Form Templates (extracted from service includes) ----
  const formTemplates: ThemeFormTemplate[] = servicesRaw
    .filter((svc) => svc.formTemplate != null)
    .map((svc) => {
      const tmpl = svc.formTemplate!;
      const tabs: ThemeFormTab[] = tmpl.tabs.map((tab) => {
        const fields: ThemeFormField[] = tab.fields.map((field) => {
          const f: ThemeFormField = {
            name: field.name,
            label: field.label,
            type: field.type,
            placeholder: field.placeholder ?? undefined,
            required: field.required,
            options: field.options
              ? (field.options as string[])
              : undefined,
            validation: field.validation
              ? (field.validation as Record<string, unknown>)
              : undefined,
          };
          // Include additional properties that match ThemeFormField's index signature
          if (field.helpText) f.helpText = field.helpText;
          if (field.width) f.width = field.width;
          if (field.defaultValue) f.defaultValue = field.defaultValue;
          if (field.dataSourceType) f.dataSourceType = field.dataSourceType;
          if (field.dataSourceKey) f.dataSourceKey = field.dataSourceKey;
          if (field.dependsOn) f.dependsOn = field.dependsOn;
          if (field.conditionalLogic)
            f.conditionalLogic = field.conditionalLogic;
          if (field.accept) f.accept = field.accept;
          if (field.maxSize != null) f.maxSize = field.maxSize;
          return f;
        });
        return {
          name: tab.name,
          order: tab.order,
          fields,
        };
      });
      return {
        serviceSlug: svc.slug,
        tabs,
        version: tmpl.version,
      };
    });

  // ---- Pages ----
  const pagesRaw = await prisma.landingPage.findMany({
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
  const pages: ThemePage[] = pagesRaw.map((page) => {
    const blocks: ThemePageBlock[] = page.blocks.map((block) => ({
      type: block.type,
      name: block.name ?? undefined,
      sortOrder: block.sortOrder,
      isActive: block.isActive,
      settings: (block.settings as Record<string, unknown>) ?? {},
      hideOnMobile: block.hideOnMobile || undefined,
      hideOnDesktop: block.hideOnDesktop || undefined,
    }));
    return {
      slug: page.slug,
      name: page.name,
      templateType: page.templateType ?? undefined,
      isSystem: page.isSystem,
      isTemplateActive: page.isTemplateActive,
      metaTitle: page.metaTitle ?? undefined,
      metaDescription: page.metaDescription ?? undefined,
      blocks,
    };
  });

  // ---- Blog Categories ----
  const blogCategoriesRaw = await prisma.blogCategory.findMany({
    include: { parent: true },
  });
  const blogCategories: ThemeBlogCategory[] = blogCategoriesRaw.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? undefined,
    parentSlug: cat.parent?.slug ?? undefined,
    sortOrder: 0, // BlogCategory has no sortOrder field in schema
  }));

  // ---- Blog Posts ----
  const blogPostsRaw = await prisma.blogPost.findMany({
    include: { categories: true },
  });
  const blogs: ThemeBlogPost[] = blogPostsRaw.map((post) => ({
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt ?? undefined,
    categorySlug: post.categories.length > 0 ? post.categories[0].slug : undefined,
    published: post.status === "PUBLISHED",
    metaTitle: post.metaTitle ?? undefined,
    metaDescription: post.metaDescription ?? undefined,
  }));

  // ---- FAQs (global) ----
  const faqsRaw = await prisma.fAQ.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const faqs: ThemeFAQ[] = faqsRaw.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
    category: faq.category ?? "",
    sortOrder: faq.sortOrder,
  }));

  // ---- Testimonials ----
  const testimonialsRaw = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const testimonials: ThemeTestimonial[] = testimonialsRaw.map((t) => ({
    name: t.name,
    country: t.country ?? undefined,
    company: t.company ?? undefined,
    content: t.content,
    rating: t.rating,
    isActive: t.isActive,
    sortOrder: t.sortOrder,
    avatar: t.avatar ?? undefined,
  }));

  // ---- Legal Pages ----
  const legalPagesRaw = await prisma.legalPage.findMany();
  const legalPages: ThemeLegalPage[] = legalPagesRaw.map((lp) => ({
    slug: lp.slug,
    title: lp.title,
    content: lp.content,
    isActive: lp.isActive,
  }));

  // ---- Header Config ----
  const headerRaw = await prisma.headerConfig.findFirst({
    where: { isActive: true },
  });
  const headerConfig: ThemeHeaderConfig = headerRaw
    ? {
        name: headerRaw.name,
        layout: headerRaw.layout,
        sticky: headerRaw.sticky,
        transparent: headerRaw.transparent,
        topBarEnabled: headerRaw.topBarEnabled,
        logoPosition: headerRaw.logoPosition,
        logoMaxHeight: headerRaw.logoMaxHeight,
        showAuthButtons: headerRaw.showAuthButtons,
        loginText: headerRaw.loginText ?? undefined,
        registerText: headerRaw.registerText ?? undefined,
        registerUrl: headerRaw.registerUrl ?? undefined,
        searchEnabled: headerRaw.searchEnabled,
        mobileBreakpoint: headerRaw.mobileBreakpoint,
        height: headerRaw.height,
        ctaButtons: headerRaw.ctaButtons
          ? JSON.stringify(headerRaw.ctaButtons)
          : undefined,
        bgColor: headerRaw.bgColor ?? undefined,
        textColor: headerRaw.textColor ?? undefined,
        hoverColor: headerRaw.hoverColor ?? undefined,
        accentColor: headerRaw.accentColor ?? undefined,
        borderColor: headerRaw.borderColor ?? undefined,
        topBarContent: headerRaw.topBarContent ?? undefined,
        topBarBgColor: headerRaw.topBarBgColor ?? undefined,
        topBarTextColor: headerRaw.topBarTextColor ?? undefined,
        loginUrl: headerRaw.loginUrl ?? undefined,
        loginStyle: headerRaw.loginStyle ?? undefined,
        registerStyle: headerRaw.registerStyle ?? undefined,
      }
    : {
        name: "Default Header",
        layout: "DEFAULT",
        sticky: true,
        transparent: false,
        topBarEnabled: false,
        logoPosition: "LEFT",
        logoMaxHeight: 56,
        showAuthButtons: true,
        loginText: "Sign In",
        registerText: "Get Started",
        registerUrl: "/services/llc-formation",
        searchEnabled: false,
        mobileBreakpoint: 1024,
        height: 64,
      };

  // ---- Menu Items ----
  let menuItems: ThemeMenuItem[] = [];
  if (headerRaw) {
    const menuItemsRaw = await prisma.menuItem.findMany({
      where: { headerId: headerRaw.id, parentId: null },
      include: {
        children: {
          include: { children: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const mapMenuItem = (
      item: (typeof menuItemsRaw)[number],
      parentLabel?: string
    ): ThemeMenuItem => ({
      label: item.label,
      url: item.url ?? "",
      sortOrder: item.sortOrder,
      isVisible: item.isVisible,
      visibleOnMobile: item.visibleOnMobile,
      isMegaMenu: item.isMegaMenu || undefined,
      megaMenuColumns: item.megaMenuColumns ?? undefined,
      icon: item.icon ?? undefined,
      badge: item.badge ?? undefined,
      categoryName: item.categoryName ?? undefined,
      categoryIcon: item.categoryIcon ?? undefined,
      categoryDesc: item.categoryDesc ?? undefined,
      parentLabel: parentLabel ?? undefined,
      children: undefined,
    });

    // Flatten the menu tree with parentLabel references
    for (const topItem of menuItemsRaw) {
      menuItems.push(mapMenuItem(topItem));
      if (topItem.children && topItem.children.length > 0) {
        for (const child of topItem.children) {
          menuItems.push(
            mapMenuItem(
              child as unknown as (typeof menuItemsRaw)[number],
              topItem.label
            )
          );
          // Handle third-level children
          const childWithChildren = child as unknown as {
            children?: (typeof menuItemsRaw)[number][];
          };
          if (
            childWithChildren.children &&
            childWithChildren.children.length > 0
          ) {
            for (const grandChild of childWithChildren.children) {
              menuItems.push(
                mapMenuItem(
                  grandChild as unknown as (typeof menuItemsRaw)[number],
                  child.label
                )
              );
            }
          }
        }
      }
    }
  }

  // ---- Footer Config ----
  const footerRaw = await prisma.footerConfig.findFirst({
    where: { isActive: true },
    include: {
      widgets: {
        include: { menuItems: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const footerConfig: ThemeFooterConfig = footerRaw
    ? {
        layout: footerRaw.layout,
        columns: footerRaw.columns,
        bgColor: footerRaw.bgColor ?? undefined,
        textColor: footerRaw.textColor ?? undefined,
        linkColor: footerRaw.linkColor ?? undefined,
        linkHoverColor: footerRaw.linkHoverColor ?? undefined,
        headingColor: footerRaw.headingColor ?? undefined,
        accentColor: footerRaw.accentColor ?? undefined,
        borderColor: footerRaw.borderColor ?? undefined,
        presetId: footerRaw.presetId ?? undefined,
        // Include additional fields
        showSocialLinks: footerRaw.showSocialLinks,
        socialPosition: footerRaw.socialPosition,
        showContactInfo: footerRaw.showContactInfo,
        contactPosition: footerRaw.contactPosition,
        bottomBarEnabled: footerRaw.bottomBarEnabled,
        bottomBarLayout: footerRaw.bottomBarLayout,
        copyrightText: footerRaw.copyrightText ?? undefined,
        showDisclaimer: footerRaw.showDisclaimer,
        disclaimerText: footerRaw.disclaimerText ?? undefined,
        bottomLinks: footerRaw.bottomLinks ?? undefined,
        showTrustBadges: footerRaw.showTrustBadges,
        trustBadges: footerRaw.trustBadges ?? undefined,
        bgType: footerRaw.bgType,
        containerWidth: footerRaw.containerWidth,
        paddingTop: footerRaw.paddingTop,
        paddingBottom: footerRaw.paddingBottom,
        dividerStyle: footerRaw.dividerStyle,
        shadow: footerRaw.shadow,
      }
    : {
        layout: "MULTI_COLUMN",
        columns: 4,
      };

  // ---- Footer Widgets ----
  const footerWidgets: ThemeFooterWidget[] = footerRaw
    ? footerRaw.widgets.map((w) => ({
        type: w.type,
        column: w.column,
        sortOrder: w.sortOrder,
        content: (w.content as Record<string, unknown>) ?? {},
      }))
    : [];

  // ---- Locations ----
  const locationsRaw = await prisma.location.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const locations: ThemeLocation[] = locationsRaw.map((loc) => ({
    code: loc.code,
    name: loc.name,
    country: loc.country,
    type: loc.type,
    isPopular: loc.isPopular || undefined,
    sortOrder: loc.sortOrder,
  }));

  // ---- Location Fees ----
  const locationFeesRaw = await prisma.locationFee.findMany({
    include: { service: true, location: true },
  });
  const locationFees: ThemeLocationFee[] = locationFeesRaw.map((lf) => ({
    serviceSlug: lf.service.slug,
    locationCode: lf.location.code,
    feeType: lf.feeType,
    amountUSD: decimalToNumber(lf.amountUSD),
    amountBDT: lf.amountBDT ? decimalToNumber(lf.amountBDT) : undefined,
    label: lf.label ?? undefined,
  }));

  // ---- Tickers ----
  const tickersRaw = await prisma.ticker.findMany({
    orderBy: { createdAt: "asc" },
  });
  const tickers: ThemeTicker[] = tickersRaw.map((t) => ({
    name: t.name,
    isActive: t.isActive,
    items: t.items as ThemeTicker["items"],
    speed: t.speed,
    separator: t.separator,
  }));

  // ---- Final ThemeData ----
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    colorPalette,
    ...(fontConfig && { fontConfig }),
    settings,
    serviceCategories,
    services,
    pages,
    blogCategories,
    blogs,
    faqs,
    testimonials,
    legalPages,
    headerConfig,
    menuItems,
    footerConfig,
    footerWidgets,
    formTemplates,
    locations,
    locationFees,
    tickers,
  };
}
