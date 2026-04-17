"use client";

import { useMemo } from "react";
import { Twitter, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogPostAuthorCardWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_AUTHOR_CARD_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { useBlogPostContext } from "@/components/page-builder/context/blog-post-context";

interface Props {
  settings: BlogPostAuthorCardWidgetSettings;
}

function getInitials(name: string): string {
  if (!name) return "•";
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export function BlogPostAuthorCardWidget({ settings: rawSettings }: Props) {
  const post = useBlogPostContext();

  const s = useMemo<BlogPostAuthorCardWidgetSettings>(
    () => ({ ...DEFAULT_BLOG_POST_AUTHOR_CARD_SETTINGS, ...rawSettings }),
    [rawSettings]
  );

  if (!post || !post.authorName) {
    return null;
  }

  const initials = getInitials(post.authorName);

  return (
    <WidgetContainer container={s.container}>
      <div
        className={cn(
          "flex gap-6",
          s.layout === "vertical" ? "flex-col items-center text-center" : "flex-row items-center"
        )}
        style={{
          background: s.cardBg,
          border: `1px solid ${s.cardBorderColor}`,
          borderRadius: s.cardBorderRadius,
          padding: s.cardPadding,
        }}
      >
        {s.showAvatar && (
          <div className="shrink-0">
            {post.authorAvatarUrl ? (
              <img
                src={post.authorAvatarUrl}
                alt={post.authorName}
                className="rounded-full object-cover"
                style={{ width: s.avatarSize, height: s.avatarSize }}
              />
            ) : (
              <div
                className="flex items-center justify-center rounded-full font-display font-bold text-white"
                style={{
                  width: s.avatarSize,
                  height: s.avatarSize,
                  fontSize: (s.avatarSize ?? 80) * 0.36,
                  background: `linear-gradient(135deg, ${s.avatarBgFrom}, ${s.avatarBgTo})`,
                }}
              >
                {initials}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4
            className="font-display font-bold text-[18px] mb-1"
            style={{ color: s.nameColor }}
          >
            {post.authorName}
          </h4>

          {s.showRole && post.authorRole && (
            <div
              className="text-[14px] mb-3"
              style={{ color: s.roleColor }}
            >
              {post.authorRole}
            </div>
          )}

          {s.showBio && post.authorBio && (
            <p
              className="text-[14px] leading-relaxed mb-4"
              style={{ color: s.bioColor }}
            >
              {post.authorBio}
            </p>
          )}

          {s.showSocial && (post.authorTwitter || post.authorLinkedin) && (
            <div className="flex items-center gap-3">
              {post.authorTwitter && (
                <a
                  href={post.authorTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: s.socialIconColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = s.socialHoverColor || "")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = s.socialIconColor || "")}
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {post.authorLinkedin && (
                <a
                  href={post.authorLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: s.socialIconColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = s.socialHoverColor || "")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = s.socialIconColor || "")}
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </WidgetContainer>
  );
}
