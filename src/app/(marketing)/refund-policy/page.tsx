import { Metadata } from "next";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "refund-policy", isActive: true },
    select: { metaTitle: true, metaDescription: true, title: true },
  });

  if (!page) {
    return {
      title: "Refund Policy | Ceremoney",
      description: "Learn about Ceremoney's refund and cancellation policy for wedding planning subscriptions and services.",
    };
  }

  return {
    title: page.metaTitle || `${page.title} | Ceremoney`,
    description: page.metaDescription || "Learn about Ceremoney's refund and cancellation policy.",
  };
}

export default async function RefundPolicyPage() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "refund-policy", isActive: true },
  });

  if (!page) {
    return (
      <div className="bg-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">Legal</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Refund Policy
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Our Refund Policy page is being updated. Please check back soon or contact us at support@ceremoney.com for any questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">Legal</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {page.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {formatDate(page.updatedAt)} (Version {page.version})
            </p>
          </div>

          {/* Content */}
          <div
            className="prose max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/80"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* Footer Note */}
          <div className="mt-12 rounded-lg border border-border bg-muted p-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Questions?</strong> If you have any questions about our refund policy,
              please contact us at{" "}
              <a href="mailto:support@ceremoney.com" className="text-primary hover:underline">
                support@ceremoney.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
