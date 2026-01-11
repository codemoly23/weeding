// ============================================
// PAGE BUILDER - WIDGET SLOT SYSTEM TYPES
// ============================================

import type { ButtonCustomStyle } from "@/lib/landing-blocks/types";

// Re-export for convenience
export type { ButtonCustomStyle };

// ============================================
// SECTION TYPES
// ============================================

export type SectionLayout =
  | "1"        // Full width (1 column)
  | "1-1"      // 50/50 (2 columns)
  | "1-2"      // 33/66 (2 columns)
  | "2-1"      // 66/33 (2 columns)
  | "1-1-1"    // 33/33/33 (3 columns)
  | "1-2-1"    // 25/50/25 (3 columns)
  | "1-1-1-1"; // 25/25/25/25 (4 columns)

export type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

// Background Types
export type BackgroundType = "solid" | "gradient" | "image" | "video";
export type GradientType = "linear" | "radial";
export type BackgroundSize = "cover" | "contain" | "auto";
export type BackgroundPosition = "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type BackgroundRepeat = "no-repeat" | "repeat" | "repeat-x" | "repeat-y";

export interface GradientSettings {
  type: GradientType;
  angle: number; // For linear gradient (0-360)
  colors: Array<{
    color: string;
    position: number; // 0-100
  }>;
}

export interface BackgroundImageSettings {
  url: string;
  size: BackgroundSize;
  position: BackgroundPosition;
  repeat: BackgroundRepeat;
  fixed: boolean; // Parallax effect
}

export interface BackgroundVideoSettings {
  url: string;
  poster?: string; // Fallback image
  muted: boolean;
  loop: boolean;
}

export interface BackgroundOverlay {
  enabled: boolean;
  color: string;
  opacity: number;
  gradient?: GradientSettings; // Optional gradient overlay
}

export interface SectionBackground {
  type: BackgroundType;
  color?: string; // For solid
  gradient?: GradientSettings; // For gradient
  image?: BackgroundImageSettings; // For image
  video?: BackgroundVideoSettings; // For video
  overlay?: BackgroundOverlay;
}

export interface SectionSettings {
  fullWidth: boolean;
  // New unified background system
  background: SectionBackground;
  // Legacy fields (kept for backwards compatibility)
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
  paddingTop: number;
  paddingBottom: number;
  gap: number;
  maxWidth: MaxWidth;
  borderRadius?: number;
  className?: string;
}

export interface Section {
  id: string;
  order: number;
  layout: SectionLayout;
  columns: Column[];
  settings: SectionSettings;
}

// ============================================
// COLUMN TYPES
// ============================================

export type VerticalAlign = "top" | "center" | "bottom";

export interface ColumnSettings {
  verticalAlign: VerticalAlign;
  padding: number;
  backgroundColor?: string;
  className?: string;
}

export interface Column {
  id: string;
  widgets: Widget<unknown>[];
  settings: ColumnSettings;
}

// ============================================
// WIDGET TYPES
// ============================================

export type WidgetType =
  // Content Widgets
  | "hero-content"
  | "text-block"
  | "heading"
  | "rich-text"
  // Media Widgets
  | "image"
  | "video"
  | "gallery"
  | "lottie"
  // Form Widgets
  | "lead-form"
  | "contact-form"
  | "newsletter"
  // Social Proof Widgets
  | "trust-badges"
  | "stats-section"
  | "testimonial"
  | "testimonials-carousel"
  | "logo-cloud"
  | "reviews"
  // Commerce Widgets
  | "pricing-card"
  | "pricing-table"
  | "feature-comparison"
  // Layout Widgets
  | "spacer"
  | "divider"
  | "accordion"
  | "tabs"
  // CTA Widgets
  | "cta-banner"
  | "button-group"
  // Advanced Widgets
  | "faq"
  | "timeline"
  | "team-grid"
  | "feature-grid"
  | "countdown"
  | "map"
  | "custom-html";

export type WidgetCategory =
  | "most-used"
  | "content"
  | "media"
  | "forms"
  | "social-proof"
  | "commerce"
  | "layout"
  | "cta"
  | "advanced";

export interface WidgetSpacing {
  marginTop: number;
  marginBottom: number;
}

export const DEFAULT_WIDGET_SPACING: WidgetSpacing = {
  marginTop: 0,
  marginBottom: 0,
};

export interface Widget<T = Record<string, unknown>> {
  id: string;
  type: WidgetType;
  settings: T;
  spacing?: WidgetSpacing;
}

// ============================================
// WIDGET DEFINITIONS
// ============================================

// Badge Style
export type BadgeStyle = "pill" | "outline" | "solid";

// Hero Content Widget
export interface HeroContentWidgetSettings {
  // Badge
  badge: {
    show: boolean;
    icon: string;
    text: string;
    style: BadgeStyle;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
  };

  // Headline
  headline: {
    text: string;
    highlightWords: string;
    highlightColor: string;
    size: "sm" | "md" | "lg" | "xl";
    color?: string;
  };

  // Subheadline
  subheadline: {
    text: string;
    show: boolean;
    size: "sm" | "md" | "lg";
    color?: string;
  };

  // Features List
  features: {
    show: boolean;
    items: Array<{ id: string; icon: string; text: string }>;
    columns: 1 | 2 | 3 | 4;
    iconColor: string;
    iconPosition: "left" | "right";
    layout: "list" | "grid";
  };

  // Primary Button
  primaryButton: {
    show: boolean;
    text: string;
    link: string;
    badge?: string;
    style?: ButtonCustomStyle;
    openInNewTab?: boolean;
  };

  // Secondary Button
  secondaryButton: {
    show: boolean;
    text: string;
    link: string;
    style: "link" | "outline" | "ghost";
    openInNewTab?: boolean;
  };

