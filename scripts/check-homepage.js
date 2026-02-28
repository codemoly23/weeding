const data = JSON.parse(require("fs").readFileSync("public/themes/legal/data.json", "utf8"));
const home = data.pages.find(p => p.slug === "home");
const block = home.blocks.find(b => b.type === "widget-page-sections");
const sections = block.settings;
console.log("Homepage sections (" + sections.length + "):");
sections.forEach((s, i) => {
  // Each section has columns with widgets
  const widgets = [];
  (s.columns || []).forEach(col => {
    (col.widgets || []).forEach(w => {
      widgets.push(w.type);
    });
  });
  const bgColor = s.background?.color || s.settings?.background?.color || "";
  console.log("  " + i + ": [" + s.id.substring(0, 20) + "] widgets: " + widgets.join(", ") + (bgColor ? " bg:" + bgColor : ""));
});
