import { useState, useEffect } from "react";
import { PortfolioLayout } from "./components/PortfolioLayout";
import { UniverseView } from "./components/universe/UniverseView";
import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const [isUniverseActive, setIsUniverseActive] = useState(false);

  useEffect(() => {
    if (isUniverseActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isUniverseActive]);

  return (
    <>
      <PortfolioLayout onEnterUniverse={() => setIsUniverseActive(true)} />
      
      <AnimatePresence>
        {isUniverseActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#020617]"
          >
            <UniverseView onExit={() => setIsUniverseActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
