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
export type PatternType = "dots" | "grid" | "grid-fine" | "diagonal" | "waves" | "circuit" | "geometric" | "confetti";

/** Decorative radial glow positioned absolutely inside a section — used for hero accent lighting */
export interface DecorativeGlow {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  size: number;       // px (square)
  color: string;      // hex or rgba
  opacity?: number;   // 0-1, default 1 (color usually already has alpha)
  offsetX?: number;   // % offset from edge (e.g., -10 = -10%)
  offsetY?: number;   // % offset from edge
  fade?: number;      // 0-100, where the gradient becomes transparent (default 70)
}
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

export interface PatternSettings {
  type: PatternType;
  color: string;
  opacity: number; // 0-1
  /** Optional radial fade mask — pattern visible at center, fades to transparent at edges */
  mask?: "none" | "radial-center" | "radial-top" | "radial-bottom";
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
  patternOverlay?: PatternSettings; // Pattern overlay on top of any background
}

export type WatermarkPosition = "left" | "right" | "center";

export interface SectionWatermark {
  enabled: boolean;
  text: string;
  position: WatermarkPosition;
  fontSize: number;       // px
  fontWeight: number;
  color: string;          // rgba recommended
  opacity: number;        // 0–1
  rotation: number;       // degrees
  offsetX: number;        // px from edge
  offsetY: number;        // px vertical offset from center
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
  paddingLeft: number;
  paddingRight: number;
  marginTop: number;
  marginBottom: number;
  minHeight?: number;
  gap: number;
  maxWidth: MaxWidth;
  borderRadius?: number;
  gradientBorder?: {
    enabled: boolean;
    colors: string[];
    angle: number;
    width: number;
  };
  className?: string;
  // Custom CSS (admin-editable, scoped to section)
  customCSS?: string;
  // Decorative watermark text overlay
  watermark?: SectionWatermark;
  // Decorative radial glows (e.g., hero accent lights)
  decorativeGlows?: DecorativeGlow[];
  // Visibility
  isVisible: boolean;
  visibleOnMobile: boolean;
  visibleOnDesktop: boolean;
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
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
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
  | "process-steps"
  // Media Widgets
  | "image"
  | "image-slider"
  | "video"
  | "gallery"
  | "lottie"
  // Form Widgets
  | "lead-form"
  | "contact-form"
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
  | "service-card"
  | "service-list"
  | "vendor-listing"
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
  | "faq-accordion"
  | "timeline"
  | "team-grid"
  | "feature-grid"
  | "countdown"
  | "map"
  | "custom-html"
  // Service Widgets (for Service Details template)
  | "service-hero"
  | "service-features"
  | "service-description"
  | "service-breadcrumb"
  | "service-pricing"
  | "service-process"
  | "service-faq"
  | "service-requirements"
  | "service-deliverables"
  | "service-timeline"
  | "service-checklist-card"
  | "related-services"
  | "service-testimonials"
  | "service-cta"
  // Blog Widgets
  | "blog-post-grid"
  | "blog-post-carousel"
  | "blog-featured-post"
  | "blog-post-list"
  | "blog-recent-posts"
  | "blog-post-hero"
  | "blog-post-content"
  | "blog-post-toc"
  | "blog-post-author-card"
  | "blog-post-tags"
  // New CTA / Nav / Social
  | "newsletter-cta"
  | "social-share-rail"
  | "breadcrumb"
  // Event/Planner Widgets
  | "event-search-hero"
  | "event-gallery-grid"
  | "cta-banner"
  // Navigation Widgets
  | "top-utility-bar"
  // Ticker Widgets
  | "ticker-marquee"
  // Features Showcase Widget
  | "features-showcase"
  // Trending Venues Widget
  | "trending-venues";

export type WidgetCategory =
  | "most-used"
  | "content"
  | "media"
  | "forms"
  | "social-proof"
  | "commerce"
  | "layout"
  | "cta"
  | "advanced"
  | "service" // Service-specific widgets (for Service Details template)
  | "blog" // Blog widgets
  | "wedding"; // Wedding & event planner widgets

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
// SHARED WIDGET CONTAINER STYLE
// ============================================

export interface WidgetContainerStyle {
  backgroundColor?: string;
  backgroundType?: "solid" | "gradient";
  gradientBackground?: {
    colors: string[];
    angle: number;
  };
  padding: number;
  borderRadius: number;
  gradientBorder?: {
    enabled: boolean;
    colors: string[];
    angle: number;
  };
  borderWidth?: number;
  shadow?: "none" | "sm" | "md" | "lg";
  maxWidth?: number;
  glow?: {
    enabled: boolean;
    color: string;
    blur: number;
    spread: number;
    opacity: number;
  };
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
    boxShadow?: string;
    dot?: { show: boolean; color: string }; // Pulsing dot indicator
  };

  // Headline
  headline: {
    text: string;
    highlightWords: string;
    highlightColor: string;
    underlineWords?: string; // Words that get underline decoration (comma-separated)
    underlineColor?: string; // Color of underline decoration
    size: "sm" | "md" | "lg" | "xl" | "2xl";
    customFontSize?: string; // e.g., "clamp(44px,6vw,76px)" - overrides size when set
    color?: string;
    fontWeight?: number; // 700, 800, 900
    letterSpacing?: string; // e.g., "-0.04em"
    lineHeight?: number; // e.g., 1.0
  };

  // Subheadline
  subheadline: {
    text: string;
    show: boolean;
    size: "sm" | "md" | "lg";
    color?: string;
    lineHeight?: number; // e.g., 1.75
    maxWidth?: number; // px value, e.g., 480
  };

  // Spacing between elements
  spacing?: {
    badgeToHeadline?: number; // px
    headlineToSub?: number; // px
    subToButtons?: number; // px
    buttonsToProof?: number; // px
    buttonsGap?: number; // px gap between buttons
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
    badge?: string;
    style?: ButtonCustomStyle;
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

  // Avatar Group (social proof)
  avatarGroup?: {
    show: boolean;
    avatars: Array<{ id: string; initials: string; color: string; imageUrl?: string }>;
    text: string;
    textColor?: string;
    boldColor?: string;
  };

  // Alignment
  alignment: "left" | "center" | "right";

  // Theme color binding
  colors?: {
    useTheme?: boolean; // When true, use CSS var(--color-primary) as accent color
  };

  // Optional Search Bar (e.g., for blog list / knowledge base hero)
  search?: {
    enabled: boolean;
    placeholder?: string;
    buttonText?: string;
    action?: "blog" | "services" | "custom-url";
    customUrl?: string; // when action === "custom-url" — pattern like "/search?q="
    variant?: "pill" | "rounded" | "square";
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    buttonBgColor?: string;
    buttonTextColor?: string;
    maxWidth?: number; // px
  };

  // Container Style
  container?: WidgetContainerStyle;
}

// Image Widget - Comprehensive Modern Settings
export type ImageObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";
export type ImageShadow = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "inner" | "glow";
export type ImageAspectRatio = "auto" | "1:1" | "4:3" | "16:9" | "3:2" | "2:3" | "9:16" | "21:9";
export type ImageAnimation = "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in" | "zoom-out" | "flip" | "rotate";
export type ImageHoverEffect =
  | "none"
  | "zoom"
  | "zoom-out"
  | "brighten"
  | "darken"
  | "grayscale"
  | "blur"
  | "rotate"
  | "tilt-left"
  | "tilt-right"
  | "lift"
  | "glow"
  | "shine"
  | "overlay-fade";
export type ImageFloatAnimation = "none" | "float" | "pulse" | "bounce" | "swing" | "wobble";
export type ImageMask = "none" | "circle" | "rounded-lg" | "rounded-xl" | "hexagon" | "blob" | "diamond" | "triangle";

export interface ImageWidgetSettings {
  // Basic
  src: string;
  alt: string;
  title?: string;

  // Size & Fit
  objectFit: ImageObjectFit;
  aspectRatio: ImageAspectRatio;
  maxWidth?: number; // percentage 10-100
  alignment: "left" | "center" | "right";

  // Styling
  borderRadius: number;
  shadow: ImageShadow;
  shadowColor?: string; // for glow effect
  border: {
    width: number;
    color: string;
    style: "solid" | "dashed" | "dotted" | "double";
  };

  // Link Options
  link?: {
    url: string;
    openInNewTab: boolean;
  };

  // Lightbox (click image to view fullscreen)
  lightbox: boolean;

  // Caption
  caption?: {
    enabled: boolean;
    text: string;
    position: "below" | "overlay-bottom" | "overlay-top" | "overlay-center";
    backgroundColor?: string;
    backgroundOpacity?: number; // 0-1
    textColor?: string;
    fontSize: "xs" | "sm" | "md" | "lg";
  };

  // Hover Effects
  hoverEffect: ImageHoverEffect;
  hoverTransitionDuration: number; // ms

  // Overlay
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
    showOnHover: boolean;
  };

  // Entrance Animation
  animation: ImageAnimation;
  animationDuration: number; // ms
  animationDelay: number; // ms

  // Floating Animation (continuous)
  floatAnimation: ImageFloatAnimation;

  // Parallax
  parallax?: {
    enabled: boolean;
    speed: number; // 0.1 to 1.0
    direction: "vertical" | "horizontal";
  };

  // Mask/Shape
  mask: ImageMask;

  // Advanced
  lazyLoad: boolean;
  priority: boolean; // for LCP images

  // Filters
  filters?: {
    brightness: number; // 0-200, default 100
    contrast: number; // 0-200, default 100
    saturation: number; // 0-200, default 100
    blur: number; // 0-20px
    grayscale: number; // 0-100%
    sepia: number; // 0-100%
    hueRotate: number; // 0-360deg
  };

  // Container Style
  container?: WidgetContainerStyle;
}

// ============================================
// IMAGE SLIDER WIDGET TYPES
// ============================================

export type SliderType = "standard" | "hero" | "carousel" | "gallery" | "split" | "vertical";

export type SliderEffect =
  | "slide"
  | "fade"
  | "cube"
  | "coverflow"
  | "flip"
  | "cards"
  | "creative"
  | "parallax";

export type ArrowStyle = "default" | "minimal" | "rounded" | "square" | "floating" | "outside";
export type PaginationType = "dots" | "fraction" | "progressbar" | "bullets-dynamic" | "custom";
export type LayerAnimationType =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom"
  | "zoom-out"
  | "rotate"
  | "flip"
  | "bounce"
  | "elastic";

export type LayerAnimationEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "bounce"
  | "elastic";

// Layer Animation for content elements
export interface LayerAnimation {
  in: {
    type: LayerAnimationType;
    duration: number;
    delay: number;
    easing: LayerAnimationEasing;
  };
  out?: {
    type: LayerAnimationType;
    duration: number;
    easing: string;
  };
}

// Slide Content Configuration
export interface SlideContentConfig {
  enabled: boolean;
  position:
    | "center"
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  maxWidth: "sm" | "md" | "lg" | "xl" | "full";
  padding: number;
  textAlign: "left" | "center" | "right";

  badge?: {
    show: boolean;
    text: string;
    icon?: string;
    style: "pill" | "outline" | "solid";
    animation: LayerAnimation;
  };

  headline?: {
    show: boolean;
    text: string;
    size: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    color: string;
    highlightWords?: string;
    highlightColor?: string;
    animation: LayerAnimation;
  };

  subheadline?: {
    show: boolean;
    text: string;
    size: "sm" | "md" | "lg";
    color: string;
    animation: LayerAnimation;
  };

  description?: {
    show: boolean;
    text: string;
    color: string;
    animation: LayerAnimation;
  };

