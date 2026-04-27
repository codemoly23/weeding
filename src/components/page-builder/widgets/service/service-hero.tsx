// ============================================
// SERVICE HERO WIDGET
// Displays service title, description, price badge, and CTA buttons
// Uses shared ButtonCustomStyle system for button styling
// ============================================

"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  useOptionalServiceContext,
  resolvePlaceholders,
} from "@/lib/page-builder/contexts/service-context";
import type { ServiceHeroWidgetSettings } from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { ServiceIcon } from "@/components/ui/service-icon";
import { getCurrencySymbol } from "@/components/ui/currency-selector";
import { StyledButton } from "@/components/ui/styled-button";

// ============================================
// DEFAULT SETTINGS
// ============================================

const DEFAULT_SETTINGS: ServiceHeroWidgetSettings = {
  // Content Source
  titleSource: "auto",
  subtitleSource: "auto",

  // Category Badge
  showCategoryBadge: false,
  categoryBadgeTag: "Most Popular",

  // Price Badge
  showPriceBadge: true,
  priceBadgeText: "From ${{service.startingPrice}}",

  // Price Hero
  showPriceHero: false,

  // Primary Button
  primaryButton: {
    show: true,
    text: "Get Started — ${{service.startingPrice}} + State Fee",
    link: "/checkout/{{service.slug}}",
    badge: undefined,
    style: undefined,
    openInNewTab: false,
  },

  // Secondary Button
  secondaryButton: {
    show: true,
    text: "Book Free Consultation",
    link: "/contact",
    badge: undefined,
    style: undefined,
    openInNewTab: false,
  },

  // Trust Items
  showTrustItems: false,
  trustItems: [
    { text: "Filing accuracy guaranteed" },
    { text: "Filed in 24 hours" },
    { text: "100% remote" },
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
    primaryButton: { ...DEFAULT_SETTINGS.primaryButton, ...partialSettings?.primaryButton },
    secondaryButton: { ...DEFAULT_SETTINGS.secondaryButton, ...partialSettings?.secondaryButton },
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

  // Auto mode: use service.heroTitle if set, otherwise service.name; subtitle always from shortDesc
  const title =
    settings.titleSource === "auto"
      ? (service.heroTitle || service.name)
      : settings.customTitle || service.name;

  const subtitle =
    settings.subtitleSource === "auto"
      ? service.shortDesc
      : settings.customSubtitle || service.shortDesc;

  const priceBadgeText = resolvePlaceholders(settings.priceBadgeText, service);
  const trustItems = settings.trustItems || [];

  // Build title with visual effects (supports multi-word phrases)
  // Auto mode: use service-level highlight/underline words, widget settings override
  const renderTitle = () => {
    const highlightPhrase = (settings.titleHighlightWord || service.heroHighlightWord)?.trim();
    const underlinePhrase = (settings.titleUnderlineWord || service.heroUnderlineWord)?.trim();

    if (!highlightPhrase && !underlinePhrase) {
      return <>{title}</>;
    }

    // Build regex to split by highlight and underline phrases
    const patterns: string[] = [];
    if (highlightPhrase) patterns.push(highlightPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (underlinePhrase) patterns.push(underlinePhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${patterns.join("|")})`, "gi");
    const parts = title.split(regex);

    return (
      <>
        {parts.map((part, i) => {
          if (highlightPhrase && part.toLowerCase() === highlightPhrase.toLowerCase()) {
            return (
              <span key={i} style={{ color: "var(--sh-forest, #1b3a2d)" }}>
                {part}
              </span>
            );
          }
          if (underlinePhrase && part.toLowerCase() === underlinePhrase.toLowerCase()) {
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

  return (
    <WidgetContainer container={settings.container}>
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

        {/* Service Icon (when no category badge) */}
        {!settings.showCategoryBadge && service.icon && (
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ServiceIcon name={service.icon} className="h-8 w-8" />
          </div>
        )}

        {/* Price Badge */}
        {settings.showPriceBadge && (
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {priceBadgeText}
          </span>
        )}

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-heading)",
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
                fontFamily: "var(--font-heading)",
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
          {settings.primaryButton.show && (
            <StyledButton
              style={settings.primaryButton.style}
              as="link"
              href={resolvePlaceholders(settings.primaryButton.link, service)}
              openInNewTab={settings.primaryButton.openInNewTab}
              size="lg"
            >
              {resolvePlaceholders(settings.primaryButton.text, service)}
            </StyledButton>
          )}
          {settings.secondaryButton.show && (
            <StyledButton
              style={settings.secondaryButton.style}
              as="link"
              href={resolvePlaceholders(settings.secondaryButton.link, service)}
              openInNewTab={settings.secondaryButton.openInNewTab}
              size="lg"
            >
              {resolvePlaceholders(settings.secondaryButton.text, service)}
            </StyledButton>
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
    </WidgetContainer>
  );
}

// ============================================
// PLACEHOLDER FOR ADMIN PREVIEW
// ============================================

function ServiceHeroPlaceholder({ settings }: { settings: ServiceHeroWidgetSettings }) {
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

      {/* Service Icon placeholder */}
      {!settings.showCategoryBadge && (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="text-2xl">🏢</span>
        </div>
      )}

      {/* Price Badge */}
      {settings.showPriceBadge && (
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
          {settings.priceBadgeText || "From $199"}
        </span>
      )}

      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#0e1109", marginBottom: "20px" }}>
        {settings.titleSource === "custom" && settings.customTitle ? settings.customTitle : "{{service.name}}"}
      </h1>
      <p style={{ fontSize: "17px", color: "#4b5249", lineHeight: 1.75, maxWidth: "520px", marginBottom: "28px" }}>
        {settings.subtitleSource === "custom" && settings.customSubtitle ? settings.customSubtitle : "{{service.shortDesc}}"}
      </p>

      {/* CTA Buttons */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "32px" }}>
        {settings.primaryButton.show && (
          <StyledButton
            style={settings.primaryButton.style}
            as="link"
            href="#"
            isPreview={true}
            size="lg"
          >
            {settings.primaryButton.text}
          </StyledButton>
        )}
        {settings.secondaryButton.show && (
          <StyledButton
            style={settings.secondaryButton.style}
            as="link"
            href="#"
            isPreview={true}
            size="lg"
          >
            {settings.secondaryButton.text}
          </StyledButton>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2">Preview — service data loads dynamically</p>
    </section>
  );
}
