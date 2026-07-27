import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/hooks/useSearchDrivenMapEntities.js', import.meta.url), 'utf8');

const requiredSnippets = [
  'function isParkingEntity',
  'function hasPartnerParkingRelationship',
  'scope.audienceMode === "partner" && isParkingEntity(entity) && !hasPartnerParkingRelationship(entity, scope)',
  'permissions.has("parking:admin")',
  'permissions.has("parking:manage")',
];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    throw new Error(`Partner parking visibility contract missing: ${snippet}`);
  }
}

console.log('Partner parking visibility contract passed.');
