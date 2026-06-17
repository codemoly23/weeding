"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  Calendar,
  ArrowRight,
  XCircle,
  Clock,
  CheckCircle,
  Store,
} from "lucide-react";

interface ProjectInfo {
  title: string;
  brideName: string | null;
  groomName: string | null;
  eventDate: string | null;
  eventType: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function VendorInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No invite token provided.");
      setLoading(false);
      return;
    }

    fetch(`/api/invite/vendor/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invalid invite link.");
        } else {
          setProject(data.project);
          setExpiresAt(data.expiresAt);
        }
      })
      .catch(() => setError("Could not load invite. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8 max-w-sm w-full text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-foreground">Invite not valid</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {error ?? "This invite link is no longer active."}
          </p>
          <Link
            href="/vendor/register"
            className="inline-flex items-center gap-1.5 mt-6 text-sm text-primary hover:underline"
          >
            Register as a vendor anyway <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const coupleName =
    project.brideName && project.groomName
      ? `${project.brideName} & ${project.groomName}`
      : project.brideName || project.groomName || project.title;

  const registerUrl = `/vendor/register?token=${token}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Top bar */}
      <div className="bg-card border-b border-border/50 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <span className="text-sm font-semibold text-primary">Ceremoney</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-5">
        {/* Invite card */}
        <div className="bg-card rounded-2xl border border-primary/15 p-7 text-center shadow-sm">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-primary fill-primary" />
          </div>
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
            Vendor Invitation
          </p>
          <h1 className="text-2xl font-bold text-foreground">{coupleName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {project.eventType.charAt(0) + project.eventType.slice(1).toLowerCase()} Planning
          </p>
          {project.eventDate && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(project.eventDate)}
            </p>
          )}
        </div>

        {/* Message card */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[var(--color-info-bg)] rounded-full flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-[var(--color-info-text)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">You&apos;ve been invited to join Ceremoney</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                The couple planning this{" "}
                <span className="font-medium text-foreground">
                  {project.eventType.toLowerCase()}
                </span>{" "}
                is looking for trusted vendors and professionals. Create your free vendor profile to connect with them.
              </p>
            </div>
          </div>
        </div>

        {/* Expiry notice */}
        {expiresAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            This invite expires on{" "}
            <span className="font-medium text-foreground">
              {formatDate(expiresAt)}
            </span>
          </div>
        )}

        {/* What you get */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            What you get
          </p>
          <ul className="space-y-2.5">
            {[
              "Free vendor profile visible to thousands of couples",
              "Direct messaging with the couple who invited you",
              "30-day free trial — no credit card required",
              "Access to wedding planning inquiries in your area",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <CheckCircle className="w-4 h-4 text-[var(--color-success-text)] shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          <Link href={registerUrl}>
            <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors text-sm">
              Create your vendor profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href={`/login?callbackUrl=/vendor/dashboard`}>
            <button className="w-full border border-border text-muted-foreground hover:bg-muted py-3 rounded-xl text-sm transition-colors">
              Already have an account? Sign in
            </button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 pb-4">
          By registering, you agree to our Terms of Service and Privacy Policy.
          Your listing will be reviewed before going live.
        </p>
      </div>
    </div>
  );
}

export default function VendorInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }
    >
      <VendorInviteContent />
    </Suspense>
  );
}
