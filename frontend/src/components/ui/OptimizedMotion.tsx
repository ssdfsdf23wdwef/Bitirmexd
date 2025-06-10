"use client";

import { motion, MotionProps } from "framer-motion";
import { ReactNode, useMemo } from "react";

interface OptimizedMotionProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  enableAnimation?: boolean;
}

/**
 * Performance optimized motion component
 * Reduces motion when user prefers reduced motion or when disabled
 */
export default function OptimizedMotion({
  children,
  enableAnimation = true,
  ...motionProps
}: OptimizedMotionProps) {
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const shouldAnimate = enableAnimation && !prefersReducedMotion;

  // If animations are disabled, return a simple div
  if (!shouldAnimate) {
    return <div>{children}</div>;
  }

  // Return motion component with hardware acceleration
  return (
    <motion.div
      {...motionProps}
      style={{
        ...motionProps.style,
        // Hardware acceleration
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}
