import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, customerId: session.user.id },
    select: { id: true, status: true },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
    return NextResponse.json({ error: "Ticket is closed" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const [message] = await Promise.all([
    prisma.supportMessage.create({
      data: {
        ticketId: id,
        content: parsed.data.content,
        senderType: "CUSTOMER",
        senderName: user?.name || user?.email || "Customer",
        senderId: session.user.id,
        type: "TEXT",
      },
      select: { id: true, content: true, senderType: true, senderName: true, createdAt: true },
    }),
    prisma.supportTicket.update({
      where: { id },
      data: { status: "IN_PROGRESS", updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true, message });
}
