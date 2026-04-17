"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { BlogPostTocWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_TOC_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { useBlogPostContext } from "@/components/page-builder/context/blog-post-context";

interface Props {
  settings: BlogPostTocWidgetSettings;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Extract H2/H3/H4 headings from the article HTML at content load */
function extractHeadings(html: string, levels: number[]): TocItem[] {
  if (!html) return [];
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const items: TocItem[] = [];
  const selector = levels.map((l) => `h${l}`).join(",");
  doc.querySelectorAll(selector).forEach((el) => {
    const text = el.textContent || "";
    const level = parseInt(el.tagName.substring(1), 10);
    items.push({ id: slugify(text), text, level });
  });
  return items;
}

export function BlogPostTocWidget({ settings: rawSettings }: Props) {
  const post = useBlogPostContext();

  const s = useMemo<BlogPostTocWidgetSettings>(
    () => ({ ...DEFAULT_BLOG_POST_TOC_SETTINGS, ...rawSettings }),
    [rawSettings]
  );

  const items = useMemo(
    () => extractHeadings(post?.content || "", s.headingLevels),
    [post?.content, s.headingLevels]
  );

  const [activeId, setActiveId] = useState<string>("");

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    if (!s.scrollSpy || items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items, s.scrollSpy]);

  if (!post) {
    return (
      <WidgetContainer container={s.container}>
        <div className="text-center text-sm opacity-60">[TOC — preview only on blog detail pages]</div>
      </WidgetContainer>
    );
  }

  if (items.length === 0) return null;

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - (s.stickyTop ?? 100), behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <WidgetContainer container={s.container}>
      <nav
        className={cn("rounded-xl p-5", s.sticky && "lg:sticky")}
        style={{
          top: s.sticky ? s.stickyTop : undefined,
          border: `1px solid ${s.borderColor}`,
          background: "var(--color-card, #ffffff)",
        }}
      >
        {s.showTitle && (
          <h4
            className="font-display font-semibold text-[12px] uppercase mb-4"
            style={{ color: s.titleColor, letterSpacing: "0.1em" }}
          >
            {s.title}
          </h4>
        )}
        <ul className="flex flex-col" style={{ gap: s.itemSpacing }}>
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id} style={{ paddingLeft: (item.level - 2) * 12 }}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className="block transition-all duration-200 rounded-md py-1.5 px-2 -mx-2"
                  style={{
                    color: isActive ? s.activeColor : s.itemColor,
                    background: isActive ? s.activeBgColor : "transparent",
                    fontSize: s.fontSize,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </WidgetContainer>
  );
}
