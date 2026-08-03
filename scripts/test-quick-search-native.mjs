import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const component = readFileSync("src/components/navigation/QuickSearchModal.tsx", "utf8");
const styles = readFileSync("src/styles/quick-search-native-final.css", "utf8");
const main = readFileSync("src/main.jsx", "utf8");

assert.match(
  main,
  /global-back-control-final\.css"\s*\nimport "@\/styles\/quick-search-native-final\.css"/,
  "Quick-search native styles must remain the terminal quick-search authority",
);

for (const functionalContract of [
  /onMouseDown=\{onClose\}/,
  /onKeyDown=\{handleKeyDown\}/,
  /event\.key === "Escape"/,
  /event\.key === "ArrowDown"/,
  /event\.key === "ArrowUp"/,
  /event\.key === "Enter"/,
  /executeQuickSearch\(intent\.query\)/,
  /onClick=\{\(\) => chooseResult\(result\)\}/,
  /previousFocusRef\.current\?\.focus/,
]) {
  assert.match(component, functionalContract, `Quick-search behavior is missing ${functionalContract}`);
}

// iOS-native IA: a modal search overlay exposes a single unambiguous Close
// affordance, never a misleading "Back" that behaves identically to Close.
// (See test-polished-panel-state-contract.mjs, which forbids the Back label.)
assert.doesNotMatch(component, /aria-label="Go back from search"/, "Search must not expose a misleading Back control");
assert.match(component, /aria-label="Close search"/, "Search is missing Close");
assert.match(component, /aria-label="Popular searches"/, "Search shortcuts need a plain-language label");
assert.doesNotMatch(component, /Coffee before work|Happy hour nearby|Explore by intent/, "Search still uses retired generic copy");

assert.match(styles, /max-width:\s*420px\s*!important;/, "Desktop search width is not reduced by 25%");
assert.match(styles, /max-height:\s*min\(60dvh,\s*470px\)\s*!important;/, "Search height is not compact");
assert.match(styles, /@media \(max-width:\s*480px\)/, "iPhone layout is missing");
assert.match(styles, /@media \(max-width:\s*350px\)/, "320px layout is missing");
assert.match(styles, /font-size:\s*16px\s*!important;/, "Mobile search input can still trigger iOS zoom");
assert.match(styles, /min-height:\s*44px\s*!important;/, "Search controls do not preserve an accessible touch target");

for (const selector of [
  ".dp-quick-search-overlay.dp-quick-search-overlay",
  ".dp-quick-search-modal.dp-quick-search-modal",
  ".dp-quick-search-head.dp-quick-search-head",
  ".dp-quick-search-input-wrap.dp-quick-search-input-wrap",
  ".dp-quick-search-intents.dp-quick-search-intents",
  ".dp-quick-search-results.dp-quick-search-results",
  ".dp-quick-search-row.dp-quick-search-row",
  ".dp-quick-search-no-results.dp-quick-search-no-results",
]) {
  assert.ok(styles.includes(selector), `Native search contract does not cover ${selector}`);
}

const shadows = [...styles.matchAll(/box-shadow:\s*([^;]+)\s*!important;/g)].map((match) => match[1].trim());
assert.ok(shadows.length > 0 && shadows.every((value) => value === "none"), "Quick search introduces a shadow or glow");
assert.doesNotMatch(styles, /linear-gradient|radial-gradient|background:\s*rgba\(/, "Quick search introduces a tint or gradient");
const radii = [...styles.matchAll(/border-radius:\s*([^;]+)\s*!important;/g)].map((match) => match[1].trim());
assert.ok(radii.length > 0 && radii.every((value) => value === "0"), "Quick search introduces rounded or pill-shaped UI");
assert.match(styles, /background:\s*#ffffff\s*!important;/, "Quick search is not bright white");
assert.match(styles, /border-radius:\s*0\s*!important;/, "Quick search does not reset rounded legacy UI");
assert.match(styles, /box-shadow:\s*none\s*!important;/, "Quick search does not reset legacy shadows");
assert.match(styles, /backdrop-filter:\s*none\s*!important;/, "Quick search does not reset legacy glass effects");

console.log("Compact bright-white quick search preserves behavior and mobile accessibility: PASS");
