"use client";

import { useState, useEffect, useRef } from "react";
import {
  Puzzle,
  Loader2,
  Power,
  PowerOff,
  Settings,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  RefreshCw,
  Key,
  Shield,
  Globe,
  MessageSquare,
  Sparkles,
  Upload,
  type LucideIcon,
} from "lucide-react";

// Map of icon names to actual icon components
const iconMap: Record<string, LucideIcon> = {
  MessageSquare,
  Puzzle,
  Package,
  Settings,
  Key,
  Shield,
  Globe,
  Sparkles,
};
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";

interface Plugin {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  version: string;
  author: string | null;
  authorUrl: string | null;
  icon: string | null;
  status: "INSTALLED" | "ACTIVE" | "DISABLED" | "ERROR";
  licenseKey: string | null;
  licenseType: string | null;
  licenseTier: string | null;
  licenseVerifiedAt: string | null;
  hasAdminPages: boolean;
  hasPublicPages: boolean;
  hasWidgets: boolean;
  hasApiRoutes: boolean;
  installedAt: string;
  lastActivatedAt: string | null;
  lastError: string | null;
  _count: {
    settings: number;
    menuItems: number;
  };
}

const statusConfig = {
  ACTIVE: {
    labelKey: "admin.plugins.statusActive",
    color: "admin-status-success",
    icon: CheckCircle2,
  },
  INSTALLED: {
    labelKey: "admin.plugins.statusInstalled",
    color: "admin-status-warning",
    icon: Package,
  },
  DISABLED: {
    labelKey: "admin.plugins.statusDisabled",
    color: "admin-status-neutral",
    icon: PowerOff,
  },
  ERROR: {
    labelKey: "admin.plugins.statusError",
    color: "admin-status-error",
    icon: XCircle,
  },
};

