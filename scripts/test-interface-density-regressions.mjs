import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.DP_TEST_BASE_URL || "http://127.0.0.1:4173";
const routes = [
  "/partner-workspace/overview?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/offers?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/campaigns?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/analytics?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/profile?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/map?mode=resident&tab=home&filter=All",
  "/map?mode=resident&tab=perks&filter=All",
  "/map?mode=partner&tab=map&filter=All",
  "/pricing",
  "/card",
];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    for (const route of routes) {
      const pageErrors = [];
      page.removeAllListeners("pageerror");
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(900);

      const result = await page.evaluate(() => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 1 && rect.height > 1;
        };
        const workspaceTitle = document.querySelector(".dp-workspace-experiences__header h1");
        const heroMetric = document.querySelector(".dp-native-mobile-hero-value");
        const quickActions = [...document.querySelectorAll(".dp-native-mobile-actions > a")].filter(visible);
        const pricingRows = [...document.querySelectorAll(".dp-pricing-upgrade-list > button")].filter(visible);
        const residentBenefitRows = [...document.querySelectorAll(".dp-resident-benefit-list > a")].filter(visible);
        const visibleSheets = [...document.querySelectorAll(".dp-active-perks-sheet, .dp-panel-shell, .dp-map-detail-sheet")].filter(visible);
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          background: getComputedStyle(document.body).backgroundColor,
          workspaceTitleSize: workspaceTitle && visible(workspaceTitle) ? parseFloat(getComputedStyle(workspaceTitle).fontSize) : 0,
          heroMetricSize: heroMetric && visible(heroMetric) ? parseFloat(getComputedStyle(heroMetric).fontSize) : 0,
          quickActionMaxHeight: Math.max(0, ...quickActions.map((element) => element.getBoundingClientRect().height)),
          pricingRowMaxHeight: Math.max(0, ...pricingRows.map((element) => element.getBoundingClientRect().height)),
          residentBenefitMaxHeight: Math.max(0, ...residentBenefitRows.map((element) => element.getBoundingClientRect().height)),
          sheetMaxRadius: Math.max(0, ...visibleSheets.map((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0)),
          sheetMaxHeight: Math.max(0, ...visibleSheets.map((element) => element.getBoundingClientRect().height)),
          viewportHeight: innerHeight,
        };
      });

      assert.equal(pageErrors.length, 0, `${viewport.name} ${route} raised browser errors: ${pageErrors.join("; ")}`);
      assert.ok(result.overflow <= 1, `${viewport.name} ${route} overflows horizontally by ${result.overflow}px`);
      assert.equal(result.background, "rgb(255, 255, 255)", `${viewport.name} ${route} does not use a white page surface`);
      assert.ok(result.workspaceTitleSize <= 42, `${viewport.name} ${route} has a ${result.workspaceTitleSize}px workspace title`);
      assert.ok(result.heroMetricSize <= 46, `${viewport.name} ${route} has a ${result.heroMetricSize}px home metric`);
      assert.ok(result.quickActionMaxHeight <= 60, `${viewport.name} ${route} has ${result.quickActionMaxHeight}px quick actions`);
      assert.ok(result.pricingRowMaxHeight <= 64, `${viewport.name} ${route} has ${result.pricingRowMaxHeight}px pricing rows`);
      assert.ok(result.residentBenefitMaxHeight <= 64, `${viewport.name} ${route} has ${result.residentBenefitMaxHeight}px resident benefit rows`);
      assert.equal(result.sheetMaxRadius, 0, `${viewport.name} ${route} retains a ${result.sheetMaxRadius}px sheet radius`);
      if (viewport.name === "mobile") {
        assert.ok(
          result.sheetMaxHeight <= result.viewportHeight - 44,
          `${viewport.name} ${route} has a ${result.sheetMaxHeight}px sheet in a ${result.viewportHeight}px viewport`,
        );
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log("Interface density regression checks passed across workspace, map, pricing, and resident routes.");
