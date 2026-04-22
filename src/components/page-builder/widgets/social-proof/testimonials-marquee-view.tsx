"use client";

import { useState } from "react";
import type { TestimonialsWidgetSettings, TestimonialItem } from "@/lib/page-builder/types";
import { StarRating, getInitials } from "./testimonials-widget";

interface TestimonialsMarqueeViewProps {
  testimonials: TestimonialItem[];
  settings: TestimonialsWidgetSettings;
  isPreview?: boolean;
}

export function TestimonialsMarqueeView({
  testimonials,
  settings,
}: TestimonialsMarqueeViewProps) {
  const { content, avatar } = settings;
  const [paused, setPaused] = useState(false);

  if (testimonials.length === 0) return null;

  // Triple the cards for a seamless infinite loop
  const tripled = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div
      style={{ position: "relative", overflow: "hidden", margin: "0 -1rem" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          padding: "0.5rem 1rem",
          animation: "marquee-scroll 30s linear infinite",
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
      >
        {tripled.map((t, idx) => (
          <div
            key={`${t.id}-${idx}`}
            style={{
              flexShrink: 0,
              width: "350px",
              background: "white",
              borderRadius: "1rem",
              padding: "2rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 16px 32px rgba(147,51,234,0.15)";
              e.currentTarget.style.borderColor = "#d8b4fe";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            {/* Author row */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              {avatar.style !== "none" && (
                <div style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "9999px",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: avatar.backgroundColor || "#e9d5ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {avatar.style === "photo" && t.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatar} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: avatar.textColor || "#7c3aed" }}>
                      {getInitials(t.name)}
                    </span>
                  )}
                </div>
              )}
              <div>
                <h4 style={{ fontWeight: 700, color: "#111827", margin: 0 }}>{t.name}</h4>
                {(content.showCompany && t.company) && (
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>{t.company}</p>
                )}
              </div>
            </div>

            {/* Stars */}
            {content.showRating && (
              <div style={{ marginBottom: "1rem" }}>
                <StarRating rating={t.rating} color={content.ratingColor || "#fbbf24"} size="sm" />
              </div>
            )}

            {/* Quote */}
            <p style={{
              color: content.quoteColor || "#374151",
              lineHeight: 1.6,
              fontStyle: content.quoteStyle === "italic" ? "italic" : "normal",
              margin: 0,
            }}>
              &ldquo;{t.content}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
