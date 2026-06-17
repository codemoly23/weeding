import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess, authError } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await checkAdminAccess();
  if (auth.error) return authError(auth);

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;

  const [projects, total, activeCount, completedCount, archivedCount] = await Promise.all([
    prisma.weddingProject.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, plannerTier: true } },
        _count: { select: { guests: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.weddingProject.count(),
    prisma.weddingProject.count({ where: { status: "ACTIVE" } }),
    prisma.weddingProject.count({ where: { status: "COMPLETED" } }),
    prisma.weddingProject.count({ where: { status: "ARCHIVED" } }),
  ]);

  return NextResponse.json({
    projects,
    stats: { total, active: activeCount, completed: completedCount, archived: archivedCount },
    pages: Math.ceil(total / limit),
    page,
  });
}
