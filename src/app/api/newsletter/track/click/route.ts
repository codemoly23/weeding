import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const recipientId = request.nextUrl.searchParams.get("r");
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const decodedUrl = decodeURIComponent(url);

  if (recipientId) {
    // Fire and forget
    prisma.emailCampaignRecipient
      .update({
        where: { id: recipientId },
        data: {
          clickCount: { increment: 1 },
          clickedAt: new Date(),
        },
      })
      .then(async (recipient) => {
        if (recipient.clickCount === 1) {
          await prisma.emailCampaign.update({
            where: { id: recipient.campaignId },
            data: { clickCount: { increment: 1 } },
          });
        }
      })
      .catch(() => {});
  }

  return NextResponse.redirect(decodedUrl);
}
