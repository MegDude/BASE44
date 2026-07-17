#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "inventory", "generated");
const BASE_URL = process.env.DP_CANONICAL_BASE_URL || "https://base-44-h2iq.vercel.app";
const SOURCE_DIRS = ["src/content", "src/data", "src/config", "src/pages", "src/components"];
const APP_ROUTE_FILES = ["src/App.jsx", "src/main.jsx"];

const PUBLIC_ROUTE_HINTS = [
  /^\/$/,
  /^\/about/,
  /^\/pricing/,
  /^\/partners(?:\/|$)/,
  /^\/map/,
  /^\/events/,
  /^\/perks/,
  /^\/properties/,
  /^\/hotels/,
  /^\/brands/,
  /^\/contact/,
];

const AUTH_ROUTE_HINTS = [
  /^\/partner-workspace/,
  /^\/workspace/,
  /^\/partner-portal/,
  /^\/admin/,
  /^\/dashboard/,
];

const ENTITY_TYPE_TOKENS = [
  "venue",
  "event",
  "perk",
  "property",
  "building",
  "hotel",
  "brand",
  "civic",
  "service",
  "real_estate",
  "real-estate",
  "route",
  "collection",
  "walk",
  "campaign",
];

const DB_TABLES = [
  "workspaces",
  "workspace_memberships",
  "entities",
  "workspace_entities",
  "perks",
  "events",
  "campaigns",
  "campaign_entities",
  "collections",
  "collection_entities",
  "routes",
  "route_stops",
  "qr_codes",
  "qr_placements",
  "activity_events",
  "report_snapshots",
];

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, headers) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

function normalisePath(routePath) {
  if (!routePath) return "";
  return routePath.startsWith("/") ? routePath : `/${routePath}`;
}

function titleFromPath(routePath) {
  if (routePath === "/") return "Home";
  return routePath
    .split(/[/?#]/)
    .filter(Boolean)
    .map((token) => token
      .replaceAll("-", " ")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()))
    .join(" · ");
}

function inferAudience(routePath) {
  if (/^\/admin/.test(routePath)) return "Admin";
  if (/^\/(partner-workspace|workspace|partner-portal)/.test(routePath)) return "Partner";
  if (/^\/partners/.test(routePath)) return "Partner";
  if (/mode=partner/.test(routePath)) return "Partner";
  if (/mode=admin/.test(routePath)) return "Admin";
  if (/^\/(resident|card|saved|dashboard)/.test(routePath) || /mode=resident/.test(routePath)) return "Resident";
  return "Public";
}

function inferAuth(routePath) {
  if (AUTH_ROUTE_HINTS.some((pattern) => pattern.test(routePath))) return "Yes";
  if (/\/sign-in|\/sign-up|\/apply|\/pricing/.test(routePath)) return "No";
  return "Conditional";
}

function inferIndexability(routePath, audience, isRedirect) {
  if (isRedirect || audience === "Admin" || inferAuth(routePath) === "Yes") return "Noindex";
  return PUBLIC_ROUTE_HINTS.some((pattern) => pattern.test(routePath)) ? "Index" : "Review";
}

function inferModule(routePath) {
  if (/partner-workspace|workspace|partner-portal/.test(routePath)) return "Partner Workspace";
  if (/campaign/.test(routePath)) return "Campaigns";
  if (/report|analytics/.test(routePath)) return "Reporting";
  if (/map/.test(routePath)) return "Map";
  if (/pricing|checkout|billing/.test(routePath)) return "Commerce";
  if (/sign-in|sign-up|apply|auth/.test(routePath)) return "Authentication";
  if (/admin/.test(routePath)) return "Admin";
  if (/route|walk|collection/.test(routePath)) return "Routes & Collections";
  return "Platform";
}

function buildPageCopy(routePath, title, audience) {
  const noun = audience === "Partner" ? "partner workspace" : audience === "Resident" ? "downtown experience" : "Downtown Perks";
  return {
    primaryCta: routePath.includes("sign-in") ? "Sign in" : routePath.includes("sign-up") ? "Start setup" : routePath.includes("pricing") ? "View plans" : routePath.includes("map") ? "Open map" : "Open page",
    copyHook: `Use this ${noun} surface to complete the next relevant action without losing context.`,
    seoTitle: `${title} | Downtown Perks`,
    seoKeywords: [...new Set([...title.toLowerCase().split(/\s+/), "downtown austin", "downtown perks"])].join(", "),
    metaDescription: `Open ${title} in Downtown Perks and continue through the appropriate resident, partner, or administrative workflow.`,
  };
}

function extractRoutes(source, sourceFile) {
  const routes = [];
  const routePattern = /<Route\s+[^>]*path=(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\})[^>]*>/g;
  for (const match of source.matchAll(routePattern)) {
    const routePath = normalisePath(match[1] || match[2] || match[3]);
    const routeTag = match[0];
    const redirectMatch = routeTag.match(/<Navigate\s+to=(?:"([^"]+)"|'([^']+)')/);
    const redirectTo = redirectMatch ? redirectMatch[1] || redirectMatch[2] : "";
    const isRedirect = Boolean(redirectTo) || /RedirectWithSearch/.test(routeTag);
    const audience = inferAudience(routePath);
    const title = titleFromPath(routePath);
    const copy = buildPageCopy(routePath, title, audience);
    routes.push({
      pageId: "",
      sourceFile,
      canonicalPath: routePath,
      fullUrl: `${BASE_URL}${routePath}`,
      pageSurface: title,
      module: inferModule(routePath),
      audience,
      authRequired: inferAuth(routePath),
      indexability: inferIndexability(routePath, audience, isRedirect),
      routeKind: isRedirect ? "Redirect or alias" : "Rendered route",
      redirectTo,
      evidence: "Extracted from React router",
      ...copy,
      status: "Generated",
      notes: isRedirect ? "Confirm canonical target and preserve query/search/hash state." : "Audit rendered component, metadata, links, permissions, and states.",
    });
  }
  return routes;
}

