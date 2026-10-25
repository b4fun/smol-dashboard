import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=components-filter-pills";
for (const theme of ["light", "dark"]) {
  test(`counted filters have pressed states and keyboard operation (${theme})`, async ({ page }) => {
    await page.goto(`${story}--playground&viewMode=story&globals=theme:${theme}`);
    const group = page.getByRole("group", { name: "Filter reports by status" });
    const all = group.getByRole("button", { name: "All, 6 items", exact: true });
    const draft = group.getByRole("button", { name: "Draft, 2 items", exact: true });
    const review = group.getByRole("button", { name: "In review, 2 items", exact: true });
    const archived = group.getByRole("button", { name: "Archived, 0 items", exact: true });
    expect(await draft.evaluate((button) => getComputedStyle(button).fontFamily)).toMatch(/^-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans"/);
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(archived).toBeDisabled();
    await expect(archived).toContainText("0");
    await expect(all.locator("span").filter({ hasText: "6" })).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(draft.locator("span").filter({ hasText: "2" })).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await all.focus();
    await page.keyboard.press("Tab");
    await expect(draft).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(draft).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("status")).toHaveText("Showing 2 reports.");
    await expect(page.getByRole("list", { name: "Reports" }).getByRole("listitem")).toHaveCount(2);
    await expect(group.locator("svg")).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(review).toBeFocused();
    await page.keyboard.press("Space");
    await expect(review).toHaveAttribute("aria-pressed", "true");
    await expect(review).not.toHaveCSS("box-shadow", "none");
    await expect(page.getByRole("list", { name: "Reports" })).toContainText("Project health");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });

  test(`filter buttons wrap in a 320px viewport (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto(`${story}--playground&viewMode=story&globals=theme:${theme}`);
    const group = page.getByRole("group", { name: "Filter reports by status" });
    for (const button of await group.getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(24);
      expect(box!.height).toBeGreaterThanOrEqual(24);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });
}

test("disabled filters cannot change the controlled value", async ({ page }) => {
  await page.goto(`${story}--disabled&viewMode=story`);
  const group = page.getByRole("group", { name: "Filter reports by status" });
  for (const button of await group.getByRole("button").all()) {
    await expect(button).toBeDisabled();
    await button.evaluate((element: HTMLButtonElement) => element.click());
  }
  await expect(group.getByRole("button", { name: "All, 6 items", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toHaveText("Showing 6 reports.");
});

test("option icons stay visible and replace the check mark", async ({ page }) => {
  await page.goto(`${story}--with-icons&viewMode=story`);
  const group = page.getByRole("group", { name: "Filter reports by status" });
  const icons = group.locator("button svg");
  await expect(icons).toHaveCount(5);
  const draft = group.getByRole("button", { name: /^Draft/ });
  const before = await draft.locator("svg path").getAttribute("d");
  await draft.click();
  await expect(draft).toHaveAttribute("aria-pressed", "true");
  await expect(icons).toHaveCount(5);
  expect(await draft.locator("svg path").getAttribute("d")).toBe(before);
  expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
});
