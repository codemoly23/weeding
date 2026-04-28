import prisma from "../src/lib/db";

async function main() {
  const existing = await prisma.legalPage.findUnique({ where: { slug: "cookies" } });
  if (existing) {
    console.log("✓ cookies record already exists");
    return;
  }

  await prisma.legalPage.create({
    data: {
      slug: "cookies",
      title: "Cookies Consent",
      isActive: true,
      version: 1,
      metaTitle: "Cookies Consent | Ceremoney",
      metaDescription: "Learn how Ceremoney uses cookies and how you can manage your cookie preferences.",
      content: `<h2>1. What Are Cookies</h2>
<p>Cookies are small text files placed on your device when you visit our website. They help us provide a better experience by remembering your preferences and understanding how you use our platform.</p>

<h2>2. Types of Cookies We Use</h2>
<ul>
  <li><strong>Essential cookies:</strong> Required for the website to function. Cannot be disabled.</li>
  <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our site.</li>
  <li><strong>Preference cookies:</strong> Remember your settings such as language and region.</li>
  <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements.</li>
</ul>

<h2>3. Managing Your Preferences</h2>
<p>You can manage or withdraw your consent at any time by adjusting your browser settings or using our cookie preference center. Note that disabling certain cookies may affect the functionality of the website.</p>

<h2>4. Third-Party Cookies</h2>
<p>We may allow third-party services (such as Google Analytics, Stripe) to set cookies on your device. These are governed by the respective third parties' privacy policies.</p>

<h2>5. Contact Us</h2>
<p>If you have any questions about our use of cookies, please contact us at <a href="mailto:support@ceremoney.com">support@ceremoney.com</a></p>`,
    },
  });

  console.log("✓ cookies legalPage record created");
  console.log("✅ Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
