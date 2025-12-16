import prisma from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding state fees from system list...\n");

  // Get US States from system list
  const usStatesList = await prisma.systemList.findUnique({
    where: { key: "us_states" },
    include: {
      items: true,
    },
  });

  if (!usStatesList) {
    console.log("❌ US States system list not found. Run seed-system-lists.ts first.");
    return;
  }

  console.log(`📍 Found ${usStatesList.items.length} states in system list\n`);

  let created = 0;
  let skipped = 0;

  for (const state of usStatesList.items) {
    const metadata = state.metadata as {
      filingFee?: number;
      processingDays?: number;
      annualFee?: number;
    } | null;

    // Check if already exists
    const existing = await prisma.stateFee.findUnique({
      where: { stateCode: state.value },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.stateFee.create({
      data: {
        stateCode: state.value,
        stateName: state.label,
        llcFee: metadata?.filingFee ?? 100,
        annualFee: metadata?.annualFee ?? null,
        processingTime: metadata?.processingDays
          ? `${metadata.processingDays} business days`
          : null,
        isPopular: state.isPopular,
      },
    });

    created++;
    console.log(`  ✓ ${state.label} ($${metadata?.filingFee ?? 100})`);
  }

  console.log(`\n✅ State fees seeding completed!`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped (already exists): ${skipped}`);
}

main()
  .catch((e) => {
    console.error("Error seeding state fees:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
