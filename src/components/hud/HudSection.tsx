import React from "react";
import { motion } from "motion/react";

export function HudSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section 
      id={id} 
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`w-full py-16 md:py-24 scroll-mt-24 md:scroll-mt-32 lg:scroll-mt-36 ${className}`}
    >
      {children}
    </motion.section>
  );
}
