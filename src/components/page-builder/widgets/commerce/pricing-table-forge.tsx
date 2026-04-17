"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Check, X, Plus, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocationItem } from "@/components/ui/location-selector";
import type {
  PricingTableWidgetSettings,
  PricingFeatureValueType,
  ForgeCardOverride,
} from "@/lib/page-builder/types";

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

interface SelectedAddon {
  featureId: string;
  featureText: string;
  packageId: string;
  price: number;
}

interface PricingTableForgeProps {
  settings: PricingTableWidgetSettings;
  features: ComparisonFeature[];
  packages: Package[];
  selectedPackageId: string | null;
  onPackageSelect: (packageId: string) => void;
  selectedLocation: LocationItem | null;
  locationFee: number;
  serviceSlug: string;
  currencySymbol?: string;
  selectedAddons: SelectedAddon[];
  onToggleAddon: (featureId: string, featureText: string, packageId: string, price: number) => void;
  isAddonSelected: (featureId: string, packageId: string) => boolean;
}

// =============================================================================
// INFO TOOLTIP
// =============================================================================

function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      className="info-icon relative inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border-[1.5px] border-[rgba(14,17,9,0.16)] bg-transparent text-[9px] font-bold ml-1.5 cursor-default shrink-0 group/tip"
      style={{ fontFamily: "var(--font-accent, Georgia, serif)", color: "#8a9086" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1b3a2d"; e.currentTarget.style.color = "#1b3a2d"; e.currentTarget.style.backgroundColor = "rgba(27,58,45,0.07)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(14,17,9,0.16)"; e.currentTarget.style.color = "#8a9086"; e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      i
      <span
        className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1.25 bg-[#0e1109] text-[rgba(255,255,255,0.88)] text-[11.5px] font-normal px-3.25 py-2.5 rounded-[9px] w-55 text-left opacity-0 pointer-events-none transition-all duration-150 whitespace-normal shadow-[0_10px_30px_rgba(0,0,0,0.22)] group-hover/tip:opacity-100 group-hover/tip:translate-y-0 z-[300]"
        style={{ fontFamily: "var(--font-sans, Inter, sans-serif)", fontStyle: "normal" }}
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#0e1109]" />
      </span>
    </span>
  );
}

// =============================================================================
// FORGE TABLE COMPONENT
// =============================================================================

export function PricingTableForge({
  settings,
  features,
  packages,
  selectedPackageId,
  onPackageSelect,
  selectedLocation,
  locationFee,
  serviceSlug,
  currencySymbol = "$",
  selectedAddons,
  onToggleAddon,
  isAddonSelected,
}: PricingTableForgeProps) {
  const overrides = settings.forgeCardOverrides || [];
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [expandedAddons, setExpandedAddons] = useState<Record<string, boolean>>({});
  const [headerOffset, setHeaderOffset] = useState(0);

  useEffect(() => {
    const measure = () => {
      // Find every sticky/fixed element pinned at the top of the viewport
      // and use the maximum bottom edge as our offset.
      let maxBottom = 0;
      document.querySelectorAll("header, [data-sticky-top]").forEach((el) => {
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

  // Sort packages by price ascending
  const sortedPackages = [...packages].sort((a, b) => a.price - b.price);
  const colCount = sortedPackages.length;

  // Separate boolean features from addon features
  const booleanFeatures = features.filter((f) => {
    // A feature is "boolean" if at least one package maps it as BOOLEAN
    return f.packageMappings.some(
      (m) => m.valueType === "BOOLEAN" || (m.valueType !== "ADDON" && m.included)
    );
  });

  const addonFeatures = features.filter((f) => {
    // A feature is "addon" if at least one package maps it as ADDON
    return f.packageMappings.some((m) => m.valueType === "ADDON");
  });

  // Remove addon features from boolean features list (avoid double-display)
  const coreFeatures = booleanFeatures.filter(
    (f) => !addonFeatures.find((af) => af.id === f.id)
  );

  const getOverride = (index: number): ForgeCardOverride | undefined =>
    overrides.find((o) => o.packageIndex === index);

  const toggleAddonDetail = (key: string) =>
    setExpandedAddons((prev) => ({ ...prev, [key]: !prev[key] }));

  const getCheckoutUrl = useCallback(
    (pkg: Package) => {
      const pkgAddons = selectedAddons.filter((a) => a.packageId === pkg.id);
      return `/checkout/${serviceSlug}?package=${encodeURIComponent(pkg.name.toLowerCase())}${selectedLocation ? `&location=${selectedLocation.code}` : ""}${pkgAddons.length > 0 ? `&addons=${pkgAddons.map((a) => a.featureId).join(",")}` : ""}`;
    },
    [serviceSlug, selectedLocation, selectedAddons]
  );

  // Button variant styles
  const buttonStyles: Record<string, string> = {
    "outline-dark":
      "bg-transparent text-[#1a1f16] border-[1.5px] border-[rgba(14,17,9,0.1)] hover:border-[#1a1f16] hover:bg-[rgba(27,58,45,0.04)]",
    forest:
      "bg-[#1b3a2d] text-white border-[1.5px] border-[#1b3a2d] hover:bg-[#0f2318] hover:shadow-[0_8px_24px_rgba(27,58,45,0.3)] hover:-translate-y-0.5",
    coral:
      "bg-[#e84c1e] text-white border-[1.5px] border-[#e84c1e] hover:bg-[#d13d10] hover:shadow-[0_8px_24px_rgba(232,76,30,0.35)] hover:-translate-y-0.5",
  };

  // Determine which column is "active" (recommended/popular or selected)
  const activeColIndex = sortedPackages.findIndex(
    (p) => p.id === selectedPackageId
  );
  const recommendedColIndex = sortedPackages.findIndex((p) => p.isPopular);

  return (
    <div className="overflow-x-auto md:overflow-x-visible md:overflow-y-visible -webkit-overflow-scrolling-touch">
      <div
        className="rounded-[20px] border-[1.5px] border-[rgba(14,17,9,0.1)] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative"
        style={{ minWidth: "640px" }}
      >
        <table className="w-full border-separate border-spacing-0 table-fixed">
          {/* ============= HEADER ============= */}
          <thead className="md:sticky" style={{ top: "200px", zIndex: 60 }}>
            <tr>
              {/* Feature column header */}
              <th
                className="w-[38%] p-0 bg-white text-left align-bottom border-b-[1.5px] border-[rgba(14,17,9,0.1)] rounded-tl-[20px]"
                style={{ minWidth: "180px" }}
              >
                <div
                  className="px-7 pt-7 pb-6 text-[17px] font-extrabold text-[#0e1109]"
                  style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                >
                  Business Formation
                  <br />
                  Packages
                </div>
              </th>

              {/* Plan columns */}
              {sortedPackages.map((pkg, colIdx) => {
                const override = getOverride(colIdx);
                const isActive = activeColIndex === colIdx;
                const isRecommended = pkg.isPopular;
                const isHovered = hoveredCol === colIdx;
                const isLast = colIdx === colCount - 1;

                return (
                  <th
                    key={pkg.id}
                    className={cn(
                      "p-0 bg-white text-center align-bottom border-b-[1.5px] border-[rgba(14,17,9,0.1)] relative transition-colors duration-150",
                      isLast && "rounded-tr-[20px]",
                      isHovered && "bg-[rgba(27,58,45,0.02)]"
                    )}
                    style={{ width: `${62 / colCount}%` }}
                    onMouseEnter={() => setHoveredCol(colIdx)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    {/* RECOMMENDED badge */}
                    {isRecommended && (
                      <div
                        className="absolute -top-[13px] left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.6px] text-white whitespace-nowrap z-[3]"
                        style={{
                          fontFamily: "var(--font-heading, Outfit, sans-serif)",
                          backgroundColor: "#e84c1e",
                        }}
                      >
                        Recommended
                      </div>
                    )}

                    {/* Plan button */}
                    <div className="px-4 pt-5 pb-6">
                      <button
                        onClick={() => onPackageSelect(pkg.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 w-full py-3.5 px-5 rounded-xl border-2 cursor-pointer transition-all duration-250",
                          isActive
                            ? "border-[#1b3a2d] bg-[#1b3a2d]"
                            : "border-[rgba(14,17,9,0.1)] bg-white hover:border-[#1b3a2d] hover:bg-[rgba(27,58,45,0.07)]"
                        )}
                      >
                        {/* Plan name */}
                        <span
                          className={cn(
                            "text-[15px] font-extrabold tracking-[-0.01em]",
                            isActive ? "text-[#faf8f4]" : "text-[#0e1109]"
                          )}
                          style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                        >
                          {pkg.name}
                        </span>

                        {/* Price */}
                        <span className="flex items-baseline gap-0.5 leading-[1.1]">
                          {(() => {
                            const addonTotal = selectedAddons
                              .filter((a) => a.packageId === pkg.id)
                              .reduce((sum, a) => sum + a.price, 0);
                            return (
                              <span
                                className={cn(
                                  "text-[28px] font-black tracking-[-0.03em]",
                                  isActive ? "text-[#faf8f4]" : "text-[#0e1109]"
                                )}
                                style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                              >
                                {currencySymbol}{Math.floor(pkg.price + addonTotal + locationFee)}
                              </span>
                            );
                          })()}
                          {/* Compare-at price */}
                          {pkg.compareAtPrice && (
                            <span
                              className={cn(
                                "text-[14px] font-semibold line-through ml-1.5 align-middle",
                                isActive ? "text-[rgba(250,248,244,0.35)]" : "text-[#8a9086]"
                              )}
                              style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                            >
                              {currencySymbol}{Math.floor(pkg.compareAtPrice)}
                            </span>
                          )}
                          <sub
                            className={cn(
                              "text-[12px] font-medium ml-0.5",
                              isActive ? "text-[rgba(250,248,244,0.5)]" : "text-[#8a9086]"
                            )}
                          >
                            {locationFee > 0
                              ? `+${currencySymbol}${locationFee} state fee`
                              : "+ state fee"}
                          </sub>
                        </span>

                        {/* Processing time */}
                        {pkg.processingTime && (
                          <span
                            className={cn(
                              "flex items-center gap-1 text-[11px] font-semibold mt-0.5",
                              isActive ? "text-[rgba(250,248,244,0.6)]" : "text-[#8a9086]"
                            )}
                          >
                            {pkg.processingIcon === "zap" ? (
                              <Zap className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
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

          {/* ============= BODY ============= */}
          <tbody>
            {/* Core feature rows */}
            {coreFeatures.map((feature, rowIdx) => {
              const isAlt = rowIdx % 2 === 1;
              return (
                <tr
                  key={feature.id}
                  className={cn(
                    "transition-colors duration-150",
                    isAlt ? "bg-[rgba(27,58,45,0.015)]" : "bg-transparent",
                    "hover:bg-[rgba(27,58,45,0.02)]",
                    isAlt && "hover:bg-[rgba(27,58,45,0.035)]"
                  )}
                >
                  {/* Feature name */}
                  <td className="py-3.5 px-7 border-b border-[rgba(14,17,9,0.06)] text-[14px] font-medium text-[#1a1f16] align-middle leading-[1.5] sticky left-0 z-[2] md:static bg-inherit">
                    <span className="inline-flex items-center">
                      {feature.text}
                      {feature.tooltip && <InfoTooltip text={feature.tooltip} />}
                    </span>
                  </td>

                  {/* Value cells */}
                  {sortedPackages.map((pkg, colIdx) => {
                    const mapping = feature.packageMappings.find(
                      (m) => m.packageId === pkg.id
                    );
                    const included = mapping?.included ?? false;
                    const isActiveCol = activeColIndex === colIdx;
                    const isHovered = hoveredCol === colIdx;

                    return (
                      <td
                        key={pkg.id}
                        className={cn(
                          "py-3.5 px-4 border-b border-[rgba(14,17,9,0.06)] text-center align-middle cursor-pointer transition-colors duration-150",
                          isHovered && (isAlt ? "!bg-[rgba(27,58,45,0.05)]" : "!bg-[rgba(27,58,45,0.035)]")
                        )}
                        onClick={() => onPackageSelect(pkg.id)}
                        onMouseEnter={() => setHoveredCol(colIdx)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        {included ? (
                          <span
                            className={cn(
                              "w-7 h-7 rounded-full inline-flex items-center justify-center transition-transform duration-200 hover:scale-110",
                              isActiveCol
                                ? "bg-[#1b3a2d]"
                                : "bg-[rgba(27,58,45,0.08)]"
                            )}
                          >
                            <Check
                              className={cn(
                                "w-3.5 h-3.5",
                                isActiveCol
                                  ? "text-[#faf8f4]"
                                  : "text-[#1b3a2d]"
                              )}
                              strokeWidth={3}
                            />
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-full inline-flex items-center justify-center bg-[rgba(14,17,9,0.04)]">
                            <X
                              className="w-3 h-3 text-[rgba(14,17,9,0.2)]"
                              strokeWidth={2}
                            />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* ============= ADD-ON SEPARATOR ============= */}
            {addonFeatures.length > 0 && (
              <tr className="hover:bg-transparent!">
                <td
                  colSpan={colCount + 1}
                  className="border-b border-[rgba(14,17,9,0.08)] bg-[#faf8f4] px-7 pt-5 pb-2.5"
                >
                  <span
                    className="text-[13px] font-bold uppercase tracking-[1.2px] text-[#8a9086]"
                    style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                  >
                    Optional Add-Ons
                  </span>
                </td>
              </tr>
            )}

            {/* Add-on rows */}
            {addonFeatures.map((feature) => {
              const addonKey = feature.id;
              const isExpanded = expandedAddons[addonKey];

              return (
                <React.Fragment key={feature.id}>
                <tr className="group/addon">
                  {/* Addon name */}
                  <td className="py-3.5 px-7 border-b border-[rgba(14,17,9,0.06)] bg-[rgba(250,248,244,0.5)] group-hover/addon:bg-[rgba(27,58,45,0.03)] transition-colors duration-150 align-middle sticky left-0 z-2 md:static">
                    <div className="flex items-center gap-2">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleAddonDetail(addonKey)}
                        className={cn(
                          "w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200",
                          isExpanded
                            ? "border-[#1b3a2d] bg-[rgba(27,58,45,0.08)] text-[#1b3a2d]"
                            : "border-[rgba(14,17,9,0.1)] bg-white text-[#8a9086] hover:border-[#1b3a2d] hover:text-[#1b3a2d] hover:bg-[rgba(27,58,45,0.06)]"
                        )}
                      >
                        <Plus
                          className={cn(
                            "w-3 h-3 transition-transform duration-300",
                            isExpanded && "rotate-45"
                          )}
                          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                        />
                      </button>

                      {/* Name + price */}
                      <span className="text-[14px] font-medium text-[#1a1f16]">
                        {feature.text}
                      </span>
                      {feature.tooltip && <InfoTooltip text={feature.tooltip} />}
                    </div>

                  </td>

                  {/* Per-package cells */}
                  {sortedPackages.map((pkg, colIdx) => {
                    const mapping = feature.packageMappings.find(
                      (m) => m.packageId === pkg.id
                    );
                    const isHovered = hoveredCol === colIdx;
                    const isAddon = mapping?.valueType === "ADDON";
                    const isIncluded = mapping?.valueType === "BOOLEAN" && mapping.included;
                    const addonPrice = mapping?.addonPriceUSD;
                    const priceLabel = mapping?.customValue || (addonPrice ? `+${currencySymbol}${addonPrice}` : "");

                    return (
                      <td
                        key={pkg.id}
                        className={cn(
                          "py-3.5 px-4 border-b border-[rgba(14,17,9,0.06)] text-center align-middle bg-[rgba(250,248,244,0.5)] group-hover/addon:bg-[rgba(27,58,45,0.03)] transition-colors duration-150",
                          isHovered && "!bg-[rgba(27,58,45,0.055)]"
                        )}
                        onMouseEnter={() => setHoveredCol(colIdx)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        {isIncluded ? (
                          <span className="text-[12px] font-semibold text-[#1b3a2d]">
                            Included
                          </span>
                        ) : isAddon ? (
                          <div className="flex flex-col items-center gap-1">
                            {priceLabel && (
                              <span
                                className="text-[12px] font-bold text-[#4b5249]"
                                style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                              >
                                {priceLabel}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleAddon(feature.id, feature.text, pkg.id, mapping?.addonPriceUSD || 0);
                              }}
                              className={cn(
                                "text-[11px] font-bold px-3 py-1 rounded-full border-[1.5px] cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 leading-none",
                                isAddonSelected(feature.id, pkg.id)
                                  ? "bg-[#1b3a2d] text-white border-[#1b3a2d] hover:bg-[#0f2318] hover:border-[#0f2318]"
                                  : "bg-transparent text-[#1b3a2d] border-[#1b3a2d] hover:bg-[#1b3a2d] hover:text-white"
                              )}
                            >
                              {isAddonSelected(feature.id, pkg.id) ? "✓ Added" : "+ Add"}
                            </button>
                          </div>
                        ) : (
                          <span className="w-7 h-7 rounded-full inline-flex items-center justify-center bg-[rgba(14,17,9,0.04)]">
                            <X className="w-3 h-3 text-[rgba(14,17,9,0.2)]" strokeWidth={2} />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {isExpanded && (feature.description || feature.tooltip) && (
                  <tr>
                    <td
                      colSpan={colCount + 1}
                      className="border-b border-[rgba(14,17,9,0.06)] bg-[rgba(250,248,244,0.5)] px-7 pb-4"
                      style={{ paddingTop: 0 }}
                    >
                      <div className="pl-8 pt-2.5 pb-1 text-[12.5px] text-[#4b5249] leading-[1.65] border-t border-dashed border-[rgba(14,17,9,0.1)]">
                        {feature.description || feature.tooltip}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* ============= FOOTER ============= */}
          <tfoot>
            <tr>
              <td className="px-7 py-5 bg-white border-t-[1.5px] border-[rgba(14,17,9,0.1)] rounded-bl-[20px] sticky left-0 z-[2] md:static" />
              {sortedPackages.map((pkg, colIdx) => {
                const override = getOverride(colIdx);
                const isLast = colIdx === colCount - 1;
                const isHovered = hoveredCol === colIdx;

                return (
                  <td
                    key={pkg.id}
                    className={cn(
                      "px-4 py-5 bg-white border-t-[1.5px] border-[rgba(14,17,9,0.1)] text-center transition-colors duration-150",
                      isLast && "rounded-br-[20px]",
                      isHovered && "bg-[rgba(27,58,45,0.02)]"
                    )}
                    onMouseEnter={() => setHoveredCol(colIdx)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <Link
                      href={getCheckoutUrl(pkg)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold text-[15px] transition-all duration-200",
                        buttonStyles[override?.buttonVariant || "outline-dark"]
                      )}
                      style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}
                    >
                      Get Started →
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
