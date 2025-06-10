import React, { useState } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiBook,
  FiAlertCircle,
  FiBookOpen,
  FiGrid,
  FiList,
  FiClock,
  FiArrowRight,
  FiTrash2,
} from "react-icons/fi";
import CourseCard from "@/components/ui/CourseCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Course } from "@/types/course.type";
import { useQueryClient } from "@tanstack/react-query";
import courseService from "@/services/course.service";
import { useTheme } from "@/context/ThemeProvider";

// Türler için daha genel yaklaşım
interface CourseListProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  loading,
  error,
  searchTerm,
  onSearchChange,
}) => {
  const { isDarkMode } = useTheme();
  const [deletedCourseIds, setDeletedCourseIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");
  const queryClient = useQueryClient();
  // Filter courses by search term and exclude deleted courses
  const filteredCourses = courses
    .filter((course) => !deletedCourseIds.includes(course.id))
    .filter(
      (course) =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false,
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        // In a real implementation, this would sort by updatedAt date
        // For now, we'll just use the id as a proxy for recency
        return b.id.localeCompare(a.id);
      }
    });

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-24 transition-colors duration-300`}
      >
        <div className="w-20 h-20 relative">
          {/* Enhanced multiple spinning rings with different speeds */}
          <div
            className={`w-full h-full border-4 rounded-full animate-spin transition-colors duration-300 ${
              isDarkMode
                ? "border-gray-800/30 border-t-blue-500"
                : "border-gray-100 border-t-blue-600"
            }`}
          ></div>

          <div
            className={`absolute inset-2 border-3 rounded-full animate-spin-slow-reverse transition-colors duration-300 ${
              isDarkMode
                ? "border-gray-800/30 border-b-indigo-500"
                : "border-gray-100 border-b-indigo-600"
            }`}
          ></div>

          <div
            className={`absolute inset-4 border-2 rounded-full animate-spin-fast transition-colors duration-300 ${
              isDarkMode
                ? "border-gray-800/30 border-l-purple-500"
                : "border-gray-100 border-l-purple-600"
            }`}
          ></div>

          {/* Enhanced center icon with subtle glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors duration-300 relative ${
                isDarkMode ? "bg-blue-900/40" : "bg-blue-50/90"
              }`}
            >
              {/* Subtle glow effect */}
              <div
                className={`absolute inset-0 rounded-full opacity-20 animate-pulse-slow ${
                  isDarkMode ? "bg-blue-400" : "bg-blue-500"
                }`}
              ></div>
              <FiBook
                className={`text-lg animate-pulse transition-colors duration-300 relative z-10 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <p
            className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Dersler yükleniyor
          </p>
          <p
            className={`text-sm transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Lütfen bekleyin...
          </p>

          {/* Animated dots */}
          <div className="flex space-x-1 mt-3">
            <div
              className={`w-2 h-2 rounded-full animate-bounce ${
                isDarkMode ? "bg-blue-400" : "bg-blue-600"
              }`}
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className={`w-2 h-2 rounded-full animate-bounce ${
                isDarkMode ? "bg-blue-400" : "bg-blue-600"
              }`}
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className={`w-2 h-2 rounded-full animate-bounce ${
                isDarkMode ? "bg-blue-400" : "bg-blue-600"
              }`}
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          {/* Enhanced error background glow effect */}
          <div
            className={`absolute -inset-6 ${isDarkMode ? "bg-rose-500/5" : "bg-rose-500/10"} rounded-full blur-2xl animate-pulse-slow`}
          ></div>

          {/* Error icon with enhanced styling */}
          <div
            className={`w-16 h-16 rounded-full ${isDarkMode ? "bg-gray-800 border-rose-700/60" : "bg-white border-rose-200"} border-2 flex items-center justify-center mb-6 shadow-lg ${isDarkMode ? "shadow-rose-500/5" : "shadow-rose-500/10"} relative z-10 transition-colors duration-300`}
          >
            <FiAlertCircle
              className={`text-3xl ${isDarkMode ? "text-rose-400" : "text-rose-500"} animate-pulse-slow transition-colors duration-300`}
            />
          </div>
        </div>

        <div className="text-center max-w-md">
          <h2
            className={`text-xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-800"} mb-3 transition-colors duration-300`}
          >
            Bir Sorun Oluştu
          </h2>
          <p
            className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} text-sm leading-relaxed mb-6 transition-colors duration-300`}
          >
            {error}
          </p>

          {/* Enhanced retry button */}
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-2.5 ${isDarkMode ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"} text-white rounded-lg shadow-md transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-lg transform hover:scale-105`}
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Handle course detail navigation using standard browser navigation
  const handleCourseDetail = (courseId: string) => {
    window.location.href = `/courses/${courseId}`;
  };

  // Common header section for both empty and non-empty states
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div className="md:flex-grow">
        <h1
          className={`text-3xl font-bold mb-2 bg-gradient-to-r ${isDarkMode ? "from-blue-400 via-indigo-400 to-purple-400" : "from-blue-600 via-indigo-600 to-purple-600"} bg-clip-text text-transparent transition-colors duration-300`}
        >
          Derslerim
        </h1>
        <p
          className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} transition-colors duration-300`}
        >
          Tüm derslerinizi yönetin, ilerlemenizi takip edin ve sınavlar
          oluşturun.
        </p>
      </div>
      <div className="flex flex-row items-center gap-3 w-full md:w-auto">
        <div className="relative flex-grow md:flex-grow-0">
          <FiSearch
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-blue-400/70" : "text-blue-500/70"} transition-colors duration-300`}
          />
          <input
            type="text"
            placeholder="Ders ara..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl ${isDarkMode ? "bg-gray-800/90 border-gray-700/50 text-gray-200 placeholder-gray-400 hover:border-blue-600/60 focus:border-blue-500 focus:ring-blue-500/20" : "bg-white/90 border-gray-200/60 text-gray-700 placeholder-gray-400 hover:border-blue-400/60 focus:border-blue-500 focus:ring-blue-500/20"} backdrop-blur-sm border focus:outline-none focus:ring-2 shadow-sm transition-all duration-300`}
          />
        </div>
        <Link
          href="/courses/create"
          className={`flex items-center justify-center gap-2 px-4 py-2.5 ${isDarkMode ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-blue-600/50" : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:ring-blue-500/50"} text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap focus:ring-2 focus:ring-opacity-50 outline-none transform hover:scale-105`}
        >
          <FiPlus className="transition-transform duration-300 group-hover:rotate-90" />
          <span>Yeni Ders</span>
        </Link>
      </div>
    </div>
  );

  // Render controls for view mode and sorting
  const renderControls = () => {
    if (filteredCourses.length === 0) return null;

    return (
      <div
        className={`mb-6 flex flex-wrap items-center justify-between ${isDarkMode ? "bg-gray-800/80 border-gray-700/50" : "bg-white/80 border-gray-200/60"} backdrop-blur-sm p-3 rounded-xl shadow-sm border transition-colors duration-300`}
      >
        <div
          className={`flex items-center text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"} font-medium transition-colors duration-300`}
        >
          <FiBook
            className={`mr-2 ${isDarkMode ? "text-blue-400" : "text-blue-500"} transition-colors duration-300`}
          />
          <span>Toplam {filteredCourses.length} ders</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sort controls */}
          <div className="flex items-center">
            <span
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"} mr-2 transition-colors duration-300`}
            >
              Sırala:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "recent")}
              className={`text-sm border rounded-lg py-1.5 px-3 ${isDarkMode ? "bg-gray-700/90 text-gray-200 border-gray-600/60 hover:border-blue-600/60 focus:border-blue-500 focus:ring-blue-500/20" : "bg-white/90 text-gray-700 border-gray-200/60 hover:border-blue-400/60 focus:border-blue-500 focus:ring-blue-500/20"} focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer`}
            >
              <option value="name">İsme Göre</option>
              <option value="recent">Son Güncellenen</option>
            </select>
          </div>

          {/* View mode controls */}
          <div
            className={`flex items-center ${isDarkMode ? "bg-gray-700/60" : "bg-gray-100/80"} rounded-lg p-1 transition-colors duration-300`}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === "grid"
                  ? `${isDarkMode ? "bg-gray-600 text-blue-400 shadow-sm" : "bg-white text-blue-600 shadow-sm"}`
                  : `${isDarkMode ? "text-gray-400 hover:bg-gray-600/80 hover:text-blue-300" : "text-gray-500 hover:bg-white/80 hover:text-blue-500"}`
              }`}
              title="Izgara Görünümü"
              aria-label="Izgara Görünümü"
            >
              <FiGrid
                size={16}
                className="transition-transform duration-300 hover:scale-110"
              />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === "list"
                  ? `${isDarkMode ? "bg-gray-600 text-blue-400 shadow-sm" : "bg-white text-blue-600 shadow-sm"}`
                  : `${isDarkMode ? "text-gray-400 hover:bg-gray-600/80 hover:text-blue-300" : "text-gray-500 hover:bg-white/80 hover:text-blue-500"}`
              }`}
              title="Liste Görünümü"
              aria-label="Liste Görünümü"
            >
              <FiList
                size={16}
                className="transition-transform duration-300 hover:scale-110"
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (filteredCourses.length === 0) {
    return (
      <>
        {renderHeader()}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 sm:p-8 md:p-10 mt-8">
          {searchTerm ? (
            <EmptyState
              title="Arama Sonucu Bulunamadı"
              description={`"${searchTerm}" ile eşleşen bir ders bulunamadı. Farklı bir anahtar kelime deneyin veya arama terimini temizleyin.`}
              actionText="Aramayı Temizle"
              onActionClick={() => onSearchChange("")} // Clear search
              icon={<FiSearch className="text-sky-500 text-5xl" />}
            />
          ) : (
            <EmptyState
              title="Henüz Dersiniz Yok"
              description="Görünüşe göre henüz bir ders oluşturmadınız. Hemen başlayın ve öğrenme yolculuğunuzu kişiselleştirin!"
              actionText="İlk Dersini Oluştur"
              actionLink="/courses/create"
              icon={<FiBookOpen className="text-sky-500 text-5xl" />}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {renderHeader()}
      {renderControls()}

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onDetail={handleCourseDetail}
              onDelete={(courseId) => {
                // Add the deleted course ID to the state
                setDeletedCourseIds((prev) => [...prev, courseId]);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className={`${isDarkMode ? "bg-gray-800/90 border-gray-800/30" : "bg-white border-gray-200/70"} backdrop-blur-md shadow-sm hover:shadow-md border transition-all duration-300 rounded-xl overflow-hidden cursor-pointer group relative`}
              onClick={() => (window.location.href = `/courses/${course.id}`)}
            >
              {/* Left accent with improved gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 rounded-l transition-colors duration-300"></div>

              {/* Hover effect background */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${isDarkMode ? "from-blue-900/10 to-transparent" : "from-blue-50 to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>

              <div className="flex items-center p-3 pl-6 relative">
                <div className="flex-shrink-0 mr-4">
                  <div
                    className={`w-10 h-10 rounded-full ${isDarkMode ? "bg-gray-800/20 border-gray-700/30 group-hover:border-blue-700/50 group-hover:shadow-blue-500/10" : "bg-gray-50 border-gray-100 group-hover:border-blue-200 group-hover:shadow-blue-300/10"} border flex items-center justify-center transition-all duration-300 group-hover:shadow-md`}
                  >
                    <FiBook
                      className={`text-lg ${isDarkMode ? "text-blue-400" : "text-blue-600"} group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>
                </div>

                <div className="flex-grow">
                  <h3
                    className={`text-base font-medium ${isDarkMode ? "text-gray-100 group-hover:text-blue-400" : "text-gray-800 group-hover:text-blue-600"} transition-colors duration-300`}
                  >
                    {course.name}
                  </h3>
                  <div
                    className={`flex items-center text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
                  >
                    <FiClock
                      className={`mr-1.5 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"} transition-colors duration-300`}
                    />
                    <span>Son güncelleme: 2 gün önce</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseDetail(course.id);
                    }}
                    className={`mr-2 p-1.5 rounded-full ${isDarkMode ? "text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 focus:ring-blue-700" : "text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus:ring-blue-300"} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                    aria-label="Dersi görüntüle"
                  >
                    <FiArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `"${course.name}" dersini silmek istediğinize emin misiniz?`,
                        )
                      ) {
                        courseService
                          .deleteCourse(course.id)
                          .then(() => {
                            setDeletedCourseIds((prev) => [...prev, course.id]);
                            queryClient.invalidateQueries({
                              queryKey: ["courses"],
                            });
                          })
                          .catch((error: any) => {
                            console.error(
                              "Ders silinirken bir hata oluştu:",
                              error,
                            );
                            alert(
                              "Ders silinirken bir hata oluştu. Lütfen tekrar deneyin.",
                            );
                          });
                      }
                    }}
                    className={`p-1.5 rounded-full ${isDarkMode ? "text-rose-400 hover:bg-rose-900/20 hover:text-rose-300 focus:ring-rose-700" : "text-rose-500 hover:bg-rose-50 hover:text-rose-600 focus:ring-rose-300"} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                    aria-label="Dersi sil"
                  >
                    <FiTrash2
                      size={16}
                      className="transition-transform duration-300 hover:scale-110"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default CourseList;
