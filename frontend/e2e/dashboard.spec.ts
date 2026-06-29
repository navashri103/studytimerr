import { expect, test } from "@playwright/test";

test("dashboard links to every technique page and back", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "StudyTimer" })).toBeVisible();

  const routes: { name: RegExp; path: string; heading: RegExp }[] = [
    { name: /Pomodoro Technique/, path: "/pomodoro", heading: /Pomodoro Technique/ },
    { name: /Eisenhower Matrix/, path: "/eisenhower", heading: /Eisenhower Matrix/ },
    { name: /Pareto Analysis/, path: "/pareto", heading: /Pareto Analysis/ },
    { name: /Parkinson's Law/, path: "/parkinsons", heading: /Parkinson's Law/ },
  ];

  for (const route of routes) {
    await page.goto("/");
    await page.getByRole("link", { name: route.name }).click();
    await expect(page).toHaveURL(route.path);
    await expect(
      page.getByRole("heading", { name: route.heading }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Back to dashboard" }).click();
    await expect(page).toHaveURL("/");
  }
});
