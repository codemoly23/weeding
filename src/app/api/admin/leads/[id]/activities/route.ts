import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const allowedRoles = ["ADMIN", "SALES_AGENT", "SUPPORT_AGENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// GET - Get all activities for a lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Check if lead exists
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const [activities, total] = await Promise.all([
      prisma.leadActivity.findMany({
        where: { leadId: id },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          performedBy: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      prisma.leadActivity.count({ where: { leadId: id } }),
    ]);

    return NextResponse.json({
      activities,
      pagination: { total, limit, offset },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

// Create activity schema
const createActivitySchema = z.object({
  type: z.string().min(1, "Activity type is required"),
  description: z.string().min(1, "Description is required"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// POST - Add a manual activity to a lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }
    const { session } = accessCheck;
    const { id } = await params;

    // Check if lead exists
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = createActivitySchema.parse(body);

    // Create activity and update lead's lastActivityAt
    const [activity] = await prisma.$transaction([
      prisma.leadActivity.create({
        data: {
          leadId: id,
          type: data.type,
          description: data.description,
          metadata: data.metadata as Prisma.InputJsonValue | undefined,
          performedById: session.user.id,
        },
        include: {
          performedBy: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      prisma.lead.update({
        where: { id },
        data: { lastActivityAt: new Date() },
      }),
    ]);

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
