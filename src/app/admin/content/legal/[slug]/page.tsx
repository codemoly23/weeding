"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { SunEditorWrapper } from "@/components/editor/sun-editor";

// Default content templates for legal pages
const pageTemplates: Record<string, { title: string; content: string; metaDescription: string }> = {
  terms: {
    title: "Terms of Service",
    metaDescription: "Terms and conditions for using Ceremoney services. Read our terms of service before using our wedding and event planning services.",
    content: `<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Ceremoney's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

<h2>2. Services Description</h2>
<p>Ceremoney provides wedding and event planning services, including but not limited to:</p>
<ul>
<li>Wedding and event planning</li>
<li>Vendor marketplace and booking</li>
<li>Event project management tools</li>
<li>Budget and guest management</li>
<li>Event coordination support</li>
</ul>

<h2>3. Not a Legal or Financial Advisor</h2>
<p><strong>Important:</strong> Ceremoney is an event planning platform, NOT a legal or financial advisor. We do not provide legal or financial advice. The information provided through our services is for general informational purposes only. For legal or financial matters, please consult with a licensed professional in your jurisdiction.</p>

<h2>4. User Responsibilities</h2>
<p>You are responsible for:</p>
<ul>
<li>Providing accurate and complete information</li>
<li>Maintaining the confidentiality of your account</li>
<li>Complying with all applicable laws and regulations</li>
<li>Honoring agreements made with vendors through our platform</li>
</ul>

<h2>5. Payment Terms</h2>
<p>All fees are due at the time of order placement. Prices are subject to change without notice. Vendor fees are determined by each vendor and are subject to change.</p>

<h2>6. Refund Policy</h2>
<p>Please refer to our <a href="/refund-policy">Refund Policy</a> for information about refunds and cancellations.</p>

<h2>7. Limitation of Liability</h2>
<p>Ceremoney's liability is limited to the amount paid for services. We are not liable for any indirect, incidental, or consequential damages.</p>

<h2>8. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>

<h2>9. Contact Information</h2>
<p>For questions about these Terms of Service, please contact us at support@ceremoney.com</p>`,
  },
  privacy: {
    title: "Privacy Policy",
    metaDescription: "Ceremoney Privacy Policy - Learn how we collect, use, and protect your personal information when using our wedding and event planning services.",
    content: `<h2>1. Information We Collect</h2>
<p>We collect information that you provide directly to us, including:</p>
<ul>
<li><strong>Personal Information:</strong> Name, email address, phone number, mailing address</li>
<li><strong>Event Information:</strong> Event name, date, venue, guest details</li>
<li><strong>Payment Information:</strong> Credit card details, billing address</li>
<li><strong>Preferences:</strong> Vendor preferences, style preferences, and event requirements</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Process your bookings and coordinate your events</li>
<li>Communicate with you about your events and vendors</li>
<li>Send important updates and event reminders</li>
<li>Improve our services and customer experience</li>
<li>Comply with legal obligations</li>
</ul>

<h2>3. Information Sharing</h2>
<p>We may share your information with:</p>
<ul>
<li><strong>Vendors:</strong> Required to coordinate your event services</li>
<li><strong>Service Providers:</strong> Who assist in providing our platform services</li>
<li><strong>Legal Requirements:</strong> When required by law</li>
</ul>
<p>We do NOT sell your personal information to third parties.</p>

<h2>4. Data Security</h2>
<p>We implement appropriate security measures to protect your personal information, including:</p>
<ul>
<li>SSL encryption for all data transmission</li>
<li>Secure data storage with access controls</li>
<li>Regular security audits and updates</li>
</ul>

<h2>5. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal information</li>
<li>Request correction of inaccurate data</li>
<li>Request deletion of your data (subject to legal requirements)</li>
<li>Opt-out of marketing communications</li>
</ul>

<h2>6. Cookies</h2>
<p>We use cookies to improve your browsing experience and analyze site traffic. You can control cookies through your browser settings.</p>

<h2>7. International Users</h2>
<p>If you are accessing our services from outside the United States, please be aware that your information will be transferred to and processed in the United States.</p>

<h2>8. Contact Us</h2>
<p>For privacy-related inquiries, please contact us at privacy@ceremoney.com</p>`,
  },
  "refund-policy": {
    title: "Refund Policy",
    metaDescription: "Ceremoney Refund Policy - Learn about our refund and cancellation policy for wedding and event planning services.",
    content: `<h2>Our Commitment</h2>
<p>At Ceremoney, we strive to provide excellent service. We understand that circumstances may change, and we've created this refund policy to be fair to our customers.</p>

<h2>Before Service Begins</h2>
<p>If your event services have NOT yet commenced:</p>
<ul>
<li><strong>Full refund</strong> of Ceremoney platform fees</li>
<li>Simply contact us to cancel your booking</li>
<li>Refunds processed within 5-7 business days</li>
</ul>

<h2>After Service Begins</h2>
<p>If your event services HAVE commenced or vendors have been engaged:</p>
<ul>
<li><strong>Vendor deposits may be non-refundable</strong> per individual vendor policies</li>
<li>Ceremoney platform fees may be partially refunded on a case-by-case basis</li>
<li>We cannot reverse confirmed vendor bookings on your behalf</li>
</ul>

<h2>Non-Refundable Items</h2>
<p>The following are generally non-refundable:</p>
<ul>
<li>Vendor deposits and booking fees (subject to vendor policies)</li>
<li>Expedited or rush service fees once service has begun</li>
<li>Third-party fees paid to vendors or venues</li>
</ul>

<h2>How to Request a Refund</h2>
<ol>
<li>Contact our support team at support@ceremoney.com</li>
<li>Provide your order number</li>
<li>Explain the reason for your refund request</li>
<li>Our team will review and respond within 48 hours</li>
</ol>

<h2>Processing Time</h2>
<p>Approved refunds are processed within 5-7 business days. The time for the refund to appear in your account depends on your payment method and financial institution.</p>

<h2>Questions?</h2>
<p>If you have any questions about our refund policy, please contact us at support@ceremoney.com</p>`,
  },
  disclaimer: {
    title: "Disclaimer",
    metaDescription: "Legal disclaimers for Ceremoney services. Important information about our wedding and event planning services.",
    content: `<h2>Not a Legal or Financial Advisor</h2>
<p><strong>Ceremoney is NOT a law firm or financial advisor and does not provide legal or financial advice.</strong> We are a wedding and event planning platform. The information provided on this website and through our services is for general informational purposes only.</p>

<h2>No Professional Relationship</h2>
<p>Use of our services does not create an attorney-client or advisor-client relationship. For legal or financial advice, please consult with a licensed professional in your jurisdiction who can provide advice tailored to your specific situation.</p>

<h2>Accuracy of Information</h2>
<p>While we strive to provide accurate and up-to-date information, we make no representations or warranties about:</p>
<ul>
<li>The completeness or accuracy of information on this website</li>
<li>The suitability of our services for your specific needs</li>
<li>The outcomes of any event planning or vendor engagement</li>
</ul>

<h2>Third-Party Vendors</h2>
<p>We work with various third-party vendors and service providers. We are not responsible for:</p>
<ul>
<li>Delays or issues caused by vendors</li>
<li>Changes in vendor pricing or availability</li>
<li>Actions or inactions of third-party service providers</li>
</ul>

<h2>Event Planning Decisions</h2>
<p>Decisions about your event, including venue, vendors, and budget, are important and should be made after careful consideration and, where appropriate, consultation with relevant professionals.</p>

<h2>No Tax or Legal Advice</h2>
<p>We do not provide tax or legal advice. Please consult with a qualified professional for advice on matters related to your event contracts and finances.</p>

<h2>Limitation of Liability</h2>
<p>To the maximum extent permitted by law, Ceremoney shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this disclaimer, please contact us at legal@ceremoney.com</p>`,
  },
};

