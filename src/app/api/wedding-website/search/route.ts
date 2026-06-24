import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (q.length > 100) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  const search = `%${q}%`;

  const websites = await prisma.weddingWebsite.findMany({
    where: {
      published: true,
      project: {
        OR: [
          { brideName: { contains: q, mode: "insensitive" } },
          { groomName: { contains: q, mode: "insensitive" } },
          { title: { contains: q, mode: "insensitive" } },
        ],
      },
    },
    select: {
      slug: true,
      theme: true,
      project: {
        select: {
          brideName: true,
          groomName: true,
          title: true,
          eventDate: true,
        },
      },
    },
    take: 12,
    orderBy: { createdAt: "desc" },
  });

  const results = websites.map((w) => ({
    slug: w.slug,
    theme: w.theme,
    brideName: w.project.brideName,
    groomName: w.project.groomName,
    title: w.project.title,
    eventDate: w.project.eventDate,
  }));

  return NextResponse.json({ results });
}
