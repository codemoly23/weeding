"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  List,
  Bell,
  Users,
  Gauge,
  Palette,
  Columns,
  Loader2,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const PIPELINE_STAGES = [
  { key: "NEW", label: "New", color: "#3b82f6", description: "Fresh lead, not yet contacted" },
  { key: "CONTACTED", label: "Contacted", color: "#8b5cf6", description: "Initial contact made" },
  { key: "QUALIFIED", label: "Qualified", color: "#10b981", description: "Meets criteria, genuine interest" },
  { key: "PROPOSAL", label: "Proposal", color: "#f59e0b", description: "Proposal/quote sent" },
  { key: "NEGOTIATION", label: "Negotiation", color: "#f97316", description: "Active negotiation" },
  { key: "WON", label: "Won", color: "#22c55e", description: "Successfully converted" },
  { key: "LOST", label: "Lost", color: "#ef4444", description: "Did not convert" },
  { key: "UNQUALIFIED", label: "Unqualified", color: "#6b7280", description: "Does not meet criteria" },
];

const SCORE_THRESHOLDS = [
  { label: "Cold", min: 0, max: 25, color: "#3b82f6" },
  { label: "Warm", min: 26, max: 50, color: "#f97316" },
  { label: "Hot", min: 51, max: 75, color: "#ef4444" },
  { label: "Very Hot", min: 76, max: 100, color: "#dc2626" },
];

const OPTIONAL_COLUMNS = [
  { key: "phone", label: "Phone", description: "Contact phone number" },
  { key: "company", label: "Company", description: "Company or organization name" },
  { key: "budget", label: "Budget", description: "Estimated budget range" },
  { key: "timeline", label: "Timeline", description: "Expected timeline" },
  { key: "priority", label: "Priority", description: "Lead priority level" },
  { key: "interestedIn", label: "Interested In", description: "Services the lead is interested in" },
];

