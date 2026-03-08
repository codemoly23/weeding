import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkContentAccess, authError } from "@/lib/admin-auth";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  sortOrder: z.number().default(0),
});

// POST /api/admin/services/[slug]/faqs - Add FAQ to service
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { slug } = await params;
    const body = await request.json();
    const validatedData = faqSchema.parse(body);

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const faq = await prisma.serviceFAQ.create({
      data: {
        ...validatedData,
        serviceId: service.id,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
