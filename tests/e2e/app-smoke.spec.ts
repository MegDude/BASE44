import { expect, test } from "@playwright/test";

test("@smoke app shell loads", async ({ page }) => {
  await page.goto("/map?mode=partner&tab=map&filter=Dining");
  await expect(page.getByText("Downtown Perks").first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Map bottom navigation" })).toBeVisible();
});
