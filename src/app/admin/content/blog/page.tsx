"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, FileText, Eye, Clock, CheckCircle, Archive, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/lib/i18n/language-context";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      toast.error(t("admin.blog.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  function openDeleteDialog(post: BlogPost) {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!selectedPost) return;

    try {
      const res = await fetch(`/api/admin/blog/${selectedPost.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success(t("admin.blog.deleted"));
      setDeleteDialogOpen(false);
      fetchPosts();
    } catch (error) {
      toast.error(t("admin.blog.deleteFailed"));
    }
  }

  async function updateStatus(post: BlogPost, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, status }),
      });

      if (!res.ok) throw new Error("Failed to update");
      toast.success(t(`admin.blog.${status.toLowerCase() === "published" ? "published" : status.toLowerCase()}`));
      fetchPosts();
    } catch (error) {
      toast.error(t("admin.blog.updateFailed"));
    }
  }

  const filteredPosts = statusFilter === "all"
    ? posts
    : posts.filter((post) => post.status === statusFilter);

  const statusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle className="h-4 w-4 text-[var(--ast-success-icon)]" />;
      case "DRAFT":
        return <Clock className="h-4 w-4 text-[var(--ast-warning-icon)]" />;
      case "ARCHIVED":
        return <Archive className="h-4 w-4 text-[var(--ast-neutral-icon)]" />;
      default:
        return null;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="admin-status-success">{t("admin.blog.published")}</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">{t("admin.blog.draft")}</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline">{t("admin.blog.archived")}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.blog.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.blog.subtitle")}
          </p>
        </div>
        <Button asChild className="self-start sm:self-auto">
          <Link href="/admin/content/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("admin.blog.newPost")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("admin.blog.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.blog.allPosts")}</SelectItem>
            <SelectItem value="PUBLISHED">{t("admin.blog.published")}</SelectItem>
            <SelectItem value="DRAFT">{t("admin.blog.drafts")}</SelectItem>
            <SelectItem value="ARCHIVED">{t("admin.blog.archived")}</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline">{t("admin.blog.postCount", { count: String(filteredPosts.length) })}</Badge>
      </div>

      {loading ? (
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-40 bg-muted rounded" />
          </CardContent>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">{t("admin.blog.noPosts")}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("admin.blog.noPostsDesc")}
            </p>
            <Button asChild>
              <Link href="/admin/content/blog/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("admin.blog.newPost")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table className="table-fixed w-full">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.title")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("admin.blog.changeStatus")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{post.title}</p>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(post.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {post.publishedAt ? (
                        <span>
                          {t("admin.blog.published")}{" "}
                          {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {t("admin.blog.created")}{" "}
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={post.status}
                      onValueChange={(value) =>
                        updateStatus(post, value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
                      }
                    >
                      <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">
                          <span className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" /> {t("admin.blog.draft")}
                          </span>
                        </SelectItem>
                        <SelectItem value="PUBLISHED">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5" /> {t("admin.blog.published")}
                          </span>
                        </SelectItem>
                        <SelectItem value="ARCHIVED">
                          <span className="flex items-center gap-2">
                            <Archive className="h-3.5 w-3.5" /> {t("admin.blog.archived")}
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {post.status === "PUBLISHED" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              {t("admin.blog.viewPost")}
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/content/blog/${post.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(post)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.blog.deleteQuestion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.blog.deleteDesc", { title: selectedPost?.title || "" })}
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
