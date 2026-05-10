export default function VendorLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div role="status" aria-label="Loading vendor portal" className="h-8 w-8 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />
    </div>
  );
}
