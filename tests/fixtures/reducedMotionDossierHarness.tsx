import React from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "../../src/index.css";
import { projects } from "../../src/data";
import { DossierContent } from "../../src/components/DossierContent";

const project = projects.find((item) => item.id === "hugo-portfolio");
const root = document.getElementById("root");

if (!project || !root) {
  throw new Error("Reduced-motion dossier harness could not load Hugo Portfolio.");
}

createRoot(root).render(
  <MotionConfig reducedMotion="user">
    <div
      style={
        {
          "--hologram-core": project.color,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "540px",
          height: "760px",
          margin: "40px auto",
          background: "rgba(2, 6, 23, 0.95)",
          overflow: "hidden",
        } as React.CSSProperties
      }
    >
      <DossierContent project={project} />
    </div>
  </MotionConfig>,
);
