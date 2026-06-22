"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, LayoutTemplate, Download, CloudUpload, X } from "lucide-react";
import { getLocalVenue, updateLocalVenue, updateLocalProject, LocalVenueDetails } from "@/lib/planner-storage";
import { useLanguage } from "@/lib/i18n/language-context";
import { usePlannerTier, isPremiumOrElite } from "@/hooks/use-planner-tier";
import { UpgradeModal } from "@/components/planner/upgrade-modal";

const isLocal = (id: string) => id.startsWith("local-");

// Convert old R2.dev URLs to internal proxy so bucket stays private
function normalizePhotoUrl(url: string): string {
  const m = url.match(/^https?:\/\/[^/]+\.r2\.dev\/(.+)$/);
  return m ? `/api/media/${m[1]}` : url;
}

type VenueForm = {
  venueName: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  date: string | null;
  time: string | null;
  capacity: number | null;
  description: string | null;
  notes: string | null;
  layoutNotes: string | null;
};

function emptyForm(): VenueForm {
  return {
    venueName: null, address: null, city: null, country: null,
    date: null, time: null, capacity: null,
    description: null, notes: null, layoutNotes: null,
  };
}

function venueToForm(v: LocalVenueDetails | null): VenueForm {
  if (!v) return emptyForm();
  return {
    venueName:   v.venueName   ?? null,
    address:     v.address     ?? null,
    city:        v.city        ?? null,
    country:     v.country     ?? null,
    date:        v.date        ? (v.date.includes("T") ? v.date.split("T")[0] : v.date) : null,
    time:        v.time        ?? null,
    capacity:    v.capacity    ?? null,
    description: v.description ?? null,
    notes:       v.notes       ?? null,
    layoutNotes: v.layoutNotes ?? null,
  };
}

function formatDate(dateStr: string | null, fallback: string): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

