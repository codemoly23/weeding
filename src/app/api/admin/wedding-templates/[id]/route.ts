import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  const { id } = await params;
  const template = await prisma.weddingTemplate.findUnique({ where: { id } });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ template });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  const { id } = await params;
  const body = await req.json();
  const {
    name, slug, tagline, description, primaryColor, accentColor, bg, font,
    tags, imageUrl, features, plannerTheme, plannerPrimary, plannerAccent,
    plannerFont, sortOrder, active,
  } = body;

  const existing = await prisma.weddingTemplate.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const finalSlug = slug?.trim() || (name ? slugify(name) : existing.slug);

  if (finalSlug !== existing.slug) {
    const conflict = await prisma.weddingTemplate.findUnique({ where: { slug: finalSlug } });
    if (conflict) return NextResponse.json({ error: "A template with this slug already exists" }, { status: 409 });
  }

  try {
    const template = await prisma.weddingTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        slug: finalSlug,
        ...(tagline !== undefined && { tagline: tagline.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(bg !== undefined && { bg }),
        ...(font !== undefined && { font }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim()).filter(Boolean) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(features !== undefined && { features: (Array.isArray(features) ? features : existing.features) as string[] }),
        ...(plannerTheme !== undefined && { plannerTheme }),
        ...(plannerPrimary !== undefined && { plannerPrimary }),
        ...(plannerAccent !== undefined && { plannerAccent }),
        ...(plannerFont !== undefined && { plannerFont }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(active !== undefined && { active }),
      },
    });
    return NextResponse.json({ template });
  } catch (err) {
    console.error("[wedding-templates PUT]", err);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  const { id } = await params;
  const existing = await prisma.weddingTemplate.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.weddingTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