async function listFiles(dir) {
  const absolute = path.join(ROOT, dir);
  let entries = [];
  try {
    entries = await fs.readdir(absolute, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(relative));
    else if (/\.(?:js|jsx|ts|tsx|json|csv|md)$/i.test(entry.name)) files.push(relative);
  }
  return files;
}

function detectEntityCandidates(source, sourceFile) {
  const records = new Map();
  const objectPatterns = [
    /(?:id|entityId|slug|partnerId|workspaceId|routeId|collectionId|campaignId)\s*[:=]\s*["'`]([a-z0-9][a-z0-9-_]{2,})["'`]/gi,
    /["'`]([a-z0-9]+(?:-[a-z0-9]+){1,})["'`]/gi,
  ];
  for (const pattern of objectPatterns) {
    for (const match of source.matchAll(pattern)) {
      const id = match[1].toLowerCase();
      if (/^(?:https?|rgba|aria|data|class|button|section|div|span|image|input|output|target|blank|noreferrer|noopener)$/.test(id)) continue;
      const windowStart = Math.max(0, match.index - 250);
      const windowEnd = Math.min(source.length, match.index + 500);
      const context = source.slice(windowStart, windowEnd);
      const matchedTypes = ENTITY_TYPE_TOKENS.filter((token) => new RegExp(`\\b${token.replace("-", "[-_]?")}\\b`, "i").test(context));
      if (!matchedTypes.length && !/(name|title|description|summary|latitude|longitude|workspace|partner)/i.test(context)) continue;
      const existing = records.get(id) || {
        objectId: id,
        objectName: titleFromPath(`/${id}`).replaceAll(" · ", " "),
        inferredTypes: new Set(),
        sourceFiles: new Set(),
        sourceEvidence: [],
      };
      matchedTypes.forEach((type) => existing.inferredTypes.add(type));
      existing.sourceFiles.add(sourceFile);
      if (existing.sourceEvidence.length < 3) existing.sourceEvidence.push(context.replace(/\s+/g, " ").slice(0, 300));
      records.set(id, existing);
    }
  }
  return records;
}

async function fetchSupabaseTable(table) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return { table, rows: [], status: "Skipped: Supabase environment not present" };
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${table}?select=*&limit=10000`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) return { table, rows: [], status: `Unavailable: ${response.status}` };
  return { table, rows: await response.json(), status: "Fetched" };
}

function entityFromDb(table, row) {
  const id = row.id || row.entity_id || row.slug || row.workspace_id || row.route_id || row.collection_id || row.campaign_id;
  if (!id) return null;
  const name = row.name || row.title || row.organization_name || row.display_name || row.slug || String(id);
  const slug = row.slug || String(id);
  const entityType = row.entity_type || row.type || table.replace(/s$/, "");
  const workspaceId = row.workspace_id || (table === "workspaces" ? row.id : "");
  const publicPath = table === "routes" ? `/map?mode=resident&routeId=${encodeURIComponent(String(id))}` : `/map?mode=resident&tab=map&filter=All&entityId=${encodeURIComponent(String(id))}`;
  const partnerPath = table === "routes" ? `/partner-workspace/routes/${encodeURIComponent(String(id))}` : `/map?mode=partner&tab=map&filter=All&entityId=${encodeURIComponent(String(id))}`;
  return {
    objectId: String(id),
    objectName: String(name),
    objectType: String(entityType),
    sourceTable: table,
    workspaceId: workspaceId ? String(workspaceId) : "",
    slug: String(slug),
    status: row.status || "Review",
    visibility: row.visibility || (row.is_public === false ? "Workspace" : "Public"),
    residentLink: `${BASE_URL}${publicPath}`,
    partnerLink: `${BASE_URL}${partnerPath}`,
    publicSeoPage: `${BASE_URL}/places/${encodeURIComponent(String(slug))}`,
    partnerEditor: `${BASE_URL}/partner-workspace/listings/${encodeURIComponent(String(id))}`,
    reportLink: `${BASE_URL}/partner-workspace/reports/entity/${encodeURIComponent(String(id))}`,
    pinVisible: ["entity", "venue", "hotel", "property", "building", "civic", "service", "real_estate"].some((token) => String(entityType).includes(token)) ? "Conditional" : "No",
    residentShortCopy: row.short_description || row.summary || `Explore ${name} through Downtown Perks.`,
    residentLongCopy: row.description || row.long_description || `Discover ${name}, related places, perks, events, routes, and useful downtown context.`,
    residentPrimaryCta: table === "routes" ? "Start route" : "View on map",
    partnerWorkspaceCopy: `Manage ${name}, associated content, campaigns, media, access, and reporting through the authorised workspace.`,
    partnerPrimaryCta: "Open workspace",
    seoTitle: `${name} | Downtown Austin | Downtown Perks`,
    seoKeywords: `${String(name).toLowerCase()}, ${String(entityType).replaceAll("_", " ")}, downtown austin, downtown perks`,
    metaDescription: row.meta_description || `Explore ${name}, related downtown places, events, perks, routes, and partner experiences through Downtown Perks.`,
    searchSynonyms: [row.slug, row.category, row.district, row.partner_type].filter(Boolean).join(", "),
    embeddingText: [name, entityType, row.summary, row.description, row.category, row.district].filter(Boolean).join(". "),
    agentTags: [entityType, row.category, row.district, row.partner_type].filter(Boolean).join(","),
    rawRecord: row,
  };
}

function relationshipRows(dbData) {
  const output = [];
  const add = (sourceType, sourceId, relationship, targetType, targetId, evidence) => {
    if (!sourceId || !targetId) return;
    output.push({
      relationshipId: `REL-${String(output.length + 1).padStart(5, "0")}`,
      sourceType,
      sourceId: String(sourceId),
      relationship,
      targetType,
      targetId: String(targetId),
      residentVisible: relationship.includes("workspace") ? "No" : "Conditional",
      partnerVisible: "Yes",
      adminVisible: "Yes",
      status: "Generated",
      evidence,
    });
  };
  for (const { table, rows } of dbData) {
    for (const row of rows) {
      if (row.workspace_id && row.entity_id) add("Workspace", row.workspace_id, "owns_entity", "Entity", row.entity_id, table);
      if (row.campaign_id && row.entity_id) add("Campaign", row.campaign_id, "includes_entity", "Entity", row.entity_id, table);
      if (row.collection_id && row.entity_id) add("Collection", row.collection_id, "includes_entity", "Entity", row.entity_id, table);
      if (row.route_id && (row.entity_id || row.stop_entity_id)) add("Route", row.route_id, "includes_stop", "Entity", row.entity_id || row.stop_entity_id, table);
      if (row.entity_id && row.perk_id) add("Entity", row.entity_id, "hosts_perk", "Perk", row.perk_id, table);
      if (row.entity_id && row.event_id) add("Entity", row.entity_id, "hosts_event", "Event", row.event_id, table);
    }
  }
  return output;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const routeRows = [];
  for (const file of APP_ROUTE_FILES) {
    try {
      const source = await fs.readFile(path.join(ROOT, file), "utf8");
      routeRows.push(...extractRoutes(source, file));
    } catch {
      // Missing optional router file.
    }
  }
  const dedupedRoutes = [...new Map(routeRows.map((row) => [row.canonicalPath, row])).values()]
    .sort((a, b) => a.canonicalPath.localeCompare(b.canonicalPath))
    .map((row, index) => ({ ...row, pageId: `APP-${String(index + 1).padStart(4, "0")}` }));

  const sourceFiles = (await Promise.all(SOURCE_DIRS.map(listFiles))).flat();
  const sourceCandidates = new Map();
  for (const file of sourceFiles) {
    let source;
    try {
      source = await fs.readFile(path.join(ROOT, file), "utf8");
    } catch {
      continue;
    }
    for (const [id, candidate] of detectEntityCandidates(source, file)) {
      const existing = sourceCandidates.get(id);
      if (!existing) sourceCandidates.set(id, candidate);
      else {
        candidate.inferredTypes.forEach((value) => existing.inferredTypes.add(value));
        candidate.sourceFiles.forEach((value) => existing.sourceFiles.add(value));
        existing.sourceEvidence.push(...candidate.sourceEvidence.slice(0, Math.max(0, 3 - existing.sourceEvidence.length)));
      }
    }
  }

  const dbData = await Promise.all(DB_TABLES.map(fetchSupabaseTable));
  const dbEntities = dbData.flatMap(({ table, rows }) => rows.map((row) => entityFromDb(table, row)).filter(Boolean));
  const dbEntityIds = new Set(dbEntities.map((row) => row.objectId));
  const sourceEntities = [...sourceCandidates.values()]
    .filter((candidate) => !dbEntityIds.has(candidate.objectId))
    .map((candidate) => ({
      objectId: candidate.objectId,
      objectName: candidate.objectName,
      objectType: [...candidate.inferredTypes].join(",") || "Unclassified",
      sourceTable: "Source registry scan",
      workspaceId: "",
      slug: candidate.objectId,
      status: "Needs database reconciliation",
      visibility: "Review",
      residentLink: `${BASE_URL}/map?mode=resident&tab=map&filter=All&entityId=${encodeURIComponent(candidate.objectId)}`,
      partnerLink: `${BASE_URL}/map?mode=partner&tab=map&filter=All&entityId=${encodeURIComponent(candidate.objectId)}`,
      publicSeoPage: `${BASE_URL}/places/${encodeURIComponent(candidate.objectId)}`,
      partnerEditor: `${BASE_URL}/partner-workspace/listings/${encodeURIComponent(candidate.objectId)}`,
      reportLink: `${BASE_URL}/partner-workspace/reports/entity/${encodeURIComponent(candidate.objectId)}`,
      pinVisible: "Review",
      residentShortCopy: `Explore ${candidate.objectName} through Downtown Perks.`,
      residentLongCopy: `Discover ${candidate.objectName}, related places, perks, events, routes, and useful downtown context.`,
      residentPrimaryCta: "View on map",
      partnerWorkspaceCopy: `Manage ${candidate.objectName} and its associated content through the authorised workspace.`,
      partnerPrimaryCta: "Open workspace",
      seoTitle: `${candidate.objectName} | Downtown Austin | Downtown Perks`,
      seoKeywords: `${candidate.objectName.toLowerCase()}, downtown austin, downtown perks`,
      metaDescription: `Explore ${candidate.objectName} and associated Downtown Perks experiences.`,
      searchSynonyms: candidate.objectId.replaceAll("-", ", "),
      embeddingText: `${candidate.objectName}. ${[...candidate.inferredTypes].join(". ")}.`,
      agentTags: [...candidate.inferredTypes].join(","),
      sourceFiles: [...candidate.sourceFiles].join(" | "),
      sourceEvidence: candidate.sourceEvidence.join(" | "),
    }));

  const entityRows = [...dbEntities, ...sourceEntities]
    .sort((a, b) => a.objectName.localeCompare(b.objectName));
  const relationships = relationshipRows(dbData);

  const pageHeaders = [
    "pageId", "sourceFile", "canonicalPath", "fullUrl", "pageSurface", "module", "audience",
    "authRequired", "indexability", "routeKind", "redirectTo", "primaryCta", "copyHook", "seoTitle",
    "seoKeywords", "metaDescription", "evidence", "status", "notes",
  ];
  const entityHeaders = [
    "objectId", "objectName", "objectType", "sourceTable", "workspaceId", "slug", "status", "visibility",
    "residentLink", "partnerLink", "publicSeoPage", "partnerEditor", "reportLink", "pinVisible",
    "residentShortCopy", "residentLongCopy", "residentPrimaryCta", "partnerWorkspaceCopy", "partnerPrimaryCta",
    "seoTitle", "seoKeywords", "metaDescription", "searchSynonyms", "embeddingText", "agentTags",
    "sourceFiles", "sourceEvidence",
  ];
  const relationshipHeaders = [
    "relationshipId", "sourceType", "sourceId", "relationship", "targetType", "targetId",
    "residentVisible", "partnerVisible", "adminVisible", "status", "evidence",
  ];

  const metadata = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    routeCount: dedupedRoutes.length,
    entityCount: entityRows.length,
    relationshipCount: relationships.length,
    sourceFileCount: sourceFiles.length,
    databaseTables: dbData.map(({ table, rows, status }) => ({ table, rowCount: rows.length, status })),
    qualityGates: {
      unrestrictedMapQueriesAllowed: false,
      publicEntitiesRequireResidentLink: true,
      ownedEntitiesRequirePartnerEditor: true,
      searchableObjectsRequireEmbeddingText: true,
      indexablePagesRequireSeoMetadata: true,
    },
  };

  await Promise.all([
    fs.writeFile(path.join(OUTPUT_DIR, "partner-app-pages.csv"), toCsv(dedupedRoutes, pageHeaders)),
    fs.writeFile(path.join(OUTPUT_DIR, "entity-content-register.csv"), toCsv(entityRows, entityHeaders)),
    fs.writeFile(path.join(OUTPUT_DIR, "relationship-matrix.csv"), toCsv(relationships, relationshipHeaders)),
    fs.writeFile(path.join(OUTPUT_DIR, "content-inventory.json"), JSON.stringify({ metadata, pages: dedupedRoutes, entities: entityRows, relationships }, null, 2)),
    fs.writeFile(path.join(OUTPUT_DIR, "inventory-metadata.json"), JSON.stringify(metadata, null, 2)),
  ]);

  console.log(JSON.stringify(metadata, null, 2));
}

main().catch((error) => {
  console.error("Partner content inventory generation failed.");
  console.error(error);
  process.exitCode = 1;
});
