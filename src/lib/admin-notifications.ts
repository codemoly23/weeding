import prisma from "@/lib/db";

export type AdminNotificationType =
  | "NEW_ORDER"
  | "NEW_VENDOR"
  | "NEW_TICKET"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "NEW_CUSTOMER"
  | "NEW_LEAD";

interface CreateNotificationInput {
  type: AdminNotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createAdminNotification(input: CreateNotificationInput) {
  try {
    await prisma.adminNotification.create({ data: input });
  } catch {
    // Never throw — notification failure must not break the main flow
  }
}
