/**
 * Tiny module-level store for sharing "currently featured post ID" between
 * blog-featured-post and blog-post-grid widgets that live on the same page.
 *
 * When a featured-post widget loads its post AND has dataSource.excludeFromGrid=true,
 * it registers the post ID here. blog-post-grid widgets subscribe via
 * useSyncExternalStore and refetch their data with that ID excluded.
 */

const excludedIds = new Set<string>();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function addFeaturedExcluded(id: string): () => void {
  if (!id) return () => {};
  excludedIds.add(id);
  emit();
  return () => {
    excludedIds.delete(id);
    emit();
  };
}

export function getFeaturedExcludedIds(): string[] {
  return Array.from(excludedIds);
}

// Stable cached snapshot (useSyncExternalStore requires reference stability when nothing changed)
let cachedSnapshot: string = "";
let cachedArray: string[] = [];

export function getFeaturedExcludedSnapshot(): string {
  const next = Array.from(excludedIds).sort().join(",");
  if (next !== cachedSnapshot) {
    cachedSnapshot = next;
    cachedArray = next ? next.split(",") : [];
  }
  return cachedSnapshot;
}

export function getFeaturedExcludedArray(): string[] {
  // Ensure cache is fresh
  getFeaturedExcludedSnapshot();
  return cachedArray;
}

export function subscribeFeaturedExcluded(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
