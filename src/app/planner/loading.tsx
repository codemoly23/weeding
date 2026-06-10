export default function PlannerLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div role="status" aria-label="Loading planner" className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}