interface ColumnConfig {
  phone: boolean;
  company: boolean;
  budget: boolean;
  timeline: boolean;
  priority: boolean;
  interestedIn: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig = {
  phone: false,
  company: false,
  budget: false,
  timeline: false,
  priority: false,
  interestedIn: true,
};

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    newLead: true,
    leadAutoResponse: false,
    assignment: true,
    statusChange: false,
    dailyDigest: true,
  });

  const [scoring, setScoring] = useState({
    emailProvided: 5,
    phoneProvided: 10,
    companyName: 5,
    targetCountry: 10,
    budgetSpecified: 15,
    urgentTimeline: 15,
  });

  const [autoAssign, setAutoAssign] = useState({
    enabled: false,
    roundRobin: true,
    hotLeadsOnly: false,
  });

  const [columns, setColumns] = useState<ColumnConfig>(DEFAULT_COLUMNS);

  const [saving, setSaving] = useState<string | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Load persisted settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings?prefix=leads.");
        if (response.ok) {
          const data = await response.json();
          const settings = data.settings || {};

          // Load notifications
          if (settings["leads.notify.newLead"] !== undefined) {
            setNotifications((prev) => ({
              ...prev,
              newLead: settings["leads.notify.newLead"] === "true",
            }));
          }
          if (settings["leads.notify.leadAutoResponse"] !== undefined) {
            setNotifications((prev) => ({
              ...prev,
              leadAutoResponse: settings["leads.notify.leadAutoResponse"] === "true",
            }));
          }
          if (settings["leads.notify.assignment"] !== undefined) {
            setNotifications((prev) => ({
              ...prev,
              assignment: settings["leads.notify.assignment"] === "true",
            }));
          }
          if (settings["leads.notify.statusChange"] !== undefined) {
            setNotifications((prev) => ({
              ...prev,
              statusChange: settings["leads.notify.statusChange"] === "true",
            }));
          }
          if (settings["leads.notify.dailyDigest"] !== undefined) {
            setNotifications((prev) => ({
              ...prev,
              dailyDigest: settings["leads.notify.dailyDigest"] === "true",
            }));
          }

          // Load column config
          if (settings["leads.table.columns"]) {
            try {
              const parsed = JSON.parse(settings["leads.table.columns"]);
              setColumns((prev) => ({ ...prev, ...parsed }));
            } catch {
              // ignore parse error
            }
          }

          // Load auto-assign
          if (settings["leads.autoAssign.enabled"] !== undefined) {
            setAutoAssign((prev) => ({
              ...prev,
              enabled: settings["leads.autoAssign.enabled"] === "true",
            }));
          }
          if (settings["leads.autoAssign.roundRobin"] !== undefined) {
            setAutoAssign((prev) => ({
              ...prev,
              roundRobin: settings["leads.autoAssign.roundRobin"] === "true",
            }));
          }
          if (settings["leads.autoAssign.hotLeadsOnly"] !== undefined) {
            setAutoAssign((prev) => ({
              ...prev,
              hotLeadsOnly: settings["leads.autoAssign.hotLeadsOnly"] === "true",
            }));
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  const saveSettings = async (settingsToSave: Record<string, string>, sectionName: string) => {
    setSaving(sectionName);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (!response.ok) throw new Error("Failed to save settings");
      toast.success(`${sectionName} saved`);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(`Failed to save ${sectionName.toLowerCase()}`);
    } finally {
      setSaving(null);
    }
  };

  const handleSaveNotifications = () => {
    saveSettings({
      "leads.notify.newLead": notifications.newLead.toString(),
      "leads.notify.leadAutoResponse": notifications.leadAutoResponse.toString(),
      "leads.notify.assignment": notifications.assignment.toString(),
      "leads.notify.statusChange": notifications.statusChange.toString(),
      "leads.notify.dailyDigest": notifications.dailyDigest.toString(),
    }, "Notification settings");
  };

  const handleSaveScoring = () => {
    toast.success("Scoring rules saved");
  };

  const handleSaveAutoAssign = () => {
    saveSettings({
      "leads.autoAssign.enabled": autoAssign.enabled.toString(),
      "leads.autoAssign.roundRobin": autoAssign.roundRobin.toString(),
      "leads.autoAssign.hotLeadsOnly": autoAssign.hotLeadsOnly.toString(),
    }, "Auto-assignment settings");
  };

  const handleSaveColumns = () => {
    saveSettings({
      "leads.table.columns": JSON.stringify(columns),
    }, "Column settings");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Settings</h1>
          <p className="text-muted-foreground">
            Configure pipeline, scoring, and notification settings
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/leads">
            <List className="mr-2 h-4 w-4" />
            Back to Leads
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Scoring
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="assignment" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Auto-Assignment
          </TabsTrigger>
          <TabsTrigger value="columns" className="flex items-center gap-2">
            <Columns className="h-4 w-4" />
            Table Columns
          </TabsTrigger>
        </TabsList>

        {/* Pipeline Settings */}
        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Stages</CardTitle>
              <CardDescription>
                Customize your lead pipeline stages and their meanings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {PIPELINE_STAGES.map((stage) => (
                <div key={stage.key} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{stage.label}</div>
                    <div className="text-sm text-muted-foreground">{stage.description}</div>
                  </div>
                  <Badge className="bg-muted text-muted-foreground">{stage.key}</Badge>
                </div>
              ))}
              <p className="text-sm text-muted-foreground pt-4">
                Pipeline stages are currently fixed. Custom stages will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Settings */}
        <TabsContent value="scoring">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Scoring Rules</CardTitle>
                <CardDescription>
                  Configure how lead scores are calculated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Email Provided</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20"
                        value={scoring.emailProvided}
                        onChange={(e) => setScoring({ ...scoring, emailProvided: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Phone Provided</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20"
                        value={scoring.phoneProvided}
                        onChange={(e) => setScoring({ ...scoring, phoneProvided: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Company Name</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20"
                        value={scoring.companyName}
                        onChange={(e) => setScoring({ ...scoring, companyName: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Target Country (BD, IN, PK, UAE)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20"
                        value={scoring.targetCountry}
                        onChange={(e) => setScoring({ ...scoring, targetCountry: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Budget Specified</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20"
                        value={scoring.budgetSpecified}
                        onChange={(e) => setScoring({ ...scoring, budgetSpecified: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Urgent Timeline (&lt; 1 month)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20"
                        value={scoring.urgentTimeline}
                        onChange={(e) => setScoring({ ...scoring, urgentTimeline: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <Button onClick={handleSaveScoring}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Scoring Rules
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Thresholds</CardTitle>
                <CardDescription>
                  Define lead temperature based on score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {SCORE_THRESHOLDS.map((threshold) => (
                  <div key={threshold.label} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: threshold.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{threshold.label}</div>
                      <div className="text-sm text-muted-foreground">
                        Score {threshold.min} - {threshold.max}
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  Score thresholds are currently fixed. Custom thresholds will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose when to receive notifications about leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Lead Notification</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new lead is captured
                  </p>
                </div>
                <Switch
                  checked={notifications.newLead}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, newLead: checked })}
                  disabled={loadingSettings}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Lead Auto-Response Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Send an automatic thank-you email to new leads
                  </p>
                </div>
                <Switch
                  checked={notifications.leadAutoResponse}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, leadAutoResponse: checked })}
                  disabled={loadingSettings}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Assignment Notification</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a lead is assigned to you
                  </p>
                </div>
                <Switch
                  checked={notifications.assignment}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, assignment: checked })}
                  disabled={loadingSettings}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Status Change Notification</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a lead status changes
                  </p>
                </div>
                <Switch
                  checked={notifications.statusChange}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, statusChange: checked })}
                  disabled={loadingSettings}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of lead activity
                  </p>
                </div>
                <Switch
                  checked={notifications.dailyDigest}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, dailyDigest: checked })}
                  disabled={loadingSettings}
                />
              </div>
              <Separator />
              <Button onClick={handleSaveNotifications} disabled={saving === "Notification settings"}>
                {saving === "Notification settings" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Assignment Settings */}
        <TabsContent value="assignment">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Assignment Rules</CardTitle>
              <CardDescription>
                Configure automatic lead assignment to team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto-Assignment</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign new leads to team members
                  </p>
                </div>
                <Switch
                  checked={autoAssign.enabled}
                  onCheckedChange={(checked) => setAutoAssign({ ...autoAssign, enabled: checked })}
                  disabled={loadingSettings}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Round Robin</Label>
                  <p className="text-sm text-muted-foreground">
                    Distribute leads evenly among team members
                  </p>
                </div>
                <Switch
                  checked={autoAssign.roundRobin}
                  onCheckedChange={(checked) => setAutoAssign({ ...autoAssign, roundRobin: checked })}
                  disabled={!autoAssign.enabled || loadingSettings}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Hot Leads Only</Label>
                  <p className="text-sm text-muted-foreground">
                    Only auto-assign leads with score 70+
                  </p>
                </div>
                <Switch
                  checked={autoAssign.hotLeadsOnly}
                  onCheckedChange={(checked) => setAutoAssign({ ...autoAssign, hotLeadsOnly: checked })}
                  disabled={!autoAssign.enabled || loadingSettings}
                />
              </div>
              <Separator />
              <Button onClick={handleSaveAutoAssign} disabled={saving === "Auto-assignment settings"}>
                {saving === "Auto-assignment settings" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Assignment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table Columns Settings */}
        <TabsContent value="columns">
          <Card>
            <CardHeader>
              <CardTitle>Table Column Visibility</CardTitle>
              <CardDescription>
                Choose which optional columns to show in the leads table.
                Fixed columns (Name, Email, Status, Score, Source, Assigned To, Created) are always visible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {OPTIONAL_COLUMNS.map((col) => (
                <div key={col.key}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{col.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {col.description}
                      </p>
                    </div>
                    <Switch
                      checked={columns[col.key as keyof ColumnConfig]}
                      onCheckedChange={(checked) =>
                        setColumns({ ...columns, [col.key]: checked })
                      }
                      disabled={loadingSettings}
                    />
                  </div>
                  <Separator className="mt-6" />
                </div>
              ))}
              <Button onClick={handleSaveColumns} disabled={saving === "Column settings"}>
                {saving === "Column settings" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Column Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Badge component for inline use
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-2 py-1 text-xs rounded-md ${className}`}>
      {children}
    </span>
  );
}
