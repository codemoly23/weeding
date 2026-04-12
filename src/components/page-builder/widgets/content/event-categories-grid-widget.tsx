"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { EventCategoriesGridWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_EVENT_CATEGORIES_GRID_SETTINGS } from "@/lib/page-builder/defaults";

interface EventCategoriesGridWidgetProps {
  settings: EventCategoriesGridWidgetSettings;
  isPreview?: boolean;
}

export function EventCategoriesGridWidget({
  settings: rawSettings,
  isPreview = false,
}: EventCategoriesGridWidgetProps) {
  const settings: EventCategoriesGridWidgetSettings = {
    ...DEFAULT_EVENT_CATEGORIES_GRID_SETTINGS,
    ...rawSettings,
    badge: {
      ...DEFAULT_EVENT_CATEGORIES_GRID_SETTINGS.badge,
      ...rawSettings.badge,
    },
    categories:
      rawSettings.categories?.length
        ? rawSettings.categories
        : DEFAULT_EVENT_CATEGORIES_GRID_SETTINGS.categories,
  };

  const { badge, title, subtitle, cardHeight, minCardWidth, gap, categories } = settings;

  return (
    <section
      style={{
        background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
        padding: "5rem 1rem",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>

          {/* Badge */}
          {badge.show && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(8px)",
                borderRadius: "9999px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              <LayoutGrid size={16} strokeWidth={2} />
              {badge.text}
            </div>
          )}

          {/* Title */}
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              color: "#000000",
              marginBottom: "1rem",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              maxWidth: "42rem",
              margin: "0 auto",
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
            gap: `${gap}px`,
          }}
        >
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              image={cat.image}
              title={cat.title}
              subtitle={cat.subtitle}
              href={cat.href}
              height={cardHeight}
              isPreview={isPreview}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Card Component ────────────────────────────────────────────────────────────

interface CategoryCardProps {
  image: string;
  title: string;
  subtitle: string;
  href: string;
  height: number;
  isPreview: boolean;
}

function CategoryCard({ image, title, subtitle, href, height, isPreview }: CategoryCardProps) {
  const [hovered, setHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    position: "relative",
    borderRadius: "1rem",
    overflow: "hidden",
    cursor: "pointer",
    height: `${height}px`,
    boxShadow: hovered
      ? "0 20px 25px rgba(0,0,0,0.15)"
      : "0 4px 6px rgba(0,0,0,0.1)",
    transform: hovered ? "translateY(-8px)" : "translateY(0)",
    transition: "transform 0.3s, box-shadow 0.3s",
  };

  const inner = (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background Image */}
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw`}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#e5e7eb" }} />
      )}

      {/* Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
        }}
      />

      {/* Text Content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1.5rem",
          color: "white",
        }}
      >
        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );

  if (isPreview || !href) return inner;

  return (
    <Link href={href} style={{ display: "block", textDecoration: "none" }}>
      {inner}
    </Link>
  );
}
