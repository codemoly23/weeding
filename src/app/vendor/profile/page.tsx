"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { value: "VENUE", label: "Venue", emoji: "🏛️" },
  { value: "PHOTOGRAPHY", label: "Photography", emoji: "📸" },
  { value: "VIDEOGRAPHY", label: "Videography", emoji: "🎥" },
  { value: "CATERING", label: "Catering", emoji: "🍽️" },
  { value: "MUSIC_DJ", label: "Music & DJ", emoji: "🎵" },
  { value: "FLOWERS", label: "Flowers", emoji: "💐" },
  { value: "DRESS_ATTIRE", label: "Dress & Attire", emoji: "👗" },
  { value: "RINGS", label: "Rings", emoji: "💍" },
  { value: "DECORATIONS", label: "Decorations", emoji: "✨" },
  { value: "TRANSPORTATION", label: "Transportation", emoji: "🚗" },
  { value: "HAIR_MAKEUP", label: "Hair & Makeup", emoji: "💄" },
  { value: "WEDDING_PLANNER", label: "Wedding Planner", emoji: "📋" },
  { value: "OTHER", label: "Other", emoji: "🎊" },
];

interface FaqItem {
  question: string;
  answer: string;
}

interface ProfileData {
  businessName: string;
  category: string;
  tagline: string;
  description: string;
  city: string;
  country: string;
  lat: string;
  lng: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  pinterest: string;
  slaHours: string;
  priceMin: string;
  priceMax: string;
  currency: string;
  languages: string[];
  photos: string[];
  isAvailable: boolean;
  status: string;
  faqItems: FaqItem[];
}

const defaultProfile: ProfileData = {
  businessName: "",
  category: "OTHER",
  tagline: "",
  description: "",
  city: "",
  country: "",
  lat: "",
  lng: "",
  phone: "",
  website: "",
  instagram: "",
  facebook: "",
  pinterest: "",
  slaHours: "",
  priceMin: "",
  priceMax: "",
  currency: "USD",
  languages: [],
  photos: [],
  isAvailable: true,
  status: "PENDING",
  faqItems: [],
};

