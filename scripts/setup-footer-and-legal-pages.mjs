/**
 * Set up footer (v3-forge style) and seed legal pages
 * Run: node scripts/setup-footer-and-legal-pages.mjs
 */

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "llcpad",
});

function cuid() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

// ─────────────────────────────────────────────────────────
// 1. Legal Pages Content
// ─────────────────────────────────────────────────────────

const legalPages = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    metaTitle: "Privacy Policy | LLCPad",
    metaDescription: "Learn how LLCPad collects, uses, and protects your personal information when you use our LLC formation and business services.",
    content: `
<h2>Privacy Policy</h2>
<p><strong>Last Updated:</strong> March 7, 2026</p>
<p>LLCPad ("we," "our," or "us") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>

<h3>1. Information We Collect</h3>
<h4>Personal Information</h4>
<p>When you use our services, we may collect the following personal information:</p>
<ul>
  <li><strong>Identity Information:</strong> Full name, date of birth, nationality, passport/ID details</li>
  <li><strong>Contact Information:</strong> Email address, phone number, mailing address</li>
  <li><strong>Business Information:</strong> LLC name, registered agent details, EIN application data, state of formation</li>
  <li><strong>Financial Information:</strong> Payment card details (processed securely through Stripe/SSLCommerz), billing address</li>
  <li><strong>Account Information:</strong> Username, password (hashed), account preferences</li>
</ul>

<h4>Automatically Collected Information</h4>
<ul>
  <li>IP address and approximate location</li>
  <li>Browser type and version</li>
  <li>Device information and operating system</li>
  <li>Pages visited and time spent on our site</li>
  <li>Referral source and exit pages</li>
</ul>

<h3>2. How We Use Your Information</h3>
<p>We use the collected information for the following purposes:</p>
<ul>
  <li>Processing LLC formations, EIN applications, and other business services</li>
  <li>Communicating with you about your orders, account, and service updates</li>
  <li>Processing payments securely through our payment partners</li>
  <li>Improving our website, services, and user experience</li>
  <li>Complying with legal obligations and regulatory requirements</li>
  <li>Preventing fraud and ensuring security of our platform</li>
</ul>

<h3>3. How We Share Your Information</h3>
<p>We may share your information with:</p>
<ul>
  <li><strong>Government Agencies:</strong> State filing offices, IRS (for EIN applications), as required to process your services</li>
  <li><strong>Service Partners:</strong> Registered agent services, virtual address providers, banking partners — only as necessary to fulfill your orders</li>
  <li><strong>Payment Processors:</strong> Stripe and SSLCommerz for secure payment processing</li>
  <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulation</li>
</ul>
<p>We do <strong>not</strong> sell your personal information to third parties for marketing purposes.</p>

<h3>4. Data Security</h3>
<p>We implement industry-standard security measures to protect your data:</p>
<ul>
  <li>SSL/TLS encryption for all data in transit</li>
  <li>Encrypted storage for sensitive documents</li>
  <li>Regular security audits and vulnerability assessments</li>
  <li>Access controls limiting employee access to personal data</li>
  <li>Secure cloud storage (Cloudflare R2) for uploaded documents</li>
</ul>

<h3>5. Cookies and Tracking</h3>
<p>We use cookies and similar technologies to:</p>
<ul>
  <li>Keep you signed in to your account</li>
  <li>Remember your preferences</li>
  <li>Analyze site usage and improve performance</li>
  <li>Provide relevant content and features</li>
</ul>
<p>You can manage cookie preferences through your browser settings. Disabling cookies may affect certain features of our website.</p>

<h3>6. Your Rights</h3>
<p>Depending on your location, you may have the following rights:</p>
<ul>
  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
  <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
  <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
  <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
</ul>

<h3>7. Data Retention</h3>
<p>We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Business formation documents and records are retained for a minimum of 7 years as required by applicable regulations.</p>

<h3>8. International Transfers</h3>
<p>As we serve international clients, your data may be transferred to and processed in the United States. By using our services, you consent to this transfer. We ensure appropriate safeguards are in place for such transfers.</p>

<h3>9. Children's Privacy</h3>
<p>Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors.</p>

<h3>10. Changes to This Policy</h3>
<p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our website. Your continued use of our services after changes constitutes acceptance of the updated policy.</p>

<h3>11. Contact Us</h3>
<p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:</p>
<p><strong>Email:</strong> support@llcpad.com</p>
`,
  },
  {
    slug: "terms",
    title: "Terms of Service",
    metaTitle: "Terms of Service | LLCPad",
    metaDescription: "Read the terms and conditions for using LLCPad's LLC formation, EIN application, and business services.",
    content: `
<h2>Terms of Service</h2>
<p><strong>Last Updated:</strong> March 7, 2026</p>
<p>Welcome to LLCPad. By accessing or using our website and services, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully.</p>

<h3>1. About Our Services</h3>
<p>LLCPad provides document preparation services for LLC formation, EIN applications, registered agent services, and related business services. <strong>LLCPad is not a law firm, does not provide legal advice, and no attorney-client relationship is formed by using our services.</strong></p>

<h3>2. Eligibility</h3>
<p>You must be at least 18 years old and legally capable of entering into binding contracts to use our services. By using LLCPad, you represent and warrant that you meet these requirements.</p>

<h3>3. Account Registration</h3>
<ul>
  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
  <li>You agree to provide accurate and complete information during registration</li>
  <li>You are responsible for all activities that occur under your account</li>
  <li>You must notify us immediately of any unauthorized use of your account</li>
</ul>

<h3>4. Services and Pricing</h3>
<ul>
  <li>All service descriptions and pricing are displayed on our website</li>
  <li>Prices are in USD unless otherwise stated</li>
  <li><strong>State filing fees</strong> are separate from our service fees and are paid directly to the relevant state agency</li>
  <li>We reserve the right to modify pricing with prior notice</li>
  <li>Processing times are estimates and may vary depending on state filing offices</li>
</ul>

<h3>5. Payment Terms</h3>
<ul>
  <li>Payment is required at the time of order placement</li>
  <li>We accept payments via Stripe (credit/debit cards) and SSLCommerz (for Bangladesh)</li>
  <li>All payments are processed securely through our payment partners</li>
  <li>You authorize us to charge the provided payment method for the total amount of your order</li>
</ul>

<h3>6. Refund Policy</h3>
<ul>
  <li>Refund requests must be submitted before we begin processing your order with the relevant state agency</li>
  <li>Once a filing has been submitted to a state office, the service fee is non-refundable</li>
  <li>State filing fees paid to government agencies are non-refundable</li>
  <li>Registered agent annual fees are non-refundable once the service period has begun</li>
  <li>Please contact support@llcpad.com for refund inquiries</li>
</ul>

<h3>7. Your Responsibilities</h3>
<p>You agree to:</p>
<ul>
  <li>Provide accurate, complete, and truthful information for all filings</li>
  <li>Respond promptly to our requests for additional information</li>
  <li>Review all documents before submission for accuracy</li>
  <li>Comply with all applicable laws and regulations in your jurisdiction</li>
  <li>Maintain your LLC's compliance requirements (annual reports, taxes, etc.) after formation</li>
</ul>

<h3>8. Limitation of Liability</h3>
<p>To the maximum extent permitted by law:</p>
<ul>
  <li>LLCPad's total liability shall not exceed the amount you paid for the specific service giving rise to the claim</li>
  <li>We are not liable for indirect, incidental, special, or consequential damages</li>
  <li>We are not responsible for delays caused by state filing offices or government agencies</li>
  <li>We are not liable for business decisions made based on information provided on our website</li>
</ul>

<h3>9. Intellectual Property</h3>
<p>All content on the LLCPad website, including text, graphics, logos, and software, is owned by LLCPad and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.</p>

<h3>10. Termination</h3>
<p>We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent activity. Upon termination, your right to use our services will immediately cease.</p>

<h3>11. Dispute Resolution</h3>
<p>Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in the United States, and the decision shall be final and binding.</p>

<h3>12. Governing Law</h3>
<p>These Terms shall be governed by the laws of the State of Wyoming, United States, without regard to conflict of law principles.</p>

<h3>13. Changes to These Terms</h3>
<p>We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the updated Terms.</p>

<h3>14. Contact Us</h3>
<p>For questions about these Terms, contact us at:</p>
<p><strong>Email:</strong> support@llcpad.com</p>
`,
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    metaTitle: "Legal Disclaimer | LLCPad",
    metaDescription: "Important legal disclaimers about LLCPad's LLC formation and business services. We are not a law firm.",
    content: `
<h2>Legal Disclaimer</h2>
<p><strong>Last Updated:</strong> March 7, 2026</p>

<h3>Not a Law Firm</h3>
<p><strong>LLCPad is not a law firm and does not provide legal, tax, or financial advice.</strong> Our services are limited to document preparation and filing services. We prepare and file documents based on the information you provide. No attorney-client relationship is formed by using our services.</p>

<h3>Document Preparation Services</h3>
<p>LLCPad provides document preparation services for business formation filings. We:</p>
<ul>
  <li>Prepare formation documents (Articles of Organization, etc.) based on your instructions</li>
  <li>Submit filings to the appropriate state agencies on your behalf</li>
  <li>Provide registered agent services as a commercial registered agent</li>
  <li>Assist with EIN applications through the IRS online system</li>
</ul>

<h3>State Filing Fees</h3>
<p>State filing fees charged by government agencies are <strong>separate from and in addition to</strong> LLCPad's service fees. These fees vary by state and are subject to change without notice. Current state filing fees are displayed during the order process.</p>

<h3>No Guarantees</h3>
<p>While we strive for accuracy and completeness in all filings:</p>
<ul>
  <li>We cannot guarantee approval of any filing by a state agency</li>
  <li>Processing times are estimates provided by state filing offices and may vary</li>
  <li>LLC name availability is subject to state approval and may be rejected</li>
  <li>EIN issuance is subject to IRS approval and processing</li>
</ul>

<h3>Tax and Legal Advice</h3>
<p>We strongly recommend consulting with qualified professionals for:</p>
<ul>
  <li>Legal advice specific to your business situation</li>
  <li>Tax planning and compliance (federal, state, and international)</li>
  <li>Immigration and visa matters related to business ownership</li>
  <li>Industry-specific regulatory compliance</li>
  <li>Intellectual property protection beyond basic trademark filing</li>
</ul>

<h3>Information Accuracy</h3>
<p>While we make every effort to ensure the information on our website is accurate and up-to-date, we do not warrant the completeness or accuracy of any information provided. Laws, regulations, and filing requirements may change without notice.</p>

<h3>Third-Party Services</h3>
<p>Some of our services involve third-party providers (payment processors, banking partners, etc.). We are not responsible for the actions, policies, or services of these third parties. Please review their respective terms and privacy policies.</p>

<h3>Limitation of Liability</h3>
<p>LLCPad shall not be liable for any damages resulting from the use or inability to use our services, including but not limited to direct, indirect, incidental, or consequential damages. Our maximum liability is limited to the amount paid for the specific service in question.</p>

<h3>Contact</h3>
<p>If you have questions about this disclaimer, please contact us at <strong>support@llcpad.com</strong>.</p>
`,
  },
];