  buttons?: {
    show: boolean;
    items: Array<{
      id: string;
      text: string;
      link: string;
      style: "primary" | "secondary" | "outline" | "ghost";
      openInNewTab: boolean;
    }>;
    animation: LayerAnimation;
  };
}

// Individual Slide Item
export interface SlideItem {
  id: string;

  // Image
  image: {
    src: string;
    alt: string;
    objectFit: "cover" | "contain" | "fill";
    objectPosition: "center" | "top" | "bottom" | "left" | "right";
    kenBurnsOverride?: {
      direction: "in" | "out";
      position: "center" | "top" | "bottom" | "left" | "right";
    };
  };

  // Overlay
  overlay?: {
    enabled: boolean;
    type: "solid" | "gradient";
    color?: string;
    gradient?: {
      type: "linear" | "radial";
      angle?: number;
      colors: Array<{ color: string; position: number }>;
    };
    opacity: number;
  };

  // Content Layers
  content?: SlideContentConfig;

  // Video Background
  videoBackground?: {
    enabled: boolean;
    src: string;
    type: "mp4" | "webm" | "youtube" | "vimeo";
    muted: boolean;
    loop: boolean;
    playbackRate: number;
    fallbackImage: string;
  };

  // Link (entire slide clickable)
  link?: {
    url: string;
    openInNewTab: boolean;
    ariaLabel: string;
  };
}

// Main Image Slider Widget Settings
export interface ImageSliderWidgetSettings {
  // Slides
  slides: SlideItem[];

  // Slider Type
  sliderType: SliderType;

  // Transition Effects
  effect: SliderEffect;
  creativeEffect?: {
    prev: {
      translate: [number, number, number];
      rotate: [number, number, number];
      scale: number;
      opacity: number;
    };
    next: {
      translate: [number, number, number];
      rotate: [number, number, number];
      scale: number;
      opacity: number;
    };
  };

  // Autoplay
  autoplay: {
    enabled: boolean;
    delay: number;
    pauseOnHover: boolean;
    pauseOnInteraction: boolean;
    reverseDirection: boolean;
    showPauseButton: boolean;
  };

  // Navigation
  navigation: {
    arrows: {
      enabled: boolean;
      style: ArrowStyle;
      size: "sm" | "md" | "lg";
      color: string;
      backgroundColor?: string;
      hoverEffect: "none" | "scale" | "glow" | "slide";
      position: "sides" | "bottom" | "bottom-right";
      showOnHover: boolean;
    };

    pagination: {
      enabled: boolean;
      type: PaginationType;
      position: "bottom" | "top" | "left" | "right";
      clickable: boolean;
      activeColor: string;
      inactiveColor: string;
      progressbarFill?: "horizontal" | "vertical";
      progressbarPosition?: "top" | "bottom";
    };

    thumbnails: {
      enabled: boolean;
      position: "bottom" | "left" | "right";
      size: number;
      gap: number;
      activeStyle: "border" | "opacity" | "scale";
      aspectRatio: "1:1" | "16:9" | "4:3";
    };

    keyboard: boolean;
    mousewheel: boolean;
    grabCursor: boolean;
  };

  // Touch & Swipe
  touch: {
    enabled: boolean;
    threshold: number;
    resistance: boolean;
    shortSwipes: boolean;
    longSwipesRatio: number;
  };

  // Loop & Speed
  loop: boolean;
  speed: number;
  slidesPerView: number | "auto";
  spaceBetween: number;
  centeredSlides: boolean;

  // Ken Burns Effect
  kenBurns: {
    enabled: boolean;
    duration: number;
    scale: {
      start: number;
      end: number;
    };
    position: "random" | "center" | "top" | "bottom" | "left" | "right";
    direction: "in" | "out" | "random";
  };

  // Parallax
  parallax: {
    enabled: boolean;
  };

  // Split Screen
  splitScreen?: {
    contentPosition: "left" | "right";
    ratio: "50-50" | "40-60" | "60-40" | "33-66" | "66-33";
    contentBackground?: string;
    mobileStack: "content-first" | "image-first";
  };

  // Layout & Sizing
  height: "auto" | "viewport" | "large" | "medium" | "small" | number;
  maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  aspectRatio?: "16:9" | "21:9" | "4:3" | "1:1" | "auto";

  // Styling
  borderRadius: number;
  shadow: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  overflow: "hidden" | "visible";

  // Responsive
  responsive?: {
    mobile?: {
      slidesPerView?: number;
      spaceBetween?: number;
      effect?: SliderEffect;
      navigation?: {
        arrows?: { enabled?: boolean };
      };
    };
    tablet?: {
      slidesPerView?: number;
      spaceBetween?: number;
    };
  };

  // Container Style
  container?: WidgetContainerStyle;
}

// Lead Form Widget
export type FormFieldType =
  | "text"
  | "email"
  | "phone"
  | "select"
  | "textarea"
  | "radio"
  | "checkbox"
  | "number"
  | "date"
  | "country_select"
  | "service_select";
export type FormSubmitTo = "database" | "webhook" | "email";

export interface LeadFormField {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  mapToLeadField?: string; // Maps to Lead model field (e.g., "interestedIn", "country")
  width?: "full" | "half"; // Field width: "half" renders 2 fields side by side
}

export interface LeadFormWidgetSettings {
  title?: string;
  description?: string;
  templateId?: string; // Reference to LeadFormTemplate
  fields: LeadFormField[];
  submitButton: {
    text: string;
    icon?: string; // Lucide icon name (e.g., "Send")
    style?: ButtonCustomStyle;
    fullWidth: boolean;
  };
  successMessage: string;
  footerText?: string; // HTML text below submit button (e.g., privacy policy link)
  // Integration
  submitTo: FormSubmitTo;
  webhookUrl?: string;
  emailTo?: string;
  // Form Layout
  formMaxWidth?: number; // Max width in px (0 = full width)
  formAlignment?: "left" | "center" | "right";
  // Button Layout
  buttonLayout?: "horizontal" | "vertical" | "stacked";
  buttonAlignment?: "left" | "center" | "right";
  buttonGap?: number;
  buttonWidth?: number; // Width in px (0 = auto)
  // Styling
  backgroundColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  labelColor?: string;
  inputTextColor?: string;
  padding: number;
  borderRadius: number;
  shadow: boolean;
  // Input Styling
  inputBgColor?: string;
  inputBorderColor?: string;
  inputBorderRadius?: number;
  placeholderColor?: string;
  // Label Styling
  labelTextTransform?: "none" | "uppercase" | "capitalize";
  labelFontSize?: string;
  labelLetterSpacing?: string;
  labelFontWeight?: number;
  // Button Size
  buttonSize?: "sm" | "md" | "lg";

  // Container Style
  container?: WidgetContainerStyle;
}

// Button Group Widget
export interface ButtonGroupButton {
  id: string;
  text: string;
  link: string;
  openInNewTab?: boolean;
  style?: ButtonCustomStyle;
}

export interface ButtonGroupWidgetSettings {
  buttons: ButtonGroupButton[];
  layout: "horizontal" | "vertical" | "stacked";
  alignment: "left" | "center" | "right";
  gap: number;

  // Container Style
  container?: WidgetContainerStyle;
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

  // Container Style
  container?: WidgetContainerStyle;
}

// Stats Section Widget
export interface StatItem {
  id: string;
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  animate: boolean;
  icon?: string;       // Lucide icon name e.g. "Trophy"
  iconColor?: string;  // Per-stat icon color override
}

export interface StatsCardGridConfig {
  borderRadius: number;
  gridGap: number;
  gridLineColor: string;
  cellBackground: string;
  cellPadding: string;
  valueFontFamily?: string;
  valueFontWeight?: number;
  valueFontSize?: number;
  valueLetterSpacing?: string;
  labelFontSize?: number;
  labelFontWeight?: number;
  labelLetterSpacing?: string;
  labelMarginTop?: number;
}

export interface StatsSectionWidgetSettings {
  variant?: "default" | "card-grid";
  stats: StatItem[];
  columns: 2 | 3 | 4 | 5;
  style: {
    valueColor: string;
    labelColor: string;
    valueSize: "sm" | "md" | "lg" | "xl";
    divider: boolean;
    showTopBorder?: boolean;
    topBorderColor?: string;
    layout?: "vertical" | "horizontal";
    iconColor?: string;
    iconSize?: "sm" | "md" | "lg";
    suffixColor?: string;
    // Custom typography overrides for default variant
    customValueFontSize?: string;    // e.g., "48px"
    valueFontWeight?: number;        // e.g., 900
    valueLetterSpacing?: string;     // e.g., "-0.04em"
    valueLineHeight?: number;        // e.g., 1
    customLabelFontSize?: string;    // e.g., "13px"
    labelFontWeight?: number;        // e.g., 500
    labelLetterSpacing?: string;     // e.g., "0.3px"
    labelSize?: "sm" | "md" | "lg";   // Label font size preset
    labelUppercase?: boolean;          // Whether to uppercase labels
  };
  // Optional section header (title + subtitle above the stats grid)
  header?: {
    show: boolean;
    title: string;
    subtitle?: string;
    titleColor: string;
    subtitleColor: string;
  };
  cardGrid?: StatsCardGridConfig;
  centered: boolean;
  animateOnScroll: boolean;

  // Theme color binding
  colors?: {
    useTheme?: boolean;
  };

  // Container Style
  container?: WidgetContainerStyle;
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

  // Container Style
  container?: WidgetContainerStyle;
}

// Testimonial Widget (Single)
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
  // Container Style
  container?: WidgetContainerStyle;
}

// ============================================
// TESTIMONIALS WIDGET TYPES (Multiple - Grid/Carousel/Video)
// ============================================

export type TestimonialsViewMode = "grid" | "carousel" | "masonry" | "video-grid" | "marquee";
export type TestimonialType = "photo" | "video" | "mixed";
export type TestimonialCardStyle = "minimal" | "elevated" | "glassmorphism" | "bordered" | "gradient-border";
export type TestimonialAvatarStyle = "initials" | "photo" | "none";
export type TestimonialAvatarShape = "circle" | "rounded" | "square";
export type CarouselLayout = "standard" | "split" | "centered" | "rail";
export type CarouselEffect = "slide" | "fade" | "cards" | "coverflow";

// Manual testimonial item for widget settings
export interface TestimonialItem {
  id: string;
  name: string;
  company?: string;
  country?: string;
  avatar?: string;
  content: string;
  rating: number;
  // Video fields
  type: "photo" | "video";
  videoUrl?: string;
  thumbnailUrl?: string;
}

// Testimonials Widget Settings
export interface TestimonialsWidgetSettings {
  // Header Section
  header: {
    show: boolean;
    badge: {
      show: boolean;
      text: string;
      style: BadgeStyle;
      bgColor?: string;
      textColor?: string;
      borderColor?: string;
      // Custom typography overrides
      customFontSize?: string;
      fontWeight?: number;
      letterSpacing?: string;
      textTransform?: string;
    };
    heading: {
      text: string;
      highlightWords?: string;
      highlightColor?: string;
      size: "sm" | "md" | "lg" | "xl" | "2xl";
      color?: string;
      // Custom typography overrides
      customFontSize?: string;
      fontWeight?: number;
      lineHeight?: number;
      letterSpacing?: string;
    };
    description: {
      show: boolean;
      text: string;
      size: "sm" | "md" | "lg";
      color?: string;
      // Custom typography overrides
      customFontSize?: string;
      lineHeight?: number;
    };
    alignment: "left" | "center" | "right" | "space-between";
    marginBottom: number;
  };

  // View Mode
  viewMode: TestimonialsViewMode;
  testimonialType: TestimonialType;

