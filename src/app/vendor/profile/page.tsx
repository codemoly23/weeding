"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

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
  const { t, lang } = useLanguage();
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
        setError(d.error || t("vendor.profile.saveFailed"));
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError(t("common.networkError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("vendor.nav.myProfile")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("vendor.profile.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <Section title={t("vendor.profile.businessInfo")}>
          <Field label={t("vendor.profile.businessName")} required>
            <input
              type="text"
              value={profile.businessName}
              onChange={(e) => set("businessName", e.target.value)}
              className="input"
              required
              placeholder={t("vendor.profile.businessNamePlaceholder")}
            />
          </Field>
          <Field label={t("vendor.profile.tagline")}>
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className="input"
              placeholder={t("vendor.profile.taglinePlaceholder")}
            />
          </Field>
          <Field label={t("vendor.profile.description")}>
            <textarea
              value={profile.description}
              onChange={(e) => set("description", e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder={t("vendor.profile.descriptionPlaceholder")}
            />
          </Field>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t("vendor.profile.category")}</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => set("category", cat.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all
                    ${profile.category === cat.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground/80 hover:border-border"
                    }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  {t(`vendor.category.${cat.value}`)}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Location */}
        <Section title={t("vendor.profile.location")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("vendor.profile.city")} required>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => set("city", e.target.value)}
                className="input"
                required
                placeholder="Dhaka"
              />
            </Field>
            <Field label={t("vendor.profile.country")} required>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => set("country", e.target.value)}
                className="input"
                required
                placeholder="Bangladesh"
              />
            </Field>
            <Field label={t("vendor.profile.latitude")}>
              <input
                type="number"
                step="any"
                value={profile.lat}
                onChange={(e) => set("lat", e.target.value)}
                className="input"
                placeholder="23.8103"
              />
            </Field>
            <Field label={t("vendor.profile.longitude")}>
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
          <p className="text-xs text-muted-foreground/70 mt-1">
            {t("vendor.profile.coordinatesHelp")}{" "}
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">maps.google.com</a>
            {" "}{t("vendor.profile.coordinatesHelpSuffix")}
          </p>
        </Section>

        {/* Contact */}
        <Section title={t("vendor.profile.contactSocial")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("vendor.profile.phone")}>
              <input
                type="tel"
                value={profile.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
                className="input"
                placeholder="+1 555 000 0000"
              />
            </Field>
            <Field label={t("vendor.profile.website")}>
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
        <Section title={t("vendor.profile.languagesSpoken")}>
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
                      ? "bg-primary text-white border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/60"
                  }`}
                >
                  {t(`vendor.language.${lang.toLowerCase()}`)}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Pricing & Response Time */}
        <Section title={t("vendor.profile.pricingResponse")}>
          <div className="grid sm:grid-cols-4 gap-4">
            <Field label={t("vendor.profile.responseTime")}>
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
            <Field label={t("vendor.profile.minimumPrice")}>
              <input
                type="number"
                value={profile.priceMin}
                onChange={(e) => set("priceMin", e.target.value)}
                className="input"
                placeholder="500"
                min="0"
              />
            </Field>
            <Field label={t("vendor.profile.maximumPrice")}>
              <input
                type="number"
                value={profile.priceMax}
                onChange={(e) => set("priceMax", e.target.value)}
                className="input"
                placeholder="5000"
                min="0"
              />
            </Field>
            <Field label={t("vendor.profile.currency")}>
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
        <Section title={t("vendor.profile.availability")}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isAvailable}
              onChange={(e) => set("isAvailable", e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <span className="text-sm font-medium text-foreground">{t("vendor.profile.acceptingBookings")}</span>
              <p className="text-xs text-muted-foreground">{t("vendor.profile.acceptingBookingsDesc")}</p>
            </div>
          </label>
        </Section>

        {/* Calendar availability */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">{t("vendor.profile.calendarAvailability")}</h2>
          <p className="text-xs text-muted-foreground mb-4">{t("vendor.profile.calendarHelp")}</p>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {calMonth.toLocaleDateString(lang === "sv" ? "sv-SE" : "en-US", { month: "long", year: "numeric" })}
            </span>
            <button type="button" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["sun","mon","tue","wed","thu","fri","sat"].map(d => (
              <div key={d} className="text-xs text-muted-foreground/70 font-medium py-1">{t(`common.day.${d}`)}</div>
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
                AVAILABLE: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
                BOOKED: "bg-[var(--color-error-bg)] text-[var(--color-error-text)]",
                TENTATIVE: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
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
                    title={entry?.status ? t(`vendor.availability.${entry.status}`) : t("vendor.profile.clickToMark")}
                    className={`rounded-lg py-1.5 text-xs text-center transition-all cursor-pointer select-none ${
                      entry ? statusColor[entry.status] : "text-foreground/80 hover:bg-muted"
                    } ${isSaving ? "opacity-50" : ""}`}
                  >
                    {day}
                  </button>
                );
              });
            })()}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--color-success-bg)] inline-block" />{t("vendor.availability.AVAILABLE")}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--color-error-bg)] inline-block" />{t("vendor.availability.BOOKED")}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--color-warning-bg)] inline-block" />{t("vendor.availability.TENTATIVE")}</span>
          </div>
        </div>

        {/* FAQ Editor */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">{t("vendor.profile.faq")}</h2>
          <p className="text-xs text-muted-foreground mb-4">{t("vendor.profile.faqDesc")}</p>
          <div className="space-y-3">
            {profile.faqItems.map((item, idx) => (
              <div key={idx} className="border border-border/50 rounded-xl p-3 space-y-2 bg-muted">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const updated = [...profile.faqItems];
                      updated[idx] = { ...item, question: e.target.value };
                      set("faqItems", updated);
                    }}
                    placeholder={t("vendor.profile.question")}
                    className="input flex-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => set("faqItems", profile.faqItems.filter((_, j) => j !== idx))}
                    className="mt-0.5 text-[var(--color-error-text)] hover:text-[var(--color-error-text)] transition-colors"
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
                  placeholder={t("vendor.profile.answer")}
                  rows={2}
                  className="input text-sm resize-none"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("faqItems", [...profile.faqItems, { question: "", answer: "" }])}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary font-medium"
            >
              <Plus className="w-4 h-4" /> {t("vendor.profile.addFaqItem")}
            </button>
          </div>
        </div>

        {/* Photos */}
        <Section title={t("vendor.profile.photos")}>
          <p className="text-xs text-muted-foreground -mt-2">{t("vendor.profile.photosDesc")}</p>
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
                      <span className="text-xs text-muted-foreground/70">{t("common.or")}</span>
                      <label className="cursor-pointer text-xs text-primary border border-primary/30 rounded px-3 py-1 hover:bg-primary/5 transition">
                        {t("vendor.profile.uploadFromDevice")}
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
                        className="text-xs text-[var(--color-error-text)] hover:text-[var(--color-error-text)]"
                      >{t("common.remove")}</button>
                    </div>
                  </div>
                </div>
                {i === 0 && <p className="text-[10px] text-primary font-medium">{t("vendor.profile.coverImage")}</p>}
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("photos", [...profile.photos, ""])}
              className="text-sm text-primary hover:text-primary font-medium"
            >
              {t("vendor.profile.addPhoto")}
            </button>
          </div>
        </Section>

        {error && (
          <p className="text-sm text-[var(--color-error-text)] bg-[var(--color-error-bg)] border border-[var(--color-error-bg)] rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? t("common.saving") : saved ? t("common.saved") : t("common.saveChanges")}
          </button>
          {saved && (
            <span className="text-sm text-[var(--color-success-text)] flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> {t("common.changesSaved")}
            </span>
          )}
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
          background: var(--card);
        }
        .input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgb(from var(--color-primary) r g b / 0.1);
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {required && <span className="text-[var(--color-error-text)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
