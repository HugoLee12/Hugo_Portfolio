import React, { useMemo, useRef, useEffect } from 'react';
import { HudSection } from '../components/hud/HudSection';
import { SectionHeader } from '../components/hud/SectionHeader';
import { skillCategories, enhancedSkills } from '../data/skills';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CelestialSkillCore } from '../components/CelestialSkillCore';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';

const SKILLS_CANVAS_DPR: [number, number] = [1, 1.25];

export function SkillsSection() {
  const allSkills = useMemo(() => {
    const combined = skillCategories.flatMap(group => group.skills);
    return Array.from(new Set(combined));
  }, []);

  const hoveredSkill = useAppStore(state => state.hoveredSkill);
  const activeSkillData = hoveredSkill ? enhancedSkills[hoveredSkill] : null;

  // Cố định viewport, ngăn scroll khi OrbitControls được tương tác giúp tránh bug reset tọa độ do setPointerCapture
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Native pointer handling in capture phase to reliably track OrbitControls drag state
    const handlePointerDown = () => { isDragging.current = true; };
    const handlePointerUp = () => { isDragging.current = false; };
    
    const div = containerRef.current;
    if (div) {
        div.addEventListener('pointerdown', handlePointerDown, { capture: true });
    }
    window.addEventListener('pointerup', handlePointerUp, { capture: true });
    window.addEventListener('pointercancel', handlePointerUp, { capture: true });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDragging.current && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      if (div) {
          div.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      }
      window.removeEventListener('pointerup', handlePointerUp, { capture: true });
      window.removeEventListener('pointercancel', handlePointerUp, { capture: true });
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <HudSection id="skills-content" className="scroll-mt-32">
      <SectionHeader title="SKILLS" subtitle="Technical Capabilities" number="02" />
      
      <div 
        ref={containerRef}
        className="w-full h-[600px] sm:h-[700px] relative mt-4 flex flex-col md:flex-row touch-none"
      >
        {/* Detail Panel */}
        <div className="absolute top-0 right-0 w-full md:w-80 lg:w-96 h-auto md:h-full z-20 pointer-events-none p-4 flex flex-col justify-end md:justify-start pt-24 md:pt-12">
          <AnimatePresence>
            {activeSkillData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/90 border border-[rgba(180,195,215,0.14)] p-6 shadow-[0_0_20px_rgba(155,175,195,0.1)] pointer-events-none"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-1.5 h-1.5 bg-[#6FD6C8] rounded-full animate-pulse shadow-[0_0_8px_#6FD6C8]" />
                  <h3 className="text-lg font-sans font-medium text-[#D7E1EA] tracking-tight">
                      {activeSkillData.name}
                  </h3>
                </div>
                <div className="text-xs font-mono text-[#9BAFC3] mb-4 tracking-wide uppercase">
                    {activeSkillData.category}
                </div>
                <p className="text-sm font-sans text-[rgba(220,226,235,0.82)] mb-6 leading-relaxed">
                    {activeSkillData.description}
                </p>
                {activeSkillData.relations.length > 0 && (
                    <div>
                        <div className="text-[10px] font-mono text-[rgba(145,155,170,0.6)] mb-2 tracking-widest uppercase">Related</div>
                        <div className="flex flex-wrap gap-2">
                            {activeSkillData.relations.map(rel => (
                                <span key={rel} className="text-xs font-sans px-2.5 py-1 bg-slate-800/40 border border-slate-700/50 text-[#9BAFC3] rounded-full">
                                    {rel}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Canvas 
          camera={{ position: [0, 0, 45], fov: 60 }} 
          className="w-full h-full absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_100%)]"
          dpr={SKILLS_CANVAS_DPR}
          gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        >
          <fogExp2 attach="fog" color="#020617" density={0.015} />
          <ambientLight intensity={0.1} />
          <CelestialSkillCore words={allSkills} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            makeDefault 
            autoRotate={!hoveredSkill}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </div>
    </HudSection>
  );
}