  // Data Source
  dataSource: {
    limit: number;
    sortBy: "rating" | "recent" | "sort-order";
    // Filter by type (photo/video)
    testimonialType?: "all" | "photo" | "video";
    // Filter by tags
    filterByTags?: string[];
  };

  // Grid View Settings
  gridView: {
    columns: 2 | 3 | 4;
    gap: number;
    showQuoteIcon: boolean;
    quoteIconPosition: "top-left" | "top-right" | "background";
    quoteIconColor?: string;
    quoteIconSize: "sm" | "md" | "lg";
  };

  // Carousel View Settings
  carouselView: {
    layout: CarouselLayout;
    effect: CarouselEffect;
    autoplay: boolean;
    autoplayDelay: number;
    loop: boolean;
    slidesPerView: 1 | 2 | 3;
    spaceBetween: number;
    // Navigation
    navigation: {
      arrows: {
        enabled: boolean;
        style: "default" | "minimal" | "rounded" | "outside";
        size: "sm" | "md" | "lg";
        color?: string;
        backgroundColor?: string;
        position: "sides" | "bottom" | "bottom-right";
        showOnHover: boolean;
      };
      pagination: {
        enabled: boolean;
        type: "dots" | "fraction" | "progressbar";
        activeColor?: string;
        inactiveColor?: string;
      };
    };
    // Split layout specific
    splitLayout?: {
      photoPosition: "left" | "right";
      photoSize: "40" | "50" | "60"; // percentage
    };
  };

  // Video Grid Settings
  videoView: {
    columns: 2 | 3 | 4;
    gap: number;
    thumbnailAspectRatio: "9:16" | "16:9" | "1:1" | "4:5";
    playButtonStyle: "default" | "minimal" | "circle" | "rounded";
    playButtonSize: "sm" | "md" | "lg";
    playButtonColor?: string;
    overlayColor?: string;
    overlayOpacity: number;
    showCustomerInfo: boolean;
    darkTheme: boolean;
    hoverEffect: "none" | "scale" | "brightness" | "overlay-fade";
  };

  // Card Style
  cardStyle: {
    style: TestimonialCardStyle;
    borderRadius: number;
    borderWidth: number;
    borderColor?: string;
    backgroundColor?: string;
    shadow: "none" | "sm" | "md" | "lg" | "xl";
    padding: number;
    hoverEffect: "none" | "lift" | "glow" | "scale" | "border-color";
    glassEffect?: {
      enabled: boolean;
      blur: number;
      opacity: number;
    };
    gradientBorder?: {
      enabled: boolean;
      colors: string[];
      angle: number;
    };
  };

  // Avatar/Photo Style
  avatar: {
    style: TestimonialAvatarStyle;
    shape: TestimonialAvatarShape;
    size: "sm" | "md" | "lg" | "xl";
    borderWidth: number;
    borderColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };

  // Content Display
  content: {
    showRating: boolean;
    ratingStyle: "stars" | "number" | "both";
    ratingColor?: string;
    showCompany: boolean;
    showCountry: boolean;
    countryFlag: boolean;
    quoteMaxLines: number; // 0 = no limit
    quoteFontSize: "sm" | "md" | "lg";
    quoteColor?: string;
    quoteStyle: "normal" | "italic";
    nameFontSize: "sm" | "md" | "lg";
    nameColor?: string;
    nameFontWeight: "normal" | "medium" | "semibold" | "bold";
    infoColor?: string;
    infoFontSize: "xs" | "sm" | "md";
  };

  // Trust Footer
  trustFooter: {
    show: boolean;
    showAvatarStack: boolean;
    avatarStackCount: number;
    customerCountText: string; // "Join 10,000+ happy customers"
    showAverageRating: boolean;
    averageRating: number;
    totalReviews: string; // "(2,500+ reviews)"
    alignment: "left" | "center" | "right";
    marginTop: number;
  };

  // Animation
  animation: {
    enabled: boolean;
    entrance: "none" | "fade" | "slide-up" | "scale" | "stagger";
    staggerDelay: number;
    duration: number;
  };

  // Responsive
  responsive: {
    tablet: {
      columns: 1 | 2 | 3;
      slidesPerView?: 1 | 2;
    };
    mobile: {
      columns: 1 | 2;
      slidesPerView?: 1;
      layout?: "vertical"; // Force vertical on mobile
    };
  };

  // Container Style
  container?: WidgetContainerStyle;
}

// ============================================
// HEADING WIDGET TYPES (v3.2 - 2025 Page Builder Analysis)
// ============================================

// Typography Settings
export interface HeadingTypographySettings {
  fontFamily?: string;
  fontSize: number;
  fontSizeUnit: "px" | "em" | "rem" | "vw";
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontStyle: "normal" | "italic";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration: "none" | "underline" | "line-through";
  lineHeight: number;
  letterSpacing: number;
  letterSpacingUnit: "px" | "em";
  wordSpacing?: number;
}

// Text Fill Settings
export interface HeadingTextFillSettings {
  type: "solid" | "gradient" | "image";
  color?: string;
  gradient?: {
    type: "linear" | "radial";
    angle: number;
    colors: Array<{
      color: string;
      position: number;
    }>;
  };
  image?: {
    url: string;
    size: "cover" | "contain" | "auto";
    position: "center" | "top" | "bottom";
    fixed: boolean;
  };
}

// Text Stroke (Outline)
export interface HeadingTextStrokeSettings {
  enabled: boolean;
  width: number;
  color: string;
  fillColor?: string;
}

// Text Shadow
export interface HeadingTextShadowSettings {
  enabled: boolean;
  shadows: Array<{
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  }>;
}

// Highlight Styles
export type HeadingHighlightStyle =
  | "color"
  | "background"
  | "gradient"
  | "underline"
  | "marker"
  | "glow";

// Animation Types
export type HeadingEntranceAnimationType =
  | "none"
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out"
  | "slide-up"
  | "slide-down"
  | "flip"
  | "bounce";

export type HeadingTextAnimationType =
  | "none"
  | "fade-in"
  | "slide-up"
  | "slide-down"
  | "scale"
  | "rotate"
  | "blur-in"
  | "typewriter"
  | "wave"
  | "bounce"
  | "elastic"
  | "glitch"
  | "scramble";

export type HeadingContinuousAnimationType =
  | "none"
  | "gradient-shift"
  | "pulse"
  | "glow"
  | "shimmer"
  | "float";

export type HeadingHoverAnimationType =
  | "none"
  | "color-change"
  | "underline-grow"
  | "background-fill"
  | "scale"
  | "letter-spacing"
  | "glow";

export type HeadingEasingType =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "bounce"
  | "elastic"
  | "back";

// Responsive Overrides
export interface HeadingResponsiveOverrides {
  fontSize?: number;
  fontSizeUnit?: "px" | "em" | "rem" | "vw";
  lineHeight?: number;
  letterSpacing?: number;
  alignment?: "left" | "center" | "right";
}

// Main Heading Widget Settings
export interface HeadingWidgetSettings {
  // Content Tab
  content: {
    text: string;
    htmlTag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span" | "p";
    link?: {
      url: string;
      openInNewTab: boolean;
    };
    highlight?: {
      enabled: boolean;
      words: string;
      style: HeadingHighlightStyle;
    };
    splitHeading?: {
      enabled: boolean;
      beforeText: string;
      mainText: string;
      afterText: string;
    };
  };

  // Style Tab
  style: {
    alignment: "left" | "center" | "right";
    typography: HeadingTypographySettings;
    textFill: HeadingTextFillSettings;
    textStroke?: HeadingTextStrokeSettings;
    textShadow?: HeadingTextShadowSettings;
    highlightStyle?: {
      color?: string;
      backgroundColor?: string;
      backgroundType?: "solid" | "gradient" | "marker";
      gradientColors?: string[];
      padding?: string;
      borderRadius?: number;
    };
    splitStyles?: {
      before: Partial<HeadingTypographySettings> & { color?: string };
      main: Partial<HeadingTypographySettings> & { color?: string };
      after: Partial<HeadingTypographySettings> & { color?: string };
    };
  };

  // Animation Tab
  animation?: {
    entrance?: {
      enabled: boolean;
      type: HeadingEntranceAnimationType;
      duration: number;
      delay: number;
      easing: HeadingEasingType;
    };
    textAnimation?: {
      enabled: boolean;
      type: HeadingTextAnimationType;
      splitBy: "characters" | "words" | "lines";
      staggerDelay: number;
      duration: number;
      easing: HeadingEasingType;
      loop: boolean;
      loopDelay?: number;
    };
    continuousAnimation?: {
      enabled: boolean;
      type: HeadingContinuousAnimationType;
      duration: number;
      gradientColors?: string[];
      gradientAngle?: number;
    };
    hoverAnimation?: {
      enabled: boolean;
      type: HeadingHoverAnimationType;
      duration: number;
    };
  };

  // Responsive Tab
  responsive?: {
    desktop: HeadingResponsiveOverrides;
    tablet?: HeadingResponsiveOverrides;
    mobile?: HeadingResponsiveOverrides;
  };

  // Advanced Tab
  advanced?: {
    customClass?: string;
    maxWidth?: {
      enabled: boolean;
      value: number;
      unit: "px" | "ch" | "%" | "vw";
    };
    hideOnDesktop?: boolean;
    hideOnTablet?: boolean;
    hideOnMobile?: boolean;
    customId?: string;
    customAttributes?: Record<string, string>;
  };

  // Container Style
  container?: WidgetContainerStyle;
}

// Text Block Widget (Tiptap)
export type TextBlockToolbarPreset = "minimal" | "basic" | "standard" | "full";

export interface TextBlockWidgetSettings {
  // === CONTENT ===
  content: string; // HTML content from Tiptap

  // === EDITOR CONFIG ===
  editor: {
    toolbar: TextBlockToolbarPreset;
    minHeight: number; // px (default: 200)
    maxHeight?: number; // px (optional limit)
    charLimit?: number;
    placeholder?: string;
  };

  // === TYPOGRAPHY ===
  typography: {
    fontFamily?: string;
    fontSize: number; // px
    lineHeight: number; // unitless (e.g., 1.6)
    letterSpacing?: number; // px
    color: string;
    linkColor: string;
    linkHoverColor: string;
    linkUnderline: boolean;
  };

  // === CONTAINER STYLING ===
  container: {
    backgroundColor?: string;
    backgroundType?: "solid" | "gradient";
    gradientBackground?: {
      colors: string[];
      angle: number;
    };
    padding: number; // px
    borderRadius: number; // px
    border?: {
      width: number;
      color: string;
      style: "solid" | "dashed" | "dotted";
    };
    gradientBorder?: {
      enabled: boolean;
      colors: string[];
      angle: number;
    };
    shadow?: "none" | "sm" | "md" | "lg";
    maxWidth?: number; // px (for readability)
    glow?: {
      enabled: boolean;
      color: string;
      blur: number;
      spread: number;
      opacity: number;
    };
  };

  // === PARAGRAPH STYLING ===
  paragraphSpacing: number; // Margin between paragraphs (px)

  // === LIST STYLING ===
  lists: {
    bulletStyle: "disc" | "circle" | "square" | "none";
    bulletColor?: string;
    numberStyle:
      | "decimal"
      | "lower-alpha"
      | "upper-alpha"
      | "lower-roman"
      | "upper-roman";
    indentation: number; // px
  };

  // === BLOCKQUOTE STYLING ===
  blockquote: {
    borderColor: string;
    borderWidth: number;
    backgroundColor?: string;
    fontStyle: "normal" | "italic";
    padding: number;
  };

