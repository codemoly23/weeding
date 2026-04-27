"use client";

import { useState } from "react";
import { MapPin, Eye, Calendar, Heart, ArrowRight } from "lucide-react";
import type { EventGalleryGridWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_EVENT_GALLERY_GRID_SETTINGS } from "@/lib/page-builder/defaults";

interface EventGalleryGridWidgetProps {
  settings: EventGalleryGridWidgetSettings;
  isPreview?: boolean;
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
  const [heartedIds, setHeartedIds] = useState<Set<string>>(new Set());

  const { badge, title, subtitle, items, columns, cardBadgeFrom, cardBadgeTo, showCta, ctaLabel, ctaHref, headingFontSize } = settings;

  const [ctaHovered, setCtaHovered] = useState(false);

  const toggleHeart = (id: string) => {
    setHeartedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section style={{
      background: "linear-gradient(135deg, rgba(147,51,234,0.05) 0%, rgba(219,39,119,0.05) 50%, rgba(147,51,234,0.10) 100%)",
      padding: "5rem 1rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative blur orbs */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "24rem", height: "24rem", background: "rgba(216,180,254,0.10)", borderRadius: "9999px", filter: "blur(64px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "24rem", height: "24rem", background: "rgba(249,168,212,0.10)", borderRadius: "9999px", filter: "blur(64px)", pointerEvents: "none" }} />
      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 1 }}>

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
              {badge.text}
            </div>
          )}

          <h2
            style={{
              fontSize: headingFontSize ? `${headingFontSize}px` : "3.75rem",
              fontWeight: 800,
              color: "#000000",
              marginBottom: "1rem",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h2>

          <p
            style={{
              fontSize: "20px",
              fontWeight: 400,
              fontStyle: "normal",
              lineHeight: "30px",
              color: "#6b7280",
              maxWidth: "42rem",
              margin: "0 auto",
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* ── Cards Grid ── */}
        <div className={`grid gap-6 ${getGridColsClass(columns)}`}>
          {items.map((item) => {
            const isHovered = hoveredId === item.id;
            const isHearted = heartedIds.has(item.id);

            return (
              <div
                key={item.id}
                style={{
                  position: "relative",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: isHovered
                    ? "0 20px 25px -5px rgba(0,0,0,0.15)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                  transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  transition: "box-shadow 0.3s, transform 0.3s",
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image */}
                <div style={{ position: "relative", height: "20rem", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: isHovered ? "scale(1.07)" : "scale(1)",
                      transition: "transform 0.6s ease",
                      display: "block",
                    }}
                  />

                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Category badge — top left */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0.875rem",
                      left: "0.875rem",
                      padding: "0.3rem 0.75rem",
                      background: `linear-gradient(to right, ${cardBadgeFrom}, ${cardBadgeTo})`,
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      borderRadius: "9999px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {item.type}
                  </div>

                  {/* Favorite button — top right */}
                  <button
                    aria-label="Save to favourites"
                    onClick={(e) => { e.stopPropagation(); toggleHeart(item.id); }}
                    style={{
                      position: "absolute",
                      top: "0.875rem",
                      right: "0.875rem",
                      width: "2.25rem",
                      height: "2.25rem",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.35)",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: isHearted ? "#f472b6" : "white",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    <Heart size={14} fill={isHearted ? "#f472b6" : "none"} />
                  </button>

                  {/* Card content — bottom overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "1.25rem",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "white",
                        marginBottom: "0.5rem",
                        lineHeight: 1.25,
                      }}
                    >
                      {item.title}
                    </h3>

                    {/* Subtitle (category mode) */}
                    {item.subtitle && (
                      <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.85)", margin: "0 0 0.5rem 0" }}>
                        {item.subtitle}
                      </p>
                    )}

                    {/* Date + Location (event mode) */}
                    {(item.date || item.location) && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.75rem" }}>
                        {item.date && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.88)" }}>
                            <Calendar size={12} style={{ flexShrink: 0 }} />
                            {item.date}
                          </div>
                        )}
                        {item.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.88)" }}>
                            <MapPin size={12} style={{ flexShrink: 0 }} />
                            {item.location}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Views + Likes LEFT | View button RIGHT */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {item.views ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.85)" }}>
                            <Eye size={13} />
                            {item.views.toLocaleString()}
                          </span>
                        ) : null}
                        {item.likes ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem", color: "#f9a8d4" }}>
                            <Heart size={13} fill="#f9a8d4" />
                            {item.likes}
                          </span>
                        ) : null}
                      </div>

                      {/* View button — visible on hover only */}
                      {isHovered && (
                        <a
                          href={isPreview ? undefined : (item.href || "#")}
                          onClick={(e) => isPreview && e.preventDefault()}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.375rem 0.875rem",
                            background: "rgba(255,255,255,0.95)",
                            color: "#111827",
                            borderRadius: "9999px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            flexShrink: 0,
                            cursor: isPreview ? "default" : "pointer",
                          }}
                        >
                          View <ArrowRight size={13} />
                        </a>
                      )}
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
              onClick={(e) => isPreview && e.preventDefault()}
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "1rem 2.75rem",
                background: ctaHovered
                  ? "linear-gradient(135deg, #6d28d9, #be185d)"
                  : "linear-gradient(135deg, #7c3aed, #db2777)",
                color: "#ffffff",
                borderRadius: "12px",
                border: "none",
                cursor: isPreview ? "default" : "pointer",
                fontSize: "1.0625rem",
                fontWeight: 700,
                boxShadow: ctaHovered
                  ? "0 12px 32px rgba(124,58,237,0.45)"
                  : "0 6px 20px rgba(124,58,237,0.35)",
                transform: ctaHovered ? "translateY(-2px)" : "translateY(0)",
                transition: "all 0.2s ease",
                letterSpacing: "0.01em",
                textDecoration: "none",
              }}
            >
              {ctaLabel}
              <span style={{ fontSize: "1.1em" }}>→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
