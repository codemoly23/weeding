/**
 * Export current database content as the "Legal" theme data.json
 *
 * Run: npx tsx scripts/export-legal-theme.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "llcpad",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface DecimalLike {
  toNumber(): number;
}

function d(v: DecimalLike | null | undefined): number {
  return v == null ? 0 : v.toNumber();
}

async function main() {
  console.log("Exporting Legal theme data from database...\n");

  // Default color palette (Midnight Orange)
  const colorPalette = {
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

  // Settings
  console.log("  Reading settings...");
  const settingsRaw = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const s of settingsRaw) {
    settings[s.key] = s.value;
  }
  console.log(`    ${settingsRaw.length} settings`);

  // Service Categories
  console.log("  Reading service categories...");
  const cats = await prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" } });
  const serviceCategories = cats.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description || "",
    icon: c.icon || "",
    sortOrder: c.sortOrder,
  }));
  console.log(`    ${cats.length} categories`);

  // Services with all relations
  console.log("  Reading services...");
  const svcs = await prisma.service.findMany({
    include: {
      category: true,
      packages: {
        include: {
          features: { orderBy: { sortOrder: "asc" } },
          notIncluded: { orderBy: { sortOrder: "asc" } },
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

  const services = svcs.map((s) => {
    // Build comparison features from ServiceFeature + PackageFeatureMap
    const comparisonFeatures = s.features.map((f) => {
      const packages: Record<string, any> = {};
      for (const pkg of s.packages) {
        const mapping = pkg.featureMap.find((m) => m.featureId === f.id);
        if (mapping) {
          packages[pkg.name] = {
            valueType: mapping.valueType,
            included: mapping.included,
            ...(mapping.customValue ? { customValue: mapping.customValue } : {}),
            ...(mapping.addonPriceUSD ? { addonPriceUSD: d(mapping.addonPriceUSD) } : {}),
            ...(mapping.addonPriceBDT ? { addonPriceBDT: d(mapping.addonPriceBDT) } : {}),
          };
        }
      }
      return {
        text: f.text,
        ...(f.tooltip ? { tooltip: f.tooltip } : {}),
        packages,
      };
    });

    return {
      slug: s.slug,
      name: s.name,
      shortDesc: s.shortDesc,
      ...(s.metaTitle ? { metaTitle: s.metaTitle } : {}),
      ...(s.metaDescription ? { metaDescription: s.metaDescription } : {}),
      description: s.description,
      icon: s.icon || "",
      ...(s.image ? { image: s.image } : {}),
      startingPrice: d(s.startingPrice),
      categorySlug: s.category?.slug || "",
      isPopular: s.isPopular,
      features: s.packages.flatMap((p) => p.features.map((f) => f.text)),
      packages: s.packages.map((p) => ({
        name: p.name,
        price: d(p.priceUSD),
        description: p.description || "",
        ...(p.processingTime ? { processingTime: p.processingTime } : {}),
        ...(p.processingIcon ? { processingIcon: p.processingIcon } : {}),
        badgeText: p.badgeText || null,
        badgeColor: p.badgeColor || null,
        features: p.features.map((f) => f.text),
        notIncluded: p.notIncluded.map((ni) => ni.text),
        isPopular: p.isPopular,
      })),
      ...(comparisonFeatures.length > 0 ? { comparisonFeatures } : {}),
      faqs: s.faqs.map((f) => ({ question: f.question, answer: f.answer })),
      ...(s.displayOptions && Object.keys(s.displayOptions as object).length > 0
        ? { displayOptions: s.displayOptions as Record<string, unknown> }
        : {}),
    };
  });
  console.log(`    ${svcs.length} services`);

  // Form Templates
  console.log("  Reading form templates...");
  const formTemplates = svcs
    .filter((s) => s.formTemplate)
    .map((s) => ({
      serviceSlug: s.slug,
      tabs: s.formTemplate!.tabs.map((t) => ({
        name: t.name,
        order: t.order,
        fields: t.fields.map((f) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          ...(f.placeholder ? { placeholder: f.placeholder } : {}),
          required: f.required,
          ...(f.options ? { options: f.options } : {}),
          ...(f.validation ? { validation: f.validation as Record<string, unknown> } : {}),
          ...(f.width ? { width: f.width } : {}),
          ...(f.helpText ? { helpText: f.helpText } : {}),
          ...(f.dataSourceType ? { dataSourceType: f.dataSourceType } : {}),
          ...(f.dataSourceKey ? { dataSourceKey: f.dataSourceKey } : {}),
          ...(f.dependsOn ? { dependsOn: f.dependsOn } : {}),
          ...(f.conditionalLogic ? { conditionalLogic: f.conditionalLogic as Record<string, unknown> } : {}),
          ...(f.defaultValue ? { defaultValue: f.defaultValue } : {}),
        })),
      })),
      version: s.formTemplate!.version,
    }));
  console.log(`    ${formTemplates.length} form templates`);

  // Pages with blocks
  console.log("  Reading pages...");
  const pagesRaw = await prisma.landingPage.findMany({
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
  const pages = pagesRaw.map((p) => ({
    slug: p.slug,
    name: p.name,
    ...(p.templateType ? { templateType: p.templateType } : {}),
    isSystem: p.isSystem,
    isTemplateActive: p.isTemplateActive,
    ...(p.metaTitle ? { metaTitle: p.metaTitle } : {}),
    ...(p.metaDescription ? { metaDescription: p.metaDescription } : {}),
    blocks: p.blocks.map((b) => ({
      type: b.type,
      ...(b.name ? { name: b.name } : {}),
      sortOrder: b.sortOrder,
      isActive: b.isActive,
      settings: b.settings as Record<string, unknown>,
      ...(b.hideOnMobile ? { hideOnMobile: b.hideOnMobile } : {}),
      ...(b.hideOnDesktop ? { hideOnDesktop: b.hideOnDesktop } : {}),
    })),
  }));
  console.log(`    ${pagesRaw.length} pages`);

  // Blog Categories
  console.log("  Reading blog categories...");
  const blogCatsRaw = await prisma.blogCategory.findMany({
    include: { parent: true },
  });
  const blogCategories = blogCatsRaw.map((c, i) => ({
    name: c.name,
    slug: c.slug,
    ...(c.description ? { description: c.description } : {}),
    ...(c.parent ? { parentSlug: c.parent.slug } : {}),
    sortOrder: i,
  }));
  console.log(`    ${blogCatsRaw.length} blog categories`);

  // Blog Posts
  console.log("  Reading blog posts...");
  const blogsRaw = await prisma.blogPost.findMany({
    include: { categories: true },
  });
  const blogs = blogsRaw.map((b) => ({
    title: b.title,
    slug: b.slug,
    content: b.content,
    ...(b.excerpt ? { excerpt: b.excerpt } : {}),
    ...(b.categories.length > 0 ? { categorySlug: b.categories[0].slug } : {}),
    published: b.status === "PUBLISHED",
    ...(b.metaTitle ? { metaTitle: b.metaTitle } : {}),
    ...(b.metaDescription ? { metaDescription: b.metaDescription } : {}),
  }));
  console.log(`    ${blogsRaw.length} blog posts`);

  // Global FAQs
  console.log("  Reading FAQs...");
  const faqsRaw = await prisma.fAQ.findMany({ orderBy: { sortOrder: "asc" } });
  const faqs = faqsRaw.map((f) => ({
    question: f.question,
    answer: f.answer,
    category: f.category || "",
    sortOrder: f.sortOrder,
  }));
  console.log(`    ${faqsRaw.length} FAQs`);

  // Testimonials
  console.log("  Reading testimonials...");
  const testRaw = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  const testimonials = testRaw.map((t) => ({
    name: t.name,
    ...(t.country ? { country: t.country } : {}),
    ...(t.company ? { company: t.company } : {}),
    content: t.content,
    rating: t.rating,
    isActive: t.isActive,
    sortOrder: t.sortOrder,
    ...(t.avatar ? { avatar: t.avatar } : {}),
  }));
  console.log(`    ${testRaw.length} testimonials`);

  // Legal Pages
  console.log("  Reading legal pages...");
  const legalRaw = await prisma.legalPage.findMany();
  const legalPages = legalRaw.map((l) => ({
    slug: l.slug,
    title: l.title,
    content: l.content,
    isActive: l.isActive,
  }));
  console.log(`    ${legalRaw.length} legal pages`);

  // Header Config
  console.log("  Reading header config...");
  const headerRaw = await prisma.headerConfig.findFirst({
    where: { isActive: true },
    include: {
      menuItems: {
        where: { parentId: null },
        include: {
          children: {
            include: { children: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const headerConfig = headerRaw
    ? {
        name: headerRaw.name,
        layout: headerRaw.layout,
        sticky: headerRaw.sticky,
        transparent: headerRaw.transparent,
        topBarEnabled: headerRaw.topBarEnabled,
        logoPosition: headerRaw.logoPosition,
        logoMaxHeight: headerRaw.logoMaxHeight,
        showAuthButtons: headerRaw.showAuthButtons,
        loginText: headerRaw.loginText,
        registerText: headerRaw.registerText,
        registerUrl: headerRaw.registerUrl || "/services/llc-formation",
        searchEnabled: headerRaw.searchEnabled,
        mobileBreakpoint: headerRaw.mobileBreakpoint,
        height: headerRaw.height,
        ...(headerRaw.ctaButtons ? { ctaButtons: JSON.stringify(headerRaw.ctaButtons) } : {}),
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
        height: 80,
      };

  // Menu Items (nested)
  function mapMenuItem(item: any): any {
    return {
      label: item.label,
      url: item.url || "",
      sortOrder: item.sortOrder,
      isVisible: item.isVisible,
      visibleOnMobile: item.visibleOnMobile,
      ...(item.isMegaMenu ? { isMegaMenu: item.isMegaMenu } : {}),
      ...(item.megaMenuColumns ? { megaMenuColumns: item.megaMenuColumns } : {}),
      ...(item.icon ? { icon: item.icon } : {}),
      ...(item.badge ? { badge: item.badge } : {}),
      ...(item.categoryName ? { categoryName: item.categoryName } : {}),
      ...(item.categoryIcon ? { categoryIcon: item.categoryIcon } : {}),
      ...(item.categoryDesc ? { categoryDesc: item.categoryDesc } : {}),
      ...(item.children?.length > 0
        ? { children: item.children.map(mapMenuItem) }
        : {}),
    };
  }

  const menuItems = headerRaw
    ? headerRaw.menuItems.map(mapMenuItem)
    : [];
  console.log(`    ${menuItems.length} top-level menu items`);

  // Footer Config
  console.log("  Reading footer config...");
  const footerRaw = await prisma.footerConfig.findFirst({
    where: { isActive: true },
    include: {
      widgets: {
        include: { menuItems: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const footerConfig = footerRaw
    ? {
        layout: footerRaw.layout,
        columns: footerRaw.columns,
        ...(footerRaw.bgColor ? { bgColor: footerRaw.bgColor } : {}),
        ...(footerRaw.textColor ? { textColor: footerRaw.textColor } : {}),
        ...(footerRaw.linkColor ? { linkColor: footerRaw.linkColor } : {}),
        ...(footerRaw.linkHoverColor ? { linkHoverColor: footerRaw.linkHoverColor } : {}),
        ...(footerRaw.headingColor ? { headingColor: footerRaw.headingColor } : {}),
        ...(footerRaw.accentColor ? { accentColor: footerRaw.accentColor } : {}),
        ...(footerRaw.borderColor ? { borderColor: footerRaw.borderColor } : {}),
        ...(footerRaw.copyrightText ? { copyrightText: footerRaw.copyrightText } : {}),
        ...(footerRaw.disclaimerText ? { disclaimerText: footerRaw.disclaimerText } : {}),
        bgType: footerRaw.bgType,
        paddingTop: footerRaw.paddingTop,
        paddingBottom: footerRaw.paddingBottom,
      }
    : { layout: "MULTI_COLUMN", columns: 4 };

  const footerWidgets = footerRaw
    ? footerRaw.widgets.map((w) => ({
        type: w.type,
        column: w.column,
        sortOrder: w.sortOrder,
        content: (w.content as Record<string, unknown>) ?? {},
      }))
    : [];
  console.log(`    ${footerWidgets.length} footer widgets`);

  // Location Fees
  console.log("  Reading location fees...");
  const locFeesRaw = await prisma.locationFee.findMany({
    include: { service: true, location: true },
  });
  const locationFees = locFeesRaw.map((lf) => ({
    serviceSlug: lf.service.slug,
    locationCode: lf.location.code,
    feeType: lf.feeType,
    amountUSD: d(lf.amountUSD),
    ...(lf.amountBDT ? { amountBDT: d(lf.amountBDT) } : {}),
    ...(lf.label ? { label: lf.label } : {}),
  }));
  console.log(`    ${locFeesRaw.length} location fees`);

  // Build final data.json
  const themeData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    colorPalette,
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
    locationFees,
  };

  const outPath = path.join(process.cwd(), "public", "themes", "legal", "data.json");
  await fs.writeFile(outPath, JSON.stringify(themeData, null, 2), "utf-8");

  console.log(`\nLegal theme data exported to: ${outPath}`);
  console.log(`File size: ${(Buffer.byteLength(JSON.stringify(themeData)) / 1024).toFixed(1)} KB`);
  console.log("\nSummary:");
  console.log(`  Settings: ${Object.keys(settings).length}`);
  console.log(`  Service Categories: ${serviceCategories.length}`);
  console.log(`  Services: ${services.length}`);
  console.log(`  Form Templates: ${formTemplates.length}`);
  console.log(`  Pages: ${pages.length}`);
  console.log(`  Blog Categories: ${blogCategories.length}`);
  console.log(`  Blog Posts: ${blogs.length}`);
  console.log(`  FAQs: ${faqs.length}`);
  console.log(`  Testimonials: ${testimonials.length}`);
  console.log(`  Legal Pages: ${legalPages.length}`);
  console.log(`  Menu Items: ${menuItems.length}`);
  console.log(`  Footer Widgets: ${footerWidgets.length}`);
  console.log(`  Location Fees: ${locationFees.length}`);
}

main()
  .catch((e) => {
    console.error("Export failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
