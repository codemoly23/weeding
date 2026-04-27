"use client";

import Link from "next/link";
import Image from "next/image";
import { SmartLink } from "@/components/ui/smart-link";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Award,
  CheckCircle,
  Lock,
  Trophy,
  Heart,
  Users,
  Building,
  Building2,
  PartyPopper,
  MessageCircle,
  Store,
  ShoppingBag,
  Globe,
  Tag,
  Headphones,
  HelpCircle,
} from "lucide-react";

// Icon map for footer link column headings
const HEADING_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  building: Building,
  "building-2": Building2,
  "party-popper": PartyPopper,
  "message-circle": MessageCircle,
  store: Store,
  "shopping-bag": ShoppingBag,
  globe: Globe,
  tag: Tag,
  headphones: Headphones,
  "help-circle": HelpCircle,
  star: Star,
  heart: Heart,
  mail: Mail,
  phone: Phone,
};

// Icon map for pill-style trust badges
const PILL_BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  shield: Shield,
  zap: Zap,
  award: Award,
  "check-circle": CheckCircle,
  lock: Lock,
  trophy: Trophy,
  heart: Heart,
};
import { useBusinessConfig } from "@/hooks/use-business-config";
import { useFooterConfig, getWidgetsByColumn, getWidgetLinks } from "@/hooks/use-footer-config";
import type { FooterWidget, PublicFooterResponse, ButtonCustomStyle } from "@/lib/header-footer/types";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";
import { CRAFT_BG_DARK, WHITE, ORANGE_PRIMARY } from "@/lib/button-constants";
import { cn } from "@/lib/utils";
import { FooterLanguageSwitcher } from "@/components/layout/footer-language-switcher";
import { useLanguage } from "@/lib/i18n/language-context";

// Shared button utilities
import {
  getNormalBackground,
  getHoverBackground,
  getGradientShiftBackground,
  getHoverEffectClass,
  isComplexHoverEffect,
  getComplexEffectStyles,
  getFinalBackground,
} from "@/lib/button-utils";

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

