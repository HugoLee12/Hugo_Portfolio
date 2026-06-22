import React from "react";

export function HudButton({
  children,
  onClick,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const baseStyles = "relative inline-flex items-center justify-center font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "px-6 py-3 bg-slate-900/40 text-slate-300 border border-slate-600/50 hover:border-slate-500 hover:bg-slate-800/60 hover:text-white",
    secondary: "px-6 py-3 bg-[#0A1120]/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-500 hover:text-white",
    ghost: "px-4 py-2 text-slate-500 hover:text-slate-300",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className} group`}>
      {variant === 'primary' && (
        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
