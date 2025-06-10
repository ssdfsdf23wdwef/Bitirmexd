"use client";

import { ReactNode, Suspense } from "react";
import { motion } from "framer-motion";

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

const defaultFallback = (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center p-4"
  >
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </motion.div>
);

/**
 * Optimize edilmiş lazy loading wrapper
 */
export default function LazyWrapper({
  children,
  fallback = defaultFallback,
  className = "",
}: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      <div className={className} style={{ transform: "translateZ(0)" }}>
        {children}
      </div>
    </Suspense>
  );
}
