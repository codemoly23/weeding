import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEMPLATES = [
  {
    name: "Minimal Leaves",
    slug: "minimal-leaves",
    tagline: "Clean & Nature-Inspired",
    description: "A fresh, modern design with subtle botanical touches. Perfect for couples who love nature with a minimalist twist.",
    primaryColor: "#2d6a4f",
    accentColor: "#d8f3dc",
    bg: "#f8fdf9",
    font: "Inter",
    tags: ["Modern", "Nature", "Clean"],
    imageUrl: "/designers/1777006588323-ww1.png",
    features: ["Botanical accents", "Minimalist typography", "RSVP form", "Photo gallery"],
    plannerTheme: "minimal",
    plannerPrimary: "#2d6a4f",
    plannerAccent: "#d8f3dc",
    plannerFont: "Inter",
    sortOrder: 1,
  },
  {
    name: "Painted Desert",
    slug: "painted-desert",
    tagline: "Warm & Bohemian",
    description: "Earthy terracotta tones inspired by desert sunsets. Ideal for rustic, outdoor, or boho weddings.",
    primaryColor: "#c77d43",
    accentColor: "#fde8d0",
    bg: "#fffaf5",
    font: "Georgia",
    tags: ["Rustic", "Boho", "Warm"],
    imageUrl: "/designers/1777006595094-ww2.png",
    features: ["Warm color palette", "Serif typography", "Our story section", "Vendor showcase"],
    plannerTheme: "rustic",
    plannerPrimary: "#c77d43",
    plannerAccent: "#fde8d0",
    plannerFont: "Georgia",
    sortOrder: 2,
  },
  {
    name: "Classic Garden",
    slug: "classic-garden",
    tagline: "Timeless & Elegant",
    description: "Refined floral design with a touch of romance. A classic choice that never goes out of style.",
    primaryColor: "#be185d",
    accentColor: "#fce7f3",
    bg: "#fff9fb",
    font: "Georgia",
    tags: ["Classic", "Floral", "Romantic"],
    imageUrl: "/designers/1777006599600-ww3.png",
    features: ["Floral motifs", "Elegant layout", "Guest list", "RSVP tracking"],
    plannerTheme: "floral",
    plannerPrimary: "#be185d",
    plannerAccent: "#fce7f3",
    plannerFont: "Georgia",
    sortOrder: 3,
  },
  {
    name: "Garden Romance",
    slug: "garden-romance",
    tagline: "Modern & Romantic",
    description: "A dreamy blend of modern design and romantic details. Soft colors with a contemporary feel.",
    primaryColor: "#7c3aed",
    accentColor: "#ede9fe",
    bg: "#fdfcff",
    font: "Inter",
    tags: ["Romantic", "Modern", "Dreamy"],
    imageUrl: "/designers/1777006603262-ww4.png",
    features: ["Modern layout", "Interactive RSVP", "Guest photo gallery", "Countdown timer"],
    plannerTheme: "modern",
    plannerPrimary: "#7c3aed",
    plannerAccent: "#ede9fe",
    plannerFont: "Inter",
    sortOrder: 4,
  },
];

async function main() {
  console.log("🎨 Seeding Wedding Templates...\n");

  for (const template of TEMPLATES) {
    await prisma.weddingTemplate.upsert({
      where: { slug: template.slug },
      update: {
        name: template.name,
        tagline: template.tagline,
        description: template.description,
        primaryColor: template.primaryColor,
        accentColor: template.accentColor,
        bg: template.bg,
        font: template.font,
        tags: template.tags,
        imageUrl: template.imageUrl,
        features: template.features,
        plannerTheme: template.plannerTheme,
        plannerPrimary: template.plannerPrimary,
        plannerAccent: template.plannerAccent,
        plannerFont: template.plannerFont,
        sortOrder: template.sortOrder,
      },
      create: {
        name: template.name,
        slug: template.slug,
        tagline: template.tagline,
        description: template.description,
        primaryColor: template.primaryColor,
        accentColor: template.accentColor,
        bg: template.bg,
        font: template.font,
        tags: template.tags,
        imageUrl: template.imageUrl,
        features: template.features,
        plannerTheme: template.plannerTheme,
        plannerPrimary: template.plannerPrimary,
        plannerAccent: template.plannerAccent,
        plannerFont: template.plannerFont,
        sortOrder: template.sortOrder,
        active: true,
      },
    });
    console.log(`  ✓ ${template.name}`);
  }

  console.log(`\n✅ ${TEMPLATES.length} templates seeded.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
