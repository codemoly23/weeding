"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Heart, X, Shield, Loader2 } from "lucide-react";

interface RsvpModalProps {
  slug: string;
  primaryColor: string;
  accentColor: string;
  buttonLabel?: string;
}

export default function RsvpModal({ slug, primaryColor, accentColor, buttonLabel = "RSVP Now" }: RsvpModalProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [side, setSide] = useState<"BRIDE" | "GROOM">("BRIDE");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [dietary, setDietary] = useState("");
  const [hasPlusOne, setHasPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [message, setMessage] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);

  function resetForm() {
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    setSide("BRIDE"); setAttending(null); setDietary("");
    setHasPlusOne(false); setPlusOneName(""); setMessage("");
    setGdprConsent(false); setError(null); setSubmitted(false);
  }

  function handleOpen() { resetForm(); setOpen(true); }
  function handleClose() { setOpen(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (attending === null) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/rsvp/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, side, attending, dietary, hasPlusOne, plusOneName, message, gdprConsent }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSaving(false);
    }
  }

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Halal"];

  return (
    <>
      <button
        onClick={handleOpen}
        style={{ background: primaryColor }}
        className="inline-block px-8 py-3 rounded-full text-white font-medium hover:opacity-90 transition"
      >
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-card shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" style={{ color: primaryColor }} />
                <h2 className="text-lg font-semibold text-foreground">RSVP</h2>
              </div>
              <button onClick={handleClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                {attending ? (
                  <>
                    <Heart className="mb-4 h-12 w-12" style={{ color: primaryColor }} />
                    <h3 className="text-2xl font-bold text-foreground">
                      {attending ? "You're Attending!" : "We'll Miss You"}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Thank you, <span className="font-semibold" style={{ color: primaryColor }}>{firstName}</span>! We can&apos;t wait to celebrate with you.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-2xl font-bold text-foreground">We&apos;ll Miss You</h3>
                    <p className="mt-2 text-muted-foreground">
                      Thank you for letting us know, <span className="font-semibold">{firstName}</span>.
                    </p>
                  </>
                )}
                <button
                  onClick={handleClose}
                  style={{ background: primaryColor }}
                  className="mt-6 rounded-full px-8 py-3 text-white font-medium hover:opacity-90 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">First name <span className="text-accent">*</span></label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                      placeholder="Jane"
                      className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+46 70 123 4567"
                      className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                </div>

                {/* Side */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Guest of</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["BRIDE", "GROOM"] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSide(s)}
                        style={side === s ? { borderColor: primaryColor, background: accentColor, color: primaryColor } : {}}
                        className={`rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${side === s ? "" : "border-border bg-muted/30 text-muted-foreground hover:border-border"}`}
                      >
                        {s === "BRIDE" ? "Bride's side" : "Groom's side"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attending */}
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground/80">Will you be attending? <span className="text-accent">*</span></p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAttending(true)}
                      style={attending === true ? { borderColor: primaryColor, background: accentColor, color: primaryColor } : {}}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all ${attending === true ? "" : "border-border bg-muted/30 text-muted-foreground hover:border-border"}`}
                    >
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="text-sm font-medium">Joyfully accepts</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttending(false)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all ${attending === false ? "border-border bg-muted text-foreground/80" : "border-border bg-muted/30 text-muted-foreground hover:border-border"}`}
                    >
                      <XCircle className="h-6 w-6" />
                      <span className="text-sm font-medium">Regretfully declines</span>
                    </button>
                  </div>
                </div>

                {/* Dietary — only when attending */}
                {attending === true && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground/80">
                      Dietary requirements <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <div className="space-y-2 mb-3">
                      {dietaryOptions.map(opt => {
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
                              className="h-4 w-4 rounded"
                              style={{ accentColor: primaryColor }}
                            />
                            <span className="text-sm text-foreground/80">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      value={dietary.split(",").map(s => s.trim()).filter(s => !dietaryOptions.includes(s)).join(", ")}
                      onChange={e => {
                        const standard = dietary.split(",").map(s => s.trim()).filter(s => dietaryOptions.includes(s));
                        const custom = e.target.value;
                        setDietary([...standard, ...(custom ? [custom] : [])].join(", "));
                      }}
                      placeholder="Other (e.g. Nut allergy, Kosher…)"
                      className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                )}

                {/* Plus-one */}
                {attending === true && (
                  <div>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPlusOne}
                        onChange={e => setHasPlusOne(e.target.checked)}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: primaryColor }}
                      />
                      <span className="text-sm font-medium text-foreground/80">Bringing a plus-one?</span>
                    </label>
                    {hasPlusOne && (
                      <input
                        type="text"
                        value={plusOneName}
                        onChange={e => setPlusOneName(e.target.value)}
                        placeholder="Plus-one's full name"
                        className="mt-2 w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
                      />
                    )}
                  </div>
                )}

                {/* Message */}
                {attending !== null && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                      {attending ? "Leave a message for the couple" : "A note for the couple"}{" "}
                      <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={3}
                      placeholder={attending ? "We can't wait to celebrate with you!" : "Wishing you a beautiful day…"}
                      className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10 resize-none"
                    />
                  </div>
                )}

                {/* GDPR */}
                {attending !== null && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={gdprConsent}
                      onChange={e => setGdprConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded shrink-0"
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      <Shield className="inline h-3 w-3 mr-1 text-muted-foreground" />
                      I consent to my personal data being stored and used solely for the purpose of managing this event. <span className="text-accent">*</span>
                    </span>
                  </label>
                )}

                {error && (
                  <p className="rounded-xl bg-[var(--color-error-bg)] px-3 py-2 text-xs text-[var(--color-error-text)]">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={attending === null || saving || (attending !== null && !gdprConsent)}
                  style={attending !== null && gdprConsent ? { background: primaryColor } : {}}
                  className="w-full rounded-2xl py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-muted-foreground"
                >
                  {saving ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Send RSVP"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
