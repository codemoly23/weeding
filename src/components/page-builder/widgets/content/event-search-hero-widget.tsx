"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search, MapPin, Briefcase, Globe, ChevronDown,
  Heart, Home, Hotel, UtensilsCrossed, Sailboat, Waves,
  Building2, TreePine, Wine, Warehouse, Flag, Landmark,
  Leaf, Building, Church, Flower2, Ship, Anchor, Music,
  Camera, Utensils, Star, Users, Coffee, Mountain, Sun,
  Mail, Gift, Car, Shirt, ClipboardList, Video, Gem,
  Sparkles, Plane, Lightbulb, Cake, Disc3, Package, User,
} from "lucide-react";
import type { EventSearchHeroWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_EVENT_SEARCH_HERO_SETTINGS } from "@/lib/page-builder/defaults";

interface SearchOption {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
  group?: string | null;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties; strokeWidth?: number }>> = {
  Heart, Home, Hotel, UtensilsCrossed, Sailboat, Waves, Building2, TreePine, Wine,
  Warehouse, Flag, Landmark, Leaf, Building, Church, Flower2, Ship, Anchor, Music,
  Camera, Utensils, Star, Users, Coffee, Mountain, Sun, MapPin, Briefcase, Globe,
  Mail, Gift, Car, Shirt, ClipboardList, Video, Gem, Sparkles, Plane, Lightbulb,
  Cake, Disc3, Package, User,
};

function getIcon(name?: string | null) {
  if (!name) return null;
  return ICON_MAP[name] ?? null;
}

interface SearchDropdownProps {
  options: SearchOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  triggerIcon: React.ReactNode;
  hasError?: boolean;
}

function SearchDropdown({ options, value, onChange, placeholder, triggerIcon, hasError }: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.name === value);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} style={{ flex: 1, position: "relative", minWidth: 0 }}>
      <div
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 20px",
          gap: "10px",
          borderRadius: "10px",
          background: open ? "#f9f6ff" : "transparent",
          cursor: "pointer",
          transition: "background 0.15s",
          userSelect: "none",
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = "#f9f6ff"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
      >
        {triggerIcon}
        <span
          style={{
            flex: 1,
            fontSize: "0.95rem",
            fontWeight: 500,
            color: selected ? "#1f2937" : "#6b7280",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: "#9ca3af",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "1rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            zIndex: 200,
            maxHeight: "260px",
            overflowY: "auto",
            padding: "6px",
          }}
        >
          {options.length === 0 ? (
            <p style={{ padding: "1rem", textAlign: "center", fontSize: "0.8rem", color: "#9ca3af" }}>
              No options
            </p>
          ) : (
            options.map((opt) => {
              const IconComp = getIcon(opt.icon);
              const isSelected = opt.name === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(opt.name);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.625rem 0.875rem",
                    fontSize: "0.875rem",
                    color: isSelected ? "#7c3aed" : "#1f2937",
                    background: isSelected ? "#f5f3ff" : "none",
                    border: "none",
                    borderRadius: "0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f5f3ff"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "none"; }}
                >
                  {IconComp ? (
                    <IconComp size={15} style={{ color: "#9333ea", flexShrink: 0 }} strokeWidth={1.75} />
                  ) : (
                    <span style={{ width: 15, flexShrink: 0 }} />
                  )}
                  {opt.name}
                </button>
              );
            })
          )}
        </div>
      )}

      {hasError && (
        <p style={{ position: "absolute", bottom: "-18px", left: "20px", color: "#dc2626", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
          Required
        </p>
      )}
    </div>
  );
}

interface GroupedSearchDropdownProps {
  options: SearchOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  triggerIcon: React.ReactNode;
  hasError?: boolean;
}

