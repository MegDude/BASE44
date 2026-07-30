import { chromium } from "playwright";
import { readFile } from "node:fs/promises";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const routeManagerSource = await readFile(new URL("../src/map/RouteManager.ts", import.meta.url), "utf8");
const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
if (!/DirectionsService/.test(routeManagerSource) || !/TravelMode\?\.WALKING/.test(routeManagerSource)) {
  throw new Error("Walking routes are not resolved through Google walking directions");
}
if (!/requestWalkingRoutePath\(maps, collectionRoute\.stops\)/.test(mapSource)) {
  throw new Error("Map route rendering does not request the road-aware walking path");
}
const routeIds = [
  "waterloo-greenway",
  "daa-art-walk",
  "warehouse-district-happy-hour",
  "downtown-stories-walk",
  "inkind-dining-market",
  "coffee-before-work",
  "hotel-guest-arrival-route",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
const errors = [];

page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && !/Failed to load resource|api\/apps\/public|maps\.googleapis/.test(message.text())) {
    errors.push(message.text());
  }
});

for (const routeId of routeIds) {
  await page.goto(`${baseUrl}/map?mode=resident&tab=map&routeId=${routeId}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.locator(".dp-route-experience-sheet").waitFor({ state: "visible", timeout: 15_000 });

  if (await page.locator(".dp-collection-route-panel").count()) {
    throw new Error(`${routeId}: legacy route panel rendered`);
  }

  const viewport = page.viewportSize();
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  if (!viewport || documentWidth > viewport.width) {
    throw new Error(`${routeId}: horizontal overflow ${documentWidth}px for ${viewport?.width}px viewport`);
  }
}

await page.goto(`${baseUrl}/map?mode=resident&tab=map&routeId=waterloo-greenway`, {
  waitUntil: "domcontentloaded",
  timeout: 30_000,
});
await page.locator(".dp-route-experience-sheet").waitFor({ state: "visible", timeout: 15_000 });

const waterlooStops = page.locator(".dp-route-stop-list > li > button");
const waterlooStopCount = await waterlooStops.count();
if (waterlooStopCount !== 6) throw new Error(`Waterloo: expected 6 stops, found ${waterlooStopCount}`);

const routeGeometry = await page.locator(".dp-route-experience-sheet").evaluate((sheet) => {
  const contentViewport = sheet.querySelector(".dp-native-drawer-content-viewport");
  const footer = sheet.querySelector(".dp-native-drawer-actions");
  const primaryAction = sheet.querySelector(".dp-route-primary-action");
  return {
    sheet: sheet.getBoundingClientRect().toJSON(),
    content: contentViewport?.getBoundingClientRect().toJSON(),
    footer: footer?.getBoundingClientRect().toJSON(),
    primaryAction: primaryAction?.getBoundingClientRect().toJSON(),
    viewportHeight: innerHeight,
    nav: document.querySelector("[data-dp-bottom-navigation='true']")?.getBoundingClientRect().toJSON(),
    inlineGeometry: ["inset", "top", "right", "bottom", "left", "padding"].some((property) => sheet.style.getPropertyValue(property)),
  };
});
if (routeGeometry.inlineGeometry) throw new Error("Waterloo: route sheet still owns geometry through inline styles");
if (Math.abs(routeGeometry.sheet.bottom - routeGeometry.viewportHeight) > 1) throw new Error("Waterloo: route sheet does not reach the viewport bottom");
if (!routeGeometry.nav || routeGeometry.content.bottom > routeGeometry.nav.top + 1) throw new Error("Waterloo: route content overlaps bottom navigation");
if (!routeGeometry.footer || routeGeometry.footer.height > 60) throw new Error("Waterloo: route action footer is too tall");
if (!routeGeometry.content || routeGeometry.content.bottom > routeGeometry.footer.top + 1) throw new Error("Waterloo: route content is hidden behind the action footer");
if (!routeGeometry.primaryAction || routeGeometry.primaryAction.width > 281) throw new Error("Waterloo: route primary action is too wide");

await page.getByRole("button", { name: "Minimise route to show map" }).tap();
await page.locator(".dp-route-experience-sheet[data-drawer-state='peek']").waitFor({ state: "visible", timeout: 5_000 });
await page.getByRole("button", { name: "Show route stops" }).tap();
await page.locator(".dp-route-experience-sheet[data-drawer-state='medium']").waitFor({ state: "visible", timeout: 5_000 });

await page.locator(".dp-route-primary-action").tap();
await page.waitForURL(/routeState=active/);
const activeUrl = new URL(page.url());
if (activeUrl.searchParams.get("routeId") !== "waterloo-greenway") throw new Error("Waterloo: canonical routeId was lost");
if (activeUrl.searchParams.get("stopId") !== "waterloo-park") throw new Error("Waterloo: first physical stop was not selected");
if (await page.locator(".dp-route-stop-list > li > button[aria-current='step']").count() !== 1) throw new Error("Waterloo: active route row is not synchronized");

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);

console.log(`route experiences: ${routeIds.length} shared routes, Waterloo 6-stop start state, canonical URL, no legacy panel or overflow`);
await browser.close();
