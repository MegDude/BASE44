import { expect, test } from "@playwright/test";

const analyticsUrl = "/partner-workspace/analytics?workspace=demo-org-legends-real-estate&range=30d&view=overview";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("dp_partner_workspace:activation", JSON.stringify({
      id: "browser-analytics-activation",
      organizationName: "Browser analytics fixture",
      partnerType: "real_estate",
      plan: "enterprise",
      status: "active",
    }));
    window.localStorage.setItem("dp_partner_workspace:profile:downtown-perks-workspace", JSON.stringify({
      email: "partner@example.test",
      full_name: "Analytics QA",
      organization_name: "Browser analytics fixture",
      partner_type: "real_estate",
      role: "partner",
    }));
  });
});

test("analytics route renders the authorized workspace and preserves context", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto(analyticsUrl);

  await expect.poll(() => new URL(page.url()).pathname).toBe("/partner-workspace/analytics");
  await expect(page.getByRole("heading", { name: "Analytics", exact: true })).toBeVisible();
  await expect(page.getByText("Browser analytics fixture", { exact: true }).first()).toBeVisible();
  await expect(page.locator(".dp-analytics-view-nav button")).toHaveCount(8);
  await expect(page.locator(".dp-analytics-loading")).toHaveCount(0, { timeout: 15_000 });

  await page.getByRole("button", { name: "Sources", exact: true }).click();
  await expect(page).toHaveURL(/view=sources/);
  await expect(page).toHaveURL(/workspace=browser-analytics-activation/);
  await expect(page.getByRole("heading", { name: "Entry source attribution." })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("analytics remains usable at the required mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto(analyticsUrl);
  await expect(page.getByRole("heading", { name: "Analytics", exact: true })).toBeVisible();
  await expect(page.locator(".dp-analytics-loading")).toHaveCount(0, { timeout: 15_000 });

  const layout = await page.evaluate(() => {
    const nav = document.querySelector<HTMLElement>(".dp-analytics-view-nav");
    const controls = [...document.querySelectorAll<HTMLElement>(".dp-analytics-header-actions a, .dp-analytics-header-actions button, .dp-analytics-controls select")];
    return {
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      navScrollable: Boolean(nav && nav.scrollWidth > nav.clientWidth),
      minimumControlHeight: Math.min(...controls.map((element) => element.getBoundingClientRect().height)),
    };
  });

  expect(layout.pageOverflow).toBeLessThanOrEqual(1);
  expect(layout.navScrollable).toBe(true);
  expect(layout.minimumControlHeight).toBeGreaterThanOrEqual(44);
});
