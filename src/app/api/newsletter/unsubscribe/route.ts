import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/newsletter/token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const leadId = searchParams.get("id");

  if (!token || !leadId) {
    return NextResponse.redirect(new URL("/newsletter/unsubscribed?error=invalid", request.url));
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.redirect(new URL("/newsletter/unsubscribed?error=not-found", request.url));
    }

    // Verify token
    if (!verifyUnsubscribeToken(token, leadId, lead.email)) {
      return NextResponse.redirect(new URL("/newsletter/unsubscribed?error=invalid", request.url));
    }

    // Already unsubscribed
    if (!lead.newsletterSubscribed) {
      return NextResponse.redirect(new URL("/newsletter/unsubscribed?already=true", request.url));
    }

    // Unsubscribe
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        newsletterSubscribed: false,
        newsletterUnsubAt: new Date(),
      },
    });

    return NextResponse.redirect(new URL("/newsletter/unsubscribed", request.url));
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.redirect(new URL("/newsletter/unsubscribed?error=server", request.url));
  }
}
