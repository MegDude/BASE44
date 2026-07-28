#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const ROOT = process.cwd();
const execFileAsync = promisify(execFile);
let trackedFilesPromise;
const OUTPUT_DIR = path.join(ROOT, "inventory", "generated");
const BASE_URL = (process.env.DP_CANONICAL_BASE_URL || "https://base-44-downtown-perks-live.vercel.app").replace(/\/$/, "");
const APP_ROUTE_FILE = "src/App.jsx";
const PRODUCTION_ENTITY_FILE = "src/data/production/production-map-inventory.json";
const SOURCE_DIRS = ["src/content", "src/data", "src/config", "src/pages", "src/components", "src/lib"];
const DB_TABLES = [
  "workspaces", "workspace_memberships", "entities", "workspace_entities", "perks", "events",
  "campaigns", "campaign_entities", "collections", "collection_entities", "routes", "route_stops",
  "qr_codes", "qr_placements", "activity_events", "report_snapshots",
];

const outputSchemas = {
  pages: ["pageId", "sourceFile", "canonicalPath", "fullUrl", "pageSurface", "module", "audience", "authRequired", "indexability", "routeKind", "redirectTo", "primaryCta", "copyHook", "seoTitle", "seoKeywords", "metaDescription", "evidence", "status", "notes"],
  entities: ["objectId", "objectName", "objectType", "sourceTable", "workspaceId", "slug", "status", "visibility", "residentLink", "partnerLink", "publicSeoPage", "partnerEditor", "reportLink", "pinVisible", "latitude", "longitude", "district", "address", "residentShortCopy", "residentLongCopy", "residentPrimaryCta", "partnerWorkspaceCopy", "partnerPrimaryCta", "seoTitle", "seoKeywords", "metaDescription", "searchSynonyms", "embeddingText", "agentTags", "primaryImage", "sourceFiles", "sourceEvidence"],
  relationships: ["relationshipId", "sourceType", "sourceId", "relationship", "targetType", "targetId", "residentVisible", "partnerVisible", "adminVisible", "status", "evidence"],
  copyLinks: ["recordId", "objectType", "objectId", "surface", "audience", "headline", "bodyCopy", "primaryCta", "primaryLink", "secondaryLink", "sourceFile", "status"],
  seo: ["recordId", "objectType", "objectId", "canonicalUrl", "indexability", "seoTitle", "metaDescription", "keywords", "synonyms", "embeddingText", "agentTags", "schemaType", "status"],
  routesCollections: ["recordId", "recordType", "name", "description", "mode", "category", "district", "workspaceId", "stopIds", "stopCount", "residentLink", "partnerLink", "primaryCta", "sourceFile", "status"],
  perksEvents: ["recordId", "recordType", "name", "hostEntityId", "workspaceId", "description", "termsOrSchedule", "residentLink", "partnerEditor", "status", "sourceFile"],
  campaigns: ["campaignId", "name", "workspaceId", "hostEntityId", "audience", "description", "residentLink", "partnerEditor", "reportLink", "status", "sourceFile"],
  workspaces: ["workspaceId", "name", "workspaceType", "ownerEntityId", "access", "overviewLink", "editorLink", "reportLink", "sourceFile", "status"],
  mapLayers: ["layerId", "name", "layerType", "filter", "intentRequired", "recordCount", "residentVisible", "partnerVisible", "sourceFile", "status"],
  media: ["mediaId", "entityId", "path", "mediaType", "exists", "altText", "sourceFile", "status"],
  redirects: ["redirectId", "sourcePath", "targetPath", "preservesSearch", "preservesHash", "returnToSafe", "sourceFile", "status", "notes"],
  issues: ["issueId", "severity", "objectType", "objectId", "issue", "evidence", "recommendedAction"],
};

function csvEscape(value) {
  if (value == null) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, headers) {
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n") + "\n";
}

