/**
 * Run: npx tsx scripts/update-testimonials-widget.ts
 * Updates the testimonials widget settings in the home template to match the reference design.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "ceremoney",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const NEW_SETTINGS = {
  viewMode: "marquee",
  gridView: {
    columns: 3,
    gap: 32,
    showQuoteIcon: true,
    quoteIconColor: "#c4b5fd",
    quoteIconSize: "lg",
    quoteIconPosition: "top-right",
  },
  cardStyle: {
    style: "elevated",
    shadow: "sm",
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    backgroundColor: "#ffffff",
    hoverEffect: "lift",
    glassEffect: { enabled: false, blur: 10, opacity: 0.1 },
    gradientBorder: { enabled: false, colors: ["#ec4899", "#8b5cf6"], angle: 135 },
  },
  avatar: {
    style: "initials",
    shape: "circle",
    size: "md",
    borderWidth: 0,
    borderColor: "#ec4899",
    backgroundColor: "#ec4899",
    textColor: "#ffffff",
  },
  content: {
    showRating: true,
    ratingStyle: "stars",
    ratingColor: "#facc15",
    showCompany: true,
    showCountry: false,
    countryFlag: false,
    quoteMaxLines: 0,
    quoteFontSize: "sm",
    quoteColor: "#4b5563",
    quoteStyle: "normal",
    nameFontSize: "sm",
    nameColor: "#111827",
    nameFontWeight: "semibold",
    infoColor: "#9ca3af",
    infoFontSize: "xs",
  },
  header: {
    show: true,
    alignment: "center",
    marginBottom: 56,
    badge: {
      show: true,
      text: "Trusted by Thousands",
      style: "pill",
      bgColor: "#ffffff",
      textColor: "#7c3aed",
      fontWeight: 600,
      borderColor: "#ddd6fe",
      letterSpacing: "0px",
      textTransform: "none",
      customFontSize: "13px",
    },
    heading: {
      text: "What Event Planners Say",
      highlightWords: "",
      highlightColor: "#7c3aed",
      size: "xl",
      color: "#111827",
      fontWeight: 700,
      customFontSize: "clamp(26px, 3vw, 40px)",
      lineHeight: 1.15,
      letterSpacing: "-0.02em",
    },
    description: {
      show: true,
      text: "Join thousands of happy planners who've created unforgettable events",
      size: "md",
      color: "#6b7280",
      customFontSize: "15px",
      lineHeight: 1.7,
    },
  },
  carouselView: {
    layout: "rail",
    effect: "slide",
    autoplay: true,
    autoplayDelay: 5000,
    loop: true,
    slidesPerView: 3,
    spaceBetween: 24,
    navigation: {
      arrows: { enabled: false, style: "rounded", size: "md", color: "#ffffff", backgroundColor: "#ffffff20", position: "bottom-right", showOnHover: false },
      pagination: { enabled: true, type: "dots", activeColor: "#BE6B8B", inactiveColor: "rgba(190,107,139,0.2)" },
    },
    splitLayout: { photoPosition: "left", photoSize: "50" },
  },
  trustFooter: { show: false },
  dataSource: { limit: 6, sortBy: "sort-order", testimonialType: "all" },
};

async function main() {
  // Find the home landing page block
  const pages = await prisma.landingPage.findMany({
    where: { isActive: true },
    include: {
      blocks: {
        where: { type: "widget-page-sections", isActive: true },
      },
    },
  });

  let updated = 0;

  for (const page of pages) {
    for (const block of page.blocks) {
      const sections = block.settings as any[];
      if (!Array.isArray(sections)) continue;

      let changed = false;

      const updatedSections = sections.map((section: any) => ({
        ...section,
        columns: section.columns?.map((col: any) => ({
          ...col,
          widgets: col.widgets?.map((widget: any) => {
            if (
              widget.type === "testimonials-carousel" ||
              widget.type === "testimonials"
            ) {
              console.log(`Found widget "${widget.type}" in page "${page.name}" (${page.slug})`);
              changed = true;
              return {
                ...widget,
                settings: {
                  ...widget.settings,
                  ...NEW_SETTINGS,
                  // preserve translations if any
                  _translations: widget.settings?._translations,
                },
              };
            }
            return widget;
          }),
        })),
      }));

      if (changed) {
        await prisma.landingPageBlock.update({
          where: { id: block.id },
          data: { settings: updatedSections as any },
        });
        console.log(`Updated block ${block.id} in page "${page.name}"`);
        updated++;
      }
    }
  }

  if (updated === 0) {
    console.log("No testimonials widgets found.");
  } else {
    console.log(`Done. Updated ${updated} block(s).`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
