import prisma from "../src/lib/db";

async function main() {
  const r = await prisma.legalPage.update({
    where: { slug: "terms-of-service" },
    data: { slug: "terms" },
  });
  console.log(`✓ terms-of-service → terms (id: ${r.id})`);
  console.log("✅ Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
