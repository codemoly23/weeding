"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/ui/rich-text-editor";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface Feature {
  id?: string;
  text: string;
}

interface Package {
  id?: string;
  name: string;
  description: string;
  price: number;
  priceUSD?: number;
  priceBDT: number | null;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  features: Feature[];
  notIncluded: Feature[];
}

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  sortOrder: number;
}

interface ServiceData {
  id?: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  icon: string;
  image: string;
  startingPrice: number;
  processingTime: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  categoryId: string;
  metaTitle: string;
  metaDescription: string;
  features: Feature[];
  packages: Package[];
  faqs: FAQ[];
}

const defaultService: ServiceData = {
  slug: "",
  name: "",
  shortDesc: "",
  description: "",
  icon: "",
  image: "",
  startingPrice: 0,
  processingTime: "",
  isPopular: false,
  isActive: true,
  sortOrder: 0,
  categoryId: "",
  metaTitle: "",
  metaDescription: "",
  features: [],
  packages: [],
  faqs: [],
};

const defaultPackage: Package = {
  name: "",
  description: "",
  price: 0,
  priceBDT: null,
  isPopular: false,
  isActive: true,
  sortOrder: 0,
  features: [],
  notIncluded: [],
};

const defaultFaq: FAQ = {
  question: "",
  answer: "",
  sortOrder: 0,
};

