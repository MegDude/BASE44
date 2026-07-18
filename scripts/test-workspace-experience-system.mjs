import { chromium } from "playwright";
import { existsSync } from "node:fs";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const localChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: existsSync(localChrome) ? localChrome : undefined });
const errors = [];

async function open(route) {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  await page.addInitScript(() => {
    localStorage.setItem("dp_partner_workspace:activation", JSON.stringify({
      id: "workspace-experience-qa",
      organizationName: "Legends Real Estate",
      partnerType: "Real Estate",
      status: "active",
    }));
  });
  page.on("pageerror", (error) => errors.push(`${route}: ${error.message}`));
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.locator(".dp-workspace-experiences").waitFor({ state: "visible", timeout: 15_000 });
  return page;
}

{
  const page = await open("/partner-workspace/campaigns?organizationId=demo-org-legends-real-estate");
  const summary = await page.evaluate(() => ({
    title: document.querySelector("#workspace-experiences-title")?.textContent?.trim(),
    groups: document.querySelectorAll(".dp-workspace-experiences__tabs [role='tab']").length,
    rows: document.querySelectorAll(".dp-workspace-experiences__rows > button").length,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  if (summary.title !== "Create one connected experience." || summary.groups < 8 || summary.rows < 1 || summary.overflow) throw new Error(`Campaign library is incomplete or overflows (${JSON.stringify(summary)})`);
  await page.locator(".dp-workspace-experiences__rows > button").first().click();
  const sheet = page.locator(".dp-workspace-sheet");
  await sheet.waitFor({ state: "visible" });
  if (await sheet.locator(".dp-experience-builder > nav li").count() !== 10) throw new Error("Experience builder does not expose the canonical ten steps");
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Experience builder introduces horizontal overflow");
  if (await page.getByRole("button", { name: /Go back from/ }).count() < 1) throw new Error("Experience sheet does not expose Back");
  await page.getByRole("button", { name: /Close New listing launch/ }).click();
  await page.close();
}

{
  const page = await open("/partner-workspace/surveys?organizationId=demo-org-legends-real-estate");
  const body = await page.locator(".dp-workspace-experiences").innerText();
  if (!body.includes("Ask one useful question.") || !body.includes("without requiring QR") || !body.includes("Google Sheets")) throw new Error("Survey page does not explain native, optional-QR, database-first behavior");
  await page.getByRole("button", { name: "Create survey" }).tap();
  const builder = page.locator(".dp-experience-builder");
  await builder.waitFor({ state: "visible" });
  await builder.locator("nav button").nth(8).click();
  const survey = builder.locator(".dp-map-survey");
  await survey.waitFor({ state: "visible" });
  if (await survey.locator("fieldset legend").count() !== 1 || await survey.locator("input[type='radio']").count() < 2) throw new Error("Survey preview is not a semantic native question");
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Survey builder introduces horizontal overflow");
  await page.close();
}

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
console.log("workspace experience system: campaign library, ten-step builder, native survey preview, optional QR copy, and mobile containment verified");
