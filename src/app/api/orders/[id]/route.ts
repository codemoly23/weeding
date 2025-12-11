import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
      include: {
        items: true,
        notes: {
          orderBy: { createdAt: "desc" },
        },
        documents: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            country: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

const updateOrderSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "IN_PROGRESS",
    "WAITING_FOR_INFO",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ]).optional(),
  paymentStatus: z.enum([
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]).optional(),
  note: z.string().optional(),
});

// Update order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = updateOrderSchema.parse(body);

    // Find order
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (data.status) {
      updateData.status = data.status;
    }

    if (data.paymentStatus) {
      updateData.paymentStatus = data.paymentStatus;
      if (data.paymentStatus === "PAID") {
        updateData.paidAt = new Date();
      }
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: existingOrder.id },
      data: updateData,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Add note if provided
    if (data.note) {
      await prisma.orderNote.create({
        data: {
          orderId: order.id,
          content: data.note,
          isInternal: true,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "ORDER_UPDATED",
        entity: "Order",
        entityId: order.id,
        metadata: {
          orderNumber: order.orderNumber,
          changes: data,
        },
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
