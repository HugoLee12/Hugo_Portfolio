import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { projects } from "../src/data.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectById = new Map(projects.map((project) => [project.id, project]));

function publicPathExists(urlPath) {
  const decoded = decodeURIComponent(urlPath.replace(/^\//, ""));
  return existsSync(resolve(__dirname, "../public", decoded));
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
    assert.ok(publicPathExists(image), `${project.name} media file should exist: ${image}`);
  }
}

console.log("Project dossier media assets point to existing public files.");
