import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { renderTemplate, type TemplateVariables } from "./template-renderer";
import { wrapCampaignEmail, rewriteLinksForTracking } from "./email-wrapper";
import { getUnsubscribeUrl } from "./token";
import { getSetting } from "@/lib/settings";
import { NEWSLETTER_SETTINGS, NEWSLETTER_DEFAULTS } from "./settings";

/**
 * Build recipient list for a campaign from newsletter subscribers
 */
export async function buildRecipients(campaignId: string, audienceFilter?: Record<string, unknown>) {
  // Base query: subscribed leads
  const where: Record<string, unknown> = {
    newsletterSubscribed: true,
  };

  // Apply audience filters
  if (audienceFilter) {
    if (Array.isArray(audienceFilter.sources) && audienceFilter.sources.length > 0) {
      where.source = { in: audienceFilter.sources };
    }
    if (Array.isArray(audienceFilter.countries) && audienceFilter.countries.length > 0) {
      where.country = { in: audienceFilter.countries };
    }
  }

  const leads = await prisma.lead.findMany({
    where,
    select: { id: true, email: true, firstName: true },
  });

  if (leads.length === 0) return 0;

  // Upsert recipients (skip duplicates)
  await prisma.emailCampaignRecipient.createMany({
    data: leads.map((lead) => ({
      campaignId,
      leadId: lead.id,
      email: lead.email,
      firstName: lead.firstName || null,
    })),
    skipDuplicates: true,
  });

  // Update campaign total
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { totalRecipients: leads.length },
  });

  return leads.length;
}

/**
 * Process next batch of pending recipients for a campaign
 * Returns number of emails sent in this batch
 */
export async function processNextBatch(campaignId: string): Promise<number> {
  const batchSizeStr = await getSetting(NEWSLETTER_SETTINGS.BATCH_SIZE);
  const batchDelayStr = await getSetting(NEWSLETTER_SETTINGS.BATCH_DELAY_MS);
  const batchSize = batchSizeStr ? parseInt(batchSizeStr, 10) : NEWSLETTER_DEFAULTS.BATCH_SIZE;
  const batchDelay = batchDelayStr ? parseInt(batchDelayStr, 10) : NEWSLETTER_DEFAULTS.BATCH_DELAY_MS;

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.status !== "SENDING") return 0;

  // Get next batch of pending recipients
  const recipients = await prisma.emailCampaignRecipient.findMany({
    where: { campaignId, status: "PENDING" },
    take: batchSize,
  });

  if (recipients.length === 0) {
    // All done — mark campaign as SENT
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: "SENT", sentAt: new Date() },
    });
    return 0;
  }

  let sentCount = 0;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  for (const recipient of recipients) {
    try {
      const unsubscribeUrl = getUnsubscribeUrl(recipient.leadId, recipient.email);

      const variables: TemplateVariables = {
        firstName: recipient.firstName || "there",
        email: recipient.email,
        unsubscribeUrl,
        siteUrl: baseUrl,
        companyName: "LLCPad",
      };

      // Render body with variables
      let renderedBody = renderTemplate(campaign.body, variables);

      // Rewrite links for click tracking
      renderedBody = rewriteLinksForTracking(renderedBody, recipient.id);

      // Wrap in email layout
      const html = await wrapCampaignEmail({
        body: renderedBody,
        unsubscribeUrl,
        recipientId: recipient.id,
        previewText: campaign.previewText || undefined,
      });

      const subject = renderTemplate(campaign.subject, variables);

      const result = await sendEmail({
        to: recipient.email,
        subject,
        html,
      });

      if (result.success) {
        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: { status: "SENT", sentAt: new Date() },
        });
        sentCount++;
      } else {
        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: { status: "FAILED", errorMessage: result.error },
        });
      }
    } catch (err) {
      await prisma.emailCampaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: "FAILED",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
        },
      });
    }

    // Delay between emails (skip for last one)
    if (recipients.indexOf(recipient) < recipients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, batchDelay));
    }
  }

  // Update campaign sentCount
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { sentCount: { increment: sentCount } },
  });

  return sentCount;
}

/**
 * Start sending a campaign: build recipients and set status to SENDING
 */
export async function startCampaign(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") {
    throw new Error(`Cannot send campaign with status ${campaign.status}`);
  }

  // Build recipients
  const audienceFilter = campaign.audienceFilter as Record<string, unknown> | null;
  const count = await buildRecipients(campaignId, audienceFilter || undefined);

  if (count === 0) {
    throw new Error("No subscribers match the audience filter");
  }

  // Mark as SENDING
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: "SENDING" },
  });

  // Process first batch immediately
  await processNextBatch(campaignId);
}
