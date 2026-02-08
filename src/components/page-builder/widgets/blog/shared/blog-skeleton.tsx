"use client";

import { cn } from "@/lib/utils";

interface BlogSkeletonProps {
  count: number;
  layout: "grid" | "list" | "carousel";
}

// ── Skeleton pulse bar ──────────────────────────────────────────────

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-slate-200 dark:bg-slate-700",
        className
      )}
    />
  );
}

// ── Grid / Carousel card skeleton ───────────────────────────────────

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Image placeholder */}
      <SkeletonPulse className="aspect-video w-full rounded-none" />

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Category badge */}
        <SkeletonPulse className="h-5 w-20" />

        {/* Title - two lines */}
        <div className="flex flex-col gap-1.5">
          <SkeletonPulse className="h-5 w-full" />
          <SkeletonPulse className="h-5 w-3/4" />
        </div>

        {/* Excerpt - two lines */}
        <div className="flex flex-col gap-1.5">
          <SkeletonPulse className="h-3.5 w-full" />
          <SkeletonPulse className="h-3.5 w-5/6" />
        </div>

        {/* Meta bar */}
        <div className="flex items-center gap-3 pt-1">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// ── List item skeleton (horizontal with image on side) ──────────────

function ListItemSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      {/* Image placeholder on side */}
      <SkeletonPulse className="h-24 w-32 shrink-0 rounded-lg sm:h-28 sm:w-40" />

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center gap-2.5">
        {/* Category badge */}
        <SkeletonPulse className="h-4 w-16" />

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <SkeletonPulse className="h-5 w-full" />
          <SkeletonPulse className="h-5 w-2/3" />
        </div>

        {/* Excerpt (visible on larger screens) */}
        <SkeletonPulse className="hidden h-3.5 w-5/6 sm:block" />

        {/* Meta bar */}
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function BlogSkeleton({ count, layout }: BlogSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  // List layout: vertical stack
  if (layout === "list") {
    return (
      <div className="flex flex-col gap-4">
        {items.map((i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Carousel layout: horizontal row, same card shape as grid
  if (layout === "carousel") {
    return (
      <div className="flex gap-6 overflow-hidden">
        {items.map((i) => (
          <div key={i} className="w-full min-w-0 shrink-0 sm:w-1/2 lg:w-1/3">
            <CardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Grid layout (default): responsive grid
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
