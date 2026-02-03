import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePluginAccess } from "@/lib/plugin-guard";
import { z } from "zod";

// GET - List internal notes for a ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Plugin access check
    await requirePluginAccess("livesupport-pro");

    const { id: ticketId } = await params;

    // Check if ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    const notes = await prisma.internalNote.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    // Check if it's a plugin access error
    if ((error as { status?: number }).status === 403) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 403 }
      );
    }

    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST - Create internal note
const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required"),
  authorId: z.string().min(1, "Author ID is required"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Plugin access check
    await requirePluginAccess("livesupport-pro");

    const { id: ticketId } = await params;
    const body = await request.json();
    const data = createNoteSchema.parse(body);

    // Check if ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Create internal note
    const note = await prisma.internalNote.create({
      data: {
        ticketId,
        content: data.content,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    // Check if it's a plugin access error
    if ((error as { status?: number }).status === 403) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 403 }
      );
    }

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

// DELETE - Delete internal note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Plugin access check
    await requirePluginAccess("livesupport-pro");

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Check if note exists
    const note = await prisma.internalNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // Delete note
    await prisma.internalNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Check if it's a plugin access error
    if ((error as { status?: number }).status === 403) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 403 }
      );
    }

    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
