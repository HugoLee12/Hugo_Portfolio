import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function openDossierHarness(page, reducedMotion) {
  await page.emulateMedia({ reducedMotion });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.setContent(`
    <html>
      <head><title>Dossier reduced motion harness</title></head>
      <body>
        <div id="root"></div>
        <script type="module" src="/tests/fixtures/reducedMotionDossierHarness.tsx"></script>
      </body>
    </html>
  `);
}

test('reduced motion stops dossier media auto-advance', async ({ page }) => {
  test.setTimeout(30000);
  await page.setViewportSize({ width: 1440, height: 1000 });

  await openDossierHarness(page, 'reduce');

  const image = page.getByTestId('dossier-media-image');
  await expect(image).toBeVisible();
  const initialSrc = await image.getAttribute('src');

  await page.waitForTimeout(5600);

  await expect(image).toHaveAttribute('src', initialSrc ?? '');
});
