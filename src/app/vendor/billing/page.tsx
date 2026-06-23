"use client";

import { useState, useEffect } from "react";
import { Crown, Zap, XCircle, Check, Clock, Loader2, ExternalLink } from "lucide-react";
import type { VendorPlanStatus } from "@/lib/vendor-plan";
import { useLanguage } from "@/lib/i18n/language-context";

const BUSINESS_FEATURES = [
  "vendor.billing.feature.directory",
  "vendor.billing.feature.inquiries",
  "vendor.billing.feature.profile",
  "vendor.billing.feature.portfolio",
  "vendor.billing.feature.reviews",
  "vendor.billing.feature.backlink",
  "vendor.billing.feature.search",
  "vendor.billing.feature.analytics",
  "vendor.billing.feature.calendar",
  "vendor.billing.feature.projects",
];

export default function VendorBillingPage() {
  const { t } = useLanguage();
  const [plan, setPlan] = useState<VendorPlanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [managingPortal, setManagingPortal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vendor/plan")
      .then((r) => r.json())
      .then((d) => setPlan(d.plan ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade() {
    setUpgrading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/vendor/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("vendor.billing.checkoutFailed"));
      window.location.href = data.url;
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : t("common.somethingWentWrong"));
      setUpgrading(false);
    }
  }

  async function handleManagePortal() {
    setManagingPortal(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("vendor.billing.portalFailed"));
      window.location.href = data.url;
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : t("common.somethingWentWrong"));
      setManagingPortal(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isActive = plan?.isActive;
  const tier = plan?.tier ?? "TRIAL";
  const daysLeft = plan?.daysLeft;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("vendor.nav.planBilling")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("vendor.billing.subtitle")}</p>
      </div>

      {/* Current plan status */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("vendor.billing.currentPlan")}</h2>
        {tier === "BUSINESS" && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{t("vendor.plan.business")}</p>
              <p className="text-sm text-muted-foreground">{t("vendor.billing.businessActive")}</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] text-xs font-semibold">
              <Check className="w-3.5 h-3.5" /> {t("common.active")}
            </span>
          </div>
        )}
        {tier === "TRIAL" && isActive && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-info-bg)] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[var(--color-info-text)]" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{t("vendor.billing.freeTrial")}</p>
              <p className="text-sm text-muted-foreground">
                {daysLeft != null
                  ? t(daysLeft === 1 ? "vendor.billing.dayRemaining" : "vendor.billing.daysRemaining", { count: String(daysLeft) })
                  : t("vendor.billing.trialActive")} - {t("vendor.billing.featuresUnlocked")}
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-info-bg)] text-[var(--color-info-text)] text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" /> {t("vendor.billing.trial")}
            </span>
          </div>
        )}
        {(tier === "EXPIRED" || (tier === "TRIAL" && !isActive)) && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-error-bg)] flex items-center justify-center">
              <XCircle className="w-6 h-6 text-[var(--color-error-text)]" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{t("vendor.plan.expired")}</p>
              <p className="text-sm text-muted-foreground">{t("vendor.billing.hiddenListing")}</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-error-bg)] text-[var(--color-error-text)] text-xs font-semibold">
              <XCircle className="w-3.5 h-3.5" /> {t("vendor.billing.expired")}
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error-text)]/30 px-4 py-3 text-sm text-[var(--color-error-text)]">
          {errorMsg}
        </div>
      )}

      {/* Upgrade card — shown for non-Business tiers */}
      {tier !== "BUSINESS" && (
        <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-[var(--color-star)]" />
                <span className="text-sm font-semibold text-primary/80 uppercase tracking-wider">{t("vendor.plan.business")}</span>
              </div>
              <p className="text-3xl font-bold">$19<span className="text-lg font-normal text-primary/80">/month</span></p>
              <p className="text-sm text-primary/80 mt-1">{t("vendor.billing.trialIncluded")}</p>
            </div>
          </div>

          <ul className="space-y-2.5 mb-6">
            {BUSINESS_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-white/90">
                <Check className="w-4 h-4 text-[var(--color-success-bg)] shrink-0" />
                {t(f)}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full py-3 bg-white text-primary font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {upgrading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t("vendor.billing.redirectingCheckout")}</>
            ) : (
              <>{t("vendor.billing.upgradeBusiness")} <ExternalLink className="w-4 h-4" /></>
            )}
          </button>
          <p className="text-xs text-center text-white/60 mt-2">
            {t("vendor.billing.securePayment")}
          </p>
        </div>
      )}

      {/* Active business plan — manage section */}
      {tier === "BUSINESS" && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("vendor.billing.manageSubscription")}</h2>
          <p className="text-sm text-foreground/80 mb-4">
            {t("vendor.billing.manageDesc")}
          </p>
          <button
            onClick={handleManagePortal}
            disabled={managingPortal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/30 transition-colors disabled:opacity-60"
          >
            {managingPortal ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t("vendor.billing.openingPortal")}</>
            ) : (
              <><ExternalLink className="w-4 h-4" /> {t("vendor.billing.manageBilling")}</>
            )}
          </button>
        </div>
      )}

      {/* Feature list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-sm font-semibold text-foreground">{t("vendor.billing.included")}</h2>
        </div>
        <ul className="divide-y divide-border/50">
          {BUSINESS_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 px-6 py-3">
              <Check className="w-4 h-4 text-[var(--color-success-text)] shrink-0" />
              <span className="text-sm text-foreground">{t(f)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
