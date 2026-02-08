"use client";

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

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatBlogDate(
  dateStr: string,
  format: "relative" | "short" | "long"
): string {
  switch (format) {
    case "relative":
      return formatDateRelative(dateStr);
    case "short":
      return formatDateShort(dateStr);
    case "long":
      return formatDateLong(dateStr);
    default:
      return formatDateShort(dateStr);
  }
}

// ── Reading time calculator ─────────────────────────────────────────

function calculateReadingTime(text: string | null): string {
  if (!text) return "1 min read";
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min read`;
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

// ── Meta separator ──────────────────────────────────────────────────

function getMetaSeparator(separator: "dot" | "dash" | "pipe"): string {
  switch (separator) {
    case "dot":
      return "\u00B7";
    case "dash":
      return "\u2013";
    case "pipe":
      return "|";
    default:
      return "\u00B7";
  }
}

// ── Card hover effect classes ───────────────────────────────────────

function getCardHoverClasses(
  effect: "none" | "lift" | "shadow" | "scale"
): string {
  switch (effect) {
    case "lift":
      return "hover:-translate-y-1 transition-transform duration-300";
    case "shadow":
      return "hover:shadow-xl transition-shadow duration-300";
    case "scale":
      return "hover:scale-[1.02] transition-transform duration-300";
    default:
      return "";
  }
}

// ── Card style classes ──────────────────────────────────────────────

function getCardStyleClasses(
  style: "default" | "bordered" | "elevated" | "minimal"
): string {
  switch (style) {
    case "bordered":
      return "border border-slate-200 dark:border-slate-700";
    case "elevated":
      return "shadow-md";
    case "minimal":
      return "";
    case "default":
    default:
      return "border border-slate-200 dark:border-slate-700 shadow-sm";
  }
}

// ── Image hover effect classes ──────────────────────────────────────

function getImageHoverClasses(
  effect: "none" | "zoom" | "brighten"
): string {
  switch (effect) {
    case "zoom":
      return "group-hover:scale-110 transition-transform duration-500";
    case "brighten":
      return "group-hover:brightness-110 transition-all duration-300";
    default:
      return "";
  }
}

// ── Font size classes ───────────────────────────────────────────────

const titleFontSizeMap: Record<string, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const excerptFontSizeMap: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
};

const metaFontSizeMap: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
};

const titleFontWeightMap: Record<number, string> = {
  500: "font-medium",
  600: "font-semibold",
  700: "font-bold",
};

// ── Main BlogCard Component ─────────────────────────────────────────

export function BlogCard({ post, cardSettings, className }: BlogCardProps) {
  const {
    style = "default",
    backgroundColor,
    borderRadius = 12,
    shadow = "sm",
    hoverEffect = "lift",
    image: imageSettings,
    categoryBadge,
    title: titleSettings,
    excerpt: excerptSettings,
    meta: metaSettings,
    readMore: readMoreSettings,
    contentPadding = 16,
  } = cardSettings;

  const postDate = post.publishedAt || post.createdAt;
  const primaryCategory = post.categories?.[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden bg-white dark:bg-slate-900",
        getCardStyleClasses(style),
        getCardHoverClasses(hoverEffect),
        className
      )}
      style={{
        borderRadius: `${borderRadius}px`,
        backgroundColor: backgroundColor || undefined,
      }}
    >
      {/* Cover Image */}
      {imageSettings?.show !== false && (
        <div
          className={cn(
            "relative overflow-hidden",
            getAspectRatioClass(imageSettings?.aspectRatio || "16:9")
          )}
          style={{
            borderRadius:
              imageSettings?.borderRadius !== undefined
                ? `${imageSettings.borderRadius}px`
                : undefined,
          }}
        >
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className={cn(
                "object-cover",
                getImageHoverClasses(imageSettings?.hoverEffect || "none")
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
              <ImageIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
          )}

          {/* Category Badge - Overlay Position */}
          {categoryBadge?.show &&
            categoryBadge.position === "overlay-top-left" &&
            primaryCategory && (
              <div className="absolute left-3 top-3 z-10">
                <CategoryBadge
                  category={primaryCategory}
                  badgeStyle={categoryBadge.style}
                />
              </div>
            )}
        </div>
      )}

      {/* Content */}
      <div
        className="flex flex-1 flex-col gap-2"
        style={{ padding: `${contentPadding}px` }}
      >
        {/* Category Badge - Above Title */}
        {categoryBadge?.show &&
          categoryBadge.position === "above-title" &&
          primaryCategory && (
            <div>
              <CategoryBadge
                category={primaryCategory}
                badgeStyle={categoryBadge.style}
              />
            </div>
          )}

        {/* Title */}
        {titleSettings?.show !== false && (
          <h3
            className={cn(
              "text-slate-900 dark:text-slate-100",
              titleFontSizeMap[titleSettings?.fontSize || "md"],
              titleFontWeightMap[titleSettings?.fontWeight || 600]
            )}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: titleSettings?.maxLines || 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.title}
          </h3>
        )}

        {/* Category Badge - Below Title */}
        {categoryBadge?.show &&
          categoryBadge.position === "below-title" &&
          primaryCategory && (
            <div>
              <CategoryBadge
                category={primaryCategory}
                badgeStyle={categoryBadge.style}
              />
            </div>
          )}

        {/* Excerpt */}
        {excerptSettings?.show && post.excerpt && (
          <p
            className={cn(
              "text-slate-600 dark:text-slate-400",
              excerptFontSizeMap[excerptSettings.fontSize || "sm"]
            )}
          >
            {post.excerpt.length > (excerptSettings.maxLength || 120)
              ? post.excerpt.slice(0, excerptSettings.maxLength || 120) + "..."
              : post.excerpt}
          </p>
        )}

        {/* Spacer to push meta and read more to bottom */}
        <div className="flex-1" />

        {/* Meta */}
        {metaSettings?.show && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-1.5 text-slate-500 dark:text-slate-400",
              metaFontSizeMap[metaSettings.fontSize || "xs"]
            )}
          >
            {metaSettings.items?.map((item, idx) => (
              <span key={item} className="flex items-center gap-1">
                {idx > 0 && (
                  <span className="mx-1 text-slate-300 dark:text-slate-600">
                    {getMetaSeparator(metaSettings.separator || "dot")}
                  </span>
                )}
                {item === "date" && (
                  <>
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatBlogDate(
                        postDate,
                        metaSettings.dateFormat || "short"
                      )}
                    </span>
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
                    <span>{calculateReadingTime(post.excerpt)}</span>
                  </>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Read More */}
        {readMoreSettings?.show && (
          <div className="mt-1">
            {readMoreSettings.style === "link" && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                {readMoreSettings.text || "Read more"}
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            )}
            {readMoreSettings.style === "button-sm" && (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                {readMoreSettings.text || "Read more"}
              </span>
            )}
            {readMoreSettings.style === "arrow-only" && (
              <span className="inline-flex items-center text-slate-500 transition-transform group-hover:translate-x-1 dark:text-slate-400">
                <svg
                  className="h-5 w-5"
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

// ── Category Badge Sub-Component ────────────────────────────────────

function CategoryBadge({
  category,
  badgeStyle,
}: {
  category: { id: string; name: string; slug: string };
  badgeStyle: "pill" | "solid" | "minimal";
}) {
  const baseClasses = "inline-block text-xs font-medium";

  switch (badgeStyle) {
    case "pill":
      return (
        <span
          className={cn(
            baseClasses,
            "rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          )}
        >
          {category.name}
        </span>
      );
    case "solid":
      return (
        <span
          className={cn(
            baseClasses,
            "rounded bg-blue-600 px-2 py-0.5 text-white dark:bg-blue-500"
          )}
        >
          {category.name}
        </span>
      );
    case "minimal":
      return (
        <span
          className={cn(
            baseClasses,
            "text-blue-600 dark:text-blue-400"
          )}
        >
          {category.name}
        </span>
      );
    default:
      return (
        <span
          className={cn(
            baseClasses,
            "rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          )}
        >
          {category.name}
        </span>
      );
  }
}
