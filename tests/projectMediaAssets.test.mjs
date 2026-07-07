import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { projects } from "../src/data.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectById = new Map(projects.map((project) => [project.id, project]));
const DOSSIER_IMAGE_SIZE_BUDGET_BYTES = 100 * 1024;

function resolvePublicPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.replace(/^\//, ""));
  return resolve(__dirname, "../public", decoded);
}

const aiPress = projectById.get("ai-press");
const hugoPortfolio = projectById.get("hugo-portfolio");

assert.ok(aiPress, "AI Press project should exist.");
assert.ok(hugoPortfolio, "Hugo Portfolio project should exist.");

assert.equal(aiPress.images?.length, 1, "AI Press should have one dossier image.");
assert.equal(
  hugoPortfolio.images?.length,
  2,
  "Hugo Portfolio should have two dossier images for carousel rotation.",
);

for (const project of [aiPress, hugoPortfolio]) {
  assert.equal(project.image, project.images?.[0], `${project.name} should use its first media item as the fallback image.`);

  for (const image of project.images ?? []) {
    assert.equal(extname(image), ".webp", `${project.name} media file should be WebP: ${image}`);

    const imagePath = resolvePublicPath(image);
    assert.ok(existsSync(imagePath), `${project.name} media file should exist: ${image}`);
    assert.ok(
      statSync(imagePath).size <= DOSSIER_IMAGE_SIZE_BUDGET_BYTES,
      `${project.name} media file should stay under ${DOSSIER_IMAGE_SIZE_BUDGET_BYTES} bytes: ${image}`,
    );
  }
}

console.log("Project dossier media assets are WebP files under the size budget.");
