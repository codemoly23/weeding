"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Loader2,
  Paperclip,
  Clock,
  User,
  MessageSquare,
  FileText,
  Download,
  Trash2,
  MoreHorizontal,
  CheckCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "WAITING_AGENT" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type SenderType = "CUSTOMER" | "AGENT" | "SYSTEM";

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface Message {
  id: string;
  content: string;
  senderType: SenderType;
  senderName: string;
  senderId: string | null;
  type: string;
  createdAt: string;
  attachments: Attachment[];
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  customer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  guestName: string | null;
  guestEmail: string | null;
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  messages: Message[];
}

interface TicketDetailClientProps {
  ticketId: string;
  pluginName?: string;
  tier?: string | null;
  features: string[];
}

const statusConfig: Record<TicketStatus, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-100 text-purple-700 border-purple-200" },
  WAITING_CUSTOMER: { label: "Awaiting Customer", color: "bg-amber-100 text-amber-700 border-amber-200" },
  WAITING_AGENT: { label: "Awaiting Agent", color: "bg-orange-100 text-orange-700 border-orange-200" },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-200" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-gray-100 text-gray-700" },
  MEDIUM: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-700" },
  URGENT: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

export function TicketDetailClient({
  ticketId,
  pluginName,
  tier,
  features,
}: TicketDetailClientProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/tickets/${ticketId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch ticket");
      }

      const data = await response.json();
      setTicket(data.ticket);
    } catch (error) {
      console.error("Failed to load ticket:", error);
      toast.error("Failed to load ticket");
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendReply = async () => {
    if (!reply.trim()) return;

    try {
      setIsSending(true);
      const response = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: reply.trim(),
          senderType: "AGENT",
          senderName: "Support Agent", // TODO: Get from session
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      setTicket((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "WAITING_CUSTOMER" as TicketStatus,
          messages: [...prev.messages, data.message],
        };
      });

      setReply("");
      toast.success("Reply sent");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket) return;

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) {
        throw new Error("Failed to update priority");
      }

      setTicket((prev) => (prev ? { ...prev, priority: newPriority } : prev));
      toast.success("Priority updated");
    } catch (error) {
      toast.error("Failed to update priority");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCustomerDisplay = (ticket: Ticket) => {
    if (ticket.customer) {
      return {
        name: ticket.customer.name || "Customer",
        email: ticket.customer.email,
      };
    }
    return {
      name: ticket.guestName || "Guest",
      email: ticket.guestEmail || "",
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/tickets"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Ticket not found</h3>
            <p className="text-sm text-muted-foreground">
              The ticket you're looking for doesn't exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customer = getCustomerDisplay(ticket);
  const statusInfo = statusConfig[ticket.status];
  const priorityInfo = priorityConfig[ticket.priority];
  const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/tickets"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tickets
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{ticket.ticketNumber}</h1>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
          <p className="mt-1 text-lg text-muted-foreground">{ticket.subject}</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange("RESOLVED")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("CLOSED")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Close Ticket
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                {ticket.messages.length} messages in this ticket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {ticket.messages.map((message, index) => (
                <div key={message.id}>
                  <div className="flex gap-4">
                    <div
                      className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-medium ${
                        message.senderType === "AGENT"
                          ? "bg-primary text-primary-foreground"
                          : message.senderType === "SYSTEM"
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.senderType === "SYSTEM"
                        ? "SYS"
                        : message.senderName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.senderName}</span>
                        {message.senderType === "AGENT" && (
                          <Badge variant="secondary" className="text-xs">
                            Support
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </p>
                      <div className="mt-2 whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg border p-2 text-sm hover:bg-muted transition-colors"
                            >
                              <FileText className="h-8 w-8 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{att.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(att.fileSize)}
                                </p>
                              </div>
                              <Download className="h-4 w-4 text-muted-foreground" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < ticket.messages.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />

              {/* Reply Box */}
              {!isResolved ? (
                <div className="pt-4 border-t">
                  <Textarea
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    disabled={isSending}
                  />
                  <div className="mt-3 flex justify-between items-center">
                    <Button variant="outline" size="sm" disabled>
                      <Paperclip className="mr-2 h-4 w-4" />
                      Attach File
                    </Button>
                    <Button
                      onClick={handleSendReply}
                      disabled={isSending || !reply.trim()}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                    This ticket has been {ticket.status.toLowerCase()}. Reopen the
                    ticket to continue the conversation.
                  </div>
                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("OPEN")}
                    >
                      Reopen Ticket
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className={`${statusInfo.color}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Priority</p>
                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className={`${priorityInfo.color}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {ticket.category && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <p className="font-medium capitalize">{ticket.category}</p>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="text-sm">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                <p className="text-sm">{formatDate(ticket.updatedAt)}</p>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                  <p className="text-sm">{formatDate(ticket.resolvedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Assignment */}
          {ticket.assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {ticket.assignedTo.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "AG"}
                  </div>
                  <div>
                    <p className="font-medium">
                      {ticket.assignedTo.name || "Support Agent"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.assignedTo.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Time Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Average response time: 2-4 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
