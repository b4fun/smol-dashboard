import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=components-status-indicator";

for (const theme of ["light", "dark"]) {
  test(`status names, hollow appearance, and contrast (${theme})`, async ({ page }) => {
    await page.goto(`${story}--all-statuses&viewMode=story&globals=theme:${theme}`);
    const indicators = page.getByRole("img");
    await expect(indicators).toHaveCount(4);
    for (const name of ["Success", "Failed", "Warning", "Neutral"]) {
      const indicator = page.getByRole("img", { name, exact: true });
      await expect(indicator).toBeVisible();
      await expect(indicator).toHaveCSS("border-top-width", "2px");
      await expect(indicator).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      expect(await indicator.evaluate((element) => element.tabIndex)).toBe(-1);
      const contrast = await indicator.evaluate((element) => {
        const style = getComputedStyle(element);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d")!;
        const luminance = (color: string) => {
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          const channels = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3).map((channel) => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const border = luminance(style.borderTopColor);
        const background = luminance(style.getPropertyValue("--background"));
        return (Math.max(border, background) + 0.05) / (Math.min(border, background) + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(3);
    }
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/status-indicator-${theme}.png`, fullPage: true });
  });
}

test("sizes preserve the hollow ring", async ({ page }) => {
  await page.goto(`${story}--sizes&viewMode=story`);
  const indicators = page.getByRole("img");
  for (const [index, pixels] of [12, 14, 16].entries()) {
    await expect(indicators.nth(index)).toHaveCSS("width", `${pixels}px`);
    await expect(indicators.nth(index)).toHaveCSS("height", `${pixels}px`);
    await expect(indicators.nth(index)).toHaveCSS("border-top-width", "2px");
  }
});

test("consumers can override the accessible name", async ({ page }) => {
  await page.goto(`${story}--custom-label&viewMode=story`);
  await expect(page.getByRole("img", { name: "Deployment successful", exact: true })).toBeVisible();
});

test("decorative indicators leave the visible status text accessible", async ({ page }) => {
  await page.goto(`${story}--decorative&viewMode=story`);
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(page.locator('[data-slot="status-indicator"]')).toBeVisible();
  await expect(page.getByText("Deployment successful", { exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
});
