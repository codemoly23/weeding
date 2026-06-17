import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["ADMIN", "SUPER_ADMIN"];
  if (!allowed.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot disable your own account" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isActive: true, role: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const adminRoles = ["ADMIN", "SUPER_ADMIN"] as string[];
  if (adminRoles.includes(user.role)) {
    return NextResponse.json({ error: "Cannot disable admin accounts" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: { isActive: true },
  });

  return NextResponse.json({ success: true, isActive: updated.isActive });
}
