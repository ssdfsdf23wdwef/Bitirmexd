"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiFilter, FiRefreshCw, FiBarChart, FiFileText } from "react-icons/fi";
import LearningProgress from "@/components/ui/LearningProgress";
import { ThemeProvider, useTheme } from "../../context/ThemeProvider";
import courseService from "../../services/course.service";
import { useLearningTargets } from "../../hooks/useLearningTargetQuery";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";

// Ana component içeriği
function LearningGoalsPageContent() {
  const { user } = useAuthStore();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string | "all">(
    "all",
  );

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Kursları backend'den çek
  const {
    data: coursesRaw = [],
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getCourses(),
    enabled: !!user,
  });
  const courses = coursesRaw as Array<{
    id: string;
    name?: string;
    title?: string;
  }>;

  // Seçili kursun öğrenme hedeflerini çek
  const {
    data: learningTargets = [],
    isLoading: targetsLoading,
    refetch: refetchTargets,
  } = useLearningTargets(
    selectedCourseId !== "all" ? selectedCourseId : courses[0]?.id || undefined,
  );

  // LearningProgress için weakTopics ve strongTopics'i hazırla
  const getTopicsForProgress = () => {
    interface WeakTopic {
      failCount: number;
      successCount: number;
      lastAttempt: string;
      status: string;
      subTopicId: string;
    }

    const weakTopics: Record<string, WeakTopic> = {};
    const strongTopics: string[] = [];
    if (!learningTargets || learningTargets.length === 0)
      return { weakTopics, strongTopics };
    learningTargets.forEach((target) => {
      if (target.status === "mastered") {
        strongTopics.push(target.subTopicName);
      } else {
        weakTopics[target.subTopicName] = {
          failCount: target.failCount ?? 0,
          successCount: target.successCount ?? 0,
          lastAttempt: target.lastAttempt ?? "",
          status: "active",
          subTopicId: target.id,
        };
      }
    });
    return { weakTopics, strongTopics };
  };

  const { weakTopics, strongTopics } = getTopicsForProgress();

  const loading = coursesLoading || targetsLoading;

  // Kullanıcı giriş yapmamışsa yükleniyor göster
  if (!user) {
    return (
      <div
        className={`flex items-center justify-center h-64 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? "border-blue-400" : "border-indigo-500"}`}
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"}`}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1
                className={`text-4xl font-bold bg-gradient-to-r ${isDarkMode ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"} bg-clip-text text-transparent`}
              >
                Öğrenme Hedefleri
              </h1>
              <p
                className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                İlerlemenizi takip edin ve hedeflerinize ulaşın
              </p>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Dashboard Butonu */}
              <button
                onClick={() =>
                  router.push(
                    `/learning-goals/dashboard?courseId=${selectedCourseId !== "all" ? selectedCourseId : courses[0]?.id}`,
                  )
                }
                className={`flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                <FiBarChart className="w-5 h-5 mr-2" />
                Dashboard
              </button>

              {/* Sınav Butonu */}
              <button
                onClick={() => router.push("/exams")}
                className={`flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                <FiFileText className="w-5 h-5 mr-2" />
                Sınavlar
              </button>

              <div className="relative group">
                <select
                  className={`appearance-none pl-4 pr-12 py-3 border-2 rounded-xl font-medium transition-all duration-200 min-w-[200px] ${
                    isDarkMode
                      ? "bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20"
                      : "bg-white/80 border-gray-200 text-gray-900 hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 backdrop-blur-sm"
                  } focus:outline-none shadow-lg hover:shadow-xl`}
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="all">🎯 Tüm Dersler</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      📚 {course.name || course.title}
                    </option>
                  ))}
                </select>
                <FiFilter
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${isDarkMode ? "text-gray-400 group-hover:text-blue-400" : "text-gray-400 group-hover:text-blue-500"}`}
                />
              </div>

              <button
                className={`flex items-center justify-center px-6 py-3 border-2 rounded-xl font-medium transition-all duration-200 group shadow-lg hover:shadow-xl ${
                  isDarkMode
                    ? "bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80 hover:border-blue-400"
                    : "bg-white/80 border-gray-200 text-gray-900 hover:bg-white hover:border-blue-500 backdrop-blur-sm"
                }`}
                onClick={() => {
                  refetchCourses();
                  refetchTargets();
                }}
              >
                <FiRefreshCw
                  className={`mr-2 transition-transform duration-200 group-hover:rotate-180 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`}
                />
                Yenile
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? "border-blue-400" : "border-indigo-500"}`}
            ></div>
          </div>
        ) : (
          <LearningProgress
            weakTopics={weakTopics}
            strongTopics={strongTopics}
          />
        )}
      </div>
    </div>
  );
}

// Ana export component - ThemeProvider ile sarmalı
export default function LearningGoalsPage() {
  return (
    <ThemeProvider>
      <LearningGoalsPageContent />
    </ThemeProvider>
  );
}
