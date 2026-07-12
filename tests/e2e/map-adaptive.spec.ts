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
      await expect(page.getByRole("navigation", { name: "Map bottom navigation" })).toHaveCount(0);

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
    await expect(page.getByRole("navigation", { name: "Map bottom navigation" })).toBeVisible();
    await expect(page.locator(".dp-map-page-embedded")).toHaveCount(0);
  });
});
