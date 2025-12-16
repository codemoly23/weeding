"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Save,
  Trash2,
  GripVertical,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

interface CustomListItem {
  id?: string;
  value: string;
  label: string;
  metadata?: Record<string, unknown>;
  order: number;
  isActive: boolean;
}

interface CustomList {
  id: string;
  key: string;
  name: string;
  description?: string;
  items: CustomListItem[];
}

const defaultItem: CustomListItem = {
  value: "",
  label: "",
  order: 0,
  isActive: true,
};

export default function CustomListEditorPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [list, setList] = useState<CustomList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Item dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomListItem | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Edit list dialog
  const [editListDialogOpen, setEditListDialogOpen] = useState(false);
  const [editListData, setEditListData] = useState({ name: "", description: "" });

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/lists/custom/${listId}`);
      const data = await response.json();

      if (response.ok) {
        setList(data);
        setEditListData({
          name: data.name,
          description: data.description || "",
        });
      } else {
        toast.error("Failed to load list");
        router.push("/admin/settings/lists");
      }
    } catch (error) {
      console.error("Error fetching list:", error);
      toast.error("Failed to load list");
    } finally {
      setIsLoading(false);
    }
  }, [listId, router]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Update list details
  const updateList = async () => {
    if (!editListData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/lists/custom/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editListData),
      });

      if (response.ok) {
        toast.success("List updated");
        setEditListDialogOpen(false);
        fetchList();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update list");
      }
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error("Failed to update list");
    } finally {
      setIsSaving(false);
    }
  };

  // Item management
  const openItemDialog = (item?: CustomListItem, index?: number) => {
    if (item && index !== undefined) {
      setEditingItem({ ...item });
      setEditingItemIndex(index);
    } else {
      setEditingItem({ ...defaultItem, order: (list?.items.length || 0) + 1 });
      setEditingItemIndex(null);
    }
    setItemDialogOpen(true);
  };

  const saveItem = async () => {
    if (!editingItem || !list) return;

    if (!editingItem.value.trim() || !editingItem.label.trim()) {
      toast.error("Value and label are required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItemIndex !== null) {
        // Update existing item
        const item = list.items[editingItemIndex];
        const response = await fetch(
          `/api/admin/lists/custom/${listId}/items/${item.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingItem),
          }
        );

        if (response.ok) {
          toast.success("Item updated");
          fetchList();
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to update item");
        }
      } else {
        // Create new item
        const response = await fetch(
          `/api/admin/lists/custom/${listId}/items`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingItem),
          }
        );

        if (response.ok) {
          toast.success("Item added");
          fetchList();
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to add item");
        }
      }

      setItemDialogOpen(false);
      setEditingItem(null);
      setEditingItemIndex(null);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (index: number) => {
    if (!list) return;

    const item = list.items[index];
    if (!item.id) return;

    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/lists/custom/${listId}/items/${item.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success("Item deleted");
        fetchList();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-muted-foreground">List not found</p>
        <Button variant="link" asChild>
          <Link href="/admin/settings/lists">Go back to lists</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/settings/lists">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{list.name}</h1>
            <p className="text-muted-foreground">
              Key: {list.key} • {list.items.length} items
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditListDialogOpen(true)}>
            Edit List
          </Button>
          <Button onClick={() => openItemDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          {list.description && (
            <CardDescription>{list.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {list.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-muted-foreground">No items in this list</p>
              <Button onClick={() => openItemDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {list.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      {!item.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Value: {item.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openItemDialog(item, index)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit List Dialog */}
      <Dialog open={editListDialogOpen} onOpenChange={setEditListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
            <DialogDescription>Update list details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={editListData.name}
                onChange={(e) =>
                  setEditListData({ ...editListData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editListData.description}
                onChange={(e) =>
                  setEditListData({
                    ...editListData,
                    description: e.target.value,
                  })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditListDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateList} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItemIndex !== null ? "Edit Item" : "Add Item"}
            </DialogTitle>
            <DialogDescription>
              Configure the list item
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Value *</Label>
                  <Input
                    value={editingItem.value}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, value: e.target.value })
                    }
                    placeholder="e.g., tech"
                  />
                  <p className="text-xs text-muted-foreground">
                    Stored value (no spaces recommended)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Label *</Label>
                  <Input
                    value={editingItem.label}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, label: e.target.value })
                    }
                    placeholder="e.g., Technology"
                  />
                  <p className="text-xs text-muted-foreground">
                    Display text shown to users
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Show this item in dropdowns
                  </p>
                </div>
                <Switch
                  checked={editingItem.isActive}
                  onCheckedChange={(v) =>
                    setEditingItem({ ...editingItem, isActive: v })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveItem} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
