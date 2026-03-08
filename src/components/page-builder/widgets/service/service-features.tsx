// ============================================
// SERVICE FEATURES WIDGET
// Displays service included features list with 4 style variants
// ============================================

"use client";

import { cn } from "@/lib/utils";
import { Check, CircleCheck, BadgeCheck } from "lucide-react";
import { ServiceIcon } from "@/components/ui/service-icon";
import {
  useOptionalServiceContext,
  resolvePlaceholders,
} from "@/lib/page-builder/contexts/service-context";
import type { ServiceFeaturesWidgetSettings } from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ============================================
// WIDGET PROPS
// ============================================

interface ServiceFeaturesWidgetProps {
  settings: Partial<ServiceFeaturesWidgetSettings>;
  isPreview?: boolean;
}

// ============================================
// ICON COMPONENT HELPER
// ============================================

function FeatureIcon({
  iconStyle,
  iconColor,
  className,
}: {
  iconStyle: ServiceFeaturesWidgetSettings["iconStyle"];
  iconColor: string;
  className?: string;
}) {
  const iconProps = {
    className,
    style: { color: iconColor },
  };

  switch (iconStyle) {
    case "circle-check":
      return <CircleCheck {...iconProps} />;
    case "badge-check":
      return <BadgeCheck {...iconProps} />;
    case "check":
    default:
      return <Check {...iconProps} />;
  }
}

// ============================================
// WIDGET COMPONENT
// ============================================

// Coerce a value that may be a string or { text: string } object into a string
function resolveString(val: unknown, fallback: string): string {
  if (typeof val === "string") return val || fallback;
  if (val && typeof val === "object" && "text" in val) {
    return (val as { text: string }).text || fallback;
  }
  return fallback;
}

