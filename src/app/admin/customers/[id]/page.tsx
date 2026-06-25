"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar,
  Package, MessageSquare, Ban, Key, Loader2, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { SendEmailModal } from "@/components/admin/send-email-modal";

interface Order {
  id: string;
  orderNumber: string;
  service: string;
  status: string;
  paymentStatus: string;
  amount: number;
  date: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  date: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  joinedAt: string;
  isActive: boolean;
  stats: { totalOrders: number; totalSpent: number; avgOrderValue: number };
  orders: Order[];
  tickets: Ticket[];
}

const orderStatusColors: Record<string, string> = {
  PENDING:          "admin-status-warning",
  PROCESSING:       "admin-status-info",
  IN_PROGRESS:      "admin-status-info",
  WAITING_FOR_INFO: "admin-status-warning",
  COMPLETED:        "admin-status-success",
  CANCELLED:        "admin-status-neutral",
  REFUNDED:         "admin-status-neutral",
};

const ticketStatusColors: Record<string, string> = {
  OPEN:                 "admin-status-info",
  IN_PROGRESS:          "admin-status-info",
  WAITING_FOR_CUSTOMER: "admin-status-warning",
  WAITING_FOR_AGENT:    "admin-status-warning",
  RESOLVED:             "admin-status-success",
  CLOSED:               "admin-status-neutral",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.customer) setCustomer(d.customer); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleResetPassword() {
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Password reset email sent");
      } else if (res.status === 207) {
        toast.warning(data.error);
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setResetting(false);
    }
  }

  async function handleToggleDisable() {
    setDisabling(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}/disable`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        setCustomer((prev) => prev ? { ...prev, isActive: data.isActive } : prev);
        toast.success(data.isActive ? "Account re-enabled" : "Account disabled");
      } else {
        toast.error(data.error || "Failed to update account");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDisabling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Customer not found.{" "}
        <Link href="/admin/customers" className="underline">Back to list</Link>
      </div>
    );
  }

  const currencySymbol = "$";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-xl text-primary-foreground">
              {initials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <Badge
                variant="secondary"
                className={customer.isActive ? "admin-status-success" : "admin-status-neutral"}
              >
                {customer.isActive ? "Active" : "Disabled"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEmailModalOpen(true)}
        >
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Orders ({customer.orders.length})</TabsTrigger>
              <TabsTrigger value="tickets">Tickets ({customer.tickets.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>All orders placed by this customer</CardDescription>
                </CardHeader>
                <CardContent>
                  {customer.orders.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {customer.orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div>
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-medium hover:underline"
                            >
                              {order.orderNumber}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {order.service} &bull;{" "}
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className={orderStatusColors[order.status] ?? "admin-status-neutral"}>
                              {order.status.replace(/_/g, " ")}
                            </Badge>
                            <span className="font-medium whitespace-nowrap">
                              {currencySymbol}{order.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Customer support history</CardDescription>
                </CardHeader>
                <CardContent>
                  {customer.tickets.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No tickets yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {customer.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div>
                            <Link
                              href={`/admin/tickets/${ticket.id}`}
                              className="font-medium hover:underline"
                            >
                              {ticket.subject}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {ticket.ticketNumber} &bull;{" "}
                              {new Date(ticket.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className={ticketStatusColors[ticket.status] ?? "admin-status-neutral"}>
                            {ticket.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm break-all">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              {customer.country && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">{customer.country}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm">
                  Joined {new Date(customer.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <span className="font-medium">{customer.stats.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Spent</span>
                <span className="font-medium">{currencySymbol}{customer.stats.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Order Value</span>
                <span className="font-medium">{currencySymbol}{customer.stats.avgOrderValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Support Tickets</span>
                </div>
                <span className="font-medium">{customer.tickets.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setEmailModalOpen(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" disabled={resetting}>
                    {resetting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="mr-2 h-4 w-4" />
                    )}
                    Reset Password
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A temporary password will be generated and sent to{" "}
                      <strong>{customer.email}</strong>. The customer must change it after login.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetPassword}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Send Reset Email
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/admin/tickets?customerId=${customer.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Tickets
                </Link>
              </Button>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    disabled={disabling}
                  >
                    {disabling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Ban className="mr-2 h-4 w-4" />
                    )}
                    {customer.isActive ? "Disable Account" : "Re-enable Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {customer.isActive ? "Disable Account?" : "Re-enable Account?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {customer.isActive
                        ? `${customer.name} will be immediately logged out and unable to log in until re-enabled.`
                        : `${customer.name} will be able to log in again.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleToggleDisable}
                      className={customer.isActive ? "bg-destructive hover:bg-destructive/90" : ""}
                    >
                      {customer.isActive ? "Disable" : "Re-enable"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>

      <SendEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        recipientEmail={customer.email}
        recipientName={customer.name}
      />
    </div>
  );
}
