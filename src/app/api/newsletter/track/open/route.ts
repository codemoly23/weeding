import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: NextRequest) {
  const recipientId = request.nextUrl.searchParams.get("r");

  if (recipientId) {
    // Fire and forget — don't block response
    prisma.emailCampaignRecipient
      .update({
        where: { id: recipientId },
        data: {
          openCount: { increment: 1 },
          openedAt: new Date(),
        },
      })
      .then(async (recipient) => {
        // Also increment campaign-level openCount (only on first open)
        if (recipient.openCount === 1) {
          await prisma.emailCampaign.update({
            where: { id: recipient.campaignId },
            data: { openCount: { increment: 1 } },
          });
        }
      })
      .catch(() => {});
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
