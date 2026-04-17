"use client";

import { useState, useMemo, useId, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import type { BlogPostGridWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_GRID_SETTINGS } from "@/lib/page-builder/defaults";
import { useBlogData } from "./shared/use-blog-data";
import {
  subscribeFeaturedExcluded,
  getFeaturedExcludedSnapshot,
  getFeaturedExcludedArray,
} from "./shared/featured-exclusion-store";
import { useBlogPostContext } from "@/components/page-builder/context/blog-post-context";
import { BlogCard } from "./shared/blog-card";
import { BlogSectionHeader } from "./shared/blog-section-header";
import { BlogSkeleton } from "./shared/blog-skeleton";
import { BlogFilterTabs } from "./shared/blog-filter-tabs";
import { BlogPagination } from "./shared/blog-pagination";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ── Deep merge settings with defaults ────────────────────────────────

function mergeSettings(
  settings: BlogPostGridWidgetSettings
): BlogPostGridWidgetSettings {
  const d = DEFAULT_BLOG_POST_GRID_SETTINGS;
  return {
    ...d,
    ...settings,
    header: { ...d.header, ...settings?.header },
    dataSource: { ...d.dataSource, ...settings?.dataSource },
    layout: {
      ...d.layout,
      ...settings?.layout,
      columns: {
        ...d.layout.columns,
        ...settings?.layout?.columns,
      },
    },
    card: {
      ...d.card,
      ...settings?.card,
      image: { ...d.card.image, ...settings?.card?.image },
      categoryBadge: {
        ...d.card.categoryBadge,
        ...settings?.card?.categoryBadge,
      },
      title: { ...d.card.title, ...settings?.card?.title },
      excerpt: { ...d.card.excerpt, ...settings?.card?.excerpt },
      meta: { ...d.card.meta, ...settings?.card?.meta },
      readMore: { ...d.card.readMore, ...settings?.card?.readMore },
    },
    filterTabs: { ...d.filterTabs, ...settings?.filterTabs },
    pagination: { ...d.pagination, ...settings?.pagination },
    emptyState: { ...d.emptyState, ...settings?.emptyState },
    animation: {
      ...d.animation,
      ...settings?.animation,
      entrance: { ...d.animation.entrance, ...settings?.animation?.entrance },
    },
  };
}

// ── Props ────────────────────────────────────────────────────────────

interface BlogPostGridWidgetProps {
  settings: BlogPostGridWidgetSettings;
  isPreview?: boolean;
}

// ── Widget Component ─────────────────────────────────────────────────

export function BlogPostGridWidget({
  settings: rawSettings,
}: BlogPostGridWidgetProps) {
  const s = useMemo(() => mergeSettings(rawSettings), [rawSettings]);
  const gridId = useId().replace(/:/g, "");

  // Filter tabs state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Sort state
  const [sortValue, setSortValue] = useState<string>(
    s.sort?.options?.[0]?.value || "date-desc"
  );

  // Subscribe to featured-post exclusion store (sibling widget on same page)
  useSyncExternalStore(
    subscribeFeaturedExcluded,
    getFeaturedExcludedSnapshot,
    () => "" // SSR: nothing excluded server-side
  );
  const excludeIds = getFeaturedExcludedArray();

  // Read text search query from URL (?q=...) — wired by hero-content search bar
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("q") || null;

  // Read blog post context (for "related" mode)
  const currentPost = useBlogPostContext();

  // Apply sort + related mode to dataSource
  const sortedDataSource = useMemo(() => {
    let ds = s.dataSource;

    // Related mode: filter by current post's primary category
    if ((s.dataSource as { mode?: string }).mode === "related" && currentPost) {
      const cat = currentPost.categories?.[0];
      ds = {
        ...ds,
        source: cat ? "category" : "all",
        categories: cat ? [cat.slug] : [],
      };
    }

    if (!s.sort?.enabled) return ds;
    const [orderBy, dir] = sortValue.split("-");
    return {
      ...ds,
      orderBy: orderBy as "date" | "title" | "modified",
      orderDirection: (dir || "desc") as "asc" | "desc",
    };
  }, [s.dataSource, s.sort?.enabled, sortValue, currentPost]);

  // For related mode, also exclude the current post
  const combinedExcludeIds = useMemo(() => {
    if ((s.dataSource as { mode?: string }).mode === "related" && currentPost) {
      return [...excludeIds, currentPost.id];
    }
    return excludeIds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeIds, currentPost?.id, (s.dataSource as { mode?: string }).mode]);

  // Fetch blog data
  const { posts, total, hasMore, loading, error, loadMore } = useBlogData({
    dataSource: sortedDataSource,
    activeCategory,
    excludeIds: combinedExcludeIds,
    searchQuery,
  });

  // Extract unique categories from loaded posts for filter tabs
  const uniqueCategories = useMemo(() => {
    const catMap = new Map<string, { id: string; slug: string; name: string }>();
    for (const post of posts) {
      for (const cat of post.categories || []) {
        if (!catMap.has(cat.slug)) {
          catMap.set(cat.slug, { id: cat.id, slug: cat.slug, name: cat.name });
        }
      }
    }
    return Array.from(catMap.values());
  }, [posts]);

  // Determine which categories to show in filter tabs
  const filterCategories =
    s.filterTabs.categories && s.filterTabs.categories.length > 0
      ? uniqueCategories.filter((c) =>
          s.filterTabs.categories.includes(c.slug)
        )
      : uniqueCategories;

  // Responsive column values
  const cols = s.layout.columns;
  const gridClass = `blog-grid-${gridId}`;

  return (
    <WidgetContainer container={s.container}>
    <div>
      {/* Responsive grid styles */}
      <style>{`
        .${gridClass} {
          grid-template-columns: repeat(${cols.mobile}, minmax(0, 1fr));
        }
        @media (min-width: 768px) {
          .${gridClass} {
            grid-template-columns: repeat(${cols.tablet}, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .${gridClass} {
            grid-template-columns: repeat(${cols.desktop}, minmax(0, 1fr));
          }
        }
      `}</style>

      {/* Filter Tabs (above heading row, mockup order) */}
      {s.filterTabs.show && filterCategories.length > 0 && (
        <BlogFilterTabs
          categories={filterCategories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          style={s.filterTabs.style}
          showAll={s.filterTabs.showAll}
          allText={s.filterTabs.allText}
          activeBg={s.filterTabs.activeBg}
          activeColor={s.filterTabs.activeColor}
          activeBorder={s.filterTabs.activeBorder}
          inactiveBg={s.filterTabs.inactiveBg}
          inactiveColor={s.filterTabs.inactiveColor}
          inactiveBorder={s.filterTabs.inactiveBorder}
          hoverBorder={s.filterTabs.hoverBorder}
        />
      )}

      {/* Section Header — heading left + sort dropdown right */}
      <div
        className="flex flex-wrap items-end justify-between gap-4 mb-10"
        data-field-id="header"
      >
        <div className="flex-1 min-w-0">
          <BlogSectionHeader settings={s.header} />
        </div>

        {s.sort?.enabled && (s.sort.options?.length ?? 0) > 0 && (
          <div className="flex items-center gap-2.5 text-sm text-slate-500">
            <span>{s.sort.label || "Sort by:"}</span>
            <select
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 cursor-pointer font-display focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              {s.sort.options!.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && posts.length === 0 && (
        <BlogSkeleton count={s.dataSource.postCount} layout="grid" />
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            {s.emptyState.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {s.emptyState.description}
          </p>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 && (
        <div
          data-field-id="posts"
          className={cn(
            "grid",
            gridClass,
            s.layout.equalHeight && "[&>a]:h-full"
          )}
          style={{ gap: `${s.layout.gap}px` }}
        >
          {posts.map((post, index) => (
            <div
              key={post.id}
              style={
                s.animation.entrance.enabled && s.animation.entrance.stagger
                  ? {
                      animationDelay: `${index * s.animation.entrance.staggerDelay}ms`,
                    }
                  : undefined
              }
            >
              <BlogCard post={post} cardSettings={s.card} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <BlogPagination
        type={s.pagination.type}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        loadMoreText={s.pagination.loadMoreText}
        total={total}
        current={posts.length}
      />
    </div>
    </WidgetContainer>
  );
}
