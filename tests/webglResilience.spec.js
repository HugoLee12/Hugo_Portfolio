import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function loseWebGLContexts(page) {
  return page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    let lostCount = 0;

    for (const canvas of canvases) {
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      const extension = gl?.getExtension('WEBGL_lose_context');

      if (extension) {
        extension.loseContext();
        lostCount += 1;
      }
    }

    return lostCount;
  });
}

test('WebGL context loss leaves the portfolio shell readable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /hugo lee/i })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.querySelectorAll('canvas').length))
    .toBeGreaterThanOrEqual(1);

  const lostCount = await loseWebGLContexts(page);
  expect(lostCount).toBeGreaterThan(0);

  await expect(page.getByRole('heading', { name: /hugo lee/i })).toBeVisible();
  const escapeHatch = page.getByRole('link', { name: /escape hatch: github/i });
  await escapeHatch.scrollIntoViewIfNeeded();
  await expect(escapeHatch).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.readyState))
    .toBe('complete');
});

test('WebGL context loss leaves Project Universe controls responsive', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: /project_universe/i }).click();
  await expect(page.getByRole('button', { name: /return to portfolio/i })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.querySelectorAll('canvas').length))
    .toBeGreaterThanOrEqual(1);

  const lostCount = await loseWebGLContexts(page);
  expect(lostCount).toBeGreaterThan(0);

  const returnButton = page.getByRole('button', { name: /return to portfolio/i });
  await expect(returnButton).toBeVisible();
  await returnButton.click();
  await expect(page.getByRole('heading', { name: /hugo lee/i })).toBeVisible();
});