export function ServiceFeaturesWidget({
  settings,
  isPreview = false,
}: ServiceFeaturesWidgetProps) {
  // Merge with defaults using ?? operator pattern
  const s = {
    header: {
      show: settings?.header?.show ?? true,
      heading: resolveString(settings?.header?.heading, "What's Included"),
      description: resolveString(settings?.header?.description, ""),
      alignment: settings?.header?.alignment ?? "left",
      eyebrow: settings?.header?.eyebrow,
      eyebrowColor: settings?.header?.eyebrowColor,
    },
    variant: settings?.variant ?? "minimal-checkmark",
    columns: settings?.columns ?? 2,
    showIcons: settings?.showIcons ?? true,
    iconStyle: settings?.iconStyle ?? "check",
    iconColor: settings?.iconColor ?? "#10b981",
    showDescriptions: settings?.showDescriptions ?? false,
    showTags: settings?.showTags ?? false,
  };

  // Get service context
  const serviceContext = useOptionalServiceContext();

  // If no service context, show placeholder (works in Page Builder admin)
  if (!serviceContext) {
    return <WidgetContainer container={settings.container}><ServiceFeaturesPlaceholder settings={s} /></WidgetContainer>;
  }

  const { service } = serviceContext;
  const features = [...service.features].sort((a, b) => a.sortOrder - b.sortOrder);

  // Resolve heading placeholders
  const resolvedHeading = resolvePlaceholders(s.header.heading, service);

  if (features.length === 0) {
    return null;
  }

  return (
    <WidgetContainer container={settings.container}>
    <section>
      {/* Header */}
      {s.header.show && (
        <div className={cn("mb-8", s.header.alignment === "center" ? "text-center" : "text-left")}>
          {s.header.eyebrow && (
            <span
              style={{ color: s.header.eyebrowColor || "#e84c1e" }}
              className="block text-xs font-bold uppercase tracking-[1.5px] mb-3"
            >
              {s.header.eyebrow}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{resolvedHeading}</h2>
          {s.header.description && (
            <p className="mt-2 text-muted-foreground">
              {resolvePlaceholders(s.header.description, service)}
            </p>
          )}
        </div>
      )}

      {/* Variant: minimal-checkmark */}
      {s.variant === "minimal-checkmark" && (
        <div
          className={cn(
            "grid grid-cols-1 gap-3",
            s.columns >= 2 && "sm:grid-cols-2",
            s.columns >= 3 && "lg:grid-cols-3",
            s.columns >= 4 && "lg:grid-cols-4"
          )}
        >
          {features.map((feature) => (
            <div key={feature.id} className="flex items-start gap-3 py-2">
              {s.showIcons && (
                <FeatureIcon
                  iconStyle={s.iconStyle}
                  iconColor={s.iconColor}
                  className="h-5 w-5 shrink-0 mt-0.5"
                />
              )}
              <div>
                <span className="text-sm text-foreground leading-snug">{feature.text}</span>
                {s.showDescriptions && feature.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{feature.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variant: cards */}
      {s.variant === "cards" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="rounded-xl border bg-card p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              {s.showIcons && (
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FeatureIcon
                    iconStyle={s.iconStyle}
                    iconColor={s.iconColor}
                    className="h-6 w-6"
                  />
                </div>
              )}
              <p className="font-semibold text-sm">{feature.text}</p>
              {s.showDescriptions && feature.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {feature.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Variant: compact-grid */}
      {s.variant === "compact-grid" && (
        <div className="rounded-xl border bg-muted/30 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center gap-2 text-sm py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variant: highlighted */}
      {s.variant === "highlighted" && (
        <div className="flex flex-wrap gap-3">
          {features.map((feature) => (
            <span
              key={feature.id}
              className="inline-flex items-center gap-2 rounded-lg border bg-primary/5 border-primary/20 px-4 py-2.5 text-sm font-medium"
            >
              {s.showIcons && (
                <CircleCheck
                  className="h-4 w-4"
                  style={{ color: s.iconColor }}
                />
              )}
              {feature.text}
            </span>
          ))}
        </div>
      )}

      {/* Variant: detailed-cards — Reference "What's Included" section */}
      {s.variant === "detailed-cards" && (
        <div
          className={cn(
            "grid grid-cols-1 gap-5",
            s.columns >= 2 && "sm:grid-cols-2",
            s.columns >= 3 && "lg:grid-cols-3",
          )}
        >
          {features.map((feature) => (
            <DetailedFeatureCard
              key={feature.id}
              feature={feature}
              showIcon={s.showIcons}
              showTag={s.showTags}
            />
          ))}
        </div>
      )}
    </section>
    </WidgetContainer>
  );
}

// ============================================
// DETAILED FEATURE CARD COMPONENT
// Matches reference: icon + title + description + tag badge
// ============================================

const TAG_CARD_COLORS: Record<string, { bg: string; text: string }> = {
  included: { bg: "rgba(27,58,45,0.08)", text: "#1b3a2d" },
  free: { bg: "rgba(27,58,45,0.08)", text: "#1b3a2d" },
  addon: { bg: "rgba(232,76,30,0.1)", text: "#e84c1e" },
  premium: { bg: "rgba(168,85,247,0.1)", text: "#9333ea" },
  custom: { bg: "rgba(107,114,128,0.1)", text: "#4b5563" },
};

function DetailedFeatureCard({
  feature,
  showIcon,
  showTag,
}: {
  feature: { id: string; text: string; description?: string | null; tag?: string | null; tagType?: string | null; icon?: string | null };
  showIcon: boolean;
  showTag: boolean;
}) {
  const tagColors = TAG_CARD_COLORS[feature.tagType || "custom"] || TAG_CARD_COLORS.custom;

  return (
    <div className="group relative overflow-hidden rounded-[18px] border-[1.5px] border-border bg-white p-8 transition-all duration-[350ms] ease-[cubic-bezier(.16,1,.3,1)] hover:border-[#1b3a2d] hover:shadow-[0_16px_48px_rgba(27,58,45,0.1)] hover:-translate-y-1">
      {/* Bottom accent bar on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1b3a2d] origin-left scale-x-0 transition-transform duration-[350ms] ease-out group-hover:scale-x-100" />

      {/* Icon */}
      {showIcon && (
        <div className="mb-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[rgba(27,58,45,0.07)] transition-all duration-300 group-hover:bg-[#1b3a2d]">
          {feature.icon ? (
            <ServiceIcon
              name={feature.icon}
              className="h-6 w-6 text-[#1b3a2d] transition-colors duration-300 group-hover:text-[#faf8f4]"
            />
          ) : (
            <CircleCheck className="h-6 w-6 text-[#1b3a2d] transition-colors duration-300 group-hover:text-[#faf8f4]" />
          )}
        </div>
      )}

      {/* Title */}
      <h3
        style={{ fontFamily: "var(--font-heading, 'Outfit', sans-serif)" }}
        className="text-[17px] font-bold tracking-[-0.01em] text-[#0e1109] mb-2"
      >
        {feature.text}
      </h3>

      {/* Description */}
      {feature.description && (
        <p className="text-[13px] leading-[1.65] text-[#4b5249]">
          {feature.description}
        </p>
      )}

      {/* Tag Badge */}
      {showTag && feature.tag && (
        <span
          className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-[0.8px] px-2.5 py-[3px] rounded-full"
          style={{
            background: tagColors.bg,
            color: tagColors.text,
          }}
        >
          {feature.tag}
        </span>
      )}
    </div>
  );
}

// ============================================
// PLACEHOLDER FOR PREVIEW (NO SERVICE CONTEXT)
// ============================================

const PLACEHOLDER_FEATURES = [
  { id: "p1", text: "Articles of Organization", description: "The official state document that legally creates your LLC.", icon: "FileText", tag: "All Plans", tagType: "included", sortOrder: 1 },
  { id: "p2", text: "Operating Agreement", description: "Defines ownership structure and operating rules.", icon: "Shield", tag: "All Plans \u2022 Free ($79 value)", tagType: "free", sortOrder: 2 },
  { id: "p3", text: "EIN / Tax ID Application", description: "Your LLC\u2019s federal Employer Identification Number.", icon: "CreditCard", tag: "Professional & Complete", tagType: "addon", sortOrder: 3 },
  { id: "p4", text: "Registered Agent \u2014 1 Year Free", description: "Receives official legal notices and government mail.", icon: "Building2", tag: "Professional & Complete", tagType: "addon", sortOrder: 4 },
  { id: "p5", text: "BOI Ownership Filing", description: "FinCEN\u2019s Beneficial Ownership Information report.", icon: "FileText", tag: "Professional & Complete", tagType: "addon", sortOrder: 5 },
  { id: "p6", text: "US Business Banking Guidance", description: "Step-by-step help opening a Mercury or Relay account.", icon: "Building2", tag: "Complete Plan", tagType: "premium", sortOrder: 6 },
];

function ServiceFeaturesPlaceholder({
  settings: s,
}: {
  settings: {
    header: {
      show: boolean;
      heading: string;
      description: string;
      alignment: "left" | "center";
      eyebrow?: string;
      eyebrowColor?: string;
    };
    variant: ServiceFeaturesWidgetSettings["variant"];
    columns: ServiceFeaturesWidgetSettings["columns"];
    showIcons: boolean;
    iconStyle: ServiceFeaturesWidgetSettings["iconStyle"];
    iconColor: string;
    showDescriptions: boolean;
    showTags: boolean;
  };
}) {
  return (
    <section>
      {/* Header */}
      {s.header.show && (
        <div className={cn("mb-8", s.header.alignment === "center" ? "text-center" : "text-left")}>
          {s.header.eyebrow && (
            <span
              style={{ color: s.header.eyebrowColor || "#e84c1e" }}
              className="block text-xs font-bold uppercase tracking-[1.5px] mb-3"
            >
              {s.header.eyebrow}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{s.header.heading}</h2>
          {s.header.description && (
            <p className="mt-2 text-muted-foreground">{s.header.description}</p>
          )}
        </div>
      )}

      {/* Variant: minimal-checkmark */}
      {s.variant === "minimal-checkmark" && (
        <div
          className={cn(
            "grid grid-cols-1 gap-3",
            s.columns >= 2 && "sm:grid-cols-2",
            s.columns >= 3 && "lg:grid-cols-3",
            s.columns >= 4 && "lg:grid-cols-4"
          )}
        >
          {PLACEHOLDER_FEATURES.map((feature) => (
            <div key={feature.id} className="flex items-start gap-3 py-2">
              {s.showIcons && (
                <FeatureIcon
                  iconStyle={s.iconStyle}
                  iconColor={s.iconColor}
                  className="h-5 w-5 shrink-0 mt-0.5"
                />
              )}
              <span className="text-sm text-foreground leading-snug">{feature.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Variant: cards */}
      {s.variant === "cards" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PLACEHOLDER_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="rounded-xl border bg-card p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              {s.showIcons && (
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FeatureIcon
                    iconStyle={s.iconStyle}
                    iconColor={s.iconColor}
                    className="h-6 w-6"
                  />
                </div>
              )}
              <p className="font-semibold text-sm">{feature.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Variant: compact-grid */}
      {s.variant === "compact-grid" && (
        <div className="rounded-xl border bg-muted/30 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {PLACEHOLDER_FEATURES.map((feature) => (
              <div key={feature.id} className="flex items-center gap-2 text-sm py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variant: highlighted */}
      {s.variant === "highlighted" && (
        <div className="flex flex-wrap gap-3">
          {PLACEHOLDER_FEATURES.map((feature) => (
            <span
              key={feature.id}
              className="inline-flex items-center gap-2 rounded-lg border bg-primary/5 border-primary/20 px-4 py-2.5 text-sm font-medium"
            >
              {s.showIcons && (
                <CircleCheck
                  className="h-4 w-4"
                  style={{ color: s.iconColor }}
                />
              )}
              {feature.text}
            </span>
          ))}
        </div>
      )}

      {/* Variant: detailed-cards (placeholder) */}
      {s.variant === "detailed-cards" && (
        <div
          className={cn(
            "grid grid-cols-1 gap-5",
            s.columns >= 2 && "sm:grid-cols-2",
            s.columns >= 3 && "lg:grid-cols-3",
          )}
        >
          {PLACEHOLDER_FEATURES.map((feature) => (
            <DetailedFeatureCard
              key={feature.id}
              feature={feature}
              showIcon={s.showIcons}
              showTag={s.showTags}
            />
          ))}
        </div>
      )}

      {/* Preview Notice */}
      <p className="mt-6 text-xs text-muted-foreground">
        Preview mode - Feature data will be loaded dynamically
      </p>
    </section>
  );
}
