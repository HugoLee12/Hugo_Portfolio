import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    scrollX: window.scrollX,
  }));

  expect(metrics.scrollX).toBe(0);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function scrollToSelector(page, selector) {
  await page.evaluate((targetSelector) => {
    document.querySelector(targetSelector)?.scrollIntoView({ block: 'start' });
  }, selector);
}

test.describe('horizontal overflow guard', () => {
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    test(`portfolio shell has no horizontal scrollbar on ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveTitle(/Hugo Lee/i);
      await expectNoHorizontalOverflow(page);

      for (const sectionId of ['about', 'skills', 'experience', 'universe-entry', 'contact']) {
        await scrollToSelector(page, `#${sectionId}`);
        await expect(page.locator(`#${sectionId}`)).toBeVisible();
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test('Project Universe overlay has no horizontal scrollbar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /project_universe/i }).click();
    await expect(page.getByRole('button', { name: /return to portfolio/i })).toBeVisible({ timeout: 20000 });
    await expectNoHorizontalOverflow(page);
  });
});
