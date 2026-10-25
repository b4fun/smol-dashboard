import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=components-collapsible-list";
const triggers = '[data-slot="collapsible-list-trigger"]';

for (const theme of ["light", "dark"]) {
  test(`independent disclosures and keyboard navigation (${theme})`, async ({ page }) => {
    await page.goto(`${story}--linked-items&viewMode=story&globals=theme:${theme}`);
    const running = page.locator(triggers).nth(0);
    const paused = page.locator(triggers).nth(1);
    const runningLink = page.getByRole("link", { name: "sandbox-running", exact: true });
    const pausedLink = page.getByRole("link", { name: "sandbox-paused", exact: true });
    await expect(running).toHaveAccessibleName("Running 1 item");
    await expect(runningLink).toBeVisible();
    await expect(pausedLink).toBeVisible();
    await expect(running).toHaveCSS("cursor", "pointer");
    await expect(running).toHaveCSS("user-select", "none");
    await running.focus();
    await page.keyboard.press("Enter");
    await expect(runningLink).toBeHidden();
    await expect(pausedLink).toBeVisible();
    await expect(running).toBeFocused();
    await expect(running).toHaveCSS("outline-style", "solid");
    await expect(running).toHaveCSS("outline-width", "2px");
    await page.keyboard.press("Tab");
    await expect(paused).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Space");
    await expect(runningLink).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(runningLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#sandbox-running$/);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await running.click();
    await expect(runningLink).toBeHidden();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });

  for (const width of [320, 1280]) {
    test(`long content wraps in narrow containers at ${width}px (${theme})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      await page.goto(`${story}--narrow&viewMode=story&globals=theme:${theme}`);
      const item = page.locator('[data-slot="collapsible-list-item"]');
      const trailing = page.locator('[data-slot="collapsible-list-trailing"]');
      const leading = page.locator('[data-slot="collapsible-list-leading"]');
      await expect(item).toBeVisible();
      await expect(trailing).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await item.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      const title = item.locator(".text-sm.font-medium");
      const titleBounds = await title.boundingBox();
      const leadingBounds = await leading.boundingBox();
      const trailingBounds = await trailing.boundingBox();
      expect(leadingBounds!.y - titleBounds!.y).toBeGreaterThanOrEqual(0);
      expect(leadingBounds!.y - titleBounds!.y).toBeLessThan(4);
      expect(trailingBounds!.y).toBeGreaterThan(titleBounds!.y + titleBounds!.height);
      expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
      await page.screenshot({ path: `test-results/collapsible-list-narrow-${width}-${theme}.png`, fullPage: true });
    });
  }
}

test("groups can start collapsed and expand by pointer", async ({ page }) => {
  await page.goto(`${story}--collapsed&viewMode=story`);
  const groups = page.locator('[data-slot="collapsible-list-group"]');
  await expect(groups).toHaveCount(3);
  await expect(page.getByRole("list")).toHaveCount(0);
  await page.locator(triggers).nth(1).click();
  await expect(page.getByRole("list", { name: "Paused", exact: true })).toBeVisible();
  await expect(page.getByRole("list")).toHaveCount(1);
});

test("empty groups retain an operable disclosure and zero count", async ({ page }) => {
  await page.goto(`${story}--empty-group&viewMode=story`);
  const trigger = page.locator(triggers);
  const empty = page.getByText("No sandboxes queued.");
  await expect(trigger).toHaveAccessibleName("Queued 0 items");
  await expect(empty).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(empty).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(empty).toBeVisible();
  expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
});

test("counts reflect the items in each group", async ({ page }) => {
  await page.goto(`${story}--multiple-items&viewMode=story`);
  await expect(page.locator(triggers).nth(0)).toHaveAccessibleName("Running 2 items");
  await expect(page.getByRole("list", { name: "Running", exact: true }).getByRole("listitem")).toHaveCount(2);
});

test("chevrons respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${story}--default&viewMode=story`);
  await expect(page.locator(triggers).nth(0).locator("svg")).toHaveCSS("transition-property", "none");
});

for (const variant of ["default", "linked-items"]) {
  test(`leading indicator is centered on the title (${variant})`, async ({ page }) => {
    await page.goto(`${story}--${variant}&viewMode=story`);
    const offset = await page.locator('[data-slot="collapsible-list-item"]').first().evaluate((item) => {
      const center = (element: Element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.y + bounds.height / 2;
      };
      const title = item.querySelector("a") ?? item.querySelector(".font-medium")!;
      return Math.abs(center(item.querySelector('[data-slot="status-indicator"]')!) - center(title));
    });
    expect(offset).toBeLessThan(0.5);
  });
}

test("linked rows are clickable without underlining the title", async ({ page }) => {
  await page.goto(`${story}--linked-items&viewMode=story`);
  const link = page.getByRole("link", { name: "sandbox-running", exact: true });
  const row = page.locator('[data-slot="collapsible-list-item"]').filter({ has: link });
  await link.hover();
  await expect(link).toHaveCSS("text-decoration-line", "none");
  await expect(row).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const bounds = (await row.boundingBox())!;
  await row.click({ position: { x: bounds.width - 16, y: bounds.height - 8 } });
  await expect(page).toHaveURL(/#sandbox-running$/);
  await page.locator(triggers).nth(0).focus();
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  await expect(row).toHaveCSS("outline-style", "solid");
  await expect(row).toHaveCSS("outline-width", "2px");
});
