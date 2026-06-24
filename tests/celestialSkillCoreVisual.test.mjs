import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, '../src/components/CelestialSkillCore.tsx'), 'utf8');

const expectations = [
  ['imports the postprocessing bloom stack', "import { EffectComposer, Bloom } from '@react-three/postprocessing';"],
  ['renders the local bloom composer without normal pass overhead', '<EffectComposer enableNormalPass={false}>'],
  ['uses the original bloom intensity', '<Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />'],
  ['keeps invisible skill hitboxes from painting pixels', 'colorWrite={false}'],
  ['starts text with an explicit visible color', 'color="#64748b"'],
  ['starts text with explicit opacity before frame updates', 'fillOpacity={0.35}'],
  ['keeps text centered in its 3D billboards', 'anchorX="center"'],
  ['keeps text from writing depth so the glow/visibility remains stable', 'material-depthWrite={false}'],
  ['keeps the environment haze behind labels/core', '<mesh renderOrder={-10}>'],
  ['keeps the original environment haze sphere without hiding labels/core', 'side={BackSide} depthWrite={false} depthTest={false}'],
  ['keeps the original warm sun white heat', 'vec3 colorWhite = vec3(1.0, 1.0, 0.8);'],
  ['keeps the original warm rim light', 'color += vec3(1.0, 0.6, 0.1) * rim * 1.5;'],
  ['keeps the original warm corona color', 'vec3 coronaColor = vec3(1.0, 0.7, 0.2);'],
  ['keeps the original corona alpha strength', 'gl_FragColor = vec4(coronaColor, alpha * 0.8);'],
  ['keeps the original central light intensity', 'const baseIntensity = 30;'],
  ['keeps the original central light distance', '<pointLight ref={lightRef} distance={100} intensity={30} color="#88eadd" decay={1.2} />'],
];

for (const [label, snippet] of expectations) {
  assert.ok(source.includes(snippet), `CelestialSkillCore visual regression: ${label}`);
}

console.log('CelestialSkillCore visual stack matches the original Skills lighting baseline.');
