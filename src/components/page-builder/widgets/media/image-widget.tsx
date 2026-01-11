"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageWidgetSettings } from "@/lib/page-builder/types";

interface ImageWidgetProps {
  settings: ImageWidgetSettings;
  isPreview?: boolean;
}

export function ImageWidget({ settings, isPreview = false }: ImageWidgetProps) {
  const { src, alt, objectFit, borderRadius, shadow, aspectRatio, animation } = settings;

  // Get shadow class
  const getShadowClass = () => {
    switch (shadow) {
      case "sm":
        return "shadow-sm";
      case "md":
        return "shadow-md";
      case "lg":
        return "shadow-lg";
      case "xl":
        return "shadow-xl";
      case "2xl":
        return "shadow-2xl";
      default:
        return "";
    }
  };

  // Get aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square";
      case "4:3":
        return "aspect-[4/3]";
      case "16:9":
        return "aspect-video";
      case "3:2":
        return "aspect-[3/2]";
      default:
        return "";
    }
  };

  // Get animation class
  const getAnimationClass = () => {
    switch (animation) {
      case "fade":
        return "animate-fade-in";
      case "slide-up":
        return "animate-slide-up";
      case "zoom":
        return "animate-zoom-in";
      default:
        return "";
    }
  };

  // Empty state
  if (!src) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2",
          "bg-slate-800/50 border-2 border-dashed border-slate-600",
          getAspectRatioClass() || "min-h-[200px]",
          getShadowClass()
        )}
        style={{ borderRadius: `${borderRadius}px` }}
      >
        <ImageIcon className="h-12 w-12 text-slate-500" />
        <span className="text-sm text-slate-500">No image selected</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden w-full",
        getAspectRatioClass(),
        getShadowClass(),
        getAnimationClass()
      )}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      <Image
        src={src}
        alt={alt || "Image"}
        fill
        className={cn(
          "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill"
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
