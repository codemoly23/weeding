"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, HelpCircle, Eye, EyeOff, Filter } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { FaqRichEditor } from "@/components/admin/ui/faq-rich-editor";
import { useLanguage } from "@/lib/i18n/language-context";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const categories = [
  { value: "general", labelKey: "admin.faq.cat.general" },
  { value: "pricing", labelKey: "admin.faq.cat.pricing" },
  { value: "international", labelKey: "admin.faq.cat.international" },
  { value: "account", labelKey: "admin.faq.cat.account" },
];

const defaultFormData = {
  question: "",
  answer: "",
  category: "general",
  isActive: true,
  sortOrder: 0,
};

export default function FAQPage() {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    try {
      const res = await fetch("/api/admin/global-faqs");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFaqs(data);
    } catch (error) {
      toast.error(t("admin.faq.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedFaq(null);
    setFormData(defaultFormData);
    setPreviewMode(false);
    setDialogOpen(true);
  }

  function openEditDialog(faq: FAQ) {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "general",
      isActive: faq.isActive,
      sortOrder: faq.sortOrder,
    });
    setPreviewMode(false);
    setDialogOpen(true);
  }

  function openDeleteDialog(faq: FAQ) {
    setSelectedFaq(faq);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.question || !formData.answer) {
      toast.error(t("admin.faq.questionRequired"));
      return;
    }

    setSaving(true);
    try {
      const url = selectedFaq
        ? `/api/admin/global-faqs/${selectedFaq.id}`
        : "/api/admin/global-faqs";
      const method = selectedFaq ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(selectedFaq ? t("admin.faq.updated") : t("admin.faq.created"));
      setDialogOpen(false);
      fetchFaqs();
    } catch (error) {
      toast.error(t("admin.faq.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedFaq) return;

    try {
      const res = await fetch(`/api/admin/global-faqs/${selectedFaq.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success(t("admin.faq.deleted"));
      setDeleteDialogOpen(false);
      fetchFaqs();
    } catch (error) {
      toast.error(t("admin.faq.deleteFailed"));
    }
  }

  async function toggleActive(faq: FAQ) {
    try {
      const res = await fetch(`/api/admin/global-faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...faq, isActive: !faq.isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");
      fetchFaqs();
    } catch (error) {
      toast.error(t("admin.faq.updateFailed"));
    }
  }

  const filteredFaqs = filterCategory === "all"
    ? faqs
    : faqs.filter((faq) => faq.category === filterCategory);

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const cat = faq.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.faq.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.faq.subtitle")}
          </p>
        </div>
        <Button onClick={openCreateDialog} className="self-start sm:self-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.faq.add")}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("admin.faq.filterByCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.faq.allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {t(cat.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline">{t("admin.faq.count", { count: String(filteredFaqs.length) })}</Badge>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">{t("admin.faq.noFaqs")}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("admin.faq.noFaqsDesc")}
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.faq.add")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {t(categories.find((c) => c.value === category)?.labelKey || category)}
                  <Badge variant="secondary">{categoryFaqs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`rounded-lg border p-4 ${
                      !faq.isActive ? "opacity-60 bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-medium">{faq.question}</p>
                        <div
                          className="prose prose-sm max-w-none text-muted-foreground line-clamp-2 *:my-0"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={faq.isActive ? "default" : "secondary"}>
                          {faq.isActive ? t("common.active") : t("common.hidden")}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(faq)}
                        >
                          {faq.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(faq)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => openDeleteDialog(faq)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setPreviewMode(false);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedFaq ? t("admin.faq.edit") : t("admin.faq.add")}</DialogTitle>
              {formData.answer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="gap-1.5"
                >
                  {previewMode ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      {t("common.edit")}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      {t("admin.faq.preview")}
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t("admin.faq.category")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {t(cat.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">{t("admin.faq.question")}</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="What is an LLC?"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.faq.answer")}</Label>
              {previewMode ? (
                <div
                  className="prose prose-sm max-w-none rounded-lg border bg-muted/30 p-4 min-h-50"
                  dangerouslySetInnerHTML={{ __html: formData.answer }}
                />
              ) : (
                <FaqRichEditor
                  content={formData.answer}
                  onChange={(html) => setFormData({ ...formData, answer: html })}
                  placeholder={t("admin.faq.writeAnswer")}
                  minHeight={200}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">{t("admin.faq.sortOrder")}</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">{t("common.active")}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              setPreviewMode(false);
            }}>
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
            <AlertDialogTitle>{t("admin.faq.deleteQuestion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.faq.deleteDesc")}
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
