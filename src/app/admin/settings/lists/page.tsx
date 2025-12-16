"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Globe,
  MapPin,
  DollarSign,
  List,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SystemList {
  id: string;
  key: string;
  name: string;
  type: string;
  isEditable: boolean;
  itemCount: number;
  category: "system";
}

interface CustomList {
  id: string;
  key: string;
  name: string;
  description?: string;
  itemCount: number;
  category: "custom";
}

const SYSTEM_ICONS: Record<string, React.ReactNode> = {
  countries: <Globe className="h-5 w-5" />,
  us_states: <MapPin className="h-5 w-5" />,
  currencies: <DollarSign className="h-5 w-5" />,
  business_types: <List className="h-5 w-5" />,
};

export default function ListsManagementPage() {
  const [systemLists, setSystemLists] = useState<SystemList[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New list dialog
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const [newListData, setNewListData] = useState({
    key: "",
    name: "",
    description: "",
  });

  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/lists");
      const data = await response.json();

      if (response.ok) {
        setSystemLists(data.systemLists);
        setCustomLists(data.customLists);
      } else {
        toast.error("Failed to load lists");
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to load lists");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createCustomList = async () => {
    if (!newListData.key.trim() || !newListData.name.trim()) {
      toast.error("Key and name are required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/lists/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newListData),
      });

      if (response.ok) {
        toast.success("List created successfully");
        setNewListDialogOpen(false);
        setNewListData({ key: "", name: "", description: "" });
        fetchLists();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create list");
      }
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error("Failed to create list");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCustomList = async (id: string) => {
    if (!confirm("Are you sure you want to delete this list?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lists/custom/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("List deleted");
        fetchLists();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete list");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/settings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Data Lists</h1>
            <p className="text-muted-foreground">
              Manage system and custom lists for form fields
            </p>
          </div>
        </div>
        <Button onClick={() => setNewListDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Custom List
        </Button>
      </div>

      {/* System Lists */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">System Lists</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {systemLists.map((list) => (
            <Card key={list.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {SYSTEM_ICONS[list.key] || <List className="h-5 w-5" />}
                  <CardTitle className="text-base">{list.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {list.itemCount} items
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="secondary">System</Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/settings/lists/${list.key}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Lists */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Custom Lists</h2>
        {customLists.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <List className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">No custom lists yet</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Create custom lists for dropdown options in your forms
              </p>
              <Button onClick={() => setNewListDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Custom List
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customLists.map((list) => (
              <Card key={list.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{list.name}</CardTitle>
                    <Badge variant="outline">Custom</Badge>
                  </div>
                  {list.description && (
                    <CardDescription>{list.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {list.itemCount} items • Key: {list.key}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/settings/lists/custom/${list.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteCustomList(list.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New List Dialog */}
      <Dialog open={newListDialogOpen} onOpenChange={setNewListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom List</DialogTitle>
            <DialogDescription>
              Create a new list for dropdown options in forms
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>List Name *</Label>
              <Input
                value={newListData.name}
                onChange={(e) =>
                  setNewListData({ ...newListData, name: e.target.value })
                }
                placeholder="e.g., Industry Types"
              />
            </div>
            <div className="space-y-2">
              <Label>Key *</Label>
              <Input
                value={newListData.key}
                onChange={(e) =>
                  setNewListData({
                    ...newListData,
                    key: e.target.value.toLowerCase().replace(/[^a-z_]/g, "_"),
                  })
                }
                placeholder="e.g., industry_types"
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters and underscores only
              </p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newListData.description}
                onChange={(e) =>
                  setNewListData({ ...newListData, description: e.target.value })
                }
                placeholder="Brief description of this list..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewListDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={createCustomList} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
