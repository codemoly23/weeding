"use client";

import { useState, useEffect, memo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Calendar, MoreVertical, Trash2, CloudOff } from "lucide-react";
import { format } from "date-fns";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getAllLocalProjects,
  deleteLocalProject,
  pruneOldProjects,
  type LocalProject,
} from "@/lib/planner-storage";
import { useLanguage } from "@/lib/i18n/language-context";

interface DbProject {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  members: { id: string; role: string; displayName: string | null }[];
}

type Project = {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  coverImage: string | null;
  isLocal: boolean;
  updatedAt: string;
};

function dbToProject(p: DbProject): Project {
  return {
    id: p.id, title: p.title, eventType: p.eventType,
    eventDate: p.eventDate, status: p.status, coverImage: p.coverImage,
    isLocal: false, updatedAt: p.updatedAt,
  };
}

function localToProject(p: LocalProject): Project {
  return {
    id: p.id, title: p.title, eventType: p.eventType,
    eventDate: p.eventDate, status: p.status, coverImage: null,
    isLocal: true, updatedAt: p.updatedAt,
  };
}

// Decorative rings SVG inside card top
function RingsIcon() {
  return (
    <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-8 opacity-20">
      <circle cx="27" cy="20" r="16" stroke="currentColor" strokeWidth="3"/>
      <circle cx="53" cy="20" r="16" stroke="currentColor" strokeWidth="3"/>
    </svg>
  );
}

// Card gradient by event type
function cardGradient(_eventType: string, _isLocal: boolean) {
  return "from-background to-muted/30";
}

function cardIconColor(_eventType: string, _isLocal: boolean) {
  return "text-accent";
}

function tabColor(_eventType: string, _isLocal: boolean) {
  return "bg-accent/10";
}

const STATUS_PILL: Record<string, string> = {
  ACTIVE:    "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
  DRAFT:     "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
  ARCHIVED:  "bg-muted text-muted-foreground",
  COMPLETED: "bg-primary/10 text-primary",
};

// Beautiful folder-style project card
const ProjectCard = memo(function ProjectCard({ project, onClick, onDelete }: {
  project: Project;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const grad  = cardGradient(project.eventType, project.isLocal);
  const icon  = cardIconColor(project.eventType, project.isLocal);
  const tab   = tabColor(project.eventType, project.isLocal);

  return (
    <div
      className="relative group cursor-pointer select-none"
      onClick={onClick}
    >
      {/* Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-border/80 bg-card transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5">

        {/* Top gradient area */}
        <div className={`h-32 bg-gradient-to-br ${grad} flex flex-col items-center justify-center gap-2`}>
          {project.isLocal ? (
            <div className="flex flex-col items-center gap-1.5">
              <CloudOff className="h-7 w-7 text-[var(--color-warning-text)]" />
              <span className="text-[10px] font-semibold tracking-wide uppercase text-[var(--color-warning-text)]">
                Not saved
              </span>
            </div>
          ) : (
            <div className={`${icon}`}>
              <RingsIcon />
            </div>
          )}

          {/* Status badge top-right */}
          {!project.isLocal && (
            <div className="absolute top-2.5 right-2.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${STATUS_PILL[project.status] ?? "bg-muted text-muted-foreground"}`}>
                {project.status.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        {/* Subtle divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Card footer */}
        <div className="px-3.5 py-3 flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[14px] leading-snug text-foreground truncate group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground capitalize">{project.eventType.toLowerCase()}</p>
            {project.eventDate ? (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-error-text)]">
                <Calendar className="h-3 w-3 shrink-0" />
                {format(new Date(project.eventDate), "d MMM yyyy")}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-muted-foreground/50">No date set</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="shrink-0 mt-0.5 rounded-full p-1 text-muted-foreground/50 hover:bg-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

// Create new card
function CreateNewCard() {
  return (
    <Link href="/planner/create" className="block">
      <div className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-border bg-card/60 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center min-h-[185px] gap-3 px-4 py-8 hover:shadow-md hover:-translate-y-0.5">
        <div className="h-11 w-11 rounded-full border-2 border-dashed border-border group-hover:border-primary group-hover:bg-primary/5 flex items-center justify-center transition-all duration-200">
          <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-center text-[13px] font-semibold text-muted-foreground group-hover:text-primary transition-colors leading-snug">
          Create new<br />wedding project
        </p>
      </div>
    </Link>
  );
}

export default function MyProjectsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Prune stale local projects once on mount (90-day threshold)
  useEffect(() => { pruneOldProjects(90); }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const local = getAllLocalProjects().map(localToProject);

    if (session?.user?.id) {
      try {
        const res = await fetch("/api/planner/projects");
        if (res.ok) {
          const data = await res.json();
          const db = (data.projects as DbProject[]).map(dbToProject);
          setProjects([...local, ...db]);
        } else {
          setProjects(local);
        }
      } catch {
        setProjects(local);
      }
    } else {
      setProjects(local);
    }
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleDelete(project: Project) {
    if (!confirm(t("projects.deleteConfirm"))) return;
    if (project.isLocal) {
      deleteLocalProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      return;
    }
    const res = await fetch(`/api/planner/projects/${project.id}`, { method: "DELETE" });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== project.id));
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #fdf6f0 0%, #f5eef8 50%, #eef3fd 100%)" }}>
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <div className="text-center pt-14 pb-10 px-4">
          {/* Decorative top */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
            <svg viewBox="0 0 32 20" fill="none" className="w-8 h-5 text-accent" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
              <circle cx="22" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
          </div>

          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Wedding Projects
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            {session?.user?.name ? `Welcome back, ${session.user.name}` : "Keep up to date with your wedding planning"}
          </p>
        </div>

        {/* Cards grid */}
        <div className="mx-auto max-w-6xl px-4 pb-16">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div
                role="status"
                aria-label="Loading projects"
                aria-busy={true}
                className="h-9 w-9 animate-spin rounded-full border-4 border-muted border-t-primary"
              />
              <p className="text-sm text-muted-foreground">Loading your projects...</p>
            </div>
          )}

          {!loading && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => router.push(`/planner/${project.id}`)}
                  onDelete={(e) => { e.stopPropagation(); handleDelete(project); }}
                />
              ))}
              <CreateNewCard />
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No projects yet — create your first one!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
