import fs from "node:fs";
import { parse } from "csv-parse/sync";

const rows = parse(fs.readFileSync("src/data/imports/downtown_perks_residential_mixed_use_copy_deck.csv", "utf8"), { columns: true, skip_empty_lines: true, bom: true });
const ids = rows.map((row) => row.entity_id);
const media = fs.readdirSync("public/images/residential-content");
const requiredFields = ["resident_panel_copy", "partner_panel_copy", "shared_amenities", "resident_perk", "secret_sauce", "hidden_gem", "campaign_alignment", "source_url", "verification_status"];

if (rows.length !== 20) throw new Error(`Expected 20 residential rows, received ${rows.length}`);
if (new Set(ids).size !== rows.length) throw new Error("Duplicate residential entity IDs found");
for (const row of rows) {
  for (const field of requiredFields) if (!String(row[field] || "").trim()) throw new Error(`${row.entity_id} is missing ${field}`);
  if (!media.some((file) => file.startsWith(`${row.entity_id}.`))) throw new Error(`${row.entity_id} is missing local media`);
}

const rainey = rows.find((row) => row.entity_id === "70-rainey");
if (!rainey) throw new Error("70-rainey canonical residential record is missing");
if (!rainey.resident_actions.includes("Save") || !rainey.partner_actions.includes("View reports")) throw new Error("70-rainey is missing audience actions");

console.log(JSON.stringify({ buildings: rows.length, uniqueIds: new Set(ids).size, mediaAssets: media.length, status: "passed" }, null, 2));
