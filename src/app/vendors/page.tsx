"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Search, MapPin, Star, ChevronLeft, ChevronRight,
  Camera, Music, Flower2, Car, Scissors, CalendarHeart,
  Building2, Gem, UtensilsCrossed, Video, Shirt, Sparkles,
  Package, Map, List, X, Clock, SlidersHorizontal, ChevronDown, ChevronUp, BadgeCheck,
} from "lucide-react";

const VendorMap = dynamic(() => import("@/components/vendors/VendorMap"), { ssr: false });

type VendorCategory =
  | "VENUE" | "PHOTOGRAPHY" | "VIDEOGRAPHY" | "CATERING" | "MUSIC_DJ"
  | "FLOWERS" | "DRESS_ATTIRE" | "RINGS" | "DECORATIONS" | "TRANSPORTATION"
  | "HAIR_MAKEUP" | "WEDDING_PLANNER" | "OTHER";

const CATEGORY_CONFIG: Record<VendorCategory, { tKey: string; icon: React.ReactNode; color: string; bg: string }> = {
  VENUE:          { tKey: "vendors.cat.venue",        icon: <Building2 className="w-4 h-4" />,       color: "text-purple-700", bg: "bg-purple-50" },
  PHOTOGRAPHY:    { tKey: "vendors.cat.photography",  icon: <Camera className="w-4 h-4" />,           color: "text-pink-700",   bg: "bg-pink-50" },
  VIDEOGRAPHY:    { tKey: "vendors.cat.videography",  icon: <Video className="w-4 h-4" />,            color: "text-red-700",    bg: "bg-red-50" },
  CATERING:       { tKey: "vendors.cat.catering",     icon: <UtensilsCrossed className="w-4 h-4" />,  color: "text-orange-700", bg: "bg-orange-50" },
  MUSIC_DJ:       { tKey: "vendors.cat.music",        icon: <Music className="w-4 h-4" />,            color: "text-yellow-700", bg: "bg-yellow-50" },
  FLOWERS:        { tKey: "vendors.cat.flowers",      icon: <Flower2 className="w-4 h-4" />,          color: "text-green-700",  bg: "bg-green-50" },
  DRESS_ATTIRE:   { tKey: "vendors.cat.dress",        icon: <Shirt className="w-4 h-4" />,            color: "text-teal-700",   bg: "bg-teal-50" },
  RINGS:          { tKey: "vendors.cat.rings",        icon: <Gem className="w-4 h-4" />,              color: "text-cyan-700",   bg: "bg-cyan-50" },
  DECORATIONS:    { tKey: "vendors.cat.decorations",  icon: <Sparkles className="w-4 h-4" />,         color: "text-indigo-700", bg: "bg-indigo-50" },
  TRANSPORTATION: { tKey: "vendors.cat.transport",    icon: <Car className="w-4 h-4" />,              color: "text-blue-700",   bg: "bg-blue-50" },
  HAIR_MAKEUP:    { tKey: "vendors.cat.hair",         icon: <Scissors className="w-4 h-4" />,         color: "text-rose-700",   bg: "bg-rose-50" },
  WEDDING_PLANNER:{ tKey: "vendors.cat.planner",      icon: <CalendarHeart className="w-4 h-4" />,    color: "text-violet-700", bg: "bg-violet-50" },
  OTHER:          { tKey: "vendors.cat.other",        icon: <Package className="w-4 h-4" />,          color: "text-gray-700",   bg: "bg-gray-100" },
};

// Price ranges in SEK
const PRICE_RANGES = [
  { label: "Under 5 000 SEK",        min: 0,     max: 4999  },
  { label: "5 000 – 14 999 SEK",     min: 5000,  max: 14999 },
  { label: "15 000 – 29 999 SEK",    min: 15000, max: 29999 },
  { label: "30 000 – 49 999 SEK",    min: 30000, max: 49999 },
  { label: "50 000+ SEK",            min: 50000, max: null  },
];

const RATING_OPTIONS = [
  { label: "Any rating",  value: "" },
  { label: "3+ stars",    value: "3" },
  { label: "4+ stars",    value: "4" },
  { label: "4.5+ stars",  value: "4.5" },
];

export interface VendorCard {
  id: string;
  slug: string;
  businessName: string;
  category: VendorCategory;
  tagline: string | null;
  city: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  coverPhoto: string | null;
  startingPrice: number | null;
  currency: string;
  isFeatured: boolean;
  isVerified: boolean;
  slaHours: number | null;
  reviewCount: number;
  avgRating: number | null;
}

interface PriceRange { min: number; max: number | null }

function FilterSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && children}
    </div>
  );
}

