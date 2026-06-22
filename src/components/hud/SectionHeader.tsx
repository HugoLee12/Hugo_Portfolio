import React from "react";

export function SectionHeader({
  title,
  subtitle,
  number,
}: {
  title: string;
  subtitle?: string;
  number?: string;
}) {
  return (
    <div className="mb-10 lg:mb-14 border-b-[0.5px] border-slate-500/20 pb-5 pl-4 relative">
      <div className="absolute left-0 top-2 bottom-0 w-[1px] bg-gradient-to-b from-blue-200/40 via-slate-500/10 to-transparent" />
      <div className="flex items-baseline gap-4 mb-2">
        <h2 className="text-xl md:text-2xl font-light tracking-[0.25em] text-white uppercase flex items-center drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="font-mono text-[10px] md:text-[11px] text-slate-400/80 tracking-widest uppercase">
          <span className="text-blue-200/40 mr-2">{"//"}</span>
          {subtitle}
        </p>
      )}
    </div>
  );
}
