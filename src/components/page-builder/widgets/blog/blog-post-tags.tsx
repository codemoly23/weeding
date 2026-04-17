"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BlogPostTagsWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_TAGS_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { useBlogPostContext } from "@/components/page-builder/context/blog-post-context";

interface Props {
  settings: BlogPostTagsWidgetSettings;
}

export function BlogPostTagsWidget({ settings: rawSettings }: Props) {
  const post = useBlogPostContext();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const s = useMemo<BlogPostTagsWidgetSettings>(
    () => ({ ...DEFAULT_BLOG_POST_TAGS_SETTINGS, ...rawSettings }),
    [rawSettings]
  );

  if (!post || !post.tags || post.tags.length === 0) return null;

  return (
    <WidgetContainer container={s.container}>
      <div className={cn("flex flex-col gap-3", s.alignment === "center" && "items-center")}>
        {s.showLabel && (
          <h4
            className="font-display font-semibold text-[12px] uppercase"
            style={{ color: "var(--color-muted-foreground, #64748b)", letterSpacing: "0.1em" }}
          >
            {s.label}
          </h4>
        )}
        <ul className={cn("flex flex-wrap gap-2.5", s.alignment === "center" && "justify-center")}>
          {post.tags.map((tag, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <li key={tag}>
                <Link
                  href={`${s.linkPrefix || "/blog/tag/"}${tag}`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="inline-block font-display font-medium transition-all duration-200"
                  style={{
                    background: isHovered ? s.tagHoverBgColor : s.tagBgColor,
                    color: isHovered ? s.tagHoverTextColor : s.tagTextColor,
                    border: `1px solid ${isHovered ? s.tagHoverBgColor : s.tagBorderColor}`,
                    borderRadius: s.pillStyle === "rounded" ? 9999 : 6,
                    padding: "8px 16px",
                    fontSize: s.fontSize,
                    textTransform: s.uppercase ? "uppercase" : "none",
                    letterSpacing: s.letterSpacing,
                  }}
                >
                  #{tag}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </WidgetContainer>
  );
}
