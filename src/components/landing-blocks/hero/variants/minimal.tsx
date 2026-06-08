"use client";

import { cn } from "@/lib/utils";
import type { HeroSettings } from "@/lib/landing-blocks/types";
import { HeroBackground } from "@/components/landing-blocks/shared";
import { StyledCTAButton } from "@/components/landing-blocks/hero/styled-cta-button";

interface HeroMinimalProps {
  settings: HeroSettings;
  isPreview?: boolean;
  device?: "desktop" | "mobile";
}

export function HeroMinimal({ settings, isPreview = false, device }: HeroMinimalProps) {
  const forceMobileLayout = device === "mobile";
  // Parse headline with highlight
  const renderHeadline = () => {
    if (!settings.headline.highlightWord) {
      return settings.headline.text;
    }

    const parts = settings.headline.text.split(settings.headline.highlightWord);
    if (parts.length === 1) {
      return settings.headline.text;
    }

    return (
      <>
        {parts[0]}
        <span className="text-orange-500">{settings.headline.highlightWord}</span>
        {parts[1]}
      </>
    );
  };

  const getHeadlineSize = () => {
    switch (settings.headline.size) {
      case "lg":
        return "text-3xl sm:text-4xl lg:text-5xl";
      case "2xl":
        return "text-5xl sm:text-6xl lg:text-7xl";
      default: // xl
        return "text-4xl sm:text-5xl lg:text-6xl";
    }
  };

  // Determine text colors based on background
  const isDarkBg = settings.background.type === "solid" &&
    (settings.background.color?.startsWith("#0") ||
     settings.background.color?.startsWith("#1") ||
     settings.background.color?.startsWith("#2"));

  const textColor = isDarkBg ? "text-white" : "text-slate-900";
  const subTextColor = isDarkBg ? "text-slate-400" : "text-slate-600";

  return (
    <HeroBackground settings={settings.background}>
      <div className={cn(
        "container mx-auto px-4",
        forceMobileLayout ? "py-16" : "py-16 lg:py-32"
      )}>
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <h1
            className={cn(
              "font-bold tracking-tight",
              textColor,
              getHeadlineSize()
            )}
          >
            {renderHeadline()}
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              "mt-6 text-base sm:text-lg lg:text-xl",
              subTextColor
            )}
          >
            {settings.subheadline.text}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <StyledCTAButton
              href={settings.primaryCTA.link}
              text={settings.primaryCTA.text}
              style={settings.primaryCTA.style}
              showPrice={settings.primaryCTA.showPrice}
              priceText={settings.primaryCTA.priceText}
              showArrow={true}
              variant={settings.primaryCTA.variant}
              isPreview={isPreview}
              openInNewTab={settings.primaryCTA.openInNewTab}
            />

            {settings.secondaryCTA.enabled && (
              <StyledCTAButton
                href={settings.secondaryCTA.link}
                text={settings.secondaryCTA.text}
                style={settings.secondaryCTA.style}
                showPrice={settings.secondaryCTA.showPrice}
                priceText={settings.secondaryCTA.priceText}
                showArrow={false}
                variant={settings.secondaryCTA.variant || "ghost"}
                isPreview={isPreview}
                openInNewTab={settings.secondaryCTA.openInNewTab}
              />
            )}
          </div>
        </div>
      </div>
    </HeroBackground>
  );
}
