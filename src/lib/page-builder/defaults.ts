// ============================================
// DEFAULT WIDGET SETTINGS
// ============================================

import type {
  HeroContentWidgetSettings,
  ImageWidgetSettings,
  TrustBadgesWidgetSettings,
  StatsSectionWidgetSettings,
  LeadFormWidgetSettings,
  VideoWidgetSettings,
  TestimonialWidgetSettings,
  HeadingWidgetSettings,
  TextBlockWidgetSettings,
  SpacerWidgetSettings,
  DividerWidgetSettings,
  SectionSettings,
  SectionBackground,
  ColumnSettings,
  GlobalSettings,
} from "./types";

// ============================================
// DEFAULT SECTION SETTINGS
// ============================================

export const DEFAULT_SECTION_BACKGROUND: SectionBackground = {
  type: "solid",
  color: "transparent",
  gradient: {
    type: "linear",
    angle: 180,
    colors: [
      { color: "#1e293b", position: 0 },
      { color: "#0f172a", position: 100 },
    ],
  },
  image: {
    url: "",
    size: "cover",
    position: "center",
    repeat: "no-repeat",
    fixed: false,
  },
  video: {
    url: "",
    muted: true,
    loop: true,
  },
  overlay: {
    enabled: false,
    color: "#000000",
    opacity: 0.5,
  },
};

export const DEFAULT_SECTION_SETTINGS: SectionSettings = {
  fullWidth: false,
  background: DEFAULT_SECTION_BACKGROUND,
  paddingTop: 48,
  paddingBottom: 48,
  gap: 24,
  maxWidth: "xl",
  borderRadius: 0,
};

// ============================================
// DEFAULT COLUMN SETTINGS
// ============================================

export const DEFAULT_COLUMN_SETTINGS: ColumnSettings = {
  verticalAlign: "top",
  padding: 0,
};

// ============================================
// DEFAULT GLOBAL SETTINGS
// ============================================

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  primaryColor: "#f97316",
  secondaryColor: "#1e293b",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#0f172a",
  textColor: "#f8fafc",
};

// ============================================
// WIDGET DEFAULT SETTINGS
// ============================================

export const DEFAULT_HERO_CONTENT_SETTINGS: HeroContentWidgetSettings = {
  badge: {
    show: true,
    icon: "Flag",
    text: "Trusted by 10,000+ Entrepreneurs",
    style: "pill",
    bgColor: "#f9731933",
    textColor: "#fb923c",
    borderColor: "#f9731980",
  },
  headline: {
    text: "Start Your US LLC in Minutes",
    highlightWords: "US LLC",
    highlightColor: "#f97316",
    size: "xl",
    color: "#ffffff",
  },
  subheadline: {
    text: "Complete LLC formation with EIN, registered agent, and business banking - all from anywhere in the world.",
    show: true,
    size: "lg",
    color: "#94a3b8",
  },
  features: {
    show: true,
    items: [
      { id: "feat_1", icon: "CheckCircle", text: "Same-day LLC Formation" },
      { id: "feat_2", icon: "CheckCircle", text: "EIN Number Included" },
      { id: "feat_3", icon: "CheckCircle", text: "Registered Agent Service" },
      { id: "feat_4", icon: "CheckCircle", text: "Banking Support" },
    ],
    columns: 2,
    iconColor: "#22c55e",
    iconPosition: "left",
    layout: "grid",
  },
  primaryButton: {
    show: true,
    text: "Get Started",
    link: "/checkout",
    openInNewTab: false,
  },
  secondaryButton: {
    show: true,
    text: "Learn More",
    link: "/services",
    style: "outline",
    openInNewTab: false,
  },
  trustText: {
    show: true,
    rating: 4.9,
    text: "4.9/5 from 500+ reviews",
    textColor: "#9ca3af",
    starColor: "#facc15",
  },
  alignment: "left",
};

export const DEFAULT_IMAGE_SETTINGS: ImageWidgetSettings = {
  src: "",
  alt: "Image description",
  objectFit: "cover",
  borderRadius: 8,
  shadow: "lg",
  aspectRatio: "16:9",
  animation: "none",
};

export const DEFAULT_TRUST_BADGES_SETTINGS: TrustBadgesWidgetSettings = {
  badges: [
    { id: "badge_1", icon: "Shield", text: "Secure & Compliant" },
    { id: "badge_2", icon: "Clock", text: "24/7 Support" },
    { id: "badge_3", icon: "Award", text: "Best Rated" },
    { id: "badge_4", icon: "Users", text: "10,000+ Clients" },
  ],
  layout: "horizontal",
  columns: 4,
  style: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    iconColor: "#f97316",
    textColor: "#e2e8f0",
    borderRadius: 8,
  },
  centered: true,
};

