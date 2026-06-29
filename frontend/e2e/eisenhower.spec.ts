import { expect, test } from "@playwright/test";

test("eisenhower: add a task in every quadrant independently", async ({
  page,
}) => {
  await page.goto("/eisenhower");

  const addInputs = page.getByPlaceholder("Add a task");
  await expect(addInputs).toHaveCount(4);

  const labels = ["Do task", "Decide task", "Delegate task", "Delete task"];
  for (let i = 0; i < labels.length; i++) {
    await addInputs.nth(i).fill(labels[i]);
    await addInputs.nth(i).press("Enter");
  }

  for (const label of labels) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
});

test("eisenhower: edit, complete, delete a task, then save to a results view", async ({
  page,
}) => {
  await page.goto("/eisenhower");

  const doInput = page.getByPlaceholder("Add a task").first();
  await doInput.fill("Ship the report");
  await doInput.press("Enter");
  await expect(page.getByText("Ship the report", { exact: true })).toBeVisible();

  // Edit: click the task text to turn it into an input, retype, commit with Enter.
  await page.getByText("Ship the report", { exact: true }).click();
  const editInput = page.locator("input").first();
  await editInput.fill("Ship the final report");
  await editInput.press("Enter");
  await expect(
    page.getByText("Ship the final report", { exact: true }),
  ).toBeVisible();

  // Complete: toggle the checkbox, expect strike-through styling.
  await page.getByRole("button", { name: "Mark as completed" }).click();
  await expect(
    page.getByText("Ship the final report", { exact: true }),
  ).toHaveClass(/line-through/);

  // Save -> read-only Results view shows the same task.
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Click a task to mark it done.")).toBeVisible();
  await expect(
    page.getByText("Ship the final report", { exact: true }),
  ).toBeVisible();

  // Back to editing, then delete the task. Wait for the edit view (with its
  // add-task inputs) to fully mount before interacting — the AnimatePresence
  // exit/enter transition briefly leaves the read-only results row in the DOM.
  await page.getByRole("button", { name: "Edit board" }).click();
  await expect(page.getByPlaceholder("Add a task").first()).toBeVisible();

  const taskRow = page
    .getByText("Ship the final report", { exact: true })
    .locator("..");
  await taskRow.hover();
  await taskRow.getByRole("button").last().click();
  await expect(
    page.getByText("Ship the final report", { exact: true }),
  ).toHaveCount(0);
});
