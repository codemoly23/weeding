"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-5 text-center">
        <h1 className="text-base font-semibold text-red-900">Something went wrong.</h1>
        <p className="mt-1 text-sm text-red-700">Refresh this section and try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
