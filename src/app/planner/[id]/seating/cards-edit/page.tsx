"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, FileText, Plus, ChevronDown } from "lucide-react";
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
}

interface TableCard {
  id: string; name: string; guestNames: string[];
  x: number; y: number; width: number; height: number; kind: ElementKind;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAPER_W = 590;
const PAPER_H = 1010;
const TABLE_KINDS: ElementKind[] = [
  "table-long", "table-square", "table-round", "table-ellipse", "table-halfround",
];
const FONTS = ["Sansita", "Playfair Display", "Dancing Script", "Georgia", "Times New Roman", "Lato"];
const DEFAULT_SETTINGS: CardSettings = { nameDisplay: "full", font: "Sansita", fontSize: 90 };
const isLocal = (id: string) => id.startsWith("local-");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTableCards(elements: LayoutElement[], guests: Guest[]): TableCard[] {
  return elements
    .filter(el => TABLE_KINDS.includes(el.kind))
    .map((el, i) => {
      const guestIds = (el.guestIds ?? []).filter(Boolean) as string[];
      const guestNames =
        guestIds.length > 0
          ? guestIds.map(gid => {
              const g = guests.find(x => x.id === gid);
              return g ? [g.firstName, g.lastName].filter(Boolean).join(" ") : "Guest";
            })
          : Array.from({ length: el.seats ?? 6 }, (_, j) => `Guest name ${j + 1}`);
      return {
        id: el.id,
        name: el.name || `Table ${i + 1}`,
        guestNames,
        x: el.x, y: el.y,
        width: el.width,
        height: el.height ?? el.width,
        kind: el.kind,
      };
    });
}

// ─── Seating card preview ─────────────────────────────────────────────────────

function SeatingCard({ table, font }: { table: TableCard; font: string }) {
  return (
    <div
      className="rounded-2xl bg-white shadow-2xl"
      style={{ width: 310, border: "2px dashed #ddd6fe", fontFamily: `${font}, serif` }}
    >
      {/* Top: script "Table" */}
      <div className="flex items-center justify-center pt-8 pb-3">
        <span
          style={{ fontFamily: `${font}, cursive`, fontSize: 54, fontWeight: 300, color: "#1a1a2e", lineHeight: 1 }}
        >
          Table
        </span>
      </div>
      {/* Dashed divider */}
      <div className="mx-8 border-t border-dashed border-gray-300" />
      {/* Table name */}
      <div className="py-3 text-center">
        <span style={{ fontFamily: "sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
          {table.name}
        </span>
      </div>
      {/* Dashed divider */}
      <div className="mx-8 border-t border-dashed border-gray-300" />
      {/* Guest names */}
      <div className="flex flex-col items-center gap-1 px-6 pb-8 pt-3">
        {table.guestNames.map((name, i) => (
          <span key={i} style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#6b7280", textAlign: "center" }}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Layout canvas ────────────────────────────────────────────────────────────

function LayoutCanvas({
  tables,
  onTableClick,
}: {
  tables: TableCard[];
  onTableClick: (i: number) => void;
}) {
  const canvasW = 380;
  const canvasH = 550;
  const scaleX = canvasW / PAPER_W;
  const scaleY = canvasH / PAPER_H;

  return (
    <div className="relative bg-white shadow-2xl" style={{ width: canvasW, height: canvasH }}>
      <svg width={canvasW} height={canvasH} viewBox={`0 0 ${canvasW} ${canvasH}`}>
        {tables.map((t, i) => {
          const cx = t.x * scaleX;
          const cy = t.y * scaleY;
          const w = Math.max(24, t.width * scaleX);
          const h = Math.max(24, t.height * scaleY);
          const isRound = t.kind === "table-round" || t.kind === "table-ellipse";

          return isRound ? (
            <g key={t.id} onClick={() => onTableClick(i)} className="cursor-pointer" style={{ cursor: "pointer" }}>
              <ellipse
                cx={cx} cy={cy} rx={w / 2} ry={h / 2}
                fill="#e8d5c0" stroke="#c4a882" strokeWidth="1.5"
              />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#7c6f8a" fontWeight="600">
                {i + 1}
              </text>
            </g>
          ) : (
            <g key={t.id} onClick={() => onTableClick(i)} className="cursor-pointer" style={{ cursor: "pointer" }}>
              <rect
                x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx="3"
                fill="#e8d5c0" stroke="#c4a882" strokeWidth="1.5"
              />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#7c6f8a" fontWeight="600">
                {i + 1}
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
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
          <button onClick={close} className="flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900">
            <X className="h-3.5 w-3.5" /> Close
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-purple-500 bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700">
            <FileText className="h-3.5 w-3.5" /> File
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left arrow */}
          <div className="flex items-center px-6">
            <button
              onClick={() => setSelectedIndex(i => Math.max(0, i - 1))}
              disabled={selectedIndex === 0}
              className="rounded-full bg-white/80 p-3 shadow-md transition-all hover:bg-white disabled:opacity-20"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Card preview */}
          <div className="flex flex-1 items-center justify-center p-8">
            <SeatingCard table={selectedTable} font={settings.font} />
          </div>

          {/* Right arrow */}
          <div className="flex items-center pr-4">
            <button
              onClick={() => setSelectedIndex(i => Math.min(tables.length - 1, i + 1))}
              disabled={selectedIndex === tables.length - 1}
              className="rounded-full bg-white/80 p-3 shadow-md transition-all hover:bg-white disabled:opacity-20"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Right panel */}
          <div className="w-64 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-5">
            <p className="mb-0.5 text-sm font-semibold text-gray-800">
              Table ID: {selectedTable.name}
            </p>
            <p className="mb-5 text-[11px] leading-relaxed text-gray-400">
              You can edit table ID on the reception layout
            </p>

            {/* Font selector */}
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-gray-400">Font</p>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <button
                  onClick={() => saveSettings({ ...settings, font: FONTS[Math.max(0, fontIndex - 1)] })}
                  disabled={fontIndex === 0}
                  className="text-sm text-gray-400 transition-colors hover:text-gray-700 disabled:opacity-30"
                >◄</button>
                <span className="flex-1 text-center text-sm text-gray-700">{settings.font}</span>
                <button
                  onClick={() => saveSettings({ ...settings, font: FONTS[Math.min(FONTS.length - 1, fontIndex + 1)] })}
                  disabled={fontIndex === FONTS.length - 1}
                  className="text-sm text-gray-400 transition-colors hover:text-gray-700 disabled:opacity-30"
                >►</button>
              </div>
            </div>

            {/* Font size */}
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-gray-400">Font size</p>
              <input
                type="number"
                value={settings.fontSize}
                onChange={e => saveSettings({ ...settings, fontSize: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-300 focus:outline-none"
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
                      i === selectedIndex ? "bg-purple-500" : "bg-gray-300 hover:bg-gray-400"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Back to layout */}
            <button
              onClick={() => setMode("layout")}
              className="mt-6 w-full rounded-lg border border-gray-200 py-2 text-xs text-gray-500 transition-colors hover:bg-gray-50"
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
        <button onClick={close} className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white">
          <X className="h-3.5 w-3.5" /> Close
        </button>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10">
            <FileText className="h-3.5 w-3.5" /> File
          </button>
          <button
            onClick={() => { if (tables.length > 0) { setSelectedIndex(0); setMode("card"); } }}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add element
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex flex-1 items-start justify-center overflow-auto p-10">
          {tables.length === 0 ? (
            <div className="mt-20 text-center">
              <p className="mb-1 font-medium text-gray-700">No tables found</p>
              <p className="mb-3 text-xs text-gray-400">
                Edit the reception layout to add tables first.
              </p>
              <button
                onClick={() => router.push(`/planner/${projectId}/seating/reception-layout-edit`)}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
              >
                Open reception layout
              </button>
            </div>
          ) : (
            <LayoutCanvas
              tables={tables}
              onTableClick={i => { setSelectedIndex(i); setMode("card"); }}
            />
          )}
        </div>

        {/* Right panel */}
        <div className="w-64 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-orange-500">
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
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {icon}
              </button>
            ))}
          </div>

          <p className="mb-3 text-xs text-gray-500">
            Display names as —{" "}
            <span className="font-medium text-gray-700">Full name</span>
          </p>

          <div className="mb-4 space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
              <input
                type="radio" name="iconMode"
                checked={settings.nameDisplay !== "generic"}
                onChange={() => saveSettings({ ...settings, nameDisplay: "colored" })}
                className="accent-purple-600"
              />
              Person icons are colored
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
              <input
                type="radio" name="iconMode"
                checked={settings.nameDisplay === "generic"}
                onChange={() => saveSettings({ ...settings, nameDisplay: "generic" })}
                className="accent-purple-600"
              />
              Person icons are generic
            </label>
          </div>

          {/* Expandable sections */}
          {["Font scheme", "Color scheme", "Paper"].map(section => (
            <button
              key={section}
              onClick={() => setOpenSection(openSection === section ? null : section)}
              className="flex w-full items-center justify-between border-t border-gray-100 py-3 text-xs text-gray-600 transition-colors hover:text-gray-800"
            >
              {section}
              <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", openSection === section && "rotate-180")} />
            </button>
          ))}

          {/* Tables list */}
          {tables.length > 0 && (
            <div className="mt-2 border-t border-gray-100 pt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Tables ({tables.length})
              </p>
              <div className="space-y-0.5">
                {tables.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedIndex(i); setMode("card"); }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-300" />
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
