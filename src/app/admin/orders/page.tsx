"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  RefreshCcw,
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
import { Checkbox } from "@/components/ui/checkbox";

// Mock data
const orders = [
  {
    id: "LLC-2024-ABC123",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      country: "Bangladesh",
    },
    service: "LLC Formation",
    package: "Standard",
    state: "Wyoming",
    amount: 249,
    status: "processing",
    paymentStatus: "paid",
    createdAt: "2024-12-10",
  },
  {
    id: "LLC-2024-DEF456",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
      country: "India",
    },
    service: "EIN Application",
    package: "Basic",
    state: "N/A",
    amount: 99,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-12-09",
  },
  {
    id: "LLC-2024-GHI789",
    customer: {
      name: "Bob Wilson",
      email: "bob@example.com",
      country: "Pakistan",
    },
    service: "LLC Formation",
    package: "Premium",
    state: "Delaware",
    amount: 449,
    status: "pending",
    paymentStatus: "pending",
    createdAt: "2024-12-09",
  },
  {
    id: "LLC-2024-JKL012",
    customer: {
      name: "Alice Brown",
      email: "alice@example.com",
      country: "UAE",
    },
    service: "Amazon Seller",
    package: "Standard",
    state: "N/A",
    amount: 199,
    status: "in_progress",
    paymentStatus: "paid",
    createdAt: "2024-12-08",
  },
  {
    id: "LLC-2024-MNO345",
    customer: {
      name: "Charlie Davis",
      email: "charlie@example.com",
      country: "Malaysia",
    },
    service: "LLC Formation",
    package: "Standard",
    state: "Wyoming",
    amount: 249,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-12-07",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const paymentColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function AdminOrdersPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (paymentFilter !== "all" && order.paymentStatus !== paymentFilter) return false;
    return true;
  });

  const toggleAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    }
  };

  const toggleOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((o) => o !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/admin/orders/new">
              <Package className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "processing").length}
            </div>
            <p className="text-sm text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "in_progress").length}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "completed").length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
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
              {selectedOrders.length} order(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Mark as Processing
              </Button>
              <Button variant="outline" size="sm">
                Mark as Completed
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} orders total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedOrders.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Service</TableHead>
                <TableHead className="hidden lg:table-cell">State</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
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
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.id}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>
                      <p>{order.service}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.package}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {order.state}
                  </TableCell>
                  <TableCell>${order.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[order.status]}
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="secondary"
                      className={paymentColors[order.paymentStatus]}
                    >
                      {order.paymentStatus}
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Order
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Change Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
