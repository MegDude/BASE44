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

  test("resident navigation exposes exactly one dialog at a time", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/map?mode=resident&tab=map&filter=Perks");
    await expect(page.getByRole("dialog", { name: "Active perks" })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(1);

    await page.getByRole("tab", { name: "Events", exact: true }).click();
    await expect(page).toHaveURL(/tab=events.*filter=Events/);
    await expect(page.getByRole("dialog", { name: "Active perks" })).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "Map results" })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(1);
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

  test("Banger's destination follows semantic order and owns one scroll region", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/map?mode=resident&tab=map&entityId=partner-bangers");

    const panel = page.locator("#dp-active-map-drawer");
    const title = page.getByRole("heading", { name: "Banger's Sausage House & Beer Garden" });
    await expect(panel).toBeVisible();
    await expect(title).toBeVisible();

    const geometry = await panel.evaluate((drawer) => {
      const content = drawer.querySelector<HTMLElement>(
        ".dp-map-panel-content.dp-destination-content.dp-detail-content",
      );
      const scroll = drawer.querySelector<HTMLElement>(".dp-map-detail-scroll");
      const hero = drawer.querySelector<HTMLElement>(".dp-destination-hero");
      const identity = drawer.querySelector<HTMLElement>(".dp-entity-identity");
      const details = drawer.querySelector<HTMLElement>(
        ".dp-venue-details-section, .dp-happy-hour-section, .dp-partner-destination-section",
      );
      const nearby = drawer.querySelector<HTMLElement>(".dp-discovery-context-section, .dp-partner-nearby-list");
      if (!content || !scroll || !hero || !identity || !details) return null;

      return {
        contentDisplay: getComputedStyle(content).display,
        scrollOverflowY: getComputedStyle(scroll).overflowY,
        scrollHeight: scroll.scrollHeight,
        clientHeight: scroll.clientHeight,
        heroTop: hero.getBoundingClientRect().top,
        identityTop: identity.getBoundingClientRect().top,
        detailsTop: details.getBoundingClientRect().top,
        nearbyTop: nearby?.getBoundingClientRect().top ?? null,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry?.contentDisplay).toBe("block");
    expect(geometry?.scrollOverflowY).toBe("auto");
    expect(geometry?.scrollHeight || 0).toBeGreaterThanOrEqual(geometry?.clientHeight || 0);
    expect(geometry?.heroTop || 0).toBeLessThan(geometry?.identityTop || 0);
    expect(geometry?.identityTop || 0).toBeLessThan(geometry?.detailsTop || 0);
    if (geometry?.nearbyTop !== null) {
      expect(geometry?.detailsTop || 0).toBeLessThan(geometry?.nearbyTop || 0);
    }
    await expect(page.getByRole("heading", { name: "Venue details" })).toBeVisible();
    await expect(page.getByText("Food and drink specials nearby", { exact: true })).toHaveCount(0);
  });
});
