import { chromium } from "playwright";
import { existsSync } from "node:fs";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const localChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync(localChrome) ? localChrome : undefined);
const browser = await chromium.launch({ headless: true, executablePath });
const errors = [];

async function openPanel(route, viewport = { width: 393, height: 852 }) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (error) => errors.push(`${route}: ${error.message}`));
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const panel = page.locator("#dp-active-map-drawer");
  await panel.waitFor({ state: "visible", timeout: 15_000 });
  return { page, panel };
}

{
  const { page, panel } = await openPanel("/map?mode=resident&tab=map&filter=Perks&entityId=event-sunday-brunch-card&perkId=event-sunday-brunch-card");
  const result = await panel.evaluate((element) => ({
    panelKind: element.dataset.panelKind,
    entityType: element.dataset.entityType,
    state: element.dataset.drawerState,
    role: element.getAttribute("role"),
    modal: element.getAttribute("aria-modal"),
    eyebrow: element.querySelector(".dp-native-detail-panel__eyebrow")?.textContent?.trim(),
    title: element.querySelector(".dp-native-detail-panel__summary h2")?.textContent?.trim(),
    titles: [...element.querySelectorAll("h1,h2,h3")].filter((node) => node.textContent?.trim() === "Sunday Brunch Card").length,
    actions: [...element.querySelectorAll(".dp-native-detail-panel__actions > *")].map((node) => node.textContent?.trim()),
    locations: [...element.querySelectorAll(".dp-native-detail-panel__section")]
      .find((section) => section.querySelector("h3")?.textContent === "Participating nearby")
      ?.querySelectorAll(".dp-native-rail__item strong").length || 0,
    hero: Boolean(element.querySelector(".dp-native-detail-panel__hero")),
    hasEventLeak: /RSVP|Quick facts|Nearby before or after|About this event/i.test(element.textContent || ""),
    closeControls: element.querySelectorAll("[data-map-drawer-close='true']").length,
  }));
  if (result.panelKind !== "perk" || result.entityType !== "perk") throw new Error("Sunday Brunch is not classified as a perk");
  if (result.title !== "Sunday Brunch Card" || result.titles !== 1) throw new Error("Sunday Brunch title hierarchy is duplicated or incorrect");
  if (result.actions.join("|") !== "Save|Use perk") throw new Error(`Sunday Brunch actions are not canonical (${result.actions.join("|")})`);
  if (result.locations < 3) throw new Error("Sunday Brunch participating locations are missing");
  if (result.hero || result.hasEventLeak) throw new Error("Sunday Brunch still renders unapproved media or event modules");
  if (result.closeControls !== 1 || result.state !== "medium") throw new Error("Sunday Brunch navigation or initial state is invalid");
  if (result.role !== "region" || result.modal !== null) throw new Error("Medium detail panel must not trap the map as a modal");
  if (result.eyebrow !== "Resident perk · Available Sundays") throw new Error(`Recurring perk status is unclear (${result.eyebrow})`);
  await panel.locator(".dp-native-detail-grabber").click();
  await page.waitForTimeout(400);
  const expanded = await panel.evaluate((element) => ({ state: element.dataset.drawerState, height: element.getBoundingClientRect().height, close: Boolean(element.querySelector("[data-map-drawer-close]")?.getClientRects().length), role: element.getAttribute("role"), modal: element.getAttribute("aria-modal"), bodyOverflow: document.body.style.overflow }));
  if (expanded.state !== "full" || Math.abs(expanded.height - 852) > 1 || !expanded.close || expanded.role !== "dialog" || expanded.modal !== "true" || expanded.bodyOverflow !== "hidden") throw new Error(`Full panel state is not a contained modal (${JSON.stringify(expanded)})`);
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Sunday Brunch introduces horizontal overflow");
  await page.keyboard.press("Escape");
  await panel.waitFor({ state: "detached", timeout: 5_000 });
  if (await page.evaluate(() => document.body.style.overflow === "hidden")) throw new Error("Closing the full panel did not restore body scrolling");
  await page.close();
}

{
  const { page, panel } = await openPanel("/map?mode=resident&tab=map&filter=Events&entityId=event-morning-yoga-waterloo");
  const result = await panel.evaluate((element) => ({
    panelKind: element.dataset.panelKind,
    entityType: element.dataset.entityType,
    actions: [...element.querySelectorAll(".dp-native-detail-panel__actions > *")].map((node) => node.textContent?.trim()),
    duplicateFacts: /Quick facts|Nearby before or after/i.test(element.textContent || ""),
  }));
  if (result.panelKind !== "event" || result.entityType !== "event") throw new Error("Event panel semantics are incorrect");
  if (result.actions.join("|") !== "Save|RSVP" || result.duplicateFacts) throw new Error("Event panel action or content hierarchy regressed");
  await page.close();
}

{
  const { page, panel } = await openPanel("/map?mode=resident&tab=map&filter=Campaigns&entityId=campaign-see-austin-differently-fine-eyewear");
  const result = await panel.evaluate((element) => ({
    panelKind: element.dataset.panelKind,
    entityType: element.dataset.entityType,
    title: element.querySelector(".dp-native-detail-panel__summary h2")?.textContent?.trim(),
    actions: [...element.querySelectorAll(".dp-native-detail-panel__actions > *")].map((node) => node.textContent?.trim()),
  }));
  if (result.panelKind !== "campaign" || result.entityType !== "campaign" || result.title !== "See Austin Differently") throw new Error(`Campaign panel semantics are incorrect (${JSON.stringify(result)})`);
  if (result.actions.length !== 2) throw new Error("Campaign panel does not use the canonical two-action bar");
  await page.close();
}

{
  const { page, panel } = await openPanel("/map?mode=resident&tab=map&filter=All&entityId=44-east-ave", { width: 1440, height: 900 });
  const rect = await panel.evaluate((element) => element.getBoundingClientRect().toJSON());
  if (rect.width > 480 || rect.height > 900) throw new Error("Desktop detail panel containment regressed");
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Desktop detail panel introduces horizontal overflow");
  await page.close();
}

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
console.log("map detail system: canonical perk, event, and campaign semantics, modal states, real locations, and viewport containment verified");
