"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Minus,
  Info,
  Clock,
  Zap,
  Plus,
  RefreshCw,
  ChevronDown,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingCardsForge } from "./pricing-cards-forge";
import { PricingTableForge } from "./pricing-table-forge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LocationSelector, type LocationItem } from "@/components/ui/location-selector";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/currencies";
import type {
  PricingTableWidgetSettings,
  PricingFeatureValueType,
  BadgeStyle,
} from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { DEFAULT_PRICING_TABLE_SETTINGS } from "@/lib/page-builder/defaults";
import { useOptionalServiceContext } from "@/lib/page-builder/contexts/service-context";
import { PricingCardsView } from "./pricing-cards-view";

// =============================================================================
// TYPES
// =============================================================================

interface PackageFeatureMapping {
  id: string;
  packageId: string;
  included: boolean;
  customValue?: string | null;
  valueType: PricingFeatureValueType;
  addonPriceUSD?: number | null;
  addonPriceBDT?: number | null;
}

interface ComparisonFeature {
  id: string;
  text: string;
  tooltip?: string | null;
  description?: string | null;
  packageMappings: PackageFeatureMapping[];
}

interface Package {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  priceBDT?: number | null;
  isPopular: boolean;
  processingTime?: string | null;
  processingTimeNote?: string | null;
  processingIcon?: string | null;
  badgeText?: string | null;
  badgeColor?: string | null;
  compareAtPrice?: number | null;
}

interface ServiceData {
  id: string;
  slug: string;
  name: string;
  comparisonFeatures: ComparisonFeature[];
  packages: Package[];
  hasLocationBasedPricing: boolean;
  displayOptions?: {
    checkoutBadgeText?: string;
    checkoutBadgeDescription?: string;
  };
}

interface SelectedAddon {
  featureId: string;
  featureText: string;
  packageId: string;
  price: number;
}

