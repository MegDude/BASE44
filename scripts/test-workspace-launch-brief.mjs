import { chromium } from "playwright";
import { existsSync } from "node:fs";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const localChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: existsSync(localChrome) ? localChrome : undefined });
const errors = [];

for (const viewport of [{ width: 393, height: 852 }, { width: 1440, height: 900 }]) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => {
    localStorage.setItem("dp_partner_workspace:activation", JSON.stringify({
      id: "workspace-launch-qa",
      organizationName: "Legends Real Estate",
      partnerType: "Real Estate",
      status: "active",
    }));
  });
  page.on("pageerror", (error) => errors.push(`${viewport.width}: ${error.message}`));
  await page.goto(`${baseUrl}/partner-workspace/launch?organizationId=demo-org-legends-real-estate`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const brief = page.locator(".dp-launch-brief");
  await brief.waitFor({ state: "visible", timeout: 15_000 });
  const result = await brief.evaluate((element) => ({
    title: element.querySelector("h1")?.textContent?.trim(),
    decisions: element.querySelectorAll(".dp-launch-brief__decisions li").length,
    engines: element.querySelectorAll(".dp-launch-brief__engines article").length,
    targets: element.querySelectorAll(".dp-launch-brief__targets article").length,
    metrics: element.querySelectorAll('.dp-launch-brief__metrics [role="row"] [role="cell"]')?.length,
    hasVerification: /Confirm current ownership, property management, tenant occupancy/i.test(element.textContent || ""),
    inventedNotionLinks: [...element.querySelectorAll("a")].some((anchor) => /notion/i.test(anchor.href)),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  if (result.title !== "Turn a few relationships into downtown reach." || result.decisions !== 7 || result.engines !== 7 || result.targets < 12 || result.metrics < 16) throw new Error(`Launch brief content is incomplete at ${viewport.width}px (${JSON.stringify(result)})`);
  if (!result.hasVerification || result.inventedNotionLinks || result.overflow) throw new Error(`Launch brief governance or containment failed at ${viewport.width}px (${JSON.stringify(result)})`);
  const navLaunch = page.locator('.dp-workspace-sidebar a[href*="/partner-workspace/launch"]');
  if (await navLaunch.count() !== 1 || await navLaunch.getAttribute("aria-current") !== "page") throw new Error("Launch workspace navigation is not persistent or current");
  await page.close();
}

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
console.log("workspace launch brief: decisions, reach engines, targets, metrics, verification language, navigation, and responsive containment verified");
