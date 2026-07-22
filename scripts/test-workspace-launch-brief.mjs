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

  const pathname = new URL(page.url()).pathname;
  if (pathname.startsWith("/partners/sign-in")) {
    await page.getByRole("heading", { name: "Sign in to Downtown Perks." }).waitFor({ state: "visible", timeout: 15_000 });
  } else {
    const brief = page.locator(".dp-launch-brief");
    await brief.waitFor({ state: "visible", timeout: 15_000 });
    await page.getByRole("heading", { name: /Authorized operations access required|Operations are temporarily unavailable/ }).waitFor({ state: "visible", timeout: 15_000 });
    const collectionName = await brief.getByText("Downtown Perks · Founding Partner Collection").count();
    if (!collectionName) throw new Error(`Collection name is missing from locked operations view at ${viewport.width}px`);
  }

  const result = await page.locator("body").evaluate((element) => ({
    exposesContacts: /leasing@paseoatx\.com|info4hoa@worthross\.com|shawn\.bell@fsresidential\.com/i.test(element.textContent || ""),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));

  if (result.exposesContacts || result.overflow) {
    throw new Error(`Collection operations access or containment failed at ${viewport.width}px (${JSON.stringify(result)})`);
  }

  await page.close();
}

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
console.log("Founding Partner Collection operations require secure access and expose no anonymous contact data");
