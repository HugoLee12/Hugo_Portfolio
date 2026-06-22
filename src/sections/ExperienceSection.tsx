import React from 'react';
import { motion } from 'motion/react';
import { HudSection } from '../components/hud/HudSection';
import { SectionHeader } from '../components/hud/SectionHeader';
import { experiences } from '../data/experience';

export function ExperienceSection() {
  return (
    <HudSection id="experience">
      <SectionHeader title="Experience" subtitle="Classified Dossier" number="03" />

      <div className="relative mt-12 md:mt-16 sm:pl-4">
        {/* Timeline Core Axis */}
        <div className="absolute top-0 bottom-0 left-[24px] sm:left-[36px] w-px bg-gradient-to-b from-transparent via-slate-500/15 to-transparent pointer-events-none" />

        <div className="space-y-16 md:space-y-24">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative flex flex-col sm:flex-row gap-6 sm:gap-12"
            >
              {/* Star Node & Hover Glow effect anchored to timeline */}
              <div className="absolute left-[20px] sm:left-[32px] top-1 sm:top-1.5 flex h-2 w-2 items-center justify-center">
                {/* Local timeline segment glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-16 sm:h-24 bg-gradient-to-b from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="relative flex h-full w-full items-center justify-center">
                  {/* Connecting line to content */}
                  <div className="absolute left-1/2 top-1/2 -translate-y-1/2 h-px w-10 sm:w-16 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-500/40 border border-slate-400/40 group-hover:bg-white group-hover:border-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-500 z-10" />
                </div>
              </div>

              {/* Timestamp / Status / Metadata */}
              <div className="pt-0 pl-16 sm:pl-20 sm:w-1/4 flex flex-col gap-1 z-10 relative mt-1 sm:mt-0">
                <span className="font-mono text-xs sm:text-sm text-slate-400/80 group-hover:text-blue-200/90 transition-colors duration-300">
                  {exp.period}
                </span>
                <span className="font-mono text-[10px] text-slate-500/80 uppercase tracking-widest group-hover:text-slate-400/90 transition-colors">
                  {index === 0 ? "STATUS: ACTIVE" : "STATUS: ARCHIVED"}
                </span>
              </div>

              {/* Content Box */}
              <div className="pl-16 sm:pl-0 sm:w-3/4 relative z-10">
                {/* Subtle behind-content hover glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />

                <div className="relative">
                  <h3 className="font-mono text-base md:text-lg tracking-widest uppercase text-slate-200/90 group-hover:text-white/90 transition-colors duration-300 mb-1">
                    {exp.role}
                  </h3>
                  <p className="font-mono text-xs md:text-sm text-slate-400/80 uppercase tracking-wide mb-6 flex items-center gap-2">
                    <span className="text-slate-500/40">{"//"}</span>
                    {exp.company}
                  </p>

                  <p className="text-slate-400/80 group-hover:text-slate-300/90 text-sm mb-6 leading-relaxed max-w-3xl transition-colors duration-300">
                    {exp.description}
                  </p>

                  <ul className="space-y-3">
                    {exp.achievements.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 group/item">
                        <span className="text-slate-500/40 font-mono text-xs sm:text-sm mt-0.5 group-hover/item:text-blue-200/40 transition-colors">
                          ›
                        </span>
                        <span className="text-slate-500/80 text-xs md:text-sm group-hover/item:text-slate-300/90 transition-colors duration-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </HudSection>
  );
}
