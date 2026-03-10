"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Key,
  Loader2,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface PluginDetails {
  id: string;
  slug: string;
  name: string;
  version: string;
  status: string;
  licenseKey: string | null;
  licenseTier: string | null;
  licenseType: string | null;
  licenseExpiresAt: string | null;
  licenseVerifiedAt: string | null;
  lastActivatedAt: string | null;
  requiresLicense: boolean;
  description: string | null;
  author: string | null;
}

export default function PluginSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [plugin, setPlugin] = useState<PluginDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [licenseKey, setLicenseKey] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activating, setActivating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlugin = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/plugins/${slug}`);
      if (!res.ok) throw new Error("Plugin not found");
      const data = await res.json();
      setPlugin(data.plugin || data);
    } catch {
      setPlugin(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPlugin();
  }, [fetchPlugin]);

  async function handleReactivate() {
    if (!licenseKey.trim()) return;
    setActivating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/plugins/${slug}/reactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          agreedToTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Re-activation failed");
        return;
      }

      toast.success(data.message || "Plugin license has been updated successfully.");
      setLicenseKey("");
      setAgreedToTerms(false);
      fetchPlugin();
    } catch {
      setError("Failed to re-activate plugin. Please try again.");
    } finally {
      setActivating(false);
    }
  }

  async function handleRefreshToken() {
    setRefreshing(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/plugins/refresh-tokens?plugin=${slug}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.result?.error || "Token refresh failed");
        return;
      }

      toast.success("License token has been refreshed successfully.");
      fetchPlugin();
    } catch {
      setError("Failed to refresh token. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isExpired(dateString: string | null) {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/admin/settings/plugins")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Plugins
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold">Plugin Not Found</h2>
            <p className="text-muted-foreground">The plugin &quot;{slug}&quot; could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const licenseExpired = isExpired(plugin.licenseExpiresAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/settings/plugins")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{plugin.name} Settings</h1>
          <p className="text-muted-foreground">Manage license and configuration for {plugin.name}</p>
        </div>
      </div>

      {/* License Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            License Information
          </CardTitle>
          <CardDescription>Current license status and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={plugin.status === "ACTIVE" && !licenseExpired ? "default" : "destructive"}>
                {licenseExpired ? "Expired" : plugin.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">License Key</p>
              <p className="font-mono text-sm">
                {plugin.licenseKey
                  ? `${plugin.licenseKey.substring(0, 12)}...`
                  : "No license key"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tier</p>
              <p className="text-sm font-medium">{plugin.licenseTier || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">License Expires</p>
              <p className={`text-sm ${licenseExpired ? "text-destructive font-medium" : ""}`}>
                {formatDate(plugin.licenseExpiresAt)}
                {licenseExpired && " (Expired)"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Verified</p>
              <p className="text-sm">{formatDate(plugin.licenseVerifiedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Activated</p>
              <p className="text-sm">{formatDate(plugin.lastActivatedAt)}</p>
            </div>
          </div>

          {licenseExpired && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>Your license has expired. Please enter a new license key or refresh the token below.</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshToken} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Token
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Re-activate License Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Update License Key
          </CardTitle>
          <CardDescription>
            Enter a new license key to re-activate or renew your plugin license
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <XCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="licenseKey">License Key</Label>
            <Input
              id="licenseKey"
              placeholder="LSP-XXX-XXXXXXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm font-normal">
              I agree to the license terms and conditions
            </Label>
          </div>

          <Button
            onClick={handleReactivate}
            disabled={activating || !licenseKey.trim() || !agreedToTerms}
          >
            {activating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Update License
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
