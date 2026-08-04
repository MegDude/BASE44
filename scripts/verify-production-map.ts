import { chromium } from "@playwright/test";

const targetUrl = process.env.MAP_VERIFY_URL;
if (!targetUrl) throw new Error("Set MAP_VERIFY_URL to the staged or production app URL before verifying the map.");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const failures: string[] = [];

page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
page.on("requestfailed", (request) => {
  const url = request.url();
  if (url.includes("maps.googleapis.com") || url.includes("maps.gstatic.com")) {
    failures.push(`map request failed: ${request.failure()?.errorText || "unknown error"}`);
  }
});

try {
  const response = await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  if (!response?.ok()) failures.push(`route returned HTTP ${response?.status() || "unknown"}`);

  await page.waitForSelector(".gm-style", { timeout: 12_000 }).catch(() => {
    failures.push("Google Maps canvas did not render");
  });

  const state = await page.evaluate(() => ({
    hasCanvas: Boolean(document.querySelector(".gm-style")),
    hasGoogleError: Boolean(document.querySelector(".gm-err-container")),
    hasAppError: /map service needs attention|map is temporarily unavailable/i.test(document.body.innerText),
  }));

  if (!state.hasCanvas) failures.push("map canvas missing after load");
  if (state.hasGoogleError) failures.push("Google Maps rendered an authorization error");
  if (state.hasAppError) failures.push("application rendered the map error surface");

  if (failures.length) {
    throw new Error(`Production map verification failed:\n- ${Array.from(new Set(failures)).join("\n- ")}`);
  }

  console.log(JSON.stringify({ ok: true, url: page.url(), ...state }));
} finally {
  await browser.close();
}
