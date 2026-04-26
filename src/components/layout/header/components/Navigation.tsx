"use client";

import Link from "next/link";
import { ChevronDown, LucideIcon, Folder } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Building2, FileText, ShoppingCart, MapPin, Landmark, Shield,
  BadgeCheck, Stamp, Calculator, FileCheck, ScrollText, Package,
  Sparkles, Target, AlertTriangle, BookOpen,
  Heart, Wine, Trees, Waves, Home, PartyPopper, Briefcase, Hotel,
  Ship, Gem, Plane, Store, Users, Globe, LayoutGrid, Ticket,
  Camera, Music, Utensils, UtensilsCrossed, Flower2, Star, Search,
  Disc, Palette, ClipboardList, Video, User,
  Calendar, Shirt, HeartHandshake, Activity, MessageCircle,
  HelpCircle, Gift, MessageSquare, Image, Settings,
  Car, Ring,
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
  heart: Heart,
  wine: Wine,
  trees: Trees,
  waves: Waves,
  home: Home,
  "party-popper": PartyPopper,
  partypopper: PartyPopper,
  briefcase: Briefcase,
  hotel: Hotel,
  ship: Ship,
  gem: Gem,
  plane: Plane,
  store: Store,
  users: Users,
  globe: Globe,
  "layout-grid": LayoutGrid,
  layoutgrid: LayoutGrid,
  ticket: Ticket,
  camera: Camera,
  music: Music,
  utensils: Utensils,
  "flower-2": Flower2,
  flower2: Flower2,
  star: Star,
  search: Search,
  disc: Disc,
  palette: Palette,
  "clipboard-list": ClipboardList,
  clipboardlist: ClipboardList,
  video: Video,
  user: User,
  calendar: Calendar,
  shirt: Shirt,
  "heart-handshake": HeartHandshake,
  hearthandshake: HeartHandshake,
  activity: Activity,
  "message-circle": MessageCircle,
  messagecircle: MessageCircle,
  "help-circle": HelpCircle,
  helpcircle: HelpCircle,
  gift: Gift,
  "message-square": MessageSquare,
  messagesquare: MessageSquare,
  image: Image,
  settings: Settings,
};

function getIcon(iconName: string | undefined | null): LucideIcon {
  if (!iconName) return Folder;
  const normalizedName = iconName.toLowerCase().replace(/[-_\s]/g, "");
  return iconMap[normalizedName] || iconMap[iconName.toLowerCase()] || Folder;
}

interface MegaMenuProps {
  categories: ServiceCategory[];
  columns?: number;
  richContent?: unknown;
}

