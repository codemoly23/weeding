"use client";

import { useEffect, useState, useRef } from "react";
import {
  Users, TrendingUp, Trophy, Award, Star, Globe, Clock,
  Zap, Shield, ShieldCheck, CheckCircle, Briefcase,
  Building2, DollarSign, Heart, ThumbsUp, Rocket, Target,
  FileText, Package, Timer, Crown, Sparkles, BarChart2,
  UserCheck, Medal, Smile, MessageCircle, ArrowUp, Percent,
  ClipboardCheck, ClipboardList, BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatsSectionWidgetSettings, StatItem } from "@/lib/page-builder/types";
import { DEFAULT_CARD_GRID_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// Curated icon map — add more as needed
export const STATS_ICON_MAP: Record<string, React.ElementType> = {
  Users,
  UserCheck,
  TrendingUp,
  BarChart2,
  Trophy,
  Award,
  Medal,
  Crown,
  Star,
  Globe,
  Clock,
  Timer,
  Zap,
  Sparkles,
  Shield,
  ShieldCheck,
  CheckCircle,
  Briefcase,
  Building2,
  DollarSign,
  Percent,
  Heart,
  ThumbsUp,
  Smile,
  MessageCircle,
  Rocket,
  Target,
  ArrowUp,
  FileText,
  Package,
  ClipboardCheck,
  ClipboardList,
  BadgeCheck,
};

export const STATS_ICON_OPTIONS = Object.keys(STATS_ICON_MAP).sort();

interface StatsSectionWidgetProps {
  settings: StatsSectionWidgetSettings;
  isPreview?: boolean;
}

// Animated counter hook
function useAnimatedCounter(
  target: number,
  duration: number = 2000,
  shouldAnimate: boolean = true
) {
  const [count, setCount] = useState(shouldAnimate ? 0 : target);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasAnimated.current) {
      setCount(target);
      return;
    }

    hasAnimated.current = true;
    const startTime = Date.now();
    const startValue = 0;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quart
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [target, duration, shouldAnimate]);

  return count;
}

// Get icon size class
function getIconSizeClass(size?: "sm" | "md" | "lg") {
  switch (size) {
    case "sm": return "h-8 w-8";
    case "lg": return "h-14 w-14";
    default:   return "h-10 w-10"; // md
  }
}

