"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, FileText, Plus, ChevronDown, Printer, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocalGuests } from "@/lib/planner-storage";

// ─── Types ────────────────────────────────────────────────────────────────────

type ElementKind =
  | "arch" | "aisle" | "row"
  | "table-long" | "table-square" | "table-round" | "table-ellipse" | "table-halfround"
  | "buffet-long" | "buffet-square" | "buffet-round" | "buffet-ellipse"
  | "asset";

interface LayoutElement {
  id: string; kind: ElementKind;
  x: number; y: number; width: number; height?: number; angle: number;
  seats?: number; name?: string;
  guestIds?: (string | null)[];
  assetType?: string;
}

interface Guest { id: string; firstName: string; lastName: string | null; }

interface CardSettings {
  nameDisplay: "full" | "colored" | "generic";
  font: string;
  fontSize: number;
  colorScheme: "classic" | "dark" | "blush" | "sage" | "ivory";
}

interface TableCard {
  id: string; name: string; guestNames: string[];
  totalSeats: number;
  x: number; y: number; width: number; height: number; kind: ElementKind;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAPER_W = 590;
const PAPER_H = 1010;
const TABLE_KINDS: ElementKind[] = [
  "table-long", "table-square", "table-round", "table-ellipse", "table-halfround",
];
const FONTS = ["Sansita", "Playfair Display", "Dancing Script", "Georgia", "Times New Roman", "Lato"];
const DEFAULT_SETTINGS: CardSettings = { nameDisplay: "full", font: "Sansita", fontSize: 90, colorScheme: "classic" };

const COLOR_SCHEMES: Record<string, { bg: string; border: string; title: string; number: string; divider: string; guest: string }> = {
  classic: { bg: "#ffffff", border: "#ddd6fe", title: "#1a1a2e", number: "#1a1a2e", divider: "#e5e7eb", guest: "#6b7280" },
  dark:    { bg: "#1a1a2e", border: "#7c3aed", title: "#ffffff", number: "#ffffff", divider: "#374151", guest: "#d1d5db" },
  blush:   { bg: "#fff1f2", border: "#fda4af", title: "#881337", number: "#881337", divider: "#fecdd3", guest: "#9f1239" },
  sage:    { bg: "#f0fdf4", border: "#86efac", title: "#14532d", number: "#14532d", divider: "#bbf7d0", guest: "#166534" },
  ivory:   { bg: "#fefce8", border: "#fde68a", title: "#78350f", number: "#78350f", divider: "#fcd34d", guest: "#92400e" },
};
const isLocal = (id: string) => id.startsWith("local-");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTableCards(elements: LayoutElement[], guests: Guest[]): TableCard[] {
  return elements
    .filter(el => TABLE_KINDS.includes(el.kind))
    .map((el, i) => {
      const totalSeats = el.seats ?? 6;
      const guestIds = (el.guestIds ?? []).filter(Boolean) as string[];
      const guestNames = guestIds.map(gid => {
        const g = guests.find(x => x.id === gid);
        return g ? [g.firstName, g.lastName].filter(Boolean).join(" ") : "Guest";
      });
      return {
        id: el.id,
        name: el.name || `Table ${i + 1}`,
        guestNames,
        totalSeats,
        x: el.x, y: el.y,
        width: el.width,
        height: el.height ?? el.width,
        kind: el.kind,
      };
    });
}

// ─── Seating card preview ─────────────────────────────────────────────────────

function SeatingCard({ table, font, fontSize, colorScheme }: {
  table: TableCard; font: string; fontSize: number; colorScheme: string;
}) {
  const c = COLOR_SCHEMES[colorScheme] ?? COLOR_SCHEMES.classic;
  const numDisplay = /^Table\s+\S+$/i.test(table.name)
    ? table.name.replace(/^Table\s+/i, "")
    : table.name;

  return (
    <div
      className="rounded-2xl shadow-2xl"
      style={{ width: 310, background: c.bg, border: `2px dashed ${c.border}`, fontFamily: `${font}, serif` }}
    >
      {/* Script "Table" */}
      <div className="flex items-center justify-center pt-8 pb-3">
        <span style={{ fontFamily: `${font}, cursive`, fontSize: 54, fontWeight: 300, color: c.title, lineHeight: 1 }}>
          Table
        </span>
      </div>
      <div style={{ margin: "0 32px", borderTop: `1px dashed ${c.divider}` }} />
      {/* Table number */}
      <div className="py-3 text-center">
        <span style={{ fontFamily: "sans-serif", fontSize: fontSize * 0.22, fontWeight: 700, color: c.number }}>
          {numDisplay}
        </span>
      </div>
      <div style={{ margin: "0 32px", borderTop: `1px dashed ${c.divider}` }} />
      {/* Guest names */}
      <div className="flex flex-col items-center gap-1 px-6 pb-8 pt-3">
        {table.guestNames.length === 0 ? (
          <span style={{ fontSize: 12, color: c.divider, fontStyle: "italic" }}>No guests assigned</span>
        ) : (
          table.guestNames.map((name, i) => (
            <span key={i} style={{ fontFamily: "Georgia, serif", fontSize: 13, color: c.guest, textAlign: "center" }}>
              {name}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Layout canvas ────────────────────────────────────────────────────────────

function LayoutCanvas({
  tables,
  selectedIndex,
  onTableClick,
}: {
  tables: TableCard[];
  selectedIndex: number;
  onTableClick: (i: number) => void;
}) {
  const canvasW = 380;
  const canvasH = 550;
  const scaleX = canvasW / PAPER_W;
  const scaleY = canvasH / PAPER_H;

  return (
    <div className="relative bg-card shadow-2xl" style={{ width: canvasW, height: canvasH }}>
      <svg width={canvasW} height={canvasH} viewBox={`0 0 ${canvasW} ${canvasH}`}>
        {tables.map((t, i) => {
          const cx = t.x * scaleX;
          const cy = t.y * scaleY;
          const w = Math.max(28, t.width * scaleX);
          const h = Math.max(28, t.height * scaleY);
          const isRound = t.kind === "table-round" || t.kind === "table-ellipse";
          const isSelected = i === selectedIndex;
          const isFull = t.guestNames.length >= t.totalSeats && t.totalSeats > 0;
          const hasAny = t.guestNames.length > 0;
          const borderColor = isSelected ? "#7c3aed" : isFull ? "#dc2626" : hasAny ? "#16a34a" : "#c4a882";
          const fillColor = isSelected ? "#ede9fe" : isFull ? "#fee2e2" : hasAny ? "#dcfce7" : "#e8d5c0";
          const countLabel = `${t.guestNames.length}/${t.totalSeats}`;

          return (
            <g key={t.id} onClick={() => onTableClick(i)} style={{ cursor: "pointer" }}>
              <title>{t.name} — {countLabel} guests</title>
              {isRound ? (
                <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2} fill={fillColor} stroke={borderColor} strokeWidth={isSelected ? 2.5 : 1.5} />
              ) : (
                <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx="3" fill={fillColor} stroke={borderColor} strokeWidth={isSelected ? 2.5 : 1.5} />
              )}
              <text x={cx} y={cy - 2} textAnchor="middle" fontSize="9" fontWeight="700" fill={isSelected ? "#7c3aed" : "#374151"}>
                {t.name.replace(/^Table\s*/i, "T")}
              </text>
              <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7.5" fill={isFull ? "#dc2626" : "#6b7280"}>
                {countLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CardsEditPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const local = isLocal(projectId as string);

  const [mode, setMode] = useState<"layout" | "card">("layout");
  const [settings, setSettings] = useState<CardSettings>(DEFAULT_SETTINGS);
  const [tables, setTables] = useState<TableCard[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load settings
    try {
      const raw = localStorage.getItem(`cards-settings-${projectId}`);
      if (raw) setSettings(JSON.parse(raw));
    } catch {}

    // Load reception layout
    try {
      const layoutRaw = localStorage.getItem(`reception-layout-${projectId}`);
      if (!layoutRaw) return;
      const elements: LayoutElement[] = JSON.parse(layoutRaw);
      const guests: Guest[] = local
        ? (getLocalGuests(projectId as string) as unknown as Guest[])
        : [];
      setTables(buildTableCards(elements, guests));
    } catch {}
  }, [projectId, local]);

  // For non-local projects, also load guests from API
  useEffect(() => {
    if (local) return;
    let cancelled = false;
    const layoutRaw = localStorage.getItem(`reception-layout-${projectId}`);
    if (!layoutRaw) return;
    const elements: LayoutElement[] = JSON.parse(layoutRaw);

    fetch(`/api/planner/projects/${projectId}/guests`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setTables(buildTableCards(elements, data.guests ?? []));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [projectId, local]);

  function saveSettings(s: CardSettings) {
    setSettings(s);
    try { localStorage.setItem(`cards-settings-${projectId}`, JSON.stringify(s)); } catch {}
  }

  function close() {
    router.push(`/planner/${projectId}/seating?tab=cards`);
  }

  function buildPrintHtml() {
    const c = COLOR_SCHEMES[settings.colorScheme ?? "classic"] ?? COLOR_SCHEMES.classic;
    const cards = tables.map(t => {
      const numDisplay = /^Table\s+\S+$/i.test(t.name) ? t.name.replace(/^Table\s+/i, "") : t.name;
      const guestRows = t.guestNames.length === 0
        ? `<p style="color:${c.divider};font-style:italic;font-size:12px">No guests assigned</p>`
        : t.guestNames.map(n => `<p style="margin:2px 0;font-family:Georgia,serif;font-size:13px;color:${c.guest}">${n}</p>`).join("");
      return `
        <div style="display:inline-flex;flex-direction:column;align-items:center;width:310px;border-radius:16px;background:${c.bg};border:2px dashed ${c.border};margin:16px;page-break-inside:avoid;font-family:${settings.font},serif">
          <div style="padding:32px 0 12px;font-family:${settings.font},cursive;font-size:54px;font-weight:300;color:${c.title};line-height:1">Table</div>
          <div style="width:75%;border-top:1px dashed ${c.divider}"></div>
          <div style="padding:12px 0;font-family:sans-serif;font-size:${settings.fontSize * 0.22}px;font-weight:700;color:${c.number}">${numDisplay}</div>
          <div style="width:75%;border-top:1px dashed ${c.divider}"></div>
          <div style="padding:12px 24px 32px;text-align:center">${guestRows}</div>
        </div>`;
    }).join("");
    return `<!DOCTYPE html><html><head><title>Seating Cards</title>
      <style>body{margin:24px;background:#f5f3fa;text-align:center;}
      @media print{body{background:white;margin:0;}@page{margin:10mm;}}</style>
      </head><body><div style="display:flex;flex-wrap:wrap;justify-content:center">${cards}</div>
      <script>window.onload=function(){window.print();}<\/script></body></html>`;
  }

  function handlePreview() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(buildPrintHtml());
    win.document.close();
  }

  function handleDownloadPDF() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(buildPrintHtml());
    win.document.close();
  }

  const selectedTable = tables[selectedIndex] ?? null;
  const fontIndex = FONTS.indexOf(settings.font);

  // ─── Card view ─────────────────────────────────────────────────────────────

  if (mode === "card" && selectedTable) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ backgroundColor: "#ddd0ee", backgroundImage: "radial-gradient(#c8b8d8 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2.5">
          <button onClick={() => setMode("layout")} className="flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-foreground">
            <X className="h-3.5 w-3.5" /> Close
          </button>
          <div className="relative" ref={fileMenuRef}>
            <button
              onClick={() => setShowFileMenu(v => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <FileText className="h-3.5 w-3.5" /> File
            </button>
            {showFileMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <button onClick={() => { setShowFileMenu(false); handlePreview(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/30">
                  <Eye className="h-4 w-4 text-primary" /> Preview Result
                </button>
                <button onClick={() => { setShowFileMenu(false); handleDownloadPDF(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/30">
                  <Download className="h-4 w-4 text-primary" /> Download PDF
                </button>
                <button onClick={() => { setShowFileMenu(false); handlePreview(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/30">
                  <Printer className="h-4 w-4 text-primary" /> Print
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left arrow */}
          <div className="flex items-center px-6">
            <button
              onClick={() => setSelectedIndex(i => Math.max(0, i - 1))}
              disabled={selectedIndex === 0}
              className="rounded-full bg-background/80 p-3 shadow-md transition-all hover:bg-background disabled:opacity-20"
            >
              <ChevronLeft className="h-5 w-5 text-foreground/80" />
            </button>
          </div>

          {/* Card preview */}
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <p className="text-xs font-medium text-white/70">{selectedIndex + 1} of {tables.length}</p>
            <SeatingCard table={selectedTable} font={settings.font} fontSize={settings.fontSize} colorScheme={settings.colorScheme ?? "classic"} />
          </div>

          {/* Right arrow */}
          <div className="flex items-center pr-4">
            <button
              onClick={() => setSelectedIndex(i => Math.min(tables.length - 1, i + 1))}
              disabled={selectedIndex === tables.length - 1}
              className="rounded-full bg-background/80 p-3 shadow-md transition-all hover:bg-background disabled:opacity-20"
            >
              <ChevronRight className="h-5 w-5 text-foreground/80" />
            </button>
          </div>

          {/* Right panel */}
          <div className="w-64 flex-shrink-0 overflow-y-auto border-l border-border bg-card p-5">
            <p className="mb-0.5 text-sm font-semibold text-foreground">
              Table ID: {selectedTable.name}
            </p>
            <p className="mb-5 text-[11px] leading-relaxed text-muted-foreground">
              You can edit table ID on the reception layout
            </p>

            {/* Font selector */}
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Font</p>
              <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <button
                  onClick={() => saveSettings({ ...settings, font: FONTS[Math.max(0, fontIndex - 1)] })}
                  disabled={fontIndex === 0}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >◄</button>
                <span className="flex-1 text-center text-sm text-foreground/80">{settings.font}</span>
                <button
                  onClick={() => saveSettings({ ...settings, font: FONTS[Math.min(FONTS.length - 1, fontIndex + 1)] })}
                  disabled={fontIndex === FONTS.length - 1}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >►</button>
              </div>
            </div>

            {/* Font size */}
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Font size</p>
              <input
                type="number"
                value={settings.fontSize}
                onChange={e => saveSettings({ ...settings, fontSize: Number(e.target.value) })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            {/* Table dots navigation */}
            {tables.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tables.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedIndex(i)}
                    title={t.name}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      i === selectedIndex ? "bg-primary" : "bg-border hover:text-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Back to layout */}
            <button
              onClick={() => setMode("layout")}
              className="mt-6 w-full rounded-lg border border-border py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/30"
            >
              ← Back to layout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Layout view ──────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#e8e4ec]">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between bg-[#1c1b2e] px-4 py-2.5">
        <button onClick={close} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-white">
          <X className="h-3.5 w-3.5" /> Close
        </button>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFileMenu(v => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10"
            >
              <FileText className="h-3.5 w-3.5" /> File
            </button>
            {showFileMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <button onClick={() => { setShowFileMenu(false); handlePreview(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/30">
                  <Eye className="h-4 w-4 text-primary" /> Preview Result
                </button>
                <button onClick={() => { setShowFileMenu(false); handleDownloadPDF(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/30">
                  <Download className="h-4 w-4 text-primary" /> Download PDF
                </button>
                <button onClick={() => { setShowFileMenu(false); handlePreview(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/30">
                  <Printer className="h-4 w-4 text-primary" /> Print
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push(`/planner/${projectId}/seating/reception-layout-edit`)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" /> Edit Layout
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex flex-1 items-start justify-center overflow-auto p-10">
          {tables.length === 0 ? (
            <div className="mt-20 text-center">
              <p className="mb-1 font-medium text-foreground/80">No tables found</p>
              <p className="mb-3 text-xs text-muted-foreground">
                Edit the reception layout to add tables first.
              </p>
              <button
                onClick={() => router.push(`/planner/${projectId}/seating/reception-layout-edit`)}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary/90"
              >
                Open reception layout
              </button>
            </div>
          ) : (
            <LayoutCanvas
              tables={tables}
              selectedIndex={selectedIndex}
              onTableClick={i => { setSelectedIndex(i); setMode("card"); }}
            />
          )}
        </div>

        {/* Right panel */}
        <div className="w-64 flex-shrink-0 overflow-y-auto border-l border-border bg-card p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-warning-text)]">
            How to display guests&apos; names
          </p>

          {/* Display icon style */}
          <div className="mb-3 flex gap-2">
            {([
              { val: "full" as const, icon: "👤" },
              { val: "colored" as const, icon: "🔵" },
              { val: "generic" as const, icon: "🧑" },
            ]).map(({ val, icon }) => (
              <button
                key={val}
                onClick={() => saveSettings({ ...settings, nameDisplay: val })}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border-2 text-base transition-colors",
                  settings.nameDisplay === val
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-foreground/40"
                )}
              >
                {icon}
              </button>
            ))}
          </div>

          <p className="mb-3 text-xs text-muted-foreground">
            Display names as —{" "}
            <span className="font-medium text-foreground">Full name</span>
          </p>

          <div className="mb-4 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/80">
              <input
                type="radio" name="iconMode"
                checked={settings.nameDisplay !== "generic"}
                onChange={() => saveSettings({ ...settings, nameDisplay: "colored" })}
                className="accent-primary"
              />
              Person icons are colored
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/80">
              <input
                type="radio" name="iconMode"
                checked={settings.nameDisplay === "generic"}
                onChange={() => saveSettings({ ...settings, nameDisplay: "generic" })}
                className="accent-primary"
              />
              Person icons are generic
            </label>
          </div>

          {/* Font scheme */}
          <button
            onClick={() => setOpenSection(openSection === "font" ? null : "font")}
            className="flex w-full items-center justify-between border-t border-border/50 py-3 text-xs text-foreground/80 transition-colors hover:text-foreground"
          >
            Font scheme
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/70 transition-transform", openSection === "font" && "rotate-180")} />
          </button>
          {openSection === "font" && (
            <div className="mb-3 space-y-1">
              {FONTS.map(f => (
                <button
                  key={f}
                  onClick={() => saveSettings({ ...settings, font: f })}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    settings.font === f ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground/80 hover:bg-muted/30"
                  )}
                  style={{ fontFamily: `${f}, serif` }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Color scheme */}
          <button
            onClick={() => setOpenSection(openSection === "color" ? null : "color")}
            className="flex w-full items-center justify-between border-t border-border/50 py-3 text-xs text-foreground/80 transition-colors hover:text-foreground"
          >
            Color scheme
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/70 transition-transform", openSection === "color" && "rotate-180")} />
          </button>
          {openSection === "color" && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              {(Object.entries(COLOR_SCHEMES) as [string, typeof COLOR_SCHEMES[string]][]).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => saveSettings({ ...settings, colorScheme: key as CardSettings["colorScheme"] })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-colors",
                    (settings.colorScheme ?? "classic") === key ? "border-primary" : "border-border hover:border-foreground/30"
                  )}
                  style={{ background: c.bg }}
                >
                  <div className="h-6 w-full rounded" style={{ background: c.border, opacity: 0.5 }} />
                  <span className="text-[10px] capitalize font-medium" style={{ color: c.title }}>{key}</span>
                </button>
              ))}
            </div>
          )}

          {/* Paper */}
          <button
            onClick={() => setOpenSection(openSection === "paper" ? null : "paper")}
            className="flex w-full items-center justify-between border-t border-border/50 py-3 text-xs text-foreground/80 transition-colors hover:text-foreground"
          >
            Paper
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/70 transition-transform", openSection === "paper" && "rotate-180")} />
          </button>
          {openSection === "paper" && (
            <div className="mb-3 text-xs text-muted-foreground px-1">
              <p>Format: 4.33 × 7.87 inch</p>
              <p className="mt-1 text-[10px] text-muted-foreground/60">Use thick card stock for best print results.</p>
            </div>
          )}

          {/* Tables list */}
          {tables.length > 0 && (
            <div className="mt-2 border-t border-border/50 pt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Tables ({tables.length})
              </p>
              <div className="space-y-0.5">
                {tables.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedIndex(i); setMode("card"); }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-foreground/80 transition-colors hover:bg-muted/30"
                  >
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/30" />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
