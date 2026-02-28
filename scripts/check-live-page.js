const http = require("http");

http.get("http://localhost:3000/api/pages/home", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const page = JSON.parse(data);
    const p = page.page || page;
    const block = (p.blocks || []).find(b => b.type === "widget-page-sections");
    if (!block) {
      console.log("No widget block found. Keys:", Object.keys(p));
      return;
    }
    const sections = block.settings || [];
    console.log("Live DB sections (" + sections.length + "):");
    sections.forEach((s, i) => {
      const widgets = [];
      (s.columns || []).forEach(col => {
        (col.widgets || []).forEach(w => widgets.push(w.type));
      });
      const bg = s.background?.color || "";
      console.log("  " + i + ": [" + (s.id || "").substring(0, 25) + "] " + widgets.join(", ") + (bg ? " bg:" + bg : ""));
    });
  });
}).on("error", (e) => console.error(e));
