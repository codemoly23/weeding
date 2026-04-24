"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { TestimonialsWidgetSettings, TestimonialItem } from "@/lib/page-builder/types";
import { getInitials } from "./testimonials-widget";
import { cn } from "@/lib/utils";

interface TestimonialsRailViewProps {
  testimonials: TestimonialItem[];
  settings: TestimonialsWidgetSettings;
  isPreview?: boolean;
}

/** Star SVG matching v3-forge design (filled, coral) */
function StarIcon({ color = "#ff6a3d" }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      style={{
        fill: color,
        color,
        filter: `drop-shadow(0 2px 4px ${color}4d)`,
      }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/** Default avatar colors per index */
const AVATAR_COLORS = [
  "rgba(232,76,30,0.7)",
  "rgba(5,150,105,0.7)",
  "rgba(124,58,237,0.7)",
  "rgba(220,38,38,0.6)",
  "rgba(217,119,6,0.6)",
  "rgba(147,51,234,0.6)",
  "rgba(239,68,68,0.6)",
  "rgba(16,185,129,0.6)",
  "rgba(59,130,246,0.6)",
  "rgba(168,85,247,0.6)",
];

export function TestimonialsRailView({
  testimonials,
  settings,
}: TestimonialsRailViewProps) {
  const { carouselView, content } = settings;
  const ratingColor = content.ratingColor || "#ff6a3d";

  const railRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  /** Current card index (advances 1 card at a time) */
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Responsive cards per view */
  const getPerView = useCallback(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return carouselView.slidesPerView || 3;
  }, [carouselView.slidesPerView]);

  const [perView, setPerView] = useState(3);

  useEffect(() => {
    setPerView(getPerView());
    const onResize = () => {
      setPerView(getPerView());
      setCurrentIndex(0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getPerView]);

  /** Max index = last valid starting position so all perView cards are visible */
  const maxIndex = Math.max(0, testimonials.length - perView);
  /** Total dot positions */
  const totalDots = maxIndex + 1;

  /** Slide 1 card at a time */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !rail.children.length) return;

    const gap = carouselView.spaceBetween || 24;
    const firstCard = rail.children[0] as HTMLElement;
    if (!firstCard) return;
    const cardW = firstCard.offsetWidth + gap;
    const clamped = Math.max(0, Math.min(currentIndex, maxIndex));
    rail.style.transform = `translateX(-${clamped * cardW}px)`;
  }, [currentIndex, perView, maxIndex, carouselView.spaceBetween]);

  /** Auto-play */
  const stopAuto = useCallback(() => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    if (!carouselView.autoplay || maxIndex < 1) return;
    autoIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, carouselView.autoplayDelay || 3000);
  }, [stopAuto, carouselView.autoplay, carouselView.autoplayDelay, maxIndex]);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto]);

  /** Pause on hover */
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const enter = () => stopAuto();
    const leave = () => startAuto();
    outer.addEventListener("mouseenter", enter);
    outer.addEventListener("mouseleave", leave);
    return () => {
      outer.removeEventListener("mouseenter", enter);
      outer.removeEventListener("mouseleave", leave);
    };
  }, [stopAuto, startAuto]);

  const goTo = (idx: number) => {
    stopAuto();
    setCurrentIndex(Math.max(0, Math.min(idx, maxIndex)));
    startAuto();
  };

  const gap = carouselView.spaceBetween || 24;

  return (
    <div ref={outerRef} className="relative">
      {/* Rail overflow container */}
      <div
        className="overflow-x-clip overflow-y-visible w-full"
        style={{ maxWidth: "100%" }}
      >
        {/* Sliding rail */}
        <div
          ref={railRef}
          className="flex"
          style={{
            gap: `${gap}px`,
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "transform",
          }}
        >
          {testimonials.map((testimonial, idx) => (
            <RailCard
              key={testimonial.id}
              testimonial={testimonial}
              index={idx}
              perView={perView}
              gap={gap}
              ratingColor={ratingColor}
              showRating={content.showRating}
              showCompany={content.showCompany}
              showCountry={content.showCountry}
            />
          ))}
        </div>
      </div>

      {/* Dot pagination */}
      {carouselView.navigation.pagination.enabled && totalDots > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-2.5 rounded-full cursor-pointer transition-all duration-300 border border-transparent",
                i === currentIndex ? "w-7" : "w-2.5 hover:opacity-60"
              )}
              style={{
                background: i === currentIndex
                  ? (carouselView.navigation.pagination.activeColor || "#ff6a3d")
                  : (carouselView.navigation.pagination.inactiveColor || "rgba(255,255,255,0.2)"),
                ...(i === currentIndex
                  ? { borderRadius: "5px", borderColor: "rgba(232,76,30,0.3)" }
                  : {}),
              }}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Individual testimonial card — reference design */
function RailCard({
  testimonial,
  index,
  perView,
  gap,
  ratingColor,
  showRating,
  showCompany,
  showCountry,
}: {
  testimonial: TestimonialItem;
  index: number;
  perView: number;
  gap: number;
  ratingColor: string;
  showRating: boolean;
  showCompany: boolean;
  showCountry: boolean;
}) {
  const getWidth = () => {
    if (perView === 1) return "100%";
    if (perView === 2) return `calc(50% - ${gap / 2}px)`;
    return `calc(33.333% - ${(gap * (perView - 1)) / perView}px)`;
  };

  return (
    <div
      className="flex flex-col shrink-0"
      style={{
        width: getWidth(),
        minHeight: "280px",
        background: "#ffffff",
        border: "1px solid #f3f4f6",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(168,85,247,0.15)";
        e.currentTarget.style.background = "#faf5ff";
        e.currentTarget.style.borderColor = "#e9d5ff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.borderColor = "#f3f4f6";
      }}
    >
      {/* Star rating */}
      {showRating && (
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} color={i < testimonial.rating ? ratingColor : "#e5e7eb"} />
          ))}
        </div>
      )}

      {/* Big quote marks */}
      <div
        className="leading-none select-none mb-3"
        style={{ fontSize: "48px", fontWeight: 900, color: "#c4b5fd", lineHeight: 1 }}
      >
        &#x275D;&#x275E;
      </div>

      {/* Content text */}
      <p
        className="flex-grow"
        style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.7 }}
      >
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {/* Divider */}
      <div
        style={{
          height: "2px",
          width: "48px",
          borderRadius: "999px",
          background: "linear-gradient(to right, #a855f7, #ec4899)",
          margin: "20px 0 16px",
        }}
      />

      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="shrink-0 rounded-full object-cover"
            style={{ width: "44px", height: "44px" }}
          />
        ) : (
          <div
            className="shrink-0 flex items-center justify-center rounded-full text-white font-semibold text-sm"
            style={{ width: "44px", height: "44px", background: "#ec4899" }}
          >
            {getInitials(testimonial.name)}
          </div>
        )}

        {/* Info */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            {testimonial.name}
          </div>
          {showCompany && testimonial.company && (
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "1px" }}>
              {testimonial.company}
            </div>
          )}
          {showCountry && testimonial.country && (
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "1px" }}>
              {testimonial.country}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
