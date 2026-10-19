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
