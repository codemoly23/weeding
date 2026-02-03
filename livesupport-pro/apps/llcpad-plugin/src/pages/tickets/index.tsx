"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

// Ticket types
interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  customer: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: MessageSquare },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  WAITING_FOR_CUSTOMER: { label: "Waiting", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: User },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: XCircle },
};

// Priority configuration
const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "text-gray-500" },
  NORMAL: { label: "Normal", color: "text-blue-500" },
  HIGH: { label: "High", color: "text-orange-500" },
  URGENT: { label: "Urgent", color: "text-red-500" },
};

// Mock data for development
const mockTickets: Ticket[] = [
  {
    id: "1",
    ticketNumber: "TKT-2026-0001",
    subject: "Unable to complete LLC formation process",
    status: "OPEN",
    priority: "HIGH",
    customer: { name: "John Smith", email: "john@example.com" },
    assignedTo: { name: "Support Agent" },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    _count: { messages: 5 },
  },
  {
    id: "2",
    ticketNumber: "TKT-2026-0002",
    subject: "Question about EIN application status",
    status: "WAITING_FOR_CUSTOMER",
    priority: "NORMAL",
    customer: { name: "Sarah Johnson", email: "sarah@example.com" },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    _count: { messages: 3 },
  },
  {
    id: "3",
    ticketNumber: "TKT-2026-0003",
    subject: "Payment failed for registered agent service",
    status: "IN_PROGRESS",
    priority: "URGENT",
    customer: { name: "Mike Williams", email: "mike@example.com" },
    assignedTo: { name: "Billing Support" },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    _count: { messages: 8 },
  },
  {
    id: "4",
    ticketNumber: "TKT-2026-0004",
    subject: "Request for document copies",
    status: "RESOLVED",
    priority: "LOW",
    customer: { name: "Emily Davis", email: "emily@example.com" },
    assignedTo: { name: "Support Agent" },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    _count: { messages: 4 },
  },
];

// Stats cards data
const statsData = [
  { label: "Open Tickets", value: 12, change: "+3", color: "text-blue-600" },
  { label: "In Progress", value: 8, change: "-2", color: "text-yellow-600" },
  { label: "Resolved Today", value: 15, change: "+5", color: "text-green-600" },
  { label: "Avg Response", value: "2.5h", change: "-15m", color: "text-purple-600" },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await fetch("/api/support/tickets");
        // const data = await response.json();
        // setTickets(data.tickets);

        // For now, use mock data
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTickets(mockTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage customer support tickets and inquiries
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {statsData.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <span className={`text-xs font-medium ${stat.color}`}>
                {stat.change}
              </span>
            </div>
            <p className={`mt-2 text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_CUSTOMER">Waiting</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Ticket
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Assigned
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Updated
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading tickets...</p>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No tickets found</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const StatusIcon = statusConfig[ticket.status]?.icon || MessageSquare;
                  return (
                    <tr key={ticket.id} className="hover:bg-muted/50 cursor-pointer">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {ticket.ticketNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-foreground">{ticket.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{ticket.customer.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            statusConfig[ticket.status]?.color || ""
                          }`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[ticket.status]?.label || ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-medium ${
                            priorityConfig[ticket.priority]?.color || ""
                          }`}
                        >
                          {priorityConfig[ticket.priority]?.label || ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">
                          {ticket.assignedTo?.name || (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(ticket.updatedAt)}
                          </span>
                          {ticket._count?.messages && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              {ticket._count.messages}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="rounded-md p-1 hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTickets.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </p>
            <div className="flex gap-2">
              <button
                disabled
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button className="rounded-md border bg-primary px-3 py-1 text-sm text-primary-foreground">
                1
              </button>
              <button className="rounded-md border px-3 py-1 text-sm hover:bg-accent">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
