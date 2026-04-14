import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ReactNode } from "react";

const pageVariants: Variants = {
  initial: { opacity: 0, y: 15, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, filter: "blur(2px)", transition: { duration: 0.2, ease: "easeIn" } },
};

export default function AnimatedPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ width: "100%", display: "flex", flexDirection: "column" }}
    >
      {children}
    </motion.div>
  );
}
