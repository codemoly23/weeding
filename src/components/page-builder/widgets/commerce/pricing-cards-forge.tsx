"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Plus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocationItem } from "@/components/ui/location-selector";
import type {
  PricingTableWidgetSettings,
  PricingFeatureValueType,
  ForgeCardOverride,
} from "@/lib/page-builder/types";

// =============================================================================
// FORGE DESIGN TOKENS (hardcoded — this variant has its own color palette)
// =============================================================================

const FOREST = "#1b3a2d";
const FOREST_DARK = "#0f2318";
const FOREST_LIGHT = "rgba(27,58,45,0.07)";
const FOREST_BG = "rgba(27,58,45,0.08)";
const CORAL = "#e84c1e";
const CORAL_DARK = "#d13d10";
const INK = "#0e1109";
const TEXT_MID = "#4b5249";
const TEXT_FAINT = "#8a9086";
const BORDER = "rgba(14,17,9,0.1)";
const BORDER_LIGHT = "rgba(14,17,9,0.05)";

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

interface PricingCardsForgeProps {
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
// TOOLTIP COMPONENT
// =============================================================================

function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      className="info-icon relative inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border-[1.5px] border-[rgba(14,17,9,0.16)] bg-transparent text-[9px] font-bold ml-1.5 cursor-default shrink-0 group/tip"
      style={{
        fontFamily: "var(--font-accent)",
        color: TEXT_FAINT,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = FOREST; e.currentTarget.style.color = FOREST; e.currentTarget.style.backgroundColor = FOREST_LIGHT; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(14,17,9,0.16)"; e.currentTarget.style.color = TEXT_FAINT; e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      i
      <span
        className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-[5px] bg-[#0e1109] text-[rgba(255,255,255,0.88)] text-[11.5px] font-normal px-[13px] py-[10px] rounded-[9px] w-[220px] text-left opacity-0 pointer-events-none transition-all duration-150 whitespace-normal shadow-[0_10px_30px_rgba(0,0,0,0.22)] group-hover/tip:opacity-100 group-hover/tip:translate-y-0 z-50"
        style={{ fontFamily: "var(--font-sans, Inter, sans-serif)", fontStyle: "normal" }}
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#0e1109]" />
      </span>
    </span>
  );
}

// =============================================================================
// FORGE PRICING CARDS COMPONENT
// =============================================================================

export function PricingCardsForge({
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
}: PricingCardsForgeProps) {
  const overrides = settings.forgeCardOverrides || [];
  const [expandedAddons, setExpandedAddons] = useState<Record<string, boolean>>({});

  // Sort packages by price ascending for tier grouping logic
  const sortedPackages = [...packages].sort((a, b) => a.price - b.price);

  // Track feature IDs that were promoted from addon → included
  const promotedFromAddon = new Set<string>();

  // Build per-package feature groups
  const getPackageFeatureGroups = (pkg: Package, pkgIndex: number) => {
    const prevPkg = pkgIndex > 0 ? sortedPackages[pkgIndex - 1] : null;

    const inheritedFeatures: ComparisonFeature[] = [];
    const newFeatures: ComparisonFeature[] = [];
    const addonFeatures: ComparisonFeature[] = [];

    for (const feature of features) {
      const mapping = feature.packageMappings.find((m) => m.packageId === pkg.id);
      if (!mapping) continue;

      // Add-on features go to separate section
      if (mapping.valueType === "ADDON") {
        addonFeatures.push(feature);
        continue;
      }

      if (!mapping.included) continue;

      // Check if this feature was included in the previous (lower) tier
      if (prevPkg) {
        const prevMapping = feature.packageMappings.find((m) => m.packageId === prevPkg.id);
        if (prevMapping?.included && prevMapping.valueType !== "ADDON") {
          inheritedFeatures.push(feature);
        } else {
          newFeatures.push(feature);
        }
      } else {
        newFeatures.push(feature);
      }
    }

    // For higher tiers: features included as BOOLEAN that were ADDON in lower tiers
    // (e.g., "Expedited 3-day Processing — Included")
    for (const feature of features) {
      const mapping = feature.packageMappings.find((m) => m.packageId === pkg.id);
      if (!mapping || mapping.valueType !== "BOOLEAN" || !mapping.included) continue;

      if (prevPkg) {
        const prevMapping = feature.packageMappings.find((m) => m.packageId === prevPkg.id);
        if (prevMapping?.valueType === "ADDON") {
          const addonIdx = addonFeatures.findIndex((f) => f.id === feature.id);
          if (addonIdx >= 0) addonFeatures.splice(addonIdx, 1);
          if (!newFeatures.find((f) => f.id === feature.id)) {
            newFeatures.push(feature);
            promotedFromAddon.add(feature.id);
          }
        }
      }
    }

    return { inheritedFeatures, newFeatures, addonFeatures, prevPkgName: prevPkg?.name };
  };

  const toggleAddon = (key: string) => {
    setExpandedAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getOverride = (index: number): ForgeCardOverride | undefined => {
    return overrides.find((o) => o.packageIndex === index);
  };

  // Button variant styles — hardcoded forge colors
  const buttonStyles: Record<string, string> = {
    "outline-dark": `bg-transparent text-[${INK}] border-[1.5px] border-[${BORDER}] hover:border-[${INK}] hover:bg-[${FOREST_LIGHT}]`,
    forest: `bg-[${FOREST}] text-white border-[1.5px] border-[${FOREST}] hover:bg-[${FOREST_DARK}] hover:shadow-[0_8px_24px_rgba(27,58,45,0.3)] hover:-translate-y-0.5`,
    coral: `bg-[${CORAL}] text-white border-[1.5px] border-[${CORAL}] hover:bg-[${CORAL_DARK}] hover:shadow-[0_8px_24px_rgba(232,76,30,0.35)] hover:-translate-y-0.5`,
  };

  return (
    <div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      style={{ gap: `${settings.cardStyle.gap || 24}px` }}
    >
      {sortedPackages.map((pkg, index) => {
        const override = getOverride(index);
        const isPopular = pkg.isPopular;
        const isSelected = selectedPackageId === pkg.id;
        const { inheritedFeatures, newFeatures, addonFeatures, prevPkgName } =
          getPackageFeatureGroups(pkg, index);

        const pkgAddons = selectedAddons.filter((a) => a.packageId === pkg.id);
        const checkoutUrl = `/checkout/${serviceSlug}?package=${encodeURIComponent(pkg.name.toLowerCase())}${selectedLocation ? `&location=${selectedLocation.code}` : ""}${pkgAddons.length > 0 ? `&addons=${pkgAddons.map((a) => a.featureId).join(",")}` : ""}`;

        return (
          <div
            key={pkg.id}
            className={cn(
              "relative flex flex-col rounded-[20px] p-7 sm:p-9 border-[1.5px] transition-all duration-300 cursor-pointer",
              isPopular && "bg-gradient-to-br from-[rgba(27,58,45,0.04)] to-white",
              "hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(0,0,0,0.07)]"
            )}
            style={{
              borderColor: isPopular ? FOREST : BORDER,
              boxShadow: isPopular ? `0 0 0 1px ${FOREST}` : undefined,
            }}
            onClick={() => onPackageSelect(pkg.id)}
          >
            {/* MOST POPULAR Badge */}
            {isPopular && (
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap z-10"
                style={{
                  fontFamily: "var(--font-heading)",
                  backgroundColor: FOREST,
                }}
              >
                {pkg.badgeText || "Most Popular"}
              </div>
            )}

            {/* Selection Ring */}
            <div
              className="absolute top-[18px] right-[18px] w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all duration-250"
              style={{
                backgroundColor: isSelected ? FOREST : "transparent",
                borderColor: isSelected ? FOREST : BORDER,
              }}
            >
              <Check
                className={cn(
                  "w-[11px] h-[11px] text-white transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
            </div>

            {/* Tier Label */}
            {override?.tierLabel && (
              <div
                className="text-[11px] font-bold uppercase tracking-[1.2px] mb-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: TEXT_FAINT,
                }}
              >
                {override.tierLabel}
              </div>
            )}

            {/* Package Name */}
            <h3
              className="text-[26px] font-extrabold mb-1.5 pr-7"
              style={{
                fontFamily: "var(--font-heading)",
                color: INK,
              }}
            >
              {pkg.name}
            </h3>

            {/* Tagline */}
            {override?.tagline && (
              <p className="text-[14px] mb-5 leading-[1.4]" style={{ color: TEXT_MID }}>
                {override.tagline}
              </p>
            )}

            {/* Savings Callout */}
            {override?.savingsText && (
              <div
                className="flex items-center gap-1.5 rounded-md px-3 py-2 mb-5 text-[11px] font-semibold"
                style={{
                  fontFamily: "var(--font-heading)",
                  backgroundColor: FOREST_BG,
                  color: FOREST,
                }}
              >
                <Check className="w-3 h-3 shrink-0" />
                {override.savingsText}
              </div>
            )}

            {/* Price */}
            {(() => {
              const addonTotal = selectedAddons
                .filter((a) => a.packageId === pkg.id)
                .reduce((sum, a) => sum + a.price, 0);
              const displayPrice = Math.floor(pkg.price + addonTotal + locationFee);

              return (
                <div className="mb-1.5">
                  <span
                    className="text-[52px] font-black leading-none tracking-[-0.04em]"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: INK,
                    }}
                  >
                    <sup className="text-[26px] align-top mt-3 inline-block">{currencySymbol}</sup>
                    {displayPrice}
                  </span>
                  <sub className="text-[16px] font-medium ml-0.5" style={{ color: TEXT_MID }}>
                    {locationFee > 0
                      ? `+${currencySymbol}${locationFee} state fee`
                      : "+state fee"}
                  </sub>
                  {addonTotal > 0 && (
                    <div className="text-[11px] mt-1" style={{ color: FOREST }}>
                      Base {currencySymbol}{Math.floor(pkg.price)} + {currencySymbol}{Math.floor(addonTotal)} add-ons
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Price Note (Was $X + details) */}
            {override?.priceNote && (
              <div
                className="text-[12px] mt-2 mb-5 pb-5 border-b"
                style={{ color: TEXT_FAINT, borderColor: BORDER }}
              >
                {override.priceNote}
              </div>
            )}

            {/* Feature List */}
            <ul className="flex-1 flex flex-col gap-0 mb-6 list-none">
              {/* "All X plan features included" summary */}
              {prevPkgName && inheritedFeatures.length > 0 && (
                <li
                  className="flex items-start gap-2.5 py-[7px] text-[13.5px] border-b"
                  style={{ borderColor: BORDER_LIGHT }}
                >
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: FOREST }} />
                  <span className="flex items-center gap-1 flex-wrap">
                    <span className="font-medium">All {prevPkgName} plan features included</span>
                    <InfoTooltip
                      text={`Includes ${inheritedFeatures.map((f) => f.text).join(", ")}.`}
                    />
                  </span>
                </li>
              )}

              {/* New features for this tier */}
              {newFeatures.map((feature) => {
                const mapping = feature.packageMappings.find((m) => m.packageId === pkg.id);
                const isPromoted = promotedFromAddon.has(feature.id);

                return (
                  <li
                    key={feature.id}
                    className="flex items-start gap-2.5 py-[7px] text-[13.5px] border-b last:border-b-0"
                    style={{ borderColor: BORDER_LIGHT }}
                  >
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: FOREST }} />
                    <span className="flex items-center gap-1 flex-wrap">
                      <span>
                        {feature.text}
                        {isPromoted && (
                          <span className="font-semibold"> — Included</span>
                        )}
                      </span>
                      {/* Worth value from description */}
                      {feature.description && !isPromoted && (
                        <span className="text-[11px] font-normal" style={{ color: TEXT_FAINT }}>
                          ({feature.description})
                        </span>
                      )}
                      {/* Custom value from mapping */}
                      {mapping?.customValue && !feature.description && !isPromoted && (
                        <span className="text-[11px] font-normal" style={{ color: TEXT_FAINT }}>
                          ({mapping.customValue})
                        </span>
                      )}
                      {/* Tooltip */}
                      {feature.tooltip && <InfoTooltip text={feature.tooltip} />}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Add-ons Section */}
            {addonFeatures.length > 0 && (
              <ul className="flex flex-col gap-0 mb-6 list-none">
                {addonFeatures.map((feature) => {
                  const mapping = feature.packageMappings.find((m) => m.packageId === pkg.id);
                  const addonKey = `${pkg.id}-${feature.id}`;
                  const isExpanded = expandedAddons[addonKey];
                  const price = mapping?.addonPriceUSD;
                  const priceLabel = mapping?.customValue || (price ? `${currencySymbol}${price}` : "");
                  const isAdded = isAddonSelected(feature.id, pkg.id);

                  return (
                    <li
                      key={feature.id}
                      className="flex flex-col border-b last:border-b-0"
                      style={{ borderColor: BORDER_LIGHT, color: TEXT_MID }}
                    >
                      <div className="flex items-center gap-2.5 py-2">
                        {/* Toggle button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAddon(addonKey);
                          }}
                          className="w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200"
                          style={{
                            borderColor: isExpanded ? FOREST : BORDER,
                            backgroundColor: isExpanded ? FOREST_BG : "white",
                            color: isExpanded ? FOREST : TEXT_FAINT,
                          }}
                          onMouseEnter={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.borderColor = FOREST;
                              e.currentTarget.style.color = FOREST;
                              e.currentTarget.style.backgroundColor = FOREST_LIGHT;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.borderColor = BORDER;
                              e.currentTarget.style.color = TEXT_FAINT;
                              e.currentTarget.style.backgroundColor = "white";
                            }
                          }}
                        >
                          <Plus
                            className={cn(
                              "w-3 h-3 transition-transform duration-300",
                              isExpanded && "rotate-45"
                            )}
                          />
                        </button>

                        {/* Name + price */}
                        <span className="text-[13.5px] font-medium flex-1">{feature.text}</span>
                        <span
                          className="text-[12px] font-bold whitespace-nowrap mr-1.5"
                          style={{
                            fontFamily: "var(--font-heading)",
                            color: TEXT_MID,
                          }}
                        >
                          {priceLabel}
                        </span>

                        {/* + Add button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleAddon(feature.id, feature.text, pkg.id, price || 0);
                          }}
                          className="text-[11px] font-bold px-3 py-1 rounded-full border-[1.5px] cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 leading-none"
                          style={{
                            borderColor: FOREST,
                            color: isAdded ? "white" : FOREST,
                            backgroundColor: isAdded ? FOREST : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (isAdded) {
                              e.currentTarget.style.backgroundColor = FOREST_DARK;
                              e.currentTarget.style.borderColor = FOREST_DARK;
                            } else {
                              e.currentTarget.style.backgroundColor = FOREST;
                              e.currentTarget.style.color = "white";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = FOREST;
                            if (isAdded) {
                              e.currentTarget.style.backgroundColor = FOREST;
                              e.currentTarget.style.color = "white";
                            } else {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = FOREST;
                            }
                          }}
                        >
                          {isAdded ? "✓ Added" : "+ Add"}
                        </button>
                      </div>

                      {/* Expandable description */}
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300",
                          isExpanded ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        {feature.tooltip && (
                          <p className="text-[11px] pl-[34px] pb-2 leading-[1.5]" style={{ color: TEXT_FAINT }}>
                            {feature.tooltip}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* CTA Button */}
            <Link
              href={checkoutUrl}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold text-[15px] transition-all duration-200",
                buttonStyles[override?.buttonVariant || "outline-dark"]
              )}
              style={{ fontFamily: "var(--font-heading)" }}
              onClick={(e) => e.stopPropagation()}
            >
              Get Started →
            </Link>
          </div>
        );
      })}
    </div>
  );
}