interface LegalPageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  version: number;
  updatedAt: string;
}

export default function LegalPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = resolvedParams.slug === "new";
  const presetSlug = searchParams.get("slug");

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    slug: presetSlug || "",
    title: "",
    content: "",
    isActive: true,
    metaTitle: "",
    metaDescription: "",
  });

  // Load template if creating new page with preset slug
  useEffect(() => {
    if (isNew && presetSlug && pageTemplates[presetSlug]) {
      const template = pageTemplates[presetSlug];
      setFormData({
        slug: presetSlug,
        title: template.title,
        content: template.content,
        isActive: true,
        metaTitle: template.title + " | Ceremoney",
        metaDescription: template.metaDescription,
      });
    }
  }, [isNew, presetSlug]);

  useEffect(() => {
    if (!isNew) {
      fetchPage();
    }
  }, [isNew, resolvedParams.slug]);

  async function fetchPage() {
    try {
      const res = await fetch(`/api/admin/legal-pages/${resolvedParams.slug}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: LegalPageData = await res.json();
      setFormData({
        slug: data.slug,
        title: data.title,
        content: data.content,
        isActive: data.isActive,
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
      });
    } catch (error) {
      toast.error("Failed to load page");
      router.push("/admin/content/legal");
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleTitleChange(title: string) {
    setFormData({
      ...formData,
      title,
      slug: isNew && !presetSlug ? generateSlug(title) : formData.slug,
      metaTitle: isNew ? title + " | Ceremoney" : formData.metaTitle,
    });
  }

  async function handleSave() {
    if (!formData.slug || !formData.title || !formData.content) {
      toast.error("Slug, title, and content are required");
      return;
    }

    setSaving(true);
    try {
      const url = isNew
        ? "/api/admin/legal-pages"
        : `/api/admin/legal-pages/${resolvedParams.slug}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success(isNew ? "Page created" : "Page updated");
      router.push("/admin/content/legal");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save page";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/legal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? "Create Legal Page" : "Edit Legal Page"}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? "Create a new legal page with rich content"
                : `Editing: ${formData.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Link href={`/${formData.slug}`} target="_blank">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </Link>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Page
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Content</CardTitle>
              <CardDescription>
                Use the rich text editor to create your legal page content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Terms of Service"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="terms-of-service"
                    disabled={!isNew}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be the URL path for your page
                </p>
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <div className="min-h-[500px] border rounded-md">
                  <SunEditorWrapper
                    value={formData.content}
                    onChange={(content) =>
                      setFormData({ ...formData, content })
                    }
                    height="500px"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this page visible to users
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
              <Badge variant={formData.isActive ? "default" : "secondary"}>
                {formData.isActive ? "Active" : "Hidden"}
              </Badge>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="Page title for search engines"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  placeholder="Brief description for search results"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          {isNew && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
                <CardDescription>
                  Load a pre-built template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(pageTemplates).map(([slug, template]) => (
                  <Button
                    key={slug}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setFormData({
                        slug,
                        title: template.title,
                        content: template.content,
                        isActive: true,
                        metaTitle: template.title + " | Ceremoney",
                        metaDescription: template.metaDescription,
                      });
                      toast.success(`Loaded ${template.title} template`);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {template.title}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
