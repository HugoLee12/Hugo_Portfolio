import React from "react";

export function HudBadge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "ghost";
  className?: string;
}) {
  const variants = {
    default: "border-slate-700/50 text-slate-400 bg-slate-800/20",
    success: "border-slate-600/50 text-slate-200 bg-slate-800/40",
    warning: "border-amber-700/50 text-amber-400 bg-amber-950/20",
    danger: "border-rose-700/50 text-rose-400 bg-rose-950/20",
    ghost: "border-slate-800/30 text-slate-500 bg-transparent",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 border font-mono text-[9px] md:text-[10px] uppercase tracking-widest ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
