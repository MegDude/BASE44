import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type SourceRecord = {
  id: string;
  title: string;
  url: string;
  category: string;
  micrositeStatus: string;
  publicSafe: boolean;
  conflicts: string[];
};

const root = process.cwd();
const inventoryPath = resolve(root, "docs/microsites/notion-source-inventory.json");
const reportPath = resolve(root, "docs/microsites/sync-report.md");
const inventory = JSON.parse(readFileSync(inventoryPath, "utf8")) as { verifiedAt: string; records: SourceRecord[] };

const duplicateIds = inventory.records.filter((record, index, records) =>
  records.findIndex((candidate) => candidate.id === record.id) !== index
);
const missingRoutes = inventory.records.filter((record) => !record.title || !record.category);
const conflictCount = inventory.records.reduce((total, record) => total + record.conflicts.length, 0);

if (duplicateIds.length || missingRoutes.length) {
  throw new Error(`Microsite source validation failed: ${duplicateIds.length} duplicate IDs, ${missingRoutes.length} incomplete records.`);
}

const report = `# Microsite sync report

- Snapshot verified at: ${inventory.verifiedAt}
- Source rows: ${inventory.records.length}
- Source conflicts: ${conflictCount}
- Automatically approved for publication: 0
- Runtime Notion requests: disabled

This command validates the controlled Notion snapshot. It does not fetch live Notion data or publish drafts. Refresh the source inventory through the authenticated audit workflow, review field-level changes, and explicitly approve each public record before release.
`;

writeFileSync(reportPath, report);
console.log(`Validated ${inventory.records.length} Notion source records. No public approvals were changed.`);