export const DEFAULT_STATS_SECTION_SETTINGS: StatsSectionWidgetSettings = {
  stats: [
    { id: "stat_1", value: "10000", label: "LLCs Formed", suffix: "+", animate: true },
    { id: "stat_2", value: "50", label: "US States", suffix: "+", animate: true },
    { id: "stat_3", value: "4.9", label: "Rating", prefix: "", suffix: "/5", animate: true },
    { id: "stat_4", value: "24", label: "Hour Support", suffix: "h", animate: true },
  ],
  columns: 4,
  style: {
    valueColor: "#ffffff",
    labelColor: "#94a3b8",
    valueSize: "xl",
    divider: true,
  },
  centered: true,
  animateOnScroll: true,
};

export const DEFAULT_LEAD_FORM_SETTINGS: LeadFormWidgetSettings = {
  title: "Get Your Free Consultation",
  description: "Fill out the form below and we'll get back to you within 24 hours.",
  fields: [
    {
      id: "field_1",
      type: "text",
      name: "name",
      label: "Full Name",
      placeholder: "John Doe",
      required: true,
    },
    {
      id: "field_2",
      type: "email",
      name: "email",
      label: "Email Address",
      placeholder: "john@example.com",
      required: true,
    },
    {
      id: "field_3",
      type: "phone",
      name: "phone",
      label: "Phone Number",
      placeholder: "+1 (555) 000-0000",
      required: false,
    },
  ],
  submitButton: {
    text: "Submit",
    fullWidth: true,
  },
  successMessage: "Thank you! We'll be in touch soon.",
  submitTo: "database",
  backgroundColor: "#1e293b",
  padding: 24,
  borderRadius: 12,
  shadow: true,
};

export const DEFAULT_VIDEO_SETTINGS: VideoWidgetSettings = {
  source: "youtube",
  url: "",
  autoplay: false,
  muted: false,
  loop: false,
  controls: true,
  aspectRatio: "16:9",
  borderRadius: 8,
  shadow: true,
};

export const DEFAULT_TESTIMONIAL_SETTINGS: TestimonialWidgetSettings = {
  quote: "This service helped me set up my LLC in just a few days. Highly recommended!",
  author: {
    name: "John Smith",
    role: "Founder",
    company: "Tech Startup",
    avatar: "",
  },
  rating: 5,
  style: {
    backgroundColor: "#1e293b",
    quoteColor: "#f8fafc",
    showQuoteIcon: true,
  },
};

export const DEFAULT_HEADING_SETTINGS: HeadingWidgetSettings = {
  text: "Section Heading",
  level: "h2",
  alignment: "left",
  color: "#ffffff",
  size: "lg",
};

export const DEFAULT_TEXT_BLOCK_SETTINGS: TextBlockWidgetSettings = {
  content: "Add your text content here. This can be a paragraph or multiple paragraphs.",
  alignment: "left",
  color: "#94a3b8",
  size: "md",
};

export const DEFAULT_SPACER_SETTINGS: SpacerWidgetSettings = {
  height: 48,
  mobileHeight: 24,
};

export const DEFAULT_DIVIDER_SETTINGS: DividerWidgetSettings = {
  style: "solid",
  color: "#334155",
  secondaryColor: "#0f172a",
  width: 100,
  thickness: 1,
  spacing: 24,
  alignment: "center",
  icon: "Minus",
  iconSize: 20,
  iconColor: "#64748b",
  text: "OR",
  textSize: "sm",
  textColor: "#64748b",
  textBackground: "#0f172a",
};

// ============================================
// EXPORT ALL DEFAULTS
// ============================================

export const WIDGET_DEFAULTS: Record<string, unknown> = {
  "hero-content": DEFAULT_HERO_CONTENT_SETTINGS,
  "image": DEFAULT_IMAGE_SETTINGS,
  "trust-badges": DEFAULT_TRUST_BADGES_SETTINGS,
  "stats-section": DEFAULT_STATS_SECTION_SETTINGS,
  "lead-form": DEFAULT_LEAD_FORM_SETTINGS,
  "video": DEFAULT_VIDEO_SETTINGS,
  "testimonial": DEFAULT_TESTIMONIAL_SETTINGS,
  "heading": DEFAULT_HEADING_SETTINGS,
  "text-block": DEFAULT_TEXT_BLOCK_SETTINGS,
  "spacer": DEFAULT_SPACER_SETTINGS,
  "divider": DEFAULT_DIVIDER_SETTINGS,
};
