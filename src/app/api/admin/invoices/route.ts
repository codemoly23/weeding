import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { generateInvoiceNumber } from "@/lib/invoice-utils";

async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// GET - Paginated invoice list with filters
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const serviceName = searchParams.get("serviceName");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (serviceName) where.serviceName = serviceName;

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { invoiceNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              paymentMethod: true,
              paymentStatus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST - Create manual invoice
const createInvoiceSchema = z.object({
  userId: z.string().min(1, "Customer is required"),
  serviceName: z.string().min(1, "Service name is required"),
  amount: z.number().positive("Amount must be positive"),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const body = await request.json();
    const data = createInvoiceSchema.parse(body);

    // Get customer info
    const customer = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, name: true, email: true, phone: true, country: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get currency from business settings
    const currencySetting = await prisma.setting.findUnique({
      where: { key: "business.currency" },
    });
    const currency = (currencySetting?.value as string) || "USD";

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: customer.id,
        customerName: customer.name || customer.email,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerCountry: customer.country,
        items: [
          {
            name: data.serviceName,
            description: "",
            quantity: 1,
            price: data.amount,
            total: data.amount,
          },
        ],
        serviceName: data.serviceName,
        subtotal: data.amount,
        total: data.amount,
        currency,
        notes: data.notes,
        status: "SENT",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: accessCheck.session.user.id,
        action: "INVOICE_CREATED",
        entity: "Invoice",
        entityId: invoice.id,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          customerEmail: customer.email,
          amount: data.amount,
          manual: true,
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