interface PricingTableWidgetProps {
  settings: PricingTableWidgetSettings;
  isPreview?: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getBadgeStyles(
  style: BadgeStyle,
  colors: { bgColor?: string; textColor?: string; borderColor?: string }
) {
  const baseClasses =
    "inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium";

  switch (style) {
    case "outline":
      return {
        className: cn(baseClasses, "rounded-full border bg-transparent"),
        style: {
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
    case "solid":
      return {
        className: cn(baseClasses, "rounded-md border-0"),
        style: {
          backgroundColor: colors.bgColor || "#f97316",
          color: colors.textColor || "#ffffff",
        },
      };
    case "pill":
    default:
      return {
        className: cn(baseClasses, "rounded-full border"),
        style: {
          backgroundColor: colors.bgColor || "#f9731933",
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
  }
}

function renderHighlightedText(
  text: string,
  highlightWords?: string,
  highlightColor?: string
) {
  if (!highlightWords) {
    return text;
  }

  const regex = new RegExp(`(${highlightWords})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === highlightWords.toLowerCase()) {
      return (
        <span key={index} style={{ color: highlightColor || "#f97316" }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

function SectionHeader({ settings }: { settings: PricingTableWidgetSettings }) {
  const rawHeader = settings.header;

  if (!rawHeader?.show) return null;

  // Merge with defaults to handle DB data missing nested properties
  const badge = { ...DEFAULT_PRICING_TABLE_SETTINGS.header.badge, ...rawHeader.badge };
  const heading = { ...DEFAULT_PRICING_TABLE_SETTINGS.header.heading, ...rawHeader.heading };
  const description = { ...DEFAULT_PRICING_TABLE_SETTINGS.header.description, ...rawHeader.description };

  const badgeStyles = getBadgeStyles(badge.style, {
    bgColor: badge.bgColor,
    textColor: badge.textColor,
    borderColor: badge.borderColor,
  });

  const headingSizeClasses = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
    "2xl": "text-5xl md:text-6xl",
  };

  const descriptionSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn("flex flex-col gap-4", alignmentClasses[rawHeader.alignment])}
      style={{ marginBottom: `${rawHeader.marginBottom}px` }}
    >
      {badge.show && (
        <span
          data-field-id="badge"
          className={badgeStyles.className}
          style={{
            ...badgeStyles.style,
            ...(badge.customFontSize ? { fontSize: badge.customFontSize } : {}),
            ...(badge.fontWeight ? { fontWeight: badge.fontWeight } : {}),
            ...(badge.letterSpacing ? { letterSpacing: badge.letterSpacing } : {}),
            ...(badge.textTransform ? { textTransform: badge.textTransform as React.CSSProperties["textTransform"] } : {}),
          }}
        >
          {badge.text}
        </span>
      )}

      <h2
        data-field-id="heading"
        className={cn(
          !heading.fontWeight && "font-bold",
          !heading.letterSpacing && "tracking-tight",
          !heading.customFontSize && headingSizeClasses[heading.size]
        )}
        style={{
          color: heading.color || "#0f172a",
          whiteSpace: "pre-line",
          ...(heading.customFontSize ? { fontSize: heading.customFontSize } : {}),
          ...(heading.fontWeight ? { fontWeight: heading.fontWeight } : {}),
          ...(heading.lineHeight ? { lineHeight: heading.lineHeight } : {}),
          ...(heading.letterSpacing ? { letterSpacing: heading.letterSpacing } : {}),
        }}
      >
        {renderHighlightedText(
          heading.text,
          heading.highlightWords,
          heading.highlightColor
        )}
      </h2>

      {description.show && (
        <p
          data-field-id="description"
          className={cn(
            "max-w-3xl",
            !description.customFontSize && descriptionSizeClasses[description.size]
          )}
          style={{
            color: description.color || "#64748b",
            ...(description.customFontSize ? { fontSize: description.customFontSize } : {}),
            ...(description.lineHeight ? { lineHeight: description.lineHeight } : {}),
          }}
        >
          {description.text}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// ORDER SUMMARY COMPONENT
// =============================================================================

interface OrderSummaryProps {
  settings: PricingTableWidgetSettings;
  selectedPackage: Package | undefined;
  selectedLocation: LocationItem | null;
  locationFee: number;
  selectedAddons: SelectedAddon[];
  grandTotal: number;
  serviceSlug: string;
  checkoutBadgeText?: string;
  checkoutBadgeDescription?: string;
  currencySymbol?: string;
}

function OrderSummary({
  settings,
  selectedPackage,
  selectedLocation,
  locationFee,
  selectedAddons,
  grandTotal,
  serviceSlug,
  checkoutBadgeText,
  checkoutBadgeDescription,
  currencySymbol = "$",
}: OrderSummaryProps) {
  const { orderSummary, ctaButtons } = settings;
  const useTheme = settings.colors?.useTheme !== false;
  const effectiveBgColor = useTheme ? "var(--color-primary)" : (ctaButtons.defaultBgColor || "#f97316");

  if (!orderSummary.enabled) return null;

  const getPackageSlug = (pkg: Package | undefined) => {
    if (!pkg) return "basic";
    return pkg.name.toLowerCase().replace(/\s+/g, "-");
  };

  const checkoutUrl = `/checkout/${serviceSlug}?package=${getPackageSlug(selectedPackage)}${
    selectedLocation?.code ? `&location=${selectedLocation.code}` : ""
  }${
    selectedAddons.length > 0
      ? `&addons=${selectedAddons.map((a) => a.featureId).join(",")}`
      : ""
  }`;

  return (
    <div className="hidden lg:block w-80 shrink-0">
      <Card
        className={cn(
          "shadow-lg border-gray-200",
          orderSummary.stickyOnScroll && "sticky top-24"
        )}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{orderSummary.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orderSummary.showPackageDetails && selectedPackage && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {selectedPackage.name} Package:
              </span>
              <span className="font-medium">{currencySymbol}{selectedPackage.price}</span>
            </div>
          )}

          {orderSummary.showStateFee && selectedLocation && locationFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {selectedLocation.name} {settings.stateFee.label || "Fee"}:
              </span>
              <span className="font-medium">{currencySymbol}{locationFee}</span>
            </div>
          )}

          {orderSummary.showAddons &&
            selectedAddons.map((addon) => (
              <div
                key={`${addon.featureId}-${addon.packageId}`}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600 truncate max-w-40">
                  {addon.featureText}:
                </span>
                <span className="font-medium">{currencySymbol}{addon.price}</span>
              </div>
            ))}

          <Separator className="my-4" />

          {orderSummary.showTotal && (
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                {currencySymbol}{grandTotal}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button
            className="w-full font-semibold py-6"
            style={{
              backgroundColor:
                orderSummary.ctaButton?.bgColor || effectiveBgColor,
              color:
                orderSummary.ctaButton?.textColor || ctaButtons.defaultTextColor,
            }}
            asChild
          >
            <Link href={checkoutUrl}>{orderSummary.ctaButton?.text || "Proceed to Checkout"}</Link>
          </Button>
          {checkoutBadgeText && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <RefreshCw className="h-3 w-3" />
              <span>{checkoutBadgeText}</span>
            </div>
          )}
          {checkoutBadgeDescription && (
            <p className="text-xs text-center text-gray-500">
              {checkoutBadgeDescription}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// =============================================================================
// MOBILE ORDER SUMMARY COMPONENT
// =============================================================================

interface MobileOrderSummaryProps {
  settings: PricingTableWidgetSettings;
  selectedPackage: Package | undefined;
  locationFee: number;
  selectedAddons: SelectedAddon[];
  grandTotal: number;
  serviceSlug: string;
  selectedLocation: LocationItem | null;
  currencySymbol?: string;
}

function MobileOrderSummary({
  settings,
  selectedPackage,
  locationFee,
  selectedAddons,
  grandTotal,
  serviceSlug,
  selectedLocation,
  currencySymbol = "$",
}: MobileOrderSummaryProps) {
  const { orderSummary, ctaButtons } = settings;
  const useTheme = settings.colors?.useTheme !== false;
  const effectiveBgColor = useTheme ? "var(--color-primary)" : (ctaButtons.defaultBgColor || "#f97316");

  if (!orderSummary.enabled) return null;

  const getPackageSlug = (pkg: Package | undefined) => {
    if (!pkg) return "basic";
    return pkg.name.toLowerCase().replace(/\s+/g, "-");
  };

  const checkoutUrl = `/checkout/${serviceSlug}?package=${getPackageSlug(selectedPackage)}${
    selectedLocation?.code ? `&location=${selectedLocation.code}` : ""
  }${
    selectedAddons.length > 0
      ? `&addons=${selectedAddons.map((a) => a.featureId).join(",")}`
      : ""
  }`;

  return (
    <Card className="mb-6 shadow-md lg:hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{orderSummary.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {orderSummary.showPackageDetails && selectedPackage && (
          <div className="flex justify-between">
            <span>{selectedPackage.name} Package:</span>
            <span className="font-medium">{currencySymbol}{selectedPackage.price}</span>
          </div>
        )}
        {orderSummary.showStateFee && locationFee > 0 && (
          <div className="flex justify-between">
            <span>{settings.stateFee.label || "Location Fee"}:</span>
            <span className="font-medium">{currencySymbol}{locationFee}</span>
          </div>
        )}
        {orderSummary.showAddons &&
          selectedAddons.map((addon) => (
            <div
              key={`mobile-${addon.featureId}`}
              className="flex justify-between"
            >
              <span className="truncate max-w-48">{addon.featureText}:</span>
              <span className="font-medium">{currencySymbol}{addon.price}</span>
            </div>
          ))}
        <Separator />
        {orderSummary.showTotal && (
          <div className="flex justify-between font-semibold text-base">
            <span>Total:</span>
            <span>{currencySymbol}{grandTotal}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          style={{
            backgroundColor:
              orderSummary.ctaButton?.bgColor || effectiveBgColor,
            color:
              orderSummary.ctaButton?.textColor || ctaButtons.defaultTextColor,
          }}
          asChild
        >
          <Link href={checkoutUrl}>
            {ctaButtons.buttonText} - {currencySymbol}{grandTotal}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// =============================================================================
// COMPARISON TABLE COMPONENT
// =============================================================================

interface ComparisonTableProps {
  settings: PricingTableWidgetSettings;
  features: ComparisonFeature[];
  packages: Package[];
  selectedPackageId: string | null;
  onPackageSelect: (packageId: string) => void;
  locationFee: number;
  selectedAddons: SelectedAddon[];
  onToggleAddon: (
    featureId: string,
    featureText: string,
    packageId: string,
    price: number
  ) => void;
  isAddonSelected: (featureId: string, packageId: string) => boolean;
  expandedFeature: string | null;
  onExpandFeature: (featureId: string | null) => void;
  currencySymbol?: string;
  serviceSlug: string;
}

// =============================================================================
// INFO TOOLTIP
// =============================================================================

function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      className="relative inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border-[1.5px] border-[rgba(14,17,9,0.16)] bg-transparent text-[9px] font-bold ml-1.5 cursor-default shrink-0 group/tip"
      style={{ fontFamily: "var(--font-accent, Georgia, serif)", color: "#8a9086" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1b3a2d"; e.currentTarget.style.color = "#1b3a2d"; e.currentTarget.style.backgroundColor = "rgba(27,58,45,0.07)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(14,17,9,0.16)"; e.currentTarget.style.color = "#8a9086"; e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      i
      <span
        className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1.5 bg-[#0e1109] text-[rgba(255,255,255,0.88)] text-[11.5px] font-normal px-3 py-2.5 rounded-[9px] w-56 text-left opacity-0 pointer-events-none transition-all duration-150 whitespace-normal shadow-[0_10px_30px_rgba(0,0,0,0.22)] group-hover/tip:opacity-100 group-hover/tip:translate-y-0 z-[300]"
        style={{ fontFamily: "var(--font-sans, Inter, sans-serif)", fontStyle: "normal" }}
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#0e1109]" />
      </span>
    </span>
  );
}

function ComparisonTable({
  settings,
  features,
  packages,
  selectedPackageId,
  onPackageSelect,
  locationFee,
  selectedAddons,
  onToggleAddon,
  isAddonSelected,
  expandedFeature,
  onExpandFeature,
  currencySymbol = "$",
  serviceSlug,
}: ComparisonTableProps) {
  // ── colour tokens ──────────────────────────────────────────────────────────
  const FOREST = "#1b3a2d";
  const CREAM  = "#faf8f4";
  const CORAL  = "#e84c1e";
  const BORDER = "rgba(14,17,9,0.1)";

  // ── local state ────────────────────────────────────────────────────────────
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [expandedAddons, setExpandedAddons] = useState<Record<string, boolean>>({});
  const [headerOffset, setHeaderOffset] = useState(0);

  useEffect(() => {
    const measure = () => {
      let maxBottom = 0;
      document.querySelectorAll("header").forEach((el) => {
        const node = el as HTMLElement;
        const cs = window.getComputedStyle(node);
        if (cs.position !== "sticky" && cs.position !== "fixed") return;
        const rect = node.getBoundingClientRect();
        if (rect.top <= 1 && rect.bottom > maxBottom) maxBottom = rect.bottom;
      });
      setHeaderOffset(Math.ceil(maxBottom));
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  // ── sorted packages (price ascending) ─────────────────────────────────────
  const sortedPackages = [...packages].sort((a, b) => a.price - b.price);
  const colCount = sortedPackages.length;

  // ── feature segregation ───────────────────────────────────────────────────
  const regularFeatures = features.filter(
    (f) => !f.packageMappings.some((m) => m.valueType === "ADDON")
  );
  const addonFeatures = features.filter(
    (f) => f.packageMappings.some((m) => m.valueType === "ADDON")
  );

  // ── active column index ───────────────────────────────────────────────────
  const activeColIndex = sortedPackages.findIndex((p) => p.id === selectedPackageId);

  // ── checkout URL ──────────────────────────────────────────────────────────
  const getCheckoutUrl = (pkg: Package) => {
    const pkgAddons = selectedAddons.filter((a) => a.packageId === pkg.id);
    const pkgName = encodeURIComponent(pkg.name.toLowerCase());
    return `/checkout/${serviceSlug}?package=${pkgName}${
      pkgAddons.length > 0 ? `&addons=${pkgAddons.map((a) => a.featureId).join(",")}` : ""
    }`;
  };

  const toggleAddonDetail = (key: string) =>
    setExpandedAddons((prev) => ({ ...prev, [key]: !prev[key] }));

  // Dummy usage to satisfy TS (CREAM used inline via string)
  void CREAM;

  return (
    <div className="pt-4 overflow-x-auto md:overflow-x-visible md:overflow-y-visible">
      <div
        className="rounded-[20px] border-[1.5px] bg-white relative"
        style={{ borderColor: BORDER, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", minWidth: "640px" }}
      >
        <table className="w-full border-separate border-spacing-0 table-fixed">

          {/* ── THEAD — sticky while table is in view ────────────────────── */}
          <thead className="md:sticky" style={{ top: `${headerOffset}px`, zIndex: 60 }}>
            {/* Single header row (badge + package info combined) */}
            <tr>
              <th
                className="w-[38%] p-0 bg-white text-left align-bottom border-b-[1.5px] rounded-tl-[20px]"
                style={{ borderColor: BORDER, minWidth: "180px" }}
              >
                <div
                  className="px-7 pt-7 pb-6 text-[17px] font-extrabold text-[#0e1109]"
                  style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                >
                  Business Formation<br />Packages
                </div>
              </th>

              {sortedPackages.map((pkg, colIdx) => {
                const isActive = activeColIndex === colIdx;
                const isLast = colIdx === colCount - 1;
                const addonTotal = selectedAddons.filter((a) => a.packageId === pkg.id).reduce((s, a) => s + a.price, 0);

                return (
                  <th
                    key={pkg.id}
                    className={cn(
                      "p-0 bg-white text-center align-bottom border-b-[1.5px] relative transition-colors duration-150",
                      isLast ? "rounded-tr-[20px]" : "",
                      hoveredCol === colIdx ? "bg-[rgba(27,58,45,0.02)]" : ""
                    )}
                    style={{ borderColor: BORDER, width: `${62 / colCount}%` }}
                    onMouseEnter={() => setHoveredCol(colIdx)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    {/* Popular badge — absolute, sits above the th */}
                    {pkg.isPopular && (
                      <div
                        className="absolute -top-[13px] left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.6px] text-white whitespace-nowrap z-[3] shadow-sm"
                        style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", backgroundColor: CORAL }}
                      >
                        {pkg.badgeText || "Recommended"}
                      </div>
                    )}
                    <div className="px-4 pt-7 pb-6">
                      <button
                        onClick={() => onPackageSelect(pkg.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 w-full py-3.5 px-4 rounded-xl border-2 cursor-pointer transition-all duration-200 font-inherit",
                          isActive
                            ? "border-[#1b3a2d] bg-[#1b3a2d]"
                            : "border-[rgba(14,17,9,0.1)] bg-white hover:border-[#1b3a2d] hover:bg-[rgba(27,58,45,0.07)]"
                        )}
                      >
                        <span
                          className={cn("text-[15px] font-extrabold tracking-[-0.01em]", isActive ? "text-[#faf8f4]" : "text-[#0e1109]")}
                          style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                        >
                          {pkg.name}
                        </span>

                        <span className="flex items-baseline gap-0.5 leading-[1.1] flex-wrap justify-center">
                          <span
                            className={cn("text-[28px] font-black tracking-[-0.03em]", isActive ? "text-[#faf8f4]" : "text-[#0e1109]")}
                            style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                          >
                            {currencySymbol}{pkg.price + addonTotal}
                          </span>
                          {pkg.compareAtPrice && (
                            <span
                              className={cn("text-[14px] font-semibold line-through ml-1 align-middle", isActive ? "text-[rgba(250,248,244,0.35)]" : "text-[#8a9086]")}
                              style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                            >
                              {currencySymbol}{pkg.compareAtPrice}
                            </span>
                          )}
                          <sub className={cn("text-[11px] font-medium ml-0.5", isActive ? "text-[rgba(250,248,244,0.5)]" : "text-[#8a9086]")}>
                            {locationFee > 0 ? `+${currencySymbol}${locationFee} state fee` : "+ state fee"}
                          </sub>
                        </span>

                        {pkg.processingTime && (
                          <span className={cn("flex items-center gap-1 text-[11px] font-semibold mt-0.5", isActive ? "text-[rgba(250,248,244,0.6)]" : "text-[#8a9086]")}>
                            {pkg.processingIcon === "zap" ? <Zap className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {pkg.processingTime}
                          </span>
                        )}
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── TBODY ───────────────────────────────────────────────────── */}
          <tbody>
            {/* Regular feature rows */}
            {regularFeatures.map((feature, rowIdx) => {
              const isAlt = rowIdx % 2 === 1;
              return (
                <tr
                  key={feature.id}
                  className={cn("transition-colors duration-150 hover:bg-[rgba(27,58,45,0.02)]", isAlt ? "bg-[rgba(27,58,45,0.015)]" : "")}
                >
                  <td className="py-3.5 px-7 border-b border-[rgba(14,17,9,0.06)] text-[14px] font-medium text-[#1a1f16] align-middle leading-[1.5] sticky left-0 z-[2] md:static bg-inherit">
                    <span className="inline-flex items-center">
                      {feature.text}
                      {feature.tooltip && <InfoTooltip text={feature.tooltip} />}
                    </span>
                  </td>

                  {sortedPackages.map((pkg, colIdx) => {
                    const isActiveCol = activeColIndex === colIdx;
                    const mapping = feature.packageMappings.find((m) => m.packageId === pkg.id);
                    const included = mapping?.included ?? false;

                    return (
                      <td
                        key={pkg.id}
                        className={cn(
                          "py-3.5 px-4 border-b border-[rgba(14,17,9,0.06)] text-center align-middle cursor-pointer transition-colors duration-150",
                          hoveredCol === colIdx ? (isAlt ? "!bg-[rgba(27,58,45,0.05)]" : "!bg-[rgba(27,58,45,0.035)]") : ""
                        )}
                        onClick={() => onPackageSelect(pkg.id)}
                        onMouseEnter={() => setHoveredCol(colIdx)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        {included ? (
                          <span className={cn("w-7 h-7 rounded-full inline-flex items-center justify-center transition-transform duration-200 hover:scale-110", isActiveCol ? "bg-[#1b3a2d]" : "bg-[rgba(27,58,45,0.08)]")}>
                            <Check className={cn("w-3.5 h-3.5 stroke-3", isActiveCol ? "text-[#faf8f4]" : "text-[#1b3a2d]")} />
                          </span>
                        ) : mapping?.valueType === "TEXT" && mapping.customValue ? (
                          <span className={cn("text-[13px] font-medium", isActiveCol ? "text-[#faf8f4]" : "text-[#1a1f16]")}>{mapping.customValue}</span>
                        ) : (
                          <span className="w-7 h-7 rounded-full inline-flex items-center justify-center bg-[rgba(14,17,9,0.04)]">
                            <X className="w-3 h-3 text-[rgba(14,17,9,0.2)] stroke-2" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Add-ons separator */}
            {addonFeatures.length > 0 && (
              <tr>
                <td colSpan={colCount + 1} className="border-b border-[rgba(14,17,9,0.08)] bg-[#faf8f4] px-7 pt-5 pb-2.5">
                  <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-[#8a9086]" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
                    Optional Add-Ons
                  </span>
                </td>
              </tr>
            )}

            {/* Add-on rows */}
            {addonFeatures.map((feature) => {
              const isExpanded = !!expandedAddons[feature.id];
              const firstAddonMapping = feature.packageMappings.find((m) => m.valueType === "ADDON");
              const addonPrice = firstAddonMapping?.addonPriceUSD;

              return (
                <React.Fragment key={feature.id}>
                  <tr className={cn("group/addon", isExpanded ? "open" : "")}>
                    <td className="py-3.5 px-7 border-b border-[rgba(14,17,9,0.06)] bg-[rgba(250,248,244,0.5)] group-hover/addon:bg-[rgba(27,58,45,0.03)] transition-colors duration-150 align-middle sticky left-0 z-2 md:static">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAddonDetail(feature.id)}
                          aria-label="More info"
                          className={cn(
                            "w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200",
                            isExpanded
                              ? "border-[#1b3a2d] bg-[rgba(27,58,45,0.08)] text-[#1b3a2d]"
                              : "border-[rgba(14,17,9,0.1)] bg-white text-[#8a9086] hover:border-[#1b3a2d] hover:text-[#1b3a2d] hover:bg-[rgba(27,58,45,0.06)]"
                          )}
                        >
                          <Plus className={cn("w-3 h-3 transition-transform duration-300", isExpanded && "rotate-45")} style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }} />
                        </button>
                        <span className="text-[14px] font-medium text-[#1a1f16]">{feature.text}</span>
                        {addonPrice && (
                          <span className="text-[12px] font-bold text-[#4b5249] ml-0.5" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
                            +{currencySymbol}{addonPrice}
                          </span>
                        )}
                        {feature.tooltip && <InfoTooltip text={feature.tooltip} />}
                      </div>
                    </td>

                    {sortedPackages.map((pkg, colIdx) => {
                      const mapping = feature.packageMappings.find((m) => m.packageId === pkg.id);
                      const isIncluded = mapping?.valueType === "BOOLEAN" && mapping.included;
                      const isAddon = mapping?.valueType === "ADDON";
                      const price = mapping?.addonPriceUSD;
                      const added = isAddonSelected(feature.id, pkg.id);

                      return (
                        <td
                          key={pkg.id}
                          className={cn(
                            "py-3.5 px-4 border-b border-[rgba(14,17,9,0.06)] text-center align-middle bg-[rgba(250,248,244,0.5)] group-hover/addon:bg-[rgba(27,58,45,0.03)] transition-colors duration-150",
                            hoveredCol === colIdx ? "bg-[rgba(27,58,45,0.055)]!" : ""
                          )}
                          onMouseEnter={() => setHoveredCol(colIdx)}
                          onMouseLeave={() => setHoveredCol(null)}
                        >
                          {isIncluded ? (
                            <span className="text-[12px] font-semibold text-[#1b3a2d]">Included</span>
                          ) : isAddon && price ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggleAddon(feature.id, feature.text, pkg.id, price); }}
                              className={cn(
                                "text-[11px] font-bold px-3 py-1 rounded-full border-[1.5px] cursor-pointer transition-all duration-200 whitespace-nowrap leading-none",
                                added
                                  ? "bg-[#1b3a2d] text-white border-[#1b3a2d] hover:bg-[#0f2318] hover:border-[#0f2318]"
                                  : "bg-transparent text-[#1b3a2d] border-[#1b3a2d] hover:bg-[#1b3a2d] hover:text-white"
                              )}
                            >
                              {added ? "✓ Added" : "+ Add"}
                            </button>
                          ) : (
                            <span className="w-7 h-7 rounded-full inline-flex items-center justify-center bg-[rgba(14,17,9,0.04)]">
                              <X className="w-3 h-3 text-[rgba(14,17,9,0.2)] stroke-2" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expand detail row — separate <tr> spanning all columns */}
                  {isExpanded && feature.description && (
                    <tr>
                      <td
                        colSpan={colCount + 1}
                        className="border-b border-[rgba(14,17,9,0.06)] bg-[rgba(250,248,244,0.5)] px-7 pb-4"
                        style={{ paddingTop: 0 }}
                      >
                        <div className="pl-8 pt-2.5 pb-1 text-[12.5px] text-[#4b5249] leading-[1.65] border-t border-dashed border-[rgba(14,17,9,0.1)]">
                          {feature.description}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* ── TFOOT ── CTA row ─────────────────────────────────────────── */}
          <tfoot>
            <tr>
              <td className="px-7 py-5 bg-white border-t-[1.5px] rounded-bl-[20px] sticky left-0 z-[2] md:static" style={{ borderColor: BORDER }} />
              {sortedPackages.map((pkg, colIdx) => {
                const isActive = activeColIndex === colIdx;
                const isLast = colIdx === colCount - 1;
                // Last package (Premium) → coral, selected → forest, others → outline
                const btnClass = isLast
                  ? "bg-[#e84c1e] text-white border-[#e84c1e] hover:bg-[#d13d10] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,76,30,0.35)]"
                  : isActive
                    ? "bg-[#1b3a2d] text-white border-[#1b3a2d] hover:bg-[#0f2318] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(27,58,45,0.3)]"
                    : "bg-transparent text-[#1a1f16] border-[rgba(14,17,9,0.1)] hover:border-[#1a1f16] hover:bg-[rgba(27,58,45,0.04)]";

                return (
                  <td
                    key={pkg.id}
                    className={cn(
                      "px-4 py-5 bg-white border-t-[1.5px] text-center transition-colors duration-150",
                      isLast ? "rounded-br-[20px]" : "",
                      hoveredCol === colIdx ? "bg-[rgba(27,58,45,0.02)]" : ""
                    )}
                    style={{ borderColor: BORDER }}
                    onMouseEnter={() => setHoveredCol(colIdx)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <Link
                      href={getCheckoutUrl(pkg)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold text-[14px] border-[1.5px] transition-all duration-200",
                        btnClass
                      )}
                      style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                    >
                      {settings.ctaButtons?.buttonText || "Get Started"} →
                    </Link>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// =============================================================================
// MOBILE PACKAGE CARDS COMPONENT
// =============================================================================

interface MobilePackageCardsProps {
  settings: PricingTableWidgetSettings;
  packages: Package[];
  features: ComparisonFeature[];
  selectedPackageId: string | null;
  onPackageSelect: (packageId: string) => void;
  locationFee: number;
  currencySymbol?: string;
}

function MobilePackageCards({
  settings,
  packages,
  features,
  selectedPackageId,
  onPackageSelect,
  locationFee,
  currencySymbol = "$",
}: MobilePackageCardsProps) {
  const { responsive } = settings;
  const useTheme = settings.colors?.useTheme !== false;
  const accentColor = useTheme ? "var(--color-primary)" : (settings.ctaButtons?.defaultBgColor || "#f97316");
  const accentBgLight = useTheme ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : `${settings.ctaButtons?.defaultBgColor || "#f97316"}15`;

  return (
    <div className="lg:hidden">
      <div className="text-center text-sm text-gray-500 mb-4">
        Tap a package to select it
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {packages.map((pkg) => {
          const isSelected = pkg.id === selectedPackageId;
          return (
            <div
              key={pkg.id}
              className="min-w-72 max-w-80 shrink-0 snap-center rounded-xl border-2 p-5 cursor-pointer transition-all"
              style={
                isSelected
                  ? { borderColor: accentColor, backgroundColor: accentBgLight, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }
                  : { borderColor: "#e5e7eb", backgroundColor: "#ffffff" }
              }
              onClick={() => onPackageSelect(pkg.id)}
            >
              {pkg.badgeText && (
                <Badge
                  className="mb-3 text-white"
                  style={{
                    backgroundColor: pkg.badgeColor === "green" ? "#10b981" : accentColor,
                  }}
                >
                  {pkg.badgeText}
                </Badge>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">{pkg.name}</h3>
                <p className="text-3xl font-bold font-display mt-1">{currencySymbol}{pkg.price}</p>
                {locationFee > 0 && (
                  <p className="text-xs text-gray-500">+ {currencySymbol}{locationFee} {settings.stateFee.label?.toLowerCase() || "location fee"}</p>
                )}
                {pkg.processingTime && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                    {pkg.processingIcon === "zap" ? (
                      <Zap className="h-3 w-3" style={{ color: accentColor }} />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    <span>{pkg.processingTime}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {features
                  .slice(
                    0,
                    responsive.mobileCard.showAllFeatures
                      ? features.length
                      : responsive.mobileCard.keyFeaturesCount
                  )
                  .map((feature) => {
                    const mapping = feature.packageMappings.find(
                      (m) => m.packageId === pkg.id
                    );
                    const isIncluded =
                      mapping?.included ||
                      mapping?.valueType === "ADDON" ||
                      mapping?.valueType === "TEXT";

                    return (
                      <div
                        key={feature.id}
                        className={cn(
                          "flex items-start gap-2 text-sm",
                          !isIncluded && "text-gray-400"
                        )}
                      >
                        {isIncluded ? (
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0"
                            style={{ color: isSelected ? accentColor : "#6b7280" }}
                          />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                        )}
                        <span>{feature.text}</span>
                      </div>
                    );
                  })}
                {!responsive.mobileCard.showAllFeatures &&
                  features.length > responsive.mobileCard.keyFeaturesCount && (
                    <p className="text-xs text-gray-500 text-center">
                      +{features.length - responsive.mobileCard.keyFeaturesCount}{" "}
                      more features
                    </p>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN WIDGET COMPONENT
// =============================================================================

export function PricingTableWidget({
  settings: propsSettings,
  isPreview = false,
}: PricingTableWidgetProps) {
  const settings = useMemo(() => ({
    ...DEFAULT_PRICING_TABLE_SETTINGS,
    ...propsSettings,
    orderSummary: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.orderSummary,
      ...propsSettings.orderSummary,
      ctaButton: {
        ...DEFAULT_PRICING_TABLE_SETTINGS.orderSummary.ctaButton,
        ...propsSettings.orderSummary?.ctaButton,
      },
    },
    ctaButtons: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.ctaButtons,
      ...propsSettings.ctaButtons,
    },
    dataSource: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.dataSource,
      ...propsSettings.dataSource,
    },
  }), [propsSettings]);

  // Auto mode: resolve slug from ServiceContext
  const serviceContext = useOptionalServiceContext();
  const resolvedSlug = settings.dataSource.mode === "auto"
    ? serviceContext?.service?.slug
    : settings.dataSource.serviceSlug;

  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Fetch currency from business config
  useEffect(() => {
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.currency) {
          setCurrencySymbol(getCurrencySymbol(config.currency));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch service data
  useEffect(() => {
    async function fetchServiceData() {
      if (!resolvedSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/services/${resolvedSlug}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch service data");
        }

        const data = await response.json();
        setServiceData({
          id: data.id,
          slug: data.slug,
          name: data.name,
          comparisonFeatures: data.comparisonFeatures || [],
          packages: data.packages || [],
          hasLocationBasedPricing: data.hasLocationBasedPricing ?? false,
          displayOptions: data.displayOptions || {},
        });

        // Set default selected package
        const popularPkg = data.packages?.find(
          (p: Package) => p.isPopular
        );
        setSelectedPackageId(popularPkg?.id || data.packages?.[0]?.id || null);
      } catch (err) {
        console.error("Error fetching service data:", err);
        setError("Failed to load pricing data");
      } finally {
        setLoading(false);
      }
    }

    fetchServiceData();
  }, [resolvedSlug]);

  // Get selected package
  const selectedPackage = useMemo(
    () => serviceData?.packages.find((p) => p.id === selectedPackageId),
    [serviceData?.packages, selectedPackageId]
  );

  // Get location fee
  const locationFee = useMemo(
    () => selectedLocation?.fee || 0,
    [selectedLocation]
  );

  // Calculate totals
  const addonsTotal = useMemo(
    () => selectedAddons.reduce((sum, addon) => sum + addon.price, 0),
    [selectedAddons]
  );

  const grandTotal = useMemo(
    () => (selectedPackage?.price || 0) + locationFee + addonsTotal,
    [selectedPackage, locationFee, addonsTotal]
  );

  // Toggle addon selection
  const toggleAddon = (
    featureId: string,
    featureText: string,
    packageId: string,
    price: number
  ) => {
    setSelectedAddons((prev) => {
      const exists = prev.find(
        (a) => a.featureId === featureId && a.packageId === packageId
      );
      if (exists) {
        return prev.filter(
          (a) => !(a.featureId === featureId && a.packageId === packageId)
        );
      }
      return [...prev, { featureId, featureText, packageId, price }];
    });
  };

  // Check if addon is selected
  const isAddonSelected = (featureId: string, packageId: string) => {
    return selectedAddons.some(
      (a) => a.featureId === featureId && a.packageId === packageId
    );
  };

  // Handle package selection
  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
    // Clear addons from other packages
    setSelectedAddons((prev) => prev.filter((a) => a.packageId === packageId));
  };

  // Loading state
  if (loading) {
    return (
      <WidgetContainer container={settings.container}>
      <div>
        <SectionHeader settings={settings} />
        <div className="flex gap-6">
          <div className="flex-1">
            <div
              className="h-96 animate-pulse rounded-xl bg-muted/50"
              style={{ borderRadius: `${settings.tableStyle.borderRadius}px` }}
            />
          </div>
          {settings.orderSummary.enabled && (
            <div className="hidden lg:block w-80">
              <div className="h-64 animate-pulse rounded-xl bg-muted/50" />
            </div>
          )}
        </div>
      </div>
      </WidgetContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <WidgetContainer container={settings.container}>
      <div>
        <SectionHeader settings={settings} />
        <div className="flex items-center justify-center h-32 bg-destructive/10 rounded-xl border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
      </WidgetContainer>
    );
  }

  // No service selected
  if (!resolvedSlug || !serviceData) {
    const isAutoMode = settings.dataSource.mode === "auto";
    return (
      <WidgetContainer container={settings.container}>
      <div>
        <SectionHeader settings={settings} />
        <div className="flex items-center justify-center h-64 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/30">
          <div className="text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-2">
              No service selected
            </p>
            <p className="text-xs text-muted-foreground">
              {isAutoMode
                ? 'Mode is set to "Auto" — this only works on Service Detail pages. Switch to "Manual" mode and select a service in the widget settings.'
                : "Select a service in the widget settings to display the pricing table."}
            </p>
          </div>
        </div>
      </div>
      </WidgetContainer>
    );
  }

  // No packages
  if (serviceData.packages.length === 0) {
    return (
      <WidgetContainer container={settings.container}>
      <div>
        <SectionHeader settings={settings} />
        <div className="flex items-center justify-center h-32 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
          <p className="text-sm text-muted-foreground">
            No packages found for this service.
          </p>
        </div>
      </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer container={settings.container}>
    <div className="w-full">
      <div data-field-id="section-header">
        <SectionHeader settings={settings} />
      </div>

      {/* Location Selector - only show when both widget setting AND service DB flag are enabled */}
      {settings.stateFee.enabled && serviceData?.hasLocationBasedPricing && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium">{settings.stateFee.label}:</span>
          <LocationSelector
            value={selectedLocation}
            onChange={setSelectedLocation}
            serviceId={serviceData?.id}
            placeholder="Select location..."
            feeLabel={settings.stateFee.label || "fee"}
            className="w-64"
            currencySymbol={currencySymbol}
            accentColor={
              settings.cardStyle?.cardVariant === "forge" || settings.tableVariant === "forge"
                ? "#1b3a2d"
                : undefined
            }
          />
        </div>
      )}

      {/* View Mode: Cards */}
      {settings.viewMode === "cards" && (
        <div data-field-id="pricing-table">
        {settings.cardStyle?.cardVariant === "forge" ? (
          <PricingCardsForge
            settings={settings}
            features={serviceData.comparisonFeatures}
            packages={serviceData.packages}
            selectedPackageId={selectedPackageId}
            onPackageSelect={handlePackageSelect}
            selectedLocation={selectedLocation}
            locationFee={locationFee}
            serviceSlug={serviceData.slug}
            currencySymbol={currencySymbol}
            selectedAddons={selectedAddons}
            onToggleAddon={toggleAddon}
            isAddonSelected={isAddonSelected}
          />
        ) : (
          <PricingCardsView
            settings={settings}
            features={serviceData.comparisonFeatures}
            packages={serviceData.packages}
            selectedPackageId={selectedPackageId}
            onPackageSelect={handlePackageSelect}
            selectedLocation={selectedLocation}
            locationFee={locationFee}
            serviceSlug={serviceData.slug}
            currencySymbol={currencySymbol}
            selectedAddons={selectedAddons}
          />
        )}
        </div>
      )}

      {/* View Mode: Table - Desktop Layout */}
      {settings.viewMode === "table" && (
        <div data-field-id="pricing-table">
        {settings.tableVariant === "forge" ? (
          <PricingTableForge
            settings={settings}
            features={serviceData.comparisonFeatures}
            packages={serviceData.packages}
            selectedPackageId={selectedPackageId}
            onPackageSelect={handlePackageSelect}
            selectedLocation={selectedLocation}
            locationFee={locationFee}
            serviceSlug={serviceData.slug}
            currencySymbol={currencySymbol}
            selectedAddons={selectedAddons}
            onToggleAddon={toggleAddon}
            isAddonSelected={isAddonSelected}
          />
        ) : (
        <>
          {/* Desktop: full-width table, no sidebar */}
          <div className="hidden lg:block">
            <ComparisonTable
              settings={settings}
              features={serviceData.comparisonFeatures}
              packages={serviceData.packages}
              selectedPackageId={selectedPackageId}
              onPackageSelect={handlePackageSelect}
              locationFee={locationFee}
              selectedAddons={selectedAddons}
              onToggleAddon={toggleAddon}
              isAddonSelected={isAddonSelected}
              expandedFeature={expandedFeature}
              onExpandFeature={setExpandedFeature}
              currencySymbol={currencySymbol}
              serviceSlug={serviceData.slug}
            />
          </div>

          {/* Mobile: swipeable cards */}
          <div className="lg:hidden mt-8">
            <MobilePackageCards
              settings={settings}
              packages={serviceData.packages}
              features={serviceData.comparisonFeatures}
              selectedPackageId={selectedPackageId}
              onPackageSelect={handlePackageSelect}
              locationFee={locationFee}
              currencySymbol={currencySymbol}
            />
          </div>
        </>
        )}
        </div>
      )}
    </div>
    </WidgetContainer>
  );
}
