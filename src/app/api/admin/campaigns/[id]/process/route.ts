import { NextRequest, NextResponse } from "next/server";
import { checkAdminOnly } from "@/lib/admin-auth";
import { processNextBatch } from "@/lib/newsletter/campaign-sender";

// POST — process next batch of a sending campaign
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const sent = await processNextBatch(id);
    return NextResponse.json({ success: true, data: { sent } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process batch";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
