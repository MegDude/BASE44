import { expect, test } from "@playwright/test";
import { viewportMatrix } from "../../src/platform/testing/viewportMatrix";

const smokeViewports = viewportMatrix.filter((viewport) =>
  ["compact-phone", "iphone-15", "compact-embed", "tablet-landscape", "desktop"].includes(viewport.name),
);

test.describe("adaptive map surface", () => {
  for (const viewport of smokeViewports) {
    test(`embed shell holds at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/map?embed=true&mode=resident&district=Rainey&filter=Perks&source=e2e");
      await expect(page.locator(".dp-map-page-embedded")).toBeVisible();
      await expect(page.locator(".dp-embed-map-header")).toContainText("Downtown Perks");
      await expect(page.getByRole("tablist", { name: "Map bottom navigation" })).toHaveCount(0);

      const layout = await page.evaluate(() => ({
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
        hasOverlay: Boolean(document.querySelector("vite-error-overlay")),
      }));

      expect(layout.hasOverlay).toBe(false);
      expect(layout.overflowX).toBeLessThanOrEqual(1);
    });
  }

  test("full resident map keeps bottom navigation visible", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/map?mode=resident&tab=map&filter=Perks");
    await expect(page.getByRole("tablist", { name: "Map bottom navigation" })).toBeVisible();
    await expect(page.locator(".dp-map-page-embedded")).toHaveCount(0);
  });

  test("mobile panel and bottom navigation form one edge-to-edge surface", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/map?mode=partner&tab=map&filter=All&routeId=inkind-dining-market&stopId=inkind-peche&entityId=inkind-peche");

    const nav = page.getByRole("tablist", { name: "Map bottom navigation" });
    const panel = page.locator("#dp-active-map-drawer");
    await expect(nav).toBeVisible();
    await expect(panel).toBeVisible();

    const geometry = await page.evaluate(() => {
      const navNode = document.querySelector<HTMLElement>(".dp-map-bottom-nav");
      const panelNode = document.querySelector<HTMLElement>("#dp-active-map-drawer");
      if (!navNode || !panelNode) return null;
      const navRect = navNode.getBoundingClientRect();
      const panelRect = panelNode.getBoundingClientRect();
      return {
        navLeft: navRect.left,
        navRight: navRect.right,
        navBottom: navRect.bottom,
        panelLeft: panelRect.left,
        panelRight: panelRect.right,
        overlap: panelRect.bottom - navRect.top,
        navZIndex: Number.parseInt(getComputedStyle(navNode.closest(".dp-map-bottom-nav-shell") as Element).zIndex, 10),
        panelZIndex: Number.parseInt(getComputedStyle(panelNode).zIndex, 10),
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry?.navLeft).toBeCloseTo(0, 0);
    expect(geometry?.navRight).toBeCloseTo(393, 0);
    expect(geometry?.navBottom).toBeCloseTo(852, 0);
    expect(geometry?.panelLeft).toBeCloseTo(0, 0);
    expect(geometry?.panelRight).toBeCloseTo(393, 0);
    expect(geometry?.overlap).toBeGreaterThanOrEqual(8);
    expect(geometry?.overlap).toBeLessThanOrEqual(12);
    expect(geometry?.navZIndex).toBeGreaterThan(geometry?.panelZIndex || 0);
  });
});
