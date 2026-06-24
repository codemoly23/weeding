"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Heart, Loader2, Search } from "lucide-react";

interface SearchResult {
  slug: string;
  theme: string;
  brideName: string | null;
  groomName: string | null;
  title: string;
  eventDate: string | null;
}

function coupleName(r: SearchResult): string {
  if (r.brideName && r.groomName) return `${r.brideName} & ${r.groomName}`;
  if (r.brideName) return r.brideName;
  if (r.groomName) return r.groomName;
  return r.title;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

const THEME_COLORS: Record<string, string> = {
  modern: "#7c3aed",
  floral: "#be185d",
  rustic: "#92400e",
  minimal: "#1f2937",
};

export default function WeddingWebsiteSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/wedding-website/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/wedding-website"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Wedding Website
          </Link>
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-3">Find a couple&apos;s website</h1>
            <p className="text-muted-foreground mb-8">
              Search by couple name to find their wedding website.
            </p>

            {/* Search form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Emma & James"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || query.trim().length < 2}
                className="px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            </div>
          )}

          {/* No results */}
          {!loading && searched && results.length === 0 && (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
              <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground">No websites found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching by bride or groom name.
              </p>
            </div>
          )}

          {/* Results list */}
          {!loading && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {results.length} website{results.length !== 1 ? "s" : ""} found
              </p>
              {results.map((r) => {
                const color = THEME_COLORS[r.theme] ?? "#7c3aed";
                return (
                  <Link
                    key={r.slug}
                    href={`/wedding/${r.slug}`}
                    target="_blank"
                    className="flex items-center justify-between bg-card rounded-2xl border border-border px-6 py-5 hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: color + "20" }}
                      >
                        <Heart className="w-4 h-4" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{coupleName(r)}</p>
                        {r.eventDate && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(r.eventDate)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          ceremoney.com/wedding/{r.slug}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Empty state (before search) */}
          {!loading && !searched && (
            <div className="text-center py-16 text-muted-foreground/50">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Enter a name to search for a wedding website.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
