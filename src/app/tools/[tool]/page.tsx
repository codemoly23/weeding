import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// Maps navbar tool slug → planner section route
const TOOL_MAP: Record<string, string> = {
  checklist: "checklist",
  seating:   "seating",
  guests:    "guests",
  budget:    "budget",
  website:   "website",
  vendors:   "vendors",
  notes:     "notes",
  itinerary: "itinerary",
};

export default async function ToolRedirectPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const session = await auth();

  const section = TOOL_MAP[tool];

  // Unknown tool → go to planner overview
  if (!section) redirect("/planner");

  // Not logged in → login, then come back here
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/tools/${tool}`);
  }

  // Find most recently updated project
  const project = await prisma.weddingProject.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  // No project yet → create one first
  if (!project) redirect("/planner/create");

  redirect(`/planner/${project.id}/${section}`);
}
