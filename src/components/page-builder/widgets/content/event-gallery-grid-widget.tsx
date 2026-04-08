"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Camera, MapPin, Eye, Calendar, Heart, ArrowRight } from "lucide-react";
import type { EventGalleryGridWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_EVENT_GALLERY_GRID_SETTINGS } from "@/lib/page-builder/defaults";

interface EventGalleryGridWidgetProps {
  settings: EventGalleryGridWidgetSettings;
  isPreview?: boolean;
}

function getLucideIcon(
  name: string
): React.ComponentType<{ size?: number; style?: React.CSSProperties }> {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  >;
  return icons[name] || Camera;
}

function getGridColsClass(columns: 2 | 3 | 4): string {
  switch (columns) {
    case 2: return "grid-cols-1 sm:grid-cols-2";
    case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }
}

export function EventGalleryGridWidget({
  settings: rawSettings,
  isPreview = false,
}: EventGalleryGridWidgetProps) {
  const settings: EventGalleryGridWidgetSettings = {
    ...DEFAULT_EVENT_GALLERY_GRID_SETTINGS,
    ...rawSettings,
    badge: {
      ...DEFAULT_EVENT_GALLERY_GRID_SETTINGS.badge,
      ...rawSettings?.badge,
    },
    items:
      rawSettings?.items?.length
        ? rawSettings.items
        : DEFAULT_EVENT_GALLERY_GRID_SETTINGS.items,
  };

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const {
    badge,
    title,
    subtitle,
    sectionBg,
    items,
    columns,
    cardBadgeFrom,
    cardBadgeTo,
    planSimilarLabel,
    planSimilarHref,
    showCta,
    ctaLabel,
    ctaHref,
    ctaGradientFrom,
    ctaGradientTo,
  } = settings;

  const BadgeIcon = getLucideIcon(badge.icon);

  return (
    <section style={{ background: sectionBg, padding: "5rem 1rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* ── Section Header ── */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          {badge.show && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: "9999px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              <BadgeIcon size={16} />
              {badge.text}
            </div>
          )}

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              color: "#000",
              marginBottom: "1rem",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h2>

          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              maxWidth: "42rem",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* ── Cards Grid ── */}
        <div className={`grid gap-6 ${getGridColsClass(columns)}`}>
          {items.map((item) => {
            const isHovered = hoveredId === item.id;
            const planHref = planSimilarHref || item.href || "/planner/new";

            return (
              <div
                key={item.id}
                style={{
                  position: "relative",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: isHovered
                    ? "0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.05)"
                    : "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                  transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  transition: "box-shadow 0.3s, transform 0.3s",
                  background: "white",
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image Container */}
                <div style={{ position: "relative", height: "20rem", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: isHovered ? "scale(1.1)" : "scale(1)",
                      transition: "transform 0.7s ease",
                      display: "block",
                    }}
                  />

                  {/* Gradient overlay — bottom to top */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Category badge — top left */}
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      left: "1rem",
                      padding: "0.375rem 0.75rem",
                      background: `linear-gradient(to right, ${cardBadgeFrom}, ${cardBadgeTo})`,
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      borderRadius: "9999px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {item.type}
                  </div>

                  {/* Favorite button — top right */}
                  <button
                    aria-label="Save to favourites"
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      width: "2.5rem",
                      height: "2.5rem",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "white",
                      transition: "background 0.2s",
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                    }}
                  >
                    <Heart size={14} />
                  </button>

                  {/* Card content — bottom overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "1.5rem",
                    }}
                  >
                    {/* Event title */}
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "white",
                        marginBottom: "0.75rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </h3>

                    {/* Date + Location */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <Calendar size={14} style={{ flexShrink: 0 }} />
                        {item.date}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <MapPin size={14} style={{ flexShrink: 0 }} />
                        {item.location}
                      </div>
                    </div>

                    {/* Views + Plan Similar button */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Views */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          fontSize: "0.875rem",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <Eye size={14} style={{ flexShrink: 0 }} />
                        {item.views.toLocaleString()}
                      </div>

                      {/* Plan Similar button — appears on hover */}
                      <a
                        href={isPreview ? undefined : planHref}
                        style={{
                          background: "white",
                          color: "#7c3aed",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.5rem",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          border: "none",
                          cursor: isPreview ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                          opacity: isHovered ? 1 : 0,
                          transform: isHovered ? "translateY(0)" : "translateY(8px)",
                          transition: "opacity 0.3s, transform 0.3s, background 0.2s",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          pointerEvents: isHovered ? "auto" : "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                        }}
                        onClick={(e) => isPreview && e.preventDefault()}
                      >
                        {planSimilarLabel}
                        <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CTA Button ── */}
        {showCta && (
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <a
              href={isPreview ? undefined : ctaHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem 2rem",
                background: `linear-gradient(to right, ${ctaGradientFrom}, ${ctaGradientTo})`,
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: isPreview ? "default" : "pointer",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                textDecoration: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isPreview) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)";
              }}
              onClick={(e) => isPreview && e.preventDefault()}
            >
              {ctaLabel}
              <ArrowRight size={20} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
