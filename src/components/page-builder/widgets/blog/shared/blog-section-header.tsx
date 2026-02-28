"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BlogSectionHeader, BadgeStyle } from "@/lib/page-builder/types";

interface BlogSectionHeaderProps {
  settings: BlogSectionHeader;
}

// ── Badge style helpers (matches service-card-widget pattern) ────────

function getBadgeStyles(
  style: BadgeStyle,
  colors: {
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
  }
) {
  const baseClasses =
    "inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium";

  switch (style) {
    case "outline":
      return {
        className: cn(baseClasses, "rounded-full border bg-transparent"),
        style: {
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
    case "solid":
      return {
        className: cn(baseClasses, "rounded-md border-0"),
        style: {
          backgroundColor: colors.bgColor || "#f97316",
          color: colors.textColor || "#ffffff",
        },
      };
    case "pill":
    default:
      return {
        className: cn(baseClasses, "rounded-full border"),
        style: {
          backgroundColor: colors.bgColor || "#f9731933",
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
  }
}

// ── Render text with highlighted words ──────────────────────────────

function renderHighlightedText(
  text: string,
  highlightWords?: string,
  highlightColor?: string
) {
  if (!highlightWords) return text;

  // Escape regex special chars
  const escaped = highlightWords.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === highlightWords.toLowerCase()) {
      return (
        <span key={index} style={{ color: highlightColor || "#f97316" }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

// ── Size maps ───────────────────────────────────────────────────────

const headingSizeClasses: Record<string, string> = {
  sm: "text-xl md:text-2xl",
  md: "text-2xl md:text-3xl",
  lg: "text-3xl md:text-4xl",
  xl: "text-4xl md:text-5xl",
  "2xl": "text-5xl md:text-6xl",
};

// ── Chevron icon ────────────────────────────────────────────────────

function ChevronRight() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ── View All Link sub-component ─────────────────────────────────────

function ViewAllLink({
  link,
}: {
  link: BlogSectionHeader["viewAllLink"];
}) {
  if (!link.show) return null;

  const baseClasses =
    "inline-flex items-center gap-1.5 text-sm font-medium transition-colors";

  switch (link.style) {
    case "button-outline":
      return (
        <Link
          href={link.url}
          className={cn(
            baseClasses,
            "rounded-lg border px-4 py-2",
            "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50",
            "dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800"
          )}
          style={{ borderColor: link.color || undefined, color: link.color || undefined }}
        >
          {link.text || "View all"}
          <ChevronRight />
        </Link>
      );
    case "button-solid":
      return (
        <Link
          href={link.url}
          className={cn(
            baseClasses,
            "rounded-lg px-4 py-2 text-white hover:opacity-90",
            "bg-blue-600 dark:bg-blue-500"
          )}
          style={{
            backgroundColor: link.color || undefined,
          }}
        >
          {link.text || "View all"}
          <ChevronRight />
        </Link>
      );
    case "link":
    default:
      return (
        <Link
          href={link.url}
          className={cn(
            baseClasses,
            "text-blue-600 hover:text-blue-700",
            "dark:text-blue-400 dark:hover:text-blue-300"
          )}
          style={{ color: link.color || undefined }}
        >
          {link.text || "View all"}
          <ChevronRight />
        </Link>
      );
  }
}

// ── Badge sub-component ─────────────────────────────────────────────

function BadgeElement({
  badge,
}: {
  badge: NonNullable<BlogSectionHeader["badge"]>;
}) {
  const badgeStyles = getBadgeStyles(badge.style, {
    bgColor: badge.bgColor,
    textColor: badge.textColor,
    borderColor: badge.borderColor,
  });

  return (
    <span className={badgeStyles.className} style={badgeStyles.style}>
      {badge.icon && <span className="text-sm">{badge.icon}</span>}
      {badge.text}
    </span>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function BlogSectionHeader({ settings }: BlogSectionHeaderProps) {
  if (!settings.show) return null;

  const { badge, heading, subheading, viewAllLink, alignment, marginBottom } =
    settings;

  // "space-between" alignment: title left, view all link right on same row
  if (alignment === "space-between") {
    return (
      <div
        className="flex flex-col gap-4"
        style={{ marginBottom: `${marginBottom}px` }}
      >
        {/* Badge above the row */}
        {badge?.show && (
          <div>
            <BadgeElement badge={badge} />
          </div>
        )}

        {/* Title row: heading left, view all link right */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2
              className={cn(
                !heading.fontWeight && "font-bold",
                !heading.letterSpacing && "tracking-tight",
                "text-slate-900 dark:text-white",
                !heading.customFontSize && headingSizeClasses[heading.size]
              )}
              style={{
                color: heading.color || undefined,
                ...(heading.customFontSize ? { fontSize: heading.customFontSize } : {}),
                ...(heading.fontWeight ? { fontWeight: heading.fontWeight } : {}),
                ...(heading.lineHeight ? { lineHeight: heading.lineHeight } : {}),
                ...(heading.letterSpacing ? { letterSpacing: heading.letterSpacing } : {}),
              }}
            >
              {renderHighlightedText(
                heading.text,
                heading.highlightWords,
                heading.highlightColor
              )}
            </h2>

            {subheading?.show && subheading.text && (
              <p
                className={cn(
                  "max-w-2xl text-slate-600 dark:text-slate-400",
                  !subheading.customFontSize && "text-base"
                )}
                style={{
                  color: subheading.color || undefined,
                  ...(subheading.customFontSize ? { fontSize: subheading.customFontSize } : {}),
                  ...(subheading.lineHeight ? { lineHeight: subheading.lineHeight } : {}),
                }}
              >
                {subheading.text}
              </p>
            )}
          </div>

          <div className="shrink-0">
            <ViewAllLink link={viewAllLink} />
          </div>
        </div>
      </div>
    );
  }

  // "left" or "center" alignment: stacked vertically
  const alignmentClasses: Record<string, string> = {
    left: "text-left items-start",
    center: "text-center items-center",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        alignmentClasses[alignment] || alignmentClasses.left
      )}
      style={{ marginBottom: `${marginBottom}px` }}
    >
      {/* Badge */}
      {badge?.show && <BadgeElement badge={badge} />}

      {/* Heading */}
      <h2
        className={cn(
          !heading.fontWeight && "font-bold",
          !heading.letterSpacing && "tracking-tight",
          "text-slate-900 dark:text-white",
          !heading.customFontSize && headingSizeClasses[heading.size]
        )}
        style={{
          color: heading.color || undefined,
          ...(heading.customFontSize ? { fontSize: heading.customFontSize } : {}),
          ...(heading.fontWeight ? { fontWeight: heading.fontWeight } : {}),
          ...(heading.lineHeight ? { lineHeight: heading.lineHeight } : {}),
          ...(heading.letterSpacing ? { letterSpacing: heading.letterSpacing } : {}),
        }}
      >
        {renderHighlightedText(
          heading.text,
          heading.highlightWords,
          heading.highlightColor
        )}
      </h2>

      {/* Subheading */}
      {subheading?.show && subheading.text && (
        <p
          className={cn(
            "max-w-3xl text-slate-600 dark:text-slate-400",
            !subheading.customFontSize && "text-base",
            alignment === "center" && "mx-auto"
          )}
          style={{
            color: subheading.color || undefined,
            ...(subheading.customFontSize ? { fontSize: subheading.customFontSize } : {}),
            ...(subheading.lineHeight ? { lineHeight: subheading.lineHeight } : {}),
          }}
        >
          {subheading.text}
        </p>
      )}

      {/* View All Link */}
      <ViewAllLink link={viewAllLink} />
    </div>
  );
}
