"use client";

import { useState, useRef } from "react";
import {
  Loader2,
  Download,
  Upload,
  AlertTriangle,
  Trash2,
  FileJson,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ImportPreview {
  services: number;
  pages: number;
  blogs: number;
  faqs: number;
  testimonials: number;
  settings: number;
  menus: number;
  widgets: number;
  [key: string]: number;
}

export default function DataManagementPage() {
  // Export state
  const [exporting, setExporting] = useState(false);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Record<string, unknown> | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importConfirmation, setImportConfirmation] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state
  const [resetting, setResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState("");

  // ---- Export ----
  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/data/export", { method: "POST" });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Export failed");
      }

      const blob = await res.blob();
      const date = new Date().toISOString().split("T")[0];
      const filename = `ceremoney-export-${date}.json`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Data exported successfully", {
        description: `Downloaded as ${filename}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setExporting(false);
    }
  }

  // ---- Import: File Selection & Validation ----
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setImportPreview(null);
    setImportData(null);
    setImportFile(file);

    // Validate the file
    setValidating(true);
    try {
      const text = await file.text();
      let parsed: Record<string, unknown>;

      try {
        parsed = JSON.parse(text);
      } catch {
        toast.error("Invalid JSON file", {
          description: "The selected file is not a valid JSON file.",
        });
        setImportFile(null);
        setValidating(false);
        return;
      }

      // Send to validation endpoint
      const res = await fetch("/api/admin/data/import", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsed }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Validation failed");
      }

      const result = await res.json();
      setImportPreview(result.counts);
      setImportData(parsed);

      toast.success("File validated successfully", {
        description: "Review the preview below and click Import when ready.",
      });
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("File validation failed", {
        description: error instanceof Error ? error.message : "Could not validate the file",
      });
      setImportFile(null);
      setImportData(null);
    } finally {
      setValidating(false);
    }
  }

  // ---- Import: Execute ----
  async function handleImport() {
    if (importConfirmation !== "CONFIRM" || !importData) return;

    setImporting(true);
    setImportDialogOpen(false);
    try {
      const res = await fetch("/api/admin/data/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: importData, confirmation: "CONFIRM" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Import failed");
      }

      toast.success("Data imported successfully", {
        description: "All data has been restored from the uploaded file.",
      });

      // Reset import state
      setImportFile(null);
      setImportData(null);
      setImportPreview(null);
      setImportConfirmation("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import data", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setImporting(false);
    }
  }

  // ---- Reset ----
  async function handleReset() {
    if (resetConfirmation !== "RESET") return;

    setResetting(true);
    setResetDialogOpen(false);
    try {
      const res = await fetch("/api/admin/data/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "RESET" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Reset failed");
      }

      toast.success("Data reset successfully", {
        description: "All content data has been deleted. User accounts and orders were preserved.",
      });

      setResetConfirmation("");
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Failed to reset data", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setResetting(false);
    }
  }

  function clearFileSelection() {
    setImportFile(null);
    setImportData(null);
    setImportPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Data Management</h1>
        <p className="text-muted-foreground">
          Export, import, or reset your website data
        </p>
      </div>

      {/* Section 1: Export Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download all your website content as a JSON file. This includes
                services, pages, blogs, FAQs, testimonials, settings, and more.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {exporting ? "Exporting..." : "Export All Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: Import Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Upload a previously exported JSON file to restore your website
                content.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="import-file">Select JSON file</Label>
            <div className="flex items-center gap-3">
              <Input
                id="import-file"
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={validating || importing}
                className="max-w-md"
              />
              {importFile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFileSelection}
                  disabled={validating || importing}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Validation Loading */}
          {validating && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Validating file...</span>
            </div>
          )}

          {/* Import Preview */}
          {importPreview && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  File validated successfully
                </span>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-muted-foreground" />
                  Data Preview
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Object.entries(importPreview).map(([key, count]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
                    >
                      <span className="text-sm capitalize text-muted-foreground">
                        {key}
                      </span>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <Button
                onClick={() => {
                  setImportConfirmation("");
                  setImportDialogOpen(true);
                }}
                disabled={importing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {importing ? "Importing..." : "Import Data"}
              </Button>
            </div>
          )}

          {/* Importing Loading */}
          {importing && !importPreview && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Importing data...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Reset Data (Danger Zone) */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-700">Reset All Data</CardTitle>
              <CardDescription>
                Permanently delete all content data from your website
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will permanently delete all services, pages, blogs, FAQs,
              testimonials, settings, and design configurations. User accounts,
              orders, invoices, and leads will be preserved.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => {
              setResetConfirmation("");
              setResetDialogOpen(true);
            }}
            disabled={resetting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {resetting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {resetting ? "Resetting..." : "Reset All Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Import Confirmation Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Data Import</DialogTitle>
            <DialogDescription>
              This will import all data from the uploaded file. Existing content
              may be overwritten. Please type{" "}
              <span className="font-mono font-bold">CONFIRM</span> to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="import-confirm-input">Confirmation</Label>
            <Input
              id="import-confirm-input"
              value={importConfirmation}
              onChange={(e) => setImportConfirmation(e.target.value)}
              placeholder="Type CONFIRM to proceed"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importConfirmation !== "CONFIRM"}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-700">
              Confirm Data Reset
            </DialogTitle>
            <DialogDescription>
              This action is irreversible. All services, pages, blogs, FAQs,
              testimonials, settings, and design configurations will be
              permanently deleted. User accounts, orders, invoices, and leads
              will be preserved. Please type{" "}
              <span className="font-mono font-bold">RESET</span> to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reset-confirm-input">Confirmation</Label>
            <Input
              id="reset-confirm-input"
              value={resetConfirmation}
              onChange={(e) => setResetConfirmation(e.target.value)}
              placeholder="Type RESET to proceed"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReset}
              disabled={resetConfirmation !== "RESET"}
              className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
