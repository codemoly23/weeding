"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { BlogPostData, BlogDataSource } from "@/lib/page-builder/types";

interface UseBlogDataOptions {
  dataSource: BlogDataSource;
  activeCategory?: string | null; // for filter tabs
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
 */
export function useBlogData({
  dataSource,
  activeCategory,
}: UseBlogDataOptions): UseBlogDataResult {
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  // Track whether we're loading more (appending) vs initial fetch
  const isLoadingMore = useRef(false);

  // Build URLSearchParams from dataSource and current state
  const buildParams = useCallback(
    (currentOffset: number): URLSearchParams => {
      const params = new URLSearchParams();

      params.set("limit", String(dataSource.postCount));
      params.set("offset", String(currentOffset));
      params.set("orderBy", dataSource.orderBy);
      params.set("orderDir", dataSource.orderDirection);

      // Category filtering: activeCategory takes priority (from filter tabs),
      // otherwise use dataSource categories
      if (activeCategory) {
        params.set("category", activeCategory);
      } else if (
        dataSource.source === "category" &&
        dataSource.categories &&
        dataSource.categories.length > 0
      ) {
        // API only supports single category, use the first one
        params.set("category", dataSource.categories[0]);
      }

      // Tag filtering
      if (
        dataSource.source === "tag" &&
        dataSource.tags &&
        dataSource.tags.length > 0
      ) {
        params.set("tag", dataSource.tags[0]);
      }

      // Exclude current post
      if (dataSource.excludeCurrentPost) {
        // The current post ID would need to come from context;
        // for now we pass exclude if postIds has entries to exclude
      }

      return params;
    },
    [dataSource, activeCategory]
  );

  // Fetch posts
  const fetchPosts = useCallback(
    async (currentOffset: number, append: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const params = buildParams(currentOffset);
        const response = await fetch(`/api/blog?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch blog posts (${response.status})`);
        }

        const data = await response.json();

        if (append) {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        } else {
          setPosts(data.posts || []);
        }

        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch blog posts";
        setError(message);
        if (!append) {
          setPosts([]);
          setTotal(0);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        isLoadingMore.current = false;
      }
    },
    [buildParams]
  );

  // Initial fetch and refetch when dataSource or activeCategory changes
  useEffect(() => {
    setOffset(0);
    fetchPosts(0, false);
  }, [fetchPosts]);

  // Load more handler for pagination
  const loadMore = useCallback(() => {
    if (loading || !hasMore || isLoadingMore.current) return;

    isLoadingMore.current = true;
    const newOffset = offset + dataSource.postCount;
    setOffset(newOffset);
    fetchPosts(newOffset, true);
  }, [loading, hasMore, offset, dataSource.postCount, fetchPosts]);

  return {
    posts,
    total,
    hasMore,
    loading,
    error,
    loadMore,
  };
}
