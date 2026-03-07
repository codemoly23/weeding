import { getEmailConfig } from "@/lib/email";

interface WrapOptions {
  body: string;
  unsubscribeUrl: string;
  recipientId?: string;
  previewText?: string;
}

/**
 * Wrap campaign body HTML in a branded email layout with unsubscribe footer and tracking pixel
 */
export async function wrapCampaignEmail(options: WrapOptions): Promise<string> {
  const { body, unsubscribeUrl, recipientId, previewText } = options;
  const config = await getEmailConfig();
  const companyName = config.fromName || "LLCPad";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Tracking pixel (only if recipientId is provided)
  const trackingPixel = recipientId
    ? `<img src="${baseUrl}/api/newsletter/track/open?r=${recipientId}" width="1" height="1" alt="" style="display:none;" />`
    : "";

  // Preview text hidden in email (shows in inbox preview)
  const previewBlock = previewText
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${companyName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  ${previewBlock}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #e4e4e7;background-color:#fafafa;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#71717a;text-align:center;">
                You received this email because you subscribed to ${companyName} updates.<br/>
                <a href="${unsubscribeUrl}" style="color:#71717a;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  ${trackingPixel}
</body>
</html>`;
}

/**
 * Rewrite links in HTML to go through click tracker
 */
export function rewriteLinksForTracking(html: string, recipientId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Replace href="..." in <a> tags, skip unsubscribe and tracking URLs
  return html.replace(
    /<a\s([^>]*?)href="(https?:\/\/[^"]+)"([^>]*?)>/gi,
    (match, before, url, after) => {
      // Don't track unsubscribe or tracking URLs
      if (url.includes("/api/newsletter/")) return match;
      const trackedUrl = `${baseUrl}/api/newsletter/track/click?r=${recipientId}&url=${encodeURIComponent(url)}`;
      return `<a ${before}href="${trackedUrl}"${after}>`;
    }
  );
}
