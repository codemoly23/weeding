"use client";

import { useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  File,
  Image,
  FileCheck,
  FileClock,
  FileX,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Mock data
const documents = [
  {
    id: "1",
    name: "Articles of Organization",
    type: "LLC Document",
    status: "approved",
    uploadedAt: "2024-12-05",
    orderId: "LLC-2024-ABC123",
    fileType: "pdf",
    size: "245 KB",
  },
  {
    id: "2",
    name: "Operating Agreement",
    type: "LLC Document",
    status: "approved",
    uploadedAt: "2024-12-05",
    orderId: "LLC-2024-ABC123",
    fileType: "pdf",
    size: "512 KB",
  },
  {
    id: "3",
    name: "EIN Confirmation Letter",
    type: "Tax Document",
    status: "pending",
    uploadedAt: "2024-12-08",
    orderId: "LLC-2024-DEF456",
    fileType: "pdf",
    size: "128 KB",
  },
  {
    id: "4",
    name: "Passport Copy",
    type: "ID Document",
    status: "approved",
    uploadedAt: "2024-12-04",
    orderId: "LLC-2024-ABC123",
    fileType: "image",
    size: "1.2 MB",
  },
  {
    id: "5",
    name: "Address Proof",
    type: "ID Document",
    status: "rejected",
    uploadedAt: "2024-12-04",
    orderId: "LLC-2024-ABC123",
    fileType: "image",
    size: "890 KB",
    rejectionReason: "Document is not clear. Please upload a higher quality image.",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof FileCheck }> = {
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    icon: FileCheck,
  },
  pending: {
    label: "Pending Review",
    color: "bg-amber-100 text-amber-700",
    icon: FileClock,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    icon: FileX,
  },
};

export default function DocumentsPage() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">
            Manage and download your business documents
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload documents for verification or your records
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="docType">Document Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="id">National ID</SelectItem>
                    <SelectItem value="address">Address Proof</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, PNG, JPG up to 10MB
                  </p>
                  <Input
                    id="file"
                    type="file"
                    className="mt-4"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                </div>
              </div>
              <Button className="w-full" onClick={() => setUploadDialogOpen(false)}>
                Upload Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {documents.filter((d) => d.status === "approved").length}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <FileClock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {documents.filter((d) => d.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <FileX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {documents.filter((d) => d.status === "rejected").length}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="llc">LLC Documents</SelectItem>
                <SelectItem value="tax">Tax Documents</SelectItem>
                <SelectItem value="id">ID Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            {documents.length} documents in your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => {
                const status = statusConfig[doc.status];
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {doc.fileType === "pdf" ? (
                            <FileText className="h-5 w-5 text-red-500" />
                          ) : (
                            <Image className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.size} • {doc.uploadedAt}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doc.type}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {doc.orderId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={status.color}>
                        {status.label}
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
