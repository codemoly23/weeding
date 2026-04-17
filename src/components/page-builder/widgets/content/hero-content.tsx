"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import { ArrowRight, ArrowUpRight, Star, CheckCircle, Search as SearchIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroContentWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_HERO_CONTENT_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// Button style utilities
import {
  getNormalBackground,
  getHoverBackground,
  getGradientShiftBackground,
  getHoverEffectClass,
  isComplexHoverEffect,
  isCraftButtonEffect,
  isFlowButtonEffect,
  isNeuralButtonEffect,
  getComplexEffectHoverStyles,
  getComplexEffectNormalStyles,
  hasCustomStyle,
} from "@/lib/button-utils";
import { renderButtonIcon } from "@/lib/button-icon-utils";
import { CRAFT_BG_DARK, WHITE, ORANGE_PRIMARY } from "@/lib/button-constants";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";

interface HeroContentWidgetProps {
  settings: HeroContentWidgetSettings;
  isPreview?: boolean;
}

// Get Lucide icon component by name
// Converts input to PascalCase to match Lucide React naming convention
function getLucideIcon(
  name: string
): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  >;

  // Try exact match first
  if (icons[name]) return icons[name];

  // Convert to PascalCase (airplay -> Airplay, check-circle -> CheckCircle)
  const toPascalCase = (str: string) => {
    return str
      .split(/[-_\s]+/) // Split by hyphen, underscore, or space
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  };

  const pascalName = toPascalCase(name);
  return icons[pascalName] || CheckCircle;
}

