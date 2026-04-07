import prisma from "../src/lib/db";

async function test() {
  // Use the first available user
  const user = await prisma.user.findFirst({ select: { id: true, email: true } });
  if (!user) {
    console.error("No users found!");
    return;
  }
  console.log("Testing with user:", user.email, user.id);

  try {
    const project = await prisma.weddingProject.create({
      data: {
        title: "Test Project",
        eventType: "WEDDING",
        userId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "BRIDE",
            displayName: "Test",
          },
        },
      },
      include: { members: true },
    });
    console.log("✅ Created project:", project.id);

    // Clean up
    await prisma.weddingProject.delete({ where: { id: project.id } });
    console.log("✅ Cleaned up");
  } catch (e: unknown) {
    console.error("❌ Error:", e instanceof Error ? e.message : String(e));
  } finally {
    await prisma.$disconnect();
  }
}
test();
