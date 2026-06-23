"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Calendar, Mail, Phone, ChevronDown, Filter } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  eventType: string;
  eventDate: string | null;
  budget: string | null;
  message: string;
  status: "NEW" | "VIEWED" | "RESPONDED" | "ARCHIVED";
  createdAt: string;
}

const STATUS_OPTIONS = ["ALL", "NEW", "VIEWED", "RESPONDED", "ARCHIVED"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-[var(--color-info-bg)] text-[var(--color-info-text)]",
  VIEWED: "bg-muted text-foreground/80",
  RESPONDED: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
  ARCHIVED: "bg-muted text-muted-foreground/70",
};

const NEXT_STATUSES: Record<string, { labelKey: string; value: string }[]> = {
  NEW: [
    { labelKey: "vendor.inquiries.markViewed", value: "VIEWED" },
    { labelKey: "vendor.inquiries.markResponded", value: "RESPONDED" },
    { labelKey: "vendor.inquiries.archive", value: "ARCHIVED" },
  ],
  VIEWED: [
    { labelKey: "vendor.inquiries.markResponded", value: "RESPONDED" },
    { labelKey: "vendor.inquiries.archive", value: "ARCHIVED" },
  ],
  RESPONDED: [{ labelKey: "vendor.inquiries.archive", value: "ARCHIVED" }],
  ARCHIVED: [{ labelKey: "vendor.inquiries.markNew", value: "NEW" }],
};

export default function VendorInquiriesPage() {
  const { t, lang } = useLanguage();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/vendor/inquiries?${params}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/vendor/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: status as Inquiry["status"] } : inq))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("vendor.nav.inquiries")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("vendor.inquiries.totalCount", { count: String(total) })}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground/70" />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-card border border-border text-foreground/80 hover:border-border"
            }`}
          >
            {t(`vendor.inquiries.status.${s}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-card rounded-xl border border-border px-6 py-14 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">{t("vendor.inquiries.noneFound")}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {statusFilter !== "ALL"
              ? t("vendor.inquiries.noneForStatus", { status: t(`vendor.inquiries.status.${statusFilter}`).toLowerCase() })
              : t("vendor.inquiries.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => {
            const isExpanded = expandedId === inq.id;
            return (
              <div
                key={inq.id}
                className={`bg-card rounded-xl border transition-all ${
                  inq.status === "NEW" ? "border-[var(--color-info-bg)]" : "border-border"
                }`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {inq.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{inq.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_STYLES[inq.status]}`}>
                        {t(`vendor.inquiries.status.${inq.status}`)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{inq.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground/70">
                      {new Date(inq.createdAt).toLocaleDateString(lang === "sv" ? "sv-SE" : "en-US")}
                    </p>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground/70 ml-auto mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-5 py-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <Mail className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                        <a href={`mailto:${inq.email}`} className="hover:text-primary">
                          {inq.email}
                        </a>
                      </div>
                      {inq.phone && (
                        <div className="flex items-center gap-2 text-sm text-foreground/80">
                          <Phone className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                          {inq.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="text-muted-foreground/70 text-xs font-medium uppercase tracking-wide">{t("vendor.inquiries.event")}</span>
                        {inq.eventType}
                      </div>
                      {inq.eventDate && (
                        <div className="flex items-center gap-2 text-sm text-foreground/80">
                          <Calendar className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                          {new Date(inq.eventDate).toLocaleDateString(lang === "sv" ? "sv-SE" : "en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      )}
                      {inq.budget && (
                        <div className="flex items-center gap-2 text-sm text-foreground/80">
                          <span className="text-muted-foreground/70 text-xs font-medium uppercase tracking-wide">{t("vendor.inquiries.budget")}</span>
                          {inq.budget}
                        </div>
                      )}
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("vendor.inquiries.message")}</p>
                      <p className="text-sm text-foreground leading-relaxed">{inq.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`mailto:${inq.email}?subject=Re: Your inquiry`}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        {t("vendor.inquiries.replyByEmail")}
                      </a>
                      {NEXT_STATUSES[inq.status]?.map((next) => (
                        <button
                          key={next.value}
                          onClick={() => updateStatus(inq.id, next.value)}
                          disabled={updatingId === inq.id}
                          className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-foreground/80 hover:border-border disabled:opacity-50 transition-colors"
                        >
                          {updatingId === inq.id ? t("vendor.inquiries.updating") : t(next.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            {t("dashboard.orders.pageOf", { page: String(page), total: String(totalPages) })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:border-border"
            >
              {t("common.previous")}
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:border-border"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
