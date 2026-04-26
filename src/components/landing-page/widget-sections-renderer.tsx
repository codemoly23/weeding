"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Section, Widget, SectionBackground, SectionWatermark } from "@/lib/page-builder/types";
import { DEFAULT_SECTION_BACKGROUND } from "@/lib/page-builder/defaults";
import { cn } from "@/lib/utils";
import { getLayoutGridClass, getColumnSpanClasses, getMaxWidthClass } from "@/lib/page-builder/section-layouts";
import { getPatternCSS, getPatternBackgroundSize } from "@/lib/page-builder/pattern-utils";
import {
  HeroContentWidget,
  ImageWidget,
  ImageSliderWidget,
  TrustBadgesWidget,
  StatsSectionWidget,
  DividerWidget,
  FaqAccordionWidget,
  ProcessStepsWidget,
  HeadingWidget,
  TextBlockWidget,
  LeadFormWidget,
  TestimonialsWidget,
  EventSearchHeroWidget,
  EventGalleryGridWidget,
  CtaBannerWidget,
  CustomHtmlWidget,
  FeaturesShowcaseWidget,
  TrendingVenuesWidget,
  TickerMarqueeWidget,
  SocialShareRailWidget,
} from "@/components/page-builder/widgets";
import { TopUtilityBarWidget, BreadcrumbWidget } from "@/components/page-builder/widgets/layout";
import { ServiceCardWidget, ServiceListWidget, PricingTableWidget, VendorListingWidget } from "@/components/page-builder/widgets/commerce";
import { ButtonGroupWidget, NewsletterCtaWidget } from "@/components/page-builder/widgets/cta";
import {
  ServiceHeroWidget,
  ServiceFeaturesWidget,
  ServiceDescriptionWidget,
  ServiceBreadcrumbWidget,
  RelatedServicesWidget,
} from "@/components/page-builder/widgets/service";
import {
  BlogPostGridWidget,
  BlogPostCarouselWidget,
  BlogFeaturedPostWidget,
  BlogPostListWidget,
  BlogRecentPostsWidget,
} from "@/components/page-builder/widgets/blog";

// Helper: Generate background styles from SectionBackground
function getBackgroundStyles(bg: SectionBackground): React.CSSProperties {
  const styles: React.CSSProperties = {};

  switch (bg.type) {
    case "solid":
      if (bg.color && bg.color !== "transparent") {
        styles.backgroundColor = bg.color;
      }
      break;

    case "gradient":
      if (bg.gradient && Array.isArray(bg.gradient.colors)) {
        const colorStops = bg.gradient.colors
          .map((c) => `${c.color} ${c.position}%`)
          .join(", ");
        if (bg.gradient.type === "linear") {
          styles.background = `linear-gradient(${bg.gradient.angle}deg, ${colorStops})`;
        } else {
          styles.background = `radial-gradient(circle, ${colorStops})`;
        }
      }
      break;

    case "image":
      if (bg.image?.url) {
        styles.backgroundImage = `url(${bg.image.url})`;
        styles.backgroundSize = bg.image.size || "cover";
        const positionMap: Record<string, string> = {
          "center": "center",
          "top": "top center",
          "bottom": "bottom center",
          "left": "center left",
          "right": "center right",
          "top-left": "top left",
          "top-right": "top right",
          "bottom-left": "bottom left",
          "bottom-right": "bottom right",
        };
        styles.backgroundPosition = positionMap[bg.image.position || "center"] || "center";
        styles.backgroundRepeat = bg.image.repeat || "no-repeat";
        if (bg.image.fixed) {
          styles.backgroundAttachment = "fixed";
        }
      }
      break;

    case "video":
      // Video is handled separately as a DOM element
      break;
  }

  return styles;
}

interface WidgetSectionsRendererProps {
  sections: Section[];
}

/**
 * Renders widget page builder sections on the public-facing site
 */
