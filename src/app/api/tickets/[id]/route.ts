import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, customerId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          senderType: true,
          senderName: true,
          type: true,
          createdAt: true,
        },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ticket });
}
