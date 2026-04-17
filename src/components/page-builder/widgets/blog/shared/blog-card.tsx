"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BlogPostData,
  BlogPostGridWidgetSettings,
} from "@/lib/page-builder/types";

interface BlogCardProps {
  post: BlogPostData;
  cardSettings: BlogPostGridWidgetSettings["card"];
  className?: string;
}

// ── Date formatting helpers ─────────────────────────────────────────

function formatDateRelative(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffWeek === 1) return "1 week ago";
  if (diffWeek < 5) return `${diffWeek} weeks ago`;
  if (diffMonth === 1) return "1 month ago";
  if (diffMonth < 12) return `${diffMonth} months ago`;
  if (diffYear === 1) return "1 year ago";
  return `${diffYear} years ago`;
}

function formatBlogDate(
  dateStr: string,
  format: "relative" | "short" | "long"
): string {
  if (format === "relative") return formatDateRelative(dateStr);
  const date = new Date(dateStr);
  if (format === "long") {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Reading time ─────────────────────────────────────────────────────

function formatReadingTime(post: BlogPostData): string {
  if (post.readingMinutes && post.readingMinutes > 0) {
    return `${post.readingMinutes} min read`;
  }
  if (!post.excerpt) return "1 min read";
  const words = post.excerpt.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

// ── Aspect ratio classes ────────────────────────────────────────────

function getAspectRatioClass(
  ratio: "16:9" | "4:3" | "3:2" | "1:1"
): string {
  switch (ratio) {
    case "16:9":
      return "aspect-video";
    case "4:3":
      return "aspect-4/3";
    case "3:2":
      return "aspect-3/2";
    case "1:1":
      return "aspect-square";
    default:
      return "aspect-video";
  }
}

// ── Author initials ─────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "•";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Font size classes ───────────────────────────────────────────────

const titleFontSizeMap: Record<string, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-[21px]",
  xl: "text-2xl",
};

const excerptFontSizeMap: Record<string, string> = {
  xs: "text-xs",
  sm: "text-[14.5px]",
  md: "text-base",
};

const titleFontWeightMap: Record<number, string> = {
  500: "font-medium",
  600: "font-semibold",
  700: "font-bold",
};

// ── Auto emblem text from category ──────────────────────────────────

function deriveEmblemText(post: BlogPostData): string {
  const cat = post.categories?.[0];
  if (!cat) return post.title.slice(0, 3).toUpperCase();
  const slug = cat.slug || cat.name || "";
  // Try short codes (matches Legal theme blog category slugs)
  const map: Record<string, string> = {
    "business-formation": "Business",
    "business-guide": "Business",
    "ein-taxes": "Tax ID",
    "tax-compliance": "TAX",
    "banking": "$$$",
    "amazon-seller": "FBA",
    "compliance": "BOI",
    "new-law": "LAW",
    "e-commerce": "FBA",
    "trademark": "TM®",
    "case-studies": "CASE",
  };
  if (map[slug]) return map[slug];
  // Fallback: uppercase letters
  const upper = slug.replace(/[^A-Za-z]/g, "").toUpperCase();
  return upper.slice(0, 4) || cat.name.slice(0, 3).toUpperCase();
}

// ── Main BlogCard Component ─────────────────────────────────────────

export function BlogCard({ post, cardSettings, className }: BlogCardProps) {
  const {
    backgroundColor = "#ffffff",
    borderColor,
    borderWidth,
    borderRadius = 12,
    shadow,
    hoverShadow,
    image: imageSettings,
    categoryBadge,
    title: titleSettings,
    excerpt: excerptSettings,
    meta: metaSettings,
    contentPadding = 28,
    footer: footerSettings,
  } = cardSettings;

  const [isHovered, setIsHovered] = useState(false);

  const postDate = post.publishedAt || post.createdAt;
  const primaryCategory = post.categories?.[0];

  // Resolve emblem mode
  const emblem = imageSettings?.emblem;
  const decorative = imageSettings?.decorative;
  const useEmblem =
    emblem?.enabled &&
    (emblem.mode === "always" || (emblem.mode === "fallback" && !post.coverImage));

  const emblemText = useEmblem
    ? emblem?.text || (emblem?.autoFromCategory ? deriveEmblemText(post) : "")
    : "";

  // Title color (with hover swap)
  const titleColor = isHovered && titleSettings?.hoverColor
    ? titleSettings.hoverColor
    : titleSettings?.color || "#0f172a";

  // Card box-shadow
  const currentShadow = isHovered && hoverShadow
    ? hoverShadow
    : shadow === "none"
      ? undefined
      : shadow === "md"
        ? "0 4px 12px rgba(15,23,42,0.06)"
        : shadow === "lg"
          ? "0 8px 24px rgba(15,23,42,0.08)"
          : "0 2px 8px rgba(15,23,42,0.04)";

  // Author info
  const authorName = post.authorName || "";
  const authorInitials = getInitials(authorName);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden transition-all duration-400",
        cardSettings.hoverEffect === "lift" && "hover:-translate-y-1.5",
        className
      )}
      style={{
        background: backgroundColor,
        border: borderWidth ? `${borderWidth}px solid ${borderColor || "#e2e8f0"}` : undefined,
        borderRadius: `${borderRadius}px`,
        boxShadow: currentShadow,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Cover Image / Emblem ── */}
      {imageSettings?.show !== false && (
        <div
          className={cn(
            "relative overflow-hidden",
            getAspectRatioClass(imageSettings?.aspectRatio || "16:9")
          )}
        >
          {useEmblem ? (
            <div
              className="relative flex h-full w-full items-center justify-center"
              style={{
                background:
                  decorative?.background ||
                  "linear-gradient(135deg, #1b3a2d 0%, #0f2318 100%)",
              }}
            >
              {decorative?.showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(${decorative.gridColor || "rgba(249,115,22,0.05)"} 1px, transparent 1px), linear-gradient(90deg, ${decorative.gridColor || "rgba(249,115,22,0.05)"} 1px, transparent 1px)`,
                    backgroundSize: `${decorative.gridSize || 32}px ${decorative.gridSize || 32}px`,
                  }}
                />
              )}
              {decorative?.showGlow && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: "-50%",
                    right: "-50%",
                    width: decorative.glowSize || 300,
                    height: decorative.glowSize || 300,
                    background: `radial-gradient(circle, ${decorative.glowColor || "rgba(249,115,22,0.15)"} 0%, transparent 60%)`,
                  }}
                />
              )}
              <span
                className="relative z-[1] font-display font-bold select-none"
                style={{
                  fontSize: emblem?.fontSize || 64,
                  color: emblem?.color || "#f97316",
                  opacity: emblem?.opacity ?? 0.45,
                  letterSpacing: emblem?.letterSpacing || "-0.04em",
                  lineHeight: 1,
                }}
              >
                {emblemText}
              </span>

              {/* Category Badge — Overlay on emblem */}
              {categoryBadge?.show &&
                (categoryBadge.position === "overlay-top-left" ||
                  categoryBadge.position === "overlay-top-right") &&
                primaryCategory && (
                  <div
                    className="absolute z-10"
                    style={{
                      top: 16,
                      left: categoryBadge.position === "overlay-top-right" ? undefined : 16,
                      right: categoryBadge.position === "overlay-top-right" ? 16 : undefined,
                    }}
                  >
                    <CategoryBadge category={primaryCategory} settings={categoryBadge} />
                  </div>
                )}
            </div>
          ) : post.coverImage ? (
            <>
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className={cn(
                  "object-cover",
                  imageSettings?.hoverEffect === "zoom" &&
                    "transition-transform duration-500 group-hover:scale-110"
                )}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {categoryBadge?.show &&
                (categoryBadge.position === "overlay-top-left" ||
                  categoryBadge.position === "overlay-top-right") &&
                primaryCategory && (
                  <div
                    className="absolute z-10"
                    style={{
                      top: 16,
                      left: categoryBadge.position === "overlay-top-right" ? undefined : 16,
                      right: categoryBadge.position === "overlay-top-right" ? 16 : undefined,
                    }}
                  >
                    <CategoryBadge category={primaryCategory} settings={categoryBadge} />
                  </div>
                )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <ImageIcon className="h-10 w-10 text-slate-300" />
            </div>
          )}
        </div>
      )}

      {/* ── Content ── */}
      <div
        className="flex flex-1 flex-col gap-3.5"
        style={{ padding: `${contentPadding}px` }}
      >
        {/* Category Badge — Above Title */}
        {categoryBadge?.show &&
          categoryBadge.position === "above-title" &&
          primaryCategory && (
            <div>
              <CategoryBadge category={primaryCategory} settings={categoryBadge} />
            </div>
          )}

        {/* Meta — inline-dots */}
        {metaSettings?.show && metaSettings.style === "inline-dots" && (
          <div
            className="flex flex-wrap items-center gap-3 text-[12px] font-medium"
            style={{ color: metaSettings.textColor || "#64748b" }}
          >
            <span>{formatBlogDate(postDate, metaSettings.dateFormat || "short")}</span>
            <span
              className="rounded-full"
              style={{
                width: 3,
                height: 3,
                background: metaSettings.dotColor || "#f97316",
              }}
            />
            <span>{formatReadingTime(post)}</span>
          </div>
        )}

        {/* Title */}
        {titleSettings?.show !== false && (
          <h3
            className={cn(
              "font-display leading-tight transition-colors duration-200",
              titleFontSizeMap[titleSettings?.fontSize || "lg"],
              titleFontWeightMap[titleSettings?.fontWeight || 700]
            )}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: titleSettings?.maxLines || 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: titleColor,
            }}
          >
            {post.title}
          </h3>
        )}

        {/* Category Badge — Below Title */}
        {categoryBadge?.show &&
          categoryBadge.position === "below-title" &&
          primaryCategory && (
            <div>
              <CategoryBadge category={primaryCategory} settings={categoryBadge} />
            </div>
          )}

        {/* Excerpt */}
        {excerptSettings?.show && post.excerpt && (
          <p
            className={cn(
              "leading-relaxed",
              excerptFontSizeMap[excerptSettings.fontSize || "sm"]
            )}
            style={{
              color: excerptSettings.color || "#64748b",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt.length > (excerptSettings.maxLength || 120)
              ? post.excerpt.slice(0, excerptSettings.maxLength || 120) + "..."
              : post.excerpt}
          </p>
        )}

        {/* Meta — icons style (legacy) */}
        {metaSettings?.show && metaSettings.style !== "inline-dots" && (
          <div
            className="flex flex-wrap items-center gap-2 text-xs"
            style={{ color: metaSettings.textColor || "#64748b" }}
          >
            {metaSettings.items?.map((item, idx) => (
              <span key={item} className="flex items-center gap-1">
                {idx > 0 && <span className="mx-1 text-slate-300">·</span>}
                {item === "date" && (
                  <>
                    <Calendar className="h-3 w-3" />
                    <span>{formatBlogDate(postDate, metaSettings.dateFormat || "short")}</span>
                  </>
                )}
                {item === "category" && primaryCategory && (
                  <>
                    <Tag className="h-3 w-3" />
                    <span>{primaryCategory.name}</span>
                  </>
                )}
                {item === "readingTime" && (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>{formatReadingTime(post)}</span>
                  </>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Footer (author + arrow) ── */}
        {footerSettings?.show && (
          <div
            className="flex items-center justify-between"
            style={{
              paddingTop: `${footerSettings.paddingTop ?? 20}px`,
              borderTop: footerSettings.showDivider
                ? `1px solid ${footerSettings.dividerColor || "#e2e8f0"}`
                : "none",
            }}
          >
            {footerSettings.author?.show && authorName && (
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full font-display font-bold text-white text-[13px]"
                  style={{
                    background: `linear-gradient(135deg, ${footerSettings.author.avatarBgFrom || "#f97316"}, ${footerSettings.author.avatarBgTo || "#e84c1e"})`,
                  }}
                >
                  {authorInitials}
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: footerSettings.author.nameColor || "#0f172a" }}
                >
                  {authorName}
                </span>
              </div>
            )}

            {footerSettings.arrow?.show && (
              <span
                className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: footerSettings.arrow.size || 38,
                  height: footerSettings.arrow.size || 38,
                  background:
                    isHovered && footerSettings.arrow.hoverBgColor
                      ? footerSettings.arrow.hoverBgColor
                      : footerSettings.arrow.bgColor || "#f5f1ea",
                  color:
                    isHovered && footerSettings.arrow.hoverTextColor
                      ? footerSettings.arrow.hoverTextColor
                      : footerSettings.arrow.textColor || "#0f172a",
                  transform: isHovered ? "rotate(-45deg)" : "rotate(0)",
                }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Category Badge ──────────────────────────────────────────────────

function CategoryBadge({
  category,
  settings,
}: {
  category: { id: string; name: string; slug: string };
  settings: BlogPostGridWidgetSettings["card"]["categoryBadge"];
}) {
  const isDarkBlur = settings.style === "dark-blur";
  const baseStyle: React.CSSProperties = {
    background: settings.bgColor,
    color: settings.textColor,
    border: settings.borderColor ? `1px solid ${settings.borderColor}` : undefined,
    backdropFilter: isDarkBlur ? "blur(8px)" : undefined,
    textTransform: settings.uppercase ? "uppercase" : "none",
    letterSpacing: settings.letterSpacing,
    padding: "6px 14px",
    borderRadius: 9999,
    fontSize: 11,
  };

  return (
    <span
      className="inline-block font-display font-semibold"
      style={baseStyle}
    >
      {category.name}
    </span>
  );
}
