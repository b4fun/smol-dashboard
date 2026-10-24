import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = "/iframe.html?id=components-chat";

for (const theme of ["light", "dark"]) {
  test(`streaming response can be stopped (${theme})`, async ({ page }) => {
    await page.goto(`${story}--streaming&viewMode=story&globals=theme:${theme}`);
    const composer = page.getByRole("textbox", { name: "Message" });
    await composer.focus();
    await page.keyboard.press("Enter");
    const stop = page.getByRole("button", { name: "Stop response" });
    await expect(stop).toBeEnabled();
    await expect(page.getByRole("status")).toContainText("Assistant is responding...");
    await expect(page.getByRole("log")).toHaveAttribute("aria-busy", "true");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await stop.focus();
    await expect(stop).toHaveCSS("cursor", "pointer");
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: "Stop response" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Send", exact: true })).toBeDisabled();
    await expect(page.getByRole("status")).toHaveCount(0);
    const reply = page.getByRole("article", { name: "Assistant message" });
    const stopped = await reply.textContent();
    await page.waitForTimeout(400);
    expect(await reply.textContent()).toBe(stopped);
    await composer.fill("Another question");
    await expect(page.getByRole("button", { name: "Send", exact: true })).toBeEnabled();
  });

  test(`conversation follows streaming until the user scrolls away (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 480 });
    await page.goto(`${story}--streaming&viewMode=story&globals=theme:${theme}`);
    const area = page.getByRole("region", { name: "Conversation history" });
    const distance = () => area.evaluate((element) => element.scrollHeight - element.clientHeight - element.scrollTop);
    await page.getByRole("textbox", { name: "Message" }).press("Enter");
    await expect.poll(() => area.evaluate((element) => element.scrollHeight > element.clientHeight + 100)).toBe(true);
    expect(await distance()).toBeLessThanOrEqual(32);
    const composerBox = await page.getByRole("textbox", { name: "Message" }).boundingBox();
    await area.evaluate((element) => { element.scrollTop = 0; });
    const jump = page.getByRole("button", { name: "Jump to latest" });
    await expect(jump).toBeVisible();
    await expect(jump).toHaveCSS("width", "32px");
    await expect(jump).toHaveCSS("cursor", "pointer");
    expect(await page.getByRole("textbox", { name: "Message" }).boundingBox()).toEqual(composerBox);
    const top = await area.evaluate((element) => element.scrollTop);
    await page.waitForTimeout(300);
    expect(await area.evaluate((element) => element.scrollTop)).toBe(top);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await jump.focus();
    await expect(jump).not.toHaveCSS("box-shadow", "none");
    await page.keyboard.press("Enter");
    await expect(jump).toHaveCount(0);
    await expect(area).toBeFocused();
    await expect.poll(distance).toBeLessThanOrEqual(32);
    await page.waitForTimeout(300);
    expect(await distance()).toBeLessThanOrEqual(32);
  });

  test(`response and message errors can be retried (${theme})`, async ({ page }) => {
    await page.goto(`${story}--error-and-retry&viewMode=story&globals=theme:${theme}`);
    await expect(page.getByRole("alert")).toHaveText("Response failed: The assistant service could not be reached.");
    await expect(page.getByText("Message failed: Network unavailable.", { exact: false })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Message" })).toHaveValue("My unsent follow-up stays here.");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    const retryMessage = page.getByRole("button", { name: "Retry message" });
    await expect(retryMessage).toHaveText("Retry");
    await expect(page.getByRole("button", { name: "Retry response" })).toHaveText("Retry");
    await expect(page.getByRole("alert")).toHaveCSS("color", theme === "dark" ? "oklch(0.704 0.191 22.216)" : "oklch(0.505 0.213 27.518)");
    await retryMessage.focus();
    await expect(retryMessage).toHaveCSS("outline-width", "2px");
    await expect(retryMessage).toHaveCSS("cursor", "pointer");
    const errorLine = await page.getByText("Network unavailable.", { exact: false }).boundingBox();
    const retryBox = await retryMessage.boundingBox();
    expect(retryBox!.height).toBeGreaterThanOrEqual(24);
    expect(Math.abs(retryBox!.y + retryBox!.height / 2 - (errorLine!.y + errorLine!.height - 10))).toBeLessThan(14);
    await page.keyboard.press("Enter");
    const retryingMessage = page.getByRole("button", { name: "Retry message: retrying" });
    await expect(retryingMessage).toHaveText("Retrying…");
    await expect(retryingMessage).toBeFocused();
    await expect(retryingMessage).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByRole("status").filter({ hasText: "Retrying…" })).toHaveCount(1);
    await expect(retryingMessage.locator('[data-slot="chat-retry-spinner"]')).toHaveCSS("animation-name", "spin");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.keyboard.press("Enter");
    await expect(page.getByText("Message failed:", { exact: false })).toHaveCount(0);
    const retryResponse = page.getByRole("button", { name: "Retry response" });
    await retryResponse.focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: "Retry response: retrying" })).toHaveText("Retrying…");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("article", { name: "Assistant message" })).toHaveCount(1);
    await expect(page.getByRole("article", { name: "Assistant message" })).toContainText("Retry succeeded.");
    await expect(page.getByRole("textbox", { name: "Message" })).toHaveValue("My unsent follow-up stays here.");
  });

  test(`retry animation respects reduced motion (${theme})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${story}--error-and-retry&viewMode=story&globals=theme:${theme}`);
    await page.getByRole("button", { name: "Retry response" }).click();
    const retrying = page.getByRole("button", { name: "Retry response: retrying" });
    await expect(retrying).toHaveText("Retrying…");
    await expect(retrying.locator('[data-slot="chat-retry-spinner"]')).toHaveCSS("animation-name", "none");
  });

  test(`composer footer can be replaced or removed (${theme})`, async ({ page }) => {
    await page.goto(`${story}--custom-footer&viewMode=story&globals=theme:${theme}`);
    await expect(page.locator('[data-slot="chat-footer"]')).toHaveText("Demo workspace. Messages are not sent to a service.");
    await expect(page.getByText("Press Enter to send", { exact: false })).toHaveCount(0);
    await page.goto(`${story}--without-footer&viewMode=story&globals=theme:${theme}`);
    await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
    await expect(page.locator('[data-slot="chat-footer"]')).toHaveCount(0);
    await expect(page.getByText("AI can make mistakes.", { exact: false })).toHaveCount(0);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });

  test(`expanding tools reserves scrollbar space without shifting layout (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 480 });
    await page.goto(`${story}--tool-use&viewMode=story&globals=theme:${theme}`);
    await page.addStyleTag({ content: '[data-slot="chat-scroll-area"]::-webkit-scrollbar { width: 16px; }' });
    const area = page.locator('[data-slot="chat-scroll-area"]');
    const summary = page.locator('[data-slot="chat-tool-group"] summary');
    const user = page.getByRole("article", { name: "Your message" });
    const composer = page.getByRole("textbox", { name: "Message" });
    const header = page.getByRole("heading", { name: "Smol assistant" });
    const send = page.getByRole("button", { name: "Send", exact: true });
    const bounds = async () => Promise.all([summary, user, composer, header, send].map((element) => element.boundingBox()));
    await expect(area).toHaveCSS("scrollbar-gutter", "stable");
    expect(await area.evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(true);
    const initialWidth = await area.evaluate((element) => element.clientWidth);
    const before = await bounds();
    await summary.click();
    await expect(page.locator('[data-slot="chat-tool-group"]')).toHaveAttribute("open", "");
    expect(await area.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    expect(await area.evaluate((element) => element.clientWidth)).toBe(initialWidth);
    const after = await bounds();
    for (let index = 0; index < before.length; index++) {
      expect(after[index]!.x).toBe(before[index]!.x);
      expect(after[index]!.width).toBe(before[index]!.width);
    }
    expect(after.slice(2)).toEqual(before.slice(2));
    await summary.click();
    expect(await bounds()).toEqual(before);
  });

  test(`tool calls group and update without losing disclosure state (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`${story}--tool-use&viewMode=story&globals=theme:${theme}`);
    const group = page.locator('[data-slot="chat-tool-group"]');
    const summary = group.locator("summary");
    await expect(group).toHaveCount(1);
    await expect(summary).toContainText("3 tool calls: 1 running, 1 completed, 1 failed");
    await expect(page.getByRole("status")).toContainText("Using 1 tool...");
    await expect(page.getByText("Checking component interactions...", { exact: true })).toBeHidden();
    await page.getByRole("region", { name: "Conversation history" }).focus();
    await page.keyboard.press("Tab");
    await expect(summary).toBeFocused();
    await expect(summary).toHaveCSS("outline-width", "2px");
    await page.keyboard.press("Enter");
    await expect(group).toHaveAttribute("open", "");
    await expect(group.getByRole("listitem")).toHaveCount(3);
    await expect(group.getByText("Running", { exact: true })).toBeVisible();
    await expect(group.getByText("Failed", { exact: true })).toBeVisible();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.getByRole("textbox", { name: "Message" }).fill("Follow up");
    await expect(page.getByRole("button", { name: "Send", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Finish tool calls" }).click();
    await expect(summary).toContainText("3 tool calls: 2 completed, 1 failed");
    await expect(group).toHaveAttribute("open", "");
    await expect(group.getByText("All checks passed.", { exact: true })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Send", exact: true })).toBeEnabled();
    await summary.focus();
    await page.keyboard.press("Space");
    await expect(group).not.toHaveAttribute("open");
    await expect(group.getByText("All checks passed.", { exact: true })).toBeHidden();
    await expect(page.getByRole("button", { name: "Jump to latest" })).toHaveCount(0);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("textbox", { name: "Message" })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.goto(`${story}--separate-tool-groups&viewMode=story&globals=theme:${theme}`);
    await expect(page.locator('[data-slot="chat-tool-group"]')).toHaveCount(2);
    await expect(page.locator("summary").first()).toHaveText("1 tool call: 1 completed");
    await expect(page.locator("summary").last()).toHaveText("2 tool calls: 2 completed");
  });

  test(`message info appears below messages on hover and keyboard focus (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`${story}--message-info&viewMode=story&globals=theme:${theme}`);
    const user = page.getByRole("article", { name: "Your message" });
    const info = user.locator('[data-slot="chat-message-info"]');
    await expect(info).toHaveCSS("opacity", "0");
    await user.scrollIntoViewIfNeeded();
    const before = await user.boundingBox();
    await user.hover();
    await expect(info).toHaveCSS("opacity", "1");
    await expect(info).toContainText("Alex");
    await expect(info).toContainText("10:30 AM");
    const infoBounds = (await info.boundingBox())!;
    const contentBounds = (await user.getByText("Can you help me plan a small project?", { exact: true }).boundingBox())!;
    expect(infoBounds.y).toBeGreaterThanOrEqual(contentBounds.y + contentBounds.height);
    expect(await user.boundingBox()).toEqual(before);
    await page.mouse.move(0, 0);
    await expect(info).toHaveCSS("opacity", "0");
    await page.getByRole("region", { name: "Conversation history" }).focus();
    await page.keyboard.press("Tab");
    await expect(user).toBeFocused();
    await expect(user).toHaveCSS("outline-width", "2px");
    await expect(info).toHaveCSS("opacity", "1");
    await page.keyboard.press("Tab");
    const assistant = page.getByRole("article", { name: "Assistant message" }).first();
    await expect(assistant).toBeFocused();
    await expect(assistant.locator('[data-slot="chat-message-info"]')).toHaveCSS("opacity", "1");
    await expect(assistant).toContainText("Example model");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("textbox", { name: "Message" })).toBeFocused();
    await expect(page.locator('[data-slot="chat-message-info"]')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });

  test(`composer toolbar supports multiple buttons (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`${story}--composer-actions&viewMode=story&globals=theme:${theme}`);
    const composer = page.getByRole("textbox", { name: "Message" });
    const context = page.getByRole("button", { name: "Include project context" });
    const changes = page.getByRole("button", { name: "Changes", exact: true });
    const send = page.getByRole("button", { name: "Send", exact: true });
    await composer.focus();
    await page.keyboard.press("Tab");
    await expect(context).toBeFocused();
    await page.keyboard.press("Space");
    await expect(context).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Tab");
    await expect(changes).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(changes).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Voice input (unavailable)" })).toBeDisabled();
    await page.keyboard.press("Tab");
    await expect(send).toBeFocused();
    await expect(send).not.toHaveCSS("box-shadow", "none");
    const toolbar = page.locator('[data-slot="chat-composer-toolbar"]');
    const textareaBounds = (await composer.boundingBox())!;
    const toolbarBounds = (await toolbar.boundingBox())!;
    expect(toolbarBounds.y).toBeGreaterThanOrEqual(textareaBounds.y + textareaBounds.height);
    await page.screenshot({ path: `test-results/chat-composer-actions-${theme}.png` });
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.keyboard.press("Space");
    await expect(page.getByRole("article", { name: "Your message" })).toContainText("Help me review these changes.");
  });

  test(`chat header supports a keyboard-accessible dropdown (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`${story}--header-actions&viewMode=story&globals=theme:${theme}`);
    const trigger = page.getByRole("button", { name: "Choose model: Balanced" });
    const heading = page.getByRole("heading", { name: "Smol assistant" });
    await expect(heading).toBeVisible();
    const titleBounds = (await heading.boundingBox())!;
    const triggerBounds = (await trigger.boundingBox())!;
    expect(triggerBounds.x).toBeGreaterThan(titleBounds.x + titleBounds.width);
    const unfocusedShadow = await trigger.evaluate((element) => getComputedStyle(element).boxShadow);
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveCSS("cursor", "pointer");
    expect(await trigger.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    await expect(trigger).not.toHaveCSS("box-shadow", unfocusedShadow);
    await expect(trigger).not.toHaveCSS("box-shadow", "none");
    await page.keyboard.press("Space");
    await expect(page.getByRole("menuitemradio", { name: "Balanced", exact: true })).toBeFocused();
    await expect(page.getByRole("menuitemradio", { name: "Advanced (coming soon)" })).toBeDisabled();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitemradio", { name: "Fast", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Choose model: Fast" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Choose model: Fast" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("region", { name: "Conversation history" })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test(`chat sends messages accessibly with keyboard input (${theme})`, async ({ page }) => {
    await page.goto(`${story}--playground&viewMode=story&globals=theme:${theme}`);
    const log = page.getByRole("log", { name: "Smol assistant conversation" });
    const composer = page.getByRole("textbox", { name: "Message" });
    const send = page.getByRole("button", { name: "Send" });

    await expect(log).toBeVisible();
    await expect(log.getByRole("article", { name: "Assistant message" })).toHaveCount(1);
    await expect(send).toBeDisabled();
    await expect(send).toHaveCSS("height", "32px");
    const icon = send.locator('[data-slot="button-icon"]');
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    const iconBounds = (await icon.boundingBox())!;
    const sendBounds = (await send.boundingBox())!;
    const composerBounds = (await composer.boundingBox())!;
    expect(Math.abs(iconBounds.y + iconBounds.height / 2 - (sendBounds.y + sendBounds.height / 2))).toBeLessThanOrEqual(1);
    expect(sendBounds.y).toBeGreaterThanOrEqual(composerBounds.y + composerBounds.height);
    expect(sendBounds.x + sendBounds.width).toBeCloseTo(composerBounds.x + composerBounds.width, 0);
    await page.screenshot({ path: `test-results/chat-send-${theme}.png` });
    await composer.fill("Summarize this");
    await expect(composer.locator("..")).toHaveCSS("box-shadow", /.+/);
    await page.keyboard.press("Tab");
    await expect(send).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(composer).toBeFocused();
    await page.keyboard.press("Shift+Enter");
    await composer.pressSequentially("in two lines");
    await expect(composer).toHaveValue("Summarize this\nin two lines");
    expect((await composer.boundingBox())!.height).toBeGreaterThan(40);
    await expect(send).toBeEnabled();
    await composer.press("Enter");

    await expect(log.getByRole("article", { name: "Your message" })).toContainText("Summarize this\nin two lines");
    await expect(page.locator('[data-slot="chat-status"]')).toContainText("Assistant is thinking...");
    await expect(log).toHaveAttribute("aria-busy", "true");
    await expect(page.getByText("This is a UI demo.", { exact: false })).toBeVisible();
    await expect(log).toHaveAttribute("aria-busy", "false");
    await expect(composer).toHaveValue("");
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });

  test(`message rail navigates between prompts (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 640 });
    await page.goto(`${story}--message-navigation&viewMode=story&globals=theme:${theme}`);
    const area = page.getByRole("region", { name: "Conversation history" });
    const nav = page.getByRole("navigation", { name: "Message navigation" });
    const items = nav.getByRole("button");
    await expect(items).toHaveCount(10);
    await expect(items.nth(9)).toHaveAttribute("aria-current", "location");
    await expect(items.first()).toHaveAccessibleName("Message 1 of 10: Plan the dashboard layout. What should I consider first?");
    const box = (await items.first().boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBe(8);
    const centerOf = async (index: number) => {
      const item = (await items.nth(index).boundingBox())!;
      return item.y + item.height / 2;
    };
    const restCenter = await centerOf(4);
    const third = (await items.nth(4).boundingBox())!;
    await page.mouse.move(third.x + 12, restCenter);
    await expect.poll(async () => (await items.nth(4).boundingBox())!.height).toBe(24);
    await expect.poll(async () => (await items.nth(3).boundingBox())!.height).toBe(16);
    await expect.poll(async () => (await items.nth(5).boundingBox())!.height).toBe(16);
    await expect.poll(async () => (await items.nth(2).boundingBox())!.height).toBe(12);
    await expect.poll(async () => (await items.nth(0).boundingBox())!.height).toBe(8);
    await expect.poll(() => centerOf(4)).toBeCloseTo(restCenter, 0);
    await expect(page.locator('[data-slot="chat-message-preview"]')).toContainText("Review table sorting. What should I consider first?");
    await expect(page.locator('[data-slot="chat-message-preview-time"]')).toHaveText("9:16 AM");
    await page.mouse.move(0, 0);
    await expect(page.locator('[data-slot="chat-message-preview"]')).toHaveCount(0);
    await expect.poll(async () => (await items.nth(4).boundingBox())!.height).toBe(8);
    const userMessages = page.getByRole("article", { name: "Your message" });
    const offsetInArea = async (index: number) => {
      const [message, region] = await Promise.all([userMessages.nth(index).boundingBox(), area.boundingBox()]);
      return message!.y - region!.y;
    };

    await items.first().hover();
    await expect(page.locator('[data-slot="chat-message-preview"]')).toHaveText("Plan the dashboard layout. What should I consider first?9:00 AM");
    await items.first().click();
    await expect(items.first()).toHaveAttribute("aria-current", "location");
    await expect.poll(() => offsetInArea(0)).toBeLessThan(40);
    await expect(page.getByRole("button", { name: "Jump to latest" })).toBeVisible();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);

    await page.mouse.move(0, 0);
    await page.getByRole("button", { name: "Jump to latest" }).focus();
    await page.keyboard.press("Shift+Tab");
    await expect(items.first()).toBeFocused();
    await expect(items.first()).toHaveCSS("outline-width", "2px");
    await expect.poll(async () => (await items.first().boundingBox())!.height).toBe(24);
    await page.keyboard.press("ArrowDown");
    await expect(items.nth(1)).toBeFocused();
    await expect(items.nth(1)).toHaveAttribute("aria-current", "location");
    await expect.poll(() => offsetInArea(1)).toBeLessThan(40);
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-slot="chat-message-preview"]')).toHaveCount(0);
    await page.keyboard.press("End");
    await expect(items.nth(9)).toBeFocused();
    await expect(items.nth(9)).toHaveAttribute("aria-current", "location");
    await page.keyboard.press("Home");
    await expect(items.first()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Jump to latest" })).toBeFocused();

    await area.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await expect(items.nth(9)).toHaveAttribute("aria-current", "location");
    await page.setViewportSize({ width: 480, height: 640 });
    await expect(nav).toBeHidden();
  });

  test(`message rail keeps full-size rows for touch input (${theme})`, async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: false, viewport: { width: 1024, height: 640 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:6006${story}--message-navigation&viewMode=story&globals=theme:${theme}`);
    const items = page.getByRole("navigation", { name: "Message navigation" }).getByRole("button");
    await expect(items).toHaveCount(10);
    await expect.poll(async () => (await items.first().boundingBox())!.height).toBe(24);
    await context.close();
  });

  test(`multiline samples scroll only where needed (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`${story}--multiline-draft&viewMode=story&globals=theme:${theme}`);
    const composer = page.getByRole("textbox", { name: "Message" });
    const scrollArea = page.locator('[data-slot="chat-scroll-area"]');
    const expectEmptyAreaToFit = async () => {
      await expect.poll(() => scrollArea.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
    };
    await expect(composer).toHaveValue(/Help me plan a small project\.\n/);
    await expectEmptyAreaToFit();
    await composer.fill("Help me plan a small project with a clear sequence of milestones.\nStart with the main milestones.\nThen suggest the next step.");
    const narrowHeight = (await composer.boundingBox())!.height;
    await page.setViewportSize({ width: 1280, height: 640 });
    await expect.poll(async () => (await composer.boundingBox())!.height).toBeLessThan(narrowHeight);
    await expect(composer).toHaveCSS("overflow-y", "hidden");
    expect(await composer.evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(true);

    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`${story}--long-draft&viewMode=story&globals=theme:${theme}`);
    await expect(composer).toHaveValue(/Step 12:/);
    await expect(composer).toHaveCSS("height", "144px");
    await expect(composer).toHaveCSS("overflow-y", "auto");
    expect(await composer.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await expectEmptyAreaToFit();
    await page.setViewportSize({ width: 320, height: 480 });
    await expectEmptyAreaToFit();
    await composer.fill("Short draft");
    await expect(composer).toHaveCSS("height", "40px");
    await expect(composer).toHaveCSS("overflow-y", "hidden");
    await expectEmptyAreaToFit();
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);

    await page.goto(`${story}--long-conversation&viewMode=story&globals=theme:${theme}`);
    await expect(page.locator('[data-slot="chat-message"]')).toHaveCount(12);
    expect(await scrollArea.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await scrollArea.focus();
    await expect(scrollArea).toHaveCSS("outline-width", "2px");
    await page.keyboard.press("Control+Home");
    await expect.poll(() => scrollArea.evaluate((element) => element.scrollTop)).toBe(0);
    await page.keyboard.press("Control+End");
    await expect.poll(() => scrollArea.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "Jump to latest" })).toHaveCount(0);
    await page.keyboard.press("Tab");
    await expect(composer).toBeFocused();
    await expect(composer).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
    expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
  });
}

test("message info stays visible on touch devices without hover", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(`http://127.0.0.1:6006${story}--message-info&viewMode=story`);
    expect(await page.evaluate(() => matchMedia("(hover: none)").matches)).toBe(true);
    for (const info of await page.locator('[data-slot="chat-message-info"]').all()) {
      await expect(info).toHaveCSS("opacity", "1");
    }
  } finally {
    await context.close();
  }
});

test("empty chat is named and its composer wraps on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(`${story}--empty&viewMode=story`);
  await expect(page.getByRole("heading", { name: "What can I help with?" })).toBeVisible();
  const composer = page.getByRole("textbox", { name: "Message" });
  await expect(composer).toBeVisible();
  await expect(composer).toHaveCSS("min-height", "40px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include("#storybook-root").analyze()).violations).toEqual([]);
});

test("loading chat exposes its status and disables sending", async ({ page }) => {
  await page.goto(`${story}--loading&viewMode=story`);
  await expect(page.locator('[data-slot="chat-status"]')).toContainText("Assistant is thinking...");
  await expect(page.getByRole("log")).toHaveAttribute("aria-busy", "true");
  const composer = page.getByRole("textbox", { name: "Message" });
  await composer.fill("A question");
  await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
});
