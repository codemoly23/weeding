import Link from "next/link";

export const metadata = {
  title: "Unsubscribed",
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; already?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const already = params.already;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {error ? (
          <>
            <div className="text-5xl">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground">Invalid Link</h1>
            <p className="text-muted-foreground">
              This unsubscribe link is invalid or expired. If you want to
              unsubscribe, please contact us.
            </p>
          </>
        ) : already ? (
          <>
            <div className="text-5xl">📭</div>
            <h1 className="text-2xl font-bold text-foreground">Already Unsubscribed</h1>
            <p className="text-muted-foreground">
              You have already been unsubscribed from our newsletter.
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl">✅</div>
            <h1 className="text-2xl font-bold text-foreground">Unsubscribed</h1>
            <p className="text-muted-foreground">
              You have been successfully unsubscribed from our newsletter. You
              will no longer receive emails from us.
            </p>
          </>
        )}
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
