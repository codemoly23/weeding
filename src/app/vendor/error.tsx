"use client";

export default function VendorError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-[var(--color-error-text)]/30 bg-[var(--color-error-bg)] p-5 text-center">
      <h1 className="text-base font-semibold text-[var(--color-error-text)]">Vendor portal could not load.</h1>
      <p className="mt-1 text-sm text-[var(--color-error-text)]">Try loading this vendor page again.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-md bg-[var(--color-error-text)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-error-text)]/90">
        Try again
      </button>
    </div>
  );
}
