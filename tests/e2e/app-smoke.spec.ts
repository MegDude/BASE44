import { expect, test } from "@playwright/test";

test("@smoke app shell loads", async ({ page }) => {
  await page.goto("/map?mode=partner&tab=map&filter=Dining");
  await expect(page.getByRole("application", { name: "Downtown Austin map" })).toBeVisible();
  await expect(page.getByRole("tablist", { name: "Map bottom navigation" })).toBeVisible();
});
