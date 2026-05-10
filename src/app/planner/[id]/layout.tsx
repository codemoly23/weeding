import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { PlannerProjectLayoutShell } from "@/components/planner/project-layout-shell";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  if (id.startsWith("local-")) {
    return {
      title: "Wedding Planner | Ceremoney",
      robots: { index: false, follow: false },
    };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return {
      title: "Wedding Planner | Ceremoney",
      robots: { index: false, follow: false },
    };
  }

  const project = await prisma.weddingProject.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    select: { title: true, eventDate: true, brideName: true, groomName: true },
  });

  const title = project?.title || "Wedding Planner";
  const couple = [project?.brideName, project?.groomName].filter(Boolean).join(" & ");
  const description = couple
    ? `${couple}'s event planning workspace on Ceremoney.`
    : "Private event planning workspace on Ceremoney.";

  return {
    title: `${title} | Ceremoney Planner`,
    description,
    robots: { index: false, follow: false },
  };
}

export default async function PlannerProjectLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  return <PlannerProjectLayoutShell projectId={id}>{children}</PlannerProjectLayoutShell>;
}
