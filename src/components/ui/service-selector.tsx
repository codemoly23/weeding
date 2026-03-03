"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Loader2, Package, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDesc?: string;
  icon?: string;
  isPopular?: boolean;
}

interface ServiceSelectorProps {
  value?: string | null; // slug
  onChange: (service: Service | null) => void;
  placeholder?: string;
  className?: string;
}

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 300;

export function ServiceSelector({
  value,
  onChange,
  placeholder = "Select a service...",
  className,
}: ServiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const selectedServiceRef = useRef(selectedService);
  selectedServiceRef.current = selectedService;
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset when search changes
  useEffect(() => {
    setServices([]);
    setCursor(0);
    setHasMore(true);
    setHasInitialLoad(false);
  }, [debouncedSearch]);

  // Fetch services from API
  const fetchServices = useCallback(
    async (searchQuery: string, cursorValue: number, append = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          search: searchQuery,
          cursor: cursorValue.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        const res = await fetch(`/api/services/search?${params}`);
        const data = await res.json();

        setServices((prev) => {
          if (append) {
            const existingIds = new Set(prev.map((s) => s.id));
            const newServices = data.services.filter(
              (s: Service) => !existingIds.has(s.id)
            );
            return [...prev, ...newServices];
          }
          return data.services;
        });
        setHasMore(data.hasMore);
        setCursor(data.nextCursor ?? cursorValue + ITEMS_PER_PAGE);
        setHasInitialLoad(true);

        // If we have a value but no selectedService, find it
        if (value && !selectedServiceRef.current) {
          const found = data.services.find((s: Service) => s.slug === value);
          if (found) {
            setSelectedService(found);
          }
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    },
    [value]
  );

  // Initial fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchServices(debouncedSearch, 0, false);
    }
  }, [isOpen, debouncedSearch, fetchServices]);

  // Load selected service on mount if value is provided
  useEffect(() => {
    if (value && !selectedServiceRef.current) {
      fetchServices("", 0, false);
    }
  }, [value, fetchServices]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchServices(debouncedSearch, cursor, true);
        }
      },
      { threshold: 0.1, root: listRef.current }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, cursor, debouncedSearch, fetchServices, isOpen]);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
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

  const handleSelect = (service: Service) => {
    setSelectedService(service);
    onChange(service);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    setSelectedService(null);
    onChange(null);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
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
        {selectedService ? (
          <span className="flex items-center gap-2 truncate">
            <Package className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-medium truncate">{selectedService.name}</span>
            {selectedService.isPopular && (
              <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown - rendered via portal to avoid overflow clipping */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={cn(
            "rounded-md border bg-popover shadow-lg",
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
                placeholder="Search services..."
                className={cn(
                  "w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              />
            </div>
          </div>


          {/* Service List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto overscroll-contain"
          >
            {services.length === 0 && !isLoading && hasInitialLoad && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No services found
              </div>
            )}

            {/* Show loading on initial open before first fetch completes */}
            {services.length === 0 && !isLoading && !hasInitialLoad && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading services...</span>
              </div>
            )}

            {/* Clear option if something is selected */}
            {selectedService && (
              <button
                type="button"
                onClick={handleClear}
                className="flex w-full items-center gap-2 border-b px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
              >
                <span className="text-xs">✕</span>
                <span>Clear selection</span>
              </button>
            )}

            {services.map((service) => (
              <button
                key={`list-${service.id}`}
                type="button"
                onClick={() => handleSelect(service)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors",
                  "hover:bg-accent",
                  value === service.slug && "bg-accent"
                )}
              >
                <span className="flex items-center gap-2">
                  <Package
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === service.slug
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="font-medium truncate">{service.name}</span>
                </span>
                {service.isPopular && (
                  <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                )}
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
          {services.length > 0 && (
            <div className="border-t px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {hasMore ? "Scroll for more services" : `${services.length} services`}
              </p>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
