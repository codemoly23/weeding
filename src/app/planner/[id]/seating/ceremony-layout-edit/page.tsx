"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, Plus, ChevronRight, Eye, Copy, Trash2, RotateCw, Move, Maximize2, Keyboard, FileText, Search, Upload, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocalGuests } from "@/lib/planner-storage";

// ─── Types ─────────────────────────────────────────────────────────────────

type ElementKind =
  | "arch" | "aisle" | "row"
  | "table-long" | "table-square" | "table-round" | "table-ellipse" | "table-halfround"
  | "buffet-long" | "buffet-square" | "buffet-round" | "buffet-ellipse"
  | "asset";

interface CeremonyElement {
  id: string;
  kind: ElementKind;
  x: number;
  y: number;
  width: number;
  height?: number;
  angle: number;
  seats?: number;
  spacing?: number;
  guestIds?: (string | null)[];
  name?: string;
  borderColor?: string;
  assetType?: string;
  color?: string;
}

type Selection =
  | { kind: "element"; id: string }
  | { kind: "seat"; elementId: string; seatIndex: number }
  | null;

interface Guest {
  id: string;
  firstName: string;
  lastName: string | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PAPER_W = 590;
const PAPER_H = 1010;
const CHAIR_R = 11;
const PAPER_CX = PAPER_W / 2;
const SEAT_R = 9;
const TABLE_PAD = 16;

function spacingToPx(s: number) { return s * 0.62; }

// ─── Initial layout ─────────────────────────────────────────────────────────

function buildInitElements(): CeremonyElement[] {
  const rows: CeremonyElement[] = [];
  const N = 9;
  const rowGap = 66;
  const rowStartY = 330;
  const seatsPerRow = 5;
  const sp = 60;
  const rowW = seatsPerRow * spacingToPx(sp);
  const aisleHalf = 58;
  const leftX = PAPER_CX - aisleHalf - rowW - 10;
  const rightX = PAPER_CX + aisleHalf + 10;

  for (let i = 0; i < N; i++) {
    const y = rowStartY + i * rowGap;
    rows.push({ id: `rl-${i}`, kind: "row", x: leftX, y, width: rowW, angle: 0, seats: seatsPerRow, spacing: sp, guestIds: Array(seatsPerRow).fill(null) });
    rows.push({ id: `rr-${i}`, kind: "row", x: rightX, y, width: rowW, angle: 0, seats: seatsPerRow, spacing: sp, guestIds: Array(seatsPerRow).fill(null) });
  }

  return [
    { id: "arch", kind: "arch", x: PAPER_CX - 105, y: 22, width: 210, angle: 0, borderColor: "#111" },
    { id: "proc-l", kind: "row", x: PAPER_CX - aisleHalf - 4 * spacingToPx(60) - 40, y: 230, width: 3 * spacingToPx(60) + CHAIR_R * 2, angle: -20, seats: 4, spacing: 60, guestIds: Array(4).fill(null) },
    { id: "proc-r", kind: "row", x: PAPER_CX + aisleHalf + 20, y: 230, width: 3 * spacingToPx(60) + CHAIR_R * 2, angle: 20, seats: 4, spacing: 60, guestIds: Array(4).fill(null) },
    { id: "aisle", kind: "aisle", x: PAPER_CX - aisleHalf, y: 255, width: aisleHalf * 2, height: rowStartY + N * rowGap - 255 + 20, angle: 0, name: "The aisle" },
    ...rows,
  ];
}

// ─── Arch SVG ───────────────────────────────────────────────────────────────

function ArchSVG({ width, borderColor }: { width: number; borderColor: string }) {
  const h = Math.round(width * 1.05);
  const mx = width / 2;
  const aw = width * 0.33;
  const ax0 = mx - aw / 2;
  const ax1 = mx + aw / 2;
  const baseY = h * 0.9;
  const peakY = h * 0.12;
  return (
    <svg viewBox={`0 0 ${width} ${h}`} width={width} height={h} overflow="visible">
      <path d={`M ${ax0 - 9} ${baseY} L ${ax0 - 9} ${baseY - (baseY - peakY) * 0.72} Q ${ax0 - 9} ${peakY - 18} ${mx} ${peakY - 18} Q ${ax1 + 9} ${peakY - 18} ${ax1 + 9} ${baseY - (baseY - peakY) * 0.72} L ${ax1 + 9} ${baseY}`} fill="none" stroke={borderColor} strokeWidth="2.5" />
      <path d={`M ${ax0 + 7} ${baseY} L ${ax0 + 7} ${baseY - (baseY - peakY) * 0.58} Q ${ax0 + 7} ${peakY + 12} ${mx} ${peakY + 12} Q ${ax1 - 7} ${peakY + 12} ${ax1 - 7} ${baseY - (baseY - peakY) * 0.58} L ${ax1 - 7} ${baseY}`} fill="none" stroke={borderColor} strokeWidth="2" />
      {[0.25, 0.45].map((t, i) => {
        const y = baseY - (baseY - peakY) * t;
        return (<g key={i}><line x1={ax0 - 9} y1={y} x2={ax0 + 7} y2={y} stroke="#ccc" strokeWidth="1.5" /><line x1={ax1 - 7} y1={y} x2={ax1 + 9} y2={y} stroke="#ccc" strokeWidth="1.5" /></g>);
      })}
    </svg>
  );
}

// ─── Row of Chairs ───────────────────────────────────────────────────────────

function RowOfChairs({ seats, spacing, guestIds, selectedSeat, onSeatClick, guests, nameDisplay }: {
  seats: number; spacing: number; guestIds: (string | null)[];
  selectedSeat: number | null; onSeatClick: (i: number) => void;
  guests: Guest[]; nameDisplay: string;
}) {
  const spPx = spacingToPx(spacing);
  const totalW = Math.max((seats - 1) * spPx + CHAIR_R * 2, 1);
  const svgH = CHAIR_R * 2 + 8;
  const cy = svgH / 2;
  return (
    <svg width={totalW} height={svgH} style={{ overflow: "visible", display: "block" }}>
      <line x1={CHAIR_R} y1={cy} x2={totalW - CHAIR_R} y2={cy} stroke="#d1d5db" strokeWidth="1" />
      {Array.from({ length: seats }, (_, i) => {
        const cx = CHAIR_R + i * spPx;
        const gid = guestIds[i];
        const g = guests.find(x => x.id === gid);
        const label = g ? nameDisplay === "initials" ? `${g.firstName[0]}${g.lastName?.[0] ?? ""}`.toUpperCase() : nameDisplay === "first" ? g.firstName.slice(0, 3) : `${i + 1}` : `${i + 1}`;
        const isSel = selectedSeat === i;
        return (
          <g key={i} onClick={e => { e.stopPropagation(); onSeatClick(i); }} style={{ cursor: "pointer" }}>
            <circle cx={cx} cy={cy} r={CHAIR_R} fill="white" stroke={isSel ? "#7c3aed" : "#d1d5db"} strokeWidth={isSel ? 2 : 1.2} />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill={gid ? "#6d28d9" : "#aaa"}>{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Table seat positions ─────────────────────────────────────────────────────

function getTableSeatPositions(kind: ElementKind, w: number, h: number, seats: number): { cx: number; cy: number }[] {
  const pos: { cx: number; cy: number }[] = [];
  if (kind === "table-long" || kind === "buffet-long") {
    const half = Math.ceil(seats / 2);
    const rest = seats - half;
    for (let i = 0; i < half; i++) pos.push({ cx: (i + 0.5) * (w / half), cy: -TABLE_PAD });
    for (let i = 0; i < rest; i++) pos.push({ cx: (i + 0.5) * (w / rest), cy: h + TABLE_PAD });
  } else if (kind === "table-round" || kind === "buffet-round") {
    const r = w / 2 + TABLE_PAD;
    for (let i = 0; i < seats; i++) {
      const a = (i / seats) * 2 * Math.PI - Math.PI / 2;
      pos.push({ cx: w / 2 + r * Math.cos(a), cy: h / 2 + r * Math.sin(a) });
    }
  } else if (kind === "table-ellipse" || kind === "buffet-ellipse") {
    const rx = w / 2 + TABLE_PAD;
    const ry = h / 2 + TABLE_PAD;
    for (let i = 0; i < seats; i++) {
      const a = (i / seats) * 2 * Math.PI - Math.PI / 2;
      pos.push({ cx: w / 2 + rx * Math.cos(a), cy: h / 2 + ry * Math.sin(a) });
    }
  } else if (kind === "table-square" || kind === "buffet-square") {
    const perSide = Math.ceil(seats / 4);
    const sides = [
      ...Array.from({ length: perSide }, (_, i) => ({ cx: (i + 0.5) * (w / perSide), cy: -TABLE_PAD })),
      ...Array.from({ length: perSide }, (_, i) => ({ cx: w + TABLE_PAD, cy: (i + 0.5) * (h / perSide) })),
      ...Array.from({ length: perSide }, (_, i) => ({ cx: w - (i + 0.5) * (w / perSide), cy: h + TABLE_PAD })),
      ...Array.from({ length: perSide }, (_, i) => ({ cx: -TABLE_PAD, cy: h - (i + 0.5) * (h / perSide) })),
    ];
    pos.push(...sides.slice(0, seats));
  } else if (kind === "table-halfround") {
    const r = w / 2 + TABLE_PAD;
    for (let i = 0; i < seats; i++) {
      const a = Math.PI + (i / Math.max(seats - 1, 1)) * Math.PI;
      pos.push({ cx: w / 2 + r * Math.cos(a), cy: h / 2 + r * Math.sin(a) });
    }
  }
  return pos;
}

// ─── Canvas Table Element ─────────────────────────────────────────────────────

function TableCanvasElement({ el, isSelected, seatSelIdx, onMouseDown, onSeatClick, guests, nameDisplay }: {
  el: CeremonyElement; isSelected: boolean; seatSelIdx: number | null;
  onMouseDown: (e: React.MouseEvent) => void; onSeatClick: (i: number) => void;
  guests: Guest[]; nameDisplay: string;
}) {
  const w = el.width;
  const h = el.height ?? el.width;
  const seats = el.seats ?? 8;
  const hasSeat = !el.kind.startsWith("buffet-");
  const seatPositions = hasSeat ? getTableSeatPositions(el.kind, w, h, seats) : [];
  const pad = hasSeat ? TABLE_PAD + SEAT_R + 6 : 8;
  const svgW = w + pad * 2;
  const svgH = h + pad * 2;

  const tableBody = () => {
    if (el.kind === "table-round" || el.kind === "buffet-round")
      return <circle cx={pad + w / 2} cy={pad + h / 2} r={w / 2} fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />;
    if (el.kind === "table-ellipse" || el.kind === "buffet-ellipse")
      return <ellipse cx={pad + w / 2} cy={pad + h / 2} rx={w / 2} ry={h / 2} fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />;
    if (el.kind === "table-halfround")
      return <path d={`M ${pad} ${pad + h / 2} A ${w / 2} ${w / 2} 0 0 1 ${pad + w} ${pad + h / 2} Z`} fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />;
    return <rect x={pad} y={pad} width={w} height={h} rx="3" fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />;
  };

  return (
    <div
      style={{ position: "absolute", left: el.x - pad, top: el.y - pad, width: svgW, height: svgH, transform: `rotate(${el.angle}deg)`, transformOrigin: `${pad + w / 2}px ${pad + h / 2}px`, cursor: "grab", outline: isSelected ? "2px dashed #7c3aed" : "none", outlineOffset: 4 }}
      onMouseDown={onMouseDown}
    >
      <svg width={svgW} height={svgH} style={{ overflow: "visible" }}>
        {tableBody()}
        {seatPositions.map((pos, i) => {
          const gid = el.guestIds?.[i] ?? null;
          const g = guests.find(x => x.id === gid);
          const label = g ? nameDisplay === "initials" ? `${g.firstName[0]}${g.lastName?.[0] ?? ""}`.toUpperCase() : nameDisplay === "first" ? g.firstName.slice(0, 3) : `${i + 1}` : `${i + 1}`;
          const isSel = seatSelIdx === i;
          return (
            <g key={i} onClick={e => { e.stopPropagation(); onSeatClick(i); }} style={{ cursor: "pointer" }}>
              <circle cx={pad + pos.cx} cy={pad + pos.cy} r={SEAT_R} fill="white" stroke={isSel ? "#7c3aed" : "#d1d5db"} strokeWidth={isSel ? 2 : 1.2} />
              <text x={pad + pos.cx} y={pad + pos.cy + 3.5} textAnchor="middle" fontSize="7.5" fill={gid ? "#6d28d9" : "#aaa"}>{label}</text>
            </g>
          );
        })}
      </svg>
      {isSelected && <>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "crosshair" }} />
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "ew-resize" }} />
      </>}
    </div>
  );
}

// ─── Asset SVG icons ─────────────────────────────────────────────────────────

function AssetIcon({ type, size = 40 }: { type: string; size?: number }) {
  const s = size;
  const c = s / 2;
  switch (type) {
    case "label": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="4" y="12" width="26" height="16" rx="2" fill="#fff" stroke="#555" strokeWidth="1.5"/><polygon points="30,12 36,20 30,28" fill="#fff" stroke="#555" strokeWidth="1.5"/><line x1="8" y1="17" x2="22" y2="17" stroke="#888" strokeWidth="1.2"/><line x1="8" y1="21" x2="18" y2="21" stroke="#bbb" strokeWidth="1"/></svg>;
    case "pillar": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="14" y="8" width="12" height="24" rx="3" fill="#e8e0d0" stroke="#888" strokeWidth="1.5"/><rect x="11" y="7" width="18" height="4" rx="1" fill="#ccc" stroke="#999" strokeWidth="1"/><rect x="11" y="29" width="18" height="4" rx="1" fill="#ccc" stroke="#999" strokeWidth="1"/></svg>;
    case "wall": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="4" y="17" width="32" height="6" rx="1" fill="#bbb" stroke="#888" strokeWidth="1.2"/></svg>;
    case "door-right": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="8" y="8" width="16" height="24" rx="1" fill="#f5f0e8" stroke="#888" strokeWidth="1.5"/><path d="M 8 8 Q 24 8 24 24" fill="none" stroke="#aaa" strokeWidth="1" strokeDasharray="2,2"/><circle cx="22" cy="20" r="1.5" fill="#888"/></svg>;
    case "door-left": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="16" y="8" width="16" height="24" rx="1" fill="#f5f0e8" stroke="#888" strokeWidth="1.5"/><path d="M 32 8 Q 16 8 16 24" fill="none" stroke="#aaa" strokeWidth="1" strokeDasharray="2,2"/><circle cx="18" cy="20" r="1.5" fill="#888"/></svg>;
    case "dance-area": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="5" y="5" width="30" height="30" rx="2" fill="#fdf6e3" stroke="#d4a017" strokeWidth="1.5"/><line x1="5" y1="15" x2="35" y2="15" stroke="#f0d080" strokeWidth="1"/><line x1="5" y1="25" x2="35" y2="25" stroke="#f0d080" strokeWidth="1"/><line x1="15" y1="5" x2="15" y2="35" stroke="#f0d080" strokeWidth="1"/><line x1="25" y1="5" x2="25" y2="35" stroke="#f0d080" strokeWidth="1"/></svg>;
    case "dance-area-2": return <svg width={s} height={s} viewBox="0 0 40 40"><polygon points="20,4 36,14 36,26 20,36 4,26 4,14" fill="#fdf6e3" stroke="#d4a017" strokeWidth="1.5"/></svg>;
    case "stage": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="5" y="10" width="30" height="18" rx="1" fill="#e8e0d0" stroke="#888" strokeWidth="1.5"/><rect x="8" y="28" width="4" height="4" fill="#ccc" stroke="#999" strokeWidth="1"/><rect x="28" y="28" width="4" height="4" fill="#ccc" stroke="#999" strokeWidth="1"/></svg>;
    case "tent": return <svg width={s} height={s} viewBox="0 0 40 40"><polygon points="20,4 36,30 4,30" fill="#e8f0e8" stroke="#5a8a5a" strokeWidth="1.5"/><line x1="20" y1="4" x2="20" y2="30" stroke="#5a8a5a" strokeWidth="1" strokeDasharray="2,2"/></svg>;
    case "disability": return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="8" r="3.5" fill="#4a90d9" /><path d="M20 12 L20 24 L14 32" stroke="#4a90d9" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M20 24 L26 32" stroke="#4a90d9" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M16 17 L26 17" stroke="#4a90d9" strokeWidth="2" fill="none"/></svg>;
    case "highchair": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="12" y="8" width="16" height="12" rx="2" fill="#f5efe6" stroke="#888" strokeWidth="1.5"/><line x1="14" y1="20" x2="12" y2="34" stroke="#888" strokeWidth="2"/><line x1="26" y1="20" x2="28" y2="34" stroke="#888" strokeWidth="2"/><line x1="12" y1="27" x2="28" y2="27" stroke="#888" strokeWidth="1.5"/><text x="20" y="17" textAnchor="middle" fontSize="8" fill="#888">+</text></svg>;
    case "toilet": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="13" y="8" width="14" height="10" rx="2" fill="#e8f0f8" stroke="#888" strokeWidth="1.5"/><path d="M13 18 Q10 32 20 32 Q30 32 27 18 Z" fill="#e8f0f8" stroke="#888" strokeWidth="1.5"/></svg>;
    case "toilet-booth": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" rx="2" fill="#f0f4f8" stroke="#888" strokeWidth="1.5"/><line x1="20" y1="6" x2="20" y2="34" stroke="#aaa" strokeWidth="1"/><rect x="10" y="20" width="8" height="12" rx="1" fill="#e8f0f8" stroke="#888" strokeWidth="1"/><rect x="22" y="20" width="8" height="12" rx="1" fill="#e8f0f8" stroke="#888" strokeWidth="1"/></svg>;
    case "arrow": return <svg width={s} height={s} viewBox="0 0 40 40"><polygon points="20,6 34,20 26,20 26,34 14,34 14,20 6,20" fill="#6b7280" stroke="#555" strokeWidth="1"/></svg>;
    case "target": return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="#e53e3e" strokeWidth="1.5"/><circle cx="20" cy="20" r="10" fill="none" stroke="#e53e3e" strokeWidth="1.5"/><circle cx="20" cy="20" r="5" fill="#e53e3e"/></svg>;
    case "caution": return <svg width={s} height={s} viewBox="0 0 40 40"><polygon points="20,4 36,34 4,34" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/><text x="20" y="30" textAnchor="middle" fontSize="18" fill="#92400e" fontWeight="bold">!</text></svg>;
    case "compass": return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="white" stroke="#888" strokeWidth="1.5"/><polygon points="20,6 23,20 20,22 17,20" fill="#e53e3e"/><polygon points="20,34 23,20 20,22 17,20" fill="#888"/><text x="20" y="10" textAnchor="middle" fontSize="6" fill="#555">N</text><text x="20" y="37" textAnchor="middle" fontSize="6" fill="#555">S</text></svg>;
    case "fan": return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="20" r="3" fill="#888" stroke="#555" strokeWidth="1"/>{[0, 90, 180, 270].map(deg => <path key={deg} d={`M 20 20 Q ${20 + 12 * Math.cos((deg - 30) * Math.PI / 180)} ${20 + 12 * Math.sin((deg - 30) * Math.PI / 180)} ${20 + 14 * Math.cos(deg * Math.PI / 180)} ${20 + 14 * Math.sin(deg * Math.PI / 180)} Q ${20 + 12 * Math.cos((deg + 30) * Math.PI / 180)} ${20 + 12 * Math.sin((deg + 30) * Math.PI / 180)} 20 20`} fill="#b0c4de" stroke="#888" strokeWidth="0.5"/>)}</svg>;
    case "ac": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="5" y="12" width="30" height="16" rx="3" fill="#e8f0f8" stroke="#888" strokeWidth="1.5"/>{[1,2,3,4,5].map(i => <line key={i} x1={5 + i * 5} y1="22" x2={5 + i * 5} y2="28" stroke="#aaa" strokeWidth="1"/>)}</svg>;
    case "heater": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="8" y="10" width="24" height="20" rx="2" fill="#fef0e0" stroke="#c4a060" strokeWidth="1.5"/>{[1,2,3,4].map(i => <rect key={i} x={7 + i * 5} y="12" width="3" height="16" rx="1" fill="#f0c070" stroke="#c4a060" strokeWidth="0.5"/>)}</svg>;
    case "water": return <svg width={s} height={s} viewBox="0 0 40 40"><path d="M 20 6 Q 28 18 28 24 A 8 8 0 0 1 12 24 Q 12 18 20 6 Z" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5"/></svg>;
    case "light": return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="20" r="8" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5"/>{[0,45,90,135,180,225,270,315].map(d => <line key={d} x1={20 + 10 * Math.cos(d * Math.PI / 180)} y1={20 + 10 * Math.sin(d * Math.PI / 180)} x2={20 + 15 * Math.cos(d * Math.PI / 180)} y2={20 + 15 * Math.sin(d * Math.PI / 180)} stroke="#f59e0b" strokeWidth="1.5"/>)}</svg>;
    case "sound": return <svg width={s} height={s} viewBox="0 0 40 40"><polygon points="6,14 14,14 22,8 22,32 14,26 6,26" fill="#6b7280" stroke="#555" strokeWidth="1"/><path d="M 26 14 Q 32 20 26 26" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/><path d="M 28 10 Q 36 20 28 30" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>;
    case "microphone": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="15" y="5" width="10" height="18" rx="5" fill="#e8e0d0" stroke="#888" strokeWidth="1.5"/><path d="M 10 20 Q 10 30 20 30 Q 30 30 30 20" fill="none" stroke="#888" strokeWidth="1.5"/><line x1="20" y1="30" x2="20" y2="36" stroke="#888" strokeWidth="1.5"/><line x1="14" y1="36" x2="26" y2="36" stroke="#888" strokeWidth="1.5"/></svg>;
    case "smoke": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="10" y="22" width="20" height="12" rx="2" fill="#9ca3af" stroke="#6b7280" strokeWidth="1.5"/><path d="M 14 22 Q 12 16 16 14 Q 20 12 18 8" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/><path d="M 22 22 Q 24 14 20 10" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/></svg>;
    case "laser": return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="20" r="4" fill="#ef4444"/>{[0,30,60,90,120,150,180,210,240,270,300,330].map(d => <line key={d} x1={20 + 6 * Math.cos(d * Math.PI / 180)} y1={20 + 6 * Math.sin(d * Math.PI / 180)} x2={20 + 16 * Math.cos(d * Math.PI / 180)} y2={20 + 16 * Math.sin(d * Math.PI / 180)} stroke="#ef4444" strokeWidth="0.8" opacity="0.7"/>)}</svg>;
    case "firework": return <svg width={s} height={s} viewBox="0 0 40 40">{[0,36,72,108,144,180,216,252,288,324].map(d => <line key={d} x1="20" y1="20" x2={20 + 16 * Math.cos((d - 90) * Math.PI / 180)} y2={20 + 16 * Math.sin((d - 90) * Math.PI / 180)} stroke={["#ef4444","#f59e0b","#10b981","#3b82f6","#a855f7"][Math.floor(d/72) % 5]} strokeWidth="2" strokeLinecap="round"/>)}</svg>;
    case "cake": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="8" y="22" width="24" height="12" rx="1" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5"/><rect x="12" y="14" width="16" height="10" rx="1" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.2"/><line x1="14" y1="10" x2="14" y2="14" stroke="#f59e0b" strokeWidth="2"/><line x1="20" y1="8" x2="20" y2="14" stroke="#f59e0b" strokeWidth="2"/><line x1="26" y1="10" x2="26" y2="14" stroke="#f59e0b" strokeWidth="2"/></svg>;
    case "gifts": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="8" y="18" width="22" height="16" rx="1" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5"/><rect x="8" y="14" width="22" height="6" rx="1" fill="#fca5a5" stroke="#ef4444" strokeWidth="1"/><line x1="19" y1="14" x2="19" y2="34" stroke="#ef4444" strokeWidth="1"/><path d="M 19 14 Q 14 8 12 12 Q 10 16 19 14" fill="#ef4444"/><path d="M 19 14 Q 24 8 26 12 Q 28 16 19 14" fill="#ef4444"/></svg>;
    case "outlet": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="8" y="8" width="24" height="24" rx="3" fill="#f3f4f6" stroke="#6b7280" strokeWidth="1.5"/><circle cx="15" cy="18" r="2.5" fill="#6b7280"/><circle cx="25" cy="18" r="2.5" fill="#6b7280"/><path d="M 14 22 Q 20 28 26 22" fill="none" stroke="#6b7280" strokeWidth="1.2"/></svg>;
    case "dj": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="4" y="12" width="32" height="16" rx="2" fill="#1f2937" stroke="#374151" strokeWidth="1.5"/>{[8,14,20,26,32].map(x => <circle key={x} cx={x} cy="20" r="3" fill="#6b7280"/>)}<rect x="4" y="28" width="32" height="4" rx="1" fill="#111827"/></svg>;
    case "grand-piano": return <svg width={s} height={s} viewBox="0 0 40 40"><path d="M 6 30 L 6 14 Q 6 6 18 6 L 34 10 L 34 30 Q 26 34 6 30 Z" fill="#1f2937" stroke="#374151" strokeWidth="1.5"/><path d="M 6 30 L 6 14 Q 6 6 18 6 L 34 10 L 34 14 Q 14 10 10 18 L 8 30 Z" fill="#374151"/></svg>;
    case "piano": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="22" rx="2" fill="#1f2937" stroke="#374151" strokeWidth="1.5"/>{[8,12,16,20,24,28,32].map((x, i) => <rect key={x} x={x} y="8" width="3" height="14" rx="0.5" fill="white"/>)}{[9.5,13.5,21.5,25.5,29.5].map(x => <rect key={x} x={x} y="8" width="2" height="9" rx="0.5" fill="#374151"/>)}<rect x="8" y="28" width="24" height="6" rx="1" fill="#374151" stroke="#1f2937" strokeWidth="0.5"/></svg>;
    case "tree-1": return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="17" r="13" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/><rect x="17" y="28" width="6" height="8" rx="1" fill="#92400e"/></svg>;
    case "tree-2": return <svg width={s} height={s} viewBox="0 0 40 40"><polygon points="20,4 32,22 8,22" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/><polygon points="20,14 34,32 6,32" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5"/><rect x="17" y="32" width="6" height="6" rx="1" fill="#92400e"/></svg>;
    case "tree-3": return <svg width={s} height={s} viewBox="0 0 40 40"><ellipse cx="20" cy="16" rx="10" ry="13" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/><rect x="17" y="28" width="6" height="8" rx="1" fill="#92400e"/></svg>;
    case "tree-4": return <svg width={s} height={s} viewBox="0 0 40 40"><polygon points="20,4 30,18 8,18" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/><polygon points="20,12 32,26 8,26" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5"/><polygon points="20,20 34,34 6,34" fill="#16a34a" stroke="#15803d" strokeWidth="1.5"/><rect x="17" y="34" width="6" height="4" rx="1" fill="#92400e"/></svg>;
    case "tree-palm": return <svg width={s} height={s} viewBox="0 0 40 40"><line x1="22" y1="36" x2="20" y2="16" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/><path d="M 20 16 Q 10 10 6 14 Q 10 6 20 16" fill="#22c55e" stroke="#16a34a" strokeWidth="1"/><path d="M 20 16 Q 30 10 34 14 Q 30 6 20 16" fill="#22c55e" stroke="#16a34a" strokeWidth="1"/><path d="M 20 16 Q 10 18 8 24 Q 14 16 20 16" fill="#4ade80" stroke="#16a34a" strokeWidth="1"/><path d="M 20 16 Q 30 18 32 24 Q 26 16 20 16" fill="#4ade80" stroke="#16a34a" strokeWidth="1"/></svg>;
    case "tree-pine": return <svg width={s} height={s} viewBox="0 0 40 40"><polygon points="20,4 28,14 24,14 30,22 25,22 32,32 8,32 15,22 10,22 16,14 12,14" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/><rect x="17" y="32" width="6" height="6" rx="1" fill="#92400e"/></svg>;
    case "tree-round": return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="18" r="13" fill="#86efac" stroke="#16a34a" strokeWidth="1.5"/><circle cx="15" cy="14" r="6" fill="#4ade80" stroke="#22c55e" strokeWidth="1"/><circle cx="25" cy="16" r="5" fill="#4ade80" stroke="#22c55e" strokeWidth="1"/><rect x="17" y="29" width="6" height="7" rx="1" fill="#92400e"/></svg>;
    case "tree-big": return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="15" r="14" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5"/><rect x="16" y="28" width="8" height="8" rx="1" fill="#92400e"/></svg>;
    case "hedge-1": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="4" y="16" width="32" height="12" rx="6" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/></svg>;
    case "hedge-2": return <svg width={s} height={s} viewBox="0 0 40 40">{[4,13,22].map(x => <circle key={x} cx={x + 7} cy="22" r="7" fill="#4ade80" stroke="#16a34a" strokeWidth="1.2"/>)}</svg>;
    case "hedge-3": return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="4" y="12" width="32" height="18" rx="2" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>{[8,14,20,26,32].map(x => <circle key={x} cx={x} cy="12" r="4" fill="#22c55e" stroke="#16a34a" strokeWidth="1"/>)}</svg>;
    default: return <svg width={s} height={s} viewBox="0 0 40 40"><rect x="8" y="8" width="24" height="24" rx="4" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.5"/></svg>;
  }
}

// ─── Canvas Asset Element ─────────────────────────────────────────────────────

function AssetCanvasElement({ el, isSelected, onMouseDown }: {
  el: CeremonyElement; isSelected: boolean; onMouseDown: (e: React.MouseEvent) => void;
}) {
  const w = el.width;
  const h = el.height ?? el.width;
  return (
    <div
      style={{ position: "absolute", left: el.x, top: el.y, width: w, height: h, transform: `rotate(${el.angle}deg)`, transformOrigin: "center center", cursor: "grab", outline: isSelected ? "2px dashed #7c3aed" : "none", outlineOffset: 4 }}
      onMouseDown={onMouseDown}
    >
      <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AssetIcon type={el.assetType ?? "label"} size={Math.min(w, h) * 0.9} />
      </div>
      {isSelected && <>
        <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "crosshair" }} />
        <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "ew-resize" }} />
      </>}
    </div>
  );
}

