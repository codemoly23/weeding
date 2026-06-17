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

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 86400) return "Today";
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return new Date(date).toLocaleDateString();
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AdminCustomersPage() {
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
        toast.success(data.isActive ? "Account re-enabled" : "Account disabled");
        setCustomers((prev) =>
          prev.map((c) => c.id === disableTarget.id ? { ...c, isActive: data.isActive } : c)
        );
      } else {
        toast.error(data.error || "Failed to update account");
      }
    } catch {
      toast.error("Network error");
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
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue (Paid)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ${total > 0 ? Math.round(totalRevenue / total).toLocaleString() : 0}
            </div>
            <p className="text-sm text-muted-foreground">Avg. Revenue / Customer</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
            <Users className="h-4 w-4" /> All Customers
          </CardTitle>
          <CardDescription>{total} customers total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : customers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No customers found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Country</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead className="hidden sm:table-cell">Total Spent</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      {timeAgo(customer.joinedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/customers/${customer.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`mailto:${customer.email}`, "_blank")}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDisableTarget(customer)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {customer.isActive === false ? "Re-enable Account" : "Disable Account"}
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
              <span>Page {page} of {pages}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={page >= pages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
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
              {disableTarget?.isActive === false ? "Re-enable Account?" : "Disable Account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {disableTarget?.isActive === false
                ? `${disableTarget?.name} will be able to log in again.`
                : `${disableTarget?.name} will be immediately unable to log in until re-enabled.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabling}>Cancel</AlertDialogCancel>
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
              {disableTarget?.isActive === false ? "Re-enable" : "Disable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
