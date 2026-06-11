"use client";

import { useState, useEffect, useCallback } from "react";
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
    label: "Active",
    color: "admin-status-success",
    icon: CheckCircle2,
  },
  INSTALLED: {
    label: "Installed",
    color: "admin-status-warning",
    icon: Package,
  },
  DISABLED: {
    label: "Disabled",
    color: "admin-status-neutral",
    icon: PowerOff,
  },
  ERROR: {
    label: "Error",
    color: "admin-status-error",
    icon: XCircle,
  },
};

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    } catch (error) {
      console.error("Error fetching plugins:", error);
      toast.error("Failed to load plugins");
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error("Error toggling plugin:", error);
      toast.error("Failed to update plugin status");
    } finally {
      setActionLoading(null);
    }
  }

  // Open license activation dialog
  function openLicenseDialog(plugin: Plugin) {
    setSelectedPlugin(plugin);
    setLicenseKey("");
    setAgreedToTerms(false);
    setActivationError(null);
    setLicenseDialogOpen(true);
  }

  // Activate plugin with license
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

      toast.success(data.message || `${selectedPlugin.name} activated successfully!`);
      setLicenseDialogOpen(false);
      setSelectedPlugin(null);
      setLicenseKey("");
      setAgreedToTerms(false);
      fetchPlugins();
    } catch (error) {
      console.error("Activation error:", error);
      setActivationError("Failed to activate plugin. Please try again.");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Puzzle className="h-6 w-6" />
            Plugins
          </h1>
          <p className="text-muted-foreground">
            Manage installed plugins
          </p>
        </div>
        <Button variant="outline" onClick={fetchPlugins}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Separator />

      {/* No plugins message */}
      {plugins.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No plugins available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Installed plugins will appear here after upload or installation.
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
                    {statusConfig[plugin.status].label}
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
                      By{" "}
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
                    <p>Last activated: {formatDate(plugin.lastActivatedAt)}</p>
                  )}
                  {plugin.licenseType && (
                    <p className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      License: {plugin.licenseTier || plugin.licenseType}
                    </p>
                  )}
                </div>

                {/* Features badges */}
                <div className="flex flex-wrap gap-1">
                  {plugin.hasAdminPages && (
                    <Badge variant="secondary" className="text-xs">Admin Pages</Badge>
                  )}
                  {plugin.hasWidgets && (
                    <Badge variant="secondary" className="text-xs">Widgets</Badge>
                  )}
                  {plugin.hasApiRoutes && (
                    <Badge variant="secondary" className="text-xs">API Routes</Badge>
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
                      onClick={() => togglePlugin(plugin.slug, plugin.status)}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  ) : (
                    // Show Enable/Disable button for ACTIVE or DISABLED status
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
                          Disable
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-1" />
                          Enable
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
            How Plugin Activation Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">1. Install Plugin</h4>
              <p className="text-sm text-muted-foreground">
                Upload or install a compatible plugin package.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">2. Activate</h4>
              <p className="text-sm text-muted-foreground">
                Click &quot;Activate&quot; to enable the plugin locally.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">3. Start Using</h4>
              <p className="text-sm text-muted-foreground">
                Once activated, the plugin menu appears in the sidebar. Configure settings as needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