export function WidgetSectionsRenderer({ sections }: WidgetSectionsRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  // Filter out hidden sections and sections that are fully hoisted to layout (e.g. top-utility-bar)
  const HOISTED_WIDGET_TYPES = new Set(["top-utility-bar"]);
  const visibleSections = [...sections]
    .filter((s) => s.settings.isVisible !== false)
    .filter((s) => {
      const allWidgets = s.columns.flatMap((c) => c.widgets);
      return allWidgets.length === 0 || allWidgets.some((w) => !HOISTED_WIDGET_TYPES.has(w.type));
    })
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {visibleSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}

interface SectionRendererProps {
  section: Section;
}

// Widget types that render their own <section> with backgrounds — must be edge-to-edge
const FULL_BLEED_WIDGET_TYPES = new Set([
  "event-search-hero",
  "hero-content",
  "features-showcase",
  "trending-venues",
  "testimonials-carousel",
  "testimonial",
  "event-gallery-grid",
  "cta-banner",
]);

function isFullBleedSection(section: Section): boolean {
  const allWidgets = section.columns.flatMap((c) => c.widgets);
  return allWidgets.length > 0 && allWidgets.every((w) => FULL_BLEED_WIDGET_TYPES.has(w.type));
}

function SectionRenderer({ section }: SectionRendererProps) {
  const { layout, columns, settings } = section;
  const columnSpanClasses = getColumnSpanClasses(layout);
  const isFullBleed = isFullBleedSection(section);

  // Responsive visibility classes
  const visibilityClass = cn(
    settings.visibleOnMobile === false && "hidden md:block",
    settings.visibleOnDesktop === false && "md:hidden",
  );

  // Get background from new system, fallback to legacy
  const background: SectionBackground = settings.background || {
    ...DEFAULT_SECTION_BACKGROUND,
    type: "solid",
    color: settings.backgroundColor || "transparent",
  };

  const backgroundStyles = getBackgroundStyles(background);
  const overlay = background.overlay ?? settings.backgroundOverlay;
  const patternOverlay = background.patternOverlay;
  const borderRadius = settings.borderRadius ? `${settings.borderRadius}px` : undefined;

  const hasGradientBorder = settings.gradientBorder?.enabled && settings.gradientBorder.colors?.length >= 2;
  const innerBorderRadius = hasGradientBorder && settings.borderRadius
    ? Math.max(0, settings.borderRadius - (settings.gradientBorder!.width || 2))
    : settings.borderRadius;

  const customCSSClass = settings.customCSS ? `section-custom-${section.id}` : undefined;

  const sectionContent = (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        visibilityClass,
        settings.className,
        customCSSClass,
      )}
      style={{
        ...(settings.fullWidth ? backgroundStyles : {}),
        paddingTop: `${settings.paddingTop ?? 0}px`,
        paddingBottom: `${settings.paddingBottom ?? 0}px`,
        paddingLeft: isFullBleed ? 0 : `${settings.paddingLeft ?? 0}px`,
        paddingRight: isFullBleed ? 0 : `${settings.paddingRight ?? 0}px`,
        marginTop: `${settings.marginTop ?? 0}px`,
        marginBottom: `${settings.marginBottom ?? 0}px`,
        minHeight: settings.minHeight ? `${settings.minHeight}px` : undefined,
        borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
        isolation: settings.customCSS ? "isolate" : undefined,
      }}
    >
      {/* Custom CSS (scoped to this section, z-index sandboxed via isolation) */}
      {settings.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: `.section-custom-${section.id} { ${settings.customCSS} }` }} />
      )}
      {/* Video Background */}
      {background.type === "video" && background.video?.url && (
        <video
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ borderRadius }}
          src={background.video.url}
          poster={background.video.poster}
          muted={background.video.muted ?? true}
          loop={background.video.loop ?? true}
          autoPlay
          playsInline
        />
      )}

      {/* Color Overlay */}
      {overlay?.enabled && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundColor: overlay.color,
            opacity: overlay.opacity,
            borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
          }}
        />
      )}

      {/* Pattern Overlay */}
      {patternOverlay && patternOverlay.opacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: getPatternCSS(patternOverlay.type, patternOverlay.color, patternOverlay.opacity),
            backgroundSize: getPatternBackgroundSize(patternOverlay.type),
            borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
          }}
        />
      )}

      {/* Watermark Text Overlay */}
      {settings.watermark?.enabled && settings.watermark.text && (
        <WatermarkOverlay watermark={settings.watermark} />
      )}

      {/* Container */}
      <div
        className={cn(
          "relative z-[2]",
          isFullBleed ? "w-full" : cn("mx-auto", getMaxWidthClass(settings.maxWidth))
        )}
        style={!settings.fullWidth ? backgroundStyles : undefined}
      >

        {/* Grid */}
        <div
          className={cn("relative grid", getLayoutGridClass(layout))}
          style={{ gap: `${settings.gap}px` }}
        >
          {columns.map((column, index) => (
            <div
              key={column.id}
              className={cn(
                "flex flex-col",
                columnSpanClasses[index] || "col-span-12",
                column.settings?.verticalAlign === "center" && "justify-center",
                column.settings?.verticalAlign === "bottom" && "justify-end",
              )}
              style={{
                padding: column.settings?.padding ? `${column.settings.padding}px` : undefined,
                paddingTop: column.settings?.paddingTop ? `${column.settings.paddingTop}px` : undefined,
                paddingBottom: column.settings?.paddingBottom ? `${column.settings.paddingBottom}px` : undefined,
                paddingLeft: column.settings?.paddingLeft ? `${column.settings.paddingLeft}px` : undefined,
                paddingRight: column.settings?.paddingRight ? `${column.settings.paddingRight}px` : undefined,
                backgroundColor: column.settings?.backgroundColor,
              }}
            >
              {column.widgets.map((widget) => (
                <WidgetRenderer key={widget.id} widget={widget} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Wrap with gradient border if enabled
  if (hasGradientBorder) {
    const { colors, angle, width } = settings.gradientBorder!;
    return (
      <div
        style={{
          padding: `${width || 2}px`,
          background: `linear-gradient(${angle}deg, ${colors.join(", ")})`,
          borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : undefined,
        }}
      >
        {sectionContent}
      </div>
    );
  }

  return sectionContent;
}

function WatermarkOverlay({ watermark }: { watermark: SectionWatermark }) {
  const positionStyle: React.CSSProperties = {};

  if (watermark.position === "left") {
    positionStyle.left = `${watermark.offsetX}px`;
  } else if (watermark.position === "right") {
    positionStyle.right = `${watermark.offsetX}px`;
  } else {
    positionStyle.left = "50%";
    positionStyle.marginLeft = `${watermark.offsetX}px`;
  }

  return (
    <div
      className="absolute z-1 pointer-events-none select-none whitespace-nowrap hidden md:block"
      aria-hidden="true"
      style={{
        top: "50%",
        transform: `translateY(-50%) ${watermark.position === "center" ? "translateX(-50%)" : ""} rotate(${watermark.rotation}deg)`,
        marginTop: `${watermark.offsetY}px`,
        fontFamily: "var(--font-heading), sans-serif",
        fontSize: `${watermark.fontSize}px`,
        fontWeight: watermark.fontWeight,
        color: watermark.color,
        opacity: watermark.opacity,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        ...positionStyle,
      }}
    >
      {watermark.text}
    </div>
  );
}

// ── Widget Translation Resolver ─────────────────────────────────────────────
/**
 * Sets a deeply nested value in an object using dot-notation path.
 * Supports array indices: "steps.0.title"
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let current: unknown = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const next = (current as Record<string, unknown>)[key];
    if (typeof next !== "object" || next === null) return;
    current = next;
  }
  const lastKey = parts[parts.length - 1];
  (current as Record<string, unknown>)[lastKey] = value;
}

/**
 * Merges `settings._translations[lang]` (dot-notation map) into a deep clone
 * of settings, enabling per-widget multilingual content stored in the DB.
 *
 * Example widget settings:
 *   { title: "Hello", _translations: { sv: { "title": "Hej" } } }
 */
function resolveWidgetTranslations<T>(settings: T, lang: string): T {
  const s = settings as Record<string, unknown>;
  const translations = s?._translations as Record<string, Record<string, unknown>> | undefined;
  if (!translations || !translations[lang]) return settings;
  const resolved: Record<string, unknown> = JSON.parse(JSON.stringify(s));
  for (const [dotPath, value] of Object.entries(translations[lang])) {
    setNestedValue(resolved, dotPath, value);
  }
  return resolved as T;
}

interface WidgetRendererProps {
  widget: Widget<unknown>;
}

function WidgetRenderer({ widget }: WidgetRendererProps) {
  const { lang } = useLanguage();

  // Resolve per-widget translations from settings._translations[lang]
  const resolvedSettings = useMemo(
    () => resolveWidgetTranslations(widget.settings, lang),
    [widget.settings, lang]
  );

  // Get widget spacing styles
  const spacingStyles: React.CSSProperties = {
    marginTop: widget.spacing?.marginTop ? `${widget.spacing.marginTop}px` : undefined,
    marginBottom: widget.spacing?.marginBottom ? `${widget.spacing.marginBottom}px` : undefined,
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case "hero-content":
        return <HeroContentWidget settings={resolvedSettings as any} />;

      case "image":
        return <ImageWidget settings={resolvedSettings as any} />;

      case "trust-badges":
        return <TrustBadgesWidget settings={resolvedSettings as any} />;

      case "stats-section":
        return <StatsSectionWidget settings={resolvedSettings as any} />;

      case "divider":
        return <DividerWidget settings={resolvedSettings as any} />;

      case "image-slider":
        return <ImageSliderWidget settings={resolvedSettings as any} />;

      case "service-card":
        return <ServiceCardWidget settings={resolvedSettings as any} />;

      case "service-list":
        return <ServiceListWidget settings={resolvedSettings as any} />;

      case "process-steps":
        return <ProcessStepsWidget settings={resolvedSettings as any} />;

      case "pricing-table":
        return <PricingTableWidget settings={resolvedSettings as any} />;

      case "heading":
        return <HeadingWidget settings={resolvedSettings as any} />;

      case "text-block":
        return <TextBlockWidget settings={resolvedSettings as any} />;

      case "lead-form":
        return <LeadFormWidget settings={resolvedSettings as any} />;

      case "testimonial":
      case "testimonials-carousel":
        return <TestimonialsWidget settings={resolvedSettings as any} />;

      case "service-hero":
        return <ServiceHeroWidget settings={resolvedSettings as any} />;

      case "service-features":
        return <ServiceFeaturesWidget settings={resolvedSettings as any} />;

      case "service-description":
        return <ServiceDescriptionWidget settings={resolvedSettings as any} />;

      case "service-breadcrumb":
        return <ServiceBreadcrumbWidget settings={resolvedSettings as any} />;

      case "related-services":
        return <RelatedServicesWidget settings={resolvedSettings as any} />;

      case "faq":
      case "faq-section":
      case "faq-accordion":
        return <FaqAccordionWidget settings={resolvedSettings as any} />;

      case "custom-html":
        return <CustomHtmlWidget settings={resolvedSettings as any} />;

      case "button-group":
        return <ButtonGroupWidget settings={resolvedSettings as any} />;

      case "blog-post-grid":
        return <BlogPostGridWidget settings={resolvedSettings as any} />;

      case "blog-post-carousel":
        return <BlogPostCarouselWidget settings={resolvedSettings as any} />;

      case "blog-featured-post":
        return <BlogFeaturedPostWidget settings={resolvedSettings as any} />;

      case "blog-post-list":
        return <BlogPostListWidget settings={resolvedSettings as any} />;

      case "blog-recent-posts":
        return <BlogRecentPostsWidget settings={resolvedSettings as any} />;

      case "event-search-hero":
        return <EventSearchHeroWidget settings={resolvedSettings as any} />;

      case "event-gallery-grid":
        return <EventGalleryGridWidget settings={resolvedSettings as any} />;

      case "cta-banner":
        return <CtaBannerWidget settings={resolvedSettings as any} />;

      case "features-showcase":
        return <FeaturesShowcaseWidget settings={resolvedSettings as any} />;

      case "trending-venues":
        return <TrendingVenuesWidget settings={resolvedSettings as any} />;

      case "ticker-marquee":
        return <TickerMarqueeWidget settings={resolvedSettings as any} />;

      case "newsletter-cta":
        return <NewsletterCtaWidget settings={resolvedSettings as any} />;

      case "social-share-rail":
        return <SocialShareRailWidget settings={resolvedSettings as any} />;

      case "breadcrumb":
        return <BreadcrumbWidget settings={resolvedSettings as any} />;

      case "top-utility-bar":
        // Hoisted to layout — rendered above <Header /> in (marketing)/layout.tsx
        return null;

      case "vendor-listing":
        return <VendorListingWidget settings={resolvedSettings as any} />;

      default:
        // Unknown widget type - render nothing in production
        if (process.env.NODE_ENV === "development") {
          return (
            <div className="flex items-center justify-center bg-muted/50 py-8 text-sm text-muted-foreground rounded-lg">
              Unknown widget type: {widget.type}
            </div>
          );
        }
        return null;
    }
  };

  // Wrap with spacing if any margin is set
  if (widget.spacing?.marginTop || widget.spacing?.marginBottom) {
    return <div style={spacingStyles}>{renderWidgetContent()}</div>;
  }

  return renderWidgetContent();
}
