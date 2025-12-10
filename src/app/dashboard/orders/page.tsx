import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
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

// Mock data - replace with real data
const orders = [
  {
    id: "LLC-2024-ABC123",
    service: "LLC Formation",
    package: "Standard",
    state: "Wyoming",
    status: "completed",
    paymentStatus: "paid",
    date: "2024-12-05",
    total: "$249",
  },
  {
    id: "LLC-2024-DEF456",
    service: "EIN Application",
    package: "Standard",
    state: null,
    status: "in_progress",
    paymentStatus: "paid",
    date: "2024-12-08",
    total: "$79",
  },
  {
    id: "LLC-2024-GHI789",
    service: "Registered Agent",
    package: "Annual",
    state: "Wyoming",
    status: "pending",
    paymentStatus: "paid",
    date: "2024-12-10",
    total: "$99",
  },
  {
    id: "LLC-2024-JKL012",
    service: "Amazon Seller Account",
    package: "Premium",
    state: null,
    status: "processing",
    paymentStatus: "paid",
    date: "2024-12-09",
    total: "$499",
  },
];

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  in_progress: "bg-amber-100 text-amber-700",
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  pending: "Pending",
  processing: "Processing",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">
            View and manage all your orders
          </p>
        </div>
        <Button asChild>
          <Link href="/services">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or service..."
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
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
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            You have {orders.length} orders in total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="hidden md:table-cell">Package</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.service}</p>
                      {order.state && (
                        <p className="text-sm text-muted-foreground">
                          {order.state}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.package}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[order.status]}
                    >
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {order.total}
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
