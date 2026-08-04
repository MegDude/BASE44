import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const sheetSource = await readFile(new URL("../src/components/map/ActivePerksSheet.jsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/styles/perks-saved-nearby-mobile-system.css", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const shellSource = await readFile(new URL("../src/components/map/NativeDrawerShell.jsx", import.meta.url), "utf8");

assert.match(shellSource, /dp-native-drawer-content-viewport[\s\S]*?dp-native-drawer-scroll/, "shared NativeDrawerShell must keep one internal scroll viewport");
assert.match(shellSource, /window\.addEventListener\("keydown", handleKeyDown\)/, "drawers must keep Escape handling centralized");
assert.match(mainSource, /perks-saved-nearby-mobile-system\.css["'];?/, "Perks/Saved/Nearby system stylesheet must be loaded");
assert.ok(
  mainSource.indexOf("perks-saved-nearby-mobile-system.css") < mainSource.indexOf("mobile-drawer-height-containment.css"),
  "Perks/Saved/Nearby styles must load before the terminal mobile containment layer",
);

assert.match(sheetSource, /function perkAvailabilityLabel/, "Perks must expose one shared availability-state resolver");
assert.match(sheetSource, /data-perk-state=\{availability\.toLowerCase\(\)/, "Perk rows must expose normalized availability state");
assert.match(sheetSource, /data-canonical-entity-id=\{item\.id\}/, "Perk rows must use canonical entity IDs");
assert.match(sheetSource, /dp-perks-filter-rail/, "Perks tab must expose the shared filter rail");
assert.match(sheetSource, /\["Active", "Nearby", "Dining", "Fitness", "Wellness", "Events", "Saved"\]/, "Perks filters must include the required mobile categories");
assert.match(sheetSource, /Use perk/, "Perk primary action must use the canonical action label");
assert.match(sheetSource, /aria-label="Close active perks"/, "Perks drawer must expose the canonical close action");

assert.match(mapSource, /const \[savedPanelFilter, setSavedPanelFilter\] = useState\("all"\)/, "Saved filter state must persist while opening and closing drawers");
assert.match(mapSource, /function renderSavedMobileRow/, "Saved must render through shared mobile result rows");
assert.match(mapSource, /className="dp-saved-mobile-row"/, "Saved rows must use the shared mobile row class");
assert.match(mapSource, /data-canonical-entity-id=\{place\.id\}/, "Saved rows must use canonical entity IDs");
assert.match(mapSource, /aria-label=\{`Remove \${place\.name} from saved`\}/, "Saved rows must provide direct remove-from-saved actions");
assert.match(mapSource, /dp-saved-segmented-filter/, "Saved must expose segmented filters");
assert.match(mapSource, /\["benefits", "Perks"\][\s\S]*?\["places", "Places"\][\s\S]*?\["events", "Events"\][\s\S]*?\["routes", "Routes"\]/, "Saved filters must include Perks, Places, Events, and Routes");

assert.match(css, /Shared iOS-native Perks \/ Saved \/ Nearby mobile system/, "shared system stylesheet must document its scope");
assert.match(css, /--dp-mobile-system-header-height:\s*56px/, "canonical mobile drawer header must be 56px");
assert.match(css, /--dp-mobile-system-bottom-clearance:\s*12px/, "drawer must preserve 10-12px bottom navigation clearance");
assert.match(css, /border-radius:\s*0\s*!important/, "shared mobile system must remove rounded modal variants");
assert.match(css, /background:\s*var\(--dp-mobile-system-surface\)\s*!important/, "shared surfaces must remain bright white");
assert.match(css, /grid-template-columns:\s*44px minmax\(0, 1fr\) 44px/, "drawer headers must reserve a centered title and 44px controls");
assert.match(css, /\.dp-native-drawer-scroll[\s\S]*?overflow-y:\s*auto\s*!important[\s\S]*?overscroll-behavior-y:\s*contain\s*!important/, "drawers must keep exactly one internal scroll owner");
assert.match(css, /\.dp-perks-filter-rail[\s\S]*?\.dp-saved-segmented-filter/, "Perks and Saved filters must share the same rail system");
assert.match(css, /\.dp-favorites-matrix[\s\S]*?display:\s*none\s*!important/, "legacy saved matrix must be hidden by the shared mobile system");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "shared mobile system must support reduced motion");
assert.doesNotMatch(css, /backdrop-filter|blur\(|linear-gradient/i, "shared system must not introduce glass, gradients, or blur");
const nonNoneShadow = css.split("\n").find((line) => /box-shadow\s*:/i.test(line) && !/box-shadow\s*:\s*none\s*!important/i.test(line));
assert.equal(nonNoneShadow, undefined, "shared system must not introduce heavy shadows");

console.log("Perks/Saved/Nearby mobile system checks passed.");
