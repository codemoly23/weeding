"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Ban,
  UserPlus,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data
const customers = [
  {
    id: "cust-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+880 1712 345678",
    country: "Bangladesh",
    countryCode: "BD",
    orders: 3,
    totalSpent: 747,
    status: "active",
    joinedAt: "2024-11-15",
    lastOrder: "2024-12-10",
  },
  {
    id: "cust-002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 98765 43210",
    country: "India",
    countryCode: "IN",
    orders: 2,
    totalSpent: 448,
    status: "active",
    joinedAt: "2024-10-20",
    lastOrder: "2024-12-09",
  },
  {
    id: "cust-003",
    name: "Bob Wilson",
    email: "bob@example.com",
    phone: "+92 300 1234567",
    country: "Pakistan",
    countryCode: "PK",
    orders: 1,
    totalSpent: 449,
    status: "active",
    joinedAt: "2024-12-01",
    lastOrder: "2024-12-09",
  },
  {
    id: "cust-004",
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "+971 50 123 4567",
    country: "UAE",
    countryCode: "AE",
    orders: 4,
    totalSpent: 1196,
    status: "active",
    joinedAt: "2024-09-10",
    lastOrder: "2024-12-08",
  },
  {
    id: "cust-005",
    name: "Charlie Davis",
    email: "charlie@example.com",
    phone: "+60 12 345 6789",
    country: "Malaysia",
    countryCode: "MY",
    orders: 1,
    totalSpent: 249,
    status: "inactive",
    joinedAt: "2024-08-15",
    lastOrder: "2024-12-07",
  },
];

const countryFlags: Record<string, string> = {
  BD: "🇧🇩",
  IN: "🇮🇳",
  PK: "🇵🇰",
  AE: "🇦🇪",
  MY: "🇲🇾",
  SG: "🇸🇬",
  GB: "🇬🇧",
  US: "🇺🇸",
};

export default function AdminCustomersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const filteredCustomers = customers.filter((customer) => {
    if (statusFilter !== "all" && customer.status !== statusFilter) return false;
    if (countryFilter !== "all" && customer.countryCode !== countryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ${customers.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ${Math.round(
                customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length
              )}
            </div>
            <p className="text-sm text-muted-foreground">Avg. Order Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="BD">Bangladesh</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="PK">Pakistan</SelectItem>
                <SelectItem value="AE">UAE</SelectItem>
                <SelectItem value="MY">Malaysia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            {filteredCustomers.length} customers total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Country</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="hidden sm:table-cell">Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="font-medium hover:underline"
                        >
                          {customer.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span>{countryFlags[customer.countryCode]}</span>
                      <span>{customer.country}</span>
                    </div>
                  </TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    ${customer.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        customer.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {customer.joinedAt}
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="mr-2 h-4 w-4" />
                          Disable Account
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
