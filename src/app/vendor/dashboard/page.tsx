"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Zap,
  Crown,
  XCircle,
} from "lucide-react";
import type { VendorPlanStatus } from "@/lib/vendor-plan";

interface Stats {
  inquiryCount: number;
  newInquiryCount: number;
  reviewCount: number;
  avgRating: number | null;
  profileViews: number;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  eventType: string;
  eventDate: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string>("PENDING");
  const [plan, setPlan] = useState<VendorPlanStatus | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, inquiriesRes, profileRes, planRes] = await Promise.all([
        fetch("/api/vendor/stats").catch(() => null),
        fetch("/api/vendor/inquiries?page=1&limit=5").catch(() => null),
        fetch("/api/vendor/profile").catch(() => null),
        fetch("/api/vendor/plan").catch(() => null),
      ]);

      const failed = [statsRes, inquiriesRes, profileRes, planRes].filter((res) => !res?.ok).length;
      if (failed === 4) {
        setError("Unable to load your vendor dashboard.");
        return;
      }
      if (failed > 0) {
        setError("Some dashboard data could not load. Refresh to retry.");
      }

      if (statsRes?.ok) {
        const data = await statsRes.json();
        setStats(data.stats ?? data);
      }
      if (inquiriesRes?.ok) {
        const data = await inquiriesRes.json();
        setRecentInquiries(data.inquiries || []);
      }
      if (profileRes?.ok) {
        const data = await profileRes.json();
        setProfileStatus(data.profile?.status || "PENDING");
      }
      if (planRes?.ok) {
        const data = await planRes.json();
        setPlan(data.plan ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error && !stats && recentInquiries.length === 0 && !plan) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-[var(--color-error-bg)] bg-[var(--color-error-bg)] p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-9 w-9 text-[var(--color-error-text)]" />
        <h1 className="text-base font-semibold text-[var(--color-error-text)]">{error}</h1>
        <p className="mt-1 text-sm text-[var(--color-error-text)]">Check your connection and try again.</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const statusBadge = {
    APPROVED: { color: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]", icon: CheckCircle, label: "Approved" },
    PENDING: { color: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]", icon: Clock, label: "Pending Review" },
    REJECTED: { color: "bg-[var(--color-error-bg)] text-[var(--color-error-text)]", icon: AlertCircle, label: "Rejected" },
    SUSPENDED: { color: "bg-muted text-foreground/80", icon: AlertCircle, label: "Suspended" },
  }[profileStatus] ?? { color: "bg-muted text-foreground/80", icon: Clock, label: profileStatus };

  const StatusIcon = statusBadge.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)] p-3 text-sm text-[var(--color-warning-text)]">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back to your vendor portal</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusBadge.label}
        </span>
      </div>

      {/* Pending notice */}
      {profileStatus === "PENDING" && (
        <div className="bg-[var(--color-warning-bg)] border border-[var(--color-warning-bg)] rounded-xl p-4 flex gap-3">
          <Clock className="w-5 h-5 text-[var(--color-warning-text)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--color-warning-text)]">Profile under review</p>
            <p className="text-sm text-[var(--color-warning-text)] mt-0.5">
              Your profile is being reviewed by our team. You'll be notified once approved and your
              listing goes live.{" "}
              <Link href="/vendor/profile" className="underline font-medium">
                Complete your profile
              </Link>{" "}
              in the meantime.
            </p>
          </div>
        </div>
      )}

      {/* Plan status card */}
      {plan && <PlanCard plan={plan} />}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Inquiries"
          value={stats?.inquiryCount ?? 0}
          icon={MessageSquare}
          color="text-[var(--color-info-text)]"
          bg="bg-[var(--color-info-bg)]"
        />
        <StatCard
          label="New Inquiries"
          value={stats?.newInquiryCount ?? 0}
          icon={TrendingUp}
          color="text-primary"
          bg="bg-primary/5"
          highlight={!!stats?.newInquiryCount}
        />
        <StatCard
          label="Reviews"
          value={stats?.reviewCount ?? 0}
          icon={Star}
          color="text-[var(--color-warning-text)]"
          bg="bg-[var(--color-warning-bg)]"
        />
        <StatCard
          label="Avg Rating"
          value={stats?.avgRating ? stats.avgRating.toFixed(1) : "—"}
          icon={Star}
          color="text-[var(--color-warning-text)]"
          bg="bg-[var(--color-warning-bg)]"
        />
      </div>

      {/* Recent inquiries */}
      <div className="bg-card rounded-xl border border-primary/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10">
          <h2 className="font-semibold text-foreground">Recent Inquiries</h2>
          <Link
            href="/vendor/inquiries"
            className="text-sm text-primary hover:text-primary flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No inquiries yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Once customers contact you, inquiries will appear here
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-primary/5">
            {recentInquiries.map((inq) => (
              <li key={inq.id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">
                    {inq.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{inq.name}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        inq.status === "NEW"
                          ? "bg-[var(--color-info-bg)] text-[var(--color-info-text)]"
                          : inq.status === "VIEWED"
                          ? "bg-muted text-foreground/80"
                          : inq.status === "RESPONDED"
                          ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{inq.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground/70">{inq.eventType}</span>
                    {inq.eventDate && (
                      <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(inq.eventDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/vendor/profile"
          className="bg-card rounded-xl border border-primary/10 p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
        >
          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
            Update Your Profile
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Add photos, pricing, and service details to attract more clients
          </p>
          <span className="inline-flex items-center gap-1 text-sm text-primary mt-3 font-medium">
            Edit profile <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/vendor/inquiries"
          className="bg-card rounded-xl border border-primary/10 p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
        >
          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
            Manage Inquiries
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Respond to potential clients and update inquiry statuses
          </p>
          <span className="inline-flex items-center gap-1 text-sm text-primary mt-3 font-medium">
            View inquiries <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: VendorPlanStatus }) {
  if (plan.tier === "BUSINESS") {
    return (
      <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Business Plan</p>
            <p className="text-xs text-accent/80">Full directory listing · Inquiries active</p>
          </div>
        </div>
        <Link href="/vendor/billing" className="text-xs text-white/80 hover:text-white underline underline-offset-2">
          Manage plan
        </Link>
      </div>
    );
  }

  if (plan.tier === "TRIAL" && plan.isActive) {
    const urgent = (plan.daysLeft ?? 0) <= 5;
    return (
      <div className={`rounded-xl p-4 flex items-center justify-between border ${urgent ? "bg-[var(--color-warning-bg)] border-[var(--color-warning-bg)]" : "bg-[var(--color-info-bg)] border-[var(--color-info-bg)]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${urgent ? "bg-[var(--color-warning-bg)]" : "bg-[var(--color-info-bg)]"}`}>
            <Zap className={`w-5 h-5 ${urgent ? "text-[var(--color-warning-text)]" : "text-[var(--color-info-text)]"}`} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${urgent ? "text-[var(--color-warning-text)]" : "text-[var(--color-info-text)]"}`}>
              Free Trial — {plan.daysLeft} day{plan.daysLeft !== 1 ? "s" : ""} left
            </p>
            <p className={`text-xs ${urgent ? "text-[var(--color-warning-text)]" : "text-[var(--color-info-text)]"}`}>
              {urgent ? "Trial ending soon! Upgrade to keep your listing live." : "Your listing is live in the directory."}
            </p>
          </div>
        </div>
        <Link href="/vendor/billing" className={`text-xs font-medium underline underline-offset-2 ${urgent ? "text-[var(--color-warning-text)] hover:text-[var(--color-warning-text)]" : "text-[var(--color-info-text)] hover:text-[var(--color-info-text)]"}`}>
          Upgrade →
        </Link>
      </div>
    );
  }

  // EXPIRED or TRIAL expired
  return (
    <div className="bg-[var(--color-error-bg)] border border-[var(--color-error-bg)] rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-error-bg)] flex items-center justify-center">
          <XCircle className="w-5 h-5 text-[var(--color-error-text)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-error-text)]">Plan Expired</p>
          <p className="text-xs text-[var(--color-error-text)]">
            Your listing is hidden from the directory. Upgrade to go live again.
          </p>
        </div>
      </div>
      <Link href="/vendor/billing" className="px-3 py-1.5 bg-destructive text-white text-xs font-medium rounded-lg hover:bg-destructive/90 transition-colors">
        Upgrade now
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-card rounded-xl border p-4 ${highlight ? "border-primary/30" : "border-primary/10"}`}
      aria-label={`${label}: ${value}`}
    >
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
