import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { NEWSLETTER_SETTINGS } from "@/lib/newsletter/settings";
import { startCampaign, processNextBatch } from "@/lib/newsletter/campaign-sender";

// POST — cron route: process scheduled campaigns and continue sending ones
export async function POST(request: NextRequest) {
  // Auth via cron secret header
  const cronSecret = request.headers.get("x-cron-secret");
  const expectedSecret = await getSetting(NEWSLETTER_SETTINGS.CRON_SECRET);

  if (!expectedSecret || cronSecret !== expectedSecret) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Pick up SCHEDULED campaigns whose scheduledAt <= now
    const scheduledCampaigns = await prisma.emailCampaign.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: new Date() },
      },
    });

    for (const campaign of scheduledCampaigns) {
      try {
        await startCampaign(campaign.id);
      } catch (err) {
        console.error(`Failed to start scheduled campaign ${campaign.id}:`, err);
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: { status: "FAILED" },
        });
      }
    }

    // 2. Continue SENDING campaigns (process next batch)
    const sendingCampaigns = await prisma.emailCampaign.findMany({
      where: { status: "SENDING" },
    });

    for (const campaign of sendingCampaigns) {
      try {
        await processNextBatch(campaign.id);
      } catch (err) {
        console.error(`Failed to process batch for campaign ${campaign.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        scheduledStarted: scheduledCampaigns.length,
        sendingContinued: sendingCampaigns.length,
      },
    });
  } catch (error) {
    console.error("Cron process error:", error);
    return NextResponse.json({ success: false, error: "Processing failed" }, { status: 500 });
  }
}
