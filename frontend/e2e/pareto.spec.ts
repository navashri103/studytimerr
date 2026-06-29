import { expect, test } from "@playwright/test";

test("pareto: add an item, move it to vital few, chart reflects the split", async ({
  page,
}) => {
  await page.goto("/pareto");
  await page.waitForLoadState("networkidle");

  const input = page.getByPlaceholder("Add a task or topic");
  await input.fill("Read chapter 4");
  await input.press("Enter");

  await expect(page.getByText("Read chapter 4")).toBeVisible();
  await expect(page.getByText("0%", { exact: true })).toBeVisible();

  // Move it into "Vital few" via the move-arrow button on its row.
  const row = page.getByText("Read chapter 4", { exact: true }).locator("..");
  await row.hover();
  await row.getByRole("button", { name: "Move to vital few" }).click();

  await expect(page.getByText("100%", { exact: true })).toBeVisible();
});
