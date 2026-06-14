import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  notifOrderUpdates: z.boolean().optional(),
  notifDocumentReady: z.boolean().optional(),
  notifSupportReplies: z.boolean().optional(),
  notifComplianceReminders: z.boolean().optional(),
  notifMarketingEmails: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = schema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        notifOrderUpdates: true,
        notifDocumentReady: true,
        notifSupportReplies: true,
        notifComplianceReminders: true,
        notifMarketingEmails: true,
      },
    });

    return NextResponse.json({ notifications: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
