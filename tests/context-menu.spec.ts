import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=components-context-menu";
const surface = (page: Page) => page.getByRole("region", { name: "Project context actions", exact: true, includeHidden: true });
const rootMenu = (page: Page) => page.getByRole("menu", { name: "Project actions", exact: true });

async function openWithKeyboard(page: Page, name = "playground", theme = "light") {
  await page.goto(`${story}--${name}&viewMode=story&globals=theme:${theme}`);
  const trigger = surface(page);
  await trigger.focus();
  await page.keyboard.press("Shift+F10");
  await expect(rootMenu(page)).toBeVisible();
  return trigger;
}

for (const theme of ["light", "dark"]) {
  test(`keyboard navigation, typeahead, selection, and focus restoration (${theme})`, async ({ page }) => {
    const trigger = await openWithKeyboard(page, "playground", theme);
    const menu = rootMenu(page);
    const open = menu.getByRole("menuitem", { name: "Open project", exact: true });
    const duplicate = menu.getByRole("menuitem", { name: "Duplicate project", exact: true });
    await expect(open).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(duplicate).toBeFocused();
    await expect(duplicate).toHaveCSS("outline-width", "2px");
    await expect(duplicate).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("ArrowDown");
    await expect(menu.getByRole("menuitemcheckbox", { name: "Show details" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(menu.getByRole("menuitem", { name: "Delete project" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(open).toBeFocused();
    await page.keyboard.press("d");
    await expect(duplicate).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("status")).toHaveText("Duplicate requested.");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Next control" })).toBeFocused();
  });

  test(`right-click, disabled items, theme, and accessibility (${theme})`, async ({ page }) => {
    await page.goto(`${story}--playground&viewMode=story&globals=theme:${theme}`);
    const trigger = surface(page);
    await trigger.click();
    await expect(rootMenu(page)).toHaveCount(0);
    await trigger.click({ button: "right" });
    const menu = rootMenu(page);
    await expect(menu).toBeVisible();
    await expect(menu).toBeFocused();
    const background = await trigger.evaluate((element) => getComputedStyle(element).getPropertyValue("--background").trim());
    await expect(menu).toHaveCSS("background-color", background);
    const disabled = menu.getByRole("menuitem", { name: "Archive project" });
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await expect(disabled).toHaveCSS("cursor", "default");
    await disabled.evaluate((element: HTMLElement) => element.click());
    await expect(menu).toBeVisible();
    await expect(page.getByRole("status", { includeHidden: true })).toHaveText("No action selected.");
    await page.keyboard.press("ArrowDown");
    await expect(menu.getByRole("menuitem", { name: "Open project" })).toBeFocused();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/context-menu-${theme}.png`, fullPage: true });
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test(`checkboxes, radio submenus, and the ContextMenu key (${theme})`, async ({ page }) => {
    const trigger = await openWithKeyboard(page, "playground", theme);
    const checkbox = page.getByRole("menuitemcheckbox", { name: "Show details" });
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    await checkbox.focus();
    await page.keyboard.press("Space");
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    await expect(checkbox.locator("svg")).toHaveCount(0);
    await page.keyboard.press("Space");
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    await expect(checkbox.locator("svg")).toBeVisible();
    const sort = page.getByRole("menuitem", { name: "Sort by", exact: true });
    await sort.focus();
    await page.keyboard.press("ArrowRight");
    const submenu = page.getByRole("menu", { name: "Sort by", exact: true });
    const name = submenu.getByRole("menuitemradio", { name: "Name", exact: true });
    const created = submenu.getByRole("menuitemradio", { name: "Created", exact: true });
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-checked", "true");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.keyboard.press("ArrowDown");
    await expect(created).toBeFocused();
    await page.keyboard.press("Space");
    await expect(rootMenu(page)).toBeHidden();
    await expect(page.getByRole("status")).toHaveText("Sorted by created.");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("ContextMenu");
    await expect(rootMenu(page)).toBeVisible();
    await sort.focus();
    await page.keyboard.press("ArrowRight");
    await expect(created).toHaveAttribute("aria-checked", "true");
    await expect(name).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("ArrowLeft");
    await expect(submenu).toBeHidden();
    await expect(sort).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  for (const dir of ["ltr", "rtl"]) {
    test(`menus stay inside a 320px viewport (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 812 });
      await page.goto(`${story}--at-viewport-edge&viewMode=story&globals=theme:${theme}&args=dir:${dir}`);
      const trigger = surface(page);
      const bounds = await trigger.boundingBox();
      await trigger.click({ button: "right", position: { x: bounds!.width - 4, y: bounds!.height - 4 } });
      await expect(rootMenu(page)).toBeVisible();
      await page.getByRole("menuitem", { name: "Sort by", exact: true }).focus();
      await page.keyboard.press(dir === "ltr" ? "ArrowRight" : "ArrowLeft");
      const submenu = page.getByRole("menu", { name: "Sort by", exact: true });
      await expect(submenu).toBeVisible();
      for (const menu of [rootMenu(page), submenu]) {
        const box = await menu.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(320);
        expect(box!.y + box!.height).toBeLessThanOrEqual(812);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await submenu.getByRole("menuitemradio", { name: "Created", exact: true }).click();
      await expect(rootMenu(page)).toBeHidden();
      await expect(page.getByRole("status")).toHaveText("Sorted by created.");
    });
  }
}

test("disabled triggers are skipped by Tab and do not open custom menus", async ({ page }) => {
  await page.goto(`${story}--disabled&viewMode=story`);
  const trigger = surface(page);
  await expect(trigger).toHaveAttribute("aria-disabled", "true");
  await expect(trigger).toHaveAttribute("tabindex", "-1");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Next control" })).toBeFocused();
  await trigger.click({ button: "right" });
  await expect(rootMenu(page)).toHaveCount(0);
  await trigger.focus();
  await page.keyboard.press("Shift+F10");
  await expect(rootMenu(page)).toHaveCount(0);
});

test("modal menus contain focus until dismissal", async ({ page }) => {
  const trigger = await openWithKeyboard(page);
  const open = page.getByRole("menuitem", { name: "Open project" });
  await page.keyboard.press("Tab");
  await expect(open).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(open).toBeFocused();
  await page.getByRole("button", { name: "Next control", includeHidden: true }).evaluate((element: HTMLElement) => element.focus());
  await expect(open).toBeFocused();
  await page.mouse.click(4, 4);
  await expect(rootMenu(page)).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("non-modal outside clicks preserve the newly focused control", async ({ page }) => {
  await page.goto(`${story}--non-modal&viewMode=story`);
  const trigger = surface(page);
  const bounds = await trigger.boundingBox();
  await trigger.click({ button: "right", position: { x: bounds!.width - 4, y: 4 } });
  await expect(rootMenu(page)).toBeVisible();
  const next = page.getByRole("button", { name: "Next control" });
  await next.click();
  await expect(rootMenu(page)).toBeHidden();
  await expect(next).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("Next control activated.");
});

test("indeterminate checkbox state has a non-color indicator", async ({ page }) => {
  await openWithKeyboard(page, "indeterminate");
  const checkbox = page.getByRole("menuitemcheckbox", { name: "Show details" });
  await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  await expect(checkbox.locator("path")).toHaveAttribute("d", "M3 8h10");
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
  await expect(checkbox.locator("path")).toHaveAttribute("d", "m3 8 3 3 7-7");
});

test("asChild items preserve native link navigation and decorative icons", async ({ page }) => {
  const trigger = await openWithKeyboard(page);
  const open = page.getByRole("menuitem", { name: "Open project", exact: true });
  await expect(open).toHaveAttribute("href", "#website-refresh");
  await expect(open.locator('[aria-hidden="true"]').first()).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#website-refresh$/);
  await expect(page.getByRole("status")).toHaveText("Opened project.");
  await expect(trigger).toBeFocused();
});

test("long labels wrap without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await openWithKeyboard(page, "long-labels");
  const item = page.getByRole("menuitem", { name: /Duplicate project-with-a-very-long/ });
  expect(await item.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
});

test.describe("touch", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });

  test("long press opens the menu and Escape restores the surface", async ({ page }) => {
    await page.goto(`${story}--playground&viewMode=story`);
    const trigger = surface(page);
    const bounds = await trigger.boundingBox();
    const session = await page.context().newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: bounds!.x + 20, y: bounds!.y + 20 }] });
    await expect(rootMenu(page)).toBeVisible();
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.keyboard.press("Escape");
    await expect(rootMenu(page)).toBeHidden();
    await expect(trigger).toBeFocused();
    await session.detach();
  });
});
