import React from "react";

export function HudCard({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative bg-[#050B14]/40 border border-slate-800/50 p-6 md:p-8 group transition-colors duration-500 hover:border-slate-500/30 hover:bg-[#0A1120]/60 clip-chamfer ${className}`}
    >
      {/* Structural corner markers (Crosshairs) - Asymmetrical to match chamfered corners */}
      <div className="hud-crosshair-tl z-10" />
      <div className="hud-crosshair-br z-10" />
      
      {/* Scanline element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-none">
        <div className="hud-scanline" />
      </div>

      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      )}
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
