import { expect, test } from "@playwright/test";

const internalTerms = [
  "Private working system",
  "priority routes",
  "Relationship map",
  "approval routes",
  "Needs confirmation",
  "product defects",
  "PR #75",
  "PR #76",
  "Platform integrity",
  "Behavior contract",
  "QA checklist",
  "Material strategy corrections",
  "Contact verification rules",
];

test("@smoke Founding Partner Collection is a polished public invitation", async ({ page }) => {
  await page.goto("/founding-partners.html");

  await expect(page).toHaveTitle("Downtown Perks · Founding Partner Collection");
  await expect(page.getByRole("heading", { name: "Helping shape a more connected downtown." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Downtown Austin already has remarkable places." })).toBeVisible();
  await expect(page.getByText("What's worth doing next?")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Every partnership starts with one audience." })).toBeVisible();
  await expect(page.getByText("One measurable outcome.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Every pilot is intentionally focused." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start a Founding Partner conversation" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore Downtown Perks" })).toBeVisible();

  const pageText = await page.locator("body").innerText();
  for (const term of internalTerms) expect(pageText).not.toContain(term);

  const layout = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    cardClasses: document.querySelectorAll('[class~="card"]').length,
    shadowDeclarations: document.documentElement.innerHTML.match(/box-shadow\s*:/gi)?.length || 0,
    gradientDeclarations: document.documentElement.innerHTML.match(/(?:linear|radial)-gradient\s*\(/gi)?.length || 0,
    scripts: document.scripts.length,
  }));

  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.cardClasses).toBe(0);
  expect(layout.shadowDeclarations).toBe(0);
  expect(layout.gradientDeclarations).toBe(0);
  expect(layout.scripts).toBe(0);
});

test("@smoke Founding Partner operations require authorized access", async ({ page }) => {
  await page.goto("/partner-workspace/launch?organizationId=demo-org-legends-real-estate");

  if (new URL(page.url()).pathname.startsWith("/partners/sign-in")) {
    await expect(page.getByRole("heading", { name: "Sign in to Downtown Perks." })).toBeVisible();
  } else {
    await expect(page.getByText("Downtown Perks · Founding Partner Collection")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Authorized operations access required|Operations are temporarily unavailable/ }),
    ).toBeVisible();
  }

  const body = page.locator("body");
  await expect(body).not.toContainText("leasing@paseoatx.com");
  await expect(body).not.toContainText("CustomerCare@worthross.com");
  await expect(body).not.toContainText("shawn.bell@fsresidential.com");
});
