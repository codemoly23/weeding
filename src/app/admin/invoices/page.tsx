"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Receipt,
  FileText,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getCurrencySymbol } from "@/lib/currencies";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string | null;
  customerName: string;
  customerEmail: string;
  serviceName: string | null;
  subtotal: string;
  discount: string;
  total: string;
  currency: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  order: {
    orderNumber: string;
    paymentMethod: string | null;
    paymentStatus: string;
  } | null;
}

interface CustomerSearchResult {
  id: string;
  name: string;
  email: string;
}

interface ServiceSearchResult {
  id: string;
  name: string;
  slug: string;
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
  PARTIALLY_REFUNDED: "bg-orange-100 text-orange-700",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partial Refund",
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Create invoice dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerSearchResult[]>([]);
  const [customerSearching, setCustomerSearching] = useState(false);
  const [customerSearchDone, setCustomerSearchDone] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceResults, setServiceResults] = useState<ServiceSearchResult[]>([]);
  const [serviceSearching, setServiceSearching] = useState(false);
  const [serviceSearchDone, setServiceSearchDone] = useState(false);
  const [serviceType, setServiceType] = useState<"service" | "custom">("service");
  const [selectedService, setSelectedService] = useState<ServiceSearchResult | null>(null);
  const [customServiceName, setCustomServiceName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/admin/invoices?${params}`);
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data.invoices);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchInvoices();
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.currency) setCurrencySymbol(getCurrencySymbol(config.currency));
      })
      .catch(() => {});
  }, [fetchInvoices]);

  // Customer search for create dialog
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomerResults([]);
      setCustomerSearchDone(false);
      return;
    }
    setCustomerSearching(true);
    setCustomerSearchDone(false);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(customerSearch)}&limit=5`);
        const data = await res.json();
        setCustomerResults(data.customers || []);
      } catch {
        setCustomerResults([]);
      } finally {
        setCustomerSearching(false);
        setCustomerSearchDone(true);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      setCustomerSearching(false);
    };
  }, [customerSearch]);

  // Service search for create dialog
  useEffect(() => {
    if (serviceSearch.length < 2) {
      setServiceResults([]);
      setServiceSearchDone(false);
      return;
    }
    setServiceSearching(true);
    setServiceSearchDone(false);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/services/search?search=${encodeURIComponent(serviceSearch)}&limit=5`);
        const data = await res.json();
        setServiceResults(data.services || []);
      } catch {
        setServiceResults([]);
      } finally {
        setServiceSearching(false);
        setServiceSearchDone(true);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      setServiceSearching(false);
    };
  }, [serviceSearch]);

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      toast.success(`Invoice marked as ${newStatus}`);
      fetchInvoices();
    } catch {
      toast.error("Failed to update invoice status");
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    const serviceName = serviceType === "service" ? selectedService?.name : customServiceName;
    if (!serviceName) {
      toast.error("Please select or enter a service name");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedCustomer.id,
          serviceName,
          amount: parseFloat(amount),
          notes: notes || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create invoice");
      toast.success("Invoice created successfully");
      setCreateOpen(false);
      resetCreateForm();
      fetchInvoices();
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setCustomerSearch("");
    setCustomerResults([]);
    setCustomerSearching(false);
    setCustomerSearchDone(false);
    setSelectedCustomer(null);
    setServiceSearch("");
    setServiceResults([]);
    setServiceSearching(false);
    setServiceSearchDone(false);
    setSelectedService(null);
    setServiceType("service");
    setCustomServiceName("");
    setAmount("");
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Invoices
          </h1>
          <p className="text-muted-foreground">
            Manage customer invoices ({total} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchInvoices}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={createOpen} onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) resetCreateForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>
                  Create a manual invoice for a customer.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Customer selector */}
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                      <div>
                        <div className="font-medium text-sm">{selectedCustomer.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedCustomer.email}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerSearch("");
                        setCustomerSearchDone(false);
                      }}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Type to search customers..."
                          className="pl-9"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                        {customerSearching && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      {customerResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-auto">
                          {customerResults.map((c) => (
                            <button
                              key={c.id}
                              className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCustomerSearch("");
                                setCustomerResults([]);
                                setCustomerSearchDone(false);
                              }}
                            >
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-muted-foreground">{c.email}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {customerSearchDone && customerResults.length === 0 && customerSearch.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
                          <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                            No customers found for &ldquo;{customerSearch}&rdquo;
                          </div>
                        </div>
                      )}
                      {!selectedCustomer && customerSearch.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Search by name, email, or phone and select from results
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Service type toggle */}
                <div className="space-y-2">
                  <Label>Service *</Label>
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant={serviceType === "service" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setServiceType("service")}
                    >
                      Select Service
                    </Button>
                    <Button
                      variant={serviceType === "custom" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setServiceType("custom")}
                    >
                      Custom Name
                    </Button>
                  </div>
                  {serviceType === "service" ? (
                    selectedService ? (
                      <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                        <span className="text-sm font-medium">{selectedService.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedService(null);
                          setServiceSearch("");
                          setServiceSearchDone(false);
                        }}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Type to search services..."
                            className="pl-9"
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                          />
                          {serviceSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        {serviceResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-auto">
                            {serviceResults.map((s) => (
                              <button
                                key={s.id}
                                className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                                onClick={() => {
                                  setSelectedService(s);
                                  setServiceSearch("");
                                  setServiceResults([]);
                                  setServiceSearchDone(false);
                                }}
                              >
                                {s.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {serviceSearchDone && serviceResults.length === 0 && serviceSearch.length >= 2 && (
                          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
                            <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                              No services found for &ldquo;{serviceSearch}&rdquo;
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <Input
                      placeholder="Enter service name..."
                      value={customServiceName}
                      onChange={(e) => setCustomServiceName(e.target.value)}
                    />
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label>Amount ({currencySymbol}) *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Invoice notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, or invoice #..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            {total} invoice{total !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm">Invoices will appear here when orders are placed.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const total = parseFloat(invoice.total);
                    const paymentStatus = invoice.order?.paymentStatus || "PENDING";
                    const paid = paymentStatus === "PAID" ? total : 0;
                    const due = total - paid;

                    return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{invoice.customerName}</div>
                          <div className="text-xs text-muted-foreground">{invoice.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {invoice.serviceName || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {currencySymbol}{total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {currencySymbol}{paid.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {due > 0 ? (
                          <span className="text-red-600">{currencySymbol}{due.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">{currencySymbol}0.00</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentStatusColors[paymentStatus] || "bg-gray-100 text-gray-700"} variant="secondary">
                          {paymentStatusLabels[paymentStatus] || paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invoice.order?.orderNumber || "Manual"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, "_blank")}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {invoice.status !== "PAID" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "PAID")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            {invoice.status === "PAID" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "SENT")}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Mark as Unpaid
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== "CANCELLED" && invoice.status !== "PAID" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "CANCELLED")}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Invoice
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
