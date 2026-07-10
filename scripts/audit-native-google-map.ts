import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const DOCS_DIR = path.join(ROOT, "docs");

const REQUIRED_SERVICE_FILES = [
  "MapProvider.ts",
  "MapController.ts",
  "CameraController.ts",
  "MarkerManager.ts",
  "RouteManager.ts",
  "DistrictManager.ts",
  "CollectionManager.ts",
  "CampaignManager.ts",
  "BrandManager.ts",
  "PlacesService.ts",
  "SearchIntentEngine.ts",
];

const FORBIDDEN_PATTERNS = [
  /<iframe\b/i,
  /google\.com\/maps\/embed/i,
  /maps\.app\.goo\.gl/i,
  /\/maps\/embed/i,
  /Embedded\s+Directions/i,
  /Embedded\s+Place/i,
];

function walkFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".git"].includes(entry.name)) return [];
      return walkFiles(filePath);
    }
    if (!/\.(js|jsx|ts|tsx|html|css|md)$/.test(entry.name)) return [];
    return [filePath];
  });
}

function read(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

const files = [path.join(ROOT, "index.html"), ...walkFiles(SRC_DIR)].filter((filePath) => fs.existsSync(filePath));
const forbiddenMatches = files.flatMap((filePath) => {
  const source = read(filePath);
  return FORBIDDEN_PATTERNS
    .filter((pattern) => pattern.test(source))
    .map((pattern) => ({
      file: path.relative(ROOT, filePath),
      pattern: String(pattern),
    }));
});

const mapPage = read(path.join(SRC_DIR, "pages/Map.jsx"));
const serviceFiles = REQUIRED_SERVICE_FILES.map((fileName) => {
  const filePath = path.join(SRC_DIR, "map", fileName);
  return {
    file: `src/map/${fileName}`,
    exists: fs.existsSync(filePath),
  };
});

const checks = {
  generatedAt: new Date().toISOString(),
  forbiddenEmbeds: forbiddenMatches,
  serviceFiles,
  activeMapPage: {
    usesGoogleMapsLoader: /loadGoogleMaps\(/.test(mapPage),
    createsNativeGoogleMapThroughService: /createDowntownGoogleMap\(/.test(mapPage),
    usesAdvancedMarkersThroughService: /createDowntownMarker\(/.test(mapPage) && /AdvancedMarkerElement/.test(read(path.join(SRC_DIR, "map/MarkerManager.ts"))),
    drawsCustomPolylinesThroughService: /createBrandedRoutePolylines\(/.test(mapPage),
    disablesDefaultGoogleUi: /disableDefaultUI:\s*true/.test(read(path.join(SRC_DIR, "map/MapProvider.ts"))) || /disableDefaultUI:\s*true/.test(mapPage),
    usesMapIdOrInlineStyleFallback: /mapId/.test(mapPage) && /getInlineGoogleMapStyles/.test(mapPage),
    hasNoReactLeafletImport: !/react-leaflet/.test(mapPage),
    hasNoLeafletNamespace: !/\bL\./.test(mapPage),
  },
};

const failed = [
  ...checks.forbiddenEmbeds.map((match) => `Forbidden embed pattern ${match.pattern} in ${match.file}`),
  ...checks.serviceFiles.filter((file) => !file.exists).map((file) => `Missing service file ${file.file}`),
  ...Object.entries(checks.activeMapPage).filter(([, value]) => !value).map(([key]) => `Map page check failed: ${key}`),
];

fs.mkdirSync(DOCS_DIR, { recursive: true });
fs.writeFileSync(path.join(DOCS_DIR, "native-google-map-audit.json"), `${JSON.stringify(checks, null, 2)}\n`);
fs.writeFileSync(path.join(DOCS_DIR, "native-google-map-audit.md"), `# Native Google Map Audit

Generated: ${checks.generatedAt}

## Result

${failed.length ? `Failed checks: ${failed.length}` : "All checks passed."}

## Service Layer

${checks.serviceFiles.map((file) => `- ${file.exists ? "PASS" : "FAIL"} ${file.file}`).join("\n")}

## Active Map Page

${Object.entries(checks.activeMapPage).map(([key, value]) => `- ${value ? "PASS" : "FAIL"} ${key}`).join("\n")}

## Forbidden Embeds

${checks.forbiddenEmbeds.length ? checks.forbiddenEmbeds.map((match) => `- ${match.file}: ${match.pattern}`).join("\n") : "- None found."}
`);

if (failed.length) {
  console.error(failed.join("\n"));
  process.exit(1);
}

console.log("Native Google Map audit passed.");
