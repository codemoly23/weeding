"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Merge, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DuplicateLead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  source: string;
  score: number;
  createdAt: string;
  lastActivityAt: string;
  assignedTo: { id: string; name: string | null; email: string } | null;
  _count: { activities: number; leadNotes: number };
}

interface DuplicateGroup {
  email: string;
  count: number;
  leads: DuplicateLead[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    CONTACTED: "bg-yellow-100 text-yellow-800",
    QUALIFIED: "bg-green-100 text-green-800",
    PROPOSAL: "bg-purple-100 text-purple-800",
    NEGOTIATION: "bg-orange-100 text-orange-800",
    WON: "bg-emerald-100 text-emerald-800",
    LOST: "bg-red-100 text-red-800",
    UNQUALIFIED: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export default function DuplicatesPage() {
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrimary, setSelectedPrimary] = useState<Record<string, string>>({});
  const [merging, setMerging] = useState<string | null>(null);
  const [confirmMerge, setConfirmMerge] = useState<string | null>(null);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  async function fetchDuplicates() {
    try {
      const response = await fetch("/api/admin/leads/duplicates");
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);

        // Auto-select highest-score lead as primary for each group
        const defaults: Record<string, string> = {};
        data.groups.forEach((group: DuplicateGroup) => {
          const bestLead = group.leads.reduce((a: DuplicateLead, b: DuplicateLead) =>
            b.score > a.score ? b : a
          );
          defaults[group.email] = bestLead.id;
        });
        setSelectedPrimary(defaults);
      }
    } catch (error) {
      console.error("Error fetching duplicates:", error);
      toast.error("Failed to load duplicates");
    } finally {
      setLoading(false);
    }
  }

  async function handleMerge(email: string) {
    const primaryId = selectedPrimary[email];
    const group = groups.find((g) => g.email === email);
    if (!primaryId || !group) return;

    const secondaryIds = group.leads
      .filter((l) => l.id !== primaryId)
      .map((l) => l.id);

    setMerging(email);
    try {
      const response = await fetch("/api/admin/leads/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryId, secondaryIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to merge");
      }

      toast.success(`Merged ${secondaryIds.length} duplicate(s) successfully`);
      // Remove merged group from list
      setGroups((prev) => prev.filter((g) => g.email !== email));
    } catch (error) {
      console.error("Error merging leads:", error);
      toast.error(error instanceof Error ? error.message : "Failed to merge leads");
    } finally {
      setMerging(null);
      setConfirmMerge(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/leads">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Duplicate Leads</h1>
          <p className="text-muted-foreground">
            {groups.length === 0
              ? "No duplicate leads found"
              : `Found ${groups.length} group(s) of duplicate leads`}
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              All leads have unique email addresses. No duplicates to resolve.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.email}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{group.email}</CardTitle>
                    <CardDescription>
                      {group.count} duplicate records found
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setConfirmMerge(group.email)}
                    disabled={merging === group.email}
                  >
                    {merging === group.email ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Merge className="mr-2 h-4 w-4" />
                    )}
                    Merge
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPrimary[group.email] || ""}
                  onValueChange={(value) =>
                    setSelectedPrimary((prev) => ({ ...prev, [group.email]: value }))
                  }
                  className="space-y-3"
                >
                  {group.leads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        selectedPrimary[group.email] === lead.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={lead.id} id={lead.id} className="mt-1" />
                      <Label htmlFor={lead.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {lead.firstName} {lead.lastName || ""}
                            </span>
                            <Badge variant="outline" className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                            <Badge variant="secondary">Score: {lead.score}</Badge>
                          </div>
                          {selectedPrimary[group.email] === lead.id && (
                            <Badge className="bg-primary text-primary-foreground">Primary</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground mt-2">
                          <div>
                            <span className="font-medium">Phone:</span>{" "}
                            {lead.phone || "—"}
                          </div>
                          <div>
                            <span className="font-medium">Company:</span>{" "}
                            {lead.company || "—"}
                          </div>
                          <div>
                            <span className="font-medium">Source:</span>{" "}
                            {lead.source.replace("_", " ")}
                          </div>
                          <div>
                            <span className="font-medium">Assigned:</span>{" "}
                            {lead.assignedTo?.name || "—"}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>{" "}
                            {formatDate(lead.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium">Last Activity:</span>{" "}
                            {formatDate(lead.lastActivityAt)}
                          </div>
                          <div>
                            <span className="font-medium">Activities:</span>{" "}
                            {lead._count.activities}
                          </div>
                          <div>
                            <span className="font-medium">Notes:</span>{" "}
                            {lead._count.leadNotes}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-3">
                  Select the primary record to keep. All activities, notes, and data from other records will be merged into it.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Merge Confirmation Dialog */}
      <AlertDialog open={!!confirmMerge} onOpenChange={() => setConfirmMerge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Merge
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will merge all duplicate records for{" "}
              <strong>{confirmMerge}</strong> into the selected primary record.
              Activities and notes will be transferred. Secondary records will be
              permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmMerge && handleMerge(confirmMerge)}
            >
              Merge Records
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
