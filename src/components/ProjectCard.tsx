import { useState, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { ExternalLink, Calendar, CircleDot, Cpu } from "lucide-react";
import type { Project } from "../data";
import { audioManager } from "../lib/audio";

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick?: () => void;
}

export function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isClickedGlitch, setIsClickedGlitch] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const triggerGlitch = () => {
      const waitTime = 5000 + Math.random() * 5000;
      timeout = setTimeout(() => {
        if (Math.random() > 0.5) {
          setIsGlitching(true);

          setTimeout(() => setIsGlitching(false), 200 + Math.random() * 400);
        }
        triggerGlitch();
      }, waitTime);
    };
    triggerGlitch();
    return () => clearTimeout(timeout);
  }, []);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const handleCardClick = () => {
    setIsClickedGlitch(true);
    audioManager.playScan();

    setTimeout(() => {
      onClick?.();
      setTimeout(() => setIsClickedGlitch(false), 1000);
    }, 200);
  };

  const clipPathOuter =
    "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))";
  const clipPathInner =
    "polygon(0 0, calc(100% - 19px) 0, 100% 19px, 100% 100%, 19px 100%, 0 calc(100% - 19px))";

  const actualGlitch = isGlitching || isClickedGlitch;

  const chromRedX = actualGlitch
    ? isClickedGlitch
      ? "-8px"
      : "-3px"
    : isHovered
      ? "-1px"
      : "0px";
  const chromRedY = actualGlitch
    ? isClickedGlitch
      ? "4px"
      : "2px"
    : isHovered
      ? "1px"
      : "0px";
  const chromCyanX = actualGlitch
    ? isClickedGlitch
      ? "8px"
      : "3px"
    : isHovered
      ? "1px"
      : "0px";
  const chromCyanY = actualGlitch
    ? isClickedGlitch
      ? "-4px"
      : "-2px"
    : isHovered
      ? "-1px"
      : "0px";

  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.8,
        delay: 0.2 + index * 0.1,
        ease: "easeOut",
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        audioManager.playBleep(500, 0.02, 0.05);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={
        {
          "--hover-color": project.color,
          maskImage: actualGlitch ? `url(#glitch-mask-${index})` : "none",
          WebkitMaskImage: actualGlitch ? `url(#glitch-mask-${index})` : "none",
        } as React.CSSProperties
      }
      className={`group relative flex flex-col h-full w-full break-inside-avoid shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_-5px_var(--hover-color)] transition-all duration-500 cursor-pointer ${
        actualGlitch
          ? "animate-card-glitch-flash drop-shadow-[0_0_15px_var(--hover-color)] opacity-90"
          : ""
      } ${isClickedGlitch ? "scale-[0.95] duration-150 ease-in-out" : ""}`}
    >
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <mask
            id={`glitch-mask-${index}`}
            maskUnits="objectBoundingBox"
            maskContentUnits="objectBoundingBox"
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <rect
                key={i}
                className={actualGlitch ? "card-glitch-slice" : ""}
                x="0"
                y={(i / 25).toFixed(4)}
                width="1"
                height={(1 / 25 + 0.01).toFixed(4)}
                fill="white"
                style={{
                  animationDelay: `${Math.random() * 0.2}s`,
                  animationDuration: `${0.1 + Math.random() * 0.2}s`,
                }}
              />
            ))}
          </mask>
        </defs>
      </svg>

      <motion.div
        className={`pointer-events-none absolute -inset-6 transition duration-300 z-[-1] blur-2xl mix-blend-screen ${isHovered ? "opacity-100" : "opacity-0"}`}
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at calc(${mouseX}px + 24px) calc(${mouseY}px + 24px),
              ${project.color}50,
              transparent 70%
            )
          `,
        }}
      />

      <div
        className="absolute inset-[1px] bg-red-600/30 mix-blend-screen pointer-events-none transition-all duration-75 z-0"
        style={{
          clipPath: clipPathOuter,
          transform: `translate(${chromRedX}, ${chromRedY})`,
          opacity: isHovered || actualGlitch ? 0.8 : 0,
        }}
      />

      <div
        className="absolute inset-[1px] bg-cyan-400/30 mix-blend-screen pointer-events-none transition-all duration-75 z-0"
        style={{
          clipPath: clipPathOuter,
          transform: `translate(${chromCyanX}, ${chromCyanY})`,
          opacity: isHovered || actualGlitch ? 0.8 : 0,
        }}
      />

      <div
        className="absolute inset-0 transition-colors duration-500 z-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.01) 100%)",
          clipPath: clipPathOuter,
        }}
      />

      <div
        className={`absolute inset-0 transition-opacity duration-500 z-0 pointer-events-none ${isHovered || actualGlitch ? "opacity-100" : "opacity-0"}`}
        style={{
          background: `linear-gradient(135deg, var(--hover-color) 0%, transparent 60%)`,
          clipPath: clipPathOuter,
        }}
      />

      <motion.div
        className={`pointer-events-none absolute inset-0 transition duration-300 z-0 ${isHovered || isClickedGlitch ? "opacity-100" : "opacity-0"} ${actualGlitch ? "opacity-80 mix-blend-screen" : ""}`}
        style={{
          clipPath: clipPathOuter,
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              ${project.color}40,
              transparent 80%
            )
          `,
        }}
      />

      <div
        className="absolute inset-[1px] bg-slate-950/40 backdrop-blur-md transition-colors duration-500 z-0 shadow-inner pointer-events-none"
        style={{ clipPath: clipPathInner }}
      />

      <div
        className={`absolute inset-[1px] pointer-events-none z-0 mix-blend-screen transition-opacity duration-75 ${
          actualGlitch ? "opacity-80 translate-y-[2px]" : "opacity-30"
        }`}
        style={{
          background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.04) 2px,
              rgba(255, 255, 255, 0.04) 4px
            )`,
          clipPath: clipPathInner,
        }}
      />

      <div
        className={`absolute inset-[1px] transition-opacity duration-700 pointer-events-none z-0 mix-blend-screen ${isHovered ? "opacity-10" : "opacity-0"}`}
        style={{
          background: `linear-gradient(135deg, transparent 40%, ${project.color} 100%)`,
          clipPath: clipPathInner,
        }}
      />

      <div
        className={`relative z-10 flex flex-col h-full pointer-events-auto transition-transform duration-75 ${actualGlitch ? "-translate-x-[2px] translate-y-[1px]" : ""}`}
      >
        <div className="absolute top-2 right-8 w-12 h-4 pointer-events-none opacity-30 flex justify-end">
          <div className="w-[1px] h-2 bg-white absolute top-0 right-0"></div>
          <div className="w-3 h-[1px] bg-white absolute top-0 right-0"></div>
          <div className="w-[1px] h-1 bg-white absolute top-0 right-2"></div>
          <div className="w-[1px] h-1.5 bg-white absolute top-0 right-4"></div>
          <div className="w-[1px] h-1 bg-white absolute top-0 right-6"></div>
          <div className="text-[5px] font-mono absolute top-2.5 right-0 text-white tracking-widest leading-none">
            {actualGlitch
              ? "ERR_x9F"
              : Math.random().toString().substring(2, 8)}
          </div>
        </div>

        <div className="absolute bottom-2 left-6 h-4 pointer-events-none opacity-30 flex items-end z-20">
          <div className="text-[6px] font-mono leading-none tracking-widest text-slate-300 whitespace-nowrap">
            SEC-[0{index + 1}]
          </div>
        </div>

        <div
          className={`flex justify-between items-start p-6 border-b transition-colors duration-500 relative ${isHovered ? "border-[var(--hover-color)]/30" : "border-white/[0.05]"}`}
        >
          <div
            className={`absolute top-0 left-0 w-0 h-[1px] bg-[var(--hover-color)] transition-all duration-1000 ease-in-out opacity-0 ${isHovered || actualGlitch ? "w-full opacity-100" : ""}`}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-none"
                style={{
                  backgroundColor: project.color,
                  boxShadow: `0 0 8px ${project.color}`,
                }}
              />
              <span
                className="font-mono text-[9px] tracking-[0.2em] font-bold uppercase transition-colors"
                style={{ color: actualGlitch ? "#ef4444" : project.color }}
              >
                {actualGlitch ? "CORRUPT" : project.category}
              </span>
            </div>
            <h3
              className={`text-xl md:text-2xl font-bold font-mono uppercase tracking-wide leading-tight transition-all duration-300 ${
                isHovered
                  ? "text-white drop-shadow-[0_0_12px_var(--hover-color)]"
                  : "text-white/90"
              }`}
            >
              {project.name}
            </h3>
          </div>

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                audioManager.playBleep(800, 0.1, 0.1);
              }}
              className={`p-2 sm:p-2.5 bg-white/[0.02] border border-white/10 hover:border-[var(--hover-color)] text-slate-400 hover:text-white transition-all duration-300 ml-4 group/icon ${isHovered ? "scale-110" : ""}`}
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
              }}
            >
              <ExternalLink
                size={16}
                className="group-hover/icon:drop-shadow-[0_0_8px_white]"
              />
            </a>
          )}
        </div>

        <div className="p-6 flex-grow border-b border-white/[0.05] relative bg-white/[0.01]">
          <div
            className={`absolute top-3 left-3 w-2 h-2 border-l border-t transition-colors ${isHovered ? "border-[var(--hover-color)]/70" : "border-white/20"}`}
          />
          <div
            className={`absolute bottom-3 right-3 w-2 h-2 border-r border-b transition-colors ${isHovered ? "border-[var(--hover-color)]/70" : "border-white/20"}`}
          />

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              {actualGlitch ? "ERR_DESC //" : "Sys.Desc //"}
            </span>
            <div className="h-[1px] flex-grow bg-white/[0.05]" />
          </div>

          <p className="text-sm text-slate-300/80 leading-relaxed font-mono font-light">
            {project.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 mt-auto">
          <div className="p-5 sm:border-r border-b sm:border-b-0 border-white/[0.05] relative group/tech">
            <div className="flex items-center gap-1.5 mb-4">
              <Cpu size={12} className="text-slate-500" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                Core.Modules
              </span>
            </div>

            <div className="flex flex-wrap gap-2 auto-rows-max">
              {project.techStack.map((tech) => (
                <div
                  key={tech}
                  className="relative px-2 py-1 flex items-center gap-1.5 text-[9px] font-mono text-[var(--hover-color)] border border-[var(--hover-color)]/20 bg-black/40 uppercase tracking-wider transition-all duration-300 group-hover/tech:border-[var(--hover-color)]/60 group-hover/tech:bg-[var(--hover-color)]/10"
                  style={{ textShadow: "0 0 10px var(--hover-color)" }}
                >
                  <div className="absolute -top-px -left-px w-1 h-1 bg-[var(--hover-color)]/80" />
                  <div className="absolute -bottom-px -right-px w-1 h-1 bg-[var(--hover-color)]/80" />

                  <div className="w-1 h-1 bg-[var(--hover-color)] shadow-[0_0_6px_var(--hover-color)] animate-pulse" />

                  <span className="z-10">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 flex flex-col justify-center gap-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjAuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPjwvc3ZnPg==')] relative">
            <div className="absolute top-2 right-2 text-[6px] text-slate-500 font-mono tracking-widest opacity-50">
              ID:{Math.random().toString(36).substring(2, 8).toUpperCase()}-
              {index}
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="opacity-50" />
                <span>Log.Date</span>
              </div>
              <span className="text-slate-300">{project.stardate}</span>
            </div>
            <div className="w-full h-[1px] bg-white/[0.05]" />
            <div className="flex justify-between items-center text-[10px] font-mono tracking-wider">
              <span className="text-slate-400">Status</span>
              <div
                className="flex items-center gap-2"
                style={{
                  color:
                    project.status === "ACTIVE"
                      ? "#34d399"
                      : project.status === "IN PROGRESS"
                        ? "#fbbf24"
                        : "#94a3b8",
                  textShadow:
                    project.status === "ACTIVE"
                      ? "0 0 8px rgba(52,211,153,0.5)"
                      : project.status === "IN PROGRESS"
                        ? "0 0 8px rgba(251,191,36,0.5)"
                        : "none",
                }}
              >
                <span className="uppercase font-bold">
                  {actualGlitch ? "FAILING" : project.status}
                </span>
                <div className="relative flex items-center justify-center w-3 h-3">
                  {(project.status === "ACTIVE" ||
                    project.status === "IN PROGRESS") && (
                    <span
                      className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                      style={{ backgroundColor: "currentColor" }}
                    ></span>
                  )}
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{
                      backgroundColor: "currentColor",
                      boxShadow: "0 0 6px currentColor",
                    }}
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
