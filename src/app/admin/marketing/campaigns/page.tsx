"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  subject: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  SENDING: "bg-yellow-100 text-yellow-800",
  SENT: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sendId, setSendId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      if (data.success) setCampaigns(data.data);
    } catch {
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/campaigns/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Campaign deleted");
        fetchCampaigns();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const handleSend = async () => {
    if (!sendId) return;
    try {
      const res = await fetch(`/api/admin/campaigns/${sendId}/send`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Campaign sending started!");
        fetchCampaigns();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to send");
    }
    setSendId(null);
  };

  const rate = (count: number, total: number) =>
    total > 0 ? `${((count / total) * 100).toFixed(1)}%` : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground text-sm">Create and manage email campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCampaigns}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/marketing/campaigns/new">
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Recipients</TableHead>
                <TableHead className="text-center">Open Rate</TableHead>
                <TableHead className="text-center">Click Rate</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No campaigns yet. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {c.subject}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[c.status] || ""} variant="outline">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{c.totalRecipients}</TableCell>
                    <TableCell className="text-center">{rate(c.openCount, c.totalRecipients)}</TableCell>
                    <TableCell className="text-center">{rate(c.clickCount, c.totalRecipients)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.sentAt
                        ? new Date(c.sentAt).toLocaleDateString()
                        : c.scheduledAt
                          ? `Scheduled: ${new Date(c.scheduledAt).toLocaleDateString()}`
                          : new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/marketing/campaigns/${c.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          {(c.status === "DRAFT" || c.status === "SCHEDULED") && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/marketing/campaigns/${c.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSendId(c.id)}>
                                <Send className="mr-2 h-4 w-4" /> Send Now
                              </DropdownMenuItem>
                            </>
                          )}
                          {c.status !== "SENDING" && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(c.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Confirmation */}
      <AlertDialog open={!!sendId} onOpenChange={() => setSendId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the campaign to all matching subscribers immediately. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>Send Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
