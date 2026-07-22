import { chromium } from "playwright";
import { existsSync } from "node:fs";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const localChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: existsSync(localChrome) ? localChrome : undefined });
const errors = [];

for (const viewport of [{ width: 393, height: 852 }, { width: 1440, height: 900 }]) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (error) => errors.push(`${viewport.width}: ${error.message}`));
  await page.goto(`${baseUrl}/partner-workspace/launch?organizationId=demo-org-legends-real-estate`, { waitUntil: "domcontentloaded", timeout: 30_000 });

  const brief = page.locator(".dp-launch-brief");
  await brief.waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("heading", { name: "Authorized operations access required." }).waitFor({ state: "visible", timeout: 15_000 });

  const result = await brief.evaluate((element) => ({
    collectionName: /Downtown Perks · Founding Partner Collection/.test(element.textContent || ""),
    locked: element.classList.contains("dp-launch-brief--locked"),
    exposesContacts: /leasing@paseoatx\.com|CustomerCare@worthross\.com|shawn\.bell@fsresidential\.com/i.test(element.textContent || ""),
    legacyName: /Nina Launch Office/i.test(element.textContent || ""),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));

  if (!result.collectionName || !result.locked || result.exposesContacts || result.legacyName || result.overflow) {
    throw new Error(`Collection operations access or containment failed at ${viewport.width}px (${JSON.stringify(result)})`);
  }

  const navLaunch = page.locator('.dp-workspace-sidebar a[href*="/partner-workspace/launch"]');
  if (await navLaunch.count() !== 1 || await navLaunch.getAttribute("aria-current") !== "page") {
    throw new Error("Collection operations navigation is not persistent or current");
  }

  await page.close();
}

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
console.log("Founding Partner Collection operations remain authenticated, contained, and free of legacy naming");
