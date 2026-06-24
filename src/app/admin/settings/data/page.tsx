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
import { useLanguage } from "@/lib/i18n/language-context";

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
  const { t } = useLanguage();
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
  const [resetAdminEmail, setResetAdminEmail] = useState("");

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

      toast.success(t("admin.data.exportSuccess"), {
        description: t("admin.data.exportSuccessDesc", { filename }),
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("admin.data.exportFailed"), {
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
        toast.error(t("admin.data.invalidJson"), {
          description: t("admin.data.invalidJsonDesc"),
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

      toast.success(t("admin.data.fileValidated"), {
        description: t("admin.data.validateSuccessDesc"),
      });
    } catch (error) {
      console.error("Validation error:", error);
      toast.error(t("admin.data.validateFailed"), {
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

      toast.success(t("admin.data.importSuccess"), {
        description: t("admin.data.importSuccessDesc"),
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
      toast.error(t("admin.data.importFailed"), {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setImporting(false);
    }
  }

  // ---- Reset ----
  async function handleReset() {
    if (resetConfirmation !== "RESET" || !resetAdminEmail.trim()) return;

    setResetting(true);
    setResetDialogOpen(false);
    try {
      const res = await fetch("/api/admin/data/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "RESET", adminEmail: resetAdminEmail.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Reset failed");
      }

      toast.success(t("admin.data.resetSuccess"), {
        description: t("admin.data.resetSuccessDesc"),
      });

      setResetConfirmation("");
      setResetAdminEmail("");
    } catch (error) {
      console.error("Reset error:", error);
      toast.error(t("admin.data.resetFailed"), {
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
        <h1 className="text-2xl font-bold">{t("admin.data.title")}</h1>
        <p className="text-muted-foreground">
          {t("admin.data.subtitle")}
        </p>
      </div>

      {/* Section 1: Export Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--ast-info-bg)] rounded-lg">
              <Download className="h-6 w-6 text-[var(--ast-info-icon)]" />
            </div>
            <div>
              <CardTitle>{t("admin.data.exportTitle")}</CardTitle>
              <CardDescription>
                {t("admin.data.exportDesc")}
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
            {exporting ? t("admin.data.exporting") : t("admin.data.exportAll")}
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: Import Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--ast-success-bg)] rounded-lg">
              <Upload className="h-6 w-6 text-[var(--ast-success-icon)]" />
            </div>
            <div>
              <CardTitle>{t("admin.data.importTitle")}</CardTitle>
              <CardDescription>
                {t("admin.data.importDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="import-file">{t("admin.data.selectJson")}</Label>
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
                  {t("admin.data.clear")}
                </Button>
              )}
            </div>
          </div>

          {/* Validation Loading */}
          {validating && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{t("admin.data.validating")}</span>
            </div>
          )}

          {/* Import Preview */}
          {importPreview && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--ast-success-icon)]" />
                <span className="text-sm font-medium text-[var(--ast-success-text)]">
                  {t("admin.data.fileValidated")}
                </span>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-muted-foreground" />
                  {t("admin.data.dataPreview")}
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
                className="bg-[var(--ast-success-icon)] hover:bg-[var(--ast-success-text)] text-white"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {importing ? t("admin.data.importing") : t("admin.data.importData")}
              </Button>
            </div>
          )}

          {/* Importing Loading */}
          {importing && !importPreview && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{t("admin.data.importingData")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Reset Data (Danger Zone) */}
      <Card className="border-[var(--ast-error-border)]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--ast-error-bg)] rounded-lg">
              <AlertTriangle className="h-6 w-6 text-[var(--ast-error-icon)]" />
            </div>
            <div>
              <CardTitle className="text-[var(--ast-error-text)]">{t("admin.data.resetTitle")}</CardTitle>
              <CardDescription>
                {t("admin.data.resetDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t("admin.data.resetWarning")}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => {
              setResetConfirmation("");
              setResetAdminEmail("");
              setResetDialogOpen(true);
            }}
            disabled={resetting}
            className="bg-[var(--ast-error-icon)] hover:bg-[var(--ast-error-text)] text-white"
          >
            {resetting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {resetting ? t("admin.data.resetting") : t("admin.data.resetAll")}
          </Button>
        </CardContent>
      </Card>

      {/* Import Confirmation Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.data.importDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.data.importDialogDescPre")}{" "}
              <span className="font-mono font-bold">CONFIRM</span>{" "}
              {t("admin.data.importDialogDescPost")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="import-confirm-input">{t("admin.data.confirmation")}</Label>
            <Input
              id="import-confirm-input"
              value={importConfirmation}
              onChange={(e) => setImportConfirmation(e.target.value)}
              placeholder={t("admin.data.typeConfirm")}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              {t("admin.data.cancel")}
            </Button>
            <Button
              onClick={handleImport}
              disabled={importConfirmation !== "CONFIRM"}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t("admin.data.importData")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[var(--ast-error-text)]">
              {t("admin.data.resetDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.data.resetDialogDescPre")}{" "}
              <span className="font-mono font-bold">RESET</span>{" "}
              {t("admin.data.resetDialogDescPost")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email-input">{t("admin.data.adminEmail")}</Label>
              <Input
                id="reset-email-input"
                type="email"
                value={resetAdminEmail}
                onChange={(e) => setResetAdminEmail(e.target.value)}
                placeholder={t("admin.data.adminEmailPlaceholder")}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-input">{t("admin.data.confirmation")}</Label>
              <Input
                id="reset-confirm-input"
                value={resetConfirmation}
                onChange={(e) => setResetConfirmation(e.target.value)}
                placeholder={t("admin.data.typeReset")}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
            >
              {t("admin.data.cancel")}
            </Button>
            <Button
              onClick={handleReset}
              disabled={resetConfirmation !== "RESET" || !resetAdminEmail.trim()}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("admin.data.resetAll")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
