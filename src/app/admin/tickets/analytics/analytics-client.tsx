"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface AnalyticsDashboardClientProps {
  pluginName?: string;
  tier?: string | null;
  features: string[];
  hasAnalyticsFeature: boolean;
}

interface AnalyticsData {
  overview: {
    totalTickets: number;
    ticketsChange: number;
    avgResponseTime: number;
    responseTimeChange: number;
    avgResolutionTime: number;
    resolutionTimeChange: number;
    satisfactionScore: number;
    satisfactionChange: number;
  };
  ticketsByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  ticketsByPriority: {
    priority: string;
    count: number;
    percentage: number;
  }[];
  ticketsTrend: {
    date: string;
    created: number;
    resolved: number;
  }[];
  topAgents: {
    name: string;
    ticketsResolved: number;
    avgResponseTime: number;
    satisfaction: number;
  }[];
  topCategories: {
    category: string;
    count: number;
    avgResolutionTime: number;
  }[];
}

// Mock analytics data
const mockAnalytics: AnalyticsData = {
  overview: {
    totalTickets: 248,
    ticketsChange: 12.5,
    avgResponseTime: 2.4,
    responseTimeChange: -18,
    avgResolutionTime: 8.2,
    resolutionTimeChange: -5,
    satisfactionScore: 94,
    satisfactionChange: 2,
  },
  ticketsByStatus: [
    { status: "Open", count: 24, percentage: 30 },
    { status: "In Progress", count: 18, percentage: 23 },
    { status: "Waiting Customer", count: 12, percentage: 15 },
    { status: "Resolved", count: 20, percentage: 25 },
    { status: "Closed", count: 6, percentage: 7 },
  ],
  ticketsByPriority: [
    { priority: "Urgent", count: 8, percentage: 10 },
    { priority: "High", count: 20, percentage: 25 },
    { priority: "Medium", count: 38, percentage: 48 },
    { priority: "Low", count: 14, percentage: 17 },
  ],
  ticketsTrend: [
    { date: "Mon", created: 12, resolved: 10 },
    { date: "Tue", created: 15, resolved: 14 },
    { date: "Wed", created: 8, resolved: 12 },
    { date: "Thu", created: 18, resolved: 15 },
    { date: "Fri", created: 14, resolved: 16 },
    { date: "Sat", created: 6, resolved: 8 },
    { date: "Sun", created: 4, resolved: 5 },
  ],
  topAgents: [
    { name: "Sarah Johnson", ticketsResolved: 45, avgResponseTime: 1.8, satisfaction: 98 },
    { name: "Mike Chen", ticketsResolved: 38, avgResponseTime: 2.1, satisfaction: 95 },
    { name: "Emily Davis", ticketsResolved: 32, avgResponseTime: 2.5, satisfaction: 92 },
    { name: "Alex Thompson", ticketsResolved: 28, avgResponseTime: 2.8, satisfaction: 90 },
  ],
  topCategories: [
    { category: "Technical Support", count: 85, avgResolutionTime: 6.5 },
    { category: "Billing", count: 62, avgResolutionTime: 4.2 },
    { category: "General Inquiry", count: 48, avgResolutionTime: 2.1 },
    { category: "Feature Request", count: 35, avgResolutionTime: 12.0 },
    { category: "Bug Report", count: 18, avgResolutionTime: 8.5 },
  ],
};

const statusColors: Record<string, string> = {
  Open: "bg-blue-500",
  "In Progress": "bg-purple-500",
  "Waiting Customer": "bg-amber-500",
  Resolved: "bg-green-500",
  Closed: "bg-gray-500",
};

const priorityColors: Record<string, string> = {
  Urgent: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-blue-500",
  Low: "bg-gray-500",
};

export function AnalyticsDashboardClient({
  pluginName,
  tier,
  features,
  hasAnalyticsFeature,
}: AnalyticsDashboardClientProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      // In real implementation, fetch from API
      // const response = await fetch(`/api/admin/tickets/analytics?range=${dateRange}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setData(mockAnalytics);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Feature not available warning
  if (!hasAnalyticsFeature) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Support Analytics
            </h1>
            <p className="text-muted-foreground">Performance metrics and insights</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Feature Not Available</AlertTitle>
          <AlertDescription>
            Analytics is not included in your current license tier ({tier || "Standard"}).
            Upgrade to Professional or Enterprise to access detailed analytics.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Upgrade your LiveSupport Pro license to access detailed analytics,
              including response times, agent performance, and customer satisfaction metrics.
            </p>
            <Button asChild>
              <Link href="/admin/settings/plugins">Manage License</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Support Analytics
            {tier && <Badge variant="outline" className="ml-2">{tier}</Badge>}
          </h1>
          <p className="text-muted-foreground">Performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-3xl font-bold">{data.overview.totalTickets}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {data.overview.ticketsChange > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{data.overview.ticketsChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">{data.overview.ticketsChange}%</span>
                </>
              )}
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                <p className="text-3xl font-bold">{data.overview.avgResponseTime}h</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {data.overview.responseTimeChange < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">{data.overview.responseTimeChange}%</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">+{data.overview.responseTimeChange}%</span>
                </>
              )}
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
                <p className="text-3xl font-bold">{data.overview.avgResolutionTime}h</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {data.overview.resolutionTimeChange < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">{data.overview.resolutionTimeChange}%</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">+{data.overview.resolutionTimeChange}%</span>
                </>
              )}
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                <p className="text-3xl font-bold">{data.overview.satisfactionScore}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {data.overview.satisfactionChange > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{data.overview.satisfactionChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">{data.overview.satisfactionChange}%</span>
                </>
              )}
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tickets by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Current ticket distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.ticketsByStatus.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.status}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress
                  value={item.percentage}
                  className={`h-2 ${statusColors[item.status]}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tickets by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Priority</CardTitle>
            <CardDescription>Priority distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.ticketsByPriority.map((item) => (
              <div key={item.priority} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.priority}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress
                  value={item.percentage}
                  className={`h-2 ${priorityColors[item.priority]}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart (Simple bar representation) */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Ticket Trend</CardTitle>
          <CardDescription>Created vs Resolved tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 gap-2">
            {data.ticketsTrend.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 w-full flex items-end gap-1">
                  <div
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${(day.created / 20) * 100}%` }}
                  />
                  <div
                    className="flex-1 bg-green-500 rounded-t"
                    style={{ height: `${(day.resolved / 20) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.date}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span className="text-sm text-muted-foreground">Created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span className="text-sm text-muted-foreground">Resolved</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
            <CardDescription>Based on tickets resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topAgents.map((agent, index) => (
                <div key={agent.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {agent.ticketsResolved} tickets • {agent.avgResponseTime}h avg
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {agent.satisfaction}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Category</CardTitle>
            <CardDescription>Most common ticket types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCategories.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cat.category}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg. resolution: {cat.avgResolutionTime}h
                    </p>
                  </div>
                  <Badge variant="outline">{cat.count} tickets</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
