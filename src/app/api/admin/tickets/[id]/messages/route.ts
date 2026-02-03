import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePluginAccess } from "@/lib/plugin-guard";
import { z } from "zod";

// GET - List messages for a ticket
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

    const messages = await prisma.supportMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
      include: {
        attachments: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    // Check if it's a plugin access error
    if ((error as { status?: number }).status === 403) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 403 }
      );
    }

    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Create a new message
const createMessageSchema = z.object({
  content: z.string().min(1, "Content is required"),
  senderType: z.enum(["CUSTOMER", "AGENT", "SYSTEM"]).optional().default("AGENT"),
  senderName: z.string().min(1, "Sender name is required"),
  senderId: z.string().optional(),
  type: z.enum(["TEXT", "DOCUMENT", "IMAGE"]).optional().default("TEXT"),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .optional(),
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
    const data = createMessageSchema.parse(body);

    // Check if ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, status: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Create message with attachments
    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        content: data.content,
        senderType: data.senderType,
        senderName: data.senderName,
        senderId: data.senderId,
        type: data.attachments?.length ? "DOCUMENT" : data.type,
        attachments: data.attachments
          ? {
              create: data.attachments.map((att) => ({
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                fileType: att.fileType,
                fileSize: att.fileSize,
              })),
            }
          : undefined,
      },
      include: {
        attachments: true,
      },
    });

    // Update ticket status based on who sent the message
    let newStatus = ticket.status;
    if (data.senderType === "CUSTOMER") {
      newStatus = "WAITING_FOR_AGENT";
    } else if (data.senderType === "AGENT") {
      newStatus = "WAITING_FOR_CUSTOMER";
    }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
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

    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
