import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { HudSection } from '../components/hud/HudSection';
import { motion } from 'motion/react';
import { audioManager } from '../lib/audio';

const useUniverseHoverSound = () => {
  const droneRef = useRef<{ stop: () => void } | null>(null);

  const startSound = useCallback(() => {
    if (droneRef.current) return;
    droneRef.current = audioManager.startPortalHoverDrone();
  }, []);

  const stopSound = useCallback(() => {
    droneRef.current?.stop();
    droneRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, [stopSound]);

  return { startSound, stopSound };
};

interface UniverseEntrySectionProps {
  onEnterUniverse: () => void;
  onPreloadUniverse?: () => void;
}

const OrbitalRings = ({ isHovered }: { isHovered: boolean }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
      {/* Ring 1 - Inner */}
      <motion.div
        animate={isHovered ? { 
          rotateX: 0, 
          rotateY: 0, 
          opacity: 1,
          scale: 1
        } : {
          rotateX: [60, 64, 56, 60],
          rotateY: [30, 36, 24, 30],
          opacity: [0.3, 0.6, 0.4, 0.6, 0.3],
          scale: [1, 1.02, 0.98, 1.01, 1]
        }}
        transition={isHovered ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] } : { duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.svg
           animate={{ rotateZ: 360 }}
           transition={{ duration: isHovered ? 2 : 40, repeat: Infinity, ease: "linear" }}
           width="100%" height="100%" viewBox="0 0 100 100"
           style={{ 
             overflow: 'visible',
             filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,1)) drop-shadow(0 0 2px rgba(255,255,255,1))' : 'drop-shadow(0 0 3px rgba(255,255,255,0.6))',
           }}
        >
          <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" className="text-white/80" strokeWidth="0.5" vectorEffect="non-scaling-stroke" strokeDasharray="2 4 8 2 1 6" />
        </motion.svg>
      </motion.div>
      
      {/* Ring 2 - Middle */}
      <motion.div
        animate={isHovered ? { 
          rotateX: 0, 
          rotateY: 0, 
          opacity: 0.8,
          scale: 1
        } : {
          rotateX: [-45, -40, -50, -45],
          rotateY: [60, 66, 54, 60],
          opacity: [0.5, 0.3, 0.6, 0.3, 0.5],
          scale: [1, 0.98, 1.03, 0.99, 1]
        }}
        transition={isHovered ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] } : { duration: 19, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.svg
           animate={{ rotateZ: -360 }}
           transition={{ duration: isHovered ? 2.5 : 50, repeat: Infinity, ease: "linear" }}
           width="100%" height="100%" viewBox="0 0 100 100"
           style={{ 
             overflow: 'visible',
             filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 0 2px rgba(255,255,255,0.8))' : 'drop-shadow(0 0 3px rgba(255,255,255,0.5))',
           }}
        >
          <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" className="text-white/60" strokeWidth="0.5" vectorEffect="non-scaling-stroke" strokeDasharray="1 3 6 4 12 2" />
        </motion.svg>
      </motion.div>

      {/* Ring 3 - Outer */}
      <motion.div
        animate={isHovered ? { 
          rotateX: 0, 
          rotateY: 0, 
          opacity: 0.6,
          scale: 1
        } : {
          rotateX: [75, 82, 68, 75],
          rotateY: [-45, -52, -38, -45],
          opacity: [0.4, 0.6, 0.3, 0.6, 0.4],
          scale: [1, 1.05, 0.96, 1.02, 1]
        }}
        transition={isHovered ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] } : { duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[360px] h-[360px] md:w-[480px] md:h-[480px]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.svg
           animate={{ rotateZ: 360 }}
           transition={{ duration: isHovered ? 3 : 60, repeat: Infinity, ease: "linear" }}
           width="100%" height="100%" viewBox="0 0 100 100"
           style={{ 
             overflow: 'visible',
             filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(0 0 2px rgba(255,255,255,0.6))' : 'drop-shadow(0 0 3px rgba(255,255,255,0.4))',
           }}
        >
          <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" className="text-white/50" strokeWidth="0.5" vectorEffect="non-scaling-stroke" strokeDasharray="3 8 2 4 16 6" />
        </motion.svg>
      </motion.div>
    </div>
  );
};

