"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ArrowRight, BadgeCheck, Heart, Building2, Camera, Video, Utensils, Music, Flower2, Shirt, Gem, Palette, Car, Sparkles, CalendarDays, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import type { VendorListingWidgetSettings } from "@/lib/page-builder/types";

// ── Vendor data shape from /api/vendors ─────────────────────────────────────

interface VendorItem {
  id: string;
  slug: string;
  businessName: string;
  category: string;
  tagline: string | null;
  city: string | null;
  country: string | null;
  coverPhoto: string | null;
  startingPrice: number | null;
  currency: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  avgRating: number | null;
  reviewCount: number;
}

// ── Category label + icon map ────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; Icon: React.ElementType }> = {
  VENUE:           { label: "Venue",           Icon: Building2 },
  PHOTOGRAPHY:     { label: "Photography",     Icon: Camera },
  VIDEOGRAPHY:     { label: "Videography",     Icon: Video },
  CATERING:        { label: "Catering",        Icon: Utensils },
  MUSIC_DJ:        { label: "Music / DJ",      Icon: Music },
  FLOWERS:         { label: "Flowers",         Icon: Flower2 },
  DRESS_ATTIRE:    { label: "Dress & Attire",  Icon: Shirt },
  RINGS:           { label: "Rings",           Icon: Gem },
  DECORATIONS:     { label: "Decorations",     Icon: Palette },
  TRANSPORTATION:  { label: "Transportation",  Icon: Car },
  HAIR_MAKEUP:     { label: "Hair & Makeup",   Icon: Sparkles },
  WEDDING_PLANNER: { label: "Wedding Planner", Icon: CalendarDays },
  OTHER:           { label: "Other",           Icon: HelpCircle },
};

const CATEGORY_PLACEHOLDER: Record<string, string> = {
  VENUE:           "https://picsum.photos/seed/venue-hall/800/600",
  PHOTOGRAPHY:     "https://picsum.photos/seed/photography/800/600",
  VIDEOGRAPHY:     "https://picsum.photos/seed/videography/800/600",
  CATERING:        "https://picsum.photos/seed/catering-food/800/600",
  MUSIC_DJ:        "https://picsum.photos/seed/music-dj/800/600",
  FLOWERS:         "https://picsum.photos/seed/flowers-bouquet/800/600",
  DRESS_ATTIRE:    "https://picsum.photos/seed/wedding-dress/800/600",
  RINGS:           "https://picsum.photos/seed/wedding-rings/800/600",
  DECORATIONS:     "https://picsum.photos/seed/event-decor/800/600",
  TRANSPORTATION:  "https://picsum.photos/seed/luxury-car/800/600",
  HAIR_MAKEUP:     "https://picsum.photos/seed/hair-makeup/800/600",
  WEDDING_PLANNER: "https://picsum.photos/seed/wedding-plan/800/600",
  OTHER:           "https://picsum.photos/seed/event-other/800/600",
};

// ── Widget ───────────────────────────────────────────────────────────────────

interface VendorListingWidgetProps {
  settings: VendorListingWidgetSettings;
  isPreview?: boolean;
}

