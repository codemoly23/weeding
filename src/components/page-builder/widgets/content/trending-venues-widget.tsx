"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart, Star } from "lucide-react";
import type { TrendingVenuesWidgetSettings, TrendingVenueItem } from "@/lib/page-builder/types";
import { DEFAULT_TRENDING_VENUES_SETTINGS } from "@/lib/page-builder/defaults";

interface TrendingVenuesWidgetProps {
  settings: TrendingVenuesWidgetSettings;
  isPreview?: boolean;
}

export function TrendingVenuesWidget({
  settings: rawSettings,
  isPreview = false,
}: TrendingVenuesWidgetProps) {
  const settings: TrendingVenuesWidgetSettings = {
    ...DEFAULT_TRENDING_VENUES_SETTINGS,
    ...rawSettings,
    badge: {
      ...DEFAULT_TRENDING_VENUES_SETTINGS.badge,
      ...rawSettings.badge,
    },
    venues: rawSettings.venues?.length
      ? rawSettings.venues
      : DEFAULT_TRENDING_VENUES_SETTINGS.venues,
  };

  const { badge, heading, subheading, venues, viewMode, columns, gap, showCta, ctaText, ctaHref, headingFontSize } = settings;

  return (
    <section style={{ background: "#ffffff", padding: "3rem 0 5rem" }}>
      <div style={{ maxWidth: "min(1400px, calc(100% - 3rem))", margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          {badge.show && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.375rem 1rem",
                background: "#fdf4ff",
                border: "1px solid #d8b4fe",
                borderRadius: "9999px",
                marginBottom: "1.25rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#7c3aed",
              }}
            >
              {badge.text}
            </div>
          )}
          <h2
            style={{
              fontSize: headingFontSize ? `${headingFontSize}px` : "3.75rem",
              fontWeight: 800,
              color: "#000000",
              lineHeight: 1.1,
              marginBottom: "1rem",
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h2>
          <p
            style={{
              fontSize: "20px",
              fontWeight: 400,
              fontStyle: "normal",
              lineHeight: "30px",
              color: "#64748b",
              maxWidth: "40rem",
              margin: "0 auto",
            }}
          >
            {subheading}
          </p>
        </div>

        {/* Cards — grid or marquee */}
        {viewMode === "marquee" ? (
          <MarqueeRow venues={venues} isPreview={isPreview} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} isPreview={isPreview} />
            ))}
          </div>
        )}

        {/* CTA Button */}
        {showCta && (
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            {isPreview || !ctaHref ? (
              <CtaButton text={ctaText} />
            ) : (
              <Link href={ctaHref} style={{ textDecoration: "none" }}>
                <CtaButton text={ctaText} />
              </Link>
            )}
          </div>
        )}

      </div>
    </section>
  );
}

// ── Marquee Row ───────────────────────────────────────────────────────────────

