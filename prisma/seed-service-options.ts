import prisma from "../src/lib/db";

const serviceOptions = [
  { name: "Catering",        icon: "UtensilsCrossed", sortOrder: 1  },
  { name: "Invitations",     icon: "Mail",            sortOrder: 2  },
  { name: "Favors & Gifts",  icon: "Gift",            sortOrder: 3  },
  { name: "Photography",     icon: "Camera",          sortOrder: 4  },
  { name: "Ceremony Music",  icon: "Music",           sortOrder: 5  },
  { name: "Transportation",  icon: "Car",             sortOrder: 6  },
  { name: "Flowers",         icon: "Flower2",         sortOrder: 7  },
  { name: "Dress & Attire",  icon: "Shirt",           sortOrder: 8  },
  { name: "Wedding Planning",icon: "ClipboardList",   sortOrder: 9  },
  { name: "Videography",     icon: "Video",           sortOrder: 10 },
  { name: "Jewelry",         icon: "Gem",             sortOrder: 11 },
  { name: "Hair & Makeup",   icon: "Sparkles",        sortOrder: 12 },
  { name: "Travel Agents",   icon: "Plane",           sortOrder: 13 },
  { name: "Lighting & Decor",icon: "Lightbulb",       sortOrder: 14 },
  { name: "Cakes",           icon: "Cake",            sortOrder: 15 },
  { name: "DJs",             icon: "Disc3",           sortOrder: 16 },
  { name: "Event Rentals",   icon: "Package",         sortOrder: 17 },
  { name: "Officiants",      icon: "User",            sortOrder: 18 },
  { name: "Photo Booths",    icon: "Camera",          sortOrder: 19 },
  { name: "Bands",           icon: "Music",           sortOrder: 20 },
];

async function main() {
  for (const opt of serviceOptions) {
    await prisma.searchOption.upsert({
      where: { name_type: { name: opt.name, type: "SERVICE" } },
      update: { icon: opt.icon, sortOrder: opt.sortOrder, isActive: true },
      create: { name: opt.name, type: "SERVICE", icon: opt.icon, sortOrder: opt.sortOrder },
    });
  }
  console.log(`Seeded ${serviceOptions.length} Service options`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
