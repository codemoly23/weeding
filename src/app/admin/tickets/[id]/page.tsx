import Link from "next/link";
import {
  ArrowLeft,
  Send,
  User,
  Package,
  Clock,
  Tag,
  UserPlus,
  CheckCircle,
  AlertCircle,
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Mock ticket data
const getTicket = (id: string) => ({
  id,
  subject: "Question about EIN timeline",
  customer: {
    id: "cust-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+880 1712 345678",
  },
  status: "open",
  priority: "high",
  category: "Order Related",
  assignedTo: "Admin",
  relatedOrder: "LLC-2024-ABC123",
  createdAt: "2024-12-10 10:30 AM",
  updatedAt: "2024-12-10 02:30 PM",
  messages: [
    {
      id: 1,
      sender: "customer",
      senderName: "John Doe",
      content:
        "Hello, I placed an order for LLC formation with EIN application 2 days ago. I wanted to know how long it typically takes to receive the EIN confirmation letter after the LLC is approved?\n\nAlso, can I use the EIN to open a bank account before receiving the official letter?",
      timestamp: "2024-12-10 10:30 AM",
    },
    {
      id: 2,
      sender: "staff",
      senderName: "Admin",
      content:
        "Hi John,\n\nThank you for reaching out! Great questions.\n\nRegarding your EIN timeline:\n- Once your LLC is approved by the state (typically 3-5 business days for Wyoming), we will immediately apply for your EIN.\n- The EIN is usually issued within 24-48 hours after application.\n- You'll receive your EIN confirmation letter via email as soon as it's ready.\n\nAs for opening a bank account - yes, you can use the EIN number itself to open a bank account. The official letter is not always required, though some banks may ask for it.\n\nIs there anything else I can help with?",
      timestamp: "2024-12-10 11:45 AM",
    },
    {
      id: 3,
      sender: "customer",
      senderName: "John Doe",
      content:
        "Thank you for the quick response! That's very helpful. One more question - which banks do you recommend for non-US residents to open a business account?",
      timestamp: "2024-12-10 02:30 PM",
    },
  ],
  previousTickets: [
    {
      id: "TKT-000",
      subject: "Document upload help",
      status: "resolved",
      date: "2024-11-25",
    },
  ],
});

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

// Canned responses
const cannedResponses = [
  {
    title: "EIN Timeline",
    content:
      "The EIN is typically issued within 24-48 hours after your LLC is approved by the state. You'll receive confirmation via email.",
  },
  {
    title: "LLC Processing Time",
    content:
      "Wyoming LLC formation typically takes 3-5 business days. You'll receive email updates at each stage of the process.",
  },
  {
    title: "Document Request",
    content:
      "Please upload the required documents through your dashboard. Go to Dashboard > Documents > Upload Document.",
  },
];

export default async function AdminTicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ticket = getTicket(id);

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

      {/* Ticket Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={statusColors[ticket.status]}>
              {ticket.status}
            </Badge>
            <Badge
              variant="secondary"
              className={priorityColors[ticket.priority]}
            >
              {ticket.priority} priority
            </Badge>
            <span className="text-sm text-muted-foreground">
              {ticket.id} • Created {ticket.createdAt}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Select defaultValue={ticket.status}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <CheckCircle className="mr-2 h-4 w-4" />
            Resolve
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation */}
        <div className="space-y-6 lg:col-span-2">
          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                {ticket.messages.length} messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.sender === "staff" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback
                      className={
                        message.sender === "staff"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }
                    >
                      {message.senderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 space-y-1 ${
                      message.sender === "staff" ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        message.sender === "staff" ? "justify-end" : ""
                      }`}
                    >
                      <span className="font-medium">{message.senderName}</span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg p-4 ${
                        message.sender === "staff"
                          ? "bg-primary/10 text-left"
                          : "bg-muted text-left"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reply Form */}
          <Card>
            <CardHeader>
              <CardTitle>Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Canned Responses */}
              <div className="flex flex-wrap gap-2">
                {cannedResponses.map((response, index) => (
                  <Button key={index} variant="outline" size="sm">
                    {response.title}
                  </Button>
                ))}
              </div>
              <Textarea
                placeholder="Type your reply..."
                rows={5}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sendEmail" className="rounded" />
                  <label htmlFor="sendEmail" className="text-sm">
                    Send email notification to customer
                  </label>
                </div>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Internal Note */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Note</CardTitle>
              <CardDescription>
                Only visible to staff members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add an internal note..."
                rows={3}
                className="resize-none"
              />
              <Button variant="outline" size="sm">
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {ticket.customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/admin/customers/${ticket.customer.id}`}
                    className="font-medium hover:underline"
                  >
                    {ticket.customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {ticket.customer.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground">Phone</p>
                <p>{ticket.customer.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>Category</span>
                </div>
                <span className="text-sm font-medium">{ticket.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span>Assigned</span>
                </div>
                <Select defaultValue={ticket.assignedTo || "unassigned"}>
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Priority</span>
                </div>
                <Select defaultValue={ticket.priority}>
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Related Order */}
          {ticket.relatedOrder && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Related Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/admin/orders/${ticket.relatedOrder}`}
                  className="font-medium text-primary hover:underline"
                >
                  {ticket.relatedOrder}
                </Link>
                <p className="text-sm text-muted-foreground">
                  LLC Formation - Wyoming
                </p>
              </CardContent>
            </Card>
          )}

          {/* Previous Tickets */}
          {ticket.previousTickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Previous Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ticket.previousTickets.map((prev) => (
                    <div
                      key={prev.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Link
                          href={`/admin/tickets/${prev.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {prev.subject}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {prev.date}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={statusColors[prev.status]}
                      >
                        {prev.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