  // Trust Text (with stars)
  trustText: {
    show: boolean;
    rating: number;
    text: string;
    textColor?: string;
    starColor?: string;
  };

  // Alignment
  alignment: "left" | "center" | "right";
}

// Image Widget
export type ImageObjectFit = "cover" | "contain" | "fill";
export type ImageShadow = "none" | "sm" | "md" | "lg" | "xl" | "2xl";
export type ImageAspectRatio = "auto" | "1:1" | "4:3" | "16:9" | "3:2";
export type ImageAnimation = "none" | "fade" | "slide-up" | "zoom";

export interface ImageWidgetSettings {
  src: string;
  alt: string;
  objectFit: ImageObjectFit;
  borderRadius: number;
  shadow: ImageShadow;
  aspectRatio: ImageAspectRatio;
  animation: ImageAnimation;
}

// Lead Form Widget
export type FormFieldType = "text" | "email" | "phone" | "select" | "textarea";
export type FormSubmitTo = "database" | "webhook" | "email";

export interface LeadFormField {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select
}

export interface LeadFormWidgetSettings {
  title?: string;
  description?: string;
  fields: LeadFormField[];
  submitButton: {
    text: string;
    style?: ButtonCustomStyle;
    fullWidth: boolean;
  };
  successMessage: string;
  // Integration
  submitTo: FormSubmitTo;
  webhookUrl?: string;
  emailTo?: string;
  // Styling
  backgroundColor?: string;
  padding: number;
  borderRadius: number;
  shadow: boolean;
}

// Trust Badges Widget
export interface TrustBadge {
  id: string;
  icon: string;
  text: string;
}

export interface TrustBadgesWidgetSettings {
  badges: TrustBadge[];
  layout: "horizontal" | "grid";
  columns: 2 | 3 | 4 | 5;
  style: {
    backgroundColor: string;
    borderColor: string;
    iconColor: string;
    textColor: string;
    borderRadius: number;
  };
  centered: boolean;
}

// Stats Section Widget
export interface StatItem {
  id: string;
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  animate: boolean;
}

export interface StatsSectionWidgetSettings {
  stats: StatItem[];
  columns: 2 | 3 | 4 | 5;
  style: {
    valueColor: string;
    labelColor: string;
    valueSize: "sm" | "md" | "lg" | "xl";
    divider: boolean;
  };
  centered: boolean;
  animateOnScroll: boolean;
}

// Video Widget
export type VideoSource = "youtube" | "vimeo" | "custom";
export type VideoAspectRatio = "16:9" | "4:3" | "1:1";

export interface VideoWidgetSettings {
  source: VideoSource;
  url: string;
  thumbnail?: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  aspectRatio: VideoAspectRatio;
  borderRadius: number;
  shadow: boolean;
}

// Testimonial Widget
export interface TestimonialWidgetSettings {
  quote: string;
  author: {
    name: string;
    role: string;
    company?: string;
    avatar?: string;
  };
  rating?: number;
  style: {
    backgroundColor?: string;
    quoteColor: string;
    showQuoteIcon: boolean;
  };
}

// Heading Widget
export interface HeadingWidgetSettings {
  text: string;
  level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  alignment: "left" | "center" | "right";
  color?: string;
  size: "sm" | "md" | "lg" | "xl" | "2xl";
}

// Text Block Widget
export interface TextBlockWidgetSettings {
  content: string;
  alignment: "left" | "center" | "right" | "justify";
  color?: string;
  size: "sm" | "md" | "lg";
}

// Spacer Widget
export interface SpacerWidgetSettings {
  height: number;
  mobileHeight?: number;
}

// Divider Widget
export type DividerStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "gradient"
  | "gradient-fade"
  | "double"
  | "with-icon"
  | "with-text";

export interface DividerWidgetSettings {
  style: DividerStyle;
  color: string;
  secondaryColor?: string; // For gradient styles
  width: number; // Percentage 0-100
  thickness: number; // px
  spacing: number; // Vertical margin in px
  alignment: "left" | "center" | "right";
  // For with-icon style
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  // For with-text style
  text?: string;
  textSize?: "sm" | "md" | "lg";
  textColor?: string;
  textBackground?: string;
}

// ============================================
// WIDGET DEFINITION TYPES
// ============================================

export interface WidgetDefinition<T = Record<string, unknown>> {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  category: WidgetCategory;
  defaultSettings: T;
  component: React.ComponentType<{ settings: T; isPreview?: boolean }>;
  settingsPanel?: React.ComponentType<{
    settings: T;
    onChange: (settings: T) => void;
  }>;
  thumbnail?: string;
}

// ============================================
// PAGE TYPES
// ============================================

export interface GlobalSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headingFontFamily?: string;
  backgroundColor: string;
  textColor: string;
}

export interface LandingPageData {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  globalSettings: GlobalSettings;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// BUILDER STATE TYPES
// ============================================

export type SelectionType = "section" | "column" | "widget" | null;

export interface BuilderSelection {
  type: SelectionType;
  sectionId?: string;
  columnId?: string;
  widgetId?: string;
}

export interface BuilderState {
  sections: Section[];
  selection: BuilderSelection;
  isDragging: boolean;
  isPreviewMode: boolean;
  previewDevice: "desktop" | "tablet" | "mobile";
}

// ============================================
// LAYOUT HELPERS
// ============================================

export interface LayoutOption {
  layout: SectionLayout;
  name: string;
  description: string;
  columns: number;
  widths: string[]; // Tailwind width classes
}

// ============================================
// WIDGET REGISTRY TYPES
// ============================================

export interface WidgetCategoryInfo {
  id: WidgetCategory;
  name: string;
  icon: string;
  description: string;
}
