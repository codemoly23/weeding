"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Slash, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BreadcrumbWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BREADCRUMB_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { useBlogPostContext } from "@/components/page-builder/context/blog-post-context";

interface Props {
  settings: BreadcrumbWidgetSettings;
}

interface Crumb {
  label: string;
  url?: string;
}

function Separator({ type, color }: { type: BreadcrumbWidgetSettings["separator"]; color?: string }) {
  const style = { color };
  if (type === "slash") return <Slash className="h-3 w-3" style={style} />;
  if (type === "arrow") return <ArrowRight className="h-3.5 w-3.5" style={style} />;
  if (type === "dot") return <span className="w-1 h-1 rounded-full" style={{ background: color }} />;
  return <ChevronRight className="h-3.5 w-3.5" style={style} />;
}

export function BreadcrumbWidget({ settings: rawSettings }: Props) {
  const post = useBlogPostContext();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const s = useMemo<BreadcrumbWidgetSettings>(
    () => ({ ...DEFAULT_BREADCRUMB_SETTINGS, ...rawSettings }),
    [rawSettings]
  );

  // Build crumbs
  const crumbs: Crumb[] = useMemo(() => {
    if (s.manualCrumbs && s.manualCrumbs.length > 0) {
      return [{ label: s.homeLabel, url: s.homeUrl }, ...s.manualCrumbs];
    }
    if (post) {
      const cat = post.categories?.[0];
      const built: Crumb[] = [
        { label: s.homeLabel, url: s.homeUrl },
        { label: "Blog", url: "/blog" },
      ];
      if (cat) built.push({ label: cat.name, url: `/blog?category=${cat.slug}` });
      if (s.showCurrent) built.push({ label: post.title });
      return built;
    }
    return [{ label: s.homeLabel, url: s.homeUrl }];
  }, [s.homeLabel, s.homeUrl, s.manualCrumbs, s.showCurrent, post]);

  return (
    <WidgetContainer container={s.container}>
      <nav
        className={cn(
          "flex flex-wrap items-center gap-2",
          s.alignment === "center" && "justify-center",
          s.alignment === "right" && "justify-end"
        )}
        style={{
          fontSize: s.fontSize,
          textTransform: s.uppercase ? "uppercase" : "none",
          letterSpacing: s.letterSpacing,
        }}
      >
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          const isHovered = hoveredIdx === idx;
          const color = isLast ? s.currentColor : isHovered ? s.hoverColor : s.color;

          return (
            <span key={`${crumb.label}-${idx}`} className="flex items-center gap-2">
              {crumb.url && !isLast ? (
                <Link
                  href={crumb.url}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="transition-colors"
                  style={{ color }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ color, fontWeight: isLast ? 600 : 400 }}>{crumb.label}</span>
              )}
              {!isLast && <Separator type={s.separator} color={s.separatorColor} />}
            </span>
          );
        })}
      </nav>
    </WidgetContainer>
  );
}
