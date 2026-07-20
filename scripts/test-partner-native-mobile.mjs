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
await page.waitForSelector(".dp-native-mobile-dashboard", { state: "visible", timeout: 15_000 });

const mobileOverview = await page.evaluate(() => {
  const dashboard = document.querySelector(".dp-native-mobile-dashboard");
  const attention = document.querySelector(".dp-native-mobile-attention");
  const standard = document.querySelector(".dp-standard-workspace-overview");
  const brand = document.querySelector(".dp-partner-workspace-brand");
  const search = document.querySelector(".dp-partner-workspace-search");
  const visibleSearchControls = [...document.querySelectorAll('[aria-label="Search Downtown Perks"]')].filter((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  });
  const brandRect = brand?.getBoundingClientRect();
  const searchRect = search?.getBoundingClientRect();
  return {
    hero: dashboard?.querySelector("h1")?.textContent?.trim(),
    kpis: dashboard?.querySelectorAll(".dp-native-mobile-kpi-rail article").length || 0,
    actions: dashboard?.querySelectorAll(".dp-native-mobile-actions a").length || 0,
    attentionLinks: attention?.querySelectorAll(":scope > a").length || 0,
    attentionRadius: attention ? getComputedStyle(attention).borderRadius : "",
    standardVisible: standard ? getComputedStyle(standard).display !== "none" : false,
    visibleSearchControls: visibleSearchControls.length,
    searchText: search?.textContent?.trim(),
    searchBorder: search ? getComputedStyle(search).borderStyle : "",
    searchIconColor: search?.querySelector("svg") ? getComputedStyle(search.querySelector("svg")).color : "",
    headerAlignmentDelta: brandRect && searchRect ? Math.abs((brandRect.top + brandRect.height / 2) - (searchRect.top + searchRect.height / 2)) : Infinity,
  };
});

if (!mobileOverview.hero) throw new Error("Mobile workspace hero is missing its organization name.");
if (mobileOverview.kpis !== 3) throw new Error(`Expected 3 mobile KPIs, found ${mobileOverview.kpis}.`);
if (mobileOverview.actions !== 6) throw new Error(`Expected 6 mobile quick actions, found ${mobileOverview.actions}.`);
if (mobileOverview.attentionLinks !== 1) throw new Error("The attention card must have exactly one action.");
if (mobileOverview.attentionRadius !== "20px") throw new Error(`Unexpected mobile card radius: ${mobileOverview.attentionRadius}.`);
if (mobileOverview.standardVisible) throw new Error("Desktop overview remains visible on the mobile dashboard.");
if (mobileOverview.visibleSearchControls !== 1) throw new Error(`Expected one visible workspace search control, found ${mobileOverview.visibleSearchControls}.`);
if (mobileOverview.searchText !== "Search Downtown Perks") throw new Error(`Unexpected workspace search label: ${mobileOverview.searchText}.`);
if (mobileOverview.searchBorder !== "none") throw new Error(`Workspace search retained a ${mobileOverview.searchBorder} border.`);
if (mobileOverview.searchIconColor !== "rgb(200, 169, 106)") throw new Error(`Workspace search icon is not gold: ${mobileOverview.searchIconColor}.`);
if (mobileOverview.headerAlignmentDelta > 2) throw new Error(`Workspace brand and search are misaligned by ${mobileOverview.headerAlignmentDelta}px.`);

const labels = await page.locator(".dp-partner-native-tabs :is(a, button)").allTextContents();
if (labels.map((label) => label.trim()).join("|") !== "Home|Map|Publish|Performance|Workspace") {
  throw new Error(`Unexpected partner tabs: ${labels.join(", ")}`);
}

const workspaceSwitcher = page.getByRole("button", { name: /Switch workspace\. Current workspace:/ });
await workspaceSwitcher.waitFor({ state: "visible" });
await workspaceSwitcher.tap();
await page.getByRole("dialog", { name: "Switch workspace" }).waitFor({ state: "visible" });
await page.getByRole("button", { name: "Close Switch workspace" }).tap();

const viewport = page.viewportSize();
const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
if (!viewport || bodyWidth > viewport.width) throw new Error(`Horizontal overflow: ${bodyWidth}px for ${viewport?.width}px viewport`);

await page.getByRole("tab", { name: "Publish" }).tap();
await page.waitForFunction(() => /\/partner-workspace\/(publish|offers)/.test(window.location.pathname));
await page.getByRole("button", { name: /Switch workspace\. Current workspace:/ }).first().waitFor({ state: "visible" });
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

console.log("partner native mobile: decision dashboard, five tabs, persistent workspace switcher, no overflow, and perk preview verified");
await browser.close();
