import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "llcpad",
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  // Check for SERVICE_DETAILS template
  const page = await prisma.landingPage.findFirst({
    where: {
      templateType: 'SERVICE_DETAILS',
    },
    include: {
      blocks: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!page) {
    console.log('No SERVICE_DETAILS template found');
    return;
  }

  console.log('Template found:');
  console.log({
    id: page.id,
    name: page.name,
    slug: page.slug,
    templateType: page.templateType,
    isTemplateActive: page.isTemplateActive,
    isActive: page.isActive,
    blocksCount: page.blocks.length,
    blockTypes: page.blocks.map(b => b.type),
  });

  // Check for widget-page-sections block
  const widgetBlock = page.blocks.find(b => b.type === 'widget-page-sections');
  if (widgetBlock) {
    console.log('\nWidget sections block found:');
    console.log({
      id: widgetBlock.id,
      type: widgetBlock.type,
      settingsType: typeof widgetBlock.settings,
      isArray: Array.isArray(widgetBlock.settings),
      sectionsCount: Array.isArray(widgetBlock.settings) ? widgetBlock.settings.length : 0,
    });

    if (Array.isArray(widgetBlock.settings) && widgetBlock.settings.length > 0) {
      console.log('\nFirst section:', JSON.stringify(widgetBlock.settings[0], null, 2));
    }
  } else {
    console.log('\nNo widget-page-sections block found');
    console.log('Available block types:', page.blocks.map(b => b.type));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
