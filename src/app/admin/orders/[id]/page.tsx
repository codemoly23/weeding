import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Mail,
  Edit,
  RefreshCcw,
  FileText,
  Building2,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
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

// Mock order data
const getOrder = (id: string) => ({
  id,
  customer: {
    id: "cust-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+880 1712 345678",
    country: "Bangladesh",
  },
  service: "LLC Formation",
  package: "Standard",
  state: "Wyoming",
  llcName: "Global Ventures LLC",
  llcPurpose: "General business purposes",
  amount: 249,
  serviceFee: 149,
  stateFee: 100,
  status: "processing",
  paymentStatus: "paid",
  paymentMethod: "Stripe",
  transactionId: "pi_3O5KjL2eZvKYlo2C1abc123",
  createdAt: "2024-12-10 10:30 AM",
  updatedAt: "2024-12-10 02:15 PM",
  timeline: [
    {
      status: "Order Placed",
      date: "Dec 10, 2024 10:30 AM",
      note: "Order received via website",
      completed: true,
    },
    {
      status: "Payment Confirmed",
      date: "Dec 10, 2024 10:31 AM",
      note: "Payment successful via Stripe",
      completed: true,
    },
    {
      status: "Documents Prepared",
      date: "Dec 10, 2024 02:15 PM",
      note: "Articles of Organization prepared",
      completed: true,
      current: true,
    },
    {
      status: "Submitted to State",
      date: "Pending",
      completed: false,
    },
    {
      status: "State Approval",
      date: "Pending",
      completed: false,
    },
    {
      status: "Documents Delivered",
      date: "Pending",
      completed: false,
    },
  ],
  documents: [
    {
      name: "Articles of Organization",
      status: "pending",
      uploadedAt: "Dec 10, 2024",
    },
    {
      name: "Operating Agreement",
      status: "ready",
      uploadedAt: "Dec 10, 2024",
    },
  ],
  notes: [
    {
      author: "Admin",
      date: "Dec 10, 2024 02:15 PM",
      content: "Documents prepared and ready for filing.",
    },
    {
      author: "System",
      date: "Dec 10, 2024 10:31 AM",
      content: "Payment confirmed via Stripe.",
    },
  ],
});

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  ready: "bg-green-100 text-green-700",
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = getOrder(id);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{order.id}</h1>
            <Badge
              variant="secondary"
              className={statusColors[order.status]}
            >
              {order.status.replace("_", " ")}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700"
            >
              {order.paymentStatus}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Created {order.createdAt} • Updated {order.updatedAt}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email Customer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/orders/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <Link
                    href={`/admin/customers/${order.customer.id}`}
                    className="font-medium hover:underline"
                  >
                    {order.customer.name}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{order.customer.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LLC Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                LLC Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">LLC Name</p>
                  <p className="font-medium">{order.llcName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{order.state}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Business Purpose</p>
                  <p className="font-medium">{order.llcPurpose}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Progress</CardTitle>
              <Select defaultValue={order.status}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          item.completed
                            ? "bg-primary text-primary-foreground"
                            : item.current
                            ? "border-2 border-primary bg-background"
                            : "bg-muted"
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : item.current ? (
                          <Clock className="h-4 w-4 text-primary" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      {index < order.timeline.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 ${
                            item.completed ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className={`font-medium ${
                          item.current ? "text-primary" : ""
                        }`}
                      >
                        {item.status}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.date}
                      </p>
                      {item.note && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Order-related documents</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={statusColors[doc.status]}
                      >
                        {doc.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
              <CardDescription>Staff-only notes about this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea placeholder="Add a note..." rows={3} />
                <Button size="sm">Add Note</Button>
              </div>
              <Separator />
              <div className="space-y-4">
                {order.notes.map((note, index) => (
                  <div key={index} className="rounded-lg bg-muted p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{note.author}</p>
                      <p className="text-xs text-muted-foreground">{note.date}</p>
                    </div>
                    <p className="mt-1 text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{order.service}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Package</p>
                <p className="font-medium">{order.package}</p>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span>${order.serviceFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">State Fee</span>
                <span>${order.stateFee}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="text-lg">${order.amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Method</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm">{order.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1 bg-green-100 text-green-700">
                  {order.paymentStatus}
                </Badge>
              </div>
              <Separator />
              <Button variant="outline" className="w-full" size="sm">
                Issue Refund
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Send Status Update
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Resend Documents
              </Button>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
