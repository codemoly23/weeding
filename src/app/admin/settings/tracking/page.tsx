"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface TrackingSettings {
  gtmEnabled: boolean;
  gtmContainerId: string | null;
  gtmTrackForms: boolean;
  gtmTrackPages: boolean;
  fbPixelEnabled: boolean;
  fbPixelId: string | null;
  fbTrackLead: boolean;
  fbTrackPageView: boolean;
  fbTrackContent: boolean;
  gadsEnabled: boolean;
  gadsConversionId: string | null;
  gadsConversionLabel: string | null;
  gadsDefaultValue: number | null;
}

const DEFAULT_SETTINGS: TrackingSettings = {
  gtmEnabled: false,
  gtmContainerId: null,
  gtmTrackForms: true,
  gtmTrackPages: true,
  fbPixelEnabled: false,
  fbPixelId: null,
  fbTrackLead: true,
  fbTrackPageView: true,
  fbTrackContent: false,
  gadsEnabled: false,
  gadsConversionId: null,
  gadsConversionLabel: null,
  gadsDefaultValue: null,
};

export default function TrackingSettingsPage() {
  const [settings, setSettings] = useState<TrackingSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/admin/tracking-settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            gtmEnabled: data.gtmEnabled ?? false,
            gtmContainerId: data.gtmContainerId ?? null,
            gtmTrackForms: data.gtmTrackForms ?? true,
            gtmTrackPages: data.gtmTrackPages ?? true,
            fbPixelEnabled: data.fbPixelEnabled ?? false,
            fbPixelId: data.fbPixelId ?? null,
            fbTrackLead: data.fbTrackLead ?? true,
            fbTrackPageView: data.fbTrackPageView ?? true,
            fbTrackContent: data.fbTrackContent ?? false,
            gadsEnabled: data.gadsEnabled ?? false,
            gadsConversionId: data.gadsConversionId ?? null,
            gadsConversionLabel: data.gadsConversionLabel ?? null,
            gadsDefaultValue: data.gadsDefaultValue ?? null,
          });
        }
      } catch (error) {
        console.error("Error fetching tracking settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/tracking-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save");
      toast.success("Tracking settings saved");
    } catch (error) {
      console.error("Error saving tracking settings:", error);
      toast.error("Failed to save tracking settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/settings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tracking & Analytics</h1>
            <p className="text-muted-foreground">
              Configure Google Tag Manager, Facebook Pixel, and Google Ads tracking
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Settings
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Google Tag Manager */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Google Tag Manager</CardTitle>
                <CardDescription>
                  Manage all your tracking tags from a single container
                </CardDescription>
              </div>
              <Switch
                checked={settings.gtmEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, gtmEnabled: checked })
                }
              />
            </div>
          </CardHeader>
          {settings.gtmEnabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Container ID</Label>
                <Input
                  placeholder="GTM-XXXXXXX"
                  value={settings.gtmContainerId || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, gtmContainerId: e.target.value || null })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Track Form Submissions</Label>
                  <p className="text-sm text-muted-foreground">Push form events to dataLayer</p>
                </div>
                <Switch
                  checked={settings.gtmTrackForms}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, gtmTrackForms: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Track Page Views</Label>
                  <p className="text-sm text-muted-foreground">Push page view events to dataLayer</p>
                </div>
                <Switch
                  checked={settings.gtmTrackPages}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, gtmTrackPages: checked })
                  }
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Facebook Pixel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Facebook Pixel</CardTitle>
                <CardDescription>
                  Track conversions and build audiences for Facebook/Meta ads
                </CardDescription>
              </div>
              <Switch
                checked={settings.fbPixelEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, fbPixelEnabled: checked })
                }
              />
            </div>
          </CardHeader>
          {settings.fbPixelEnabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pixel ID</Label>
                <Input
                  placeholder="123456789012345"
                  value={settings.fbPixelId || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, fbPixelId: e.target.value || null })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Track Lead Events</Label>
                  <p className="text-sm text-muted-foreground">Fire Lead event on form submission</p>
                </div>
                <Switch
                  checked={settings.fbTrackLead}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, fbTrackLead: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Track Page Views</Label>
                  <p className="text-sm text-muted-foreground">Fire PageView on every page load</p>
                </div>
                <Switch
                  checked={settings.fbTrackPageView}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, fbTrackPageView: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Track Content Views</Label>
                  <p className="text-sm text-muted-foreground">Fire ViewContent on service pages</p>
                </div>
                <Switch
                  checked={settings.fbTrackContent}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, fbTrackContent: checked })
                  }
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Google Ads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Google Ads Conversion</CardTitle>
                <CardDescription>
                  Track conversions from Google Ads campaigns
                </CardDescription>
              </div>
              <Switch
                checked={settings.gadsEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, gadsEnabled: checked })
                }
              />
            </div>
          </CardHeader>
          {settings.gadsEnabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Conversion ID</Label>
                <Input
                  placeholder="AW-XXXXXXXXXX"
                  value={settings.gadsConversionId || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, gadsConversionId: e.target.value || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Conversion Label</Label>
                <Input
                  placeholder="AbCdEfGhIjKlMnOp"
                  value={settings.gadsConversionLabel || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, gadsConversionLabel: e.target.value || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Default Conversion Value (USD)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={settings.gadsDefaultValue ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      gadsDefaultValue: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
