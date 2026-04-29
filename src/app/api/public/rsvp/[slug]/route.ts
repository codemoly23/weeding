import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const site = await prisma.weddingWebsite.findUnique({
    where: { slug },
    select: { projectId: true, published: true, project: { select: { user: { select: { email: true, name: true } } } } },
  });

  if (!site || !site.published) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  const body = await req.json();
  const { firstName, lastName, email, phone, attending, dietary, hasPlusOne, plusOneName, message, gdprConsent, side } = body;

  if (!firstName?.trim()) {
    return NextResponse.json({ error: "First name is required" }, { status: 400 });
  }
  if (!attending === undefined || attending === null) {
    return NextResponse.json({ error: "Please select attending status" }, { status: 400 });
  }
  if (!gdprConsent) {
    return NextResponse.json({ error: "GDPR consent is required" }, { status: 400 });
  }

  const guest = await prisma.weddingGuest.create({
    data: {
      projectId: site.projectId,
      firstName: firstName.trim(),
      lastName: lastName?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      side: side === "GROOM" ? "GROOM" : "BRIDE",
      rsvpStatus: attending ? "ATTENDING" : "NOT_ATTENDING",
      dietary: dietary?.trim() || null,
      hasPlusOne: !!hasPlusOne,
      plusOneName: hasPlusOne ? (plusOneName?.trim() || null) : null,
      rsvpMessage: message?.trim() || null,
      gdprConsentAt: new Date(),
      rsvpSubmittedAt: new Date(),
      selfRegistered: true,
      rsvpToken: randomBytes(32).toString("hex"),
    },
  });

  return NextResponse.json({ success: true, guestId: guest.id });
}
