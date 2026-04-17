"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { BlogPostData, BlogDataSource } from "@/lib/page-builder/types";

interface UseBlogDataOptions {
  dataSource: BlogDataSource;
  activeCategory?: string | null; // for filter tabs
  excludeIds?: string[]; // post IDs to exclude (e.g., featured post on same page)
  searchQuery?: string | null; // text search query (e.g., from hero search bar)
}

interface UseBlogDataResult {
  posts: BlogPostData[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  loadMore: () => void;
}

/**
 * Hook for fetching blog data from /api/blog.
 * Builds URLSearchParams from BlogDataSource settings.
 * Supports pagination (loadMore appends to existing posts).
 * When activeCategory changes, resets and refetches.
 *
 * Uses a serialized fetchKey as the sole useEffect dependency.
 * This ensures stable dependency comparison (string value equality)
 * even when the parent passes new dataSource object references.
 */
export function useBlogData({
  dataSource,
  activeCategory,
  excludeIds,
  searchQuery,
}: UseBlogDataOptions): UseBlogDataResult {
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const isLoadingMore = useRef(false);

  // Keep a ref to always have latest dataSource for buildParams
  const dataSourceRef = useRef(dataSource);
  dataSourceRef.current = dataSource;

  // Keep a ref to latest activeCategory for buildParams
  const activeCategoryRef = useRef(activeCategory);
  activeCategoryRef.current = activeCategory;

  const excludeIdsRef = useRef(excludeIds);
  excludeIdsRef.current = excludeIds;

  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // Serialize dataSource + activeCategory into a single stable string key.
  // useEffect only re-fires when this key actually changes (string value equality).
  const fetchKey = JSON.stringify([
    dataSource.postCount,
    dataSource.orderBy,
    dataSource.orderDirection,
    dataSource.source,
    dataSource.categories ?? null,
    dataSource.tags ?? null,
    activeCategory ?? null,
    excludeIds && excludeIds.length > 0 ? [...excludeIds].sort() : null,
    searchQuery ?? null,
  ]);

  // Helper: build URLSearchParams (reads from refs, no dependency issues)
  function buildParams(currentOffset: number): URLSearchParams {
    const ds = dataSourceRef.current;
    const ac = activeCategoryRef.current;
    const params = new URLSearchParams();

    params.set("limit", String(ds.postCount));
    params.set("offset", String(currentOffset));
    params.set("orderBy", ds.orderBy);
    params.set("orderDir", ds.orderDirection);

    // Category filtering: activeCategory takes priority (from filter tabs),
    // otherwise use dataSource categories
    if (ac) {
      params.set("category", ac);
    } else if (
      ds.source === "category" &&
      ds.categories &&
      ds.categories.length > 0
    ) {
      params.set("category", ds.categories[0]);
    }

    // Tag filtering
    if (ds.source === "tag" && ds.tags && ds.tags.length > 0) {
      params.set("tag", ds.tags[0]);
    }

    // Exclude post IDs (e.g., featured post on same page).
    // /api/blog supports a single `exclude` param — pass first ID for now.
    const excl = excludeIdsRef.current;
    if (excl && excl.length > 0) {
      params.set("exclude", excl[0]);
    }

    // Text search query (from hero search bar)
    const sq = searchQueryRef.current;
    if (sq && sq.trim()) {
      params.set("search", sq.trim());
    }

    return params;
  }

  // Initial fetch and refetch when data source configuration actually changes
  useEffect(() => {
    let cancelled = false;

    async function doFetch() {
      setLoading(true);
      setError(null);
      setOffset(0);

      try {
        const params = buildParams(0);
        const response = await fetch(`/api/blog?${params.toString()}`);

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(`Failed to fetch blog posts (${response.status})`);
        }

        const data = await response.json();
        if (cancelled) return;

        setPosts(data.posts || []);
        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to fetch blog posts";
        setError(message);
        setPosts([]);
        setTotal(0);
        setHasMore(false);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    doFetch();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  // Load more handler for pagination
  const loadMore = useCallback(() => {
    if (loading || !hasMore || isLoadingMore.current) return;

    isLoadingMore.current = true;
    const ds = dataSourceRef.current;
    const newOffset = offset + ds.postCount;
    setOffset(newOffset);

    const params = buildParams(newOffset);

    setLoading(true);
    fetch(`/api/blog?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
      })
      .catch(() => {
        // Keep existing posts on loadMore failure
      })
      .finally(() => {
        setLoading(false);
        isLoadingMore.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore, offset]);

  return {
    posts,
    total,
    hasMore,
    loading,
    error,
    loadMore,
  };
}
