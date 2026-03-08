// ============================================
// SERVICE HERO WIDGET
// Displays service title, description, price badge, and CTA buttons
// Supports "single" (legacy) and "two-column" (new) layouts
// ============================================

"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import {
  useOptionalServiceContext,
  resolvePlaceholders,
} from "@/lib/page-builder/contexts/service-context";
import type { ServiceHeroWidgetSettings } from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { ServiceIcon } from "@/components/ui/service-icon";
import { getCurrencySymbol } from "@/components/ui/currency-selector";

// ============================================
// DEFAULT SETTINGS
// ============================================

const DEFAULT_SETTINGS: ServiceHeroWidgetSettings = {
  layout: "single",

  // Content Source
  titleSource: "auto",
  subtitleSource: "auto",

  // Category Badge
  showCategoryBadge: false,
  categoryBadgeTag: "Most Popular",

  // Price Badge (single mode)
  showPriceBadge: true,
  priceBadgeText: "From ${{service.startingPrice}}",

  // Price Hero (two-column mode)
  showPriceHero: false,

  // Primary Button
  primaryCtaText: "Get Started",
  primaryCtaLink: "/checkout/{{service.slug}}",
  showPriceInButton: true,

  // Secondary Button
  showSecondaryButton: true,
  secondaryCtaText: "Ask a Question",
  secondaryCtaLink: "/contact",

  // Trust Items
  showTrustItems: false,
  trustItems: [
    { text: "Filing accuracy guaranteed" },
    { text: "Filed in 24 hours" },
    { text: "100% remote" },
  ],

  // Right Card
  rightCardShow: false,
  rightCardTitle: "What You Get",
  rightCardAutoItems: true,
  rightCardStats: [
    { value: "1,200+", label: "Clients Served" },
    { value: "30+", label: "Countries" },
    { value: "4.9★", label: "Rating" },
  ],

  // Appearance
  backgroundType: "none",
  textAlignment: "center",
  titleSize: "default",
  spacing: "lg",
};

// ============================================
// WIDGET COMPONENT
// ============================================

interface ServiceHeroWidgetProps {
  settings: Partial<ServiceHeroWidgetSettings>;
  isPreview?: boolean;
}

