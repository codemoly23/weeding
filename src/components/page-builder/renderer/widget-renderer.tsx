// ============================================
// WIDGET RENDERER
// Renders Page Builder widgets on the frontend
// ============================================

"use client";

import type { Widget, WidgetType } from "@/lib/page-builder/types";

// Content widgets
import { HeroContentWidget } from "../widgets/content/hero-content";
import { HeadingWidget } from "../widgets/content/heading-widget";
import { TextBlockWidget } from "../widgets/content/text-block-widget";
import { ProcessStepsWidget } from "../widgets/content/process-steps";
import { TickerMarqueeWidget } from "../widgets/content/ticker-marquee";
import { SocialShareRailWidget } from "../widgets/content/social-share-rail";
import { EventSearchHeroWidget } from "../widgets/content/event-search-hero-widget";
import { EventGalleryGridWidget } from "../widgets/content/event-gallery-grid-widget";
import { CtaBannerWidget } from "../widgets/content/cta-banner-widget";

// Media widgets
import { ImageWidget } from "../widgets/media/image-widget";
import { ImageSliderWidget } from "../widgets/media/image-slider-widget";

// Social proof widgets
import { TrustBadgesWidget } from "../widgets/social-proof/trust-badges";
import { StatsSectionWidget } from "../widgets/social-proof/stats-section";
import { TestimonialsWidget } from "../widgets/social-proof/testimonials-widget";

// Layout widgets
import { DividerWidget } from "../widgets/layout/divider-widget";
import { FaqAccordionWidget } from "../widgets/layout/faq-accordion-widget";
import { BreadcrumbWidget } from "../widgets/layout/breadcrumb-widget";
import { TopUtilityBarWidget } from "../widgets/layout/top-utility-bar-widget";

// Form + CTA widgets
import { LeadFormWidget } from "../widgets/forms/lead-form-widget";
import { ButtonGroupWidget } from "../widgets/cta/button-group-widget";
import { NewsletterCtaWidget } from "../widgets/cta/newsletter-cta-widget";

// Commerce widgets
import { PricingTableWidget } from "../widgets/commerce/pricing-table-widget";
import { ServiceCardWidget } from "../widgets/commerce/service-card-widget";
import { ServiceListWidget } from "../widgets/commerce/service-list-widget";
import { VendorListingWidget } from "../widgets/commerce/vendor-listing-widget";

// Service widgets
import { ServiceHeroWidget } from "../widgets/service/service-hero";
import { ServiceChecklistCardWidget } from "../widgets/service/service-checklist-card";
import { ServiceFeaturesWidget } from "../widgets/service/service-features";
import { ServiceDescriptionWidget } from "../widgets/service/service-description";
import { ServiceBreadcrumbWidget } from "../widgets/service/service-breadcrumb";
import { RelatedServicesWidget } from "../widgets/service/related-services";

// Blog widgets
import {
  BlogPostGridWidget,
  BlogPostCarouselWidget,
  BlogFeaturedPostWidget,
  BlogPostListWidget,
  BlogRecentPostsWidget,
  BlogPostHeroWidget,
  BlogPostContentWidget,
  BlogPostTocWidget,
  BlogPostAuthorCardWidget,
  BlogPostTagsWidget,
} from "../widgets/blog";

// Advanced
import { CustomHtmlWidget } from "../widgets/advanced/custom-html-widget";

// ============================================
// WIDGET COMPONENT MAP
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WIDGET_COMPONENTS: Partial<Record<WidgetType, React.ComponentType<any>>> = {
  // Content widgets
  "hero-content": HeroContentWidget,
  "heading": HeadingWidget,
  "text-block": TextBlockWidget,
  "process-steps": ProcessStepsWidget,
  "ticker-marquee": TickerMarqueeWidget,
  "social-share-rail": SocialShareRailWidget,
  "event-search-hero": EventSearchHeroWidget,
  "event-gallery-grid": EventGalleryGridWidget,
  "cta-banner": CtaBannerWidget,

  // Media widgets
  "image": ImageWidget,
  "image-slider": ImageSliderWidget,

  // Form widgets
  "lead-form": LeadFormWidget,

  // Social proof widgets
  "trust-badges": TrustBadgesWidget,
  "stats-section": StatsSectionWidget,
  "testimonial": TestimonialsWidget,
  "testimonials-carousel": TestimonialsWidget,

  // Commerce widgets
  "pricing-table": PricingTableWidget,
  "service-card": ServiceCardWidget,
  "service-list": ServiceListWidget,
  "vendor-listing": VendorListingWidget,

  // CTA widgets
  "button-group": ButtonGroupWidget,
  "newsletter-cta": NewsletterCtaWidget,

  // Layout widgets
  "divider": DividerWidget,
  "faq": FaqAccordionWidget,
  "faq-accordion": FaqAccordionWidget,
  "breadcrumb": BreadcrumbWidget,
  "top-utility-bar": TopUtilityBarWidget,

  // Service widgets
  "service-hero": ServiceHeroWidget,
  "service-checklist-card": ServiceChecklistCardWidget,
  "service-features": ServiceFeaturesWidget,
  "service-description": ServiceDescriptionWidget,
  "service-breadcrumb": ServiceBreadcrumbWidget,
  "related-services": RelatedServicesWidget,

  // Blog widgets
  "blog-post-grid": BlogPostGridWidget,
  "blog-post-carousel": BlogPostCarouselWidget,
  "blog-featured-post": BlogFeaturedPostWidget,
  "blog-post-list": BlogPostListWidget,
  "blog-recent-posts": BlogRecentPostsWidget,
  "blog-post-hero": BlogPostHeroWidget,
  "blog-post-content": BlogPostContentWidget,
  "blog-post-toc": BlogPostTocWidget,
  "blog-post-author-card": BlogPostAuthorCardWidget,
  "blog-post-tags": BlogPostTagsWidget,

  // Advanced widgets
  "custom-html": CustomHtmlWidget,
};

// ============================================
// WIDGET RENDERER
// ============================================

interface WidgetRendererProps {
  widget: Widget<unknown>;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const { type, settings, spacing } = widget;

  const WidgetComponent = WIDGET_COMPONENTS[type];

  if (!WidgetComponent) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="flex items-center justify-center bg-muted/50 py-8 text-sm text-muted-foreground rounded-lg border border-dashed border-muted-foreground/30">
          Unknown widget type: {type}
        </div>
      );
    }
    return null;
  }

  const spacingStyles: React.CSSProperties = {};
  if (spacing?.marginTop) {
    spacingStyles.marginTop = `${spacing.marginTop}px`;
  }
  if (spacing?.marginBottom) {
    spacingStyles.marginBottom = `${spacing.marginBottom}px`;
  }

  return (
    <div className="widget-wrapper" style={spacingStyles}>
      <WidgetComponent settings={settings} isPreview={false} />
    </div>
  );
}
