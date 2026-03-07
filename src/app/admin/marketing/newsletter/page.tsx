"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  RefreshCw,
  Loader2,
  Download,
  Trash2,
  Users,
  UserMinus,
  TrendingUp,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

interface Subscriber {
  id: string;
  firstName: string;
  email: string;
  country: string | null;
  source: string;
  newsletterSubscribed: boolean;
  newsletterUnsubAt: string | null;
  createdAt: string;
}

interface Stats {
  totalSubscribers: number;
  totalUnsubscribed: number;
  newLast30Days: number;
  topCountries: { country: string | null; count: number }[];
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("subscribed");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletter/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {
      console.error("Failed to fetch stats");
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        status: statusFilter,
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/newsletter/subscribers?${params}`);
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      toast.error("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleBulkUnsubscribe = async () => {
    if (selected.length === 0) return;
    try {
      const res = await fetch("/api/admin/newsletter/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelected([]);
        fetchSubscribers();
        fetchStats();
      }
    } catch {
      toast.error("Failed to unsubscribe");
    }
  };

  const handleExportCSV = () => {
    const csv = [
      "Email,First Name,Country,Source,Subscribed,Date",
      ...subscribers.map((s) =>
        [s.email, s.firstName, s.country || "", s.source, s.newsletterSubscribed ? "Yes" : "No", new Date(s.createdAt).toLocaleDateString()].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground text-sm">Manage your newsletter subscribers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => { fetchSubscribers(); fetchStats(); }}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
              <UserMinus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUnsubscribed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New (30 days)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLast30Days}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Countries</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.topCountries.length > 0
                  ? stats.topCountries.map((c) => `${c.country || "Unknown"} (${c.count})`).join(", ")
                  : "No data"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subscribed">Subscribed</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            {selected.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkUnsubscribe}>
                <Trash2 className="mr-2 h-4 w-4" /> Unsubscribe ({selected.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscriber Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.length === subscribers.length && subscribers.length > 0}
                    onCheckedChange={(checked) => {
                      setSelected(checked ? subscribers.map((s) => s.id) : []);
                    }}
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(sub.id)}
                        onCheckedChange={(checked) => {
                          setSelected(
                            checked
                              ? [...selected, sub.id]
                              : selected.filter((id) => id !== sub.id)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{sub.email}</TableCell>
                    <TableCell>{sub.firstName}</TableCell>
                    <TableCell>{sub.country || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {sub.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.newsletterSubscribed ? "default" : "secondary"}>
                        {sub.newsletterSubscribed ? "Subscribed" : "Unsubscribed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
