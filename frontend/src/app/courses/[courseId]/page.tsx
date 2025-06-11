"use client";

import React from "react";
import Link from "next/link";
import {
  FiFileText,
  FiUpload,
  FiList,
  FiArrowLeft,
  FiBookOpen,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiTarget,
  FiActivity,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import courseService from "@/services/course.service";
import learningTargetService from "@/services/learningTarget.service";
import type { Course } from "@/types/course.type";
import { LearningTarget } from "@/types/learningTarget.type";
import { useTheme } from "@/context/ThemeProvider";

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

// Main topic classification function - simplified structure
const classifyMainTopic = (description: string): string => {
  const text = description.toLowerCase();

  // Programming concepts
  if (
    text.includes("variable") ||
    text.includes("değişken") ||
    text.includes("veri tip")
  ) {
    return "Temel Programlama";
  }
  if (
    text.includes("function") ||
    text.includes("fonksiyon") ||
    text.includes("metod")
  ) {
    return "Fonksiyonlar";
  }
  if (
    text.includes("array") ||
    text.includes("dizi") ||
    text.includes("list")
  ) {
    return "Veri Yapıları";
  }
  if (
    text.includes("loop") ||
    text.includes("döngü") ||
    text.includes("for") ||
    text.includes("while")
  ) {
    return "Döngüler";
  }
  if (
    text.includes("class") ||
    text.includes("sınıf") ||
    text.includes("object") ||
    text.includes("nesne")
  ) {
    return "Nesne Yönelimli Programlama";
  }
  if (text.includes("algorithm") || text.includes("algoritma")) {
    return "Algoritmalar";
  }
  if (
    text.includes("database") ||
    text.includes("veritabanı") ||
    text.includes("sql")
  ) {
    return "Veritabanı";
  }
  if (text.includes("web") || text.includes("http") || text.includes("api")) {
    return "Web Geliştirme";
  }

  // Math concepts
  if (
    text.includes("integral") ||
    text.includes("türev") ||
    text.includes("limit")
  ) {
    return "Matematik Analiz";
  }
  if (
    text.includes("linear") ||
    text.includes("doğrusal") ||
    text.includes("matrix")
  ) {
    return "Lineer Cebir";
  }
  if (
    text.includes("probability") ||
    text.includes("olasılık") ||
    text.includes("statistics")
  ) {
    return "İstatistik";
  }
  if (text.includes("geometry") || text.includes("geometri")) {
    return "Geometri";
  }

  // Physics concepts
  if (
    text.includes("force") ||
    text.includes("kuvvet") ||
    text.includes("motion") ||
    text.includes("hareket")
  ) {
    return "Mekanik";
  }
  if (text.includes("electric") || text.includes("elektrik")) {
    return "Elektrik";
  }
  if (text.includes("wave") || text.includes("dalga")) {
    return "Dalgalar";
  }

  // Chemistry concepts
  if (text.includes("element") || text.includes("atom")) {
    return "Kimya Temelleri";
  }
  if (text.includes("reaction") || text.includes("reaksiyon")) {
    return "Kimyasal Reaksiyonlar";
  }

  // Biology concepts
  if (text.includes("cell") || text.includes("hücre")) {
    return "Hücre Biyolojisi";
  }
  if (text.includes("evolution") || text.includes("evrim")) {
    return "Evrim";
  }

  return "Genel Konular";
};

// Commented out unused interfaces
// interface GroupedTargets {
//   [key: string]: LearningTarget[];
// }

// interface TopicGroup {
//   name: string;
//   targets: LearningTarget[];
//   expanded: boolean;
// }

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = React.use(params);
  const { isDarkMode } = useTheme();

  // State for filtering and grouping
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set(),
  );
  // Kurs bilgilerini çek
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourseById(courseId),
    enabled: !!courseId,
  });

  // Kursun alt konularını (learning targets) çek
  const {
    data: learningTargets,
    isLoading: relatedLoading,
    error: relatedError,
  } = useQuery<LearningTarget[]>({
    queryKey: ["learningTargets", courseId],
    queryFn: () => learningTargetService.getLearningTargetsByCourse(courseId),
    enabled: !!courseId,
  });

  const isLoading = courseLoading || relatedLoading;
  const error = courseError || relatedError;

  // Group learning targets by main topic using the enhanced classification
  const groupedTargets = React.useMemo(() => {
    if (!learningTargets) return {};

    return learningTargets.reduce(
      (groups, target) => {
        const mainTopic = classifyMainTopic(target.subTopicName);
        if (!groups[mainTopic]) {
          groups[mainTopic] = [];
        }
        groups[mainTopic].push(target);
        return groups;
      },
      {} as Record<string, LearningTarget[]>,
    );
  }, [learningTargets]);

  // Filter targets based on search and status
  const filteredGroupedTargets = React.useMemo(() => {
    const filtered: Record<string, LearningTarget[]> = {};

    Object.entries(groupedTargets).forEach(([mainTopic, targets]) => {
      const filteredTargets = targets.filter((target) => {
        const matchesSearch = target.subTopicName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || target.status === statusFilter;
        return matchesSearch && matchesStatus;
      });

      if (filteredTargets.length > 0) {
        filtered[mainTopic] = filteredTargets;
      }
    });

    return filtered;
  }, [groupedTargets, searchTerm, statusFilter]);

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Initialize all groups as expanded on first load
  React.useEffect(() => {
    if (
      Object.keys(filteredGroupedTargets).length > 0 &&
      expandedGroups.size === 0
    ) {
      setExpandedGroups(new Set(Object.keys(filteredGroupedTargets)));
    }
  }, [filteredGroupedTargets, expandedGroups.size]);

  // Durum sayılarını hesapla
  const statusCounts = (learningTargets || []).reduce(
    (acc, target) => {
      acc[target.status] = (acc[target.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (isLoading) {
    return (
      <div
        className={`min-h-screen relative ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900" : "bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/40"} transition-colors duration-500`}
      >
        <div className="flex justify-center items-center py-32">
          <div className="text-center">
            <div className="w-16 h-16 relative mx-auto mb-6">
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

              <div className="absolute inset-0 flex items-center justify-center">
                <FiBookOpen
                  className={`text-xl animate-pulse transition-colors duration-300 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
            </div>
            <h3
              className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Ders Detayları Yükleniyor
            </h3>
            <p
              className={`text-sm transition-colors duration-300 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Lütfen bekleyin...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen relative ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900" : "bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/40"} transition-colors duration-500`}
      >
        <div className="flex justify-center items-center py-32">
          <div className="text-center max-w-md">
            <div className="relative mb-6">
              <div
                className={`absolute -inset-6 ${isDarkMode ? "bg-rose-500/5" : "bg-rose-500/10"} rounded-full blur-2xl animate-pulse-slow`}
              ></div>
              <div
                className={`w-16 h-16 rounded-full ${isDarkMode ? "bg-gray-800 border-rose-700/60" : "bg-white border-rose-200"} border-2 flex items-center justify-center mx-auto shadow-lg relative z-10 transition-colors duration-300`}
              >
                <FiAlertCircle
                  className={`text-3xl ${isDarkMode ? "text-rose-400" : "text-rose-500"} animate-pulse-slow transition-colors duration-300`}
                />
              </div>
            </div>
            <h3
              className={`text-xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-800"} mb-3 transition-colors duration-300`}
            >
              Bir Sorun Oluştu
            </h3>
            <p
              className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} text-sm leading-relaxed mb-6 transition-colors duration-300`}
            >
              Ders detayları yüklenirken bir hata oluştu. Lütfen daha sonra
              tekrar deneyin.
            </p>
            <Link
              href="/courses"
              className={`inline-flex items-center px-6 py-2.5 ${isDarkMode ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"} text-white rounded-lg shadow-md transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-lg transform hover:scale-105`}
            >
              <FiArrowLeft className="mr-2" />
              Derslere Geri Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className={`min-h-screen relative ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900" : "bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/40"} transition-colors duration-500`}
      >
        <div className="flex justify-center items-center py-32">
          <div className="text-center">
            <FiBookOpen
              className={`text-6xl ${isDarkMode ? "text-gray-600" : "text-gray-400"} mb-4 mx-auto transition-colors duration-300`}
            />
            <h3
              className={`text-xl font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2 transition-colors duration-300`}
            >
              Ders Bulunamadı
            </h3>
            <p
              className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
            >
              Aradığınız ders mevcut değil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900" : "bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/40"} transition-colors duration-500`}
    >
      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 left-0 right-0 h-96 ${isDarkMode ? "bg-gradient-to-b from-blue-900/20 via-indigo-900/10 to-transparent" : "bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent"} transition-colors duration-500`}
        ></div>
        <div
          className={`absolute -top-32 -right-32 w-96 h-96 ${isDarkMode ? "bg-cyan-600/5" : "bg-cyan-400/8"} rounded-full blur-3xl animate-pulse-slow transition-colors duration-500`}
        ></div>
        <div
          className={`absolute top-1/4 -left-24 w-80 h-80 ${isDarkMode ? "bg-indigo-600/5" : "bg-indigo-400/8"} rounded-full blur-3xl animate-pulse-slow transition-colors duration-500`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Back navigation */}
          <div className="mb-6">
            <Link
              href="/courses"
              className={`inline-flex items-center text-sm ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition-colors duration-300 group`}
            >
              <FiArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Derslere Geri Dön
            </Link>
          </div>

          {/* Course header card */}
          <div
            className={`${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-gray-200/60"} backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 p-6 sm:p-8 relative overflow-hidden`}
          >
            {/* Gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-blue-900/10 to-transparent" : "from-blue-50/50 to-transparent"} transition-colors duration-300`}
            ></div>

            <div className="relative z-10 flex items-start space-x-4">
              {/* Course icon */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-gradient-to-br from-blue-600 to-indigo-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"} shadow-lg transition-colors duration-300 flex-shrink-0`}
              >
                <FiBookOpen className="text-white text-2xl" />
              </div>

              {/* Course info */}
              <div className="flex-1 min-w-0">
                <h1
                  className={`text-3xl font-bold mb-3 bg-gradient-to-r ${isDarkMode ? "from-blue-400 via-indigo-400 to-purple-400" : "from-blue-600 via-indigo-600 to-purple-600"} bg-clip-text text-transparent transition-colors duration-300`}
                >
                  {course.name}
                </h1>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} text-lg mb-4 leading-relaxed transition-colors duration-300`}
                >
                  {course.description || "Bu ders için açıklama bulunmuyor."}
                </p>
                <div
                  className={`flex items-center text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
                >
                  <FiClock className="mr-2" />
                  <span>
                    Oluşturulma tarihi:{" "}
                    {new Date(course.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Topics Card */}
          <div
            className={`${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-gray-200/60"} backdrop-blur-sm rounded-xl shadow-lg border transition-all duration-300 p-6 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-indigo-900/20 to-transparent" : "from-indigo-50 to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-indigo-600/20 border-indigo-500/30" : "bg-indigo-100 border-indigo-200"} border transition-colors duration-300`}
                >
                  <FiTarget
                    className={`text-xl ${isDarkMode ? "text-indigo-400" : "text-indigo-600"} transition-colors duration-300`}
                  />
                </div>
                <div
                  className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"} transition-colors duration-300`}
                >
                  {(learningTargets || []).length}
                </div>
              </div>
              <h3
                className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
              >
                Toplam Konu
              </h3>
            </div>
          </div>

          {/* Mastered Topics Card */}
          <div
            className={`${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-gray-200/60"} backdrop-blur-sm rounded-xl shadow-lg border transition-all duration-300 p-6 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-green-900/20 to-transparent" : "from-green-50 to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-green-600/20 border-green-500/30" : "bg-green-100 border-green-200"} border transition-colors duration-300`}
                >
                  <FiCheckCircle
                    className={`text-xl ${isDarkMode ? "text-green-400" : "text-green-600"} transition-colors duration-300`}
                  />
                </div>
                <div
                  className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"} transition-colors duration-300`}
                >
                  {statusCounts.mastered || 0}
                </div>
              </div>
              <h3
                className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
              >
                Başarılı Konular
              </h3>
            </div>
          </div>

          {/* Medium Level Card */}
          <div
            className={`${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-gray-200/60"} backdrop-blur-sm rounded-xl shadow-lg border transition-all duration-300 p-6 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-yellow-900/20 to-transparent" : "from-yellow-50 to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-yellow-600/20 border-yellow-500/30" : "bg-yellow-100 border-yellow-200"} border transition-colors duration-300`}
                >
                  <FiTrendingUp
                    className={`text-xl ${isDarkMode ? "text-yellow-400" : "text-yellow-600"} transition-colors duration-300`}
                  />
                </div>
                <div
                  className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"} transition-colors duration-300`}
                >
                  {statusCounts.medium || 0}
                </div>
              </div>
              <h3
                className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
              >
                Orta Seviye
              </h3>
            </div>
          </div>

          {/* Failed Topics Card */}
          <div
            className={`${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-gray-200/60"} backdrop-blur-sm rounded-xl shadow-lg border transition-all duration-300 p-6 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-red-900/20 to-transparent" : "from-red-50 to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-red-600/20 border-red-500/30" : "bg-red-100 border-red-200"} border transition-colors duration-300`}
                >
                  <FiAlertCircle
                    className={`text-xl ${isDarkMode ? "text-red-400" : "text-red-600"} transition-colors duration-300`}
                  />
                </div>
                <div
                  className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"} transition-colors duration-300`}
                >
                  {statusCounts.failed || 0}
                </div>
              </div>
              <h3
                className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
              >
                Başarısız
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Learning Targets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-gray-200/60"} backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 p-6 sm:p-8 mb-8 relative overflow-hidden`}
        >
          {/* Gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-blue-900/5 to-transparent" : "from-blue-50/30 to-transparent"} transition-colors duration-300`}
          ></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <div className="flex items-center mb-4 sm:mb-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-blue-600/20 border-blue-500/30" : "bg-blue-100 border-blue-200"} border mr-4 transition-colors duration-300`}
                >
                  <FiActivity
                    className={`text-lg ${isDarkMode ? "text-blue-400" : "text-blue-600"} transition-colors duration-300`}
                  />
                </div>
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"} transition-colors duration-300`}
                >
                  Alt Konular
                </h2>
              </div>

              {/* Filter Controls */}
              {learningTargets && learningTargets.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative">
                    <FiSearch
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-blue-400/70" : "text-blue-500/70"} transition-colors duration-300`}
                    />
                    <input
                      type="text"
                      placeholder="Konu ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-2.5 rounded-xl border ${isDarkMode ? "bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500" : "bg-white/80 border-gray-300/60 text-gray-700 placeholder-gray-400 focus:border-blue-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 w-full sm:w-48`}
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <FiFilter
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-blue-400/70" : "text-blue-500/70"} transition-colors duration-300`}
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`pl-10 pr-8 py-2.5 rounded-xl border ${isDarkMode ? "bg-gray-700/50 border-gray-600/50 text-gray-200 focus:border-blue-500" : "bg-white/80 border-gray-300/60 text-gray-700 focus:border-blue-500"} focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 cursor-pointer appearance-none w-full sm:w-40`}
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="mastered">Başarılı</option>
                      <option value="medium">Orta Seviye</option>
                      <option value="failed">Başarısız</option>
                      <option value="pending">Beklemede</option>
                    </select>
                    <FiChevronDown
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-500"} pointer-events-none transition-colors duration-300`}
                    />
                  </div>
                </div>
              )}
            </div>

            {learningTargets.length === 0 ? (
              <div className="text-center py-12">
                <FiTarget
                  className={`text-6xl ${isDarkMode ? "text-gray-600" : "text-gray-400"} mb-4 mx-auto transition-colors duration-300`}
                />
                <h3
                  className={`text-lg font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2 transition-colors duration-300`}
                >
                  Henüz Alt Konu Yok
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-6 transition-colors duration-300`}
                >
                  İçerik yükleyerek başlayın ve konular otomatik olarak
                  oluşturulsun.
                </p>
                <Link
                  href={`/upload?courseId=${courseId}`}
                  className={`inline-flex items-center px-6 py-3 ${isDarkMode ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"} text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105`}
                >
                  <FiUpload className="mr-2" />
                  İçerik Yükle
                </Link>
              </div>
            ) : Object.keys(filteredGroupedTargets).length === 0 ? (
              <div className="text-center py-12">
                <FiSearch
                  className={`text-6xl ${isDarkMode ? "text-gray-600" : "text-gray-400"} mb-4 mx-auto transition-colors duration-300`}
                />
                <h3
                  className={`text-lg font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2 transition-colors duration-300`}
                >
                  Arama Sonucu Bulunamadı
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
                >
                  Filtrelere uygun konu bulunamadı. Arama terimini değiştirmeyi
                  deneyin.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(filteredGroupedTargets).map(
                  ([mainTopic, targets], groupIndex) => (
                    <motion.div
                      key={mainTopic}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
                      className={`${isDarkMode ? "bg-gray-700/30 border-gray-600/50" : "bg-gray-50/80 border-gray-200/60"} rounded-xl border transition-all duration-300`}
                    >
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroup(mainTopic)}
                        className={`w-full flex items-center justify-between p-4 ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/80"} rounded-xl transition-all duration-300 group`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-blue-600/20 border-blue-500/30" : "bg-blue-100 border-blue-200"} border mr-3 transition-colors duration-300`}
                          >
                            <FiList
                              className={`text-sm ${isDarkMode ? "text-blue-400" : "text-blue-600"} transition-colors duration-300`}
                            />
                          </div>
                          <div className="text-left">
                            <h3
                              className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"} transition-colors duration-300`}
                            >
                              {mainTopic}
                            </h3>
                            <p
                              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
                            >
                              {targets.length}{" "}
                              {targets.length === 1 ? "konu" : "konu"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {/* Status summary for this group */}
                          <div className="flex items-center space-x-2 mr-4">
                            {targets.filter((t) => t.status === "mastered")
                              .length > 0 && (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700"} transition-colors duration-300`}
                              >
                                {
                                  targets.filter((t) => t.status === "mastered")
                                    .length
                                }
                              </span>
                            )}
                            {targets.filter((t) => t.status === "medium")
                              .length > 0 && (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700"} transition-colors duration-300`}
                              >
                                {
                                  targets.filter((t) => t.status === "medium")
                                    .length
                                }
                              </span>
                            )}
                            {targets.filter((t) => t.status === "failed")
                              .length > 0 && (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"} transition-colors duration-300`}
                              >
                                {
                                  targets.filter((t) => t.status === "failed")
                                    .length
                                }
                              </span>
                            )}
                          </div>
                          {expandedGroups.has(mainTopic) ? (
                            <FiChevronDown
                              className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"} group-hover:text-blue-500 transition-all duration-300`}
                            />
                          ) : (
                            <FiChevronRight
                              className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"} group-hover:text-blue-500 transition-all duration-300`}
                            />
                          )}
                        </div>
                      </button>

                      {/* Group Content */}
                      {expandedGroups.has(mainTopic) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4">
                            <div className="overflow-hidden rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead
                                    className={`${isDarkMode ? "bg-gray-800/50" : "bg-gray-50/80"} transition-colors duration-300`}
                                  >
                                    <tr>
                                      <th
                                        className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"} uppercase tracking-wider transition-colors duration-300`}
                                      >
                                        Alt Konu
                                      </th>
                                      <th
                                        className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"} uppercase tracking-wider transition-colors duration-300`}
                                      >
                                        Durum
                                      </th>
                                      <th
                                        className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"} uppercase tracking-wider transition-colors duration-300`}
                                      >
                                        Son Puan
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200/50 dark:divide-gray-600/50">
                                    {targets.map(
                                      (
                                        target: LearningTarget,
                                        index: number,
                                      ) => (
                                        <motion.tr
                                          key={target.id}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{
                                            duration: 0.3,
                                            delay: index * 0.05,
                                          }}
                                          className={`${isDarkMode ? "bg-gray-800/30 hover:bg-gray-700/50" : "bg-white/60 hover:bg-gray-50/80"} transition-all duration-300 group`}
                                        >
                                          <td
                                            className={`px-4 py-3 ${isDarkMode ? "text-gray-200" : "text-gray-800"} font-medium transition-colors duration-300`}
                                          >
                                            {target.subTopicName}
                                          </td>
                                          <td className="px-4 py-3">
                                            <span
                                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                                          ${target.status === "pending" ? `${isDarkMode ? "bg-gray-700/80 text-gray-300 border border-gray-600/50" : "bg-gray-100 text-gray-700 border border-gray-200"}` : ""}
                                          ${target.status === "failed" ? `${isDarkMode ? "bg-red-900/50 text-red-300 border border-red-700/50" : "bg-red-100 text-red-700 border border-red-200"}` : ""}
                                          ${target.status === "medium" ? `${isDarkMode ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50" : "bg-yellow-100 text-yellow-700 border border-yellow-200"}` : ""}
                                          ${target.status === "mastered" ? `${isDarkMode ? "bg-green-900/50 text-green-300 border border-green-700/50" : "bg-green-100 text-green-700 border border-green-200"}` : ""}
                                        `}
                                            >
                                              {target.status === "pending" &&
                                                "Beklemede"}
                                              {target.status === "failed" &&
                                                "Başarısız"}
                                              {target.status === "medium" &&
                                                "Orta"}
                                              {target.status === "mastered" &&
                                                "Başarılı"}
                                            </span>
                                          </td>
                                          <td
                                            className={`px-4 py-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"} font-medium transition-colors duration-300`}
                                          >
                                            {target.lastAttemptScorePercent !==
                                            null
                                              ? `%${target.lastAttemptScorePercent}`
                                              : "-"}
                                          </td>
                                        </motion.tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ),
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href={`/exams/create?courseId=${courseId}`}
            className={`group inline-flex items-center justify-center px-8 py-4 ${isDarkMode ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-blue-600/50" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500/50"} text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transform hover:scale-105 relative overflow-hidden`}
          >
            {/* Button background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10 flex items-center">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-white/20" : "bg-white/20"} mr-3 transition-transform duration-300 group-hover:scale-110`}
              >
                <FiFileText className="text-lg" />
              </div>
              <div className="text-left">
                <div className="text-base">Sınav Oluştur</div>
                <div className="text-xs opacity-90">
                  Konular için test hazırla
                </div>
              </div>
            </div>
          </Link>

          <Link
            href={`/upload?courseId=${courseId}`}
            className={`group inline-flex items-center justify-center px-8 py-4 ${isDarkMode ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 focus:ring-green-600/50" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-500/50"} text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transform hover:scale-105 relative overflow-hidden`}
          >
            {/* Button background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10 flex items-center">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-white/20" : "bg-white/20"} mr-3 transition-transform duration-300 group-hover:scale-110`}
              >
                <FiUpload className="text-lg" />
              </div>
              <div className="text-left">
                <div className="text-base">İçerik Yükle</div>
                <div className="text-xs opacity-90">Ders materyali ekle</div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
