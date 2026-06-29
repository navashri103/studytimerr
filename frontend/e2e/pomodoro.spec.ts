import { expect, test } from "@playwright/test";

test("pomodoro: start, pause, reset, and skip through a phase transition", async ({
  page,
}) => {
  await page.goto("/pomodoro");

  await expect(page.getByText("Focus", { exact: true })).toBeVisible();
  await expect(page.getByText("25:00")).toBeVisible();

  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Start" })).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByText("25:00")).toBeVisible();

  // Skip advances focus -> shortBreak, and the break-games panel appears.
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByText("Short break", { exact: true })).toBeVisible();
  await expect(page.getByText("05:00")).toBeVisible();
  await expect(page.getByText("Play while you wait")).toBeVisible();
});
