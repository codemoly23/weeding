"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Send,
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
  DropdownMenuLabel,
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getCurrencySymbol } from "@/components/ui/currency-selector";
import { useLanguage } from "@/lib/i18n/language-context";

type OrderStatus = "PENDING" | "PROCESSING" | "IN_PROGRESS" | "WAITING_FOR_INFO" | "COMPLETED" | "CANCELLED" | "REFUNDED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalUSD: string;
  customerName: string;
  customerEmail: string;
  customerCountry: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    priceUSD: string;
    stateFee: string | null;
    locationName: string | null;
    locationFeeLabel: string | null;
    service: { id: string; name: string; slug: string } | null;
    package: { id: string; name: string } | null;
  }>;
  user: {
    id: string;
    email: string;
    name: string | null;
    country: string | null;
  };
}

const statusOptions: { value: OrderStatus; labelKey: string }[] = [
  { value: "PENDING", labelKey: "admin.status.PENDING" },
  { value: "PROCESSING", labelKey: "admin.status.PROCESSING" },
  { value: "IN_PROGRESS", labelKey: "admin.status.IN_PROGRESS" },
  { value: "WAITING_FOR_INFO", labelKey: "admin.status.WAITING_FOR_INFO" },
  { value: "COMPLETED", labelKey: "admin.status.COMPLETED" },
  { value: "CANCELLED", labelKey: "admin.status.CANCELLED" },
  { value: "REFUNDED", labelKey: "admin.status.REFUNDED" },
];

const statusColors: Record<string, string> = {
  PENDING:          "admin-status-neutral",
  PROCESSING:       "admin-status-info",
  IN_PROGRESS:      "admin-status-warning",
  WAITING_FOR_INFO: "admin-status-hold",
  COMPLETED:        "admin-status-success",
  CANCELLED:        "admin-status-error",
  REFUNDED:         "admin-status-neutral",
};

const paymentColors: Record<string, string> = {
  PENDING:  "admin-status-warning",
  PAID:     "admin-status-success",
  FAILED:   "admin-status-error",
  REFUNDED: "admin-status-neutral",
};

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

