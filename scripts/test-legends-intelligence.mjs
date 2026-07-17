import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const page = await readFile(new URL("../src/pages/LegendsIntelligence.jsx", import.meta.url), "utf8");
const service = await readFile(new URL("../src/services/legendsIntelligence.js", import.meta.url), "utf8");
const css = await readFile(new URL("../src/styles/legends-intelligence.css", import.meta.url), "utf8");

assert.match(app, /path="\/partners\/legends\/intelligence"/);
assert.match(page, /Legends Downtown Intelligence/);
assert.match(page, /Open source report/);
assert.match(page, /data\.cumulativeImpressions !== null/);
for (const label of [
  "People searching for Legends directly",
  "People discovering Legends naturally",
  "Known-name position",
  "Downtown attention over time",
  "Downtown Austin condos",
  "East Austin",
  "Tarrytown Austin homes",
  "Legends real estate",
  "Luxury home upgrades",
]) assert.match(page, new RegExp(label));
for (const field of [
  "brandedAveragePosition",
  "nonBrandedAveragePosition",
  "brandedKeywordCount",
  "nonBrandedKeywordCount",
  "impressionsByMonth",
  "cumulativeImpressions",
  "topKeywordsByClicks",
  "topKeywordsByImpressions",
]) assert.match(service, new RegExp(field));
assert.doesNotMatch(css, /font-family:[^;]*(^|[\s,"])serif([\s,;"]|$)|beige|cream/i);

console.log("Legends intelligence route, content, contract, and visual guardrails verified.");
