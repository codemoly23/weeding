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
  const [currentPage, setCurrentPage] = useState(0);
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
      setCurrentPage(0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getPerView]);

  const totalPages = Math.ceil(testimonials.length / perView);

  /** Slide to page using pixel-based transform (v3-forge approach) */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !rail.children.length) return;

    const gap = carouselView.spaceBetween || 24;
    const firstCard = rail.children[0] as HTMLElement;
    if (!firstCard) return;
    const cardW = firstCard.offsetWidth + gap;
    const clampedPage = Math.max(0, Math.min(currentPage, totalPages - 1));
    rail.style.transform = `translateX(-${clampedPage * perView * cardW}px)`;
  }, [currentPage, perView, totalPages, carouselView.spaceBetween]);

  /** Auto-play */
  const stopAuto = useCallback(() => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    if (!carouselView.autoplay || totalPages <= 1) return;
    autoIntervalRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, carouselView.autoplayDelay || 5000);
  }, [stopAuto, carouselView.autoplay, carouselView.autoplayDelay, totalPages]);

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
    setCurrentPage(Math.max(0, Math.min(idx, totalPages - 1)));
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
      {carouselView.navigation.pagination.enabled && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-2.5 rounded-full cursor-pointer transition-all duration-300 border border-transparent",
                i === currentPage ? "w-7" : "w-2.5 hover:opacity-60"
              )}
              style={{
                background: i === currentPage
                  ? (carouselView.navigation.pagination.activeColor || "#ff6a3d")
                  : (carouselView.navigation.pagination.inactiveColor || "rgba(255,255,255,0.2)"),
                ...(i === currentPage
                  ? { borderRadius: "5px", borderColor: "rgba(232,76,30,0.3)" }
                  : {}),
              }}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Individual testimonial card — matches v3-forge design exactly */
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
  // Responsive width calculation matching v3-forge
  const getWidth = () => {
    if (perView === 1) return "100%";
    if (perView === 2) return `calc(50% - ${gap / 2}px)`;
    return `calc(33.333% - ${(gap * (perView - 1)) / perView}px)`;
  };

  // Avatar background: use avatar field as color if it's a color string, else use index color
  const avatarBg = testimonial.avatar && testimonial.avatar.startsWith("rgba")
    ? testimonial.avatar
    : AVATAR_COLORS[index % AVATAR_COLORS.length];

  // Parse country for flag emoji (e.g., "🇮🇳 Mumbai, India")
  const country = testimonial.country || "";
  const hasFlag = country && /[\u{1F1E0}-\u{1F1FF}]/u.test(country);

  return (
    <div
      className="flex flex-col shrink-0 group"
      style={{
        width: getWidth(),
        minHeight: perView === 1 ? "280px" : "320px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: perView === 1 ? "24px" : "32px",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = "rgba(255,255,255,0.06)";
        el.style.borderColor = "rgba(255,255,255,0.15)";
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = "rgba(255,255,255,0.03)";
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Quote character */}
      <div
        className="font-display leading-none"
        style={{
          fontSize: perView === 1 ? "42px" : "56px",
          color: ratingColor,
          opacity: 0.5,
          fontWeight: 900,
          marginBottom: "-8px",
        }}
      >
        &ldquo;
      </div>

      {/* Star rating */}
      {showRating && (
        <div className="flex gap-1 mb-[18px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} color={i < testimonial.rating ? ratingColor : "rgba(255,255,255,0.1)"} />
          ))}
        </div>
      )}

      {/* Content text */}
      <p
        className="flex-grow"
        style={{
          fontSize: perView === 1 ? "14px" : "15px",
          color: "rgba(250,248,244,0.75)",
          lineHeight: 1.7,
          fontStyle: "normal",
        }}
      >
        {testimonial.content}
      </p>

      {/* Gradient divider */}
      <div
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          margin: "20px 0 18px",
        }}
      />

      {/* Author */}
      <div className="flex items-center gap-3.5 mt-auto">
        {/* Avatar circle */}
        <div
          className="shrink-0 flex items-center justify-center rounded-full font-display text-white"
          style={{
            width: perView === 1 ? "44px" : "52px",
            height: perView === 1 ? "44px" : "52px",
            fontSize: perView === 1 ? "14px" : "16px",
            fontWeight: 900,
            background: avatarBg,
            border: "2px solid rgba(255,255,255,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {getInitials(testimonial.name)}
        </div>

        {/* Info */}
        <div>
          <div
            className="font-display"
            style={{
              fontSize: perView === 1 ? "15px" : "16px",
              fontWeight: 800,
              color: "#faf8f4",
              letterSpacing: "-0.01em",
            }}
          >
            {testimonial.name}
          </div>
          {showCompany && testimonial.company && (
            <div
              style={{
                fontSize: perView === 1 ? "12px" : "13px",
                color: "rgba(250,248,244,0.5)",
                marginTop: "3px",
                fontWeight: 500,
              }}
            >
              {testimonial.company}
            </div>
          )}
          {showCountry && country && (
            <div
              className="flex items-center gap-1.5"
              style={{
                fontSize: perView === 1 ? "12px" : "13px",
                color: "rgba(250,248,244,0.4)",
                marginTop: "2px",
              }}
            >
              {country}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
