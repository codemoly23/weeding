/**
 * Default email templates seeded on first use
 */

export const DEFAULT_TEMPLATES = [
  {
    name: "Welcome Email",
    subject: "Welcome to {{companyName}}!",
    body: `
      <h1 style="font-size:24px;margin:0 0 12px;">Welcome, {{firstName}}!</h1>
      <p style="font-size:16px;color:#52525b;margin:0 0 16px;">
        Thank you for subscribing to our newsletter. We'll keep you updated with the latest news, tips, and insights about LLC formation and business services.
      </p>
      <p style="font-size:16px;color:#52525b;margin:0 0 20px;">
        If you have any questions, feel free to reply to this email.
      </p>
      <a href="{{siteUrl}}" style="display:inline-block;padding:12px 24px;background-color:#16a34a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Visit Our Website</a>
    `.trim(),
    variables: ["firstName", "companyName", "siteUrl", "unsubscribeUrl"],
    isDefault: true,
  },
  {
    name: "Blog Notification",
    subject: "New Post: {{blogTitle}}",
    body: `
      <h1 style="font-size:24px;margin:0 0 12px;">{{blogTitle}}</h1>
      <p style="font-size:16px;color:#52525b;margin:0 0 20px;">{{blogExcerpt}}</p>
      <a href="{{blogUrl}}" style="display:inline-block;padding:12px 24px;background-color:#16a34a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Read More</a>
    `.trim(),
    variables: ["blogTitle", "blogExcerpt", "blogUrl", "blogCoverImage", "firstName", "unsubscribeUrl"],
    isDefault: true,
  },
  {
    name: "Announcement",
    subject: "{{companyName}} Update",
    body: `
      <h1 style="font-size:24px;margin:0 0 12px;">Hi {{firstName}},</h1>
      <p style="font-size:16px;color:#52525b;margin:0 0 16px;">
        We have exciting news to share with you!
      </p>
      <p style="font-size:16px;color:#52525b;margin:0 0 20px;">
        [Your announcement content here]
      </p>
      <a href="{{siteUrl}}" style="display:inline-block;padding:12px 24px;background-color:#16a34a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Learn More</a>
    `.trim(),
    variables: ["firstName", "companyName", "siteUrl", "unsubscribeUrl"],
    isDefault: true,
  },
];
