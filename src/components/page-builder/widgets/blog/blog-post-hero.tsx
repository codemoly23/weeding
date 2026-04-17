"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogPostHeroWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_HERO_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { useBlogPostContext } from "@/components/page-builder/context/blog-post-context";

interface Props {
  settings: BlogPostHeroWidgetSettings;
  isPreview?: boolean;
}

function getInitials(name: string): string {
  if (!name) return "•";
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatViews(views: number | null | undefined): string {
  if (!views || views < 1000) return String(views ?? 0);
  if (views < 1_000_000) return `${(views / 1000).toFixed(views < 10000 ? 1 : 0)}K`;
  return `${(views / 1_000_000).toFixed(1)}M`;
}

export function BlogPostHeroWidget({ settings: rawSettings }: Props) {
  const post = useBlogPostContext();
  const s = useMemo<BlogPostHeroWidgetSettings>(
    () => ({
      ...DEFAULT_BLOG_POST_HERO_SETTINGS,
      ...rawSettings,
      breadcrumb: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.breadcrumb, ...rawSettings?.breadcrumb },
      categoryPill: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.categoryPill, ...rawSettings?.categoryPill },
      title: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.title, ...rawSettings?.title },
      lead: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.lead, ...rawSettings?.lead },
      meta: { ...DEFAULT_BLOG_POST_HERO_SETTINGS.meta, ...rawSettings?.meta },
    }),
    [rawSettings]
  );

  if (!post) {
    return (
      <WidgetContainer container={s.container}>
        <div className="text-center text-sm opacity-60">[Blog Post Hero — preview only on blog detail pages]</div>
      </WidgetContainer>
    );
  }

  const primaryCategory = post.categories?.[0];
  const postDate = post.publishedAt || post.createdAt;
  const initials = getInitials(post.authorName || "");
  const accentWordsArr = (s.title.accentWords || "").split(",").map((w) => w.trim()).filter(Boolean);

  // Render title with accent
  const renderTitle = () => {
    const text = post.title;
    if (accentWordsArr.length === 0) return text;
    const escaped = accentWordsArr.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`(${escaped.join("|")})`, "gi");
    const parts = text.split(re);
    return parts.map((part, i) => {
      const isAccent = accentWordsArr.some((w) => w.toLowerCase() === part.toLowerCase());
      return isAccent ? (
        <span key={i} style={{ color: s.title.accentColor }}>{part}</span>
      ) : (
        <span key={i}>{part}</span>
      );
    });
  };

  return (
    <WidgetContainer container={s.container}>
      <div className={cn("relative z-10 mx-auto w-full", s.alignment === "center" ? "text-center" : "text-left")} style={{ maxWidth: 880 }}>
        {/* Breadcrumb */}
        {s.breadcrumb.show && (
          <nav
            className={cn("flex flex-wrap items-center gap-2 text-[13px] mb-6", s.alignment === "center" && "justify-center")}
            style={{ color: s.breadcrumb.color }}
          >
            <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" style={{ color: s.breadcrumb.separatorColor }} />
            <Link href="/blog" className="hover:opacity-80 transition-opacity">Blog</Link>
            {primaryCategory && (
              <>
                <ChevronRight className="h-3.5 w-3.5" style={{ color: s.breadcrumb.separatorColor }} />
                <Link href={`/blog?category=${primaryCategory.slug}`} className="hover:opacity-80 transition-opacity">
                  {primaryCategory.name}
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Category pill */}
        {s.categoryPill.show && primaryCategory && (
          <div className={cn("mb-5", s.alignment === "center" && "flex justify-center")}>
            <span
              className="inline-block font-display font-bold rounded-full"
              style={{
                background: s.categoryPill.bgColor,
                color: s.categoryPill.textColor,
                border: s.categoryPill.borderColor ? `1px solid ${s.categoryPill.borderColor}` : undefined,
                padding: "8px 18px",
                fontSize: 12,
                letterSpacing: s.categoryPill.letterSpacing,
                textTransform: s.categoryPill.uppercase ? "uppercase" : "none",
              }}
            >
              {primaryCategory.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          className="font-display"
          style={{
            color: s.title.color,
            fontSize: s.title.customFontSize,
            fontWeight: s.title.fontWeight,
            lineHeight: s.title.lineHeight,
            letterSpacing: s.title.letterSpacing,
            marginBottom: 24,
          }}
        >
          {renderTitle()}
        </h1>

        {/* Lead */}
        {s.lead.show && post.excerpt && (
          <p
            className={cn("leading-relaxed", s.alignment === "center" && "mx-auto")}
            style={{
              color: s.lead.color,
              fontSize: s.lead.fontSize,
              maxWidth: s.lead.maxWidth,
              marginBottom: 36,
            }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        {s.meta.show && (
          <div className={cn("flex flex-wrap items-center gap-5", s.alignment === "center" && "justify-center")}>
            {s.meta.showAuthor && post.authorName && (
              <div className="flex items-center gap-3">
                {post.authorAvatarUrl ? (
                  <img src={post.authorAvatarUrl} alt={post.authorName} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full font-display font-bold text-white text-[16px]"
                    style={{ background: `linear-gradient(135deg, ${s.meta.avatarBgFrom}, ${s.meta.avatarBgTo})` }}
                  >
                    {initials}
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold text-[14px]" style={{ color: s.meta.nameColor }}>{post.authorName}</div>
                  {post.authorRole && (
                    <div className="text-[12px]" style={{ color: s.meta.roleColor }}>{post.authorRole}</div>
                  )}
                </div>
              </div>
            )}

            {(s.meta.showDate || s.meta.showReadingTime || s.meta.showViews) && s.meta.showAuthor && post.authorName && (
              <span className="h-10 w-px" style={{ background: s.meta.dividerColor }} />
            )}

            {s.meta.showDate && (
              <div className="flex items-center gap-2 text-[13px]" style={{ color: s.meta.statColor }}>
                <Calendar className="h-4 w-4" style={{ color: s.meta.iconColor }} />
                <span>{formatDate(postDate)}</span>
              </div>
            )}

            {s.meta.showReadingTime && (
              <>
                {s.meta.showDate && <span className="h-4 w-px" style={{ background: s.meta.dividerColor }} />}
                <div className="flex items-center gap-2 text-[13px]" style={{ color: s.meta.statColor }}>
                  <Clock className="h-4 w-4" style={{ color: s.meta.iconColor }} />
                  <span>{post.readingMinutes ?? 1} min read</span>
                </div>
              </>
            )}

            {s.meta.showViews && (
              <>
                {(s.meta.showDate || s.meta.showReadingTime) && <span className="h-4 w-px" style={{ background: s.meta.dividerColor }} />}
                <div className="flex items-center gap-2 text-[13px]" style={{ color: s.meta.statColor }}>
                  <Eye className="h-4 w-4" style={{ color: s.meta.iconColor }} />
                  <span>{formatViews(post.views)} views</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
