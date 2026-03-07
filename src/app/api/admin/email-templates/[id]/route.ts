import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly } from "@/lib/admin-auth";

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
});

// GET
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const template = await prisma.emailTemplate.findUnique({ where: { id } });

  if (!template) {
    return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: template });
}

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateTemplateSchema.parse(body);

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: (error as z.ZodError).issues },
        { status: 400 }
      );
    }
    console.error("Update template error:", error);
    return NextResponse.json({ success: false, error: "Failed to update template" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  await prisma.emailTemplate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