export default function ServiceEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const serviceId = isNew ? null : (params.id as string);

  const [service, setService] = useState<ServiceData>(defaultService);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // Package modal state
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editingPackageIndex, setEditingPackageIndex] = useState<number | null>(null);

  // FAQ modal state
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);

  const fetchService = useCallback(async () => {
    if (!serviceId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`);
      const data = await response.json();

      if (response.ok) {
        setService({
          ...defaultService,
          ...data,
          slug: data.slug || "",
          name: data.name || "",
          shortDesc: data.shortDesc || "",
          description: data.description || "",
          icon: data.icon || "",
          image: data.image || "",
          startingPrice: data.startingPrice ?? 0,
          processingTime: data.processingTime || "",
          categoryId: data.categoryId || "",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          features: data.features || [],
          packages: (data.packages || []).map((pkg: Package) => ({
            ...pkg,
            name: pkg.name || "",
            description: pkg.description || "",
            price: pkg.price ?? pkg.priceUSD ?? 0,
            features: pkg.features || [],
            notIncluded: pkg.notIncluded || [],
          })),
          faqs: data.faqs || [],
        });
      } else {
        toast.error("Failed to load service");
        router.push("/admin/services");
      }
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Failed to load service");
    } finally {
      setIsLoading(false);
    }
  }, [serviceId, router]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchService();
    }
  }, [isNew, fetchService, fetchCategories]);

  const handleInputChange = (
    field: keyof ServiceData,
    value: string | number | boolean
  ) => {
    setService((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!service.name.trim()) {
      toast.error("Service name is required");
      return;
    }
    if (!service.slug.trim()) {
      toast.error("URL slug is required");
      return;
    }
    if (!service.shortDesc.trim()) {
      toast.error("Short description is required");
      return;
    }
    if (!service.description.trim()) {
      toast.error("Full description is required");
      return;
    }

    setIsSaving(true);
    try {
      const url = isNew
        ? "/api/admin/services"
        : `/api/admin/services/${serviceId}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...service,
          features: service.features.map((f) => f.text),
          categoryId: service.categoryId || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isNew ? "Service created" : "Service updated");
        if (isNew) {
          router.push(`/admin/services/${data.id}`);
        }
      } else {
        toast.error(data.error || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  // Feature management
  const addFeature = () => {
    setService((prev) => ({
      ...prev,
      features: [...prev.features, { text: "" }],
    }));
  };

  const updateFeature = (index: number, text: string) => {
    setService((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, text } : f)),
    }));
  };

  const removeFeature = (index: number) => {
    setService((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Package management
  const openPackageDialog = (pkg?: Package, index?: number) => {
    if (pkg && index !== undefined) {
      setEditingPackage({ ...pkg });
      setEditingPackageIndex(index);
    } else {
      setEditingPackage({ ...defaultPackage, sortOrder: service.packages.length });
      setEditingPackageIndex(null);
    }
    setPackageDialogOpen(true);
  };

  const savePackage = async () => {
    if (!editingPackage) return;

    if (!editingPackage.name.trim()) {
      toast.error("Package name is required");
      return;
    }

    if (editingPackageIndex !== null) {
      // Update existing package
      setService((prev) => ({
        ...prev,
        packages: prev.packages.map((p, i) =>
          i === editingPackageIndex ? editingPackage : p
        ),
      }));
    } else {
      // Add new package
      setService((prev) => ({
        ...prev,
        packages: [...prev.packages, editingPackage],
      }));
    }

    setPackageDialogOpen(false);
    setEditingPackage(null);
    setEditingPackageIndex(null);

    // If service exists, save package to API
    if (serviceId && editingPackageIndex === null) {
      try {
        const response = await fetch(`/api/admin/services/${serviceId}/packages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editingPackage,
            priceUSD: editingPackage.price,
            features: editingPackage.features.map((f) => f.text),
            notIncluded: editingPackage.notIncluded.map((n) => n.text),
          }),
        });

        if (response.ok) {
          toast.success("Package added");
          fetchService();
        }
      } catch (error) {
        console.error("Error saving package:", error);
      }
    }
  };

  const removePackage = async (index: number) => {
    const pkg = service.packages[index];

    if (pkg.id) {
      try {
        const response = await fetch(`/api/admin/packages/${pkg.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Package deleted");
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to delete package");
          return;
        }
      } catch (error) {
        console.error("Error deleting package:", error);
        toast.error("Failed to delete package");
        return;
      }
    }

    setService((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }));
  };

  // FAQ management
  const openFaqDialog = (faq?: FAQ, index?: number) => {
    if (faq && index !== undefined) {
      setEditingFaq({ ...faq });
      setEditingFaqIndex(index);
    } else {
      setEditingFaq({ ...defaultFaq, sortOrder: service.faqs.length });
      setEditingFaqIndex(null);
    }
    setFaqDialogOpen(true);
  };

  const saveFaq = async () => {
    if (!editingFaq) return;

    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    if (editingFaqIndex !== null) {
      setService((prev) => ({
        ...prev,
        faqs: prev.faqs.map((f, i) => (i === editingFaqIndex ? editingFaq : f)),
      }));
    } else {
      setService((prev) => ({
        ...prev,
        faqs: [...prev.faqs, editingFaq],
      }));
    }

    setFaqDialogOpen(false);
    setEditingFaq(null);
    setEditingFaqIndex(null);

    // If service exists, save FAQ to API
    if (serviceId && editingFaqIndex === null) {
      try {
        const response = await fetch(`/api/admin/services/${serviceId}/faqs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingFaq),
        });

        if (response.ok) {
          toast.success("FAQ added");
          fetchService();
        }
      } catch (error) {
        console.error("Error saving FAQ:", error);
      }
    }
  };

  const removeFaq = async (index: number) => {
    const faq = service.faqs[index];

    if (faq.id) {
      try {
        const response = await fetch(`/api/admin/faqs/${faq.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("FAQ deleted");
        } else {
          toast.error("Failed to delete FAQ");
          return;
        }
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        toast.error("Failed to delete FAQ");
        return;
      }
    }

    setService((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Generate slug from name
  const generateSlug = () => {
    const slug = service.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    handleInputChange("slug", slug);
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
            <Link href="/admin/services">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? "New Service" : "Edit Service"}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "Create a new service" : service.name}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="packages">
            Packages ({service.packages.length})
          </TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({service.faqs.length})</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Service Name *</Label>
                      <Input
                        id="name"
                        value={service.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g., LLC Formation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="slug"
                          value={service.slug}
                          onChange={(e) => handleInputChange("slug", e.target.value)}
                          placeholder="e.g., llc-formation"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generateSlug}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDesc">Short Description *</Label>
                    <Textarea
                      id="shortDesc"
                      value={service.shortDesc}
                      onChange={(e) => handleInputChange("shortDesc", e.target.value)}
                      placeholder="Brief description for service cards..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Full Description *</Label>
                    <RichTextEditor
                      value={service.description}
                      onChange={(value) => handleInputChange("description", value)}
                      placeholder="Detailed service description with formatting..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Service Features</CardTitle>
                      <CardDescription>
                        Key features displayed on service cards
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Feature
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {service.features.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No features added yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                          <Input
                            value={feature.text}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder="Feature description..."
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={service.categoryId}
                      onValueChange={(v) => handleInputChange("categoryId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startingPrice">Starting Price ($)</Label>
                    <Input
                      id="startingPrice"
                      type="number"
                      min="0"
                      value={service.startingPrice}
                      onChange={(e) =>
                        handleInputChange("startingPrice", Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="processingTime">Processing Time</Label>
                    <Input
                      id="processingTime"
                      value={service.processingTime}
                      onChange={(e) =>
                        handleInputChange("processingTime", e.target.value)
                      }
                      placeholder="e.g., 3-5 business days"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon Name</Label>
                    <Input
                      id="icon"
                      value={service.icon}
                      onChange={(e) => handleInputChange("icon", e.target.value)}
                      placeholder="e.g., Building2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lucide icon name
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isPopular">Popular Service</Label>
                    <Switch
                      id="isPopular"
                      checked={service.isPopular}
                      onCheckedChange={(v) => handleInputChange("isPopular", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active</Label>
                    <Switch
                      id="isActive"
                      checked={service.isActive}
                      onCheckedChange={(v) => handleInputChange("isActive", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Packages</CardTitle>
                  <CardDescription>
                    Pricing packages for this service
                  </CardDescription>
                </div>
                <Button onClick={() => openPackageDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {service.packages.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No packages added yet. Add your first package to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {service.packages.map((pkg, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="text-lg font-bold">${pkg.price}</span>
                          {pkg.isPopular && (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                              Popular
                            </span>
                          )}
                        </div>
                        {pkg.description && (
                          <p className="text-sm text-muted-foreground">
                            {pkg.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{pkg.features?.length || 0} features</span>
                          <span>{pkg.notIncluded?.length || 0} not included</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPackageDialog(pkg, index)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePackage(index)}
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
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>FAQs</CardTitle>
                  <CardDescription>
                    Frequently asked questions for this service
                  </CardDescription>
                </div>
                <Button onClick={() => openFaqDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {service.faqs.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No FAQs added yet. Add your first FAQ to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {service.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{faq.question}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {faq.answer.replace(/<[^>]+>/g, '')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFaqDialog(faq, index)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFaq(index)}
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
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your service page for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={service.metaTitle}
                  onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                  placeholder="SEO title (60 characters max)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {service.metaTitle?.length || 0}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={service.metaDescription}
                  onChange={(e) =>
                    handleInputChange("metaDescription", e.target.value)
                  }
                  placeholder="SEO description (160 characters max)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {service.metaDescription?.length || 0}/160 characters
                </p>
              </div>

              {/* SEO Preview */}
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Search Engine Preview
                </p>
                <div className="space-y-1">
                  <p className="text-lg text-blue-600 hover:underline">
                    {service.metaTitle || service.name || "Service Title"}
                  </p>
                  <p className="text-sm text-green-700">
                    llcpad.com/services/{service.slug || "service-slug"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service.metaDescription ||
                      service.shortDesc ||
                      "Service description will appear here..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Package Dialog */}
      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPackageIndex !== null ? "Edit Package" : "Add Package"}
            </DialogTitle>
            <DialogDescription>
              Configure the package details and pricing
            </DialogDescription>
          </DialogHeader>
          {editingPackage && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Package Name *</Label>
                  <Input
                    value={editingPackage.name}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, name: e.target.value })
                    }
                    placeholder="e.g., Basic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (USD) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editingPackage.price}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingPackage.description}
                  onChange={(e) =>
                    setEditingPackage({
                      ...editingPackage,
                      description: e.target.value,
                    })
                  }
                  placeholder="Package tagline..."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPackage.isPopular}
                    onCheckedChange={(v) =>
                      setEditingPackage({ ...editingPackage, isPopular: v })
                    }
                  />
                  <Label>Popular</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPackage.isActive}
                    onCheckedChange={(v) =>
                      setEditingPackage({ ...editingPackage, isActive: v })
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Included Features</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingPackage({
                        ...editingPackage,
                        features: [...editingPackage.features, { text: "" }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {editingPackage.features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={f.text}
                      onChange={(e) => {
                        const updated = [...editingPackage.features];
                        updated[i] = { ...updated[i], text: e.target.value };
                        setEditingPackage({ ...editingPackage, features: updated });
                      }}
                      placeholder="Feature..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setEditingPackage({
                          ...editingPackage,
                          features: editingPackage.features.filter((_, idx) => idx !== i),
                        })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Not Included</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingPackage({
                        ...editingPackage,
                        notIncluded: [...editingPackage.notIncluded, { text: "" }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {editingPackage.notIncluded.map((n, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={n.text}
                      onChange={(e) => {
                        const updated = [...editingPackage.notIncluded];
                        updated[i] = { ...updated[i], text: e.target.value };
                        setEditingPackage({ ...editingPackage, notIncluded: updated });
                      }}
                      placeholder="Not included..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setEditingPackage({
                          ...editingPackage,
                          notIncluded: editingPackage.notIncluded.filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePackage}>Save Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFaqIndex !== null ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
          </DialogHeader>
          {editingFaq && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question *</Label>
                <Input
                  value={editingFaq.question}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  placeholder="What is...?"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer *</Label>
                <Textarea
                  value={editingFaq.answer}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
                  placeholder="Answer text..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveFaq}>Save FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
