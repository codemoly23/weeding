import "dotenv/config";
import prisma from "../src/lib/db";

async function main() {
  const header = await prisma.headerConfig.findFirst({ where: { isActive: true } });
  if (!header) { console.log("No active header found"); return; }

  const ideasItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Ideas" },
  });

  if (!ideasItem) { console.log("Ideas menu item not found"); return; }

  await prisma.menuItem.update({
    where: { id: ideasItem.id },
    data: {
      megaMenuContent: {
        type: "ideas-grid",
        header: "Get wedding inspiration",
        columns: [
          {
            title: "",
            items: [
              { name: "Planning Basics",      href: "/vendors" },
              { name: "Wedding Ceremony",     href: "/vendors?category=DECORATIONS" },
              { name: "Wedding Reception",    href: "/vendors?category=DECORATIONS" },
              { name: "Wedding Services",     href: "/vendors" },
              { name: "Wedding Fashion",      href: "/vendors?category=DRESS_ATTIRE" },
            ],
          },
          {
            title: "",
            items: [
              { name: "Hair & Makeup",        href: "/vendors?category=HAIR_MAKEUP" },
              { name: "Destination Weddings", href: "/vendors?category=VENUE" },
              { name: "Married Life",         href: "/vendors" },
              { name: "Events & Parties",     href: "/vendors?category=DECORATIONS" },
              { name: "Family & Friends",     href: "/vendors" },
            ],
          },
        ],
      },
    },
  });

  console.log("Ideas megaMenuContent updated — all /ideas/* links replaced.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
