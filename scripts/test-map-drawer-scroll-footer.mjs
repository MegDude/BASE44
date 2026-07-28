import fs from "node:fs";

const shell = fs.readFileSync("src/components/map/NativeDrawerShell.jsx", "utf8");
const map = fs.readFileSync("src/pages/Map.jsx", "utf8");
const css = fs.readFileSync("src/styles/map-drawer-scroll-footer-final.css", "utf8");
const main = fs.readFileSync("src/main.jsx", "utf8");

const checks = [
  ["shared shell renders header before scroll viewport", shell.indexOf("dp-native-drawer-header") < shell.indexOf("dp-native-drawer-content-viewport")],
  ["shared shell renders action footer after scroll viewport", shell.indexOf("dp-native-drawer-actions") > shell.indexOf("dp-native-drawer-content-viewport")],
  ["active map drawer supplies shell actions", map.includes("actions={<UniversalEntityActionRail")],
  ["detail header has no visible duplicate navigation title", !map.includes('<span className="dp-map-detail-navigation-title">{navigationTitle')],
  ["final CSS defines a single middle scroll row", css.includes("grid-template-rows: auto minmax(0, 1fr) auto")],
  ["final CSS makes only drawer scroll vertically", css.includes(".dp-native-drawer-scroll") && css.includes("overflow-y: auto !important")],
  ["final CSS keeps actions in grid row three", css.includes("grid-row: 3 !important")],
  ["final CSS suppresses internal duplicate action rails", css.includes('[data-has-drawer-actions="true"] .dp-native-drawer-scroll')],
  ["final CSS is loaded last", main.lastIndexOf('import "@/styles/map-drawer-scroll-footer-final.css"') > main.lastIndexOf('import "@/styles/map-drawer-single-line-titles-final.css"')],
];

const failed = checks.filter(([, passed]) => !passed);
if (failed.length) {
  for (const [label] of failed) console.error(`FAIL: ${label}`);
  process.exit(1);
}

for (const [label] of checks) console.log(`PASS: ${label}`);
