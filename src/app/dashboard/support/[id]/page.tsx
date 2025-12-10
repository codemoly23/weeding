"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Mock data
const ticket = {
  id: "TKT-001",
  subject: "Question about EIN application status",
  status: "open",
  priority: "medium",
  category: "Order Related",
  orderId: "LLC-2024-DEF456",
  createdAt: "December 8, 2024 at 2:30 PM",
  messages: [
    {
      id: 1,
      author: "John Doe",
      isStaff: false,
      content:
        "Hi, I submitted my EIN application 3 days ago but haven't received any updates. The order status still shows 'In Progress'. Could you please provide an update on when I can expect to receive my EIN?",
      timestamp: "December 8, 2024 at 2:30 PM",
    },
    {
      id: 2,
      author: "Sarah from Support",
      isStaff: true,
      content:
        "Hello John! Thank you for reaching out. I've checked your order and your EIN application has been submitted to the IRS. For international applicants, the IRS typically takes 4-6 weeks to process EIN applications via fax.\n\nYour application was submitted on December 6th, so you're still within the normal processing window. We'll notify you immediately once we receive your EIN confirmation from the IRS.\n\nIs there anything else I can help you with?",
      timestamp: "December 8, 2024 at 4:15 PM",
    },
    {
      id: 3,
      author: "John Doe",
      isStaff: false,
      content:
        "Thank you for the quick response! I wasn't aware of the 4-6 week timeline for international applicants. I'll wait for the update. One more question - will I receive the EIN letter via email or through my dashboard?",
      timestamp: "December 9, 2024 at 10:22 AM",
    },
  ],
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  waiting: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

export default function TicketDetailPage() {
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setReply("");
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/support"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Support
      </Link>

      {/* Ticket Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{ticket.id}</h1>
            <Badge variant="secondary" className={statusColors[ticket.status]}>
              {ticket.status}
            </Badge>
          </div>
          <p className="mt-1 text-lg text-muted-foreground">{ticket.subject}</p>
        </div>
        <Button variant="outline">Mark as Resolved</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ticket.messages.map((message, index) => (
                <div key={message.id}>
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback
                        className={
                          message.isStaff
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }
                      >
                        {message.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.author}</span>
                        {message.isStaff && (
                          <Badge variant="secondary" className="text-xs">
                            Staff
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </p>
                      <div className="mt-2 whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                    </div>
                  </div>
                  {index < ticket.messages.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}

              {/* Reply Box */}
              <div className="pt-4">
                <Separator className="mb-6" />
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Attach File
                    </Button>
                    <Button onClick={handleSend} disabled={isSending || !reply.trim()}>
                      {isSending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant="secondary"
                  className={`mt-1 ${statusColors[ticket.status]}`}
                >
                  {ticket.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <p className="font-medium capitalize">{ticket.priority}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{ticket.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Related Order</p>
                <Link
                  href={`/dashboard/orders/${ticket.orderId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {ticket.orderId}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{ticket.createdAt}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Average response time: <strong>2-4 hours</strong>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Our support team is available Monday-Friday, 9AM-6PM EST.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
