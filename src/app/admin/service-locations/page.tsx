"use client";

import { useState, useEffect } from "react";
import { Plus, X, MapPin, Loader2, Info } from "lucide-react";

export default function ServiceLocationsPage() {
  const [cityInput, setCityInput] = useState("");
  const [cityList, setCityList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchCities() {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor-cities");
      const data = await res.json();
      setCityList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCities(); }, []);

  async function handleAddCity() {
    const trimmed = cityInput.trim();
    if (!trimmed) return;
    if (cityList.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setCityInput("");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/vendor-cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setCityInput("");
        fetchCities();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveCity(name: string) {
    await fetch("/api/vendor-cities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    fetchCities();
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Service Locations</h1>
              <p className="mt-0.5 text-sm text-primary-foreground/75">
                Define the cities where vendors can offer their services
              </p>
            </div>
          </div>
          {!loading && (
            <div className="shrink-0 rounded-xl bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{cityList.length}</p>
              <p className="text-xs text-primary-foreground/75">{cityList.length === 1 ? "City" : "Cities"}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — Add city */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-foreground">Add a City</h2>
            <p className="mb-4 text-xs text-muted-foreground">Type the city name and press Enter or click Add.</p>
            <div className="flex gap-2">
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCity(); } }}
                placeholder="e.g. Stockholm"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleAddCity}
                disabled={!cityInput.trim() || saving}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </button>
            </div>
          </div>

          {/* Info tip */}
          <div className="flex gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Cities added here appear as filter options on the public{" "}
              <strong className="text-foreground">Vendors</strong> page, helping customers find vendors by location.
            </p>
          </div>
        </div>

        {/* Right — City list */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Active Service Cities</h2>
              {!loading && cityList.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {cityList.length} {cityList.length === 1 ? "city" : "cities"}
                </span>
              )}
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : cityList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No cities added yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Add your first city using the form on the left.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {cityList.map((city, i) => (
                    <div
                      key={city.id}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:border-primary/20 hover:bg-primary/5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <div className="flex flex-1 items-center gap-2 min-w-0">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium text-foreground">{city.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCity(city.name)}
                        className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        title="Remove city"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
