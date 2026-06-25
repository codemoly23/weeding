"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users, DollarSign, CheckSquare, Calendar,
  Pencil, Check, X, ChevronDown, ChevronRight, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getLocalProject, updateLocalProject,
  getLocalGuests, getLocalBudget, getLocalChecklist,
  getLocalItinerary, getLocalVenue,
  type LocalBudgetCategory, type LocalItineraryEvent, type LocalVenueDetails,
} from "@/lib/planner-storage";
import { useLanguage } from "@/lib/i18n/language-context";
import { usePlannerCouple } from "@/lib/planner-context";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ── helpers ───────────────────────────────────────────────────────────────────

function toMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function getDuration(start: string, end: string | null) {
  if (!end) return 0;
  return Math.max(0, toMin(end) - toMin(start));
}
function to12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "am" : "pm";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}${ampm}`;
}
function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return null; }
}
function fmtLocation(v: LocalVenueDetails | null) {
  if (!v) return null;
  const parts = [v.city, v.country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if (v.address) return v.address;
  if (v.venueName) return v.venueName;
  return null;
}

// ── sub-components ────────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
      <button
        className="w-full flex items-center gap-2 px-5 py-3.5 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={contentId}
      >
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        }
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
      </button>
      {open && <div id={contentId} className="border-t border-border">{children}</div>}
    </div>
  );
}

function CoupleSVG() {
  return (
    <svg viewBox="0 0 260 185" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[280px] mx-auto block my-2">
      {/* Bride */}
      <circle cx="78" cy="38" r="15" stroke="#4a3f6b" strokeWidth="2.2"/>
      <path d="M63 30 Q70 18 78 24 Q86 18 93 30" stroke="#4a3f6b" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="63" y1="30" x2="58" y2="58" stroke="#4a3f6b" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="78" y1="53" x2="78" y2="82" stroke="#4a3f6b" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M78 65 L56 52 L50 44" stroke="#4a3f6b" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M78 65 L108 76" stroke="#4a3f6b" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M66 81 L46 158 L110 158 L90 81 Z" stroke="#4a3f6b" strokeWidth="2" fill="none"/>
      <path d="M60 102 L52 135" stroke="#4a3f6b" strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
      <path d="M96 102 L104 135" stroke="#4a3f6b" strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
      {/* Groom */}
      <circle cx="182" cy="38" r="15" stroke="#4a3f6b" strokeWidth="2.2"/>
      <line x1="182" y1="53" x2="182" y2="100" stroke="#4a3f6b" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M182 58 L172 70 M182 58 L192 70" stroke="#4a3f6b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M182 68 L152 76" stroke="#4a3f6b" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M182 68 L204 55 L210 46" stroke="#4a3f6b" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M172 100 L160 158" stroke="#4a3f6b" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M192 100 L202 158" stroke="#4a3f6b" strokeWidth="2.2" strokeLinecap="round"/>
      {/* Joined hands */}
      <line x1="108" y1="76" x2="152" y2="76" stroke="#4a3f6b" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 22 38" className="h-9 w-5" fill="none" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="7" r="5.5"/>
      <line x1="11" y1="12.5" x2="11" y2="26"/>
      <line x1="11" y1="17" x2="5" y2="23"/>
      <line x1="11" y1="17" x2="17" y2="23"/>
      <line x1="11" y1="26" x2="7" y2="36"/>
      <line x1="11" y1="26" x2="15" y2="36"/>
    </svg>
  );
}

function MapGridIcon() {
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14 opacity-20" fill="#9c7fc0">
      {[0,1,2,3,4].map(row => [0,1,2,3,4].map(col => (
        <rect key={`${row}-${col}`} x={col*11+2} y={row*11+2} width="9" height="9" rx="1"/>
      )))}
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 50 70" className="h-14 w-10 opacity-20" fill="none" stroke="#9c7fc0" strokeWidth="3">
      <path d="M25 5 C12 5 5 14 5 24 C5 38 25 65 25 65 C25 65 45 38 45 24 C45 14 38 5 25 5 Z"/>
      <circle cx="25" cy="24" r="7"/>
    </svg>
  );
}

function BudgetBarChart({ categories }: { categories: LocalBudgetCategory[] }) {
  if (categories.length === 0) return <p className="text-xs text-muted-foreground py-4 text-center">No budget data yet</p>;
  const maxVal = Math.max(...categories.map(c => c.planned), 1);
  const chartH = 80;
  const barW = Math.max(6, Math.min(18, Math.floor(500 / categories.length) - 6));
  const gap = Math.max(4, Math.min(8, Math.floor(500 / categories.length) - barW));
  const totalW = categories.length * (barW + gap);
  return (
    <div className="overflow-x-auto">
      <svg width={Math.max(totalW, 300)} height={chartH + 4} className="w-full">
        {categories.map((cat, i) => {
          const h = Math.max(3, (cat.planned / maxVal) * chartH);
          return (
            <rect key={cat.id}
              x={i * (barW + gap)}
              y={chartH - h}
              width={barW} height={h}
              rx="2" fill="#d4b8e8" opacity="0.75"
            />
          );
        })}
        <line x1="0" y1={chartH} x2={totalW} y2={chartH} stroke="#e5e7eb" strokeWidth="1"/>
      </svg>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

interface Project {
  id: string; title: string; eventType: string;
  eventDate: string | null; status: string;
  brideName?: string | null; groomName?: string | null;
}

export default function PlannerOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session } = useSession();
  const projectId = params.id as string;
  const isLocal = projectId.startsWith("local-");
  const isLoggedIn = !!session?.user?.id;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<string[]>([]);

  // title edit
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  // stats
  const [guestCount, setGuestCount] = useState(0);
  const [brideGuests, setBrideGuests] = useState(0);
  const [groomGuests, setGroomGuests] = useState(0);
  const [confirmedRsvp, setConfirmedRsvp] = useState(0);
  const [budgetSpent, setBudgetSpent] = useState(0);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [budgetCategories, setBudgetCategories] = useState<LocalBudgetCategory[]>([]);
  const [checklistDone, setChecklistDone] = useState(0);
  const [checklistTotal, setChecklistTotal] = useState(0);
  const [itineraryEvents, setItineraryEvents] = useState<LocalItineraryEvent[]>([]);
  const [ceremony, setCeremony] = useState<LocalVenueDetails | null>(null);
  const [reception, setReception] = useState<LocalVenueDetails | null>(null);

  // post-wedding
  const [pwPhotos, setPwPhotos] = useState(0);
  const [pwGuestbook, setPwGuestbook] = useState(0);
  const [pwAttending, setPwAttending] = useState(0);

  // couple name editing
  const { brideName, groomName, updateBrideName, updateGroomName } = usePlannerCouple();
  const [editingBride, setEditingBride] = useState(false);
  const [editingGroom, setEditingGroom] = useState(false);
  const [tempBride, setTempBride] = useState("");
  const [tempGroom, setTempGroom] = useState("");

  useEffect(() => {
    if (!projectId) return;

    if (isLocal) {
      const local = getLocalProject(projectId);
      if (!local) { router.push("/planner"); return; }
      setProject(local);

      const guests = getLocalGuests(projectId);
      setGuestCount(guests.length);
      setBrideGuests(guests.filter(g => g.side === "BRIDE").length);
      setGroomGuests(guests.filter(g => g.side === "GROOM").length);
      setConfirmedRsvp(guests.filter(g => g.rsvpStatus === "ATTENDING").length);

      const cats = getLocalBudget(projectId);
      setBudgetCategories(cats);
      const storedGoal = localStorage.getItem(`planner-${projectId}-budget-goal`);
      setBudgetTotal(parseFloat(storedGoal ?? "0") || 0);
      setBudgetSpent(cats.reduce((s, c) => s + c.items.reduce((ss, i) => ss + i.planned, 0), 0));

      const tasks = getLocalChecklist(projectId);
      const allItems = tasks.reduce((s, t) => s + 1 + (t.subtasks?.length || 0), 0);
      const doneItems = tasks.reduce((s, t) => s + (t.completed ? 1 : 0) + (t.subtasks?.filter(st => st.completed).length || 0), 0);
      setChecklistTotal(allItems);
      setChecklistDone(doneItems);

      setItineraryEvents(getLocalItinerary(projectId));
      setCeremony(getLocalVenue(projectId, "CEREMONY"));
      setReception(getLocalVenue(projectId, "RECEPTION"));

      setLoading(false);
      return;
    }

    async function fetchAll() {
      try {
        setLoadError(null);
        setPartialErrors([]);
        const requests = [
          ["project", `/api/planner/projects/${projectId}`],
          ["guests", `/api/planner/projects/${projectId}/guests`],
          ["budget", `/api/planner/projects/${projectId}/budget`],
          ["checklist", `/api/planner/projects/${projectId}/checklist`],
          ["itinerary", `/api/planner/projects/${projectId}/itinerary`],
          ["ceremony", `/api/planner/projects/${projectId}/ceremony`],
          ["reception", `/api/planner/projects/${projectId}/reception`],
          ["post-wedding", `/api/planner/projects/${projectId}/post-wedding`],
        ] as const;
        const responses = await Promise.all(
          requests.map(async ([key, url]) => {
            try {
              return [key, await fetch(url)] as const;
            } catch {
              return [key, null] as const;
            }
          })
        );
        const byKey = Object.fromEntries(responses) as Record<string, Response | null>;
        const projRes = byKey.project;
        if (!projRes?.ok) {
          setLoadError(projRes?.status === 404 ? "Project not found." : "Unable to load this project.");
          return;
        }
        setPartialErrors(
          responses
            .filter(([key, res]) => key !== "project" && !res?.ok)
            .map(([key]) => key)
        );
        const data = await projRes.json();
        setProject(data.project);

        const guestsRes = byKey.guests;
        if (guestsRes?.ok) {
          const d = await guestsRes.json();
          const gs = d.guests ?? [];
          setGuestCount(gs.length);
          setBrideGuests(gs.filter((g: { side: string }) => g.side === "BRIDE").length);
          setGroomGuests(gs.filter((g: { side: string }) => g.side === "GROOM").length);
          setConfirmedRsvp(gs.filter((g: { rsvpStatus: string }) => g.rsvpStatus === "ATTENDING").length);
        }
        const budgetRes = byKey.budget;
        if (budgetRes?.ok) {
          const d = await budgetRes.json();
          const cats = d.categories ?? [];
          setBudgetCategories(cats);
          setBudgetTotal(d.budgetGoal ?? 0);
          setBudgetSpent(cats.reduce((s: number, c: LocalBudgetCategory) => s + c.items.reduce((ss: number, i: { planned: number }) => ss + i.planned, 0), 0));
        }
        const checklistRes = byKey.checklist;
        if (checklistRes?.ok) {
          const d = await checklistRes.json();
          const tasks = d.tasks ?? [];
          const allItems = tasks.reduce((s: number, t: { subtasks?: unknown[] }) => s + 1 + (t.subtasks?.length || 0), 0);
          const doneItems = tasks.reduce((s: number, t: { completed: boolean; subtasks?: { completed: boolean }[] }) =>
            s + (t.completed ? 1 : 0) + (t.subtasks?.filter(st => st.completed).length || 0), 0);
          setChecklistTotal(allItems);
          setChecklistDone(doneItems);
        }
        const itinRes = byKey.itinerary;
        if (itinRes?.ok) { const d = await itinRes.json(); setItineraryEvents(d.events ?? []); }
        const ceremRes = byKey.ceremony;
        if (ceremRes?.ok) { const d = await ceremRes.json(); setCeremony(d.venue ?? null); }
        const recepRes = byKey.reception;
        if (recepRes?.ok) { const d = await recepRes.json(); setReception(d.venue ?? null); }
        const pwRes = byKey["post-wedding"];
        if (pwRes?.ok) {
          const d = await pwRes.json();
          setPwPhotos((d.guestPhotos ?? []).length);
          setPwGuestbook((d.guestbookEntries ?? []).length);
          setPwAttending(d.rsvpCounts?.attending ?? 0);
        }
      } catch {
        setLoadError("Unable to load this project.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [projectId, isLocal, router]);

  const saveTitle = async () => {
    if (!editTitle.trim() || !project) return;
    const newTitle = editTitle.trim();
    if (isLocal) {
      updateLocalProject(projectId, { title: newTitle });
      setProject(prev => prev ? { ...prev, title: newTitle } : prev);
      document.title = `${newTitle} | Wedding Planner`;
    } else {
      const res = await fetch(`/api/planner/projects/${projectId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setProject(prev => prev ? { ...prev, title: newTitle } : prev);
        document.title = `${newTitle} | Wedding Planner`;
      }
    }
    setEditing(false);
  };

  const saveBrideName = () => {
    const name = tempBride.trim();
    updateBrideName(name, projectId, isLocal);
    setEditingBride(false);
  };
  const saveGroomName = () => {
    const name = tempGroom.trim();
    updateGroomName(name, projectId, isLocal);
    setEditingGroom(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }
  if (!project) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-[var(--color-error-text)]/20 bg-[var(--color-error-bg)] p-5 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-[var(--color-error-text)]" />
        <h1 className="text-base font-semibold text-[var(--color-error-text)]">{loadError || "Project unavailable."}</h1>
        <p className="mt-1 text-sm text-[var(--color-error-text)]/80">Return to your planner projects and try again.</p>
        <Link href="/planner" className="mt-4 inline-flex rounded-md bg-[var(--color-error-text)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-error-text)]/90">
          Back to projects
        </Link>
      </div>
    );
  }

  const daysLeft = project.eventDate
    ? Math.max(0, Math.ceil((new Date(project.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const stats = [
    { label: t("overview.totalGuests"), value: String(guestCount), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: t("overview.budget"), value: `$${budgetTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-[var(--color-success-text)]", bg: "bg-[var(--color-success-bg)]" },
    { label: t("overview.tasksDone"), value: checklistTotal > 0 ? `${checklistDone}/${checklistTotal}` : "0/0", icon: CheckSquare, color: "text-primary", bg: "bg-primary/10" },
    { label: t("overview.daysLeft"), value: daysLeft !== null ? daysLeft.toString() : "—", icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
  ];

  const pct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;
  const ceremonyDate = fmtDate(ceremony?.date || project.eventDate);
  const ceremonyLocation = fmtLocation(ceremony);
  const receptionDate = fmtDate(reception?.date);
  const receptionLocation = fmtLocation(reception);

  return (
    <div>
      {partialErrors.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-[var(--color-warning-text)]/20 bg-[var(--color-warning-bg)] p-3 text-sm text-[var(--color-warning-text)]">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>Some dashboard sections could not load: {partialErrors.join(", ")}. Refresh the page to retry.</p>
        </div>
      )}
      {/* ── Existing: title + status ────────────────────────────────────── */}
      <div className="mb-6">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="max-w-sm text-2xl font-bold" autoFocus
              onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditing(false); }}
            />
            <Button variant="ghost" size="icon" onClick={saveTitle}><Check className="h-4 w-4"/></Button>
            <Button variant="ghost" size="icon" onClick={() => setEditing(false)}><X className="h-4 w-4"/></Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <Button variant="ghost" size="icon" onClick={() => { setEditTitle(project.title); setEditing(true); }}>
              <Pencil className="h-4 w-4"/>
            </Button>
          </div>
        )}
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          {project.eventType.toLowerCase()} &middot; {project.status.toLowerCase()}
          {isLocal && (
            isLoggedIn ? (
              <Link
                href={`/planner/sync?from=${projectId}`}
                className="ml-2 rounded-full bg-[var(--color-error-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--color-error-text)] hover:bg-[var(--color-error-bg)]/80"
              >
                {t("common.notSaved")} · Save now
              </Link>
            ) : (
              <span className="ml-2 rounded-full bg-[var(--color-error-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--color-error-text)]">
                {t("common.notSaved")}
              </span>
            )
          )}
        </p>
      </div>

      {/* ── Existing: stats cards ───────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bg}`}><Icon className={`h-4 w-4 ${stat.color}`}/></div>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{stat.value}</p></CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Existing: quick actions ─────────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">{t("overview.quickActions")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: t("overview.addGuests"), href: `/planner/${projectId}/guests`, icon: Users },
            { label: t("overview.setBudget"), href: `/planner/${projectId}/budget`, icon: DollarSign },
            { label: t("overview.viewChecklist"), href: `/planner/${projectId}/checklist`, icon: CheckSquare },
          ].map(action => {
            const Icon = action.icon;
            return (
              <Card key={action.label} className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(action.href)}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary"/>
                  </div>
                  <span className="font-medium">{action.label}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Reference sections (lavender bg) ────────────────────────────── */}
      <div className="dashboard-soft-section -mx-4 lg:-mx-6 mt-10 bg-[#ebe8f1] px-4 lg:px-6 py-10 -mb-4 lg:-mb-6">
        <h2 className="text-center text-2xl font-light text-foreground/80 mb-1 tracking-wide">{t("overview.sectionTitle")}</h2>
        <p className="text-center text-sm text-muted-foreground mb-8">
          {t("overview.sectionSubtitle")}
        </p>

        <div className="max-w-2xl mx-auto space-y-3">

          {/* ── Couple ────────────────────────────────────────────────── */}
          <Section title={t("overview.couple")}>
            <div className="px-6 pt-4 pb-5">
              <div className="flex justify-center gap-10 mb-2">
                {/* Bride name */}
                {editingBride ? (
                  <div className="flex items-center gap-1">
                    <Input value={tempBride} onChange={e => setTempBride(e.target.value)}
                      className="h-7 text-sm w-36 border-primary/30"
                      autoFocus placeholder={t("overview.bridePlaceholder")}
                      onKeyDown={e => { if (e.key === "Enter") saveBrideName(); if (e.key === "Escape") setEditingBride(false); }}
                    />
                    <button onClick={saveBrideName} className="text-primary"><Check className="h-3.5 w-3.5"/></button>
                    <button onClick={() => setEditingBride(false)} className="text-muted-foreground"><X className="h-3.5 w-3.5"/></button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setTempBride(brideName); setEditingBride(true); }}
                    className="text-sm text-primary border-b border-dashed border-primary/40 pb-0.5 hover:text-primary/80"
                  >
                    {brideName || t("overview.setBrideName")}
                  </button>
                )}
                {/* Groom name */}
                {editingGroom ? (
                  <div className="flex items-center gap-1">
                    <Input value={tempGroom} onChange={e => setTempGroom(e.target.value)}
                      className="h-7 text-sm w-36 border-primary/30"
                      autoFocus placeholder={t("overview.groomPlaceholder")}
                      onKeyDown={e => { if (e.key === "Enter") saveGroomName(); if (e.key === "Escape") setEditingGroom(false); }}
                    />
                    <button onClick={saveGroomName} className="text-primary"><Check className="h-3.5 w-3.5"/></button>
                    <button onClick={() => setEditingGroom(false)} className="text-muted-foreground"><X className="h-3.5 w-3.5"/></button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setTempGroom(groomName); setEditingGroom(true); }}
                    className="text-sm text-primary border-b border-dashed border-primary/40 pb-0.5 hover:text-primary/80"
                  >
                    {groomName || t("overview.setGroomName")}
                  </button>
                )}
              </div>
              <CoupleSVG />
            </div>
          </Section>

          {/* ── Event information ──────────────────────────────────────── */}
          <Section title={t("overview.eventInfo")}>
            <div className="px-6 pt-4 pb-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("overview.ceremonyDate")}</p>
                <button
                  onClick={() => router.push(`/planner/${projectId}/ceremony`)}
                  className="text-sm text-primary border-b border-dashed border-primary/40 pb-0.5 text-left"
                >
                  {ceremonyDate || t("overview.setCeremonyDate")}
                </button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("overview.ceremonyLocation")}</p>
                  <button
                    onClick={() => router.push(`/planner/${projectId}/ceremony`)}
                    className="text-sm text-primary border-b border-dashed border-primary/40 pb-0.5 text-left"
                  >
                    {ceremonyLocation || t("overview.setCeremonyLocation")}
                  </button>
                </div>
                <MapGridIcon />
              </div>
            </div>
          </Section>

          {/* ── Guests ────────────────────────────────────────────────── */}
          <Section title={t("overview.guests")}>
            <div className="px-6 pt-4 pb-5">
              <div className="flex gap-6 mb-4">
                {/* Bride's side */}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">{t("overview.bridesSide")}</p>
                  {brideGuests > 0 ? (
                    <>
                      <div className="flex gap-1 flex-wrap">
                        {Array.from({ length: Math.min(brideGuests, 6) }).map((_, i) => (
                          <PersonIcon key={i} />
                        ))}
                        {brideGuests > 6 && (
                          <span className="text-xs text-muted-foreground self-end ml-1">+{brideGuests - 6}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t("overview.guestCountLabel", { count: String(brideGuests) })}</p>
                    </>
                  ) : (
                    <button
                      onClick={() => router.push(`/planner/${projectId}/guests`)}
                      className="text-sm text-primary border-b border-dashed border-primary/40"
                    >
                      {t("overview.addMoreGuests")}
                    </button>
                  )}
                </div>
                {/* Groom's side */}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">{t("overview.groomsSide")}</p>
                  {groomGuests > 0 ? (
                    <>
                      <div className="flex gap-1 flex-wrap">
                        {Array.from({ length: Math.min(groomGuests, 6) }).map((_, i) => (
                          <PersonIcon key={i} />
                        ))}
                        {groomGuests > 6 && (
                          <span className="text-xs text-muted-foreground self-end ml-1">+{groomGuests - 6}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t("overview.guestCountLabel", { count: String(groomGuests) })}</p>
                    </>
                  ) : (
                    <button
                      onClick={() => router.push(`/planner/${projectId}/guests`)}
                      className="text-sm text-primary border-b border-dashed border-primary/40"
                    >
                      {t("overview.addMoreGuests")}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
                <span>{t("overview.weddingParty")} <span className="text-primary font-medium">{guestCount}</span></span>
                <span>{t("overview.totalGuestsLabel")} <span className="text-primary font-medium">{guestCount}</span></span>
                <span>{t("overview.confirmedRsvp")} <span className="text-accent font-medium">{confirmedRsvp}</span></span>
              </div>
            </div>
          </Section>

          {/* ── Checklist ─────────────────────────────────────────────── */}
          <Section title={t("overview.checklist")}>
            <div className="px-6 pt-4 pb-5">
              <p className="text-xs text-muted-foreground mb-2">{t("overview.progress")}</p>
              <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-accent/60 to-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span>{t("overview.totalTasks")} <span className="text-primary font-semibold">{checklistTotal}</span></span>
                <span>{t("overview.completed")} <span className="text-accent font-semibold">{checklistDone}</span></span>
                <span>{t("overview.stillOnWay")} <span className="text-primary font-semibold">{checklistTotal - checklistDone}</span></span>
              </div>
            </div>
          </Section>

          {/* ── Budget ────────────────────────────────────────────────── */}
          <Section title={t("overview.budget")}>
            <div className="px-6 pt-4 pb-5">
              <div className="flex justify-end gap-6 mb-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("overview.budgetLabel")}</p>
                  <p className="text-sm font-medium text-foreground/80">
                    ${budgetTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("overview.actualCost")}</p>
                  <p className="text-sm font-medium text-primary">
                    ${budgetSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <BudgetBarChart categories={budgetCategories} />
            </div>
          </Section>

          {/* ── Event Itinerary ───────────────────────────────────────── */}
          <Section title={t("overview.eventItinerary")}>
            <div className="px-6 pt-2 pb-5">
              {itineraryEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3">
                  <button onClick={() => router.push(`/planner/${projectId}/itinerary`)}
                    className="text-primary border-b border-dashed border-primary/40">
                    {t("overview.setUpItinerary")}
                  </button>
                </p>
              ) : (
                itineraryEvents.map(ev => (
                  <div key={ev.id} className="flex items-start gap-3 py-1.5">
                    <div className="text-right w-[72px] flex-shrink-0">
                      <span className="text-sm text-foreground/80">{to12h(ev.startTime)}</span>
                      <br />
                      <span className="text-xs text-accent/80">{getDuration(ev.startTime, ev.endTime)} min</span>
                    </div>
                    <div className="pt-1.5 flex-shrink-0">
                      <div className="h-3 w-3 rounded-full border-2 border-border bg-card" />
                    </div>
                    <span className="text-sm text-foreground/80 pt-0.5">{ev.title}</span>
                  </div>
                ))
              )}
            </div>
          </Section>

          {/* ── Ceremony ──────────────────────────────────────────────── */}
          <Section title={t("overview.ceremony")}>
            <div className="px-6 pt-4 pb-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("overview.ceremonyDate")}</p>
                <button
                  onClick={() => router.push(`/planner/${projectId}/ceremony`)}
                  className="text-sm text-primary border-b border-dashed border-primary/40 pb-0.5 text-left"
                >
                  {ceremonyDate || t("overview.setCeremonyDate")}
                </button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("overview.ceremonyLocation")}</p>
                  <button
                    onClick={() => router.push(`/planner/${projectId}/ceremony`)}
                    className="text-sm text-primary border-b border-dashed border-primary/40 pb-0.5 text-left"
                  >
                    {ceremonyLocation || t("overview.setCeremonyLocation")}
                  </button>
                </div>
                <MapPinIcon />
              </div>
            </div>
          </Section>

          {/* ── Reception ─────────────────────────────────────────────── */}
          <Section title={t("overview.reception")}>
            <div className="px-6 pt-4 pb-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("overview.receptionDate")}</p>
                <button
                  onClick={() => router.push(`/planner/${projectId}/reception`)}
                  className="text-sm text-primary border-b border-dashed border-primary/40 pb-0.5 text-left"
                >
                  {receptionDate || t("overview.setReceptionDate")}
                </button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("overview.receptionLocation")}</p>
                  <button
                    onClick={() => router.push(`/planner/${projectId}/reception`)}
                    className="text-sm text-primary border-b border-dashed border-primary/40 pb-0.5 text-left"
                  >
                    {receptionLocation || t("overview.setReceptionLocation")}
                  </button>
                </div>
                <MapPinIcon />
              </div>
            </div>
          </Section>

          {/* ── Post-Wedding ──────────────────────────────────────────── */}
          <Section title={t("overview.postWedding")}>
            <div className="px-6 pt-4 pb-5">
              {!isLocal && (pwPhotos > 0 || pwGuestbook > 0 || pwAttending > 0) ? (
                <>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground mb-3">
                    <span>{t("overview.attending")} <span className="text-primary font-semibold">{pwAttending}</span></span>
                    <span>{t("overview.guestbook")} <span className="text-accent font-semibold">{pwGuestbook}</span></span>
                    <span>{t("overview.photos")} <span className="text-primary font-semibold">{pwPhotos}</span></span>
                  </div>
                  <button
                    onClick={() => router.push(`/planner/${projectId}/post-wedding`)}
                    className="text-sm text-primary border-b border-dashed border-primary/40"
                  >
                    {t("overview.viewMemories")}
                  </button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {isLocal
                    ? t("overview.signInForMemories")
                    : t("overview.memoriesLater")
                  }
                </p>
              )}
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
