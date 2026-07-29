import { expect, test } from "@playwright/test";

const organizationId = "demo-org-legends-real-estate";

test("legacy reports route preserves context and requires partner authentication", async ({ page }) => {
  await page.goto(`/app/workspace/reports?organizationId=${organizationId}&provisioned=1`);

  await expect(page).toHaveURL(new RegExp(
    `/partners/sign-in\\?returnTo=.*partner-workspace%2Freports.*organizationId%3D${organizationId}`,
  ));
  await expect(page.locator('[data-workspace-view="reports"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Partner sign in" })).toBeVisible();
});

test("Ask the Map preserves organization context behind partner authentication", async ({ page }) => {
  await page.goto(`/workspace/assistant?organizationId=${organizationId}&provisioned=1`);

  await expect(page).toHaveURL(new RegExp(
    `/partners/sign-in\\?returnTo=.*partner-workspace%2Fassistant.*organizationId%3D${organizationId}`,
  ));
  await expect(page.locator('[data-workspace-view="assistant"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Partner sign in" })).toBeVisible();
});
