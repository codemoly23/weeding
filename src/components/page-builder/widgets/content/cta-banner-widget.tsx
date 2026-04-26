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
    headingFontSize: raw.headingFontSize ?? DEFAULT_CTA_BANNER_SETTINGS.headingFontSize,
    primaryButton: { ...DEFAULT_CTA_BANNER_SETTINGS.primaryButton, ...raw.primaryButton },
    secondaryButton: { ...DEFAULT_CTA_BANNER_SETTINGS.secondaryButton, ...raw.secondaryButton },
    trustBadges: { ...DEFAULT_CTA_BANNER_SETTINGS.trustBadges, ...raw.trustBadges },
  };

  const PrimaryIcon = getIcon(s.primaryButton.icon);
  const SecondaryIcon = getIcon(s.secondaryButton.icon);
  const isLight = s.variant === "light";

  return (
    <section
      style={{
        background: `linear-gradient(to bottom, ${s.sectionBgFrom}, ${s.sectionBgTo})`,
        padding: "5rem 0",
      }}
    >
      <div style={{ width: "100%" }}>
        {/* Card */}
        <div
          style={{
            background: `linear-gradient(${s.cardGradientAngle}deg, ${s.cardGradientFrom} 0%, ${s.cardGradientTo} 100%)`,
            borderRadius: `${s.cardBorderRadius}px`,
            padding: `${s.cardPaddingV}px ${s.cardPaddingH}px`,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: isLight
              ? "0 2px 8px rgba(0,0,0,0.06)"
              : "0 20px 25px -5px rgba(0,0,0,0.1)",
          }}
        >
          {/* Checkerboard pattern overlay (dark variant only) */}
          {s.showPattern && !isLight && (
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
                fontSize: `${s.headingFontSize}px`,
                fontWeight: 700,
                color: isLight ? "#0f172a" : "white",
                marginBottom: "1rem",
                lineHeight: 1.15,
              }}
            >
              {s.title}
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "1.125rem",
                color: isLight ? "#64748b" : "rgba(255,255,255,0.9)",
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
                  isLight={isLight}
                />
              )}
              {s.secondaryButton.show && (
                <SecondaryBtn
                  label={s.secondaryButton.label}
                  href={s.secondaryButton.href}
                  icon={<SecondaryIcon size={20} strokeWidth={2.5} />}
                  isPreview={isPreview}
                  isLight={isLight}
                />
              )}
            </div>

            {/* Trust Badges */}
            {s.trustBadges.show && s.trustBadges.items.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "1.5rem",
                  marginTop: "1.5rem",
                }}
              >
                {s.trustBadges.items.map((item, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "0.875rem",
                      color: isLight ? "#64748b" : "rgba(255,255,255,0.85)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      style={{ flexShrink: 0 }}
                    >
                      <path
                        d="M2 7L5.5 10.5L12 4"
                        stroke={isLight ? "#9333ea" : "rgba(255,255,255,0.9)"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            )}
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
  isLight: boolean;
}

function PrimaryBtn({ label, href, icon, isPreview }: BtnProps) {
  const [hovered, setHovered] = useState(false);

  const btn = (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "1rem 2.75rem",
        background: hovered
          ? "linear-gradient(135deg, #6d28d9, #be185d)"
          : "linear-gradient(135deg, #7c3aed, #db2777)",
        color: "#ffffff",
        border: "none",
        borderRadius: "12px",
        fontWeight: 700,
        fontSize: "1.0625rem",
        cursor: isPreview ? "default" : "pointer",
        boxShadow: hovered
          ? "0 12px 32px rgba(124,58,237,0.45)"
          : "0 6px 20px rgba(124,58,237,0.35)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s ease",
        letterSpacing: "0.01em",
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

function SecondaryBtn({ label, href, icon, isPreview, isLight }: BtnProps) {
  const [hovered, setHovered] = useState(false);

  const btn = (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.875rem 2rem",
        background: isLight
          ? hovered ? "#f8f8f8" : "white"
          : hovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
        color: isLight ? "#374151" : "white",
        border: isLight ? "1.5px solid #e5e7eb" : "2px solid white",
        borderRadius: "9999px",
        fontWeight: 600,
        fontSize: "1rem",
        cursor: isPreview ? "default" : "pointer",
        backdropFilter: isLight ? undefined : "blur(8px)",
        boxShadow: isLight
          ? hovered ? "0 4px 12px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.06)"
          : undefined,
        transition: "all 0.2s ease",
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
