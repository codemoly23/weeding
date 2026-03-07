import prisma from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { NEWSLETTER_SETTINGS } from "./settings";
import { startCampaign } from "./campaign-sender";

/**
 * Trigger an auto-email campaign when a blog post is published
 */
export async function triggerBlogAutoEmail(blogPostId: string) {
  // Check if auto-email is enabled
  const enabled = await getSetting(NEWSLETTER_SETTINGS.AUTO_EMAIL_ENABLED);
  if (enabled !== "true") return;

  const post = await prisma.blogPost.findUnique({
    where: { id: blogPostId },
  });

  if (!post) return;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const blogUrl = `${baseUrl}/blog/${post.slug}`;

  // Check if campaign already exists for this blog post
  const existing = await prisma.emailCampaign.findFirst({
    where: { blogPostId },
  });
  if (existing) return;

  // Load auto-email template if configured
  const templateId = await getSetting(NEWSLETTER_SETTINGS.AUTO_EMAIL_TEMPLATE_ID);
  let body: string;
  let subject: string;

  if (templateId) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    if (template) {
      body = template.body;
      subject = template.subject;
    } else {
      // Fallback to default blog email body
      ({ body, subject } = getDefaultBlogEmailContent(post.title, post.excerpt || "", blogUrl, (post as { coverImage?: string }).coverImage || ""));
    }
  } else {
    ({ body, subject } = getDefaultBlogEmailContent(post.title, post.excerpt || "", blogUrl, (post as { coverImage?: string }).coverImage || ""));
  }

  // Create campaign
  const campaign = await prisma.emailCampaign.create({
    data: {
      subject,
      previewText: post.excerpt || undefined,
      body,
      blogPostId,
      templateId: templateId || undefined,
      status: "DRAFT",
    },
  });

  // Auto-send immediately
  await startCampaign(campaign.id);
}

function getDefaultBlogEmailContent(title: string, excerpt: string, blogUrl: string, coverImage: string) {
  const coverHtml = coverImage
    ? `<img src="${coverImage}" alt="${title}" style="width:100%;border-radius:8px;margin-bottom:16px;" />`
    : "";

  return {
    subject: `New Post: ${title}`,
    body: `
      ${coverHtml}
      <h1 style="font-size:24px;margin:0 0 12px;">${title}</h1>
      ${excerpt ? `<p style="font-size:16px;color:#52525b;margin:0 0 20px;">${excerpt}</p>` : ""}
      <a href="${blogUrl}" style="display:inline-block;padding:12px 24px;background-color:#16a34a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Read More</a>
    `.trim(),
  };
}
