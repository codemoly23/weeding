import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const rsvpSubmissionSchema = z.object({
  rsvpStatus: z.enum(["ATTENDING", "NOT_ATTENDING"]),
  dietary: z.string().trim().max(500).nullable().optional(),
  rsvpMessage: z.string().trim().max(2000).nullable().optional(),
  gdprConsent: z.boolean().optional(),
  answers: z.record(z.string(), z.string().trim().max(1000)).optional().default({}),
});

// GET /api/rsvp/[token] — public, no auth required
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const guest = await prisma.weddingGuest.findUnique({
    where: { rsvpToken: token },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      title: true,
      rsvpStatus: true,
      dietary: true,
      rsvpMessage: true,
      rsvpSubmittedAt: true,
      gdprConsentAt: true,
      rsvpAnswers: {
        select: { questionId: true, answer: true },
      },
      project: {
        select: {
          title: true,
          eventDate: true,
          eventType: true,
          rsvpQuestions: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              text: true,
              type: true,
              options: true,
              required: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!guest) {
    return NextResponse.json({ error: "Invalid RSVP link" }, { status: 404 });
  }

  return NextResponse.json({ guest });
}

// POST /api/rsvp/[token] — public RSVP submission
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const existing = await prisma.weddingGuest.findUnique({
    where: { rsvpToken: token },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          brideName: true,
          groomName: true,
          eventDate: true,
          rsvpQuestions: {
            select: { id: true, required: true },
          },
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Invalid RSVP link" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid RSVP data" }, { status: 400 });
  }
  const { rsvpStatus, dietary, rsvpMessage, gdprConsent, answers } = body as {
    rsvpStatus: string;
    dietary?: string;
    rsvpMessage?: string;
    gdprConsent?: boolean;
    answers?: Record<string, string>; // questionId → answer
  };

  if (!rsvpStatus || !["ATTENDING", "NOT_ATTENDING"].includes(rsvpStatus)) {
    return NextResponse.json({ error: "Invalid RSVP status" }, { status: 400 });
  }

  const parsed = rsvpSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid RSVP data", details: parsed.error.issues },
      { status: 400 }
    );
  }
  const validated = parsed.data;

  // Validate required custom questions
  const requiredIds = existing.project.rsvpQuestions
    .filter((q) => q.required)
    .map((q) => q.id);

  for (const qId of requiredIds) {
    if (!validated.answers[qId]?.trim()) {
      return NextResponse.json(
        { error: "Please answer all required questions" },
        { status: 400 }
      );
    }
  }

  // Update guest
  const updateGuest = prisma.weddingGuest.update({
    where: { rsvpToken: token },
    data: {
      rsvpStatus: validated.rsvpStatus,
      dietary: validated.dietary?.trim() || existing.dietary,
      rsvpMessage: validated.rsvpMessage?.trim() || null,
      rsvpSubmittedAt: new Date(),
      ...(validated.gdprConsent && { gdprConsentAt: new Date() }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rsvpStatus: true,
      dietary: true,
      rsvpMessage: true,
      rsvpSubmittedAt: true,
      gdprConsentAt: true,
    },
  });

  // Upsert custom answers in the same transaction as the RSVP status update.
  const validIds = existing.project.rsvpQuestions.map((q) => q.id);
  const upserts = Object.entries(validated.answers)
    .filter(([qId, ans]) => validIds.includes(qId) && ans.trim())
    .map(([questionId, answer]) =>
      prisma.rsvpAnswer.upsert({
        where: { guestId_questionId: { guestId: existing.id, questionId } },
        create: { guestId: existing.id, questionId, answer: answer.trim() },
        update: { answer: answer.trim() },
      })
    );
  const [updated] = await prisma.$transaction([updateGuest, ...upserts]);

  // Fire-and-forget email notification
  const coupleEmail = existing.project.user?.email;
  if (coupleEmail) {
    const guestName = [existing.title, existing.firstName, existing.lastName]
      .filter(Boolean)
      .join(" ");
    const isAttending = validated.rsvpStatus === "ATTENDING";
    const eventTitle = existing.project.title;
    const eventDate = existing.project.eventDate
      ? new Date(existing.project.eventDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const statusLabel = isAttending ? "✅ Attending" : "❌ Not Attending";
    const statusColor = isAttending ? "#16a34a" : "#dc2626";

    const answersHtml =
      Object.keys(validated.answers).length > 0
        ? `<div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Custom Answers</p>
            ${Object.entries(validated.answers)
              .filter(([, ans]) => ans.trim())
              .map(
                ([, ans]) =>
                  `<p style="margin:0 0 4px;font-size:14px;color:#374151;">• ${ans}</p>`
              )
              .join("")}
          </div>`
        : "";

    sendEmail({
      to: coupleEmail,
      subject: `RSVP received — ${guestName} ${isAttending ? "is attending!" : "can't make it"}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:32px;">💌</span>
            <h1 style="font-size:20px;font-weight:700;color:#111827;margin:8px 0 4px;">${eventTitle}</h1>
            ${eventDate ? `<p style="font-size:13px;color:#6b7280;margin:0;">${eventDate}</p>` : ""}
          </div>
          <div style="background:#fdf2f8;border-radius:16px;padding:20px;margin-bottom:20px;">
            <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">New RSVP response</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${guestName}</p>
            <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${statusColor};">${statusLabel}</p>
          </div>
          ${validated.dietary ? `<div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Dietary requirements</p>
            <p style="margin:0;font-size:14px;color:#374151;">${validated.dietary}</p>
          </div>` : ""}
          ${validated.rsvpMessage ? `<div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
            <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">"${validated.rsvpMessage}"</p>
          </div>` : ""}
          ${answersHtml}
          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
            This notification was sent automatically by your wedding planner.
          </p>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({ guest: updated });
}
