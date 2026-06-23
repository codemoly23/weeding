"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Video, Image as ImageIcon, X, Tag, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { useLanguage } from "@/lib/i18n/language-context";

interface TestimonialTag {
  value: string;
  label: string;
}

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  country: string | null;
  avatar: string | null;
  content: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
  type: "PHOTO" | "VIDEO";
  videoUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  createdAt: string;
}

const defaultFormData = {
  name: "",
  company: "",
  country: "",
  avatar: "",
  content: "",
  rating: 5,
  isActive: true,
  sortOrder: 0,
  type: "PHOTO" as "PHOTO" | "VIDEO",
  videoUrl: "",
  thumbnailUrl: "",
  tags: [] as string[],
};

export default function TestimonialsPage() {
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

  // Dynamic tags
  const [availableTags, setAvailableTags] = useState<TestimonialTag[]>([]);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [addingTag, setAddingTag] = useState(false);

  useEffect(() => {
    fetchTestimonials();
    fetchTags();
  }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      toast.error(t("admin.testimonials.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function fetchTags() {
    try {
      const res = await fetch("/api/admin/testimonial-tags");
      if (!res.ok) throw new Error("Failed to fetch tags");
      const data = await res.json();
      setAvailableTags(data.tags || []);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  }

  async function handleAddTag() {
    if (!newTagLabel.trim()) return;

    setAddingTag(true);
    try {
      const res = await fetch("/api/admin/testimonial-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newTagLabel.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("admin.testimonials.addTagFailed"));
      }

      const data = await res.json();
      setAvailableTags(data.tags);
      setNewTagLabel("");
      toast.success(t("admin.testimonials.tagAdded"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("admin.testimonials.addTagFailed"));
    } finally {
      setAddingTag(false);
    }
  }

  async function handleRemoveTag(tagValue: string) {
    try {
      const res = await fetch(`/api/admin/testimonial-tags?value=${tagValue}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove tag");

      const data = await res.json();
      setAvailableTags(data.tags);
      toast.success(t("admin.testimonials.tagRemoved"));
    } catch (error) {
      toast.error(t("admin.testimonials.removeTagFailed"));
    }
  }

  function openCreateDialog() {
    setSelectedTestimonial(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  }

  function openEditDialog(testimonial: Testimonial) {
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      company: testimonial.company || "",
      country: testimonial.country || "",
      avatar: testimonial.avatar || "",
      content: testimonial.content,
      rating: testimonial.rating,
      isActive: testimonial.isActive,
      sortOrder: testimonial.sortOrder,
      type: testimonial.type || "PHOTO",
      videoUrl: testimonial.videoUrl || "",
      thumbnailUrl: testimonial.thumbnailUrl || "",
      tags: testimonial.tags || [],
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(testimonial: Testimonial) {
    setSelectedTestimonial(testimonial);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.name || !formData.content) {
      toast.error(t("admin.testimonials.nameRequired"));
      return;
    }

    setSaving(true);
    try {
      const url = selectedTestimonial
        ? `/api/admin/testimonials/${selectedTestimonial.id}`
        : "/api/admin/testimonials";
      const method = selectedTestimonial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(selectedTestimonial ? t("admin.testimonials.updated") : t("admin.testimonials.created"));
      setDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      toast.error(t("admin.testimonials.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedTestimonial) return;

    try {
      const res = await fetch(`/api/admin/testimonials/${selectedTestimonial.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success(t("admin.testimonials.deleted"));
      setDeleteDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      toast.error(t("admin.testimonials.deleteFailed"));
    }
  }

  async function toggleActive(testimonial: Testimonial) {
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...testimonial, isActive: !testimonial.isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");
      fetchTestimonials();
    } catch (error) {
      toast.error(t("admin.testimonials.updateFailed"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.testimonials.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.testimonials.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <Button variant="outline" onClick={() => setTagsDialogOpen(true)}>
            <Tag className="mr-2 h-4 w-4" />
            {t("admin.testimonials.manageTags")}
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t("admin.testimonials.add")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">{t("admin.testimonials.noItems")}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("admin.testimonials.noItemsDesc")}
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.testimonials.add")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={!testimonial.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold overflow-hidden">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} className="h-full w-full object-cover" />
                      ) : (
                        testimonial.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {[testimonial.company, testimonial.country].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {testimonial.type === "VIDEO" && (
                      <Badge variant="outline" className="text-[var(--ast-info-icon)] border-[var(--ast-info-icon)]">
                        <Video className="mr-1 h-3 w-3" />
                        {t("admin.testimonials.video")}
                      </Badge>
                    )}
                    <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                      {testimonial.isActive ? t("common.active") : t("common.hidden")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= testimonial.rating
                          ? "fill-[var(--admin-star)] text-[var(--admin-star)]"
                          : "text-[var(--ast-neutral-border)]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  "{testimonial.content}"
                </p>
                {testimonial.tags && testimonial.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {testimonial.tags.map((tag) => {
                      const tagInfo = availableTags.find(t => t.value === tag);
                      return (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tagInfo?.label || tag}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(testimonial)}
                  >
                    {testimonial.isActive ? (
                      <EyeOff className="mr-1 h-3 w-3" />
                    ) : (
                      <Eye className="mr-1 h-3 w-3" />
                    )}
                    {testimonial.isActive ? t("common.hide") : t("common.show")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(testimonial)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => openDeleteDialog(testimonial)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manage Tags Dialog */}
      <Dialog open={tagsDialogOpen} onOpenChange={setTagsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              {t("admin.testimonials.manageTagsTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                placeholder={t("admin.testimonials.tagPlaceholder")}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button onClick={handleAddTag} disabled={addingTag || !newTagLabel.trim()}>
                {addingTag ? t("admin.testimonials.adding") : t("common.add")}
              </Button>
            </div>

            <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
              {availableTags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("admin.testimonials.noTags")}
                </p>
              ) : (
                availableTags.map((tag) => (
                  <div key={tag.value} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <span className="font-medium">{tag.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">({tag.value})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveTag(tag.value)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {t("admin.testimonials.tagsHelp")}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {selectedTestimonial ? t("admin.testimonials.edit") : t("admin.testimonials.add")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto pr-2 flex-1">
            {/* Type Toggle */}
            <div className="space-y-2">
              <Label>{t("admin.testimonials.type")}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.type === "PHOTO" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, type: "PHOTO" })}
                  className="flex-1"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {t("admin.testimonials.photo")}
                </Button>
                <Button
                  type="button"
                  variant={formData.type === "VIDEO" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, type: "VIDEO" })}
                  className="flex-1"
                >
                  <Video className="mr-2 h-4 w-4" />
                  {t("admin.testimonials.video")}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("admin.testimonials.name")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">{t("admin.testimonials.company")}</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Wedding Planner"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">{t("admin.testimonials.country")}</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Bangladesh"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">{t("admin.testimonials.rating")}</Label>
                <div className="flex gap-1 pt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= formData.rating
                            ? "fill-[var(--admin-star)] text-[var(--admin-star)]"
                            : "text-[var(--ast-neutral-border)] hover:text-[var(--admin-star)]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conditional: Photo Avatar Upload */}
            {formData.type === "PHOTO" && (
              <ImageUpload
                label="Avatar Photo"
                description="Upload customer photo or enter URL"
                value={formData.avatar}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                showUrlInput={true}
              />
            )}

            {/* Conditional: Video Fields */}
            {formData.type === "VIDEO" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">Supports YouTube, Vimeo, or direct video URLs</p>
                </div>
                <ImageUpload
                  label="Video Thumbnail"
                  description="Upload thumbnail or leave empty for YouTube auto-fetch"
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                  showUrlInput={true}
                />
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">{t("admin.testimonials.content")}</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={t("admin.testimonials.contentPlaceholder")}
                rows={4}
              />
            </div>

            {/* Tags Multi-select */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("admin.testimonials.tags")}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setTagsDialogOpen(true)}
                >
                  {t("admin.testimonials.manageTags")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => {
                      const newTags = formData.tags.includes(tag.value)
                        ? formData.tags.filter((t) => t !== tag.value)
                        : [...formData.tags, tag.value];
                      setFormData({ ...formData, tags: newTags });
                    }}
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors",
                      formData.tags.includes(tag.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-input"
                    )}
                  >
                    {tag.label}
                  </button>
                ))}
                {availableTags.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("admin.testimonials.noTagsAvailable")}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t("admin.testimonials.selectTagsHelp")}</p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">{t("admin.testimonials.activeWidgets")}</Label>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.testimonials.deleteQuestion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.testimonials.deleteDesc", { name: selectedTestimonial?.name || "" })}
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