// ─── Add Element Panel ────────────────────────────────────────────────────────

interface ElementDef {
  kind: ElementKind;
  assetType?: string;
  label: string;
  preview: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultSeats?: number;
}

function TablePreview({ kind, w = 72, h = 56, seats = 6 }: { kind: ElementKind; w?: number; h?: number; seats?: number }) {
  const pos = getTableSeatPositions(kind, w * 0.55, h * 0.45, seats);
  const tw = w * 0.55;
  const th = h * 0.45;
  const px = w * 0.225;
  const py = h * 0.225;
  const hasSeat = !kind.startsWith("buffet-");

  const tableBody = () => {
    if (kind === "table-round" || kind === "buffet-round")
      return <circle cx={px + tw / 2} cy={py + th / 2} r={tw / 2} fill="#e8d8c0" stroke="#8b7355" strokeWidth="1.2" />;
    if (kind === "table-ellipse" || kind === "buffet-ellipse")
      return <ellipse cx={px + tw / 2} cy={py + th / 2} rx={tw / 2} ry={th / 2} fill="#e8d8c0" stroke="#8b7355" strokeWidth="1.2" />;
    if (kind === "table-halfround")
      return <path d={`M ${px} ${py + tw / 2} A ${tw / 2} ${tw / 2} 0 0 1 ${px + tw} ${py + tw / 2} Z`} fill="#e8d8c0" stroke="#8b7355" strokeWidth="1.2" />;
    return <rect x={px} y={py} width={tw} height={th} rx="2" fill="#e8d8c0" stroke="#8b7355" strokeWidth="1.2" />;
  };

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      {tableBody()}
      {hasSeat && pos.map((p, i) => (
        <circle key={i} cx={px + p.cx} cy={py + p.cy} r={5} fill="white" stroke="#d1d5db" strokeWidth="1" />
      ))}
    </svg>
  );
}

