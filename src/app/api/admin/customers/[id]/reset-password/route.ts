import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { sendEmail } from "@/lib/email";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"];
  if (!allowed.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const tempPassword = generateTempPassword();
  const hashed = await hash(tempPassword, 12);

  await prisma.user.update({
    where: { id },
    data: { password: hashed },
  });

  const result = await sendEmail({
    to: user.email,
    subject: "Your Ceremoney Password Has Been Reset",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e40af;">Password Reset</h2>
        <p>Hi ${user.name || "there"},</p>
        <p>Your Ceremoney account password has been reset by our support team.</p>
        <p>Your temporary password is:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; font-size: 20px; font-weight: bold; letter-spacing: 2px; text-align: center; margin: 16px 0;">
          ${tempPassword}
        </div>
        <p>Please log in and change your password immediately from your account settings.</p>
        <p style="color: #64748b; font-size: 13px;">If you did not request this reset, please contact support immediately.</p>
      </div>
    `,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: `Password reset but email failed: ${result.error}` },
      { status: 207 }
    );
  }

  return NextResponse.json({ success: true, message: `Password reset email sent to ${user.email}` });
}
