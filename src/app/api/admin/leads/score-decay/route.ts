import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runScoreDecayJob } from "@/lib/leads/score-decay-job";

/**
 * POST /api/admin/leads/score-decay
 *
 * Run the score decay job. Can be triggered by:
 * 1. Admin session (manual trigger from dashboard)
 * 2. External cron service with x-cron-secret header
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: admin session OR cron secret
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (cronSecret && expectedSecret && cronSecret === expectedSecret) {
      // Valid cron secret - proceed
    } else {
      // Check admin session
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const result = await runScoreDecayJob();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Score decay job error:", error);
    return NextResponse.json(
      { error: "Score decay job failed" },
      { status: 500 }
    );
  }
}
