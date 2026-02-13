import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Services List page...\n");

  // Find the existing Services List system page
  const servicesPage = await prisma.landingPage.findFirst({
    where: {
      OR: [
        { slug: "services" },
        { templateType: "SERVICES_LIST", isTemplateActive: true },
      ],
    },
  });

  if (!servicesPage) {
    console.log("  Services List page not found! Run seed-system-pages.ts first.");
    return;
  }

  console.log(`  Found Services List page: ${servicesPage.id} (/${servicesPage.slug})`);

  // Build the sections JSON
  const sections = [
    // ────────────────────────────────────
    // Section 1: Page Header
    // ────────────────────────────────────
    {
      id: "services_header",
      order: 0,
      layout: "1",
      columns: [
        {
          id: "services_header_col",
          widgets: [
            // "Our Services" badge
            {
              id: "services_badge",
              type: "heading",
              settings: {
                content: {
                  text: "Our Services",
                  htmlTag: "div",
                },
                style: {
                  alignment: "center",
                  typography: {
                    fontSize: 14,
                    fontSizeUnit: "px",
                    fontWeight: 500,
                    fontStyle: "normal",
                    textTransform: "none",
                    textDecoration: "none",
                    lineHeight: 1.4,
                    letterSpacing: 0,
                    letterSpacingUnit: "px",
                  },
                  textFill: {
                    type: "solid",
                    color: "#ffffff",
                  },
                },
                advanced: {
                  customClass:
                    "mx-auto w-fit rounded-full border px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground",
                },
              },
              spacing: { marginTop: 0, marginBottom: 16 },
            },
            // Main heading
            {
              id: "services_heading",
              type: "heading",
              settings: {
                content: {
                  text: "Complete US Business Services",
                  htmlTag: "h1",
                },
                style: {
                  alignment: "center",
                  typography: {
                    fontSize: 36,
                    fontSizeUnit: "px",
                    fontWeight: 700,
                    fontStyle: "normal",
                    textTransform: "none",
                    textDecoration: "none",
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                    letterSpacingUnit: "px",
                  },
                  textFill: {
                    type: "solid",
                    color: "#0f172a",
                  },
                },
                responsive: {
                  desktop: {
                    fontSize: 36,
                    fontSizeUnit: "px",
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                    alignment: "center",
                  },
                  tablet: {
                    fontSize: 30,
                    fontSizeUnit: "px",
                    lineHeight: 1.3,
                    letterSpacing: 0,
                  },
                  mobile: {
                    fontSize: 26,
                    fontSizeUnit: "px",
                    lineHeight: 1.3,
                    letterSpacing: 0,
                  },
                },
              },
              spacing: { marginTop: 0, marginBottom: 16 },
            },
            // Description
            {
              id: "services_description",
              type: "text-block",
              settings: {
                content:
                  '<p style="text-align: center">Everything you need to start, run, and grow your US business as an international entrepreneur.</p>',
                editor: { toolbar: "minimal", minHeight: 40 },
                typography: {
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "#64748b",
                  linkColor: "#f97316",
                  linkHoverColor: "#ea580c",
                  linkUnderline: true,
                },
                container: { padding: 0, borderRadius: 0 },
                paragraphSpacing: 16,
                lists: {
                  bulletStyle: "disc",
                  numberStyle: "decimal",
                  indentation: 24,
                },
                blockquote: {
                  borderColor: "#f97316",
                  borderWidth: 4,
                  fontStyle: "italic",
                  padding: 16,
                },
                dropCap: { enabled: false, size: 3 },
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },
      ],
      settings: {
        fullWidth: false,
        background: { type: "solid", color: "transparent" },
        paddingTop: 64,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 0,
        marginBottom: 0,
        gap: 0,
        maxWidth: "lg",
        borderRadius: 0,
        isVisible: true,
        visibleOnMobile: true,
        visibleOnDesktop: true,
      },
    },

    // ────────────────────────────────────
    // Section 2: Service Cards Grid
    // ────────────────────────────────────
    {
      id: "services_grid",
      order: 1,
      layout: "1",
      columns: [
        {
          id: "services_grid_col",
          widgets: [
            {
              id: "services_card_widget",
              type: "service-card",
              settings: {
                header: {
                  show: false,
                  badge: {
                    show: false,
                    text: "",
                    style: "pill",
                    bgColor: "#f9731933",
                    textColor: "#fb923c",
                    borderColor: "#f9731980",
                  },
                  heading: {
                    text: "",
                    highlightWords: "",
                    highlightColor: "#f97316",
                    size: "xl",
                    color: "#0f172a",
                  },
                  description: {
                    show: false,
                    text: "",
                    size: "lg",
                    color: "#64748b",
                  },
                  alignment: "center",
                  marginBottom: 0,
                },
                filters: {
                  categories: [],
                  limit: 0,
                  sortBy: "sort-order",
                  popularOnly: false,
                  activeOnly: true,
                },
                cardStyle: "elevated",
                layout: {
                  columns: 3,
                  gap: 24,
                  cardAlignment: "stretch",
                },
                icon: {
                  show: true,
                  style: "rounded",
                  size: "md",
                  position: "top-left",
                  hoverAnimation: "scale",
                },
                content: {
                  showDescription: true,
                  descriptionLines: 3,
                  showPrice: true,
                  pricePosition: "bottom",
                  showBadge: false,
                  badgePosition: "top-right",
                  showFeatures: false,
                  maxFeatures: 3,
                  showCategory: false,
                  showArrow: true,
                },
                hover: {
                  effect: "lift",
                  iconEffect: "scale",
                  transitionDuration: 200,
                },
                colors: {},
                borderRadius: 12,
                borderWidth: 1,
                responsive: {
                  tablet: { columns: 2 },
                  mobile: { columns: 1 },
                },
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },
      ],
      settings: {
        fullWidth: false,
        background: { type: "solid", color: "transparent" },
        paddingTop: 32,
        paddingBottom: 48,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 0,
        marginBottom: 0,
        gap: 0,
        maxWidth: "xl",
        borderRadius: 0,
        isVisible: true,
        visibleOnMobile: true,
        visibleOnDesktop: true,
      },
    },

    // ────────────────────────────────────
    // Section 3: CTA
    // ────────────────────────────────────
    {
      id: "services_cta",
      order: 2,
      layout: "1",
      columns: [
        {
          id: "services_cta_col",
          widgets: [
            {
              id: "services_cta_text",
              type: "text-block",
              settings: {
                content: [
                  '<div style="text-align: center">',
                  '<p style="font-size: 16px; color: #64748b; margin-bottom: 16px">Not sure which service you need?</p>',
                  '<a href="/contact" style="display: inline-block; background: transparent; color: #0f172a; padding: 10px 24px; border-radius: 8px; font-weight: 500; font-size: 14px; text-decoration: none; border: 1px solid #e2e8f0">Contact Us for a Free Consultation</a>',
                  "</div>",
                ].join(""),
                editor: { toolbar: "minimal", minHeight: 60 },
                typography: {
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "#64748b",
                  linkColor: "#0f172a",
                  linkHoverColor: "#0f172a",
                  linkUnderline: false,
                },
                container: { padding: 0, borderRadius: 0 },
                paragraphSpacing: 16,
                lists: {
                  bulletStyle: "disc",
                  numberStyle: "decimal",
                  indentation: 24,
                },
                blockquote: {
                  borderColor: "#f97316",
                  borderWidth: 4,
                  fontStyle: "italic",
                  padding: 16,
                },
                dropCap: { enabled: false, size: 3 },
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },
      ],
      settings: {
        fullWidth: false,
        background: { type: "solid", color: "transparent" },
        paddingTop: 16,
        paddingBottom: 64,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 0,
        marginBottom: 0,
        gap: 0,
        maxWidth: "lg",
        borderRadius: 0,
        isVisible: true,
        visibleOnMobile: true,
        visibleOnDesktop: true,
      },
    },
  ];

  // Find and update the widget-page-sections block
  const block = await prisma.landingPageBlock.findFirst({
    where: {
      landingPageId: servicesPage.id,
      type: "widget-page-sections",
    },
  });

  if (block) {
    await prisma.landingPageBlock.update({
      where: { id: block.id },
      data: {
        settings: sections as unknown as Prisma.InputJsonValue,
      },
    });
    console.log(`  Updated widget-page-sections block: ${block.id}`);
  } else {
    await prisma.landingPageBlock.create({
      data: {
        landingPageId: servicesPage.id,
        type: "widget-page-sections",
        name: "Widget Page Sections",
        sortOrder: 0,
        isActive: true,
        settings: sections as unknown as Prisma.InputJsonValue,
      },
    });
    console.log("  Created widget-page-sections block");
  }

  // Update SEO metadata
  await prisma.landingPage.update({
    where: { id: servicesPage.id },
    data: {
      metaTitle: "Services",
      metaDescription:
        "Explore our comprehensive US business formation services including LLC formation, EIN application, Amazon seller accounts, and more.",
    },
  });
  console.log("  Updated page SEO metadata");

  console.log("\nDone! Services List page seeded successfully.");
  console.log(`  Page: /${servicesPage.slug}`);
  console.log("  Sections: 3 (header, service cards grid, CTA)");
  console.log("  Widgets: heading (badge), heading (h1), text-block (description), service-card (grid), text-block (CTA)");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
