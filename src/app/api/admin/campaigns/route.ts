import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly } from "@/lib/admin-auth";

const createCampaignSchema = z.object({
  subject: z.string().min(1).max(200),
  previewText: z.string().max(200).optional(),
  body: z.string().min(1),
  templateId: z.string().optional(),
  audienceFilter: z.object({
    sources: z.array(z.string()).optional(),
    countries: z.array(z.string()).optional(),
  }).optional(),
  scheduledAt: z.string().datetime().optional(),
});

// GET — list campaigns
export async function GET() {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      template: { select: { id: true, name: true } },
      _count: { select: { recipients: true } },
    },
  });

  return NextResponse.json({ success: true, data: campaigns });
}

// POST — create draft campaign
export async function POST(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const data = createCampaignSchema.parse(body);

    const campaign = await prisma.emailCampaign.create({
      data: {
        subject: data.subject,
        previewText: data.previewText,
        body: data.body,
        templateId: data.templateId,
        audienceFilter: data.audienceFilter || undefined,
        status: data.scheduledAt ? "SCHEDULED" : "DRAFT",
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        createdById: auth.session!.user.id,
      },
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: (error as z.ZodError).issues },
        { status: 400 }
      );
    }
    console.error("Create campaign error:", error);
    return NextResponse.json({ success: false, error: "Failed to create campaign" }, { status: 500 });
  }
}
