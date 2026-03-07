import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly } from "@/lib/admin-auth";

const updateCampaignSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  previewText: z.string().max(200).optional(),
  body: z.string().min(1).optional(),
  templateId: z.string().nullable().optional(),
  audienceFilter: z.object({
    sources: z.array(z.string()).optional(),
    countries: z.array(z.string()).optional(),
  }).nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

// GET — campaign detail with recipients
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id },
    include: {
      template: { select: { id: true, name: true } },
      recipients: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: campaign });
}

// PUT — update draft campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const existing = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
  }

  if (existing.status !== "DRAFT" && existing.status !== "SCHEDULED") {
    return NextResponse.json(
      { success: false, error: "Only draft or scheduled campaigns can be edited" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data = updateCampaignSchema.parse(body);

    const { templateId, audienceFilter, scheduledAt: schedAt, ...rest } = data;

    const updateData: Record<string, unknown> = { ...rest };

    if (templateId !== undefined) {
      updateData.template = templateId
        ? { connect: { id: templateId } }
        : { disconnect: true };
    }
    if (audienceFilter !== undefined) {
      updateData.audienceFilter = audienceFilter;
    }
    if (schedAt !== undefined) {
      updateData.scheduledAt = schedAt ? new Date(schedAt) : null;
    }
    updateData.status = schedAt ? "SCHEDULED" : existing.status;

    const updated = await prisma.emailCampaign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: (error as z.ZodError).issues },
        { status: 400 }
      );
    }
    console.error("Update campaign error:", error);
    return NextResponse.json({ success: false, error: "Failed to update campaign" }, { status: 500 });
  }
}

// DELETE — delete campaign
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const existing = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
  }

  if (existing.status === "SENDING") {
    return NextResponse.json(
      { success: false, error: "Cannot delete a campaign that is currently sending" },
      { status: 400 }
    );
  }

  await prisma.emailCampaign.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
