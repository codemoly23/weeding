import "dotenv/config";
import prisma from "../src/lib/db";

const swedenLocations = [
  { name: "Stockholm", icon: "MapPin", sortOrder: 1 },
  { name: "Gothenburg", icon: "MapPin", sortOrder: 2 },
  { name: "Malmö", icon: "MapPin", sortOrder: 3 },
  { name: "Uppsala", icon: "MapPin", sortOrder: 4 },
  { name: "Västerås", icon: "MapPin", sortOrder: 5 },
  { name: "Örebro", icon: "MapPin", sortOrder: 6 },
  { name: "Linköping", icon: "MapPin", sortOrder: 7 },
  { name: "Helsingborg", icon: "MapPin", sortOrder: 8 },
  { name: "Jönköping", icon: "MapPin", sortOrder: 9 },
  { name: "Norrköping", icon: "MapPin", sortOrder: 10 },
];

const internationalLocations = [
  { name: "London, UK", icon: "Globe", sortOrder: 1 },
  { name: "Paris, France", icon: "Globe", sortOrder: 2 },
  { name: "Berlin, Germany", icon: "Globe", sortOrder: 3 },
  { name: "Amsterdam, Netherlands", icon: "Globe", sortOrder: 4 },
  { name: "Copenhagen, Denmark", icon: "Globe", sortOrder: 5 },
  { name: "Oslo, Norway", icon: "Globe", sortOrder: 6 },
  { name: "Helsinki, Finland", icon: "Globe", sortOrder: 7 },
  { name: "Barcelona, Spain", icon: "Globe", sortOrder: 8 },
  { name: "Rome, Italy", icon: "Globe", sortOrder: 9 },
  { name: "Dubai, UAE", icon: "Globe", sortOrder: 10 },
  { name: "New York, USA", icon: "Globe", sortOrder: 11 },
  { name: "Tokyo, Japan", icon: "Globe", sortOrder: 12 },
];

async function main() {
  for (const loc of swedenLocations) {
    await prisma.searchOption.upsert({
      where: { name_type: { name: loc.name, type: "LOCATION" } },
      update: { icon: loc.icon, sortOrder: loc.sortOrder, group: "Sweden", isActive: true },
      create: { name: loc.name, type: "LOCATION", icon: loc.icon, group: "Sweden", sortOrder: loc.sortOrder },
    });
  }
  console.log(`Seeded ${swedenLocations.length} Sweden locations`);

  for (const loc of internationalLocations) {
    await prisma.searchOption.upsert({
      where: { name_type: { name: loc.name, type: "LOCATION" } },
      update: { icon: loc.icon, sortOrder: loc.sortOrder, group: "International", isActive: true },
      create: { name: loc.name, type: "LOCATION", icon: loc.icon, group: "International", sortOrder: loc.sortOrder },
    });
  }
  console.log(`Seeded ${internationalLocations.length} International locations`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
