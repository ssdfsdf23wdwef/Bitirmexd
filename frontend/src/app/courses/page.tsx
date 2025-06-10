"use client";

import React, { useState, useEffect } from "react";
import {} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

import courseService from "@/services/course.service";
import CourseList from "@/components/ui/CourseList";
import { Course } from "@/types/course.type";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/context/ThemeProvider";

// Loglayıcıyı al (providers.tsx'te başlatıldı)

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthStore();
  const { isDarkMode } = useTheme();

  // Kursları çekmek için TanStack Query kullanımı
  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses", user?.id],
    queryFn: async () => {
      try {
        const result = await courseService.getCourses();
        return result;
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user, // Kullanıcı varsa aktifleştir
    staleTime: 5 * 60 * 1000, // 5 dakika
  });

  // Arama sonuçlarını logla
  useEffect(() => {
    if (searchTerm && courses.length > 0) {
    }
  }, [searchTerm, courses]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Hata mesajını oluştur
  const errorMessage = error
    ? "Dersler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
    : null;

  return (
    <ProtectedRoute>
      <div
        className={`min-h-screen relative ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900" : "bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/40"} transition-colors duration-500`}
      >
        {/* Enhanced decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary gradient overlay */}
          <div
            className={`absolute top-0 left-0 right-0 h-96 ${isDarkMode ? "bg-gradient-to-b from-blue-900/20 via-indigo-900/10 to-transparent" : "bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent"} transition-colors duration-500`}
          ></div>

          {/* Floating geometric elements */}
          <div
            className={`absolute -top-32 -right-32 w-96 h-96 ${isDarkMode ? "bg-cyan-600/5" : "bg-cyan-400/8"} rounded-full blur-3xl animate-pulse-slow transition-colors duration-500`}
          ></div>
          <div
            className={`absolute top-1/4 -left-24 w-80 h-80 ${isDarkMode ? "bg-indigo-600/5" : "bg-indigo-400/8"} rounded-full blur-3xl animate-pulse-slow transition-colors duration-500`}
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className={`absolute bottom-1/4 right-1/4 w-64 h-64 ${isDarkMode ? "bg-purple-600/5" : "bg-purple-400/8"} rounded-full blur-3xl animate-pulse-slow transition-colors duration-500`}
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Subtle grid pattern */}
          <div
            className={`absolute inset-0 opacity-[0.02] ${isDarkMode ? "bg-gray-100" : "bg-gray-900"} transition-opacity duration-500`}
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        {/* Main content with enhanced styling */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <CourseList
              courses={courses as Course[]}
              loading={isLoading}
              error={errorMessage}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
