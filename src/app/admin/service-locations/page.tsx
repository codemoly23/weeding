"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, X, MapPin, Briefcase, Building2, Loader2, Search, Pencil, Check, Globe } from "lucide-react";

type OptionType = "PLACE" | "SERVICE" | "LOCATION";
type LocationGroup = "Sweden" | "International";
type Option = { id: string; name: string; type: OptionType; icon?: string | null; group?: string | null };

interface SectionConfig {
  type: OptionType;
  title: string;
  description: string;
  placeholder: string;
  icon: React.ReactNode;
  color: string;
}

const SECTIONS: SectionConfig[] = [
  {
    type: "PLACE",
    title: "Place",
    description: "Venue types and places (e.g. Garden, Ballroom, Beach)",
    placeholder: "e.g. Outdoor Garden",
    icon: <Building2 className="h-5 w-5" />,
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
  {
    type: "SERVICE",
    title: "Service",
    description: "Service categories (e.g. Photography, Catering, DJ)",
    placeholder: "e.g. Photography",
    icon: <Briefcase className="h-5 w-5" />,
    color: "text-pink-600 bg-pink-50 border-pink-200",
  },
];

function IconEditCell({ opt, onUpdate }: { opt: Option; onUpdate: (id: string, icon: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(opt.icon ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdate(opt.id, val.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
          placeholder="icon name"
          className="w-28 rounded border border-primary/40 bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded p-0.5 text-green-600 hover:bg-green-50"
        >
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
      onClick={() => { setVal(opt.icon ?? ""); setEditing(true); }}
      title="Edit icon"
      className="flex items-center gap-1 shrink-0 rounded px-1.5 py-0.5 text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {opt.icon ? (
        <span className="text-violet-600">{opt.icon}</span>
      ) : (
        <span className="text-muted-foreground/50 italic">icon</span>
      )}
      <Pencil className="h-2.5 w-2.5 opacity-50" />
    </button>
  );
}

function Section({ config, options, onAdd, onDelete, onUpdateIcon, loading }: {
  config: SectionConfig;
  options: Option[];
  onAdd: (type: OptionType, name: string, icon?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateIcon: (id: string, icon: string) => Promise<void>;
  loading: boolean;
}) {
  const [input, setInput] = useState("");
  const [iconInput, setIconInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onAdd(config.type, trimmed, iconInput.trim() || undefined);
      setInput("");
      setIconInput("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-border`}>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${config.color}`}>
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{config.title}</h2>
          <p className="text-xs text-muted-foreground truncate">{config.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {options.length}
        </span>
      </div>

      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex gap-2 mb-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            placeholder={config.placeholder}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim() || saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add
          </button>
        </div>
        <input
          value={iconInput}
          onChange={(e) => setIconInput(e.target.value)}
          placeholder="Icon name (optional, e.g. Heart, Home, Hotel)"
          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {options.length > 5 && (
        <div className="px-4 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      )}

      <div className="p-4 max-h-72 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-xs text-muted-foreground">
              {search ? "No matches found" : `No ${config.title.toLowerCase()} options yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((opt) => (
              <div
                key={opt.id}
                className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:border-primary/20 hover:bg-primary/5"
              >
                <IconEditCell opt={opt} onUpdate={onUpdateIcon} />
                <span className="flex-1 text-sm text-foreground truncate">{opt.name}</span>
                <button
                  onClick={() => onDelete(opt.id)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LocationSection({ options, onAdd, onDelete, onUpdateIcon, loading }: {
  options: Option[];
  onAdd: (type: OptionType, name: string, icon?: string, group?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateIcon: (id: string, icon: string) => Promise<void>;
  loading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<LocationGroup>("Sweden");
  const [input, setInput] = useState("");
  const [iconInput, setIconInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const sweden = options.filter((o) => o.group === "Sweden");
  const international = options.filter((o) => o.group === "International");
  const tabOptions = activeTab === "Sweden" ? sweden : international;

  const filtered = tabOptions.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onAdd("LOCATION", trimmed, iconInput.trim() || undefined, activeTab);
      setInput("");
      setIconInput("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border text-blue-600 bg-blue-50 border-blue-200">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground">Location</h2>
          <p className="text-xs text-muted-foreground truncate">Cities and regions grouped by Sweden &amp; International</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {options.length}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["Sweden", "International"] as LocationGroup[]).map((tab) => {
          const count = tab === "Sweden" ? sweden.length : international.length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearch(""); }}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "Sweden" ? (
                <MapPin className="h-3.5 w-3.5" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
              {tab}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add input */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex gap-2 mb-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            placeholder={activeTab === "Sweden" ? "e.g. Stockholm" : "e.g. London, UK"}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim() || saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add to {activeTab}
          </button>
        </div>
        <input
          value={iconInput}
          onChange={(e) => setIconInput(e.target.value)}
          placeholder={`Icon name (optional, e.g. ${activeTab === "Sweden" ? "MapPin" : "Globe"})`}
          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Search */}
      {tabOptions.length > 5 && (
        <div className="px-4 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="p-4 max-h-72 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-xs text-muted-foreground">
              {search ? "No matches found" : `No ${activeTab} locations yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((opt) => (
              <div
                key={opt.id}
                className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:border-primary/20 hover:bg-primary/5"
              >
                <IconEditCell opt={opt} onUpdate={onUpdateIcon} />
                <span className="flex-1 text-sm text-foreground truncate">{opt.name}</span>
                <button
                  onClick={() => onDelete(opt.id)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServiceLocationsPage() {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/search-options");
      const data = await res.json();
      setOptions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  async function handleAdd(type: OptionType, name: string, icon?: string, group?: string) {
    const res = await fetch("/api/admin/search-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, icon, group }),
    });
    if (res.ok) await fetchOptions();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/search-options/${id}`, { method: "DELETE" });
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }

  async function handleUpdateIcon(id: string, icon: string) {
    const res = await fetch(`/api/admin/search-options/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, icon: updated.icon } : o)));
    }
  }

  const total = options.length;
  const byType = (type: OptionType) => options.filter((o) => o.type === type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Search Options</h1>
              <p className="mt-0.5 text-sm text-primary-foreground/75">
                Manage Place, Service, and Location options shown in the homepage search bar
              </p>
            </div>
          </div>
          {!loading && (
            <div className="shrink-0 rounded-xl bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-primary-foreground/75">Total options</p>
            </div>
          )}
        </div>
      </div>

      {/* 3 Sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {SECTIONS.map((config) => (
          <Section
            key={config.type}
            config={config}
            options={byType(config.type)}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onUpdateIcon={handleUpdateIcon}
            loading={loading}
          />
        ))}
        <LocationSection
          options={byType("LOCATION")}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onUpdateIcon={handleUpdateIcon}
          loading={loading}
        />
      </div>
    </div>
  );
}
