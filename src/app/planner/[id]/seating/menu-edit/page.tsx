"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, FileText, Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = "main-heading" | "second-heading" | "paragraph" | "flourish";
interface MenuSection { id: string; type: SectionType; text: string; }
interface MenuSettings {
  template: string;
  mainHeadingFont: string; mainHeadingSize: number;
  secondHeadingFont: string; secondHeadingSize: number;
  paragraphFont: string; paragraphSize: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADING_FONTS  = ["Overlock", "Playfair Display", "Dancing Script", "Georgia", "Lato", "Times New Roman"];
const PARA_FONTS     = ["Georgia", "Overlock", "Playfair Display", "Lato", "sans-serif", "serif"];
const TEMPLATES      = ["Basic", "Elegant", "Minimal"];

const SECTION_LABELS: Record<SectionType, string> = {
  "main-heading":   "Main heading",
  "second-heading": "Second heading",
  "paragraph":      "Paragraph",
  "flourish":       "Flourish",
};

const DEFAULT_SETTINGS: MenuSettings = {
  template: "Basic",
  mainHeadingFont: "Overlock", mainHeadingSize: 73,
  secondHeadingFont: "Overlock", secondHeadingSize: 30,
  paragraphFont: "Georgia", paragraphSize: 20,
};

const DEFAULT_SECTIONS: MenuSection[] = [
  { id: "s1",  type: "flourish",       text: "" },
  { id: "s2",  type: "second-heading", text: "Appetizer" },
  { id: "s3",  type: "paragraph",      text: "Shrimp risotto balls\nGoat cheese and lamb phyllo cups\nSmoked bacon and chicken skewers" },
  { id: "s4",  type: "second-heading", text: "Salad" },
  { id: "s5",  type: "paragraph",      text: "Fresh greens\nwith marinated cucumbers\ngarlic croutons,\nroasted tomatoes, raspberry dressing" },
  { id: "s6",  type: "second-heading", text: "Entrees" },
  { id: "s7",  type: "paragraph",      text: "Fire grilled beef filet\nand red wine sauce,\nand creamy lobster sauce,\nseasonal vegetables, roasted red potatoes\n\nOR\n\nstuffed with forest mushrooms\ntopped with butter poached lobster\nseasonal vegetables, roasted red potatoes" },
  { id: "s8",  type: "second-heading", text: "Dessert" },
  { id: "s9",  type: "paragraph",      text: "Assorted dessert bites\nProsecco for toasting" },
  { id: "s10", type: "main-heading",   text: "Heading" },
];

function cycleFont(fonts: string[], current: string, dir: number) {
  const i = fonts.indexOf(current);
  return fonts[(i === -1 ? 0 : (i + dir + fonts.length) % fonts.length)];
}

// ─── Right-panel helpers ──────────────────────────────────────────────────────

function FontRow({ fonts, value, onChange }: { fonts: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">Font</p>
      <div className="flex items-center rounded-lg border border-gray-200 px-1 py-1">
        <button onClick={() => onChange(cycleFont(fonts, value, -1))}
          className="rounded p-0.5 hover:bg-gray-100 text-gray-500 text-base leading-none">‹</button>
        <span className="flex-1 text-center text-xs text-gray-700 truncate px-1">{value}</span>
        <button onClick={() => onChange(cycleFont(fonts, value, 1))}
          className="rounded p-0.5 hover:bg-gray-100 text-gray-500 text-base leading-none">›</button>
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-500">{label}</p>
        <span className="text-xs font-medium text-gray-700 bg-gray-100 rounded px-1.5 py-0.5">{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-purple-500" />
      <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuEditPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();

  const SETTINGS_KEY = `menu-settings-${projectId}`;
  const SECTIONS_KEY = `menu-sections-${projectId}`;

  const [settings, setSettings] = useState<MenuSettings>(() => {
    try { const r = localStorage.getItem(SETTINGS_KEY); if (r) return { ...DEFAULT_SETTINGS, ...JSON.parse(r) }; } catch {}
    return DEFAULT_SETTINGS;
  });

  const [sections, setSections] = useState<MenuSection[]>(() => {
    try { const r = localStorage.getItem(SECTIONS_KEY); if (r) return JSON.parse(r) as MenuSection[]; } catch {}
    return DEFAULT_SECTIONS;
  });

  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState({ x: 0, y: 0 });
  const [addOpen,     setAddOpen]     = useState(false);
  const [tplOpen,     setTplOpen]     = useState(false);

  const cardRef    = useRef<HTMLDivElement>(null);
  const secRefs    = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {} }, [SETTINGS_KEY, settings]);
  useEffect(() => { try { localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections)); } catch {} }, [SECTIONS_KEY, sections]);

  function set<K extends keyof MenuSettings>(key: K, val: MenuSettings[K]) {
    setSettings(s => ({ ...s, [key]: val }));
  }

  function handleSectionClick(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedId(id);
    const el   = secRefs.current.get(id);
    const card = cardRef.current;
    if (el && card) {
      const cr = card.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setSelectedPos({
        x: Math.round(er.left - cr.left + er.width / 2),
        y: Math.round(er.top  - cr.top),
      });
    }
  }

  function updateText(id: string, text: string) {
    setSections(s => s.map(sec => sec.id === id ? { ...sec, text } : sec));
  }

  function deleteSection(id: string) {
    setSections(s => s.filter(sec => sec.id !== id));
    setSelectedId(null);
  }

  function addSection(type: SectionType) {
    const defaults: Record<SectionType, string> = {
      "main-heading": "New Heading", "second-heading": "New Course",
      "paragraph": "Menu item details", "flourish": "",
    };
    const newId = `s${Date.now()}`;
    setSections(s => [...s, { id: newId, type, text: defaults[type] }]);
    setAddOpen(false);
    setSelectedId(newId);
  }

  // Recompute selected position after DOM updates (e.g. after addSection)
  useEffect(() => {
    if (!selectedId) return;
    const el   = secRefs.current.get(selectedId);
    const card = cardRef.current;
    if (el && card) {
      const cr = card.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setSelectedPos({
        x: Math.round(er.left - cr.left + er.width / 2),
        y: Math.round(er.top  - cr.top),
      });
    }
  }, [selectedId, sections]);

  const selectedSection = sections.find(s => s.id === selectedId) ?? null;

  // Scale slider values → rendered px
  const mainPx   = Math.round(settings.mainHeadingSize  * 0.50);
  const secondPx = Math.round(settings.secondHeadingSize * 0.65);
  const paraPx   = Math.round(settings.paragraphSize    * 0.65);

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Overlock:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital@0;1&family=Dancing+Script&display=swap');`}</style>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
          {/* Close */}
          <button
            onClick={() => router.push(`/planner/${projectId}/seating?tab=menu`)}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <X className="h-4 w-4" /> Close
          </button>

          {/* File */}
          <button className="flex items-center gap-1.5 rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors">
            <FileText className="h-4 w-4" /> File
          </button>

          {/* Add element */}
          <div className="relative">
            <button
              onClick={() => setAddOpen(v => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add element
            </button>
            {addOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAddOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  {(["main-heading", "second-heading", "paragraph", "flourish"] as SectionType[]).map(type => (
                    <button key={type} onClick={() => addSection(type)}
                      className="flex w-full items-center px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                      {SECTION_LABELS[type]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div
          className="flex-1 overflow-auto flex items-start justify-center py-12"
          style={{ backgroundImage: "radial-gradient(circle, #c4b5d0 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          onClick={() => setSelectedId(null)}
        >
          {/* Menu Card */}
          <div
            ref={cardRef}
            className="bg-white shadow-xl"
            style={{ width: 280, minHeight: 600 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Fixed top: "Menu" title + flourish */}
            <div className="text-center pt-8 pb-1 px-8">
              <div style={{ fontFamily: `${settings.mainHeadingFont}, serif`, fontSize: mainPx, color: "#1a1a2e", lineHeight: 1.05 }}>
                Menu
              </div>
              <div style={{ fontSize: 12, color: "#c4b5d0", marginTop: 2 }}>❧ ❧ ❧</div>
              <div style={{ fontSize: 10, color: "#ddd6e8", letterSpacing: 5, marginTop: 3 }}>✦ ✦ ✦</div>
            </div>

            {/* Clickable sections */}
            <div className="pb-8 px-6">
              {sections.map(section => {
                const isSelected = section.id === selectedId;
                return (
                  <div
                    key={section.id}
                    ref={el => { if (el) secRefs.current.set(section.id, el); else secRefs.current.delete(section.id); }}
                    onClick={e => handleSectionClick(section.id, e)}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.outline = "1.5px dashed #e9d5f5"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.outline = "1.5px dashed transparent"; }}
                    style={{
                      cursor: "pointer",
                      padding: "3px 2px",
                      outline: isSelected ? "1.5px dashed #7c3aed" : "1.5px dashed transparent",
                      outlineOffset: 2,
                    }}
                  >
                    {section.type === "flourish" && (
                      <div className="text-center py-2" style={{ fontSize: 11, color: "#ddd6e8", letterSpacing: 5 }}>✦ ✦ ✦</div>
                    )}

                    {section.type === "main-heading" && (
                      <div className="text-center py-2">
                        <span style={{ fontFamily: `${settings.mainHeadingFont}, serif`, fontSize: Math.round(mainPx * 0.65), fontWeight: 700, color: "#1a1a2e" }}>
                          {section.text}
                        </span>
                      </div>
                    )}

                    {section.type === "second-heading" && (
                      <div className="text-center pt-3 pb-1">
                        <span style={{ fontFamily: `${settings.secondHeadingFont}, serif`, fontSize: secondPx, color: "#1a1a2e" }}>
                          {section.text}
                        </span>
                      </div>
                    )}

                    {section.type === "paragraph" && (
                      <div className="text-center">
                        {section.text.split("\n").map((line, i) => (
                          <div key={i} style={{
                            fontFamily: `${settings.paragraphFont}, serif`,
                            fontSize: paraPx,
                            color: line === "OR" ? "#9ca3af" : "#6b7280",
                            fontStyle: /^(with |and |topped|seasonal|stuffed)/.test(line) ? "italic" : "normal",
                            lineHeight: 1.55,
                          }}>
                            {line || "\u00A0"}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom flourish */}
              <div className="text-center mt-3" style={{ fontSize: 10, color: "#ddd6e8", letterSpacing: 5 }}>✦ ✦ ✦</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-64 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white">

        {selectedSection ? (
          /* ── Element panel ── */
          <div className="px-4 py-4">
            <p className="text-sm font-semibold text-gray-800 mb-4">{SECTION_LABELS[selectedSection.type]}</p>

            {selectedSection.type !== "flourish" && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1.5">Text</p>
                <textarea
                  value={selectedSection.text}
                  onChange={e => updateText(selectedSection.id, e.target.value)}
                  rows={Math.max(3, selectedSection.text.split("\n").length + 1)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-purple-300 resize-none"
                />
              </div>
            )}

            <p className="text-xs text-gray-400 mb-5">
              x: {selectedPos.x} &nbsp;&nbsp; y: {selectedPos.y}
            </p>

            <button
              onClick={() => deleteSection(selectedSection.id)}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>

        ) : (
          /* ── Global style panel ── */
          <>
            <div className="px-4 pt-4 pb-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">This style applies to menu</p>
            </div>

            {/* Template */}
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="relative">
                <button
                  onClick={() => setTplOpen(v => !v)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>Template — {settings.template}</span>
                  <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", tplOpen && "rotate-180")} />
                </button>
                {tplOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setTplOpen(false)} />
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                      {TEMPLATES.map(t => (
                        <button key={t} onClick={() => { set("template", t); setTplOpen(false); }}
                          className={cn("flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors",
                            t === settings.template ? "bg-purple-600 text-white font-medium" : "text-gray-700 hover:bg-gray-50")}>
                          Template — {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Main heading */}
            <div className="border-b border-gray-100 px-4 py-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">Main heading</p>
              <div className="space-y-3">
                <FontRow fonts={HEADING_FONTS} value={settings.mainHeadingFont} onChange={v => set("mainHeadingFont", v)} />
                <SliderRow label="Font size" value={settings.mainHeadingSize} min={10} max={130} onChange={v => set("mainHeadingSize", v)} />
              </div>
            </div>

            {/* Second heading */}
            <div className="border-b border-gray-100 px-4 py-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">Second heading</p>
              <div className="space-y-3">
                <FontRow fonts={HEADING_FONTS} value={settings.secondHeadingFont} onChange={v => set("secondHeadingFont", v)} />
                <SliderRow label="Font size" value={settings.secondHeadingSize} min={10} max={60} onChange={v => set("secondHeadingSize", v)} />
              </div>
            </div>

            {/* Paragraph */}
            <div className="px-4 py-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">Paragraph</p>
              <div className="space-y-3">
                <FontRow fonts={PARA_FONTS} value={settings.paragraphFont} onChange={v => set("paragraphFont", v)} />
                <SliderRow label="Font size" value={settings.paragraphSize} min={10} max={40} onChange={v => set("paragraphSize", v)} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
