// ============================================
// THEME SYSTEM - TYPE DEFINITIONS
// ============================================

// ---- Theme Metadata (meta.json) ----

export interface ThemeMeta {
  name: string;
  version: string;
  description: string;
  category: string;
  thumbnail: string;
  serviceCount: number;
  author: string;
}

// ---- Color Palette ----

/** Hex color values matching Tailwind v4 @theme --color-* variables */
export interface ThemeColorValues {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  border: string;
  input: string;
  ring: string;
  // Brand-specific extended colors
  midnight?: string;
  "midnight-light"?: string;
  "midnight-700"?: string;
}

export interface ThemeColorPalette {
  light: ThemeColorValues;
  dark: ThemeColorValues;
}

// ---- Font Configuration ----

export interface ThemeFontConfig {
  headingFont: string; // Google Fonts family name — display/brand font
  bodyFont: string; // Google Fonts family name — body/readable font
  accentFont?: string; // Decorative/serif font (system or Google)
}

/** System fonts that don't need a Google Fonts <link> */
export const SYSTEM_FONTS = [
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Arial",
  "Verdana",
  "Garamond",
];

export const DEFAULT_FONT_CONFIG: ThemeFontConfig = {
  headingFont: "Outfit",
  bodyFont: "Inter",
  accentFont: "Georgia",
};

// ---- Widget Presets (per-widget demo content) ----

export type ThemeWidgetPresets = Record<string, Record<string, unknown>>;

// ---- Service Data ----

export interface ThemeServicePackage {
  name: string;
  price: number;
  compareAtPrice?: number | null;
  description: string;
  processingTime?: string;
  processingIcon?: string;
  badgeText?: string | null;
  badgeColor?: string | null;
  features: string[];
  notIncluded?: string[];
  isPopular: boolean;
}

export interface ThemeComparisonFeature {
  text: string;
  tooltip?: string;
  description?: string;
  sortOrder?: number;
  packages: Record<
    string,
    {
      valueType: "BOOLEAN" | "TEXT" | "ADDON" | "DASH";
      included: boolean;
      customValue?: string;
      addonPriceUSD?: number;
      addonPriceBDT?: number;
    }
  >;
}

export interface ThemeServiceFAQ {
  question: string;
  answer: string;
}

export interface ThemeService {
  slug: string;
  name: string;
  shortDesc: string;
  metaTitle?: string;
  metaDescription?: string;
  description: string;
  icon: string;
  image?: string;
  startingPrice: number;
  categorySlug: string;
  isPopular: boolean;
  badgeText?: string | null;
  badgeColor?: string | null;
  sortOrder?: number;
  features: string[];
  packages: ThemeServicePackage[];
  comparisonFeatures?: ThemeComparisonFeature[];
  faqs: ThemeServiceFAQ[];
  displayOptions?: Record<string, unknown>;
  hasLocationBasedPricing?: boolean;
  locationFeeLabel?: string | null;
}

export interface ThemeServiceCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
  sortOrder: number;
}

// ---- Page Data ----

export interface ThemePage {
  slug: string;
  name: string;
  templateType?: string;
  isSystem: boolean;
  isTemplateActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  blocks: ThemePageBlock[];
}

export interface ThemePageBlock {
  type: string;
  name?: string;
  sortOrder: number;
  isActive: boolean;
  settings: Record<string, unknown>;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
}

// ---- Blog Data ----

export interface ThemeBlogCategory {
  name: string;
  slug: string;
  description?: string;
  parentSlug?: string;
  sortOrder: number;
}

export interface ThemeBlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categorySlug?: string;
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

// ---- FAQ Data ----

export interface ThemeFAQ {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
}

// ---- Header/Footer Data ----

export interface ThemeHeaderConfig {
  name: string;
  layout: string;
  sticky: boolean;
  transparent: boolean;
  topBarEnabled: boolean;
  logoPosition: string;
  logoMaxHeight: number;
  showAuthButtons: boolean;
  loginText?: string;
  registerText?: string;
  registerUrl?: string;
  searchEnabled: boolean;
  mobileBreakpoint: number;
  height: number;
  ctaButtons?: string; // JSON string
  [key: string]: unknown;
}