// Individual stat component with animation
function AnimatedStat({
  stat,
  animate,
  valueColor,
  labelColor,
  valueSize,
  layout,
  globalIconColor,
  iconSize,
  customValueFontSize,
  valueFontWeight,
  valueLetterSpacing,
  valueLineHeight,
  customLabelFontSize,
  labelFontWeight,
  labelLetterSpacing,
}: {
  stat: StatItem;
  animate: boolean;
  valueColor: string;
  labelColor: string;
  valueSize: string;
  layout: "vertical" | "horizontal";
  globalIconColor: string;
  iconSize: "sm" | "md" | "lg";
  customValueFontSize?: string;
  valueFontWeight?: number;
  valueLetterSpacing?: string;
  valueLineHeight?: number;
  customLabelFontSize?: string;
  labelFontWeight?: number;
  labelLetterSpacing?: string;
}) {
  const { value, label, prefix, suffix, icon, iconColor } = stat;

  // Parse numeric value
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  const hasDecimal = value.includes(".");
  const decimalPlaces = hasDecimal ? value.split(".")[1]?.length || 0 : 0;

  const animatedValue = useAnimatedCounter(numericValue, 2000, animate);

  // Format the displayed value
  const displayValue = animate
    ? hasDecimal
      ? animatedValue.toFixed(decimalPlaces)
      : animatedValue.toLocaleString()
    : value;

  // Get value size class
  const getValueSizeClass = () => {
    switch (valueSize) {
      case "sm": return "text-2xl sm:text-3xl";
      case "md": return "text-3xl sm:text-4xl";
      case "lg": return "text-4xl sm:text-5xl";
      case "xl": return "text-5xl sm:text-6xl";
      default:   return "text-3xl sm:text-4xl";
    }
  };

  // Resolve icon component
  const IconComponent = icon ? STATS_ICON_MAP[icon] : null;
  const resolvedIconColor = iconColor || globalIconColor;

  if (layout === "horizontal") {
    // Horizontal: icon on left, number+label stacked on right
    return (
      <div className="flex items-center gap-4">
        {IconComponent && (
          <div
            className={cn("shrink-0", getIconSizeClass(iconSize))}
            style={{ color: resolvedIconColor }}
          >
            <IconComponent className="h-full w-full" />
          </div>
        )}
        <div className="flex flex-col">
          <span
            className={cn(
              !valueFontWeight && "font-bold",
              "tabular-nums leading-tight font-display",
              !customValueFontSize && getValueSizeClass()
            )}
            style={{
              color: valueColor,
              ...(customValueFontSize ? { fontSize: customValueFontSize } : {}),
              ...(valueFontWeight ? { fontWeight: valueFontWeight } : {}),
              ...(valueLetterSpacing ? { letterSpacing: valueLetterSpacing } : {}),
              ...(valueLineHeight !== undefined ? { lineHeight: valueLineHeight } : {}),
            }}
          >
            {prefix}
            {displayValue}
            {suffix}
          </span>
          <span
            className={cn(
              !customLabelFontSize && "text-sm",
              !labelFontWeight && "font-medium",
              "uppercase tracking-wide"
            )}
            style={{
              color: labelColor,
              ...(customLabelFontSize ? { fontSize: customLabelFontSize } : {}),
              ...(labelFontWeight ? { fontWeight: labelFontWeight } : {}),
              ...(labelLetterSpacing ? { letterSpacing: labelLetterSpacing } : {}),
            }}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }

  // Vertical layout (default)
  return (
    <div className="flex flex-col items-center py-2">
      {IconComponent && (
        <div
          className={cn("mb-3", getIconSizeClass(iconSize))}
          style={{ color: resolvedIconColor }}
        >
          <IconComponent className="h-full w-full" />
        </div>
      )}
      <span
        className={cn(
          !valueFontWeight && "font-bold",
          "tabular-nums leading-tight font-display",
          !customValueFontSize && getValueSizeClass()
        )}
        style={{
          color: valueColor,
          ...(customValueFontSize ? { fontSize: customValueFontSize } : {}),
          ...(valueFontWeight ? { fontWeight: valueFontWeight } : {}),
          ...(valueLetterSpacing ? { letterSpacing: valueLetterSpacing } : {}),
          ...(valueLineHeight !== undefined ? { lineHeight: valueLineHeight } : {}),
        }}
      >
        {prefix}
        {displayValue}
        {suffix}
      </span>
      <span
        className={cn(
          !customLabelFontSize && "text-sm",
          !labelFontWeight && "font-medium",
          "mt-2 uppercase tracking-wide"
        )}
        style={{
          color: labelColor,
          ...(customLabelFontSize ? { fontSize: customLabelFontSize } : {}),
          ...(labelFontWeight ? { fontWeight: labelFontWeight } : {}),
          ...(labelLetterSpacing ? { letterSpacing: labelLetterSpacing } : {}),
        }}
      >
        {label}
      </span>
    </div>
  );
}

// Card-grid animated value — renders number with separate suffix color
function CardGridValue({
  stat,
  animate,
  valueColor,
  suffixColor,
  cg,
}: {
  stat: StatItem;
  animate: boolean;
  valueColor: string;
  suffixColor: string;
  cg: NonNullable<StatsSectionWidgetSettings["cardGrid"]>;
}) {
  const numericValue = parseFloat(stat.value.replace(/[^0-9.]/g, "")) || 0;
  const hasDecimal = stat.value.includes(".");
  const decimalPlaces = hasDecimal ? stat.value.split(".")[1]?.length || 0 : 0;
  const animatedValue = useAnimatedCounter(numericValue, 1800, animate);

  const displayValue = animate
    ? hasDecimal
      ? animatedValue.toFixed(decimalPlaces)
      : animatedValue.toLocaleString()
    : stat.value;

  return (
    <div
      style={{
        fontFamily: cg.valueFontFamily || "var(--font-heading)",
        fontSize: `${cg.valueFontSize || 48}px`,
        fontWeight: cg.valueFontWeight || 900,
        color: valueColor,
        letterSpacing: cg.valueLetterSpacing || "-0.04em",
        lineHeight: 1,
      }}
    >
      {stat.prefix}
      {displayValue}
      {stat.suffix && (
        <span style={{ color: suffixColor, fontStyle: "normal" }}>
          {stat.suffix}
        </span>
      )}
    </div>
  );
}

export function StatsSectionWidget({ settings, isPreview = false }: StatsSectionWidgetProps) {
  const { stats, columns, style, centered, animateOnScroll } = settings;
  const variant = settings.variant ?? "default";
  const [isVisible, setIsVisible] = useState(!animateOnScroll);
  const containerRef = useRef<HTMLDivElement>(null);

  const layout = style.layout ?? "vertical";
  const useTheme = settings.colors?.useTheme !== false;
  const iconColor = useTheme ? "var(--color-primary)" : (style.iconColor ?? "#f97316");
  const iconSize = style.iconSize ?? "md";

  // Intersection observer for scroll animation
  useEffect(() => {
    if (!animateOnScroll) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animateOnScroll]);

  // Get grid columns class
  const getColumnsClass = () => {
    switch (columns) {
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-2 sm:grid-cols-3";
      case 4: return "grid-cols-2 sm:grid-cols-4";
      case 5: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
      default: return "grid-cols-2 sm:grid-cols-4";
    }
  };

  if (stats.length === 0) {
    return (
      <WidgetContainer container={settings.container}>
        <div className="flex items-center justify-center h-24 bg-slate-800/50 rounded-lg border border-dashed border-slate-600">
          <span className="text-sm text-slate-500">No stats configured</span>
        </div>
      </WidgetContainer>
    );
  }

  // Card-grid variant: rounded container with 1px gap grid lines
  if (variant === "card-grid") {
    const cg = settings.cardGrid ?? DEFAULT_CARD_GRID_SETTINGS!;
    const suffixColor = style.suffixColor || style.valueColor;

    return (
      <WidgetContainer container={settings.container}>
        <div
          ref={containerRef}
          data-field-id="stats"
          className="overflow-hidden"
          style={{
            borderRadius: `${cg.borderRadius}px`,
            background: cg.gridLineColor,
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${cg.gridGap}px`,
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.id}
                style={{
                  padding: cg.cellPadding,
                  background: cg.cellBackground,
                }}
              >
                <CardGridValue
                  stat={stat}
                  animate={isVisible && stat.animate}
                  valueColor={style.valueColor}
                  suffixColor={suffixColor}
                  cg={cg}
                />
                <div
                  style={{
                    fontSize: `${cg.labelFontSize || 13}px`,
                    fontWeight: cg.labelFontWeight || 500,
                    color: style.labelColor,
                    letterSpacing: cg.labelLetterSpacing || "0.3px",
                    marginTop: `${cg.labelMarginTop || 8}px`,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </WidgetContainer>
    );
  }

  // Default variant
  return (
    <WidgetContainer container={settings.container}>
      <div
        ref={containerRef}
        data-field-id="stats"
        className={cn(
          "grid gap-8 pt-8",
          getColumnsClass(),
          centered && layout === "vertical" && "text-center",
          style.showTopBorder && "border-t"
        )}
        style={{
          borderColor: style.showTopBorder ? (style.topBorderColor || "#334155") : undefined,
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={stat.id}
            className={cn(
              "relative",
              layout === "horizontal" && "flex items-center",
              style.divider &&
                index !== stats.length - 1 &&
                "after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-12 after:w-px after:bg-slate-700 after:hidden sm:after:block"
            )}
          >
            <AnimatedStat
              stat={stat}
              animate={isVisible && stat.animate}
              valueColor={style.valueColor}
              labelColor={style.labelColor}
              valueSize={style.valueSize}
              layout={layout}
              globalIconColor={iconColor}
              iconSize={iconSize}
              customValueFontSize={style.customValueFontSize}
              valueFontWeight={style.valueFontWeight}
              valueLetterSpacing={style.valueLetterSpacing}
              valueLineHeight={style.valueLineHeight}
              customLabelFontSize={style.customLabelFontSize}
              labelFontWeight={style.labelFontWeight}
              labelLetterSpacing={style.labelLetterSpacing}
            />
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
