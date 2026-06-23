"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Plus,
  X,
  Loader2,
  Search,
  Pencil,
  Check,
  Star,
  MapPin,
  Tag,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type VenueCategory = "wedding" | "party" | "specialty";
type BadgeColor = "purple" | "orange" | "green" | "";

const CATEGORY_TABS: { value: VenueCategory; labelKey: string; shortLabelKey: string; color: string }[] = [
  { value: "wedding", labelKey: "admin.venues.weddingVenues", shortLabelKey: "admin.venues.wedding", color: "text-violet-600 bg-violet-50 border-violet-200" },
  { value: "party", labelKey: "admin.venues.partyVenues", shortLabelKey: "admin.venues.party", color: "text-pink-600 bg-pink-50 border-pink-200" },
  { value: "specialty", labelKey: "admin.venues.specialtyVenues", shortLabelKey: "admin.venues.specialty", color: "text-amber-600 bg-amber-50 border-amber-200" },
];

const VENUE_TYPES: Record<VenueCategory, string[]> = {
  wedding: ["Banquet Hall", "Winery", "Garden", "Beach Venue", "Mansion", "Historic Estate", "Hotel", "Other"],
  party: ["Party Hall", "Conference Center", "Hotel", "Historic Venue", "Yacht & Boat", "Outdoor Venue", "Other"],
  specialty: ["Religious Venue", "Luxury Estate", "Destination Venue", "Unique Space", "Other"],
};

const BADGE_COLOR_OPTIONS: { value: BadgeColor; labelKey: string }[] = [
  { value: "", labelKey: "common.none" },
  { value: "purple", labelKey: "admin.venues.badgePurple" },
  { value: "orange", labelKey: "admin.venues.badgeOrange" },
  { value: "green", labelKey: "admin.venues.badgeGreen" },
];

