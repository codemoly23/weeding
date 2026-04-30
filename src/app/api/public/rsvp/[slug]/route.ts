import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { randomBytes } from "crypto";
import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === undefined || value === null || value === "" ? undefined : value;

const optionalTrimmedString = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const publicRsvpSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: optionalTrimmedString(100),
  email: z.preprocess(emptyToUndefined, z.string().trim().email().max(254).optional()),
  phone: optionalTrimmedString(50),
  attending: z.boolean(),
  dietary: optionalTrimmedString(500),
  hasPlusOne: z.boolean().optional().default(false),
  plusOneName: optionalTrimmedString(100),
  message: optionalTrimmedString(2000),
  gdprConsent: z.literal(true),
  side: z.enum(["BRIDE", "GROOM"]).optional().default("BRIDE"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const site = await prisma.weddingWebsite.findUnique({
    where: { slug },
    select: { projectId: true, published: true },
  });

  if (!site || !site.published) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = publicRsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid RSVP data", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const guest = await prisma.weddingGuest.create({
    data: {
      projectId: site.projectId,
      firstName: data.firstName,
      lastName: data.lastName || null,
      email: data.email || null,
      phone: data.phone || null,
      side: data.side,
      rsvpStatus: data.attending ? "ATTENDING" : "NOT_ATTENDING",
      dietary: data.dietary || null,
      hasPlusOne: data.hasPlusOne,
      plusOneName: data.hasPlusOne ? data.plusOneName || null : null,
      rsvpMessage: data.message || null,
      gdprConsentAt: new Date(),
      rsvpSubmittedAt: new Date(),
      selfRegistered: true,
      rsvpToken: randomBytes(32).toString("hex"),
    },
  });

  return NextResponse.json({ success: true, guestId: guest.id });
}
