"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Eye,
  UserPlus,
  Flame,
  Thermometer,
  Snowflake,
  LayoutGrid,
  List,
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Lead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  priority: string;
  score: number;
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  createdAt: string;
}

const PIPELINE_STAGES = [
  { key: "NEW", label: "New", color: "bg-blue-500" },
  { key: "CONTACTED", label: "Contacted", color: "bg-purple-500" },
  { key: "QUALIFIED", label: "Qualified", color: "bg-emerald-500" },
  { key: "PROPOSAL", label: "Proposal", color: "bg-amber-500" },
  { key: "NEGOTIATION", label: "Negotiation", color: "bg-orange-500" },
  { key: "WON", label: "Won", color: "bg-green-500" },
  { key: "LOST", label: "Lost", color: "bg-red-500" },
  { key: "UNQUALIFIED", label: "Unqualified", color: "bg-gray-500" },
];

const priorityColors: Record<string, string> = {
  LOW: "border-gray-300",
  MEDIUM: "border-blue-300",
  HIGH: "border-orange-300",
  URGENT: "border-red-500",
};

function getScoreIcon(score: number) {
  if (score >= 70) return <Flame className="h-3 w-3 text-red-500" />;
  if (score >= 40) return <Thermometer className="h-3 w-3 text-orange-500" />;
  return <Snowflake className="h-3 w-3 text-blue-500" />;
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/leads?limit=500");
      if (!response.ok) throw new Error("Failed to fetch leads");
      const data = await response.json();
      setLeads(data.leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead) => lead.status === status);
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedLead || draggedLead.status === newStatus) {
      setDraggedLead(null);
      return;
    }

    const leadId = draggedLead.id;
    const oldStatus = draggedLead.status;

    // Optimistic update
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
    setDraggedLead(null);
    setUpdating(leadId);

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(`Lead moved to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert on error
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: oldStatus } : lead
        )
      );
      toast.error("Failed to update lead status");
    } finally {
      setUpdating(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground">
            Drag and drop leads between stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/leads">
              <List className="mr-2 h-4 w-4" />
              List View
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchLeads}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Pipeline Board */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = getLeadsByStatus(stage.key);
            return (
              <div
                key={stage.key}
                className="w-[300px] flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <CardTitle className="text-sm font-medium">
                          {stage.label}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary">{stageLeads.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 min-h-[500px]">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onDragEnd={handleDragEnd}
                        className={`
                          p-3 rounded-lg border-2 bg-card cursor-grab active:cursor-grabbing
                          transition-all hover:shadow-md
                          ${priorityColors[lead.priority] || "border-gray-200"}
                          ${draggedLead?.id === lead.id ? "opacity-50" : ""}
                          ${updating === lead.id ? "opacity-70" : ""}
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="text-xs">
                                {lead.firstName[0]}
                                {lead.lastName?.[0] || ""}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">
                                {lead.firstName} {lead.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {lead.email}
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/leads/${lead.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {getScoreIcon(lead.score)}
                            <span className="text-xs font-medium">{lead.score}</span>
                          </div>
                          {lead.company && (
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {lead.company}
                            </span>
                          )}
                        </div>

                        {lead.assignedTo && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <UserPlus className="h-3 w-3" />
                            <span className="truncate">
                              {lead.assignedTo.name || lead.assignedTo.email}
                            </span>
                          </div>
                        )}

                        {updating === lead.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        )}
                      </div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                        Drop leads here
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
