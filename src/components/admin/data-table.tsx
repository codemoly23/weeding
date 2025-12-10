"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
} from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selected: string[]) => void;
  getRowId?: (row: T) => string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row: any) => row.id,
  searchPlaceholder = "Search...",
  onSearch,
  pagination,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map((row) => getRowId(row)));
    }
  };

  const toggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      onSelectionChange?.(selectedRows.filter((rowId) => rowId !== id));
    } else {
      onSelectionChange?.([...selectedRows, id]);
    }
  };

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {onSearch && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-9"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          {selectedRows.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedRows.length} row(s) selected
            </p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    ref={(ref) => {
                      if (ref) {
                        (ref as HTMLButtonElement).dataset.state = someSelected
                          ? "indeterminate"
                          : allSelected
                          ? "checked"
                          : "unchecked";
                      }
                    }}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.includes(rowId);

                return (
                  <TableRow
                    key={rowId}
                    data-state={isSelected ? "selected" : undefined}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(rowId)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={pagination.page >= totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={pagination.page >= totalPages}
                onClick={() => pagination.onPageChange(totalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
