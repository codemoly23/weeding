"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, Search, MoreHorizontal, Eye, Mail, Ban, Loader2, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  orders: number;
  totalSpent: number;
  joinedAt: string;
  lastOrderAt: string | null;
  isActive?: boolean;
}

function timeAgo(date: string, t: (key: string, vars?: Record<string, string>) => string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 86400) return t("common.time.today");
  if (diff < 604800) return t("common.time.daysAgo", { count: String(Math.floor(diff / 86400)) });
  if (diff < 2592000) return t("common.time.weeksAgo", { count: String(Math.floor(diff / 604800)) });
  return new Date(date).toLocaleDateString();
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AdminCustomersPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [disableTarget, setDisableTarget] = useState<Customer | null>(null);
  const [disabling, setDisabling] = useState(false);

  const fetchCustomers = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
        setTotalRevenue(data.totalRevenue || 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCustomers(search, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchCustomers]);

  useEffect(() => {
    fetchCustomers(search, page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleDisable() {
    if (!disableTarget) return;
    setDisabling(true);
    try {
      const res = await fetch(`/api/admin/customers/${disableTarget.id}/disable`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.isActive ? t("admin.customers.accountReenabled") : t("admin.customers.accountDisabled"));
        setCustomers((prev) =>
          prev.map((c) => c.id === disableTarget.id ? { ...c, isActive: data.isActive } : c)
        );
      } else {
        toast.error(data.error || t("admin.customers.updateAccountFailed"));
      }
    } catch {
      toast.error(t("common.networkError"));
    } finally {
      setDisabling(false);
      setDisableTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.nav.customers")}</h1>
          <p className="text-muted-foreground">{t("admin.customers.subtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-sm text-muted-foreground">{t("admin.customers.totalCustomers")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground">{t("admin.customers.totalRevenuePaid")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ${total > 0 ? Math.round(totalRevenue / total).toLocaleString() : 0}
            </div>
            <p className="text-sm text-muted-foreground">{t("admin.customers.avgRevenueCustomer")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("admin.customers.searchPlaceholder")}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> {t("admin.customers.allCustomers")}
          </CardTitle>
          <CardDescription>{t("admin.customers.totalCount", { count: String(total) })}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : customers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("admin.customers.noCustomers")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.orders.customer")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("admin.customers.country")}</TableHead>
                  <TableHead>{t("admin.nav.orders")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("admin.customers.totalSpent")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("admin.customers.joined")}</TableHead>
                  <TableHead className="text-right">{t("admin.orders.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {initials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="font-medium hover:underline"
                          >
                            {customer.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{customer.country || "—"}</span>
                    </TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      ${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {timeAgo(customer.joinedAt, t)}
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
                            <Link href={`/admin/customers/${customer.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t("admin.customers.viewProfile")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`mailto:${customer.email}`, "_blank")}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            {t("admin.orders.sendEmail")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDisableTarget(customer)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {customer.isActive === false ? t("admin.customers.reenableAccount") : t("admin.customers.disableAccount")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{t("admin.customers.pageOf", { page: String(page), total: String(pages) })}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {t("common.previous")}
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={page >= pages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("common.next")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disable confirmation dialog */}
      <AlertDialog open={!!disableTarget} onOpenChange={(open) => { if (!open) setDisableTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {disableTarget?.isActive === false ? t("admin.customers.reenableAccountQuestion") : t("admin.customers.disableAccountQuestion")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {disableTarget?.isActive === false
                ? t("admin.customers.reenableAccountDesc", { name: disableTarget?.name ?? "" })
                : t("admin.customers.disableAccountDesc", { name: disableTarget?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabling}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              disabled={disabling}
              className={disableTarget?.isActive !== false ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {disabling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {disableTarget?.isActive === false ? t("admin.customers.reenable") : t("admin.customers.disable")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
