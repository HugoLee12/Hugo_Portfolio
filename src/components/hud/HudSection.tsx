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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`w-full py-16 md:py-24 scroll-mt-24 md:scroll-mt-32 lg:scroll-mt-36 ${className}`}
    >
      {children}
    </motion.section>
  );
}
