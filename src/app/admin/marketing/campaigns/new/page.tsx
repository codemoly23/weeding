"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/ui/rich-text-editor";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const handleSave = async (asDraft = true) => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          previewText: previewText || undefined,
          body,
          scheduledAt: !asDraft && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(asDraft ? "Campaign saved as draft" : "Campaign scheduled");
        router.push("/admin/marketing/campaigns");
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/marketing/campaigns">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Campaign</h1>
          <p className="text-muted-foreground text-sm">Create a new email campaign</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Big news from LLCPad!"
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previewText">Preview Text (optional)</Label>
                <Input
                  id="previewText"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Shown in inbox preview..."
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Body</Label>
                <RichTextEditor value={body} onChange={setBody} height="350px" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Send Date & Time (optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to save as draft
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Use these in your content:
              </p>
              <div className="space-y-1 text-xs font-mono">
                <div>{"{{firstName}}"} — Subscriber name</div>
                <div>{"{{email}}"} — Subscriber email</div>
                <div>{"{{companyName}}"} — Your company</div>
                <div>{"{{siteUrl}}"} — Website URL</div>
                <div>{"{{unsubscribeUrl}}"} — Unsubscribe link</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button onClick={() => handleSave(true)} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            {scheduledAt && (
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                Schedule Campaign
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
