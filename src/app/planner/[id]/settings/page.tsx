"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save, CreditCard, Check, Crown, Zap, Star, Loader2, ExternalLink,
  Copy, Share2, Eye, EyeOff, Link2, QrCode, Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLocalProject, updateLocalProject, createLocalProject } from "@/lib/planner-storage";
import { usePlannerCouple } from "@/lib/planner-context";
import { useLanguage } from "@/lib/i18n/language-context";

// Tab IDs that can be hidden
const HIDEABLE_TABS = [
  { id: "guests",       tKey: "tab.guests" },
  { id: "ceremony",     tKey: "tab.ceremony" },
  { id: "reception",    tKey: "tab.reception" },
  { id: "vendors",      tKey: "tab.vendors" },
  { id: "website",      tKey: "tab.website" },
  { id: "checklist",    tKey: "tab.checklist" },
  { id: "budget",       tKey: "tab.budget" },
  { id: "itinerary",    tKey: "tab.itinerary" },
  { id: "seating",      tKey: "tab.seating" },
  { id: "notes",        tKey: "tab.notes" },
  { id: "post-wedding", tKey: "tab.postWedding" },
];

interface SubscriptionInfo {
  tier: "basic" | "premium" | "elite";
  status: string;
  periodEnd: string | null;
  hasSubscription: boolean;
}

type PlanId = "basic" | "premium" | "elite";

