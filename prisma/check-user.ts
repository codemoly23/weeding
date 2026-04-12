import prisma from "../src/lib/db";

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    console.log("Recent users:", JSON.stringify(users, null, 2));
  } catch (e: unknown) {
    console.error("Error:", e instanceof Error ? e.message : String(e));
  } finally {
    await prisma.$disconnect();
  }
}
check();
