import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=components-dropdown-menu";
const trigger = (page: Page) => page.getByRole("button", { name: "More actions", exact: true, includeHidden: true });
const menu = (page: Page) => page.getByRole("menu", { name: "More actions", exact: true });

for (const theme of ["light", "dark"]) {
  test(`button opens with Enter, Space, and ArrowDown (${theme})`, async ({ page }) => {
    await page.goto(`${story}--playground&viewMode=story&globals=theme:${theme}`);
    const button = trigger(page);
    await expect(button).toHaveAttribute("type", "button");
    await expect(button).toHaveAttribute("aria-haspopup", "menu");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    for (const key of ["Enter", "Space", "ArrowDown"]) {
      await button.focus();
      await page.keyboard.press(key);
      await expect(menu(page)).toBeVisible();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByRole("menuitem", { name: "Open sandbox", exact: true })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(menu(page)).toBeHidden();
      await expect(button).toBeFocused();
    }
    await page.keyboard.press("ArrowDown");
    const duplicate = page.getByRole("menuitem", { name: "Duplicate sandbox", exact: true });
    await page.keyboard.press("ArrowDown");
    await expect(duplicate).toBeFocused();
    await expect(duplicate).toHaveCSS("outline-width", "2px");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitemcheckbox", { name: "Show details" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.getByRole("menuitem", { name: "Delete sandbox" })).toBeFocused();
    await page.keyboard.press("Home");
    await page.keyboard.press("d");
    await expect(duplicate).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(menu(page)).toBeHidden();
    await expect(page.getByRole("status")).toHaveText("Duplicate requested.");
    await expect(button).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Next control" })).toBeFocused();
  });

  test(`click menus support disabled items, choices, and themed submenus (${theme})`, async ({ page }) => {
    await page.goto(`${story}--playground&viewMode=story&globals=theme:${theme}`);
    const button = trigger(page);
    await button.click();
    await expect(menu(page)).toBeVisible();
    const background = await button.evaluate((element) => getComputedStyle(element).getPropertyValue("--background").trim());
    await expect(menu(page)).toHaveCSS("background-color", background);
    const disabled = page.getByRole("menuitem", { name: "Archive sandbox" });
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await expect(disabled).toHaveCSS("cursor", "default");
    await disabled.evaluate((element: HTMLElement) => element.click());
    await expect(menu(page)).toBeVisible();
    await expect(page.getByRole("status", { includeHidden: true })).toHaveText("No action selected.");
    const checkbox = page.getByRole("menuitemcheckbox", { name: "Show details" });
    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    await checkbox.focus();
    await page.keyboard.press("Space");
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    const sort = page.getByRole("menuitem", { name: "Sort by", exact: true });
    await sort.hover();
    const submenu = page.getByRole("menu", { name: "Sort by", exact: true });
    await expect(submenu).toBeVisible();
    await expect(submenu).toHaveCSS("background-color", background);
    await expect(submenu.getByRole("menuitemradio", { name: "Name", exact: true })).toHaveAttribute("aria-checked", "true");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/dropdown-menu-${theme}.png`, fullPage: true });
    await submenu.getByRole("menuitemradio", { name: "Created", exact: true }).click();
    await expect(menu(page)).toBeHidden();
    await expect(page.getByRole("status")).toHaveText("Sorted by created.");
    await expect(button).toBeFocused();
    await button.click();
    await sort.hover();
    await expect(submenu).toBeVisible();
    await expect(submenu.getByRole("menuitemradio", { name: "Created", exact: true })).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await expect(menu(page)).toBeHidden();
    await expect(button).toBeFocused();
  });
}

test("disabled button triggers cannot open and are skipped by Tab", async ({ page }) => {
  await page.goto(`${story}--disabled&viewMode=story`);
  const button = trigger(page);
  await expect(button).toBeDisabled();
  await expect(button).toHaveCSS("cursor", "default");
  await button.evaluate((element: HTMLButtonElement) => { element.click(); element.focus(); });
  await expect(menu(page)).toHaveCount(0);
  await expect(button).not.toBeFocused();
  const bounds = await button.boundingBox();
  await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await expect(menu(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Snapshot", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Next control" })).toBeFocused();
});

test("text triggers and asChild links retain native semantics", async ({ page }) => {
  await page.goto(`${story}--text-trigger&viewMode=story`);
  const button = page.getByRole("button", { name: "Actions", exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
  const open = page.getByRole("menuitem", { name: "Open sandbox", exact: true });
  await expect(open).toHaveAttribute("href", "#sandbox-running");
  await expect(open.locator("svg")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#sandbox-running$/);
  await expect(page.getByRole("status")).toHaveText("Opened sandbox.");
  await expect(button).toBeFocused();
});

test("outside dismissal restores the trigger", async ({ page }) => {
  await page.goto(`${story}--playground&viewMode=story`);
  await trigger(page).click();
  await expect(menu(page)).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(menu(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();
  await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
});

test("indeterminate state has a visible mixed-state indicator", async ({ page }) => {
  await page.goto(`${story}--indeterminate&viewMode=story`);
  await trigger(page).click();
  const checkbox = page.getByRole("menuitemcheckbox", { name: "Show details" });
  await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  await expect(checkbox.locator("path")).toHaveAttribute("d", "M3 8h10");
  await checkbox.click();
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
});

for (const dir of ["ltr", "rtl"]) {
  test(`dropdowns and submenus fit narrow viewport edges (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto(`${story}--at-viewport-edge&viewMode=story&globals=theme:dark&args=dir:${dir}`);
    await trigger(page).click();
    const sort = page.getByRole("menuitem", { name: "Sort by", exact: true });
    await sort.focus();
    await page.keyboard.press(dir === "ltr" ? "ArrowRight" : "ArrowLeft");
    const submenu = page.getByRole("menu", { name: "Sort by", exact: true });
    await expect(submenu).toBeVisible();
    for (const content of [menu(page), submenu]) {
      const bounds = await content.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(812);
    }
    await submenu.getByRole("menuitemradio", { name: "Created", exact: true }).click();
    await expect(menu(page)).toBeHidden();
    await expect(page.getByRole("status")).toHaveText("Sorted by created.");
  });
}

test("menu frame stays unchanged as focus and pointer move between rows", async ({ page }) => {
  await page.goto(`${story}--playground&viewMode=story`);
  await trigger(page).click();
  const content = menu(page);
  const frame = () => content.evaluate((element) => {
    const style = getComputedStyle(element);
    return { border: style.border, shadow: style.boxShadow, outline: style.outline };
  });
  await expect(content).toHaveCSS("border-top-width", "1px");
  const initial = await frame();
  await page.keyboard.press("ArrowDown");
  expect(await frame()).toEqual(initial);
  for (const name of ["Duplicate sandbox", "Open sandbox", "Delete sandbox"]) {
    await page.getByRole("menuitem", { name, exact: true }).hover();
    expect(await frame()).toEqual(initial);
  }
});

test.describe("touch", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });

  test("tap opens a dropdown and item selection restores the button", async ({ page }) => {
    await page.goto(`${story}--playground&viewMode=story`);
    await trigger(page).tap();
    await expect(menu(page)).toBeVisible();
    await page.getByRole("menuitem", { name: "Duplicate sandbox", exact: true }).tap();
    await expect(menu(page)).toBeHidden();
    await expect(page.getByRole("status")).toHaveText("Duplicate requested.");
    await expect(trigger(page)).toBeFocused();
  });
});
