import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/order-utils";
import { logger } from "@/lib/logger";
import { createAdminNotification } from "@/lib/admin-notifications";

const ADMIN_ORDER_ROLES = new Set(["ADMIN", "SALES_AGENT", "SUPPORT_AGENT"]);
const VALID_ORDER_STATUSES = new Set<OrderStatus>([
  "PENDING",
  "PROCESSING",
  "IN_PROGRESS",
  "WAITING_FOR_INFO",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

function parsePositiveInt(value: string | null, fallback: number, max?: number): number {
  const parsed = Number.parseInt(value || "", 10);
  const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  return max ? Math.min(normalized, max) : normalized;
}

const orderSchema = z.object({
  // Service & Package
  serviceId: z.string(),
  serviceName: z.string().optional(),
  packageId: z.string(),
  packageName: z.string().optional(),

  // Location (replaces State)
  locationCode: z.string().optional(),
  locationName: z.string().optional(),
  locationFee: z.number().default(0),
  locationFeeLabel: z.string().optional(),
  // Backward compat
  stateCode: z.string().optional(),
  stateName: z.string().optional(),
  stateFee: z.number().default(0),

  // LLC Details
  llcName: z.string().min(1, "LLC name is required"),
  llcNameAlt1: z.string().optional(),
  llcNameAlt2: z.string().optional(),
  llcType: z.enum(["single", "multi"]).default("single"),
  managementType: z.enum(["member", "manager"]).default("member"),
  businessPurpose: z.string().optional(),
  businessIndustry: z.string().optional(),

  // Manager Details (for manager-managed LLC)
  managerType: z.enum(["member", "nonMember"]).optional(),
  nonMemberManager: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    country: z.string(),
  }).nullable().optional(),

  // Profit Distribution (for multi-member)
  profitDistribution: z.enum(["proportional", "equal", "custom"]).nullable().optional(),

  // Owner Information
  owner: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone number is required"),
    country: z.string().min(1, "Country is required"),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    passportNumber: z.string().optional(),
    dateOfBirth: z.string().optional(),
    ownershipPercentage: z.number().default(100),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
  }),

  // Additional Members (for multi-member LLC)
  additionalMembers: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    ownershipPercentage: z.number(),
  })).optional(),

  // Additional Services
  needsEIN: z.boolean().default(true),
  needsRegisteredAgent: z.boolean().default(true),
  needsBankingAssistance: z.boolean().default(false),
  expeditedProcessing: z.boolean().default(false),

  // Pricing
  serviceFee: z.number(),
  expeditedFee: z.number().default(0),
  totalAmount: z.number(),

  // Add-ons
  addons: z.array(z.object({
    featureId: z.string(),
    name: z.string(),
    price: z.number(),
  })).optional(),
  addonsTotal: z.number().default(0),

  // Logged-in user
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const data = orderSchema.parse(body);

    if (data.userId && data.userId !== session.user.id) {
      return NextResponse.json({ error: "Cannot create orders for another user" }, { status: 403 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Generate order number outside transaction (read-only)
    const orderNumber = await generateOrderNumber();

    // Build order metadata
    const orderMetadata = {
      llcNameAlt1: data.llcNameAlt1,
      llcNameAlt2: data.llcNameAlt2,
      managementType: data.managementType,
      businessPurpose: data.businessPurpose,
      businessIndustry: data.businessIndustry,
      managerType: data.managerType,
      nonMemberManager: data.nonMemberManager,
      profitDistribution: data.profitDistribution,
      additionalMembers: data.additionalMembers || [],
      ownerAddress: data.owner.address,
      ownerCity: data.owner.city,
      ownerPostalCode: data.owner.postalCode,
      ownerPassportNumber: data.owner.passportNumber,
      ownerDateOfBirth: data.owner.dateOfBirth,
      ownershipPercentage: data.owner.ownershipPercentage,
      needsEIN: data.needsEIN,
      needsRegisteredAgent: data.needsRegisteredAgent,
      needsBankingAssistance: data.needsBankingAssistance,
      expeditedProcessing: data.expeditedProcessing,
      addons: data.addons || [],
      addonsTotal: data.addonsTotal,
    };

    // Atomic service creation + order creation for the authenticated user.
    const order = await prisma.$transaction(async (tx) => {
      // Find or create service
      let txService = await tx.service.findUnique({ where: { slug: data.serviceId } });
      if (!txService) {
        txService = await tx.service.create({
          data: {
            name: data.serviceName || "Wedding Planning",
            slug: data.serviceId,
            shortDesc: "Ceremoney Wedding Planning Service",
            description: "Ceremoney Wedding Planning Service",
            isActive: true,
          },
        });
      }

      // Create order with items and notes
      const txOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: currentUser.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotalUSD: data.serviceFee,
          totalUSD: data.totalAmount,
          currency: "USD",
          llcName: data.llcName,
          llcState: data.locationCode || data.stateCode,
          llcType: data.llcType,
          customerName: `${data.owner.firstName} ${data.owner.lastName}`,
          customerEmail: data.owner.email,
          customerPhone: data.owner.phone,
          customerCountry: data.owner.country,
          items: {
            create: [
              {
                serviceId: txService.id,
                name: `${data.serviceName || "Wedding Planning"} - ${data.packageName || "Premium"} Package`,
                description: `${data.locationName || data.stateName || ""} Formation`,
                priceUSD: data.serviceFee,
                stateFee: data.locationFee || data.stateFee,
                locationCode: data.locationCode || (data.stateCode ? `US-${data.stateCode}` : undefined),
                locationName: data.locationName || data.stateName,
                locationFeeLabel: data.locationFeeLabel,
              },
              ...(data.addons || []).map((addon) => ({
                serviceId: txService!.id,
                name: addon.name,
                description: "Add-on service",
                priceUSD: addon.price,
                stateFee: 0,
              })),
            ],
          },
          notes: {
            create: [{ content: JSON.stringify(orderMetadata, null, 2), isInternal: true }],
          },
        },
        include: {
          items: true,
          user: { select: { id: true, email: true, name: true } },
        },
      });

      return txOrder;
    });

    // Activity log is non-critical — do not block the response if it fails
    prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        action: "ORDER_CREATED",
        entity: "Order",
        entityId: order.id,
        metadata: {
          orderNumber,
          llcName: data.llcName,
          locationCode: data.locationCode || data.stateCode,
          total: data.totalAmount,
        },
      },
    }).catch((err) => logger.error("Failed to log order activity", { error: String(err) }));

    await createAdminNotification({
      type: "NEW_ORDER",
      title: "New Order Received",
      message: `Order ${order.orderNumber} placed by ${currentUser.name || currentUser.email}.`,
      link: `/admin/orders/${order.id}`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderNumber,
      message: "Order created successfully",
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create order", details: errorMessage },
      { status: 500 }
    );
  }
}

// Get orders (for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!ADMIN_ORDER_ROLES.has(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 10, 100);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (status && status !== "all") {
      const upperStatus = status.toUpperCase();
      if (!VALID_ORDER_STATUSES.has(upperStatus as OrderStatus)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      where.status = upperStatus as OrderStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { items: { some: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              service: { select: { id: true, name: true, slug: true } },
              package: { select: { id: true, name: true } },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              country: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