export default function VendorsPage() {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<VendorCard[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | "">("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);
  const [minRating, setMinRating] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (cityFilter) params.set("city", cityFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (selectedPriceRange) {
        params.set("minPrice", String(selectedPriceRange.min));
        if (selectedPriceRange.max !== null) params.set("maxPrice", String(selectedPriceRange.max));
      }
      if (minRating) params.set("minRating", minRating);
      if (featuredOnly) params.set("featured", "true");
      params.set("page", String(page));

      const res = await fetch(`/api/vendors?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setVendors(data.vendors);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, cityFilter, categoryFilter, selectedPriceRange, minRating, featuredOnly, page]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setCityFilter(cityInput);
    setPage(1);
  }

  function handleCategoryClick(cat: VendorCategory | "") {
    setCategoryFilter(cat);
    setPage(1);
  }

  function handleCityFilterApply() {
    setCityFilter(cityInput);
    setPage(1);
  }

  function clearAllFilters() {
    setSearch(""); setSearchInput("");
    setCityFilter(""); setCityInput("");
    setCategoryFilter("");
    setSelectedPriceRange(null);
    setMinRating("");
    setFeaturedOnly(false);
    setPage(1);
  }

  function formatPrice(price: number | null, currency: string) {
    if (!price) return null;
    return `From ${currency} ${price.toLocaleString()}+`;
  }

  const activeFilterCount = [
    cityFilter, categoryFilter, selectedPriceRange, minRating, featuredOnly ? "1" : "",
  ].filter(Boolean).length;

  // Sidebar content — reused in both desktop sidebar and mobile drawer
  const FilterSidebar = (
    <div className="space-y-0">
      {/* City/Town */}
      <FilterSection title="City / Town">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search city..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCityFilterApply(); }}
            className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        {cityInput && (
          <button
            onClick={handleCityFilterApply}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            Apply
          </button>
        )}
        {cityFilter && (
          <div className="mt-2 flex items-center gap-1 text-xs text-purple-700 bg-purple-50 rounded-lg px-2 py-1">
            <MapPin className="w-3 h-3" />{cityFilter}
            <button onClick={() => { setCityFilter(""); setCityInput(""); }} className="ml-auto"><X className="w-3 h-3" /></button>
          </div>
        )}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const isSelected = selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max;
            return (
              <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    setSelectedPriceRange(isSelected ? null : { min: range.min, max: range.max });
                    setPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-400 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{range.label}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="space-y-2">
          {RATING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                value={opt.value}
                checked={minRating === opt.value}
                onChange={() => { setMinRating(opt.value); setPage(1); }}
                className="w-4 h-4 border-gray-300 text-purple-600 focus:ring-purple-400 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 flex items-center gap-1">
                {opt.value && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />}
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Featured */}
      <FilterSection title="Featured Vendors" defaultOpen={false}>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={() => { setFeaturedOnly(!featuredOnly); setPage(1); }}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-400 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">Show featured only</span>
        </label>
      </FilterSection>

      {/* Clear all */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full text-sm text-purple-600 hover:text-purple-800 font-medium py-2 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-1"
        >
          <X className="w-4 h-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">{t("vendors.title")}</h1>
          <p className="text-purple-200 text-lg mb-8">{t("vendors.subtitle")}</p>
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl">
            <div className="flex items-center flex-1 px-3 gap-2">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={t("vendors.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 outline-none text-gray-800 text-sm py-2"
              />
            </div>
            <div className="flex items-center px-3 gap-2 border-t sm:border-t-0 sm:border-l border-gray-200">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={t("vendors.cityPlaceholder")}
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="outline-none text-gray-800 text-sm py-2 w-36"
              />
            </div>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">
              {t("vendors.searchBtn")}
            </button>
          </form>
        </div>
      </div>

      {/* Category pills */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick("")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${categoryFilter === "" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700"}`}
            >
              All Categories
            </button>
            {(Object.keys(CATEGORY_CONFIG) as VendorCategory[]).map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const active = categoryFilter === cat;
              return (
                <button key={cat} onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${active ? "bg-purple-600 text-white" : `bg-gray-100 ${cfg.color} hover:bg-purple-50`}`}
                >
                  {cfg.icon}{t(cfg.tKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile filters button */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:border-purple-300 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <p className="text-sm text-gray-500">
            {isLoading ? "Loading..." : `${total} vendor${total !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Mobile filter drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white shadow-2xl overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">Filters</h2>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {FilterSidebar}
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="text-xs text-purple-600 font-medium">{activeFilterCount} active</span>
                )}
              </div>
              {FilterSidebar}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-700">
                  {isLoading ? "Loading..." : `${total} vendor${total !== 1 ? "s" : ""} found`}
                </p>

                {/* Active filter chips */}
                {categoryFilter && (
                  <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    {CATEGORY_CONFIG[categoryFilter].icon}
                    {t(CATEGORY_CONFIG[categoryFilter].tKey)}
                    <button onClick={() => setCategoryFilter("")}><X className="w-3 h-3 ml-0.5" /></button>
                  </span>
                )}
                {cityFilter && (
                  <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    <MapPin className="w-3 h-3" />{cityFilter}
                    <button onClick={() => { setCityFilter(""); setCityInput(""); }}><X className="w-3 h-3 ml-0.5" /></button>
                  </span>
                )}
                {search && (
                  <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => { setSearch(""); setSearchInput(""); }}><X className="w-3 h-3 ml-0.5" /></button>
                  </span>
                )}
                {selectedPriceRange && (
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    {PRICE_RANGES.find(r => r.min === selectedPriceRange.min && r.max === selectedPriceRange.max)?.label}
                    <button onClick={() => setSelectedPriceRange(null)}><X className="w-3 h-3 ml-0.5" /></button>
                  </span>
                )}
                {minRating && (
                  <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{minRating}+ stars
                    <button onClick={() => setMinRating("")}><X className="w-3 h-3 ml-0.5" /></button>
                  </span>
                )}
                {featuredOnly && (
                  <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    Featured
                    <button onClick={() => setFeaturedOnly(false)}><X className="w-3 h-3 ml-0.5" /></button>
                  </span>
                )}
                {activeFilterCount > 1 && (
                  <button onClick={clearAllFilters} className="text-xs text-purple-600 hover:underline flex items-center gap-0.5">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden shrink-0">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <List className="w-4 h-4" />{t("vendors.listView")}
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${viewMode === "map" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Map className="w-4 h-4" />{t("vendors.mapView")}
                </button>
              </div>
            </div>

            {/* Map view */}
            {viewMode === "map" && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 480 }}>
                {isLoading ? (
                  <div className="h-full bg-gray-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                  </div>
                ) : (
                  <VendorMap vendors={vendors} />
                )}
              </div>
            )}

            {/* List view */}
            {viewMode === "list" && (
              <>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                        <div className="h-48 bg-gray-200" />
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t("vendors.noVendors")}</h3>
                    <p className="text-gray-500">{t("vendors.noVendorsDesc")}</p>
                    {activeFilterCount > 0 && (
                      <button onClick={clearAllFilters} className="mt-4 text-purple-600 hover:underline text-sm font-medium">
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {vendors.map((v) => {
                      const meta = CATEGORY_CONFIG[v.category];
                      return (
                        <Link key={v.id} href={`/vendors/${v.slug}`}
                          className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100"
                        >
                          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                            {v.coverPhoto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={v.coverPhoto} alt={v.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className={meta.color}>{meta.icon}</span>
                              </div>
                            )}
                            {v.isFeatured && <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">{t("vendors.featured")}</span>}
                            {v.isVerified && (
                              <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                <BadgeCheck className="w-3 h-3" /> Verified
                              </span>
                            )}
                            <span className={`absolute top-2 right-2 ${meta.bg} ${meta.color} text-xs font-medium px-2 py-0.5 rounded-full`}>{t(meta.tKey)}</span>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 group-hover:text-purple-700 transition-colors">{v.businessName}</h3>
                            {v.tagline && <p className="text-gray-500 text-sm line-clamp-1 mb-2">{v.tagline}</p>}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {v.city || v.country}
                              </div>
                              {v.avgRating !== null && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium text-gray-700">{v.avgRating.toFixed(1)}</span>
                                  <span className="text-gray-400">({v.reviewCount})</span>
                                </div>
                              )}
                            </div>
                            {v.startingPrice && (
                              <p className="mt-2 text-sm font-semibold text-purple-700">{formatPrice(v.startingPrice, v.currency)}</p>
                            )}
                            {v.slaHours && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                                <Clock className="w-3 h-3" />{t("vendors.respondsWithin")} {v.slaHours}h
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {viewMode === "list" && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">…</span>}
                      <button onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-purple-600 text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-100"}`}>{p}</button>
                    </span>
                  ))}
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{t("vendors.ctaTitle")}</h2>
          <p className="text-purple-200 mb-6">{t("vendors.ctaDesc")}</p>
          <Link href="/vendor/register" className="inline-block bg-white text-purple-700 font-semibold px-8 py-3 rounded-xl hover:bg-purple-50 transition-colors">
            {t("vendors.ctaBtn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
