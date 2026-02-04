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

// Update note schema
const updateNoteSchema = z.object({
  content: z.string().min(1).optional(),
  isPinned: z.boolean().optional(),
});

// GET - Get single note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { id, noteId } = await params;

    const note = await prisma.leadNote.findFirst({
      where: { id: noteId, leadId: id },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

// PATCH - Update note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
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
    const { id, noteId } = await params;

    // Check if note exists and belongs to the lead
    const existingNote = await prisma.leadNote.findFirst({
      where: { id: noteId, leadId: id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Only admin or the note author can update
    if (existingNote.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only edit your own notes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = updateNoteSchema.parse(body);

    const note = await prisma.leadNote.update({
      where: { id: noteId },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE - Delete note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
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
    const { id, noteId } = await params;

    // Check if note exists and belongs to the lead
    const existingNote = await prisma.leadNote.findFirst({
      where: { id: noteId, leadId: id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Only admin or the note author can delete
    if (existingNote.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only delete your own notes" },
        { status: 403 }
      );
    }

    await prisma.leadNote.delete({
      where: { id: noteId },
    });

    // Update lead's last activity
    await prisma.lead.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
