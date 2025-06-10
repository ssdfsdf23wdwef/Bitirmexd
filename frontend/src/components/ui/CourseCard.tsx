import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import type { Course } from "@/types/course.type";
import { FiTrash2, FiBook, FiArrowRight, FiClock } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import courseService from "@/services/course.service";
import { useTheme } from "@/context/ThemeProvider";

interface CourseCardProps {
  course: Pick<Course, "id" | "name">; // Only need id and name
  className?: string;
  onDetail?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  className = "",
  onDetail,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();
  const { id, name } = course;

  const handleDetail = () => {
    if (onDetail) onDetail(id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (isDeleting) return; // Prevent multiple clicks

    if (window.confirm(`"${name}" dersini silmek istediğinize emin misiniz?`)) {
      try {
        setIsDeleting(true);
        await courseService.deleteCourse(id);
        // Invalidate courses query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["courses"] });
        if (onDelete) onDelete(id);
      } catch (error) {
        console.error("Ders silinirken bir hata oluştu:", error);
        alert("Ders silinirken bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card
      className={`${className} cursor-pointer h-full relative group overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800/95 via-gray-800/90 to-gray-850/95 border border-gray-700/50 hover:border-blue-500/60 shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
          : "bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 border border-gray-200/60 hover:border-blue-400/70 shadow-md hover:shadow-lg hover:shadow-blue-300/30"
      } backdrop-blur-sm hover:-translate-y-1`}
      variant="default"
      hover="none"
      padding="md"
      onClick={handleDetail}
    >
      {/* Animated background gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br transition-all duration-700 ${
          isDarkMode
            ? "from-blue-900/10 via-indigo-900/5 to-purple-900/10 opacity-0 group-hover:opacity-100 group-hover:from-blue-800/20 group-hover:via-indigo-800/10 group-hover:to-purple-800/20"
            : "from-blue-100/30 via-indigo-100/20 to-purple-100/30 opacity-0 group-hover:opacity-100 group-hover:from-blue-200/40 group-hover:via-indigo-200/30 group-hover:to-purple-200/40"
        }`}
      ></div>

      {/* Subtle glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl transition-all duration-500 opacity-0 group-hover:opacity-100 ${
          isDarkMode
            ? "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-md"
            : "bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 blur-md"
        } -m-0.5 -z-10`}
      ></div>

      {/* Modern top accent bar with enhanced shimmer */}
      <div
        className={`h-1.5 bg-gradient-to-r w-full absolute top-0 left-0 rounded-t-xl transition-all duration-500 relative overflow-hidden ${
          isDarkMode
            ? "from-blue-500 via-indigo-500 to-purple-500 group-hover:from-blue-400 group-hover:via-indigo-400 group-hover:to-purple-400"
            : "from-blue-600 via-indigo-600 to-purple-600 group-hover:from-blue-500 group-hover:via-indigo-500 group-hover:to-purple-500"
        }`}
      >
        {/* Enhanced shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1200 ease-out"></div>
      </div>

      <div className="flex items-center mb-4 pt-1">
        {/* Modern course icon with enhanced styling */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 relative overflow-hidden mr-3 group-hover:shadow-lg group-hover:scale-105 ${
            isDarkMode
              ? "bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-700/40 group-hover:border-blue-500/60 group-hover:from-blue-800/60 group-hover:to-indigo-800/60"
              : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 group-hover:border-blue-300/80 group-hover:from-blue-100 group-hover:to-indigo-100"
          }`}
        >
          <FiBook
            className={`text-lg transition-all duration-300 group-hover:scale-110 ${
              isDarkMode
                ? "text-blue-400 group-hover:text-blue-300"
                : "text-blue-600 group-hover:text-blue-700"
            }`}
          />

          {/* Subtle inner glow effect */}
          <div
            className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
              isDarkMode ? "bg-blue-400" : "bg-blue-500"
            }`}
          ></div>
        </div>

        {/* Enhanced course title with better typography */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold transition-all duration-300 line-clamp-2 leading-snug ${
              isDarkMode
                ? "text-gray-100 group-hover:text-blue-300"
                : "text-gray-800 group-hover:text-blue-700"
            }`}
          >
            {name}
          </h3>
        </div>

        {/* Refined delete button */}
        <button
          onClick={handleDelete}
          className={`p-1.5 rounded-lg transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 scale-95 hover:scale-100 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
            isDarkMode
              ? "bg-gray-700/90 text-red-400 hover:bg-red-600/90 hover:text-white border border-red-800/40 hover:border-red-500/60 focus:ring-red-600"
              : "bg-white/95 text-red-500 hover:bg-red-500 hover:text-white border border-red-200/60 hover:border-red-400/80 focus:ring-red-300"
          } shadow-sm hover:shadow-md backdrop-blur-sm`}
          title="Dersi Sil"
          aria-label="Dersi Sil"
          disabled={isDeleting}
        >
          <FiTrash2
            className={`text-xs transition-transform duration-200 ${isDeleting ? "animate-pulse" : "hover:scale-110"}`}
          />
        </button>
      </div>

      {/* Compact last updated info */}
      <div
        className={`flex items-center text-xs ${isDarkMode ? "text-gray-400 bg-blue-900/20 border-blue-800/30 group-hover:border-blue-700/40" : "text-gray-500 bg-blue-50/60 border-blue-100/60 group-hover:border-blue-200/80"} mb-3 px-2.5 py-1.5 rounded-lg border transition-colors duration-300`}
      >
        <FiClock
          className={`mr-1.5 text-xs ${isDarkMode ? "text-blue-400/80" : "text-blue-500/80"} transition-colors duration-300`}
        />
        <span>Son güncelleme: 2 gün önce</span>
      </div>

      {/* Modern action button */}
      <button
        className={`w-full py-2 px-3 ${isDarkMode ? "bg-gray-800/90 text-blue-400 border-blue-800/60 group-hover:bg-blue-600/90 focus:ring-blue-700" : "bg-white/90 text-blue-600 border-blue-200/60 group-hover:bg-blue-600 focus:ring-blue-300"} text-sm font-medium rounded-lg flex items-center justify-center group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md border group-hover:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-opacity-50 backdrop-blur-sm`}
        onClick={handleDetail}
        aria-label="Ders detaylarını görüntüle"
      >
        Detaylar
        <FiArrowRight className="ml-1.5 text-sm group-hover:translate-x-0.5 transition-transform duration-300" />
      </button>
    </Card>
  );
};

export default CourseCard;