  // === DROP CAP ===
  dropCap: {
    enabled: boolean;
    size: number; // Lines to span (2-4)
    color?: string;
    fontFamily?: string;
  };

  // === COLUMNS (Multi-column text) ===
  columns?: {
    enabled: boolean;
    count: 1 | 2 | 3;
    gap: number; // px
    divider?: {
      show: boolean;
      color: string;
      width: number;
    };
  };

  // === ANIMATION ===
  animation?: {
    entrance: {
      enabled: boolean;
      type: "none" | "fade" | "fade-up" | "fade-down" | "slide-up";
      duration: number; // ms
      delay: number; // ms
    };
  };

  // === RESPONSIVE ===
  responsive?: {
    tablet?: {
      fontSize?: number;
      lineHeight?: number;
      columns?: number;
    };
    mobile?: {
      fontSize?: number;
      lineHeight?: number;
      columns?: number;
    };
  };

  // === ADVANCED ===
  advanced?: {
    customClass?: string;
    customId?: string;
    hideOnDesktop: boolean;
    hideOnTablet: boolean;
    hideOnMobile: boolean;
  };
}

// Spacer Widget
export interface SpacerWidgetSettings {
  height: number;
  mobileHeight?: number;

  // Container Style
  container?: WidgetContainerStyle;
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

  // Container Style
  container?: WidgetContainerStyle;
}

// ============================================
// SERVICE CARD WIDGET TYPES
// ============================================

export type ServiceCardStyle =
  | "minimal"
  | "elevated"
  | "glassmorphism"
  | "gradient-border"
  | "spotlight"
  | "neon-glow"
  | "forge";

export type ServiceCardHoverEffect =
  | "none"
  | "lift"
  | "glow"
  | "border-glow"
  | "border-color"
  | "scale"
  | "spotlight";

export type ServiceCardIconAnimation =
  | "none"
  | "bounce"
  | "rotate"
  | "scale"
  | "shake"
  | "pulse";

export type ServiceCardIconStyle =
  | "rounded"
  | "circle"
  | "square"
  | "gradient-bg"
  | "outline";

export type ServiceCardSortBy =
  | "popular"
  | "price-asc"
  | "price-desc"
  | "name";

export interface ServiceCardWidgetSettings {
  // Header Section (above cards)
  header: {
    show: boolean;
    badge: {
      show: boolean;
      text: string;
      style: BadgeStyle;
      bgColor?: string;
      textColor?: string;
      borderColor?: string;
      // Custom typography overrides
      customFontSize?: string;
      fontWeight?: number;
      letterSpacing?: string;
      textTransform?: string;
    };
    heading: {
      text: string;
      highlightWords?: string;
      highlightColor?: string;
      size: "sm" | "md" | "lg" | "xl" | "2xl";
      color?: string;
      // Custom typography overrides
      customFontSize?: string;
      fontWeight?: number;
      lineHeight?: number;
      letterSpacing?: string;
    };
    description: {
      show: boolean;
      text: string;
      size: "sm" | "md" | "lg";
      color?: string;
      // Custom typography overrides
      customFontSize?: string;
      lineHeight?: number;
    };
    alignment: "left" | "center" | "right";
    marginBottom: number;
  };

  // Data Filters (from database)
  filters: {
    categories: string[];           // Category slugs to filter
    limit: number;                  // 4, 6, 8, 12
    sortBy: ServiceCardSortBy;
    popularOnly: boolean;
    activeOnly: boolean;
  };

  // Card Style
  cardStyle: ServiceCardStyle;

  // Layout
  layout: {
    columns: 1 | 2 | 3 | 4;
    gap: number;
    cardAlignment: "stretch" | "start" | "center";
  };

  // Icon Settings
  icon: {
    show: boolean;
    style: ServiceCardIconStyle;
    size: "sm" | "md" | "lg";
    position: "top-left" | "top-center" | "inline";
    backgroundColor?: string;
    iconColor?: string;
    hoverAnimation: ServiceCardIconAnimation;
  };

  // Content Display
  content: {
    showDescription: boolean;
    descriptionLines: 1 | 2 | 3;
    showPrice: boolean;
    pricePosition: "bottom" | "top-right" | "badge";
    showBadge: boolean;
    badgePosition: "top-right" | "top-left" | "inline";
    showFeatures: boolean;
    maxFeatures: 2 | 3 | 4;
    showCategory: boolean;
    showArrow: boolean;
    // Custom typography overrides for card content
    customTitleFontSize?: string;     // e.g., "18px"
    titleFontWeight?: number;         // e.g., 700
    titleLetterSpacing?: string;      // e.g., "-0.01em"
    customDescFontSize?: string;      // e.g., "13px"
    descLineHeight?: number;          // e.g., 1.65
    customPriceFontSize?: string;     // e.g., "14px"
    customTagFontSize?: string;       // e.g., "10px"
  };

  // Hover Effects
  hover: {
    effect: ServiceCardHoverEffect;
    iconEffect: "none" | "invert" | "scale" | "bounce";
    transitionDuration: number;
    glowColor?: string;
  };

  // Colors (optional overrides)
  colors: {
    cardBackground?: string;
    borderColor?: string;
    titleColor?: string;
    descriptionColor?: string;
    priceColor?: string;
    hoverBorderColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientVia?: string;
  };

  // Border & Radius
  borderRadius: number;
  borderWidth: number;

  // Responsive
  responsive: {
    tablet: {
      columns: 1 | 2 | 3;
    };
    mobile: {
      columns: 1 | 2;
    };
  };

  // Header Layout
  headerLayout?: "default" | "split";

  // Forge-specific settings
  forge?: {
    gridSpans: number[];
    defaultColor: string;
    accentBarHeight: number;
    cardPadding: string;
  };

  // Container Style
  container?: WidgetContainerStyle;
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
  fieldId?: string | null;
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

// ============================================
// SERVICE LIST WIDGET TYPES (All Services)
// ============================================

export type ServiceListCardStyle = "minimal" | "bordered" | "elevated" | "glassmorphism";

export interface ServiceListWidgetSettings {
  // Header Section
  header: {
    show: boolean;
    badge: {
      show: boolean;
      text: string;
      style: BadgeStyle;
      bgColor?: string;
      textColor?: string;
      borderColor?: string;
      // Custom typography overrides
      customFontSize?: string;
      fontWeight?: number;
      letterSpacing?: string;
      textTransform?: string;
    };
    heading: {
      text: string;
      size: "sm" | "md" | "lg" | "xl" | "2xl";
      color?: string;
      highlightWords?: string;
      highlightColor?: string;
      // Custom typography overrides
      customFontSize?: string;
      fontWeight?: number;
      lineHeight?: number;
      letterSpacing?: string;
    };
    description: {
      show: boolean;
      text: string;
      size: "sm" | "md" | "lg";
      color?: string;
      // Custom typography overrides
      customFontSize?: string;
      lineHeight?: number;
    };
    alignment: "left" | "center" | "right";
    marginBottom: number;
  };

  // Data Filters
  filters: {
    showAllCategories: boolean;
    categories: string[]; // Category IDs to show (if not showAll)
    limitServicesPerCategory: number; // 0 = show all
    sortServicesBy: "sort-order" | "name" | "price-asc" | "price-desc" | "popular";
    activeOnly: boolean;
  };

  // Layout
  layout: {
    columns: 1 | 2 | 3 | 4;
    gap: number;
    cardStyle: ServiceListCardStyle;
  };

  // Category Card Style
  categoryCard: {
    showIcon: boolean;
    iconStyle: "circle" | "rounded" | "square" | "none";
    iconSize: "sm" | "md" | "lg";
    iconBgColor?: string;
    iconColor?: string;
    showTagline: boolean;
    titleSize: "sm" | "md" | "lg";
    borderRadius: number;
    borderWidth: number;
    borderColor?: string;
    backgroundColor?: string;
    padding: number;
  };

  // Service Item Style
  serviceItem: {
    showPrice: boolean;
    priceColor?: string;
    nameColor?: string;
    hoverEffect: "none" | "highlight" | "underline" | "scale";
    divider: boolean;
    dividerColor?: string;
    padding: number;
    fontSize: "sm" | "md" | "lg";
  };

  // CTA Section (Footer)
  cta: {
    show: boolean;
    text: string;
    textColor?: string;
    primaryButton: {
      show: boolean;
      text: string;
      link: string;
      openInNewTab?: boolean;
      badge?: string;
      style?: ButtonCustomStyle;
    };
    secondaryButton: {
      show: boolean;
      text: string;
      link: string;
      openInNewTab?: boolean;
      style?: ButtonCustomStyle;
    };
    alignment: "left" | "center" | "right";
    marginTop: number;
  };

  // Responsive
  responsive: {
    tablet: {
      columns: 1 | 2 | 3;
    };
    mobile: {
      columns: 1 | 2;
    };
  };

  // Theme color binding
  colors?: {
    useTheme?: boolean; // When true, use CSS var(--color-primary) as accent color
  };

  // Container Style
  container?: WidgetContainerStyle;
}

// ============================================
// PROCESS STEPS WIDGET TYPES (How It Works)
// ============================================

export type ProcessStepsLayout = "horizontal" | "vertical" | "alternating";

export type ConnectorLineStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "gradient"
  | "double"
  | "wavy"
  | "glow";

export type ConnectorAnimation =
  | "none"
  | "flow"           // Gradient flow animation
  | "pulse"          // Pulsing glow effect
  | "dash-flow"      // Animated dashes moving
  | "dot-travel"     // Dots traveling along the line
  | "shimmer"        // Shimmer/shine effect
  | "draw"           // Line drawing animation on scroll
  | "bounce"         // Elastic bounce wave effect
  | "rainbow"        // Multi-color cycling animation
  | "snake";         // Wave travels along the line

export type StepNumberStyle =
  | "circle"
  | "circle-outline"
  | "rounded-square"
  | "badge"
  | "none";

export type StepIconStyle =
  | "circle"
  | "circle-outline"
  | "rounded"
  | "square"
  | "floating";

export interface ProcessStep {
  id: string;
  number?: number;           // Optional custom number
  icon: string;              // Lucide icon name
  title: string;
  description: string;
}

export interface ProcessStepsWidgetSettings {
  // Header Section
  header: {
    show: boolean;
    badge: {
      show: boolean;
      text: string;
      style: BadgeStyle;
      bgColor?: string;
      textColor?: string;
      borderColor?: string;
      // Custom typography overrides
      customFontSize?: string;     // e.g., "12px"
      fontWeight?: number;         // e.g., 700
      letterSpacing?: string;      // e.g., "1.5px"
      textTransform?: string;      // e.g., "uppercase"
    };
    heading: {
      text: string;
      highlightWords?: string;
      highlightColor?: string;
      size: "sm" | "md" | "lg" | "xl" | "2xl";
      color?: string;
      // Custom typography overrides (same pattern as hero-content)
      customFontSize?: string;     // e.g., "clamp(30px, 4vw, 46px)" - overrides size when set
      fontWeight?: number;         // e.g., 800
      lineHeight?: number;         // e.g., 1.35
      letterSpacing?: string;      // e.g., "-0.025em"
    };
    description: {
      show: boolean;
      text: string;
      size: "sm" | "md" | "lg";
      color?: string;
      // Custom typography overrides
      customFontSize?: string;     // e.g., "15px"
      lineHeight?: number;         // e.g., 1.7
    };
    alignment: "left" | "center" | "right";
    marginBottom: number;
  };

  // Steps Data
  steps: ProcessStep[];