export function VendorListingWidget({ settings, isPreview = false }: VendorListingWidgetProps) {
  const {
    badge,
    title,
    subtitle,
    headerTextColor = "#0f172a",
    category,
    limit,
    featuredOnly,
    showViewAll,
    viewAllText = "View All Vendors",
    viewAllLink = "/vendors",
    columns,
    container,
    cardStyle = "overlay",
    badgeFrom = "#9333ea",
    badgeTo = "#ec4899",
    headingFontSize,
  } = settings;

  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (featuredOnly) params.set("featured", "true");
    params.set("page", "1");

    fetch(`/api/vendors?${params.toString()}`)
      .then(r => r.json())
      .then((data: { vendors?: VendorItem[] }) => {
        const list: VendorItem[] = data?.vendors ?? [];
        setVendors(list.slice(0, limit));
      })
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [category, featuredOnly, limit]);

  const colClass =
    columns === 2 ? "grid-cols-1 sm:grid-cols-2" :
    columns === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
                    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <WidgetContainer container={container}>
      {/* Header */}
      {(badge?.show || title || subtitle) && (
        <div className="mb-8 text-center">
          {badge?.show && badge.text && (
            <span
              className="mb-3 inline-block rounded-full font-semibold tracking-wide"
              style={{
                padding: "0.6rem 1.5rem",
                fontSize: "0.9375rem",
                background: "#111827",
                color: "#fff",
              }}
            >
              {badge.text}
            </span>
          )}
          {title && (
            <h2
              style={{
                color: headerTextColor,
                fontSize: headingFontSize ? `${headingFontSize}px` : "3.75rem",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2" style={{ color: headerTextColor, opacity: 0.65, fontSize: "20px", fontWeight: 400, fontStyle: "normal", lineHeight: "30px" }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className={cn("grid gap-6", colClass)}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-sm text-gray-400">
          No vendors found
        </div>
      ) : (
        <div className={cn("grid gap-6", colClass)}>
          {vendors.map(v => (
            cardStyle === "overlay"
              ? <OverlayVendorCard key={v.id} vendor={v} isPreview={isPreview} badgeFrom={badgeFrom} badgeTo={badgeTo} />
              : <StandardVendorCard key={v.id} vendor={v} isPreview={isPreview} />
          ))}
        </div>
      )}

      {/* View All */}
      {showViewAll && !loading && vendors.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <a
            href={isPreview ? undefined : viewAllLink}
            onClick={e => isPreview && e.preventDefault()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem 2rem",
              background: `linear-gradient(to right, ${badgeFrom}, ${badgeTo})`,
              color: "white",
              borderRadius: "0.75rem",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          >
            {viewAllText}
            <ArrowRight size={18} />
          </a>
        </div>
      )}
    </WidgetContainer>
  );
}

// ── Overlay card (HTML reference design) ─────────────────────────────────────

function OverlayVendorCard({
  vendor,
  isPreview,
  badgeFrom,
  badgeTo,
}: {
  vendor: VendorItem;
  isPreview: boolean;
  badgeFrom: string;
  badgeTo: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [hearted, setHearted] = useState(false);
  const meta = CATEGORY_META[vendor.category] ?? CATEGORY_META.OTHER;
  const { Icon } = meta;

  const fullStars = Math.round(vendor.avgRating ?? 0);

  const card = (
    <div
      style={{
        position: "relative",
        borderRadius: "1rem",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.05)"
          : "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.3s, transform 0.3s",
        background: "white",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "20rem", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vendor.coverPhoto ?? (CATEGORY_PLACEHOLDER[vendor.category] ?? CATEGORY_PLACEHOLDER.OTHER)}
          alt={vendor.businessName}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.7s ease",
            display: "block",
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Category badge — top left: icon circle + label */}
        <div style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.25rem 0.625rem 0.25rem 0.25rem",
          background: `linear-gradient(to right, ${badgeFrom}, ${badgeTo})`,
          color: "white",
          fontSize: "0.6875rem",
          fontWeight: 700,
          borderRadius: "9999px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          <span style={{
            width: "1.25rem",
            height: "1.25rem",
            background: "rgba(255,255,255,0.22)",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon size={10} strokeWidth={2.5} />
          </span>
          {meta.label}
        </div>

        {/* Heart button — top right, always visible */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHearted((v) => !v); }}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            width: "2rem",
            height: "2rem",
            background: "white",
            border: "none",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          }}
        >
          <Heart size={14} fill={hearted ? "#ec4899" : "none"} color={hearted ? "#ec4899" : "#6b7280"} strokeWidth={2} />
        </button>

        {/* Card content at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem 1.5rem 1.5rem" }}>
          {/* Business name */}
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", marginBottom: "0.25rem", lineHeight: 1.3 }}>
            {vendor.businessName}
          </h3>

          {/* City • review count */}
          {(vendor.city || vendor.reviewCount > 0) && (
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", margin: "0 0 0.625rem" }}>
              {[vendor.city, vendor.reviewCount > 0 ? `${vendor.reviewCount} reviews` : null].filter(Boolean).join(" • ")}
            </p>
          )}

          {/* Bottom row: [Stars/ViewProfile LEFT] | [Price RIGHT] */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "2rem" }}>

            {/* LEFT slot — stars fade out, View Profile fade in */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {vendor.avgRating !== null && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.375rem",
                  opacity: hovered ? 0 : 1,
                  transition: "opacity 0.15s",
                  pointerEvents: hovered ? "none" : "auto",
                }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < fullStars ? "#fbbf24" : "rgba(255,255,255,0.25)"}
                        color={i < fullStars ? "#fbbf24" : "rgba(255,255,255,0.25)"}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span style={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>
                    {vendor.avgRating.toFixed(1)}
                  </span>
                </div>
              )}

              {/* View Profile — always LEFT, fades in on hover */}
              <div style={{
                position: vendor.avgRating !== null ? "absolute" : "relative",
                left: 0,
                top: "50%",
                transform: hovered
                  ? (vendor.avgRating !== null ? "translateY(-50%)" : "translateY(0)")
                  : (vendor.avgRating !== null ? "translateY(calc(-50% + 4px))" : "translateY(4px)"),
                background: "white",
                color: "#7c3aed",
                padding: "0.3rem 0.75rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.8125rem",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                whiteSpace: "nowrap",
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.2s, transform 0.2s",
                pointerEvents: hovered ? "auto" : "none",
              }}>
                View Profile
                <ArrowRight size={12} />
              </div>
            </div>

            {/* RIGHT slot — price, always visible */}
            {vendor.startingPrice !== null && (
              <p style={{
                background: `linear-gradient(to right, ${badgeFrom}, ${badgeTo})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontWeight: 700,
                fontSize: "1rem",
                filter: "brightness(1.8)",
                margin: 0,
                flexShrink: 0,
              }}>
                {vendor.currency ?? "SEK"} {vendor.startingPrice.toLocaleString()}+
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isPreview) return card;
  return <Link href={`/vendors/${vendor.slug}`} style={{ textDecoration: "none" }}>{card}</Link>;
}

// ── Standard card (info below image) ─────────────────────────────────────────

function StandardVendorCard({ vendor, isPreview }: { vendor: VendorItem; isPreview: boolean }) {
  const meta = CATEGORY_META[vendor.category] ?? CATEGORY_META.OTHER;
  const { Icon } = meta;

  const card = (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Cover photo */}
      <div className="relative h-48 w-full bg-purple-50">
        {vendor.coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.coverPhoto}
            alt={vendor.businessName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon className="h-12 w-12 text-purple-200" />
          </div>
        )}
        {vendor.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-semibold text-yellow-900">
            Featured
          </span>
        )}
        {vendor.isVerified && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5">
            <BadgeCheck className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-xs font-semibold text-purple-600">Verified</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            {meta.label}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1">
          {vendor.businessName}
        </h3>

        {vendor.tagline && (
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{vendor.tagline}</p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          {vendor.avgRating !== null ? (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{vendor.avgRating.toFixed(1)}</span>
              <span className="text-gray-400">({vendor.reviewCount})</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">No reviews yet</span>
          )}

          {vendor.city && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              {vendor.city}
            </div>
          )}
        </div>

        {vendor.startingPrice !== null && (
          <p className="mt-2 text-xs text-gray-500">
            From{" "}
            <span className="font-semibold text-gray-800">
              {vendor.currency ?? "SEK"} {vendor.startingPrice.toLocaleString()}
            </span>
          </p>
        )}
      </div>
    </div>
  );

  if (isPreview) return card;
  return <Link href={`/vendors/${vendor.slug}`}>{card}</Link>;
}
