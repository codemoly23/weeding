import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  enabled: z.boolean(),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { enabled } = schema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: enabled },
      select: { twoFactorEnabled: true },
    });

    return NextResponse.json({ twoFactorEnabled: user.twoFactorEnabled });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update 2FA" }, { status: 500 });
  }
}