const PLANS = [
  {
    id: "basic" as PlanId,
    name: "Basic",
    price: "Free",
    priceNote: "Forever free",
    icon: <Zap className="w-5 h-5 text-muted-foreground" />,
    color: "border-border",
    headerColor: "bg-muted",
    features: [
      "Event website (free subdomain)",
      "Basic RSVP form",
      "Basic checklist",
      "Vendor & venue directory",
      "Multi-language support",
    ],
    missing: [
      "Guest list manager",
      "Seating chart editor",
      "Custom domain",
      "Export PDF/XLS",
      "Advanced website templates",
      "Email invitations",
    ],
  },
  {
    id: "premium" as PlanId,
    name: "Premium",
    price: "299 SEK",
    priceNote: "per month",
    icon: <Crown className="w-5 h-5 text-accent" />,
    color: "border-accent/30",
    headerColor: "bg-accent/10",
    badge: "Most Popular",
    features: [
      "Everything in Basic",
      "Guest list manager (unlimited)",
      "Seating chart editor",
      "Custom domain for your site",
      "Export PDF & XLS for all modules",
      "Advanced website templates & themes",
      "Email invitations with tracking",
      "Ad-free experience",
    ],
    missing: [
      "Printable stationery assets",
      "QR entrance mode",
      "Collaborator access (unlimited)",
      "SMS credits",
    ],
  },
  {
    id: "elite" as PlanId,
    name: "Elite",
    price: "499 SEK",
    priceNote: "per month",
    icon: <Star className="w-5 h-5 text-primary" />,
    color: "border-primary/30",
    headerColor: "bg-primary/5",
    features: [
      "Everything in Premium",
      "Printable stationery: place cards, menus, table cards",
      "QR entrance mode (staff check-in)",
      "Unlimited collaborator access",
      "SMS credit bundles",
      "Priority support",
    ],
    missing: [],
  },
];

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const isLocal = projectId.startsWith("local-");
  const { brideName, groomName, updateBrideName, updateGroomName } = usePlannerCouple();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    eventType: "WEDDING",
    eventDate: "",
    status: "ACTIVE",
  });

  // Copy project
  const [copying, setCopying] = useState(false);

  // Tab visibility
  const [hiddenTabs, setHiddenTabs] = useState<string[]>([]);

  // Share project
  const [shareEnabled, setShareEnabled] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareToggling, setShareToggling] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const qrRef = useRef(false);

  // Accessibility mode
  const [a11y, setA11y] = useState(false);

  // Billing state
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);
  const [managingPortal, setManagingPortal] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  useEffect(() => {
    // Load hidden tabs from localStorage
    try {
      const stored = localStorage.getItem(`planner-hidden-tabs-${projectId}`);
      if (stored) setHiddenTabs(JSON.parse(stored));
    } catch { /* ignore */ }

    // Load accessibility mode
    setA11y(localStorage.getItem("planner-a11y") === "1");

    if (isLocal) {
      const p = getLocalProject(projectId);
      if (p) {
        setForm({
          title: p.title || "",
          eventType: p.eventType || "WEDDING",
          eventDate: p.eventDate ? new Date(p.eventDate).toISOString().split("T")[0] : "",
          status: p.status || "ACTIVE",
        });
      }
      setLoading(false);
      return;
    }

    async function fetchProject() {
      try {
        const res = await fetch(`/api/planner/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          const p = data.project;
          setForm({
            title: p.title || "",
            eventType: p.eventType || "WEDDING",
            eventDate: p.eventDate ? new Date(p.eventDate).toISOString().split("T")[0] : "",
            status: p.status || "ACTIVE",
          });
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchProject();

    // Fetch subscription info
    setBillingLoading(true);
    fetch("/api/billing/subscription")
      .then((r) => r.json())
      .then((d) => setSub(d))
      .catch(() => {})
      .finally(() => setBillingLoading(false));

    // Fetch share status
    fetch(`/api/planner/projects/${projectId}/share`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) { setShareEnabled(d.shareEnabled); setShareToken(d.shareToken); } })
      .catch(() => {});
  }, [projectId, isLocal]);

  // Generate QR code when share link is available
  const shareLink = shareToken && shareEnabled ? `${window?.location?.origin}/planner/share/${shareToken}` : null;
  useEffect(() => {
    if (!shareLink || qrRef.current) return;
    qrRef.current = true;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(shareLink, { width: 200, margin: 1 }).then(setQrDataUrl);
    }).catch(() => {});
  }, [shareLink]);

  // ── Copy project ────────────────────────────────────────────────────────────
  async function handleCopyProject() {
    if (!confirm(`Duplicate "${form.title}"? A new draft project will be created with all your data.`)) return;
    setCopying(true);
    try {
      if (isLocal) {
        // Local copy
        const newProj = createLocalProject("OWNER");
        const newId = newProj.id;
        const orig = getLocalProject(projectId);
        if (orig) {
          updateLocalProject(newId, {
            title: `${orig.title} (Copy)`,
            eventType: orig.eventType,
            eventDate: orig.eventDate,
            status: "DRAFT",
            brideName: orig.brideName,
            groomName: orig.groomName,
            budgetGoal: orig.budgetGoal,
          });
        }
        // Copy localStorage keys
        const keys = [
          [`planner_guests_${projectId}`, `planner_guests_${newId}`],
          [`planner_budget_${projectId}`, `planner_budget_${newId}`],
          [`planner_checklist_${projectId}`, `planner_checklist_${newId}`],
          [`planner_itinerary_${projectId}`, `planner_itinerary_${newId}`],
          [`planner_notes_${projectId}`, `planner_notes_${newId}`],
          [`planner_venue_CEREMONY_${projectId}`, `planner_venue_CEREMONY_${newId}`],
          [`planner_venue_RECEPTION_${projectId}`, `planner_venue_RECEPTION_${newId}`],
          [`planner_vendors_${projectId}`, `planner_vendors_${newId}`],
        ];
        for (const [src, dst] of keys) {
          const val = localStorage.getItem(src);
          if (val) localStorage.setItem(dst, val);
        }
        router.push(`/planner/${newId}/settings`);
      } else {
        const res = await fetch(`/api/planner/projects/${projectId}/copy`, { method: "POST" });
        if (!res.ok) throw new Error("Failed to copy");
        const { projectId: newId } = await res.json();
        router.push(`/planner/${newId}/settings`);
      }
    } catch {
      alert("Failed to copy project. Please try again.");
    } finally {
      setCopying(false);
    }
  }

  // ── Tab visibility ──────────────────────────────────────────────────────────
  function toggleTab(tabId: string) {
    const next = hiddenTabs.includes(tabId)
      ? hiddenTabs.filter((t) => t !== tabId)
      : [...hiddenTabs, tabId];
    setHiddenTabs(next);
    localStorage.setItem(`planner-hidden-tabs-${projectId}`, JSON.stringify(next));
    // Also save to project settings for DB projects
    if (!isLocal) {
      const settings = { hiddenTabs: next };
      fetch(`/api/planner/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      }).catch(() => {});
    }
  }

  // ── Share project ───────────────────────────────────────────────────────────
  async function toggleShare(enabled: boolean) {
    setShareToggling(true);
    try {
      const res = await fetch(`/api/planner/projects/${projectId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        const d = await res.json();
        setShareEnabled(d.shareEnabled);
        setShareToken(d.shareToken);
        if (d.shareEnabled) qrRef.current = false; // regenerate QR
      }
    } finally {
      setShareToggling(false);
    }
  }

  async function copyShareLink() {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  // ── Accessibility ───────────────────────────────────────────────────────────
  function toggleA11y() {
    const next = !a11y;
    setA11y(next);
    localStorage.setItem("planner-a11y", next ? "1" : "0");
    document.documentElement.classList.toggle("planner-a11y", next);
  }

  async function handleUpgrade(tier: PlanId) {
    if (tier === "basic") return;
    setUpgrading(tier);
    setBillingError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      window.location.href = data.url;
    } catch (e) {
      setBillingError(e instanceof Error ? e.message : "Something went wrong");
      setUpgrading(null);
    }
  }

  async function handleManagePortal() {
    setManagingPortal(true);
    setBillingError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open billing portal");
      window.location.href = data.url;
    } catch (e) {
      setBillingError(e instanceof Error ? e.message : "Something went wrong");
      setManagingPortal(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isLocal) {
        updateLocalProject(projectId, {
          title: form.title,
          eventType: form.eventType,
          eventDate: form.eventDate || null,
          status: form.status,
        });
      } else {
        await fetch(`/api/planner/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            eventType: form.eventType,
            eventDate: form.eventDate || null,
            status: form.status,
          }),
        });
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      {/* Couple Names */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.couple")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brideName">{t("settings.brideName")}</Label>
              <Input
                id="brideName"
                value={brideName}
                onChange={(e) => updateBrideName(e.target.value, projectId, isLocal)}
                placeholder={t("settings.brideNamePh")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groomName">{t("settings.groomName")}</Label>
              <Input
                id="groomName"
                value={groomName}
                onChange={(e) => updateGroomName(e.target.value, projectId, isLocal)}
                placeholder={t("settings.groomNamePh")}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t("settings.namesNote")}</p>
        </CardContent>
      </Card>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.general")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("settings.projectTitle")}</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">{t("settings.eventType")}</Label>
            <Select
              value={form.eventType}
              onValueChange={(v) => setForm((f) => ({ ...f, eventType: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEDDING">{t("settings.wedding")}</SelectItem>
                <SelectItem value="BAPTISM">{t("settings.baptism")}</SelectItem>
                <SelectItem value="PARTY">{t("settings.party")}</SelectItem>
                <SelectItem value="CORPORATE">{t("settings.corporate")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">{t("settings.eventDate")}</Label>
            <Input
              id="eventDate"
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t("settings.status")}</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">{t("settings.draft")}</SelectItem>
                <SelectItem value="ACTIVE">{t("settings.active")}</SelectItem>
                <SelectItem value="ARCHIVED">{t("settings.archived")}</SelectItem>
                <SelectItem value="COMPLETED">{t("settings.completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? t("settings.saving") : t("settings.saveChanges")}
          </Button>
        </CardContent>
      </Card>

      {/* Copy Project */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-4 w-4 text-muted-foreground" /> {t("settings.copyProject")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("settings.copyProjectDesc")}</p>
          <Button
            variant="outline"
            onClick={handleCopyProject}
            disabled={copying}
            className="gap-2"
          >
            {copying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
            {copying ? t("settings.copying") : t("settings.duplicateProject")}
          </Button>
        </CardContent>
      </Card>

      {/* Dashboard Layout — Tab Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" /> {t("settings.dashboardLayout")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">{t("settings.dashboardLayoutDesc")}</p>
          {HIDEABLE_TABS.map((tab) => {
            const isVisible = !hiddenTabs.includes(tab.id);
            return (
              <div key={tab.id} className="flex items-center justify-between py-1.5 border-b border-muted/30 last:border-0">
                <span className="text-sm text-foreground/80">{t(tab.tKey)}</span>
                <button
                  onClick={() => toggleTab(tab.id)}
                  role="switch"
                  aria-checked={isVisible}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    isVisible ? "bg-accent" : "bg-border"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${
                    isVisible ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>
            );
          })}
          {hiddenTabs.length > 0 && (
            <button
              onClick={() => {
                setHiddenTabs([]);
                localStorage.removeItem(`planner-hidden-tabs-${projectId}`);
              }}
              className="text-xs text-accent hover:underline mt-2"
            >
              {t("settings.showAllTabs")}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Share Project */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-muted-foreground" /> {t("settings.shareProject")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLocal ? (
            <p className="text-sm text-muted-foreground italic">{t("settings.shareSignIn")}</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/80">{t("settings.shareEnable")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.shareDesc")}</p>
                </div>
                <button
                  onClick={() => toggleShare(!shareEnabled)}
                  disabled={shareToggling}
                  role="switch"
                  aria-checked={shareEnabled}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    shareEnabled ? "bg-accent" : "bg-border"
                  } disabled:opacity-60`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${
                    shareEnabled ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {shareEnabled && shareLink && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input readOnly value={shareLink} className="text-xs font-mono" />
                    <Button variant="outline" size="icon" onClick={copyShareLink} title="Copy link">
                      {linkCopied ? <Check className="h-4 w-4 text-[var(--color-success-text)]" /> : <Link2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <a
                    href={shareLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-accent hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> {t("settings.previewShare")}
                  </a>
                  {qrDataUrl && (
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <QrCode className="h-3.5 w-3.5" /> {t("settings.qrCode")}
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrDataUrl} alt="Share QR code" className="rounded-lg border border-border shadow-sm w-32 h-32" />
                    </div>
                  )}
                </div>
              )}

              {!shareEnabled && (
                <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                  <EyeOff className="h-3.5 w-3.5" /> {t("settings.shareDisabled")}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-4 w-4 text-muted-foreground" /> {t("settings.accessibility")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground/80">{t("settings.accessibilityMode")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.accessibilityDesc")}</p>
            </div>
            <button
              onClick={toggleA11y}
              role="switch"
              aria-checked={a11y}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                a11y ? "bg-accent" : "bg-border"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${
                a11y ? "translate-x-4" : "translate-x-0"
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Plans & Billing */}
      {!isLocal && (
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.plans")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current plan banner */}
            {!billingLoading && sub && (
              <div className="flex items-center justify-between rounded-xl bg-muted border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {sub.tier} {t("settings.plan")}
                      {sub.status === "past_due" && (
                        <span className="ml-2 text-xs font-normal text-[var(--color-error-text)]">· {t("settings.paymentPastDue")}</span>
                      )}
                    </p>
                    {sub.periodEnd && (
                      <p className="text-xs text-muted-foreground">
                        {t("settings.renews")} {new Date(sub.periodEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
                {sub.hasSubscription && (
                  <button
                    onClick={handleManagePortal}
                    disabled={managingPortal}
                    className="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground transition-colors disabled:opacity-60"
                  >
                    {managingPortal ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {t("settings.opening")}</>
                    ) : (
                      <><ExternalLink className="w-4 h-4" /> {t("settings.manageBilling")}</>
                    )}
                  </button>
                )}
              </div>
            )}

            {billingError && (
              <div className="rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error-text)]/20 px-4 py-3 text-sm text-[var(--color-error-text)]">
                {billingError}
              </div>
            )}

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {PLANS.map((plan) => {
                const currentTier = sub?.tier ?? "basic";
                const isCurrent = currentTier === plan.id;
                const tierOrder: PlanId[] = ["basic", "premium", "elite"];
                const isHigher = tierOrder.indexOf(plan.id) > tierOrder.indexOf(currentTier);

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border-2 bg-card flex flex-col ${
                      isCurrent ? "border-accent/60 shadow-md" : plan.color
                    }`}
                  >
                    {"badge" in plan && plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className={`rounded-t-2xl px-4 pb-4 ${"badge" in plan && plan.badge ? "pt-7" : "pt-4"} ${plan.headerColor}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {plan.icon}
                        <h2 className="font-bold text-foreground">{plan.name}</h2>
                        {isCurrent && (
                          <span className="ml-auto text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                            {t("settings.current")}
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {plan.price}
                        {plan.id !== "basic" && (
                          <span className="text-xs font-normal text-muted-foreground ml-1">{plan.priceNote}</span>
                        )}
                      </p>
                      {plan.id === "basic" && (
                        <p className="text-xs text-muted-foreground">{plan.priceNote}</p>
                      )}
                    </div>

                    <div className="flex-1 px-4 py-4">
                      <ul className="space-y-2">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                            <Check className="w-3.5 h-3.5 text-[var(--color-success-text)] mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                        {plan.missing.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground line-through">
                            <span className="w-3.5 h-3.5 mt-0.5 shrink-0 text-center text-muted-foreground/50">–</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="px-4 pb-4">
                      {isCurrent ? (
                        <div className="w-full py-2 rounded-xl bg-accent/10 text-accent text-xs font-semibold text-center">
                          {t("settings.currentPlan")}
                        </div>
                      ) : plan.id === "basic" ? (
                        <div className="w-full py-2 rounded-xl bg-muted text-muted-foreground text-xs font-semibold text-center">
                          {t("settings.freeForever")}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={!!upgrading || billingLoading}
                          className="w-full py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {upgrading === plan.id ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("settings.redirecting")}</>
                          ) : isHigher ? (
                            <>{t("settings.upgradeTo")} {plan.name}</>
                          ) : (
                            <>{t("settings.switchTo")} {plan.name}</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {t("settings.stripeNote")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
