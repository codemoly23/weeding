/**
 * Lead Auto-Response Email Template
 *
 * Sent automatically to leads when they submit a form.
 * Confirms receipt and sets expectations for response time.
 */

interface LeadAutoResponseParams {
  firstName: string;
  interestedIn?: string[];
  siteUrl: string;
  companyName?: string;
}

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export function getLeadAutoResponseEmail(params: LeadAutoResponseParams): EmailContent {
  const {
    firstName,
    interestedIn,
    siteUrl,
    companyName = "Ceremoney",
  } = params;

  const serviceText = interestedIn && interestedIn.length > 0
    ? interestedIn.map((s) => s.replace(/[-_]/g, " ")).join(", ")
    : null;

  const subject = `Thank you for contacting ${companyName}, ${firstName}!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Thank You, ${firstName}!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We received your inquiry</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="color: #374151; font-size: 16px;">
      Thank you for reaching out to ${companyName}. We have received your inquiry and our team is reviewing it.
    </p>

    ${serviceText ? `
    <div style="background: #f0f9ff; padding: 15px 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
      <p style="color: #1e40af; margin: 0; font-weight: 600;">Services you're interested in:</p>
      <p style="color: #374151; margin: 5px 0 0 0;">${serviceText}</p>
    </div>
    ` : ""}

    <h2 style="color: #111827; font-size: 18px; margin: 25px 0 15px 0;">What happens next?</h2>
    <ul style="color: #374151; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Our team will review your inquiry within <strong>24 hours</strong></li>
      <li style="margin-bottom: 8px;">A specialist will reach out to discuss your specific needs</li>
      <li style="margin-bottom: 8px;">We'll provide a customized quote based on your requirements</li>
    </ul>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${siteUrl}/services" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Explore Our Services
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
      If you have any urgent questions, feel free to reply to this email and we'll get back to you as soon as possible.
    </p>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
    <p style="color: #6b7280; margin: 0; font-size: 14px;">
      ${companyName} - Wedding Planning Made Simple
    </p>
    <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 12px;">
      This is an automated email. Please do not mark it as spam.
    </p>
  </div>
</body>
</html>
  `.trim();

  const textLines = [
    `Thank you, ${firstName}!`,
    "",
    `Thank you for reaching out to ${companyName}. We have received your inquiry and our team is reviewing it.`,
    "",
    serviceText ? `Services you're interested in: ${serviceText}` : "",
    "",
    "WHAT HAPPENS NEXT?",
    "- Our team will review your inquiry within 24 hours",
    "- A specialist will reach out to discuss your specific needs",
    "- We'll provide a customized quote based on your requirements",
    "",
    `Explore our services: ${siteUrl}/services`,
    "",
    "If you have any urgent questions, feel free to reply to this email.",
    "",
    `${companyName} - Wedding Planning Made Simple`,
  ].filter((line) => line !== undefined);

  const text = textLines.join("\n");

  return { subject, html, text };
}
