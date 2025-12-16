"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SystemListItem {
  value: string;
  label: string;
  code?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  isPopular: boolean;
}

interface SystemList {
  id: string;
  key: string;
  name: string;
  type: string;
  isEditable: boolean;
  items: SystemListItem[];
}

export default function SystemListViewPage() {
  const params = useParams();
  const listKey = params.key as string;

  const [list, setList] = useState<SystemList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/lists/system/${listKey}`);
      const data = await response.json();

      if (response.ok) {
        setList(data);
      } else {
        toast.error("Failed to load list");
      }
    } catch (error) {
      console.error("Error fetching list:", error);
      toast.error("Failed to load list");
    } finally {
      setIsLoading(false);
    }
  }, [listKey]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Filter items based on search
  const filteredItems =
    list?.items.filter(
      (item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-muted-foreground">List not found</p>
        <Button variant="link" asChild>
          <Link href="/admin/settings/lists">Go back to lists</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/settings/lists">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{list.name}</h1>
            <p className="text-muted-foreground">
              {list.items.length} items • Type: {list.type}
            </p>
          </div>
        </div>
        <Badge variant="secondary">System List</Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>
            {list.isEditable
              ? "You can edit these items."
              : "This is a read-only system list."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {listKey === "countries" && <TableHead>Flag</TableHead>}
                <TableHead>Label</TableHead>
                <TableHead>Value</TableHead>
                {listKey === "countries" && <TableHead>Phone Code</TableHead>}
                {listKey === "us_states" && <TableHead>Filing Fee</TableHead>}
                {listKey === "us_states" && <TableHead>Processing</TableHead>}
                {listKey === "currencies" && <TableHead>Symbol</TableHead>}
                <TableHead>Popular</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={listKey === "countries" ? 5 : 4}
                    className="text-center text-muted-foreground"
                  >
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item, index) => {
                  const metadata = item.metadata as Record<string, unknown> | undefined;
                  return (
                    <TableRow key={item.value + index}>
                      {listKey === "countries" && (
                        <TableCell className="text-xl">{item.icon}</TableCell>
                      )}
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.value}
                      </TableCell>
                      {listKey === "countries" && (
                        <TableCell>
                          {metadata?.phoneCode as string || "-"}
                        </TableCell>
                      )}
                      {listKey === "us_states" && (
                        <>
                          <TableCell>
                            ${(metadata?.filingFee as number) || 0}
                          </TableCell>
                          <TableCell>
                            {(metadata?.processingDays as number) || 0} days
                          </TableCell>
                        </>
                      )}
                      {listKey === "currencies" && (
                        <TableCell>
                          {metadata?.symbol as string || item.value}
                        </TableCell>
                      )}
                      <TableCell>
                        {item.isPopular ? (
                          <Badge variant="secondary">Popular</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
