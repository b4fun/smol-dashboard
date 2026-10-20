import { expect, test, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=components-button";

async function controlContrast(button: Locator) {
  return button.evaluate((element) => {
    const style = getComputedStyle(element);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const luminance = (color: string, background: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = background;
      context.fillRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const channels = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3).map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const ratio = (first: number, second: number) => (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    const background = style.getPropertyValue("--background");
    const outside = luminance(background, background);
    const inside = luminance(style.backgroundColor, background);
    const border = luminance(style.borderTopColor, style.backgroundColor);
    const ring = luminance(style.getPropertyValue("--tw-ring-color"), background);
    return [ratio(border, outside), ratio(border, inside), ratio(ring, outside)];
  });
}

for (const theme of ["light", "dark"]) {
  test(`icon actions support keyboard, names, and visible focus (${theme})`, async ({ page }) => {
    await page.goto(`${story}--actions&viewMode=story&globals=theme:${theme}`);
    const group = page.getByRole("group", { name: "Sandbox actions" });
    const pause = group.getByRole("button", { name: "Pause", exact: true });
    const snapshot = group.getByRole("button", { name: "Snapshot", exact: true });
    const more = group.getByRole("button", { name: "More actions", exact: true });
    const status = page.getByRole("status");
    await expect(group.getByRole("button")).toHaveCount(3);
    for (const button of [pause, snapshot, more]) {
      await expect(button).toHaveAttribute("type", "button");
      await expect(button).toHaveCSS("cursor", "pointer");
      await expect(button).toHaveCSS("height", "32px");
      await expect(button.locator('[data-slot="button-icon"]')).toHaveAttribute("aria-hidden", "true");
      await expect(button.locator("svg")).toHaveCSS("width", "16px");
    }
    await expect(more).toHaveCSS("width", "32px");
    await pause.focus();
    await page.keyboard.press("Enter");
    await expect(status).toHaveText("Pause requested.");
    await page.keyboard.press("Tab");
    await expect(snapshot).toBeFocused();
    await page.keyboard.press("Space");
    await expect(status).toHaveText("Snapshot requested.");
    await page.keyboard.press("Tab");
    await expect(more).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(status).toHaveText("More actions requested.");
    await expect(more).not.toHaveCSS("box-shadow", "none");
    for (const ratio of await controlContrast(more)) expect(ratio).toBeGreaterThanOrEqual(3);
    await more.hover();
    const accent = await more.evaluate((element) => getComputedStyle(element).getPropertyValue("--accent").trim());
    await expect(more).toHaveCSS("background-color", accent);
    for (const ratio of await controlContrast(more)) expect(ratio).toBeGreaterThanOrEqual(3);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/button-actions-${theme}.png`, fullPage: true });
  });

  test(`disabled icon actions cannot activate or receive focus (${theme})`, async ({ page }) => {
    await page.goto(`${story}--disabled-actions&viewMode=story&globals=theme:${theme}`);
    const buttons = page.getByRole("group", { name: "Sandbox actions" }).getByRole("button");
    await expect(buttons).toHaveCount(3);
    for (const button of await buttons.all()) {
      await expect(button).toBeDisabled();
      await expect(button).toHaveCSS("cursor", "default");
      await button.evaluate((element: HTMLButtonElement) => { element.click(); element.focus(); });
      await expect(button).not.toBeFocused();
      const bounds = await button.boundingBox();
      await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
    }
    await page.keyboard.press("Tab");
    expect(await buttons.evaluateAll((elements) => elements.includes(document.activeElement as HTMLButtonElement))).toBe(false);
    await expect(page.getByRole("status")).toBeEmpty();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });

  test(`all variants and sizes have accessible names (${theme})`, async ({ page }) => {
    await page.goto(`${story}--all-variants&viewMode=story&globals=theme:${theme}`);
    const buttons = page.getByRole("button");
    await expect(buttons).toHaveCount(24);
    for (const button of await buttons.all()) await expect(button).not.toHaveAccessibleName("");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });
}

test("icon-only sizes are square and labeled", async ({ page }) => {
  for (const [name, pixels] of [["icon-small", 32], ["icon", 36], ["icon-large", 40]] as const) {
    await page.goto(`${story}--${name}&viewMode=story`);
    const button = page.getByRole("button");
    await expect(button).not.toHaveAccessibleName("");
    await expect(button).toHaveCSS("width", `${pixels}px`);
    await expect(button).toHaveCSS("height", `${pixels}px`);
    await expect(button).toHaveText("");
  }
});

test("text-only buttons do not reserve an icon slot", async ({ page }) => {
  await page.goto(`${story}--playground&viewMode=story`);
  const button = page.getByRole("button", { name: "Open dashboard", exact: true });
  await expect(button).toBeVisible();
  await expect(button.locator('[data-slot="button-icon"]')).toHaveCount(0);
});
