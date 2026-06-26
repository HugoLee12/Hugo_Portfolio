# Hugo Portfolio

Cinematic personal portfolio built with React, TypeScript, Vite, Tailwind CSS, React Three Fiber, Three.js, Motion, and Zustand.

The site presents a recruiter-friendly developer profile with a dark technical visual system, animated WebGL scenes, and an immersive project showcase called **Black Hole Project Universe**. Instead of a traditional project grid, projects appear as orbiting nodes around a central black hole. Selecting a node opens a connected dossier with project details, media, and source/project actions.

## Highlights

- Full-screen Black Hole Project Universe with orbiting project nodes.
- Floating project dossiers with responsive desktop and mobile layouts.
- Dossier media frames with image carousel and fullscreen inspection.
- Shader-driven black hole, starfield, bloom, orbital trails, and HUD details.
- Celestial skills section rendered with React Three Fiber.
- Contact flow through an explicit mail-client handoff.
- Performance-conscious code splitting for heavy WebGL surfaces.

## Project Content

Current Project Universe entries include:

- **AI Press**: faculty-led CMS and digital publishing project, framed as full-stack student-team work.
- **Hugo Portfolio**: this portfolio system, including the cinematic project universe and dossier interface.
- Three reserved no-data nodes that keep the universe visually populated without making unsupported project claims.

Project data and dossier media are defined in `src/data.ts`. Screenshots used by dossiers live under `public/project_pic/`.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Three Fiber
- Three.js
- drei
- Motion
- Zustand
- Playwright for browser regression checks

## Getting Started

Prerequisites:

- Node.js
- npm

Install dependencies:

```powershell
npm.cmd install
```

Run locally:

```powershell
npm.cmd run dev
```

Build for production:

```powershell
npm.cmd run build
```

Preview the production build:

```powershell
npm.cmd run preview
```

## Quality Checks

Common checks used for this project:

```powershell
npm.cmd run lint
npm.cmd run build
node tests\projectActions.test.mjs
node tests\projectMediaAssets.test.mjs
node tests\dossierMediaCarousel.test.mjs
npx.cmd playwright test tests\horizontalOverflow.spec.js --reporter=line
```

Because the portfolio relies heavily on WebGL, browser QA is important after visual or interaction changes. Key flows to verify are page scroll, Skills rendering, Project Universe entry/return, dossier media, fullscreen carousel behavior, and mobile layout.

## Deployment

The app is a Vite static frontend and is suitable for Vercel. Production output is generated in `dist/`.

## Notes

- React StrictMode is intentionally disabled because development double-mounting destabilized the R3F/postprocessing scenes in this project.
- The Skills section keeps one stable `#skills` anchor and avoids viewport-gated mounting.
- `AI Press` source/demo actions are intentionally disabled until a real public URL is provided.
- `Hugo Portfolio` currently exposes a single centered `SOURCE CODE` action.
