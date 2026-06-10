"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, User, Briefcase, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createLocalProject } from "@/lib/planner-storage";
import { useLanguage } from "@/lib/i18n/language-context";

export default function CreateProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { id: "BRIDE", label: t("create.bride"), icon: User },
    { id: "GROOM", label: t("create.groom"), icon: Users },
    { id: "PLANNER", label: t("create.planner"), icon: Briefcase },
    { id: "OTHER", label: t("create.other"), icon: Ghost },
  ];

  useEffect(() => {
    document.title = "Create New Project | Wedding Planner";
  }, []);

  const handleCreate = async () => {
    if (!selectedRole) return;
    setIsCreating(true);
    setError(null);

    // Authenticated → save to DB
    if (session?.user?.id) {
      try {
        const res = await fetch("/api/planner/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: selectedRole }),
        });

        if (res.ok) {
          const data = await res.json();
          router.push(`/planner/${data.project.id}`);
          return;
        }

        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to create project. Please try again.");
      } catch {
        setError("Something went wrong. Please check your connection.");
      } finally {
        setIsCreating(false);
      }
      return;
    }

    // Anonymous → save to localStorage
    try {
      const project = createLocalProject(selectedRole);
      router.push(`/planner/${project.id}`);
    } catch {
      setError("Failed to create project. Please try again.");
      setIsCreating(false);
    }
  };

  if (isCreating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 mx-auto animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-muted-foreground">{t("create.creating")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-2xl text-center px-4">
        <h1 className="mb-10 text-3xl font-semibold text-foreground">
          {t("create.whoAreYou")}
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const selected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border-2 bg-card p-6 transition-all hover:shadow-md",
                  selected
                    ? "border-primary shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/20"
                )}
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
                  <Icon className="h-12 w-12 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">{role.label}</span>
              </button>
            );
          })}
        </div>

        {selectedRole && (
          <Button
            size="lg"
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-primary hover:bg-primary/90 text-white border-0 px-8 py-3 text-base"
          >
            {t("create.createProject")}
          </Button>
        )}

        {error && (
          <p className="mt-4 text-sm text-[var(--color-error-text)]">{error}</p>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          {t("create.termsAgree")}{" "}
          <Link href="/legal/privacy-policy" className="text-primary hover:underline">
            {t("create.privacyTerms")}
          </Link>
        </p>

        <Link
          href="/planner"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          {t("create.goToProjects")}
        </Link>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Are you a wedding vendor?</p>
          <Link
            href="/vendor/register"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 hover:underline"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Register as a Vendor
          </Link>
        </div>
      </div>
    </div>
  );
}
