import { lazy, Suspense, useState, useEffect } from "react";
import { PortfolioLayout } from "./components/PortfolioLayout";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { AudioMuteToggle } from "./components/AudioMuteToggle";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const loadUniverseView = () =>
  import("./components/universe/UniverseView").then((module) => ({
    default: module.UniverseView,
  }));

const UniverseView = lazy(loadUniverseView);

function UniverseLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#020617] text-slate-300">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-cyan-300/20" />
        <div className="absolute inset-4 rounded-full border border-violet-300/10 animate-pulse" />
        <div className="h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_24px_rgba(103,232,249,0.8)]" />
        <div className="absolute -bottom-8 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Loading Universe
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isUniverseActive, setIsUniverseActive] = useState(false);

  useEffect(() => {
    if (!isUniverseActive) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isUniverseActive]);

  return (
    <MotionConfig reducedMotion="user">
      <PortfolioLayout
        isUniverseActive={isUniverseActive}
        onEnterUniverse={() => setIsUniverseActive(true)}
        onPreloadUniverse={() => {
          void loadUniverseView();
        }}
      />
      
      <AnimatePresence>
        {isUniverseActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#020617]"
          >
            <Suspense fallback={<UniverseLoadingFallback />}>
              <UniverseView onExit={() => setIsUniverseActive(false)} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
      <AudioMuteToggle />
      <Analytics />
      <SpeedInsights />
    </MotionConfig>
  );
}
