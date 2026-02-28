import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "llcpad123",
  database: "llcpad",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// SERVICE LIST SECTION - Complete definition
// ============================================================

const SERVICE_LIST_SECTION = {
  id: "section_all_services",
  order: 3,
  layout: "full" as const,
  settings: {
    isVisible: true,
    visibleOnMobile: true,
    visibleOnDesktop: true,
    fullWidth: true,
    background: {
      type: "solid" as const,
      color: "#faf8f4",
    },
    paddingTop: 100,
    paddingBottom: 100,
    paddingLeft: 28,
    paddingRight: 28,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: "xl",
    gap: 0,
    customCSS: `
/* ── Badge: uppercase eyebrow ── */
& [data-field-id="section-header"] span {
  text-transform: uppercase;
  font-size: 12px !important;
  font-weight: 700 !important;
  letter-spacing: 1.5px;
  border: none !important;
  padding: 0 !important;
  margin-bottom: 12px;
}

/* ── Heading: clamp size, 800 weight, tight tracking ── */
& [data-field-id="section-header"] h2 {
  font-size: clamp(28px, 4vw, 44px) !important;
  font-weight: 800 !important;
  letter-spacing: -0.025em;
}

/* ── Description: 16px, margin-top 10px ── */
& [data-field-id="section-header"] p {
  font-size: 16px !important;
  margin-top: 10px;
}

/* ── Category card header: 20px margin-bottom ── */
& .flex.items-start.gap-3.mb-4 {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(14, 17, 9, 0.1);
  margin-bottom: 20px !important;
  gap: 12px !important;
}

/* ── Category icon: 42x42, 11px radius ── */
& .flex.items-start.gap-3.mb-4 .shrink-0 {
  width: 42px !important;
  height: 42px !important;
  min-width: 42px !important;
  border-radius: 11px !important;
}

/* ── Category name: Outfit, 15px, 800 ── */
& .flex.items-start.gap-3.mb-4 h3 {
  font-family: var(--font-heading);
  font-size: 15px !important;
  font-weight: 800 !important;
  color: #0e1109 !important;
  margin-bottom: 3px;
}

/* ── Category tagline: 11px ── */
& .flex.items-start.gap-3.mb-4 p {
  font-size: 11px !important;
  color: #8a9086 !important;
  line-height: 1.4;
}

/* ── Service row: 13px font, left accent bar + smooth hover ── */
& a.group {
  position: relative;
  overflow: hidden;
  font-size: 13px !important;
  border-bottom: 1px solid rgba(14, 17, 9, 0.06);
  border-radius: 7px;
  padding: 8px 10px !important;
  transition: background 0.2s ease, padding-left 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
& a.group:last-child {
  border-bottom: none;
}

/* ── Service name: default style ── */
& a.group span:first-child {
  font-weight: 500;
  font-size: 13px !important;
  color: #1a1f16 !important;
  transition: color 0.2s ease, font-weight 0.2s ease;
}

/* ── Price: heading font, 13px, bold ── */
& a.group span:last-child {
  font-family: var(--font-heading);
  font-size: 13px !important;
  font-weight: 700 !important;
  white-space: nowrap;
  margin-left: 8px;
  transition: transform 0.2s ease;
}

/* Left accent bar (hidden by default) */
& a.group::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

& a.group:hover {
  padding-left: 18px !important;
}
& a.group:hover::before {
  transform: scaleY(1);
}

/* Service name hover: bolder + darker */
& a.group:hover span:first-child {
  font-weight: 600;
  color: #0e1109 !important;
}

/* Price hover: slight scale */
& a.group:hover span:last-child {
  transform: scale(1.06);
}

/* ── Card padding: 26px 22px ── */
& [data-field-id="cards"] > div {
  padding: 26px 22px !important;
}

/* ═══ Category 1: Formation & Legal — CORAL #e84c1e ═══ */
& [data-field-id="cards"] > div:nth-child(1) a.group::before {
  background: #e84c1e;
}
& [data-field-id="cards"] > div:nth-child(1) a.group:hover {
  background: rgba(232, 76, 30, 0.06);
}
& [data-field-id="cards"] > div:nth-child(1) a.group span:last-child {
  color: #e84c1e !important;
}

/* ═══ Category 2: Compliance & Documents — FOREST #1b3a2d ═══ */
& [data-field-id="cards"] > div:nth-child(2) a.group::before {
  background: #1b3a2d;
}
& [data-field-id="cards"] > div:nth-child(2) a.group:hover {
  background: rgba(42, 94, 62, 0.06);
}
& [data-field-id="cards"] > div:nth-child(2) a.group span:last-child {
  color: #1b3a2d !important;
}

/* ═══ Category 3: E-Commerce Setup — BLUE #0064dc ═══ */
& [data-field-id="cards"] > div:nth-child(3) a.group::before {
  background: #0064dc;
}
& [data-field-id="cards"] > div:nth-child(3) a.group:hover {
  background: rgba(0, 100, 220, 0.06);
}
& [data-field-id="cards"] > div:nth-child(3) a.group span:last-child {
  color: #0064dc !important;
}

/* ═══ Category 4: Tax & Finance — PURPLE #7c3aed ═══ */
& [data-field-id="cards"] > div:nth-child(4) a.group::before {
  background: #7c3aed;
}
& [data-field-id="cards"] > div:nth-child(4) a.group:hover {
  background: rgba(124, 58, 237, 0.06);
}
& [data-field-id="cards"] > div:nth-child(4) a.group span:last-child {
  color: #7c3aed !important;
}

/* ═══ Per-category icon colors ═══ */
& [data-field-id="cards"] > div:nth-child(1) .flex.items-start.gap-3.mb-4 .shrink-0 {
  background: rgba(232, 76, 30, 0.08) !important;
}
& [data-field-id="cards"] > div:nth-child(1) .flex.items-start.gap-3.mb-4 .shrink-0 svg {
  color: #e84c1e !important;
}
& [data-field-id="cards"] > div:nth-child(2) .flex.items-start.gap-3.mb-4 .shrink-0 {
  background: rgba(27, 58, 45, 0.08) !important;
}
& [data-field-id="cards"] > div:nth-child(2) .flex.items-start.gap-3.mb-4 .shrink-0 svg {
  color: #1b3a2d !important;
}
& [data-field-id="cards"] > div:nth-child(3) .flex.items-start.gap-3.mb-4 .shrink-0 {
  background: rgba(0, 100, 220, 0.08) !important;
}
& [data-field-id="cards"] > div:nth-child(3) .flex.items-start.gap-3.mb-4 .shrink-0 svg {
  color: #0064dc !important;
}
& [data-field-id="cards"] > div:nth-child(4) .flex.items-start.gap-3.mb-4 .shrink-0 {
  background: rgba(124, 58, 237, 0.08) !important;
}
& [data-field-id="cards"] > div:nth-child(4) .flex.items-start.gap-3.mb-4 .shrink-0 svg {
  color: #7c3aed !important;
}
`.trim(),
  }, // end settings
  columns: [
    {
      id: "col_service_list",
      settings: {
        verticalAlign: "top" as const,
        padding: 0,
      },
      widgets: [
        {
          id: "widget_service_list_all",
          type: "service-list",
          settings: {
            // Header
            header: {
              show: true,
              badge: {
                show: true,
                text: "ALL SERVICES",
                style: "outline",
                bgColor: "transparent",
                textColor: "#e84c1e",
                borderColor: "transparent",
              },
              heading: {
                text: "Explore our complete range of business services",
                highlightWords: "",
                highlightColor: "#e84c1e",
                size: "xl",
                color: "#0e1109",
              },
              description: {
                show: true,
                text: "Transparent pricing — no hidden fees, no surprises.",
                size: "md",
                color: "#8a9086",
              },
              alignment: "center",
              marginBottom: 48,
            },

            // Filters
            filters: {
              showAllCategories: true,
              categories: [],
              limitServicesPerCategory: 0,
              sortServicesBy: "sort-order",
              activeOnly: true,
            },

            // Layout
            layout: {
              columns: 4,
              gap: 20,
              cardStyle: "bordered",
            },

            // Category Card
            categoryCard: {
              showIcon: true,
              iconStyle: "rounded",
              iconSize: "sm",
              iconBgColor: "#fff7ed",
              iconColor: "#f97316",
              showTagline: true,
              titleSize: "sm",
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: "rgba(14, 17, 9, 0.1)",
              backgroundColor: "#ffffff",
              padding: 24,
            },

            // Service Item
            serviceItem: {
              showPrice: true,
              priceColor: "#64748b",
              nameColor: "#1a1f16",
              hoverEffect: "none",
              divider: false,
              dividerColor: "#e2e8f0",
              padding: 8,
              fontSize: "sm",
            },

            // CTA - hidden
            cta: {
              show: false,
              text: "",
              textColor: "#64748b",
              primaryButton: {
                show: false,
                text: "View All Services",
                link: "/services",
                openInNewTab: false,
                style: {},
              },
              secondaryButton: {
                show: false,
                text: "",
                link: "",
                openInNewTab: false,
                style: {},
              },
              alignment: "center",
              marginTop: 48,
            },

            // Responsive
            responsive: {
              tablet: { columns: 2 },
              mobile: { columns: 1 },
            },

            // Theme color binding
            colors: { useTheme: false },

            // Container
            container: {},
          },
        },
      ],
    },
  ],
};

