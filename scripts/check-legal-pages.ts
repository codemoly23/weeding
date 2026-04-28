import prisma from "../src/lib/db";

async function main() {
  const pages = await prisma.legalPage.findMany({
    select: { slug: true, title: true, isActive: true, version: true },
  });
  console.log("LegalPage records:", pages.length);
  console.log(JSON.stringify(pages, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
