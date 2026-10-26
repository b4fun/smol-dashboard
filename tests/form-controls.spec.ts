import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=forms-field";

for (const theme of ["light", "dark"]) {
  test(`fields associate labels, help, errors, and native required state (${theme})`, async ({ page }) => {
    await page.goto(`${story}--error&viewMode=story&globals=theme:${theme}`);
    const input = page.getByRole("textbox", { name: /^Report name/ });
    await expect(input).toHaveAttribute("required", "");
    await expect(input).toHaveCSS("color-scheme", theme);
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Visible to everyone in your workspace. Enter a report name.");
    await page.getByText("Report name", { exact: false }).first().click();
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS("outline-width", "2px");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });

  test(`preset selection, editing, disabled choices, and focus restoration (${theme})`, async ({ page }) => {
    await page.goto(`${story}--presets&viewMode=story&globals=theme:${theme}`);
    const input = page.getByRole("textbox", { name: "Report template" });
    const trigger = page.getByRole("button", { name: "Choose report template" });
    await input.fill("Team delivery");
    await expect(input).toHaveValue("Team delivery");
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const menu = page.getByRole("menu", { name: "Choose report template" });
    await expect(menu).toBeVisible();
    const inputBounds = await input.evaluate((element) => element.getBoundingClientRect().toJSON());
    const menuBounds = await menu.evaluate((element) => element.getBoundingClientRect().toJSON());
    expect(Math.abs(menuBounds.width - inputBounds.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(menuBounds.x - inputBounds.x)).toBeLessThanOrEqual(1);
    const disabled = menu.getByRole("menuitemradio", { name: /^Audit pack/ });
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await disabled.evaluate((element: HTMLElement) => element.click());
    await expect(input).toHaveValue("Team delivery");
    await page.keyboard.press("End");
    const choice = menu.getByRole("menuitemradio", { name: /^Customer activity/ });
    await expect(choice).toBeFocused();
    await page.keyboard.press("Space");
    await expect(input).toHaveValue("Customer activity");
    await expect(input).toBeFocused();
    await trigger.click();
    await expect(choice).toHaveAttribute("aria-checked", "true");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  test(`form submission uses named native controls (${theme})`, async ({ page }) => {
    await page.goto(`${story}--submission&viewMode=story&globals=theme:${theme}`);
    const name = page.getByRole("textbox", { name: /^Report name/ });
    await page.getByRole("button", { name: "Create report" }).click();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await name.fill("Weekly delivery");
    await page.getByRole("textbox", { name: "Template", exact: true }).fill("Project health");
    const select = page.getByRole("combobox", { name: "File format" });
    await expect(select).toHaveCSS("color-scheme", theme);
    await select.selectOption("csv");
    const data = await page.locator("form").evaluate((element: HTMLFormElement) => Object.fromEntries(new FormData(element)));
    expect(data).toEqual({ name: "Weekly delivery", template: "Project health", format: "csv" });
    await page.getByRole("button", { name: "Create report" }).click();
    await expect(page.getByRole("status")).toHaveText('Created "Weekly delivery" from "Project health" as CSV.');
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });

  test(`busy buttons prevent duplicate requests and preserve their accessible name (${theme})`, async ({ page }) => {
    await page.goto(`/iframe.html?id=components-button--busy-interaction&viewMode=story&globals=theme:${theme}`);
    await page.getByRole("button", { name: "Publish release", exact: true }).click();
    const busy = page.getByRole("button", { name: "Publishing…", exact: true });
    await expect(busy).toBeDisabled();
    await expect(busy).toHaveAttribute("aria-busy", "true");
    await expect(busy.locator('[data-slot="spinner"]')).toHaveAttribute("aria-hidden", "true");
    await busy.evaluate((element: HTMLButtonElement) => element.click());
    await expect(page.getByText("Requests started: 1", { exact: true })).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("Publishing release…");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: "Finish publishing" }).click();
    await expect(page.getByRole("button", { name: "Publish release", exact: true })).toBeEnabled();
    await expect(page.getByRole("status")).toHaveText("Release published.");
  });
}

test("read-only preset input permits selection but not typing", async ({ page }) => {
  await page.goto(`${story}--read-only-preset&viewMode=story`);
  const input = page.getByRole("textbox", { name: "Report template" });
  await expect(input).not.toBeEditable();
  await input.focus();
  await page.keyboard.type("Custom");
  await expect(input).toHaveValue("Executive summary");
  await page.getByRole("button", { name: "Choose report template" }).click();
  await page.getByRole("menuitemradio", { name: /^Project health/ }).click();
  await expect(input).toHaveValue("Project health");
  await expect(input).toBeFocused();
});

test("disabled preset input disables both controls", async ({ page }) => {
  await page.goto(`${story}--disabled-preset&viewMode=story`);
  await expect(page.getByRole("textbox", { name: "Report template" })).toBeDisabled();
  const button = page.getByRole("button", { name: "Choose report template" });
  await expect(button).toBeDisabled();
  await button.evaluate((element: HTMLButtonElement) => element.click());
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("native select supports keyboard selection and disabled options", async ({ page }) => {
  await page.goto("/iframe.html?id=forms-select--playground&viewMode=story");
  const select = page.getByRole("combobox", { name: "File format" });
  const chevron = page.locator('[data-slot="select-chevron"]');
  await expect(chevron).toHaveAttribute("aria-hidden", "true");
  const selectBounds = await select.evaluate((element) => element.getBoundingClientRect().toJSON());
  const chevronBounds = await chevron.evaluate((element) => element.getBoundingClientRect().toJSON());
  expect(Math.abs(selectBounds.right - chevronBounds.right - 12)).toBeLessThanOrEqual(1);
  await select.focus();
  await page.keyboard.press("c");
  await page.keyboard.press("Enter");
  await expect(select).toHaveValue("csv");
  await expect(select.locator('option[value="html"]')).toBeDisabled();
});

test("native select hides the focus outline after a click but keeps it for keyboard focus", async ({ page }) => {
  await page.goto("/iframe.html?id=forms-select--playground&viewMode=story");
  const select = page.getByRole("combobox", { name: "File format" });
  await select.click();
  await expect(select).toHaveCSS("outline-style", "none");
  await page.keyboard.press("ArrowDown");
  await expect(select).toHaveCSS("outline-style", "solid");
  await page.reload();
  await expect(select).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(select).toBeFocused();
  await expect(select).toHaveCSS("outline-style", "solid");
});

test("busy icon-only button retains its explicit accessible name", async ({ page }) => {
  await page.goto("/iframe.html?id=components-button--busy-icon&viewMode=story");
  const button = page.getByRole("button", { name: "Refreshing reports" });
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("status")).toHaveCount(0);
});
