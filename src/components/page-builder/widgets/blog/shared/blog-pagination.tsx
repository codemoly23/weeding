"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface BlogPaginationProps {
  type: "none" | "load-more" | "numbered";
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  loadMoreText: string;
  total?: number;
  current?: number;
}

export function BlogPagination({
  type,
  hasMore,
  loading,
  onLoadMore,
  loadMoreText,
  total,
  current,
}: BlogPaginationProps) {
  if (type === "none") return null;

  // Load more button
  if (type === "load-more") {
    if (!hasMore) return null;

    return (
      <div className="mt-8 flex justify-center">
        <button
          onClick={onLoadMore}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all",
            "hover:bg-slate-50 hover:shadow-md",
            "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Loading..." : loadMoreText || "Load more"}
        </button>
      </div>
    );
  }

  // Numbered pagination: "Showing X of Y" with next button
  if (type === "numbered") {
    const showingCount = current ?? 0;
    const totalCount = total ?? 0;

    return (
      <div className="mt-8 flex items-center justify-center gap-4">
        {totalCount > 0 && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing {showingCount} of {totalCount}
          </span>
        )}

        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all",
              "hover:bg-slate-50 hover:shadow-md",
              "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Next
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return null;
}
