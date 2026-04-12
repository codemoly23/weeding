interface NewLeadEmailData {
  leadId: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  source: string;
  score: number;
  interestedIn?: string[];
  budget?: string;
  timeline?: string;
  message?: string;
  formName?: string;
  adminUrl: string;
}

export function getNewLeadEmail(data: NewLeadEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    leadId,
    firstName,
    lastName,
    email,
    phone,
    company,
    country,
    source,
    score,
    interestedIn,
    budget,
    timeline,
    message,
    formName,
    adminUrl,
  } = data;

  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  const scoreColor = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#3b82f6";
  const scoreLabel = score >= 70 ? "Hot" : score >= 40 ? "Warm" : "Cold";

  const sourceLabels: Record<string, string> = {
    WEBSITE: "Website",
    REFERRAL: "Referral",
    GOOGLE_ADS: "Google Ads",
    FACEBOOK_ADS: "Facebook Ads",
    SOCIAL_MEDIA: "Social Media",
    DIRECT: "Direct",
    COLD_OUTREACH: "Cold Outreach",
    OTHER: "Other",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead Submitted</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #10b981; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Lead Received!</h1>
            </td>
          </tr>

          <!-- Score Badge -->
          <tr>
            <td style="padding: 30px 40px 0 40px; text-align: center;">
              <div style="display: inline-block; background-color: ${scoreColor}; color: white; padding: 10px 20px; border-radius: 20px; font-size: 16px; font-weight: 600;">
                ${scoreLabel} Lead - Score: ${score}
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              ${formName ? `<p style="color: #71717a; margin: 0 0 20px 0; font-size: 14px;">Submitted via: <strong>${formName}</strong></p>` : ''}

              <!-- Lead Details Box -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Contact Information</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">Name:</span>
                      <span style="color: #18181b; font-size: 14px; font-weight: 600; float: right;">${fullName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">Email:</span>
                      <a href="mailto:${email}" style="color: #2563eb; font-size: 14px; font-weight: 500; float: right; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  ${phone ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">Phone:</span>
                      <a href="tel:${phone}" style="color: #2563eb; font-size: 14px; font-weight: 500; float: right; text-decoration: none;">${phone}</a>
                    </td>
                  </tr>
                  ` : ''}
                  ${company ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">Company:</span>
                      <span style="color: #18181b; font-size: 14px; float: right;">${company}</span>
                    </td>
                  </tr>
                  ` : ''}
                  ${country ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">Country:</span>
                      <span style="color: #18181b; font-size: 14px; float: right;">${country}</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #71717a; font-size: 14px;">Source:</span>
                      <span style="color: #18181b; font-size: 14px; float: right;">${sourceLabels[source] || source}</span>
                    </td>
                  </tr>
                </table>
              </div>

              ${interestedIn && interestedIn.length > 0 ? `
              <!-- Services Interested -->
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                <h3 style="color: #18181b; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Services Interested</h3>
                <p style="color: #3f3f46; margin: 0; font-size: 14px;">${interestedIn.join(", ")}</p>
              </div>
              ` : ''}

              ${budget || timeline ? `
              <!-- Budget & Timeline -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                <h3 style="color: #18181b; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Budget & Timeline</h3>
                ${budget ? `<p style="color: #3f3f46; margin: 0 0 5px 0; font-size: 14px;"><strong>Budget:</strong> ${budget}</p>` : ''}
                ${timeline ? `<p style="color: #3f3f46; margin: 0; font-size: 14px;"><strong>Timeline:</strong> ${timeline}</p>` : ''}
              </div>
              ` : ''}

              ${message ? `
              <!-- Message -->
              <div style="background-color: #fafafa; border-left: 4px solid #2563eb; padding: 15px 20px; margin: 0 0 20px 0;">
                <p style="color: #71717a; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message:</p>
                <p style="color: #3f3f46; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              ` : ''}

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #2563eb; border-radius: 6px;">
                    <a href="${adminUrl}/admin/leads/${leadId}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">View Lead Details</a>
                  </td>
                  <td style="width: 10px;"></td>
                  <td style="background-color: #10b981; border-radius: 6px;">
                    <a href="mailto:${email}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">Email Lead</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 40px; text-align: center;">
              <p style="color: #71717a; margin: 0 0 10px 0; font-size: 14px;">
                This is an automated notification from your lead management system.
              </p>
              <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Ceremoney. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
New Lead Received!

${scoreLabel} Lead - Score: ${score}
${formName ? `Submitted via: ${formName}` : ''}

Contact Information:
- Name: ${fullName}
- Email: ${email}
${phone ? `- Phone: ${phone}` : ''}
${company ? `- Company: ${company}` : ''}
${country ? `- Country: ${country}` : ''}
- Source: ${sourceLabels[source] || source}

${interestedIn && interestedIn.length > 0 ? `Services Interested: ${interestedIn.join(", ")}` : ''}

${budget ? `Budget: ${budget}` : ''}
${timeline ? `Timeline: ${timeline}` : ''}

${message ? `Message:\n${message}` : ''}

View Lead Details: ${adminUrl}/admin/leads/${leadId}

This is an automated notification from your lead management system.
© ${new Date().getFullYear()} Ceremoney. All rights reserved.
`;

  return {
    subject: `🔥 New ${scoreLabel} Lead: ${fullName} (Score: ${score})`,
    html,
    text,
  };
}
