"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function VendorSettingsPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPassword.length < 8) {
      setPwError(t("vendor.settings.passwordMinError"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError(t("vendor.settings.passwordsDoNotMatch"));
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const d = await res.json();
      if (!res.ok) {
        setPwError(d.error || t("vendor.settings.passwordUpdateFailed"));
      } else {
        setPwSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwSaved(false), 3000);
      }
    } catch {
      setPwError(t("common.networkError"));
    } finally {
      setPwSaving(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || t("vendor.settings.saveFailed"));
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

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("common.settings")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("vendor.settings.subtitle")}</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">{t("vendor.settings.accountInformation")}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("dashboard.profile.fullName")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("vendor.settings.email")}</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border border-border/50 rounded-lg px-3 py-2 text-sm bg-muted/30 text-muted-foreground/70 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground/70 mt-1">{t("vendor.settings.emailCannotChange")}</p>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-error-text)] bg-[var(--color-error-bg)] border border-[var(--color-error-text)]/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
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
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-card rounded-xl border border-border p-5 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t("dashboard.profile.changePassword")}</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("dashboard.profile.currentPassword")}</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPwError(""); setPwSaved(false); }}
                placeholder={t("vendor.settings.currentPasswordPlaceholder")}
                className="w-full border border-border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("dashboard.profile.newPassword")}</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPwError(""); setPwSaved(false); }}
                placeholder={t("vendor.settings.newPasswordPlaceholder")}
                className="w-full border border-border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 8 && (
              <p className="text-xs text-[var(--color-warning-text)] mt-1">{t("vendor.settings.passwordMin")}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("vendor.settings.confirmNewPassword")}</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPwError(""); setPwSaved(false); }}
                placeholder={t("vendor.settings.confirmPasswordPlaceholder")}
                className="w-full border border-border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-[var(--color-error-text)] mt-1">{t("vendor.settings.passwordsDoNotMatch")}</p>
            )}
          </div>

          {pwError && (
            <p className="text-sm text-[var(--color-error-text)] bg-[var(--color-error-bg)] border border-[var(--color-error-text)]/30 rounded-lg px-3 py-2">
              {pwError}
            </p>
          )}

          <button
            type="submit"
            disabled={pwSaving || !currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {pwSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : pwSaved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {pwSaving ? t("vendor.settings.updating") : pwSaved ? t("vendor.settings.passwordUpdated") : t("vendor.settings.updatePassword")}
          </button>
        </form>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mt-4">
        <h2 className="text-sm font-semibold text-foreground mb-1">{t("dashboard.profile.dangerZone")}</h2>
        <p className="text-xs text-muted-foreground mb-4">
          {t("vendor.settings.deactivateHelp")}
        </p>
        <a
          href="mailto:support@ceremoney.com"
          className="text-sm text-[var(--color-error-text)] hover:text-[var(--color-error-text)] underline"
        >
          {t("dashboard.support.contactSupport")}
        </a>
      </div>
    </div>
  );
}
