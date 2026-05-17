"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Shield,
  XCircle,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/settings/plugins")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{plugin.name} Settings</h1>
          <p className="text-muted-foreground">Manage configuration for {plugin.name}</p>
        </div>
      </div>

      {/* Plugin Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Plugin Information
          </CardTitle>
          <CardDescription>Current plugin status and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={plugin.status === "ACTIVE" ? "default" : "secondary"}>
                {plugin.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Activated</p>
              <p className="text-sm">{formatDate(plugin.lastActivatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
