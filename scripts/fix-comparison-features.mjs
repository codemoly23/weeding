import fs from "fs";

const data = JSON.parse(fs.readFileSync("public/themes/legal/data.json", "utf8"));
const llc = data.services.find((s) => s.slug === "llc-formation");

if (llc && llc.comparisonFeatures) {
  llc.comparisonFeatures = llc.comparisonFeatures.map((cf) => {
    // Convert packageMappings array to packages Record (keyed by package name)
    if (cf.packageMappings && !cf.packages) {
      const packages = {};
      for (const m of cf.packageMappings) {
        const obj = {
          valueType: m.valueType || "BOOLEAN",
          included: m.included !== undefined ? m.included : false,
        };
        if (m.customValue) obj.customValue = m.customValue;
        if (m.addonPriceUSD) obj.addonPriceUSD = m.addonPriceUSD;
        packages[m.packageName] = obj;
      }
      const result = { text: cf.text, sortOrder: cf.sortOrder, packages };
      if (cf.tooltip) result.tooltip = cf.tooltip;
      if (cf.description) result.description = cf.description;
      return result;
    }
    return cf;
  });

  fs.writeFileSync("public/themes/legal/data.json", JSON.stringify(data, null, 2));
  console.log("Fixed", llc.comparisonFeatures.length, "features");
  console.log("Keys:", Object.keys(llc.comparisonFeatures[0]));
  console.log(JSON.stringify(llc.comparisonFeatures[0], null, 2));
  console.log(JSON.stringify(llc.comparisonFeatures[6], null, 2)); // BOI FinCEN (mixed included)
  console.log(JSON.stringify(llc.comparisonFeatures[15], null, 2)); // Expedited Filing (addon)
}
