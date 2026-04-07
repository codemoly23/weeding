import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/planner/projects/[id]/guests/[guestId]/sms
// Send RSVP link via SMS (Elite plan only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, guestId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guest = await prisma.weddingGuest.findFirst({
    where: { id: guestId, projectId: id },
    select: { id: true, firstName: true, lastName: true, phone: true, rsvpToken: true },
  });
  if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  if (!guest.phone) return NextResponse.json({ error: "Guest has no phone number" }, { status: 400 });
  if (!guest.rsvpToken) return NextResponse.json({ error: "Generate RSVP link first" }, { status: 400 });

  const provider = process.env.SMS_PROVIDER; // "46elks" | "twilio"
  if (!provider) {
    return NextResponse.json(
      { error: "SMS provider not configured. Set SMS_PROVIDER in environment variables." },
      { status: 501 }
    );
  }

  const { baseUrl } = await req.json().catch(() => ({ baseUrl: "" }));
  const rsvpUrl = `${baseUrl || process.env.NEXTAUTH_URL}/rsvp/${guest.rsvpToken}`;
  const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(" ");
  const message = `Hi ${guestName}! You're invited to ${project.title}. Please RSVP here: ${rsvpUrl}`;

  try {
    if (provider === "46elks") {
      const apiKey = process.env.ELKS_API_KEY;
      const apiSecret = process.env.ELKS_API_SECRET;
      const from = process.env.ELKS_FROM ?? "Wedding";
      if (!apiKey || !apiSecret) {
        return NextResponse.json({ error: "46elks credentials not configured" }, { status: 501 });
      }
      const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
      const res = await fetch("https://api.46elks.com/a1/sms", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ from, to: guest.phone, message }),
      });
      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `46elks error: ${err}` }, { status: 502 });
      }
    } else if (provider === "twilio") {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_FROM;
      if (!accountSid || !authToken || !from) {
        return NextResponse.json({ error: "Twilio credentials not configured" }, { status: 501 });
      }
      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ From: from, To: guest.phone, Body: message }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: `Twilio error: ${err.message}` }, { status: 502 });
      }
    } else {
      return NextResponse.json({ error: `Unknown SMS provider: ${provider}` }, { status: 501 });
    }

    return NextResponse.json({ success: true, to: guest.phone });
  } catch {
    return NextResponse.json({ error: "SMS delivery failed" }, { status: 502 });
  }
}
