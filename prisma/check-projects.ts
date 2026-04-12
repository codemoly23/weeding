import prisma from "../src/lib/db";

async function check() {
  try {
    const projects = await prisma.weddingProject.findMany({
      select: { id: true, userId: true, title: true },
      take: 5,
    });
    console.log("Projects:", JSON.stringify(projects, null, 2));
  } catch (e: unknown) {
    console.error("Error:", e instanceof Error ? e.message : String(e));
  } finally {
    await prisma.$disconnect();
  }
}
check();
