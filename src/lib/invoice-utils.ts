import { prisma } from "@/lib/db";

export async function generateInvoiceNumber(): Promise<string> {
  // Get business name from settings for prefix (same as order number)
  const businessNameSetting = await prisma.setting.findUnique({
    where: { key: "business.name" },
  });
  const businessName = (businessNameSetting?.value as string) || "BIZ";
  const prefix = businessName.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase() || "BIZ";

  // Today's date as YYYYMMDD
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  // Count today's invoices for serial number
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const todayCount = await prisma.invoice.count({
    where: {
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
  });

  const serial = String(todayCount + 1).padStart(3, "0");
  return `${prefix}-${dateStr}${serial}`;
}

interface OrderItemForInvoice {
  name: string;
  description: string | null;
  quantity: number;
  priceUSD: number | { toNumber(): number };
  locationName?: string | null;
  locationFeeLabel?: string | null;
}

export function buildInvoiceItems(orderItems: OrderItemForInvoice[]) {
  return orderItems.map((item) => {
    const price = typeof item.priceUSD === "number" ? item.priceUSD : item.priceUSD.toNumber();
    const desc = [
      item.description,
      item.locationName ? `Location: ${item.locationName}` : null,
    ].filter(Boolean).join(" — ");

    return {
      name: item.name,
      description: desc || "",
      quantity: item.quantity,
      price,
      total: price * item.quantity,
    };
  });
}
