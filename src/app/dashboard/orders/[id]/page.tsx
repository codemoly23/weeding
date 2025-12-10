import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  MapPin,
  Mail,
  Phone,
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

interface PageProps {
  params: Promise<{ id: string }>;
}

// Mock order data - replace with real data
const getOrder = (id: string) => ({
  id,
  service: "LLC Formation",
  package: "Standard",
  status: "in_progress",
  paymentStatus: "paid",
  createdAt: "2024-12-05",
  updatedAt: "2024-12-08",
  total: 249,
  stateFee: 100,
  serviceFee: 149,
  llcName: "Global Ventures LLC",
  llcState: "Wyoming",
  llcType: "LLC",
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
    country: "Bangladesh",
  },
  timeline: [
    {
      status: "Order Placed",
      date: "Dec 5, 2024 10:30 AM",
      completed: true,
    },
    {
      status: "Payment Confirmed",
      date: "Dec 5, 2024 10:31 AM",
      completed: true,
    },
    {
      status: "Documents Prepared",
      date: "Dec 5, 2024 02:15 PM",
      completed: true,
    },
    {
      status: "Submitted to State",
      date: "Dec 6, 2024 09:00 AM",
      completed: true,
    },
    {
      status: "State Approval",
      date: "Pending",
      completed: false,
      current: true,
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
      type: "LLC Document",
    },
    {
      name: "Operating Agreement",
      status: "ready",
      type: "LLC Document",
    },
    {
      name: "EIN Confirmation",
      status: "pending",
      type: "Tax Document",
    },
  ],
});

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  in_progress: "bg-amber-100 text-amber-700",
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = getOrder(id);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{order.id}</h1>
            <Badge
              variant="secondary"
              className={statusColors[order.status]}
            >
              {order.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {order.service} • {order.package} Package
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download All Documents
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* LLC Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                LLC Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">LLC Name</p>
                <p className="font-medium">{order.llcName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">State</p>
                <p className="font-medium">{order.llcState}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entity Type</p>
                <p className="font-medium">{order.llcType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Formation Date</p>
                <p className="font-medium">Pending Approval</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
              <CardDescription>Track your order status</CardDescription>
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Download your LLC formation documents
              </CardDescription>
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
                          {doc.type}
                        </p>
                      </div>
                    </div>
                    {doc.status === "ready" ? (
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-4 w-4" />
                        Download
                      </Button>
                    ) : (
                      <Badge
                        variant="secondary"
                        className={statusColors[doc.status]}
                      >
                        {doc.status}
                      </Badge>
                    )}
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span>${order.serviceFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">State Filing Fee</span>
                <span>${order.stateFee}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
              <Badge className="w-full justify-center bg-green-100 text-green-700">
                Paid
              </Badge>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer.country}</span>
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Need Help?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Have questions about your order?
                  </p>
                  <Button className="mt-3" variant="outline" size="sm" asChild>
                    <Link href="/dashboard/support">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
