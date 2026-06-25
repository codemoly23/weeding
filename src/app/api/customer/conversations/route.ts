import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/customer/conversations — list conversations for the authenticated customer
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const conversations = await prisma.vendorConversation.findMany({
    where: { coupleUserId: session.user.id },
    orderBy: { lastMessageAt: "desc" },
    include: {
      vendor: {
        select: {
          businessName: true,
          category: true,
          city: true,
          country: true,
          photos: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, senderRole: true, createdAt: true },
      },
      _count: { select: { messages: true } },
    },
  });

  const result = conversations.map((c) => {
    const lastMsg = c.messages[0] ?? null;
    return {
      id: c.id,
      status: c.status,
      lastMessageAt: c.lastMessageAt,
      totalMessages: c._count.messages,
      lastMessage: lastMsg
        ? { content: lastMsg.content, senderRole: lastMsg.senderRole, createdAt: lastMsg.createdAt }
        : null,
      vendor: {
        businessName: c.vendor.businessName,
        category: c.vendor.category,
        city: c.vendor.city,
        country: c.vendor.country,
        photo: c.vendor.photos?.[0] ?? null,
      },
    };
  });

  return NextResponse.json({ conversations: result });
}
