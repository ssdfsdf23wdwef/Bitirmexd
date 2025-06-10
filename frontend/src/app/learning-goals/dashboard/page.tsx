"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiBarChart2, FiPieChart, FiArrowLeft } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import LearningStatusBadge from "@/components/ui/LearningStatusBadge";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import PageTransition from "@/components/transitions/PageTransition";
import { useTheme } from "@/context/ThemeProvider";
import type {
  LearningTarget,
  LearningTargetStatus,
} from "@/types/learningTarget.type";
import quizService from "@/services/quiz.service";
import type { Quiz } from "@/types/quiz.type";
import courseService from "@/services/course.service";
import learningTargetService from "@/services/learningTarget.service";

interface Course {
  id: string;
  name: string;
  title?: string;
}

// Chart.js bileşenlerini kaydet
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

export default function LearningGoalsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { isDarkMode } = useTheme();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningTargets, setLearningTargets] = useState<LearningTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PRD'ye uygun İngilizce durum isimleri
  const statusLabels: Record<string, string> = {
    mastered: "Başarılı",
    medium: "Orta",
    failed: "Başarısız",
    pending: "Beklemede",
  };

  // Kurs değiştiğinde yeni kurs ID'si ile yönlendir
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourseId = e.target.value;
    router.push(`/learning-goals/dashboard?courseId=${newCourseId}`);
  };

  useEffect(() => {
    setLoading(true);

    // Tüm kursları yükle
    courseService
      .getCourses()
      .then((coursesData: Course[]) => {
        setCourses(coursesData);

        // Aktif kurs veya ilk kurs
        const activeCourse = courseId
          ? coursesData.find((c: Course) => c.id === courseId)
          : coursesData[0];

        if (activeCourse) {
          setSelectedCourse(activeCourse);

          // Seçili kursa ait öğrenme hedeflerini yükle
          return learningTargetService.getLearningTargetsByCourse(
            activeCourse.id,
          );
        } else {
          throw new Error("Kurs bulunamadı");
        }
      })
      .then((targets: LearningTarget[]) => {
        setLearningTargets(targets);
      })
      .catch((err: unknown) => {
        console.error("Veri yüklenirken hata:", err);
        setError("Öğrenme hedefleri yüklenirken bir sorun oluştu.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  // Durum dağılımı (İngilizce anahtarlar)
  const initialStatusDistribution: Record<LearningTargetStatus, number> = {
    mastered: 0,
    medium: 0,
    failed: 0,
    pending: 0,
  };
  const statusDistribution = learningTargets.reduce(
    (acc, target) => {
      acc[target.status as LearningTargetStatus] =
        (acc[target.status as LearningTargetStatus] || 0) + 1;
      return acc;
    },
    { ...initialStatusDistribution },
  );

  // Tema uyumlu renkler
  const chartColors = {
    mastered: isDarkMode ? "rgba(34,197,94,0.8)" : "rgba(34,197,94,0.7)",
    medium: isDarkMode ? "rgba(234,179,8,0.8)" : "rgba(234,179,8,0.7)",
    failed: isDarkMode ? "rgba(239,68,68,0.8)" : "rgba(239,68,68,0.7)",
    pending: isDarkMode ? "rgba(148,163,184,0.8)" : "rgba(148,163,184,0.7)",
  };

  // Pasta grafik verileri (PRD'ye uygun)
  const pieChartData = {
    labels: Object.values(statusLabels),
    datasets: [
      {
        data: [
          statusDistribution.mastered || 0,
          statusDistribution.medium || 0,
          statusDistribution.failed || 0,
          statusDistribution.pending || 0,
        ],
        backgroundColor: [
          chartColors.mastered,
          chartColors.medium,
          chartColors.failed,
          chartColors.pending,
        ],
        borderColor: [
          chartColors.mastered,
          chartColors.medium,
          chartColors.failed,
          chartColors.pending,
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart verisini mock servis ile dinamik getir (örnek)
  interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }

  interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
  }

  const [barChartData, setBarChartData] = useState<ChartData | null>(null);
  useEffect(() => {
    getQuizScores(selectedCourse?.id).then(
      (scores: { date: string; score: number }[]) => {
        setBarChartData({
          labels: scores.map((s: { date: string }) => s.date),
          datasets: [
            {
              label: "Ortalama Sınav Skoru",
              data: scores.map((s: { score: number }) => s.score),
              backgroundColor: isDarkMode
                ? "rgba(99,102,241,0.8)"
                : "rgba(99,102,241,0.7)",
              borderColor: isDarkMode
                ? "rgba(99,102,241,1)"
                : "rgba(99,102,241,1)",
              borderWidth: 1,
            },
          ],
        });
      },
    );
  }, [selectedCourse, isDarkMode]);

  // Yükleme ve hata durumları
  if (loading) {
    return (
      <>
        <PageTransition>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="mb-4">
                <span
                  className={`inline-block w-6 h-6 border-2 rounded-full animate-spin ${
                    isDarkMode
                      ? "border-t-blue-400 border-r-blue-400 border-b-transparent border-l-transparent"
                      : "border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent"
                  }`}
                ></span>
              </div>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Öğrenme hedefleri yükleniyor...
              </p>
            </div>
          </div>
        </PageTransition>
      </>
    );
  }

  if (error || !selectedCourse) {
    return (
      <>
        <div
          className={`border rounded-lg p-4 ${
            isDarkMode
              ? "bg-red-900/20 border-red-700 text-red-300"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <p>{error || "Kurs bulunamadı"}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen transition-all duration-500 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white"
            : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 text-gray-900"
        }`}
      >
        <div className="container mx-auto px-6 py-10">
          {/* Geri Dönüş Butonu ve Başlık */}
          <div className="mb-10">
            <motion.div
              className="flex items-center mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => router.push("/learning-goals")}
                className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 mr-4 ${
                  isDarkMode
                    ? "bg-slate-700/60 hover:bg-slate-600/80 text-gray-200 border border-slate-600/50 hover:border-slate-500/60"
                    : "bg-white/80 hover:bg-white/95 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg"
                }`}
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfa
              </button>
            </motion.div>

            <motion.h1
              className={`text-4xl font-bold mb-4 bg-gradient-to-r ${
                isDarkMode
                  ? "from-blue-400 via-purple-400 to-indigo-400"
                  : "from-indigo-600 via-purple-600 to-blue-600"
              } bg-clip-text text-transparent`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Öğrenme Takip Paneli
            </motion.h1>
            <motion.p
              className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Hedeflerinizi ve ilerlemenizi detaylı şekilde görüntüleyin.
            </motion.p>
          </div>

          {/* Kurs Seçimi */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label
              htmlFor="course-select"
              className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
            >
              Ders Seçin
            </label>
            <div className="relative">
              <select
                id="course-select"
                value={selectedCourse.id}
                onChange={handleCourseChange}
                className={`block w-full md:w-80 rounded-xl shadow-lg focus:ring-2 focus:ring-offset-2 p-3 text-base font-medium transition-all duration-300 border ${
                  isDarkMode
                    ? "bg-slate-800/90 border-slate-600/60 text-gray-100 focus:border-blue-400 focus:ring-blue-400/30 hover:bg-slate-700/90"
                    : "bg-white/90 border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500/30 hover:bg-white/95"
                }`}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Grafikler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              className={`rounded-2xl shadow-xl backdrop-blur-lg p-6 transition-all duration-500 hover:shadow-2xl border ${
                isDarkMode
                  ? "bg-slate-800/80 border-slate-700/60 text-white hover:bg-slate-800/90"
                  : "bg-white/80 border-gray-200/50 hover:bg-white/95"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              aria-label="Öğrenme hedeflerinin durum dağılımı grafiği"
              role="region"
            >
              <h2
                className={`text-xl font-semibold mb-6 flex items-center ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
              >
                <div
                  className={`p-2 rounded-lg mr-3 ${isDarkMode ? "bg-blue-500/25 text-blue-300 border border-blue-400/30" : "bg-indigo-100 text-indigo-600"}`}
                >
                  <FiPieChart className="w-6 h-6" aria-hidden="true" />
                </div>
                Hedef Durumu Dağılımı
              </h2>
              <div
                className="h-72 flex items-center justify-center"
                aria-label="Hedef durumlarının pasta grafiği"
              >
                <div className="w-full h-full">
                  <Pie
                    data={pieChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: isDarkMode ? "#e5e7eb" : "#374151",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className={`rounded-2xl shadow-xl backdrop-blur-lg p-6 transition-all duration-500 hover:shadow-2xl border ${
                isDarkMode
                  ? "bg-slate-800/80 border-slate-700/60 text-white hover:bg-slate-800/90"
                  : "bg-white/80 border-gray-200/50 hover:bg-white/95"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              aria-label="Zaman içindeki sınav skorları grafiği"
              role="region"
            >
              <h2
                className={`text-xl font-semibold mb-6 flex items-center ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
              >
                <div
                  className={`p-2 rounded-lg mr-3 ${isDarkMode ? "bg-blue-500/25 text-blue-300 border border-blue-400/30" : "bg-indigo-100 text-indigo-600"}`}
                >
                  <FiBarChart2 className="w-6 h-6" aria-hidden="true" />
                </div>
                Zaman İçindeki İlerleme
              </h2>
              <div
                className="h-72"
                aria-label="Sınav skorlarının çubuk grafiği"
              >
                {barChartData ? (
                  <Bar
                    data={barChartData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          labels: {
                            color: isDarkMode ? "#e5e7eb" : "#374151",
                          },
                        },
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: isDarkMode ? "#9ca3af" : "#6b7280",
                          },
                          grid: {
                            color: isDarkMode ? "#374151" : "#e5e7eb",
                          },
                        },
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            color: isDarkMode ? "#9ca3af" : "#6b7280",
                          },
                          grid: {
                            color: isDarkMode ? "#374151" : "#e5e7eb",
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div
                        className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-2 ${
                          isDarkMode
                            ? "border-t-blue-400 border-r-blue-400 border-b-transparent border-l-transparent"
                            : "border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent"
                        }`}
                      ></div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Grafik yükleniyor...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Hedef Listesi */}
          <motion.div
            className={`rounded-2xl shadow-xl backdrop-blur-lg p-6 transition-all duration-500 hover:shadow-2xl border ${
              isDarkMode
                ? "bg-slate-800/80 border-slate-700/60 text-white hover:bg-slate-800/90"
                : "bg-white/80 border-gray-200/50 hover:bg-white/95"
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            aria-label="Öğrenme hedefleri tablosu"
            role="region"
          >
            <h2
              className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
            >
              Öğrenme Hedefleri
              <span
                className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? "bg-blue-500/25 text-blue-300 border border-blue-400/30"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                {learningTargets.length} Hedef
              </span>
            </h2>

            {learningTargets.length === 0 ? (
              <div className="text-center py-12">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDarkMode
                      ? "bg-slate-700/60 border border-slate-600/50"
                      : "bg-gray-100"
                  }`}
                >
                  <svg
                    className={`w-8 h-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p
                  className={`text-lg font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}
                >
                  Henüz hedef bulunmuyor
                </p>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Bu ders için henüz öğrenme hedefi tanımlanmamış.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                  <table
                    className={`min-w-full divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}
                    aria-label="Öğrenme hedefleri tablosu"
                  >
                    <thead
                      className={`${isDarkMode ? "bg-slate-700/60 border-b border-slate-600/50" : "bg-gray-50/80"} backdrop-blur-sm`}
                    >
                      <tr>
                        <th
                          scope="col"
                          className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}
                        >
                          Alt Konu
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}
                        >
                          Durum
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}
                        >
                          Son Başarı %
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}
                        >
                          İlk Karşılaşma
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${isDarkMode ? "divide-slate-700/50" : "divide-gray-200/50"}`}
                    >
                      {learningTargets.map((target, index) => (
                        <motion.tr
                          key={target.id}
                          className={`transition-all duration-300 ${isDarkMode ? "hover:bg-slate-700/40" : "hover:bg-gray-50/70"}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div
                              className={`text-sm font-medium ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                            >
                              {target.subTopicName}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <LearningStatusBadge
                              status={target.status as LearningTargetStatus}
                            />
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div
                              className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
                            >
                              {target.lastAttemptScorePercent !== null &&
                              target.lastAttemptScorePercent !== undefined ? (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    target.lastAttemptScorePercent >= 80
                                      ? isDarkMode
                                        ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/30"
                                        : "bg-green-100 text-green-800"
                                      : target.lastAttemptScorePercent >= 60
                                        ? isDarkMode
                                          ? "bg-amber-500/25 text-amber-300 border border-amber-400/30"
                                          : "bg-yellow-100 text-yellow-800"
                                        : isDarkMode
                                          ? "bg-red-500/25 text-red-300 border border-red-400/30"
                                          : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {target.lastAttemptScorePercent}%
                                </span>
                              ) : (
                                <span
                                  className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                >
                                  -
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div
                              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {target.firstEncountered
                                ? new Date(
                                    target.firstEncountered,
                                  ).toLocaleDateString("tr-TR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}

async function getQuizScores(
  courseId: string | undefined,
): Promise<{ date: string; score: number }[]> {
  if (!courseId) return [];
  try {
    const quizzes = (await quizService.getQuizzes(courseId)) as Quiz[];
    return quizzes.map((quiz) => ({
      date: quiz.timestamp ? new Date(quiz.timestamp).toLocaleDateString() : "",
      score: quiz.score || 0,
    }));
  } catch {
    return [];
  }
}