export default function PluginsPage() {
  const { t } = useLanguage();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // License activation states
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlugins();
  }, []);

  async function fetchPlugins() {
    try {
      const res = await fetch("/api/admin/plugins?includeMenuItems=true");
      const data = await res.json();
      if (data.plugins) {
        setPlugins(data.plugins);
      }
    } catch {
      toast.error(t("admin.plugins.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/plugins/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t("admin.plugins.uploadFailed"));
        return;
      }

      toast.success(data.message || t("admin.plugins.uploadPlugin"));
      fetchPlugins();
    } catch {
      toast.error(t("admin.plugins.uploadFailed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function togglePlugin(slug: string, currentStatus: string) {
    setActionLoading(slug);
    try {
      const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
      const res = await fetch(`/api/admin/plugins/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update plugin");

      const data = await res.json();
      toast.success(data.message);
      fetchPlugins();
    } catch {
      toast.error(t("admin.plugins.updateFailed"));
    } finally {
      setActionLoading(null);
    }
  }

  function openLicenseDialog(plugin: Plugin) {
    setSelectedPlugin(plugin);
    setLicenseKey("");
    setAgreedToTerms(false);
    setActivationError(null);
    setLicenseDialogOpen(true);
  }

  async function activateWithLicense() {
    if (!selectedPlugin || !licenseKey.trim()) return;

    setActivating(true);
    setActivationError(null);

    try {
      const res = await fetch(`/api/admin/plugins/${selectedPlugin.slug}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          agreedToTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActivationError(data.message || data.error || "Activation failed");
        return;
      }

      toast.success(data.message || t("admin.plugins.activate") + ` ${selectedPlugin.name}`);
      setLicenseDialogOpen(false);
      setSelectedPlugin(null);
      setLicenseKey("");
      setAgreedToTerms(false);
      fetchPlugins();
    } catch {
      setActivationError(t("admin.plugins.activationFailed"));
    } finally {
      setActivating(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Puzzle className="h-6 w-6" />
            {t("admin.plugins.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.plugins.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? t("admin.plugins.uploading") : t("admin.plugins.uploadPlugin")}
          </Button>
          <Button variant="outline" onClick={fetchPlugins}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("admin.plugins.refresh")}
          </Button>
        </div>
      </div>

      <Separator />

      {/* No plugins message */}
      {plugins.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("admin.plugins.noPlugins")}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t("admin.plugins.noPluginsDesc")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Plugins Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plugins.map((plugin) => {
          const StatusIcon = statusConfig[plugin.status].icon;
          const isLoading = actionLoading === plugin.slug;
          const needsActivation = plugin.status === "INSTALLED";

          return (
            <Card key={plugin.id} className="relative overflow-hidden">
              {/* Status indicator stripe */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  plugin.status === "ACTIVE"
                    ? "bg-[var(--ast-success-icon)]"
                    : plugin.status === "ERROR"
                    ? "bg-[var(--ast-error-icon)]"
                    : plugin.status === "DISABLED"
                    ? "bg-[var(--ast-neutral-icon)]"
                    : "bg-[var(--ast-warning-icon)]"
                }`}
              />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      {(() => {
                        const IconComponent = plugin.icon && iconMap[plugin.icon];
                        if (IconComponent) {
                          return <IconComponent className="h-5 w-5 text-primary" />;
                        }
                        if (plugin.icon && !/^[a-zA-Z]+$/.test(plugin.icon)) {
                          return <span className="text-xl">{plugin.icon}</span>;
                        }
                        return <Puzzle className="h-5 w-5 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <CardTitle className="text-base">{plugin.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">v{plugin.version}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusConfig[plugin.status].color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {t(statusConfig[plugin.status].labelKey)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plugin.description && (
                  <CardDescription className="line-clamp-2">
                    {plugin.description}
                  </CardDescription>
                )}

                {/* Plugin info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  {plugin.author && (
                    <p className="flex items-center gap-1">
                      {t("admin.plugins.by")}{" "}
                      {plugin.authorUrl ? (
                        <a
                          href={plugin.authorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {plugin.author}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        plugin.author
                      )}
                    </p>
                  )}
                  {plugin.lastActivatedAt && (
                    <p>{t("admin.plugins.lastActivated")} {formatDate(plugin.lastActivatedAt)}</p>
                  )}
                  {plugin.licenseType && (
                    <p className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      {t("admin.plugins.license")} {plugin.licenseTier || plugin.licenseType}
                    </p>
                  )}
                </div>

                {/* Features badges */}
                <div className="flex flex-wrap gap-1">
                  {plugin.hasAdminPages && (
                    <Badge variant="secondary" className="text-xs">{t("admin.plugins.adminPages")}</Badge>
                  )}
                  {plugin.hasWidgets && (
                    <Badge variant="secondary" className="text-xs">{t("admin.plugins.widgets")}</Badge>
                  )}
                  {plugin.hasApiRoutes && (
                    <Badge variant="secondary" className="text-xs">{t("admin.plugins.apiRoutes")}</Badge>
                  )}
                </div>

                {/* Error message */}
                {plugin.status === "ERROR" && plugin.lastError && (
                  <div className="bg-[var(--ast-error-bg)] border border-[var(--ast-error-border)] rounded-md p-2">
                    <p className="text-xs text-[var(--ast-error-text)] flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{plugin.lastError}</span>
                    </p>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {needsActivation ? (
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={isLoading}
                      onClick={() => openLicenseDialog(plugin)}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-1" />
                          {t("admin.plugins.activate")}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant={plugin.status === "ACTIVE" ? "outline" : "default"}
                      size="sm"
                      className="flex-1"
                      disabled={isLoading}
                      onClick={() => togglePlugin(plugin.slug, plugin.status)}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : plugin.status === "ACTIVE" ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-1" />
                          {t("admin.plugins.disable")}
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-1" />
                          {t("admin.plugins.enable")}
                        </>
                      )}
                    </Button>
                  )}

                  {plugin.status === "ACTIVE" && plugin._count.settings > 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/settings/plugins/${plugin.slug}`}>
                        <Settings className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* How It Works Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("admin.plugins.howItWorksTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{t("admin.plugins.step1Title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("admin.plugins.step1Desc")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{t("admin.plugins.step2Title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("admin.plugins.step2Desc")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{t("admin.plugins.step3Title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("admin.plugins.step3Desc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* License Activation Dialog */}
      <Dialog open={licenseDialogOpen} onOpenChange={setLicenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.plugins.dialogTitle", { name: selectedPlugin?.name ?? "" })}</DialogTitle>
            <DialogDescription>
              {t("admin.plugins.dialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license-key">{t("admin.plugins.licenseKey")}</Label>
              <Input
                id="license-key"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="agree-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <Label htmlFor="agree-terms" className="text-sm font-normal cursor-pointer">
                {t("admin.plugins.agreeTerms")}
              </Label>
            </div>
            {activationError && (
              <div className="bg-[var(--ast-error-bg)] border border-[var(--ast-error-border)] rounded-md p-3">
                <p className="text-sm text-[var(--ast-error-text)] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {activationError}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLicenseDialogOpen(false)}
              disabled={activating}
            >
              {t("admin.plugins.cancel")}
            </Button>
            <Button
              onClick={activateWithLicense}
              disabled={activating || !licenseKey.trim() || !agreedToTerms}
            >
              {activating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.plugins.activating")}
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  {t("admin.plugins.activatePlugin")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
