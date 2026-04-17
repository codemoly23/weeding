"use client";

import Link from "next/link";
import { ChevronDown, LucideIcon, Folder } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Building2,
  FileText,
  ShoppingCart,
  MapPin,
  Landmark,
  Shield,
  BadgeCheck,
  Stamp,
  Calculator,
  FileCheck,
  ScrollText,
  Package,
  Sparkles,
  Target,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavigationProps, ServiceCategory } from "../types";

// Icon mapping for dynamic icons from database
const iconMap: Record<string, LucideIcon> = {
  "building-2": Building2,
  "building2": Building2,
  "file-text": FileText,
  "filetext": FileText,
  "shopping-cart": ShoppingCart,
  "shoppingcart": ShoppingCart,
  "map-pin": MapPin,
  "mappin": MapPin,
  landmark: Landmark,
  shield: Shield,
  "badge-check": BadgeCheck,
  "badgecheck": BadgeCheck,
  stamp: Stamp,
  calculator: Calculator,
  "file-check": FileCheck,
  "filecheck": FileCheck,
  "scroll-text": ScrollText,
  "scrolltext": ScrollText,
  package: Package,
  sparkles: Sparkles,
  target: Target,
  "alert-triangle": AlertTriangle,
  "alerttriangle": AlertTriangle,
  "book-open": BookOpen,
  "bookopen": BookOpen,
  folder: Folder,
};

function getIcon(iconName: string | undefined | null): LucideIcon {
  if (!iconName) return Folder;
  const normalizedName = iconName.toLowerCase().replace(/[-_\s]/g, "");
  return iconMap[normalizedName] || iconMap[iconName.toLowerCase()] || Folder;
}

interface MegaMenuProps {
  categories: ServiceCategory[];
}

function MegaMenuDropdown({ categories }: MegaMenuProps) {
  const { t } = useLanguage();
  return (
    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
      <div className="w-[800px] rounded-xl border bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-semibold text-foreground">{t("nav.ourServices")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("nav.servicesDesc")}
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("nav.viewAllServices")}
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {categories.map((category) => {
            const CategoryIcon = getIcon(category.icon);
            return (
              <div key={category.name}>
                <div className="mb-3 flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {category.name}
                  </h4>
                </div>
                <ul className="space-y-1">
                  {category.services.map((service) => (
                    <li key={service.name}>
                      <Link
                        href={service.href}
                        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <span className="flex-1">{service.name}</span>
                        {service.popular && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            Popular
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex items-center gap-4 border-t pt-4">
          <span className="text-sm text-muted-foreground">{t("nav.quickStart")}</span>
          <Link
            href="/register"
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {t("nav.startPlanningFree")}
          </Link>
          <Link
            href="/features/seating-chart"
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {t("nav.seatingChart")}
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
          >
            {t("nav.getInTouch")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Map of English nav item labels to translation keys
const NAV_LABEL_MAP: Record<string, string> = {
  "Home": "nav.home",
  "Services": "nav.services",
  "Pricing": "nav.pricing",
  "About": "nav.about",
  "Blog": "nav.blog",
  "Contact": "nav.contact",
  "Features": "nav.features",
  "Vendors": "nav.vendors",
};

export function Navigation({
  items,
  serviceCategories,
  hoveredItem,
  setHoveredItem,
  split = "all",
  styling,
}: NavigationProps) {
  const { t } = useLanguage();

  // Split navigation items if needed
  let displayItems = items;
  if (split === "left") {
    displayItems = items.slice(0, Math.ceil(items.length / 2));
  } else if (split === "right") {
    displayItems = items.slice(Math.ceil(items.length / 2));
  }

  // Custom colors from styling
  const hasCustomTextColor = !!styling?.textColor;
  const hasCustomHoverColor = !!styling?.hoverColor;

  return (
    <div className="flex items-center gap-x-8">
      {displayItems.map((item) => {
        const isHovered = hoveredItem === item.name;
        const label = NAV_LABEL_MAP[item.name] ? t(NAV_LABEL_MAP[item.name]) : item.name;

        // Determine text color
        const textStyle: React.CSSProperties = {};
        if (hasCustomTextColor || hasCustomHoverColor) {
          if (isHovered && hasCustomHoverColor) {
            textStyle.color = styling?.hoverColor;
          } else if (hasCustomTextColor) {
            textStyle.color = styling?.textColor;
          }
        }

        return (
          <div
            key={item.name}
            className="relative"
            onMouseEnter={() => setHoveredItem(item.name)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors",
                // Only use default classes if no custom colors
                !hasCustomTextColor && !hasCustomHoverColor && "text-muted-foreground hover:text-foreground",
                !hasCustomTextColor && !hasCustomHoverColor && isHovered && "text-foreground"
              )}
              style={textStyle}
            >
              {label}
              {item.hasDropdown && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isHovered && "rotate-180"
                  )}
                />
              )}
            </Link>

            {/* Mega Menu Dropdown */}
            {item.hasDropdown && isHovered && (
              <MegaMenuDropdown categories={serviceCategories} />
            )}
          </div>
        );
      })}
    </div>
  );
}
