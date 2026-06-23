"use client";

import { useState, useEffect, ReactElement } from "react";
import { Plus, Edit, Trash2, Loader2, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/language-context";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: BlogCategory | null;
  children?: BlogCategory[];
  _count?: {
    posts: number;
  };
}

export default function BlogCategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<BlogCategory | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/blog-categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      toast.error(t("admin.blogCategories.fetchFailed"));
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingCategory(null);
    setFormData({ name: "", description: "", parentId: "" });
    setDialogOpen(true);
  }

  function openEditDialog(category: BlogCategory) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("admin.blogCategories.nameRequired"));
      return;
    }

    setSaving(true);
    try {
      const url = editingCategory
        ? `/api/admin/blog-categories/${editingCategory.id}`
        : "/api/admin/blog-categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          parentId: formData.parentId || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t("admin.blogCategories.saveFailed"));
      }

      toast.success(editingCategory ? t("admin.blogCategories.updated") : t("admin.blogCategories.created"));
      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || t("admin.blogCategories.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  function openDeleteDialog(category: BlogCategory) {
    if (category.slug === "uncategorized") {
      toast.error(t("admin.blogCategories.cannotDeleteUncategorized"));
      return;
    }
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`/api/admin/blog-categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t("admin.blogCategories.deleteFailed"));
      }

      toast.success(t("admin.blogCategories.deleted"));
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || t("admin.blogCategories.deleteFailed"));
    }
  }

  function buildCategoryTree(
    categories: BlogCategory[],
    parentId: string | null = null,
    level: number = 0
  ): ReactElement[] {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((category) => (
        <div key={category.id}>
          <Card className="mb-2">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3" style={{ marginLeft: `${level * 24}px` }}>
                {level > 0 && <FolderTree className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {t("admin.blogCategories.posts", { count: String(category._count?.posts || 0) })}
                    </Badge>
                    {category.children && category.children.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {t("admin.blogCategories.subcategories", { count: String(category.children.length) })}
                      </Badge>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("admin.blogCategories.slug")} {category.slug}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {category.slug !== "uncategorized" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          {buildCategoryTree(categories, category.id, level + 1)}
        </div>
      ));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.blogCategories.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.blogCategories.subtitle")}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="self-start sm:self-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.blogCategories.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? t("admin.blogCategories.edit") : t("admin.blogCategories.create")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("admin.blogCategories.name")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("admin.blogCategories.namePlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("admin.blogCategories.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t("admin.blogCategories.descriptionPlaceholder")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">{t("admin.blogCategories.parent")}</Label>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.blogCategories.noneTopLevel")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("admin.blogCategories.noneTopLevel")}</SelectItem>
                    {categories
                      .filter((cat) => cat.id !== editingCategory?.id)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.parent ? `${cat.parent.name} > ` : ""}
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("admin.blogCategories.parentHelp")}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    t("admin.blogCategories.save")
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("admin.blogCategories.noCategories")}</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                {t("admin.blogCategories.createFirst")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          buildCategoryTree(categories)
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.blogCategories.deleteQuestion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.blogCategories.deleteDesc", { name: categoryToDelete?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
