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

  for (const viewport of [
    { name: "iphone-15", width: 393, height: 852 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    test(`marker selection stays stable at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/map?mode=resident&tab=map&entityId=partner-bangers");

      const panel = page.locator("#dp-active-map-drawer");
      const visibleMarkers = page.locator("[data-accessible-marker-entity-id]");
      await expect(panel).toBeVisible();
      await expect(page.getByRole("heading", { name: "Banger's Sausage House & Beer Garden" })).toBeVisible();
      const initialMarkerCount = await visibleMarkers.count();
      expect(initialMarkerCount).toBeGreaterThan(0);

      const natiivoMarker = page.getByRole("button", { name: "Open Natiivo Austin", exact: true });
      if (!(await natiivoMarker.isVisible())) {
        await page.getByRole("button", { name: "Zoom in", exact: true }).click();
      }
      await expect(natiivoMarker).toBeVisible();
      await natiivoMarker.evaluate((button) => button.click());
      await expect(page).toHaveURL(/entityId=natiivo-austin/);
      await expect(panel).toBeVisible();
      await expect(page.getByRole("heading", { name: "Natiivo Austin", exact: true })).toBeVisible();
      expect(await visibleMarkers.count()).toBeGreaterThan(0);

      await page.getByRole("button", { name: "Open Banger's Sausage House & Beer Garden", exact: true }).evaluate((button) => button.click());
      await expect(page).toHaveURL(/entityId=map-7-banger-s-sausage-house-and-beer-garden/);
      await expect(panel).toBeVisible();
      await expect(page.getByRole("heading", { name: "Banger's Sausage House & Beer Garden" })).toBeVisible();
      expect(await visibleMarkers.count()).toBeGreaterThan(0);
    });

    test(`Banger's destination follows semantic order and owns one scroll region at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
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

        const overflowProbe = document.createElement("div");
        overflowProbe.dataset.e2eOverflowProbe = "true";
        overflowProbe.setAttribute("aria-hidden", "true");
        overflowProbe.style.height = `${scroll.clientHeight + 200}px`;
        overflowProbe.style.pointerEvents = "none";
        content.appendChild(overflowProbe);

        return {
          contentDisplay: getComputedStyle(content).display,
          scrollOverflowY: getComputedStyle(scroll).overflowY,
          scrollHeight: scroll.scrollHeight,
          clientHeight: scroll.clientHeight,
          bodyOverflowY: getComputedStyle(document.body).overflowY,
          heroTop: hero.getBoundingClientRect().top,
          identityTop: identity.getBoundingClientRect().top,
          detailsTop: details.getBoundingClientRect().top,
          nearbyTop: nearby?.getBoundingClientRect().top ?? null,
        };
      });

      expect(geometry).not.toBeNull();
      expect(geometry?.contentDisplay).toBe("block");
      expect(geometry?.scrollOverflowY).toBe("auto");
      expect(geometry?.scrollHeight || 0).toBeGreaterThan(geometry?.clientHeight || 0);
      expect(geometry?.bodyOverflowY).not.toBe("auto");
      expect(geometry?.heroTop || 0).toBeLessThan(geometry?.identityTop || 0);
      expect(geometry?.identityTop || 0).toBeLessThan(geometry?.detailsTop || 0);
      if (geometry?.nearbyTop !== null) {
        expect(geometry?.detailsTop || 0).toBeLessThan(geometry?.nearbyTop || 0);
      }
      await expect(page.getByRole("heading", { name: "Venue details" })).toBeVisible();
      await expect(page.getByText("Food and drink specials nearby", { exact: true })).toHaveCount(0);
    });
  }

  const mapSurfaceFixtures = [
    {
      name: "resident browse",
      url: "/map?mode=resident&tab=events&filter=Events",
      scrollSelector: ".dp-resident-tab-panel-list",
    },
    {
      name: "resident card",
      url: "/map?mode=resident&tab=pass",
      scrollSelector: ".dp-map-sheet-scroll",
    },
    {
      name: "partner scanner",
      url: "/map?mode=partner&tab=pass",
      scrollSelector: ".dp-pass-panel-body",
    },
  ];

  for (const viewport of [
    { name: "iphone-15", width: 393, height: 852 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    test(`browse and focused map surfaces share bottom-sheet geometry at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const fixture of mapSurfaceFixtures) {
        await test.step(fixture.name, async () => {
          await page.goto(fixture.url);

          const surface = page.getByRole("dialog").first();
          const nav = page.getByRole("tablist", { name: "Map bottom navigation" });
          await expect(surface).toBeVisible();
          await expect(nav).toBeVisible();

          const system = await surface.evaluate((surfaceNode, scrollSelector) => {
            const navNode = document.querySelector<HTMLElement>(".dp-map-bottom-nav");
            const navShell = navNode?.closest<HTMLElement>(".dp-map-bottom-nav-shell");
            const intendedScrollOwner = surfaceNode.querySelector<HTMLElement>(scrollSelector);
            if (!navNode || !navShell || !intendedScrollOwner) return null;

            const surfaceRect = surfaceNode.getBoundingClientRect();
            const navRect = navNode.getBoundingClientRect();
            const probe = document.createElement("div");
            probe.dataset.e2eMapSurfaceOverflowProbe = "true";
            probe.setAttribute("aria-hidden", "true");
            const probeHeight = `${intendedScrollOwner.clientHeight + 160}px`;
            intendedScrollOwner.style.setProperty("position", "relative", "important");
            probe.style.setProperty("position", "absolute", "important");
            probe.style.setProperty("inset", "0 auto auto 0", "important");
            probe.style.setProperty("width", "1px", "important");
            probe.style.setProperty("height", probeHeight, "important");
            probe.style.setProperty("min-height", probeHeight, "important");
            probe.style.setProperty("display", "block", "important");
            probe.style.pointerEvents = "none";
            intendedScrollOwner.appendChild(probe);
            intendedScrollOwner.scrollTop = 1;

            const activeNestedScrollOwners = [...intendedScrollOwner.querySelectorAll<HTMLElement>("*")]
              .filter((node) => node.offsetParent !== null)
              .filter((node) => !node.matches("textarea, select, input"))
              .filter((node) => ["auto", "scroll"].includes(getComputedStyle(node).overflowY))
              .filter((node) => node.scrollHeight > node.clientHeight + 1)
              .filter((node) => node.clientHeight >= intendedScrollOwner.clientHeight * 0.8);

            return {
              surfaceLeft: surfaceRect.left,
              surfaceRight: surfaceRect.right,
              surfaceTop: surfaceRect.top,
              surfaceBottom: surfaceRect.bottom,
              surfacePosition: getComputedStyle(surfaceNode).position,
              navTop: navRect.top,
              navBottom: navRect.bottom,
              navZIndex: Number.parseInt(getComputedStyle(navShell).zIndex, 10),
              surfaceZIndex: Number.parseInt(getComputedStyle(surfaceNode).zIndex, 10),
              verticalScrollOwners: 1 + activeNestedScrollOwners.length,
              scrollOwnerOverflowY: getComputedStyle(intendedScrollOwner).overflowY,
              scrollOwnerOverscroll: getComputedStyle(intendedScrollOwner).overscrollBehaviorY,
              scrollOwnerScrollHeight: intendedScrollOwner.scrollHeight,
              scrollOwnerClientHeight: intendedScrollOwner.clientHeight,
              scrollOwnerScrollTop: intendedScrollOwner.scrollTop,
              bodyOverflowY: getComputedStyle(document.body).overflowY,
            };
          }, fixture.scrollSelector);

          expect(system).not.toBeNull();
          expect(system?.surfacePosition).toBe("fixed");
          expect(system?.surfaceTop || 0).toBeGreaterThan(0);
          expect(system?.surfaceBottom || 0).toBeGreaterThanOrEqual(system?.navTop || 0);
          expect(system?.surfaceBottom || 0).toBeLessThanOrEqual((system?.navBottom || viewport.height) + 1);
          expect(system?.surfaceLeft ?? -1).toBeGreaterThanOrEqual(-1);
          expect(system?.surfaceRight ?? viewport.width + 1).toBeLessThanOrEqual(viewport.width + 1);
          expect(system?.surfaceRight || 0).toBeCloseTo(viewport.width, 0);
          if (viewport.width < 768) {
            expect((system?.surfaceRight || 0) - (system?.surfaceLeft || 0)).toBeCloseTo(viewport.width, 0);
          }
          expect(system?.navZIndex || 0).toBeGreaterThan(system?.surfaceZIndex || 0);
          expect(system?.verticalScrollOwners).toBe(1);
          expect(system?.scrollOwnerOverflowY).toBe("auto");
          expect(system?.scrollOwnerOverscroll).toBe("contain");
          expect(system?.scrollOwnerScrollHeight || 0).toBeGreaterThan(system?.scrollOwnerClientHeight || 0);
          expect(system?.scrollOwnerScrollTop || 0).toBeGreaterThan(0);
          expect(system?.bodyOverflowY).not.toBe("auto");
        });
      }
    });
  }

  const drawerFixtures = [
    { name: "venue", url: "/map?mode=resident&tab=map&entityId=partner-bangers" },
    { name: "property", url: "/map?mode=resident&tab=map&entityId=natiivo-austin" },
    { name: "partner perk", url: "/map?mode=partner&tab=map&filter=All&routeId=inkind-dining-market&stopId=inkind-peche&entityId=inkind-peche" },
  ];

  for (const viewport of [
    { name: "iphone-15", width: 393, height: 852 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    test(`shared drawer system holds across panel types at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const fixture of drawerFixtures) {
        await test.step(fixture.name, async () => {
          await page.goto(fixture.url);

          const drawer = page.locator("#dp-active-map-drawer");
          const nav = page.getByRole("tablist", { name: "Map bottom navigation" });
          const title = drawer.locator(".dp-entity-title, .dp-destination-title, .dp-detail-title, .dp-map-panel-title, .dp-map-detail-scroll h1, .dp-map-detail-scroll h2").first();
          await expect(drawer).toBeVisible();
          await expect(nav).toBeVisible();
          await expect(title).toBeVisible();

          const geometry = await drawer.evaluate((drawerNode) => {
            const scroll = drawerNode.querySelector<HTMLElement>(".dp-map-detail-scroll");
            const titleNode = drawerNode.querySelector<HTMLElement>(
              ".dp-entity-title, .dp-destination-title, .dp-detail-title, .dp-map-panel-title, .dp-map-detail-scroll h1, .dp-map-detail-scroll h2",
            );
            const navNode = document.querySelector<HTMLElement>(".dp-map-bottom-nav");
            const navShell = navNode?.closest<HTMLElement>(".dp-map-bottom-nav-shell");
            if (!scroll || !titleNode || !navNode || !navShell) return null;
            const titleRectBeforeProbe = titleNode.getBoundingClientRect();
            const followingCopy = [...drawerNode.querySelectorAll<HTMLElement>("p, .dp-entity-subtitle, .dp-entity-context")]
              .filter((node) => node.offsetParent !== null)
              .filter((node) => node.getBoundingClientRect().top >= titleRectBeforeProbe.bottom - 1)
              .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0] || null;

            const probe = document.createElement("div");
            probe.dataset.e2eSharedDrawerOverflowProbe = "true";
            probe.setAttribute("aria-hidden", "true");
            probe.style.height = `${scroll.clientHeight + 160}px`;
            probe.style.pointerEvents = "none";
            scroll.firstElementChild?.appendChild(probe);

            const drawerRect = drawerNode.getBoundingClientRect();
            const navRect = navNode.getBoundingClientRect();
            const titleRect = titleNode.getBoundingClientRect();
            const followingRect = followingCopy?.getBoundingClientRect() || { top: Number.POSITIVE_INFINITY };
            const titleStyle = getComputedStyle(titleNode);
            const nestedVerticalScrollOwners = [...scroll.querySelectorAll<HTMLElement>("*")]
              .filter((node) => node.offsetParent !== null)
              .filter((node) => ["auto", "scroll"].includes(getComputedStyle(node).overflowY))
              .filter((node) => node.scrollHeight > node.clientHeight + 1)
              .length;
            scroll.scrollTop = 1;

            return {
              drawerLeft: drawerRect.left,
              drawerRight: drawerRect.right,
              drawerTop: drawerRect.top,
              drawerBottom: drawerRect.bottom,
              drawerPosition: getComputedStyle(drawerNode).position,
              navTop: navRect.top,
              navBottom: navRect.bottom,
              navZIndex: Number.parseInt(getComputedStyle(navShell).zIndex, 10),
              drawerZIndex: Number.parseInt(getComputedStyle(drawerNode).zIndex, 10),
              scrollOverflowY: getComputedStyle(scroll).overflowY,
              scrollHeight: scroll.scrollHeight,
              clientHeight: scroll.clientHeight,
              scrollTop: scroll.scrollTop,
              nestedVerticalScrollOwners,
              bodyOverflowY: getComputedStyle(document.body).overflowY,
              titleBottom: titleRect.bottom,
              followingTop: followingCopy ? followingRect.top : null,
              titleFontSize: Number.parseFloat(titleStyle.fontSize),
              titleLineHeight: Number.parseFloat(titleStyle.lineHeight),
              titleBackground: titleStyle.backgroundColor,
              titleBoxShadow: titleStyle.boxShadow,
              titleWhiteSpace: titleStyle.whiteSpace,
            };
          });

          expect(geometry).not.toBeNull();
          expect(geometry?.drawerPosition).toBe("fixed");
          expect(geometry?.drawerTop || 0).toBeGreaterThan(0);
          expect(geometry?.drawerBottom || 0).toBeGreaterThanOrEqual(geometry?.navTop || 0);
          expect(geometry?.drawerBottom || 0).toBeLessThanOrEqual((geometry?.navBottom || viewport.height) + 1);
          expect(geometry?.drawerLeft ?? -1).toBeGreaterThanOrEqual(-1);
          expect(geometry?.drawerRight ?? viewport.width + 1).toBeLessThanOrEqual(viewport.width + 1);
          expect(geometry?.drawerRight || 0).toBeCloseTo(viewport.width, 0);
          if (viewport.width < 768) {
            expect((geometry?.drawerRight || 0) - (geometry?.drawerLeft || 0)).toBeCloseTo(viewport.width, 0);
          }
          expect(geometry?.navZIndex || 0).toBeGreaterThan(geometry?.drawerZIndex || 0);
          expect(geometry?.scrollOverflowY).toBe("auto");
          expect(geometry?.scrollHeight || 0).toBeGreaterThan(geometry?.clientHeight || 0);
          expect(geometry?.scrollTop || 0).toBeGreaterThan(0);
          expect(geometry?.nestedVerticalScrollOwners).toBe(0);
          expect(geometry?.bodyOverflowY).not.toBe("auto");
          if (geometry?.followingTop !== null) {
            expect(geometry?.titleBottom || 0).toBeLessThanOrEqual((geometry?.followingTop || 0) + 1);
          }
          expect(geometry?.titleFontSize || 0).toBeLessThanOrEqual(viewport.width < 768 ? 32 : 34);
          expect(geometry?.titleLineHeight || 0).toBeGreaterThanOrEqual((geometry?.titleFontSize || 0) * 1.1);
          expect(geometry?.titleBackground).toBe("rgba(0, 0, 0, 0)");
          expect(geometry?.titleBoxShadow).toBe("none");
          expect(geometry?.titleWhiteSpace).toBe("normal");
        });
      }
    });
  }


  test("map marker coordinate keys remain stable across interactions", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/map?mode=resident&tab=map&filter=All&entityId=partner-bangers");
    await expect(page.locator("#dp-active-map-drawer")).toBeVisible();

    async function markerSnapshot() {
      return page.evaluate(() => {
        const lifecycle = (window as any).__DP_MAP_MARKER_LIFECYCLE__;
        const lifecycleRows = Array.isArray(lifecycle?.markerSnapshots) ? lifecycle.markerSnapshots : [];
        const shellRows = [...document.querySelectorAll<HTMLElement>(".dp-google-map-marker-shell[data-marker-entity-id]")].map((node) => ({
          key: `pin:${node.dataset.markerEntityId || ""}`,
          markerId: node.dataset.markerEntityId || "",
          entityId: node.dataset.entityId || "",
          latitude: node.dataset.canonicalLatitude || "",
          longitude: node.dataset.canonicalLongitude || "",
          coordinateKey: node.dataset.coordinateKey || "",
          lastPositionKey: node.dataset.coordinateKey || "",
        }));
        const buttonRows = [...document.querySelectorAll<HTMLElement>(".dp-map-pin[data-marker-entity-id]")].map((node) => ({
          key: `pin:${node.dataset.markerEntityId || ""}`,
          markerId: node.dataset.markerEntityId || "",
          entityId: node.dataset.entityId || "",
          latitude: node.dataset.canonicalLatitude || "",
          longitude: node.dataset.canonicalLongitude || "",
          coordinateKey: node.dataset.coordinateKey || "",
          lastPositionKey: node.dataset.coordinateKey || "",
        }));
        const accessibleRows = [...document.querySelectorAll<HTMLElement>("[data-accessible-marker-entity-id][data-marker-entity-id]")].map((node) => ({
          key: `pin:${node.dataset.markerEntityId || ""}`,
          markerId: node.dataset.markerEntityId || "",
          entityId: node.dataset.entityId || "",
          latitude: node.dataset.canonicalLatitude || "",
          longitude: node.dataset.canonicalLongitude || "",
          coordinateKey: node.dataset.coordinateKey || "",
          lastPositionKey: node.dataset.coordinateKey || "",
        }));
        const domRows = shellRows.length ? shellRows : buttonRows.length ? buttonRows : accessibleRows;
        return (lifecycleRows.length ? lifecycleRows : domRows)
          .filter((row: any) => row.markerId && row.latitude && row.longitude)
          .map((row: any) => ({
            markerId: String(row.markerId),
            entityId: String(row.entityId),
            latitude: String(row.latitude),
            longitude: String(row.longitude),
            coordinateKey: String(row.coordinateKey),
            lastPositionKey: String(row.lastPositionKey || row.coordinateKey),
          }))
          .sort((left: any, right: any) => left.markerId.localeCompare(right.markerId));
      });
    }

    await expect
      .poll(async () => (await markerSnapshot()).length, { timeout: 10000 })
      .toBeGreaterThan(0);

    function assertStableCommonMarkers(before: Awaited<ReturnType<typeof markerSnapshot>>, after: Awaited<ReturnType<typeof markerSnapshot>>) {
      const afterById = new Map(after.map((row) => [row.markerId, row]));
      const common = before.filter((row) => afterById.has(row.markerId));
      expect(common.length).toBeGreaterThan(0);
      for (const row of common) {
        const next = afterById.get(row.markerId)!;
        expect(next.entityId).toBe(row.entityId);
        expect(next.latitude).toBe(row.latitude);
        expect(next.longitude).toBe(row.longitude);
        expect(next.coordinateKey).toBe(row.coordinateKey);
        expect(next.lastPositionKey).toBe(row.coordinateKey);
      }
    }

    const initial = await markerSnapshot();
    expect(initial.length).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await page.waitForTimeout(250);
    assertStableCommonMarkers(initial, await markerSnapshot());

    const mapBox = await page.locator(".dp-google-map-canvas, .gm-style").first().boundingBox();
    if (mapBox) {
      await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(mapBox.x + mapBox.width / 2 + 80, mapBox.y + mapBox.height / 2 + 40, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(300);
      assertStableCommonMarkers(initial, await markerSnapshot());
    }

    const natiivo = page.getByRole("button", { name: "Open Natiivo Austin", exact: true });
    if (await natiivo.isVisible()) {
      await natiivo.evaluate((button) => button.click());
      await expect(page).toHaveURL(/entityId=natiivo-austin/);
      await expect(page.locator("#dp-active-map-drawer")).toBeVisible();
      assertStableCommonMarkers(initial, await markerSnapshot());
    }

    await page.getByRole("tab", { name: "Perks", exact: true }).click();
    await expect(page).toHaveURL(/tab=perks|filter=Perks/);
    await page.waitForTimeout(250);
    const filtered = await markerSnapshot();
    expect(filtered.length).toBeGreaterThan(0);
    assertStableCommonMarkers(initial, filtered);

    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(300);
    assertStableCommonMarkers(filtered, await markerSnapshot());
  });


});
