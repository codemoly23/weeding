"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import type { FeaturesShowcaseWidgetSettings, FeaturesShowcaseItem } from "@/lib/page-builder/types";
import { DEFAULT_FEATURES_SHOWCASE_SETTINGS } from "@/lib/page-builder/defaults";

interface FeaturesShowcaseWidgetProps {
  settings: FeaturesShowcaseWidgetSettings;
  isPreview?: boolean;
}

export function FeaturesShowcaseWidget({
  settings: rawSettings,
  isPreview = false,
}: FeaturesShowcaseWidgetProps) {
  const settings: FeaturesShowcaseWidgetSettings = {
    ...DEFAULT_FEATURES_SHOWCASE_SETTINGS,
    ...rawSettings,
    badge: {
      ...DEFAULT_FEATURES_SHOWCASE_SETTINGS.badge,
      ...rawSettings.badge,
    },
    items: rawSettings.items?.length
      ? rawSettings.items
      : DEFAULT_FEATURES_SHOWCASE_SETTINGS.items,
  };

  const { badge, heading, subheading, items, columns, gap, cardHeight, cardAspectRatio, showCta, ctaText, ctaHref } = settings;

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #fdf4ff 0%, #fce7f3 40%, #ffffff 100%)",
        padding: "5rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>

          {/* Badge */}
          {badge.show && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.375rem 1rem",
                background: "rgba(253, 244, 255, 0.9)",
                border: "1px solid #d8b4fe",
                borderRadius: "9999px",
                marginBottom: "1.25rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#7c3aed",
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>✨</span>
              {badge.text}
            </div>
          )}

          {/* Heading */}
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 2.875rem)",
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.15,
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            {heading}
          </h2>

          {/* Subheading */}
          <p
            style={{
              fontSize: "1rem",
              color: "#64748b",
              maxWidth: "38rem",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {subheading}
          </p>
        </div>

        {/* Features Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap}px`,
          }}
        >
          {items.map((item) => (
            <FeatureCard
              key={item.id}
              item={item}
              height={cardHeight}
              aspectRatio={cardAspectRatio ?? "1/1"}
              isPreview={isPreview}
            />
          ))}
        </div>

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
        gap: "0.5rem",
        padding: "0.75rem 2rem",
        background: hovered
          ? "linear-gradient(135deg, #7e22ce, #db2777)"
          : "linear-gradient(135deg, #9333ea, #ec4899)",
        color: "#ffffff",
        borderRadius: "9999px",
        border: "none",
        cursor: "pointer",
        fontSize: "0.9375rem",
        fontWeight: 600,
        boxShadow: hovered
          ? "0 8px 25px rgba(147, 51, 234, 0.35)"
          : "0 4px 14px rgba(147, 51, 234, 0.25)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.2s ease",
        letterSpacing: "0.01em",
      }}
    >
      {text}
      <span style={{ fontSize: "1.1em" }}>→</span>
    </button>
  );
}

// ── Feature Card ──────────────────────────────────────────────────────────────

interface FeatureCardProps {
  item: FeaturesShowcaseItem;
  height: number;
  aspectRatio: "1/1" | "4/3" | "3/4" | "custom";
  isPreview: boolean;
}

function FeatureCard({ item, height, aspectRatio, isPreview }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);

  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>>)[item.icon] ?? LucideIcons.Star;

  const wrapper = (
    // Perspective container
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        perspective: "1200px",
        ...(aspectRatio === "custom"
          ? { height: `${height}px` }
          : { aspectRatio: aspectRatio.replace("/", " / ") }),
        cursor: item.href && !isPreview ? "pointer" : "default",
      }}
    >
      {/* Flip container — rotates right-to-left on hover */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transform: hovered ? "rotateY(-180deg)" : "rotateY(0deg)",
          transition: "transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)",
          borderRadius: "1rem",
          boxShadow: hovered
            ? "0 20px 48px rgba(0,0,0,0.22)"
            : "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        {/* ── FRONT FACE ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "1rem",
            overflow: "hidden",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Background image */}
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #9333ea, #ec4899)" }} />
          )}

          {/* Bottom gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
            }}
          />

          {/* Icon badge — top-right */}
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "0.625rem",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            <IconComponent size={18} strokeWidth={2} color="#374151" />
          </div>

          {/* Title — bottom */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem 1rem" }}>
            <h3
              style={{
                color: "#ffffff",
                fontSize: "1.125rem",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              {item.title}
            </h3>
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "1rem",
            overflow: "hidden",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#0a0a0a",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Icon badge — top-left */}
          <div
            style={{
              width: "2.75rem",
              height: "2.75rem",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconComponent size={20} strokeWidth={1.75} color="#ffffff" />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom content */}
          <div>
            <h3
              style={{
                color: "#ffffff",
                fontSize: "1.25rem",
                fontWeight: 800,
                margin: "0 0 0.5rem 0",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {item.title}
            </h3>
            {item.description && (
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "0.875rem",
                  lineHeight: 1.55,
                  margin: "0 0 1.125rem 0",
                }}
              >
                {item.description}
              </p>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
                padding: "0.625rem 1.25rem",
                background: "rgba(255,255,255,0.95)",
                color: "#7c3aed",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
                width: "100%",
              }}
            >
              Learn more <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isPreview || !item.href) return wrapper;

  return (
    <Link href={item.href} style={{ display: "block", textDecoration: "none" }}>
      {wrapper}
    </Link>
  );
}
