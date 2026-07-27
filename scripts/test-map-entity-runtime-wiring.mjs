import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/mapEntityAliases.js", import.meta.url), "utf8");

assert.match(
  source,
  /import\s+\{\s*resolveMapEntityByIdentityCandidates\s*\}\s+from\s+["']@\/lib\/mapEntityIdentityCandidates["'];/,
  "mapEntityAliases must import the runtime identity resolver",
);
assert.match(
  source,
  /const\s+runtimeIdentityMatch\s*=\s*resolveMapEntityByIdentityCandidates\(entityId,\s*entities\);/,
  "resolveMapEntityFromCollection must check runtime identities",
);
assert.match(
  source,
  /if\s*\(runtimeIdentityMatch\)\s*return\s+runtimeIdentityMatch;/,
  "runtime identity matches must return the canonical collection entity before legacy fallbacks",
);

console.log("map entity runtime wiring contract passed");
