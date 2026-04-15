"use client";

import { useState, useEffect } from "react";
import { Star, Clock } from "lucide-react";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  isApproved: boolean;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews);
          setAvgRating(data.avgRating);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approved = reviews.filter((r) => r.isApproved);
  const pending = reviews.filter((r) => !r.isApproved);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">{approved.length} approved · {pending.length} pending approval</p>
      </div>

      {/* Rating summary */}
      {approved.length > 0 && avgRating !== null && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-5">
          <div className="text-center shrink-0">
            <p className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
            <Stars rating={Math.round(avgRating)} />
            <p className="text-xs text-gray-500 mt-1">{approved.length} approved reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = approved.filter((r) => r.rating === star).length;
              const pct = approved.length ? (count / approved.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending reviews notice */}
      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">{pending.length} review{pending.length > 1 ? "s" : ""} awaiting admin approval</p>
            <p className="text-xs text-yellow-700 mt-0.5">These will appear publicly once approved.</p>
          </div>
        </div>
      )}

      {/* No reviews at all */}
      {reviews.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-14 text-center">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No reviews yet</p>
          <p className="text-xs text-gray-400 mt-1">Reviews from customers will appear here after they&apos;re approved</p>
        </div>
      )}

      {/* Approved reviews */}
      {approved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Approved</h2>
          {approved.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-purple-600">{r.authorName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.authorName}</p>
                    <Stars rating={r.rating} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{r.comment}</p>}
              {r.reply && (
                <div className="mt-3 pl-3 border-l-2 border-purple-200">
                  <p className="text-xs text-gray-400 mb-0.5">Your reply:</p>
                  <p className="text-sm text-gray-600">{r.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending reviews */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pending Approval</h2>
          {pending.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-yellow-200 p-5 opacity-75">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-yellow-600">{r.authorName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.authorName}</p>
                    <Stars rating={r.rating} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
