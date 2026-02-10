import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

// GET - Get tracking settings
export async function GET() {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let settings = await prisma.trackingSettings.findFirst();

    if (!settings) {
      // Create default settings
      settings = await prisma.trackingSettings.create({ data: {} });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching tracking settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking settings" },
      { status: 500 }
    );
  }
}

const updateSchema = z.object({
  gtmEnabled: z.boolean().optional(),
  gtmContainerId: z.string().nullable().optional(),
  gtmTrackForms: z.boolean().optional(),
  gtmTrackPages: z.boolean().optional(),
  fbPixelEnabled: z.boolean().optional(),
  fbPixelId: z.string().nullable().optional(),
  fbTrackLead: z.boolean().optional(),
  fbTrackPageView: z.boolean().optional(),
  fbTrackContent: z.boolean().optional(),
  gadsEnabled: z.boolean().optional(),
  gadsConversionId: z.string().nullable().optional(),
  gadsConversionLabel: z.string().nullable().optional(),
  gadsDefaultValue: z.number().nullable().optional(),
  tiktokEnabled: z.boolean().optional(),
  tiktokPixelId: z.string().nullable().optional(),
});

// POST - Update tracking settings
export async function POST(request: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    // Find existing or create
    let settings = await prisma.trackingSettings.findFirst();

    if (settings) {
      settings = await prisma.trackingSettings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      settings = await prisma.trackingSettings.create({ data });
    }

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating tracking settings:", error);
    return NextResponse.json(
      { error: "Failed to update tracking settings" },
      { status: 500 }
    );
  }
}
