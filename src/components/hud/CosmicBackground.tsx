import React, { useMemo } from 'react';

interface CosmicBackgroundProps {
  className?: string;
  withGrid?: boolean;
}

export function CosmicBackground({ className = '', withGrid = true }: CosmicBackgroundProps) {
  // Generate a random stable set of stars
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map(() => ({
      width: Math.random() * 2 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.7 + 0.3,
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${Math.random() * 4 + 3}s`,
    }));
  }, []);

  return (
    <div className={`fixed inset-0 z-[-1] overflow-hidden bg-[#050B14] pointer-events-none ${className}`}>
      {/* Nebula / Deep Space Ambient Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050B14]/80 to-[#050B14]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent"></div>
      
      {/* HUD Structural Grid Layer */}
      {withGrid && (
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"
          style={{ maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)' }}
        />
      )}

      {/* Sparkling Stars Layer */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-slate-200"
            style={{
              width: `${star.width}px`,
              height: `${star.width}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              boxShadow: `0 0 ${star.width * 2}px rgba(255, 255, 255, 0.4)`,
              animation: `hud-twinkle ${star.animationDuration} infinite alternate ease-in-out`,
              animationDelay: star.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Inject custom animation keyframes for twinkling */}
      <style>{`
        @keyframes hud-twinkle {
          0% { opacity: 0.1; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
