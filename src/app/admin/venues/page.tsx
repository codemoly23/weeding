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

type VenueCategory = "wedding" | "party" | "specialty";
type BadgeColor = "purple" | "orange" | "green" | "";

const CATEGORY_TABS: { value: VenueCategory; label: string; color: string }[] = [
  { value: "wedding", label: "Wedding Venues", color: "text-violet-600 bg-violet-50 border-violet-200" },
  { value: "party", label: "Party & Event Venues", color: "text-pink-600 bg-pink-50 border-pink-200" },
  { value: "specialty", label: "Specialty Venues", color: "text-amber-600 bg-amber-50 border-amber-200" },
];

const VENUE_TYPES: Record<VenueCategory, string[]> = {
  wedding: ["Banquet Hall", "Winery", "Garden", "Beach Venue", "Mansion", "Historic Estate", "Hotel", "Other"],
  party: ["Party Hall", "Conference Center", "Hotel", "Historic Venue", "Yacht & Boat", "Outdoor Venue", "Other"],
  specialty: ["Religious Venue", "Luxury Estate", "Destination Venue", "Unique Space", "Other"],
};

const BADGE_COLOR_OPTIONS: { value: BadgeColor; label: string }[] = [
  { value: "", label: "None" },
  { value: "purple", label: "Purple (Popular)" },
  { value: "orange", label: "Orange (Featured)" },
  { value: "green", label: "Green (New)" },
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
          <button onClick={handleSave} disabled={saving} className="rounded p-0.5 text-green-600 hover:bg-green-50">
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
            {BADGE_COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={handleSave} disabled={saving} className="rounded p-0.5 text-green-600 hover:bg-green-50">
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
        <button onClick={handleSave} disabled={saving} className="rounded p-0.5 text-green-600 hover:bg-green-50">
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
          placeholder="Venue name (e.g. Grand Ballroom)"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || saving}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {VENUE_TYPES[category].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (e.g. Stockholm, SE)"
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (e.g. 15000)"
          type="number"
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder="Badge text (e.g. Popular)"
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={badgeColor}
          onChange={(e) => setBadgeColor(e.target.value as BadgeColor)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {BADGE_COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags: Up to 300, Indoor, etc."
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
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
  const [deleting, setDeleting] = useState(false);

  const badgeColorMap: Record<string, string> = {
    purple: "bg-violet-100 text-violet-700",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
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
              <span className="rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[10px] font-semibold">Featured</span>
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
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {venue.rating}
              </span>
            )}
            {venue.price && (
              <span className="font-medium text-pink-600">{venue.price.toLocaleString()}{venue.priceUnit}</span>
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

      {/* Editable fields row */}
      <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-x-3 gap-y-1 items-center">
        <InlineEdit venue={venue} field="type" onUpdate={onUpdate} />
        <InlineEdit venue={venue} field="location" onUpdate={onUpdate} />
        <InlineEdit venue={venue} field="price" onUpdate={onUpdate} />
        <InlineEdit venue={venue} field="badge" onUpdate={onUpdate} />
        <InlineEdit venue={venue} field="badgeColor" onUpdate={onUpdate} />
        <InlineEdit venue={venue} field="tags" onUpdate={onUpdate} />
        <InlineEdit venue={venue} field="rating" onUpdate={onUpdate} />
        <InlineEdit venue={venue} field="image" onUpdate={onUpdate} />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onToggleFeatured(venue.id, !venue.isFeatured)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${venue.isFeatured ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {venue.isFeatured ? "★ Featured" : "☆ Feature"}
          </button>
          <button
            onClick={() => onToggleActive(venue.id, !venue.isActive)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${venue.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {venue.isActive ? "Active" : "Inactive"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VenuesPage() {
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
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Venues</h1>
              <p className="mt-0.5 text-sm text-white/75">
                Manage wedding, party, and specialty venues shown across the platform
              </p>
            </div>
          </div>
          {!loading && (
            <div className="shrink-0 rounded-xl bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{venues.length}</p>
              <p className="text-xs text-white/75">Total venues</p>
            </div>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 border-b border-border">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveCategory(tab.value); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeCategory === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
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
                placeholder="Search venues..."
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
                {search ? "No venues match your search" : "No venues yet — add one above"}
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
