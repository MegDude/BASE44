import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { mapCollections } from "../src/data/mapCollections";
import { downtownDiscoveryRoutes } from "../src/data/civicDiscoveryNetwork";
import { brandActivationRoutes } from "../src/data/brandActivationIntelligence";
import { entityMediaManifest } from "../src/data/media/entityMediaManifest";

const repo = process.cwd();
const mediaRoot = "/Users/megdude/Downloads/PERKS MEDIA";
const outputDir = path.join(repo, "docs/media-audit");
const supported = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg", ".mp4", ".mov"]);
const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const ignoredNames = new Set([".DS_Store"]);
const csv = (rows: Record<string, unknown>[], columns: string[]) => [columns.join(","), ...rows.map((row) => columns.map((column) => `"${String(row[column] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n") + "\n";
const slug = (value: string) => value.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function probeDimensions(files: string[]) {
  const dimensions = new Map<string, { width: string; height: string }>();
  for (let index = 0; index < files.length; index += 80) {
    const chunk = files.slice(index, index + 80);
    const result = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", ...chunk], { encoding: "utf8", maxBuffer: 20_000_000 });
    let current = "";
    for (const line of String(result.stdout || "").split("\n")) {
      if (line.startsWith("/")) { current = line.replace(/:$/, ""); dimensions.set(current, { width: "", height: "" }); }
      else if (current && line.includes("pixelWidth:")) dimensions.get(current)!.width = line.split(":").pop()!.trim().replace("<nil>", "");
      else if (current && line.includes("pixelHeight:")) dimensions.get(current)!.height = line.split(":").pop()!.trim().replace("<nil>", "");
    }
  }
  return dimensions;
}

fs.mkdirSync(outputDir, { recursive: true });
const files = walk(mediaRoot).filter((file) => supported.has(path.extname(file).toLowerCase()) && !ignoredNames.has(path.basename(file)));
const dimensions = probeDimensions(files.filter((file) => imageExts.has(path.extname(file).toLowerCase())));
const manifestSources = new Map<string, { entityId: string; role: string; target: string; alt: string; verification: string }>();
for (const [entityId, entry] of Object.entries(entityMediaManifest)) {
  for (const item of [entry.hero, ...(entry.gallery || [])]) manifestSources.set(path.basename(item.src).toLowerCase(), { entityId, role: item.role, target: item.src, alt: item.alt, verification: item.verificationStatus });
}

const inventory = files.map((file) => {
  const stat = fs.statSync(file); const ext = path.extname(file).toLowerCase(); const dim = dimensions.get(file); const match = manifestSources.get(path.basename(file).toLowerCase());
  const width = Number(dim?.width || 0); const height = Number(dim?.height || 0);
  const practical = !imageExts.has(ext) || (width >= 320 && height >= 200);
  const suspicious = /screenshot|screen shot|thumbnail|thumb|watermark/i.test(path.basename(file));
  return {
    file_name: path.basename(file), absolute_path: file, relative_target_path: match?.target || "", extension: ext.slice(1), width: dim?.width || "", height: dim?.height || "",
    aspect_ratio: width && height ? (width / height).toFixed(3) : "", file_size: stat.size, inferred_entity: match?.entityId || slug(path.basename(file)),
    inferred_category: path.basename(path.dirname(file)), inferred_district: "", inferred_panel_role: match?.role || "manual_review_required", duplicate_group: `${stat.size}-${slug(path.basename(file)).slice(0, 32)}`,
    quality_status: suspicious ? "rejected_ui_or_thumbnail" : practical ? "usable_dimensions" : "too_small", rights_status: match ? "user_supplied_for_project" : "manual_review_required",
    recommended_use: match ? match.role : "manual_review_required", notes: match ? `Verified manifest match for ${match.entityId}` : "Identity and usage rights require review before assignment",
  };
});
fs.writeFileSync(path.join(outputDir, "perks-media-inventory.csv"), csv(inventory, ["file_name","absolute_path","relative_target_path","extension","width","height","aspect_ratio","file_size","inferred_entity","inferred_category","inferred_district","inferred_panel_role","duplicate_group","quality_status","rights_status","recommended_use","notes"]));

const collectionRows = mapCollections.flatMap((collection) => collection.stopIds.map((entityId, index) => ({ route_url: `/map?mode=resident&tab=map&collection=${collection.id}`, route_name: collection.title, collection_id: collection.id, panel_type: "walking_route_stop", entity_id: entityId, stop_order: index + 1, current_image: entityMediaManifest[entityId]?.hero.src || "resolver", current_copy_source: "src/data/mapCollections.ts", expected_entity: collection.stopHints[index] || entityId, expected_media_role: "route_stop", current_status: entityMediaManifest[entityId] ? "verified" : "resolver_review", correction_required: entityMediaManifest[entityId] ? "no" : "manual_review", notes: "" })));
const discoveryRows = downtownDiscoveryRoutes.map((route) => ({ route_url: `/map?mode=resident&tab=map&collection=${route.id}`, route_name: route.title, collection_id: route.id, panel_type: "discovery_route", entity_id: "", stop_order: "", current_image: entityMediaManifest[route.id]?.hero.src || "resolver", current_copy_source: "src/data/civicDiscoveryNetwork.js", expected_entity: route.partner, expected_media_role: "route_cover", current_status: "audited", correction_required: entityMediaManifest[route.id] ? "no" : "manual_review", notes: "Route has no explicit stop IDs in this registry" }));
const activationRows = brandActivationRoutes.flatMap((route) => route.stopPinIds.map((entityId, index) => ({ route_url: `/map?mode=partner&tab=map&intent=activation&collection=${route.routeId}`, route_name: route.routeName, collection_id: route.routeId, panel_type: "brand_activation_route_stop", entity_id: entityId, stop_order: index + 1, current_image: entityMediaManifest[entityId]?.hero.src || "resolver", current_copy_source: "src/data/brandActivationIntelligence.js", expected_entity: entityId, expected_media_role: "route_stop", current_status: entityMediaManifest[entityId] ? "verified" : "resolver_review", correction_required: entityMediaManifest[entityId] ? "no" : "manual_review", notes: "" })));
const routeRows = [...collectionRows, ...discoveryRows, ...activationRows];
fs.writeFileSync(path.join(outputDir, "route-surface-inventory.csv"), csv(routeRows, ["route_url","route_name","collection_id","panel_type","entity_id","stop_order","current_image","current_copy_source","expected_entity","expected_media_role","current_status","correction_required","notes"]));

const sourceFiles = walk(path.join(repo, "src")).filter((file) => /\.(js|jsx|ts|tsx|css|json)$/.test(file));
const placeholderPattern = /(austonian_lobby|commercial_street_level|partner_hotel_rooftop|partner_dining_patio|partner_coffee_shop|partner_wellness|downtown_art_walk|moody_theater_live_music|generic|placeholder)/i;
const placeholderRows: Record<string, unknown>[] = [];
for (const file of sourceFiles) String(fs.readFileSync(file, "utf8")).split("\n").forEach((line, index) => { if (placeholderPattern.test(line) && /images?\//i.test(line)) placeholderRows.push({ file: path.relative(repo, file), line: index + 1, reference: line.trim().slice(0, 500), intended_entity: "manual_review_required", replacement: "", status: "manual_review_required", notes: "Named or generic fallback reference; retain only when entity-specific media is unavailable" }); });
fs.writeFileSync(path.join(outputDir, "placeholder-removal-report.csv"), csv(placeholderRows, ["file","line","reference","intended_entity","replacement","status","notes"]));

const mismatchRows = placeholderRows.map((row) => ({ surface: row.file, route: "", entity_id: row.intended_entity, title: "", panel_mode: "resident_and_partner", current_image: row.reference, expected_image: "entity manifest or neutral category fallback", current_copy: "", mismatch_type: "placeholder_or_named_fallback", severity: "review", fix_applied: "no", manual_review: "yes", notes: row.notes }));
fs.writeFileSync(path.join(outputDir, "panel-copy-image-mismatch-report.csv"), csv(mismatchRows, ["surface","route","entity_id","title","panel_mode","current_image","expected_image","current_copy","mismatch_type","severity","fix_applied","manual_review","notes"]));

const altRows = Object.entries(entityMediaManifest).flatMap(([entityId, entry]) => [entry.hero, ...(entry.gallery || [])].map((item) => ({ entity_id: entityId, image_path: item.src, media_role: item.role, alt_text: item.alt, decorative: "false", verification_status: item.verificationStatus })));
fs.writeFileSync(path.join(outputDir, "media-alt-text.csv"), csv(altRows, ["entity_id","image_path","media_role","alt_text","decorative","verification_status"]));
const manualRows = inventory.filter((row) => row.recommended_use === "manual_review_required").map((row) => ({ asset_path: row.absolute_path, inferred_entity: row.inferred_entity, reason: row.notes, confidence: "below_90_percent", next_action: "Confirm identity, role, rights and crop before manifest assignment" }));
fs.writeFileSync(path.join(outputDir, "manual-review-required.csv"), csv(manualRows, ["asset_path","inferred_entity","reason","confidence","next_action"]));

const manifestItems = Object.entries(entityMediaManifest).flatMap(([entityId, entry]) => [entry.hero, ...(entry.gallery || [])].map((item) => ({ entityId, item })));
fs.writeFileSync(path.join(outputDir, "media-change-log.md"), `# Media reconciliation change log\n\n${manifestItems.map(({ entityId, item }) => `- ${entityId}: manifest resolves ${item.role} to \`${item.src}\` (${item.verificationStatus}). Copy remains mode-specific at the canonical entity source.`).join("\n")}\n`);
const publicRoutes = [...String(fs.readFileSync(path.join(repo, "src/App.jsx"), "utf8")).matchAll(/<Route(?:\s|\n)+path="([^"]+)"/g)].map((match) => match[1]);
fs.writeFileSync(path.join(outputDir, "final-route-qa.md"), `# Final route QA\n\n- Public and workspace route declarations inventoried: ${publicRoutes.length}\n- Canonical collections audited: ${mapCollections.length}\n- Additional discovery routes audited: ${downtownDiscoveryRoutes.length}\n- Brand activation routes audited: ${brandActivationRoutes.length}\n- Route-stop rows audited: ${routeRows.length}\n- Candidate media assets inventoried: ${inventory.length}\n- Verified manifest media assignments: ${manifestItems.filter(({ item }) => item.verificationStatus === "verified").length}\n- Manual-review assets: ${manualRows.length}\n- Placeholder references requiring review: ${placeholderRows.length}\n\nBuild, automated tests, responsive browser checks, Git alignment, deployment, and canonical-domain verification are recorded in the release handoff after this report is generated.\n`);
console.log(JSON.stringify({ publicRoutes: publicRoutes.length, collections: mapCollections.length, discoveryRoutes: downtownDiscoveryRoutes.length, activationRoutes: brandActivationRoutes.length, routeRows: routeRows.length, assets: inventory.length, manifestAssignments: manifestItems.length, manualReview: manualRows.length, placeholderReferences: placeholderRows.length }, null, 2));
