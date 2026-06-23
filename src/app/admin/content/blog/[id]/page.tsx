"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { SunEditorWrapper } from "@/components/editor/sun-editor";
import { useLanguage } from "@/lib/i18n/language-context";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: BlogCategory | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags: string[];
  categories: BlogCategory[];
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const defaultFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
  tags: [] as string[],
  metaTitle: "",
  metaDescription: "",
};

export default function BlogEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useLanguage();
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [tagsInput, setTagsInput] = useState("");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchPost();
    }
  }, [isNew, resolvedParams.id]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/blog-categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  async function fetchPost() {
    try {
      const res = await fetch(`/api/admin/blog/${resolvedParams.id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: BlogPost = await res.json();
      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content,
        coverImage: data.coverImage || "",
        status: data.status,
        tags: data.tags || [],
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
      });
      setTagsInput(data.tags?.join(", ") || "");
      setSelectedCategoryId(data.categories?.[0]?.id || "");
    } catch (error) {
      toast.error(t("admin.blog.loadFailed"));
      router.push("/admin/content/blog");
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleTitleChange(title: string) {
    setFormData({
      ...formData,
      title,
      slug: isNew ? generateSlug(title) : formData.slug,
    });
  }

  function handleTagsChange(input: string) {
    setTagsInput(input);
    const tags = input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData({ ...formData, tags });
  }

  async function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData({ ...formData, coverImage: data.url });
      toast.success(t("admin.blog.imageUploaded"));
    } catch (error) {
      toast.error(t("admin.blog.imageUploadFailed"));
    } finally {
      setUploadingImage(false);
    }
  }

  function getCategoryDisplayName(category: BlogCategory): string {
    if (!category.parent) return category.name;
    return `${category.parent.name} > ${category.name}`;
  }

  async function handleSave(publish = false) {
    if (!formData.title || !formData.content) {
      toast.error(t("admin.blog.required"));
      return;
    }

    setSaving(true);
    try {
      const status = publish ? "PUBLISHED" : formData.status;
      const url = isNew
        ? "/api/admin/blog"
        : `/api/admin/blog/${resolvedParams.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status,
          categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(
        isNew
          ? t("admin.blog.createdToast")
          : publish
          ? t("admin.blog.publishedToast")
          : t("admin.blog.savedToast")
      );
      router.push("/admin/content/blog");
    } catch (error) {
      toast.error(t("admin.blog.saveFailed"));
    } finally {
      setSaving(false);
    }
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
            <Link href="/admin/content/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? t("admin.blog.newTitle") : t("admin.blog.editTitle")}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? t("admin.blog.newSubtitle") : t("admin.blog.editSubtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap pl-12 sm:pl-0">
          {!isNew && formData.status === "PUBLISHED" && (
            <Button variant="outline" asChild>
              <Link href={`/blog/${formData.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                {t("admin.blog.view")}
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {t("admin.blog.saveDraft")}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("admin.blog.publish")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.blog.content")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("admin.blog.titleLabel")}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={t("admin.blog.titlePlaceholder")}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{t("admin.blog.slug")}</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: generateSlug(e.target.value) })
                  }
                  placeholder="url-friendly-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">{t("admin.blog.excerpt")}</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder={t("admin.blog.excerptPlaceholder")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">{t("admin.blog.contentLabel")}</Label>
                <SunEditorWrapper
                  value={formData.content}
                  onChange={(content) =>
                    setFormData({ ...formData, content })
                  }
                  placeholder={t("admin.blog.contentPlaceholder")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("common.status")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{t("admin.blog.draft")}</SelectItem>
                  <SelectItem value="PUBLISHED">{t("admin.blog.published")}</SelectItem>
                  <SelectItem value="ARCHIVED">{t("admin.blog.archived")}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.blog.category")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.blog.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {getCategoryDisplayName(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {!selectedCategoryId
                  ? t("admin.blog.noCategory")
                  : ""}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <Link href="/admin/content/blog-categories" target="_blank">
                  {t("admin.blog.manageCategories")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.blog.coverImage")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                disabled={uploadingImage}
                className="sr-only"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                disabled={uploadingImage}
                asChild
              >
                <Label htmlFor="cover-image-upload" className="cursor-pointer">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {formData.coverImage
                    ? t("admin.blog.changeCoverImage")
                    : t("admin.blog.chooseCoverImage")}
                </Label>
              </Button>
              {uploadingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("admin.blog.uploading")}
                </div>
              )}
              {formData.coverImage && (
                <div className="rounded-lg border overflow-hidden">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.blog.tags")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="LLC, Business, Tips"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {t("admin.blog.tagsHelp")}
              </p>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.blog.seo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">{t("admin.blog.metaTitle")}</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder={t("admin.blog.metaTitlePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">{t("admin.blog.metaDescription")}</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  placeholder={t("admin.blog.metaDescriptionPlaceholder")}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
