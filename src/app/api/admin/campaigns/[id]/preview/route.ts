import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
import { renderTemplate } from "@/lib/newsletter/template-renderer";
import { wrapCampaignEmail } from "@/lib/newsletter/email-wrapper";
import { z } from "zod";

const previewSchema = z.object({
  email: z.string().email(),
});

// POST — send a preview/test email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminOnly();
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { email } = previewSchema.parse(body);

    const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const variables = {
      firstName: "Preview",
      email,
      unsubscribeUrl: "#",
      siteUrl: baseUrl,
      companyName: "LLCPad",
    };

    const renderedBody = renderTemplate(campaign.body, variables);
    const subject = `[PREVIEW] ${renderTemplate(campaign.subject, variables)}`;

    const html = await wrapCampaignEmail({
      body: renderedBody,
      unsubscribeUrl: "#",
      previewText: campaign.previewText || undefined,
    });

    const result = await sendEmail({ to: email, subject, html });

    if (result.success) {
      return NextResponse.json({ success: true, message: `Preview sent to ${email}` });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    }
    console.error("Preview error:", error);
    return NextResponse.json({ success: false, error: "Failed to send preview" }, { status: 500 });
  }
}
