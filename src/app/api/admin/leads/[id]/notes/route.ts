import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

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

// GET - Get all notes for a lead
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

    // Check if lead exists
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const notes = await prisma.leadNote.findMany({
      where: { leadId: id },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Create note schema
const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  isPinned: z.boolean().optional(),
});

// POST - Add a note to a lead
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
    const data = createNoteSchema.parse(body);

    // Create note and activity in a transaction
    const [note] = await prisma.$transaction([
      prisma.leadNote.create({
        data: {
          leadId: id,
          content: data.content,
          isPinned: data.isPinned || false,
          authorId: session.user.id,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "note_added",
          description: "Note added",
          performedById: session.user.id,
          metadata: { notePreview: data.content.substring(0, 100) },
        },
      }),
      prisma.lead.update({
        where: { id },
        data: { lastActivityAt: new Date() },
      }),
    ]);

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
