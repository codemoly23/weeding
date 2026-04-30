import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

type WebhookProvider = "stripe" | "paypal";

export async function processWebhookEvent(
  provider: WebhookProvider,
  eventId: string,
  eventType: string,
  handler: () => Promise<void>
): Promise<{ processed: boolean }> {
  try {
    await prisma.webhookEvent.create({
      data: {
        provider,
        eventId,
        eventType,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await prisma.webhookEvent.findUnique({
        where: { provider_eventId: { provider, eventId } },
        select: { status: true },
      });

      if (existing?.status !== "FAILED") {
        return { processed: false };
      }

      await prisma.webhookEvent.update({
        where: { provider_eventId: { provider, eventId } },
        data: { status: "PROCESSING", error: null },
      });
    } else {
      throw error;
    }
  }

  try {
    await handler();
    await prisma.webhookEvent.update({
      where: { provider_eventId: { provider, eventId } },
      data: {
        status: "PROCESSED",
        processedAt: new Date(),
        error: null,
      },
    });
    return { processed: true };
  } catch (error) {
    await prisma.webhookEvent.update({
      where: { provider_eventId: { provider, eventId } },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}