// ============================================================
// MAIN: Insert into theme data.json + live DB
// ============================================================

async function main() {
  // 1. Update theme data.json
  const themePath = "public/themes/legal/data.json";
  const themeData = JSON.parse(fs.readFileSync(themePath, "utf8"));
  const homePage = themeData.pages.find((p: any) => p.slug === "home");

  if (!homePage) {
    console.error("Home page not found in theme");
    return;
  }

  const block = homePage.blocks.find(
    (b: any) => b.type === "widget-page-sections"
  );
  if (!block) {
    console.error("Widget page sections block not found");
    return;
  }

  // Check if section already exists
  const existingIdx = block.settings.findIndex(
    (s: any) => s.id === "section_all_services"
  );
  if (existingIdx >= 0) {
    console.log("Section already exists in theme, replacing...");
    block.settings[existingIdx] = SERVICE_LIST_SECTION;
  } else {
    // Insert at position 3 (after hero, ticker, stats)
    block.settings.splice(3, 0, SERVICE_LIST_SECTION);
  }

  // Update order numbers
  block.settings.forEach((s: any, i: number) => {
    s.order = i;
  });

  fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2), "utf8");
  console.log(
    "Theme data.json updated. Sections now:",
    block.settings.map((s: any) => s.id).join(", ")
  );

  // 2. Update live DB page (model is LandingPage / LandingPageBlock)
  const page = await prisma.landingPage.findFirst({
    where: { slug: "home" },
    include: { blocks: true },
  });

  if (!page) {
    console.error("Home page not found in DB");
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  const pageBlock = page.blocks.find(
    (b) => b.type === "widget-page-sections"
  );
  if (!pageBlock) {
    console.error("Widget block not found in DB");
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  const dbSections = (pageBlock.settings as any[]) || [];
  console.log("Current DB sections:", dbSections.length);

  // Check if section already exists in DB
  const dbExistingIdx = dbSections.findIndex(
    (s: any) => s.id === "section_all_services"
  );
  if (dbExistingIdx >= 0) {
    console.log("Section already exists in DB, replacing...");
    dbSections[dbExistingIdx] = SERVICE_LIST_SECTION;
  } else {
    // Insert at position 3
    dbSections.splice(3, 0, SERVICE_LIST_SECTION);
  }

  // Update order numbers
  dbSections.forEach((s: any, i: number) => {
    s.order = i;
  });

  // Save to DB
  await prisma.landingPageBlock.update({
    where: { id: pageBlock.id },
    data: { settings: dbSections as any },
  });

  console.log("DB updated. Sections now:", dbSections.length);
  console.log(
    "Section order:",
    dbSections.map((s: any) => s.id).join(", ")
  );

  console.log("\nDone! Service list section added to both theme and DB.");

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
