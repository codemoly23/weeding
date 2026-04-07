"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Search,
  Edit,
  Trash2,
  Star,
  DollarSign,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface StateFee {
  id: string;
  stateCode: string;
  stateName: string;
  llcFee: number;
  annualFee: number | null;
  processingTime: string | null;
  isPopular: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  content: string | null;
}

const defaultStateFee: Omit<StateFee, "id"> = {
  stateCode: "",
  stateName: "",
  llcFee: 0,
  annualFee: null,
  processingTime: "",
  isPopular: false,
  metaTitle: null,
  metaDescription: null,
  content: null,
};

export default function StateFeesPage() {
  const [stateFees, setStateFees] = useState<StateFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<StateFee | null>(null);
  const [formData, setFormData] = useState<Omit<StateFee, "id">>(defaultStateFee);

  const fetchStateFees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/state-fees");
      const data = await response.json();

      if (response.ok) {
        setStateFees(data.stateFees);
      } else {
        toast.error("Failed to load state fees");
      }
    } catch (error) {
      console.error("Error fetching state fees:", error);
      toast.error("Failed to load state fees");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStateFees();
  }, [fetchStateFees]);

  // Open dialog for new/edit
  const openDialog = (fee?: StateFee) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        stateCode: fee.stateCode,
        stateName: fee.stateName,
        llcFee: fee.llcFee,
        annualFee: fee.annualFee,
        processingTime: fee.processingTime || "",
        isPopular: fee.isPopular,
        metaTitle: fee.metaTitle,
        metaDescription: fee.metaDescription,
        content: fee.content,
      });
    } else {
      setEditingFee(null);
      setFormData(defaultStateFee);
    }
    setDialogOpen(true);
  };

  // Save state fee
  const saveFee = async () => {
    if (!formData.stateCode.trim() || !formData.stateName.trim()) {
      toast.error("State code and name are required");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingFee
        ? `/api/admin/state-fees/${editingFee.id}`
        : "/api/admin/state-fees";
      const method = editingFee ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingFee ? "State fee updated" : "State fee created");
        setDialogOpen(false);
        fetchStateFees();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save state fee");
      }
    } catch (error) {
      console.error("Error saving state fee:", error);
      toast.error("Failed to save state fee");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete state fee
  const deleteFee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this state fee?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/state-fees/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("State fee deleted");
        fetchStateFees();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete state fee");
      }
    } catch (error) {
      console.error("Error deleting state fee:", error);
      toast.error("Failed to delete state fee");
    }
  };

  // Filter state fees
  const filteredFees = stateFees.filter(
    (fee) =>
      fee.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.stateCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/settings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">State Fees</h1>
            <p className="text-muted-foreground">
              Manage location-based fees and filing costs
            </p>
          </div>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add State
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total States</CardDescription>
            <CardTitle className="text-3xl">{stateFees.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Popular States</CardDescription>
            <CardTitle className="text-3xl">
              {stateFees.filter((f) => f.isPopular).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. LLC Fee</CardDescription>
            <CardTitle className="text-3xl">
              $
              {stateFees.length > 0
                ? Math.round(
                    stateFees.reduce((sum, f) => sum + f.llcFee, 0) /
                      stateFees.length
                  )
                : 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search states..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>State</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>LLC Fee</TableHead>
                <TableHead>Annual Fee</TableHead>
                <TableHead>Processing</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No state fees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.stateName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{fee.stateCode}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {fee.llcFee}
                      </div>
                    </TableCell>
                    <TableCell>
                      {fee.annualFee ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {fee.annualFee}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {fee.processingTime ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {fee.processingTime}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {fee.isPopular && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(fee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteFee(fee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFee ? "Edit State Fee" : "Add State Fee"}
            </DialogTitle>
            <DialogDescription>
              Configure the filing or location fee for this entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>State Code *</Label>
                <Input
                  value={formData.stateCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stateCode: e.target.value.toUpperCase().slice(0, 2),
                    })
                  }
                  placeholder="e.g., WY"
                  maxLength={2}
                  disabled={!!editingFee}
                />
              </div>
              <div className="space-y-2">
                <Label>State Name *</Label>
                <Input
                  value={formData.stateName}
                  onChange={(e) =>
                    setFormData({ ...formData, stateName: e.target.value })
                  }
                  placeholder="e.g., Wyoming"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>LLC Filing Fee ($) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.llcFee}
                  onChange={(e) =>
                    setFormData({ ...formData, llcFee: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Annual Fee ($)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.annualFee || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      annualFee: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Processing Time</Label>
              <Input
                value={formData.processingTime || ""}
                onChange={(e) =>
                  setFormData({ ...formData, processingTime: e.target.value })
                }
                placeholder="e.g., 3-5 business days"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Popular State</Label>
                <p className="text-xs text-muted-foreground">
                  Show in quick selection
                </p>
              </div>
              <Switch
                checked={formData.isPopular}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, isPopular: v })
                }
              />
            </div>

            {/* SEO Section */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">SEO Settings (Optional)</h4>
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={formData.metaTitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="SEO title for state page"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={formData.metaDescription || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  placeholder="SEO description"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveFee} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingFee ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
