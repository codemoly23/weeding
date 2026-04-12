import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { generateUnsubscribeToken } from "@/lib/newsletter/token";
import { getSetting } from "@/lib/settings";
import { NEWSLETTER_SETTINGS } from "@/lib/newsletter/settings";
import { sendEmail } from "@/lib/email";
import { renderTemplate } from "@/lib/newsletter/template-renderer";
import { wrapCampaignEmail } from "@/lib/newsletter/email-wrapper";
import { getUnsubscribeUrl } from "@/lib/newsletter/token";

const subscribeSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  firstName: z.string().min(1).max(100).optional(),
});

async function addToBrevo(email: string, name?: string, listId?: string) {
  const apiKey = await getSetting("newsletter.brevo.apiKey");

  if (!apiKey) {
    throw new Error("Brevo API key not configured");
  }

  const doubleOptIn = await getSetting("newsletter.doubleOptIn");

  const payload: Record<string, unknown> = {
    email,
    updateEnabled: true,
  };

  if (name) {
    payload.attributes = { FIRSTNAME: name };
  }

  if (listId) {
    payload.listIds = [parseInt(listId)];
  }

  // If double opt-in is enabled, use DOI endpoint
  if (doubleOptIn === "true") {
    const response = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        templateId: 1, // Default DOI template
        redirectionUrl: process.env.NEXT_PUBLIC_APP_URL || "https://ceremoney.com",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // Contact already exists is not an error
      if (error.code === "duplicate_parameter") {
        return { alreadyExists: true };
      }
      throw new Error(error.message || "Failed to add to Brevo");
    }
  } else {
    // Direct add without double opt-in
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // Contact already exists is not an error
      if (error.code === "duplicate_parameter") {
        return { alreadyExists: true };
      }
      throw new Error(error.message || "Failed to add to Brevo");
    }
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = subscribeSchema.parse(body);

    // Check if lead already exists
    const existingLead = await prisma.lead.findFirst({
      where: { email: data.email },
    });

    if (existingLead) {
      if (existingLead.newsletterSubscribed) {
        return NextResponse.json({
          success: true,
          message: "You are already subscribed!",
        });
      }

      // Re-subscribe existing lead
      const token = generateUnsubscribeToken(existingLead.id, data.email);
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          newsletterSubscribed: true,
          newsletterToken: token,
          newsletterUnsubAt: null,
          lastActivityAt: new Date(),
        },
      });

      await sendWelcomeEmail(data.email, data.firstName || existingLead.firstName);

      return NextResponse.json({
        success: true,
        message: "You have been re-subscribed!",
      });
    }

    // Create new lead with NEWSLETTER source
    const newLead = await prisma.lead.create({
      data: {
        firstName: data.firstName || "Subscriber",
        email: data.email,
        source: "NEWSLETTER",
        status: "NEW",
        newsletterSubscribed: true,
        lastActivityAt: new Date(),
      },
    });

    // Generate and save unsubscribe token
    const token = generateUnsubscribeToken(newLead.id, data.email);
    await prisma.lead.update({
      where: { id: newLead.id },
      data: { newsletterToken: token },
    });

    await sendWelcomeEmail(data.email, data.firstName || "Subscriber");

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, firstName: string) {
  try {
    const enabled = await getSetting(NEWSLETTER_SETTINGS.WELCOME_EMAIL_ENABLED);
    if (enabled !== "true") return;

    const templateId = await getSetting(NEWSLETTER_SETTINGS.WELCOME_EMAIL_TEMPLATE_ID);
    let subject = "Welcome to our newsletter!";
    let body = `<h1 style="font-size:24px;margin:0 0 12px;">Welcome, ${firstName}!</h1>
      <p style="font-size:16px;color:#52525b;">Thank you for subscribing. We'll keep you updated with the latest news and insights.</p>`;

    if (templateId) {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: templateId },
      });
      if (template) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const lead = await prisma.lead.findFirst({ where: { email } });
        const unsubscribeUrl = lead ? getUnsubscribeUrl(lead.id, email) : "#";

        const variables = {
          firstName,
          email,
          unsubscribeUrl,
          siteUrl: baseUrl,
          companyName: "LLCPad",
        };
        subject = renderTemplate(template.subject, variables);
        body = renderTemplate(template.body, variables);
      }
    }

    const lead = await prisma.lead.findFirst({ where: { email } });
    const unsubscribeUrl = lead ? getUnsubscribeUrl(lead.id, email) : "#";

    const html = await wrapCampaignEmail({
      body,
      unsubscribeUrl,
    });

    await sendEmail({ to: email, subject, html });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}
