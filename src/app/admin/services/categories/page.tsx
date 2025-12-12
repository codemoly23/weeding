"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Loader2,
  GripVertical,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  servicesCount: number;
}

const defaultCategory = {
  slug: "",
  name: "",
  description: "",
  icon: "",
  sortOrder: 0,
  isActive: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory({ ...category });
    } else {
      setEditingCategory({ ...defaultCategory, sortOrder: categories.length });
    }
    setDialogOpen(true);
  };

  const generateSlug = () => {
    if (!editingCategory?.name) return;
    const slug = editingCategory.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setEditingCategory({ ...editingCategory, slug });
  };

  const saveCategory = async () => {
    if (!editingCategory) return;

    if (!editingCategory.name?.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!editingCategory.slug?.trim()) {
      toast.error("URL slug is required");
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = !!editingCategory.id;
      const url = isEdit
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEdit ? "Category updated" : "Category created");
        setDialogOpen(false);
        fetchCategories();
      } else {
        toast.error(data.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category deleted");
        setDeleteDialogOpen(false);
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Service Categories</h1>
            <p className="text-muted-foreground">
              Manage categories for organizing services
            </p>
          </div>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>{categories.length} categories total</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No categories</h3>
              <p className="text-sm text-muted-foreground">
                Create your first category to organize services
              </p>
              <Button className="mt-4" onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.servicesCount} services
                        </Badge>
                        {!category.isActive && (
                          <Badge variant="outline" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        /{category.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(category)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryToDelete(category);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={category.servicesCount > 0}
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

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory?.id ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory?.id
                ? "Update category details"
                : "Create a new service category"}
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name *</Label>
                <Input
                  value={editingCategory.name || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  placeholder="e.g., Formation & Legal"
                />
              </div>

              <div className="space-y-2">
                <Label>URL Slug *</Label>
                <div className="flex gap-2">
                  <Input
                    value={editingCategory.slug || ""}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, slug: e.target.value })
                    }
                    placeholder="e.g., formation"
                  />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Icon Name</Label>
                <Input
                  value={editingCategory.icon || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, icon: e.target.value })
                  }
                  placeholder="e.g., Building2"
                />
                <p className="text-xs text-muted-foreground">Lucide icon name</p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingCategory.isActive ?? true}
                  onCheckedChange={(v) =>
                    setEditingCategory({ ...editingCategory, isActive: v })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCategory} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
