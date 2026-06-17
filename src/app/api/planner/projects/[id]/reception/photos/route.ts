import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/planner/projects/[id]/reception/photos — add a photo URL
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const existing = await prisma.eventVenue.findUnique({
    where: { projectId_type: { projectId: id, type: "RECEPTION" } },
    select: { photos: true },
  });

  const currentPhotos = existing?.photos ?? [];
  if (currentPhotos.length >= 30) {
    return NextResponse.json({ error: "Maximum 30 photos allowed" }, { status: 400 });
  }

  const venue = await prisma.eventVenue.upsert({
    where: { projectId_type: { projectId: id, type: "RECEPTION" } },
    create: { projectId: id, type: "RECEPTION", photos: [url] },
    update: { photos: { push: url } },
    select: { photos: true },
  });

  return NextResponse.json({ photos: venue.photos });
}

// DELETE /api/planner/projects/[id]/reception/photos — remove a photo URL
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const existing = await prisma.eventVenue.findUnique({
    where: { projectId_type: { projectId: id, type: "RECEPTION" } },
    select: { photos: true },
  });

  if (!existing) return NextResponse.json({ photos: [] });

  const updated = await prisma.eventVenue.update({
    where: { projectId_type: { projectId: id, type: "RECEPTION" } },
    data: { photos: existing.photos.filter((p) => p !== url) },
    select: { photos: true },
  });

  return NextResponse.json({ photos: updated.photos });
}
