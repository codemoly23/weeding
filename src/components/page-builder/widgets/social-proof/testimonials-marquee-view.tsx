"use client";

import { useState } from "react";
import type { TestimonialsWidgetSettings, TestimonialItem } from "@/lib/page-builder/types";
import { getInitials } from "./testimonials-widget";

interface TestimonialsMarqueeViewProps {
  testimonials: TestimonialItem[];
  settings: TestimonialsWidgetSettings;
  isPreview?: boolean;
}

function StarIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: filled ? color : "#e5e7eb" }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function TestimonialsMarqueeView({
  testimonials,
  settings,
}: TestimonialsMarqueeViewProps) {
  const { content } = settings;
  const ratingColor = content.ratingColor || "#facc15";
  const [paused, setPaused] = useState(false);

  if (testimonials.length === 0) return null;

  // Triple the cards for a seamless infinite loop
  const tripled = [...testimonials, ...testimonials, ...testimonials];
  const gap = 24;
  // Duration scales with number of cards so speed stays consistent
  const duration = testimonials.length * 5;

  return (
    <div style={{ padding: "0 450px" }}>
    <div
      style={{ position: "relative", overflow: "hidden" }}
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
          gap: `${gap}px`,
          padding: "8px 0 16px",
          animation: `marquee-scroll ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
      >
        {tripled.map((t, idx) => (
          <div
            key={`${t.id}-${idx}`}
            style={{
              flexShrink: 0,
              width: "320px",
              minHeight: "380px",
              display: "flex",
              flexDirection: "column",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
              e.currentTarget.style.background = "#fffbf0";
              e.currentTarget.style.borderColor = "#fde68a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#f3f4f6";
            }}
          >
            {/* Stars */}
            {content.showRating && (
              <div style={{ display: "flex", gap: "2px", marginBottom: "12px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} filled={i < t.rating} color={ratingColor} />
                ))}
              </div>
            )}

            {/* Big quote marks */}
            <div style={{ fontSize: "44px", fontWeight: 900, color: "#c4b5fd", lineHeight: 1, marginBottom: "10px", userSelect: "none" }}>
              &#x275D;&#x275E;
            </div>

            {/* Content */}
            <p style={{ flex: 1, fontSize: "14px", color: "#4b5563", lineHeight: 1.7, margin: 0 }}>
              &ldquo;{t.content}&rdquo;
            </p>

            {/* Divider */}
            <div style={{ height: "2px", width: "44px", borderRadius: "999px", background: "linear-gradient(to right, #a855f7, #ec4899)", margin: "18px 0 14px" }} />

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {t.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.avatar} alt={t.name} style={{ width: 40, height: 40, borderRadius: "9999px", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: "9999px", background: "#ec4899", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{getInitials(t.name)}</span>
                </div>
              )}
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{t.name}</div>
                {content.showCompany && t.company && (
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "1px" }}>{t.company}</div>
                )}
                {content.showCountry && t.country && (
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "1px" }}>{t.country}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
