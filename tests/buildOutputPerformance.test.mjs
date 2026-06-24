import { readFileSync, statSync } from 'node:fs';
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

console.log(`Build output performance guard passed. Entry ${entryAsset}: ${entrySize} bytes.`);
