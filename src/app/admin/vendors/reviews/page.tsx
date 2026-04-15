"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Star, Check, X, Trash2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  isApproved: boolean;
  createdAt: string;
  vendor: {
    id: string;
    slug: string;
    businessName: string;
    category: string;
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  );
}

export default function AdminVendorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0 });
  const [status, setStatus] = useState<"all" | "pending" | "approved">("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vendors/reviews?status=${status}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
        setStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    setActionLoading(id + "_approve");
    await fetch(`/api/admin/vendors/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: true }),
    });
    setActionLoading(null);
    load();
  }

  async function reject(id: string) {
    setActionLoading(id + "_reject");
    await fetch(`/api/admin/vendors/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: false }),
    });
    setActionLoading(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setActionLoading(id + "_delete");
    await fetch(`/api/admin/vendors/reviews/${id}`, { method: "DELETE" });
    setActionLoading(null);
    load();
  }

  const statCards = [
    { label: "Pending Approval", value: stats.pending, color: "text-yellow-700" },
    { label: "Approved", value: stats.approved, color: "text-green-700" },
    { label: "Total", value: stats.pending + stats.approved, color: "text-gray-900" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">Approve or reject customer reviews before they go public</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["pending", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setStatus(f); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              status === f
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "pending" ? `Pending (${stats.pending})` : f === "approved" ? `Approved (${stats.approved})` : "All"}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-14 text-center">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No {status !== "all" ? status : ""} reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4 flex-wrap">
                {/* Author + rating */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{r.authorName}</span>
                    <Stars rating={r.rating} />
                    <Badge variant={r.isApproved ? "default" : "secondary"} className={r.isApproved ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}>
                      {r.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  {/* Vendor */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs text-gray-400">for</span>
                    <Link
                      href={`/vendors/${r.vendor.slug}`}
                      target="_blank"
                      className="text-xs text-purple-600 hover:underline flex items-center gap-0.5"
                    >
                      {r.vendor.businessName} <ExternalLink className="w-3 h-3" />
                    </Link>
                    <span className="text-xs text-gray-400">
                      · {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                  )}
                  {r.reply && (
                    <div className="mt-2 pl-3 border-l-2 border-purple-200">
                      <p className="text-xs text-gray-400 mb-0.5">Vendor reply:</p>
                      <p className="text-sm text-gray-600">{r.reply}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!r.isApproved && (
                    <button
                      onClick={() => approve(r.id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {actionLoading === r.id + "_approve" ? "..." : "Approve"}
                    </button>
                  )}
                  {r.isApproved && (
                    <button
                      onClick={() => reject(r.id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-60 text-yellow-800 text-xs font-medium rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      {actionLoading === r.id + "_reject" ? "..." : "Unapprove"}
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {actionLoading === r.id + "_delete" ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
