"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Store, Plus, Check, X, Pencil, Trash2, ExternalLink,
  Search, Star, ChevronLeft, ChevronRight, KeyRound, BadgeCheck, Loader2,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/lib/i18n/language-context";

type VendorCategory =
  | "VENUE" | "PHOTOGRAPHY" | "VIDEOGRAPHY" | "CATERING" | "MUSIC_DJ"
  | "FLOWERS" | "DRESS_ATTIRE" | "RINGS" | "DECORATIONS" | "TRANSPORTATION"
  | "HAIR_MAKEUP" | "WEDDING_PLANNER" | "OTHER";

type VendorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
type VendorPlanTier = "TRIAL" | "BUSINESS" | "EXPIRED";

const CATEGORY_LABELS: Record<VendorCategory, string> = {
  VENUE: "Venue", PHOTOGRAPHY: "Photography", VIDEOGRAPHY: "Videography",
  CATERING: "Catering", MUSIC_DJ: "Music & DJ", FLOWERS: "Flowers",
  DRESS_ATTIRE: "Dress & Attire", RINGS: "Rings & Jewelry",
  DECORATIONS: "Decorations", TRANSPORTATION: "Transportation",
  HAIR_MAKEUP: "Hair & Makeup", WEDDING_PLANNER: "Wedding Planner", OTHER: "Other",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as VendorCategory[];

const CATEGORY_LABEL_KEYS: Record<VendorCategory, string> = {
  VENUE: "vendors.cat.venue",
  PHOTOGRAPHY: "vendors.cat.photography",
  VIDEOGRAPHY: "vendors.cat.videography",
  CATERING: "vendors.cat.catering",
  MUSIC_DJ: "vendors.cat.music",
  FLOWERS: "vendors.cat.flowers",
  DRESS_ATTIRE: "vendors.cat.dress",
  RINGS: "vendors.cat.rings",
  DECORATIONS: "vendors.cat.decorations",
  TRANSPORTATION: "vendors.cat.transport",
  HAIR_MAKEUP: "vendors.cat.hair",
  WEDDING_PLANNER: "vendors.cat.planner",
  OTHER: "vendors.cat.other",
};

interface Vendor {
  id: string;
  slug: string;
  businessName: string;
  category: VendorCategory;
  status: VendorStatus;
  city: string | null;
  country: string;
  isApproved: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  email: string | null;
  phone: string | null;
  website: string | null;
  tagline: string | null;
  description: string | null;
  startingPrice: number | null;
  currency: string;
  photos: string[];
  createdAt: string;
  planTier: VendorPlanTier;
  user: { email: string; phone: string | null; name: string | null } | null;
  _count: { inquiries: number; reviews: number };
}

interface FormData {
  businessName: string;
  category: VendorCategory;
  tagline: string;
  description: string;
  email: string;
  password: string;
  phone: string;
  website: string;
  city: string;
  country: string;
  startingPrice: string;
  currency: string;
  coverPhotoUrl: string;
  planTier: VendorPlanTier;
  isApproved: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
}

const emptyForm = (): FormData => ({
  businessName: "", category: "OTHER", tagline: "", description: "",
  email: "", password: "", phone: "", website: "", city: "", country: "SE",
  startingPrice: "", currency: "SEK", coverPhotoUrl: "",
  planTier: "TRIAL", isApproved: true, isActive: true, isFeatured: false, isVerified: false,
});

const STATUS_COLORS: Record<VendorStatus, string> = {
  PENDING:   "admin-status-warning",
  APPROVED:  "admin-status-success",
  REJECTED:  "admin-status-error",
  SUSPENDED: "admin-status-neutral",
};

export default function AdminVendorsPage() {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, featured: 0, verified: 0 });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [createLoginVendor, setCreateLoginVendor] = useState<{ id: string; name: string; email: string } | null>(null);
  const [createLoginPassword, setCreateLoginPassword] = useState("");
  const [createLoginSaving, setCreateLoginSaving] = useState(false);
  const [createLoginError, setCreateLoginError] = useState("");

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("q", search);
      const res = await fetch(`/api/admin/vendors?${params}`);
      const data = await res.json();
      setVendors(data.vendors || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setStats({
        total: data.total || 0,
        approved: data.stats?.approved ?? 0,
        pending: data.stats?.pending ?? 0,
        featured: data.stats?.featured ?? 0,
        verified: data.stats?.verified ?? 0,
      });
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  async function quickUpdate(id: string, patch: Record<string, unknown>) {
    await fetch(`/api/admin/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    fetchVendors();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/vendors/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    fetchVendors();
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyForm());
    setFormError("");
    setShowForm(true);
  }

  function openEdit(v: Vendor) {
    setEditId(v.id);
    setForm({
      businessName: v.businessName,
      category: v.category,
      tagline: v.tagline || "",
      description: v.description || "",
      email: v.email || v.user?.email || "",
      password: "",
      phone: v.phone || v.user?.phone || "",
      website: v.website || "",
      city: v.city || "",
      country: v.country,
      startingPrice: v.startingPrice ? String(v.startingPrice) : "",
      currency: v.currency,
      coverPhotoUrl: v.photos?.[0] || "",
      planTier: v.planTier ?? "TRIAL",
      isApproved: v.isApproved,
      isActive: v.isActive,
      isFeatured: v.isFeatured,
      isVerified: v.isVerified,
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleCreateLogin() {
    if (!createLoginVendor) return;
    if (createLoginPassword.length < 8) {
      setCreateLoginError("Password must be at least 8 characters");
      return;
    }
    setCreateLoginSaving(true);
    setCreateLoginError("");
    try {
      const res = await fetch(`/api/admin/vendors/${createLoginVendor.id}/create-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: createLoginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateLoginError(data.error || "Failed"); return; }
      setCreateLoginVendor(null);
      setCreateLoginPassword("");
      fetchVendors();
    } finally {
      setCreateLoginSaving(false);
    }
  }

  async function handleSave() {
    if (!form.businessName.trim()) { setFormError("Business name is required"); return; }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        ...form,
        startingPrice: form.startingPrice ? parseInt(form.startingPrice) : null,
        photos: form.coverPhotoUrl.trim() ? [form.coverPhotoUrl.trim()] : [],
        status: form.isApproved ? "APPROVED" : "PENDING",
        planTier: form.planTier,
      };
      const url = editId ? `/api/admin/vendors/${editId}` : "/api/admin/vendors";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setFormError(d.error || "Failed to save");
        return;
      }
      setShowForm(false);
      fetchVendors();
    } finally {
      setSaving(false);
    }
  }

  const statCards = [
    { label: t("admin.vendors.totalVendors"), value: stats.total, color: "text-foreground" },
    { label: t("admin.vendors.approved"), value: stats.approved, color: "text-[var(--ast-success-text)]" },
    { label: t("admin.vendors.pending"), value: stats.pending, color: "text-[var(--ast-warning-text)]" },
    { label: t("admin.vendors.featured"), value: stats.featured, color: "text-[var(--ast-warning-icon)]" },
    { label: t("admin.vendors.verified"), value: stats.verified, color: "text-[var(--ast-hold-text)]" },
  ];
  const categoryLabel = (category: VendorCategory) => t(CATEGORY_LABEL_KEYS[category]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Store className="h-6 w-6 shrink-0 text-[var(--admin-primary)]" />
          <div>
            <h1 className="text-2xl font-bold">{t("admin.vendors.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("admin.vendors.subtitle")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <Link href="/vendors" target="_blank">
            <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
              <ExternalLink className="h-4 w-4" /> {t("admin.nav.viewAllVendors")}
            </button>
          </Link>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--admin-primary)] text-[var(--admin-primary-fg)] rounded-lg hover:bg-[var(--admin-primary-hover)] transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> {t("admin.vendors.addVendor")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}
        className="flex gap-2"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("admin.vendors.searchPlaceholder")}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
          />
        </div>
        <button type="submit" className="px-4 py-2 text-sm bg-muted hover:bg-muted/70 text-foreground rounded-lg transition-colors">
          {t("common.search")}
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            {t("common.clear")}
          </button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.vendors.business")}</TableHead>
              <TableHead>{t("admin.vendors.category")}</TableHead>
              <TableHead>{t("admin.vendors.location")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("admin.vendors.plan")}</TableHead>
              <TableHead className="text-center">{t("admin.vendors.inquiries")}</TableHead>
              <TableHead className="text-center">{t("admin.vendors.reviews")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                  {t("admin.vendors.loading")}
                </TableCell>
              </TableRow>
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                  {t("admin.vendors.noneFound")}
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{v.businessName}</div>
                    {(v.email || v.user?.email) && (
                      <div className="text-xs text-muted-foreground">{v.email || v.user?.email}</div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      {v.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--ast-warning-icon)]">
                          <Star className="h-3 w-3 fill-[var(--admin-star)] text-[var(--admin-star)]" /> {t("admin.vendors.featured")}
                        </span>
                      )}
                      {v.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--admin-primary)]">
                          <BadgeCheck className="h-3 w-3" /> {t("admin.vendors.verified")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabel(v.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {v.city ? `${v.city}, ${v.country}` : v.country}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[v.status as VendorStatus] || "admin-status-neutral"}`}>
                      {t(`admin.status.${v.status ?? (v.isApproved ? "APPROVED" : "PENDING")}`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      v.planTier === "BUSINESS" ? "admin-status-hold" :
                      v.planTier === "TRIAL" ? "admin-status-info" :
                      "admin-status-neutral"
                    }`}>
                      {v.planTier ?? "TRIAL"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm">{v._count.inquiries}</TableCell>
                  <TableCell className="text-center text-sm">{v._count.reviews}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {v.status !== "APPROVED" && (
                        <button
                          onClick={() => quickUpdate(v.id, { isApproved: true, status: "APPROVED" })}
                          className="p-1.5 rounded text-gray-400 hover:text-[var(--ast-success-icon)] hover:bg-[var(--ast-success-bg)] transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {v.status === "APPROVED" && (
                        <button
                          onClick={() => quickUpdate(v.id, { isApproved: false, status: "SUSPENDED" })}
                          className="p-1.5 rounded text-gray-400 hover:text-[var(--ast-error-icon)] hover:bg-[var(--ast-error-bg)] transition-colors"
                          title="Suspend"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      {!v.user && (
                        <button
                          onClick={() => {
                            setCreateLoginVendor({ id: v.id, name: v.businessName, email: v.email || "" });
                            setCreateLoginPassword("");
                            setCreateLoginError("");
                          }}
                          className="p-1.5 rounded text-gray-400 hover:text-[var(--ast-warning-icon)] hover:bg-[var(--ast-warning-bg)] transition-colors"
                          title="Create login account"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                      )}
                      <Link href={`/vendors/${v.slug}`} target="_blank">
                        <button className="p-1.5 rounded text-gray-400 hover:text-[var(--admin-primary)] hover:bg-[var(--ast-hold-bg)] transition-colors" title="View public profile">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => openEdit(v)}
                        className="p-1.5 rounded text-gray-400 hover:text-[var(--ast-info-icon)] hover:bg-[var(--ast-info-bg)] transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: v.id, name: v.businessName })}
                        className="p-1.5 rounded text-gray-400 hover:text-[var(--ast-error-icon)] hover:bg-[var(--ast-error-bg)] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("admin.vendors.totalCount", { count: String(total) })}</span>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3">{t("common.pageOf", { page: String(page), total: String(totalPages) })}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.vendors.deleteQuestion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.vendors.deleteDesc", { name: deleteTarget?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Login Account Modal */}
      {createLoginVendor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setCreateLoginVendor(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Create Login Account</h2>
              <button onClick={() => setCreateLoginVendor(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{createLoginVendor.name}</strong> এর জন্য login account তৈরি করুন।
              {createLoginVendor.email ? (
                <span className="block mt-1 text-xs text-gray-500">Email: <strong>{createLoginVendor.email}</strong></span>
              ) : (
                <span className="block mt-1 text-xs text-[var(--ast-error-icon)]">এই vendor এর email নেই — আগে Edit করে email add করুন।</span>
              )}
            </p>
            {createLoginVendor.email && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password (min 8 characters)</label>
                  <input
                    type="password"
                    value={createLoginPassword}
                    onChange={(e) => setCreateLoginPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
                    placeholder="Set a password for this vendor"
                    autoFocus
                  />
                </div>
                {createLoginError && <p className="text-[var(--ast-error-icon)] text-xs">{createLoginError}</p>}
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setCreateLoginVendor(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateLogin}
                    disabled={createLoginSaving || createLoginPassword.length < 8}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--ast-warning-icon)] text-[var(--admin-primary-fg)] rounded-lg hover:bg-[var(--ast-warning-text)] disabled:opacity-50"
                  >
                    <KeyRound className="h-4 w-4" />
                    {createLoginSaving ? "Creating…" : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editId ? "Edit Vendor" : "Add New Vendor"}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Business Name *</label>
                <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
                  placeholder="e.g. Stockholm Photography Studio" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as VendorCategory })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
                  placeholder="Stockholm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
                  placeholder="contact@business.com" />
              </div>
              {!editId && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Login Password <span className="text-gray-400 font-normal">(optional — lets vendor log in)</span>
                  </label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
                    placeholder="Min 8 characters" />
                  {form.email && !form.password && (
                    <p className="text-xs text-[var(--ast-warning-icon)] mt-1">Password ছাড়া vendor login করতে পারবে না</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
                  placeholder="+46 70 123 4567" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Starting Price</label>
                <input type="number" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
                  placeholder="5000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]">
                  <option value="SEK">SEK</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tagline</label>
                <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
                  placeholder="Short catchy description" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] resize-none"
                  placeholder="About this business..." />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Cover Photo</label>
                <input value={form.coverPhotoUrl.startsWith("data:") ? "" : form.coverPhotoUrl}
                  onChange={(e) => setForm({ ...form, coverPhotoUrl: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]"
                  placeholder="https://example.com/photo.jpg" />
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-400">or</span>
                  <label className="cursor-pointer text-xs text-[var(--admin-primary)] border border-[var(--ast-hold-border)] rounded px-3 py-1 hover:bg-[var(--ast-hold-bg)] transition">
                    Upload from device
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setForm({ ...form, coverPhotoUrl: ev.target?.result as string });
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {form.coverPhotoUrl && (
                    <button type="button" onClick={() => setForm({ ...form, coverPhotoUrl: "" })}
                      className="text-xs text-[var(--ast-error-border)] hover:text-[var(--ast-error-icon)]">Remove</button>
                  )}
                </div>
                {form.coverPhotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.coverPhotoUrl} alt="preview" className="mt-2 h-24 w-40 object-cover rounded-lg border" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Plan Tier</label>
                <select value={form.planTier} onChange={(e) => setForm({ ...form, planTier: e.target.value as VendorPlanTier })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]">
                  <option value="TRIAL">Trial (Free 30-day)</option>
                  <option value="BUSINESS">Business ($19/mo)</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isApproved} onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
                    className="rounded" />
                  Approved (visible in directory)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded" />
                  Featured (shown first)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                    className="rounded" />
                  Verified (show verified badge)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded" />
                  Active
                </label>
              </div>
            </div>

            {formError && <p className="text-[var(--ast-error-icon)] text-xs mt-3">{formError}</p>}

            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--admin-primary)] text-[var(--admin-primary-fg)] rounded-lg hover:bg-[var(--admin-primary-hover)] disabled:opacity-50">
                <Check className="h-4 w-4" />
                {saving ? "Saving…" : editId ? "Save Changes" : "Add Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
