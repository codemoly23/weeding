"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, Heart, Calendar, Loader2, Shield } from "lucide-react";

type RsvpQuestionType = "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";

interface RsvpQuestion {
  id: string;
  text: string;
  type: RsvpQuestionType;
  options: string[] | null;
  required: boolean;
  order: number;
}

interface GuestInfo {
  id: string;
  firstName: string;
  lastName: string | null;
  title: string | null;
  rsvpStatus: "PENDING" | "ATTENDING" | "NOT_ATTENDING";
  dietary: string | null;
  rsvpMessage: string | null;
  rsvpSubmittedAt: string | null;
  gdprConsentAt: string | null;
  rsvpAnswers: { questionId: string; answer: string }[];
  project: {
    title: string;
    eventDate: string | null;
    eventType: string;
    rsvpQuestions: RsvpQuestion[];
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function fullName(g: GuestInfo) {
  return [g.title, g.firstName, g.lastName].filter(Boolean).join(" ");
}

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>();

  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [attending, setAttending] = useState<boolean | null>(null);
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Invalid link");
        return res.json();
      })
      .then((data) => {
        setGuest(data.guest);
        if (data.guest.rsvpSubmittedAt) {
          setSubmitted(true);
          setAttending(data.guest.rsvpStatus === "ATTENDING");
          setDietary(data.guest.dietary ?? "");
          setMessage(data.guest.rsvpMessage ?? "");
          setGdprConsent(!!data.guest.gdprConsentAt);
          // Pre-fill existing answers
          const existingAnswers: Record<string, string> = {};
          for (const a of data.guest.rsvpAnswers ?? []) {
            existingAnswers[a.questionId] = a.answer;
          }
          setAnswers(existingAnswers);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (attending === null) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rsvpStatus: attending ? "ATTENDING" : "NOT_ATTENDING",
          dietary: dietary.trim() || null,
          rsvpMessage: message.trim() || null,
          gdprConsent,
          answers,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Submission failed");
      const data = await res.json();
      setGuest((prev) => prev ? { ...prev, ...data.guest } : prev);
      setSubmitted(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-accent/60" />
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-accent/5 px-4 text-center">
        <XCircle className="mb-4 h-12 w-12 text-accent/60" />
        <h1 className="text-xl font-semibold text-foreground">Invalid RSVP Link</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error ?? "This RSVP link is not valid or has expired."}</p>
      </div>
    );
  }

  const eventDate = guest.project.eventDate ? formatDate(guest.project.eventDate) : null;
  const questions = guest.project.rsvpQuestions ?? [];

  if (submitted) {
    const isAttending = guest.rsvpStatus === "ATTENDING";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-accent/5 px-4 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-card p-8 shadow-lg">
          {isAttending ? (
            <>
              <Heart className="mx-auto mb-4 h-12 w-12 text-accent/60" />
              <h1 className="text-2xl font-bold text-foreground">You&apos;re Attending!</h1>
              <p className="mt-2 text-muted-foreground">
                Thank you, <span className="font-semibold text-accent">{fullName(guest)}</span>! We&apos;re so excited to celebrate with you.
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/70" />
              <h1 className="text-2xl font-bold text-foreground">We&apos;ll Miss You</h1>
              <p className="mt-2 text-muted-foreground">
                Thank you for letting us know, <span className="font-semibold">{fullName(guest)}</span>. You&apos;ll be in our thoughts on the day.
              </p>
            </>
          )}
          {eventDate && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-accent/5 px-4 py-3 text-sm text-accent">
              <Calendar className="h-4 w-4" />
              <span>{eventDate}</span>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground/70">
            Changed your mind? Fill out the form again below.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-3 text-xs text-primary hover:text-primary underline"
          >
            Update my RSVP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/5 px-4 py-12">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-accent/60" />
          <h1 className="text-2xl font-bold text-foreground">{guest.project.title}</h1>
          {eventDate && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{eventDate}</span>
            </div>
          )}
          <p className="mt-3 text-sm text-foreground/80">
            Hi <span className="font-semibold text-accent">{fullName(guest)}</span>,
            you&apos;ve been invited! Please let us know if you can make it.
          </p>
        </div>

        {/* RSVP Form */}
        <form onSubmit={handleSubmit} className="rounded-3xl bg-card p-6 shadow-lg space-y-5">
          {/* Attending toggle */}
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Will you be attending?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttending(true)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all ${
                  attending === true
                    ? "border-accent/40 bg-accent/5 text-accent"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border"
                }`}
              >
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-sm font-medium">Joyfully accepts</span>
              </button>
              <button
                type="button"
                onClick={() => setAttending(false)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all ${
                  attending === false
                    ? "border-border bg-muted text-foreground/80"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border"
                }`}
              >
                <XCircle className="h-6 w-6" />
                <span className="text-sm font-medium">Regretfully declines</span>
              </button>
            </div>
          </div>

          {/* Dietary — only when attending */}
          {attending === true && (
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Dietary requirements <span className="text-xs font-normal text-muted-foreground/70">(optional)</span>
              </label>
              <div className="space-y-2 mb-3">
                {["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Halal"].map(opt => {
                  const checked = dietary.split(",").map(s => s.trim()).includes(opt);
                  return (
                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const parts = dietary.split(",").map(s => s.trim()).filter(Boolean);
                          const next = checked ? parts.filter(p => p !== opt) : [...parts, opt];
                          setDietary(next.join(", "));
                        }}
                        className="h-4 w-4 rounded accent-[var(--color-accent)]"
                      />
                      <span className="text-sm text-foreground">{opt}</span>
                    </label>
                  );
                })}
              </div>
              <input
                type="text"
                value={dietary.split(",").map(s => s.trim()).filter(s => !["Vegetarian","Vegan","Gluten-free","Dairy-free","Halal"].includes(s)).join(", ")}
                onChange={e => {
                  const standard = dietary.split(",").map(s => s.trim()).filter(s => ["Vegetarian","Vegan","Gluten-free","Dairy-free","Halal"].includes(s));
                  const custom = e.target.value;
                  setDietary([...standard, ...(custom ? [custom] : [])].join(", "));
                }}
                placeholder="Other (e.g. Nut allergy, Kosher…)"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
              />
            </div>
          )}

          {/* Custom RSVP questions */}
          {attending !== null && questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {q.text}
                    {q.required && <span className="ml-1 text-accent">*</span>}
                  </label>
                  {q.type === "SHORT_TEXT" && (
                    <input
                      type="text"
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                      required={q.required}
                      className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                  )}
                  {q.type === "LONG_TEXT" && (
                    <textarea
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                      required={q.required}
                      rows={3}
                      className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10 resize-none"
                    />
                  )}
                  {q.type === "SINGLE_CHOICE" && q.options && (
                    <div className="space-y-2">
                      {(q.options as string[]).map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                            required={q.required}
                            className="accent-[var(--color-accent)]"
                          />
                          <span className="text-sm text-foreground">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === "MULTIPLE_CHOICE" && q.options && (
                    <div className="space-y-2">
                      {(q.options as string[]).map((opt) => {
                        const selected = (answers[q.id] ?? "").split("|||").filter(Boolean);
                        const checked = selected.includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const next = checked
                                  ? selected.filter((x) => x !== opt)
                                  : [...selected, opt];
                                setAnswers((p) => ({ ...p, [q.id]: next.join("|||") }));
                              }}
                              className="accent-[var(--color-accent)]"
                            />
                            <span className="text-sm text-foreground">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message — always shown when attending selection made */}
          {attending !== null && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {attending ? "Leave a message for the couple" : "A note for the couple"}{" "}
                <span className="text-xs font-normal text-muted-foreground/70">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={attending ? "We can't wait to celebrate with you both!" : "Wishing you a beautiful day…"}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10 resize-none"
              />
            </div>
          )}

          {/* GDPR consent — Task 10 */}
          {attending !== null && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={gdprConsent}
                onChange={(e) => setGdprConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-[var(--color-accent)] shrink-0"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                <Shield className="inline h-3 w-3 mr-1 text-muted-foreground/70" />
                I consent to my personal data (name, dietary preferences, responses) being stored and used solely for the purpose of managing this event. This data will not be shared with third parties.{" "}
                <span className="text-accent">*</span>
              </span>
            </label>
          )}

          {saveError && (
            <p className="rounded-xl bg-[var(--color-error-bg)] px-3 py-2 text-xs text-[var(--color-error-text)]">{saveError}</p>
          )}

          <button
            type="submit"
            disabled={attending === null || saving || (attending !== null && !gdprConsent)}
            className="w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-white transition-all hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Sending…" : "Send RSVP"}
          </button>
          {attending !== null && !gdprConsent && (
            <p className="text-center text-xs text-muted-foreground/70">Please accept the data consent to submit.</p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Your response will be sent directly to the couple.
        </p>
      </div>
    </div>
  );
}
