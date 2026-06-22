import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useAnimate,
} from "motion/react";
import { ArrowLeft } from "lucide-react";
import { projects } from "../data";
import { ProjectCard } from "./ProjectCard";
import { InnerDimensionFocusPanel } from "./InnerDimensionFocusPanel";
import { audioManager } from "../lib/audio";

interface InnerDimensionGalleryProps {
  onReturn: () => void;
}

export function InnerDimensionGallery({
  onReturn,
}: InnerDimensionGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x: nx, y: ny });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleReturn = async () => {
    if (isExiting) return;
    setIsExiting(true);

    const container = scope.current as HTMLElement;
    const slices = container.querySelectorAll(".glitch-slice-gallery");

    audioManager.playZap();

    await animate(
      container,
      {
        filter: [
          "contrast(1) sepia(0) hue-rotate(0deg)",
          "contrast(2.5) drop-shadow(4px 0 0 cyan) drop-shadow(-4px 0 0 red) hue-rotate(90deg)",
          "contrast(3) drop-shadow(-4px 0 0 magenta) drop-shadow(4px 0 0 lime) hue-rotate(-90deg)",
          "contrast(1) sepia(0) hue-rotate(0deg)",
        ],
        x: [0, -6, 6, 0],
        skewX: [0, 2, -2, 0],
      },
      { duration: 0.15, ease: "linear" },
    );

    animate(
      container,
      { filter: ["brightness(1)", "brightness(2)", "brightness(2.5)"] },
      { duration: 0.25 },
    );

    const sliceAnims = Array.from(slices).map((el) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const shiftX = Math.random() * 30 + 10;

      return animate(
        el,
        {
          transform: [
            `translateX(0%)`,
            `translateX(${shiftX * direction}%)`,
            `translateX(${shiftX * direction * 3}%)`,
          ],
          opacity: [1, Math.random() * 0.5 + 0.2, 0],
        },
        {
          duration: 0.25,
          delay: Math.random() * 0.1,
          ease: "circOut",
        },
      );
    });

    await Promise.all(sliceAnims);

    audioManager.playPowerDown();

    await animate(
      container,
      {
        scaleY: [1, 0.01, 0.01, 0],
        scaleX: [1, 1, 0.1, 0],
        filter: [
          "brightness(2)",
          "brightness(8) drop-shadow(0 0 20px cyan)",
          "brightness(10) drop-shadow(0 0 50px white)",
          "brightness(0)",
        ],
        opacity: [1, 1, 1, 0],
      },
      { duration: 0.2, times: [0, 0.3, 0.7, 1], ease: "easeIn" },
    );

    onReturn();
  };

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || null;
  const SLICE_COUNT = 30;

  return (
    <div className="relative w-full h-screen overflow-hidden pointer-events-auto">
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <mask
            id="hologram-mask-gallery"
            maskUnits="objectBoundingBox"
            maskContentUnits="objectBoundingBox"
          >
            {Array.from({ length: SLICE_COUNT }).map((_, i) => (
              <rect
                key={i}
                className="glitch-slice-gallery"
                x="0"
                y={(i / SLICE_COUNT).toFixed(4)}
                width="1"
                height={(1 / SLICE_COUNT + 0.01).toFixed(4)}
                fill="white"
              />
            ))}
          </mask>
        </defs>
      </svg>

      <div
        ref={scope}
        className="w-full h-full bg-[#020617] origin-center"
        style={
          {
            maskImage: "url(#hologram-mask-gallery)",
            WebkitMaskImage: "url(#hologram-mask-gallery)",
          } as React.CSSProperties
        }
      >
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
          <motion.div
            className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden"
            animate={{
              scale: selectedProjectId ? 0.95 : 1.05,
            }}
            transition={{ duration: 1, ease: "anticipate" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.3)_15%,rgba(255,255,255,0.05)_45%,transparent_70%)] blur-2xl"></div>

            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.5)_0%,transparent_50%)] scale-x-[3] rotate-12 blur-3xl opacity-50 mix-blend-screen animate-pulse"
              style={{ animationDuration: "7s" }}
            ></div>
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.5)_0%,transparent_50%)] scale-x-[3] -rotate-12 blur-3xl opacity-50 mix-blend-screen animate-pulse"
              style={{ animationDuration: "11s" }}
            ></div>

            <motion.div
              className="absolute z-0 w-[50vw] h-[50vw] rounded-full blur-[120px] mix-blend-screen bg-blue-500/40"
              animate={{
                x: ["-20%", "20%", "-10%", "-20%"],
                y: ["-20%", "10%", "30%", "-20%"],
                scale: [1, 1.2, 0.8, 1],
              }}
              transition={{ duration: 25, ease: "linear", repeat: Infinity }}
              style={{ top: "20%", left: "30%" }}
            />
            <motion.div
              className="absolute z-0 w-[40vw] h-[40vw] rounded-full blur-[100px] mix-blend-screen bg-purple-500/40"
              animate={{
                x: ["20%", "-30%", "10%", "20%"],
                y: ["20%", "-10%", "20%", "20%"],
                scale: [1, 0.9, 1.3, 1],
              }}
              transition={{ duration: 30, ease: "linear", repeat: Infinity }}
              style={{ top: "40%", right: "20%" }}
            />
            <motion.div
              className="absolute z-0 w-[60vw] h-[60vw] rounded-full blur-[150px] mix-blend-screen bg-cyan-400/30"
              animate={{
                x: ["-10%", "30%", "-20%", "-10%"],
                y: ["0%", "-30%", "10%", "0%"],
                scale: [0.8, 1.1, 0.9, 0.8],
              }}
              transition={{ duration: 35, ease: "linear", repeat: Infinity }}
              style={{ top: "10%", left: "10%" }}
            />
            <motion.div
              className="absolute z-0 w-[45vw] h-[45vw] rounded-full blur-[100px] mix-blend-screen bg-pink-500/30"
              animate={{
                x: ["30%", "-10%", "20%", "30%"],
                y: ["-20%", "30%", "-10%", "-20%"],
                scale: [1.1, 0.8, 1.2, 1.1],
              }}
              transition={{ duration: 28, ease: "linear", repeat: Infinity }}
              style={{ bottom: "10%", right: "30%" }}
            />

            <div className="absolute inset-0 w-full h-full [perspective:1000px] flex items-center justify-center mix-blend-screen">
              <div
                className="w-[300vw] h-[200vh] absolute bottom-[-40vh]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)",
                  backgroundSize: "4rem 4rem",
                  transform: "rotateX(75deg) translateZ(0)",
                  maskImage:
                    "linear-gradient(to top, black 10%, transparent 60%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, black 10%, transparent 60%)",
                }}
              />
            </div>
          </motion.div>

          <motion.div
            className="fixed inset-0 z-50 bg-white pointer-events-none mix-blend-screen"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />

          <div className="sticky top-0 z-40 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent pointer-events-none">
            <button
              onClick={handleReturn}
              className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors pointer-events-auto"
            >
              <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                <ArrowLeft size={16} />
              </div>
              <span className="font-mono text-[10px] tracking-widest uppercase">
                Initiate Wormhole Return
              </span>
            </button>
          </div>

          <motion.div
            className="relative z-10 w-full min-h-[380vh] overflow-visible mx-auto mt-10 pointer-events-none [perspective:2000px]"
            animate={{
              rotateX: mousePos.y * -3,
              rotateY: mousePos.x * 3,
              scale: selectedProjectId ? 0.95 : 1,
              opacity: selectedProjectId ? 0.5 : 1,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 30 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[350vh] bg-gradient-to-b from-white/40 via-cyan-400/10 to-transparent blur-sm pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[15px] h-[350vh] bg-gradient-to-b from-white/10 via-purple-500/5 to-transparent blur-xl mix-blend-screen pointer-events-none" />

            {projects.map((project, index) => (
              <GalleryItem
                key={project.id}
                project={project}
                index={index}
                hoveredIndex={hoveredIndex}
                setHoveredIndex={setHoveredIndex}
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <InnerDimensionFocusPanel
            project={selectedProject}
            onClose={() => setSelectedProjectId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GalleryItem({
  project,
  index,
  hoveredIndex,
  setHoveredIndex,
  selectedProjectId,
  setSelectedProjectId,
}: {
  project: any;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}) {
  const angle = project.startAngle + index * 0.3;

  const yPosVh = 40 + index * 52;

  const maxShiftStr = `max(0px, 50vw - 240px)`;
  const scatterAmountVw = project.orbitRadius * 3.8;
  const xOffsetCalc = `calc(-50% + clamp(calc(-1 * ${maxShiftStr}), ${Math.cos(angle) * scatterAmountVw}vw, ${maxShiftStr}))`;

  const translateZ = Math.sin(angle) * 350;
  const zIndex = Math.sin(angle) > 0 ? 30 : 10;

  const targetRotateX = Math.cos(angle) * 6;
  const targetRotateY = Math.sin(angle) * 10;

  const floatDuration = 6 + (index % 4) * 2;
  const baseFloatY = 25 + project.orbitRadius * 1.5;

  const isHovered = hoveredIndex === index;
  const isOthersHovered = hoveredIndex !== null && !isHovered;
  const isSelected = selectedProjectId === project.id;
  const shouldHide = selectedProjectId !== null && !isSelected;

  const activeOpacity = shouldHide ? 0 : isOthersHovered ? 0.3 : 1;
  const activeScale = isOthersHovered ? 0.95 : 1;
  const activeRotateX = isOthersHovered ? targetRotateX * 0.5 : targetRotateX;
  const activeRotateY = isOthersHovered ? targetRotateY * 0.5 : targetRotateY;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const magneticTranslateX = useTransform(springX, [-1, 1], [-20, 20]);
  const magneticTranslateY = useTransform(springY, [-1, 1], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    const nx = (e.clientX - centerX) / (rect.width / 2);
    const ny = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      className="absolute left-1/2 w-[90vw] sm:w-[380px] md:w-[420px] pointer-events-none"
      style={{
        top: `${yPosVh}vh`,
        x: xOffsetCalc,
        transformStyle: "preserve-3d",
        zIndex: isHovered ? 50 : zIndex,
      }}
      initial={{
        opacity: 0,
        z: translateZ - 2000,
        scale: 0.1,
        rotateX: targetRotateX * 4,
        rotateY: targetRotateY * 4,
        y: -500,
      }}
      animate={{
        opacity: activeOpacity,
        z: translateZ,
        scale: activeScale,
        rotateX: activeRotateX,
        rotateY: activeRotateY,
        y: 0,
      }}
      transition={{
        duration: isOthersHovered ? 1.2 : 2.2,
        delay: isOthersHovered ? 0 : index * 0.15,
        type: "spring",
        bounce: 0.2,
      }}
    >
      <motion.div
        className="w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          x: magneticTranslateX,
          y: magneticTranslateY,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={handleMouseLeave}
        whileHover={{
          scale: 1.05,
          z: 150,
          transition: { duration: 0.4, type: "spring" },
        }}
      >
        <motion.div
          className="w-full h-full pointer-events-auto p-[20px] -m-[20px]"
          style={{ transformStyle: "preserve-3d" }}
          animate={{
            y: [0, -baseFloatY, 0],
            rotateX: [0, 3, 0],
            rotateY: [0, -3, 0],
          }}
          transition={{
            duration: floatDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5 + index * 0.2,
          }}
        >
          <ProjectCard
            project={project}
            index={index}
            onClick={() => {
              setSelectedProjectId(project.id);
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
