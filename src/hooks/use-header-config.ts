"use client";

import { useState, useEffect } from "react";
import type { PublicHeaderResponse, MenuItem, Translations } from "@/lib/header-footer/types";

interface UseHeaderConfigResult {
  config: PublicHeaderResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const defaultConfig: PublicHeaderResponse = {
  id: "default",
  layout: "DEFAULT",
  sticky: true,
  transparent: false,
  height: 64,
  logo: {
    position: "LEFT",
    maxHeight: 36,
  },
  menu: [],
  cta: [
    {
      text: "Get Started",
      url: "/register",
      variant: "primary",
    },
  ],
  auth: {
    showButtons: true,
    loginText: "Sign In",
    registerText: "Get Started",
    registerUrl: "/register",
  },
  search: {
    enabled: false,
  },
  languageSwitcher: {
    enabled: false,
  },
  styling: {},
};

let cachedHeaderConfig: PublicHeaderResponse | null = null;
let inflightHeaderConfig: Promise<PublicHeaderResponse> | null = null;

async function loadHeaderConfig(): Promise<PublicHeaderResponse> {
  if (cachedHeaderConfig) return cachedHeaderConfig;
  if (!inflightHeaderConfig) {
    inflightHeaderConfig = fetch("/api/header", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 404) return defaultConfig;
        if (!response.ok) {
          throw new Error(`Failed to fetch header config: ${response.status}`);
        }
        return response.json() as Promise<PublicHeaderResponse>;
      })
      .then((data) => {
        cachedHeaderConfig = data;
        return data;
      })
      .finally(() => {
        inflightHeaderConfig = null;
      });
  }
  return inflightHeaderConfig;
}

export function useHeaderConfig(): UseHeaderConfigResult {
  const [config, setConfig] = useState<PublicHeaderResponse | null>(cachedHeaderConfig);
  const [isLoading, setIsLoading] = useState(!cachedHeaderConfig);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setConfig(await loadHeaderConfig());
    } catch (err) {
      console.error("Error fetching header config:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config: config || defaultConfig,
    isLoading,
    error,
    refetch: fetchConfig,
  };
}

export function getMegaMenuCategories(menu: MenuItem[]): {
  name: string;
  description: string;
  icon: string;
  services: {
    name: string;
    href: string;
    popular?: boolean;
  }[];
}[] {
  const servicesItem = menu.find((item) => item.isMegaMenu && item.children && item.children.length > 0);

  if (!servicesItem || !servicesItem.children) {
    return [];
  }

  return servicesItem.children.map((category) => ({
    name: category.categoryName || category.label,
    description: category.categoryDesc || "",
    icon: category.categoryIcon || "folder",
    services: (category.children || []).map((service) => ({
      name: service.label,
      href: service.url || "#",
      icon: service.icon || "",
      popular: !!service.badge,
    })),
  }));
}

export function getAllMegaMenuCategories(menu: MenuItem[]): Record<string, {
  name: string;
  description: string;
  icon: string;
  services: { name: string; href: string; icon?: string; popular?: boolean }[];
}[]> {
  const result: Record<string, { name: string; description: string; icon: string; services: { name: string; href: string; icon?: string; popular?: boolean }[] }[]> = {};
  const megaItems = menu.filter((item) => item.isMegaMenu && item.children && item.children.length > 0);
  for (const item of megaItems) {
    result[item.label] = (item.children || []).map((category) => ({
      name: category.categoryName || category.label,
      description: category.categoryDesc || "",
      icon: category.categoryIcon || "folder",
      services: (category.children || []).map((service) => ({
        name: service.label,
        href: service.url || "#",
        icon: service.icon || "",
        popular: !!service.badge,
      })),
    }));
  }
  return result;
}

export function getMainNavigation(menu: MenuItem[]): {
  name: string;
  href: string;
  hasDropdown: boolean;
  megaMenuColumns?: number;
  megaMenuContent?: unknown;
  simpleDropdown?: { name: string; href: string; icon?: string; translations?: Translations | null }[];
  translations?: Translations | null;
}[] {
  return menu
    .filter((item) => item.isVisible && !item.parentId)
    .map((item) => {
      const hasSimpleChildren =
        !item.isMegaMenu &&
        item.children &&
        item.children.length > 0;

      return {
        name: item.label,
        href: item.url || "#",
        hasDropdown: item.isMegaMenu,
        megaMenuColumns: item.megaMenuColumns ?? undefined,
        megaMenuContent: item.megaMenuContent ?? undefined,
        translations: item.translations ?? null,
        simpleDropdown: hasSimpleChildren
          ? item.children!
              .filter((c) => c.isVisible)
              .map((c) => ({ name: c.label, href: c.url || "#", icon: c.icon ?? undefined, translations: c.translations ?? null }))
          : undefined,
      };
    });
}
