"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  Eye,
  UserPlus,
  Filter,
  RefreshCw,
  Loader2,
  Plus,
  Download,
  Flame,
  Thermometer,
  Snowflake,
  Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Lead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  status: string;
  source: string;
  priority: string;
  score: number;
  interestedIn: string[];
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  formInstance: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    activities: number;
    leadNotes: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  overview: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    unassigned: number;
    hotLeads: number;
    averageScore: number;
    conversionRate: number;
  };
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  pipeline: Record<string, number>;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-purple-100 text-purple-700",
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  PROPOSAL: "bg-amber-100 text-amber-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
  UNQUALIFIED: "bg-gray-100 text-gray-700",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-500 text-white",
};

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  GOOGLE_ADS: "Google Ads",
  FACEBOOK_ADS: "Facebook Ads",
  SOCIAL_MEDIA: "Social Media",
  DIRECT: "Direct",
  COLD_OUTREACH: "Cold Outreach",
  OTHER: "Other",
};

function getScoreIcon(score: number) {
  if (score >= 70) return <Flame className="h-4 w-4 text-red-500" />;
  if (score >= 40) return <Thermometer className="h-4 w-4 text-orange-500" />;
  return <Snowflake className="h-4 w-4 text-blue-500" />;
}

function getScoreLabel(score: number) {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Assignment state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Add Lead state
  const [addLeadDialogOpen, setAddLeadDialogOpen] = useState(false);
  const [addingLead, setAddingLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    source: "DIRECT",
    priority: "MEDIUM",
  });

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  // Inline editing state
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingPriority, setUpdatingPriority] = useState<string | null>(null);
  const [updatingScore, setUpdatingScore] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<{ id: string; value: string } | null>(null);

  // Handler for inline status update
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(leadId);
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Update local state
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
      toast.success("Status updated");
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handler for inline priority update
  const handlePriorityChange = async (leadId: string, newPriority: string) => {
    setUpdatingPriority(leadId);
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) throw new Error("Failed to update priority");

      // Update local state
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, priority: newPriority } : lead
        )
      );
      toast.success("Priority updated");
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    } finally {
      setUpdatingPriority(null);
    }
  };

  // Handler for inline score update
  const handleScoreChange = async (leadId: string, newScore: number) => {
    // Find current lead to compare
    const currentLead = leads.find((l) => l.id === leadId);

    // Don't update if score hasn't changed
    if (currentLead && currentLead.score === newScore) {
      setEditingScore(null);
      return;
    }

    // Validate score range
    if (isNaN(newScore) || newScore < 0 || newScore > 100) {
      toast.error("Score must be between 0 and 100");
      setEditingScore(null);
      return;
    }

    setUpdatingScore(leadId);
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: newScore }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update score");
      }

      // Update local state
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, score: newScore } : lead
        )
      );
      toast.success("Score updated");
      setEditingScore(null);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error updating score:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update score");
    } finally {
      setUpdatingScore(null);
    }
  };

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);

      const response = await fetch(`/api/admin/leads?${params}`);
      if (!response.ok) throw new Error("Failed to fetch leads");

      const data = await response.json();
      setLeads(data.leads);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sourceFilter, priorityFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/leads/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  // Fetch team members for assignment
  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const response = await fetch("/api/admin/users?roles=ADMIN,SALES_AGENT,SUPPORT_AGENT");
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    }
    fetchTeamMembers();
  }, []);

  const handleAssign = async (userId: string) => {
    if (!selectedLead || assigning) return;
    try {
      setAssigning(true);
      const response = await fetch(`/api/admin/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: userId }),
      });

      if (!response.ok) throw new Error("Failed to assign lead");

      toast.success("Lead assigned successfully");
      setAssignDialogOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      console.error("Error assigning lead:", error);
      toast.error("Failed to assign lead");
    } finally {
      setAssigning(false);
    }
  };

  const openAssignDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setAssignDialogOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  // Add Lead handler
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addingLead) return;

    try {
      setAddingLead(true);
      const response = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });

      if (!response.ok) throw new Error("Failed to add lead");

      toast.success("Lead added successfully");
      setAddLeadDialogOpen(false);
      setNewLeadForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        source: "DIRECT",
        priority: "MEDIUM",
      });
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Failed to add lead");
    } finally {
      setAddingLead(false);
    }
  };

  // Delete Lead handler
  const handleDeleteLead = async () => {
    if (!leadToDelete || deleting) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/leads/${leadToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete lead");

      toast.success("Lead deleted successfully");
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  // Export handler
  const handleExport = async () => {
    if (exporting) return;

    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/admin/leads/export?${params}`);
      if (!response.ok) throw new Error("Failed to export leads");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Leads exported successfully");
    } catch (error) {
      console.error("Error exporting leads:", error);
      toast.error("Failed to export leads");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { fetchLeads(); fetchStats(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
          <Button onClick={() => setAddLeadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Leads</CardDescription>
              <CardTitle className="text-3xl">{stats.overview.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                +{stats.overview.today} today, +{stats.overview.thisWeek} this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Hot Leads</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Flame className="h-6 w-6 text-red-500" />
                {stats.overview.hotLeads}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Score 70+ ready to convert
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unassigned</CardDescription>
              <CardTitle className="text-3xl">{stats.overview.unassigned}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Needs attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Conversion Rate</CardDescription>
              <CardTitle className="text-3xl">{stats.overview.conversionRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Avg. score: {stats.overview.averageScore}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="PROPOSAL">Proposal</SelectItem>
                <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                <SelectItem value="WON">Won</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
                <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="WEBSITE">Website</SelectItem>
                <SelectItem value="REFERRAL">Referral</SelectItem>
                <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                <SelectItem value="FACEBOOK_ADS">Facebook Ads</SelectItem>
                <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                <SelectItem value="DIRECT">Direct</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Assign Lead Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lead</DialogTitle>
            <DialogDescription>
              {selectedLead && (
                <>Assign {selectedLead.firstName} {selectedLead.lastName} to a team member</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {teamMembers.map((member) => (
              <Button
                key={member.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAssign(member.id)}
                disabled={assigning}
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-xs">
                    {member.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                {member.name || member.email}
                {assigning && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
              </Button>
            ))}
            {teamMembers.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No team members available
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={addLeadDialogOpen} onOpenChange={setAddLeadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Manually add a new lead to your pipeline
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLead} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newLeadForm.firstName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newLeadForm.lastName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newLeadForm.email}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newLeadForm.phone}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={newLeadForm.company}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={newLeadForm.source}
                  onValueChange={(v) => setNewLeadForm({ ...newLeadForm, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBSITE">Website</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                    <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                    <SelectItem value="FACEBOOK_ADS">Facebook Ads</SelectItem>
                    <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                    <SelectItem value="DIRECT">Direct</SelectItem>
                    <SelectItem value="COLD_OUTREACH">Cold Outreach</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newLeadForm.priority}
                  onValueChange={(v) => setNewLeadForm({ ...newLeadForm, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddLeadDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addingLead}>
                {addingLead && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Lead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {leadToDelete?.firstName} {leadToDelete?.lastName}?
              This action cannot be undone. All associated activities and notes will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead List</CardTitle>
          <CardDescription>
            Showing {leads.length} of {total} leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No leads found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Interested In</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Link href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {lead.firstName[0]}
                              {lead.lastName?.[0] || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-primary hover:underline">
                              {lead.firstName} {lead.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {lead.email}
                            </div>
                            {lead.company && (
                              <div className="text-xs text-muted-foreground">
                                {lead.company}
                              </div>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={statusColors[lead.status]}>
                            {lead.status}
                          </Badge>
                          <Select
                            value={lead.priority}
                            onValueChange={(value) => handlePriorityChange(lead.id, value)}
                            disabled={updatingPriority === lead.id}
                          >
                            <SelectTrigger className={`h-6 w-[100px] text-xs ${priorityColors[lead.priority]}`}>
                              {updatingPriority === lead.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getScoreIcon(lead.score)}
                          {editingScore?.id === lead.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={editingScore.value}
                                onChange={(e) => setEditingScore({ id: lead.id, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleScoreChange(lead.id, parseInt(editingScore.value) || 0);
                                  } else if (e.key === "Escape") {
                                    setEditingScore(null);
                                  }
                                }}
                                onBlur={() => {
                                  if (updatingScore !== lead.id) {
                                    handleScoreChange(lead.id, parseInt(editingScore.value) || 0);
                                  }
                                }}
                                className="h-7 w-16 text-sm"
                                autoFocus
                                disabled={updatingScore === lead.id}
                              />
                              {updatingScore === lead.id && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-muted px-2 py-1 rounded transition-colors"
                              onClick={() => setEditingScore({ id: lead.id, value: lead.score.toString() })}
                              title="Click to edit score"
                            >
                              <div className="font-medium">{lead.score}</div>
                              <div className="text-xs text-muted-foreground">
                                {getScoreLabel(lead.score)}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {sourceLabels[lead.source] || lead.source}
                        </div>
                        {lead.formInstance && (
                          <div className="text-xs text-muted-foreground">
                            {lead.formInstance.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.interestedIn.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {lead.interestedIn.slice(0, 2).map((service) => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {lead.interestedIn.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{lead.interestedIn.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {lead.assignedTo.name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {lead.assignedTo.name || lead.assignedTo.email}
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground"
                            onClick={() => openAssignDialog(lead)}
                          >
                            <UserPlus className="mr-1 h-3 w-3" />
                            Assign
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/leads/${lead.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAssignDialog(lead)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign Lead
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openDeleteDialog(lead)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