const PortalParticles = ({ isHovered }: { isHovered: boolean }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 250 + Math.random() * 600;
      return {
        id: i,
        angle,
        distance,
        floatX: Math.cos(angle) * distance,
        floatY: Math.sin(angle) * distance,
        size: Math.random() * 2.5 + 1.5,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 3,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: p.floatX,
            y: p.floatY,
            opacity: 0,
            scale: 0.5,
          }}
          animate={
            isHovered
              ? {
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0,
                  transition: {
                    duration: 0.4 + Math.random() * 0.3,
                    ease: 'easeIn',
                  },
                }
              : {
                  x: p.floatX,
                  y: p.floatY,
                  opacity: [0.1, 0.6, 0.1],
                  scale: [1, 1.5, 1],
                  transition: {
                    duration: p.duration,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: p.delay,
                  },
                }
          }
          className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
          style={{ width: p.size, height: p.size }}
        />
      ))}
    </div>
  );
};

export function UniverseEntrySection({
  onEnterUniverse,
  onPreloadUniverse,
}: UniverseEntrySectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { startSound, stopSound } = useUniverseHoverSound();

  const handleHoverStart = () => {
    setIsHovered(true);
    startSound();
    onPreloadUniverse?.();
  };

  return (
    <HudSection id="universe-entry" className="relative my-24 md:my-40 overflow-hidden">
      <style>{`
        @keyframes micro-shake {
          0%, 100% { transform: translate(0, 0) scale(1.05); }
          25% { transform: translate(1px, 0.5px) scale(1.05); }
          50% { transform: translate(-0.5px, -1px) scale(1.05); }
          75% { transform: translate(-1px, 0.5px) scale(1.05); }
        }
        .portal-hover-shake:hover {
          animation: micro-shake 0.3s ease-in-out infinite alternate;
        }
        @keyframes text-shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .glass-text {
          background: #94a3b8; /* slate-400 */
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: 0.4em;
          margin-left: 0.4em;
          transition: letter-spacing 1s cubic-bezier(0.16, 1, 0.3, 1), margin-left 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .group:hover .glass-text {
          background: linear-gradient(
            110deg,
            #cbd5e1 0%,   /* slate-300 */
            #cbd5e1 40%,
            #ffffff 48%,  /* pure white */
            #ffffff 52%,
            #cbd5e1 60%,
            #cbd5e1 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: 0.7em;
          margin-left: 0.7em;
          animation: text-shine 2s linear infinite;
        }
      `}</style>
      <div className="relative py-24 flex flex-col items-center justify-center text-center px-4">
        
        {/* Top Connecting Line */}
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          whileInView={{ height: 96, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-px bg-white/10 mb-12"
        />
        
        <h2 className="text-3xl md:text-4xl font-light tracking-[0.4em] text-white uppercase flex flex-col items-center gap-6">
          <span className="text-xs tracking-[0.6em] text-slate-400">Navigate The</span>
          <span className="text-slate-300">PROJECT_UNIVERSE</span>
        </h2>
        
        <p className="font-mono text-xs md:text-sm text-slate-500 max-w-lg mx-auto mt-8 leading-relaxed tracking-[0.2em] uppercase">
          Establish neural connection with the celestial sphere. 
          Experience spatial dimensions.
        </p>

        {/* Portal Button - The Glass Horizon */}
        <div 
          className="mt-20 mb-12 relative flex justify-center items-center"
          onMouseEnter={handleHoverStart}
          onMouseLeave={() => { setIsHovered(false); stopSound(); }}
        >
          <OrbitalRings isHovered={isHovered} />
          <PortalParticles isHovered={isHovered} />

          <button 
            onClick={onEnterUniverse} 
            onFocus={() => {
              onPreloadUniverse?.();
            }}
            className="group relative flex items-center justify-center w-56 h-56 md:w-72 md:h-72 rounded-full border border-white/10 transition-all duration-1000 ease-out hover:border-white portal-hover-shake z-10"
          >
            {/* Lensing Effect */}
            <div className="absolute inset-0 rounded-full backdrop-blur-md bg-white/[0.01] transition-all duration-1000 group-hover:backdrop-blur-none group-hover:bg-transparent" />
            
            <span 
              className="relative z-10 font-mono text-xs md:text-sm uppercase glass-text"
            >
              ENTER UNIVERSE
            </span>
          </button>
        </div>

        {/* Bottom Connecting Line */}
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          whileInView={{ height: 96, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="w-px bg-white/10 mt-12"
        />
      </div>
    </HudSection>
  );
}

