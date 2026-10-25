import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=layout-app-shell--default&viewMode=story";

for (const theme of ["light", "dark"]) {
  test(`desktop navigation and accessibility (${theme})`, async ({ page }) => {
    await page.goto(`${story}&globals=theme:${theme}`);
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    const toggle = page.getByRole("button", { name: /sidebar/ });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(nav).toBeVisible();
    await expect(page.locator('[data-slot="app-shell-sidebar"]')).toHaveCSS("width", "56px");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(nav.getByRole("link", { name: "Overview" })).toBeVisible();
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(nav.getByRole("link", { name: "Overview" })).toBeFocused();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/app-shell-collapsed-${theme}.png`, fullPage: true });
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(nav).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toHaveCSS("cursor", "pointer");
    await expect(toggle).not.toHaveCSS("box-shadow", "none");
    await expect(page.locator('[data-slot="app-shell-brand"] a')).toHaveCSS("opacity", "1");
    const results = await new AxeBuilder({ page }).include("#storybook-root").analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({ path: `test-results/app-shell-${theme}.png`, fullPage: true });
  });
}

test("mobile navigation disclosure and skip link", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(story);
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav).toBeHidden();
  const toggle = page.getByRole("button", { name: /navigation/ });
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(nav).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Enter");
  await expect(nav).toBeHidden();
  await toggle.click();
  await nav.getByRole("link", { name: "Projects" }).click();
  await expect(nav).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  await page.screenshot({ path: "test-results/app-shell-mobile.png", fullPage: true });
});

test("sidebar transition respects reduced motion", async ({ page }) => {
  await page.goto(story);
  const sidebar = page.locator('[data-slot="app-shell-sidebar"]');
  const brand = sidebar.locator('[data-slot="app-shell-brand"] a');
  await expect(brand).toHaveCSS("white-space", "nowrap");
  await expect(brand).toHaveCSS("overflow-x", "hidden");
  await expect(sidebar).toHaveCSS("transition-property", "width");
  await expect(sidebar).toHaveCSS("transition-duration", "0.2s");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(sidebar).toHaveCSS("transition-property", "none");
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(sidebar).toHaveCSS("width", "56px");
  await expect(brand).toHaveCSS("display", "flex");
  await expect(brand).toHaveCSS("visibility", "hidden");
});

test("collapsed sidebar shows the brand icon and reveals the toggle on hover", async ({ page }) => {
  await page.goto("/iframe.html?id=layout-app-shell--with-brand-icon&viewMode=story");
  const toggle = page.getByRole("button", { name: "Expand sidebar" });
  const icon = toggle.locator('[data-slot="app-shell-brand-icon"]');
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(icon).toBeVisible();
  await toggle.hover();
  await expect(icon).toBeHidden();
  await page.mouse.move(600, 400);
  await expect(icon).toBeVisible();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Collapse sidebar" })).toHaveAttribute("aria-expanded", "true");
  await expect(icon).toHaveCount(0);
  expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
});

test("active item has balanced sidebar gutters", async ({ page }) => {
  await page.goto(story);
  const item = await page.getByRole("link", { name: "Overview" }).boundingBox();
  const panel = await page.locator('[data-slot="app-shell-content"]').locator("..").boundingBox();
  expect(Math.abs(item!.x - (panel!.x - item!.x - item!.width))).toBeLessThan(0.5);
});

test("sidebar items keep their position while collapsing", async ({ page }) => {
  await page.goto(story);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const positions = () => nav.evaluate((element) => [...element.querySelectorAll("h2, a")].map((item) => {
    const box = item.getBoundingClientRect();
    const icon = item.querySelector("[aria-hidden]")?.getBoundingClientRect();
    return { y: box.y, height: box.height, iconX: icon?.x };
  }));
  const expanded = await positions();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator('[data-slot="app-shell-sidebar"]')).toHaveCSS("width", "56px");
  expect(await positions()).toEqual(expanded);
});

test("shell fills available height and content scrolls independently", async ({ page }) => {
  await page.goto(story);
  const main = page.getByRole("main");
  const header = page.locator('[data-slot="app-shell-header"]');
  const initialHeader = await header.boundingBox();
  const bounds = await main.boundingBox();
  expect(bounds).not.toBeNull();
  expect(Math.abs(bounds!.y + bounds!.height - (page.viewportSize()!.height - 9))).toBeLessThan(2);
  await main.evaluate((element) => {
    const content = document.createElement("div");
    content.style.height = "2000px";
    content.textContent = "Long page content";
    element.append(content);
    element.scrollTop = 500;
  });
  expect(await main.evaluate((element) => element.scrollTop)).toBe(500);
  expect(await header.boundingBox()).toEqual(initialHeader);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(page.viewportSize()!.height);
});

for (const width of [1280, 375]) {
  test(`breadcrumb header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("/iframe.html?id=layout-app-shell--with-breadcrumbs&viewMode=story");
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb", exact: true });
    await expect(breadcrumb.getByRole("link")).toHaveCount(1);
    await breadcrumb.focus();
    await expect(breadcrumb.getByRole("link")).toHaveCount(1);
    await breadcrumb.getByRole("link", { name: "Workspace" }).focus();
    await page.keyboard.press("Tab");
    await expect(breadcrumb.getByRole("button", { name: "Show intermediate pages" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(breadcrumb.getByRole("link")).toHaveCount(2);
    await expect(breadcrumb.getByRole("link").nth(0)).toHaveAccessibleName("Workspace");
    await expect(breadcrumb.getByRole("link").nth(1)).toHaveAccessibleName("Website refresh");
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText("Website refresh — Review the launch checklist");
    const parent = breadcrumb.getByRole("link", { name: "Workspace" });
    await parent.focus();
    await page.keyboard.press("Tab");
    await expect(breadcrumb.getByRole("link", { name: "Website refresh" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#website-refresh$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/breadcrumb-${width}.png`, fullPage: true });
  });
}

for (const theme of ["light", "dark"]) {
  test(`collapsed breadcrumbs and pinned actions (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/iframe.html?id=layout-app-shell-header--multiple-levels&viewMode=story&globals=theme:${theme}`);
    const nav = page.getByRole("navigation", { name: "Breadcrumb", exact: true });
    const expand = nav.getByRole("button", { name: "Show intermediate pages", includeHidden: true });
    const actions = page.locator('[data-slot="app-shell-header-actions"]');
    await expect(nav.getByRole("link")).toHaveCount(1);
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await expect(nav.locator('[aria-current="page"]')).toHaveText("Launch checklist");
    const initialActions = await actions.boundingBox();
    await nav.getByRole("link", { name: "Workspace" }).hover();
    await expect(nav.getByRole("link")).toHaveCount(1);
    await nav.locator('[aria-current="page"]').hover();
    await expect(nav.getByRole("link")).toHaveCount(1);
    await expand.hover();
    await expect(nav.getByRole("link")).toHaveCount(3);
    await expect(expand).toBeHidden();
    await page.mouse.move(0, 0);
    await expect(nav.getByRole("link")).toHaveCount(1);
    await expand.focus();
    await page.keyboard.press("Enter");
    await expect(nav.getByRole("link")).toHaveCount(3);
    await expect(nav.getByRole("link", { name: "Projects" })).toBeFocused();
    await nav.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    expect(await nav.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    expect(await actions.boundingBox()).toEqual(initialActions);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(nav.getByRole("link", { name: "Workspace" })).toBeFocused();
    await expect(nav.getByRole("link")).toHaveCount(1);
    await expect(expand).toHaveAttribute("aria-expanded", "false");
  });
}
