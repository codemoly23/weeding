"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, X, Command, Star, ArrowRight, FileText, HelpCircle, Scale, Newspaper, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ServiceCategory, NavigationItem } from "../types";

// Search result from API
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

interface QuickAction {
  label: string;
  href: string;
  category?: string;
  popular?: boolean;
}

interface SearchButtonProps {
  enabled: boolean;
  serviceCategories?: ServiceCategory[];
  navigation?: NavigationItem[];
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Get icon for result type
function getResultIcon(type: SearchResult["type"]) {
  switch (type) {
    case "service":
      return <Star className="h-4 w-4 text-primary" />;
    case "blog":
      return <Newspaper className="h-4 w-4 text-blue-500" />;
    case "faq":
      return <HelpCircle className="h-4 w-4 text-green-500" />;
    case "legal":
      return <Scale className="h-4 w-4 text-purple-500" />;
    case "page":
      return <FileText className="h-4 w-4 text-gray-500" />;
    default:
      return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
  }
}

// Get label for result type
function getTypeLabel(type: SearchResult["type"]) {
  switch (type) {
    case "service":
      return "Service";
    case "blog":
      return "Blog";
    case "faq":
      return "FAQ";
    case "legal":
      return "Legal";
    case "page":
      return "Page";
    default:
      return "";
  }
}

export function SearchButton({ enabled, serviceCategories = [], navigation = [] }: SearchButtonProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query (300ms)
  const debouncedQuery = useDebounce(query, 300);

  // Build dynamic quick actions from menu data
  const quickActions = useMemo((): QuickAction[] => {
    const actions: QuickAction[] = [];

    // First, add popular services from serviceCategories
    serviceCategories.forEach((category) => {
      category.services.forEach((service) => {
        if (service.popular) {
          actions.push({
            label: service.name,
            href: service.href,
            category: category.name,
            popular: true,
          });
        }
      });
    });

    // If we have popular items, limit to 6
    if (actions.length > 0) {
      return actions.slice(0, 6);
    }

    // Fallback: Get first few services if no popular ones
    serviceCategories.forEach((category) => {
      category.services.slice(0, 2).forEach((service) => {
        if (actions.length < 6) {
          actions.push({
            label: service.name,
            href: service.href,
            category: category.name,
          });
        }
      });
    });

    // If still no actions, use navigation items
    if (actions.length === 0) {
      navigation
        .filter((item) => item.href !== "/" && !item.hasDropdown)
        .slice(0, 4)
        .forEach((item) => {
          actions.push({
            label: item.name,
            href: item.href,
          });
        });
    }

    return actions;
  }, [serviceCategories, navigation]);

  // Keyboard shortcut: ⌘K (Mac) or Ctrl+K (Windows/Linux)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  // Handle keyboard navigation in results
  useEffect(() => {
    if (!open) return;

    const totalItems = query ? searchResults.length : quickActions.length;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(totalItems, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1));
      } else if (e.key === "Enter" && totalItems > 0) {
        e.preventDefault();
        if (query && searchResults[selectedIndex]) {
          router.push(searchResults[selectedIndex].url);
          handleClose();
        } else if (!query && quickActions[selectedIndex]) {
          router.push(quickActions[selectedIndex].href);
          handleClose();
        }
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, query, searchResults, selectedIndex, quickActions, router]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults, query]);

  // Fetch search results from API
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=12`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || []);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSearchResults([]);
    setSelectedIndex(0);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  }, [query, router, handleClose]);

  // Group search results by type (must be before early return to follow hooks rules)
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    searchResults.forEach((result) => {
      const key = result.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(result);
    });
    return groups;
  }, [searchResults]);

  if (!enabled) return null;

  return (
    <>
      {/* Search Button with Keyboard Hint - Desktop */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "h-9 gap-2 px-3 text-muted-foreground hover:text-foreground",
          "border-input bg-background hover:bg-accent",
          "hidden sm:flex items-center"
        )}
        aria-label="Search (⌘K)"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm hidden md:inline">Search...</span>
        <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>

      {/* Mobile: Icon only */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-9 w-9 sm:hidden text-muted-foreground hover:text-foreground"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Command Palette Dialog */}
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
          {/* Search Input */}
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search services, blog posts, FAQs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex h-12 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              )}
              {query && !isSearching && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>

          {/* Results Area */}
          <div className="max-h-[400px] overflow-y-auto">
            {/* Show search results when typing */}
            {query && searchResults.length > 0 && (
              <div className="p-2">
                {Object.entries(groupedResults).map(([type, results]) => (
                  <div key={type} className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {getTypeLabel(type as SearchResult["type"])}s
                    </div>
                    {results.map((result) => {
                      const globalIndex = searchResults.findIndex((r) => r.id === result.id);
                      return (
                        <button
                          key={result.id}
                          onClick={() => {
                            router.push(result.url);
                            handleClose();
                          }}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                            globalIndex === selectedIndex
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <span className="mt-0.5 shrink-0">
                            {result.popular ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ) : (
                              getResultIcon(result.type)
                            )}
                          </span>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium truncate">{result.title}</div>
                            {result.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {result.description}
                              </div>
                            )}
                          </div>
                          {result.category && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {result.category}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Show "no results" when searching but nothing found */}
            {query && !isSearching && searchResults.length === 0 && debouncedQuery.length >= 2 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No results found for &quot;{query}&quot;
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try different keywords or{" "}
                  <button
                    onClick={handleSubmit}
                    className="text-primary hover:underline"
                  >
                    search all pages
                  </button>
                </p>
              </div>
            )}

            {/* Show typing hint for short queries */}
            {query && query.length < 2 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search...
              </div>
            )}

            {/* Quick Actions - show when not searching */}
            {!query && quickActions.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Popular Services
                </div>
                {quickActions.map((action, idx) => (
                  <button
                    key={action.href}
                    onClick={() => {
                      router.push(action.href);
                      handleClose();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors group",
                      idx === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {action.popular ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{action.label}</span>
                    </div>
                    {action.category && (
                      <span className="text-xs text-muted-foreground">
                        {action.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Fallback when no data */}
            {!query && quickActions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Type to search across all content...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono">↑↓</kbd>
                <span>navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono">↵</kbd>
                <span>select</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono">esc</kbd>
              <span>close</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
