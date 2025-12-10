"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserPlus,
  Clock,
} from "lucide-react";
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

// Mock data
const tickets = [
  {
    id: "TKT-001",
    subject: "Question about EIN timeline",
    customer: {
      name: "John Doe",
      email: "john@example.com",
    },
    status: "open",
    priority: "high",
    assignedTo: "Admin",
    messages: 3,
    createdAt: "2024-12-10",
    lastReply: "2024-12-10 02:30 PM",
  },
  {
    id: "TKT-002",
    subject: "Document upload issue",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
    },
    status: "waiting",
    priority: "medium",
    assignedTo: "Support",
    messages: 5,
    createdAt: "2024-12-09",
    lastReply: "2024-12-09 04:15 PM",
  },
  {
    id: "TKT-003",
    subject: "Need LLC operating agreement",
    customer: {
      name: "Bob Wilson",
      email: "bob@example.com",
    },
    status: "open",
    priority: "low",
    assignedTo: null,
    messages: 2,
    createdAt: "2024-12-08",
    lastReply: "2024-12-08 11:00 AM",
  },
  {
    id: "TKT-004",
    subject: "Payment not processed",
    customer: {
      name: "Alice Brown",
      email: "alice@example.com",
    },
    status: "in_progress",
    priority: "high",
    assignedTo: "Admin",
    messages: 7,
    createdAt: "2024-12-07",
    lastReply: "2024-12-10 09:45 AM",
  },
  {
    id: "TKT-005",
    subject: "Question about LLC formation",
    customer: {
      name: "Charlie Davis",
      email: "charlie@example.com",
    },
    status: "resolved",
    priority: "medium",
    assignedTo: "Support",
    messages: 4,
    createdAt: "2024-12-05",
    lastReply: "2024-12-06 03:00 PM",
  },
];

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  waiting: "bg-amber-100 text-amber-700",
  in_progress: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-red-100 text-red-700",
  urgent: "bg-red-500 text-white",
};

export default function AdminTicketsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
    if (priorityFilter !== "all" && ticket.priority !== priorityFilter)
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage customer support requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === "open").length}
            </div>
            <p className="text-sm text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === "waiting").length}
            </div>
            <p className="text-sm text-muted-foreground">Awaiting Reply</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === "in_progress").length}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.priority === "high").length}
            </div>
            <p className="text-sm text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tickets..." className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="waiting">Awaiting Reply</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            {filteredTickets.length} tickets total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Assigned</TableHead>
                <TableHead className="hidden lg:table-cell">Last Reply</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="font-medium hover:underline"
                      >
                        {ticket.subject}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {ticket.id} • {ticket.messages} messages
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {ticket.customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {ticket.customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.customer.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[ticket.status]}
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="secondary"
                      className={priorityColors[ticket.priority]}
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {ticket.assignedTo ? (
                      <span className="text-sm">{ticket.assignedTo}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {ticket.lastReply}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tickets/${ticket.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Ticket
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                        <DropdownMenuItem>Close Ticket</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
