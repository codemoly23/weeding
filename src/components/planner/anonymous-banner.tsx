"use client";

import { useState } from "react";
import { AlertTriangle, X, LogIn, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

interface AnonymousBannerProps {
  projectId: string;
}

export function AnonymousBanner({ projectId }: AnonymousBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();

  const isLoggedIn = !!session?.user?.id;

  if (!projectId.startsWith("local-") || dismissed || isLoggedIn) return null;

  // If already logged in, sync directly without going through login page
  async function handleSaveNow() {
    setSaving(true);
    router.push(`/planner/sync?from=${projectId}`);
  }

  const loginUrl = `/login?callbackUrl=${encodeURIComponent(
    `/planner/sync?from=${projectId}`
  )}`;

  return (
    <div className="flex items-center justify-between bg-[var(--color-warning-text)] px-4 py-2">
      <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          {t("planner.banner.notSaved")}{" "}
          <span className="hidden sm:inline opacity-90">
            {t("planner.banner.dataLost")}
          </span>
        </span>
      </div>
      <div className="ml-4 flex items-center gap-2">
        {isLoggedIn ? (
          <Button
            size="sm"
            onClick={handleSaveNow}
            disabled={saving}
            className="h-7 gap-1.5 border-0 bg-card text-xs font-semibold text-[var(--color-warning-text)] hover:bg-[var(--color-warning-bg)] shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save to Account"}
          </Button>
        ) : (
          <Link href={loginUrl}>
            <Button
              size="sm"
              className="h-7 gap-1.5 border-0 bg-card text-xs font-semibold text-[var(--color-warning-text)] hover:bg-[var(--color-warning-bg)] shadow-sm"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t("planner.banner.loginToSave")}
            </Button>
          </Link>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-primary-foreground/80 hover:text-primary-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
