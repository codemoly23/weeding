/**
 * Next.js Instrumentation
 *
 * This file runs once when the server starts.
 * Note: Token refresh scheduling is handled in server.ts (custom server)
 * since it requires Node.js runtime with database access.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[Instrumentation] Next.js server starting...");
    console.log("[Instrumentation] Token refresh job runs via custom server or cron API");
  }
}
