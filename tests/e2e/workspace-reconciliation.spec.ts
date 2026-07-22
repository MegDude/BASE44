import { expect, test } from "@playwright/test";

const organizationId = "demo-org-legends-real-estate";

test("legacy reports route enters the canonical workspace without UI regressions", async ({ page }) => {
  await page.goto(`/app/workspace/reports?organizationId=${organizationId}&provisioned=1`);

  await expect(page).toHaveURL(new RegExp(`/partner-workspace/reports\\?.*organizationId=${organizationId}`));
  await expect(page.locator('[data-workspace-view="reports"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "See what is working and what to do next." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search Downtown Perks" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Go back" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Close workspace" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Back", exact: true })).toHaveCount(0);

  const layout = await page.evaluate(() => {
    const isVisible = (element: Element) => {
      const style = window.getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0;
    };

    const structuralSelector = [
      ".dp-partner-workspace-page section",
      ".dp-partner-workspace-page article",
      ".dp-partner-workspace-page [role='dialog']",
      ".dp-partner-workspace-page [class*='panel']",
      ".dp-partner-workspace-page [class*='drawer']",
      ".dp-partner-workspace-page [class*='card']",
    ].join(",");

    const surfaceViolations = Array.from(document.querySelectorAll(structuralSelector))
      .filter(isVisible)
      .map((element) => {
        const style = window.getComputedStyle(element);
        return {
          className: String(element.className),
          radius: Number.parseFloat(style.borderRadius),
          background: style.backgroundColor,
        };
      })
      .filter(({ radius, background }) =>
        radius > 0 || !["rgb(255, 255, 255)", "rgba(0, 0, 0, 0)"].includes(background),
      );

    return {
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      surfaceViolations,
    };
  });

  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.surfaceViolations).toEqual([]);
});

test("Ask the Map has a canonical route and keeps organization context", async ({ page }) => {
  await page.goto(`/workspace/assistant?organizationId=${organizationId}&provisioned=1`);

  await expect(page).toHaveURL(new RegExp(`/partner-workspace/assistant\\?.*organizationId=${organizationId}`));
  await expect(page.locator('[data-workspace-view="assistant"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Decide what to do next." })).toBeVisible();
  await expect(page.getByPlaceholder("Which listing or campaign should we improve first?")).toBeVisible();
});
