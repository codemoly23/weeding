"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { LogoProps } from "../types";

export function Logo({ businessConfig, maxHeight = 36, className, variant = "light" }: LogoProps) {
  // Display settings default to true if not specified
  const showLogo = businessConfig.display?.showLogo !== false;
  const showName = businessConfig.display?.showName !== false;

  // If both are hidden, show at least the name as fallback
  const effectiveShowName = !showLogo && !showName ? true : showName;

  // Choose logo based on variant - use darkUrl for dark backgrounds if available
  const logoUrl = variant === "dark" && businessConfig.logo.darkUrl
    ? businessConfig.logo.darkUrl
    : businessConfig.logo.url;

  return (
    <Link href="/" className={cn("flex items-center space-x-2", className)}>
      {showLogo && logoUrl && (
        <Image
          src={logoUrl}
          alt={businessConfig.name}
          width={maxHeight}
          height={maxHeight}
          className="rounded-lg object-contain"
          style={{ height: `${maxHeight}px`, width: "auto" }}
        />
      )}
      {effectiveShowName && (
        <span
          className="text-2xl font-extrabold tracking-tight"
          style={{
            background: "linear-gradient(to right, #9810fa, #e60076)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >{businessConfig.name}</span>
      )}
    </Link>
  );
}
