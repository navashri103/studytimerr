import { test as setup } from "@playwright/test";

const AUTH_FILE = "playwright/.auth/user.json";

// Uses a pre-existing verified test account rather than signing up fresh on
// every run — signup now requires email confirmation, so creating a new
// account each run would hang waiting for a verification email.
const TEST_EMAIL = "studytimer.devtest3@gmail.com";
const TEST_PASSWORD = "TestPassword123!";

setup("log in with the test account and save the session", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("Email").fill(TEST_EMAIL);
  await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();

  await page.waitForFunction(() => window.location.pathname === "/");
  await page.context().storageState({ path: AUTH_FILE });
});
