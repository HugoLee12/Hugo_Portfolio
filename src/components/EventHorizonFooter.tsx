import React from 'react';
import { Github, Mail, Rocket } from 'lucide-react';
import { audioManager } from '../lib/audio';
import { profile } from '../data/profile';
import { motion } from 'motion/react';

export function EventHorizonFooter() {
  const scrollToTop = () => {
    audioManager.playBleep(1500, 0.1, 0.1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHover = () => {
    audioManager.playBleep(3000, 0.05, 0.02);
  };

  return (
    <footer className="relative mt-16 z-40 w-full overflow-hidden pb-8 pt-10">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#76D6CB]/20 to-transparent" />
      
      {/* Light subtle glow in the middle of divider */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-[#76D6CB]/40 blur-[1px]"
      />
      
      {/* Footer Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 flex flex-col items-center gap-6">
        
        {/* Social Icons */}
        <div className="flex items-center gap-6 pointer-events-auto">
          <a
            href={`https://${profile.contact.github}`}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={handleHover}
            aria-label="Escape Hatch: GitHub"
            className="flex items-center gap-2 text-[#4a5568] hover:text-[#D7DAE2] hover:drop-shadow-[0_0_10px_rgba(215,218,226,0.8)] transition-all duration-300 group"
          >
            <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase">
              GitHub
            </span>
          </a>
          <a
            href={`mailto:${profile.contact.email}`}
            onMouseEnter={handleHover}
            className="text-[#4a5568] hover:text-[#9BAFC3] hover:drop-shadow-[0_0_10px_rgba(155,175,195,0.8)] transition-all duration-300 group"
          >
            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="sr-only">Email</span>
          </a>
        </div>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          onMouseEnter={handleHover}
          className="group relative flex items-center gap-3 text-[#5F6675] hover:text-[#76D6CB] transition-colors duration-300 pointer-events-auto cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full border border-[#4a5568]/30 group-hover:border-[#76D6CB]/50 flex items-center justify-center bg-[#080b14]/40 backdrop-blur-sm transition-all duration-300 overflow-hidden relative">
            {/* The initial ship */}
            <Rocket className="w-3.5 h-3.5 group-hover:-translate-y-8 group-hover:opacity-0 transition-all duration-500 ease-in-out" />
            {/* The incoming ship from bottom */}
            <Rocket className="w-3.5 h-3.5 absolute translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-in-out" />
          </div>
        </button>

        {/* Copyright / Status line */}
        <div className="text-center font-mono text-[8.5px] text-[#4a5568]/60 tracking-[0.25em] uppercase">
          <p>© {new Date().getFullYear()} {profile.name} // SYSTEM_ONLINE</p>
        </div>
      </div>
    </footer>
  );
}
