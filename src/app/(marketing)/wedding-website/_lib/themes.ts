export interface WeddingTheme {
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bg: string;
  font: string;
  tags: string[];
  imageUrl: string;
  features: string[];
  // Planner website builder mapping
  plannerTheme: "modern" | "floral" | "rustic" | "minimal";
  plannerPrimary: string;
  plannerAccent: string;
  plannerFont: string;
}

export const WEDDING_THEMES: Record<string, WeddingTheme> = {
  "minimal-leaves": {
    name: "Minimal Leaves",
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
  },
  "painted-desert": {
    name: "Painted Desert",
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
  },
  "classic-garden": {
    name: "Classic Garden",
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
  },
  "garden-romance": {
    name: "Garden Romance",
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
  },
};

export const ALL_THEMES = Object.entries(WEDDING_THEMES).map(([slug, theme]) => ({
  slug,
  ...theme,
}));
