"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Eye, EyeOff, Upload, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useLanguage } from "@/lib/i18n/language-context";

interface WeddingTemplate {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bg: string;
  font: string;
  tags: string[];
  imageUrl: string;
  features: string[];
  plannerTheme: string;
  plannerPrimary: string;
  plannerAccent: string;
  plannerFont: string;
  active: boolean;
  sortOrder: number;
}

const EMPTY_FORM: Omit<WeddingTemplate, "id"> = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  primaryColor: "#be185d",
  accentColor: "#fce7f3",
  bg: "#ffffff",
  font: "Inter",
  tags: [],
  imageUrl: "",
  features: [],
  plannerTheme: "modern",
  plannerPrimary: "#be185d",
  plannerAccent: "#fce7f3",
  plannerFont: "Inter",
  active: true,
  sortOrder: 0,
};

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function WeddingTemplatesPage() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<WeddingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wedding-templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      toast.error(t("admin.weddingTemplates.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  function copyUrl(slug: string) {
    const url = `/wedding-website/themes?style=${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  }

  async function uploadImage(file: File) {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "designers");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((f) => ({ ...f, imageUrl: data.url }));
      toast.success(t("admin.weddingTemplates.imageUploaded"));
    } catch {
      toast.error(t("admin.weddingTemplates.imageUploadFailed"));
    } finally {
      setImageUploading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTagsInput("");
    setFeaturesInput("");
    setDialogOpen(true);
  }

  function openEdit(t: WeddingTemplate) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      slug: t.slug,
      tagline: t.tagline,
      description: t.description,
      primaryColor: t.primaryColor,
      accentColor: t.accentColor,
      bg: t.bg,
      font: t.font,
      tags: t.tags,
      imageUrl: t.imageUrl,
      features: t.features,
      plannerTheme: t.plannerTheme,
      plannerPrimary: t.plannerPrimary,
      plannerAccent: t.plannerAccent,
      plannerFont: t.plannerFont,
      active: t.active,
      sortOrder: t.sortOrder,
    });
    setTagsInput(t.tags.join(", "));
    setFeaturesInput(t.features.join("\n"));
    setDialogOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: editingId ? f.slug : slugify(name),
    }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.tagline.trim()) {
      toast.error(t("admin.weddingTemplates.nameRequired"));
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      features: featuresInput.split("\n").map((f) => f.trim()).filter(Boolean),
    };

    try {
      const url = editingId
        ? `/api/admin/wedding-templates/${editingId}`
        : "/api/admin/wedding-templates";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("admin.weddingTemplates.saveFailed"));
        return;
      }
      toast.success(editingId ? t("admin.weddingTemplates.updated") : t("admin.weddingTemplates.created"));
      setDialogOpen(false);
      fetchTemplates();
    } catch (err) {
      console.error("Save template error:", err);
      toast.error(t("admin.weddingTemplates.errorOccurred"));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(tmpl: WeddingTemplate) {
    try {
      await fetch(`/api/admin/wedding-templates/${tmpl.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !tmpl.active }),
      });
      setTemplates((prev) =>
        prev.map((tp) => (tp.id === tmpl.id ? { ...tp, active: !tmpl.active } : tp))
      );
    } catch {
      toast.error(t("admin.weddingTemplates.updateFailed"));
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/wedding-templates/${deleteId}`, { method: "DELETE" });
      if (!res.ok) { toast.error(t("admin.weddingTemplates.deleteFailed")); return; }
      toast.success(t("admin.weddingTemplates.deleted"));
      setDeleteId(null);
      fetchTemplates();
    } catch {
      toast.error(t("admin.weddingTemplates.errorOccurred"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.weddingTemplates.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("admin.weddingTemplates.subtitle")}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> {t("admin.weddingTemplates.addTemplate")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-xl">
          {t("admin.weddingTemplates.noTemplates")}
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

              {/* Color preview */}
              <div className="flex gap-1 shrink-0">
                <div
                  className="w-8 h-8 rounded-lg border border-border"
                  style={{ backgroundColor: tmpl.primaryColor }}
                  title={`Primary: ${tmpl.primaryColor}`}
                />
                <div
                  className="w-8 h-8 rounded-lg border border-border"
                  style={{ backgroundColor: tmpl.accentColor }}
                  title={`Accent: ${tmpl.accentColor}`}
                />
              </div>

              {/* Image preview */}
              {tmpl.imageUrl && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                  <img src={tmpl.imageUrl} alt={tmpl.name} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{tmpl.name}</span>
                  <code className="text-[11px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                    {tmpl.slug}
                  </code>
                  {tmpl.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{tmpl.tagline}</p>
              </div>

              {/* Sort order */}
              <span className="text-xs text-muted-foreground shrink-0">#{tmpl.sortOrder}</span>

              {/* Active toggle */}
              <div className="flex items-center gap-1.5 shrink-0">
                {tmpl.active ? (
                  <Eye className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <Switch
                  checked={tmpl.active}
                  onCheckedChange={() => handleToggleActive(tmpl)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Copy URL"
                  onClick={() => copyUrl(tmpl.slug)}
                >
                  {copiedSlug === tmpl.slug ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(tmpl)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(tmpl.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t("admin.weddingTemplates.editTemplate") : t("admin.weddingTemplates.addTemplate")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("admin.weddingTemplates.templateName")}</Label>
                <Input
                  placeholder={t("admin.weddingTemplates.templateNamePh")}
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.weddingTemplates.slugUrl")}</Label>
                <Input
                  placeholder={t("admin.weddingTemplates.slugPh")}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                />
                <p className="text-[11px] text-muted-foreground">
                  /wedding-website/themes?style={form.slug || "..."}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("admin.weddingTemplates.tagline")}</Label>
              <Input
                placeholder={t("admin.weddingTemplates.taglinePh")}
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("admin.weddingTemplates.description")}</Label>
              <Textarea
                placeholder={t("admin.weddingTemplates.descriptionPh")}
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>{t("admin.weddingTemplates.primaryColor")}</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value, plannerPrimary: e.target.value })}
                    className="h-9 w-10 rounded border border-border cursor-pointer p-0.5"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value, plannerPrimary: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.weddingTemplates.accentColor")}</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value, plannerAccent: e.target.value })}
                    className="h-9 w-10 rounded border border-border cursor-pointer p-0.5"
                  />
                  <Input
                    value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value, plannerAccent: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.weddingTemplates.bgColor")}</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.bg}
                    onChange={(e) => setForm({ ...form, bg: e.target.value })}
                    className="h-9 w-10 rounded border border-border cursor-pointer p-0.5"
                  />
                  <Input
                    value={form.bg}
                    onChange={(e) => setForm({ ...form, bg: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Font */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("admin.weddingTemplates.fontFamily")}</Label>
                <Select value={form.font} onValueChange={(v) => setForm({ ...form, font: v, plannerFont: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Modern)</SelectItem>
                    <SelectItem value="Georgia">Georgia (Classic)</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display (Elegant)</SelectItem>
                    <SelectItem value="Lato">Lato (Clean)</SelectItem>
                    <SelectItem value="Merriweather">Merriweather (Traditional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.weddingTemplates.plannerTheme")}</Label>
                <Select value={form.plannerTheme} onValueChange={(v) => setForm({ ...form, plannerTheme: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="floral">Floral</SelectItem>
                    <SelectItem value="rustic">Rustic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-1.5">
              <Label>{t("admin.weddingTemplates.previewImage")}</Label>
              {form.imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "" })}
                    className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  {imageUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">{t("admin.weddingTemplates.clickUpload")}</span>
                      <span className="text-xs text-muted-foreground/60 mt-0.5">{t("admin.weddingTemplates.imageFormats")}</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={imageUploading}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
                  />
                </label>
              )}
              <Input
                placeholder={t("admin.weddingTemplates.pasteImageUrl")}
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label>{t("admin.weddingTemplates.tags")}</Label>
              <Input
                placeholder={t("admin.weddingTemplates.tagsPh")}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            {/* Features */}
            <div className="space-y-1.5">
              <Label>{t("admin.weddingTemplates.features")}</Label>
              <Textarea
                placeholder={"RSVP form\nPhoto gallery\nCountdown timer"}
                rows={4}
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
              />
            </div>

            {/* Sort & Active */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("admin.weddingTemplates.sortOrder")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.weddingTemplates.activeLabel")}</Label>
                <div className="flex items-center h-10">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: v })}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {form.active ? t("admin.weddingTemplates.visible") : t("admin.weddingTemplates.hidden")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.weddingTemplates.cancel")}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? t("common.saveChanges") : t("admin.weddingTemplates.createTemplate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.weddingTemplates.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.weddingTemplates.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.weddingTemplates.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("admin.weddingTemplates.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