function GroupedSearchDropdown({ options, value, onChange, placeholder, triggerIcon, hasError }: GroupedSearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Sweden" | "International">("Sweden");
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.name === value);

  const swedenOptions = options.filter((o) => o.group === "Sweden");
  const internationalOptions = options.filter((o) => o.group === "International");
  const tabOptions = activeTab === "Sweden" ? swedenOptions : internationalOptions;

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} style={{ flex: 1, position: "relative", minWidth: 0 }}>
      <div
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 20px",
          gap: "10px",
          borderRadius: "10px",
          background: open ? "#f9f6ff" : "transparent",
          cursor: "pointer",
          transition: "background 0.15s",
          userSelect: "none",
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = "#f9f6ff"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
      >
        {triggerIcon}
        <span
          style={{
            flex: 1,
            fontSize: "0.95rem",
            fontWeight: 500,
            color: selected ? "#1f2937" : "#6b7280",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: "#9ca3af",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "1rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            zIndex: 200,
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6" }}>
            {(["Sweden", "International"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setActiveTab(tab); }}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: activeTab === tab ? "#7c3aed" : "#6b7280",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab ? "2px solid #7c3aed" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                {tab === "Sweden" ? (
                  <MapPin size={11} style={{ flexShrink: 0 }} />
                ) : (
                  <Globe size={11} style={{ flexShrink: 0 }} />
                )}
                {tab}
              </button>
            ))}
          </div>

          {/* Options list */}
          <div style={{ maxHeight: "220px", overflowY: "auto", padding: "6px" }}>
            {tabOptions.length === 0 ? (
              <p style={{ padding: "1rem", textAlign: "center", fontSize: "0.8rem", color: "#9ca3af" }}>
                No options
              </p>
            ) : (
              tabOptions.map((opt) => {
                const IconComp = getIcon(opt.icon);
                const isSelected = opt.name === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(opt.name);
                      setOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.625rem 0.875rem",
                      fontSize: "0.875rem",
                      color: isSelected ? "#7c3aed" : "#1f2937",
                      background: isSelected ? "#f5f3ff" : "none",
                      border: "none",
                      borderRadius: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f5f3ff"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "none"; }}
                  >
                    {IconComp ? (
                      <IconComp size={15} style={{ color: "#9333ea", flexShrink: 0 }} strokeWidth={1.75} />
                    ) : (
                      <span style={{ width: 15, flexShrink: 0 }} />
                    )}
                    {opt.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {hasError && (
        <p style={{ position: "absolute", bottom: "-18px", left: "20px", color: "#dc2626", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
          Required
        </p>
      )}
    </div>
  );
}

interface EventSearchHeroWidgetProps {
  settings: EventSearchHeroWidgetSettings;
  isPreview?: boolean;
}

export function EventSearchHeroWidget({
  settings: rawSettings,
  isPreview = false,
}: EventSearchHeroWidgetProps) {
  const router = useRouter();

  const settings: EventSearchHeroWidgetSettings = {
    ...DEFAULT_EVENT_SEARCH_HERO_SETTINGS,
    ...rawSettings,
    eventTypes:
      rawSettings.eventTypes?.length
        ? rawSettings.eventTypes
        : DEFAULT_EVENT_SEARCH_HERO_SETTINGS.eventTypes,
    backgroundImages:
      rawSettings.backgroundImages?.length
        ? rawSettings.backgroundImages
        : DEFAULT_EVENT_SEARCH_HERO_SETTINGS.backgroundImages,
  };

  const {
    title,
    subtitle,
    backgroundImages,
    autoplayInterval,
    overlayOpacityTop,
    overlayOpacityBottom,
    showEventTypeField,
    showLocationField,
    showDateField,
    eventTypeLabel,
    locationLabel,
    dateLabel,
    searchButtonLabel,
    searchButtonHref,
  } = settings;

  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    if (backgroundImages.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % backgroundImages.length);
    }, autoplayInterval);
  }, [backgroundImages.length, autoplayInterval]);

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoplay]);

  const [eventType, setEventType] = useState("");
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<{ eventType?: boolean; location?: boolean; date?: boolean }>({});

  const [placeOptions, setPlaceOptions] = useState<SearchOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<SearchOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<SearchOption[]>([]);

  useEffect(() => {
    const fetchOpts = async () => {
      try {
        const [places, services, locations] = await Promise.all([
          fetch("/api/search-options?type=PLACE").then((r) => r.json()),
          fetch("/api/search-options?type=SERVICE").then((r) => r.json()),
          fetch("/api/search-options?type=LOCATION").then((r) => r.json()),
        ]);
        if (Array.isArray(places)) setPlaceOptions(places);
        if (Array.isArray(services)) setServiceOptions(services);
        if (Array.isArray(locations)) setLocationOptions(locations);
      } catch {}
    };
    fetchOpts();
  }, []);

  function handleSearch() {
    if (isPreview) return;
    const newErrors: typeof errors = {};
    if (showEventTypeField && !eventType) newErrors.eventType = true;
    if (showLocationField && !service.trim()) newErrors.location = true;
    if (showDateField && !location) newErrors.date = true;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    const params = new URLSearchParams();
    if (eventType) params.set("place", eventType);
    if (service) params.set("service", service);
    if (location) params.set("location", location);
    const query = params.toString();
    router.push(query ? `${searchButtonHref}?${query}` : searchButtonHref);
  }

  const overlayStyle: React.CSSProperties = {
    background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacityTop}), rgba(0,0,0,${overlayOpacityBottom}))`,
  };

  return (
    <section className="relative overflow-hidden" style={{ height: "100vh", minHeight: "600px" }}>
      {backgroundImages.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{ opacity: i === activeIndex ? 1 : 0, transition: "opacity 1s ease-in-out", zIndex: 0 }}
        >
          <Image src={src} alt="" fill priority={i === 0} className="object-cover" sizes="100vw" />
        </div>
      ))}

      <div className="absolute inset-0" style={{ ...overlayStyle, zIndex: 1 }} />

      <div
        className="relative flex flex-col items-center justify-center h-full text-center"
        style={{ zIndex: 10, padding: "2rem" }}
      >
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(3rem, 6vw, 5.5rem)",
            fontWeight: 700,
            color: "white",
            marginBottom: "1.5rem",
            textShadow: "0 4px 6px rgba(0,0,0,0.3)",
            lineHeight: 1.1,
            maxWidth: "800px",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "white",
            marginBottom: "2.5rem",
            maxWidth: "42rem",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>

        {/* Search Bar */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            maxWidth: "860px",
            width: "100%",
            padding: "8px",
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Place Field */}
          {showEventTypeField && (
            <>
              <SearchDropdown
                options={placeOptions}
                value={eventType}
                onChange={(v) => { setEventType(v); setErrors((p) => ({ ...p, eventType: false })); }}
                placeholder={eventTypeLabel}
                triggerIcon={<MapPin size={16} style={{ color: "#9333ea", flexShrink: 0 }} />}
                hasError={errors.eventType}
              />
              {(showLocationField || showDateField) && (
                <div style={{ width: "1px", height: "24px", background: "#e5e7eb", flexShrink: 0 }} />
              )}
            </>
          )}

          {/* Service Field */}
          {showLocationField && (
            <>
              <SearchDropdown
                options={serviceOptions}
                value={service}
                onChange={(v) => { setService(v); setErrors((p) => ({ ...p, location: false })); }}
                placeholder={locationLabel}
                triggerIcon={<Briefcase size={16} style={{ color: "#9333ea", flexShrink: 0 }} />}
                hasError={errors.location}
              />
              {showDateField && (
                <div style={{ width: "1px", height: "24px", background: "#e5e7eb", flexShrink: 0 }} />
              )}
            </>
          )}

          {/* Location Field */}
          {showDateField && (
            <GroupedSearchDropdown
              options={locationOptions}
              value={location}
              onChange={(v) => { setLocation(v); setErrors((p) => ({ ...p, date: false })); }}
              placeholder={dateLabel}
              triggerIcon={<Globe size={16} style={{ color: "#9333ea", flexShrink: 0 }} />}
              hasError={errors.date}
            />
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            title={searchButtonLabel}
            style={{
              flexShrink: 0,
              width: "58px",
              height: "58px",
              background: "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
              border: "none",
              borderRadius: "12px",
              cursor: isPreview ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isPreview) {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "scale(1.04)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Search size={20} color="white" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
