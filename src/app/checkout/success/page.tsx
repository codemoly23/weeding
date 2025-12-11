"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  FileText,
  ArrowRight,
  Loader2,
  Mail,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderDetails {
  orderId: string;
  service: string;
  package: string;
  state: string;
  llcName: string;
  total: number;
  email: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const isDemo = searchParams.get("demo") === "true";
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (orderId) {
      // Fetch real order details from API
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orderNumber) {
            setOrder({
              orderId: data.orderNumber,
              service: data.items?.[0]?.name || "LLC Formation",
              package: "Standard",
              state: data.llcState || "Wyoming",
              llcName: data.llcName || "LLC",
              total: parseFloat(data.totalUSD) || 0,
              email: data.customerEmail || "",
            });
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching order:", error);
          setLoading(false);
        });
    } else if (sessionId || isDemo) {
      // Demo mode fallback
      const timer = setTimeout(() => {
        setOrder({
          orderId: "LLC-2024-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          service: "LLC Formation",
          package: "Standard",
          state: "Wyoming",
          llcName: "My Business LLC",
          total: 249,
          email: "customer@example.com",
        });
        setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [orderId, sessionId, isDemo]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Processing your order...
          </p>
        </div>
      </div>
    );
  }

  if (!orderId && !sessionId && !isDemo) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No order information found. Please contact support if you believe
              this is an error.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Unable to load order details. Please contact support.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
      {/* Success Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Thank you for your order. We've received your payment successfully.
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Order #{order.orderId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-medium">{order.service}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Package</p>
              <p className="font-medium">{order.package}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">State</p>
              <p className="font-medium">{order.state}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">LLC Name</p>
              <p className="font-medium">{order.llcName}</p>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-medium">Total Paid</span>
            <span className="text-xl font-bold text-primary">
              ${order.total}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* What's Next Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
          <CardDescription>
            Here's what you can expect from our team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Confirmation Email</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive a confirmation email at {order.email} with your
                  order details and receipt.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Document Preparation</h3>
                <p className="text-sm text-muted-foreground">
                  Our team will prepare your formation documents and submit them
                  to the state within 24 hours.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">State Processing</h3>
                <p className="text-sm text-muted-foreground">
                  {order.state} typically processes LLC formations within 3-5
                  business days. We'll notify you once approved.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Documents Delivered</h3>
                <p className="text-sm text-muted-foreground">
                  Once approved, all your formation documents will be available
                  for download in your dashboard.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/orders">
            View Order Status
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>

      {/* Support Info */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Have questions about your order?{" "}
        <Link
          href="/dashboard/support"
          className="text-primary hover:underline"
        >
          Contact our support team
        </Link>
      </p>
    </div>
  );
}

function SuccessLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}
