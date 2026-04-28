import { Metadata } from "next";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "cookies", isActive: true },
    select: { metaTitle: true, metaDescription: true, title: true },
  });

  if (!page) {
    return {
      title: "Cookies Consent | Ceremoney",
      description: "Learn how Ceremoney uses cookies and how you can manage your cookie preferences.",
    };
  }

  return {
    title: page.metaTitle || `${page.title} | Ceremoney`,
    description: page.metaDescription || "Learn how Ceremoney uses cookies and how you can manage your cookie preferences.",
  };
}

function FallbackCookiesContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-900">1. What Are Cookies</h2>
        <p className="text-slate-700">
          Cookies are small text files placed on your device when you visit our website. They help us
          provide a better experience by remembering your preferences and understanding how you use our platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-900">2. Types of Cookies We Use</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-700">
          <li><strong>Essential cookies:</strong> Required for the website to function. Cannot be disabled.</li>
          <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our site.</li>
          <li><strong>Preference cookies:</strong> Remember your settings such as language and region.</li>
          <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-900">3. Managing Your Preferences</h2>
        <p className="text-slate-700">
          You can manage or withdraw your consent at any time by adjusting your browser settings or
          using our cookie preference center. Note that disabling certain cookies may affect the
          functionality of the website.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-900">4. Third-Party Cookies</h2>
        <p className="text-slate-700">
          We may allow third-party services (such as Google Analytics, Stripe) to set cookies on your
          device. These are governed by the respective third parties&apos; privacy policies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-900">5. Contact Us</h2>
        <p className="text-slate-700">
          If you have any questions about our use of cookies, please contact us at{" "}
          <a href="mailto:support@ceremoney.com" className="text-primary hover:underline">
            support@ceremoney.com
          </a>
        </p>
      </section>
    </div>
  );
}

export default async function CookiesConsentPage() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "cookies", isActive: true },
  });

  return (
    <div className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">Legal</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              {page?.title || "Cookies Consent"}
            </h1>
            <p className="mt-4 text-sm text-slate-500">
              Last updated: {page ? formatDate(page.updatedAt) : "April 28, 2026"}
              {page && ` (Version ${page.version})`}
            </p>
          </div>

          {/* Content */}
          {page ? (
            <div
              className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary prose-strong:text-slate-900 prose-li:text-slate-700"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <FallbackCookiesContent />
          )}

          {/* Footer Note */}
          <div className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Your privacy matters:</strong> You can update your
              cookie preferences at any time. For more information, see our{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
