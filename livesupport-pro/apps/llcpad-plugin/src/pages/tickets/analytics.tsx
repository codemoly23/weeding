"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";

// Mock analytics data
const overviewStats = [
  {
    title: "Total Tickets",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Resolved",
    value: "987",
    change: "+8%",
    trend: "up",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Avg Response Time",
    value: "2.4h",
    change: "-15%",
    trend: "down",
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "Customer Satisfaction",
    value: "94%",
    change: "+3%",
    trend: "up",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
];

const ticketsByStatus = [
  { status: "Open", count: 45, percentage: 15, color: "bg-blue-500" },
  { status: "In Progress", count: 78, percentage: 26, color: "bg-yellow-500" },
  { status: "Waiting", count: 32, percentage: 11, color: "bg-orange-500" },
  { status: "Resolved", count: 120, percentage: 40, color: "bg-green-500" },
  { status: "Closed", count: 25, percentage: 8, color: "bg-gray-500" },
];

const ticketsByPriority = [
  { priority: "Urgent", count: 12, color: "bg-red-500" },
  { priority: "High", count: 35, color: "bg-orange-500" },
  { priority: "Normal", count: 156, color: "bg-blue-500" },
  { priority: "Low", count: 97, color: "bg-gray-500" },
];

const weeklyData = [
  { day: "Mon", tickets: 45, resolved: 38 },
  { day: "Tue", tickets: 52, resolved: 45 },
  { day: "Wed", tickets: 38, resolved: 35 },
  { day: "Thu", tickets: 65, resolved: 58 },
  { day: "Fri", tickets: 48, resolved: 42 },
  { day: "Sat", tickets: 25, resolved: 22 },
  { day: "Sun", tickets: 18, resolved: 15 },
];

const topAgents = [
  { name: "Sarah Johnson", tickets: 156, rating: 4.9, responseTime: "1.2h" },
  { name: "Mike Chen", tickets: 142, rating: 4.8, responseTime: "1.5h" },
  { name: "Emily Davis", tickets: 128, rating: 4.7, responseTime: "1.8h" },
  { name: "Alex Wilson", tickets: 98, rating: 4.6, responseTime: "2.1h" },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Analytics</h1>
          <p className="text-muted-foreground">
            Track your support team performance and metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Custom
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <div key={stat.title} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendIcon className="h-4 w-4" />
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Trend */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Weekly Ticket Trend</h3>
          <div className="space-y-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <span className="w-10 text-sm text-muted-foreground">{day.day}</span>
                <div className="flex-1 flex gap-1 h-6">
                  <div
                    className="bg-blue-500 rounded-l"
                    style={{ width: `${(day.tickets / 70) * 100}%` }}
                    title={`Tickets: ${day.tickets}`}
                  />
                  <div
                    className="bg-green-500 rounded-r"
                    style={{ width: `${(day.resolved / 70) * 100}%` }}
                    title={`Resolved: ${day.resolved}`}
                  />
                </div>
                <div className="w-20 text-right">
                  <span className="text-sm font-medium">{day.tickets}</span>
                  <span className="text-xs text-muted-foreground"> / {day.resolved}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-blue-500"></span>
              Created
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-green-500"></span>
              Resolved
            </span>
          </div>
        </div>

        {/* Tickets by Status */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Tickets by Status</h3>
          <div className="space-y-4">
            {ticketsByStatus.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.status}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tickets by Priority */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Tickets by Priority</h3>
          <div className="flex items-end gap-4 h-48">
            {ticketsByPriority.map((item) => (
              <div key={item.priority} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t ${item.color} transition-all`}
                  style={{ height: `${(item.count / 160) * 100}%` }}
                />
                <span className="mt-2 text-xs font-medium">{item.count}</span>
                <span className="text-xs text-muted-foreground">{item.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Agents */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Top Performing Agents</h3>
          <div className="space-y-4">
            {topAgents.map((agent, index) => (
              <div key={agent.name} className="flex items-center gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {agent.tickets} tickets resolved
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-yellow-600">★ {agent.rating}</p>
                  <p className="text-xs text-muted-foreground">{agent.responseTime} avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
