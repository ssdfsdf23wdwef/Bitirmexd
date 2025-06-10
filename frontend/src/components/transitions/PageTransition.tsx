"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useMemo } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  enableAnimation?: boolean;
}

// Optimize edilmiş animasyon varyantları
const variants = {
  hidden: { 
    opacity: 0, 
    y: 8,
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
  },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.1, ease: [0.4, 0, 1, 1] }
  },
};

// Animasyonsuz varyant (performans için)
const noAnimationVariants = {
  hidden: { opacity: 1, y: 0 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
};

export default function PageTransition({
  children,
  className = "",
  enableAnimation = true,
}: PageTransitionProps) {
  // Reduced motion kontrolü
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const shouldAnimate = enableAnimation && !prefersReducedMotion;
  const currentVariants = shouldAnimate ? variants : noAnimationVariants;
  
  return (
    <motion.div
      variants={currentVariants}
      initial="hidden"
      animate="enter"
      exit="exit"
      className={className}
      style={{ 
        // Hardware acceleration için
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}
