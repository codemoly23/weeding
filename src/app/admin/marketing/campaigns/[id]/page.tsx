"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Loader2,
  Send,
  Pencil,
  Mail,
  Eye,
  MousePointerClick,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface Recipient {
  id: string;
  email: string;
  firstName: string | null;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  openCount: number;
  clickedAt: string | null;
  clickCount: number;
}

interface Campaign {
  id: string;
  subject: string;
  previewText: string | null;
  body: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  recipients: Recipient[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  SENDING: "bg-yellow-100 text-yellow-800",
  SENT: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewEmail, setPreviewEmail] = useState("");
  const [sendingPreview, setSendingPreview] = useState(false);

  const fetchCampaign = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`);
      const data = await res.json();
      if (data.success) setCampaign(data.data);
    } catch {
      toast.error("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCampaign(); }, [fetchCampaign]);

  const handleSendPreview = async () => {
    if (!previewEmail) return;
    setSendingPreview(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: previewEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to send preview");
    } finally {
      setSendingPreview(false);
    }
  };

  const handleSend = async () => {
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/send`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Campaign sending started!");
        fetchCampaign();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to send");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return <p className="text-center py-20 text-muted-foreground">Campaign not found</p>;
  }

  const rate = (count: number, total: number) =>
    total > 0 ? `${((count / total) * 100).toFixed(1)}%` : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/marketing/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{campaign.subject}</h1>
            <Badge className={statusColors[campaign.status] || ""} variant="outline">
              {campaign.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/marketing/campaigns/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button size="sm" onClick={handleSend}>
                <Send className="mr-2 h-4 w-4" /> Send Now
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.totalRecipients}</div>
            <p className="text-xs text-muted-foreground">{campaign.sentCount} sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rate(campaign.sentCount, campaign.totalRecipients)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rate(campaign.openCount, campaign.totalRecipients)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rate(campaign.clickCount, campaign.totalRecipients)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Email */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="test@example.com"
              value={previewEmail}
              onChange={(e) => setPreviewEmail(e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={handleSendPreview}
              disabled={!previewEmail || sendingPreview}
            >
              {sendingPreview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recipients Table */}
      {campaign.recipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Opens</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign.recipients.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.email}</TableCell>
                    <TableCell>{r.firstName || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={r.status === "SENT" ? "default" : r.status === "FAILED" ? "destructive" : "secondary"}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{r.openCount}</TableCell>
                    <TableCell className="text-center">{r.clickCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.sentAt ? new Date(r.sentAt).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
