"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
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
      <div className={`flex items-center justify-center h-64 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-indigo-500'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className={`text-2xl font-bold mb-4 md:mb-0 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Öğrenme Hedefleri
          </h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                className={`pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' 
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="all">Tüm Dersler</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name || course.title}
                  </option>
                ))}
              </select>
              <FiFilter className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <button
              className={`flex items-center px-3 py-2 border rounded-md transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => {
                refetchCourses();
                refetchTargets();
              }}
            >
              <FiRefreshCw className="mr-1" /> Yenile
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-indigo-500'}`}></div>
          </div>
        ) : (
          <LearningProgress weakTopics={weakTopics} strongTopics={strongTopics} />
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
