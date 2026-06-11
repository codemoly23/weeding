export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div role="status" aria-label="Loading admin" className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--ast-neutral-border)] border-t-[var(--ast-neutral-text)]" />
    </div>
  );
}
