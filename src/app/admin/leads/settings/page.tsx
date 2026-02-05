"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Save,
  List,
  Settings,
  Bell,
  Users,
  Gauge,
  Palette,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    newLead: true,
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

  const handleSaveNotifications = () => {
    // In a real app, this would save to the API
    toast.success("Notification settings saved");
  };

  const handleSaveScoring = () => {
    toast.success("Scoring rules saved");
  };

  const handleSaveAutoAssign = () => {
    toast.success("Auto-assignment settings saved");
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
              {PIPELINE_STAGES.map((stage, idx) => (
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
                />
              </div>
              <Separator />
              <Button onClick={handleSaveNotifications}>
                <Save className="mr-2 h-4 w-4" />
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
                  disabled={!autoAssign.enabled}
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
                  disabled={!autoAssign.enabled}
                />
              </div>
              <Separator />
              <Button onClick={handleSaveAutoAssign}>
                <Save className="mr-2 h-4 w-4" />
                Save Assignment Settings
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
