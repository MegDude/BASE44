import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4174";
const routes = [
  {
    name: "resident Waterloo route",
    path: "/map?mode=resident&tab=map&filter=Civic&collection=waterloo-greenway",
    selector: ".dp-collection-route-panel",
  },
  {
    name: "resident Waterloo detail",
    path: "/map?mode=resident&tab=map&filter=Civic&collection=waterloo-greenway&stop=civic-waterloo-greenway&entityId=civic-waterloo-greenway",
    selector: "#dp-active-map-drawer",
  },
  {
    name: "partner campaign detail",
    path: "/map?mode=partner&tab=map&filter=All&entityId=featured-fine-eyewear",
    selector: "#dp-active-map-drawer",
  },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });

try {
  for (const route of routes) {
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.locator(route.selector).waitFor({ state: "visible", timeout: 30_000 });

    const result = await page.locator(route.selector).evaluate((panel) => {
      const rect = panel.getBoundingClientRect();
      const style = getComputedStyle(panel);
      const scroll = panel.querySelector(
        ".dp-map-panel-scroll, .dp-drawer-scroll, .dp-collection-route-panel__scroll",
      );
      const scrollStyle = scroll ? getComputedStyle(scroll) : null;
      const visibleTargets = [...panel.querySelectorAll("button, a")]
        .filter((node) => {
          const targetRect = node.getBoundingClientRect();
          const targetStyle = getComputedStyle(node);
          return targetRect.width > 0 && targetRect.height > 0 && targetStyle.visibility !== "hidden";
        })
        .filter((node) => !node.classList.contains("dp-native-drawer-handle-toggle"));
      const smallestTarget = Math.min(
        ...visibleTargets.map((node) => node.getBoundingClientRect().height),
        999,
      );
      const undersizedTargets = visibleTargets
        .filter((node) => node.getBoundingClientRect().height < 40)
        .map((node) => `${node.className || node.tagName}:${node.textContent?.trim().slice(0, 32)} (${Math.round(node.getBoundingClientRect().height)}px)`);
      const roundedTargets = visibleTargets
        .filter((node) => Number.parseFloat(getComputedStyle(node).borderTopLeftRadius) > 4)
        .map((node) => `${node.className || node.tagName}:${getComputedStyle(node).borderTopLeftRadius}`);
      const textColor = getComputedStyle(panel.querySelector("h2, h3, strong, p") || panel).color;

      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        background: style.backgroundColor,
        textColor,
        smallestTarget,
        undersizedTargets,
        roundedTargets,
        overflowY: scrollStyle?.overflowY || "",
        touchAction: scrollStyle?.touchAction || "",
        scrollable: scroll ? scroll.scrollHeight > scroll.clientHeight : false,
        bodyOverflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });

    assert.ok(result.left >= -1, `${route.name}: panel escapes the left edge`);
    assert.ok(result.right <= 394, `${route.name}: panel escapes the right edge`);
    assert.ok(result.width <= 393, `${route.name}: panel is wider than the viewport`);
    assert.equal(result.bodyOverflow <= 1, true, `${route.name}: page has horizontal overflow`);
    assert.match(result.background, /rgb\((?:255, 255, 255|248, 250, 252)\)/, `${route.name}: panel is not a light native surface`);
    assert.notEqual(result.textColor, "rgb(255, 255, 255)", `${route.name}: primary copy is white on white`);
    assert.ok(result.smallestTarget >= 40, `${route.name}: interactive target is below 40px (${result.undersizedTargets.join(", ")})`);
    assert.equal(result.roundedTargets.length, 0, `${route.name}: rounded action styling remains (${result.roundedTargets.join(", ")})`);
    assert.match(result.overflowY, /auto|scroll/, `${route.name}: content region cannot scroll`);
    assert.match(result.touchAction, /pan-y|auto/, `${route.name}: vertical touch scrolling is not enabled`);

    console.log(`${route.name}: ${Math.round(result.width)}px wide, ${result.smallestTarget}px minimum target, scrollable=${result.scrollable}`);
  }
} finally {
  await browser.close();
}
