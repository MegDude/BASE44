import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.DP_TEST_BASE_URL || "http://127.0.0.1:4173";
const routes = [
  "/partner-workspace/overview?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/publish?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/performance?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/workspace?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/offers?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/events?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/campaigns?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/surveys?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/analytics?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/reports?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/audience?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/profile?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/media?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/team?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/billing?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/sources?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/assistant?organizationId=demo-org-waterloo-greenway&provisioned=1",
  "/partner-workspace/launch?organizationId=demo-org-waterloo-greenway&provisioned=1",
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
        const workspaceEntityRows = [...document.querySelectorAll(".dp-workspace-entities-compact a")].filter(visible);
        const workspaceUtilityControls = [...document.querySelectorAll(".dp-partner-workspace-header button, .dp-partner-workspace-header select, .dp-product-shell-search-button")].filter(visible);
        const visibleSheets = [...document.querySelectorAll(".dp-active-perks-sheet, .dp-panel-shell, .dp-map-detail-sheet, .dp-workspace-sheet, .dp-workspace-search-sheet, [role='dialog']")].filter(visible);
        const workspacePage = document.querySelector(".dp-partner-workspace-page");
        const workspaceSurfaces = workspacePage ? [...workspacePage.querySelectorAll("[class*='card'], [class*='panel'], [class*='tile'], [class*='summary'], [class*='metric'], [class*='insight'], [class*='notice'], [class*='callout']")].filter(visible) : [];
        const workspaceControls = workspacePage ? [...workspacePage.querySelectorAll("button, [role='button'], [role='tab'], a[class*='button'], a[class*='action'], a[class*='cta']")].filter(visible) : [];
        const workspaceRows = workspacePage ? [...workspacePage.querySelectorAll("table, tr, th, td, [role='row'], [role='cell'], [role='columnheader']")].filter(visible) : [];
        const workspaceHeadings = workspacePage ? [...workspacePage.querySelectorAll("h1, h2, h3")].filter(visible) : [];
        const nonWhiteWorkspaceSurfaces = workspaceSurfaces.filter((element) => {
          const color = getComputedStyle(element).backgroundColor;
          return color !== "rgb(255, 255, 255)" && color !== "rgba(0, 0, 0, 0)";
        });
        const shadowedWorkspaceRows = workspaceRows.filter((element) => getComputedStyle(element).boxShadow !== "none");
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          background: getComputedStyle(document.body).backgroundColor,
          workspaceTitleSize: workspaceTitle && visible(workspaceTitle) ? parseFloat(getComputedStyle(workspaceTitle).fontSize) : 0,
          heroMetricSize: heroMetric && visible(heroMetric) ? parseFloat(getComputedStyle(heroMetric).fontSize) : 0,
          quickActionMaxHeight: Math.max(0, ...quickActions.map((element) => element.getBoundingClientRect().height)),
          pricingRowMaxHeight: Math.max(0, ...pricingRows.map((element) => element.getBoundingClientRect().height)),
          residentBenefitMaxHeight: Math.max(0, ...residentBenefitRows.map((element) => element.getBoundingClientRect().height)),
          workspaceEntityRowMaxHeight: Math.max(0, ...workspaceEntityRows.map((element) => element.getBoundingClientRect().height)),
          workspaceUtilityMaxRadius: Math.max(0, ...workspaceUtilityControls.map((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0)),
          sheetMaxRadius: Math.max(0, ...visibleSheets.map((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0)),
          sheetMaxHeight: Math.max(0, ...visibleSheets.map((element) => element.getBoundingClientRect().height)),
          workspaceSurfaceMaxRadius: Math.max(0, ...workspaceSurfaces.map((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0)),
          workspaceControlMaxRadius: Math.max(0, ...workspaceControls.map((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0)),
          workspaceHeadingMaxSize: Math.max(0, ...workspaceHeadings.map((element) => parseFloat(getComputedStyle(element).fontSize) || 0)),
          nonWhiteWorkspaceSurfaceCount: nonWhiteWorkspaceSurfaces.length,
          shadowedWorkspaceRowCount: shadowedWorkspaceRows.length,
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
      assert.ok(result.workspaceEntityRowMaxHeight <= 68, `${viewport.name} ${route} has ${result.workspaceEntityRowMaxHeight}px workspace place rows`);
      assert.equal(result.workspaceUtilityMaxRadius, 0, `${viewport.name} ${route} retains ${result.workspaceUtilityMaxRadius}px workspace utility rounding`);
      assert.equal(result.sheetMaxRadius, 0, `${viewport.name} ${route} retains a ${result.sheetMaxRadius}px sheet radius`);
      assert.equal(result.workspaceSurfaceMaxRadius, 0, `${viewport.name} ${route} retains ${result.workspaceSurfaceMaxRadius}px workspace surface rounding`);
      assert.equal(result.workspaceControlMaxRadius, 0, `${viewport.name} ${route} retains ${result.workspaceControlMaxRadius}px workspace control rounding`);
      assert.equal(result.nonWhiteWorkspaceSurfaceCount, 0, `${viewport.name} ${route} retains ${result.nonWhiteWorkspaceSurfaceCount} shaded workspace surfaces`);
      assert.equal(result.shadowedWorkspaceRowCount, 0, `${viewport.name} ${route} applies a shadow to ${result.shadowedWorkspaceRowCount} table or data rows`);
      if (viewport.name === "mobile") {
        assert.ok(result.workspaceHeadingMaxSize <= 34, `${viewport.name} ${route} has a ${result.workspaceHeadingMaxSize}px workspace heading`);
        assert.ok(
          result.sheetMaxHeight <= result.viewportHeight - 44,
          `${viewport.name} ${route} has a ${result.sheetMaxHeight}px sheet in a ${result.viewportHeight}px viewport`,
        );

        if (route.startsWith("/partner-workspace/overview")) {
          const switcher = page.locator(".dp-native-mobile-workspace-switcher > button");
          if (await switcher.isVisible()) {
            await switcher.click();
            const menu = page.locator(".dp-native-mobile-workspace-menu");
            await menu.waitFor({ state: "visible" });
            const menuContract = await menu.evaluate((element) => {
              const style = getComputedStyle(element);
              const controls = [...element.querySelectorAll("header button")].map((button) => button.getAttribute("aria-label"));
              return { height: element.getBoundingClientRect().height, radius: parseFloat(style.borderTopLeftRadius) || 0, background: style.backgroundColor, controls };
            });
            assert.ok(menuContract.height <= viewport.height - 44, `workspace switcher exceeds the mobile viewport`);
            assert.equal(menuContract.radius, 0, "workspace switcher must remain rectangular");
            assert.equal(menuContract.background, "rgb(255, 255, 255)", "workspace switcher must remain white");
            assert.ok(menuContract.controls.some((label) => label?.startsWith("Go back")), "workspace switcher must expose Back");
            assert.ok(menuContract.controls.some((label) => label?.startsWith("Close")), "workspace switcher must expose Close");
            await page.locator(".dp-native-mobile-workspace-menu header button").last().click();
          }
        }

        if (route.startsWith("/partner-workspace/campaigns")) {
          const firstTemplate = page.locator(".dp-workspace-experiences__rows > button").first();
          if (await firstTemplate.isVisible()) {
            await firstTemplate.click();
            const sheet = page.locator(".dp-workspace-sheet");
            await sheet.waitFor({ state: "visible" });
            const sheetContract = await sheet.evaluate((element) => {
              const style = getComputedStyle(element);
              const controls = [...element.querySelectorAll("button")].map((button) => `${button.getAttribute("aria-label") || ""} ${button.textContent || ""}`.trim());
              return { height: element.getBoundingClientRect().height, radius: parseFloat(style.borderTopLeftRadius) || 0, background: style.backgroundColor, controls };
            });
            assert.ok(sheetContract.height <= viewport.height - 18, "campaign builder exceeds the mobile viewport");
            assert.equal(sheetContract.radius, 0, "campaign builder must remain rectangular");
            assert.equal(sheetContract.background, "rgb(255, 255, 255)", "campaign builder must remain white");
            assert.ok(sheetContract.controls.some((label) => label.includes("Back")), "campaign builder must expose Back");
            assert.ok(sheetContract.controls.some((label) => label.includes("Close")), "campaign builder must expose Close");
            await page.getByLabel("Close experience builder").click();
          }
        }
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log("Interface density regression checks passed across every workspace destination, map, pricing, and resident routes.");