function formatLocation(city: string | null, country: string | null, address: string | null, fallback: string): string {
  const parts = [address, city, country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback;
}

async function saveVenue(id: string, local: boolean, form: VenueForm) {
  if (local) {
    updateLocalVenue(id, "CEREMONY", form);
    if (form.date !== undefined) {
      updateLocalProject(id, { eventDate: form.date });
    }
  } else {
    await fetch(`/api/planner/projects/${id}/ceremony`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  }
}

export default function CeremonyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const local = isLocal(id);
  const { t } = useLanguage();
  const { tier } = usePlannerTier(id);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [form, setForm] = useState<VenueForm>(emptyForm());
  const [loading, setLoading] = useState(true);

  const [editingLocation, setEditingLocation] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [locPopupOpen, setLocPopupOpen] = useState(false);
  const descSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Photo state
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVenue = useCallback(async () => {
    setLoading(true);
    try {
      if (local) {
        const v = getLocalVenue(id, "CEREMONY");
        setForm(venueToForm(v));
        setPhotos(v.photos ?? []);
      } else {
        const res = await fetch(`/api/planner/projects/${id}/ceremony`);
        if (res.ok) {
          const data = await res.json();
          setForm(venueToForm(data.venue));
          setPhotos(data.venue?.photos ?? []);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id, local]);

  useEffect(() => { loadVenue(); }, [loadVenue]);

  async function saveField(updatedForm: VenueForm) {
    try { await saveVenue(id, local, updatedForm); } catch { /* silent */ }
  }

  function handleDescriptionChange(value: string) {
    const updated = { ...form, description: value || null };
    setForm(updated);
    if (descSaveTimer.current) clearTimeout(descSaveTimer.current);
    descSaveTimer.current = setTimeout(() => saveField(updated), 800);
  }

  async function commitDate(value: string) {
    const updated = { ...form, date: value || null };
    setForm(updated);
    await saveField(updated);
  }

  async function commitLocation(city: string, country: string, address: string) {
    const updated = { ...form, city: city || null, country: country || null, address: address || null };
    setForm(updated);
    setEditingLocation(false);
    setLocPopupOpen(false);
    await saveField(updated);
  }

  // ── Photo upload ─────────────────────────────────────────────────────────────

  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const imageFiles = fileArray.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setUploadError(t("ceremony.onlyImages"));
      return;
    }

    const remaining = 30 - photos.length;
    if (remaining <= 0) {
      setUploadError(t("ceremony.maxPhotos"));
      return;
    }

    const toUpload = imageFiles.slice(0, remaining);
    setUploading(true);
    setUploadError(null);

    const newUrls: string[] = [];

    for (const file of toUpload) {
      if (file.size > 20 * 1024 * 1024) {
        setUploadError(t("ceremony.fileTooLarge"));
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads");

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setUploadError((err as { error?: string }).error ?? t("ceremony.uploadFailed"));
          continue;
        }
        const { url } = await res.json() as { url: string };
        newUrls.push(url);
      } catch {
        setUploadError(t("ceremony.uploadFailed"));
      }
    }

    if (newUrls.length > 0) {
      if (local) {
        const current = getLocalVenue(id, "CEREMONY");
        const merged = [...(current.photos ?? []), ...newUrls];
        updateLocalVenue(id, "CEREMONY", { photos: merged });
        setPhotos(merged);
      } else {
        const saved: string[] = [];
        for (const url of newUrls) {
          const res = await fetch(`/api/planner/projects/${id}/ceremony/photos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          if (res.ok) saved.push(url);
        }
        if (saved.length > 0) setPhotos(prev => [...prev, ...saved]);
      }
    }

    setUploading(false);
  }

  async function deletePhoto(url: string) {
    const prev = photos;
    setPhotos(p => p.filter(x => x !== url));

    if (local) {
      const current = getLocalVenue(id, "CEREMONY");
      updateLocalVenue(id, "CEREMONY", { photos: (current.photos ?? []).filter(x => x !== url) });
    } else {
      const res = await fetch(`/api/planner/projects/${id}/ceremony/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) setPhotos(prev);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  }

  // ── PDF download ─────────────────────────────────────────────────────────────

  async function handleDownloadPDF() {
    if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; }
    const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");
    const styles = StyleSheet.create({
      page:    { padding: 48, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
      badge:   { fontSize: 9, color: "#7c3aed", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
      title:   { fontSize: 22, fontWeight: "bold", color: "#1e1b4b", marginBottom: 4 },
      divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginBottom: 20, marginTop: 8 },
      section: { marginBottom: 16 },
      label:   { fontSize: 9, color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
      value:   { fontSize: 11, color: "#374151", lineHeight: 1.6 },
      row:     { flexDirection: "row", gap: 24, marginBottom: 16 },
      col:     { flex: 1 },
    });
    const f = form;
    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.badge}>Ceremony Details</Text>
          <Text style={styles.title}>{f.venueName || "Ceremony Venue"}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{f.date ? new Date(f.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{f.time || "—"}</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{[f.address, f.city, f.country].filter(Boolean).join(", ") || "—"}</Text>
          </View>
          {f.description && <View style={styles.section}><Text style={styles.label}>Description</Text><Text style={styles.value}>{f.description}</Text></View>}
          {f.layoutNotes && <View style={styles.section}><Text style={styles.label}>Layout Notes</Text><Text style={styles.value}>{f.layoutNotes}</Text></View>}
        </Page>
      </Document>
    );
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ceremony-details.pdf"; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#ede9f0]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <>
    <div className="min-h-full bg-[#ede9f0] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground/80">{t("ceremony.title")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("ceremony.desc")}</p>
        </div>

        {/* Three info cards */}
        <div className="mb-4 grid grid-cols-3 gap-3">

          {/* Date card */}
          <div
            className="flex flex-col cursor-pointer rounded-xl border border-border bg-card/80 px-3 py-3 hover:bg-card transition-colors text-center"
            onClick={() => { setDatePickerOpen(v => !v); setLocPopupOpen(false); setEditingLocation(false); }}
          >
            <p className="mb-1 text-xs text-muted-foreground">{t("ceremony.date")}</p>
            <p className={`text-sm font-medium ${form.date ? "text-primary" : "text-primary/60"}`}>
              {formatDate(form.date, t("ceremony.setDate"))}
            </p>
            <div className="relative flex justify-center mt-3" onClick={e => e.stopPropagation()}>
              <Calendar
                className="h-8 w-8 text-primary/20 cursor-pointer hover:text-primary/60 transition-colors"
                onClick={() => { setDatePickerOpen(v => !v); setLocPopupOpen(false); setEditingLocation(false); }}
              />
              {datePickerOpen && (
                <DatePickerPopup
                  date={form.date}
                  onSave={date => { commitDate(date); setDatePickerOpen(false); }}
                  onClose={() => setDatePickerOpen(false)}
                  t={t}
                />
              )}
            </div>
          </div>

          {/* Location card */}
          <div
            className="flex flex-col cursor-pointer rounded-xl border border-border bg-card/80 px-3 py-3 hover:bg-card transition-colors text-center"
            onClick={() => { setEditingLocation(true); setDatePickerOpen(false); setLocPopupOpen(false); }}
          >
            <p className="mb-1 text-xs text-muted-foreground">{t("ceremony.location")}</p>
            {editingLocation ? (
              <LocationEditInline
                city={form.city ?? ""}
                country={form.country ?? ""}
                address={form.address ?? ""}
                onCommit={commitLocation}
                onCancel={() => setEditingLocation(false)}
                t={t}
              />
            ) : (
              <p className={`text-sm font-medium truncate ${(form.city || form.country || form.address) ? "text-primary" : "text-primary/60"}`}>
                {formatLocation(form.city, form.country, form.address, t("ceremony.setLocation"))}
              </p>
            )}
            <div className="relative flex justify-center mt-3" onClick={e => e.stopPropagation()}>
              <MapPin
                className="h-8 w-8 text-primary/20 cursor-pointer hover:text-primary/60 transition-colors"
                onClick={() => { setLocPopupOpen(v => !v); setDatePickerOpen(false); setEditingLocation(false); }}
              />
              {locPopupOpen && (
                <LocationPopup
                  city={form.city ?? ""}
                  country={form.country ?? ""}
                  address={form.address ?? ""}
                  onCommit={commitLocation}
                  onClose={() => setLocPopupOpen(false)}
                  t={t}
                />
              )}
            </div>
          </div>

          {/* Layout card */}
          <div
            className="flex flex-col cursor-pointer rounded-xl border border-border bg-card/80 px-3 py-3 hover:bg-card transition-colors text-center"
            onClick={() => router.push(`/planner/${id}/seating?tab=ceremony&src=ceremony`)}
          >
            <p className="mb-1 text-xs text-muted-foreground">{t("ceremony.layout")}</p>
            <p className="text-sm font-medium text-primary">{t("ceremony.planLayout")}</p>
            <div className="flex justify-center mt-3">
              <LayoutTemplate className="h-8 w-8 text-primary/20" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 rounded-xl border border-border bg-card/80 px-4 py-3">
          <textarea
            rows={4}
            value={form.description ?? ""}
            onChange={e => handleDescriptionChange(e.target.value)}
            placeholder={t("ceremony.descPlaceholder")}
            className="w-full resize-none bg-transparent text-sm text-foreground/80 placeholder-muted-foreground focus:outline-none"
          />
        </div>

        {/* Photo upload area */}
        <div
          className={`mb-4 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-primary/20 bg-card/60"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />

          <CloudUpload className={`mx-auto mb-3 h-12 w-12 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
          <p className="mb-1 text-sm font-semibold text-foreground/80">{t("ceremony.uploadPhotos")}</p>
          <p className="mb-1 text-xs text-muted-foreground">{t("ceremony.dropPhotos")}</p>
          <p className="mb-4 text-xs font-semibold text-muted-foreground">
            {t("ceremony.photoLimit")} <span className="text-primary">{t("ceremony.photoSize")}</span>
          </p>

          {uploadError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{uploadError}</p>
          )}

          <button
            onClick={() => {
              if (photos.length >= 30) { setUploadError(t("ceremony.maxPhotos")); return; }
              setUploadError(null);
              fileInputRef.current?.click();
            }}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {t("ceremony.uploading")}
              </>
            ) : t("ceremony.upload")}
          </button>

          {photos.length >= 30 && (
            <p className="mt-2 text-xs text-muted-foreground">{t("ceremony.maxPhotos")}</p>
          )}
        </div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((url, i) => (
              <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizePhotoUrl(url)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => deletePhoto(url)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                  aria-label="Delete photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Download PDF */}
        <div className="flex justify-center">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4 text-primary" />
            {t("ceremony.downloadPdf")}
          </button>
        </div>

      </div>
    </div>
    <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} defaultTab="premium" />
    </>
  );
}

// ── Date picker popup ─────────────────────────────────────────────────────────

function DatePickerPopup({ date, onSave, onClose, t }: {
  date: string | null;
  onSave: (date: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [val, setVal] = useState(date ?? "");
  return (
    <div className="absolute bottom-full right-0 mb-1 z-50 w-56 rounded-xl border border-border bg-card shadow-xl p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{t("ceremony.selectDate")}</p>
      <input
        autoFocus
        type="date"
        value={val}
        onChange={e => setVal(e.target.value)}
        className="w-full rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground/80 focus:outline-none focus:border-primary"
      />
      <div className="flex gap-2 mt-2">
        <button onClick={() => onSave(val)} className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-medium text-white hover:bg-primary/90">{t("ceremony.save")}</button>
        <button onClick={onClose} className="flex-1 rounded-lg bg-muted py-1.5 text-xs text-muted-foreground hover:bg-muted/80">{t("ceremony.cancel")}</button>
      </div>
    </div>
  );
}

// ── Location popup ────────────────────────────────────────────────────────────

function LocationPopup({ city, country, address, onCommit, onClose, t }: {
  city: string; country: string; address: string;
  onCommit: (city: string, country: string, address: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [c, setC] = useState(city);
  const [co, setCo] = useState(country);
  const [a, setA] = useState(address);

  return (
    <div className="absolute bottom-full right-0 mb-1 z-50 w-64 rounded-xl border border-border bg-card shadow-xl p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{t("ceremony.locationDetails")}</p>
      <div className="space-y-1.5">
        <input autoFocus value={a} onChange={e => setA(e.target.value)} placeholder={t("ceremony.streetAddress")}
          className="w-full rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground/80 focus:outline-none focus:border-primary" />
        <input value={c} onChange={e => setC(e.target.value)} placeholder={t("ceremony.city")}
          className="w-full rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground/80 focus:outline-none focus:border-primary" />
        <input value={co} onChange={e => setCo(e.target.value)} placeholder={t("ceremony.country")}
          className="w-full rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground/80 focus:outline-none focus:border-primary" />
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={() => onCommit(c, co, a)} className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-medium text-white hover:bg-primary/90">{t("ceremony.save")}</button>
        <button onClick={onClose} className="flex-1 rounded-lg bg-muted py-1.5 text-xs text-muted-foreground hover:bg-muted/80">{t("ceremony.cancel")}</button>
      </div>
    </div>
  );
}

// ── Inline location editor (card click) ──────────────────────────────────────

function LocationEditInline({
  city, country, address, onCommit, onCancel, t,
}: {
  city: string; country: string; address: string;
  onCommit: (city: string, country: string, address: string) => void;
  onCancel: () => void;
  t: (key: string) => string;
}) {
  const [c, setC] = useState(city);
  const [co, setCo] = useState(country);
  const [a, setA] = useState(address);

  return (
    <div className="space-y-1" onClick={e => e.stopPropagation()}>
      <input autoFocus value={a} onChange={e => setA(e.target.value)} placeholder={t("ceremony.streetAddress")}
        className="w-full rounded border border-primary/30 bg-transparent px-2 py-0.5 text-xs text-primary focus:outline-none" />
      <div className="flex gap-1">
        <input value={c} onChange={e => setC(e.target.value)} placeholder={t("ceremony.city")}
          className="w-full rounded border border-primary/30 bg-transparent px-2 py-0.5 text-xs text-primary focus:outline-none" />
        <input value={co} onChange={e => setCo(e.target.value)} placeholder={t("ceremony.country")}
          className="w-full rounded border border-primary/30 bg-transparent px-2 py-0.5 text-xs text-primary focus:outline-none" />
      </div>
      <div className="flex gap-1 pt-0.5">
        <button onClick={() => onCommit(c, co, a)}
          className="rounded bg-primary px-2 py-0.5 text-xs text-white hover:bg-primary/90">{t("ceremony.save")}</button>
        <button onClick={onCancel}
          className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/80">{t("ceremony.cancel")}</button>
      </div>
    </div>
  );
}
