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

  // Tema uyumlu renkler
  const getThemeColors = (status: LearningTargetStatus) => {
    switch (status) {
      case "mastered":
        return isDarkMode 
          ? "bg-green-900/20 text-green-400 border-green-600"
          : "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return isDarkMode 
          ? "bg-yellow-900/20 text-yellow-400 border-yellow-600"
          : "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return isDarkMode 
          ? "bg-red-900/20 text-red-400 border-red-600"
          : "bg-red-100 text-red-800 border-red-200";
      case "pending":
      default:
        return isDarkMode 
          ? "bg-gray-700 text-gray-300 border-gray-600"
          : "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
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
      className={`inline-flex items-center rounded-full border ${getThemeColors(status)} ${sizeClasses[size]} font-medium transition-colors duration-200`}
      initial={animate ? "initial" : undefined}
      animate={animate ? "animate" : undefined}
      variants={animate ? variants : undefined}
    >
      {showIcon && (
        <span className="mr-1">
          <span className={iconSize}>{config.icon}</span>
        </span>
      )}
      {showLabel && config.label}
    </motion.span>
  );
};

export default LearningStatusBadge;
