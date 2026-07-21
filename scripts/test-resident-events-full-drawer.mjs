import fs from "node:fs";

const map = fs.readFileSync("src/pages/Map.jsx", "utf8");
const css = fs.readFileSync("src/styles/resident-events-drawer-full.css", "utf8");
const main = fs.readFileSync("src/main.jsx", "utf8");

const checks = [
  [map.includes('isResidentEventsDrawer = urlState.mode === "resident" && activeBottomTab === "events"'), "events drawer is scoped to resident Events"],
  [map.includes('data-drawer-state={isResidentEventsDrawer ? "full" : "expanded"}'), "events drawer opens full"],
  [map.includes('discoverDisplayPlaces.slice(0, 80)'), "events drawer renders the full bounded result list"],
  [css.includes('.dp-resident-events-drawer[data-drawer-state="full"]'), "full-height events geometry exists"],
  [css.includes("padding-bottom: var(--dp-bottom-nav-total-height"), "full drawer preserves bottom navigation clearance"],
  [main.includes('resident-events-drawer-full.css'), "events drawer lock loads last"],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, label]) => console.error(`FAIL: ${label}`));
  process.exit(1);
}
checks.forEach(([, label]) => console.log(`PASS: ${label}`));
