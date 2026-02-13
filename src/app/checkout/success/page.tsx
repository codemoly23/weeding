"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCurrencySymbol } from "@/lib/currencies";
import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2,
  Mail,
  ClipboardList,
  LogIn,
  CreditCard,
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
import { toast } from "sonner";

interface OrderItem {
  name: string;
  description: string | null;
  priceUSD: string;
  locationName: string | null;
  locationCode: string | null;
  service: { id: string; name: string; slug: string } | null;
  package: { id: string; name: string } | null;
}

interface OrderData {
  orderNumber: string;
  totalUSD: string;
  customerEmail: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  formSubmissions: Array<{ data: Record<string, unknown> }>;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [payingNow, setPayingNow] = useState(false);

  useEffect(() => {
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.currency) {
          setCurrencySymbol(getCurrencySymbol(config.currency));
        }
      })
      .catch(() => {});
  }, []);

  // Verify Stripe session if session_id is present
  useEffect(() => {
    if (sessionId && !orderId) {
      fetch(`/api/checkout?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orderId) {
            // Redirect to include orderId
            router.replace(`/checkout/success?orderId=${data.orderId}`);
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [sessionId, orderId, router]);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orderNumber) {
            setOrder(data);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching order:", error);
          setLoading(false);
        });
    } else if (!sessionId) {
      setLoading(false);
    }
  }, [orderId, sessionId]);

  const handlePayNow = async () => {
    if (!order) return;
    setPayingNow(true);
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateway: "stripe" }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to create payment session");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPayingNow(false);
    }
  };

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

  if (!orderId && !sessionId) {
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

  const paymentStatus = order.paymentStatus || "PENDING";
  const isPaid = paymentStatus === "PAID";
  const isFailed = paymentStatus === "FAILED";
  const isPending = !isPaid && !isFailed;

  const item = order.items?.[0];
  const serviceName = item?.service?.name || item?.name || "Service";
  const packageName = item?.package?.name || null;
  const locationName = item?.locationName || null;
  const total = parseFloat(order.totalUSD) || 0;

  // Extract key display fields from form submission data
  const formData = order.formSubmissions?.[0]?.data as Record<string, unknown> | undefined;
  const displayFields: Array<{ label: string; value: string }> = [];

  displayFields.push({ label: "Service", value: serviceName });
  if (packageName) {
    displayFields.push({ label: "Package", value: packageName });
  }
  if (locationName) {
    displayFields.push({ label: "Service Location", value: locationName });
  }

  if (formData) {
    const skipKeys = new Set([
      "email", "password", "confirmPassword", "phone", "country",
      "firstName", "lastName", "fullName", "contactName",
      "agreeTerms", "termsAccepted", "consent",
    ]);

    for (const [key, value] of Object.entries(formData)) {
      if (skipKeys.has(key)) continue;
      if (value === null || value === undefined || value === "") continue;
      if (typeof value === "object") continue;

      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

      displayFields.push({ label, value: String(value) });
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
      {/* Status Header */}
      <div className="mb-8 text-center">
        {isPaid && (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Thank you for your order. We&apos;ve received your payment successfully.
            </p>
          </>
        )}

        {isPending && (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Order Received — Payment Pending
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Your order has been created. Complete your payment to proceed.
            </p>
          </>
        )}

        {isFailed && (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Payment Failed
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Your payment could not be processed. Please try again.
            </p>
          </>
        )}
      </div>

      {/* Pay Now Banner for pending/failed */}
      {(isPending || isFailed) && (
        <Card className="mb-6 border-2 border-yellow-300">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-medium">
                    {isFailed ? "Try payment again" : "Complete your payment"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Amount: {currencySymbol}{total.toFixed(2)}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handlePayNow}
                disabled={payingNow}
              >
                {payingNow ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isFailed ? "Try Again" : "Pay Now"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Order #{order.orderNumber}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {displayFields.map((field, index) => (
              <div key={index}>
                <p className="text-sm text-muted-foreground">{field.label}</p>
                <p className="font-medium">{field.value}</p>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-medium">
              {isPaid ? "Total Paid" : "Total Due"}
            </span>
            <span className={`text-xl font-bold ${isPaid ? "text-primary" : "text-foreground"}`}>
              {currencySymbol}{total.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* What's Next Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
          <CardDescription>
            Here&apos;s what you can expect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isPaid && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Confirmation Email</h3>
                  <p className="text-sm text-muted-foreground">
                    A confirmation email has been sent to {order.customerEmail} with your order details and receipt.
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">
                  {isPaid ? "Order Processing" : "Order Created"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isPaid
                    ? "Our team will review your order and begin processing it. You can track the status from your dashboard at any time."
                    : "Your order has been created and is waiting for payment. Once payment is received, our team will begin processing it."
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Track Your Order</h3>
                <p className="text-sm text-muted-foreground">
                  Log in to your dashboard to view order updates, download documents, and communicate with our team.
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