  // Layout
  layout: {
    type: ProcessStepsLayout;
    columns: 2 | 3 | 4 | 5;     // For horizontal layout
    gap: number;
    verticalSpacing: number;    // For vertical/alternating layout
  };

  // Step Number Badge
  stepNumber: {
    show: boolean;
    style: StepNumberStyle;
    size: "sm" | "md" | "lg";
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    position: "top-left" | "top-center" | "top-right";
  };

  // Step Icon
  stepIcon: {
    show: boolean;
    style: StepIconStyle;
    size: "sm" | "md" | "lg" | "xl";
    bgColor?: string;
    iconColor?: string;
    borderColor?: string;
    hoverAnimation: "none" | "bounce" | "pulse" | "rotate" | "shake";
  };

  // Step Label pill ("STEP 01" shown below icon)
  stepLabel?: {
    show: boolean;
    prefix: string;
    bgColor: string;
    textColor: string;
  };

  // Step Content
  stepContent: {
    titleSize: "sm" | "md" | "lg" | "xl";
    titleColor?: string;
    descriptionSize: "sm" | "md" | "lg";
    descriptionColor?: string;
    alignment: "left" | "center" | "right";
    // Custom typography overrides
    customTitleFontSize?: string;     // e.g., "17px"
    titleFontWeight?: number;         // e.g., 700
    titleLetterSpacing?: string;      // e.g., "-0.01em"
    customDescFontSize?: string;      // e.g., "13px"
    descLineHeight?: number;          // e.g., 1.65
  };

  // Connector Line
  connector: {
    show: boolean;
    style: ConnectorLineStyle;
    animation: ConnectorAnimation;
    thickness: number;         // 1-6 px
    color?: string;
    secondaryColor?: string;   // For gradient
    animationSpeed: "slow" | "medium" | "fast";
    animationDirection: "forward" | "backward" | "alternate";
    // For dot-travel animation
    dotSize?: number;
    dotColor?: string;
  };

  // Container Style (for the whole widget)
  container?: WidgetContainerStyle;

  // Card Style (for each step)
  card: {
    show: boolean;
    backgroundColor?: string;
    backgroundType?: "solid" | "gradient";
    gradientBackground?: {
      colors: string[];
      angle: number;
    };
    borderRadius: number;
    borderWidth: number;
    borderColor?: string;
    gradientBorder?: {
      enabled: boolean;
      colors: string[];
      angle: number;
    };
    padding: number;
    shadow: "none" | "sm" | "md" | "lg";
    hoverEffect: "none" | "lift" | "glow" | "scale";
  };

  // Responsive
  responsive: {
    tablet: {
      layout: ProcessStepsLayout;
      columns: 2 | 3 | 4;
    };
    mobile: {
      layout: "vertical";
      columns: 1;
    };
  };

  // Animation
  animation: {
    staggerDelay: number;      // Delay between each step appearing (ms)
    animateOnScroll: boolean;
  };

  // Theme color binding
  colors?: {
    useTheme?: boolean; // When true, use CSS var(--color-primary) as accent color
  };
}

// =============================================================================
// PRICING TABLE WIDGET SETTINGS
// =============================================================================

/**
 * Feature value display type matching database enum
 */
export type PricingFeatureValueType = "BOOLEAN" | "TEXT" | "ADDON" | "DASH";

/**
 * Table layout style options
 */
export type PricingTableLayoutStyle = "classic" | "modern" | "minimal" | "bordered";

/**
 * Card layout style options (for mobile/responsive)
 */
export type PricingCardLayoutStyle = "stacked" | "swipeable" | "accordion";

/**
 * Location fee position options
 */
export type LocationFeePosition = "above-table" | "below-header" | "in-summary";
/** @deprecated Use LocationFeePosition */
export type StateFeePosition = LocationFeePosition;

/**
 * Order summary position options
 */
export type OrderSummaryPosition = "right" | "left" | "bottom" | "floating";

/**
 * CTA button style
 */
export type PricingCTAStyle = "solid" | "outline" | "gradient" | "glow";

/**
 * Location fee configuration
 */
export interface LocationFeeConfig {
  enabled: boolean;
  position: LocationFeePosition;
  label: string;                    // "Select your location"
  showFeeBreakdown: boolean;        // Show location fee amount separately
  defaultState?: string;            // Default location code (e.g., "US-WY")
  highlightSavings: boolean;        // Show "Save $X" for cheaper locations
  sortBy: "name" | "fee-asc" | "fee-desc" | "popular";
}
/** @deprecated Use LocationFeeConfig */
export type StateFeeConfig = LocationFeeConfig;

/**
 * Order summary sidebar configuration
 */
export interface OrderSummaryConfig {
  enabled: boolean;
  position: OrderSummaryPosition;
  title: string;                    // "Order Summary"
  showPackageDetails: boolean;      // Show selected package breakdown
  showStateFee: boolean;            // Show location fee in summary
  showAddons: boolean;              // Show selected addons
  showTotal: boolean;               // Show total price
  stickyOnScroll: boolean;          // Sticky sidebar on scroll
  ctaButton: {
    text: string;                   // "Proceed to Checkout"
    style: PricingCTAStyle;
    bgColor?: string;
    textColor?: string;
    hoverBgColor?: string;
  };
  // Mobile-specific
  mobileStyle: "sticky-bar" | "expandable" | "bottom-sheet";
}

/**
 * Table header style configuration
 */
export interface PricingTableHeaderConfig {
  showPackageNames: boolean;
  showPackagePrices: boolean;
  showPopularBadge: boolean;
  popularBadgeText: string;         // "Most Popular"
  popularBadgeColor?: string;
  stickyHeader: boolean;            // Sticky on scroll
  highlightColumn?: number;         // 0-indexed, which column to highlight
  highlightColor?: string;
}

/**
 * Feature row style configuration
 */
export interface PricingFeatureRowConfig {
  showTooltips: boolean;
  tooltipPosition: "top" | "right" | "bottom" | "left";
  showFeatureDescriptions: boolean;
  alternateRowColors: boolean;
  rowHoverEffect: boolean;
  // Value type display
  booleanStyle: {
    trueIcon: "check" | "checkCircle" | "checkSquare" | "star";
    falseIcon: "x" | "xCircle" | "minus" | "dash";
    trueColor?: string;
    falseColor?: string;
  };
  addonStyle: {
    showPrice: boolean;
    priceFormat: "inline" | "below" | "tooltip";
    toggleStyle: "switch" | "checkbox" | "button";
    selectedColor?: string;
  };
}

/**
 * CTA button row configuration
 */
export interface PricingCTARowConfig {
  show: boolean;
  position: "header" | "footer" | "both";
  buttonText: string;               // "Get Started" or "Choose {package}"
  buttonStyle: PricingCTAStyle;
  buttonSize: "sm" | "md" | "lg";
  // Per-package customization
  usePackageColors: boolean;        // Use package's accent color
  defaultBgColor?: string;
  defaultTextColor?: string;
  hoverAnimation: "none" | "lift" | "glow" | "pulse";
}

/**
 * Pricing View Mode
 */
export type PricingViewMode = "table" | "cards";

/**
 * Card Style Settings (for cards view mode)
 */
export interface PricingCardStyleConfig {
  layout: "grid" | "horizontal-scroll";  // Grid or swipeable
  columns: 2 | 3 | 4;                     // Desktop columns
  gap: number;                            // Gap between cards in px
  cardBorderRadius: number;
  cardBorderWidth: number;
  cardBorderColor?: string;
  cardBackgroundColor?: string;
  cardShadow: "none" | "sm" | "md" | "lg" | "xl";
  popularCardStyle: "ring" | "elevated" | "gradient-border" | "glow";
  showProcessingTime: boolean;
  showTotalPrice: boolean;
  priceSize: "sm" | "md" | "lg" | "xl";
  featureListStyle: "compact" | "spacious";
  ctaStyle: "full-width" | "auto";
  cardVariant?: "default" | "forge";      // Card design variant
}

/** Per-card display overrides for forge card variant */
export interface ForgeCardOverride {
  packageIndex: number;
  tierLabel: string;
  tagline: string;
  savingsText?: string;
  buttonVariant: "outline-dark" | "forest" | "coral";
  priceNote?: string;
}

/**
 * Main Pricing Table Widget Settings
 */
export interface PricingTableWidgetSettings {
  // View Mode (table or cards)
  viewMode: PricingViewMode;

  // Card Style Settings (when viewMode is "cards")
  cardStyle: PricingCardStyleConfig;

  // Header Section (above table)
  header: {
    show: boolean;
    badge: {
      show: boolean;
      text: string;
      style: BadgeStyle;
      bgColor?: string;
      textColor?: string;
      borderColor?: string;
      // Custom typography overrides
      customFontSize?: string;
      fontWeight?: number;
      letterSpacing?: string;
      textTransform?: string;
    };
    heading: {
      text: string;
      highlightWords?: string;
      highlightColor?: string;
      size: "sm" | "md" | "lg" | "xl" | "2xl";
      color?: string;
      // Custom typography overrides
      customFontSize?: string;
      fontWeight?: number;
      lineHeight?: number;
      letterSpacing?: string;
    };
    description: {
      show: boolean;
      text: string;
      size: "sm" | "md" | "lg";
      color?: string;
      // Custom typography overrides
      customFontSize?: string;
      lineHeight?: number;
    };
    alignment: "left" | "center" | "right";
    marginBottom: number;
  };

  // Data Source
  dataSource: {
    type: "service" | "manual";
    mode: "manual" | "auto";        // "auto" reads slug from ServiceContext
    serviceSlug?: string;           // Service to pull packages from (when mode=manual)
    // Manual mode fields (for future use)
    manualPackages?: Array<{
      id: string;
      name: string;
      price: number;
      currency: "USD" | "BDT";
      isPopular?: boolean;
    }>;
  };

  // Location Fee Configuration (property name kept as 'stateFee' for backward compat with saved settings)
  stateFee: LocationFeeConfig;

  // Order Summary Configuration
  orderSummary: OrderSummaryConfig;

  // Table Layout & Style
  tableStyle: {
    layout: PricingTableLayoutStyle;
    borderRadius: number;
    borderWidth: number;
    borderColor?: string;
    backgroundColor?: string;
    shadow: "none" | "sm" | "md" | "lg" | "xl";
    maxWidth: "full" | "7xl" | "6xl" | "5xl" | "4xl";
  };

  // Table Header Configuration
  tableHeader: PricingTableHeaderConfig;

  // Feature Rows Configuration
  featureRows: PricingFeatureRowConfig;

  // CTA Buttons Configuration
  ctaButtons: PricingCTARowConfig;

  // Feature Groups (collapsible sections)
  featureGroups: {
    enabled: boolean;
    defaultExpanded: boolean;
    showGroupIcons: boolean;
    collapseAnimation: "none" | "slide" | "fade";
  };

  // Responsive Settings
  responsive: {
    breakpoint: number;             // px at which to switch to mobile layout
    mobileLayout: PricingCardLayoutStyle;
    // Card-specific settings for mobile
    mobileCard: {
      showAllFeatures: boolean;     // or collapse to show only key features
      keyFeaturesCount: number;     // How many features to show when collapsed
      expandButtonText: string;     // "Show all features"
    };
  };

  // Animation Settings
  animation: {
    enabled: boolean;
    tableEntrance: "none" | "fade" | "slide-up" | "scale";
    rowStagger: boolean;
    staggerDelay: number;
    highlightOnHover: boolean;
  };

  // Currency Display
  currency: {
    primary: "USD" | "BDT";
    showBoth: boolean;              // Show both USD and BDT
    format: "symbol" | "code" | "both";  // $100 | USD 100 | $100 USD
  };

