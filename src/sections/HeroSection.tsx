import React from "react";
import { profile } from "../data/profile";
import { motion } from "motion/react";
import { Github } from "lucide-react";

export function HeroSection() {
  return (
    <section className="w-[100vw] min-h-screen relative left-1/2 -translate-x-1/2 flex flex-col items-center justify-center -mt-32 overflow-hidden pointer-events-none mb-16">
      <div className="flex flex-col items-center justify-center z-10 w-full max-w-full px-4 mt-16 pointer-events-auto">
        <motion.h1 
          initial={{ opacity: 0, letterSpacing: "0.3em", filter: "blur(12px)", scale: 1.02 }}
          animate={{ opacity: 1, letterSpacing: "0em", filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative text-4xl xs:text-5xl sm:text-[6rem] md:text-[9rem] xl:text-[12rem] font-thin font-serif leading-[0.8] text-center whitespace-nowrap select-none"
        >
          {/* Nebula Glow Layer */}
          <span 
             className="absolute inset-0 bg-gradient-to-b from-[#F8F9FA] to-transparent bg-clip-text text-transparent blur-[40px] opacity-60"
             aria-hidden="true"
             style={{ willChange: 'filter' }}
          >
            HUGO LEE
          </span>
          {/* Main Cinematic Text */}
          <span className="relative z-10 bg-gradient-to-b from-[#F8F9FA] via-[#8E939A] to-[#000000] bg-clip-text text-transparent">
            HUGO LEE
          </span>
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3.5, delay: 2.5, ease: "easeOut" }}
          className="mt-10 md:mt-16 max-w-2xl text-center px-4"
        >
          <p className="text-[#8e939a] font-light text-sm md:text-base lg:text-lg tracking-[0.2em] leading-relaxed select-none">
            {profile.bio}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3, delay: 3.5, ease: "easeOut" }}
          className="mt-12 lg:mt-20 flex justify-center"
        >
          <a
            href={`https://${profile.contact.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/25 hover:bg-white/5 text-[#8e939a] hover:text-white transition-all duration-500 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            aria-label="GitHub Profile"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] skew-x-[-30deg] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            <Github className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} fill="currentColor" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
