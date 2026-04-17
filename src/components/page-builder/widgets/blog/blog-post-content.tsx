"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { BlogPostContentWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_CONTENT_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { useBlogPostContext } from "@/components/page-builder/context/blog-post-context";

interface Props {
  settings: BlogPostContentWidgetSettings;
}

const proseSizeClass: Record<string, string> = {
  sm: "prose-sm",
  base: "prose-base",
  lg: "prose-lg",
  xl: "prose-xl",
};

const aspectClass: Record<string, string> = {
  "16:9": "aspect-video",
  "21:9": "aspect-21/9",
  "4:3": "aspect-4/3",
};

/**
 * Adds id="..." to all h2/h3/h4 elements in the rendered content so the TOC widget
 * can scroll-spy them. We do this client-side via a ref + effect to avoid
 * pre-processing the HTML on the server.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogPostContentWidget({ settings: rawSettings }: Props) {
  const post = useBlogPostContext();
  const contentRef = useRef<HTMLDivElement>(null);

  const s = useMemo<BlogPostContentWidgetSettings>(
    () => ({
      ...DEFAULT_BLOG_POST_CONTENT_SETTINGS,
      ...rawSettings,
      coverImage: { ...DEFAULT_BLOG_POST_CONTENT_SETTINGS.coverImage, ...rawSettings?.coverImage },
      prose: { ...DEFAULT_BLOG_POST_CONTENT_SETTINGS.prose, ...rawSettings?.prose },
    }),
    [rawSettings]
  );

  // Add ids to headings (for TOC scroll-spy)
  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll<HTMLHeadingElement>("h2, h3, h4");
    headings.forEach((h) => {
      if (!h.id) {
        h.id = slugify(h.textContent || "");
      }
      h.style.scrollMarginTop = "100px";
    });
  }, [post?.content]);

  if (!post) {
    return (
      <WidgetContainer container={s.container}>
        <div className="text-center text-sm opacity-60 py-8">[Blog Post Content — preview only on blog detail pages]</div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer container={s.container}>
      <div className="mx-auto" style={{ maxWidth: s.prose.maxWidth }}>
        {/* Cover image */}
        {s.coverImage.show && post.coverImage && (
          <div
            className={cn("relative overflow-hidden w-full", aspectClass[s.coverImage.aspectRatio || "16:9"])}
            style={{
              borderRadius: s.coverImage.borderRadius,
              marginBottom: s.coverImage.marginBottom,
            }}
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              priority={false}
            />
          </div>
        )}

        {/* Article HTML */}
        <article
          ref={contentRef}
          className={cn("prose max-w-none", proseSizeClass[s.prose.size || "lg"])}
          style={
            {
              "--tw-prose-body": s.prose.bodyColor,
              "--tw-prose-headings": s.prose.headingColor,
              "--tw-prose-links": s.prose.linkColor,
              "--tw-prose-bold": s.prose.headingColor,
              "--tw-prose-quotes": s.prose.quoteColor,
              "--tw-prose-quote-borders": s.prose.linkColor,
              "--tw-prose-code": s.prose.linkColor,
              "--tw-prose-pre-bg": s.prose.codeBg,
            } as React.CSSProperties
          }
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />
      </div>
    </WidgetContainer>
  );
}