  // Color Overrides (optional - uses theme by default)
  colors: {
    useTheme: boolean;
    headerBg?: string;
    headerText?: string;
    featureLabelText?: string;
    packageColumnBg?: string;
    highlightedColumnBg?: string;
    rowBorderColor?: string;
    addonToggleActive?: string;
  };

  // Container Style
  container?: WidgetContainerStyle;

  // Forge card overrides (per-card display customization for forge variant)
  forgeCardOverrides?: ForgeCardOverride[];

  // Table design variant
  tableVariant?: "default" | "forge";
}

// ============================================
// SERVICE WIDGETS SETTINGS
// For Service Details template
// ============================================

/**
 * Service Hero Widget Settings
 * Displays service title, description, price badge, and CTA buttons
 */
export interface ServiceHeroWidgetSettings {
  // Content Source
  titleSource: "auto" | "custom";
  customTitle?: string;
  subtitleSource: "auto" | "custom";
  customSubtitle?: string;

  // Category Badge (shown above title)
  showCategoryBadge: boolean;
  categoryBadgeText?: string; // custom text; auto uses service category name
  categoryBadgeTag?: string; // e.g. "Most Popular", "New"

  // Title Visual Effects
  titleHighlightWord?: string; // word to color in primary/forest
  titleUnderlineWord?: string; // word to show with coral underline

  // Price Badge
  showPriceBadge: boolean;
  priceBadgeText: string; // Supports {{service.startingPrice}}

  // Price Hero (prominent display)
  showPriceHero: boolean;
  priceHeroNote?: string; // e.g. "Essential plan — was $250"

  // Primary Button (shared ButtonCustomStyle system)
  primaryButton: {
    show: boolean;
    text: string;
    link: string;
    badge?: string;
    style?: ButtonCustomStyle;
    openInNewTab?: boolean;
  };

  // Secondary Button (shared ButtonCustomStyle system)
  secondaryButton: {
    show: boolean;
    text: string;
    link: string;
    badge?: string;
    style?: ButtonCustomStyle;
    openInNewTab?: boolean;
  };

  // Trust Items (shown below CTAs)
  showTrustItems: boolean;
  trustItems?: Array<{ text: string }>;

  // Appearance
  backgroundType: "none" | "solid" | "gradient" | "image";
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  textAlignment: "left" | "center" | "right";
  titleSize: "default" | "large" | "xl";
  spacing: "sm" | "md" | "lg" | "xl";

  // Spacing (Advanced)
  marginTop?: number;
  marginBottom?: number;

  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service Checklist Card Widget Settings
 * Dark card with feature checklist and stats — standalone widget for hero section
 */
export interface ServiceChecklistCardWidgetSettings {
  // Card Header
  cardTitle: string;

  // Item Source
  autoItems: boolean;
  manualItems?: Array<{
    text: string;
    tag: string;
    tagType: "included" | "free" | "addon" | "premium" | "custom";
  }>;

  // Scroll & Limit
  scrollable: boolean;
  autoScroll: boolean;             // auto-scroll items bottom→top (marquee style)
  autoScrollSpeed: number;         // seconds per full cycle (higher = slower)
  maxHeight: number;
  itemLimit: number;               // 0 = show all

  // Stats Row
  showStats: boolean;
  stats: Array<{ value: string; label: string }>;

  // Card Style
  backgroundColor: string;
  accentColor: string;
  borderRadius: number;
  shadow: string;

  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Shared widget header settings pattern
 */
export interface WidgetHeaderSettings {
  show: boolean;
  heading: string;
  description: string;
  alignment: "left" | "center";
  eyebrow?: string;
  eyebrowColor?: string;
}

/**
 * Service Features Widget Settings
 * Displays list of included features with 4 style variants
 */
export interface ServiceFeaturesWidgetSettings {
  header: WidgetHeaderSettings;
  variant: "minimal-checkmark" | "cards" | "compact-grid" | "highlighted" | "detailed-cards";
  columns: 1 | 2 | 3 | 4;
  showIcons: boolean;
  iconStyle: "check" | "circle-check" | "badge-check";
  iconColor: string;
  showDescriptions: boolean;
  showTags: boolean;
  itemLimit: number;              // 0 = show all, otherwise limit to N features

  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service Description Widget Settings
 * Renders service.description with prose styling, 3 variants
 */
export interface ServiceDescriptionWidgetSettings {
  header: WidgetHeaderSettings;
  variant: "clean-prose" | "bordered" | "two-column-sidebar";
  maxWidth: "sm" | "md" | "lg" | "xl" | "full";
  fontSize: "sm" | "md" | "lg";
  sidebar: {
    show: boolean;
    showProcessingTime: boolean;
    showStartingPrice: boolean;
    showPopularBadge: boolean;
  };

  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service Breadcrumb Widget Settings
 * Dynamic breadcrumb: Home > Services > {Category?} > {Service Name}
 */
export interface ServiceBreadcrumbWidgetSettings {
  variant: "simple-text" | "pill-chip" | "minimal";
  separator: "chevron" | "slash" | "arrow" | "dot";
  showHome: boolean;
  homeLabel: string;
  showCategory: boolean;
  fontSize: "xs" | "sm" | "md";
  alignment: "left" | "center";

  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service Pricing Widget Settings
 * Displays pricing tiers/packages
 */
export interface ServicePricingWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string; // Default: "Choose Your Package"
  layout: "horizontal" | "vertical";
  highlightRecommended: boolean;
  showComparisonTable: boolean;
  ctaText: string; // Default: "Select Plan"
  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service Process Widget Settings
 * Displays step-by-step process
 */
export interface ServiceProcessWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string; // Default: "How It Works"
  layout: "horizontal" | "vertical" | "alternating";
  showStepNumbers: boolean;
  showConnectors: boolean;
  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * FAQ Accordion Widget Settings (Global)
 * Pulls FAQs from the global FAQ model and displays as an accordion
 */
export interface FaqAccordionWidgetSettings {
  header: {
    show: boolean;
    heading: string;
    description: string;
    alignment: "left" | "center";
    badge?: {
      show: boolean;
      text: string;
    };
  };
  source: "all" | "category" | "service" | "service-all";
  categories: string[];
  maxItems: number;
  expandFirst: boolean;
  allowMultipleOpen: boolean;
  style: "minimal" | "cards" | "bordered";
  accentColor: string;
  showCategoryFilter: boolean;
  columns: 1 | 2 | 3;

  // Theme color binding
  colors?: {
    useTheme?: boolean; // When true, use CSS var(--color-primary) as accent color
  };

  // Header Style
  headerStyle?: {
    headingSize: "sm" | "md" | "lg" | "xl" | "2xl";
    headingFontSize?: number;
    headingColor?: string;
    descriptionColor?: string;
  };

  // Item Style
  itemStyle?: {
    questionColor?: string;
    answerColor?: string;
    questionSize?: "sm" | "base" | "lg" | "xl";
    gap: number;
    borderRadius: number;
    padding: number;
  };

  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service FAQ Widget Settings
 * Displays frequently asked questions
 */
export interface ServiceFaqWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string; // Default: "Frequently Asked Questions"
  layout: "accordion" | "grid" | "list";
  expandFirst: boolean;
  allowMultipleOpen: boolean;
  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service Requirements Widget Settings
 * Displays what's needed from the customer
 */
export interface ServiceRequirementsWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string; // Default: "What You'll Need"
  layout: "list" | "cards";
  showIcons: boolean;
  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service Deliverables Widget Settings
 * Displays what the customer receives
 */
export interface ServiceDeliverablesWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string; // Default: "What You'll Get"
  layout: "list" | "cards" | "timeline";
  showIcons: boolean;
  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service Timeline Widget Settings
 * Displays expected delivery timeline
 */
export interface ServiceTimelineWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string; // Default: "Timeline"
  showIcon: boolean;
  layout: "inline" | "card";
  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Related Services Widget Settings
 * Displays other services to consider, 4 card variants
 */
export interface RelatedServicesWidgetSettings {
  header: WidgetHeaderSettings;
  maxItems: number;
  columns: 2 | 3 | 4;
  cardVariant: "minimal" | "elevated" | "horizontal" | "bordered-badge";
  showPrice: boolean;
  showDescription: boolean;
  showCategoryBadge: boolean;
  ctaText: string;

  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service Testimonials Widget Settings
 * Displays customer reviews for this service
 */
export interface ServiceTestimonialsWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string; // Default: "What Our Clients Say"
  layout: "grid" | "carousel" | "list";
  maxItems: number;
  showRating: boolean;
  showDate: boolean;
  // Container Style
  container?: WidgetContainerStyle;
}

/**
 * Service CTA Banner Widget Settings
 * Displays call-to-action section
 */
export interface ServiceCtaWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string;
  subtitleSource: "auto" | "custom";
  customSubtitle?: string;
  ctaText: string;
  ctaLink: string; // Supports {{service.slug}}
  backgroundType: "solid" | "gradient" | "image";
  backgroundColor?: string;
  backgroundGradient?: string;
  // Container Style
  container?: WidgetContainerStyle;
}

// ============================================
// BLOG WIDGET TYPES
// ============================================

/** Shared section header for blog widgets */
export interface BlogSectionHeader {
  show: boolean;
  badge?: {
    show: boolean;
    text: string;
    icon?: string;
    style: BadgeStyle;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    // Custom typography overrides
    customFontSize?: string;
    fontWeight?: number;
    letterSpacing?: string;
    textTransform?: string;
  };
  heading: {
    text: string;
    size: "sm" | "md" | "lg" | "xl" | "2xl";
    color?: string;
    highlightWords?: string;
    highlightColor?: string;
    // Custom typography overrides
    customFontSize?: string;
    fontWeight?: number;
    lineHeight?: number;
    letterSpacing?: string;
  };
  subheading?: {
    show: boolean;
    text: string;
    color?: string;
    // Custom typography overrides
    customFontSize?: string;
    lineHeight?: number;
  };
  viewAllLink: {
    show: boolean;
    text: string;
    url: string;
    style: "link" | "button-outline" | "button-solid";
    color?: string;
  };
  alignment: "left" | "center" | "space-between";
  marginBottom: number;
}

/** Shared data source query builder for blog widgets */
export interface BlogDataSource {
  source: "all" | "category" | "tag" | "recent" | "manual";
  categories?: string[];
  tags?: string[];
  postIds?: string[];
  postCount: number;
  offset: number;
  orderBy: "date" | "title" | "random" | "modified";
  orderDirection: "desc" | "asc";
  excludeCurrentPost: boolean;
}

/** Blog post data from API */
export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  readingMinutes: number | null;
  views?: number | null;
  content?: string;
  authorId: string | null;
  authorName: string | null;
  authorRole: string | null;
  authorBio?: string | null;
  authorAvatarUrl?: string | null;
  authorTwitter?: string | null;
  authorLinkedin?: string | null;
  publishedAt: string | null;
  tags: string[];
  categories: { id: string; name: string; slug: string }[];
  createdAt: string;
}

/** Blog Post Grid Widget Settings */
export interface BlogPostGridWidgetSettings {
  header: BlogSectionHeader;
  dataSource: BlogDataSource;
  layout: {
    type: "grid" | "masonry";
    columns: {
      desktop: 1 | 2 | 3 | 4;
      tablet: 1 | 2 | 3;
      mobile: 1 | 2;
    };
    gap: number;
    equalHeight: boolean;
  };
  card: {
    style: "default" | "bordered" | "elevated" | "minimal";
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius: number;
    shadow: "none" | "sm" | "md" | "lg";
    hoverShadow?: string;
    hoverEffect: "none" | "lift" | "shadow" | "scale";
    image: {
      show: boolean;
      aspectRatio: "16:9" | "4:3" | "3:2" | "1:1";
      borderRadius: number;
      hoverEffect: "none" | "zoom" | "brighten";
      /** Decorative emblem mode (instead of real cover image) */
      emblem?: {
        enabled: boolean;
        mode?: "always" | "fallback";
        text?: string;
        autoFromCategory?: boolean;
        fontSize?: number;
        color?: string;
        opacity?: number;
        letterSpacing?: string;
      };
      decorative?: {
        background?: string;
        showGrid?: boolean;
        gridColor?: string;
        gridSize?: number;
        showGlow?: boolean;
        glowColor?: string;
        glowSize?: number;
      };
    };
    categoryBadge: {
      show: boolean;
      position: "overlay-top-left" | "overlay-top-right" | "above-title" | "below-title";
      style: "pill" | "solid" | "minimal" | "dark-blur";
      bgColor?: string;
      textColor?: string;
      borderColor?: string;
      uppercase?: boolean;
      letterSpacing?: string;
    };
    title: {
      show: boolean;
      maxLines: number;
      fontSize: "sm" | "md" | "lg" | "xl";
      fontWeight: 500 | 600 | 700;
      color?: string;
      hoverColor?: string;
    };
    excerpt: {
      show: boolean;
      maxLength: number;
      fontSize: "xs" | "sm" | "md";
      color?: string;
    };
    meta: {
      show: boolean;
      items: ("date" | "category" | "readingTime")[];
      dateFormat: "relative" | "short" | "long";
      separator: "dot" | "dash" | "pipe";
      fontSize: "xs" | "sm";
      style?: "icons" | "inline-dots";
      textColor?: string;
      dotColor?: string;
    };
    readMore: {
      show: boolean;
      text: string;
      style: "link" | "button-sm" | "arrow-only";
    };
    contentPadding: number;
    /** Footer with author + arrow button (mockup style) */
    footer?: {
      show: boolean;
      showDivider: boolean;
      dividerColor?: string;
      paddingTop?: number;
      author: {
        show: boolean;
        avatarBgFrom?: string;
        avatarBgTo?: string;
        nameColor?: string;
      };
      arrow: {
        show: boolean;
        bgColor?: string;
        textColor?: string;
        hoverBgColor?: string;
        hoverTextColor?: string;
        size?: number;
      };
    };
  };
  filterTabs: {
    show: boolean;
    style: "pills" | "underline" | "buttons";
    showAll: boolean;
    allText: string;
    categories: string[];
    activeBg?: string;
    activeColor?: string;
    activeBorder?: string;
    inactiveBg?: string;
    inactiveColor?: string;
    inactiveBorder?: string;
    hoverBorder?: string;
  };
  sort?: {
    enabled: boolean;
    label?: string;
    options?: Array<{ value: string; label: string }>;
  };
  pagination: {
    type: "none" | "load-more" | "numbered";
    postsPerLoad: number;
    loadMoreText: string;
  };
  emptyState: {
    title: string;
    description: string;
  };
  animation: {
    entrance: {
      enabled: boolean;
      type: "none" | "fade" | "fade-up";
      stagger: boolean;
      staggerDelay: number;
    };
  };

