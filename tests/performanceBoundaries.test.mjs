import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolioLayout = readFileSync(resolve(__dirname, '../src/components/PortfolioLayout.tsx'), 'utf8');

assert.ok(
  !portfolioLayout.includes("import { SkillsSection } from '../sections/SkillsSection';"),
  'PortfolioLayout should not statically import the R3F-heavy SkillsSection into the initial shell bundle.',
);

assert.ok(
  /import\(["']\.\.\/sections\/SkillsSection["']\)/.test(portfolioLayout),
  'PortfolioLayout should lazy-load SkillsSection so its R3F/postprocessing dependencies split out of the initial shell.',
);

assert.ok(
  !portfolioLayout.includes('IntersectionObserver') && !portfolioLayout.includes('LazyOnVisible'),
  'PortfolioLayout should not gate SkillsSection behind viewport-only mounting; Skills needs deterministic canvas mount behavior.',
);

assert.ok(
  /<div id="skills" className="scroll-mt-32">\s*{\s*shouldRenderShellCanvases \? \([\s\S]*?<React\.Suspense[\s\S]*?<SkillsSection \/>[\s\S]*?<\/React\.Suspense>/.test(portfolioLayout),
  'PortfolioLayout should keep one stable #skills anchor outside the async SkillsSection boundary.',
);

assert.ok(
  portfolioLayout.includes('const shouldRenderShellCanvases = !isUniverseActive;'),
  'PortfolioLayout should unmount background shell canvases while the full-screen Project Universe is active.',
);

console.log('Portfolio performance boundaries keep Skills split but deterministically mounted.');
