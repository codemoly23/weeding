import prisma from "../src/lib/db";

const iconMap: Record<string, string> = {
  "About":           "Info",
  "Contact":         "Mail",
  "Privacy Policy":  "ShieldCheck",
  "Refund Policy":   "RotateCcw",
  "Cookies Consent": "Cookie",
};

async function main() {
  for (const [label, icon] of Object.entries(iconMap)) {
    const r = await prisma.menuItem.updateMany({
      where: { label, parentId: { not: null } },
      data: { icon },
    });
    console.log(`✓ ${label} → ${icon} (${r.count} updated)`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
