"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, ExternalLink, Heart, Loader2 } from "lucide-react";
import type { PlannerTier } from "@/hooks/use-planner-tier";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/lib/i18n/language-context";

interface Project {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string | null; plannerTier: PlannerTier };
  _count: { guests: number };
}

interface Stats {
  total: number;
  active: number;
  completed: number;
  archived: number;
}

export default function AdminPlannerPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, completed: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/planner?page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        setProjects(d.projects || []);
        if (d.stats) setStats(d.stats);
        if (d.pages) setPages(d.pages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const statusColor: Record<string, string> = {
    ACTIVE:    "admin-status-success",
    ARCHIVED:  "admin-status-neutral",
    COMPLETED: "admin-status-info",
  };

  const tierColor: Record<PlannerTier, string> = {
    elite:   "admin-status-hold",
    premium: "admin-status-info",
    basic:   "admin-status-neutral",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-[var(--ast-info-icon)]" />
        <div>
          <h1 className="text-2xl font-bold">{t("admin.planner.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.planner.subtitle")}</p>
        </div>
      </div>

      {/* Stats — from server */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t("admin.planner.total"), value: stats.total },
          { label: t("common.active"), value: stats.active },
          { label: t("admin.status.COMPLETED"), value: stats.completed },
          { label: t("admin.planner.archived"), value: stats.archived },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t("admin.planner.noProjects")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.planner.project")}</TableHead>
                  <TableHead>{t("admin.planner.owner")}</TableHead>
                  <TableHead>{t("admin.planner.guests")}</TableHead>
                  <TableHead>{t("admin.planner.plan")}</TableHead>
                  <TableHead>{t("admin.planner.eventDate")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("admin.planner.updated")}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{project.user.name || "—"}</p>
                        <p className="text-muted-foreground">{project.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {project._count.guests}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tierColor[project.user.plannerTier] ?? tierColor.basic}`}>
                        {project.user.plannerTier}
                      </span>
                    </TableCell>
                    <TableCell>
                      {project.eventDate ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(project.eventDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[project.status] || "bg-gray-100 text-gray-600"}`}>
                        {t(`admin.status.${project.status}`)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/planner/${project.id}`}
                        target="_blank"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
              <span>{t("common.pageOf", { page: String(page), total: String(pages) })}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                  {t("common.previous")}
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>
                  {t("common.next")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
