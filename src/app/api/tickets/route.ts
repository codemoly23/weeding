import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// GET — customer's own tickets
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 10;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    }),
    prisma.supportTicket.count({ where: { customerId: session.user.id } }),
  ]);

  return NextResponse.json({ tickets, total, pages: Math.ceil(total / limit) });
}

// POST — create new ticket
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { subject, category, priority, message } = parsed.data;

  const count = await prisma.supportTicket.count();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ticketNumber = `SUP-${dateStr}-${String(count + 1).padStart(4, "0")}`;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      subject,
      category,
      priority,
      status: "OPEN",
      customerId: session.user.id,
      source: "MANUAL",
      messages: {
        create: {
          content: message,
          senderType: "CUSTOMER",
          senderName: user?.name || user?.email || "Customer",
          senderId: session.user.id,
          type: "TEXT",
        },
      },
    },
    select: { id: true, ticketNumber: true },
  });

  return NextResponse.json({ success: true, ticketId: ticket.id, ticketNumber: ticket.ticketNumber });
}
