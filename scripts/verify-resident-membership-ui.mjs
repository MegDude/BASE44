import { chromium } from "playwright";
import assert from "node:assert/strict";

const baseUrl = process.env.DP_VERIFY_BASE_URL || "http://127.0.0.1:3017";
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const checks = [
  { path: "/residents/membership", width: 320, height: 844, file: "/private/tmp/dp-membership-320.png", heading: "One membership." },
  { path: "/residents/membership", width: 393, height: 852, file: "/private/tmp/dp-membership-iphone15.png", heading: "One membership." },
  { path: "/residents/login", width: 393, height: 852, file: "/private/tmp/dp-resident-login-iphone15.png", heading: "Sign in to your downtown." },
  { path: "/residents/login?mode=register", width: 320, height: 844, file: "/private/tmp/dp-resident-register-320.png", heading: "Create your resident account." },
  { path: "/residents/welcome?registration=verification-only", width: 393, height: 852, file: "/private/tmp/dp-resident-welcome-iphone15.png", heading: "Finish your membership." },
];

for (const check of checks) {
  const page = await browser.newPage({ viewport: { width: check.width, height: check.height } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${baseUrl}${check.path}`, { waitUntil: "networkidle", timeout: 30_000 });
  assert.equal(await page.locator("body").innerText().then(text => text.trim().length > 0), true, `${check.path} rendered blank`);
  assert.equal(await page.locator(".vite-error-overlay,[data-nextjs-dialog],#webpack-dev-server-client-overlay").count(), 0, `${check.path} rendered an error overlay`);
  assert.equal(await page.getByRole("heading", { name: check.heading, exact: false }).count(), 1, `${check.path} is missing its main heading`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  assert.equal(overflow, false, `${check.path} overflows horizontally at ${check.width}px`);
  assert.deepEqual(errors.filter(error => !/favicon/i.test(error)), [], `${check.path} logged browser errors`);
  await page.screenshot({ path: check.file, fullPage: true });
  await page.close();
}
await browser.close();
console.log("resident membership UI verification: pass");
