import { NextRequest, NextResponse } from "next/server";
import { checkAdminOnly } from "@/lib/admin-auth";
import { startCampaign } from "@/lib/newsletter/campaign-sender";
import prisma from "@/lib/db";

// POST — start sending a campaign
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
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    await startCampaign(id);
    return NextResponse.json({ success: true, message: "Campaign sending started" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start campaign";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
