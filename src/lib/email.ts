import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "LLCPad <noreply@llcpad.com>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@llcpad.com";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo: replyTo || SUPPORT_EMAIL,
    });

    if (error) {
      console.error("Email send error:", error);
      throw new Error(error.message);
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

// Email types for the application
export type EmailType =
  | "welcome"
  | "order_confirmation"
  | "order_status_update"
  | "password_reset"
  | "document_uploaded"
  | "document_approved"
  | "ticket_reply"
  | "invoice";

// Helper to send templated emails
export async function sendTemplatedEmail(
  type: EmailType,
  to: string,
  data: Record<string, unknown>
) {
  const { subject, html, text } = await generateEmailContent(type, data);
  return sendEmail({ to, subject, html, text });
}

// Generate email content based on type
async function generateEmailContent(
  type: EmailType,
  data: Record<string, unknown>
): Promise<{ subject: string; html: string; text: string }> {
  switch (type) {
    case "welcome":
      return generateWelcomeEmail(data as unknown as WelcomeEmailData);
    case "order_confirmation":
      return generateOrderConfirmationEmail(data as unknown as OrderConfirmationEmailData);
    case "order_status_update":
      return generateOrderStatusUpdateEmail(data as unknown as OrderStatusUpdateEmailData);
    case "password_reset":
      return generatePasswordResetEmail(data as unknown as PasswordResetEmailData);
    case "document_uploaded":
      return generateDocumentUploadedEmail(data as unknown as DocumentEmailData);
    case "document_approved":
      return generateDocumentApprovedEmail(data as unknown as DocumentEmailData);
    case "ticket_reply":
      return generateTicketReplyEmail(data as unknown as TicketReplyEmailData);
    case "invoice":
      return generateInvoiceEmail(data as unknown as InvoiceEmailData);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

// Email data types
interface WelcomeEmailData {
  name: string;
  email: string;
}

interface OrderConfirmationEmailData {
  name: string;
  orderId: string;
  orderDate: string;
  items: Array<{ name: string; price: number }>;
  total: number;
  llcName?: string;
  state?: string;
}

interface OrderStatusUpdateEmailData {
  name: string;
  orderId: string;
  status: string;
  statusMessage: string;
  nextSteps?: string;
}

interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

interface DocumentEmailData {
  name: string;
  documentName: string;
  orderId: string;
}

interface TicketReplyEmailData {
  name: string;
  ticketId: string;
  subject: string;
  message: string;
}

interface InvoiceEmailData {
  name: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  items: Array<{ name: string; price: number }>;
}

// Email template generators
function generateWelcomeEmail(data: WelcomeEmailData) {
  const subject = "Welcome to LLCPad - Let's Build Your Business!";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0066cc; margin: 0;">LLCPad</h1>
  </div>

  <h2 style="color: #333;">Welcome, ${data.name}!</h2>

  <p>Thank you for joining LLCPad! We're excited to help you start your US business journey.</p>

  <p>Here's what you can do with your new account:</p>

  <ul style="padding-left: 20px;">
    <li><strong>Form Your LLC</strong> - Start a US LLC in any state</li>
    <li><strong>Get Your EIN</strong> - Apply for your business tax ID</li>
    <li><strong>Open a Bank Account</strong> - We'll guide you through the process</li>
    <li><strong>Sell on Amazon</strong> - Set up your Amazon seller account</li>
  </ul>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Go to Dashboard</a>
  </div>

  <p>Have questions? Our team is here to help. Just reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: #0066cc;">contact page</a>.</p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The LLCPad Team
  </p>

  <p style="color: #999; font-size: 12px; text-align: center;">
    LLCPad - US LLC Formation & Amazon Seller Services<br>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #999;">www.llcpad.com</a>
  </p>
</body>
</html>
  `.trim();

  const text = `
Welcome to LLCPad, ${data.name}!

Thank you for joining LLCPad! We're excited to help you start your US business journey.

Here's what you can do with your new account:
- Form Your LLC - Start a US LLC in any state
- Get Your EIN - Apply for your business tax ID
- Open a Bank Account - We'll guide you through the process
- Sell on Amazon - Set up your Amazon seller account

Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Have questions? Our team is here to help. Reply to this email or visit ${process.env.NEXT_PUBLIC_APP_URL}/contact

Best regards,
The LLCPad Team
  `.trim();

  return { subject, html, text };
}

function generateOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  const subject = `Order Confirmed - ${data.orderId}`;

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0066cc; margin: 0;">LLCPad</h1>
  </div>

  <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 15px; text-align: center; margin-bottom: 20px;">
    <h2 style="color: #155724; margin: 0;">Order Confirmed!</h2>
  </div>

  <p>Hi ${data.name},</p>

  <p>Thank you for your order! We've received your payment and will begin processing your order right away.</p>

  <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px;"><strong>Order ID:</strong> ${data.orderId}</p>
    <p style="margin: 0 0 10px;"><strong>Order Date:</strong> ${data.orderDate}</p>
    ${data.llcName ? `<p style="margin: 0 0 10px;"><strong>LLC Name:</strong> ${data.llcName}</p>` : ""}
    ${data.state ? `<p style="margin: 0;"><strong>State:</strong> ${data.state}</p>` : ""}
  </div>

  <h3 style="margin-top: 30px;">Order Summary</h3>

  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background-color: #f8f9fa;">
        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
    <tfoot>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Total</td>
        <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #0066cc;">$${data.total.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  <h3 style="margin-top: 30px;">What Happens Next?</h3>

  <ol style="padding-left: 20px;">
    <li style="margin-bottom: 10px;">Our team will review your order and prepare the necessary documents.</li>
    <li style="margin-bottom: 10px;">We'll submit your LLC formation to the state (typically within 24 hours).</li>
    <li style="margin-bottom: 10px;">You'll receive email updates as your order progresses.</li>
    <li style="margin-bottom: 10px;">Once approved, all documents will be available in your dashboard.</li>
  </ol>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${data.orderId}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Track Your Order</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The LLCPad Team
  </p>
</body>
</html>
  `.trim();

  const text = `
Order Confirmed - ${data.orderId}

Hi ${data.name},

Thank you for your order! We've received your payment and will begin processing your order right away.

Order Details:
- Order ID: ${data.orderId}
- Order Date: ${data.orderDate}
${data.llcName ? `- LLC Name: ${data.llcName}` : ""}
${data.state ? `- State: ${data.state}` : ""}

Order Summary:
${data.items.map((item) => `- ${item.name}: $${item.price.toFixed(2)}`).join("\n")}

Total: $${data.total.toFixed(2)}

Track your order: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${data.orderId}

Best regards,
The LLCPad Team
  `.trim();

  return { subject, html, text };
}

function generateOrderStatusUpdateEmail(data: OrderStatusUpdateEmailData) {
  const subject = `Order Update - ${data.orderId}: ${data.status}`;

  const statusColors: Record<string, { bg: string; text: string }> = {
    processing: { bg: "#cce5ff", text: "#004085" },
    in_progress: { bg: "#d4edda", text: "#155724" },
    completed: { bg: "#d4edda", text: "#155724" },
    waiting_for_info: { bg: "#fff3cd", text: "#856404" },
  };

  const colors = statusColors[data.status.toLowerCase()] || { bg: "#e2e3e5", text: "#383d41" };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0066cc; margin: 0;">LLCPad</h1>
  </div>

  <h2>Order Status Update</h2>

  <p>Hi ${data.name},</p>

  <p>Your order <strong>${data.orderId}</strong> has been updated:</p>

  <div style="background-color: ${colors.bg}; color: ${colors.text}; border-radius: 6px; padding: 15px; text-align: center; margin: 20px 0;">
    <p style="margin: 0; font-size: 18px; font-weight: bold;">${data.status}</p>
  </div>

  <p>${data.statusMessage}</p>

  ${
    data.nextSteps
      ? `
  <div style="background-color: #f8f9fa; border-radius: 6px; padding: 15px; margin: 20px 0;">
    <h4 style="margin: 0 0 10px; color: #333;">Next Steps:</h4>
    <p style="margin: 0; color: #666;">${data.nextSteps}</p>
  </div>
  `
      : ""
  }

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${data.orderId}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Order Details</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The LLCPad Team
  </p>
</body>
</html>
  `.trim();

  const text = `
Order Status Update - ${data.orderId}

Hi ${data.name},

Your order ${data.orderId} has been updated:

Status: ${data.status}

${data.statusMessage}

${data.nextSteps ? `Next Steps: ${data.nextSteps}` : ""}

View order details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${data.orderId}

Best regards,
The LLCPad Team
  `.trim();

  return { subject, html, text };
}

function generatePasswordResetEmail(data: PasswordResetEmailData) {
  const subject = "Reset Your Password - LLCPad";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0066cc; margin: 0;">LLCPad</h1>
  </div>

  <h2>Password Reset Request</h2>

  <p>Hi ${data.name},</p>

  <p>We received a request to reset your password. Click the button below to create a new password:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${data.resetUrl}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a>
  </div>

  <p style="color: #666; font-size: 14px;">This link will expire in ${data.expiresIn}.</p>

  <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px;">
    If the button doesn't work, copy and paste this link into your browser:<br>
    <a href="${data.resetUrl}" style="color: #0066cc;">${data.resetUrl}</a>
  </p>

  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The LLCPad Team
  </p>
</body>
</html>
  `.trim();

  const text = `
Password Reset Request

Hi ${data.name},

We received a request to reset your password. Visit this link to create a new password:

${data.resetUrl}

This link will expire in ${data.expiresIn}.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The LLCPad Team
  `.trim();

  return { subject, html, text };
}

function generateDocumentUploadedEmail(data: DocumentEmailData) {
  const subject = `Document Uploaded - ${data.documentName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0066cc; margin: 0;">LLCPad</h1>
  </div>

  <h2>Document Received</h2>

  <p>Hi ${data.name},</p>

  <p>We've received your document <strong>${data.documentName}</strong> for order <strong>${data.orderId}</strong>.</p>

  <p>Our team will review it and update you within 24-48 hours.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documents" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Documents</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The LLCPad Team
  </p>
</body>
</html>
  `.trim();

  const text = `
Document Received

Hi ${data.name},

We've received your document "${data.documentName}" for order ${data.orderId}.

Our team will review it and update you within 24-48 hours.

View your documents: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documents

Best regards,
The LLCPad Team
  `.trim();

  return { subject, html, text };
}

function generateDocumentApprovedEmail(data: DocumentEmailData) {
  const subject = `Document Approved - ${data.documentName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0066cc; margin: 0;">LLCPad</h1>
  </div>

  <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 15px; text-align: center; margin-bottom: 20px;">
    <h2 style="color: #155724; margin: 0;">Document Approved!</h2>
  </div>

  <p>Hi ${data.name},</p>

  <p>Great news! Your document <strong>${data.documentName}</strong> for order <strong>${data.orderId}</strong> has been approved.</p>

  <p>Your document is now available for download in your dashboard.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documents" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Download Document</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The LLCPad Team
  </p>
</body>
</html>
  `.trim();

  const text = `
Document Approved!

Hi ${data.name},

Great news! Your document "${data.documentName}" for order ${data.orderId} has been approved.

Your document is now available for download in your dashboard.

Download document: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documents

Best regards,
The LLCPad Team
  `.trim();

  return { subject, html, text };
}

function generateTicketReplyEmail(data: TicketReplyEmailData) {
  const subject = `Re: ${data.subject} - Ticket #${data.ticketId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0066cc; margin: 0;">LLCPad</h1>
  </div>

  <h2>New Reply to Your Support Ticket</h2>

  <p>Hi ${data.name},</p>

  <p>You have a new reply to your support ticket <strong>#${data.ticketId}</strong>:</p>

  <div style="background-color: #f8f9fa; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/support/${data.ticketId}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View & Reply</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The LLCPad Team
  </p>
</body>
</html>
  `.trim();

  const text = `
New Reply to Your Support Ticket

Hi ${data.name},

You have a new reply to your support ticket #${data.ticketId}:

---
${data.message}
---

View and reply: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/support/${data.ticketId}

Best regards,
The LLCPad Team
  `.trim();

  return { subject, html, text };
}

function generateInvoiceEmail(data: InvoiceEmailData) {
  const subject = `Invoice ${data.invoiceNumber} - LLCPad`;

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0066cc; margin: 0;">LLCPad</h1>
  </div>

  <h2>Invoice ${data.invoiceNumber}</h2>

  <p>Hi ${data.name},</p>

  <p>Please find your invoice details below:</p>

  <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px;"><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
    <p style="margin: 0 0 10px;"><strong>Due Date:</strong> ${data.dueDate}</p>
    <p style="margin: 0;"><strong>Amount Due:</strong> <span style="color: #0066cc; font-size: 20px; font-weight: bold;">$${data.amount.toFixed(2)}</span></p>
  </div>

  <h3>Invoice Items</h3>

  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background-color: #f8f9fa;">
        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
    <tfoot>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Total</td>
        <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #0066cc;">$${data.amount.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View in Dashboard</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    The LLCPad Team
  </p>
</body>
</html>
  `.trim();

  const text = `
Invoice ${data.invoiceNumber}

Hi ${data.name},

Please find your invoice details below:

Invoice Number: ${data.invoiceNumber}
Due Date: ${data.dueDate}
Amount Due: $${data.amount.toFixed(2)}

Invoice Items:
${data.items.map((item) => `- ${item.name}: $${item.price.toFixed(2)}`).join("\n")}

Total: $${data.amount.toFixed(2)}

View in dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders

Best regards,
The LLCPad Team
  `.trim();

  return { subject, html, text };
}
