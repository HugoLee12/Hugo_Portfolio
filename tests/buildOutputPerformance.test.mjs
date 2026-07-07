import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const html = readFileSync(resolve('dist/index.html'), 'utf8');
const entryMatch = html.match(/<script type="module" crossorigin src="\/assets\/([^"]+\.js)">/);

assert.ok(entryMatch, 'dist/index.html should contain a single module entry script.');

const entryAsset = entryMatch[1];
const entrySize = statSync(resolve('dist/assets', entryAsset)).size;

assert.ok(
  entrySize < 500_000,
  `Initial entry script should stay below 500 KB after code splitting; got ${entrySize} bytes.`,
);

assert.ok(
  !html.includes('vendor-three') && !html.includes('vendor-r3f'),
  'Initial HTML should not modulepreload Three/R3F vendor chunks; WebGL code should load on demand.',
);

function expectHeadTag(pattern, message) {
  assert.match(html, pattern, message);
}

function readPngDimensions(filePath) {
  const png = readFileSync(filePath);

  assert.equal(png.toString('ascii', 1, 4), 'PNG', `${filePath} should be a PNG file.`);

  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

const ogImagePath = resolve('dist/og-image.png');
const faviconPath = resolve('dist/favicon.svg');

expectHeadTag(
  /<meta property="og:title" content="Hugo Lee \| Full-Stack Developer Portfolio" \/>/,
  'Built HTML should include an Open Graph title.',
);
expectHeadTag(
  /<meta\s+property="og:description"\s+content="Hugo Lee's cinematic full-stack developer portfolio featuring AI Press and an interactive Black Hole Project Universe\."\s+\/>/,
  'Built HTML should include an Open Graph description.',
);
expectHeadTag(
  /<meta property="og:image" content="https:\/\/hugo-portfolio-vert\.vercel\.app\/og-image\.png" \/>/,
  'Built HTML should reference the dedicated Open Graph image.',
);
expectHeadTag(
  /<meta property="og:url" content="https:\/\/hugo-portfolio-vert\.vercel\.app\/" \/>/,
  'Built HTML should include the production portfolio URL.',
);
expectHeadTag(
  /<meta property="og:type" content="website" \/>/,
  'Built HTML should include the Open Graph type.',
);
expectHeadTag(
  /<meta name="twitter:card" content="summary_large_image" \/>/,
  'Built HTML should request a large Twitter card.',
);
expectHeadTag(
  /<meta name="twitter:title" content="Hugo Lee \| Full-Stack Developer Portfolio" \/>/,
  'Built HTML should include a Twitter title.',
);
expectHeadTag(
  /<meta\s+name="twitter:description"\s+content="Hugo Lee's cinematic full-stack developer portfolio featuring AI Press and an interactive Black Hole Project Universe\."\s+\/>/,
  'Built HTML should include a Twitter description.',
);
expectHeadTag(
  /<meta name="twitter:image" content="https:\/\/hugo-portfolio-vert\.vercel\.app\/og-image\.png" \/>/,
  'Built HTML should reference the dedicated Twitter card image.',
);
expectHeadTag(
  /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/,
  'Built HTML should reference the favicon.',
);

assert.ok(existsSync(ogImagePath), 'The dedicated OG image should be emitted to dist.');
assert.ok(existsSync(faviconPath), 'The favicon should be emitted to dist.');

const ogImageDimensions = readPngDimensions(ogImagePath);

assert.deepEqual(
  ogImageDimensions,
  { width: 1254, height: 1254 },
  'The dedicated OG image should match the committed preview asset dimensions.',
);

console.log(`Build output performance guard passed. Entry ${entryAsset}: ${entrySize} bytes.`);
