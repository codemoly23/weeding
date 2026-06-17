import prisma from "@/lib/db";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT", "SALES_AGENT", "CONTENT_MANAGER"];

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role);
}

export function plannerProjectWhere(projectId: string, userId: string, role: string) {
  if (isAdminRole(role)) return { id: projectId };
  return { id: projectId, userId };
}

export async function getPlannerProject(projectId: string, userId: string, role: string) {
  return prisma.weddingProject.findFirst({
    where: plannerProjectWhere(projectId, userId, role),
    select: { id: true },
  });
}
