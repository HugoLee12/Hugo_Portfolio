import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HudSection } from '../components/hud/HudSection';
import { SectionHeader } from '../components/hud/SectionHeader';
import { profile } from '../data/profile';

function HolographicAccent() {
  return (
    <div className="relative w-20 h-20 lg:w-28 lg:h-28 rounded-full flex items-center justify-center opacity-70 mix-blend-screen group-hover:opacity-100 transition-opacity duration-1000">
      <div className="absolute inset-0 rounded-full border-[0.5px] border-slate-400/20 shadow-[0_0_15px_rgba(148,163,184,0.05)_inset]" />
      <motion.div 
        animate={{ rotateZ: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-1 rounded-full border border-dashed border-slate-500/20"
      />
      <motion.div 
        animate={{ rotateZ: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 rounded-full border-[0.5px] border-slate-400/10"
      />
      <div className="absolute inset-[35%] bg-slate-400/10 rounded-full blur-md animate-pulse" />
      <div className="absolute inset-1/2 -m-[1px] w-[2px] h-[2px] bg-slate-300 rounded-full shadow-[0_0_8px_rgba(203,213,225,0.8)]" />
    </div>
  );
}

function InfoBlock({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="flex flex-col space-y-1"
    >
      <span className="text-[10px] text-slate-400/60 font-mono tracking-widest uppercase">
        {label}
      </span>
      <span className="text-slate-200 font-sans font-medium text-sm lg:text-[15px] tracking-wide">
        {value}
      </span>
    </motion.div>
  );
}

function CoreCompetency({ index, title, description, delay }: { index: string, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="relative pl-4 lg:pl-5 py-0.5 border-l-[0.5px] border-slate-500/20"
    >
      <div className="absolute left-0 top-2 w-[3px] h-[3px] bg-slate-400/50 -translate-x-[2px] rounded-full" />
      <h4 className="text-[11px] text-slate-300 font-mono tracking-widest uppercase mb-1.5 flex items-center gap-2">
        <span className="text-slate-500/50">[{index}]</span> {title}
      </h4>
      <p className="text-slate-400/80 font-sans text-[13px] leading-relaxed font-light">
        {description}
      </p>
    </motion.div>
  );
}

export function AboutSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <HudSection id="about">
      <SectionHeader title="PROFILE DOSSIER" subtitle="Professional Overview" number="01" />

      <div 
        className="relative w-full pb-12 lg:pb-20 group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '2000px' }}
      >
        <motion.div
           animate={{
            rotateX: mousePos.y * -4,
            rotateY: mousePos.x * 4,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 25 }}
          className="relative w-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Deep Environment Glow */}
          <div className="absolute inset-0 z-0 bg-slate-800/10 blur-[100px] rounded-[3rem] pointer-events-none" style={{ transform: 'translateZ(-40px)' }} />

          {/* Main Glass Panel */}
          <div 
            className="relative z-10 w-full rounded-2xl lg:rounded-3xl bg-slate-900/5 backdrop-blur-md transition-all duration-700 h-full border-[0.5px] border-slate-500/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
            style={{ 
               transformStyle: 'preserve-3d',
            }}
          >
            {/* Subtle inner box shadow to imply volume */}
            <div className="absolute inset-0 rounded-2xl lg:rounded-3xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.01)] pointer-events-none" />

            {/* Corner Decorative Brackets */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-[0.5px] border-l-[0.5px] border-slate-400/20 rounded-tl-2xl lg:rounded-tl-3xl opacity-50" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[0.5px] border-r-[0.5px] border-slate-500/20 rounded-br-2xl lg:rounded-br-3xl opacity-50" />
            
            {/* Soft background glow within the panel */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-slate-800/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-slate-700/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Inner Content Wrapper translated forward for Parallax */}
            <div 
               className="relative z-20 p-8 sm:p-12 lg:p-14"
               style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                
                {/* Left Column: Dossier Metadata */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-12">
                  <div className="space-y-8 lg:space-y-10">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="flex items-center gap-6"
                    >
                      <HolographicAccent />
                      <div className="flex flex-col space-y-1">
                        <span className="text-slate-200 font-sans text-xl lg:text-2xl font-light tracking-wide">
                          {profile.name}
                        </span>
                        <span className="text-slate-400/80 font-mono text-xs tracking-widest uppercase">
                          {profile.title}
                        </span>
                      </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-y-8 gap-x-4">
                      <InfoBlock label="Core Focus" value={profile.focus} delay={0.3} />
                      <InfoBlock label="Location" value={profile.location} delay={0.4} />
                      <InfoBlock label="Availability" value={profile.status} delay={0.5} />
                    </div>
                  </div>
                </div>

                {/* Right Column: Bio & Competencies */}
                <div className="lg:col-span-8 flex flex-col space-y-10">
                  <div className="relative">
                    {/* Minimalist Top Separator */}
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                      className="absolute -top-6 left-0 w-16 h-px bg-gradient-to-r from-slate-400/30 to-transparent origin-left" 
                    />

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="space-y-6"
                    >
                       <p className="text-slate-300 font-sans text-[15px] lg:text-[16px] leading-[1.8] font-light">
                          {profile.bio}
                       </p>
                    </motion.div>
                  </div>

                  {/* Core Competencies Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                    <CoreCompetency 
                      index="01" 
                      title="Frontend Architecture" 
                      description="Building responsive, accessible UIs with React, TypeScript, and Tailwind CSS." 
                      delay={0.5} 
                    />
                    <CoreCompetency 
                      index="02" 
                      title="Backend Systems" 
                      description="Architecting resilient server-side logic and APIs with Node.js and SQL/NoSQL databases." 
                      delay={0.6} 
                    />
                    <CoreCompetency 
                      index="03" 
                      title="Internal Tooling" 
                      description="Developing custom dashboards and efficient workflow automation for internal platforms." 
                      delay={0.7} 
                    />
                    <CoreCompetency 
                      index="04" 
                      title="Product Strategy" 
                      description="Translating requirements into intuitive flows, prioritizing simplicity and function." 
                      delay={0.8} 
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </HudSection>
  );
}
