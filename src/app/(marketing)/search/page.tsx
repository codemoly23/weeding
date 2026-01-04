"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, Newspaper, HelpCircle, Scale, FileText, ArrowRight, Loader2, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Search result types
interface SearchResult {
  type: "service" | "blog" | "faq" | "page" | "legal";
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
  image?: string;
  popular?: boolean;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
}

// Type filter options
const typeFilters = [
  { value: "all", label: "All", icon: null },
  { value: "service", label: "Services", icon: Star },
  { value: "blog", label: "Blog", icon: Newspaper },
  { value: "faq", label: "FAQs", icon: HelpCircle },
  { value: "legal", label: "Legal", icon: Scale },
  { value: "page", label: "Pages", icon: FileText },
];

// Get icon for result type
function getResultIcon(type: SearchResult["type"]) {
  switch (type) {
    case "service":
      return <Star className="h-5 w-5 text-primary" />;
    case "blog":
      return <Newspaper className="h-5 w-5 text-blue-500" />;
    case "faq":
      return <HelpCircle className="h-5 w-5 text-green-500" />;
    case "legal":
      return <Scale className="h-5 w-5 text-purple-500" />;
    case "page":
      return <FileText className="h-5 w-5 text-gray-500" />;
    default:
      return <ArrowRight className="h-5 w-5 text-muted-foreground" />;
  }
}

// Get badge color for result type
function getTypeBadgeVariant(type: SearchResult["type"]): "default" | "secondary" | "outline" {
  switch (type) {
    case "service":
      return "default";
    case "blog":
      return "secondary";
    default:
      return "outline";
  }
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!initialQuery || initialQuery.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(initialQuery)}&limit=50`);
        if (response.ok) {
          const data: SearchResponse = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [initialQuery]);

  // Update query when URL changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Filter results by type
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") return results;
    return results.filter((r) => r.type === activeFilter);
  }, [results, activeFilter]);

  // Group results by type for display
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    filteredResults.forEach((result) => {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
    });
    return groups;
  }, [filteredResults]);

  // Count results by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: results.length };
    results.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, [results]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Search Results</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services, blog posts, FAQs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-11"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="h-11 px-6">
              Search
            </Button>
          </form>

          {/* Results count */}
          {hasSearched && !isLoading && (
            <p className="text-sm text-muted-foreground mt-4">
              {results.length > 0 ? (
                <>Found <strong>{results.length}</strong> results for &quot;{initialQuery}&quot;</>
              ) : (
                <>No results found for &quot;{initialQuery}&quot;</>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Searching...</span>
          </div>
        )}

        {/* No Query State */}
        {!isLoading && !hasSearched && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Start Searching</h2>
            <p className="text-muted-foreground">
              Enter at least 2 characters to search across all content.
            </p>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find anything matching &quot;{initialQuery}&quot;.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Suggestions:</p>
              <ul className="list-disc list-inside">
                <li>Check your spelling</li>
                <li>Try more general keywords</li>
                <li>Try different keywords</li>
              </ul>
            </div>
            <div className="mt-8">
              <Link href="/services">
                <Button variant="outline">Browse All Services</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">Filter by Type</span>
                </div>
                <div className="space-y-1">
                  {typeFilters.map((filter) => {
                    const count = typeCounts[filter.value] || 0;
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.value}
                        onClick={() => setActiveFilter(filter.value)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm transition-colors",
                          activeFilter === filter.value
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4" />}
                          {filter.label}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          activeFilter === filter.value
                            ? "bg-primary-foreground/20"
                            : "bg-muted-foreground/20"
                        )}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Results List */}
            <div className="flex-1 min-w-0">
              {Object.entries(groupedResults).map(([type, typeResults]) => (
                <div key={type} className="mb-8">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {getResultIcon(type as SearchResult["type"])}
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                    <Badge variant="secondary" className="ml-2">{typeResults.length}</Badge>
                  </h2>

                  <div className="space-y-4">
                    {typeResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.url}
                        className="block p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex gap-4">
                          {/* Image for services/blog */}
                          {result.image && (
                            <div className="shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
                              <Image
                                src={result.image}
                                alt={result.title}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-medium group-hover:text-primary transition-colors">
                                {result.popular && (
                                  <Star className="inline h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                                )}
                                {result.title}
                              </h3>
                              <Badge variant={getTypeBadgeVariant(result.type)} className="shrink-0">
                                {result.type}
                              </Badge>
                            </div>

                            {result.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {result.description}
                              </p>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                              {result.category && (
                                <span className="text-xs text-muted-foreground">
                                  {result.category}
                                </span>
                              )}
                              <span className="text-xs text-primary group-hover:underline">
                                View details →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
