import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const localChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync(localChrome) ? localChrome : undefined);
const shellSource = await readFile(new URL("../src/components/map/NativeDrawerShell.jsx", import.meta.url), "utf8");
const geometrySource = await readFile(new URL("../src/styles/native-drawer-geometry-final.css", import.meta.url), "utf8");
const hookSource = await readFile(new URL("../src/hooks/useBottomNavigationGeometry.js", import.meta.url), "utf8");

for (const contract of [
  "dp-native-drawer-surface",
  "dp-native-drawer-header",
  "dp-native-drawer-content-viewport",
  "dp-native-drawer-scroll",
  "dp-native-drawer-actions",
  "dp-native-drawer-underlay",
]) assert.match(shellSource, new RegExp(contract), `${contract} is missing from the shared shell`);
assert.match(hookSource, /ResizeObserver/);
assert.match(hookSource, /visualViewport/);
assert.match(geometrySource, /--dp-bottom-nav-total-height/);
assert.match(geometrySource, /touch-action:\s*pan-y/);
const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
assert.doesNotMatch(mapSource, /style\.setProperty\("padding", "0 0 var\(--dp-bottom-nav-total-height\)"/, "map runtime still forces drawer geometry inline");

const viewports = [
  { width: 320, height: 568, name: "320x568" },
  { width: 375, height: 667, name: "375x667" },
  { width: 390, height: 844, name: "390x844" },
  { width: 393, height: 852, name: "393x852" },
  { width: 430, height: 932, name: "430x932" },
  { width: 852, height: 393, name: "landscape" },
];

const browser = await chromium.launch({ headless: true, executablePath });
for (const viewport of viewports) {
  const page = await browser.newPage({ viewport, isMobile: true, hasTouch: true });
  await page.goto(`${baseUrl}/map?mode=resident&tab=perks&filter=Perks`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const drawer = page.locator(".dp-active-perks-sheet:has(.dp-active-perk-row)").last();
  await drawer.waitFor({ state: "visible", timeout: 15_000 });
  await drawer.locator(".dp-active-perk-row").first().waitFor({ state: "visible", timeout: 15_000 });
  const geometry = await drawer.evaluate((element) => {
    const surface = element.querySelector(".dp-native-drawer-surface");
    const contentViewport = element.querySelector(".dp-native-drawer-content-viewport");
    const scroll = element.querySelector(".dp-native-drawer-scroll");
    const nav = document.querySelector("[data-dp-bottom-navigation='true']");
    scroll.scrollTop = scroll.scrollHeight;
    const perkRows = scroll.querySelectorAll(".dp-active-perk-row");
    const lastRow = perkRows[perkRows.length - 1];
    return {
      viewportHeight: innerHeight,
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      drawer: element.getBoundingClientRect().toJSON(),
      surface: surface?.getBoundingClientRect().toJSON(),
      contentViewport: contentViewport?.getBoundingClientRect().toJSON(),
      nav: nav?.getBoundingClientRect().toJSON(),
      lastRow: lastRow?.getBoundingClientRect().toJSON(),
      redeemButtonsFit: [...element.querySelectorAll(".dp-active-perk-actions > button:first-child")].every((button) => (
        button.scrollWidth <= button.clientWidth
        && button.getBoundingClientRect().right <= element.getBoundingClientRect().right
        && getComputedStyle(button).whiteSpace === "nowrap"
      )),
      handleCenterDelta: (() => {
        const handle = element.querySelector(".dp-active-perks-handle");
        if (!handle) return Number.POSITIVE_INFINITY;
        const handleBox = handle.getBoundingClientRect();
        const drawerBox = element.getBoundingClientRect();
        return Math.abs((handleBox.left + handleBox.width / 2) - (drawerBox.left + drawerBox.width / 2));
      })(),
      scrollOverflow: scroll ? getComputedStyle(scroll).overflowY : "",
      bodyLocked: document.body.style.overflow === "hidden",
      surfaceColor: surface ? getComputedStyle(surface).backgroundColor : "",
    };
  });
  assert.ok(geometry.surface && Math.abs(geometry.surface.bottom - geometry.viewportHeight) <= 1, `${viewport.name}: drawer surface does not reach the viewport bottom`);
  assert.ok(geometry.nav && Math.abs(geometry.nav.bottom - geometry.viewportHeight) <= 1, `${viewport.name}: navigation does not reach the viewport bottom`);
  assert.ok(geometry.contentViewport && geometry.contentViewport.bottom <= geometry.nav.top + 1, `${viewport.name}: readable content sits behind navigation`);
  assert.ok(geometry.lastRow && geometry.lastRow.bottom <= geometry.nav.top + 1, `${viewport.name}: final perk row is clipped by navigation`);
  assert.equal(geometry.redeemButtonsFit, true, `${viewport.name}: Redeem text is clipped or wrapped`);
  assert.ok(geometry.handleCenterDelta <= 1, `${viewport.name}: drawer handle is not centered`);
  assert.equal(geometry.scrollOverflow, "auto", `${viewport.name}: shared scroll region is not the scroll owner`);
  assert.equal(geometry.bodyLocked, true, `${viewport.name}: map page is not locked while the drawer is open`);
  assert.equal(geometry.surfaceColor, "rgb(255, 255, 255)", `${viewport.name}: drawer surface is not white`);
  assert.ok(geometry.documentWidth <= geometry.viewportWidth + 1, `${viewport.name}: drawer causes horizontal overflow`);
  await page.close();
}

await browser.close();
console.log(`native drawer geometry: ${viewports.length} viewport contracts passed`);
