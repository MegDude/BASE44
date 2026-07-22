import { expect, test } from "@playwright/test";

test("@smoke Nina Launch Office stays editorial, responsive, and interactive", async ({ page }) => {
  await page.goto("/nina-launch-office.html");

  await expect(
    page.getByRole("heading", { name: "The places people return to make a city worth staying for." }),
  ).toBeVisible();
  await expect(page.getByText("Six relationships. Two clean pilots. One path to scale.")).toBeVisible();
  await expect(page.getByText("The two known defects are integrated into this build.")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const drawer = page.locator("#relationshipDrawer");
  await expect(drawer).toHaveAttribute("aria-hidden", "true");
  await page.locator("[data-open-target]").first().click();
  await expect(drawer).toHaveAttribute("aria-hidden", "false");
  await expect(drawer.getByText("Copy-ready approval ask")).toBeVisible();
  await drawer.getByRole("button", { name: "Close relationship brief" }).click();
  await expect(drawer).toHaveAttribute("aria-hidden", "true");

  const search = page.getByRole("searchbox", { name: "Search relationship targets" });
  await search.fill("Hai Hospitality");
  await expect(page.locator(".relationship-row")).toHaveCount(1);
  await expect(page.locator(".relationship-row").getByText("Hai Hospitality")).toBeVisible();

  await search.clear();
  await page.getByRole("button", { name: "Needs confirmation" }).click();
  await expect(page.locator(".relationship-row")).not.toHaveCount(0);

  const forbiddenVisualContracts = await page.evaluate(() => ({
    cardClasses: document.querySelectorAll('[class~="card"]').length,
    shadowDeclarations: document.documentElement.innerHTML.match(/box-shadow\s*:/gi)?.length || 0,
    gradientDeclarations: document.documentElement.innerHTML.match(/(?:linear|radial)-gradient\s*\(/gi)?.length || 0,
  }));
  expect(forbiddenVisualContracts).toEqual({
    cardClasses: 0,
    shadowDeclarations: 0,
    gradientDeclarations: 0,
  });
});
