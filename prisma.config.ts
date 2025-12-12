import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // @ts-expect-error earlyAccess is valid for Prisma 7
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrate: {
    adapter: async () => {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      return new PrismaPg(pool);
    },
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
