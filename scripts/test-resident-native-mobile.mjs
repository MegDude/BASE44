import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
const errors = [];

page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && !/Failed to load resource|api\/apps\/public|Google Maps/.test(message.text())) errors.push(message.text());
});

await page.goto(`${baseUrl}/resident/home`, { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForSelector(".dp-resident-native-tabs", { state: "visible", timeout: 15_000 });

const labels = await page.locator(".dp-resident-native-tabs :is(a,button)").allTextContents();
if (labels.map((label) => label.trim()).join("|") !== "Map|Perks|Events|Card|Profile") {
  throw new Error(`Unexpected resident tabs: ${labels.join(", ")}`);
}

if (await page.locator("nav").filter({ hasNot: page.locator(".dp-resident-native-tabs") }).count()) {
  const visibleForeignNav = await page.locator("nav:not(.dp-resident-native-tabs):visible").count();
  if (visibleForeignNav) throw new Error("Resident Home shows non-native website navigation.");
}

await page.getByRole("heading", { name: "What feels right downtown?" }).waitFor();
await page.getByRole("heading", { name: "Live activity", exact: true }).waitFor();

const viewport = page.viewportSize();
const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
if (!viewport || bodyWidth > viewport.width) throw new Error(`Horizontal overflow: ${bodyWidth}px for ${viewport?.width}px viewport`);

const tabGeometry = await page.locator(".dp-resident-native-tabs").evaluate((element) => {
  const style = getComputedStyle(element);
  return { position: style.position, bottom: style.bottom, boxSizing: style.boxSizing };
});
if (tabGeometry.position !== "fixed" || tabGeometry.bottom !== "0px" || tabGeometry.boxSizing !== "border-box") {
  throw new Error(`Resident tab bar is not safely anchored: ${JSON.stringify(tabGeometry)}`);
}

const coffeeHref = await page.getByRole("link", { name: "Coffee", exact: true }).getAttribute("href");
if (coffeeHref !== "/map?mode=resident&tab=map&filter=Coffee") throw new Error(`Unexpected Coffee route: ${coffeeHref}`);
await page.goto(`${baseUrl}${coffeeHref}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForURL((url) => url.pathname === "/map" && url.searchParams.get("filter") === "Coffee", { timeout: 15_000 });

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
console.log("resident native mobile: five tabs, calm Home, no overflow, Coffee opens canonical map intent");
await browser.close();