function getElementCategories(): { label: string; items: ElementDef[] }[] {
  return [
    {
      label: "Tables with seats",
      items: [
        { kind: "table-long", label: "Long table", defaultWidth: 140, defaultHeight: 36, defaultSeats: 8, preview: <TablePreview kind="table-long" w={72} h={52} seats={6} /> },
        { kind: "table-square", label: "Square table", defaultWidth: 80, defaultHeight: 80, defaultSeats: 8, preview: <TablePreview kind="table-square" w={64} h={64} seats={8} /> },
        { kind: "table-round", label: "Round table", defaultWidth: 80, defaultHeight: 80, defaultSeats: 8, preview: <TablePreview kind="table-round" w={64} h={64} seats={8} /> },
        { kind: "table-ellipse", label: "Ellipse table", defaultWidth: 110, defaultHeight: 70, defaultSeats: 8, preview: <TablePreview kind="table-ellipse" w={72} h={60} seats={8} /> },
        { kind: "table-halfround", label: "Half Round table", defaultWidth: 80, defaultHeight: 40, defaultSeats: 5, preview: <TablePreview kind="table-halfround" w={64} h={52} seats={5} /> },
        { kind: "row", label: "Row of Chairs", defaultWidth: 5 * spacingToPx(60) + CHAIR_R * 2, defaultSeats: 5, preview: (
          <svg width="72" height="32" viewBox="0 0 72 32">
            <line x1="8" y1="16" x2="64" y2="16" stroke="#d1d5db" strokeWidth="1"/>
            {[8,20,32,44,56,68].slice(0,5).map(x => <circle key={x} cx={x + 4} cy="16" r="6" fill="white" stroke="#d1d5db" strokeWidth="1"/>)}
          </svg>
        )},
      ],
    },
    {
      label: "Tables without seats for buffet",
      items: [
        { kind: "buffet-long", label: "Long table", defaultWidth: 140, defaultHeight: 36, preview: <TablePreview kind="buffet-long" w={72} h={40} seats={0} /> },
        { kind: "buffet-square", label: "Square table", defaultWidth: 80, defaultHeight: 80, preview: <TablePreview kind="buffet-square" w={56} h={56} seats={0} /> },
        { kind: "buffet-round", label: "Round table", defaultWidth: 80, defaultHeight: 80, preview: <TablePreview kind="buffet-round" w={56} h={56} seats={0} /> },
        { kind: "buffet-ellipse", label: "Ellipse table", defaultWidth: 110, defaultHeight: 70, preview: <TablePreview kind="buffet-ellipse" w={68} h={52} seats={0} /> },
      ],
    },
    {
      label: "Custom elements",
      items: [
        { kind: "arch", label: "Upload custom SVG", preview: (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <Upload className="h-7 w-7" />
          </div>
        )},
        { kind: "aisle", label: "Ruler", defaultWidth: 120, defaultHeight: 10, preview: (
          <svg width="72" height="30" viewBox="0 0 72 30">
            <rect x="4" y="11" width="64" height="8" rx="1" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2"/>
            {[4,14,24,34,44,54,64].map(x => <line key={x} x1={x} y1="11" x2={x} y2={x % 20 === 4 ? "7" : "14"} stroke="#9ca3af" strokeWidth="1"/>)}
          </svg>
        )},
      ],
    },
    {
      label: "Other assets",
      items: [
        { kind: "asset", assetType: "label", label: "Label", preview: <AssetIcon type="label" /> },
        { kind: "asset", assetType: "pillar", label: "Pillar", preview: <AssetIcon type="pillar" /> },
        { kind: "asset", assetType: "wall", label: "Straight wall", preview: <AssetIcon type="wall" /> },
        { kind: "asset", assetType: "door-right", label: "Right Door", preview: <AssetIcon type="door-right" /> },
        { kind: "asset", assetType: "door-left", label: "Left Door", preview: <AssetIcon type="door-left" /> },
        { kind: "asset", assetType: "dance-area", label: "Dance Area", preview: <AssetIcon type="dance-area" /> },
        { kind: "asset", assetType: "dance-area-2", label: "Dance Area 2", preview: <AssetIcon type="dance-area-2" /> },
        { kind: "asset", assetType: "stage", label: "Stage", preview: <AssetIcon type="stage" /> },
        { kind: "asset", assetType: "tent", label: "Tent", preview: <AssetIcon type="tent" /> },
        { kind: "asset", assetType: "disability", label: "Disability sign", preview: <AssetIcon type="disability" /> },
        { kind: "asset", assetType: "highchair", label: "High chair sign", preview: <AssetIcon type="highchair" /> },
        { kind: "asset", assetType: "toilet", label: "Toilet sign", preview: <AssetIcon type="toilet" /> },
        { kind: "asset", assetType: "toilet-booth", label: "Toilet booth", preview: <AssetIcon type="toilet-booth" /> },
        { kind: "asset", assetType: "arrow", label: "Arrow", preview: <AssetIcon type="arrow" /> },
        { kind: "asset", assetType: "target", label: "Target", preview: <AssetIcon type="target" /> },
        { kind: "asset", assetType: "caution", label: "Caution sign", preview: <AssetIcon type="caution" /> },
        { kind: "asset", assetType: "compass", label: "Compass", preview: <AssetIcon type="compass" /> },
        { kind: "asset", assetType: "fan", label: "Fan", preview: <AssetIcon type="fan" /> },
        { kind: "asset", assetType: "ac", label: "Air conditioner", preview: <AssetIcon type="ac" /> },
        { kind: "asset", assetType: "heater", label: "Heater", preview: <AssetIcon type="heater" /> },
        { kind: "asset", assetType: "water", label: "Water", preview: <AssetIcon type="water" /> },
        { kind: "asset", assetType: "light", label: "Light", preview: <AssetIcon type="light" /> },
        { kind: "asset", assetType: "sound", label: "Sound", preview: <AssetIcon type="sound" /> },
        { kind: "asset", assetType: "microphone", label: "Microphone", preview: <AssetIcon type="microphone" /> },
        { kind: "asset", assetType: "smoke", label: "Smoke machine", preview: <AssetIcon type="smoke" /> },
        { kind: "asset", assetType: "laser", label: "Laser", preview: <AssetIcon type="laser" /> },
        { kind: "asset", assetType: "firework", label: "Firework", preview: <AssetIcon type="firework" /> },
        { kind: "asset", assetType: "cake", label: "Cake", preview: <AssetIcon type="cake" /> },
        { kind: "asset", assetType: "gifts", label: "Gifts", preview: <AssetIcon type="gifts" /> },
        { kind: "asset", assetType: "outlet", label: "Electrical outlet", preview: <AssetIcon type="outlet" /> },
        { kind: "asset", assetType: "dj", label: "DJ controller", preview: <AssetIcon type="dj" /> },
        { kind: "asset", assetType: "grand-piano", label: "Grand Piano", preview: <AssetIcon type="grand-piano" /> },
        { kind: "asset", assetType: "piano", label: "Piano", preview: <AssetIcon type="piano" /> },
        { kind: "asset", assetType: "tree-1", label: "Tree", preview: <AssetIcon type="tree-1" /> },
        { kind: "asset", assetType: "tree-2", label: "Tree 2", preview: <AssetIcon type="tree-2" /> },
        { kind: "asset", assetType: "tree-3", label: "Tree 3", preview: <AssetIcon type="tree-3" /> },
        { kind: "asset", assetType: "tree-4", label: "Tree 4", preview: <AssetIcon type="tree-4" /> },
        { kind: "asset", assetType: "tree-palm", label: "Palm Tree", preview: <AssetIcon type="tree-palm" /> },
        { kind: "asset", assetType: "tree-pine", label: "Pine Tree", preview: <AssetIcon type="tree-pine" /> },
        { kind: "asset", assetType: "tree-round", label: "Round Tree", preview: <AssetIcon type="tree-round" /> },
        { kind: "asset", assetType: "tree-big", label: "Big Tree", preview: <AssetIcon type="tree-big" /> },
        { kind: "asset", assetType: "hedge-1", label: "Hedge", preview: <AssetIcon type="hedge-1" /> },
        { kind: "asset", assetType: "hedge-2", label: "Hedge 2", preview: <AssetIcon type="hedge-2" /> },
        { kind: "asset", assetType: "hedge-3", label: "Hedge 3", preview: <AssetIcon type="hedge-3" /> },
      ],
    },
  ];
}

