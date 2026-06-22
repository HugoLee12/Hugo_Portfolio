import { useState, useEffect } from "react";
import {
  motion,
  useDragControls,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { Project } from "../data";
import { audioManager } from "../lib/audio";
import { DossierContent } from "./DossierContent";

interface DossierOverlayProps {
  project: Project | null;
  onClose: () => void;
}

export function DossierOverlay({ project, onClose }: DossierOverlayProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const dragControls = useDragControls();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      animationFrameId = requestAnimationFrame(() => {
        const xPct = e.clientX / window.innerWidth - 0.5;
        const yPct = e.clientY / window.innerHeight - 0.5;
        x.set(xPct);
        y.set(yPct);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, x, y]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (project) {
      let count = 0;
      const maxClacks = 8 + Math.floor(Math.random() * 5);
      const interval = setInterval(() => {
        audioManager.playTyping();
        count++;
        if (count >= maxClacks) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [project?.id]);

  if (!project) return null;

  return (
    <>
      <motion.div
        initial={
          isMobile
            ? { opacity: 0, y: "100%", x: 0 }
            : {
                scaleY: 0.002,
                scaleX: 0,
                opacity: 0,
                filter: "brightness(5) saturate(2)",
              }
        }
        animate={
          isMobile
            ? { opacity: 1, x: 0, y: 0 }
            : {
                scaleY: [0.002, 0.002, 1],
                scaleX: [0, 1, 1],
                opacity: [0, 1, 1],
                filter: [
                  "brightness(5) saturate(2)",
                  "brightness(3) saturate(1.5)",
                  "brightness(1) saturate(1)",
                ],
              }
        }
        exit={
          isMobile
            ? { opacity: 0, y: "100%", x: 0 }
            : {
                scaleY: [1, 0.002, 0.002],
                scaleX: [1, 1, 0],
                opacity: [1, 1, 0],
                filter: [
                  "brightness(1) saturate(1)",
                  "brightness(3) saturate(1.5)",
                  "brightness(5) saturate(2)",
                ],
              }
        }
        transition={{
          duration: 0.7,
          times: [0, 0.4, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`fixed inset-x-0 bottom-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 w-full md:w-[480px] lg:w-[540px] md:p-4 md:pr-12 lg:pr-32 md:py-24 z-50 pointer-events-none flex flex-col justify-end md:justify-center transition-all duration-300 ${isFullScreen && isMobile ? "pt-0" : "pt-4"}`}
        style={{ perspective: 1500, transformOrigin: "center" }}
      >
        <motion.div
          className={`pointer-events-auto relative flex flex-col overflow-hidden shrink-0 w-full transition-[height,max-height,border-radius] duration-300 ${isFullScreen && isMobile ? "h-[100dvh] max-h-[100dvh] rounded-none" : "max-h-[90vh] md:max-h-[75vh] rounded-t-sm md:rounded-sm"}`}
          drag={isMobile ? "y" : false}
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.2, bottom: 0.5 }}
          onDragEnd={(_, info) => {
            if (isMobile) {
              if (
                info.offset.y > 100 ||
                (info.velocity.y > 500 && info.offset.y > 20)
              ) {
                if (isFullScreen) setIsFullScreen(false);
                else onClose();
              } else if (
                info.offset.y < -50 ||
                (info.velocity.y < -500 && info.offset.y < -20)
              ) {
                if (!isFullScreen) setIsFullScreen(true);
              }
            }
          }}
          style={
            {
              "--hologram-core": project.color,
              backgroundColor:
                "color-mix(in srgb, var(--hologram-core) 5%, rgba(2, 6, 23, 0.15))",
              boxShadow: `0 0 60px color-mix(in srgb, var(--hologram-core) 25%, transparent), 
                        inset 0 0 40px color-mix(in srgb, var(--hologram-core) 15%, transparent),
                        0 0 2px 1px color-mix(in srgb, var(--hologram-core) 50%, transparent)`,
              rotateX: isMobile ? 0 : rotateX,
              rotateY: isMobile ? 0 : rotateY,
              transformStyle: "preserve-3d",
            } as React.CSSProperties
          }
        >
          <DossierContent
            project={project}
            onClose={onClose}
            dragHandler={isMobile ? (e) => dragControls.start(e) : undefined}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
