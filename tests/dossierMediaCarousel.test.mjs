import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dossierContent = readFileSync(resolve(__dirname, "../src/components/DossierContent.tsx"), "utf8");

assert.ok(
  /project\.images\?\.length\s*\?\s*project\.images\s*:\s*project\.image\s*\?\s*\[project\.image\]\s*:\s*\[\]/.test(
    dossierContent,
  ),
  "DossierContent should prefer project.images and keep project.image as a fallback.",
);

assert.ok(
  dossierContent.includes("window.setInterval") && dossierContent.includes("5000"),
  "DossierContent should auto-advance multi-image media every 5 seconds.",
);

assert.ok(
  dossierContent.includes("const prefersReducedMotion = useReducedMotion();") &&
    dossierContent.includes("if (prefersReducedMotion || isMediaExpanded || mediaImages.length <= 1) return;") &&
    dossierContent.includes("}, [prefersReducedMotion, isMediaExpanded, mediaImages.length, project.id]);"),
  "DossierContent should pause auto-carousel while fullscreen media is open or reduced motion is active.",
);

assert.ok(
  dossierContent.includes("const goToMedia = (direction: -1 | 1)") &&
    dossierContent.includes("goToMedia(-1)") &&
    dossierContent.includes("goToMedia(1)"),
  "DossierContent should provide shared previous/next media navigation.",
);

assert.ok(
  dossierContent.includes("const isSourceOnlyAction = !sourceAction.disabled && primaryAction.disabled;") &&
    dossierContent.includes('isSourceOnlyAction ? "justify-center" : "justify-between"') &&
    dossierContent.includes("isSourceOnlyAction ? null : !primaryAction.disabled"),
  "DossierContent should center the single source button when no primary action is available.",
);

assert.ok(
  dossierContent.includes('data-testid="dossier-media-frame"') &&
    dossierContent.includes('data-testid="dossier-media-image"') &&
    dossierContent.includes('data-testid="dossier-media-prev"') &&
    dossierContent.includes('data-testid="dossier-media-next"') &&
    dossierContent.includes('data-testid="dossier-media-expanded"') &&
    dossierContent.includes('data-testid="dossier-media-expanded-prev"') &&
    dossierContent.includes('data-testid="dossier-media-expanded-next"'),
  "DossierContent should expose stable media and navigation test hooks for rendered QA.",
);

console.log("Dossier media carousel behavior is guarded in source.");
