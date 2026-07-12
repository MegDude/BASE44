import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
const errors = [];

page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && !/Failed to load resource|api\/apps\/public/.test(message.text())) errors.push(message.text());
});

await page.addInitScript(() => {
  localStorage.setItem("dp_partner_workspace:activation", JSON.stringify({
    id: "native-mobile-qa",
    organizationName: "The Independent",
    partnerType: "Property",
    plan: "Resident Plus",
    modules: ["map", "offers", "events", "campaigns", "audience", "reports"],
    status: "active",
    checklist: [],
  }));
});

await page.goto(`${baseUrl}/partner-workspace/overview?provisioned=1`, { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForSelector(".dp-partner-native-tabs", { state: "visible", timeout: 15_000 });

const labels = await page.locator(".dp-partner-native-tabs a").allTextContents();
if (labels.map((label) => label.trim()).join("|") !== "Home|Publish|Map|Insights|Workspace") {
  throw new Error(`Unexpected partner tabs: ${labels.join(", ")}`);
}

const viewport = page.viewportSize();
const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
if (!viewport || bodyWidth > viewport.width) throw new Error(`Horizontal overflow: ${bodyWidth}px for ${viewport?.width}px viewport`);

await page.getByRole("tab", { name: "Publish" }).tap();
await page.waitForURL(/partner-workspace\/offers/);
await page.goto(`${baseUrl}/partner-workspace/offers?intent=new`, { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForSelector(".dp-native-publisher", { state: "visible", timeout: 10_000 });
await page.getByLabel("Perk title").fill("Friday resident dinner");
await page.getByLabel("Short description").fill("A useful Friday offer for nearby residents.");
await page.getByLabel(/Offer value/).fill("15% off dinner");
await page.getByRole("button", { name: "Continue" }).tap();
await page.getByLabel("Who can use this?").selectOption("card_holders");
await page.getByRole("button", { name: "Continue" }).tap();
await page.getByLabel("Location").fill("The Independent");
await page.getByRole("button", { name: "Continue" }).tap();
await page.getByLabel("Resident perk preview").waitFor({ state: "visible" });

const tabBox = await page.locator(".dp-partner-native-tabs").boundingBox();
if (!tabBox || !viewport || tabBox.y + tabBox.height > viewport.height + 1) throw new Error("Partner tab bar exceeds the mobile viewport.");
if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);

console.log("partner native mobile: five tabs, no overflow, perk flow reaches resident preview");
await browser.close();
