import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  const adminRoles = ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT", "CONTENT_MANAGER"];
  if (!token || !adminRoles.includes(token.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { to, name, subject, message } = body as {
    to: string;
    name: string;
    subject: string;
    message: string;
  };

  if (!to || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "to, subject, and message are required" }, { status: 400 });
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <p>Hi ${name || "there"},</p>
      ${message
        .split("\n")
        .map((line) => `<p style="margin:0 0 8px;">${line}</p>`)
        .join("")}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="font-size:12px;color:#888;">This message was sent by the Ceremoney admin team.</p>
    </div>
  `;

  const result = await sendEmail({ to, subject: subject.trim(), html, text: message });

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
