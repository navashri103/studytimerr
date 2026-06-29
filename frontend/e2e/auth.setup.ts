import { test as setup } from "@playwright/test";

const AUTH_FILE = "playwright/.auth/user.json";

setup("create a test account and save its session", async ({ page }) => {
  await page.goto("/login");
  await page.getByText("Need an account? Sign up").click();

  const email = `pw-e2e-${Date.now()}@gmail.com`;
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Sign up" }).click();

  await page.waitForFunction(() => window.location.pathname === "/");
  await page.context().storageState({ path: AUTH_FILE });
});
