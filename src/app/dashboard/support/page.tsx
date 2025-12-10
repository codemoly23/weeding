"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data
const tickets = [
  {
    id: "TKT-001",
    subject: "Question about EIN application status",
    status: "open",
    priority: "medium",
    createdAt: "2024-12-08",
    lastReply: "2024-12-09",
    messages: 3,
  },
  {
    id: "TKT-002",
    subject: "Need help with document upload",
    status: "waiting",
    priority: "low",
    createdAt: "2024-12-05",
    lastReply: "2024-12-06",
    messages: 5,
  },
  {
    id: "TKT-003",
    subject: "LLC formation timeline inquiry",
    status: "resolved",
    priority: "high",
    createdAt: "2024-12-01",
    lastReply: "2024-12-03",
    messages: 8,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  open: {
    label: "Open",
    color: "bg-blue-100 text-blue-700",
    icon: MessageCircle,
  },
  waiting: {
    label: "Awaiting Reply",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-red-100 text-red-700",
};

export default function SupportPage() {
  const [newTicketOpen, setNewTicketOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <p className="text-muted-foreground">
            Get help from our support team
          </p>
        </div>
        <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll get back to you within 24 hours
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Order Related</SelectItem>
                    <SelectItem value="document">Document Issue</SelectItem>
                    <SelectItem value="payment">Payment & Billing</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderId">Related Order (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LLC-2024-ABC123">LLC-2024-ABC123</SelectItem>
                    <SelectItem value="LLC-2024-DEF456">LLC-2024-DEF456</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  rows={5}
                />
              </div>
              <Button className="w-full" onClick={() => setNewTicketOpen(false)}>
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "open").length}
              </p>
              <p className="text-sm text-muted-foreground">Open Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "waiting").length}
              </p>
              <p className="text-sm text-muted-foreground">Awaiting Reply</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "resolved").length}
              </p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
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
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="waiting">Awaiting Reply</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            {tickets.length} tickets in total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status];
              const StatusIcon = status.icon;
              return (
                <Link
                  key={ticket.id}
                  href={`/dashboard/support/${ticket.id}`}
                  className="block"
                >
                  <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${status.color.replace('text-', 'bg-').replace('700', '100')}`}>
                      <StatusIcon className={`h-5 w-5 ${status.color.split(' ')[1]}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {ticket.id} • Created {ticket.createdAt}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="secondary" className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ticket.messages} messages • Last reply {ticket.lastReply}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">Need immediate help?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check our{" "}
                <Link href="/faq" className="text-primary hover:underline">
                  FAQ section
                </Link>{" "}
                for quick answers, or email us at{" "}
                <a
                  href="mailto:support@llcpad.com"
                  className="text-primary hover:underline"
                >
                  support@llcpad.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