function MegaMenuDropdown({ categories, columns, richContent }: MegaMenuProps) {
  // Forums grid layout
  if (richContent && typeof richContent === "object" && (richContent as Record<string, unknown>).type === "forums-grid") {
    const content = richContent as {
      type: string;
      header?: string;
      groups?: { title: string; items: { name: string; icon?: string; href: string }[] }[];
      sidebar?: { title: string; items: { name: string; icon?: string; href: string }[] };
    };
    const hasSidebar = content.sidebar && content.sidebar.items && content.sidebar.items.length > 0;
    return (
      <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
        <div className="rounded-xl border bg-white p-6 shadow-xl w-[900px]">
          {content.header && (
            <h4 className="mb-4 text-base font-bold text-foreground">{content.header}</h4>
          )}
          <div className="flex gap-6">
            {/* Groups */}
            <div className="flex-1 space-y-5">
              {content.groups?.map((group, gi) => (
                <div key={gi}>
                  {group.title && (
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-1">
                    {group.items.map((item) => {
                      const ItemIcon = getIcon(item.icon);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <ItemIcon className="h-4 w-4 text-foreground" />
                          </span>
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {/* Sidebar */}
            {hasSidebar && (
              <div className="w-52 shrink-0 border-l border-border pl-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {content.sidebar!.title}
                </p>
                <ul className="space-y-1">
                  {content.sidebar!.items.map((item) => {
                    const ItemIcon = getIcon(item.icon);
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <ItemIcon className="h-3.5 w-3.5 text-foreground" />
                          </span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Ideas grid layout — 2-column layout (text-only or with icons)
  if (richContent && typeof richContent === "object" && (richContent as Record<string, unknown>).type === "ideas-grid") {
    const content = richContent as {
      type: string;
      header?: string;
      columns: { title: string; items: { name: string; icon?: string; href: string }[] }[];
    };
    // Detect if any item in any column has an icon
    const hasIcons = content.columns?.some((col) => col.items?.some((i) => i.icon));
    return (
      <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
        <div className="rounded-xl border bg-white p-6 shadow-xl w-[520px]">
          {content.header && (
            <h4 className="mb-4 text-base font-bold text-foreground">{content.header}</h4>
          )}
          <div className="grid grid-cols-2 gap-8">
            {content.columns?.map((col, ci) => (
              <div key={ci}>
                {col.title && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {col.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {col.items?.map((item) => (
                    <li key={item.name}>
                      {hasIcons ? (
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                            {(() => { const I = getIcon(item.icon); return <I className="h-4 w-4 text-foreground/70" />; })()}
                          </span>
                          <span>{item.name}</span>
                        </Link>
                      ) : (
                        <Link
                          href={item.href}
                          className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Featured gallery layout (Dresses-style)
  if (richContent && typeof richContent === "object" && (richContent as Record<string, unknown>).type === "featured-gallery") {
    const content = richContent as {
      type: string;
      sectionHeader?: string;
      topLinks?: { name: string; icon?: string; href: string }[];
      featuredLink?: { text: string; href: string };
      footerLink?: { text: string; href: string };
      gallery?: {
        title?: string;
        aspectRatio?: "portrait" | "square";
        items: { name: string; imageUrl: string; href: string }[];
      };
    };
    return (
      <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
        <div className="rounded-xl border bg-white p-6 shadow-xl" style={{ width: "clamp(380px, 50vw, 900px)" }}>
          {content.sectionHeader && (
            <h4 className="mb-4 text-base font-bold text-foreground">
              {content.sectionHeader}
            </h4>
          )}
          {content.topLinks && content.topLinks.length > 0 && (
            <div className="mb-3 flex flex-col gap-0.5">
              {content.topLinks.map((link) => {
                if (link.icon) {
                  const LinkIcon = getIcon(link.icon);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <LinkIcon className="h-4 w-4 text-foreground" />
                      </span>
                      <span>{link.name}</span>
                    </Link>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}
          {content.featuredLink && (
            <div className="mb-4">
              <Link href={content.featuredLink.href} className="text-sm font-medium" style={{ color: "#9810fa" }}>
                {content.featuredLink.text}
              </Link>
            </div>
          )}
          {content.gallery && (
            <div>
              {content.gallery.title && (
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {content.gallery.title}
                </p>
              )}
              {(() => {
                const cols = Math.min(content.gallery!.items.length, 5);
                const gridCols = cols === 5 ? "grid-cols-5" : cols === 4 ? "grid-cols-4" : cols === 3 ? "grid-cols-3" : "grid-cols-2";
                const aspectClass = content.gallery!.aspectRatio === "square" ? "aspect-square" : "aspect-[3/4]";
                return (
                  <div className={`grid ${gridCols} gap-4`}>
                    {content.gallery!.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="group flex flex-col gap-2"
                      >
                        <div className={`overflow-hidden rounded-lg border border-border bg-muted ${aspectClass}`}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center p-2 text-center text-xs font-semibold text-foreground/60 leading-tight">
                              {item.name}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
          {content.footerLink && (
            <div className="mt-4 pt-3 border-t border-border">
              <Link href={content.footerLink.href} className="text-sm font-medium" style={{ color: "#9810fa" }}>
                {content.footerLink.text}
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Use vendors-style only when no explicit column count is set by admin
  const iconCategories = categories.filter((c) => c.services.some((s) => s.icon));
  const tagCategories = categories.filter((c) => c.services.every((s) => !s.icon));
  const isVendorsStyle = columns !== 2 && iconCategories.length >= 1 && tagCategories.length >= 1;

  if (isVendorsStyle) {
    return (
      <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
        <div className="rounded-xl border bg-white p-6 shadow-xl w-[700px]">
          {iconCategories.map((category) => (
            <div key={category.name}>
              {category.name && (
                <h4 className="mb-4 text-base font-semibold text-foreground">
                  {category.name}
                </h4>
              )}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {category.services.map((service) => {
                  const ServiceIcon = getIcon(service.icon);
                  return (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <ServiceIcon className="h-4 w-4 text-foreground" />
                      </span>
                      <span>{service.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {tagCategories.map((category) => (
            <div key={category.name}>
              <hr className="my-4 border-border" />
              {category.name && (
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {category.name}
                </p>
              )}
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {category.services.map((service) => (
                  <Link
                    key={service.name}
                    href={service.href}
                    className={cn(
                      "text-sm text-muted-foreground transition-colors hover:text-foreground",
                      service.popular && "font-bold text-foreground"
                    )}
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cols = columns ?? categories.length;
  const gridCols = cols >= 4 ? "grid-cols-4" : cols === 3 ? "grid-cols-3" : cols === 2 ? "grid-cols-2" : "grid-cols-1";
  const width = cols >= 4 ? "w-[1050px]" : cols === 3 ? "w-[820px]" : cols === 2 ? "w-[580px]" : "w-[280px]";
  const hasSidebar = cols >= 4;

  // Section header: only first category has a name — render it full-width above grid
  const sectionHeader = categories[0]?.name && categories.slice(1).every((c) => !c.name)
    ? categories[0].name
    : null;

  return (
    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
      <div className={`rounded-xl border bg-white p-6 shadow-xl ${width}`}>
        {sectionHeader && (
          <h4 className="mb-4 text-base font-semibold text-foreground">{sectionHeader}</h4>
        )}
        <div className={`grid gap-8 ${gridCols}`}>
          {categories.map((category, idx) => {
            const isSidebarCol = hasSidebar && idx === categories.length - 1;
            return (
              <div
                key={category.name || idx}
                className={isSidebarCol ? "pl-6 border-l border-border" : ""}
              >
                {!sectionHeader && category.name && (
                  isSidebarCol ? (
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {category.name}
                    </p>
                  ) : (
                    <h4 className="mb-3 text-sm font-bold text-foreground">
                      {category.name}
                    </h4>
                  )
                )}
                <ul className="space-y-1">
                  {category.services.map((service) => {
                    const hasIcon = !!service.icon;
                    const ServiceIcon = hasIcon ? getIcon(service.icon) : null;
                    return (
                      <li key={service.name}>
                        <Link
                          href={service.href}
                          className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {hasIcon && ServiceIcon && (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <ServiceIcon className="h-4 w-4 text-foreground" />
                            </span>
                          )}
                          <span>{service.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
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
  allServiceCategories,
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

  // Consistent nav colors — always resolved, never conditional
  const navColor = styling?.textColor || "#1e293b";
  const navHoverColor = styling?.hoverColor || "#f97316";

  return (
    <div className="flex items-center gap-x-8">
      {displayItems.map((item) => {
        const isHovered = hoveredItem === item.name;
        const label = NAV_LABEL_MAP[item.name] ? t(NAV_LABEL_MAP[item.name]) : item.name;

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
                "flex items-center gap-1 font-sans text-sm font-medium transition-colors"
              )}
              style={{ color: isHovered ? navHoverColor : navColor }}
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
              <MegaMenuDropdown
                categories={allServiceCategories?.[item.name] || serviceCategories}
                columns={item.megaMenuColumns}
                richContent={item.megaMenuContent}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
