import { chromium, expect } from "@playwright/test";
import {
  PRIMARY_SEARCH_INTENT_RAIL,
  SECONDARY_SEARCH_INTENT_RAIL,
  getSearchIntentDefinition,
} from "../src/components/map/searchIntentRailConfig";

const baseUrl = process.env.BASE_URL || "http://localhost:5173";
const route = `${baseUrl.replace(/\/$/, "")}/map?mode=resident&tab=map&filter=All`;
const partnerRoute = `${baseUrl.replace(/\/$/, "")}/map?mode=partner&tab=map&filter=All`;
const screenshotDir = "/private/tmp/search-intent-chips";

function assertRegisteredIntentDefinitions() {
  const registered = [...PRIMARY_SEARCH_INTENT_RAIL, ...SECONDARY_SEARCH_INTENT_RAIL];
  const missing = registered
    .map((item) => ({ item, definition: getSearchIntentDefinition(item) }))
    .filter(({ definition }) => !definition.fullLabel || !definition.description);

  if (missing.length) {
    throw new Error(`Missing search intent definition copy: ${missing.map(({ item }) => item.id).join(", ")}`);
  }
}

async function ensureConsole(page) {
  const console = page.locator(".dp-search-intent-console").first();
  await console.waitFor({ state: "attached", timeout: 15_000 });
  const hidden = await console.getAttribute("aria-hidden");
  if (hidden === "true") {
    await page.locator(".dp-search-intent-rollup").first().click({ force: true });
  }
  await expect(console).toBeVisible({ timeout: 10_000 });
}

async function chip(page, id: string) {
  if (id === "more") return page.locator(`.dp-search-more-toggle[data-intent-id="more"]:visible`).first();
  return page.locator(`.dp-compact-intent-chip[data-intent-id="${id}"]:visible`).first();
}

async function runDesktopChecks(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(route, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await ensureConsole(page);

  const coffee = await chip(page, "coffee");
  const dining = await chip(page, "dining");
  const more = await chip(page, "more");
  const initialUrl = page.url();
  const primaryOrder = await page.locator(".dp-search-intent-primary-rail [data-intent-id]").evaluateAll((items) => items.map((item) => item.getAttribute("data-intent-id")));
  expect(primaryOrder.at(-1)).toBe("more");
  const primaryIcons = await page.locator(".dp-search-intent-primary-rail .dp-search-intent-filter-icon").evaluateAll((items) => items.map((item) => Array.from(item.classList).find((name) => name.startsWith("lucide-") && name !== "lucide") || ""));
  expect(new Set(primaryIcons).size).toBe(primaryIcons.length);

  await expect(coffee).toHaveAttribute("data-expanded", "false");
  await coffee.hover();
  await expect(coffee).toHaveAttribute("data-expanded", "false");
  if (page.url() !== initialUrl) {
    throw new Error("Hovering Coffee changed the map URL before selection.");
  }

  await coffee.click();
  await expect(page.getByRole("textbox", { name: "Ask the Map search" })).toHaveValue("Coffee nearby");
  await expect(page.locator(".dp-platform-search-group button").first()).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(coffee).toBeVisible();

  await dining.click();
  await expect(page.getByRole("textbox", { name: "Ask the Map search" })).toHaveValue("Dining nearby");
  await page.waitForTimeout(750);
  await page.screenshot({ path: `${screenshotDir}/desktop-1440-search-intents.png`, fullPage: false });
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(more).toBeVisible();

  await page.locator('[data-intent-id="events"]').first().focus();
  await expect(await chip(page, "events")).toHaveAttribute("data-expanded", "false");
  await page.keyboard.press("Escape");
  await expect(await chip(page, "events")).toHaveAttribute("data-expanded", "false", { timeout: 5_000 });

  await more.click({ force: true });
  await expect(more).toHaveAttribute("aria-expanded", "true", { timeout: 5_000 });
  await expect(page.locator("#dp-search-secondary-intent-rail")).toBeVisible();
  expect(await page.locator("#dp-search-secondary-intent-rail [data-intent-id]").count()).toBeGreaterThan(10);
  if (/filter=More/.test(page.url())) {
    throw new Error("More applied a fake filter=More instead of opening the intent panel.");
  }

  await page.close();
}

async function runMobileChecks(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(route, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await ensureConsole(page);

  const coffee = await chip(page, "coffee");
  const railBox = await page.locator(".dp-search-intent-prompt-rail").first().boundingBox();
  const viewport = page.viewportSize();
  if (!railBox || !viewport || railBox.x < -1 || railBox.x + railBox.width > viewport.width + 1) {
    throw new Error("Mobile search intent rail overflows the viewport.");
  }
  await coffee.tap();
  await expect(page.getByRole("textbox", { name: "Ask the Map search" })).toHaveValue("Coffee nearby");

  await page.screenshot({ path: `${screenshotDir}/mobile-390-search-intents.png`, fullPage: false });
  await page.close();
}

async function runPartnerChecks(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(partnerRoute, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await ensureConsole(page);

  const more = await chip(page, "more");
  await more.click({ force: true });
  await expect(more).toHaveAttribute("aria-expanded", "true", { timeout: 5_000 });
  const partnerIntentIds = await page.locator("#dp-search-more-filter-panel [data-intent-id]").evaluateAll((items) => items.map((item) => item.getAttribute("data-intent-id")));
  for (const requiredIntent of ["campaigns", "performance", "parking", "audience", "properties"]) {
    expect(partnerIntentIds).toContain(requiredIntent);
  }
  expect(new Set(partnerIntentIds).size).toBe(partnerIntentIds.length);
  expect(new URL(page.url()).searchParams.get("filter")).toBe("All");
  expect(new URL(page.url()).searchParams.get("intent")).toBeNull();

  await page.close();
}

async function main() {
  assertRegisteredIntentDefinitions();
  const browser = await chromium.launch({ headless: true });
  try {
    await runDesktopChecks(browser);
    await runMobileChecks(browser);
    await runPartnerChecks(browser);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
