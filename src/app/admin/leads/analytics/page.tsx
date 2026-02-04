"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Flame,
  BarChart3,
  PieChart,
  ArrowRight,
  List,
  LayoutGrid,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

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

interface RecentLead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  status: string;
  score: number;
  createdAt: string;
}

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

const statusLabels: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
  UNQUALIFIED: "Unqualified",
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500",
  CONTACTED: "bg-purple-500",
  QUALIFIED: "bg-emerald-500",
  PROPOSAL: "bg-amber-500",
  NEGOTIATION: "bg-orange-500",
  WON: "bg-green-500",
  LOST: "bg-red-500",
  UNQUALIFIED: "bg-gray-500",
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, leadsRes] = await Promise.all([
        fetch("/api/admin/leads/stats"),
        fetch("/api/admin/leads?limit=10&sortBy=createdAt&sortOrder=desc"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setRecentLeads(leadsData.leads);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalBySource = stats ? Object.values(stats.bySource).reduce((a, b) => a + b, 0) : 0;
  const totalByStatus = stats ? Object.values(stats.byStatus).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze your lead performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/leads">
              <List className="mr-2 h-4 w-4" />
              List View
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/leads/pipeline">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Pipeline
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.total}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{stats.overview.thisMonth}</span> this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                <Flame className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.hotLeads}</div>
                <p className="text-xs text-muted-foreground">
                  Score 70+ ready to convert
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.byStatus.WON || 0} won leads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.averageScore}</div>
                <p className="text-xs text-muted-foreground">
                  Across all leads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Lead Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Pipeline Distribution
                </CardTitle>
                <CardDescription>
                  Leads by current status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                        <span>{statusLabels[status] || status}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                    <Progress
                      value={totalByStatus > 0 ? (count / totalByStatus) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lead Source Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Lead Sources
                </CardTitle>
                <CardDescription>
                  Where your leads come from
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.bySource)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => (
                    <div key={source} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{sourceLabels[source] || source}</span>
                        <span className="font-medium">
                          {count} ({totalBySource > 0 ? Math.round((count / totalBySource) * 100) : 0}%)
                        </span>
                      </div>
                      <Progress
                        value={totalBySource > 0 ? (count / totalBySource) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>
                Lead journey through the pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                {["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON"].map((status, idx) => {
                  const count = stats.byStatus[status] || 0;
                  const prevCount = idx > 0 ? stats.byStatus[["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON"][idx - 1]] || 0 : count;
                  const conversionRate = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;

                  return (
                    <div key={status} className="flex items-center">
                      <div className="text-center min-w-[100px]">
                        <div className={`mx-auto w-12 h-12 rounded-full ${statusColors[status]} flex items-center justify-center text-white font-bold`}>
                          {count}
                        </div>
                        <div className="mt-2 text-xs font-medium">
                          {statusLabels[status]}
                        </div>
                        {idx > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {conversionRate}%
                          </div>
                        )}
                      </div>
                      {idx < 5 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>
                Latest leads added to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[lead.status]} text-white`}>
                          {statusLabels[lead.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.score}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/leads/${lead.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