export function ServiceHeroWidget({
  settings: partialSettings,
  isPreview = false,
}: ServiceHeroWidgetProps) {
  const settings: ServiceHeroWidgetSettings = {
    ...DEFAULT_SETTINGS,
    ...partialSettings,
  };

  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    fetch("/api/business-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.currency) setCurrencySymbol(getCurrencySymbol(data.currency));
      })
      .catch(() => {});
  }, []);

  const serviceContext = useOptionalServiceContext();

  if (!serviceContext) {
    return (
      <WidgetContainer container={settings.container}>
        <ServiceHeroPlaceholder settings={settings} />
      </WidgetContainer>
    );
  }

  const { service } = serviceContext;

  const title =
    settings.titleSource === "auto"
      ? service.name
      : settings.customTitle || service.name;

  const subtitle =
    settings.subtitleSource === "auto"
      ? service.shortDesc
      : settings.customSubtitle || service.shortDesc;

  const primaryLink = resolvePlaceholders(settings.primaryCtaLink, service);
  const secondaryLink = resolvePlaceholders(settings.secondaryCtaLink, service);
  const priceBadgeText = resolvePlaceholders(settings.priceBadgeText, service);

  const formattedPrice =
    service.startingPrice === 0
      ? `${currencySymbol}0`
      : `${currencySymbol}${Number(service.startingPrice).toLocaleString()}`;

  if (settings.layout === "two-column") {
    return (
      <WidgetContainer container={settings.container}>
        <TwoColumnHero
          settings={settings}
          service={service}
          title={title}
          subtitle={subtitle}
          primaryLink={primaryLink}
          secondaryLink={secondaryLink}
          currencySymbol={currencySymbol}
        />
      </WidgetContainer>
    );
  }

  // ── Single column (legacy) ──────────────────────────────────────────────
  const spacingClasses = { sm: "", md: "py-4", lg: "py-8", xl: "py-12 lg:py-16" };
  const titleSizeClasses = {
    default: "text-4xl md:text-5xl",
    large: "text-5xl md:text-6xl",
    xl: "text-6xl md:text-7xl",
  };
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const getBackgroundClasses = () => {
    if (settings.backgroundType === "gradient") return settings.backgroundGradient || "bg-gradient-to-b from-orange-50 to-white";
    return "";
  };
  const getBackgroundStyles = (): React.CSSProperties => {
    if (settings.backgroundType === "solid" && settings.backgroundColor) return { backgroundColor: settings.backgroundColor };
    if (settings.backgroundType === "image" && settings.backgroundImage) return { backgroundImage: `url(${settings.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" };
    return {};
  };

  return (
    <WidgetContainer container={settings.container}>
      <section
        className={cn("relative", spacingClasses[settings.spacing], getBackgroundClasses())}
        style={getBackgroundStyles()}
      >
        <div className={cn("mx-auto max-w-4xl px-4 flex flex-col", alignmentClasses[settings.textAlignment])}>
          {service.icon && (
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ServiceIcon name={service.icon} className="h-8 w-8" />
            </div>
          )}
          {settings.showPriceBadge && (
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              {priceBadgeText}
            </span>
          )}
          <h1 className={cn("font-bold tracking-tight text-foreground", titleSizeClasses[settings.titleSize])}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn("mt-4 text-xl text-muted-foreground max-w-2xl", settings.textAlignment === "center" && "mx-auto")}>
              {subtitle}
            </p>
          )}
          <div className={cn("mt-8 flex flex-wrap gap-4", settings.textAlignment === "center" && "justify-center", settings.textAlignment === "right" && "justify-end")}>
            <Button size="lg" asChild>
              <Link href={primaryLink}>
                {settings.primaryCtaText}
                {settings.showPriceInButton && ` - ${formattedPrice}`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {settings.showSecondaryButton && (
              <Button size="lg" variant="outline" asChild>
                <Link href={secondaryLink}>{settings.secondaryCtaText}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </WidgetContainer>
  );
}

// ============================================
// TWO-COLUMN HERO
// ============================================

interface TwoColumnHeroProps {
  settings: ServiceHeroWidgetSettings;
  service: NonNullable<ReturnType<typeof useOptionalServiceContext>>["service"];
  title: string;
  subtitle: string | null | undefined;
  primaryLink: string;
  secondaryLink: string;
  currencySymbol: string;
}

function TwoColumnHero({
  settings,
  service,
  title,
  subtitle,
  primaryLink,
  secondaryLink,
  currencySymbol,
}: TwoColumnHeroProps) {
  // Build title with visual effects
  const renderTitle = () => {
    const highlightWord = settings.titleHighlightWord?.trim();
    const underlineWord = settings.titleUnderlineWord?.trim();

    if (!highlightWord && !underlineWord) {
      return <>{title}</>;
    }

    const parts = title.split(/(\s+)/);
    return (
      <>
        {parts.map((part, i) => {
          const word = part.trim();
          if (highlightWord && word.toLowerCase() === highlightWord.toLowerCase()) {
            return (
              <span key={i} style={{ color: "var(--sh-forest, #1b3a2d)" }}>
                {part}
              </span>
            );
          }
          if (underlineWord && word.toLowerCase() === underlineWord.toLowerCase()) {
            return (
              <span
                key={i}
                style={{ position: "relative", display: "inline-block" }}
              >
                {part}
                <span
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    left: 0,
                    right: 0,
                    height: "5px",
                    background: "var(--sh-coral, #e84c1e)",
                    borderRadius: "3px",
                    opacity: 0.6,
                  }}
                />
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const trustItems = settings.trustItems || [];

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        "--sh-forest": "#1b3a2d",
        "--sh-coral": "#e84c1e",
        "--sh-bg": "#faf8f4",
        "--sh-cream": "#faf8f4",
      } as React.CSSProperties}
    >
      {/* Category Badge */}
      {settings.showCategoryBadge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px 6px 8px",
            background: "#fff",
            border: "1px solid rgba(14,17,9,0.1)",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#4b5249",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#059669",
              animation: "pulse 2s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          {settings.categoryBadgeText || service.category?.name || "Service"}
          {settings.categoryBadgeTag && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                padding: "2px 8px",
                borderRadius: "999px",
                background: "#e84c1e",
                color: "#fff",
                marginLeft: "4px",
              }}
            >
              {settings.categoryBadgeTag}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h1
        style={{
          fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
          fontSize: "clamp(36px, 5vw, 56px)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          color: "#0e1109",
          marginBottom: "20px",
        }}
      >
        {renderTitle()}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: "17px",
            color: "#4b5249",
            lineHeight: 1.75,
            maxWidth: "520px",
            marginBottom: "28px",
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Price Hero */}
      {settings.showPriceHero && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              fontSize: "36px",
              fontWeight: 900,
              color: "#0e1109",
              letterSpacing: "-0.03em",
            }}
          >
            <sup style={{ fontSize: "18px", verticalAlign: "top", marginTop: "6px" }}>
              {currencySymbol}
            </sup>
            {Number(service.startingPrice).toLocaleString()}
          </div>
          {settings.priceHeroNote && (
            <div
              style={{
                fontSize: "12px",
                color: "#8a9086",
                lineHeight: 1.5,
              }}
            >
              {settings.priceHeroNote}
            </div>
          )}
        </div>
      )}

      {/* CTA Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "32px",
        }}
      >
        <Link
          href={primaryLink}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "16px 34px",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: 600,
            background: "#e84c1e",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 0.22s ease",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {settings.primaryCtaText}
          <ArrowRight style={{ width: "16px", height: "16px", flexShrink: 0 }} />
        </Link>
        {settings.showSecondaryButton && (
          <Link
            href={secondaryLink}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "16px 34px",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 600,
              background: "transparent",
              color: "#1a1f16",
              border: "1.5px solid rgba(14,17,9,0.1)",
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.22s ease",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {settings.secondaryCtaText}
          </Link>
        )}
      </div>

      {/* Trust Items */}
      {settings.showTrustItems && trustItems.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          {trustItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: "#8a9086",
                fontWeight: 600,
                padding: i === 0 ? "0 14px 0 0" : "0 14px",
                borderLeft: i > 0 ? "1px solid rgba(14,17,9,0.1)" : "none",
              }}
            >
              <Check style={{ width: "13px", height: "13px", color: "#1b3a2d", flexShrink: 0 }} />
              {item.text}
            </div>
          ))}
        </div>
      )}

      {/* Keyframes for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}

// ============================================
// PLACEHOLDER FOR ADMIN PREVIEW
// ============================================

function ServiceHeroPlaceholder({ settings }: { settings: ServiceHeroWidgetSettings }) {
  const spacingClasses = { sm: "", md: "py-4", lg: "py-8", xl: "py-12 lg:py-16" };
  const titleSizeClasses = {
    default: "text-4xl md:text-5xl",
    large: "text-5xl md:text-6xl",
    xl: "text-6xl md:text-7xl",
  };
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  if (settings.layout === "two-column") {
    return (
      <section style={{ position: "relative", overflow: "hidden" }}>
        {settings.showCategoryBadge && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px 6px 8px",
              background: "#fff",
              border: "1px solid rgba(14,17,9,0.1)",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#4b5249",
              marginBottom: "24px",
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669", flexShrink: 0 }} />
            {settings.categoryBadgeText || "Formation & Legal"}
            {settings.categoryBadgeTag && (
              <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: "#e84c1e", color: "#fff", marginLeft: "4px" }}>
                {settings.categoryBadgeTag}
              </span>
            )}
          </div>
        )}
        <h1 style={{ fontFamily: "var(--font-heading, 'Outfit', sans-serif)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#0e1109", marginBottom: "20px" }}>
          {settings.titleSource === "custom" && settings.customTitle ? settings.customTitle : "{{service.name}}"}
        </h1>
        <p style={{ fontSize: "17px", color: "#4b5249", lineHeight: 1.75, maxWidth: "520px", marginBottom: "28px" }}>
          {settings.subtitleSource === "custom" && settings.customSubtitle ? settings.customSubtitle : "{{service.shortDesc}}"}
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "32px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 34px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, background: "#e84c1e", color: "#fff" }}>
            {settings.primaryCtaText}
          </span>
          {settings.showSecondaryButton && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 34px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, border: "1.5px solid rgba(14,17,9,0.1)", color: "#1a1f16" }}>
              {settings.secondaryCtaText}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Preview — service data loads dynamically</p>
      </section>
    );
  }

  return (
    <section
      className={cn("relative", spacingClasses[settings.spacing])}
    >
      <div className={cn("mx-auto max-w-4xl px-4 flex flex-col", alignmentClasses[settings.textAlignment])}>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="text-2xl">🏢</span>
        </div>
        {settings.showPriceBadge && (
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {settings.priceBadgeText || "From $199"}
          </span>
        )}
        <h1 className={cn("font-bold tracking-tight text-foreground", titleSizeClasses[settings.titleSize])}>
          {settings.titleSource === "custom" && settings.customTitle ? settings.customTitle : "{{service.name}}"}
        </h1>
        <p className={cn("mt-4 text-xl text-muted-foreground max-w-2xl", settings.textAlignment === "center" && "mx-auto")}>
          {settings.subtitleSource === "custom" && settings.customSubtitle ? settings.customSubtitle : "{{service.shortDesc}}"}
        </p>
        <div className={cn("mt-8 flex flex-wrap gap-4", settings.textAlignment === "center" && "justify-center")}>
          <Button size="lg" disabled className="cursor-not-allowed">
            {settings.primaryCtaText}
          </Button>
          {settings.showSecondaryButton && (
            <Button size="lg" variant="outline" disabled className="cursor-not-allowed">
              {settings.secondaryCtaText}
            </Button>
          )}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Preview mode — Service data will be loaded dynamically</p>
      </div>
    </section>
  );
}
