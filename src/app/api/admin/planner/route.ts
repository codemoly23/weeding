import { NextResponse } from "next/server";
import { checkAdminAccess, authError } from "@/lib/admin-auth";
import prisma from "@/lib/db";

// GET /api/admin/planner — list all wedding projects
export async function GET() {
  const auth = await checkAdminAccess();
  if (auth.error) return authError(auth);

  const projects = await prisma.weddingProject.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, plannerTier: true } },
      _count: { select: { guests: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ projects });
}
