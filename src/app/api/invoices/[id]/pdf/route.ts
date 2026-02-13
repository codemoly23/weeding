import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateInvoicePDF } from "@/lib/pdf/generate-invoice";
import { getBusinessConfig } from "@/lib/business-settings";
import { getCurrencySymbol } from "@/lib/currencies";
import type { InvoicePDFData, InvoiceItem } from "@/lib/pdf/invoice-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            orderNumber: true,
            paymentMethod: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Customers can only access their own invoices; admin can access all
    if (session.user.role !== "ADMIN" && invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get business config for branding
    const config = await getBusinessConfig();

    // Build address string
    const addressParts = [
      config.address.line1,
      config.address.line2,
      [config.address.city, config.address.state, config.address.zip]
        .filter(Boolean)
        .join(", "),
      config.address.country,
    ].filter(Boolean);

    // Parse items from JSON
    const items: InvoiceItem[] = Array.isArray(invoice.items)
      ? (invoice.items as unknown as InvoiceItem[])
      : [];

    const currencySymbol = getCurrencySymbol(invoice.currency);

    const pdfData: InvoicePDFData = {
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      createdAt: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate?.toISOString() || null,
      paidAt: invoice.paidAt?.toISOString() || null,

      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      customerCountry: invoice.customerCountry,

      businessName: config.name || "Business",
      businessEmail: config.contact.email,
      businessPhone: config.contact.phone,
      businessAddress: addressParts.join(", "),

      items,
      subtotal: Number(invoice.subtotal),
      discount: Number(invoice.discount),
      total: Number(invoice.total),
      currency: invoice.currency,
      currencySymbol,

      orderNumber: invoice.order?.orderNumber || null,
      notes: invoice.notes,
    };

    const pdfBuffer = await generateInvoicePDF(pdfData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
