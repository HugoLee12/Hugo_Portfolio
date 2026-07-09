import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const storageKey = 'hugo-portfolio-audio-muted';

test('audio mute toggle is visible, clickable, and persisted', async ({ page }) => {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate((key) => {
    window.localStorage.removeItem(key);
  }, storageKey);
  await page.reload({ waitUntil: 'domcontentloaded' });

  const muteButton = page.getByRole('button', { name: /mute audio/i });
  await expect(muteButton).toBeVisible();
  await expect(muteButton).toHaveAttribute('aria-pressed', 'false');
  await expect(muteButton).toContainText(/audio on/i);

  await muteButton.click();

  const unmuteButton = page.getByRole('button', { name: /unmute audio/i });
  await expect(unmuteButton).toBeVisible();
  await expect(unmuteButton).toHaveAttribute('aria-pressed', 'true');
  await expect(unmuteButton).toContainText(/audio off/i);
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), storageKey)).toBe('true');

  await page.reload({ waitUntil: 'domcontentloaded' });

  const persistedUnmuteButton = page.getByRole('button', { name: /unmute audio/i });
  await expect(persistedUnmuteButton).toBeVisible();
  await expect(persistedUnmuteButton).toHaveAttribute('aria-pressed', 'true');
  await expect(persistedUnmuteButton).toContainText(/audio off/i);

  await persistedUnmuteButton.click();

  const restoredMuteButton = page.getByRole('button', { name: /mute audio/i });
  await expect(restoredMuteButton).toBeVisible();
  await expect(restoredMuteButton).toHaveAttribute('aria-pressed', 'false');
  await expect(restoredMuteButton).toContainText(/audio on/i);
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), storageKey)).toBe('false');
});
