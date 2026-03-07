import { createHmac } from "crypto";

const getSecret = () => process.env.AUTH_SECRET || "fallback-newsletter-secret";

/**
 * Generate HMAC-based unsubscribe token for a lead
 */
export function generateUnsubscribeToken(leadId: string, email: string): string {
  const hmac = createHmac("sha256", getSecret());
  hmac.update(`${leadId}:${email}`);
  return hmac.digest("hex");
}

/**
 * Verify an unsubscribe token matches the lead
 */
export function verifyUnsubscribeToken(token: string, leadId: string, email: string): boolean {
  const expected = generateUnsubscribeToken(leadId, email);
  return token === expected;
}

/**
 * Build full unsubscribe URL
 */
export function getUnsubscribeUrl(leadId: string, email: string): string {
  const token = generateUnsubscribeToken(leadId, email);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/api/newsletter/unsubscribe?token=${token}&id=${leadId}`;
}
