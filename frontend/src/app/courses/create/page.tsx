"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiPlusSquare, FiBookOpen, FiBook } from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";
import courseService from "@/services/course.service";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeProvider";

export default function CreateCoursePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();
  const [courseName, setCourseName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    courseName?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      courseName?: string;
    } = {};

    if (!courseName.trim()) {
      newErrors.courseName = "Ders adı gereklidir.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await courseService.createCourse({ name: courseName });

      // Invalidate the courses query to refetch the list on the courses page
      await queryClient.invalidateQueries({ queryKey: ["courses"] });

      router.push("/courses");
    } catch (error) {
      console.error("Ders oluşturma hatası:", error);
      // Display a more specific error message if possible
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Lütfen tekrar deneyin.";
      setErrors((prev) => ({
        ...prev,
        courseName: `Ders oluşturulamadı: ${errorMessage}`,
      }));
      alert(`Ders oluşturulurken bir hata oluştu. ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

        {/* Subtle grid pattern */}
        <div
          className={`absolute inset-0 opacity-[0.02] ${isDarkMode ? "bg-gray-100" : "bg-gray-900"} transition-opacity duration-500`}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          {/* Enhanced header section */}
          <div className="mb-8 text-center">
            <div
              className={`inline-flex items-center justify-center p-4 ${isDarkMode ? "bg-gradient-to-tr from-blue-600 to-indigo-600" : "bg-gradient-to-tr from-blue-500 to-indigo-600"} rounded-2xl shadow-lg mb-6 transition-colors duration-300 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
              <FiBookOpen className="text-white text-4xl relative z-10" />
            </div>
            <h1
              className={`text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r ${isDarkMode ? "from-blue-400 via-indigo-400 to-purple-400" : "from-blue-600 via-indigo-600 to-purple-600"} bg-clip-text text-transparent transition-colors duration-300`}
            >
              Yeni Ders Oluştur
            </h1>
            <p
              className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-lg transition-colors duration-300`}
            >
              Oluşturacağınız dersin adını girerek başlayın.
            </p>
          </div>

          {/* Enhanced form container */}
          <div
            className={`${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-gray-200/60"} backdrop-blur-sm rounded-2xl shadow-xl border transition-colors duration-300 p-6 sm:p-8 md:p-10 relative overflow-hidden`}
          >
            {/* Subtle gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-blue-900/5 to-transparent" : "from-blue-50/30 to-transparent"} transition-colors duration-300`}
            ></div>

            <div className="relative z-10">
              {/* Back link */}
              <div className="mb-8">
                <Link
                  href="/courses"
                  className={`inline-flex items-center text-sm ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition-colors duration-300 group`}
                >
                  <FiArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                  Kurs Listesine Geri Dön
                </Link>
              </div>

              {/* Enhanced form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label
                    htmlFor="courseName"
                    className={`block text-lg font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"} mb-3 transition-colors duration-300`}
                  >
                    Ders Adı
                  </label>
                  <div className="relative">
                    <FiBook
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-blue-400/70" : "text-blue-500/70"} text-xl transition-colors duration-300`}
                    />
                    <input
                      type="text"
                      id="courseName"
                      className={`w-full pl-12 pr-5 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm ${
                        errors.courseName
                          ? `${isDarkMode ? "border-red-500/60 ring-red-500/20 bg-red-900/10" : "border-red-400 ring-red-300/50 bg-red-50/50"}`
                          : `${isDarkMode ? "border-gray-600/60 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-700/50 text-gray-200 placeholder-gray-400" : "border-gray-300/60 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 text-gray-700 placeholder-gray-400"}`
                      }`}
                      placeholder="Örn: İleri Seviye Matematik"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      aria-describedby={
                        errors.courseName ? "courseName-error" : undefined
                      }
                    />
                  </div>
                  {errors.courseName && (
                    <p
                      id="courseName-error"
                      className={`mt-3 text-sm ${isDarkMode ? "text-red-400" : "text-red-600"} font-medium transition-colors duration-300`}
                    >
                      {errors.courseName}
                    </p>
                  )}
                </div>

                {/* Enhanced action buttons */}
                <div
                  className={`mt-10 flex flex-col sm:flex-row-reverse justify-start gap-3 sm:gap-4 pt-6 border-t ${isDarkMode ? "border-gray-700/60" : "border-gray-200/60"} transition-colors duration-300`}
                >
                  <button
                    type="submit"
                    className={`w-full sm:w-auto px-8 py-3.5 ${isDarkMode ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-blue-600/50" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500/50"} text-white rounded-xl font-semibold text-base transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      isSubmitting
                        ? "opacity-70 cursor-not-allowed"
                        : "transform hover:scale-105"
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Oluşturuluyor...
                      </span>
                    ) : (
                      "Dersi Oluştur"
                    )}
                  </button>
                  <Link
                    href="/courses"
                    className={`w-full sm:w-auto px-8 py-3.5 border ${isDarkMode ? "border-gray-600/60 text-gray-200 hover:bg-gray-700/50" : "border-gray-400/60 text-gray-700 hover:bg-gray-100/50"} rounded-xl transition-all duration-300 text-center font-semibold text-base shadow-sm hover:shadow-md transform hover:scale-105 backdrop-blur-sm`}
                  >
                    İptal
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
