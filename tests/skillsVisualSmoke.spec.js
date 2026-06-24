import { test, expect } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

const cases = [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
];

for (const [name, viewport] of cases) {
  test(`skills visual smoke ${name}`, async ({ page }) => {
    test.setTimeout(60000);
    const messages = [];

    page.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) {
        messages.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => messages.push(`pageerror: ${err.message}`));

    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveTitle(/Hugo Lee|Hugo/i);
    await page.locator('#skills').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);

    await expect(page.locator('#skills')).toBeVisible();
    await expect(page.locator('#skills canvas')).toHaveCount(1);
    await expect(page.locator('#skills')).toContainText('SKILLS');

    const shot = path.join(os.tmpdir(), `hugo-skills-${name}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    const canvasBox = await page.locator('#skills canvas').boundingBox();
    console.log(JSON.stringify({ name, viewport, shot, canvasBox, messages }, null, 2));

    const relevantMessages = messages.filter(
      (message) =>
        !message.includes('WebGL') &&
        !message.includes('THREE.WebGLRenderer') &&
        !message.includes('THREE.Clock: This module has been deprecated'),
    );
    expect(relevantMessages).toEqual([]);
  });
}