// ─────────────────────────────────────────────────────────
// 2. Footer Configuration
// ─────────────────────────────────────────────────────────

async function seedLegalPages() {
  console.log("Seeding legal pages...");

  for (const page of legalPages) {
    // Check if already exists
    const existing = await pool.query(
      `SELECT id FROM "LegalPage" WHERE slug = $1`,
      [page.slug]
    );

    if (existing.rows.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE "LegalPage" SET title = $1, content = $2, "metaTitle" = $3, "metaDescription" = $4, "isActive" = true, "updatedAt" = NOW() WHERE slug = $5`,
        [page.title, page.content, page.metaTitle, page.metaDescription, page.slug]
      );
      console.log(`  Updated: ${page.slug}`);
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO "LegalPage" (id, slug, title, content, "isActive", "metaTitle", "metaDescription", version, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, true, $5, $6, 1, NOW(), NOW())`,
        [cuid(), page.slug, page.title, page.content, page.metaTitle, page.metaDescription]
      );
      console.log(`  Created: ${page.slug}`);
    }
  }
}

async function setupFooter() {
  console.log("\nSetting up footer...");

  // Find active footer
  const result = await pool.query(
    `SELECT id FROM "FooterConfig" WHERE "isActive" = true LIMIT 1`
  );

  if (result.rows.length === 0) {
    console.log("  No active footer found. Creating one...");
    const footerId = cuid();
    await pool.query(
      `INSERT INTO "FooterConfig" (id, name, "isActive", layout, columns, "createdAt", "updatedAt")
       VALUES ($1, 'LLCPad Footer', true, 'MULTI_COLUMN', 4, NOW(), NOW())`,
      [footerId]
    );
    result.rows.push({ id: footerId });
  }

  const footerId = result.rows[0].id;
  console.log(`  Footer ID: ${footerId}`);

  // Update footer config with v3-forge dark theme
  await pool.query(
    `UPDATE "FooterConfig" SET
      layout = 'MULTI_COLUMN',
      columns = 4,
      "bgType" = 'solid',
      "bgColor" = '#0f2318',
      "textColor" = 'rgba(250,248,244,0.5)',
      "headingColor" = 'rgba(250,248,244,0.35)',
      "linkColor" = 'rgba(250,248,244,0.5)',
      "linkHoverColor" = '#faf8f4',
      "accentColor" = '#e84c1e',
      "borderColor" = 'rgba(255,255,255,0.07)',
      "dividerColor" = 'rgba(255,255,255,0.07)',
      "dividerStyle" = 'solid',
      "headingSize" = 'sm',
      "headingWeight" = 'bold',
      "headingStyle" = 'uppercase',
      "topBorderStyle" = 'gradient',
      "topBorderHeight" = 4,
      "topBorderGradientFrom" = '#e84c1e',
      "topBorderGradientTo" = '#253d30',
      "socialShape" = 'rounded',
      "socialSize" = 'md',
      "socialColorMode" = 'monochrome',
      "socialHoverEffect" = 'scale',
      "socialBgStyle" = 'subtle',
      "paddingTop" = 80,
      "paddingBottom" = 0,
      "containerWidth" = 'boxed',
      "bottomBarEnabled" = true,
      "bottomBarLayout" = 'split',
      "showDisclaimer" = true,
      "copyrightText" = '© 2026 LLCPad. All rights reserved. Not a law firm.',
      "disclaimerText" = 'LLCPad is not a law firm and does not provide legal, tax, or financial advice. Formation services are document preparation services only. State filing fees are separate. All prices are in USD.',
      "bottomLinks" = $1,
      "showSocialLinks" = true,
      "socialPosition" = 'brand',
      "brandRevealEnabled" = true,
      "brandRevealText" = 'LLCPAD',
      "brandRevealColor" = '#ffffff',
      "brandRevealOpacity" = 0.06,
      "showTrustBadges" = false,
      "updatedAt" = NOW()
    WHERE id = $2`,
    [
      JSON.stringify([
        { label: "Privacy", url: "/privacy" },
        { label: "Terms", url: "/terms" },
        { label: "Disclaimer", url: "/disclaimer" },
        { label: "Sitemap", url: "/sitemap.xml" },
      ]),
      footerId,
    ]
  );
  console.log("  Footer config updated (v3-forge dark theme)");

  // Delete existing widgets (MenuItem uses footerWidgetId)
  await pool.query(`DELETE FROM "MenuItem" WHERE "footerWidgetId" IN (SELECT id FROM "FooterWidget" WHERE "footerId" = $1)`, [footerId]);
  await pool.query(`DELETE FROM "FooterWidget" WHERE "footerId" = $1`, [footerId]);
  console.log("  Cleared existing widgets");

  // Column 1: BRAND widget
  const brandWidgetId = cuid();
  await pool.query(
    `INSERT INTO "FooterWidget" (id, "footerId", type, title, "showTitle", "column", "sortOrder", content, "createdAt", "updatedAt")
     VALUES ($1, $2, 'BRAND', 'Brand', false, 1, 0, $3, NOW(), NOW())`,
    [brandWidgetId, footerId, JSON.stringify({ logoMode: "auto" })]
  );
  console.log("  Added BRAND widget (Column 1)");

  // Column 1: NEWSLETTER widget (below brand)
  const newsletterWidgetId = cuid();
  await pool.query(
    `INSERT INTO "FooterWidget" (id, "footerId", type, title, "showTitle", "column", "sortOrder", content, "createdAt", "updatedAt")
     VALUES ($1, $2, 'NEWSLETTER', 'Newsletter', false, 1, 1, $3, NOW(), NOW())`,
    [
      newsletterWidgetId,
      footerId,
      JSON.stringify({
        text: "Get LLC tips & US business insights",
        placeholder: "your@email.com",
        buttonText: "Subscribe",
      }),
    ]
  );
  console.log("  Added NEWSLETTER widget (Column 1)");

  // Column 2: LINKS "Services"
  const servicesWidgetId = cuid();
  await pool.query(
    `INSERT INTO "FooterWidget" (id, "footerId", type, title, "showTitle", "column", "sortOrder", "createdAt", "updatedAt")
     VALUES ($1, $2, 'LINKS', 'Services', true, 2, 0, NOW(), NOW())`,
    [servicesWidgetId, footerId]
  );

  const serviceLinks = [
    { label: "LLC Formation", url: "/services/llc-formation" },
    { label: "EIN Application", url: "/services/ein-application" },
    { label: "Registered Agent", url: "/services/registered-agent" },
    { label: "Amazon Seller", url: "/services/amazon-seller-account" },
    { label: "Brand Registry", url: "/services/brand-registry" },
    { label: "Trademark", url: "/services/trademark" },
    { label: "Business Banking", url: "/services/business-banking" },
    { label: "Virtual Address", url: "/services/virtual-address" },
  ];

  for (let i = 0; i < serviceLinks.length; i++) {
    await pool.query(
      `INSERT INTO "MenuItem" (id, "footerWidgetId", label, url, target, "isVisible", "sortOrder", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, '_self', true, $5, NOW(), NOW())`,
      [cuid(), servicesWidgetId, serviceLinks[i].label, serviceLinks[i].url, i]
    );
  }
  console.log("  Added LINKS 'Services' widget (Column 2) with 8 links");

  // Column 3: LINKS "Resources" (placeholder links for now)
  const resourcesWidgetId = cuid();
  await pool.query(
    `INSERT INTO "FooterWidget" (id, "footerId", type, title, "showTitle", "column", "sortOrder", "createdAt", "updatedAt")
     VALUES ($1, $2, 'LINKS', 'Resources', true, 3, 0, NOW(), NOW())`,
    [resourcesWidgetId, footerId]
  );

  const resourceLinks = [
    { label: "How to Form an LLC", url: "/blog" },
    { label: "Wyoming vs Delaware", url: "/blog" },
    { label: "EIN Guide for Non-US", url: "/blog" },
    { label: "Amazon Seller Guide", url: "/blog" },
    { label: "US Banking Guide", url: "/blog" },
    { label: "Blog", url: "/blog" },
    { label: "FAQ", url: "/faq" },
  ];

  for (let i = 0; i < resourceLinks.length; i++) {
    await pool.query(
      `INSERT INTO "MenuItem" (id, "footerWidgetId", label, url, target, "isVisible", "sortOrder", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, '_self', true, $5, NOW(), NOW())`,
      [cuid(), resourcesWidgetId, resourceLinks[i].label, resourceLinks[i].url, i]
    );
  }
  console.log("  Added LINKS 'Resources' widget (Column 3) with 7 links");

  // Column 4: LINKS "Company"
  const companyWidgetId = cuid();
  await pool.query(
    `INSERT INTO "FooterWidget" (id, "footerId", type, title, "showTitle", "column", "sortOrder", "createdAt", "updatedAt")
     VALUES ($1, $2, 'LINKS', 'Company', true, 4, 0, NOW(), NOW())`,
    [companyWidgetId, footerId]
  );

  const companyLinks = [
    { label: "About LLCPad", url: "/about" },
    { label: "Our Team", url: "/about" },
    { label: "Reviews", url: "/about" },
    { label: "Privacy Policy", url: "/privacy" },
    { label: "Terms of Service", url: "/terms" },
  ];

  for (let i = 0; i < companyLinks.length; i++) {
    await pool.query(
      `INSERT INTO "MenuItem" (id, "footerWidgetId", label, url, target, "isVisible", "sortOrder", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, '_self', true, $5, NOW(), NOW())`,
      [cuid(), companyWidgetId, companyLinks[i].label, companyLinks[i].url, i]
    );
  }
  console.log("  Added LINKS 'Company' widget (Column 4) with 5 links (no Affiliates, no Guarantee)");
}

async function main() {
  try {
    await seedLegalPages();
    await setupFooter();
    console.log("\nDone! Footer and legal pages are set up.");
    console.log("Visit http://localhost:3000 to see the footer.");
    console.log("Visit http://localhost:3000/privacy, /terms, /disclaimer for legal pages.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

main();
