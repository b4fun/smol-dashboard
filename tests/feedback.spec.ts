import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const theme of ["light", "dark"]) {
  test(`alert variants have names, semantic roles, text and boundary contrast (${theme})`, async ({ page }) => {
    await page.goto(`/iframe.html?id=feedback-alert--all-variants&viewMode=story&globals=theme:${theme}`);
    await expect(page.getByRole("alert", { name: "Unable to load reports" })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(3);
    const alerts = page.locator('[data-slot="alert"]');
    await expect(alerts).toHaveCount(4);
    for (const alert of await alerts.all()) {
      await expect(alert.locator("svg")).toHaveAttribute("aria-hidden", "true");
      const ratios = await alert.evaluate((element) => {
        const style = getComputedStyle(element);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d")!;
        const luminance = (...colors: string[]) => {
          context.clearRect(0, 0, 1, 1);
          for (const color of colors) { context.fillStyle = color; context.fillRect(0, 0, 1, 1); }
          const channels = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3).map((channel) => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const base = style.getPropertyValue("--background");
        const inner = luminance(base, style.backgroundColor);
        const outer = luminance(base);
        const border = luminance(base, style.backgroundColor, style.borderTopColor);
        return [inner, outer].map((surface) => (Math.max(surface, border) + 0.05) / (Math.min(surface, border) + 0.05));
      });
      for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(3);
    }
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/alerts-${theme}.png`, fullPage: true });
  });

  test(`operation results transition between pending, success, failure and retry (${theme})`, async ({ page }) => {
    await page.goto(`/iframe.html?id=feedback-operation-result--interactive&viewMode=story&globals=theme:${theme}`);
    await expect(page.getByRole("status", { name: "Preparing report export" })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(1);
    await page.getByRole("button", { name: "Check progress" }).click();
    await expect(page.getByRole("status", { name: "Report ready to download" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download report" })).toHaveAttribute("download", "quarterly-revenue.csv");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: "Prepare another report" }).click();
    await page.getByRole("button", { name: "Simulate failure" }).click();
    await expect(page.getByRole("alert", { name: "Report export failed" })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Try again" })).toHaveCSS("transition-duration", "0s");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("status", { name: "Preparing report export" })).toBeVisible();
  });

  test(`empty collections expose a named region and keyboard-operable action (${theme})`, async ({ page }) => {
    await page.goto(`/iframe.html?id=feedback-empty-state--with-action&viewMode=story&globals=theme:${theme}`);
    await expect(page.getByRole("region", { name: "No reports yet" })).toBeVisible();
    const create = page.getByRole("button", { name: "Create report" });
    await create.focus();
    await expect(create).not.toHaveCSS("box-shadow", "none");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.keyboard.press("Space");
    await expect(page.getByRole("status", { name: "Report draft created" })).toBeVisible();
    await expect(page.getByRole("region", { name: "No reports yet" })).toHaveCount(0);
  });
}

test("loading skeletons are decorative and do not multiply status announcements", async ({ page }) => {
  await page.goto("/iframe.html?id=feedback-skeleton--report-list&viewMode=story");
  const skeletons = page.locator('[data-slot="skeleton"]');
  await expect(skeletons).toHaveCount(9);
  for (const skeleton of await skeletons.all()) await expect(skeleton).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("status")).toHaveCount(1);
  await expect(page.getByRole("status")).toHaveText("Loading reports…");
  expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
});

test("spinner names and reduced-motion styles remain usable without animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=feedback-spinner--playground&viewMode=story");
  await expect(page.getByRole("status")).toHaveText("Syncing team members");
  await expect(page.locator('[data-slot="spinner"] svg')).toHaveCSS("animation-name", "none");
  await page.goto("/iframe.html?id=feedback-skeleton--report-list&viewMode=story");
  await expect(page.locator('[data-slot="skeleton"]').first()).toHaveCSS("animation-name", "none");
});
