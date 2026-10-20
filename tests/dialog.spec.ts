import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=feedback-dialog";
const confirmation = "/iframe.html?id=feedback-alert-dialog";

for (const theme of ["light", "dark"]) {
  test(`report dialog labels, validation, nested presets, and submission (${theme})`, async ({ page }) => {
    await page.goto(`${story}--playground&viewMode=story&globals=theme:${theme}`);
    const trigger = page.getByRole("button", { name: "Create report", exact: true, includeHidden: true }).first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Create a report", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription("Turn workspace activity into a shareable document.");
    const name = dialog.getByRole("textbox", { name: /^Report name/ });
    await expect(name).toBeFocused();
    await expect(name).toHaveCSS("outline-width", "2px");
    await expect(name).toHaveAccessibleDescription("Visible to everyone in your workspace.");
    await dialog.getByRole("button", { name: "Create report", exact: true }).click();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription("Visible to everyone in your workspace. Enter a report name.");
    await expect(name).toBeFocused();
    await name.fill("Quarterly revenue");
    await dialog.getByRole("button", { name: "Choose report template" }).focus();
    await page.keyboard.press("ArrowDown");
    const menu = page.getByRole("menu", { name: "Choose report template" });
    await expect(menu).toBeVisible();
    await page.keyboard.press("p");
    await expect(menu.getByRole("menuitemradio", { name: /^Project health/ })).toBeFocused();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.keyboard.press("Enter");
    await expect(menu).toBeHidden();
    const template = dialog.getByRole("textbox", { name: "Template", exact: true });
    await expect(template).toHaveValue("Project health");
    await expect(template).toBeFocused();
    await dialog.getByRole("combobox", { name: "File format" }).selectOption("csv");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/report-dialog-${theme}.png`, fullPage: true });
    await dialog.getByRole("button", { name: "Create report", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("status")).toHaveText('Created "Quarterly revenue" from "Project health" as CSV.');
  });

  test(`dialog contains focus and restores it for all dismissal controls (${theme})`, async ({ page }) => {
    await page.goto(`${story}--playground&viewMode=story&globals=theme:${theme}`);
    const trigger = page.getByRole("button", { name: "Create report", exact: true, includeHidden: true }).first();
    const dialog = page.getByRole("dialog", { name: "Create a report" });
    await trigger.click();
    const input = dialog.getByRole("textbox", { name: /^Report name/ });
    await expect(input).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "Close dialog" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();
    await trigger.evaluate((element: HTMLElement) => element.focus());
    await expect(input).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    for (const name of ["Cancel", "Close dialog"]) {
      await trigger.click();
      await dialog.getByRole("button", { name, exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
    await trigger.click();
    await expect(dialog).toBeVisible();
    await dialog.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));
    await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test(`confirmation defaults to cancellation and requires explicit deletion (${theme})`, async ({ page }) => {
    await page.goto(`${confirmation}--playground&viewMode=story&globals=theme:${theme}`);
    const trigger = page.getByRole("button", { name: "Delete report", exact: true, includeHidden: true }).first();
    await trigger.click();
    const dialog = page.getByRole("alertdialog", { name: "Delete this report?" });
    const cancel = dialog.getByRole("button", { name: "Keep report" });
    await expect(cancel).toBeFocused();
    await expect(dialog).toHaveAccessibleDescription(/This cannot be undone/);
    await page.mouse.click(4, 4);
    await expect(dialog).toBeVisible();
    await cancel.focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("status")).toHaveText("The report is available.");
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await dialog.getByRole("button", { name: "Delete report", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("status")).toHaveText("Report deleted.");
  });

  test(`long dialogs stay within narrow viewports (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`${story}--long-content&viewMode=story&globals=theme:${theme}`);
    await page.getByRole("button", { name: "Create report", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Create a report" });
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(568);
    expect(await dialog.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await dialog.getByRole("button", { name: "Cancel" }).focus();
    await page.keyboard.press("Space");
    await expect(dialog).toBeHidden();
  });
}

for (const route of [story, confirmation]) {
  test(`disabled dialog triggers cannot open (${route})`, async ({ page }) => {
    await page.goto(`${route}--disabled&viewMode=story`);
    const button = page.getByRole("button");
    await expect(button).toBeDisabled();
    await button.evaluate((element: HTMLButtonElement) => element.click());
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
  });
}