interface Venue {
  id: string;
  name: string;
  slug: string;
  category: VenueCategory;
  type: string;
  location: string | null;
  city: string | null;
  rating: number;
  reviewCount: number;
  price: number | null;
  priceUnit: string;
  image: string | null;
  badge: string | null;
  badgeColor: string | null;
  tags: string[];
  href: string | null;
  description: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

type EditableField = "name" | "type" | "location" | "city" | "rating" | "reviewCount" | "price" | "priceUnit" | "badge" | "badgeColor" | "tags" | "image" | "href" | "sortOrder" | "isActive" | "isFeatured";

function InlineEdit({
  venue,
  field,
  onUpdate,
}: {
  venue: Venue;
  field: EditableField;
  onUpdate: (id: string, field: EditableField, value: unknown) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<string>(
    field === "tags"
      ? venue.tags.join(", ")
      : String(venue[field] ?? "")
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      let parsed: unknown = val;
      if (field === "rating") parsed = parseFloat(val) || 0;
      else if (field === "reviewCount" || field === "sortOrder") parsed = parseInt(val) || 0;
      else if (field === "price") parsed = val === "" ? null : parseInt(val) || null;
      else if (field === "tags") parsed = val.split(",").map((t) => t.trim()).filter(Boolean);
      await onUpdate(venue.id, field, parsed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const displayValue = () => {
    if (field === "tags") return venue.tags.join(", ") || "—";
    const v = venue[field];
    if (v === null || v === undefined || v === "") return "—";
    return String(v);
  };

  if (editing) {
    if (field === "type") {
      const types = VENUE_TYPES[venue.category] || [];
      return (
        <div className="flex items-center gap-1">
          <select
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="rounded border border-primary/40 bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={handleSave} disabled={saving} className="rounded p-0.5 text-[var(--ast-success-icon)] hover:bg-[var(--ast-success-bg)]">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setEditing(false)} className="rounded p-0.5 text-muted-foreground hover:bg-muted">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    if (field === "badgeColor") {
      return (
        <div className="flex items-center gap-1">
          <select
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="rounded border border-primary/40 bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {BADGE_COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
          </select>
          <button onClick={handleSave} disabled={saving} className="rounded p-0.5 text-[var(--ast-success-icon)] hover:bg-[var(--ast-success-bg)]">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setEditing(false)} className="rounded p-0.5 text-muted-foreground hover:bg-muted">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
          className="w-28 rounded border border-primary/40 bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button onClick={handleSave} disabled={saving} className="rounded p-0.5 text-[var(--ast-success-icon)] hover:bg-[var(--ast-success-bg)]">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button onClick={() => setEditing(false)} className="rounded p-0.5 text-muted-foreground hover:bg-muted">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setVal(field === "tags" ? venue.tags.join(", ") : String(venue[field] ?? "")); setEditing(true); }}
      className="flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors max-w-[140px] truncate"
      title={displayValue()}
    >
      <span className="truncate">{displayValue()}</span>
      <Pencil className="h-2.5 w-2.5 shrink-0 opacity-50" />
    </button>
  );
}

function AddVenueForm({
  category,
  onAdd,
}: {
  category: VenueCategory;
  onAdd: (data: Partial<Venue>) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [type, setType] = useState(VENUE_TYPES[category][0]);
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [badgeColor, setBadgeColor] = useState<BadgeColor>("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onAdd({
        name: trimmed,
        category,
        type,
        location: location.trim() || undefined,
        price: price ? parseInt(price) || undefined : undefined,
        badge: badge.trim() || undefined,
        badgeColor: badgeColor || undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setName("");
      setLocation("");
      setPrice("");
      setBadge("");
      setBadgeColor("");
      setTags("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-3 border-b border-border bg-muted/30 space-y-2">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder={t("admin.venues.namePlaceholder")}
          className="flex-1 min-w-0 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || saving}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {t("common.add")}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground px-1">{t("admin.venues.type")}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {VENUE_TYPES[category].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground px-1">{t("admin.venues.location")}</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("admin.venues.locationPlaceholder")}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground px-1">{t("admin.venues.price")}</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t("admin.venues.pricePlaceholder")}
            type="number"
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground px-1">{t("admin.venues.badgeText")}</label>
          <input
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder={t("admin.venues.badgePlaceholder")}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground px-1">{t("admin.venues.badgeColor")}</label>
          <select
            value={badgeColor}
            onChange={(e) => setBadgeColor(e.target.value as BadgeColor)}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {BADGE_COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
          </select>
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] text-muted-foreground px-1">{t("admin.venues.tags")}</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t("admin.venues.tagsPlaceholder")}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}

function VenueCard({
  venue,
  onDelete,
  onUpdate,
  onToggleActive,
  onToggleFeatured,
}: {
  venue: Venue;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, field: EditableField, value: unknown) => Promise<void>;
  onToggleActive: (id: string, value: boolean) => Promise<void>;
  onToggleFeatured: (id: string, value: boolean) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [deleting, setDeleting] = useState(false);

  const badgeColorMap: Record<string, string> = {
    purple: "bg-[var(--ast-hold-bg)] text-[var(--ast-hold-text)]",
    orange: "bg-[var(--ast-processing-bg)] text-[var(--ast-processing-text)]",
    green:  "bg-[var(--ast-success-bg)] text-[var(--ast-success-text)]",
  };

  return (
    <div className={`group rounded-lg border bg-background px-3 py-2.5 transition-colors hover:border-primary/20 hover:bg-primary/5 ${!venue.isActive ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-2">
        {/* Left: image thumbnail */}
        {venue.image ? (
          <img
            src={venue.image}
            alt={venue.name}
            className="h-10 w-14 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="h-10 w-14 shrink-0 rounded bg-muted flex items-center justify-center">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Middle: info */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-foreground truncate">{venue.name}</span>
            {venue.badge && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${venue.badgeColor && badgeColorMap[venue.badgeColor] || "bg-muted text-muted-foreground"}`}>
                {venue.badge}
              </span>
            )}
            {venue.isFeatured && (
              <span className="rounded-full bg-[var(--ast-warning-bg)] text-[var(--ast-warning-text)] px-1.5 py-0.5 text-[10px] font-semibold">{t("admin.venues.featured")}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Tag className="h-3 w-3" /> {venue.type}
            </span>
            {venue.location && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" /> {venue.location}
              </span>
            )}
            {venue.rating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-[var(--admin-star)] text-[var(--admin-star)]" /> {venue.rating}
              </span>
            )}
            {venue.price && (
              <span className="font-medium text-[var(--ast-processing-icon)]">{venue.price.toLocaleString()}{venue.priceUnit}</span>
            )}
          </div>
          {venue.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {venue.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="shrink-0 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={async () => { setDeleting(true); await onDelete(venue.id); }}
            disabled={deleting}
            className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Editable fields */}
      <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {([
            { field: "type" as EditableField, labelKey: "admin.venues.type" },
            { field: "location" as EditableField, labelKey: "admin.venues.location" },
            { field: "price" as EditableField, labelKey: "admin.venues.price" },
            { field: "badge" as EditableField, labelKey: "admin.venues.badge" },
            { field: "badgeColor" as EditableField, labelKey: "admin.venues.color" },
            { field: "rating" as EditableField, labelKey: "admin.venues.rating" },
            { field: "tags" as EditableField, labelKey: "admin.venues.tags" },
            { field: "image" as EditableField, labelKey: "admin.venues.image" },
          ]).map(({ field, labelKey }) => (
            <div key={field} className="flex items-center gap-1 min-w-0">
              <span className="text-[10px] text-muted-foreground/60 w-10 shrink-0">{t(labelKey)}</span>
              <InlineEdit venue={venue} field={field} onUpdate={onUpdate} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 pt-0.5">
          <button
            onClick={() => onToggleFeatured(venue.id, !venue.isFeatured)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${venue.isFeatured ? "bg-[var(--ast-warning-bg)] text-[var(--ast-warning-text)] hover:bg-[var(--ast-warning-border)]" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {venue.isFeatured ? t("admin.venues.starFeatured") : t("admin.venues.starFeature")}
          </button>
          <button
            onClick={() => onToggleActive(venue.id, !venue.isActive)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${venue.isActive ? "bg-[var(--ast-success-bg)] text-[var(--ast-success-text)] hover:bg-[var(--ast-success-border)]" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {venue.isActive ? t("common.active") : t("common.inactive")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VenuesPage() {
  const { t } = useLanguage();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<VenueCategory>("wedding");
  const [search, setSearch] = useState("");

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/venues");
      const data = await res.json();
      setVenues(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  async function handleAdd(data: Partial<Venue>) {
    const res = await fetch("/api/admin/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetchVenues();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/venues/${id}`, { method: "DELETE" });
    setVenues((prev) => prev.filter((v) => v.id !== id));
  }

  async function handleUpdate(id: string, field: EditableField, value: unknown) {
    const res = await fetch(`/api/admin/venues/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setVenues((prev) => prev.map((v) => (v.id === id ? updated : v)));
    }
  }

  async function handleToggleActive(id: string, value: boolean) {
    await handleUpdate(id, "isActive", value);
  }

  async function handleToggleFeatured(id: string, value: boolean) {
    await handleUpdate(id, "isFeatured", value);
  }

  const categorized = venues.filter((v) => v.category === activeCategory);
  const filtered = categorized.filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.type.toLowerCase().includes(search.toLowerCase())
  );

  const countByCategory = (cat: VenueCategory) => venues.filter((v) => v.category === cat).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ast-hold-bg)] border border-[var(--ast-hold-border)]">
              <Building2 className="h-5 w-5 text-[var(--admin-primary)]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground">{t("admin.nav.venues")}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("admin.venues.subtitle")}
              </p>
            </div>
          </div>
          {!loading && (
            <div className="shrink-0 rounded-xl bg-[var(--ast-hold-bg)] border border-[var(--ast-hold-border)] px-3 py-2 text-center">
              <p className="text-xl font-bold text-[var(--ast-hold-text)]">{venues.length}</p>
              <p className="text-xs text-muted-foreground">{t("admin.venues.totalVenues")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-border">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveCategory(tab.value); setSearch(""); }}
            className={`flex flex-1 sm:flex-none items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeCategory === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="sm:hidden">{t(tab.shortLabelKey)}</span>
            <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${activeCategory === tab.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {countByCategory(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Add form */}
        <AddVenueForm category={activeCategory} onAdd={handleAdd} />

        {/* Search */}
        {categorized.length > 5 && (
          <div className="px-4 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.venues.searchPlaceholder")}
                className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* List */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? t("admin.venues.noSearchResults") : t("admin.venues.empty")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onToggleActive={handleToggleActive}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