  // Container Style
  container?: WidgetContainerStyle;
}

/** Blog Post Carousel Widget Settings */
export interface BlogPostCarouselWidgetSettings {
  header: BlogSectionHeader;
  dataSource: BlogDataSource;
  carousel: {
    slidesPerView: {
      desktop: 1 | 2 | 3 | 4;
      tablet: 1 | 2 | 3;
      mobile: 1;
    };
    spaceBetween: number;
    autoplay: {
      enabled: boolean;
      delay: number;
      pauseOnHover: boolean;
    };
    loop: boolean;
    speed: number;
    navigation: {
      arrows: {
        enabled: boolean;
        style: "default" | "minimal" | "rounded";
        showOnHover: boolean;
      };
      dots: {
        enabled: boolean;
        style: "dots" | "lines";
      };
    };
  };
  card: BlogPostGridWidgetSettings["card"];

  // Container Style
  container?: WidgetContainerStyle;
}

/** Blog Featured Post Widget Settings */
export interface BlogFeaturedPostWidgetSettings {
  dataSource: {
    source: "latest" | "specific" | "category-latest";
    postId?: string;
    categorySlug?: string;
    /** When true, this featured post's ID is broadcast so blog-post-grid widgets on the same page exclude it from their results. */
    excludeFromGrid?: boolean;
  };
  layout: "overlay" | "split-left" | "split-right" | "stacked";
  image: {
    aspectRatio: "16:9" | "21:9" | "4:3";
    borderRadius: number;
    overlay: {
      enabled: boolean;
      color: string;
      opacity: number;
    };
    hoverEffect: "none" | "zoom" | "ken-burns";
    /** Decorative emblem mode — replaces real cover image with dark BG + huge text */
    emblem?: {
      enabled: boolean;
      mode?: "always" | "fallback"; // always = ignore coverImage; fallback = only when coverImage missing
      text?: string;          // explicit text (e.g., "WY/DE"); if empty, auto-derive from category/title
      autoFromCategory?: boolean; // when true, derive text from primary category short code
      fontSize?: number;      // px (default 120)
      color?: string;         // text color
      opacity?: number;       // 0-1 (default 0.4)
      letterSpacing?: string;
    };
    /** Decorative background layers (when emblem mode active) */
    decorative?: {
      background?: string;    // CSS background (gradient or solid)
      showGrid?: boolean;
      gridColor?: string;     // rgba
      gridSize?: number;      // px
      showGlow?: boolean;
      glowColor?: string;     // rgba
      glowSize?: number;      // px
    };
  };
  /** Featured tag (separate from category badge) — top-left orange pill */
  featuredTag?: {
    show: boolean;
    text: string;
    position?: "top-left" | "top-right";
    bgColor?: string;
    textColor?: string;
    uppercase?: boolean;
    letterSpacing?: string;
    shadow?: string;
  };
  /** Card wrapper styling (for split-left/split-right/stacked layouts) */
  card?: {
    background?: string;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    shadow?: string;
    hoverShadow?: string;
    hoverLift?: boolean;
  };
  content: {
    categoryBadge: {
      show: boolean;
      style: "pill" | "solid";
    };
    title: {
      size: "lg" | "xl" | "2xl" | "3xl";
      fontWeight: 600 | 700 | 800;
      maxLines: number;
      color?: string;
      customFontSize?: string;
    };
    excerpt: {
      show: boolean;
      maxLength: number;
      fontSize: "sm" | "md" | "lg";
      color?: string;
    };
    meta: {
      show: boolean;
      items: ("date" | "readingTime" | "category")[];
      dateFormat: "relative" | "short" | "long";
      style?: "icons" | "inline-dots"; // icons = old, inline-dots = orange uppercase category + bullet dots
      categoryColor?: string;
      dotColor?: string;
      textColor?: string;
    };
    readMore: {
      show: boolean;
      text: string;
      style: "button-primary" | "button-outline" | "link" | "arrow";
      color?: string;
    };
    /** Author block (gradient avatar + name + role) */
    author?: {
      show: boolean;
      source?: "post" | "manual";
      name?: string;
      role?: string;
      initials?: string;
      avatarUrl?: string;
      avatarBgFrom?: string;
      avatarBgTo?: string;
      nameColor?: string;
      roleColor?: string;
    };
    alignment: "left" | "center";
    verticalPosition: "top" | "center" | "bottom";
    padding?: number; // px content side padding
  };
  height: "auto" | "sm" | "md" | "lg" | "xl";

  // Container Style
  container?: WidgetContainerStyle;
}

/** Blog Post List Widget Settings */
export interface BlogPostListWidgetSettings {
  header: BlogSectionHeader;
  dataSource: BlogDataSource;
  layout: {
    imagePosition: "left" | "right" | "alternating" | "none";
    imageWidth: "small" | "medium" | "large";
    gap: number;
    divider: {
      show: boolean;
      style: "solid" | "dashed";
      color?: string;
    };
  };
  item: {
    image: {
      show: boolean;
      aspectRatio: "1:1" | "4:3" | "16:9";
      borderRadius: number;
      hoverEffect: "none" | "zoom";
    };
    categoryBadge: {
      show: boolean;
      style: "pill" | "text-only";
    };
    title: {
      maxLines: number;
      fontSize: "sm" | "md" | "lg";
      fontWeight: 500 | 600 | 700;
    };
    excerpt: {
      show: boolean;
      maxLength: number;
      fontSize: "xs" | "sm" | "md";
    };
    meta: {
      show: boolean;
      items: ("date" | "category" | "readingTime")[];
      dateFormat: "relative" | "short";
      fontSize: "xs" | "sm";
    };
    hoverEffect: "none" | "highlight" | "shift-right";
  };
  pagination: {
    type: "none" | "load-more" | "numbered";
    loadMoreText: string;
  };

  // Container Style
  container?: WidgetContainerStyle;
}

/** Blog Recent Posts Widget Settings (compact) */
export interface BlogRecentPostsWidgetSettings {
  header: {
    show: boolean;
    text: string;
    size: "sm" | "md" | "lg";
    color?: string;
  };
  dataSource: {
    postCount: number;
    categories?: string[];
    orderBy: "date" | "random";
  };
  display: {
    style: "title-only" | "title-date" | "title-meta" | "thumbnail" | "numbered";
    thumbnail: {
      size: number;
      borderRadius: number;
      aspectRatio: "1:1" | "4:3";
    };
    titleFontSize: "xs" | "sm" | "md";
    titleMaxLines: number;
    dateFontSize: "xs" | "sm";
    dateFormat: "relative" | "short";
    itemGap: number;
    divider: {
      show: boolean;
      color?: string;
    };
  };
  viewAllLink: {
    show: boolean;
    text: string;
    url: string;
    color?: string;
  };

  // Container Style
  container?: WidgetContainerStyle;
}

// ── Vendor Listing Widget ────────────────────────────────────────────────────

export interface VendorListingWidgetSettings {
  badge: { show: boolean; text: string };
  title: string;
  subtitle: string;
  headerTextColor?: string;
  category: string;
  limit: number;
  featuredOnly: boolean;
  showViewAll: boolean;
  viewAllText?: string;
  viewAllLink?: string;
  columns: 2 | 3 | 4;
  cardStyle?: "overlay" | "standard";
  sectionBg?: string;
  badgeFrom?: string;
  badgeTo?: string;
  headingFontSize?: number;
  container?: WidgetContainerStyle;
}

// ── Event Search Hero Widget ──────────────────────────────────────────────────

export interface EventSearchHeroEventType {
  value: string;
  label: string;
}

// ── Event Gallery Grid Widget ─────────────────────────────────────────────────

export interface EventGalleryGridItem {
  id: string;
  title: string;
  type: string;      // Category badge text e.g. "Wedding", "Birthday"
  image: string;
  subtitle?: string; // Optional subtitle for category-style cards
  date?: string;
  location?: string;
  views?: number;
  likes?: number;
  href: string;
}

export interface EventGalleryGridWidgetSettings {
  // Section Header
  badge: {
    show: boolean;
    icon: string;   // Lucide icon name
    text: string;
  };
  title: string;
  subtitle: string;

  // Section background (CSS value)
  sectionBg: string;

  // Grid items
  items: EventGalleryGridItem[];
  columns: 2 | 3 | 4;

  // Card category badge gradient
  cardBadgeFrom: string;
  cardBadgeTo: string;

  // Bottom CTA button
  showCta: boolean;
  ctaLabel: string;
  ctaHref: string;
  ctaGradientFrom: string;
  ctaGradientTo: string;
  headingFontSize?: number;

