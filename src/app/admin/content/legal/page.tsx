"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
  version: number;
  updatedAt: string;
  createdAt: string;
}

const defaultPages = [
  { slug: "terms", title: "Terms of Service", description: "Service terms and conditions" },
  { slug: "privacy", title: "Privacy Policy", description: "How we handle user data" },
  { slug: "refund-policy", title: "Refund Policy", description: "Refund and cancellation policy" },
  { slug: "disclaimer", title: "Disclaimer", description: "Legal disclaimers" },
];

export default function LegalPagesAdmin() {
  const { t } = useLanguage();
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      const res = await fetch("/api/admin/legal-pages");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPages(data);
    } catch (error) {
      toast.error(t("admin.legal.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(page: LegalPage) {
    try {
      const res = await fetch(`/api/admin/legal-pages/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !page.isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(page.isActive ? t("admin.legal.hiddenToast") : t("admin.legal.publishedToast"));
      fetchPages();
    } catch (error) {
      toast.error(t("admin.legal.updateFailed"));
    }
  }

  // Check which default pages are missing
  const existingSlugs = pages.map(p => p.slug);
  const missingPages = defaultPages.filter(p => !existingSlugs.includes(p.slug));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.legal.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.legal.subtitle")}
          </p>
        </div>
        <Link href="/admin/content/legal/new" className="self-start sm:self-auto">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("admin.legal.add")}
          </Button>
        </Link>
      </div>

      {/* Missing Pages Alert */}
      {missingPages.length > 0 && (
        <Card className="border-[var(--ast-warning-border)] bg-[var(--ast-warning-bg)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[var(--ast-warning-text)]">{t("admin.legal.recommended")}</CardTitle>
            <CardDescription className="text-[var(--ast-warning-text)]">
              {t("admin.legal.recommendedDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingPages.map((page) => (
                <Link key={page.slug} href={`/admin/content/legal/new?slug=${page.slug}`}>
                  <Button variant="outline" size="sm" className="border-[var(--ast-warning-border)] hover:bg-[var(--ast-warning-bg)]">
                    <Plus className="mr-1 h-3 w-3" />
                    {t("admin.legal.createNamed", { title: page.title })}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.legal.allPages")}</CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">{t("admin.legal.noPages")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("admin.legal.noPagesDesc")}
              </p>
              <Link href="/admin/content/legal/new" className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("admin.legal.create")}
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.title")}</TableHead>
                  <TableHead>{t("common.url")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.version")}</TableHead>
                  <TableHead>{t("admin.legal.lastUpdated")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        /{page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.isActive ? "default" : "secondary"}>
                        {page.isActive ? t("common.active") : t("common.hidden")}
                      </Badge>
                    </TableCell>
                    <TableCell>v{page.version}</TableCell>
                    <TableCell>{formatDate(page.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatus(page)}
                          title={page.isActive ? t("admin.legal.hidePage") : t("admin.legal.showPage")}
                        >
                          {page.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Link href={`/admin/content/legal/${page.slug}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/${page.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