function MarqueeRow({ venues, isPreview }: { venues: TrendingVenueItem[]; isPreview: boolean }) {
  const tripled = [...venues, ...venues, ...venues];
  const [paused, setPaused] = useState(false);

  return (
    <div
      style={{ position: "relative", overflow: "hidden" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes venues-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          padding: "0.5rem 0",
          animation: "venues-marquee 35s linear infinite",
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
      >
        {tripled.map((venue, idx) => (
          <div key={`${venue.id}-${idx}`} style={{ flexShrink: 0, width: "320px" }}>
            <VenueCard venue={venue} isPreview={isPreview} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CTA Button ────────────────────────────────────────────────────────────────

function CtaButton({ text }: { text: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "1rem 2.75rem",
        background: hovered
          ? "linear-gradient(135deg, #6d28d9, #be185d)"
          : "linear-gradient(135deg, #7c3aed, #db2777)",
        color: "#ffffff",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        fontSize: "1.0625rem",
        fontWeight: 700,
        boxShadow: hovered
          ? "0 12px 32px rgba(124, 58, 237, 0.45)"
          : "0 6px 20px rgba(124, 58, 237, 0.35)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s ease",
        letterSpacing: "0.01em",
      }}
    >
      {text}
      <span style={{ fontSize: "1.1em" }}>→</span>
    </button>
  );
}

// ── Badge color map ────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  purple: { bg: "#9333ea", text: "#ffffff" },
  orange: { bg: "#f59e0b", text: "#ffffff" },
  green: { bg: "#10b981", text: "#ffffff" },
  none: { bg: "transparent", text: "transparent" },
};

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          fill={i < full || (i === full && half) ? "#f59e0b" : "none"}
          color={i < full || (i === full && half) ? "#f59e0b" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

// ── Venue Card ────────────────────────────────────────────────────────────────

interface VenueCardProps {
  venue: TrendingVenueItem;
  isPreview: boolean;
}

function VenueCard({ venue, isPreview }: VenueCardProps) {
  const [hovered, setHovered] = useState(false);
  const [hearted, setHearted] = useState(false);
  const badgeStyle = BADGE_STYLES[venue.badge.color] ?? BADGE_STYLES.none;
  const showBadge = venue.badge.color !== "none" && venue.badge.text && venue.badge.text !== "none";

  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(venue.price);

  const card = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 20px 48px rgba(0,0,0,0.15)"
          : "0 4px 16px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        cursor: venue.href && !isPreview ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden", flexShrink: 0 }}>
        {venue.image ? (
          <Image
            src={venue.image}
            alt={venue.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            style={{
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #e0e7ff, #fce7f3)" }} />
        )}

        {/* Badge — top left */}
        {showBadge && (
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              left: "0.75rem",
              background: badgeStyle.bg,
              color: badgeStyle.text,
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.35rem 0.875rem",
              borderRadius: "9999px",
              letterSpacing: "0.01em",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {venue.badge.text}
          </div>
        )}

        {/* Heart — top right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setHearted((v) => !v);
          }}
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            width: "34px",
            height: "34px",
            background: "#ffffff",
            border: "none",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          <Heart
            size={16}
            fill={hearted ? "#ec4899" : "none"}
            color={hearted ? "#ec4899" : "#6b7280"}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Card Body */}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Venue Name */}
        <h3
          style={{
            fontSize: "1.1875rem",
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 0.375rem",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {venue.name}
        </h3>

        {/* Location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            marginBottom: "0.625rem",
          }}
        >
          <MapPin size={13} color="#9ca3af" strokeWidth={2} />
          <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>{venue.location}</span>
        </div>

        {/* Rating row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            marginBottom: "0.75rem",
          }}
        >
          <StarRating rating={venue.rating} />
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#374151" }}>
            {venue.rating.toFixed(1)}
          </span>
          <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>({venue.reviewCount})</span>
        </div>

        {/* Tags */}
        {venue.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.375rem",
              marginBottom: "1rem",
            }}
          >
            {venue.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  background: "#fdf2f8",
                  color: "#be185d",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "9999px",
                  border: "1px solid #fbcfe8",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom section */}
        <div
          style={{
            borderTop: "1px solid #f3f4f6",
            marginTop: "0.75rem",
            paddingTop: "0.875rem",
          }}
        >
          {/* Price row */}
          <div style={{ marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#db2777", letterSpacing: "-0.03em" }}>
              {priceFormatted}
            </span>
            <span style={{ fontSize: "0.8125rem", color: "#9ca3af", marginLeft: "4px" }}>
              {venue.priceUnit}
            </span>
          </div>

          {/* View Details — full-width button */}
          <ViewDetailsButton />
        </div>
      </div>
    </div>
  );

  if (isPreview || !venue.href) return card;

  return (
    <Link href={venue.href} style={{ display: "block", textDecoration: "none" }}>
      {card}
    </Link>
  );
}

// ── View Details Button ───────────────────────────────────────────────────────

function ViewDetailsButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "0.625rem 1rem",
        fontSize: "0.875rem",
        fontWeight: 600,
        color: hovered ? "#7c3aed" : "#374151",
        background: hovered ? "#faf5ff" : "#ffffff",
        border: `1.5px solid ${hovered ? "#c084fc" : "#e5e7eb"}`,
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.375rem",
        transition: "all 0.18s ease",
      }}
    >
      View Details
      <span style={{ fontSize: "1em" }}>→</span>
    </button>
  );
}
