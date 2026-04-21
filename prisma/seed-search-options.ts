import prisma from "../src/lib/db";

const placeOptions = [
  { name: "Wedding Venues", icon: "Heart", sortOrder: 1 },
  { name: "Mansions", icon: "Home", sortOrder: 2 },
  { name: "Hotels", icon: "Hotel", sortOrder: 3 },
  { name: "Restaurants", icon: "UtensilsCrossed", sortOrder: 4 },
  { name: "Boats", icon: "Sailboat", sortOrder: 5 },
  { name: "Beaches", icon: "Waves", sortOrder: 6 },
  { name: "Rooftops & Lofts", icon: "Building2", sortOrder: 7 },
  { name: "Parks", icon: "TreePine", sortOrder: 8 },
  { name: "Wineries & Breweries", icon: "Wine", sortOrder: 9 },
  { name: "Barns & Farms", icon: "Warehouse", sortOrder: 10 },
  { name: "Country Clubs", icon: "Flag", sortOrder: 11 },
  { name: "Churches & Temples", icon: "Church", sortOrder: 12 },
  { name: "Museums", icon: "Landmark", sortOrder: 13 },
  { name: "Historic Venues", icon: "Landmark", sortOrder: 14 },
  { name: "Banquet Halls", icon: "Building", sortOrder: 15 },
  { name: "Gardens", icon: "Leaf", sortOrder: 16 },
  { name: "Waterfronts", icon: "Waves", sortOrder: 17 },
];

async function main() {
  for (const opt of placeOptions) {
    await prisma.searchOption.upsert({
      where: { name_type: { name: opt.name, type: "PLACE" } },
      update: { icon: opt.icon, sortOrder: opt.sortOrder, isActive: true },
      create: { name: opt.name, type: "PLACE", icon: opt.icon, sortOrder: opt.sortOrder },
    });
  }
  console.log(`Seeded ${placeOptions.length} Place options`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
