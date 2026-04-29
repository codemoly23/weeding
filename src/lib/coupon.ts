import { prisma } from "@/lib/db";

/**
 * Atomically increments coupon usedCount only if usageLimit is not reached.
 * Returns true if redemption succeeded, false if limit was already hit.
 * Uses a single UPDATE ... WHERE to prevent race conditions.
 */
export async function redeemCoupon(couponId: string): Promise<boolean> {
  const result = await prisma.$executeRaw`
    UPDATE "Coupon"
    SET "usedCount" = "usedCount" + 1
    WHERE id = ${couponId}
    AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")
  `;
  return result === 1;
}
