import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "SALES_AGENT", "SUPPORT_AGENT"]);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.has((session.user as { role?: string }).role ?? "")) {
    return null;
  }
  return session;
}

// GET /api/admin/notifications
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.adminNotification.count({ where: { isRead: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/admin/notifications — mark all as read
export async function PATCH() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.adminNotification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