export default function AdminOrdersPage() {
  const { t, lang } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [emailModal, setEmailModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    inProgress: 0,
    completed: 0,
  });

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: perPage.toString(),
        search: searchQuery,
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (paymentFilter !== "all") {
        params.append("paymentStatus", paymentFilter);
      }

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
        setTotalOrders(data.pagination.total);

        // Calculate stats from fetched orders
        const pending = data.orders.filter((o: Order) => o.status === "PENDING").length;
        const processing = data.orders.filter((o: Order) => o.status === "PROCESSING").length;
        const inProgress = data.orders.filter((o: Order) => o.status === "IN_PROGRESS").length;
        const completed = data.orders.filter((o: Order) => o.status === "COMPLETED").length;
        setStats({ pending, processing, inProgress, completed });
      } else {
        toast.error(t("admin.orders.fetchFailed"));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(t("admin.orders.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, perPage, searchQuery, statusFilter, paymentFilter, t]);

  useEffect(() => {
    fetchOrders();
    // Fetch currency from business config
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.currency) setCurrencySymbol(getCurrencySymbol(config.currency));
      })
      .catch(() => {});
  }, [fetchOrders]);

  const handleFilterChange = (type: "status" | "payment" | "search", value: string) => {
    setCurrentPage(1);
    if (type === "status") setStatusFilter(value);
    else if (type === "payment") setPaymentFilter(value);
    else setSearchQuery(value);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Status updated successfully");
        setOrders((prev) =>
          prev.map((order) =>
            order.orderNumber === orderId || order.id === orderId
              ? { ...order, status: newStatus }
              : order
          )
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const toggleAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const toggleOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((o) => o !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === "sv" ? "sv-SE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: string) => {
    return `${currencySymbol}${parseFloat(price).toFixed(0)}`;
  };

  // Bulk status update
  const handleBulkStatusUpdate = async (newStatus: OrderStatus) => {
    if (selectedOrders.length === 0) return;

    setIsBulkUpdating(true);
    try {
      const response = await fetch("/api/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: selectedOrders,
          action: "updateStatus",
          status: newStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setSelectedOrders([]);
        fetchOrders();
      } else {
        toast.error(t("admin.orders.updateFailed"));
      }
    } catch (error) {
      console.error("Error bulk updating:", error);
      toast.error(t("admin.orders.updateFailed"));
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;

    if (!confirm(t("admin.orders.deleteConfirm", { count: String(selectedOrders.length) }))) {
      return;
    }

    setIsBulkUpdating(true);
    try {
      const response = await fetch("/api/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: selectedOrders,
          action: "delete",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setSelectedOrders([]);
        fetchOrders();
      } else {
        toast.error(t("admin.orders.deleteFailed"));
      }
    } catch (error) {
      console.error("Error bulk deleting:", error);
      toast.error(t("admin.orders.deleteFailed"));
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const openEmailModal = (order: Order) => {
    setEmailModal({ open: true, order });
    setEmailSubject(t("admin.orders.emailDefaultSubject", { orderNumber: order.orderNumber }));
    setEmailMessage("");
  };

  const closeEmailModal = () => {
    setEmailModal({ open: false, order: null });
    setEmailSubject("");
    setEmailMessage("");
  };

  const handleSendEmail = async () => {
    if (!emailModal.order) return;
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error(t("admin.orders.emailRequired"));
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch(
        `/api/admin/orders/${emailModal.order.orderNumber}/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: emailSubject, message: emailMessage }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(t("admin.orders.emailSent", { email: emailModal.order.customerEmail }));
        closeEmailModal();
      } else {
        toast.error(data.error || t("admin.orders.emailFailed"));
      }
    } catch {
      toast.error(t("admin.orders.emailFailed"));
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Export orders
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (paymentFilter !== "all") params.append("paymentStatus", paymentFilter);

      const response = await fetch(`/api/orders/export?${params}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(t("admin.orders.exportSuccess"));
      } else {
        toast.error(t("admin.orders.exportFailed"));
      }
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error(t("admin.orders.exportFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.nav.orders")}</h1>
          <p className="text-muted-foreground">
            {t("admin.orders.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t("common.export")}
          </Button>
          <Button asChild className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-hover)] text-[var(--admin-primary-fg)] border-0">
            <Link href="/admin/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.dashboard.newOrder")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">{t("admin.status.PENDING")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-sm text-muted-foreground">{t("admin.status.PROCESSING")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground">{t("admin.status.IN_PROGRESS")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">{t("admin.status.COMPLETED")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.orders.searchPlaceholder")}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => handleFilterChange("status", v)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("admin.orders.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.orders.allStatus")}</SelectItem>
                <SelectItem value="PENDING">{t("admin.status.PENDING")}</SelectItem>
                <SelectItem value="PROCESSING">{t("admin.status.PROCESSING")}</SelectItem>
                <SelectItem value="IN_PROGRESS">{t("admin.status.IN_PROGRESS")}</SelectItem>
                <SelectItem value="COMPLETED">{t("admin.status.COMPLETED")}</SelectItem>
                <SelectItem value="CANCELLED">{t("admin.status.CANCELLED")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={(v) => handleFilterChange("payment", v)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("admin.orders.payment")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.orders.allPayments")}</SelectItem>
                <SelectItem value="PENDING">{t("admin.payment.PENDING")}</SelectItem>
                <SelectItem value="PAID">{t("admin.payment.PAID")}</SelectItem>
                <SelectItem value="FAILED">{t("admin.payment.FAILED")}</SelectItem>
                <SelectItem value="REFUNDED">{t("admin.payment.REFUNDED")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">
              {t("admin.orders.selectedCount", { count: String(selectedOrders.length) })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate("PROCESSING")}
                disabled={isBulkUpdating}
              >
                {t("admin.orders.markProcessing")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate("COMPLETED")}
                disabled={isBulkUpdating}
              >
                {t("admin.orders.markCompleted")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate("CANCELLED")}
                disabled={isBulkUpdating}
              >
                {t("admin.orders.markCancelled")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkUpdating}
              >
                {isBulkUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("admin.orders.deleteSelected")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("admin.orders.allOrders")}</CardTitle>
              <CardDescription>
                {t("admin.orders.totalCount", { count: String(totalOrders) })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("admin.orders.perPage")}</span>
              <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">{t("admin.orders.noOrdersFound")}</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? t("admin.orders.adjustSearch")
                  : t("admin.orders.empty")}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedOrders.length === orders.length &&
                          orders.length > 0
                        }
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>{t("admin.orders.order")}</TableHead>
                    <TableHead>{t("admin.orders.customer")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("admin.orders.service")}</TableHead>
                    <TableHead>{t("admin.orders.amount")}</TableHead>
                    <TableHead>{t("admin.orders.status")}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t("admin.orders.payment")}</TableHead>
                    <TableHead className="text-right">{t("admin.orders.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => toggleOrder(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <Link
                            href={`/admin/orders/${order.orderNumber}`}
                            className="font-medium hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="font-medium">{order.items[0]?.service?.name || order.items[0]?.name.split(" - ")[0] || t("common.notAvailable")}</p>
                          {order.items[0]?.package && (
                            <p className="text-xs text-muted-foreground">
                              {order.items[0].package.name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(order.totalUSD)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value: OrderStatus) =>
                            handleStatusChange(order.orderNumber, value)
                          }
                        >
                          <SelectTrigger
                            className={`w-36 h-7 text-xs font-medium border ${statusColors[order.status]}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {t(option.labelKey)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="secondary"
                          className={paymentColors[order.paymentStatus]}
                        >
                          {t(`admin.payment.${order.paymentStatus}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("admin.orders.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.orderNumber}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t("admin.orders.viewDetails")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.orderNumber}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t("admin.orders.editOrder")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEmailModal(order)}>
                              <Mail className="mr-2 h-4 w-4" />
                              {t("admin.orders.sendEmail")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.orders.showing", {
                      start: String((currentPage - 1) * perPage + 1),
                      end: String(Math.min(currentPage * perPage, totalOrders)),
                      total: String(totalOrders),
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t("common.previous")}
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          );
                        })
                        .map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-2 text-muted-foreground">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t("common.next")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {/* Send Email Modal */}
      <Dialog open={emailModal.open} onOpenChange={(open) => !open && closeEmailModal()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("admin.orders.sendEmailToCustomer")}</DialogTitle>
            <DialogDescription>
              {emailModal.order && (
                <>
                  {t("admin.orders.to")} <strong>{emailModal.order.customerName}</strong> &lt;{emailModal.order.customerEmail}&gt;
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({emailModal.order.orderNumber})
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="email-subject">{t("admin.orders.subject")}</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={t("admin.orders.emailSubjectPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-message">{t("admin.orders.message")}</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder={t("admin.orders.emailMessagePlaceholder")}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEmailModal} disabled={isSendingEmail}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail}>
              {isSendingEmail ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {t("admin.orders.sendEmail")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
