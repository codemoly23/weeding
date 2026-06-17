"use client";

import { useState, useEffect } from "react";
import { Star, Clock, MessageSquare, Pencil, X, Check } from "lucide-react";

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
          className={`w-4 h-4 ${n <= rating ? "fill-[var(--color-star)] text-[var(--color-star)]" : "fill-muted-foreground/30 text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ReplyBox({
  review,
  onSaved,
}: {
  review: Review;
  onSaved: (id: string, reply: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(review.reply ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/vendor/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save reply");
        return;
      }
      onSaved(review.id, data.review.reply);
      setOpen(false);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/vendor/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to remove reply");
        return;
      }
      onSaved(review.id, null);
      setText("");
      setOpen(false);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setText(review.reply ?? "");
    setError("");
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="mt-3">
        {review.reply && (
          <div className="pl-3 border-l-2 border-primary/20 mb-3">
            <p className="text-xs text-muted-foreground/70 mb-0.5">Your reply:</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{review.reply}</p>
          </div>
        )}
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {review.reply ? (
            <>
              <Pencil className="w-3 h-3" /> Edit reply
            </>
          ) : (
            <>
              <MessageSquare className="w-3 h-3" /> Reply to review
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {review.reply && (
        <div className="pl-3 border-l-2 border-primary/20 mb-3">
          <p className="text-xs text-muted-foreground/70 mb-0.5">Current reply:</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{review.reply}</p>
        </div>
      )}
      <div className="bg-muted/40 rounded-lg p-3 border border-border/60">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {review.reply ? "Edit your reply" : "Write a reply"}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Thank the customer or address their feedback professionally…"
          rows={3}
          maxLength={1000}
          className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground/50">{text.length}/1000</span>
          <div className="flex items-center gap-2">
            {review.reply && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="text-xs text-destructive hover:text-destructive/80 disabled:opacity-50 transition-colors"
              >
                Remove reply
              </button>
            )}
            <button
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || text.trim().length === 0}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <span className="w-3 h-3 border border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              {saving ? "Saving…" : "Save reply"}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </div>
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

  const handleReplySaved = (id: string, reply: string | null) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply } : r)));
  };

  const approved = reviews.filter((r) => r.isApproved);
  const pending = reviews.filter((r) => !r.isApproved);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {approved.length} approved · {pending.length} pending approval
        </p>
      </div>

      {/* Rating summary */}
      {approved.length > 0 && avgRating !== null && (
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-5">
          <div className="text-center shrink-0">
            <p className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
            <Stars rating={Math.round(avgRating)} />
            <p className="text-xs text-muted-foreground mt-1">{approved.length} approved reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = approved.filter((r) => r.rating === star).length;
              const pct = approved.length ? (count / approved.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-3">{star}</span>
                  <Star className="w-3 h-3 fill-[var(--color-star)] text-[var(--color-star)]" />
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className="bg-[var(--color-star)] h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground/70 w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending reviews notice */}
      {pending.length > 0 && (
        <div className="bg-[var(--color-warning-bg)] border border-[var(--color-warning-text)]/30 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-4 h-4 text-[var(--color-warning-text)] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[var(--color-warning-text)]">
              {pending.length} review{pending.length > 1 ? "s" : ""} awaiting admin approval
            </p>
            <p className="text-xs text-[var(--color-warning-text)] mt-0.5">
              These will appear publicly once approved.
            </p>
          </div>
        </div>
      )}

      {/* No reviews at all */}
      {reviews.length === 0 && (
        <div className="bg-card rounded-xl border border-border px-6 py-14 text-center">
          <Star className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No reviews yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Reviews from customers will appear here after they&apos;re approved
          </p>
        </div>
      )}

      {/* Approved reviews */}
      {approved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Approved</h2>
          {approved.map((r) => (
            <div key={r.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {r.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.authorName}</p>
                    <Stars rating={r.rating} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/70 shrink-0">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              {r.comment && (
                <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{r.comment}</p>
              )}
              <ReplyBox review={r} onSaved={handleReplySaved} />
            </div>
          ))}
        </div>
      )}

      {/* Pending reviews */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Pending Approval
          </h2>
          {pending.map((r) => (
            <div
              key={r.id}
              className="bg-card rounded-xl border border-[var(--color-warning-text)]/30 p-5 opacity-75"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-warning-bg)] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[var(--color-warning-text)]">
                      {r.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.authorName}</p>
                    <Stars rating={r.rating} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                  <p className="text-xs text-muted-foreground/70">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
