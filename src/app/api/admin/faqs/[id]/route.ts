import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

const updateFaqSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  sortOrder: z.number().optional(),
});

// GET /api/admin/faqs/[id] - Get single FAQ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const faq = await prisma.serviceFAQ.findUnique({
      where: { id },
      include: {
        service: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!faq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQ" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/faqs/[id] - Update FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateFaqSchema.parse(body);

    const existingFaq = await prisma.serviceFAQ.findUnique({
      where: { id },
    });

    if (!existingFaq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    const faq = await prisma.serviceFAQ.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(faq);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/faqs/[id] - Delete FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingFaq = await prisma.serviceFAQ.findUnique({
      where: { id },
    });

    if (!existingFaq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    await prisma.serviceFAQ.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
