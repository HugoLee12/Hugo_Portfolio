import { test, expect } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const knownWarnings = [
  'THREE.Clock: This module has been deprecated',
  'WebGL',
  'THREE.WebGLRenderer',
  'GPU stall due to ReadPixels',
];

function relevantMessages(messages) {
  return messages.filter((message) => !knownWarnings.some((known) => message.includes(known)));
}

async function attachConsoleGuards(page) {
  const messages = [];
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      messages.push(`${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => messages.push(`pageerror: ${err.message}`));
  return messages;
}

async function scrollToSelector(page, selector) {
  await page.evaluate((targetSelector) => {
    document.querySelector(targetSelector)?.scrollIntoView({ block: 'start' });
  }, selector);
}

test.describe('full portfolio deploy-readiness QA', () => {
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    test(`portfolio shell and Skills render on ${name}`, async ({ page }) => {
      test.setTimeout(70000);
      const messages = await attachConsoleGuards(page);
      await page.setViewportSize(viewport);
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveTitle(/Hugo Lee/i);

      for (const sectionId of ['about', 'skills', 'experience', 'contact']) {
        await scrollToSelector(page, `#${sectionId}`);
        await expect(page.locator(`#${sectionId}`)).toBeVisible();
      }

      await scrollToSelector(page, '#skills');
      await page.waitForTimeout(3000);
      await expect(page.locator('#skills canvas')).toHaveCount(1);
      await expect(page.locator('#skills')).toContainText('SKILLS');
      await expect(page.locator('#skills-content')).toHaveCSS('opacity', '1');

      const canvasBox = await page.locator('#skills canvas').boundingBox();
      expect(canvasBox?.width).toBeGreaterThan(300);
      expect(canvasBox?.height).toBeGreaterThan(300);

      const shot = path.join(os.tmpdir(), `hugo-full-qa-${name}-skills.png`);
      await page.screenshot({ path: shot, fullPage: false });
      console.log(JSON.stringify({ name, surface: 'skills', shot, messages }, null, 2));

      expect(relevantMessages(messages)).toEqual([]);
    });
  }

  test('Project Universe opens and returns without trapping scroll', async ({ page }) => {
    test.setTimeout(70000);
    const messages = await attachConsoleGuards(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /project_universe/i }).click();
    await expect(page.getByRole('button', { name: /return to portfolio/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('PROJECT').first()).toBeVisible();
    await expect(page.getByText('UNIVERSE').first()).toBeVisible();
    await expect(page.locator('canvas')).not.toHaveCount(0);
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

    const universeShot = path.join(os.tmpdir(), 'hugo-full-qa-universe.png');
    await page.screenshot({ path: universeShot, fullPage: false });

    await page.getByRole('button', { name: /return to portfolio/i }).click();
    await expect(page.getByRole('button', { name: /project_universe/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await scrollToSelector(page, '#skills');
    await expect(page.locator('#skills')).toBeVisible();

    console.log(JSON.stringify({ surface: 'universe', shot: universeShot, messages }, null, 2));
    expect(relevantMessages(messages)).toEqual([]);
  });

  test('Project Universe entry portal opens the universe', async ({ page }) => {
    test.setTimeout(70000);
    const messages = await attachConsoleGuards(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await scrollToSelector(page, '#universe-entry');

    await page.getByRole('button', { name: /enter universe/i }).click();
    await expect(page.getByRole('button', { name: /return to portfolio/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('PROJECT').first()).toBeVisible();
    await expect(page.getByText('UNIVERSE').first()).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

    await page.getByRole('button', { name: /return to portfolio/i }).click();
    await expect(page.getByRole('button', { name: /project_universe/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');

    console.log(JSON.stringify({ surface: 'universe-entry', messages }, null, 2));
    expect(relevantMessages(messages)).toEqual([]);
  });

  test('contact form opens explicit mail-client state', async ({ page }) => {
    test.setTimeout(50000);
    const messages = await attachConsoleGuards(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await scrollToSelector(page, '#contact');

    await page.locator('input[name="name"]').fill('QA Reviewer');
    await page.locator('input[name="email"]').fill('qa@example.com');
    await page.locator('textarea[name="message"]').fill('Deploy-readiness QA smoke test.');
    await page.getByRole('button', { name: /open mail client/i }).click();
    await expect(page.getByText(/Opening Mail Client/i)).toBeVisible();

    const shot = path.join(os.tmpdir(), 'hugo-full-qa-contact.png');
    await page.screenshot({ path: shot, fullPage: false });
    console.log(JSON.stringify({ surface: 'contact', shot, messages }, null, 2));
    expect(relevantMessages(messages)).toEqual([]);
  });
});
