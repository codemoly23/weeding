"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-5 text-center">
      <h1 className="text-base font-semibold text-red-900">Dashboard could not load.</h1>
      <p className="mt-1 text-sm text-red-700">Try loading your dashboard again.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
        Try again
      </button>
    </div>
  );
}
