import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
const errors = [];

await page.addInitScript(() => {
  window.localStorage.setItem("dp_resident_access:current", JSON.stringify({
    id: "resident-native-qa",
    fullName: "Sarah Austin",
    email: "sarah@example.com",
    phone: "512-555-0142",
    buildingName: "The Shore",
    buildingDistrict: "Rainey",
    unitNumber: "1204",
    verificationStatus: "verified",
    membershipSource: "free_building",
    moveInDate: "2026-06-01",
    profileCompletion: 92,
    interests: ["dining", "music", "outdoors"],
    notifications: { email: true, sms: false, push: true },
    joinedAt: "2026-06-03",
    personalizedMap: true,
    savedCount: 4,
  }));
});

page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && !/Failed to load resource|api\/apps\/public|Google Maps/.test(message.text())) errors.push(message.text());
});

await page.goto(`${baseUrl}/resident/home`, { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForSelector(".dp-resident-native-tabs", { state: "visible", timeout: 15_000 });

const labels = await page.locator(".dp-resident-native-tabs :is(a,button)").allTextContents();
if (labels.map((label) => label.trim()).join("|") !== "Home|Map|Perks|Events|Card") {
  throw new Error(`Unexpected resident tabs: ${labels.join(", ")}`);
}

if (await page.locator("nav").filter({ hasNot: page.locator(".dp-resident-native-tabs") }).count()) {
  const visibleForeignNav = await page.locator("nav:not(.dp-resident-native-tabs):visible").count();
  if (visibleForeignNav) throw new Error("Resident Home shows non-native website navigation.");
}

await page.getByRole("heading", { name: "What feels right downtown?" }).waitFor();
await page.getByRole("heading", { name: "Live activity", exact: true }).waitFor();
if (await page.locator(".dp-product-shell-search-button").count()) {
  throw new Error("Resident Home renders the global shell search over its native header.");
}

await page.getByRole("button", { name: "Open resident profile" }).click();
await page.waitForURL((url) => url.pathname === "/resident/home" && url.searchParams.get("panel") === "profile");
await page.getByRole("button", { name: "Back to resident home" }).waitFor();

for (const panel of ["profile", "perks", "card"]) {
  await page.goto(`${baseUrl}/resident/home?panel=${panel}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.getByRole("button", { name: "Back to resident home" }).waitFor();
  const surface = await page.locator(".dp-resident-home__panel").evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, border: style.borderTopWidth, shadow: style.boxShadow };
  });
  if (surface.background !== "rgb(255, 255, 255)" || surface.border !== "0px" || surface.shadow !== "none") {
    throw new Error(`${panel} panel is not on the shared white native surface: ${JSON.stringify(surface)}`);
  }
}

await page.goto(`${baseUrl}/resident/home`, { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.getByRole("heading", { name: "What feels right downtown?" }).waitFor();

await page.locator(".dp-resident-native-tabs").getByRole("tab", { name: "Card" }).click();
await page.getByRole("heading", { name: "Everything connected to your card." }).waitFor();
for (const section of ["Contact", "Home", "Membership", "Preferences"]) {
  await page.getByRole("heading", { name: section, exact: true }).waitFor();
}
await page.getByText("The Shore", { exact: true }).waitFor();
await page.getByText("Included by your building", { exact: true }).waitFor();
await page.getByText("Dining, Music, Outdoors", { exact: true }).waitFor();

const cardSurface = await page.locator(".dp-resident-card-panel").evaluate((element) => {
  const style = getComputedStyle(element);
  const parentBackground = element.parentElement ? getComputedStyle(element.parentElement).backgroundColor : "";
  return { background: style.backgroundColor, parentBackground, borderRadius: style.borderRadius, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
});
const isWhiteSurface = cardSurface.background === "rgb(255, 255, 255)"
  || (cardSurface.background === "rgba(0, 0, 0, 0)" && cardSurface.parentBackground === "rgb(255, 255, 255)");
if (!isWhiteSurface || cardSurface.borderRadius !== "0px" || cardSurface.scrollWidth > cardSurface.clientWidth) {
  throw new Error(`Resident card surface is not bright, sharp, and contained: ${JSON.stringify(cardSurface)}`);
}

const updateDetails = page.getByRole("link", { name: "Update details" });
const actionStyle = await updateDetails.evaluate((element) => {
  const style = getComputedStyle(element);
  return { textTransform: style.textTransform, fontSize: style.fontSize, borderRadius: style.borderRadius };
});
if (actionStyle.textTransform !== "uppercase" || actionStyle.fontSize !== "10px" || actionStyle.borderRadius !== "0px") {
  throw new Error(`Resident text action is not compact and sharp: ${JSON.stringify(actionStyle)}`);
}
await updateDetails.hover();
await page.waitForTimeout(250);
const hoverColor = await updateDetails.evaluate((element) => getComputedStyle(element).color);
if (hoverColor !== "rgb(154, 121, 55)") throw new Error(`Resident action hover is not gold: ${hoverColor}`);

const activeCardColor = await page.locator(".dp-resident-native-tabs").getByRole("tab", { name: "Card" }).evaluate((element) => getComputedStyle(element).color);
if (activeCardColor !== "rgb(154, 121, 55)") throw new Error(`Selected Card tab is not gold: ${activeCardColor}`);

await page.locator(".dp-resident-native-tabs").getByRole("tab", { name: "Home" }).click();
await page.getByRole("heading", { name: "What feels right downtown?" }).waitFor();

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
await page.waitForSelector(".dp-map-bottom-nav", { state: "visible", timeout: 15_000 });

const mapLabels = await page.locator(".dp-map-bottom-nav [role='tab']").allTextContents();
if (mapLabels.map((label) => label.trim()).join("|") !== "Home|Map|Perks|Events|Card") {
  throw new Error(`Unexpected resident map tabs: ${mapLabels.join(", ")}`);
}

await page.locator(".dp-map-bottom-nav").getByRole("tab", { name: "Home" }).click();
await page.waitForURL((url) => url.pathname === "/resident/home", { timeout: 15_000 });
await page.getByRole("heading", { name: "What feels right downtown?" }).waitFor();

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
console.log("resident native mobile: complete bright-white Card profile, compact gold actions, five canonical tabs, and Map returns to Home");
await browser.close();
