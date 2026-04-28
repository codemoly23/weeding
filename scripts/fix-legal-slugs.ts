import prisma from "../src/lib/db";

async function main() {
  // 1. Fix privacy-policy slug → privacy
  const updated = await prisma.legalPage.updateMany({
    where: { slug: "privacy-policy" },
    data: { slug: "privacy" },
  });
  console.log(`✓ privacy-policy → privacy (${updated.count} updated)`);

  // 2. Create refund-policy if not exists
  const existing = await prisma.legalPage.findUnique({ where: { slug: "refund-policy" } });
  if (existing) {
    console.log("✓ refund-policy already exists, skipping");
  } else {
    await prisma.legalPage.create({
      data: {
        slug: "refund-policy",
        title: "Refund Policy",
        isActive: true,
        version: 1,
        content: `
<h2>1. Subscription Refunds</h2>
<p>All subscription plans (Premium, Elite) are billed monthly or annually. You may cancel your subscription at any time from your account dashboard.</p>
<ul>
  <li>Monthly plans: No refund for the current billing period. Access continues until the end of the period.</li>
  <li>Annual plans: Refund available within 14 days of purchase if the service has not been used.</li>
</ul>

<h2>2. One-Time Purchases</h2>
<p>One-time purchases (e.g., additional SMS credits, premium templates) are non-refundable once delivered or used.</p>

<h2>3. Vendor Plans</h2>
<p>Vendor subscription fees are non-refundable. If you believe you were charged in error, contact us within 7 days.</p>

<h2>4. Exceptions</h2>
<p>We may issue refunds at our discretion in the following cases:</p>
<ul>
  <li>Technical issues on our end that prevented use of the service</li>
  <li>Duplicate charges</li>
  <li>Charges made after cancellation confirmation</li>
</ul>

<h2>5. How to Request a Refund</h2>
<p>To request a refund, contact our support team at <a href="mailto:support@ceremoney.com">support@ceremoney.com</a> with your order details. We will respond within 3 business days.</p>

<h2>6. Processing Time</h2>
<p>Approved refunds are processed within 5–10 business days depending on your payment provider.</p>
        `.trim(),
        metaTitle: "Refund Policy | Ceremoney",
        metaDescription: "Learn about Ceremoney's refund and cancellation policy for subscriptions and services.",
      },
    });
    console.log("✓ refund-policy record created");
  }

  console.log("\n✅ Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