function AddElementPanel({ onAdd, onClose }: {
  onAdd: (def: ElementDef) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const categories = getElementCategories();

  const filtered = query.trim()
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
      })).filter(cat => cat.items.length > 0)
    : categories;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel — slides in from right, similar to reference */}
      <div className="relative ml-auto flex h-full w-80 flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
          <span className="text-sm font-semibold text-gray-700">Add element</span>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search elements..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Scrollable categories */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(cat => (
            <div key={cat.label} className="border-b border-gray-100">
              <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{cat.label}</div>
              <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                {cat.items.map(item => (
                  <button
                    key={`${item.kind}-${item.assetType ?? ""}`}
                    onClick={() => onAdd(item)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 p-2 transition-colors hover:border-purple-200 hover:bg-purple-50"
                  >
                    <div className="flex h-14 w-14 items-center justify-center">
                      {item.preview}
                    </div>
                    <span className="w-full text-center text-[10px] leading-tight text-gray-600">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
              <Search className="h-8 w-8 opacity-40" />
              <p className="text-sm">No elements found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Right panel components ──────────────────────────────────────────────────

function PanelSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-gray-100">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">
        <span>{label}</span>
        <ChevronRight className={cn("h-4 w-4 text-gray-400 transition-transform", open && "rotate-90")} />
      </button>
      {open && <div className="px-4 pb-3 text-sm text-gray-500">{children}</div>}
    </div>
  );
}

function PropRow({ label, value, unit, onChange }: { label: string; value: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-[11px] text-gray-400">{label}</p>
      <div className="flex items-center gap-2">
        <input type="number" value={Math.round(value * 100) / 100} onChange={e => onChange(parseFloat(e.target.value) || 0)} className="h-8 w-full rounded border border-gray-200 px-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400" />
        {unit && <span className="shrink-0 text-xs text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}

function LockButtons({ active }: { active?: "rotation" | "move" | "size" }) {
  const btns = [
    { key: "rotation", icon: <RotateCw className="h-3.5 w-3.5" />, label: "Rotation" },
    { key: "move", icon: <Move className="h-3.5 w-3.5" />, label: "Move" },
    { key: "size", icon: <Maximize2 className="h-3.5 w-3.5" />, label: "Size" },
  ] as const;
  return (
    <div className="mb-4 flex gap-1.5">
      {btns.map(b => (
        <button key={b.key} className={cn("flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 text-[10px] font-medium transition-colors", b.key === active ? "border-purple-400 bg-purple-600 text-white" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50")}>
          {b.icon}{b.label}
        </button>
      ))}
    </div>
  );
}

function LayerBtn({ label, chevron }: { label: string; chevron: "up" | "down" }) {
  return (
    <button className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
      <span>{label}</span>
      <ChevronRight className={cn("h-4 w-4 text-gray-400", chevron === "up" ? "rotate-[-90deg]" : "rotate-90")} />
    </button>
  );
}

function ActionRow({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50", danger ? "text-red-500" : "text-gray-600")}>
      {icon}{label}
    </button>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

interface Snapshot {
  label: string;
  timestamp: number;
  elements: CeremonyElement[];
}

export default function CeremonyLayoutEditPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const storageKey = `ceremony-layout-${projectId}`;

  const [elements, setElements] = useState<CeremonyElement[]>(() => {
    if (typeof window === "undefined") return buildInitElements();
    try {
      const saved = localStorage.getItem(`ceremony-layout-${projectId}`);
      if (saved) return JSON.parse(saved) as CeremonyElement[];
    } catch {}
    return buildInitElements();
  });

  const [selection, setSelection] = useState<Selection>(null);
  const [zoom, setZoom] = useState(0.82);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [nameDisplay, setNameDisplay] = useState<"full" | "initials" | "first">("full");
  const [coloredIcons, setColoredIcons] = useState(true);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`snapshots-ceremony-${projectId}`);
      if (raw) return JSON.parse(raw) as Snapshot[];
    } catch {}
    return [];
  });
  const [venueImage, setVenueImage] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem(`venue-bg-ceremony-${projectId}`); } catch { return null; }
  });
  const [venueOpacity, setVenueOpacity] = useState(0.35);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startMx: number; startMy: number; origX: number; origY: number } | null>(null);
  const panRef = useRef<{ startMx: number; startMy: number; origPan: { x: number; y: number } } | null>(null);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(elements)); } catch {}
  }, [elements, storageKey]);

  useEffect(() => {
    try { localStorage.setItem(`snapshots-ceremony-${projectId}`, JSON.stringify(snapshots)); } catch {}
  }, [snapshots, projectId]);

  useEffect(() => {
    if (venueImage) {
      try { localStorage.setItem(`venue-bg-ceremony-${projectId}`, venueImage); } catch {}
    } else {
      try { localStorage.removeItem(`venue-bg-ceremony-${projectId}`); } catch {}
    }
  }, [venueImage, projectId]);

  useEffect(() => {
    if (!projectId) return;
    if (projectId.startsWith("local-")) {
      const gs = getLocalGuests(projectId) as unknown as Guest[];
      setGuests(gs ?? []);
    } else {
      fetch(`/api/planner/projects/${projectId}/guests`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.guests) setGuests(d.guests); })
        .catch(() => {});
    }
  }, [projectId]);

  const onElementMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const el = elements.find(x => x.id === id);
    if (!el) return;
    dragRef.current = { id, startMx: e.clientX, startMy: e.clientY, origX: el.x, origY: el.y };
    setSelection({ kind: "element", id });
  }, [elements]);

  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      panRef.current = { startMx: e.clientX, startMy: e.clientY, origPan: pan };
    } else {
      setSelection(null);
    }
  }, [pan]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragRef.current) {
      const dx = (e.clientX - dragRef.current.startMx) / zoom;
      const dy = (e.clientY - dragRef.current.startMy) / zoom;
      const { id, origX, origY } = dragRef.current;
      setElements(prev => prev.map(el => el.id === id ? { ...el, x: origX + dx, y: origY + dy } : el));
    }
    if (panRef.current) {
      const dx = e.clientX - panRef.current.startMx;
      const dy = e.clientY - panRef.current.startMy;
      setPan({ x: panRef.current.origPan.x + dx, y: panRef.current.origPan.y + dy });
    }
  }, [zoom]);

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
    panRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.25, z - e.deltaY * 0.001)));
  }, []);

  function updateElement(id: string, patch: Partial<CeremonyElement>) {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...patch } : el));
  }

  function deleteElement(id: string) {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelection(null);
  }

  function duplicateElement(id: string) {
    const el = elements.find(x => x.id === id);
    if (!el) return;
    const newEl: CeremonyElement = { ...el, id: `${el.id}-copy-${Date.now()}`, x: el.x + 20, y: el.y + 20 };
    setElements(prev => [...prev, newEl]);
    setSelection({ kind: "element", id: newEl.id });
  }

  function assignGuest(elementId: string, seatIndex: number, guestId: string | null) {
    setElements(prev => prev.map(el => {
      if (el.id !== elementId || !el.guestIds) return el;
      const guestIds = [...el.guestIds];
      guestIds[seatIndex] = guestId;
      return { ...el, guestIds };
    }));
  }

  function saveSnapshot() {
    const n = snapshots.length + 1;
    const snap: Snapshot = { label: `Snapshot ${n}`, timestamp: Date.now(), elements: JSON.parse(JSON.stringify(elements)) };
    setSnapshots(prev => {
      const updated = [snap, ...prev];
      return updated.slice(0, 5);
    });
  }

  function restoreSnapshot(snap: Snapshot) {
    setElements(snap.elements);
    setShowHistory(false);
  }

  function handleVenueUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setVenueImage(result);
    };
    reader.readAsDataURL(file);
  }

  function formatSnapshotTime(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    if (isToday) return `Today ${hh}:${mm}`;
    return `${d.toLocaleDateString()} ${hh}:${mm}`;
  }

  function handleAddElement(def: ElementDef) {
    const id = `el-${Date.now()}`;
    const w = def.defaultWidth ?? 80;
    const h = def.defaultHeight ?? w;
    const seats = def.defaultSeats ?? 0;

    let newEl: CeremonyElement;

    if (def.kind === "row") {
      const s = seats || 5;
      const sp = 60;
      const rw = (s - 1) * spacingToPx(sp) + CHAIR_R * 2;
      newEl = { id, kind: "row", x: PAPER_CX - rw / 2, y: 400, width: rw, angle: 0, seats: s, spacing: sp, guestIds: Array(s).fill(null) };
    } else if (def.kind === "aisle") {
      newEl = { id, kind: "aisle", x: PAPER_CX - 55, y: 300, width: 110, height: 300, angle: 0, name: "Aisle" };
    } else if (def.kind === "arch") {
      newEl = { id, kind: "arch", x: PAPER_CX - 105, y: 22, width: 210, angle: 0, borderColor: "#111" };
    } else if (def.kind === "asset") {
      newEl = { id, kind: "asset", x: PAPER_CX - 20, y: 400, width: 40, height: 40, angle: 0, assetType: def.assetType };
    } else {
      // table kinds
      newEl = { id, kind: def.kind, x: PAPER_CX - w / 2, y: 400, width: w, height: h, angle: 0, seats, guestIds: Array(seats).fill(null) };
    }

    setElements(prev => [...prev, newEl]);
    setSelection({ kind: "element", id });
    setShowAddPanel(false);
  }

  const selectedElement = selection?.kind === "element" ? elements.find(e => e.id === selection.id) ?? null : null;
  const selectedSeatEl = selection?.kind === "seat" ? elements.find(e => e.id === selection.elementId) ?? null : null;
  const selectedSeatIndex = selection?.kind === "seat" ? selection.seatIndex : null;
  const selectedSeatGuestId = selectedSeatEl && selectedSeatIndex != null ? (selectedSeatEl.guestIds?.[selectedSeatIndex] ?? null) : null;
  const unassignedGuests = guests.filter(g => !elements.some(el => el.guestIds?.includes(g.id)));

  function renderRightPanel() {
    if (selection?.kind === "seat" && selectedSeatEl) {
      const seatIdx = selection.seatIndex;
      const guestId = selectedSeatEl.guestIds?.[seatIdx] ?? null;
      const assignedGuest = guests.find(g => g.id === guestId) ?? null;
      return (
        <div className="flex flex-col divide-y divide-gray-100">
          <div className="px-4 py-4 text-center font-semibold text-gray-700">Table</div>
          <div className="flex flex-col items-center gap-2 px-4 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-purple-300 text-xs text-purple-400">
              {assignedGuest ? <span className="px-1 text-center text-[10px] font-semibold leading-tight text-purple-700">{assignedGuest.firstName}</span> : "Vacant seat"}
            </div>
            <button onClick={() => assignGuest(selectedSeatEl.id, seatIdx, null)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"><X className="h-3 w-3" /> Release seat</button>
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"><Eye className="h-3 w-3" /> Hide this seat from layout</button>
          </div>
          <div className="px-4 py-3">
            <p className="mb-2 text-xs font-medium text-gray-600">Guests with unassigned seats:</p>
            <select className="mb-2 w-full rounded border border-gray-200 py-1.5 text-xs text-gray-600 focus:outline-none"><option>All guests in the list</option></select>
            {unassignedGuests.length === 0 ? (
              <p className="py-2 text-center text-[11px] text-gray-400">All guests assigned</p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {unassignedGuests.map(g => (
                  <div key={g.id} className="flex items-center justify-between">
                    <span className="truncate text-xs text-gray-700">{g.firstName} {g.lastName}</span>
                    <button onClick={() => assignGuest(selectedSeatEl.id, seatIdx, g.id)} className="ml-2 shrink-0 rounded border border-gray-200 px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-50">Take a seat</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 px-4 py-3">
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700"><Plus className="h-3 w-3" /> Add a guest quickly</button>
            <span className="text-[11px] text-gray-400">or</span>
            <button className="text-xs text-purple-600 underline underline-offset-2 hover:text-purple-800">Open guest list</button>
          </div>
        </div>
      );
    }

    if (selectedElement?.kind === "arch") {
      return (
        <div className="flex flex-col divide-y divide-gray-100">
          <div className="px-4 py-4 font-semibold text-gray-700">Custom SVG</div>
          <div className="px-4 py-4">
            <PropRow label="Width" value={selectedElement.width * 0.53} unit="Inches" onChange={v => updateElement(selectedElement.id, { width: v / 0.53 })} />
            <PropRow label="Angle" value={selectedElement.angle} onChange={v => updateElement(selectedElement.id, { angle: v })} />
            <div className="mb-4"><p className="mb-1.5 text-[11px] text-gray-400">Border color</p><input type="color" value={selectedElement.borderColor ?? "#111111"} onChange={e => updateElement(selectedElement.id, { borderColor: e.target.value })} className="h-7 w-7 cursor-pointer rounded border border-gray-200 p-0.5" /></div>
            <LockButtons />
          </div>
          <div className="divide-y divide-gray-100">
            <LayerBtn label="Push to front layer" chevron="up" />
            <LayerBtn label="Push to back layer" chevron="down" />
            <ActionRow icon={<Copy className="h-3.5 w-3.5" />} label="Duplicate" onClick={() => duplicateElement(selectedElement.id)} />
            <ActionRow icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" danger onClick={() => deleteElement(selectedElement.id)} />
          </div>
        </div>
      );
    }

    if (selectedElement?.kind === "aisle") {
      return (
        <div className="flex flex-col divide-y divide-gray-100">
          <div className="px-4 py-4 font-semibold text-gray-700">Element</div>
          <div className="px-4 py-4">
            <div className="mb-3"><p className="mb-1 text-[11px] text-gray-400">Element name</p><input type="text" value={selectedElement.name ?? ""} onChange={e => updateElement(selectedElement.id, { name: e.target.value })} className="h-8 w-full rounded border border-gray-200 px-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400" /></div>
            <PropRow label="Width" value={selectedElement.width * 0.53} unit="Inches" onChange={v => updateElement(selectedElement.id, { width: v / 0.53 })} />
            <PropRow label="Height" value={(selectedElement.height ?? 100) * 0.53} unit="Inches" onChange={v => updateElement(selectedElement.id, { height: v / 0.53 })} />
            <PropRow label="Angle" value={selectedElement.angle} onChange={v => updateElement(selectedElement.id, { angle: v })} />
            <LockButtons active="move" />
          </div>
          <div className="divide-y divide-gray-100">
            <LayerBtn label="Push to front layer" chevron="up" />
            <LayerBtn label="Push to back layer" chevron="down" />
            <ActionRow icon={<Copy className="h-3.5 w-3.5" />} label="Duplicate" onClick={() => duplicateElement(selectedElement.id)} />
            <ActionRow icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" danger onClick={() => deleteElement(selectedElement.id)} />
          </div>
        </div>
      );
    }

    if (selectedElement?.kind === "row") {
      const spacing = selectedElement.spacing ?? 60;
      const seats = selectedElement.seats ?? 5;
      return (
        <div className="flex flex-col divide-y divide-gray-100">
          <div className="px-4 py-4 font-semibold text-gray-700">Row of Chairs</div>
          <div className="px-4 py-4">
            <p className="mb-2 text-[11px] text-gray-400">Space between seats</p>
            <input type="range" min={50} max={120} value={spacing} onChange={e => { const s = Number(e.target.value); const newW = (seats - 1) * spacingToPx(s) + CHAIR_R * 2; updateElement(selectedElement.id, { spacing: s, width: newW }); }} className="mb-1 w-full accent-purple-600" />
            <div className="mb-4 flex justify-between text-[10px] text-gray-400">{[50, 60, 70, 80, 90, 100, 110, 120].map(v => <span key={v}>{v}</span>)}</div>
            <PropRow label="Width" value={selectedElement.width * 0.53} unit="Inches" onChange={v => updateElement(selectedElement.id, { width: v / 0.53 })} />
            <PropRow label="Angle" value={selectedElement.angle} onChange={v => updateElement(selectedElement.id, { angle: v })} />
            <LockButtons />
          </div>
          <div className="divide-y divide-gray-100">
            <ActionRow icon={<Copy className="h-3.5 w-3.5" />} label="Duplicate" onClick={() => duplicateElement(selectedElement.id)} />
            <ActionRow icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" danger onClick={() => deleteElement(selectedElement.id)} />
          </div>
        </div>
      );
    }

    if (selectedElement && (selectedElement.kind.startsWith("table-") || selectedElement.kind.startsWith("buffet-"))) {
      const kindLabel = selectedElement.kind.replace("buffet-", "").replace("table-", "").replace("-", " ");
      return (
        <div className="flex flex-col divide-y divide-gray-100">
          <div className="px-4 py-4 font-semibold text-gray-700 capitalize">{selectedElement.kind.startsWith("buffet-") ? "Buffet " : ""}{kindLabel} table</div>
          <div className="px-4 py-4">
            {!selectedElement.kind.startsWith("buffet-") && (
              <div className="mb-3">
                <p className="mb-1 text-[11px] text-gray-400">Seats</p>
                <input type="number" min={1} max={30} value={selectedElement.seats ?? 8} onChange={e => { const s = Math.max(1, Number(e.target.value)); updateElement(selectedElement.id, { seats: s, guestIds: Array(s).fill(null) }); }} className="h-8 w-full rounded border border-gray-200 px-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400" />
              </div>
            )}
            <PropRow label="Width" value={selectedElement.width * 0.53} unit="Inches" onChange={v => updateElement(selectedElement.id, { width: v / 0.53 })} />
            <PropRow label="Height" value={(selectedElement.height ?? selectedElement.width) * 0.53} unit="Inches" onChange={v => updateElement(selectedElement.id, { height: v / 0.53 })} />
            <PropRow label="Angle" value={selectedElement.angle} onChange={v => updateElement(selectedElement.id, { angle: v })} />
            <LockButtons />
          </div>
          <div className="divide-y divide-gray-100">
            <LayerBtn label="Push to front layer" chevron="up" />
            <LayerBtn label="Push to back layer" chevron="down" />
            <ActionRow icon={<Copy className="h-3.5 w-3.5" />} label="Duplicate" onClick={() => duplicateElement(selectedElement.id)} />
            <ActionRow icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" danger onClick={() => deleteElement(selectedElement.id)} />
          </div>
        </div>
      );
    }

    if (selectedElement?.kind === "asset") {
      return (
        <div className="flex flex-col divide-y divide-gray-100">
          <div className="px-4 py-4 font-semibold text-gray-700 capitalize">{selectedElement.assetType?.replace(/-/g, " ") ?? "Asset"}</div>
          <div className="px-4 py-4">
            <PropRow label="Width" value={selectedElement.width * 0.53} unit="Inches" onChange={v => updateElement(selectedElement.id, { width: v / 0.53 })} />
            <PropRow label="Height" value={(selectedElement.height ?? selectedElement.width) * 0.53} unit="Inches" onChange={v => updateElement(selectedElement.id, { height: v / 0.53 })} />
            <PropRow label="Angle" value={selectedElement.angle} onChange={v => updateElement(selectedElement.id, { angle: v })} />
            <LockButtons />
          </div>
          <div className="divide-y divide-gray-100">
            <LayerBtn label="Push to front layer" chevron="up" />
            <LayerBtn label="Push to back layer" chevron="down" />
            <ActionRow icon={<Copy className="h-3.5 w-3.5" />} label="Duplicate" onClick={() => duplicateElement(selectedElement.id)} />
            <ActionRow icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" danger onClick={() => deleteElement(selectedElement.id)} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col divide-y divide-gray-100">
        {/* Venue Blueprint section */}
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-semibold text-gray-600">Venue Blueprint</p>
          {venueImage ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={venueImage} alt="Venue blueprint" className="w-full rounded border border-gray-200 object-contain" style={{ maxHeight: 80 }} />
              <div>
                <p className="mb-1 text-[11px] text-gray-400">Opacity</p>
                <input
                  type="range" min={0.1} max={1.0} step={0.05}
                  value={venueOpacity}
                  onChange={e => setVenueOpacity(parseFloat(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400"><span>10%</span><span>{Math.round(venueOpacity * 100)}%</span></div>
              </div>
              <button
                onClick={() => setVenueImage(null)}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Upload floor plan to use as background reference.</p>
          )}
        </div>
        <div className="bg-gray-50 px-4 py-3 text-sm font-semibold text-orange-500">How to display guests&apos; names</div>
        <div className="px-4 py-4">
          <div className="mb-3 flex gap-2">
            {([{ key: "full", label: "Full name", icon: "👤" }, { key: "initials", label: "Initials", icon: "🔵" }, { key: "first", label: "First name", icon: "👥" }] as const).map(opt => (
              <button key={opt.key} onClick={() => setNameDisplay(opt.key)} className={cn("flex flex-1 flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition-colors", nameDisplay === opt.key ? "border-purple-400 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:bg-gray-50")}>
                <span className="text-lg">{opt.icon}</span>
              </button>
            ))}
          </div>
          <p className="mb-3 text-xs text-gray-500">Display names as — <span className="font-medium text-gray-700">{nameDisplay === "full" ? "Full name" : nameDisplay === "initials" ? "Initials" : "First name"}</span></p>
          <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-gray-600"><input type="radio" name="iconMode" checked={coloredIcons} onChange={() => setColoredIcons(true)} className="accent-purple-600" />Person icons are colored</label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"><input type="radio" name="iconMode" checked={!coloredIcons} onChange={() => setColoredIcons(false)} className="accent-purple-600" />Person icons are generic</label>
        </div>
        <PanelSection label="Font scheme"><p className="text-gray-400">Font options coming soon.</p></PanelSection>
        <PanelSection label="Color scheme"><p className="text-gray-400">Color options coming soon.</p></PanelSection>
        <PanelSection label="Paper"><p className="text-gray-400">A1 portrait 23.4 × 33.1 inch</p></PanelSection>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Hidden file input for venue blueprint */}
      <input ref={fileInputRef} type="file" accept="image/*,.svg" className="hidden" onChange={handleVenueUpload} />

      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm">
        <button onClick={() => router.push(`/planner/${projectId}/seating?tab=ceremony`)} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50">
          <X className="h-4 w-4 text-red-400" />Close
        </button>
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><Keyboard className="h-4 w-4" /></button>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"><FileText className="h-4 w-4" />File</button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
            <Upload className="h-4 w-4" />Upload Blueprint
          </button>
          <button onClick={() => setShowHistory(h => !h)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
            <Clock className="h-4 w-4" />History
          </button>
          <button onClick={() => setShowAddPanel(true)} className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700">
            <Plus className="h-4 w-4" />Add element
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div ref={canvasRef} className="relative flex-1 overflow-hidden" style={{ backgroundColor: "#f0eeeb" }} onMouseDown={onCanvasMouseDown} onWheel={onWheel}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`, transformOrigin: "center center", width: PAPER_W, height: PAPER_H, backgroundColor: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
            {/* Venue blueprint background */}
            {venueImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={venueImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: venueOpacity, pointerEvents: "none" }} />
            )}
            {elements.map(el => {
              const isElSel = selection?.kind === "element" && selection.id === el.id;
              const seatSelIdx = (selection?.kind === "seat" && selection.elementId === el.id) ? selection.seatIndex : null;

              if (el.kind === "arch") {
                const archH = el.width * 1.05;
                return (
                  <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: archH, transform: `rotate(${el.angle}deg)`, transformOrigin: "center center", cursor: "grab", outline: isElSel ? "2px dashed #7c3aed" : "none", outlineOffset: 4 }} onMouseDown={e => onElementMouseDown(e, el.id)}>
                    <ArchSVG width={el.width} borderColor={el.borderColor ?? "#111"} />
                    {isElSel && <>
                      <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "crosshair" }} />
                      <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "ew-resize" }} />
                    </>}
                  </div>
                );
              }

              if (el.kind === "aisle") {
                return (
                  <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height ?? 300, transform: `rotate(${el.angle}deg)`, transformOrigin: "center center", cursor: "grab", background: "rgba(253,244,236,0.7)", border: "1.5px dashed #d8c5b4", outline: isElSel ? "2px dashed #7c3aed" : "none", outlineOffset: 2, display: "flex", alignItems: "center", justifyContent: "center" }} onMouseDown={e => onElementMouseDown(e, el.id)}>
                    <span style={{ fontFamily: "serif", fontStyle: "italic", fontSize: 12, color: "#bbb", pointerEvents: "none", userSelect: "none" }}>{el.name ?? "The aisle"}</span>
                    {isElSel && <>
                      <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "crosshair" }} />
                      <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "s-resize" }} />
                    </>}
                  </div>
                );
              }

              if (el.kind === "row") {
                const seats = el.seats ?? 5;
                const spacing = el.spacing ?? 60;
                const totalW = (seats - 1) * spacingToPx(spacing) + CHAIR_R * 2;
                const totalH = CHAIR_R * 2 + 8;
                return (
                  <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: totalW, height: totalH, transform: `rotate(${el.angle}deg)`, transformOrigin: "center center", cursor: "grab", outline: isElSel ? "2px dashed #7c3aed" : "none", outlineOffset: 4 }} onMouseDown={e => onElementMouseDown(e, el.id)}>
                    <RowOfChairs seats={seats} spacing={spacing} guestIds={el.guestIds ?? Array(seats).fill(null)} selectedSeat={seatSelIdx} onSeatClick={i => setSelection({ kind: "seat", elementId: el.id, seatIndex: i })} guests={guests} nameDisplay={nameDisplay} />
                    {isElSel && <>
                      <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "crosshair" }} />
                      <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", background: "white", border: "2px solid #7c3aed", cursor: "ew-resize" }} />
                    </>}
                  </div>
                );
              }

              if (el.kind.startsWith("table-") || el.kind.startsWith("buffet-")) {
                return (
                  <TableCanvasElement key={el.id} el={el} isSelected={isElSel} seatSelIdx={seatSelIdx} onMouseDown={e => onElementMouseDown(e, el.id)} onSeatClick={i => setSelection({ kind: "seat", elementId: el.id, seatIndex: i })} guests={guests} nameDisplay={nameDisplay} />
                );
              }

              if (el.kind === "asset") {
                return <AssetCanvasElement key={el.id} el={el} isSelected={isElSel} onMouseDown={e => onElementMouseDown(e, el.id)} />;
              }

              return null;
            })}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="flex h-8 w-8 items-center justify-center border-b border-gray-100 text-gray-500 hover:bg-gray-50">+</button>
            <button onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-50">−</button>
          </div>
          <button onClick={() => { setZoom(0.82); setPan({ x: 0, y: 0 }); }} className="absolute bottom-16 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 shadow-sm hover:bg-gray-50">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="10" cy="10" r="3" /><line x1="10" y1="1" x2="10" y2="6" /><line x1="10" y1="14" x2="10" y2="19" /><line x1="1" y1="10" x2="6" y2="10" /><line x1="14" y1="10" x2="19" y2="10" />
            </svg>
          </button>
        </div>

        {/* Right panel */}
        <div className="w-60 shrink-0 overflow-y-auto border-l border-gray-100 bg-white">{renderRightPanel()}</div>
      </div>

      {/* Add element panel overlay */}
      {showAddPanel && <AddElementPanel onAdd={handleAddElement} onClose={() => setShowAddPanel(false)} />}

      {/* History panel overlay */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowHistory(false)} />
          <div className="relative ml-auto flex h-full w-[300px] flex-col bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">History</span>
              <button onClick={() => setShowHistory(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="shrink-0 border-b border-gray-100 px-4 py-3">
              <button
                onClick={saveSnapshot}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700"
              >
                <Plus className="h-3.5 w-3.5" /> Save current snapshot
              </button>
              <p className="mt-1.5 text-center text-[10px] text-gray-400">Max 5 snapshots stored</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {snapshots.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">No snapshots saved yet.</p>
              ) : (
                snapshots.map((snap, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-700">{snap.label}</p>
                        <p className="text-[10px] text-gray-400">{formatSnapshotTime(snap.timestamp)}</p>
                      </div>
                      <button
                        onClick={() => restoreSnapshot(snap)}
                        className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-[10px] font-medium text-purple-700 hover:bg-purple-100"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