// Footer Button Component
function FooterButton({
  text,
  url,
  style,
  openInNewTab = false,
}: {
  text: string;
  url: string;
  style: ButtonCustomStyle;
  openInNewTab?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isExternal = /^(https?:\/\/|mailto:|tel:|#)/.test(url);
  const shouldOpenNewTab = openInNewTab || style.openInNewTab;

  // Special button components based on hover effect
  if (style.hoverEffect === "craft-expand") {
    return (
      <SmartLink href={url} openInNewTab={shouldOpenNewTab}>
        <CraftButton
          bgColor={style.bgColor || CRAFT_BG_DARK}
          textColor={style.textColor || WHITE}
          size="sm"
          style={{
            boxShadow: style.shadow,
            borderRadius: `${style.borderRadius ?? 9999}px`,
          }}
        >
          <CraftButtonLabel>{text}</CraftButtonLabel>
          <CraftButtonIcon>
            <ArrowUpRight className="size-3 stroke-2" />
          </CraftButtonIcon>
        </CraftButton>
      </SmartLink>
    );
  }

  if (style.hoverEffect === "flow-border") {
    return (
      <SmartLink href={url} openInNewTab={shouldOpenNewTab}>
        <PrimaryFlowButton
          className="text-sm"
          ringColor={style.bgColor || ORANGE_PRIMARY}
        >
          {text}
          {isExternal && <ExternalLink className="ml-1.5 h-3.5 w-3.5" />}
        </PrimaryFlowButton>
      </SmartLink>
    );
  }

  if (style.hoverEffect === "neural") {
    return (
      <SmartLink href={url} openInNewTab={shouldOpenNewTab}>
        <NeuralButton size="sm">
          {text}
          {isExternal && <ExternalLink className="ml-1.5 h-3.5 w-3.5" />}
        </NeuralButton>
      </SmartLink>
    );
  }

  // Standard button with custom styling - uses shared utilities
  const hoverClass = getHoverEffectClass(style.hoverEffect);
  const hasComplexEffect = isComplexHoverEffect(style.hoverEffect);
  const effectStyles = getComplexEffectStyles(style, isHovered);

  return (
    <SmartLink
      href={url}
      openInNewTab={shouldOpenNewTab}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer overflow-hidden",
        hoverClass,
        hasComplexEffect ? "transition-all duration-500 ease-out" : "transition-all duration-300"
      )}
      style={{
        background: getFinalBackground(style, isHovered),
        color: isHovered && style.hoverTextColor ? style.hoverTextColor : (style.textColor || "#ffffff"),
        borderWidth: `${style.borderWidth ?? 0}px`,
        borderStyle: "solid",
        borderColor: style.borderColor || style.bgColor || ORANGE_PRIMARY,
        borderRadius: `${style.borderRadius ?? 6}px`,
        ...effectStyles,
        ...((!hasComplexEffect && style.shadow) ? { boxShadow: isHovered && style.hoverShadow ? style.hoverShadow : style.shadow } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text}
      {isExternal && <ExternalLink className="h-3.5 w-3.5" />}
    </SmartLink>
  );
}

// Fallback links (used when API fails or during initial load) - generic, no business-specific content
const fallbackLinks = {
  services: [
    { name: "Browse All Services", href: "/services" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "FAQs", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
  states: [] as { name: string; href: string }[],
};

// Enhanced Social Links component with configurable styling
function EnhancedSocialLinks({
  links,
  shape = "circle",
  size = "md",
  colorMode = "brand",
  hoverEffect = "scale",
  accentColor,
  bgStyle = "subtle",
}: {
  links: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; color: string }[];
  shape?: string;
  size?: string;
  colorMode?: string;
  hoverEffect?: string;
  accentColor?: string;
  bgStyle?: "none" | "subtle" | "solid" | "outline";
}) {
  const sizeClasses = {
    sm: { container: "p-1.5", icon: "h-4 w-4", gap: "gap-2" },
    md: { container: "p-2.5", icon: "h-5 w-5", gap: "gap-3" },
    lg: { container: "p-3", icon: "h-6 w-6", gap: "gap-3" },
    xl: { container: "p-4", icon: "h-7 w-7", gap: "gap-4" },
  };

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-none",
    rounded: "rounded-lg",
    pill: "rounded-full",
  };

  // Pill shape uses wider containers with explicit min-width
  const isPill = shape === "pill";

  const hoverClasses = {
    scale: "hover:scale-110",
    lift: "hover:-translate-y-1 hover:shadow-lg",
    glow: "hover:shadow-lg hover:shadow-current/30",
    rotate: "hover:rotate-12",
  };

  // Background style classes - works well on both light and dark backgrounds
  const bgClasses = {
    none: "",
    subtle: "bg-white/10 hover:bg-white/20", // Subtle glass effect for dark backgrounds
    solid: "bg-current/10 hover:bg-current/20",
    outline: "border border-current/30 hover:border-current/50",
  };

  const currentSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
  const currentShape = shapeClasses[shape as keyof typeof shapeClasses] || shapeClasses.circle;
  const currentHover = hoverClasses[hoverEffect as keyof typeof hoverClasses] || hoverClasses.scale;
  const currentBg = bgClasses[bgStyle as keyof typeof bgClasses] || bgClasses.subtle;

  const getColor = (brandColor: string) => {
    if (colorMode === "monochrome") return "currentColor";
    if (colorMode === "accent") return accentColor || brandColor;
    return brandColor;
  };

  // Calculate pill dimensions based on size
  const pillSizes = {
    sm: { height: 28, width: 45 },   // 28 x 45px
    md: { height: 40, width: 64 },   // 40 x 64px
    lg: { height: 48, width: 77 },   // 48 x 77px
    xl: { height: 56, width: 90 },   // 56 x 90px
  };
  const currentPillSize = pillSizes[size as keyof typeof pillSizes] || pillSizes.md;

  return (
    <div className={cn("flex flex-wrap -m-1 p-1", currentSize.gap)} role="list" aria-label="Social media links">
      {links.map((social) => (
        <a
          key={social.name}
          href={social.href}
          className={cn(
            "flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
            currentSize.container,
            currentShape,
            currentHover,
            currentBg
          )}
          style={{
            color: getColor(social.color),
            ...(isPill && {
              width: `${currentPillSize.width}px`,
              height: `${currentPillSize.height}px`,
              padding: 0,  // Override padding, use explicit dimensions
            }),
          }}
          aria-label={`Follow us on ${social.name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <social.icon className={currentSize.icon} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

// Trust badges component
function TrustBadges({
  badges,
}: {
  badges: { style?: string; image: string; alt: string; url?: string; text?: string; iconName?: string; iconColor?: string }[];
}) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Trust badges">
      {badges.map((badge, index) => {
        if (badge.style === "pill") {
          const Icon = badge.iconName ? PILL_BADGE_ICONS[badge.iconName] : null;
          const pillContent = (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-white/8 px-3 py-1.5 text-xs font-medium opacity-75 transition-opacity hover:opacity-100">
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" style={badge.iconColor ? { color: badge.iconColor } : undefined} aria-hidden="true" />}
              {badge.text || badge.alt}
            </span>
          );
          if (badge.url) {
            return (
              <a key={index} href={badge.url} target="_blank" rel="noopener noreferrer" role="listitem" className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                {pillContent}
              </a>
            );
          }
          return <span key={index} role="listitem">{pillContent}</span>;
        }

        // Default: image badge
        const badgeImage = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={badge.image}
            alt={badge.alt}
            className="h-10 w-auto max-w-25 object-contain opacity-70 transition-opacity hover:opacity-100"
          />
        );
        if (badge.url) {
          return (
            <a
              key={index}
              href={badge.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex focus:outline-none focus:ring-2 focus:ring-primary"
              role="listitem"
            >
              {badgeImage}
            </a>
          );
        }
        return <span key={index} role="listitem">{badgeImage}</span>;
      })}
    </div>
  );
}

// Background pattern component
function BackgroundPattern({
  pattern,
  color,
  opacity,
}: {
  pattern: string;
  color: string;
  opacity: number;
}) {
  const patterns: Record<string, string> = {
    dots: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    grid: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
    diagonal: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${color} 10px, ${color} 11px)`,
    waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath d='M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='1'/%3E%3C/svg%3E")`,
    noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
  };

  const patternSizes: Record<string, string> = {
    dots: "20px 20px",
    grid: "20px 20px, 20px 20px",
    diagonal: "auto",
    waves: "100px 20px",
    noise: "200px 200px",
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: patterns[pattern] || patterns.dots,
        backgroundSize: patternSizes[pattern] || "20px 20px",
        opacity: opacity / 100,
      }}
      aria-hidden="true"
    />
  );
}

// Newsletter subscription widget with API integration
function NewsletterWidget({ widget, headingClasses }: { widget: FooterWidget; headingClasses?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const nlContent = widget.content as {
    text?: string;
    placeholder?: string;
    buttonText?: string;
  } | null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage(data.message || "Successfully subscribed!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      {widget.showTitle && widget.title && (
        <h3 className={headingClasses}>{widget.title}</h3>
      )}
      <div className={widget.showTitle && widget.title ? "mt-4" : ""}>
        <p className="text-sm opacity-60 mb-3">
          {nlContent?.text || "Get LLC tips & US business insights"}
        </p>
        {status === "success" ? (
          <p className="text-sm text-green-400">{message}</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex gap-0 newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={nlContent?.placeholder || "your@email.com"}
                className="flex-1 rounded-l-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-inherit placeholder:opacity-40 focus:outline-none focus:ring-1 focus:ring-white/30"
                aria-label="Email address"
                required
                disabled={status === "loading"}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-r-lg bg-(--footer-accent-color,#e84c1e) px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {status === "loading" ? "..." : nlContent?.buttonText || "Subscribe"}
              </button>
            </form>
            {status === "error" && (
              <p className="text-sm text-red-400 mt-2">{message}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Widget renderer component
function FooterWidgetRenderer({
  widget,
  businessConfig,
  socialLinks,
  footerConfig,
  headingClasses,
  linkClasses,
  logoUrl,
}: {
  widget: FooterWidget;
  businessConfig: ReturnType<typeof useBusinessConfig>["config"];
  socialLinks: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; color: string }[];
  footerConfig?: PublicFooterResponse | null;
  headingClasses?: string;
  linkClasses?: string;
  logoUrl?: string;
}) {
  const links = getWidgetLinks(widget);

  // Extract content from widget for BRAND type
  const brandContent = widget.content as {
    showTagline?: boolean;
    tagline?: string;
    subtitle?: string;
    showCTA?: boolean;
    ctaText?: string;
    ctaUrl?: string;
    ctaIcon?: string;
    secondaryCTA?: boolean;
    secondaryCtaText?: string;
    secondaryCtaUrl?: string;
    showContact?: boolean;
    showSocial?: boolean;
    logoMode?: "auto" | "light" | "dark";
  } | null;

  // Determine effective logo URL based on logoMode setting
  const getEffectiveLogoUrl = () => {
    const logoMode = brandContent?.logoMode || "auto";
    if (logoMode === "light") {
      return businessConfig.logo.url;
    }
    if (logoMode === "dark") {
      return businessConfig.logo.darkUrl || businessConfig.logo.url;
    }
    // Auto: use passed logoUrl (dark mode) or fallback to regular url
    return logoUrl || businessConfig.logo.url;
  };
  const effectiveLogoUrl = getEffectiveLogoUrl();

  switch (widget.type) {
    case "BRAND":
      // Use custom tagline from preset or fallback to business description
      const tagline = brandContent?.tagline || businessConfig.description;
      const subtitle = brandContent?.subtitle;
      const showContact = brandContent?.showContact !== false; // Default true
      const showSocial = brandContent?.showSocial !== false; // Default true (but controlled by separate SOCIAL widget usually)
      const showCTA = brandContent?.showCTA;
      const showBrandBadges = brandContent?.showBrandBadges;

      return (
        <div className="space-y-4">
          {/* Logo only - no business name text (aligned with column headings) */}
          <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-primary rounded">
            {effectiveLogoUrl ? (
              <Image
                src={effectiveLogoUrl}
                alt={businessConfig.name}
                width={160}
                height={48}
                className="h-12 w-auto rounded-lg object-contain"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <span className="text-lg font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
                <span className="text-lg font-semibold">{businessConfig.name}</span>
              </div>
            )}
          </Link>

          {/* Tagline / Description */}
          {tagline && (
            <p className="max-w-xs text-sm opacity-80">
              {tagline}
            </p>
          )}

          {/* Subtitle (for hero-style footers) */}
          {subtitle && (
            <p className="max-w-md text-xs opacity-60">
              {subtitle}
            </p>
          )}

          {/* CTA Buttons (from preset) */}
          {showCTA && brandContent?.ctaText && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href={brandContent.ctaUrl || "#"}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {brandContent.ctaIcon === "sparkles" && <Sparkles className="h-4 w-4" />}
                {brandContent.ctaText}
              </Link>
              {brandContent.secondaryCTA && brandContent.secondaryCtaText && (
                <Link
                  href={brandContent.secondaryCtaUrl || "#"}
                  className="inline-flex items-center gap-2 rounded-lg border border-current px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  {brandContent.secondaryCtaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          {/* Contact Info - only show if enabled and not using separate CONTACT widget */}
          {showContact && (businessConfig.contact.supportEmail || businessConfig.contact.phone || businessConfig.address.full) && (
            <address className="space-y-2 not-italic pt-2">
              {businessConfig.contact.supportEmail && (
                <a
                  href={`mailto:${businessConfig.contact.supportEmail}`}
                  className={cn("flex items-center gap-2 text-sm", linkClasses)}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {businessConfig.contact.supportEmail}
                </a>
              )}
              {businessConfig.contact.phone && (
                <a
                  href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                  className={cn("flex items-center gap-2 text-sm", linkClasses)}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {businessConfig.contact.phone}
                </a>
              )}
              {businessConfig.address.full && (
                <p className="flex items-start gap-2 text-sm opacity-80">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {businessConfig.address.full}
                </p>
              )}
            </address>
          )}

        </div>
      );

    case "LINKS": {
      const linkPrefix = footerConfig?.styling?.linkPrefix || "none";
      const HeadingIcon = widget.headingIcon ? HEADING_ICONS[widget.headingIcon] : null;
      return (
        <nav aria-label={widget.title || "Footer links"}>
          {widget.showTitle && widget.title && (
            <h3 className={cn(headingClasses, "flex items-center gap-2")}>
              {HeadingIcon && <HeadingIcon className="h-[18px] w-[18px] shrink-0" style={{ color: "var(--footer-accent-color)" }} aria-hidden="true" />}
              {widget.title}
            </h3>
          )}
          <ul className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.url}
                  className={cn("text-base inline-flex items-center gap-1.5", linkClasses)}
                >
                  {linkPrefix === "chevron" && <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden="true" />}
                  {linkPrefix === "arrow" && <ArrowRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden="true" />}
                  {linkPrefix === "dash" && <span className="opacity-50 leading-none">–</span>}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      );
    }

    case "CONTACT":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <address className={cn("not-italic", widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3")}>
            {businessConfig.contact.supportEmail && (
              <a
                href={`mailto:${businessConfig.contact.supportEmail}`}
                className={cn("flex items-center gap-2 text-sm", linkClasses)}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {businessConfig.contact.supportEmail}
              </a>
            )}
            {businessConfig.contact.phone && (
              <a
                href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                className={cn("flex items-center gap-2 text-sm", linkClasses)}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {businessConfig.contact.phone}
              </a>
            )}
            {businessConfig.address.full && (
              <p className="flex items-start gap-2 text-sm opacity-80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {businessConfig.address.full}
              </p>
            )}
          </address>
        </div>
      );

    case "SOCIAL":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4" : ""}>
            <EnhancedSocialLinks
              links={socialLinks}
              shape={footerConfig?.social?.shape}
              size={footerConfig?.social?.size}
              colorMode={footerConfig?.social?.colorMode}
              hoverEffect={footerConfig?.social?.hoverEffect}
              accentColor={footerConfig?.styling?.accentColor || undefined}
              bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
            />
          </div>
        </div>
      );

    case "TEXT":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4" : ""}>
            <p className="text-sm opacity-80">
              {(widget.content as { text?: string })?.text || ""}
            </p>
          </div>
        </div>
      );

    case "SERVICES":
      return (
        <nav aria-label="Services">
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <ul className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {fallbackLinks.services.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn("text-sm", linkClasses)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      );

    case "STATES":
      return (
        <nav aria-label="Popular states">
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <ul className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {fallbackLinks.states.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn("text-sm", linkClasses)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      );

    case "RECENT_POSTS":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            <p className="text-sm opacity-80">
              Visit our <Link href="/blog" className={linkClasses}>blog</Link> for the latest articles.
            </p>
          </div>
        </div>
      );

    case "CUSTOM_HTML":
      const htmlContent = (widget.content as { html?: string })?.html || "";
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div
            className={widget.showTitle && widget.title ? "mt-4 prose prose-sm" : "prose prose-sm"}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      );

    case "BUTTON":
      const buttonContent = widget.content as {
        text?: string;
        url?: string;
        target?: "_self" | "_blank";
        openInNewTab?: boolean;
        style?: ButtonCustomStyle;
      } | null;

      const buttonText = buttonContent?.text || "Click Here";
      const buttonUrl = buttonContent?.url || "#";
      const buttonOpenInNewTab = buttonContent?.openInNewTab ?? buttonContent?.target === "_blank";
      const buttonStyle = buttonContent?.style || {};

      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4" : ""}>
            <FooterButton
              text={buttonText}
              url={buttonUrl}
              style={buttonStyle}
              openInNewTab={buttonOpenInNewTab}
            />
          </div>
        </div>
      );

    case "NEWSLETTER":
      return <NewsletterWidget widget={widget} headingClasses={headingClasses} />;

    default:
      return null;
  }
}

export function Footer() {
  const { config: businessConfig } = useBusinessConfig();
  const { config: footerConfig, isLoading: isConfigLoading } = useFooterConfig();
  const { t } = useLanguage();
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const prefersReducedMotion = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Handle entrance animation
  useEffect(() => {
    // Wait for config to load before deciding on animation
    if (isConfigLoading) return;

    const shouldAnimate = footerConfig?.styling?.enableAnimations && !prefersReducedMotion.current;

    // If animations disabled or already animated, show immediately
    if (!shouldAnimate || hasAnimated) {
      setIsVisible(true);
      return;
    }

    // Reset visibility when animation is enabled (for config changes)
    setIsVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay to ensure initial state is rendered first
          requestAnimationFrame(() => {
            setIsVisible(true);
            setHasAnimated(true);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.05 } // Trigger earlier (5% visible)
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, [footerConfig?.styling?.enableAnimations, isConfigLoading, hasAnimated]);

  // Use dark logo for footer (dark backgrounds) if available, otherwise use regular logo
  const footerLogoUrl = businessConfig.logo.darkUrl || businessConfig.logo.url;

  // Build social links from config with brand colors
  const socialLinks = useMemo(
    () =>
      [
        { name: "Facebook", href: businessConfig.social.facebook, icon: Facebook, color: "#1877F2" },
        { name: "Twitter", href: businessConfig.social.twitter, icon: Twitter, color: "#1DA1F2" },
        { name: "LinkedIn", href: businessConfig.social.linkedin, icon: Linkedin, color: "#0A66C2" },
        { name: "Instagram", href: businessConfig.social.instagram, icon: Instagram, color: "#E4405F" },
        { name: "YouTube", href: businessConfig.social.youtube, icon: Youtube, color: "#FF0000" },
        { name: "TikTok", href: businessConfig.social.tiktok, icon: TikTokIcon, color: "#00f2ea" },
      ].filter((link) => link.href),
    [businessConfig.social]
  );

  // Process widgets by column
  const widgetsByColumn = useMemo(() => {
    if (!footerConfig?.widgets || footerConfig.widgets.length === 0) {
      return null;
    }
    const columns: Record<number, FooterWidget[]> = {};
    for (let i = 1; i <= (footerConfig?.columns || 6); i++) {
      columns[i] = getWidgetsByColumn(footerConfig.widgets, i);
    }
    return columns;
  }, [footerConfig?.widgets, footerConfig?.columns]);

  // Get all widgets as flat array
  const allWidgets = useMemo(() => {
    return footerConfig?.widgets || [];
  }, [footerConfig?.widgets]);

  // Get styling from footer config
  const styling = footerConfig?.styling;

  // Don't render anything until config loads (prevents flash of default footer)
  if (isConfigLoading) {
    return null;
  }

  // Build background style
  const getBackgroundStyle = (): React.CSSProperties => {
    const bgType = styling?.bgType || "solid";

    // Solid color background
    if (bgType === "solid" && styling?.bgColor) {
      return { backgroundColor: styling.bgColor };
    }

    // Gradient background
    if (bgType === "gradient" && styling?.bgGradient) {
      const gradient = styling.bgGradient;
      const colors = gradient.colors?.map((c: { color: string; position: number }) => `${c.color} ${c.position}%`).join(", ");
      if (colors) {
        return {
          background: `linear-gradient(${gradient.angle || 135}deg, ${colors})`,
        };
      }
    }

    // Pattern background - use bgColor as base, pattern overlay is rendered separately
    if (bgType === "pattern") {
      return { backgroundColor: styling?.bgColor || "#0f172a" };
    }

    // Image background
    if (bgType === "image" && styling?.bgImage) {
      const overlay = styling?.bgImageOverlay || "rgba(0,0,0,0.5)";
      return {
        backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${styling.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    return {};
  };

  // Build heading classes based on typography settings
  const headingClasses = cn(
    "font-medium footer-heading",
    styling?.headingSize === "sm" && "text-sm",
    styling?.headingSize === "base" && "text-base",
    styling?.headingSize === "lg" && "text-lg",
    styling?.headingSize === "xl" && "text-xl",
    styling?.headingWeight === "medium" && "font-medium",
    styling?.headingWeight === "semibold" && "font-semibold",
    styling?.headingWeight === "bold" && "font-bold",
    styling?.headingStyle === "uppercase" && "uppercase tracking-wider",
    styling?.headingStyle === "capitalize" && "capitalize"
  );

  // Build link classes based on hover effect
  const linkClasses = cn(
    "footer-link transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded",
    styling?.linkHoverEffect === "underline" && "hover:underline",
    styling?.linkHoverEffect === "slide" && "relative after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-current hover:after:w-full after:transition-all",
    styling?.linkHoverEffect === "highlight" && "hover:bg-current/10 hover:px-2 hover:-mx-2 rounded"
  );

  // Animation classes (respects prefers-reduced-motion)
  const shouldAnimate = styling?.enableAnimations && !prefersReducedMotion.current;
  const entranceAnimation = styling?.entranceAnimation || "fade-up";

  // Get initial animation state based on animation type
  const getInitialAnimationClasses = () => {
    if (!shouldAnimate || isVisible) return "";
    switch (entranceAnimation) {
      case "none":
        return "";
      case "fade-in":
        return "opacity-0";
      case "slide-up":
        return "opacity-0 translate-y-20"; // 80px slide for noticeable effect
      case "fade-up":
      default:
        return "opacity-0 translate-y-8";
    }
  };

  const animationClasses = cn(
    "transition-all",
    shouldAnimate && !isVisible && getInitialAnimationClasses(),
    shouldAnimate && isVisible && "opacity-100 translate-y-0"
  );

  const animationDuration = styling?.animationDuration || 300;

  // Determine if we're using boxed container
  const isBoxed = styling?.containerWidth === "boxed";
  const isRound = styling?.containerStyle === "round";

  // Build corner radius style
  const cornerRadiusStyle = isRound ? {
    borderTopLeftRadius: `${styling?.cornerRadiusTL || 0}px`,
    borderTopRightRadius: `${styling?.cornerRadiusTR || 0}px`,
    borderBottomLeftRadius: `${styling?.cornerRadiusBL || 0}px`,
    borderBottomRightRadius: `${styling?.cornerRadiusBR || 0}px`,
  } : {};

  const footerStyle: React.CSSProperties & { [key: string]: string | number | undefined } = {
    ...getBackgroundStyle(),
    ...(styling?.textColor && { color: styling.textColor }),
    paddingTop: `${styling?.paddingTop || 48}px`,
    paddingBottom: `${styling?.paddingBottom || 32}px`,
    // Only apply border radius if containerStyle is "round" (uses individual corners)
    // When "sharp", no border radius at all
    ...(isRound && cornerRadiusStyle),
    ...(styling?.shadow && styling.shadow !== "none" && {
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
      }[styling.shadow],
    }),
    transition: shouldAnimate ? `all ${animationDuration}ms ease-out` : undefined,
    // CSS custom properties for dynamic colors
    "--footer-link-color": styling?.linkColor || "inherit",
    "--footer-link-hover-color": styling?.linkHoverColor || styling?.accentColor || "#22d3ee",
    "--footer-heading-color": styling?.headingColor || "inherit",
    "--footer-accent-color": styling?.accentColor || ORANGE_PRIMARY,
    "--footer-divider-color": styling?.dividerColor || styling?.borderColor || "#e5e7eb",
  };

  // Container class for boxed mode
  const containerClass = isBoxed ? "max-w-7xl mx-auto" : "";

  // If we have dynamic widgets, use them
  const hasDynamicWidgets = widgetsByColumn && Object.values(widgetsByColumn).some((w) => w.length > 0);

  // Get layout type
  const layout = footerConfig?.layout || "MULTI_COLUMN";

  // Top border component
  const TopBorder = () => {
    const borderStyle = styling?.topBorderStyle;
    if (!borderStyle || borderStyle === "none") return null;

    const height = styling?.topBorderHeight || 1;
    const color = styling?.topBorderColor || styling?.accentColor || ORANGE_PRIMARY;

    if (borderStyle === "gradient") {
      const gradFrom = styling?.topBorderGradientFrom || color;
      const gradTo = styling?.topBorderGradientTo || color;
      return (
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: `${height}px`,
            background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
          }}
          aria-hidden="true"
        />
      );
    }

    if (borderStyle === "wave") {
      return (
        <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ height: `${height * 2}px` }} aria-hidden="true">
          <svg viewBox="0 0 1200 20" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,10 Q150,0 300,10 T600,10 T900,10 T1200,10 L1200,0 L0,0 Z"
              fill={color}
            />
          </svg>
        </div>
      );
    }

    return (
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: `${height}px`,
          backgroundColor: color,
        }}
        aria-hidden="true"
      />
    );
  };

  // Divider component
  const Divider = () => {
    const dividerStyle = styling?.dividerStyle;
    if (!dividerStyle || dividerStyle === "none") return null;

    const color = styling?.dividerColor || styling?.borderColor || "#e5e7eb";

    if (dividerStyle === "gradient") {
      return (
        <hr
          className="h-px my-8 border-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />
      );
    }

    return (
      <hr
        className="my-8 border-0"
        style={{
          borderTop: `1px ${dividerStyle} ${color}`,
        }}
      />
    );
  };

  // Bottom bar component (shared across layouts)
  const isSplit = footerConfig?.bottomBar?.layout === "split";
  const isCentered = footerConfig?.bottomBar?.layout === "centered" || footerConfig?.bottomBar?.layout === "stacked";

  const BottomBar = () => (
    footerConfig?.bottomBar?.enabled !== false ? (
      <>
        <Divider />

        {/* Split layout: copyright left, links right — same row */}
        {isSplit ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm opacity-80">
              {footerConfig?.bottomBar?.copyrightText ||
                t("footer.copyright", { year: String(new Date().getFullYear()), name: businessConfig.name })}
            </p>
            {footerConfig?.bottomBar?.links && footerConfig.bottomBar.links.length > 0 && (
              <nav className="flex flex-wrap gap-4" aria-label="Legal links">
                {footerConfig.bottomBar.links.map((link, index) => (
                  <Link key={index} href={link.url} className={cn("text-xs", linkClasses)}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        ) : (
          <>
            <div className={cn("flex gap-4", isCentered && "flex-col items-center text-center")}>
              <p className="text-sm opacity-80">
                {footerConfig?.bottomBar?.copyrightText ||
                  t("footer.copyright", { year: String(new Date().getFullYear()), name: businessConfig.name })}
              </p>
              {footerConfig?.bottomBar?.showDisclaimer && (
                <p className="max-w-xl text-xs opacity-60">
                  <strong>Disclaimer:</strong>{" "}
                  {footerConfig?.bottomBar?.disclaimerText ||
                    t("footer.disclaimer", { name: businessConfig.name })}
                </p>
              )}
            </div>
            {footerConfig?.bottomBar?.links && footerConfig.bottomBar.links.length > 0 && (
              <nav className={cn("mt-4 flex flex-wrap gap-4", isCentered ? "justify-center" : "justify-start")} aria-label="Legal links">
                {footerConfig.bottomBar.links.map((link, index) => (
                  <Link key={index} href={link.url} className={cn("text-xs", linkClasses)}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </>
        )}

        {/* Trust Badges (for non-brand-column layouts) */}
        {footerConfig?.trustBadges?.show && footerConfig.trustBadges.badges?.length > 0 && (
          <div className="mt-6">
            <TrustBadges badges={footerConfig.trustBadges.badges} />
          </div>
        )}
      </>
    ) : null
  );

  // Dynamic CSS for footer colors (uses direct interpolation for guaranteed application)
  const linkColor = styling?.linkColor || "inherit";
  const linkHoverColor = styling?.linkHoverColor || styling?.accentColor || "#22d3ee";
  const headingColor = styling?.headingColor || "inherit";
  const FooterStyles = () => (
    <style>{`
      .footer-dynamic-styles .footer-link {
        color: ${linkColor};
        font-size: 0.875rem;
        line-height: 1.5rem;
        transition: color 0.2s ease;
      }
      .footer-dynamic-styles .footer-link:hover {
        color: ${linkHoverColor};
      }
      .footer-dynamic-styles .footer-heading {
        color: ${headingColor};
        font-size: ${styling?.headingSize === "xl" ? "1.25rem" : styling?.headingSize === "lg" ? "1.125rem" : styling?.headingSize === "base" ? "1rem" : "0.875rem"};
        font-weight: ${styling?.headingWeight === "bold" ? "700" : styling?.headingWeight === "semibold" ? "600" : "500"};
        line-height: 1.75rem;
      }
    `}</style>
  );

  // ============== STACKED LAYOUT ==============
  if (layout === "STACKED") {
    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        {styling?.bgType === "pattern" && styling.bgPattern && (
          <BackgroundPattern
            pattern={styling.bgPattern}
            color={styling.bgPatternColor || "#000"}
            opacity={styling.bgPatternOpacity || 10}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          {/* Brand Section */}
          <div className="flex flex-col items-center text-center py-8">
            <Link href="/" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded">
              {footerLogoUrl ? (
                <Image
                  src={footerLogoUrl}
                  alt={businessConfig.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-2xl font-bold" style={{ color: styling?.headingColor }}>
                {businessConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-md opacity-80">{businessConfig.description}</p>
          </div>

          <Divider />

          {/* Widget Grid */}
          {hasDynamicWidgets && (
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 py-6">
              {Object.entries(widgetsByColumn!)
                .filter(([, widgets]) => widgets.length > 0)
                .map(([column, widgets]) => (
                  <div key={column}>
                    {widgets.map((widget) => (
                      <FooterWidgetRenderer
                        key={widget.id}
                        widget={widget}
                        businessConfig={businessConfig}
                        socialLinks={socialLinks}
                        footerConfig={footerConfig}
                        headingClasses={headingClasses}
                        linkClasses={linkClasses}
                        logoUrl={footerLogoUrl}
                      />
                    ))}
                  </div>
                ))}
            </div>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center py-6">
              <EnhancedSocialLinks
                links={socialLinks}
                shape={footerConfig?.social?.shape}
                size={footerConfig?.social?.size}
                colorMode={footerConfig?.social?.colorMode}
                hoverEffect={footerConfig?.social?.hoverEffect}
                accentColor={styling?.accentColor || undefined}
                bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
              />
            </div>
          )}

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== MINIMAL LAYOUT ==============
  if (layout === "MINIMAL") {
    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary rounded">
              {footerLogoUrl ? (
                <Image
                  src={footerLogoUrl}
                  alt={businessConfig.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="font-semibold">{businessConfig.name}</span>
            </Link>

            {/* Bottom Links inline */}
            {footerConfig?.bottomBar?.links && footerConfig.bottomBar.links.length > 0 && (
              <nav className="flex flex-wrap justify-center gap-4" aria-label="Footer links">
                {footerConfig.bottomBar.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    className={cn("text-sm", linkClasses)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <EnhancedSocialLinks
                links={socialLinks}
                shape={footerConfig?.social?.shape}
                size={footerConfig?.social?.size}
                colorMode={footerConfig?.social?.colorMode}
                hoverEffect={footerConfig?.social?.hoverEffect}
                accentColor={styling?.accentColor || undefined}
                bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
              />
            )}
          </div>

          {/* Copyright */}
          <div className="mt-6 border-t pt-6 text-center" style={{ borderColor: styling?.borderColor }}>
            <p className="text-sm opacity-80">
              {footerConfig?.bottomBar?.copyrightText ||
                t("footer.copyright", { year: String(new Date().getFullYear()), name: businessConfig.name })}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // ============== CENTERED LAYOUT ==============
  if (layout === "CENTERED") {
    // Separate widgets by type for centered layout rendering
    const linkWidgets = allWidgets.filter(w => w.type === "LINKS");
    const contactWidget = allWidgets.find(w => w.type === "CONTACT");
    // Other widgets (TEXT, CUSTOM_HTML, BUTTON, etc.) excluding BRAND and SOCIAL (handled separately)
    const otherWidgets = allWidgets.filter(w =>
      w.type !== "LINKS" && w.type !== "BRAND" && w.type !== "SOCIAL" &&
      w.type !== "CONTACT"
    );

    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        {styling?.bgType === "pattern" && styling.bgPattern && (
          <BackgroundPattern
            pattern={styling.bgPattern}
            color={styling.bgPatternColor || "#000"}
            opacity={styling.bgPatternOpacity || 10}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          {/* Centered Logo & Description */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded">
              {footerLogoUrl ? (
                <Image
                  src={footerLogoUrl}
                  alt={businessConfig.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-2xl font-bold" style={{ color: styling?.headingColor }}>
                {businessConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm opacity-80">
              {businessConfig.description}
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-6">
                <EnhancedSocialLinks
                  links={socialLinks}
                  shape={footerConfig?.social?.shape}
                  size={footerConfig?.social?.size}
                  colorMode={footerConfig?.social?.colorMode}
                  hoverEffect={footerConfig?.social?.hoverEffect}
                  accentColor={styling?.accentColor || undefined}
                  bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
                />
              </div>
            )}
          </div>

          {/* Link sections in a row */}
          {linkWidgets.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-12">
              {linkWidgets.map((widget) => {
                const widgetLinks = getWidgetLinks(widget);
                return (
                  <nav key={widget.id} className="text-center" aria-label={widget.title || "Links"}>
                    {widget.showTitle && widget.title && (
                      <h3 className={headingClasses}>{widget.title}</h3>
                    )}
                    <ul className="mt-3 space-y-2">
                      {widgetLinks.map((link) => (
                        <li key={link.id}>
                          <Link
                            href={link.url}
                            className={cn("text-sm", linkClasses)}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                );
              })}
            </div>
          )}

          {/* Contact Info (if widget exists) */}
          {contactWidget && (
            <div className="mt-8 flex justify-center">
              <FooterWidgetRenderer
                widget={contactWidget}
                businessConfig={businessConfig}
                socialLinks={socialLinks}
                footerConfig={footerConfig}
                headingClasses={headingClasses}
                linkClasses={linkClasses}
                logoUrl={footerLogoUrl}
              />
            </div>
          )}

          {/* Other widgets (TEXT, CUSTOM_HTML, BUTTON, etc.) */}
          {otherWidgets.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-8">
              {otherWidgets.map((widget) => (
                <div key={widget.id} className="text-center">
                  <FooterWidgetRenderer
                    widget={widget}
                    businessConfig={businessConfig}
                    socialLinks={socialLinks}
                    footerConfig={footerConfig}
                    headingClasses={headingClasses}
                    linkClasses={linkClasses}
                    logoUrl={footerLogoUrl}
                  />
                </div>
              ))}
            </div>
          )}

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== ASYMMETRIC LAYOUT ==============
  if (layout === "ASYMMETRIC") {
    const linkWidgets = allWidgets.filter(w => w.type === "LINKS");

    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        {styling?.bgType === "pattern" && styling.bgPattern && (
          <BackgroundPattern
            pattern={styling.bgPattern}
            color={styling.bgPatternColor || "#000"}
            opacity={styling.bgPatternOpacity || 10}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col gap-10 lg:flex-row">
            {/* Left section (2/3) - Brand */}
            <div className="lg:w-2/3 space-y-6">
              <Link href="/" className="flex items-center space-x-4 focus:outline-none focus:ring-2 focus:ring-primary rounded">
                {footerLogoUrl ? (
                  <Image
                    src={footerLogoUrl}
                    alt={businessConfig.name}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {businessConfig.logo.text || businessConfig.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-xl font-bold" style={{ color: styling?.headingColor }}>
                  {businessConfig.name}
                </span>
              </Link>

              <p className="max-w-lg text-sm opacity-80">
                {businessConfig.description}
              </p>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <EnhancedSocialLinks
                  links={socialLinks}
                  shape={footerConfig?.social?.shape}
                  size={footerConfig?.social?.size}
                  colorMode={footerConfig?.social?.colorMode}
                  hoverEffect={footerConfig?.social?.hoverEffect}
                  accentColor={styling?.accentColor || undefined}
                  bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
                />
              )}
            </div>

            {/* Right section (1/3) - Link widgets */}
            <div className="lg:w-1/3 grid grid-cols-2 gap-8 lg:grid-cols-1">
              {linkWidgets.length > 0 ? (
                linkWidgets.map((widget) => (
                  <FooterWidgetRenderer
                    key={widget.id}
                    widget={widget}
                    businessConfig={businessConfig}
                    socialLinks={socialLinks}
                    footerConfig={footerConfig}
                    headingClasses={headingClasses}
                    linkClasses={linkClasses}
                    logoUrl={footerLogoUrl}
                  />
                ))
              ) : (
                <>
                  <nav aria-label="Company">
                    <h3 className={headingClasses}>Company</h3>
                    <ul className="mt-4 space-y-3">
                      {fallbackLinks.company.map((link) => (
                        <li key={link.name}>
                          <Link href={link.href} className={cn("text-sm", linkClasses)}>
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <nav aria-label="Legal">
                    <h3 className={headingClasses}>Legal</h3>
                    <ul className="mt-4 space-y-3">
                      {fallbackLinks.legal.map((link) => (
                        <li key={link.name}>
                          <Link href={link.href} className={cn("text-sm", linkClasses)}>
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== APP_FOCUSED LAYOUT ==============
  if (layout === "APP_FOCUSED") {
    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        {styling?.bgType === "pattern" && styling.bgPattern && (
          <BackgroundPattern
            pattern={styling.bgPattern}
            color={styling.bgPatternColor || "#000"}
            opacity={styling.bgPatternOpacity || 10}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col gap-10 lg:flex-row">
            {/* Left section - App promo */}
            <div className="lg:w-1/3 space-y-6">
              <Link href="/" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded">
                {footerLogoUrl ? (
                  <Image
                    src={footerLogoUrl}
                    alt={businessConfig.name}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {businessConfig.logo.text || businessConfig.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-xl font-bold" style={{ color: styling?.headingColor }}>
                  {businessConfig.name}
                </span>
              </Link>

              <p className="text-sm opacity-80">{businessConfig.description}</p>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <EnhancedSocialLinks
                  links={socialLinks}
                  shape={footerConfig?.social?.shape}
                  size={footerConfig?.social?.size}
                  colorMode={footerConfig?.social?.colorMode}
                  hoverEffect={footerConfig?.social?.hoverEffect}
                  accentColor={styling?.accentColor || undefined}
                  bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
                />
              )}
            </div>

            {/* Right section - Widget grid */}
            <div className="lg:w-2/3">
              {hasDynamicWidgets ? (
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
                  {Object.entries(widgetsByColumn!)
                    .filter(([, widgets]) => widgets.length > 0)
                    .filter(([, widgets]) => !widgets.some(w => w.type === "BRAND"))
                    .map(([column, widgets]) => (
                      <div key={column}>
                        {widgets.map((widget) => (
                          <FooterWidgetRenderer
                            key={widget.id}
                            widget={widget}
                            businessConfig={businessConfig}
                            socialLinks={socialLinks}
                            footerConfig={footerConfig}
                            headingClasses={headingClasses}
                            linkClasses={linkClasses}
                            logoUrl={footerLogoUrl}
                          />
                        ))}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
                  <nav aria-label="Services">
                    <h3 className={headingClasses}>Services</h3>
                    <ul className="mt-4 space-y-3">
                      {fallbackLinks.services.map((link) => (
                        <li key={link.name}>
                          <Link href={link.href} className={cn("text-sm", linkClasses)}>
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <nav aria-label="Company">
                    <h3 className={headingClasses}>Company</h3>
                    <ul className="mt-4 space-y-3">
                      {fallbackLinks.company.map((link) => (
                        <li key={link.name}>
                          <Link href={link.href} className={cn("text-sm", linkClasses)}>
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <nav aria-label="Legal">
                    <h3 className={headingClasses}>Legal</h3>
                    <ul className="mt-4 space-y-3">
                      {fallbackLinks.legal.map((link) => (
                        <li key={link.name}>
                          <Link href={link.href} className={cn("text-sm", linkClasses)}>
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== MEGA LAYOUT ==============
  if (layout === "MEGA" || layout === "MEGA_PLUS") {
    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        {styling?.bgType === "pattern" && styling.bgPattern && (
          <BackgroundPattern
            pattern={styling.bgPattern}
            color={styling.bgPatternColor || "#000"}
            opacity={styling.bgPatternOpacity || 10}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          {/* Top section with logo and social */}
          <div className="flex flex-col items-start justify-between gap-8 border-b pb-10 md:flex-row md:items-center" style={{ borderColor: styling?.borderColor }}>
            <div className="flex items-center space-x-4">
              {footerLogoUrl ? (
                <Image
                  src={footerLogoUrl}
                  alt={businessConfig.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-xl font-bold" style={{ color: styling?.headingColor }}>
                  {businessConfig.name}
                </span>
                <p className="text-sm opacity-80">{businessConfig.description}</p>
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <EnhancedSocialLinks
                links={socialLinks}
                shape={footerConfig?.social?.shape}
                size={footerConfig?.social?.size}
                colorMode={footerConfig?.social?.colorMode}
                hoverEffect={footerConfig?.social?.hoverEffect}
                accentColor={styling?.accentColor || undefined}
                bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
              />
            )}
          </div>

          {/* Mega grid - more columns */}
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
            {hasDynamicWidgets ? (
              Object.entries(widgetsByColumn!)
                .filter(([, widgets]) => widgets.length > 0)
                .map(([column, widgets]) => (
                  <div key={column}>
                    {widgets.map((widget) => (
                      <FooterWidgetRenderer
                        key={widget.id}
                        widget={widget}
                        businessConfig={businessConfig}
                        socialLinks={socialLinks}
                        footerConfig={footerConfig}
                        headingClasses={headingClasses}
                        linkClasses={linkClasses}
                        logoUrl={footerLogoUrl}
                      />
                    ))}
                  </div>
                ))
            ) : (
              <>
                {/* Fallback columns */}
                <nav aria-label="Services">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Services</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.services.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className={cn("text-sm", linkClasses)}>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <nav aria-label="Company">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Company</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.company.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className={cn("text-sm", linkClasses)}>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <nav aria-label="Popular states">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Popular States</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.states.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className={cn("text-sm", linkClasses)}>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <nav aria-label="Legal">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Legal</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.legal.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className={cn("text-sm", linkClasses)}>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <address className="col-span-2 not-italic">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Contact Us</h3>
                  <div className="mt-4 space-y-3">
                    {businessConfig.contact.supportEmail && (
                      <a href={`mailto:${businessConfig.contact.supportEmail}`} className={cn("flex items-center gap-2 text-sm", linkClasses)}>
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        {businessConfig.contact.supportEmail}
                      </a>
                    )}
                    {businessConfig.contact.phone && (
                      <a href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`} className={cn("flex items-center gap-2 text-sm", linkClasses)}>
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {businessConfig.contact.phone}
                      </a>
                    )}
                    {businessConfig.address.full && (
                      <p className="flex items-start gap-2 text-sm opacity-80">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {businessConfig.address.full}
                      </p>
                    )}
                  </div>
                </address>
              </>
            )}
          </div>

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== MULTI_COLUMN LAYOUT (Default) ==============
  const footerElement = (
    <footer
      ref={footerRef}
      className={cn(
        "relative overflow-hidden footer-dynamic-styles",
        !isBoxed && (!styling?.topBorderStyle || styling.topBorderStyle === "none") && "border-t",
        animationClasses
      )}
      style={footerStyle}
      role="contentinfo"
    >
      <FooterStyles />
      <TopBorder />
      {styling?.bgType === "pattern" && styling.bgPattern && (
        <BackgroundPattern
          pattern={styling.bgPattern}
          color={styling.bgPatternColor || "#000"}
          opacity={styling.bgPatternOpacity || 10}
        />
      )}
      <div className="container mx-auto px-4 relative z-10">
        {hasDynamicWidgets ? (
          (() => {
            const entries = Object.entries(widgetsByColumn!).filter(([, widgets]) => widgets.length > 0);
            const hasBrandWidget = entries.some(([, widgets]) => widgets.some((w) => w.type === "BRAND"));
            const desktopCols = hasBrandWidget ? entries.length + 1 : entries.length;

            return (
              <>
                <style>{`
                  .footer-grid {
                    display: grid;
                    gap: 2rem;
                    grid-template-columns: 1fr;
                  }
                  @media (min-width: 640px) {
                    .footer-grid {
                      grid-template-columns: repeat(2, 1fr);
                    }
                    .footer-grid .brand-col {
                      grid-column: span 2;
                    }
                  }
                  @media (min-width: 768px) {
                    .footer-grid {
                      grid-template-columns: repeat(3, 1fr);
                    }
                  }
                  @media (min-width: 1024px) {
                    .footer-grid {
                      grid-template-columns: repeat(${desktopCols}, 1fr);
                    }
                    .footer-grid .brand-col {
                      grid-column: span 2;
                    }
                  }
                `}</style>
                <div className="footer-grid">
                  {entries.map(([column, widgets]) => {
                    const isBrand = widgets.some((w) => w.type === "BRAND");
                    return (
                      <div
                        key={column}
                        className={`min-w-0 break-words space-y-6 ${isBrand ? "brand-col" : ""}`}
                      >
                        {widgets.map((widget) => (
                          <FooterWidgetRenderer
                            key={widget.id}
                            widget={widget}
                            businessConfig={businessConfig}
                            socialLinks={socialLinks}
                            footerConfig={footerConfig}
                            headingClasses={headingClasses}
                            linkClasses={linkClasses}
                            logoUrl={footerLogoUrl}
                          />
                        ))}
                        {/* Trust badges at bottom of brand column — after social icons */}
                        {isBrand && footerConfig?.trustBadges?.badges && footerConfig.trustBadges.badges.length > 0 && (
                          <TrustBadges badges={footerConfig.trustBadges.badges} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()
        ) : (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {/* Brand - Logo only, aligned with column headings */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-primary rounded mb-4">
                {footerLogoUrl ? (
                  <Image
                    src={footerLogoUrl}
                    alt={businessConfig.name}
                    width={160}
                    height={48}
                    className="h-12 w-auto rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                    <span className="text-xl font-bold text-primary-foreground">
                      {businessConfig.logo.text || businessConfig.name.charAt(0)}
                    </span>
                  </div>
                )}
              </Link>
              <p className="max-w-xs text-sm opacity-80">
                {businessConfig.description}
              </p>

              <address className="mt-6 space-y-3 not-italic">
                {businessConfig.contact.supportEmail && (
                  <a
                    href={`mailto:${businessConfig.contact.supportEmail}`}
                    className={cn("flex items-center gap-2 text-sm", linkClasses)}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {businessConfig.contact.supportEmail}
                  </a>
                )}
                {businessConfig.contact.phone && (
                  <a
                    href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                    className={cn("flex items-center gap-2 text-sm", linkClasses)}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {businessConfig.contact.phone}
                  </a>
                )}
                {businessConfig.address.full && (
                  <p className="flex items-start gap-2 text-sm opacity-80">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {businessConfig.address.full}
                  </p>
                )}
              </address>

              <div className="mt-6">
                <EnhancedSocialLinks
                  links={socialLinks}
                  shape={footerConfig?.social?.shape}
                  size={footerConfig?.social?.size}
                  colorMode={footerConfig?.social?.colorMode}
                  hoverEffect={footerConfig?.social?.hoverEffect}
                  accentColor={styling?.accentColor || undefined}
                  bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
                />
              </div>
            </div>

            {/* Fallback columns */}
            <nav aria-label="Services">
              <h3 className={headingClasses}>Services</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={cn("text-sm", linkClasses)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Company">
              <h3 className={headingClasses}>Company</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={cn("text-sm", linkClasses)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Popular states">
              <h3 className={headingClasses}>Popular States</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.states.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={cn("text-sm", linkClasses)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Legal">
              <h3 className={headingClasses}>Legal</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={cn("text-sm", linkClasses)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        <BottomBar />
      </div>

      {/* Custom CSS */}
      {styling?.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: styling.customCSS }} />
      )}
    </footer>
  );

  // Wrap in container if boxed mode
  if (isBoxed) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {footerElement}
        {styling?.brandRevealEnabled && (
          <BrandRevealScene
            text={styling.brandRevealText || businessConfig.name || "BRAND"}
            color={styling.brandRevealColor || "#ffffff"}
            bgColor={styling.bgColor || "#0f2318"}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {footerElement}
      {styling?.brandRevealEnabled && (
        <BrandRevealScene
          text={styling.brandRevealText || businessConfig.name || "BRAND"}
          color={styling.brandRevealColor || "#ffffff"}
          bgColor={styling.bgColor || "#0f2318"}
        />
      )}
    </>
  );
}

// ============== Brand Reveal Scene (Page-lift effect) ==============
// Exact replica of v3-forge pattern:
//   #pageLift  = layout wrapper (.min-h-screen) — position:relative, z-index:1, bg opaque
//   #brandScene = fixed at bottom, z-index:0, same bg as footer
//   #liftSpacer = OUTSIDE pageLift, adds extra scroll space
// When user scrolls to the very bottom, pageLift translates up to reveal brandScene.
function BrandRevealScene({ text, color, bgColor }: { text: string; color: string; bgColor: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Find the layout wrapper (= pageLift in v3-forge)
    const pageLift = document.querySelector(".min-h-screen.bg-background") as HTMLElement;
    if (!pageLift) return;

    // === Create #brandScene (fixed behind page) ===
    const scene = document.createElement("div");
    scene.id = "brand-reveal-scene";
    scene.setAttribute("aria-hidden", "true");
    Object.assign(scene.style, {
      position: "fixed",
      bottom: "0",
      left: "0",
      width: "100%",
      zIndex: "0",
      background: bgColor,
      padding: "0 0 24px",
      pointerEvents: "none",
      overflow: "hidden",
    });

    const brandSpan = document.createElement("span");
    Object.assign(brandSpan.style, {
      display: "block",
      fontFamily: "var(--font-heading)",
      fontSize: "clamp(100px, 22vw, 360px)",
      fontWeight: "900",
      letterSpacing: "-0.04em",
      color: color,
      textTransform: "uppercase",
      lineHeight: "0.85",
      maxWidth: "1160px",
      margin: "0 auto",
      padding: "0 28px",
      userSelect: "none",
      textAlign: "center",
    });
    brandSpan.textContent = text;
    scene.appendChild(brandSpan);

    // === Create #liftSpacer (adds scroll room, OUTSIDE pageLift) ===
    const spacer = document.createElement("div");
    spacer.id = "brand-reveal-spacer";
    spacer.style.height = "0";

    // Insert scene and spacer AFTER pageLift (as siblings, not children)
    pageLift.insertAdjacentElement("afterend", scene);
    scene.insertAdjacentElement("afterend", spacer);

    // === Style pageLift (opaque cover over brandScene) ===
    pageLift.style.position = "relative";
    pageLift.style.zIndex = "1";
    // Ensure background is set (covers the fixed brandScene)
    if (!pageLift.style.background) {
      pageLift.style.background = "var(--color-background, #ffffff)";
    }

    // === Scroll math (identical to v3-forge) ===
    let brandH = 0;
    let scrollDist = 0;
    let transformPx = 0;

    function computeLift() {
      brandH = scene.offsetHeight;
      // Split: half from natural scroll, half from transform
      scrollDist = Math.ceil(brandH * 0.5);
      transformPx = brandH - scrollDist;
      spacer.style.height = scrollDist + "px";
    }

    function update() {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      // pageLift.offsetHeight does NOT include spacer (spacer is a sibling)
      const liftStart = pageLift.offsetHeight - winH;
      const progress = Math.max(0, Math.min(1, (scrollY - liftStart) / scrollDist));

      pageLift.style.transform = progress > 0
        ? `translateY(-${progress * transformPx}px)`
        : "";
      scene.style.pointerEvents = progress > 0.95 ? "auto" : "none";
    }

    computeLift();
    update();

    const onScroll = () => update();
    const onResize = () => { computeLift(); update(); };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      scene.remove();
      spacer.remove();
      pageLift.style.position = "";
      pageLift.style.zIndex = "";
      pageLift.style.transform = "";
      pageLift.style.background = "";
    };
  }, [mounted, text, color, bgColor]);

  // This component renders nothing in React tree — all DOM manipulation is imperative
  return null;
}
