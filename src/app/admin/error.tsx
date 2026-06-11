"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-[var(--ast-error-border)] bg-[var(--ast-error-bg)] p-5 text-center">
      <h1 className="text-base font-semibold text-[var(--ast-error-text)]">Admin area could not load.</h1>
      <p className="mt-1 text-sm text-[var(--ast-error-text)]">Try loading this admin page again.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-md bg-[var(--ast-error-icon)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--ast-error-text)]">
        Try again
      </button>
    </div>
  );
}
