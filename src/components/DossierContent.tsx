import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Maximize2, Star, FileText, ArrowRight, Github } from "lucide-react";
import { Project } from "../data";
import { audioManager } from "../lib/audio";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

export function DecryptText({
  text,
  delay = 0,
  duration = 800,
  className = "",
  as: Tag = "span",
}: {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  as?: any;
}) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    setDisplayText("");

    timeout = setTimeout(() => {
      let iteration = 0;
      const intervalTime = 30;
      const totalSteps = duration / intervalTime;
      const stepSize = Math.max(1, text.length / totalSteps);

      interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char: string, index: number) => {
              if (char === " " || char === "\n") return char;
              if (index < Math.floor(iteration)) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join(""),
        );

        if (iteration >= text.length) {
          clearInterval(interval);
        }

        iteration += stepSize;
      }, intervalTime);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay, duration]);

  return (
    <Tag className={className}>
      {displayText || text.replace(/[^ \n]/g, "-")}
    </Tag>
  );
}

function HolographicDecorations() {
  const particles = Array.from({ length: 20 });
  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden mix-blend-screen opacity-70">
        <div
          className="w-full h-[120px] animate-[crt-scanline_3s_linear_infinite]"
          style={{
            background:
              "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hologram-core) 30%, transparent), transparent)",
          }}
        />
        <div
          className="w-full h-[2px] animate-[crt-scanline_6s_linear_infinite]"
          style={{
            background: "var(--hologram-core)",
            opacity: 0.6,
            boxShadow: "0 0 10px var(--hologram-core)",
          }}
        />
      </div>

      <div
        className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 z-50 pointer-events-none rounded-tl-sm"
        style={{
          borderColor: "var(--hologram-core)",
          boxShadow:
            "inset 2px 2px 4px color-mix(in srgb, var(--hologram-core) 40%, transparent), -2px -2px 10px color-mix(in srgb, var(--hologram-core) 20%, transparent)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 z-50 pointer-events-none rounded-tr-sm"
        style={{
          borderColor: "var(--hologram-core)",
          boxShadow:
            "inset -2px 2px 4px color-mix(in srgb, var(--hologram-core) 40%, transparent), 2px -2px 10px color-mix(in srgb, var(--hologram-core) 20%, transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 z-50 pointer-events-none rounded-bl-sm"
        style={{
          borderColor: "var(--hologram-core)",
          boxShadow:
            "inset 2px -2px 4px color-mix(in srgb, var(--hologram-core) 40%, transparent), -2px 2px 10px color-mix(in srgb, var(--hologram-core) 20%, transparent)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 z-50 pointer-events-none rounded-br-sm"
        style={{
          borderColor: "var(--hologram-core)",
          boxShadow:
            "inset -2px -2px 4px color-mix(in srgb, var(--hologram-core) 40%, transparent), 2px 2px 10px color-mix(in srgb, var(--hologram-core) 20%, transparent)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none border rounded-sm opacity-40 mix-blend-screen animate-[holo-glitch_4s_infinite]"
        style={{ borderColor: "var(--hologram-core)", borderWidth: "2px" }}
      />
      <div
        className="absolute inset-0 pointer-events-none border rounded-sm opacity-20 mix-blend-screen animate-[holo-glitch-2_7s_infinite_reverse]"
        style={{ borderColor: "var(--hologram-core)", borderWidth: "2px" }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-40 overflow-hidden mix-blend-screen rounded-[inherit]"
        style={{
          WebkitMaskImage:
            "radial-gradient(circle, transparent 30%, black 90%)",
          maskImage: "radial-gradient(circle, transparent 30%, black 90%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.0' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              backgroundColor: "var(--hologram-core)",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: "0 0 4px var(--hologram-core)",
            }}
            animate={{
              y: [0, Math.random() * 20 - 10, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 0.8, 0, 0.5, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              times: [0, 0.2, 0.5, 0.8, 1],
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </>
  );
}

function HoverRipple({
  children,
  className = "",
  color = "var(--hologram-core)",
  radius = 100,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
  radius?: number;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 mix-blend-screen z-0"
        style={{
          opacity,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, color-mix(in srgb, ${color} 40%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

interface DossierContentProps {
  project: Project;
  onClose?: () => void;
  dragHandler?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function DossierContent({
  project,
  onClose,
  dragHandler,
}: DossierContentProps) {
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);

  return (
    <>
      <HolographicDecorations />

      <div
        className="absolute top-2 left-3 text-[8px] sm:text-[9px] font-mono tracking-widest hidden md:block select-none pointer-events-none opacity-50"
        style={{ color: "var(--hologram-core)" }}
      >
        SYS.FILE
      </div>
      <div className="absolute top-2 right-3 hidden md:flex items-center gap-2 select-none pointer-events-none">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{
            backgroundColor: "var(--hologram-core)",
            boxShadow: "0 0 8px var(--hologram-core)",
          }}
        />
        <span
          className="text-[8px] sm:text-[9px] font-mono tracking-widest uppercase opacity-80"
          style={{ color: "var(--hologram-core)" }}
        >
          LIVE
        </span>
      </div>

      <div
        className="absolute bottom-2 right-3 text-[7px] sm:text-[8px] font-mono tracking-widest hidden md:block select-none pointer-events-none opacity-50"
        style={{ color: "var(--hologram-core)" }}
      >
        LAT: 34.0204 LONG: -118.4117
      </div>

      {dragHandler && (
        <div
          className="md:hidden w-full flex justify-center pt-3 pb-4 absolute top-0 left-0 z-50 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={dragHandler}
        >
          <div
            className="w-12 h-1.5 rounded-full pointer-events-none"
            style={{ backgroundColor: "var(--hologram-core)" }}
          />
        </div>
      )}

      {dragHandler && (
        <div
          id="dossier-anchor"
          className="absolute top-16 -left-[1px] z-50 flex items-center justify-center"
        >
          <div
            className="w-[2px] h-10 md:h-12 hidden md:block transition-all duration-300"
            style={{
              backgroundColor: "var(--hologram-core)",
              boxShadow: `0 0 12px var(--hologram-core), 0 0 4px var(--hologram-core)`,
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-between p-5 pb-2 pt-8 md:pt-6 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-slate-400" />
          <DecryptText
            text="Project Details"
            duration={800}
            className="font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-sm border bg-[#020617]/50 backdrop-blur-md"
            style={{
              borderColor:
                "color-mix(in srgb, var(--hologram-core) 30%, transparent)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                backgroundColor: "var(--hologram-core)",
                boxShadow: `0 0 8px var(--hologram-core)`,
              }}
            />
            <DecryptText
              text={project.status}
              duration={800}
              className="font-mono text-[9px] font-medium tracking-[0.2em] text-white uppercase"
            />
          </div>
          {onClose && (
            <button
              onClick={() => {
                audioManager.playBleep(600, 0.05, 0.05);
                onClose();
              }}
              onPointerEnter={() => audioManager.playBleep(1200, 0.02, 0.02)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div
        className="px-5 pb-5 overflow-y-auto custom-scrollbar flex flex-col gap-4 relative z-10 flex-1"
        style={{ transform: "translateZ(30px)" }}
      >
        <HoverRipple className="mb-1 rounded-md p-2 -mx-2" radius={150}>
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <h2
                className="text-xl sm:text-2xl font-mono tracking-[0.1em] font-medium uppercase truncate pr-4"
                style={{
                  color:
                    "color-mix(in srgb, var(--hologram-core) 80%, white 20%)",
                  textShadow:
                    "0 0 12px color-mix(in srgb, var(--hologram-core) 60%, transparent)",
                }}
              >
                <DecryptText text={project.name} duration={1000} />
              </h2>
              <button
                className="transition-colors hover:scale-110"
                style={{ color: "var(--hologram-core)" }}
              >
                <Star size={16} />
              </button>
            </div>
            <p
              className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase"
              style={{ color: "var(--hologram-core)" }}
            >
              <DecryptText text={project.category} duration={800} />
            </p>
          </div>
        </HoverRipple>

        {project.image && (
          <HoverRipple className="relative" radius={200}>
            <div
              className="absolute -top-3 left-0 w-8 h-[1px]"
              style={{ backgroundColor: "var(--hologram-core)", opacity: 0.5 }}
            />
            <div
              className="absolute -top-3 left-0 w-[1px] h-3"
              style={{ backgroundColor: "var(--hologram-core)", opacity: 0.5 }}
            />
            <div
              className="absolute -top-3 right-0 w-8 h-[1px]"
              style={{ backgroundColor: "var(--hologram-core)", opacity: 0.5 }}
            />
            <div
              className="absolute -top-3 right-0 w-[1px] h-3"
              style={{ backgroundColor: "var(--hologram-core)", opacity: 0.5 }}
            />

            <div
              className="relative w-full aspect-[21/9] shrink-0 rounded-sm overflow-hidden group cursor-pointer border"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--hologram-core) 40%, transparent)",
              }}
              onClick={() => {
                audioManager.playScan();
                setIsMediaExpanded(true);
              }}
              onPointerEnter={() => audioManager.playBleep(1000, 0.04, 0.02)}
            >
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-luminosity hover:mix-blend-normal"
              />
              <div
                className="absolute inset-0 transition-colors mix-blend-color opacity-30 group-hover:opacity-0"
                style={{ backgroundColor: "var(--hologram-core)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                <div
                  className="flex items-center gap-2 text-white bg-slate-900/80 px-4 py-2 rounded-sm font-mono text-[9px] uppercase tracking-[0.2em] border"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--hologram-core) 50%, transparent)",
                  }}
                >
                  <Maximize2 size={12} />
                  <span>VIEW MEDIA</span>
                </div>
              </div>
            </div>

            <div
              className="absolute inset-x-0 top-0 h-[2px] animate-[scan_4s_ease-in-out_infinite] pointer-events-none"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--hologram-core) 50%, transparent)",
                boxShadow: `0 0 12px var(--hologram-core)`,
              }}
            />
          </HoverRipple>
        )}

        <HoverRipple className="p-2 -mx-2 rounded-md" radius={200}>
          <p className="text-[11px] text-slate-300 leading-loose font-mono tracking-wide max-w-[95%]">
            <DecryptText text={project.description} duration={2000} />
          </p>
        </HoverRipple>

        <div className="mt-1">
          <div className="flex items-center gap-4 mb-3">
            <h3 className="font-mono text-[9px] tracking-[0.2em] text-[#a8b8d0] uppercase font-bold">
              Technologies
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-700/60 to-transparent"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <HoverRipple
                key={tech}
                className="px-2 py-1.5 rounded-sm bg-[#020617]/50 border backdrop-blur-md cursor-default pointer-events-auto"
                radius={60}
              >
                <div
                  className="absolute inset-0 rounded-sm pointer-events-none"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--hologram-core) 40%, transparent)",
                    boxShadow:
                      "0 0 10px color-mix(in srgb, var(--hologram-core) 10%, transparent)",
                    borderWidth: "1px",
                  }}
                />
                <span
                  className="text-[8px] tracking-[0.2em] uppercase font-mono font-medium relative z-10"
                  style={{
                    color:
                      "color-mix(in srgb, var(--hologram-core) 80%, white 20%)",
                  }}
                >
                  <DecryptText text={tech} duration={1200} />
                </span>
              </HoverRipple>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between gap-3 mt-1 relative z-10 mt-4 shrink-0 before:absolute before:inset-x-5 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[var(--hologram-core)] before:to-transparent before:opacity-30">
        <a
          href={project.github || "https://github.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 max-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm bg-[#020617]/40 border text-slate-300 hover:text-white transition-all font-mono text-[9px] tracking-[0.2em] uppercase font-medium backdrop-blur-md hover:bg-white/5"
          style={{
            borderColor:
              "color-mix(in srgb, var(--hologram-core) 40%, transparent)",
          }}
          onPointerEnter={() => audioManager.playBleep(1200, 0.03, 0.02)}
          onClick={() => audioManager.playBleep(900, 0.05, 0.05)}
        >
          <Github size={12} />
          <span>SOURCE CODE</span>
        </a>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm bg-[#020617]/60 border transition-all font-mono text-[9px] tracking-[0.2em] uppercase font-bold backdrop-blur-md group relative overflow-hidden"
          style={{
            borderColor: "var(--hologram-core)",
            color: "color-mix(in srgb, var(--hologram-core) 80%, white 20%)",
            boxShadow: `0 0 15px -2px color-mix(in srgb, var(--hologram-core) 40%, transparent), inset 0 0 12px -2px color-mix(in srgb, var(--hologram-core) 30%, transparent)`,
          }}
          onPointerEnter={() => audioManager.playBleep(1400, 0.03, 0.02)}
          onClick={() => audioManager.playScan()}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <span>VIEW PROJECT</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isMediaExpanded && project.image && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-slate-900/90 backdrop-blur-md pointer-events-auto"
              onClick={() => setIsMediaExpanded(false)}
            >
              <button
                className="absolute top-6 right-6 p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-full text-white backdrop-blur-md transition-colors z-[110]"
                onClick={() => {
                  audioManager.playBleep(600, 0.05, 0.05);
                  setIsMediaExpanded(false);
                }}
                onPointerEnter={() => audioManager.playBleep(1200, 0.02, 0.02)}
              >
                <X size={24} />
              </button>
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={project.image}
                alt={project.name}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-700/50"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
