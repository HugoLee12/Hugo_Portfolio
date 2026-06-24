import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
const main = readFileSync(resolve(__dirname, '../src/main.tsx'), 'utf8');

assert.ok(
  !main.includes('StrictMode'),
  'Do not wrap the app in React StrictMode; dev double-mounting destabilizes R3F/postprocessing scenes.',
);

console.log('Dev runtime keeps React StrictMode off for stable R3F scene lifecycle.');
