import { expect, test } from "@playwright/test";

test("break games: appear during a break and each game is playable", async ({
  page,
}) => {
  await page.goto("/pomodoro");
  await page.getByRole("button", { name: "Skip" }).click();

  const panel = page.getByText("Play while you wait").locator("..");
  await expect(panel).toBeVisible();

  // Memory match: a card can be flipped (default tab).
  await panel.locator("button.relative.size-14").first().click();

  // Reaction test: starting shows the waiting state.
  await panel.getByRole("button", { name: "Reaction test" }).click();
  await panel.getByRole("button", { name: "Start" }).click();
  await expect(panel.getByText("Wait for green...")).toBeVisible();

  // Word scramble: revealing the answer removes the reveal button.
  await panel.getByRole("button", { name: "Word scramble" }).click();
  await panel.getByRole("button", { name: "Reveal answer" }).click();
  await expect(
    panel.getByRole("button", { name: "Reveal answer" }),
  ).toHaveCount(0);
});
