import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, "../public/themes/wedding/data.json"), "utf-8"));

const home = data.pages.find(p => p.templateType === "HOME");
if (!home) { console.log("No HOME page in data.json"); process.exit(); }

const block = home.blocks?.[0];
if (!block) { console.log("No block in HOME page"); process.exit(); }

const sections = Array.isArray(block.settings) ? block.settings : [];
console.log("HOME page — block type:", block.type);
console.log("Total sections:", sections.length);
sections.forEach((s, i) => {
  const widgets = (s.columns || []).flatMap(c => c.widgets || []);
  console.log(`  Section ${i + 1} ->`, widgets.map(w => w.type).join(", ") || "(empty)");
});