function clean(value) { return String(value ?? "").replace(/\s+/g, " ").trim(); }
function slugify(value) { return clean(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function titleFromPath(value) { return value === "/" ? "Home" : clean(value.split(/[/?#]/).filter(Boolean).map((part) => part.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(" · ")); }
function joinUrl(route) { return `${BASE_URL}${route.startsWith("/") ? route : `/${route}`}`; }

async function fileExists(relativePath) {
  const repositoryPath = relativePath.replace(/^\//, "");
  try {
    await fs.access(path.join(ROOT, repositoryPath));
    return true;
  } catch {
    // CI and Codex commonly use sparse checkouts. A tracked production asset is
    // not missing merely because its blob was not materialized locally.
    try {
      trackedFilesPromise ||= execFileAsync("git", ["ls-tree", "-r", "--name-only", "HEAD"], {
        cwd: ROOT,
        maxBuffer: 16 * 1024 * 1024,
      }).then(({ stdout }) => new Set(stdout.split("\n").filter(Boolean)));
      return (await trackedFilesPromise).has(repositoryPath);
    } catch {
      return false;
    }
  }
}

function normalizedAddress(value) {
  return clean(value).toLowerCase().replace(/\b(street|st\.?)\b/g, "st").replace(/\b(road|rd\.?)\b/g, "rd").replace(/[^a-z0-9#]+/g, " ").trim();
}

function coordinatesAreNear(left, right, toleranceMeters = 35) {
  const lat1 = Number(left.latitude);
  const lng1 = Number(left.longitude);
  const lat2 = Number(right.latitude);
  const lng2 = Number(right.longitude);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return false;
  const radians = (degrees) => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLng = radians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) <= toleranceMeters;
}

function entityFamily(type) {
  if (["restaurant", "bar", "coffee", "retail", "wellness", "venue"].includes(type)) return "place";
  return type;
}

function duplicateIssues(entities) {
  const parents = new Map(entities.map((entity) => [entity.objectId, entity.objectId]));
  const find = (id) => {
    const parent = parents.get(id);
    if (parent === id) return id;
    const root = find(parent);
    parents.set(id, root);
    return root;
  };
  const union = (left, right) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parents.set(rightRoot, leftRoot);
  };
  const byName = new Map();
  const bySlug = new Map();
  for (const entity of entities) {
    const name = slugify(entity.objectName);
    if (name) {
      if (byName.has(name)) union(entity.objectId, byName.get(name));
      else byName.set(name, entity.objectId);
    }
    if (entity.slug) {
      if (bySlug.has(entity.slug)) union(entity.objectId, bySlug.get(entity.slug));
      else bySlug.set(entity.slug, entity.objectId);
    }
  }
  const groups = new Map();
  for (const entity of entities) {
    const root = find(entity.objectId);
    groups.set(root, [...(groups.get(root) || []), entity]);
  }
  const issues = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const suspiciousPairs = [];
    for (let leftIndex = 0; leftIndex < group.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < group.length; rightIndex += 1) {
        const left = group[leftIndex];
        const right = group[rightIndex];
        if (entityFamily(left.objectType) !== entityFamily(right.objectType)) continue;
        const leftAddress = normalizedAddress(left.address);
        const rightAddress = normalizedAddress(right.address);
        if ((leftAddress && rightAddress && leftAddress === rightAddress) || coordinatesAreNear(left, right)) {
          suspiciousPairs.push(`${left.objectId} ↔ ${right.objectId}`);
        }
      }
    }
    if (!suspiciousPairs.length) continue;
    issues.push({
      issueId: `DUP-${String(issues.length + 1).padStart(5, "0")}`,
      severity: "High",
      objectType: "Entity",
      objectId: group.map((entity) => entity.objectId).join(" | "),
      issue: `Probable co-located canonical duplicate: ${group[0].objectName}`,
      evidence: suspiciousPairs.join(" | "),
      recommendedAction: "Resolve to one canonical identity and retain the other source IDs as aliases after editorial review.",
    });
  }
  return issues;
}

async function listFiles(relativeDir, matcher = /./) {
  const result = [];
  let entries = [];
  try { entries = await fs.readdir(path.join(ROOT, relativeDir), { withFileTypes: true }); } catch { return result; }
  for (const entry of entries) {
    const relative = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(relative, matcher));
    else if (matcher.test(entry.name)) result.push(relative);
  }
  return result;
}

function routeAudience(route) {
  if (/^\/(admin|admin-studio)/.test(route)) return "Admin";
  if (/^\/(partner|partners|workspace)/.test(route) || /mode=partner/.test(route)) return "Partner";
  if (/^\/(resident|onboarding|card|sign-in|app)/.test(route) || /mode=resident/.test(route)) return "Resident";
  return "Public";
}

function routeModule(route) {
  if (/admin/.test(route)) return "Administration";
  if (/partner-workspace|workspace|partner-portal/.test(route)) return "Partner workspace";
  if (/campaign/.test(route)) return "Campaigns";
  if (/report|analytics/.test(route)) return "Reports";
  if (/map|explore|ask-map/.test(route)) return "Map";
  if (/pricing|checkout|billing/.test(route)) return "Pricing and billing";
  if (/sign-in|sign-up|apply|auth|onboarding|card/.test(route)) return "Access";
  return "Marketing";
}

function extractRoutes(source) {
  const rows = [];
  const routePattern = /<Route\b[\s\S]*?\bpath=(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\})[\s\S]*?(?:\/>|<\/Route>)/g;
  for (const match of source.matchAll(routePattern)) {
    const route = match[1] || match[2] || match[3];
    if (!route) continue;
    const snippet = match[0];
    const navigate = snippet.match(/<(?:Navigate|RedirectWithSearch)\b[^>]*\bto=(?:"([^"]+)"|'([^']+)')/);
    const target = navigate ? navigate[1] || navigate[2] : "";
    const audience = routeAudience(route);
    const isRedirect = Boolean(target) || /RedirectWithSearch/.test(snippet);
    const authRequired = /ProtectedRoute/.test(snippet) || /^\/(partner-workspace|partner-portal)/.test(route) ? "Yes" : "No";
    const indexability = isRedirect || audience === "Admin" || authRequired === "Yes" ? "Noindex" : "Index";
    const title = titleFromPath(route);
    rows.push({
      sourceFile: APP_ROUTE_FILE, canonicalPath: route, fullUrl: joinUrl(route), pageSurface: title,
      module: routeModule(route), audience, authRequired, indexability,
      routeKind: isRedirect ? "Redirect or alias" : "Rendered route", redirectTo: target,
      primaryCta: route.includes("pricing") ? "View pricing" : route.includes("map") ? "Open map" : route.includes("sign-in") ? "Sign in" : "Open page",
      copyHook: `Use ${title} to understand what is here, why it matters, and what to do next.`,
      seoTitle: `${title} | Downtown Perks`, seoKeywords: `${slugify(title).replaceAll("-", ", ")}, downtown austin, downtown perks`,
      metaDescription: `Open ${title} in Downtown Perks and continue to the next relevant action.`,
      evidence: "React router", status: "Generated", notes: isRedirect ? "Verify target and state preservation." : "Verify rendered copy, actions, permissions, and empty states.",
    });
  }
  return [...new Map(rows.map((row) => [row.canonicalPath, row])).values()].sort((a, b) => a.canonicalPath.localeCompare(b.canonicalPath)).map((row, index) => ({ pageId: `APP-${String(index + 1).padStart(4, "0")}`, ...row }));
}

function entityRecord(record) {
  const id = clean(record.id || record.slug);
  const slug = clean(record.slug || slugify(record.name || id));
  const name = clean(record.name || record.title || slug);
  const type = clean(record.entityType || record.type || record.category || "place").toLowerCase();
  const district = clean(record.district || record.inheritance?.district);
  const residentCopy = clean(record.legendsContent?.resident?.copy?.join(" ") || record.summary || record.description);
  const partnerCopy = clean(record.legendsContent?.partner?.purpose || record.partnerInsight || `Manage ${name}, its resident-facing information, and measurable actions.`);
  const seoTitle = clean(record.seo?.title || `${name} | Downtown Perks`);
  const meta = clean(record.seo?.meta || record.seo?.description || record.description || `Find ${name} in Downtown Austin with Downtown Perks.`);
  const tags = unique([type, record.category, record.subcategory, district, ...(record.tags || [])]).map(clean);
  const primaryImage = clean(record.primaryImage || record.image || record.imageUrl || record.thumbnail);
  return {
    objectId: id, objectName: name, objectType: type, sourceTable: "Committed production map inventory", workspaceId: clean(record.workspaceId || record.partnerWorkspaceId), slug,
    status: clean(record.status || "review"), visibility: record.publicVisibility === false ? "Workspace" : "Public",
    residentLink: joinUrl(`/map?mode=resident&tab=map&filter=${encodeURIComponent(record.category || "Featured")}&entityId=${encodeURIComponent(id)}`),
    partnerLink: joinUrl(`/map?mode=partner&tab=map&filter=${encodeURIComponent(record.category || "Featured")}&entityId=${encodeURIComponent(id)}`),
    publicSeoPage: joinUrl(`/map?mode=resident&tab=map&filter=${encodeURIComponent(record.category || "Featured")}&entityId=${encodeURIComponent(id)}`),
    partnerEditor: joinUrl(`/partner-workspace/profile?entityId=${encodeURIComponent(id)}`), reportLink: joinUrl(`/partner-workspace/reports?entityId=${encodeURIComponent(id)}`),
    pinVisible: Number.isFinite(Number(record.lat)) && Number.isFinite(Number(record.lng)) ? "Yes" : "No", latitude: record.lat ?? record.latitude ?? "", longitude: record.lng ?? record.longitude ?? "", district, address: clean(record.address),
    residentShortCopy: residentCopy || `${name} is listed in ${district || "Downtown Austin"}.`, residentLongCopy: residentCopy || `${name} is part of the Downtown Perks map. Open the place for current details and actions.`,
    residentPrimaryCta: clean(record.actions?.[0]?.label || record.primaryAction || "View on map"), partnerWorkspaceCopy: partnerCopy, partnerPrimaryCta: "Open workspace",
    seoTitle, seoKeywords: unique([name, type, record.category, record.subcategory, district, "downtown austin"]).join(", ").toLowerCase(), metaDescription: meta,
    searchSynonyms: unique([slug.replaceAll("-", " "), ...(record.aliases || []), record.category, record.subcategory]).join(", "),
    embeddingText: clean(record.searchText || [name, type, record.category, record.subcategory, district, record.address, residentCopy].filter(Boolean).join(". ")),
    agentTags: tags.join(","), primaryImage, sourceFiles: PRODUCTION_ENTITY_FILE, sourceEvidence: clean(record.source || "Committed local registry"), rawRecord: record,
  };
}

function extractTypedRecords(source, sourceFile, kind, idPrefixes = []) {
  const rows = [];
  const idPattern = /\b(?:id|routeId|collectionId|campaignId|workspaceId|partnerWorkspaceId|organizationId|organization_id|eventId|perkId)\s*:\s*["'`]([^"'`]+)["'`]/g;
  for (const match of source.matchAll(idPattern)) {
    const id = clean(match[1]);
    if (!idPrefixes.some((prefix) => id.toLowerCase().includes(prefix))) continue;
    const context = source.slice(match.index, Math.min(source.length, match.index + 2600));
    const get = (...keys) => {
      for (const key of keys) {
        const found = context.match(new RegExp("\\b" + key + "\\s*:\\s*[\"'`]([^\"'`]+)[\"'`]"));
        if (found) return clean(found[1]);
      }
      return "";
    };
    const array = (key) => {
      const found = context.match(new RegExp(`\\b${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`));
      return found ? [...found[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => clean(x[1])) : [];
    };
    rows.push({ id, kind, name: get("name", "title", "routeName", "label") || titleFromPath(`/${id}`), description: get("description", "summary", "residentCopy", "copy"), hostEntityId: get("hostEntityId", "canonicalMapEntityId", "entityId", "partnerId", "parentId", "hostPartnerId"), workspaceId: get("workspaceId", "partnerWorkspaceId", "organizationId", "organization_id"), audience: get("audience"), category: get("category", "routeTheme", "type"), district: get("district", "neighborhood"), mode: get("routeMode", "mode"), status: get("status") || "Source-backed", terms: get("terms", "scheduleLabel", "date"), stopIds: array("stopIds").length ? array("stopIds") : array("stopPinIds"), sourceFile });
  }
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

async function fetchSupabaseTable(table) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { table, rows: [], status: "Skipped: protected server-side Supabase environment not present" };
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${table}?select=*&limit=10000`, { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" } });
  if (!response.ok) return { table, rows: [], status: `Unavailable: HTTP ${response.status}` };
  return { table, rows: await response.json(), status: "Fetched with protected server-side credential" };
}

function validTypedRecord(row, kind) {
  const id = row.id.toLowerCase();
  if (!id || /[${}\[\]]/.test(id) || /^(id|route|routes|walk|collection|collections|perk|perks|offer|event|events|campaign|campaigns|activation|workspace|workspace-platform|workspace_platform|organization|featuredevent|featuredcampaign)$/i.test(id)) return false;
  const canonicalSource = /^src\/(data|content)\//.test(row.sourceFile);
  if (!canonicalSource) return false;
  if (kind === "route") return /(^route[-_]|(?:route|walk)$|^daa-art-walk$|^waterloo-greenway$|^warehouse-district-happy-hour$|^inkind-dining-market$|^coffee-before-work$|^hotel-guest-arrival-route$|^downtown-stories-walk$)/.test(id);
  if (kind === "collection") return /collection|^downtown-perks-featured$|^resident-benefits$|^events-nearby$|^downtown-dining$|^buildings-and-residences$|^walking-routes$/.test(id);
  if (kind === "perk") return /^(perk[-_]|offer[-_])/.test(id);
  if (kind === "event") return /^event[-_]/.test(id);
  if (kind === "campaign") return /^campaign[-_]/.test(id);
  if (kind === "workspace") return /^(workspace[-_]|partner[-_]|org[-_])/.test(id);
  return false;
}

function dbRelationships(dbData) {
  const rows = [];
  const add = (sourceType, sourceId, relationship, targetType, targetId, evidence) => { if (sourceId && targetId) rows.push({ sourceType, sourceId: clean(sourceId), relationship, targetType, targetId: clean(targetId), residentVisible: relationship === "owns_entity" ? "No" : "Conditional", partnerVisible: "Yes", adminVisible: "Yes", status: "Generated", evidence }); };
  for (const { table, rows: records } of dbData) for (const row of records) {
    if (row.workspace_id && row.entity_id) add("Workspace", row.workspace_id, "owns_entity", "Entity", row.entity_id, table);
    if (row.campaign_id && row.entity_id) add("Campaign", row.campaign_id, "includes_entity", "Entity", row.entity_id, table);
    if (row.collection_id && row.entity_id) add("Collection", row.collection_id, "includes_entity", "Entity", row.entity_id, table);
    if (row.route_id && (row.entity_id || row.stop_entity_id)) add("Route", row.route_id, "includes_stop", "Entity", row.entity_id || row.stop_entity_id, table);
  }
  return rows;
}

function relationshipRows(entities, routes, perksEvents, campaigns, workspaces, dbData) {
  const rows = dbRelationships(dbData);
  const add = (sourceType, sourceId, relationship, targetType, targetId, evidence) => { if (sourceId && targetId) rows.push({ sourceType, sourceId, relationship, targetType, targetId, residentVisible: relationship === "owns_entity" ? "No" : "Conditional", partnerVisible: "Yes", adminVisible: "Yes", status: "Generated", evidence }); };
  for (const route of routes) for (const stop of route.stopIds || []) add(route.kind === "collection" ? "Collection" : "Route", route.id, "includes_stop", "Entity", stop, route.sourceFile);
  for (const record of perksEvents) add(record.kind === "perk" ? "Perk" : "Event", record.id, "hosted_by", "Entity", record.hostEntityId, record.sourceFile);
  for (const campaign of campaigns) { add("Campaign", campaign.id, "belongs_to", "Workspace", campaign.workspaceId, campaign.sourceFile); add("Campaign", campaign.id, "features", "Entity", campaign.hostEntityId, campaign.sourceFile); }
  for (const workspace of workspaces) add("Workspace", workspace.id, "owns_entity", "Entity", workspace.hostEntityId, workspace.sourceFile);
  const canonical = [...new Map(rows.map((row) => [`${row.sourceType}|${row.sourceId}|${row.relationship}|${row.targetType}|${row.targetId}`, row])).values()];
  return canonical.map((row, index) => ({ relationshipId: `REL-${String(index + 1).padStart(5, "0")}`, ...row }));
}

function makeIssues({ pages, entities, routes, perksEvents, campaigns, relationships, media }) {
  const issues = [];
  const add = (severity, objectType, objectId, issue, evidence, recommendedAction) => issues.push({ issueId: `ISS-${String(issues.length + 1).padStart(5, "0")}`, severity, objectType, objectId, issue, evidence, recommendedAction });
  for (const page of pages) if (page.indexability === "Index" && (!page.seoTitle || !page.metaDescription)) add("High", "Page", page.pageId, "Indexable route lacks SEO metadata", page.canonicalPath, "Add a unique title and description in the canonical page.");
  for (const entity of entities) {
    if (!entity.embeddingText || !entity.searchSynonyms || !entity.agentTags) add("Medium", "Entity", entity.objectId, "Search metadata is incomplete", entity.sourceFiles, "Add synonyms, embedding text, and agent tags to the canonical registry.");
    if (entity.pinVisible === "No") add("Medium", "Entity", entity.objectId, "Map entity has no valid coordinates", entity.address || entity.sourceFiles, "Confirm coordinates or suppress the pin intentionally.");
  }
  for (const item of perksEvents) if (!item.hostEntityId) add("High", item.kind, item.id, `${item.kind} has no host entity`, item.sourceFile, "Add the canonical host entity ID.");
  for (const item of campaigns) if (!item.workspaceId) add("High", "Campaign", item.id, "Campaign has no workspace", item.sourceFile, "Add the canonical workspace ID.");
  for (const item of routes) if ((item.stopIds || []).length === 0 && item.kind === "route") add("Medium", "Route", item.id, "Route has no explicit stops", item.sourceFile, "Add ordered canonical stop IDs.");
  for (const item of media) if (item.exists === "No") add("High", "Media", item.mediaId, "Referenced local media file is missing", item.path, "Replace the reference or add the approved asset.");
  return issues;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const routerSource = await fs.readFile(path.join(ROOT, APP_ROUTE_FILE), "utf8");
  const pages = extractRoutes(routerSource);
  const production = JSON.parse(await fs.readFile(path.join(ROOT, PRODUCTION_ENTITY_FILE), "utf8"));
  const sourceEntities = (production.records || []).map(entityRecord);
  const dbData = await Promise.all(DB_TABLES.map(fetchSupabaseTable));
  const dbEntityTable = dbData.find((item) => item.table === "entities");
  const dbEntities = (dbEntityTable?.rows || []).map((row) => entityRecord({ ...row, source: "Supabase entities" }));
  const entities = [...new Map([...sourceEntities, ...dbEntities].map((row) => [row.objectId, row])).values()].sort((a, b) => a.objectName.localeCompare(b.objectName));

  const sourceFiles = unique((await Promise.all(SOURCE_DIRS.map((dir) => listFiles(dir, /\.(?:js|jsx|ts|tsx|json)$/i)))).flat());
  const typed = { route: [], collection: [], perk: [], event: [], campaign: [], workspace: [] };
  for (const sourceFile of sourceFiles) {
    let source = ""; try { source = await fs.readFile(path.join(ROOT, sourceFile), "utf8"); } catch { continue; }
    typed.route.push(...extractTypedRecords(source, sourceFile, "route", ["route", "walk"]));
    typed.collection.push(...extractTypedRecords(source, sourceFile, "collection", ["collection"]));
    typed.perk.push(...extractTypedRecords(source, sourceFile, "perk", ["perk", "offer"]));
    typed.event.push(...extractTypedRecords(source, sourceFile, "event", ["event"]));
    typed.campaign.push(...extractTypedRecords(source, sourceFile, "campaign", ["campaign", "activation"]));
    typed.workspace.push(...extractTypedRecords(source, sourceFile, "workspace", ["workspace", "organization"]));
  }
  for (const key of Object.keys(typed)) typed[key] = [...new Map(typed[key].filter((row) => validTypedRecord(row, key)).map((row) => [row.id, row])).values()];

  const routes = [...typed.route, ...typed.collection].filter((row) => row.id.length > 3).sort((a, b) => a.name.localeCompare(b.name));
  const perksEvents = [...typed.perk, ...typed.event].filter((row) => row.id.length > 3).sort((a, b) => a.name.localeCompare(b.name));
  const campaigns = typed.campaign.filter((row) => row.id.length > 3).sort((a, b) => a.name.localeCompare(b.name));
  const workspaces = typed.workspace.filter((row) => row.id.length > 3).sort((a, b) => a.name.localeCompare(b.name));
  const relationships = relationshipRows(entities, routes, perksEvents, campaigns, workspaces, dbData);

  const redirects = pages.filter((page) => page.routeKind === "Redirect or alias").map((page, index) => ({ redirectId: `RDR-${String(index + 1).padStart(4, "0")}`, sourcePath: page.canonicalPath, targetPath: page.redirectTo, preservesSearch: /RedirectWithSearch/.test(routerSource.slice(Math.max(0, routerSource.indexOf(`path=\"${page.canonicalPath}\"`) - 80), routerSource.indexOf(`path=\"${page.canonicalPath}\"`) + 400)) ? "Yes" : page.redirectTo.includes("?") ? "Target-defined" : "No", preservesHash: /RedirectWithSearch/.test(routerSource) && page.redirectTo ? "Review" : "No", returnToSafe: /sign-in|auth/.test(page.canonicalPath) ? "Review" : "Not applicable", sourceFile: APP_ROUTE_FILE, status: page.redirectTo ? "Generated" : "Needs target review", notes: "React router alias or redirect." }));
  const routeRows = routes.map((row, index) => ({ recordId: `RTC-${String(index + 1).padStart(4, "0")}`, recordType: row.kind, name: row.name, description: row.description, mode: row.mode || (row.kind === "route" ? "walking" : "collection"), category: row.category, district: row.district, workspaceId: row.workspaceId, stopIds: row.stopIds.join(" | "), stopCount: row.stopIds.length, residentLink: joinUrl(`/map?mode=resident&tab=map&filter=Routes&collection=${encodeURIComponent(row.id)}`), partnerLink: joinUrl(`/map?mode=partner&tab=map&filter=Routes&collection=${encodeURIComponent(row.id)}`), primaryCta: "Open route", sourceFile: row.sourceFile, status: row.status }));
  const perkEventRows = perksEvents.map((row) => ({ recordId: row.id, recordType: row.kind, name: row.name, hostEntityId: row.hostEntityId, workspaceId: row.workspaceId, description: row.description, termsOrSchedule: row.terms, residentLink: joinUrl(`/map?mode=resident&tab=map&filter=${row.kind === "perk" ? "Perks" : "Events"}&entityId=${encodeURIComponent(row.id)}`), partnerEditor: joinUrl(`/partner-workspace/${row.kind === "perk" ? "offers" : "events"}?recordId=${encodeURIComponent(row.id)}`), status: row.status, sourceFile: row.sourceFile }));
  const typedPerkEventIds = new Set(perkEventRows.map((row) => row.recordId));
  for (const entity of entities.filter((row) => row.objectType === "event" && !typedPerkEventIds.has(row.objectId))) {
    perkEventRows.push({ recordId: entity.objectId, recordType: "event", name: entity.objectName, hostEntityId: entity.objectId, workspaceId: entity.workspaceId, description: entity.residentShortCopy, termsOrSchedule: "See canonical event record", residentLink: entity.residentLink, partnerEditor: joinUrl(`/partner-workspace/events?recordId=${encodeURIComponent(entity.objectId)}`), status: entity.status, sourceFile: entity.sourceFiles });
  }
  const campaignRows = campaigns.map((row) => ({ campaignId: row.id, name: row.name, workspaceId: row.workspaceId, hostEntityId: row.hostEntityId, audience: row.audience, description: row.description, residentLink: joinUrl(`/map?mode=resident&tab=map&filter=Campaigns&entityId=${encodeURIComponent(row.id)}`), partnerEditor: joinUrl(`/partner-workspace/campaigns?campaignId=${encodeURIComponent(row.id)}`), reportLink: joinUrl(`/partner-workspace/reports?campaignId=${encodeURIComponent(row.id)}`), status: row.status, sourceFile: row.sourceFile }));
  const workspaceRows = workspaces.map((row) => ({ workspaceId: row.id, name: row.name, workspaceType: row.category || "partner", ownerEntityId: row.hostEntityId, access: "Authenticated partner or admin", overviewLink: joinUrl(`/partner-workspace/overview?workspaceId=${encodeURIComponent(row.id)}`), editorLink: joinUrl(`/partner-workspace/profile?workspaceId=${encodeURIComponent(row.id)}`), reportLink: joinUrl(`/partner-workspace/reports?workspaceId=${encodeURIComponent(row.id)}`), sourceFile: row.sourceFile, status: row.status }));
  if (!workspaceRows.length) {
    for (const page of pages.filter((row) => row.routeKind === "Rendered route" && /^\/partner-workspace\/[a-z-]+$/.test(row.canonicalPath))) {
      const surface = page.canonicalPath.split("/").pop();
      workspaceRows.push({ workspaceId: `workspace-surface-${surface}`, name: titleFromPath(`/${surface}`), workspaceType: "Application surface", ownerEntityId: "", access: "Authenticated partner or admin", overviewLink: joinUrl(page.canonicalPath), editorLink: joinUrl(page.canonicalPath), reportLink: joinUrl("/partner-workspace/reports"), sourceFile: page.sourceFile, status: "Source-backed surface; database ownership not joined" });
    }
  }
  const copyLinks = [
    ...pages.map((row) => ({ recordId: `COPY-${row.pageId}`, objectType: "Page", objectId: row.pageId, surface: row.canonicalPath, audience: row.audience, headline: row.pageSurface, bodyCopy: row.copyHook, primaryCta: row.primaryCta, primaryLink: row.fullUrl, secondaryLink: row.redirectTo ? joinUrl(row.redirectTo) : "", sourceFile: row.sourceFile, status: row.status })),
    ...entities.map((row) => ({ recordId: `COPY-${row.objectId}`, objectType: "Entity", objectId: row.objectId, surface: "Map drawer", audience: "Resident and partner", headline: row.objectName, bodyCopy: row.residentShortCopy, primaryCta: row.residentPrimaryCta, primaryLink: row.residentLink, secondaryLink: row.partnerEditor, sourceFile: row.sourceFiles, status: row.status })),
  ];
  const seoRows = [
    ...pages.map((row) => ({ recordId: `SEO-${row.pageId}`, objectType: "Page", objectId: row.pageId, canonicalUrl: row.fullUrl, indexability: row.indexability, seoTitle: row.seoTitle, metaDescription: row.metaDescription, keywords: row.seoKeywords, synonyms: row.pageSurface, embeddingText: `${row.pageSurface}. ${row.copyHook}`, agentTags: `${row.module},${row.audience}`, schemaType: row.indexability === "Index" ? "WebPage" : "None", status: row.status })),
    ...entities.map((row) => ({ recordId: `SEO-${row.objectId}`, objectType: "Entity", objectId: row.objectId, canonicalUrl: row.publicSeoPage, indexability: row.visibility === "Public" ? "Index" : "Noindex", seoTitle: row.seoTitle, metaDescription: row.metaDescription, keywords: row.seoKeywords, synonyms: row.searchSynonyms, embeddingText: row.embeddingText, agentTags: row.agentTags, schemaType: /event/.test(row.objectType) ? "Event" : /restaurant|venue/.test(row.objectType) ? "LocalBusiness" : /hotel/.test(row.objectType) ? "Hotel" : /property|building|listing/.test(row.objectType) ? "Place" : "Organization", status: row.status })),
  ];
  const layerCounts = new Map(); for (const entity of entities) layerCounts.set(entity.objectType, (layerCounts.get(entity.objectType) || 0) + 1);
  const mapLayers = [...layerCounts].sort((a, b) => a[0].localeCompare(b[0])).map(([type, count], index) => ({ layerId: `LYR-${String(index + 1).padStart(3, "0")}`, name: titleFromPath(`/${type}`), layerType: "Entity layer", filter: type, intentRequired: "Yes", recordCount: count, residentVisible: "Conditional", partnerVisible: "Conditional", sourceFile: PRODUCTION_ENTITY_FILE, status: "Generated" }));

  const media = [];
  for (const entity of entities) if (entity.primaryImage) media.push({ mediaId: `MED-${String(media.length + 1).padStart(5, "0")}`, entityId: entity.objectId, path: entity.primaryImage, mediaType: path.extname(entity.primaryImage).slice(1).toLowerCase() || "image", exists: await fileExists(`public/${entity.primaryImage.replace(/^\//, "")}`) ? "Yes" : "No", altText: `${entity.objectName} in ${entity.district || "Downtown Austin"}`, sourceFile: entity.sourceFiles, status: "Generated" });
  const issues = makeIssues({ pages, entities, routes, perksEvents, campaigns, relationships, media });
  const duplicates = duplicateIssues(entities);
  const canonicalIds = new Set(entities.map((entity) => entity.objectId));
  const orphans = [];
  for (const entity of entities) {
    const parentId = clean(entity.rawRecord?.parentEntityId || entity.rawRecord?.hostEntityId);
    if (parentId && !canonicalIds.has(parentId)) {
      orphans.push({
        issueId: `ORP-${String(orphans.length + 1).padStart(5, "0")}`,
        severity: "High",
        objectType: "Entity",
        objectId: entity.objectId,
        issue: "Canonical entity references a missing parent",
        evidence: parentId,
        recommendedAction: "Resolve the parent to a canonical entity ID or remove the invalid relationship before publishing.",
      });
    }
  }
  const inferredReferenceWarnings = issues.filter((issue) => /no host|no workspace|no explicit stops/.test(issue.issue));
  const brokenLinks = media.filter((item) => item.exists === "No").map((item, index) => ({ issueId: `LNK-${String(index + 1).padStart(5, "0")}`, severity: "High", objectType: "Media", objectId: item.entityId, issue: "Missing local media", evidence: item.path, recommendedAction: "Add the approved asset or replace the reference." }));
  const errors = {
    generatedAt: new Date().toISOString(),
    blocking: [...orphans, ...duplicates, ...brokenLinks],
    warnings: issues,
    database: dbData.map(({ table, rows, status }) => ({ table, rowCount: rows.length, status })),
  };
  const metadata = {
    schemaVersion: "2.0.0", generatedAt: new Date().toISOString(), baseUrl: BASE_URL, sourceOfTruth: "Canonical BASE44 router and committed registries; Supabase joins are optional and server-side only.",
    routeCount: pages.length, redirectCount: redirects.length, workspaceCount: workspaceRows.length, entityCount: entities.length, pinCount: entities.filter((x) => x.pinVisible === "Yes").length,
    perkCount: perkEventRows.filter((x) => x.recordType === "perk").length, eventCount: perkEventRows.filter((x) => x.recordType === "event").length, campaignCount: campaignRows.length,
    routeCollectionCount: routeRows.length, relationshipCount: relationships.length, mediaCount: media.length, orphanCount: orphans.length, duplicateCount: duplicates.length, brokenLinkCount: brokenLinks.length,
    sourceFileCount: sourceFiles.length,
    canonicalCountDefinition: "Unique records in production-map-inventory.json after canonical ID resolution; synthetic UI records and typed source-code references are excluded.",
    canonicalCountReconciled: entities.length === sourceEntities.length && entities.length === entities.filter((entity) => entity.pinVisible === "Yes").length,
    inferredReferenceWarningCount: inferredReferenceWarnings.length,
    blockingIssueCount: errors.blocking.length,
    databaseTables: errors.database,
    qualityGates: {
      unrestrictedMapQueriesAllowed: false, publicEntitiesRequireResidentLink: entities.every((x) => x.visibility !== "Public" || x.residentLink),
      ownedEntitiesRequirePartnerEditor: entities.every((x) => !x.workspaceId || x.partnerEditor), searchableObjectsRequireEmbeddingText: entities.every((x) => x.embeddingText),
      indexablePagesRequireSeoMetadata: pages.every((x) => x.indexability !== "Index" || (x.seoTitle && x.metaDescription)), workspacePagesNoindex: pages.filter((x) => x.authRequired === "Yes").every((x) => x.indexability === "Noindex"),
      adminPagesNoindex: pages.filter((x) => x.audience === "Admin").every((x) => x.indexability === "Noindex"), serviceRoleExported: false,
      canonicalCountReconciled: entities.length === sourceEntities.length && entities.length === entities.filter((entity) => entity.pinVisible === "Yes").length,
      noBlockingInventoryIssues: errors.blocking.length === 0,
    },
  };
  const contentInventory = { metadata, pages, entities: entities.map(({ rawRecord, ...row }) => row), relationships, copyLinks, seo: seoRows, routesCollections: routeRows, perksEvents: perkEventRows, campaigns: campaignRows, workspaces: workspaceRows, mapLayers, media, redirects, qualityIssues: issues };
  const summary = `# Downtown Perks content inventory\n\nGenerated ${metadata.generatedAt} from the canonical BASE44 application.\n\n| Record | Count |\n|---|---:|\n${[["Routes", metadata.routeCount], ["Redirects", metadata.redirectCount], ["Workspaces", metadata.workspaceCount], ["Entities", metadata.entityCount], ["Pins", metadata.pinCount], ["Perks", metadata.perkCount], ["Events", metadata.eventCount], ["Campaigns", metadata.campaignCount], ["Routes and collections", metadata.routeCollectionCount], ["Relationships", metadata.relationshipCount], ["Media", metadata.mediaCount], ["Orphans", metadata.orphanCount], ["Duplicates", metadata.duplicateCount], ["Broken links", metadata.brokenLinkCount]].map(([label, count]) => `| ${label} | ${count} |`).join("\n")}\n\n## Database join\n\n${errors.database.map((x) => `- ${x.table}: ${x.status} (${x.rowCount} rows)`).join("\n")}\n\n## Safety\n\nNo credential values, private membership records, or service-role secrets are written to generated artifacts.\n`;

  const files = {
    "partner-app-pages.csv": toCsv(pages, outputSchemas.pages), "entity-content-register.csv": toCsv(entities, outputSchemas.entities), "relationship-matrix.csv": toCsv(relationships, outputSchemas.relationships),
    "copy-link-register.csv": toCsv(copyLinks, outputSchemas.copyLinks), "seo-ai-search-index.csv": toCsv(seoRows, outputSchemas.seo), "routes-and-collections.csv": toCsv(routeRows, outputSchemas.routesCollections),
    "perks-and-events.csv": toCsv(perkEventRows, outputSchemas.perksEvents), "campaign-register.csv": toCsv(campaignRows, outputSchemas.campaigns), "workspace-register.csv": toCsv(workspaceRows, outputSchemas.workspaces),
    "map-layer-register.csv": toCsv(mapLayers, outputSchemas.mapLayers), "media-register.csv": toCsv(media, outputSchemas.media), "redirect-register.csv": toCsv(redirects, outputSchemas.redirects),
    "orphan-report.csv": toCsv(orphans, outputSchemas.issues), "duplicate-report.csv": toCsv(duplicates, outputSchemas.issues), "broken-links.csv": toCsv(brokenLinks, outputSchemas.issues),
    "inventory-metadata.json": JSON.stringify(metadata, null, 2) + "\n", "content-inventory.json": JSON.stringify(contentInventory, null, 2) + "\n", "inventory-errors.json": JSON.stringify(errors, null, 2) + "\n", "inventory-summary.md": summary,
  };
  await Promise.all(Object.entries(files).map(([name, contents]) => fs.writeFile(path.join(OUTPUT_DIR, name), contents)));
  console.log(JSON.stringify(metadata, null, 2));
}

main().catch((error) => { console.error("Partner content inventory generation failed."); console.error(error); process.exitCode = 1; });
