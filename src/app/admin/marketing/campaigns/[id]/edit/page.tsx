"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/ui/rich-text-editor";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/campaigns/${id}`);
        const data = await res.json();
        if (data.success) {
          setSubject(data.data.subject);
          setPreviewText(data.data.previewText || "");
          setBody(data.data.body);
          if (data.data.scheduledAt) {
            setScheduledAt(new Date(data.data.scheduledAt).toISOString().slice(0, 16));
          }
        }
      } catch {
        toast.error("Failed to load campaign");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSave = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          previewText: previewText || undefined,
          body,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Campaign updated");
        router.push(`/admin/marketing/campaigns/${id}`);
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/marketing/campaigns/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Campaign</h1>
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
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