export function HeroContentWidget({ settings: rawSettings, isPreview = false }: HeroContentWidgetProps) {
  // Deep merge with defaults to guarantee all properties exist
  // Wrapped in useMemo to stabilize object reference (Rule 1 & 5)
  const settings: HeroContentWidgetSettings = useMemo(() => ({
    ...DEFAULT_HERO_CONTENT_SETTINGS,
    ...rawSettings,
    badge: { ...DEFAULT_HERO_CONTENT_SETTINGS.badge, ...rawSettings.badge },
    headline: { ...DEFAULT_HERO_CONTENT_SETTINGS.headline, ...rawSettings.headline },
    subheadline: { ...DEFAULT_HERO_CONTENT_SETTINGS.subheadline, ...rawSettings.subheadline },
    features: {
      ...DEFAULT_HERO_CONTENT_SETTINGS.features,
      ...rawSettings.features,
      items: rawSettings.features?.items ?? DEFAULT_HERO_CONTENT_SETTINGS.features.items,
    },
    primaryButton: { ...DEFAULT_HERO_CONTENT_SETTINGS.primaryButton, ...rawSettings.primaryButton },
    secondaryButton: { ...DEFAULT_HERO_CONTENT_SETTINGS.secondaryButton, ...rawSettings.secondaryButton },
    trustText: { ...DEFAULT_HERO_CONTENT_SETTINGS.trustText, ...rawSettings.trustText },
    avatarGroup: {
      ...DEFAULT_HERO_CONTENT_SETTINGS.avatarGroup!,
      ...rawSettings.avatarGroup,
      avatars: rawSettings.avatarGroup?.avatars ?? DEFAULT_HERO_CONTENT_SETTINGS.avatarGroup!.avatars,
    },
    spacing: { ...rawSettings.spacing },
    search: rawSettings.search
      ? { ...DEFAULT_HERO_CONTENT_SETTINGS.search, ...rawSettings.search }
      : DEFAULT_HERO_CONTENT_SETTINGS.search,
  }), [rawSettings]);

  // Search bar state + submit handler
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isPreview) return;
      const q = searchValue.trim();
      const action = settings.search?.action || "blog";
      let target = "";
      if (action === "blog") target = `/blog${q ? `?q=${encodeURIComponent(q)}` : ""}`;
      else if (action === "services") target = `/services${q ? `?q=${encodeURIComponent(q)}` : ""}`;
      else if (action === "custom-url") {
        const base = settings.search?.customUrl || "/search?q=";
        target = `${base}${q ? encodeURIComponent(q) : ""}`;
      }
      if (target) router.push(target);
    },
    [searchValue, settings.search, router, isPreview]
  );

  // Theme-aware accent color
  const useTheme = rawSettings.colors?.useTheme !== false;
  const accentColor = useTheme ? "var(--color-primary)" : undefined;
  const accentBgLight = useTheme ? "color-mix(in srgb, var(--color-primary) 10%, transparent)" : undefined;
  const accentBorder = useTheme ? "color-mix(in srgb, var(--color-primary) 30%, transparent)" : undefined;

  // Helper to check if color is hex
  const isCssColor = (color?: string) =>
    color?.startsWith("#") || color?.startsWith("rgb") || color?.startsWith("hsl") || color?.startsWith("var(");
  // Keep isHexColor as alias for backward compat within this file
  const isHexColor = isCssColor;

  // Parse underline words list
  const underlineWords = settings.headline.underlineWords
    ? settings.headline.underlineWords.split(",").map((w) => w.trim()).filter(Boolean)
    : [];
  const underlineColor = settings.headline.underlineColor || "#e84c1e";

  // Parse headline with highlight words and underline words (supports comma-separated)
  const renderHeadline = () => {
    const { text, highlightWords, highlightColor } = settings.headline;

    // Collect all special words (highlight + underline)
    const highlightList = highlightWords
      ? highlightWords.split(",").map((w) => w.trim()).filter(Boolean)
      : [];
    const allSpecialWords = [...new Set([...highlightList, ...underlineWords])];

    // Process text: handle \n as line breaks
    const processLineBreaks = (content: string) => {
      if (!content.includes("\\n")) return content;
      return content.split("\\n").map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ));
    };

    if (allSpecialWords.length === 0) {
      return processLineBreaks(text);
    }

    // Create regex pattern
    const pattern = new RegExp(
      `(${allSpecialWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "gi"
    );
    const parts = text.split(pattern);

    return (
      <>
        {parts.map((part, index) => {
          const isHighlight = highlightList.some(
            (word) => word.toLowerCase() === part.toLowerCase()
          );
          const isUnderline = underlineWords.some(
            (word) => word.toLowerCase() === part.toLowerCase()
          );

          if (isHighlight || isUnderline) {
            const effectiveHighlightColor = isHighlight
              ? (accentColor ?? highlightColor)
              : undefined;
            return (
              <span
                key={index}
                className={cn(
                  isUnderline && "relative inline-block",
                  isHighlight && !isHexColor(effectiveHighlightColor) && !effectiveHighlightColor?.startsWith("var(") ? effectiveHighlightColor : undefined,
                )}
                style={{
                  ...(isHighlight && (isHexColor(effectiveHighlightColor) || effectiveHighlightColor?.startsWith("var("))
                    ? { color: effectiveHighlightColor }
                    : {}),
                }}
              >
                {processLineBreaks(part)}
                {isUnderline && (
                  <span
                    className="absolute left-0 right-0"
                    style={{
                      bottom: "-4px",
                      height: "6px",
                      background: underlineColor,
                      borderRadius: "3px",
                      opacity: 0.7,
                    }}
                  />
                )}
              </span>
            );
          }
          return <span key={index}>{processLineBreaks(part)}</span>;
        })}
      </>
    );
  };

  // Get headline size class
  const getHeadlineSize = () => {
    switch (settings.headline.size) {
      case "sm":
        return "text-2xl sm:text-3xl";
      case "md":
        return "text-3xl sm:text-4xl";
      case "lg":
        return "text-3xl sm:text-4xl lg:text-5xl";
      case "xl":
        return "text-4xl sm:text-5xl lg:text-6xl";
      case "2xl":
        return "text-5xl sm:text-6xl lg:text-7xl";
      default:
        return "text-3xl sm:text-4xl lg:text-5xl";
    }
  };

  // Get alignment class
  const getAlignmentClass = () => {
    switch (settings.alignment) {
      case "center":
        return "items-center text-center";
      case "right":
        return "items-end text-right";
      default:
        return "items-start text-left";
    }
  };

  // Render primary button with custom styles
  const renderPrimaryButton = () => {
    const btnStyle = settings.primaryButton.style;
    const hasCustom = hasCustomStyle(btnStyle);

    // If custom style with CraftButton effect
    if (hasCustom && btnStyle && isCraftButtonEffect(btnStyle.hoverEffect)) {
      const craftIcon = btnStyle.icon && btnStyle.icon !== "none"
        ? renderButtonIcon(btnStyle, "size-3 stroke-2")
        : <ArrowUpRight className="size-3 stroke-2" />;

      return (
        <CraftButton
          asChild
          bgColor={btnStyle.bgColor || CRAFT_BG_DARK}
          textColor={btnStyle.textColor || WHITE}
          style={{ boxShadow: btnStyle.shadow }}
        >
          <SmartLink
            href={settings.primaryButton.link}
            openInNewTab={settings.primaryButton.openInNewTab}
          >
            <CraftButtonLabel>
              {settings.primaryButton.text}
              {settings.primaryButton.badge && (
                <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
              )}
            </CraftButtonLabel>
            <CraftButtonIcon>{craftIcon}</CraftButtonIcon>
          </SmartLink>
        </CraftButton>
      );
    }

    // FlowButton effect
    if (hasCustom && btnStyle && isFlowButtonEffect(btnStyle.hoverEffect)) {
      return (
        <PrimaryFlowButton
          asChild
          size="lg"
          ringColor={btnStyle.bgColor || ORANGE_PRIMARY}
        >
          <SmartLink
            href={settings.primaryButton.link}
            openInNewTab={settings.primaryButton.openInNewTab}
          >
            {settings.primaryButton.text}
            {settings.primaryButton.badge && (
              <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
            )}
          </SmartLink>
        </PrimaryFlowButton>
      );
    }

    // NeuralButton effect
    if (hasCustom && btnStyle && isNeuralButtonEffect(btnStyle.hoverEffect)) {
      return (
        <NeuralButton asChild>
          <SmartLink
            href={settings.primaryButton.link}
            openInNewTab={settings.primaryButton.openInNewTab}
          >
            {settings.primaryButton.text}
            {settings.primaryButton.badge && (
              <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
            )}
          </SmartLink>
        </NeuralButton>
      );
    }

    // Custom styled button (non-special effects)
    if (hasCustom && btnStyle) {
      const hoverClass = getHoverEffectClass(btnStyle.hoverEffect);
      const normalBg = getNormalBackground(btnStyle);
      const hoverBg = getHoverBackground(btnStyle);
      const hasComplex = isComplexHoverEffect(btnStyle.hoverEffect);
      const complexHoverStyles = hasComplex ? getComplexEffectHoverStyles(btnStyle) : {};
      const complexNormalStyles = hasComplex ? getComplexEffectNormalStyles(btnStyle) : {};

      const getBackground = (isHover: boolean) => {
        if (btnStyle.hoverEffect === "gradient-shift") {
          return getGradientShiftBackground(btnStyle);
        }
        if (btnStyle.hoverEffect === "slide-fill" || btnStyle.hoverEffect === "border-fill") {
          return normalBg;
        }
        return isHover ? hoverBg : normalBg;
      };

      return (
        <SmartLink
          href={settings.primaryButton.link}
          openInNewTab={settings.primaryButton.openInNewTab}
          className={cn(
            "inline-flex items-center justify-center gap-2 text-[15px] font-semibold font-display overflow-hidden whitespace-nowrap",
            hoverClass,
            hasComplex ? "transition-all duration-500 ease-out" : "transition-all duration-220 ease-out"
          )}
          style={{
            padding: "16px 34px",
            background: getBackground(false),
            color: btnStyle.textColor || "#ffffff",
            borderWidth: `${btnStyle.borderWidth ?? 0}px`,
            borderStyle: "solid",
            borderColor: btnStyle.borderColor || btnStyle.bgColor || ORANGE_PRIMARY,
            borderRadius: `${btnStyle.borderRadius ?? 10}px`,
            ...(hasComplex ? complexNormalStyles : { boxShadow: btnStyle.shadow }),
          }}
          onMouseEnter={(e) => {
            if (isPreview) return;
            e.currentTarget.style.transform = "translateY(-2px)";
            if (hasComplex) {
              if (complexHoverStyles.boxShadow) {
                e.currentTarget.style.boxShadow = complexHoverStyles.boxShadow;
              }
              if (complexHoverStyles.backgroundPosition) {
                e.currentTarget.style.backgroundPosition = complexHoverStyles.backgroundPosition;
              }
              if (!btnStyle.hoverEffect || btnStyle.hoverEffect === "ripple") {
                e.currentTarget.style.background = hoverBg;
              }
            } else {
              e.currentTarget.style.background = hoverBg;
              if (btnStyle.hoverShadow) {
                e.currentTarget.style.boxShadow = btnStyle.hoverShadow;
              }
            }
            if (btnStyle.hoverTextColor) {
              e.currentTarget.style.color = btnStyle.hoverTextColor;
            }
            if (btnStyle.hoverBorderColor) {
              e.currentTarget.style.borderColor = btnStyle.hoverBorderColor;
            }
          }}
          onMouseLeave={(e) => {
            if (isPreview) return;
            e.currentTarget.style.transform = "";
            if (hasComplex) {
              if (complexNormalStyles.boxShadow !== undefined) {
                e.currentTarget.style.boxShadow = complexNormalStyles.boxShadow;
              }
              if (complexNormalStyles.backgroundPosition) {
                e.currentTarget.style.backgroundPosition = complexNormalStyles.backgroundPosition;
              }
            } else {
              e.currentTarget.style.background = normalBg;
              e.currentTarget.style.boxShadow = btnStyle.shadow || "";
            }
            e.currentTarget.style.color = btnStyle.textColor || "#ffffff";
            e.currentTarget.style.borderColor = btnStyle.borderColor || btnStyle.bgColor || ORANGE_PRIMARY;
          }}
        >
          {btnStyle.iconPosition === "left" && renderButtonIcon(btnStyle)}
          <span>
            {settings.primaryButton.text}
            {settings.primaryButton.badge && (
              <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
            )}
          </span>
          {btnStyle.iconPosition !== "left" && renderButtonIcon(btnStyle)}
        </SmartLink>
      );
    }

    // Default button (no custom style)
    return (
      <Button
        size="lg"
        className={cn(
          "group/btn w-full sm:w-auto bg-orange-500",
          !isPreview && "hover:bg-orange-600"
        )}
        asChild
      >
        <SmartLink
          href={settings.primaryButton.link}
          openInNewTab={settings.primaryButton.openInNewTab}
        >
          {settings.primaryButton.text}
          {settings.primaryButton.badge && (
            <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
          )}
          <ArrowRight
            className={cn(
              "ml-2 h-4 w-4",
              !isPreview && "transition-transform group-hover/btn:translate-x-1"
            )}
          />
        </SmartLink>
      </Button>
    );
  };

  // Render secondary button with custom styles
  const renderSecondaryButton = () => {
    const btnStyle = settings.secondaryButton.style;
    const hasCustom = hasCustomStyle(btnStyle);

    // CraftButton effect
    if (hasCustom && btnStyle && isCraftButtonEffect(btnStyle.hoverEffect)) {
      const craftIcon = btnStyle.icon && btnStyle.icon !== "none"
        ? renderButtonIcon(btnStyle, "size-3 stroke-2")
        : <ArrowUpRight className="size-3 stroke-2" />;

      return (
        <CraftButton
          asChild
          bgColor={btnStyle.bgColor || CRAFT_BG_DARK}
          textColor={btnStyle.textColor || WHITE}
          style={{ boxShadow: btnStyle.shadow }}
        >
          <SmartLink
            href={settings.secondaryButton.link}
            openInNewTab={settings.secondaryButton.openInNewTab}
          >
            <CraftButtonLabel>
              {settings.secondaryButton.text}
              {settings.secondaryButton.badge && (
                <span className="ml-2 text-xs opacity-80">{settings.secondaryButton.badge}</span>
              )}
            </CraftButtonLabel>
            <CraftButtonIcon>{craftIcon}</CraftButtonIcon>
          </SmartLink>
        </CraftButton>
      );
    }

    // FlowButton effect
    if (hasCustom && btnStyle && isFlowButtonEffect(btnStyle.hoverEffect)) {
      return (
        <PrimaryFlowButton
          asChild
          size="lg"
          ringColor={btnStyle.bgColor || ORANGE_PRIMARY}
        >
          <SmartLink
            href={settings.secondaryButton.link}
            openInNewTab={settings.secondaryButton.openInNewTab}
          >
            {settings.secondaryButton.text}
            {settings.secondaryButton.badge && (
              <span className="ml-2 text-xs opacity-80">{settings.secondaryButton.badge}</span>
            )}
          </SmartLink>
        </PrimaryFlowButton>
      );
    }

    // NeuralButton effect
    if (hasCustom && btnStyle && isNeuralButtonEffect(btnStyle.hoverEffect)) {
      return (
        <NeuralButton asChild>
          <SmartLink
            href={settings.secondaryButton.link}
            openInNewTab={settings.secondaryButton.openInNewTab}
          >
            {settings.secondaryButton.text}
            {settings.secondaryButton.badge && (
              <span className="ml-2 text-xs opacity-80">{settings.secondaryButton.badge}</span>
            )}
          </SmartLink>
        </NeuralButton>
      );
    }

    // Custom styled button (non-special effects)
    if (hasCustom && btnStyle) {
      const hoverClass = getHoverEffectClass(btnStyle.hoverEffect);
      const normalBg = getNormalBackground(btnStyle);
      const hoverBg = getHoverBackground(btnStyle);
      const hasComplex = isComplexHoverEffect(btnStyle.hoverEffect);
      const complexHoverStyles = hasComplex ? getComplexEffectHoverStyles(btnStyle) : {};
      const complexNormalStyles = hasComplex ? getComplexEffectNormalStyles(btnStyle) : {};

      const getBackground = (hover: boolean) => {
        if (btnStyle.hoverEffect === "gradient-shift") {
          return getGradientShiftBackground(btnStyle);
        }
        if (btnStyle.hoverEffect === "slide-fill" || btnStyle.hoverEffect === "border-fill") {
          return normalBg;
        }
        return hover ? hoverBg : normalBg;
      };

      return (
        <SmartLink
          href={settings.secondaryButton.link}
          openInNewTab={settings.secondaryButton.openInNewTab}
          className={cn(
            "inline-flex items-center justify-center gap-2 text-[15px] font-semibold font-display overflow-hidden whitespace-nowrap",
            hoverClass,
            hasComplex ? "transition-all duration-500 ease-out" : "transition-all duration-220 ease-out"
          )}
          style={{
            padding: "16px 34px",
            background: getBackground(false),
            color: btnStyle.textColor || "#ffffff",
            borderWidth: `${btnStyle.borderWidth ?? 1.5}px`,
            borderStyle: "solid",
            borderColor: btnStyle.borderColor || "rgba(14,17,9,0.1)",
            borderRadius: `${btnStyle.borderRadius ?? 10}px`,
            ...(hasComplex ? complexNormalStyles : { boxShadow: btnStyle.shadow }),
          }}
          onMouseEnter={(e) => {
            if (isPreview) return;
            if (hasComplex) {
              if (complexHoverStyles.boxShadow) {
                e.currentTarget.style.boxShadow = complexHoverStyles.boxShadow;
              }
              if (complexHoverStyles.backgroundPosition) {
                e.currentTarget.style.backgroundPosition = complexHoverStyles.backgroundPosition;
              }
              if (!btnStyle.hoverEffect || btnStyle.hoverEffect === "ripple") {
                e.currentTarget.style.background = hoverBg;
              }
            } else {
              if (hoverBg) e.currentTarget.style.background = hoverBg;
              if (btnStyle.hoverShadow) {
                e.currentTarget.style.boxShadow = btnStyle.hoverShadow;
              }
            }
            if (btnStyle.hoverTextColor) {
              e.currentTarget.style.color = btnStyle.hoverTextColor;
            }
            if (btnStyle.hoverBorderColor) {
              e.currentTarget.style.borderColor = btnStyle.hoverBorderColor;
            }
          }}
          onMouseLeave={(e) => {
            if (isPreview) return;
            if (hasComplex) {
              if (complexNormalStyles.boxShadow !== undefined) {
                e.currentTarget.style.boxShadow = complexNormalStyles.boxShadow;
              }
              if (complexNormalStyles.backgroundPosition) {
                e.currentTarget.style.backgroundPosition = complexNormalStyles.backgroundPosition;
              }
            } else {
              e.currentTarget.style.background = normalBg;
              e.currentTarget.style.boxShadow = btnStyle.shadow || "";
            }
            e.currentTarget.style.color = btnStyle.textColor || "#ffffff";
            e.currentTarget.style.borderColor = btnStyle.borderColor || "rgba(14,17,9,0.1)";
          }}
        >
          {btnStyle.iconPosition === "left" && renderButtonIcon(btnStyle)}
          <span>
            {settings.secondaryButton.text}
            {settings.secondaryButton.badge && (
              <span className="ml-2 text-xs opacity-80">{settings.secondaryButton.badge}</span>
            )}
          </span>
          {btnStyle.iconPosition !== "left" && renderButtonIcon(btnStyle)}
        </SmartLink>
      );
    }

    // Default button (no custom style) - outline style
    return (
      <Button
        size="lg"
        variant="outline"
        className={cn(
          "w-full sm:w-auto border-white/20 text-white",
          !isPreview && "hover:bg-white/10"
        )}
        asChild
      >
        <SmartLink
          href={settings.secondaryButton.link}
          openInNewTab={settings.secondaryButton.openInNewTab}
        >
          {settings.secondaryButton.text}
          {settings.secondaryButton.badge && (
            <span className="ml-2 text-xs opacity-80">{settings.secondaryButton.badge}</span>
          )}
        </SmartLink>
      </Button>
    );
  };

  return (
    <WidgetContainer container={settings.container}>
    <div className={cn("flex flex-col", getAlignmentClass())}>
      {/* Badge */}
      {settings.badge.show && (
        <div
          data-field-id="badge"
          className={cn(
            "w-fit inline-flex items-center gap-2 font-medium text-[13px] border font-display",
            settings.badge.style === "pill" && "rounded-full",
            settings.badge.style === "outline" && "bg-transparent",
            settings.badge.style === "solid" && "rounded-md"
          )}
          style={{
            padding: settings.badge.dot?.show ? "6px 14px 6px 8px" : "6px 14px",
            backgroundColor:
              settings.badge.style === "outline"
                ? "transparent"
                : (accentBgLight || settings.badge.bgColor || "#f9731933"),
            color: accentColor || settings.badge.textColor || "#fb923c",
            borderColor: accentBorder || settings.badge.borderColor || "#f9731980",
            borderWidth: settings.badge.style === "outline" ? "2px" : "1px",
            boxShadow: settings.badge.boxShadow,
            marginBottom: settings.spacing?.badgeToHeadline ? `${settings.spacing.badgeToHeadline}px` : undefined,
          }}
        >
          {/* Pulsing dot indicator */}
          {settings.badge.dot?.show && (
            <span
              className="shrink-0 rounded-full"
              style={{
                width: 8,
                height: 8,
                background: settings.badge.dot.color || "#e84c1e",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
          )}
          {/* Lucide icon */}
          {settings.badge.icon && !settings.badge.dot?.show && (
            (() => {
              const Icon = getLucideIcon(settings.badge.icon);
              return <Icon className="h-4 w-4" />;
            })()
          )}
          {settings.badge.text}
        </div>
      )}

      {/* Headline */}
      <h1
        data-field-id="headline"
        className={cn(
          !settings.headline.fontWeight && "font-bold",
          !settings.headline.letterSpacing && "tracking-tight",
          !settings.headline.customFontSize && getHeadlineSize(),
          !isHexColor(settings.headline.color) && (settings.headline.color || "text-white")
        )}
        style={{
          ...(isHexColor(settings.headline.color) ? { color: settings.headline.color } : {}),
          ...(settings.headline.customFontSize ? { fontSize: settings.headline.customFontSize } : {}),
          ...(settings.headline.fontWeight ? { fontWeight: settings.headline.fontWeight } : {}),
          ...(settings.headline.letterSpacing ? { letterSpacing: settings.headline.letterSpacing } : {}),
          ...(settings.headline.lineHeight ? { lineHeight: settings.headline.lineHeight } : {}),
          marginBottom: settings.spacing?.headlineToSub ? `${settings.spacing.headlineToSub}px` : undefined,
        }}
      >
        {renderHeadline()}
      </h1>

      {/* Subheadline */}
      {settings.subheadline.show && (
        <p
          data-field-id="subheadline"
          className={cn(
            settings.subheadline.size === "sm" && "text-base",
            settings.subheadline.size === "md" && "text-lg",
            settings.subheadline.size === "lg" && "text-lg sm:text-xl",
            !isHexColor(settings.subheadline.color) && (settings.subheadline.color || "text-slate-400")
          )}
          style={{
            ...(isHexColor(settings.subheadline.color) ? { color: settings.subheadline.color } : {}),
            ...(settings.subheadline.lineHeight ? { lineHeight: settings.subheadline.lineHeight } : {}),
            ...(settings.subheadline.maxWidth ? { maxWidth: `${settings.subheadline.maxWidth}px` } : {}),
            marginBottom: settings.spacing?.subToButtons ? `${settings.spacing.subToButtons}px` : undefined,
          }}
        >
          {/<[a-z][\s\S]*>/i.test(settings.subheadline.text)
            ? <span dangerouslySetInnerHTML={{ __html: settings.subheadline.text }} />
            : settings.subheadline.text}
        </p>
      )}

      {/* Search Bar (optional) */}
      {settings.search?.enabled && (
        <form
          data-field-id="search"
          onSubmit={handleSearchSubmit}
          className={cn(
            "w-full flex items-stretch gap-2 mt-2 mb-4 border border-solid",
            settings.search.variant === "pill" && "rounded-full",
            settings.search.variant === "rounded" && "rounded-xl",
            settings.search.variant === "square" && "rounded-md"
          )}
          style={{
            maxWidth: settings.search.maxWidth ? `${settings.search.maxWidth}px` : "560px",
            background: settings.search.bgColor || "#ffffff",
            borderColor: searchFocused
              ? (accentColor || "#f97316")
              : (settings.search.borderColor || "#e2e8f0"),
            transition: "border-color 250ms ease",
            padding: "6px",
            borderRadius:
              settings.search.variant === "pill" ? "9999px" :
              settings.search.variant === "square" ? "8px" : "14px",
          }}
        >
          <div className="flex items-center pl-3 text-slate-400">
            <SearchIcon className="h-4 w-4" />
          </div>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={settings.search.placeholder || "Search..."}
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
            style={{ color: settings.search.textColor || "#0f172a" }}
          />
          <button
            type="submit"
            className="font-display font-semibold text-sm px-5 py-2 transition-opacity hover:opacity-90"
            style={{
              background: settings.search.buttonBgColor || "#f97316",
              color: settings.search.buttonTextColor || "#ffffff",
              borderRadius:
                settings.search.variant === "pill" ? "9999px" :
                settings.search.variant === "square" ? "6px" : "10px",
            }}
          >
            {settings.search.buttonText || "Search"}
          </button>
        </form>
      )}

      {/* Features */}
      {settings.features.show && settings.features.items.length > 0 && (
        <div
          data-field-id="features"
          className={cn(
            settings.features.layout === "list"
              ? "flex flex-col gap-3"
              : cn(
                  "grid gap-3",
                  settings.features.columns === 1 && "grid-cols-1",
                  settings.features.columns === 2 && "grid-cols-1 sm:grid-cols-2",
                  settings.features.columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                  settings.features.columns === 4 && "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
                )
          )}
        >
          {settings.features.items.map((feature) => {
            const Icon = getLucideIcon(feature.icon);
            const iconPosition = settings.features.iconPosition || "left";
            return (
              <div
                key={feature.id}
                className={cn(
                  "flex items-center gap-3 text-sm text-slate-400",
                  iconPosition === "right" && "flex-row-reverse"
                )}
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  style={{ color: settings.features.iconColor || "#22c55e" }}
                />
                <span>{feature.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Buttons */}
      <div
        className={cn(
          "flex flex-col",
          settings.alignment === "center" ? "sm:flex-row sm:justify-center" : "sm:flex-row"
        )}
        style={{
          gap: settings.spacing?.buttonsGap ? `${settings.spacing.buttonsGap}px` : "16px",
          marginBottom: settings.spacing?.buttonsToProof ? `${settings.spacing.buttonsToProof}px` : undefined,
        }}
      >
        {settings.primaryButton.show && (
          <div data-field-id="primary-button">{renderPrimaryButton()}</div>
        )}

        {settings.secondaryButton.show && (
          <div data-field-id="secondary-button">{renderSecondaryButton()}</div>
        )}
      </div>

      {/* Trust Text */}
      {settings.trustText.show && (
        <div
          data-field-id="trust-text"
          className="flex items-center gap-2 text-sm"
          style={{ color: settings.trustText.textColor || "#9ca3af" }}
        >
          <div className="flex">
            {[...Array(5)].map((_, i) => {
              const starColor = settings.trustText.starColor || "#facc15";
              const isFilled = i < Math.floor(settings.trustText.rating);
              return (
                <Star
                  key={i}
                  className="h-4 w-4"
                  style={{
                    fill: isFilled ? starColor : "#475569",
                    color: isFilled ? starColor : "#475569",
                  }}
                />
              );
            })}
          </div>
          <span>{settings.trustText.text}</span>
        </div>
      )}

      {/* Avatar Group (Social Proof) */}
      {settings.avatarGroup?.show && (
        <div
          data-field-id="avatar-group"
          className={cn(
            "flex items-center gap-4 flex-wrap",
            settings.alignment === "center" && "justify-center",
            settings.alignment === "right" && "justify-end",
          )}
        >
          <div className="flex">
            {settings.avatarGroup.avatars.map((avatar, idx) => (
              <span
                key={avatar.id}
                className="flex items-center justify-center rounded-full text-xs font-bold text-white shrink-0 overflow-hidden"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: avatar.imageUrl ? "transparent" : avatar.color,
                  border: "2px solid var(--cream, #faf8f4)",
                  marginLeft: idx === 0 ? 0 : -10,
                  zIndex: settings.avatarGroup!.avatars.length - idx,
                  position: "relative",
                }}
              >
                {avatar.imageUrl ? (
                  <img
                    src={avatar.imageUrl}
                    alt={avatar.initials}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatar.initials
                )}
              </span>
            ))}
          </div>
          <div
            className="text-sm"
            style={{ color: settings.avatarGroup.textColor || "#4b5249" }}
            dangerouslySetInnerHTML={{ __html: settings.avatarGroup.text }}
          />
        </div>
      )}
    </div>
    </WidgetContainer>
  );
}
