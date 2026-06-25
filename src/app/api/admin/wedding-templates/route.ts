import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function GET() {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  const templates = await prisma.weddingTemplate.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  const body = await req.json();
  const {
    name, slug, tagline, description, primaryColor, accentColor, bg, font,
    tags, imageUrl, features, plannerTheme, plannerPrimary, plannerAccent,
    plannerFont, sortOrder, active,
  } = body;

  if (!name?.trim() || !tagline?.trim()) {
    return NextResponse.json({ error: "Name and tagline are required" }, { status: 400 });
  }

  const finalSlug = slug?.trim() || slugify(name);

  const existing = await prisma.weddingTemplate.findUnique({ where: { slug: finalSlug } });
  if (existing) {
    return NextResponse.json({ error: "A template with this slug already exists" }, { status: 409 });
  }

  try {
    const template = await prisma.weddingTemplate.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        tagline: tagline.trim(),
        description: description?.trim() ?? "",
        primaryColor: primaryColor ?? "#be185d",
        accentColor: accentColor ?? "#fce7f3",
        bg: bg ?? "#ffffff",
        font: font ?? "Inter",
        tags: Array.isArray(tags) ? tags : (typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
        imageUrl: imageUrl ?? "",
        features: Array.isArray(features) ? features : [],
        plannerTheme: plannerTheme ?? "modern",
        plannerPrimary: plannerPrimary ?? primaryColor ?? "#be185d",
        plannerAccent: plannerAccent ?? accentColor ?? "#fce7f3",
        plannerFont: plannerFont ?? font ?? "Inter",
        sortOrder: sortOrder ?? 0,
        active: active ?? true,
      },
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    console.error("[wedding-templates POST]", err);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