const COMMON_LANGUAGES = [
  "Swedish", "English", "Arabic", "French", "Spanish",
  "German", "Italian", "Portuguese", "Turkish", "Urdu",
  "Hindi", "Bengali", "Malay", "Chinese", "Japanese",
];

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Availability calendar state
  const [calMonth, setCalMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [availability, setAvailability] = useState<{ date: string; status: string; note: string | null }[]>([]);
  const [calSaving, setCalSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vendor/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile({
            ...defaultProfile,
            ...data.profile,
            priceMin: data.profile.startingPrice?.toString() ?? "",
            priceMax: data.profile.maxPrice?.toString() ?? "",
            slaHours: data.profile.slaHours?.toString() ?? "",
            lat: data.profile.lat?.toString() ?? "",
            lng: data.profile.lng?.toString() ?? "",
            photos: data.profile.photos ?? [],
            instagram: data.profile.instagram ?? "",
            facebook: data.profile.facebook ?? "",
            pinterest: data.profile.pinterest ?? "",
            faqItems: data.profile.faqItems ?? [],
            languages: data.profile.languages ?? [],
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load availability for current calendar month
  useEffect(() => {
    const y = calMonth.getFullYear();
    const m = String(calMonth.getMonth() + 1).padStart(2, "0");
    fetch(`/api/vendor/availability?month=${y}-${m}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.availability) setAvailability(data.availability);
      })
      .catch(() => {});
  }, [calMonth]);

  function set(field: keyof ProfileData, value: unknown) {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
  }

  async function handleCalendarClick(dateStr: string) {
    const existing = availability.find((a) => a.date.slice(0, 10) === dateStr);
    const statuses = ["AVAILABLE", "BOOKED", "TENTATIVE"] as const;
    let nextStatus: string;
    if (!existing) {
      nextStatus = "AVAILABLE";
    } else {
      const idx = statuses.indexOf(existing.status as typeof statuses[number]);
      if (idx === statuses.length - 1) {
        // Remove entry
        setCalSaving(dateStr);
        await fetch("/api/vendor/availability", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr }),
        });
        setAvailability((prev) => prev.filter((a) => a.date.slice(0, 10) !== dateStr));
        setCalSaving(null);
        return;
      }
      nextStatus = statuses[idx + 1];
    }
    setCalSaving(dateStr);
    const res = await fetch("/api/vendor/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr, status: nextStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setAvailability((prev) => {
        const filtered = prev.filter((a) => a.date.slice(0, 10) !== dateStr);
        return [...filtered, data.entry];
      });
    }
    setCalSaving(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          priceMin: profile.priceMin ? parseFloat(profile.priceMin) : null,
          priceMax: profile.priceMax ? parseFloat(profile.priceMax) : null,
          slaHours: profile.slaHours ? parseInt(profile.slaHours) : null,
          lat: profile.lat ? parseFloat(profile.lat) : null,
          lng: profile.lng ? parseFloat(profile.lng) : null,
          faqItems: profile.faqItems,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Keep your business information up to date to attract more clients
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <Section title="Business Information">
          <Field label="Business Name" required>
            <input
              type="text"
              value={profile.businessName}
              onChange={(e) => set("businessName", e.target.value)}
              className="input"
              required
              placeholder="Your Wedding Business"
            />
          </Field>
          <Field label="Tagline">
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className="input"
              placeholder="A short catchy phrase about your business"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={profile.description}
              onChange={(e) => set("description", e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Tell couples what makes your business special..."
            />
          </Field>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => set("category", cat.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all
                    ${profile.category === cat.value
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="City" required>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => set("city", e.target.value)}
                className="input"
                required
                placeholder="Dhaka"
              />
            </Field>
            <Field label="Country" required>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => set("country", e.target.value)}
                className="input"
                required
                placeholder="Bangladesh"
              />
            </Field>
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                value={profile.lat}
                onChange={(e) => set("lat", e.target.value)}
                className="input"
                placeholder="23.8103"
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                value={profile.lng}
                onChange={(e) => set("lng", e.target.value)}
                className="input"
                placeholder="90.4125"
              />
            </Field>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Latitude &amp; Longitude are used to show your business on the map view. Find yours at{" "}
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">maps.google.com</a>
            {" "}— right-click any location and copy the coordinates.
          </p>
        </Section>

        {/* Contact */}
        <Section title="Contact & Social">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone">
              <input
                type="tel"
                value={profile.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
                className="input"
                placeholder="+1 555 000 0000"
              />
            </Field>
            <Field label="Website">
              <input
                type="url"
                value={profile.website ?? ""}
                onChange={(e) => set("website", e.target.value)}
                className="input"
                placeholder="https://yourbusiness.com"
              />
            </Field>
            <Field label="Instagram">
              <input
                type="text"
                value={profile.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                className="input"
                placeholder="@yourhandle"
              />
            </Field>
            <Field label="Facebook">
              <input
                type="text"
                value={profile.facebook}
                onChange={(e) => set("facebook", e.target.value)}
                className="input"
                placeholder="facebook.com/yourpage"
              />
            </Field>
            <Field label="Pinterest">
              <input
                type="text"
                value={profile.pinterest}
                onChange={(e) => set("pinterest", e.target.value)}
                className="input"
                placeholder="pinterest.com/yourboard"
              />
            </Field>
          </div>
        </Section>

        {/* Languages */}
        <Section title="Languages Spoken">
          <div className="flex flex-wrap gap-2">
            {COMMON_LANGUAGES.map((lang) => {
              const selected = profile.languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => set(
                    "languages",
                    selected
                      ? profile.languages.filter((l) => l !== lang)
                      : [...profile.languages, lang]
                  )}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Pricing & Response Time */}
        <Section title="Pricing & Response Time">
          <div className="grid sm:grid-cols-4 gap-4">
            <Field label="Response Time (hours)">
              <input
                type="number"
                value={profile.slaHours}
                onChange={(e) => set("slaHours", e.target.value)}
                className="input"
                placeholder="24"
                min="1"
                max="168"
              />
            </Field>
            <Field label="Minimum Price">
              <input
                type="number"
                value={profile.priceMin}
                onChange={(e) => set("priceMin", e.target.value)}
                className="input"
                placeholder="500"
                min="0"
              />
            </Field>
            <Field label="Maximum Price">
              <input
                type="number"
                value={profile.priceMax}
                onChange={(e) => set("priceMax", e.target.value)}
                className="input"
                placeholder="5000"
                min="0"
              />
            </Field>
            <Field label="Currency">
              <select
                value={profile.currency}
                onChange={(e) => set("currency", e.target.value)}
                className="input"
              >
                <option value="SEK">SEK (kr)</option>
                <option value="USD">USD ($)</option>
                <option value="BDT">BDT (৳)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Availability */}
        <Section title="Availability">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isAvailable}
              onChange={(e) => set("isAvailable", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Currently accepting bookings</span>
              <p className="text-xs text-gray-500">Uncheck to hide your profile from search results</p>
            </div>
          </label>
        </Section>

        {/* Calendar availability */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Calendar Availability</h2>
          <p className="text-xs text-gray-500 mb-4">Click a date to cycle: blank → Available → Booked → Tentative → blank</p>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button type="button" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} className="text-xs text-gray-400 font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const year = calMonth.getFullYear();
              const month = calMonth.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
              const statusColor: Record<string, string> = {
                AVAILABLE: "bg-emerald-100 text-emerald-800",
                BOOKED: "bg-red-100 text-red-700",
                TENTATIVE: "bg-amber-100 text-amber-800",
              };
              return cells.map((day, idx) => {
                if (!day) return <div key={idx} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const entry = availability.find((a) => a.date.slice(0, 10) === dateStr);
                const isSaving = calSaving === dateStr;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleCalendarClick(dateStr)}
                    disabled={isSaving}
                    title={entry?.status ?? "Click to mark"}
                    className={`rounded-lg py-1.5 text-xs text-center transition-all cursor-pointer select-none ${
                      entry ? statusColor[entry.status] : "text-gray-600 hover:bg-gray-100"
                    } ${isSaving ? "opacity-50" : ""}`}
                  >
                    {day}
                  </button>
                );
              });
            })()}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 inline-block" />Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 inline-block" />Booked</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 inline-block" />Tentative</span>
          </div>
        </div>

        {/* FAQ Editor */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">FAQ</h2>
          <p className="text-xs text-gray-500 mb-4">Add frequently asked questions shown on your public profile.</p>
          <div className="space-y-3">
            {profile.faqItems.map((item, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const updated = [...profile.faqItems];
                      updated[idx] = { ...item, question: e.target.value };
                      set("faqItems", updated);
                    }}
                    placeholder="Question"
                    className="input flex-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => set("faqItems", profile.faqItems.filter((_, j) => j !== idx))}
                    className="mt-0.5 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={item.answer}
                  onChange={(e) => {
                    const updated = [...profile.faqItems];
                    updated[idx] = { ...item, answer: e.target.value };
                    set("faqItems", updated);
                  }}
                  placeholder="Answer"
                  rows={2}
                  className="input text-sm resize-none"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("faqItems", [...profile.faqItems, { question: "", answer: "" }])}
              className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              <Plus className="w-4 h-4" /> Add FAQ item
            </button>
          </div>
        </div>

        {/* Photos */}
        <Section title="Photos">
          <p className="text-xs text-gray-500 -mt-2">The first photo will be your cover image in the vendor directory and planner page.</p>
          <div className="space-y-3">
            {profile.photos.map((url, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="h-16 w-24 object-cover rounded-lg border flex-shrink-0" onError={(e) => (e.currentTarget.style.display = "none")} />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      className="input"
                      value={url.startsWith("data:") ? "" : url}
                      placeholder="https://example.com/photo.jpg"
                      onChange={(e) => {
                        const updated = [...profile.photos];
                        updated[i] = e.target.value;
                        set("photos", updated);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">or</span>
                      <label className="cursor-pointer text-xs text-purple-600 border border-purple-300 rounded px-3 py-1 hover:bg-purple-50 transition">
                        Upload from device
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const updated = [...profile.photos];
                              updated[i] = ev.target?.result as string;
                              set("photos", updated);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => set("photos", profile.photos.filter((_, j) => j !== i))}
                        className="text-xs text-red-400 hover:text-red-600"
                      >Remove</button>
                    </div>
                  </div>
                </div>
                {i === 0 && <p className="text-[10px] text-purple-500 font-medium">★ Cover image</p>}
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("photos", [...profile.photos, ""])}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              + Add photo
            </button>
          </div>
        </Section>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Changes saved
            </span>
          )}
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
          background: white;
        }
        .input:focus {
          border-color: #a855f7;
          box-shadow: 0 0 0 3px rgb(168 85 247 / 0.1);
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
