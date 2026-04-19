"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import type { EventSearchHeroWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_EVENT_SEARCH_HERO_SETTINGS } from "@/lib/page-builder/defaults";

interface EventSearchHeroWidgetProps {
  settings: EventSearchHeroWidgetSettings;
  isPreview?: boolean;
}

export function EventSearchHeroWidget({
  settings: rawSettings,
  isPreview = false,
}: EventSearchHeroWidgetProps) {
  const router = useRouter();

  // Merge with defaults
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
    locationPlaceholder,
    eventTypes,
    searchButtonLabel,
    searchButtonHref,
  } = settings;

  // Background image slideshow state
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoplay]);

  // Search form state
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<{ eventType?: boolean; location?: boolean; date?: boolean }>({});

  function handleSearch() {
    if (isPreview) return;
    const newErrors: typeof errors = {};
    if (showEventTypeField && !eventType) newErrors.eventType = true;
    if (showLocationField && !location.trim()) newErrors.location = true;
    if (showDateField && !date) newErrors.date = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const params = new URLSearchParams();
    if (eventType) params.set("type", eventType);
    if (location) params.set("location", location);
    if (date) params.set("date", date);
    const query = params.toString();
    router.push(query ? `${searchButtonHref}?${query}` : searchButtonHref);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  // Build overlay gradient
  const overlayStyle: React.CSSProperties = {
    background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacityTop}), rgba(0,0,0,${overlayOpacityBottom}))`,
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "100vh", minHeight: "600px" }}
    >
      {/* Background Images — cross-fade */}
      {backgroundImages.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            zIndex: 0,
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0" style={{ ...overlayStyle, zIndex: 1 }} />

      {/* Content */}
      <div
        className="relative flex flex-col items-center justify-center h-full text-center"
        style={{ zIndex: 10, padding: "2rem" }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
            fontWeight: 900,
            color: "white",
            marginBottom: "1.5rem",
            textShadow: "0 4px 6px rgba(0,0,0,0.3)",
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1.25rem",
            color: "rgba(255,255,255,0.9)",
            marginBottom: "2.5rem",
            maxWidth: "42rem",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>

        {/* Search Card */}
        <div
          style={{
            background: "white",
            borderRadius: "1rem",
            padding: "1.5rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            maxWidth: "56rem",
            width: "100%",
          }}
        >
          {/* Fields Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {/* Event Type */}
            {showEventTypeField && (
              <div style={{ position: "relative" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: errors.eventType ? "#dc2626" : "#6b7280",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {eventTypeLabel}
                </label>
                <select
                  value={eventType}
                  onChange={(e) => { setEventType(e.target.value); setErrors((p) => ({ ...p, eventType: false })); }}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: `1px solid ${errors.eventType ? "#dc2626" : "#e5e7eb"}`,
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    outline: "none",
                    color: "#1f2937",
                    background: "white",
                    cursor: "pointer",
                    appearance: "auto",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = errors.eventType ? "#dc2626" : "#9333ea")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.eventType ? "#dc2626" : "#e5e7eb")}
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((et) => (
                    <option key={et.value} value={et.value}>
                      {et.label}
                    </option>
                  ))}
                </select>
                {errors.eventType && (
                  <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>Please select an event type</p>
                )}
              </div>
            )}

            {/* Location */}
            {showLocationField && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: errors.location ? "#dc2626" : "#6b7280",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {locationLabel}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: false })); }}
                  onKeyDown={handleKeyDown}
                  placeholder={locationPlaceholder}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: `1px solid ${errors.location ? "#dc2626" : "#e5e7eb"}`,
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    outline: "none",
                    color: "#1f2937",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = errors.location ? "#dc2626" : "#9333ea")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.location ? "#dc2626" : "#e5e7eb")}
                />
                {errors.location && (
                  <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>Please enter a location</p>
                )}
              </div>
            )}

            {/* Date */}
            {showDateField && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: errors.date ? "#dc2626" : "#6b7280",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {dateLabel}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: false })); }}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: `1px solid ${errors.date ? "#dc2626" : "#e5e7eb"}`,
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    outline: "none",
                    color: "#1f2937",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = errors.date ? "#dc2626" : "#9333ea")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.date ? "#dc2626" : "#e5e7eb")}
                />
                {errors.date && (
                  <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>Please select a date</p>
                )}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            style={{
              marginTop: "1rem",
              width: "100%",
              background: "linear-gradient(to right, #9333ea, #ec4899)",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.875rem 2rem",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: isPreview ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isPreview) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <Search size={18} />
            {searchButtonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
