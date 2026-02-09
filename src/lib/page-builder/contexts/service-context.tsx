// ============================================
// SERVICE CONTEXT SYSTEM
// Provides service data to all Page Builder widgets
// ============================================

"use client";

import { createContext, useContext, type ReactNode } from "react";

// Re-export display options from server-safe module
export {
  type ServiceDisplayOptions,
  DEFAULT_DISPLAY_OPTIONS,
  WIDGET_TO_DISPLAY_OPTION,
  filterSectionsByDisplayOptions,
} from "../display-options";

import type { ServiceDisplayOptions } from "../display-options";

// Use number type for Decimal fields (Prisma returns them as Decimal but we serialize to number)
type DecimalValue = number;

// ============================================
// SERVICE FEATURE TYPE
// ============================================

export interface ServiceFeatureData {
  id: string;
  text: string;
  description?: string | null;
  tooltip?: string | null;
  sortOrder: number;
}

// ============================================
// SERVICE FAQ TYPE
// ============================================

export interface ServiceFAQData {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

// ============================================
// PACKAGE TYPES (for pricing)
// ============================================

export interface PackageFeatureMapData {
  id: string;
  isIncluded: boolean;
  customValue?: string | null;
  feature: ServiceFeatureData;
}

export interface PackageData {
  id: string;
  name: string;
  shortDesc?: string | null;
  price: DecimalValue;
  originalPrice?: DecimalValue | null;
  isRecommended: boolean;
  isActive: boolean;
  sortOrder: number;
  featureMappings: PackageFeatureMapData[];
}

// ============================================
// SERVICE CATEGORY TYPE
// ============================================

export interface ServiceCategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

// ============================================
// FULL SERVICE DATA TYPE
// Includes all relations needed for widgets
// ============================================

export interface ServiceData {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  icon?: string | null;
  image?: string | null;
  startingPrice: DecimalValue;
  processingTime?: string | null;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;

  // Relations
  category?: ServiceCategoryData | null;
  categoryId?: string | null;
  packages: PackageData[];
  features: ServiceFeatureData[];
  faqs: ServiceFAQData[];

  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords: string[];

  // Display Options
  displayOptions: Partial<ServiceDisplayOptions>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SERVICE CONTEXT
// ============================================

interface ServiceContextValue {
  service: ServiceData;
  isLoading: boolean;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

// ============================================
// SERVICE PROVIDER
// Wraps service pages to provide data to widgets
// ============================================

interface ServiceProviderProps {
  service: ServiceData;
  children: ReactNode;
}

export function ServiceProvider({ service, children }: ServiceProviderProps) {
  return (
    <ServiceContext.Provider value={{ service, isLoading: false }}>
      {children}
    </ServiceContext.Provider>
  );
}

// ============================================
// USE SERVICE CONTEXT HOOK
// Used by widgets to access service data
// ============================================

export function useServiceContext() {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error(
      "useServiceContext must be used within a ServiceProvider. " +
      "This widget requires a service context (use on Service Details template only)."
    );
  }

  return context;
}

// ============================================
// OPTIONAL SERVICE CONTEXT HOOK
// Returns null instead of throwing if no context
// Useful for widgets that can work with or without service data
// ============================================

export function useOptionalServiceContext() {
  return useContext(ServiceContext);
}


// ============================================
// PLACEHOLDER RESOLUTION UTILITY
// Resolves {{service.xxx}} placeholders in strings
// ============================================

export function resolvePlaceholders(template: string, service: ServiceData): string {
  if (!template || typeof template !== "string") {
    return template;
  }

  const formatPrice = (price: DecimalValue | null | undefined): string => {
    if (price === null || price === undefined) return "$0";
    const numPrice = typeof price === "number" ? price : Number(price);
    return numPrice === 0 ? "$0" : `$${numPrice.toLocaleString()}`;
  };

  return template
    .replace(/\{\{service\.name\}\}/g, service.name || "")
    .replace(/\{\{service\.title\}\}/g, service.name || "") // Alias
    .replace(/\{\{service\.slug\}\}/g, service.slug || "")
    .replace(/\{\{service\.shortDesc\}\}/g, service.shortDesc || "")
    .replace(/\{\{service\.shortDescription\}\}/g, service.shortDesc || "") // Alias
    .replace(/\{\{service\.startingPrice\}\}/g, formatPrice(service.startingPrice))
    .replace(/\{\{service\.processingTime\}\}/g, service.processingTime || "")
    .replace(/\{\{service\.timeline\}\}/g, service.processingTime || "") // Alias
    .replace(/\{\{service\.category\}\}/g, service.category?.name || "");
}
