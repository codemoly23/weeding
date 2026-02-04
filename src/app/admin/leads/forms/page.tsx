"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  List,
  FileText,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface FormTemplate {
  id: string;
  name: string;
  description: string | null;
  fields: FormField[];
  isActive: boolean;
  isSystem: boolean;
  usageCount: number;
  createdAt: string;
  _count: { formInstances: number };
}

interface FormInstance {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  submissionCount: number;
  conversionCount: number;
  lastSubmission: string | null;
  createdAt: string;
  template: { id: string; name: string };
  _count: { leads: number };
}

interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

const DEFAULT_FIELDS: FormField[] = [
  { id: "f1", type: "text", name: "name", label: "Full Name", placeholder: "John Doe", required: true },
  { id: "f2", type: "email", name: "email", label: "Email", placeholder: "john@example.com", required: true },
  { id: "f3", type: "phone", name: "phone", label: "Phone", placeholder: "+1 (555) 000-0000", required: false },
  { id: "f4", type: "textarea", name: "message", label: "Message", placeholder: "How can we help?", required: false },
];

export default function FormsPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [instances, setInstances] = useState<FormInstance[]>([]);
  const [loading, setLoading] = useState(true);

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    fields: DEFAULT_FIELDS,
  });

  // Instance dialog
  const [instanceDialogOpen, setInstanceDialogOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<FormInstance | null>(null);
  const [savingInstance, setSavingInstance] = useState(false);
  const [instanceForm, setInstanceForm] = useState({
    name: "",
    slug: "",
    templateId: "",
    successMessage: "Thank you! We'll be in touch soon.",
  });

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "template" | "instance"; item: FormTemplate | FormInstance } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [templatesRes, instancesRes] = await Promise.all([
        fetch("/api/admin/lead-form-templates?includeInactive=true"),
        fetch("/api/admin/lead-forms?includeInactive=true"),
      ]);

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }

      if (instancesRes.ok) {
        const data = await instancesRes.json();
        setInstances(data.instances || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch form data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Template handlers
  const openTemplateDialog = (template?: FormTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        description: template.description || "",
        fields: template.fields || DEFAULT_FIELDS,
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({ name: "", description: "", fields: DEFAULT_FIELDS });
    }
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    try {
      setSavingTemplate(true);
      const url = editingTemplate
        ? `/api/admin/lead-form-templates/${editingTemplate.id}`
        : "/api/admin/lead-form-templates";
      const method = editingTemplate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm),
      });

      if (!response.ok) throw new Error("Failed to save template");

      toast.success(editingTemplate ? "Template updated" : "Template created");
      setTemplateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  };

  // Instance handlers
  const openInstanceDialog = (instance?: FormInstance) => {
    if (instance) {
      setEditingInstance(instance);
      setInstanceForm({
        name: instance.name,
        slug: instance.slug,
        templateId: instance.template.id,
        successMessage: "",
      });
    } else {
      setEditingInstance(null);
      setInstanceForm({
        name: "",
        slug: "",
        templateId: templates[0]?.id || "",
        successMessage: "Thank you! We'll be in touch soon.",
      });
    }
    setInstanceDialogOpen(true);
  };

  const handleSaveInstance = async () => {
    if (!instanceForm.name.trim() || !instanceForm.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      setSavingInstance(true);
      const url = editingInstance
        ? `/api/admin/lead-forms/${editingInstance.id}`
        : "/api/admin/lead-forms";
      const method = editingInstance ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instanceForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save form");
      }

      toast.success(editingInstance ? "Form updated" : "Form created");
      setInstanceDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving instance:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save form");
    } finally {
      setSavingInstance(false);
    }
  };

  // Delete handlers
  const openDeleteDialog = (type: "template" | "instance", item: FormTemplate | FormInstance) => {
    setItemToDelete({ type, item });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      const url = itemToDelete.type === "template"
        ? `/api/admin/lead-form-templates/${itemToDelete.item.id}`
        : `/api/admin/lead-forms/${itemToDelete.item.id}`;

      const response = await fetch(url, { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success(`${itemToDelete.type === "template" ? "Template" : "Form"} deleted`);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  // Toggle active status
  const toggleActive = async (type: "template" | "instance", id: string, currentActive: boolean) => {
    try {
      const url = type === "template"
        ? `/api/admin/lead-form-templates/${id}`
        : `/api/admin/lead-forms/${id}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(`${type === "template" ? "Template" : "Form"} ${!currentActive ? "activated" : "deactivated"}`);
      fetchData();
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Forms</h1>
          <p className="text-muted-foreground">
            Manage form templates and instances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/leads">
              <List className="mr-2 h-4 w-4" />
              Back to Leads
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">
            <FileText className="mr-2 h-4 w-4" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="instances">
            <Copy className="mr-2 h-4 w-4" />
            Form Instances ({instances.length})
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Form Templates</CardTitle>
                <CardDescription>Reusable form field configurations</CardDescription>
              </div>
              <Button onClick={() => openTemplateDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No templates yet. Create your first template.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Fields</TableHead>
                      <TableHead>Instances</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            {template.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {template.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{template.fields?.length || 0} fields</TableCell>
                        <TableCell>{template._count.formInstances}</TableCell>
                        <TableCell>
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {template.isSystem && (
                            <Badge variant="outline" className="ml-1">System</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openTemplateDialog(template)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleActive("template", template.id, template.isActive)}>
                                {template.isActive ? (
                                  <><ToggleLeft className="mr-2 h-4 w-4" />Deactivate</>
                                ) : (
                                  <><ToggleRight className="mr-2 h-4 w-4" />Activate</>
                                )}
                              </DropdownMenuItem>
                              {!template.isSystem && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => openDeleteDialog("template", template)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instances Tab */}
        <TabsContent value="instances">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Form Instances</CardTitle>
                <CardDescription>Page-specific form configurations</CardDescription>
              </div>
              <Button onClick={() => openInstanceDialog()} disabled={templates.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                New Form
              </Button>
            </CardHeader>
            <CardContent>
              {instances.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No form instances yet. Create a template first, then add forms.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instances.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="font-medium">{instance.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-1 rounded">{instance.slug}</code>
                        </TableCell>
                        <TableCell>{instance.template.name}</TableCell>
                        <TableCell>{instance._count.leads}</TableCell>
                        <TableCell>
                          <Badge variant={instance.isActive ? "default" : "secondary"}>
                            {instance.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openInstanceDialog(instance)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleActive("instance", instance.id, instance.isActive)}>
                                {instance.isActive ? (
                                  <><ToggleLeft className="mr-2 h-4 w-4" />Deactivate</>
                                ) : (
                                  <><ToggleRight className="mr-2 h-4 w-4" />Activate</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => openDeleteDialog("instance", instance)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle>
            <DialogDescription>
              Create a reusable form template with field configurations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="e.g., LLC Lead Form"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                placeholder="Describe this template..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Fields ({templateForm.fields.length})</Label>
              <div className="text-sm text-muted-foreground">
                Default fields: Name, Email, Phone, Message
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
                {savingTemplate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTemplate ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instance Dialog */}
      <Dialog open={instanceDialogOpen} onOpenChange={setInstanceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingInstance ? "Edit Form" : "New Form Instance"}</DialogTitle>
            <DialogDescription>
              Create a page-specific form configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Form Name *</Label>
              <Input
                value={instanceForm.name}
                onChange={(e) => setInstanceForm({ ...instanceForm, name: e.target.value })}
                placeholder="e.g., Homepage Contact Form"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={instanceForm.slug}
                onChange={(e) => setInstanceForm({
                  ...instanceForm,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                })}
                placeholder="e.g., homepage-contact"
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and dashes only
              </p>
            </div>
            {!editingInstance && (
              <div className="space-y-2">
                <Label>Template *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={instanceForm.templateId}
                  onChange={(e) => setInstanceForm({ ...instanceForm, templateId: e.target.value })}
                >
                  <option value="">Select template...</option>
                  {templates.filter(t => t.isActive).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Success Message</Label>
              <Textarea
                value={instanceForm.successMessage}
                onChange={(e) => setInstanceForm({ ...instanceForm, successMessage: e.target.value })}
                placeholder="Thank you for your submission!"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setInstanceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveInstance} disabled={savingInstance}>
                {savingInstance && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingInstance ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {itemToDelete?.type === "template" ? "Template" : "Form"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.item.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
