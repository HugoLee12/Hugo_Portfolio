import React from "react";
import { HeroSection } from "../sections/HeroSection";
import { AboutSection } from "../sections/AboutSection";
import { ExperienceSection } from "../sections/ExperienceSection";
import { UniverseEntrySection } from "../sections/UniverseEntrySection";
import { ContactSection } from "../sections/ContactSection";
import { useScroll, useMotionValueEvent, motion } from "motion/react";
import { EventHorizonFooter } from "./EventHorizonFooter";

const StarfieldBackground = React.lazy(() =>
  import("./StarfieldBackground").then((module) => ({
    default: module.StarfieldBackground,
  })),
);

const SkillsSection = React.lazy(() =>
  import("../sections/SkillsSection").then((module) => ({
    default: module.SkillsSection,
  })),
);

interface PortfolioLayoutProps {
  isUniverseActive?: boolean;
  onEnterUniverse: () => void;
  onPreloadUniverse?: () => void;
}

function StarfieldFallback() {
  return (
    <div className="fixed inset-0 z-[0] pointer-events-none bg-[#0a0a24]" />
  );
}

function SkillsSuspenseFallback() {
  return <div className="min-h-[780px] w-full" aria-busy="true" />;
}

export function PortfolioLayout({
  isUniverseActive = false,
  onEnterUniverse,
  onPreloadUniverse,
}: PortfolioLayoutProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const isScrolledRef = React.useRef(false);
  const shouldRenderShellCanvases = !isUniverseActive;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const nextIsScrolled = latest > 50;
    if (isScrolledRef.current === nextIsScrolled) {
      return;
    }
    isScrolledRef.current = nextIsScrolled;
    setIsScrolled(nextIsScrolled);
  });

  return (
    <div className="min-h-screen bg-transparent text-slate-400 font-sans relative">
      {shouldRenderShellCanvases && (
        <React.Suspense fallback={<StarfieldFallback />}>
          <StarfieldBackground />
        </React.Suspense>
      )}
      
      {/* Scanlines overlay removed */}

      <motion.header 
        className={`fixed z-40 flex items-center justify-between transition-all duration-500 ease-out left-0 right-0 ${
          isScrolled 
            ? "top-4 mx-4 md:mx-auto md:max-w-4xl h-14 bg-[#080b14]/40 backdrop-blur-xl border border-[#b4c3d7]/15 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] px-4 sm:px-6" 
            : "top-0 h-24 bg-gradient-to-b from-[#020617]/90 via-[#020617]/40 to-transparent px-6 md:px-12 border-none rounded-none backdrop-blur-none"
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4 group cursor-default">
          <div className="w-1.5 h-1.5 bg-[#76D6CB]/80 rounded-full group-hover:bg-[#76D6CB] group-hover:shadow-[0_0_8px_rgba(118,214,203,0.4)] transition-all duration-300" />
          <h1 className="font-sans font-medium text-sm md:text-base text-[#D7DAE2] tracking-wider flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            H.LEE 
            <span className="font-mono text-[10px] text-[#5F6675] tracking-[0.2em] uppercase hidden sm:block mt-0.5">
              // SYS_ACTIVE
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-6 md:gap-8">
          <nav className={`hidden md:flex items-center gap-6 text-[13px] font-medium tracking-wide transition-colors duration-300 ${isScrolled ? "text-[#8E95A3]" : "text-[#D7DAE2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"}`}>
            <a href="#about" className="hover:text-[#D7DAE2] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-[#9BAFC3] hover:after:w-full after:transition-all after:duration-300">About</a>
            <a href="#skills" className="hover:text-[#D7DAE2] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-[#9BAFC3] hover:after:w-full after:transition-all after:duration-300">Skills</a>
            <a href="#experience" className="hover:text-[#D7DAE2] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-[#9BAFC3] hover:after:w-full after:transition-all after:duration-300">Experience</a>
          </nav>
          
          <button 
            onClick={onEnterUniverse} 
            onFocus={onPreloadUniverse}
            onPointerEnter={onPreloadUniverse}
            className="group relative px-3 py-1.5 sm:px-4 sm:py-1.5 flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-[0.15em] text-[#8E95A3] hover:text-[#D7DAE2] transition-colors overflow-hidden rounded-md"
          >
            <span className="absolute inset-0 bg-[#080b14]/40 border border-[#b4c3d7]/10 rounded-md transition-all group-hover:bg-[#080b14]/60 group-hover:border-[#b4c3d7]/20"></span>
            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 uppercase">
              Project_Universe
              <svg className="w-3 h-3 text-[#5F6675] group-hover:text-[#9BAFC3] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </motion.header>

      <main className="pt-32 px-6 md:px-12 max-w-5xl mx-auto flex flex-col relative z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <HeroSection />
          <AboutSection />
          <div id="skills" className="scroll-mt-32">
            {shouldRenderShellCanvases ? (
              <React.Suspense fallback={<SkillsSuspenseFallback />}>
                <SkillsSection />
              </React.Suspense>
            ) : (
              <SkillsSuspenseFallback />
            )}
          </div>
          <ExperienceSection />
          <UniverseEntrySection
            onEnterUniverse={onEnterUniverse}
            onPreloadUniverse={onPreloadUniverse}
          />
          <ContactSection />
        </div>
        
        {/* Removed END_OF_TRANSMISSION element */}
      </main>
      
      <div className="relative z-30">
        <EventHorizonFooter />
      </div>
    </div>
  );
}
