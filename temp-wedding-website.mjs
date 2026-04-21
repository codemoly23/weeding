import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const header = await prisma.headerConfig.findFirst({ where: { isActive: true } });
  const item = await prisma.menuItem.findFirst({ where: { headerId: header.id, label: "Wedding Website", parentId: null } });
  if (!item) { console.log("Wedding Website item not found"); return; }

  await prisma.menuItem.update({
    where: { id: item.id },
    data: {
      megaMenuContent: {
        type: "featured-gallery",
        sectionHeader: "Set up your website in minutes",
        topLinks: [
          { name: "Create your wedding website", icon: "", href: "/wedding-website/create" },
          { name: "Find a couple's WeddingWire website", icon: "", href: "/wedding-website/find" },
        ],
        gallery: {
          title: "CHOOSE YOUR DESIGN",
          aspectRatio: "portrait",
          items: [
            { name: "Minimal Leaves", imageUrl: "", href: "/wedding-website/minimal-leaves" },
            { name: "Painted Desert", imageUrl: "", href: "/wedding-website/painted-desert" },
            { name: "Classic Garden", imageUrl: "", href: "/wedding-website/classic-garden" },
            { name: "Formal Ampersand", imageUrl: "", href: "/wedding-website/formal-ampersand" },
          ],
        },
        footerLink: { text: "See all website designs", href: "/wedding-website/designs" },
      },
    },
  });
  console.log("Wedding Website megaMenuContent set ✓");
}

main().catch(console.error).finally(() => prisma.$disconnect());
