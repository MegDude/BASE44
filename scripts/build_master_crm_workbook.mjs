import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.REPO_ROOT || path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "outputs", "master-crm");

function cellAddress(row, col) {
  let n = col + 1;
  let letters = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    letters = String.fromCharCode(65 + r) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return `${letters}${row + 1}`;
}

function rangeAddress(row, col, rowCount, colCount) {
  return `${cellAddress(row, col)}:${cellAddress(row + rowCount - 1, col + colCount - 1)}`;
}

function writeMatrix(sheet, startRow, startCol, matrix) {
  if (!matrix.length || !matrix[0]?.length) return;
  sheet.getRange(rangeAddress(startRow, startCol, matrix.length, matrix[0].length)).values = matrix;
}

function styleHeader(range) {
  range.format.fill.color = "#0B1F33";
  range.format.font.color = "#FFFFFF";
  range.format.font.bold = true;
  range.format.wrapText = true;
}

function styleTitle(range) {
  range.format.fill.color = "#0B1F33";
  range.format.font.color = "#C8A96A";
  range.format.font.bold = true;
  range.format.font.size = 16;
}

function styleTable(sheet, headerRange, usedRange) {
  styleHeader(headerRange);
  usedRange.format.font.name = "Aptos";
  usedRange.format.borders = { preset: "insideHorizontal", style: "thin", color: "#E6E0D2" };
  usedRange.format.wrapText = true;
  usedRange.format.autofitColumns();
  usedRange.format.autofitRows();
}

const csvText = await fs.readFile(path.join(outDir, "downtown_perks_master_crm.csv"), "utf8");
const workbook = await Workbook.fromCSV(csvText, { sheetName: "Master CRM" });
const masterSheet = workbook.worksheets.getItem("Master CRM");
masterSheet.showGridLines = false;
masterSheet.freezePanes.freezeRows(1);
styleTable(masterSheet, masterSheet.getRange("A1:R1"), masterSheet.getUsedRange());

const audit = JSON.parse(await fs.readFile(path.join(outDir, "master_crm_audit.json"), "utf8"));
const summary = workbook.worksheets.add("Summary");
summary.showGridLines = false;
writeMatrix(summary, 0, 0, [["Downtown Perks Master CRM", "", "", ""]]);
summary.getRange("A1:D1").merge();
styleTitle(summary.getRange("A1:D1"));
writeMatrix(summary, 2, 0, [
  ["Metric", "Value", "Meaning", "Status"],
  ["Source files", audit.source_file_count, "CSV/XLSX files included from the local CRM and inventory folders", "Complete"],
  ["Source sheets", audit.source_sheet_count, "Workbook sheets and CSV tables scanned", "Complete"],
  ["Raw records", audit.raw_record_count, "Rows read before CRM dedupe", "Complete"],
  ["Master records", audit.master_record_count, "Unique rows retained in the master CRM", "Complete"],
  ["Deduped records", audit.deduped_record_count, "Repeated CRM records merged into the master", "Complete"],
  ["Duplicate workbooks", audit.duplicate_workbook_count, "Identical workbook/file hashes detected", "Flagged"],
]);
styleTable(summary, summary.getRange("A3:D3"), summary.getRange("A3:D9"));
summary.freezePanes.freezeRows(3);

const segments = workbook.worksheets.add("Segment Counts");
segments.showGridLines = false;
writeMatrix(segments, 0, 0, [["Segment", "Records"]]);
writeMatrix(
  segments,
  1,
  0,
  Object.entries(audit.segment_counts).sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
);
styleTable(segments, segments.getRange("A1:B1"), segments.getUsedRange());

const duplicates = workbook.worksheets.add("Deduplication Audit");
duplicates.showGridLines = false;
writeMatrix(duplicates, 0, 0, [["Audit Type", "Key / Hash", "Records / Files", "Sources"]]);
const duplicateRows = [
  ...audit.duplicate_workbooks.map((item) => [
    "Duplicate workbook",
    item.sha256,
    item.files.length,
    item.files.join(" | "),
  ]),
  ...audit.duplicate_records.slice(0, 250).map((item) => [
    "Duplicate CRM record",
    item.dedupe_key,
    item.records_merged,
    item.sources.join(" | "),
  ]),
];
writeMatrix(duplicates, 1, 0, duplicateRows.length ? duplicateRows : [["No duplicates", "", "", ""]]);
styleTable(duplicates, duplicates.getRange("A1:D1"), duplicates.getUsedRange());
duplicates.freezePanes.freezeRows(1);

const frostCsv = await fs.readFile(path.join(outDir, "frost_tower_flagship_activation_case.csv"), "utf8");
await workbook.fromCSV(frostCsv, { sheetName: "Frost Tower Case" });
const frost = workbook.worksheets.getItem("Frost Tower Case");
frost.showGridLines = false;
frost.freezePanes.freezeRows(1);
styleTable(frost, frost.getRange("A1:R1"), frost.getUsedRange());

const activation = workbook.worksheets.add("Activation Package");
activation.showGridLines = false;
writeMatrix(activation, 0, 0, [["Frost Tower Flagship Activation Case", "", ""]]);
activation.getRange("A1:C1").merge();
styleTitle(activation.getRange("A1:C1"));
writeMatrix(activation, 2, 0, [
  ["Module", "Activation Role", "Measurement"],
  ["Workplace Anchor", "Position Frost Tower as a downtown workplace and Congress Avenue discovery hub.", "Route opens, saves, directions"],
  ["DAA Art Walk Proximity", "Tie Frost Tower to nearby civic, public art, parks, and downtown stories route context.", "Stop views, check-ins, route completions"],
  ["Nearby Perks", "Surface lunch, coffee, happy hour, wellness, and event offers around worker/resident movement.", "Perk uses, saves, partner referrals"],
  ["Sponsor/Brand Package", "Package nearby foot traffic into premium brand activations and resident campaigns.", "Campaign requests, lead handoffs"],
  ["Workspace Reporting", "Report engagement by segment, route, stop, entity, and source workbook lineage.", "Interactions, analytics signals, CRM source trace"],
]);
styleTable(activation, activation.getRange("A3:C3"), activation.getRange("A3:C8"));

for (const sheet of [
  summary,
  segments,
  duplicates,
  frost,
  activation,
  masterSheet,
]) {
  sheet.getUsedRange().format.font.name = "Aptos";
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

await fs.mkdir(outDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(outDir, "Downtown_Perks_Master_CRM.xlsx"));

const preview = await workbook.render({ sheetName: "Summary", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(path.join(outDir, "summary-preview.png"), new Uint8Array(await preview.arrayBuffer()));

console.log(JSON.stringify({ output: path.join(outDir, "Downtown_Perks_Master_CRM.xlsx") }, null, 2));
