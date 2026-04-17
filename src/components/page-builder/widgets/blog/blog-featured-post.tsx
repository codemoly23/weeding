"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BlogFeaturedPostWidgetSettings,
  BlogPostData,
} from "@/lib/page-builder/types";
import { DEFAULT_BLOG_FEATURED_POST_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { addFeaturedExcluded } from "./shared/featured-exclusion-store";

// ── Deep merge settings with defaults ────────────────────────────────

function mergeSettings(
  settings: BlogFeaturedPostWidgetSettings
): BlogFeaturedPostWidgetSettings {
  const d = DEFAULT_BLOG_FEATURED_POST_SETTINGS;
  return {
    ...d,
    ...settings,
    dataSource: { ...d.dataSource, ...settings?.dataSource },
    image: {
      ...d.image,
      ...settings?.image,
      overlay: { ...d.image.overlay, ...settings?.image?.overlay },
      emblem: { ...d.image.emblem!, ...settings?.image?.emblem },
      decorative: { ...d.image.decorative!, ...settings?.image?.decorative },
    },
    featuredTag: { ...d.featuredTag!, ...settings?.featuredTag },
    card: { ...d.card!, ...settings?.card },
    content: {
      ...d.content,
      ...settings?.content,
      categoryBadge: {
        ...d.content.categoryBadge,
        ...settings?.content?.categoryBadge,
      },
      title: { ...d.content.title, ...settings?.content?.title },
      excerpt: { ...d.content.excerpt, ...settings?.content?.excerpt },
      meta: { ...d.content.meta, ...settings?.content?.meta },
      readMore: { ...d.content.readMore, ...settings?.content?.readMore },
      author: { ...d.content.author!, ...settings?.content?.author },
    },
  };
}

// ── Date formatting ──────────────────────────────────────────────────

function formatDate(
  dateStr: string | null,
  format: "relative" | "short" | "long"
): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  if (format === "relative") {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  if (format === "short") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatReadingTime(post: { readingMinutes?: number | null; excerpt?: string | null }): string {
  if (post.readingMinutes && post.readingMinutes > 0) {
    return `${post.readingMinutes} min read`;
  }
  // Fallback: estimate from excerpt (legacy posts without column populated)
  const text = post.excerpt;
  if (!text) return "1 min read";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

// ── Height classes ───────────────────────────────────────────────────

function getHeightClass(height: string): string {
  switch (height) {
    case "sm":
      return "min-h-[300px] md:min-h-[350px]";
    case "md":
      return "min-h-[350px] md:min-h-[450px]";
    case "lg":
      return "min-h-[400px] md:min-h-[550px]";
    case "xl":
      return "min-h-[500px] md:min-h-[650px]";
    default:
      return "";
  }
}

// ── Title size classes ───────────────────────────────────────────────

function getTitleSizeClass(size: string): string {
  switch (size) {
    case "lg":
      return "text-xl md:text-2xl";
    case "xl":
      return "text-2xl md:text-3xl";
    case "2xl":
      return "text-3xl md:text-4xl";
    case "3xl":
      return "text-4xl md:text-5xl";
    default:
      return "text-2xl md:text-3xl";
  }
}

// ── Excerpt font size ────────────────────────────────────────────────

function getExcerptSizeClass(size: string): string {
  switch (size) {
    case "sm":
      return "text-sm";
    case "md":
      return "text-base";
    case "lg":
      return "text-lg";
    default:
      return "text-base";
  }
}

// ── Props ────────────────────────────────────────────────────────────

interface BlogFeaturedPostWidgetProps {
  settings: BlogFeaturedPostWidgetSettings;
  isPreview?: boolean;
}

// ── Widget Component ─────────────────────────────────────────────────

export function BlogFeaturedPostWidget({
  settings: rawSettings,
  isPreview,
}: BlogFeaturedPostWidgetProps) {
  const s = useMemo(() => mergeSettings(rawSettings), [rawSettings]);
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable key for the featured post fetch - uses primitives only
  const fetchKey = `${s.dataSource.source}|${s.dataSource.postId ?? ""}|${s.dataSource.categorySlug ?? ""}`;

  // Fetch featured post
  useEffect(() => {
    let cancelled = false;

    async function fetchPost() {
      setLoading(true);
      setError(null);

      try {
        let url: string;

        switch (s.dataSource.source) {
          case "specific":
            if (s.dataSource.postId) {
              url = `/api/blog/${s.dataSource.postId}`;
            } else {
              url = "/api/blog?limit=1";
            }
            break;
          case "category-latest":
            if (s.dataSource.categorySlug) {
              url = `/api/blog?category=${s.dataSource.categorySlug}&limit=1`;
            } else {
              url = "/api/blog?limit=1";
            }
            break;
          case "latest":
          default:
            url = "/api/blog?limit=1";
            break;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch featured post");

        if (cancelled) return;
        const data = await res.json();
        if (cancelled) return;

        // Handle single post vs list response
        if (data.posts) {
          setPost(data.posts[0] || null);
        } else if (data.id) {
          setPost(data);
        } else {
          setPost(null);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load featured post"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPost();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  // Broadcast post ID to sibling blog-post-grid widgets when excludeFromGrid is enabled
  useEffect(() => {
    if (!post?.id || !s.dataSource.excludeFromGrid) return;
    const cleanup = addFeaturedExcluded(post.id);
    return cleanup;
  }, [post?.id, s.dataSource.excludeFromGrid]);

  // Loading skeleton
  if (loading) {
    return (
      <WidgetContainer container={s.container}>
      <div
        className={cn(
          "animate-pulse overflow-hidden bg-slate-200 dark:bg-slate-700",
          getHeightClass(s.height)
        )}
        style={{ borderRadius: s.image.borderRadius }}
      />
      </WidgetContainer>
    );
  }

  // Error
  if (error) {
    return (
      <WidgetContainer container={s.container}>
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/10">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
      </WidgetContainer>
    );
  }

  // No post
  if (!post) {
    return (
      <WidgetContainer container={s.container}>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
        <ImageIcon className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No featured post available
        </p>
      </div>
      </WidgetContainer>
    );
  }

  const primaryCategory = post.categories?.[0];
  const postDate = post.publishedAt || post.createdAt;
  const postUrl = `/blog/${post.slug}`;

  // Author resolution
  const authorSettings = s.content.author;
  const authorName =
    authorSettings?.source === "manual"
      ? authorSettings.name || ""
      : (post as unknown as { authorName?: string }).authorName || authorSettings?.name || "";
  const authorRole = authorSettings?.role || "";
  const authorInitials =
    authorSettings?.initials ||
    (authorName
      ? authorName
          .split(/\s+/)
          .map((w) => w[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "");

  // Content rendering
  const isOverlay = s.layout === "overlay";
  const titleColor = s.content.title.color || (isOverlay ? "#ffffff" : "#0f172a");
  const excerptColor = s.content.excerpt.color || (isOverlay ? "rgba(255,255,255,0.8)" : "#64748b");
  const metaTextColor = s.content.meta.textColor || (isOverlay ? "rgba(255,255,255,0.6)" : "#64748b");
  const metaCategoryColor = s.content.meta.categoryColor || "#e84c1e";
  const metaDotColor = s.content.meta.dotColor || "#f97316";
  const readMoreColor = s.content.readMore.color || (isOverlay ? "#ffffff" : "#e84c1e");

  const contentBlock = (
    <div
      className={cn(
        "flex flex-col gap-4",
        s.content.alignment === "center" && "items-center text-center"
      )}
    >
      {/* Category Badge (legacy — usually off when featuredTag is used) */}
      {s.content.categoryBadge.show && primaryCategory && (
        <span
          className={cn(
            "inline-block w-fit text-xs font-medium",
            s.content.categoryBadge.style === "pill"
              ? "rounded-full bg-blue-500/90 px-3 py-1 text-white"
              : "rounded bg-blue-500/90 px-2 py-0.5 text-white"
          )}
        >
          {primaryCategory.name}
        </span>
      )}

      {/* Meta — inline-dots style: CATEGORY • date • read time */}
      {s.content.meta.show && s.content.meta.style === "inline-dots" && (
        <div
          className="flex flex-wrap items-center gap-3 text-[13px] font-medium"
          style={{ color: metaTextColor }}
        >
          {primaryCategory && (
            <>
              <span
                className="font-display font-bold uppercase text-[12px]"
                style={{
                  color: metaCategoryColor,
                  letterSpacing: "0.05em",
                }}
              >
                {primaryCategory.name}
              </span>
              <span
                className="rounded-full"
                style={{ width: 4, height: 4, background: metaDotColor }}
              />
            </>
          )}
          <span>{formatDate(postDate, s.content.meta.dateFormat)}</span>
          <span
            className="rounded-full"
            style={{ width: 4, height: 4, background: metaDotColor }}
          />
          <span>{formatReadingTime(post)}</span>
        </div>
      )}

      {/* Title */}
      <h2
        className={cn(
          "font-display font-bold leading-tight tracking-tight",
          !s.content.title.customFontSize && getTitleSizeClass(s.content.title.size)
        )}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: s.content.title.maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          fontWeight: s.content.title.fontWeight,
          color: titleColor,
          fontSize: s.content.title.customFontSize,
        }}
      >
        {post.title}
      </h2>

      {/* Excerpt */}
      {s.content.excerpt.show && post.excerpt && (
        <p
          className={cn(getExcerptSizeClass(s.content.excerpt.fontSize), "leading-relaxed")}
          style={{ color: excerptColor }}
        >
          {post.excerpt.length > s.content.excerpt.maxLength
            ? `${post.excerpt.slice(0, s.content.excerpt.maxLength)}...`
            : post.excerpt}
        </p>
      )}

      {/* Meta — icons style (legacy) */}
      {s.content.meta.show && s.content.meta.style !== "inline-dots" && (
        <div
          className="flex flex-wrap items-center gap-3 text-sm"
          style={{ color: metaTextColor }}
        >
          {s.content.meta.items.map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              {item === "date" && (
                <>
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(postDate, s.content.meta.dateFormat)}
                </>
              )}
              {item === "readingTime" && (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  {formatReadingTime(post)}
                </>
              )}
              {item === "category" && primaryCategory && (
                <>
                  <Tag className="h-3.5 w-3.5" />
                  {primaryCategory.name}
                </>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Author Block */}
      {authorSettings?.show && (authorName || authorInitials) && (
        <div className="flex items-center gap-3.5 mt-2">
          {authorSettings.avatarUrl ? (
            <img
              src={authorSettings.avatarUrl}
              alt={authorName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full font-display font-bold text-white text-[18px]"
              style={{
                background: `linear-gradient(135deg, ${authorSettings.avatarBgFrom || "#f97316"}, ${authorSettings.avatarBgTo || "#e84c1e"})`,
              }}
            >
              {authorInitials || "•"}
            </div>
          )}
          <div className="text-left">
            <div className="font-semibold text-[14px]" style={{ color: authorSettings.nameColor || "#0f172a" }}>
              {authorName}
            </div>
            {authorRole && (
              <div className="text-[13px]" style={{ color: authorSettings.roleColor || "#64748b" }}>
                {authorRole}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Read More */}
      {s.content.readMore.show && (
        <div className="mt-2">
          {(s.content.readMore.style === "button-primary" ||
            s.content.readMore.style === "button-outline") && (
            <span
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-display font-semibold transition-all hover:opacity-90"
              style={{
                background:
                  s.content.readMore.style === "button-primary" ? readMoreColor : "transparent",
                color:
                  s.content.readMore.style === "button-primary" ? "#ffffff" : readMoreColor,
                border:
                  s.content.readMore.style === "button-outline" ? `1px solid ${readMoreColor}` : "none",
              }}
            >
              {s.content.readMore.text}
            </span>
          )}
          {s.content.readMore.style === "link" && (
            <span
              className="inline-flex items-center gap-1 text-sm font-display font-semibold"
              style={{ color: readMoreColor }}
            >
              {s.content.readMore.text}
            </span>
          )}
          {s.content.readMore.style === "arrow" && (
            <span
              className="inline-flex items-center gap-2 text-[15px] font-display font-semibold transition-all group-hover:gap-3"
              style={{ color: readMoreColor }}
            >
              {s.content.readMore.text}
              <svg
                className="h-[18px] w-[18px]"
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
  );

  // Resolve emblem mode
  const emblem = s.image.emblem;
  const decorative = s.image.decorative;
  const useEmblem =
    emblem?.enabled &&
    (emblem.mode === "always" || (emblem.mode === "fallback" && !post.coverImage));

  // Auto-derive emblem text if needed
  const emblemText = (() => {
    if (!useEmblem) return "";
    if (emblem?.text) return emblem.text;
    if (emblem?.autoFromCategory && primaryCategory) {
      // Try to extract uppercase letters or first 4 chars
      const slug = primaryCategory.slug || primaryCategory.name || "";
      const upper = slug.replace(/[^A-Za-z]/g, "").toUpperCase();
      return upper.slice(0, 4) || primaryCategory.name.slice(0, 4).toUpperCase();
    }
    return primaryCategory?.name?.slice(0, 4).toUpperCase() || "";
  })();

  // Featured tag (overlay on image side)
  const featuredTagEl = s.featuredTag?.show && (
    <span
      className="absolute font-display font-bold z-20"
      style={{
        top: 24,
        left: s.featuredTag.position === "top-right" ? undefined : 24,
        right: s.featuredTag.position === "top-right" ? 24 : undefined,
        background: s.featuredTag.bgColor || "#e84c1e",
        color: s.featuredTag.textColor || "#ffffff",
        padding: "8px 16px",
        borderRadius: 9999,
        fontSize: 11,
        letterSpacing: s.featuredTag.letterSpacing || "0.08em",
        textTransform: s.featuredTag.uppercase ? "uppercase" : "none",
        boxShadow: s.featuredTag.shadow || "0 4px 14px rgba(232,76,30,0.4)",
      }}
    >
      {s.featuredTag.text}
    </span>
  );

  // Image / Emblem element
  const imageElement = (
    <div className="relative h-full w-full overflow-hidden">
      {useEmblem ? (
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{
            background: decorative?.background || "linear-gradient(135deg, #1b3a2d 0%, #0f2318 100%)",
            minHeight: 420,
          }}
        >
          {/* Decorative grid */}
          {decorative?.showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(${decorative.gridColor || "rgba(249,115,22,0.06)"} 1px, transparent 1px), linear-gradient(90deg, ${decorative.gridColor || "rgba(249,115,22,0.06)"} 1px, transparent 1px)`,
                backgroundSize: `${decorative.gridSize || 40}px ${decorative.gridSize || 40}px`,
              }}
            />
          )}
          {/* Decorative glow */}
          {decorative?.showGlow && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-30%",
                right: "-30%",
                width: decorative.glowSize || 400,
                height: decorative.glowSize || 400,
                background: `radial-gradient(circle, ${decorative.glowColor || "rgba(249,115,22,0.18)"} 0%, transparent 60%)`,
              }}
            />
          )}
          {/* Emblem text */}
          <span
            className="relative z-[1] font-display font-bold select-none"
            style={{
              fontSize: emblem?.fontSize || 120,
              color: emblem?.color || "#f97316",
              opacity: emblem?.opacity ?? 0.4,
              letterSpacing: emblem?.letterSpacing || "-0.05em",
              lineHeight: 1,
            }}
          >
            {emblemText}
          </span>
          {featuredTagEl}
        </div>
      ) : post.coverImage ? (
        <>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className={cn(
              "object-cover",
              s.image.hoverEffect === "zoom" &&
                "transition-transform duration-700 group-hover:scale-105",
              s.image.hoverEffect === "ken-burns" &&
                "animate-[kenburns_20s_ease-in-out_infinite]"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
            priority
          />
          {featuredTagEl}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
          <ImageIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
          {featuredTagEl}
        </div>
      )}

      {/* Image overlay */}
      {s.image.overlay.enabled && !useEmblem && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: s.image.overlay.color,
            opacity: s.image.overlay.opacity,
          }}
        />
      )}
    </div>
  );

  // Card wrapper styles (for split layouts)
  const cardStyle: React.CSSProperties = {
    background: s.card?.background || "#ffffff",
    border: s.card?.borderWidth
      ? `${s.card.borderWidth}px solid ${s.card.borderColor || "#e2e8f0"}`
      : undefined,
    borderRadius: s.card?.borderRadius ?? s.image.borderRadius,
    boxShadow: s.card?.shadow,
    transition: "transform 0.4s, box-shadow 0.4s",
  };
  const contentPadding = s.content.padding ?? 48;

  // Helper to wrap content in a Link or div
  function WrapLink({
    children,
    className,
    style,
    onMouseEnter,
    onMouseLeave,
  }: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
  }) {
    if (isPreview) {
      return (
        <div className={className} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          {children}
        </div>
      );
    }
    return (
      <Link href={postUrl} className={className} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </Link>
    );
  }

  // ── Layout: Overlay ──────────────────────────────────────────────
  if (s.layout === "overlay") {
    return (
      <WidgetContainer container={s.container}>
      <WrapLink
        className={cn(
          "group relative block overflow-hidden",
          getHeightClass(s.height)
        )}
        style={{ borderRadius: s.image.borderRadius }}
      >
        {imageElement}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content positioned at bottom */}
        <div
          className={cn(
            "absolute inset-0 flex items-end p-6 md:p-10",
            s.content.verticalPosition === "top" && "items-start",
            s.content.verticalPosition === "center" && "items-center"
          )}
        >
          <div className="max-w-2xl">{contentBlock}</div>
        </div>
      </WrapLink>
      </WidgetContainer>
    );
  }

  // ── Layout: Split Left / Split Right ─────────────────────────────
  if (s.layout === "split-left" || s.layout === "split-right") {
    const imageOnLeft = s.layout === "split-left";

    return (
      <WidgetContainer container={s.container}>
      <WrapLink
        className={cn(
          "group grid overflow-hidden md:grid-cols-[1.1fr_1fr]",
          getHeightClass(s.height),
          s.card?.hoverLift && !isPreview && "hover:-translate-y-1"
        )}
        style={cardStyle}
        onMouseEnter={(e) => {
          if (isPreview) return;
          if (s.card?.hoverShadow) e.currentTarget.style.boxShadow = s.card.hoverShadow;
        }}
        onMouseLeave={(e) => {
          if (isPreview) return;
          if (s.card?.shadow) e.currentTarget.style.boxShadow = s.card.shadow;
        }}
      >
        {/* Image */}
        <div
          className={cn(
            "relative aspect-video md:aspect-auto md:min-h-[420px]",
            !imageOnLeft && "md:order-2"
          )}
        >
          {imageElement}
        </div>

        {/* Content */}
        <div
          className={cn(
            "flex flex-col justify-center",
            !imageOnLeft && "md:order-1"
          )}
          style={{
            padding: `${contentPadding}px`,
            background: s.card?.background || "#ffffff",
          }}
        >
          {contentBlock}
        </div>
      </WrapLink>
      </WidgetContainer>
    );
  }

  // ── Layout: Stacked ──────────────────────────────────────────────
  return (
    <WidgetContainer container={s.container}>
    <WrapLink
      className="group block overflow-hidden"
      style={{ borderRadius: s.image.borderRadius }}
    >
      {/* Image on top */}
      <div data-field-id="image" className="relative aspect-video w-full overflow-hidden">
        {imageElement}
      </div>

      {/* Content below */}
      <div data-field-id="content" className="p-6 md:p-8">{contentBlock}</div>
    </WrapLink>
    </WidgetContainer>
  );
}
