import prisma from "../src/lib/db";

/**
 * Migration script: StateFee -> Location + LocationFee
 *
 * Migrates existing state fee data into the new Location-Based Pricing system.
 * This script is idempotent - safe to run multiple times.
 */
async function main() {
  console.log("Migrating State Fees to Location-Based Pricing...\n");

  // Step 1: Read all existing StateFee records
  const stateFees = await prisma.stateFee.findMany({
    orderBy: { stateName: "asc" },
  });

  if (stateFees.length === 0) {
    console.log("No StateFee records found. Falling back to hardcoded states...\n");
    await migrateFromHardcodedStates();
    return;
  }

  console.log(`Found ${stateFees.length} StateFee records to migrate.\n`);

  // Step 2: Create Location records from StateFee data
  let locationsCreated = 0;
  let locationsSkipped = 0;

  for (const sf of stateFees) {
    const code = `US-${sf.stateCode}`;

    const existing = await prisma.location.findUnique({ where: { code } });
    if (existing) {
      locationsSkipped++;
      continue;
    }

    await prisma.location.create({
      data: {
        code,
        name: sf.stateName,
        country: "US",
        type: "STATE",
        isPopular: sf.isPopular,
        isActive: true,
        metaTitle: sf.metaTitle,
        metaDescription: sf.metaDescription,
        content: sf.content,
      },
    });

    locationsCreated++;
    console.log(`  + Location: ${sf.stateName} (${code})`);
  }

  console.log(`\nLocations: ${locationsCreated} created, ${locationsSkipped} skipped.\n`);

  // Step 3: Find LLC Formation service
  const llcService = await prisma.service.findFirst({
    where: {
      OR: [
        { slug: "llc-formation" },
        { slug: "llc" },
        { name: { contains: "LLC", mode: "insensitive" } },
      ],
    },
  });

  if (!llcService) {
    console.log("No LLC Formation service found. Skipping LocationFee creation.");
    console.log("You can manually link fees to services from the admin panel.\n");
    return;
  }

  console.log(`Found service: "${llcService.name}" (${llcService.slug})\n`);

  // Step 4: Create LocationFee records linking locations to LLC Formation
  let feesCreated = 0;
  let feesSkipped = 0;

  for (const sf of stateFees) {
    const code = `US-${sf.stateCode}`;
    const location = await prisma.location.findUnique({ where: { code } });
    if (!location) continue;

    // Create FILING fee
    const existingFiling = await prisma.locationFee.findUnique({
      where: {
        serviceId_locationId_feeType: {
          serviceId: llcService.id,
          locationId: location.id,
          feeType: "FILING",
        },
      },
    });

    if (!existingFiling) {
      await prisma.locationFee.create({
        data: {
          serviceId: llcService.id,
          locationId: location.id,
          feeType: "FILING",
          label: "State Filing Fee",
          amountUSD: sf.llcFee,
          processingTime: sf.processingTime,
          isActive: true,
          isRequired: true,
        },
      });
      feesCreated++;
      console.log(`  + Filing fee: ${sf.stateName} ($${sf.llcFee})`);
    } else {
      feesSkipped++;
    }

    // Create ANNUAL fee if exists
    if (sf.annualFee) {
      const existingAnnual = await prisma.locationFee.findUnique({
        where: {
          serviceId_locationId_feeType: {
            serviceId: llcService.id,
            locationId: location.id,
            feeType: "ANNUAL",
          },
        },
      });

      if (!existingAnnual) {
        await prisma.locationFee.create({
          data: {
            serviceId: llcService.id,
            locationId: location.id,
            feeType: "ANNUAL",
            label: "Annual Report Fee",
            amountUSD: sf.annualFee,
            isActive: true,
            isRequired: false,
          },
        });
        feesCreated++;
        console.log(`  + Annual fee: ${sf.stateName} ($${sf.annualFee})`);
      } else {
        feesSkipped++;
      }
    }
  }

  console.log(`\nLocationFees: ${feesCreated} created, ${feesSkipped} skipped.\n`);

  // Step 5: Enable location-based pricing on LLC Formation service
  await prisma.service.update({
    where: { id: llcService.id },
    data: {
      hasLocationBasedPricing: true,
      locationFeeLabel: "State Fee",
    },
  });

  console.log(`Enabled location-based pricing on "${llcService.name}".\n`);
  console.log("Migration completed successfully!");
}

