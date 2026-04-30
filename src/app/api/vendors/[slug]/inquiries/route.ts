import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getVendorPlanStatus } from "@/lib/vendor-plan";
import { randomUUID } from "crypto";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(50).optional().nullable(),
  eventType: z.string().trim().min(1).max(120),
  eventDate: z.preprocess(
    (value) => (value === undefined || value === null || value === "" ? null : new Date(String(value))),
    z.date().nullable()
  ).optional(),
  message: z.string().trim().min(1).max(5000),
  budget: z.union([z.string(), z.number()]).optional().nullable(),
});

// POST /api/vendors/[slug]/inquiries
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug },
    select: { id: true, isApproved: true, isActive: true, status: true, planTier: true, trialEndsAt: true },
  });

  if (!vendor || !vendor.isApproved || !vendor.isActive) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  // Check plan — only vendors with active plan can receive inquiries
  const plan = getVendorPlanStatus({
    planTier: vendor.planTier as "TRIAL" | "BUSINESS" | "EXPIRED",
    trialEndsAt: vendor.trialEndsAt,
    isApproved: vendor.isApproved,
    status: vendor.status,
  });
  if (!plan.isActive) {
    return NextResponse.json({ error: "This vendor is not currently accepting inquiries" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid inquiry data", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, email, phone, eventType, eventDate, message, budget } = parsed.data;

  const inquiryId = randomUUID();
  const convId = randomUUID();
  const msgId = randomUUID();
  const now = new Date();

  // Create inquiry + conversation + first message atomically
  const [inquiry, conversation] = await prisma.$transaction([
    prisma.vendorInquiry.create({
      data: {
        id: inquiryId,
        vendorId: vendor.id,
        name,
        email,
        phone: phone || null,
        eventType,
        eventDate: eventDate || null,
        message,
        budget: budget ? String(budget).trim() : null,
      },
    }),
    prisma.vendorConversation.create({
      data: {
        id: convId,
        vendorId: vendor.id,
        inquiryId: inquiryId,
        guestName: name,
        guestEmail: email,
        lastMessageAt: now,
        messages: {
          create: {
            id: msgId,
            senderRole: "GUEST",
            content: message,
            isRead: false,
            createdAt: now,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({ inquiry, conversationId: conversation.id }, { status: 201 });
}