  container?: WidgetContainerStyle;
}

// ── Event Search Hero Widget ──────────────────────────────────────────────────

export interface EventSearchHeroWidgetSettings {
  // Text Content
  title: string;
  subtitle: string;

  // Background Slideshow
  backgroundImages: string[];
  autoplayInterval: number; // ms, default 5000
  overlayOpacityTop: number; // 0-1, default 0.5
  overlayOpacityBottom: number; // 0-1, default 0.3

  // Search Card
  showEventTypeField: boolean;
  showLocationField: boolean;
  showDateField: boolean;
  eventTypeLabel: string;
  locationLabel: string;
  dateLabel: string;
  locationPlaceholder: string;
  eventTypes: EventSearchHeroEventType[];
  searchButtonLabel: string;
  searchButtonHref: string; // base URL to navigate on search
}

// ── CTA Banner Widget ─────────────────────────────────────────────────────────

export interface CtaBannerWidgetSettings {
  // Outer section
  sectionBgFrom: string;       // default "#ffffff"
  sectionBgTo: string;         // default "#faf5ff"

  // Inner card
  cardGradientFrom: string;    // default "#9333ea"
  cardGradientTo: string;      // default "#ec4899"
  cardGradientAngle: number;   // default 135
  cardBorderRadius: number;    // default 24 (px)
  cardPaddingV: number;        // default 64 (px vertical)
  cardPaddingH: number;        // default 32 (px horizontal)
  showPattern: boolean;        // checkerboard overlay

  // Variant — controls text and button colors
  variant: "dark" | "light";  // "dark" = white text on colored card, "light" = dark text on light card

  // Text content
  title: string;
  subtitle: string;
  headingFontSize: number;   // default 40 (px)

  // Primary button
  primaryButton: {
    show: boolean;
    label: string;
    href: string;
    icon: string;              // lucide icon name, default "ArrowRight"
  };

  // Secondary button
  secondaryButton: {
    show: boolean;
    label: string;
    href: string;
    icon: string;              // lucide icon name, default "Play"
  };

  // Trust badges (checkmark items below buttons)
  trustBadges: {
    show: boolean;
    items: string[];
  };
}

// ── Top Utility Bar Widget ────────────────────────────────────────────────────

export interface TopUtilityBarLink {
  id: string;
  label: string;
  href: string;
  showIcon: boolean;
  icon: string;  // lucide icon name
}

export interface TopUtilityBarWidgetSettings {
  gradientFrom: string;      // default "#9333ea"
  gradientTo: string;        // default "#ec4899"
  gradientAngle: number;     // default 90 (to right)
  borderBottomColor: string; // default "#7e22ce"
  showBorderBottom: boolean; // default true
  height: number;            // default 40 (px)
  textColor: string;         // default "#ffffff"
  hoverColor: string;        // default "#e9d5ff"
  fontSize: number;          // default 14 (px)
  paddingX: number;          // default 32 (px)
  gap: number;               // default 24 (px)
  links: TopUtilityBarLink[];
}

export interface NewsletterCtaWidgetSettings {
  badge: {
    show: boolean;
    icon?: string; // Lucide icon name OR emoji
    text: string;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
  };
  title: {
    line1: string;
    line2: string;
    line2Color?: string; // accent color for second line
    color?: string;
    size?: "lg" | "xl" | "2xl" | "3xl";
    fontWeight?: number;
  };
  subtitle: {
    show: boolean;
    text: string;
    color?: string;
    maxWidth?: number;
  };
  form: {
    placeholder: string;
    buttonText: string;
    buttonBgColor?: string;
    buttonTextColor?: string;
    inputBgColor?: string;
    inputTextColor?: string;
    inputBorderColor?: string;
    borderRadius?: number;
    layout?: "inline" | "stacked";
  };
  successMessage: string;
  errorMessage: string;
  disclaimer: {
    show: boolean;
    text: string;
    color?: string;
  };
  alignment: "left" | "center" | "right";
  background?: {
    color?: string;
    variant?: "dark" | "light" | "custom";
  };
  container?: WidgetContainerStyle;
}

// ============================================
// BLOG DETAIL PAGE WIDGETS (dynamic — read from BlogPostContext)
// ============================================

/** Breadcrumb widget — auto-generated from URL or manual */
export interface BreadcrumbWidgetSettings {
  separator: "chevron" | "slash" | "arrow" | "dot";
  homeLabel: string;
  homeUrl: string;
  /** Optional manual override of crumbs (if empty, auto-generates from URL/blog post) */
  manualCrumbs?: Array<{ label: string; url?: string }>;
  showCurrent: boolean;
  color?: string;
  hoverColor?: string;
  currentColor?: string;
  separatorColor?: string;
  fontSize?: number;
  uppercase?: boolean;
  letterSpacing?: string;
  alignment?: "left" | "center" | "right";
  container?: WidgetContainerStyle;
}

/** Blog Post Hero — dynamic article hero pulling from current post */
export interface BlogPostHeroWidgetSettings {
  breadcrumb: {
    show: boolean;
    color?: string;
    separatorColor?: string;
  };
  categoryPill: {
    show: boolean;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    uppercase?: boolean;
    letterSpacing?: string;
  };
  title: {
    customFontSize?: string;
    color?: string;
    accentColor?: string;
    accentWords?: string; // comma-separated; if empty, auto-detect last 2 words
    fontWeight?: number;
    lineHeight?: number;
    letterSpacing?: string;
  };
  lead: {
    show: boolean;
    color?: string;
    fontSize?: string;
    maxWidth?: number;
  };
  meta: {
    show: boolean;
    showAuthor: boolean;
    showDate: boolean;
    showReadingTime: boolean;
    showViews: boolean;
    avatarBgFrom?: string;
    avatarBgTo?: string;
    nameColor?: string;
    roleColor?: string;
    statColor?: string;
    statLabelColor?: string;
    iconColor?: string;
    dividerColor?: string;
  };
  alignment?: "left" | "center";
  container?: WidgetContainerStyle;
}

/** Blog Post Content — renders post.content HTML with prose typography */
export interface BlogPostContentWidgetSettings {
  coverImage: {
    show: boolean;
    aspectRatio?: "16:9" | "21:9" | "4:3";
    borderRadius?: number;
    marginBottom?: number;
  };
  prose: {
    /** Tailwind prose size: prose-sm | prose-base | prose-lg | prose-xl */
    size?: "sm" | "base" | "lg" | "xl";
    /** Theme: light (default), dark, custom */
    theme?: "light" | "dark";
    maxWidth?: number; // px, content max-width
    linkColor?: string;
    linkHoverColor?: string;
    headingColor?: string;
    bodyColor?: string;
    quoteColor?: string;
    codeBg?: string;
  };
  container?: WidgetContainerStyle;
}

/** Blog Post Table of Contents — auto-extracts headings from post content */
export interface BlogPostTocWidgetSettings {
  title: string;
  showTitle: boolean;
  /** Which heading levels to include */
  headingLevels: Array<2 | 3 | 4>;
  sticky: boolean;
  stickyTop?: number; // px from top
  scrollSpy: boolean;
  titleColor?: string;
  itemColor?: string;
  itemHoverColor?: string;
  activeColor?: string;
  activeBgColor?: string;
  borderColor?: string;
  fontSize?: number;
  itemSpacing?: number;
  container?: WidgetContainerStyle;
}

/** Social Share Rail — sticky vertical/horizontal share buttons */
export interface SocialShareRailWidgetSettings {
  label: string;
  showLabel: boolean;
  layout: "vertical" | "horizontal";
  sticky: boolean;
  stickyTop?: number;
  platforms: Array<"twitter" | "linkedin" | "facebook" | "whatsapp" | "copy">;
  buttonStyle: "outline" | "filled" | "minimal";
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonHoverBgColor?: string;
  buttonHoverTextColor?: string;
  showCounter: boolean;
  counterValue?: string; // static (e.g. "1.2K")
  counterLabel?: string;
  labelColor?: string;
  iconSize?: number;
  container?: WidgetContainerStyle;
}

/** Blog Post Author Card — large author bio block */
export interface BlogPostAuthorCardWidgetSettings {
  showAvatar: boolean;
  avatarSize?: number;
  avatarBgFrom?: string;
  avatarBgTo?: string;
  showRole: boolean;
  showBio: boolean;
  showSocial: boolean;
  cardBg?: string;
  cardBorderColor?: string;
  cardBorderRadius?: number;
  cardPadding?: number;
  nameColor?: string;
  roleColor?: string;
  bioColor?: string;
  socialIconColor?: string;
  socialHoverColor?: string;
  layout?: "horizontal" | "vertical";
  container?: WidgetContainerStyle;
}

/** Blog Post Tags — pill list of post tags */
export interface BlogPostTagsWidgetSettings {
  label: string;
  showLabel: boolean;
  tagBgColor?: string;
  tagTextColor?: string;
  tagBorderColor?: string;
  tagHoverBgColor?: string;
  tagHoverTextColor?: string;
  pillStyle?: "rounded" | "square";
  uppercase?: boolean;
  letterSpacing?: string;
  fontSize?: number;
  linkPrefix?: string; // e.g. "/blog/tag/"
  alignment?: "left" | "center";
  container?: WidgetContainerStyle;
}

// ============================================
// CUSTOM HTML WIDGET
// ============================================

export interface CustomHtmlWidgetSettings {
  html: string;
  css: string;
  container?: WidgetContainerStyle;
}

// ============================================
// TICKER MARQUEE WIDGET
// ============================================

export interface TickerMarqueeItem {
  id: string;
  content: string; // HTML from TipTap editor
  boldText?: string;
  text?: string;
  link?: string;
  openInNewTab?: boolean;
  noFollow?: boolean;
}

export interface TickerMarqueeWidgetSettings {
  tickerName?: string;
  items: TickerMarqueeItem[];
  speed: number;
  separator: string;
  textColor: string;
  boldColor: string;
  separatorColor: string;
  customFontSize?: string;
  fontWeight?: number;
  pauseOnHover?: boolean;
  colors?: {
    useTheme?: boolean;
  };
  container?: WidgetContainerStyle;
}

// ── Features Showcase Widget ──────────────────────────────────────────────────

export interface FeaturesShowcaseItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  icon: string; // Lucide icon name
  href?: string;
}

export interface FeaturesShowcaseWidgetSettings {
  badge: {
    show: boolean;
    text: string;
  };
  heading: string;
  subheading: string;
  items: FeaturesShowcaseItem[];
  headingFontSize?: number;
  columns: 2 | 3;
  gap: number;
  cardHeight: number;
  cardAspectRatio: "1/1" | "4/3" | "3/4" | "custom";
  showCta: boolean;
  ctaText: string;
  ctaHref: string;
  headingFontSize?: number;
}

// ── Trending Venues Widget ────────────────────────────────────────────────────

export type VenueBadgeColor = "purple" | "orange" | "green" | "none";

export interface TrendingVenueItem {
  id: string;
  image: string;
  badge: { text: string; color: VenueBadgeColor };
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  tags: string[]; // e.g. ["180 guests", "Historic"]
  price: number;
  priceUnit: string; // e.g. "/day"
  href?: string;
}

export interface TrendingVenuesWidgetSettings {
  badge: {
    show: boolean;
    text: string;
  };
  heading: string;
  subheading: string;
  venues: TrendingVenueItem[];
  viewMode: "grid" | "marquee";
  columns: 2 | 3 | 4;
  gap: number;
  showCta: boolean;
  ctaText: string;
  ctaHref: string;
}