/**
 * Fallback: If no StateFee records exist, create Locations from hardcoded US states.
 */
async function migrateFromHardcodedStates() {
  const US_STATES = [
    { code: "AL", name: "Alabama", fee: 200 },
    { code: "AK", name: "Alaska", fee: 250 },
    { code: "AZ", name: "Arizona", fee: 50 },
    { code: "AR", name: "Arkansas", fee: 45 },
    { code: "CA", name: "California", fee: 70 },
    { code: "CO", name: "Colorado", fee: 50 },
    { code: "CT", name: "Connecticut", fee: 120 },
    { code: "DE", name: "Delaware", fee: 110, popular: true },
    { code: "FL", name: "Florida", fee: 125, popular: true },
    { code: "GA", name: "Georgia", fee: 100 },
    { code: "HI", name: "Hawaii", fee: 50 },
    { code: "ID", name: "Idaho", fee: 100 },
    { code: "IL", name: "Illinois", fee: 150 },
    { code: "IN", name: "Indiana", fee: 95 },
    { code: "IA", name: "Iowa", fee: 50 },
    { code: "KS", name: "Kansas", fee: 160 },
    { code: "KY", name: "Kentucky", fee: 40 },
    { code: "LA", name: "Louisiana", fee: 100 },
    { code: "ME", name: "Maine", fee: 175 },
    { code: "MD", name: "Maryland", fee: 100 },
    { code: "MA", name: "Massachusetts", fee: 500 },
    { code: "MI", name: "Michigan", fee: 50 },
    { code: "MN", name: "Minnesota", fee: 155 },
    { code: "MS", name: "Mississippi", fee: 50 },
    { code: "MO", name: "Missouri", fee: 50 },
    { code: "MT", name: "Montana", fee: 35 },
    { code: "NE", name: "Nebraska", fee: 100 },
    { code: "NV", name: "Nevada", fee: 425 },
    { code: "NH", name: "New Hampshire", fee: 100 },
    { code: "NJ", name: "New Jersey", fee: 125 },
    { code: "NM", name: "New Mexico", fee: 50, popular: true },
    { code: "NY", name: "New York", fee: 200 },
    { code: "NC", name: "North Carolina", fee: 125 },
    { code: "ND", name: "North Dakota", fee: 135 },
    { code: "OH", name: "Ohio", fee: 99 },
    { code: "OK", name: "Oklahoma", fee: 100 },
    { code: "OR", name: "Oregon", fee: 100 },
    { code: "PA", name: "Pennsylvania", fee: 125 },
    { code: "RI", name: "Rhode Island", fee: 150 },
    { code: "SC", name: "South Carolina", fee: 110 },
    { code: "SD", name: "South Dakota", fee: 150 },
    { code: "TN", name: "Tennessee", fee: 300 },
    { code: "TX", name: "Texas", fee: 300, popular: true },
    { code: "UT", name: "Utah", fee: 59 },
    { code: "VT", name: "Vermont", fee: 155 },
    { code: "VA", name: "Virginia", fee: 100 },
    { code: "WA", name: "Washington", fee: 200 },
    { code: "WV", name: "West Virginia", fee: 100 },
    { code: "WI", name: "Wisconsin", fee: 130 },
    { code: "WY", name: "Wyoming", fee: 100, popular: true },
  ];

  let created = 0;
  for (const state of US_STATES) {
    const code = `US-${state.code}`;
    const existing = await prisma.location.findUnique({ where: { code } });
    if (existing) continue;

    await prisma.location.create({
      data: {
        code,
        name: state.name,
        country: "US",
        type: "STATE",
        isPopular: "popular" in state,
        isActive: true,
      },
    });
    created++;
    console.log(`  + ${state.name} (${code})`);
  }

  console.log(`\nCreated ${created} locations from hardcoded data.`);
  console.log("Note: No service was linked. Use the admin panel to assign fees to services.");
}

main()
  .catch((e) => {
    console.error("Error during migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