export interface ThemeMenuItem {
  label: string;
  url: string;
  sortOrder: number;
  isVisible: boolean;
  visibleOnMobile: boolean;
  isMegaMenu?: boolean;
  megaMenuColumns?: number;
  icon?: string;
  badge?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryDesc?: string;
  parentLabel?: string; // Reference to parent menu item by label
  children?: ThemeMenuItem[];
}

export interface ThemeFooterConfig {
  layout: string;
  columns: number;
  bgColor?: string;
  textColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  headingColor?: string;
  accentColor?: string;
  borderColor?: string;
  presetId?: string;
  [key: string]: unknown;
}

export interface ThemeFooterWidget {
  type: string;
  column: number;
  sortOrder: number;
  content: Record<string, unknown>;
}

// ---- Testimonial Data ----

export interface ThemeTestimonial {
  name: string;
  country?: string;
  company?: string;
  content: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
  avatar?: string;
  type?: "PHOTO" | "VIDEO";
  videoUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
}

// ---- Legal Pages ----

export interface ThemeLegalPage {
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
}

// ---- Form Templates ----

export interface ThemeFormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ThemeFormTab {
  name: string;
  order: number;
  fields: ThemeFormField[];
}

export interface ThemeFormTemplate {
  serviceSlug: string;
  tabs: ThemeFormTab[];
  version: number;
}

// ---- Locations ----

export interface ThemeLocation {
  code: string;
  name: string;
  country: string;
  type: string;
  isPopular?: boolean;
  sortOrder?: number;
}

// ---- Location Pricing ----

export interface ThemeLocationFee {
  serviceSlug: string;
  locationCode: string;
  feeType: string;
  amountUSD: number;
  amountBDT?: number;
  label?: string;
}

// ---- Settings ----

export interface ThemeSettings {
  [key: string]: string;
}

// ---- Tickers ----

export interface ThemeTicker {
  name: string;
  isActive?: boolean;
  items: Array<{
    id: string;
    content: string; // HTML from editor
    // Legacy fields (backward compat)
    boldText?: string;
    text?: string;
    link?: string;
    openInNewTab?: boolean;
    noFollow?: boolean;
  }>;
  speed?: number;
  separator?: string;
}

// ============================================
// MAIN THEME DATA STRUCTURE (data.json)
// ============================================

export interface ThemeData {
  version: string;
  exportedAt: string;

  // Layer 4: Color Palette
  colorPalette: ThemeColorPalette;

  // Layer 2: Widget Presets
  widgetPresets?: ThemeWidgetPresets;

  // Layer 3: Full Site Content
  settings: ThemeSettings;
  serviceCategories: ThemeServiceCategory[];
  services: ThemeService[];
  pages: ThemePage[];
  blogCategories?: ThemeBlogCategory[];
  blogs?: ThemeBlogPost[];
  faqs: ThemeFAQ[];
  testimonials: ThemeTestimonial[];
  legalPages: ThemeLegalPage[];
  headerConfig: ThemeHeaderConfig;
  menuItems: ThemeMenuItem[];
  footerConfig: ThemeFooterConfig;
  footerWidgets: ThemeFooterWidget[];
  formTemplates?: ThemeFormTemplate[];
  locations?: ThemeLocation[];
  locationFees?: ThemeLocationFee[];
  tickers?: ThemeTicker[];
}

// ---- API Response Types ----

export interface ThemeListItem {
  id: string; // folder name e.g. "legal"
  meta: ThemeMeta;
  isActive: boolean;
}

export interface ImportResult {
  success: boolean;
  source: "theme" | "file";
  imported: {
    settings: number;
    serviceCategories: number;
    services: number;
    packages: number;
    pages: number;
    blogs: number;
    faqs: number;
    testimonials: number;
    legalPages: number;
    formTemplates: number;
    menuItems: number;
    footerWidgets: number;
    locationFees: number;
    tickers: number;
  };
  themeId?: string;
  duration: number; // ms
}

export interface ExportData extends ThemeData {
  exportedAt: string;
}

export interface ResetResult {
  success: boolean;
  deleted: {
    services: number;
    pages: number;
    blogs: number;
    faqs: number;
    testimonials: number;
    legalPages: number;
    settings: number;
  };
  recreated: {
    systemPages: number;
  };
}
