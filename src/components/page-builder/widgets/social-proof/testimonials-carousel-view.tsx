"use client";

import { useState, useRef, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { TestimonialsWidgetSettings, TestimonialItem } from "@/lib/page-builder/types";
import { getInitials, StarRating } from "./testimonials-widget";
import { cn } from "@/lib/utils";

interface TestimonialsCarouselViewProps {
  testimonials: TestimonialItem[];
  settings: TestimonialsWidgetSettings;
  isPreview?: boolean;
}

export function TestimonialsCarouselView({
  testimonials,
  settings,
  isPreview,
}: TestimonialsCarouselViewProps) {
  const { carouselView, cardStyle, avatar, content } = settings;
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = testimonials.length;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Autoplay
  useEffect(() => {
    if (!carouselView.autoplay || totalSlides <= 1) return;
    const interval = setInterval(goToNext, carouselView.autoplayDelay || 5000);
    return () => clearInterval(interval);
  }, [carouselView.autoplay, carouselView.autoplayDelay, totalSlides]);

  // Arrow button size classes
  const arrowSizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const arrowIconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Quote font size classes
  const quoteFontSizeClasses = {
    sm: "text-sm md:text-base",
    md: "text-base md:text-lg",
    lg: "text-lg md:text-xl",
  };

  // Avatar size for split layout
  const splitAvatarSizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  };

  // Card shadow classes
  const shadowClasses: Record<string, string> = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  // Generate card styles based on cardStyle.style
  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      borderRadius: cardStyle.borderRadius,
      padding: `${cardStyle.padding}px ${cardStyle.padding + 20}px`,
    };

    switch (cardStyle.style) {
      case "minimal":
        return {
          ...baseStyles,
          borderWidth: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
        };
      case "elevated":
        return {
          ...baseStyles,
          borderWidth: 0,
          backgroundColor: cardStyle.backgroundColor,
        };
      case "glassmorphism":
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.1)",
          backgroundColor: `rgba(30, 41, 59, ${cardStyle.glassEffect?.opacity || 0.6})`,
          backdropFilter: `blur(${cardStyle.glassEffect?.blur || 12}px)`,
          WebkitBackdropFilter: `blur(${cardStyle.glassEffect?.blur || 12}px)`,
        };
      case "bordered":
        return {
          ...baseStyles,
          borderWidth: cardStyle.borderWidth || 1,
          borderColor: cardStyle.borderColor,
          backgroundColor: cardStyle.backgroundColor,
          borderStyle: "solid",
        };
      case "gradient-border":
        return {
          ...baseStyles,
          borderWidth: 0,
          backgroundColor: cardStyle.backgroundColor,
        };
      default:
        return {
          ...baseStyles,
          borderWidth: cardStyle.borderWidth,
          borderColor: cardStyle.borderColor,
          backgroundColor: cardStyle.backgroundColor,
        };
    }
  };

  // Check if gradient border should be enabled
  const isGradientBorderEnabled = (): boolean => {
    return cardStyle.style === "gradient-border" || !!cardStyle.gradientBorder?.enabled;
  };

  // Gradient border wrapper
  const GradientBorderWrapper = ({
    children,
    enabled,
    className,
  }: {
    children: React.ReactNode;
    enabled: boolean;
    className?: string;
  }) => {
    if (!enabled) {
      return <div className={className}>{children}</div>;
    }

    const defaultColors = ["#f97316", "#3b82f6"];
    const gradientColors = cardStyle.gradientBorder?.colors?.length
      ? cardStyle.gradientBorder.colors.join(", ")
      : defaultColors.join(", ");
    const angle = cardStyle.gradientBorder?.angle || 135;

    return (
      <div
        className={cn("p-[2px]", className)}
        style={{
          background: `linear-gradient(${angle}deg, ${gradientColors})`,
          borderRadius: cardStyle.borderRadius,
        }}
      >
        {children}
      </div>
    );
  };

  // Get hover classes
  const getHoverClasses = () => {
    switch (cardStyle.hoverEffect) {
      case "lift":
        return "transition-all duration-300 hover:-translate-y-2 hover:shadow-xl";
      case "glow":
        return "transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]";
      case "scale":
        return "transition-transform duration-300 hover:scale-[1.03]";
      case "border-color":
        return "transition-colors duration-300 hover:!border-primary";
      default:
        return "";
    }
  };

  const currentTestimonial = testimonials[currentIndex];

  // Render Standard Carousel
  const renderStandardCarousel = () => (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
            <GradientBorderWrapper
              enabled={isGradientBorderEnabled()}
              className="mx-auto max-w-2xl"
            >
              <Card
                className={cn(
                  shadowClasses[cardStyle.shadow || "none"],
                  getHoverClasses()
                )}
                style={getCardStyles()}
              >
              <CardContent className="p-8 text-center">
                {/* Rating */}
                {content.showRating && (
                  <div className="mb-6 flex justify-center">
                    <StarRating
                      rating={testimonial.rating}
                      style={content.ratingStyle}
                      color={content.ratingColor}
                      size="md"
                    />
                  </div>
                )}

                {/* Quote */}
                <p
                  className={cn(
                    "mb-6",
                    quoteFontSizeClasses[content.quoteFontSize],
                    content.quoteStyle === "italic" && "italic"
                  )}
                  style={{ color: content.quoteColor }}
                >
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-center gap-3">
                  {avatar.style !== "none" && (
                    <Avatar
                      className={splitAvatarSizeClasses[avatar.size]}
                      style={{
                        borderWidth: avatar.borderWidth,
                        borderColor: avatar.borderColor,
                      }}
                    >
                      {avatar.style === "photo" && testimonial.avatar ? (
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      ) : null}
                      <AvatarFallback
                        style={{
                          backgroundColor: avatar.backgroundColor,
                          color: avatar.textColor,
                        }}
                      >
                        {getInitials(testimonial.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="text-left">
                    <p
                      className="font-medium"
                      style={{ color: content.nameColor }}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: content.infoColor }}
                    >
                      {[
                        content.showCompany && testimonial.company,
                        content.showCountry && testimonial.country,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </GradientBorderWrapper>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Split Layout Carousel (large photo on one side)
  const renderSplitCarousel = () => {
    const photoPosition = carouselView.splitLayout?.photoPosition || "left";
    const photoSize = carouselView.splitLayout?.photoSize || "50";

    return (
      <div className="relative overflow-hidden">
        <GradientBorderWrapper enabled={isGradientBorderEnabled()} className="">
          <Card
            className={cn(
              "overflow-hidden",
              shadowClasses[cardStyle.shadow || "none"],
              getHoverClasses()
            )}
            style={getCardStyles()}
          >
          <CardContent className="p-0">
            <div
              className={cn(
                "flex flex-col md:flex-row",
                photoPosition === "right" && "md:flex-row-reverse"
              )}
            >
              {/* Photo Side */}
              <div
                className="relative aspect-square md:aspect-auto bg-muted"
                style={{ flex: `0 0 ${photoSize}%` }}
              >
                {currentTestimonial?.avatar ? (
                  <img
                    src={currentTestimonial.avatar}
                    alt={currentTestimonial.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ backgroundColor: avatar.backgroundColor }}
                  >
                    <span
                      className="text-6xl font-bold font-display"
                      style={{ color: avatar.textColor }}
                    >
                      {currentTestimonial && getInitials(currentTestimonial.name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Side */}
              <div className="flex flex-1 flex-col justify-center p-8 md:p-12">
                {/* Rating */}
                {content.showRating && currentTestimonial && (
                  <div className="mb-4">
                    <StarRating
                      rating={currentTestimonial.rating}
                      style={content.ratingStyle}
                      color={content.ratingColor}
                      size="md"
                    />
                  </div>
                )}

                {/* Quote */}
                {currentTestimonial && (
                  <p
                    className={cn(
                      "mb-6 text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed",
                      content.quoteStyle === "italic" && "italic"
                    )}
                    style={{ color: content.quoteColor }}
                  >
                    {currentTestimonial.content}
                  </p>
                )}

                {/* Author */}
                {currentTestimonial && (
                  <div>
                    <p
                      className="font-semibold font-display"
                      style={{ color: content.nameColor }}
                    >
                      — {currentTestimonial.name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: content.infoColor }}
                    >
                      {[
                        content.showCompany && currentTestimonial.company,
                        content.showCountry && currentTestimonial.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </GradientBorderWrapper>
      </div>
    );
  };

  // Render navigation arrows
  const renderArrows = () => {
    if (!carouselView.navigation.arrows.enabled) return null;

    const { arrows } = carouselView.navigation;
    const positionClasses = {
      sides: "absolute inset-y-0 flex items-center",
      bottom: "mt-6 flex justify-center gap-2",
      "bottom-right": "mt-6 flex justify-end gap-2",
    };

    const ArrowButton = ({
      direction,
      onClick,
    }: {
      direction: "prev" | "next";
      onClick: () => void;
    }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={cn(
          arrowSizeClasses[arrows.size],
          "rounded-full transition-all",
          arrows.showOnHover && "opacity-0 group-hover:opacity-100"
        )}
        style={{
          color: arrows.color,
          backgroundColor: arrows.backgroundColor,
        }}
      >
        {direction === "prev" ? (
          <ChevronLeft className={arrowIconSizeClasses[arrows.size]} />
        ) : (
          <ChevronRight className={arrowIconSizeClasses[arrows.size]} />
        )}
      </Button>
    );

    if (arrows.position === "sides") {
      return (
        <>
          <div className={cn(positionClasses.sides, "left-0")}>
            <ArrowButton direction="prev" onClick={goToPrev} />
          </div>
          <div className={cn(positionClasses.sides, "right-0")}>
            <ArrowButton direction="next" onClick={goToNext} />
          </div>
        </>
      );
    }

    return (
      <div className={positionClasses[arrows.position]}>
        <ArrowButton direction="prev" onClick={goToPrev} />
        <ArrowButton direction="next" onClick={goToNext} />
      </div>
    );
  };

  // Render pagination dots
  const renderPagination = () => {
    if (!carouselView.navigation.pagination.enabled) return null;

    const { pagination } = carouselView.navigation;

    if (pagination.type === "fraction") {
      return (
        <div className="mt-6 text-center text-sm">
          <span style={{ color: pagination.activeColor }}>{currentIndex + 1}</span>
          <span style={{ color: pagination.inactiveColor }}> / {totalSlides}</span>
        </div>
      );
    }

    if (pagination.type === "progressbar") {
      return (
        <div
          className="mt-6 h-1 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: pagination.inactiveColor }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              backgroundColor: pagination.activeColor,
              width: `${((currentIndex + 1) / totalSlides) * 100}%`,
            }}
          />
        </div>
      );
    }

    // Dots
    return (
      <div className="mt-6 flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-200",
              index === currentIndex ? "w-6" : ""
            )}
            style={{
              backgroundColor:
                index === currentIndex
                  ? pagination.activeColor
                  : pagination.inactiveColor,
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  };

  // Render Centered Quote Carousel (inspired by agency-style design)
  const renderCenteredCarousel = () => {
    const testimonial = testimonials[currentIndex];
    const { pagination } = carouselView.navigation;
    const activeColor = pagination.activeColor || "#030303";
    const inactiveColor = pagination.inactiveColor || "#cccccc";
    const padded = (n: number) => String(n).padStart(2, "0");

    return (
      <div className="relative w-full">
        {/* Slides */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="w-full flex-shrink-0 flex flex-col items-center text-center px-4 md:px-16 lg:px-32"
              >
                {/* Quote text */}
                <p
                  className={cn(
                    "mb-10 text-2xl md:text-3xl lg:text-4xl font-light leading-snug",
                    content.quoteStyle === "italic" && "italic"
                  )}
                  style={{ color: content.quoteColor }}
                  dangerouslySetInnerHTML={{
                    __html: t.content,
                  }}
                />

                {/* Author row: quote icon + avatar overlapping, then name & role */}
                <div className="flex items-center gap-4 text-left">
                  {/* Overlapping quote icon + avatar */}
                  <div className="relative flex items-center">
                    {/* SVG quote mark circle */}
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full z-10"
                      style={{ backgroundColor: activeColor }}
                    >
                      <svg width="20" height="16" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M28.5847 16.895C28.1454 19.6558 24.6944 22.6049 21.9963 22.6676C21.8081 22.6676 21.6198 22.7304 21.4943 22.8559C21.3688 22.9186 21.2433 22.9814 21.1806 23.1696C20.2394 24.9265 20.7414 26.3069 22.31 27.4364C24.1297 28.754 27.016 27.4364 28.4592 26.2442C32.0985 23.2323 35.8005 18.0245 35.6123 13.0674C36.2397 9.74178 36.1142 6.16534 35.173 3.21626C34.5456 1.33387 32.7259 0.392675 30.8435 0.267183C28.9611 0.141588 25.0709 -0.423025 23.3767 0.706306C21.6826 1.83584 21.5571 4.03197 21.3688 5.91425C21.1806 7.98488 20.6159 11.8753 22.3728 13.5067C24.1297 15.0753 29.1494 13.3812 28.5847 16.895ZM7.87837 16.895C7.43915 19.6558 3.9882 22.6049 1.29001 22.6676C1.10177 22.6676 0.913532 22.7304 0.78804 22.8559C0.662445 22.9186 0.537052 22.9814 0.474205 23.1696C-0.466991 24.9265 0.034977 26.3069 1.60364 27.4364C3.42328 28.754 6.30961 27.4364 7.75288 26.2442C11.3922 23.2323 15.0942 18.0244 14.906 13.0674C15.5334 9.74178 15.4079 6.16534 14.4668 3.21626C13.8394 1.33387 12.0197 0.392675 10.1372 0.267183C8.25485 0.141588 4.36458 -0.423025 2.67043 0.706306C0.976379 1.83584 0.850784 4.03197 0.662548 5.91425C0.474308 7.98488 -0.0904121 11.8753 1.66649 13.5067C3.42339 15.0753 8.50584 13.3812 7.87837 16.895Z" fill="white"/>
                      </svg>
                    </div>
                    {/* Avatar overlapping */}
                    {avatar.style !== "none" && (
                      <div
                        className={cn(
                          "rounded-full overflow-hidden border-2 border-white -ml-3",
                          splitAvatarSizeClasses[avatar.size]
                        )}
                        style={{ borderColor: avatar.borderColor || "#ffffff" }}
                      >
                        {avatar.style === "photo" && t.avatar ? (
                          <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center text-sm font-bold font-display"
                            style={{ backgroundColor: avatar.backgroundColor, color: avatar.textColor }}
                          >
                            {getInitials(t.name)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Name & Role */}
                  <div>
                    <p className="font-semibold font-display text-lg leading-tight" style={{ color: content.nameColor }}>
                      {t.name}
                    </p>
                    <p className="text-sm" style={{ color: content.infoColor }}>
                      {[
                        content.showCompany && t.company,
                        content.showCountry && t.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress navigation: 02 ——— 03 */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className="text-sm font-medium tabular-nums" style={{ color: activeColor }}>
            {padded(currentIndex + 1)}
          </span>
          <div
            className="relative h-px w-32 md:w-48 overflow-hidden rounded-full"
            style={{ backgroundColor: inactiveColor }}
          >
            <div
              className="absolute left-0 top-0 h-full transition-all duration-500"
              style={{
                backgroundColor: activeColor,
                width: `${((currentIndex + 1) / totalSlides) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm tabular-nums" style={{ color: inactiveColor }}>
            {padded(totalSlides)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="group relative">
      {/* Carousel Content */}
      {carouselView.layout === "centered"
        ? renderCenteredCarousel()
        : carouselView.layout === "split"
        ? renderSplitCarousel()
        : renderStandardCarousel()}

      {/* Navigation (arrows + pagination) — skip for centered (it has its own) */}
      {carouselView.layout !== "centered" && (
        <>
          {renderArrows()}
          {renderPagination()}
        </>
      )}
    </div>
  );
}
