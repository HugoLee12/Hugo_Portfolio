import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence } from "motion/react";
import { projects } from "../../data";
import { UniverseScene } from "../UniverseScene";
import { DossierOverlay } from "../DossierOverlay";
import { audioManager } from "../../lib/audio";
import { InnerDimensionGallery } from "../InnerDimensionGallery";

interface UniverseViewProps {
  onExit: () => void;
}

export function UniverseView({ onExit }: UniverseViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [isIntro, setIsIntro] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [view, setView] = useState<"main" | "inner_dimension">("main");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntro(false);
    }, 100);

    // Initialize audio immediately. The user likely just clicked a button to get here,
    // so the audio context can be resumed/started without further interaction.
    audioManager.init();

    const handleInteraction = () => {
      audioManager.resume();
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
    window.addEventListener("pointerdown", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      audioManager.stopAmbient();
    };
  }, []);

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || null;

  const handleSingularityTrigger = () => {
    setIsTransitioning(true);
    audioManager.playSuckIn();
  };

  const handleEnteredSingularity = () => {
    setView("inner_dimension");
    setIsTransitioning(false);
    audioManager.playExplosion();
  };

  if (view === "inner_dimension") {
    return <InnerDimensionGallery onReturn={() => setView("main")} />;
  }

  return (
    <div className="relative w-full h-full bg-[#020617] overflow-hidden">
      <div
        className={`absolute inset-0 z-50 pointer-events-none transition-all ease-out duration-[3500ms] bg-[#020617] ${
          isIntro
            ? "opacity-100 backdrop-blur-3xl scale-110"
            : "opacity-0 backdrop-blur-none scale-100"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle at center, transparent 20%, #020617 80%)",
        }}
      />

      <div
        className={`absolute inset-0 transition-opacity duration-1000 opacity-100`}
      >
        <Canvas
          camera={{ position: [0, 15, 20], fov: 45 }}
          onPointerMissed={() => setSelectedProjectId(null)}
        >
          <Suspense fallback={null}>
            <UniverseScene
              projects={projects}
              selectedId={selectedProjectId}
              isTransitioning={isTransitioning}
              onSingularityTrigger={handleSingularityTrigger}
              onEnteredSingularity={handleEnteredSingularity}
              onSelect={(id) => {
                if (id) {
                  audioManager.playScan();
                }
                setSelectedProjectId(id);
              }}
            />
          </Suspense>
        </Canvas>
      </div>

      <svg className="absolute inset-0 pointer-events-none z-20 w-full h-full hidden md:block">
        <defs>
          <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path
          id="connector-line"
          fill="none"
          stroke={selectedProject ? selectedProject.color : "transparent"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow-line)"
          className="transition-colors duration-300"
          style={{
            opacity: selectedProject ? 0.9 : 0,
            transition: "opacity 0.4s ease-in-out",
          }}
        />
      </svg>

      <div
        className={`absolute inset-0 z-20 flex flex-col transition-colors duration-500 pointer-events-none`}
      >
        <div
          className={`shrink-0 transition-all duration-500 max-w-full pointer-events-none absolute inset-0 p-5 sm:p-8 md:p-12 z-10`}
        >
          <div
            className={`flex flex-col md:flex-row transition-all duration-500 justify-between h-full w-full`}
          >
            <div className={`flex flex-col items-start`}>
              <div className="pointer-events-auto">
                <span className="text-[10px] font-mono tracking-[0.3em] text-slate-500 mb-1 block">
                  PORTFOLIO
                </span>
                <h1
                  className={`font-mono tracking-widest sm:tracking-[0.35em] font-light text-slate-200 uppercase flex flex-col md:flex-row md:items-center transition-all duration-300 text-2xl sm:text-4xl md:text-5xl mb-4`}
                >
                  <span className="font-bold text-white">PROJECT</span>
                  <span className="hidden md:inline">&nbsp;</span>
                  <span className="text-slate-400">UNIVERSE</span>
                </h1>

                <div
                  className={`bg-gradient-to-r from-slate-400 to-transparent transition-all duration-500 h-[1px] w-32 mb-6`}
                />

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out max-h-40 opacity-100 mb-8`}
                >
                  <p className="text-slate-400 font-mono text-xs md:text-sm leading-relaxed max-w-md border-l border-slate-800 pl-4">
                    A galaxy of missions, each one a story.
                    <br className="hidden sm:block" /> Explore selected work
                    across worlds and industries.
                    <span className="block mt-3 text-slate-500 text-[10px] sm:text-xs">
                      [ Dive into the black hole! (I promise it's safe) ]
                    </span>
                  </p>
                </div>
                
                <button
                  onClick={onExit}
                  className="pointer-events-auto mt-4 px-6 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-300 font-mono text-xs tracking-widest uppercase transition-colors backdrop-blur-sm"
                >
                  Return to Portfolio
                </button>
              </div>
            </div>

            <div className={`flex flex-col items-start md:items-end`}></div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <DossierOverlay
            project={selectedProject}
            onClose={() => setSelectedProjectId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
