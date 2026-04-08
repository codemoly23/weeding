"use client";

import { useState } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { ArrowRight, Play } from "lucide-react";
import type { CtaBannerWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_CTA_BANNER_SETTINGS } from "@/lib/page-builder/defaults";

interface CtaBannerWidgetProps {
  settings: CtaBannerWidgetSettings;
  isPreview?: boolean;
}

function getIcon(name: string): React.ComponentType<{ size?: number; strokeWidth?: number }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>;
  const pascal = name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return icons[pascal] || icons[name] || ArrowRight;
}

// Checkerboard SVG pattern (from index.html)
const CHECKERBOARD_PATTERN = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export function CtaBannerWidget({
  settings: raw,
  isPreview = false,
}: CtaBannerWidgetProps) {
  const s: CtaBannerWidgetSettings = {
    ...DEFAULT_CTA_BANNER_SETTINGS,
    ...raw,
    primaryButton: { ...DEFAULT_CTA_BANNER_SETTINGS.primaryButton, ...raw.primaryButton },
    secondaryButton: { ...DEFAULT_CTA_BANNER_SETTINGS.secondaryButton, ...raw.secondaryButton },
  };

  const PrimaryIcon = getIcon(s.primaryButton.icon);
  const SecondaryIcon = getIcon(s.secondaryButton.icon);

  return (
    <section
      style={{
        background: `linear-gradient(to bottom, ${s.sectionBgFrom}, ${s.sectionBgTo})`,
        padding: "5rem 1rem",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Card */}
        <div
          style={{
            background: `linear-gradient(${s.cardGradientAngle}deg, ${s.cardGradientFrom} 0%, ${s.cardGradientTo} 100%)`,
            borderRadius: `${s.cardBorderRadius}px`,
            padding: `${s.cardPaddingV}px ${s.cardPaddingH}px`,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          }}
        >
          {/* Checkerboard pattern overlay */}
          {s.showPattern && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: CHECKERBOARD_PATTERN,
                opacity: 0.3,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Content */}
          <div style={{ position: "relative", zIndex: 10 }}>
            {/* Title */}
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 900,
                color: "white",
                marginBottom: "1rem",
                lineHeight: 1.15,
              }}
            >
              {s.title}
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "1.25rem",
                color: "rgba(255,255,255,0.9)",
                marginBottom: "2.5rem",
                maxWidth: "42rem",
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.6,
              }}
            >
              {s.subtitle}
            </p>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {s.primaryButton.show && (
                <PrimaryBtn
                  label={s.primaryButton.label}
                  href={s.primaryButton.href}
                  icon={<PrimaryIcon size={20} strokeWidth={2.5} />}
                  isPreview={isPreview}
                />
              )}
              {s.secondaryButton.show && (
                <SecondaryBtn
                  label={s.secondaryButton.label}
                  href={s.secondaryButton.href}
                  icon={<SecondaryIcon size={20} strokeWidth={2.5} />}
                  isPreview={isPreview}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Button sub-components ─────────────────────────────────────────────────────

interface BtnProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  isPreview: boolean;
}

function PrimaryBtn({ label, href, icon, isPreview }: BtnProps) {
  const [hovered, setHovered] = useState(false);

  const btn = (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "1rem 2.5rem",
        background: "white",
        color: "#9333ea",
        border: "none",
        borderRadius: "0.75rem",
        fontWeight: 700,
        fontSize: "1.125rem",
        cursor: isPreview ? "default" : "pointer",
        boxShadow: hovered
          ? "0 20px 25px -5px rgba(0,0,0,0.3)"
          : "0 10px 15px -3px rgba(0,0,0,0.2)",
        transform: hovered ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      {icon}
    </button>
  );

  if (isPreview || !href) return btn;
  return <Link href={href} style={{ textDecoration: "none" }}>{btn}</Link>;
}

function SecondaryBtn({ label, href, icon, isPreview }: BtnProps) {
  const [hovered, setHovered] = useState(false);

  const btn = (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "1rem 2.5rem",
        background: hovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
        color: "white",
        border: "2px solid white",
        borderRadius: "0.75rem",
        fontWeight: 700,
        fontSize: "1.125rem",
        cursor: isPreview ? "default" : "pointer",
        backdropFilter: "blur(8px)",
        transition: "background 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {label}
    </button>
  );

  if (isPreview || !href) return btn;
  return <Link href={href} style={{ textDecoration: "none" }}>{btn}</Link>;
}
