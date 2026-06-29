import { expect, test } from "@playwright/test";

test("parkinsons: set up a custom task and deadline, then start/pause/reset", async ({
  page,
}) => {
  await page.goto("/parkinsons");

  await page
    .getByLabel("What are you working on?")
    .fill("Outline the essay");
  await page.getByLabel("Give yourself this many minutes").fill("2");
  await page.getByRole("button", { name: "Start the deadline" }).click();

  await expect(page.getByText("Outline the essay")).toBeVisible();
  await expect(page.getByText("02:00")).toBeVisible();

  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Start" })).toBeVisible();

  await page.getByRole("button", { name: "New task" }).click();
  await expect(
    page.getByLabel("What are you working on?"),
  ).toBeVisible();
});
