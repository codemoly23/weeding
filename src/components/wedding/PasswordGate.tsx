"use client";
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function PasswordGate({
  password,
  children,
}: {
  password: string;
  children: React.ReactNode;
}) {
  const sessionKey = `wedding-pw-${password.slice(0, 8)}`;
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(sessionKey) === "1";
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (unlocked) return <>{children}</>;

  function attempt() {
    if (input === password) {
      sessionStorage.setItem(sessionKey, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/5 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-lg text-center">
        <Lock className="mx-auto mb-4 h-10 w-10 text-accent/30" />
        <h1 className="text-xl font-semibold text-foreground mb-1">This page is private</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter the password to view this wedding site.</p>
        <div className="relative mb-3">
          <input
            type={showPw ? "text" : "password"}
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && attempt()}
            placeholder="Password"
            className={`w-full rounded-xl border px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 ${error ? "border-[var(--color-error-text)]/30 focus:ring-[var(--color-error-bg)]" : "border-border focus:ring-accent/10 focus:border-accent/30"}`}
          />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/80">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-[var(--color-error-text)] mb-3">Incorrect password. Please try again.</p>}
        <button
          onClick={attempt}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-primary-foreground hover:bg-accent/90 transition-colors"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
