"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Search, ChevronDown, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface State {
  code: string;
  name: string;
  fee: number;
}

interface StateSelectorProps {
  value?: State | null;
  onChange: (state: State) => void;
  placeholder?: string;
  className?: string;
}

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 300;

export function StateSelector({
  value,
  onChange,
  placeholder = "Search states...",
  className,
}: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset when search changes
  useEffect(() => {
    setStates([]);
    setCursor(0);
    setHasMore(true);
  }, [debouncedSearch]);

  // Fetch states from API
  const fetchStates = useCallback(
    async (searchQuery: string, cursorValue: number, append = false) => {
      // Prevent concurrent fetches
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          search: searchQuery,
          cursor: cursorValue.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        const res = await fetch(`/api/states?${params}`);
        const data = await res.json();

        setStates((prev) => {
          if (append) {
            // Deduplicate by code
            const existingCodes = new Set(prev.map((s) => s.code));
            const newStates = data.states.filter(
              (s: State) => !existingCodes.has(s.code)
            );
            return [...prev, ...newStates];
          }
          return data.states;
        });
        setHasMore(data.hasMore);
        setCursor(data.nextCursor ?? cursorValue + ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Failed to fetch states:", error);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    },
    []
  );

  // Initial fetch and search fetch
  useEffect(() => {
    if (isOpen) {
      fetchStates(debouncedSearch, 0, false);
    }
  }, [isOpen, debouncedSearch, fetchStates]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchStates(debouncedSearch, cursor, true);
        }
      },
      { threshold: 0.1, root: listRef.current }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, cursor, debouncedSearch, fetchStates, isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (state: State) => {
    onChange(state);
    setIsOpen(false);
    setSearch("");
  };

  // Popular states for quick selection
  const popularStates = useMemo(
    () => ["WY", "DE", "NM", "FL", "TX"],
    []
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        {value ? (
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{value.name}</span>
            <span className="text-muted-foreground">
              (${value.fee} state fee)
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-100"
          )}
        >
          {/* Search Input */}
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className={cn(
                  "w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              />
            </div>
          </div>

          {/* Popular States (only when no search) */}
          {!search && states.length > 0 && (
            <div className="border-b px-2 py-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Popular States
              </p>
              <div className="flex flex-wrap gap-1">
                {states
                  .filter((s) => popularStates.includes(s.code))
                  .map((state) => (
                    <button
                      key={`popular-${state.code}`}
                      type="button"
                      onClick={() => handleSelect(state)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        "hover:bg-primary hover:text-primary-foreground",
                        value?.code === state.code &&
                          "bg-primary text-primary-foreground"
                      )}
                    >
                      {state.code}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* State List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto overscroll-contain"
          >
            {states.length === 0 && !isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No states found
              </div>
            )}

            {states.map((state) => (
              <button
                key={`list-${state.code}`}
                type="button"
                onClick={() => handleSelect(state)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors",
                  "hover:bg-accent",
                  value?.code === state.code && "bg-accent"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-8 items-center justify-center rounded text-xs font-semibold",
                      value?.code === state.code
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {state.code}
                  </span>
                  <span className="font-medium">{state.name}</span>
                </span>
                <span className="text-muted-foreground">${state.fee}</span>
              </button>
            ))}

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="h-1" />

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            )}
          </div>

          {/* Footer Info */}
          {states.length > 0 && (
            <div className="border-t px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {hasMore ? "Scroll for more states" : `${states.length} states`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
