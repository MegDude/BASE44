import { chromium } from "playwright";
import { existsSync } from "node:fs";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const localChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: existsSync(localChrome) ? localChrome : undefined });
const errors = [];
const routes = [
  "/partner-workspace/launch?organizationId=demo-org-legends-real-estate",
  "/partner-workspace/launch?view=targets&organizationId=demo-org-legends-real-estate",
];
const secureStateHeading = /Sign in to Downtown Perks\.|Authorized operations access required|Operations are temporarily unavailable/;

for (const viewport of [{ width: 393, height: 852 }, { width: 1440, height: 900 }]) {
  for (const route of routes) {
    const page = await browser.newPage({ viewport });
    page.on("pageerror", (error) => errors.push(`${viewport.width}:${route}: ${error.message}`));
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const secureHeading = page.getByRole("heading", { name: secureStateHeading }).first();
    await secureHeading.waitFor({ state: "visible", timeout: 15_000 });
    const headingText = await secureHeading.innerText();

    if (!/Sign in to Downtown Perks\./.test(headingText)) {
      const brief = page.locator(".dp-launch-brief");
      await brief.waitFor({ state: "visible", timeout: 15_000 });
      const collectionName = await brief.getByText("Downtown Perks · Founding Partner Collection").count();
      if (!collectionName) throw new Error(`Collection name is missing from locked operations view at ${viewport.width}px for ${route}`);
    }

    const result = await page.locator("body").evaluate((element) => ({
      exposesContacts: /leasing@paseoatx\.com|info4hoa@worthross\.com|shawn\.bell@fsresidential\.com|bridget@dunlapatx\.com|MMiller@LPC\.com/i.test(element.textContent || ""),
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));

    if (result.exposesContacts || result.overflow) {
      throw new Error(`Collection operations access or containment failed at ${viewport.width}px for ${route} (${JSON.stringify(result)})`);
    }

    await page.close();
  }
}

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
console.log("Founding Partner Collection overview and all-targets directory require secure access and expose no anonymous contact data");
