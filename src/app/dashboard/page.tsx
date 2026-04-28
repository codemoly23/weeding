"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarHeart,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Plus,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getAllLocalProjects } from "@/lib/planner-storage";

interface DbProject {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  coverImage: string | null;
  updatedAt: string;
  createdAt: string;
  members: { id: string; role: string; displayName: string | null }[];
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  DRAFT: "bg-yellow-100 text-yellow-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const eventTypeLabel: Record<string, string> = {
  WEDDING: "Wedding",
  BAPTISM: "Baptism",
  PARTY: "Party",
  CORPORATE: "Corporate",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (session?.user?.id) {
        const res = await fetch("/api/planner/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects ?? []);
        } else {
          toast.error("Failed to load projects");
        }
      }
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const localProjects = typeof window !== "undefined" ? getAllLocalProjects() : [];
  const totalProjects = projects.length + localProjects.length;
  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const stats = useMemo(
    () => [
      {
        title: "Active Projects",
        value: totalProjects,
        icon: CalendarHeart,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Completed",
        value: completedProjects,
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "In Progress",
        value: activeProjects,
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
      },
    ],
    [totalProjects, completedProjects, activeProjects]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your account.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your account.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchProjects}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects - full width */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/planner">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/planner/${project.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-bold">
                      {project.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{project.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {eventTypeLabel[project.eventType] ?? project.eventType}
                        {project.eventDate && (
                          <>
                            {" · "}
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(project.eventDate), "MMM d, yyyy")}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="secondary"
                      className={statusColors[project.status] ?? ""}
                    >
                      {project.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {format(new Date(project.updatedAt), "MMM d")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CalendarHeart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first wedding or event project to get started
              </p>
              <Button className="mt-4" asChild>
                <Link href="/planner/create">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/planner/create">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/planner">My Projects</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vendors">Find Vendors</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/help">Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
