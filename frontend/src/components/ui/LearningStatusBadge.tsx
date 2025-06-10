"use client";

import { FC } from "react";
import { LearningTargetStatus } from "@/types/learningTarget.type";
import { motion } from "framer-motion";
import { getStatusStyle } from "@/lib/statusConfig";
import { useTheme } from "@/context/ThemeProvider";

interface LearningStatusBadgeProps {
  status: LearningTargetStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
}

const LearningStatusBadge: FC<LearningStatusBadgeProps> = ({
  status,
  showIcon = true,
  size = "md",
  showLabel = true,
  animate = false,
}) => {
  const { isDarkMode } = useTheme();
  const config = getStatusStyle(status);

  // Geliştirilmiş tema uyumlu renkler
  const getThemeColors = (status: LearningTargetStatus) => {
    switch (status) {
      case "mastered":
        return isDarkMode 
          ? "bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 text-emerald-200 border-emerald-400/50 shadow-emerald-500/30"
          : "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-300 shadow-green-200/50";
      case "medium":
        return isDarkMode 
          ? "bg-gradient-to-r from-amber-900/40 to-amber-800/40 text-amber-200 border-amber-400/50 shadow-amber-500/30"
          : "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300 shadow-yellow-200/50";
      case "failed":
        return isDarkMode 
          ? "bg-gradient-to-r from-red-900/40 to-red-800/40 text-red-200 border-red-400/50 shadow-red-500/30"
          : "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-300 shadow-red-200/50";
      case "pending":
      default:
        return isDarkMode 
          ? "bg-gradient-to-r from-slate-800/60 to-slate-700/60 text-slate-200 border-slate-500/50 shadow-slate-500/30"
          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-300 shadow-gray-200/50";
    }
  };

  const sizeClasses = {
    sm: "text-xs px-3 py-1",
    md: "text-sm px-4 py-1.5",
    lg: "text-base px-5 py-2",
  };

  // Icon boyutunu belirle
  const iconSize =
    size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";

  // Animasyon varyantları
  const variants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 30 },
    },
  };

  return (
    <motion.span
      className={`inline-flex items-center rounded-xl border backdrop-blur-sm shadow-lg ${getThemeColors(status)} ${sizeClasses[size]} font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105`}
      initial={animate ? "initial" : undefined}
      animate={animate ? "animate" : undefined}
      variants={animate ? variants : undefined}
    >
      {showIcon && (
        <span className={`mr-2 flex items-center justify-center`}>
          <span className={`${iconSize} flex items-center justify-center`}>{config.icon}</span>
        </span>
      )}
      {showLabel && <span className="font-medium">{config.label}</span>}
    </motion.span>
  );
};

export default LearningStatusBadge;
